import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface AttendanceRecord {
	date: Date;
	status: string;
}

// Helper function to count weekdays in a month, excluding holidays
const countWeekdaysInMonth = (year: number, month: number): number => {
	let weekdays = 0;
	const date = new Date(year, month, 1);

	while (date.getMonth() === month) {
		const day = date.getDay();
		// 0 = Sunday, 6 = Saturday
		if (day !== 0 && day !== 6) {
			weekdays++;
		}
		date.setDate(date.getDate() + 1);
	}
	return weekdays;
};

// Helper function to get month range for the school year (June to March)
const getSchoolYearMonths = (
	year: number
): { index: number; name: string; schoolDays: number }[] => {
	// Create array of month objects with index, name and fixed school days
	return [
		{ index: 5, name: 'Jun', schoolDays: 20 }, // June
		{ index: 6, name: 'Jul', schoolDays: 23 }, // July
		{ index: 7, name: 'Aug', schoolDays: 22 }, // August
		{ index: 8, name: 'Sep', schoolDays: 21 }, // September
		{ index: 9, name: 'Oct', schoolDays: 23 }, // October
		{ index: 10, name: 'Nov', schoolDays: 21 }, // November
		{ index: 11, name: 'Dec', schoolDays: 22 }, // December
		{ index: 0, name: 'Jan', schoolDays: 23 }, // January
		{ index: 1, name: 'Feb', schoolDays: 20 }, // February
		{ index: 2, name: 'Mar', schoolDays: 21 }, // March
		{ index: 3, name: 'Apr', schoolDays: 22 }, // April
	];
};

export async function GET(req: NextRequest) {
	try {
		console.log('SF9 API called with params:', req.url);
		const { searchParams } = new URL(req.url);
		const studentId = searchParams.get('studentId');
		const schoolYear = searchParams.get('schoolYear');
		const strandId = searchParams.get('strandId');

		console.log('Parameters:', { studentId, schoolYear, strandId });

		if (!schoolYear) {
			return NextResponse.json(
				{ error: 'School year is required' },
				{ status: 400 }
			);
		}

		// Parse the school year to get start and end years
		const [startYearStr, endYearStr] = schoolYear.split('-');
		const startYear = parseInt(startYearStr);
		const endYear = parseInt(endYearStr);

		console.log('School year parsed:', { startYear, endYear });

		// Always fetch strands based on schoolYear
		const strands = await prisma.strand.findMany({});

		let students: any[] = [];
		let studentInfo: any = null;
		let attendanceData: any = {
			monthly: [],
			totals: { schoolDays: 0, daysPresent: 0, daysAbsent: 0 },
		};
		let schoolInfo: any = {};
		let gradesData: any = {
			firstSemester: {
				coreSubjects: [],
				appliedSubjects: [],
				averages: { q1: 0, q2: 0, final: 0 },
			},
			secondSemester: {
				coreSubjects: [],
				appliedSubjects: [],
				averages: { q3: 0, q4: 0, final: 0 },
			},
		};

		// If strandId is provided, fetch students for that strand
		if (strandId && !studentId) {
			students = await prisma.student.findMany({
				where: {
					strandId: parseInt(strandId, 10),
				},
				select: { id: true, name: true, surname: true, middleName: true },
				orderBy: { surname: 'asc' },
			});
		}

		// If studentId is provided, fetch detailed info for that student
		if (studentId) {
			console.log('Fetching data for student:', studentId);

			// First get all attendance records for this student
			const allAttendanceRecords = await prisma.attendance.findMany({
				where: {
					studentId: studentId,
				},
				orderBy: {
					date: 'asc',
				},
			});

			console.log(
				`Found ${allAttendanceRecords.length} total attendance records for student ${studentId}`
			);

			// Filter attendance for the current school year (June of startYear to April of endYear)
			const schoolYearStart = new Date(`${startYear}-06-01`);
			const schoolYearEnd = new Date(`${endYear}-04-30`);

			console.log('Filtering attendance between:', {
				start: schoolYearStart.toISOString(),
				end: schoolYearEnd.toISOString(),
			});

			const filteredAttendance = allAttendanceRecords.filter((record) => {
				const recordDate = new Date(record.date);
				return recordDate >= schoolYearStart && recordDate <= schoolYearEnd;
			});

			console.log(
				`After filtering: ${filteredAttendance.length} attendance records within school year range`
			);

			// Debug first 5 attendance records
			if (filteredAttendance.length > 0) {
				console.log('Sample attendance records:');
				filteredAttendance.slice(0, 5).forEach((record) => {
					console.log({
						date: new Date(record.date).toISOString(),
						status: record.status,
						month: new Date(record.date).getMonth(),
						year: new Date(record.date).getFullYear(),
					});
				});
			}

			const student = await prisma.student.findUnique({
				where: { id: studentId },
				include: {
					class: { include: { supervisor: true } },
					Strand: true,
					grade: true,
				},
			});

			if (!student) {
				return NextResponse.json(
					{ error: 'Student not found' },
					{ status: 404 }
				);
			}

			// First fetch all lessons for the student's class
			const classLessons = await prisma.lesson.findMany({
				where: {
					classId: student.classId,
				},
				include: {
					subject: true,
				},
				orderBy: {
					subject: {
						name: 'asc',
					},
				},
			});

			// Then fetch all results for this student
			const results = await prisma.result.findMany({
				where: {
					studentId: studentId,
				},
				include: {
					Lesson: {
						include: {
							subject: true,
						},
					},
				},
			});

			// Create a map of results by lessonId for easy lookup
			const resultsByLesson = new Map(
				results.map((result) => [result.lessonId, result])
			);

			// Log all lessons and their grades
			console.log('\n=== All Class Lessons for Student ===');
			console.log(`Student ID: ${studentId}`);
			console.log(`Class: ${student.class?.name}`);
			console.log('Lessons:');
			classLessons.forEach((lesson, index) => {
				const result = resultsByLesson.get(lesson.id);
				console.log(`\nLesson ${index + 1}:`);
				console.log(`Lesson Name: ${lesson.name}`);
				console.log(`Subject Name: ${lesson.subject.name}`);
				console.log(`Subject Type: ${lesson.subject.subjectType}`);
				console.log(`Semester: ${lesson.subject.semester}`);
				console.log(
					'Grades:',
					result
						? {
								Q1: result.q1,
								Q2: result.q2,
								Q3: result.q3,
								Q4: result.q4,
						  }
						: 'No grades recorded yet'
				);
			});
			console.log('\n=== End of Lessons ===\n');

			// Process lessons and results into first and second semester subjects
			classLessons.forEach((lesson) => {
				const result = resultsByLesson.get(lesson.id);
				const subjectType = lesson.subject.subjectType;
				const semester = lesson.subject.semester;
				const subjectData = {
					name: lesson.name,
					type: subjectType,
					q1: result?.q1 || 0,
					q2: result?.q2 || 0,
					q3: result?.q3 || 0,
					q4: result?.q4 || 0,
					final: 0,
				};

				if (semester === '1st Semester') {
					// Calculate final grade for first semester
					subjectData.final = (subjectData.q1 + subjectData.q2) / 2;
					if (subjectType === 'CORE') {
						gradesData.firstSemester.coreSubjects.push(subjectData);
					} else {
						// Both APPLIED and SPECIALIZED go to appliedSubjects
						gradesData.firstSemester.appliedSubjects.push(subjectData);
					}
				} else if (semester === '2nd Semester') {
					// Calculate final grade for second semester
					subjectData.final = (subjectData.q3 + subjectData.q4) / 2;
					if (subjectType === 'CORE') {
						gradesData.secondSemester.coreSubjects.push(subjectData);
					} else {
						// Both APPLIED and SPECIALIZED go to appliedSubjects
						gradesData.secondSemester.appliedSubjects.push(subjectData);
					}
				}
			});

			// Calculate semester averages
			const calculateSemesterAverages = (
				semester: 'firstSemester' | 'secondSemester'
			) => {
				const allSubjects = [
					...gradesData[semester].coreSubjects,
					...gradesData[semester].appliedSubjects,
				];

				if (semester === 'firstSemester') {
					const q1Total = allSubjects.reduce(
						(sum, subj) => sum + (subj.q1 || 0),
						0
					);
					const q2Total = allSubjects.reduce(
						(sum, subj) => sum + (subj.q2 || 0),
						0
					);
					const count = allSubjects.length || 1;

					gradesData[semester].averages = {
						q1: Math.round((q1Total / count) * 100) / 100,
						q2: Math.round((q2Total / count) * 100) / 100,
						final: Math.round(((q1Total + q2Total) / (count * 2)) * 100) / 100,
					};
				} else {
					const q3Total = allSubjects.reduce(
						(sum, subj) => sum + (subj.q3 || 0),
						0
					);
					const q4Total = allSubjects.reduce(
						(sum, subj) => sum + (subj.q4 || 0),
						0
					);
					const count = allSubjects.length || 1;

					gradesData[semester].averages = {
						q3: Math.round((q3Total / count) * 100) / 100,
						q4: Math.round((q4Total / count) * 100) / 100,
						final: Math.round(((q3Total + q4Total) / (count * 2)) * 100) / 100,
					};
				}
			};

			calculateSemesterAverages('firstSemester');
			calculateSemesterAverages('secondSemester');

			// Basic school info
			schoolInfo = {
				name: 'Dr. Juan A. Pastor Integrated National High School',
				schoolId: '301155',
				district: 'Baco',
				division: 'Batangas',
				region: 'Region IV-B',
				schoolYear: schoolYear,
				curriculum: 'K to 12 Basic Education Curriculum',
			};

			const supervisorName = student.class?.supervisor
				? `${student.class.supervisor.surname}, ${student.class.supervisor.name}`
				: '';

			studentInfo = {
				lrn: student.lrn,
				name: `${student.surname}, ${student.name} ${student.middleName || ''}`,
				age: student.birthday
					? new Date().getFullYear() - new Date(student.birthday).getFullYear()
					: null,
				sex: student.sex,
				grade: student.grade?.level || 'N/A',
				section: student.class?.name || 'N/A',
				adviser: supervisorName,
				strand: student.Strand?.name || 'N/A',
			};

			// Process Attendance Data
			const schoolMonths = getSchoolYearMonths(startYear);
			let totalSchoolDays = 0;
			let totalDaysPresent = 0;
			let totalDaysAbsent = 0;

			// Create a map of attendance by month for easier processing
			const attendanceByMonth = new Map();

			// Initialize the attendance map with all months in the school year
			schoolMonths.forEach((month) => {
				const yearForMonth = month.index >= 5 ? startYear : endYear;
				const key = `${yearForMonth}-${month.index}`;
				attendanceByMonth.set(key, { present: 0, absent: 0 });
				console.log(
					`Initialized month: ${month.name} ${yearForMonth} (key: ${key})`
				);
			});

			// Process each attendance record
			filteredAttendance.forEach((record) => {
				const recordDate = new Date(record.date);
				const monthIndex = recordDate.getMonth();
				const recordYear = recordDate.getFullYear();
				const key = `${recordYear}-${monthIndex}`;

				const monthAttendance = attendanceByMonth.get(key) || {
					present: 0,
					absent: 0,
				};

				// Update counts based on status: Assume status '1' means PRESENT
				if (record.status === '1' || record.status === 'PRESENT') {
					// Check for '1' or 'PRESENT'
					monthAttendance.present++;
				} else {
					// Assume any other status means ABSENT for this summary
					monthAttendance.absent++;
				}

				attendanceByMonth.set(key, monthAttendance);
			});

			// Map each month in the school year to attendance data
			attendanceData.monthly = schoolMonths.map((monthInfo) => {
				const { index, name, schoolDays } = monthInfo;
				const year = index >= 5 ? startYear : endYear; // June-Dec are in startYear, Jan-Apr in endYear
				const key = `${year}-${index}`;

				// Get attendance for this month
				const monthAttendance = attendanceByMonth.get(key) || {
					present: 0,
					absent: 0,
				};
				const daysPresent = monthAttendance.present;
				const daysAbsent = monthAttendance.absent;

				totalSchoolDays += schoolDays;
				totalDaysPresent += daysPresent;
				totalDaysAbsent += daysAbsent;

				// Log month data for debugging
				console.log(
					`Month summary: ${name} ${year} (index: ${index}, key: ${key})`
				);
				console.log(
					`School Days: ${schoolDays}, Present: ${daysPresent}, Absent: ${daysAbsent}`
				);

				return {
					month: index,
					name,
					year,
					schoolDays,
					daysPresent,
					daysAbsent,
				};
			});

			attendanceData.totals = {
				schoolDays: totalSchoolDays,
				daysPresent: totalDaysPresent,
				daysAbsent: totalDaysAbsent,
			};

			console.log(
				'Final attendance data:',
				JSON.stringify(attendanceData, null, 2)
			);
		}

		// Construct the response
		const responsePayload = {
			strands,
			students: studentId ? undefined : students,
			studentInfo,
			schoolInfo,
			attendance: attendanceData,
			grades: {
				firstSemester: {
					subjects: [
						...gradesData.firstSemester.coreSubjects,
						...gradesData.firstSemester.appliedSubjects,
					],
					averages: gradesData.firstSemester.averages,
				},
				secondSemester: {
					subjects: [
						...gradesData.secondSemester.coreSubjects,
						...gradesData.secondSemester.appliedSubjects,
					],
					averages: gradesData.secondSemester.averages,
				},
			},
		};

		console.log(
			'Final response structure for SF9:',
			JSON.stringify(
				{
					firstSemesterSubjectsCount:
						gradesData.firstSemester.coreSubjects.length +
						gradesData.firstSemester.appliedSubjects.length,
					secondSemesterSubjectsCount:
						gradesData.secondSemester.coreSubjects.length +
						gradesData.secondSemester.appliedSubjects.length,
					sampleFirstSemester: gradesData.firstSemester.coreSubjects[0],
				},
				null,
				2
			)
		);

		return NextResponse.json(responsePayload);
	} catch (error) {
		console.error('Error fetching SF9 data:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
