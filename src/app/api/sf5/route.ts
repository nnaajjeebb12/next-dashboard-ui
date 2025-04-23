import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams;
		const classId = searchParams.get('classId');
		const strandId = searchParams.get('strandId');
		const schoolYear = searchParams.get('schoolYear');
		const semester = searchParams.get('semester');

		if (!schoolYear || !semester) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 }
			);
		}

		// First, get all results for the given school year and semester
		const results = await prisma.result.findMany({
			where: {
				student: {
					...(classId && { classId: parseInt(classId) }),
					...(strandId && { strandId: parseInt(strandId) }),
				},
			},
			include: {
				student: {
					include: {
						class: {
							include: {
								supervisor: true,
								grade: true,
							},
						},
					},
				},
				Lesson: true,
			},
		});

		// Group results by student and calculate their status
		const studentResults = new Map();
		results.forEach((result) => {
			if (!studentResults.has(result.studentId)) {
				studentResults.set(result.studentId, {
					...result.student,
					backSubjects: [],
					semesterStatus: 'Complete',
					yearStatus: 'Regular',
					results: [],
				});
			}

			const student = studentResults.get(result.studentId);
			student.results.push(result);

			// Calculate average based on semester
			let average;
			if (semester === '1st Semester') {
				// For 1st semester, only use Q1 and Q2
				const q1 = result.q1 || 0;
				const q2 = result.q2 || 0;
				const validGrades = [q1, q2].filter((grade) => grade > 0);
				average =
					validGrades.length > 0
						? validGrades.reduce((a, b) => a + b) / validGrades.length
						: 0;
			} else {
				// For 2nd semester, use all quarters
				const q1 = result.q1 || 0;
				const q2 = result.q2 || 0;
				const q3 = result.q3 || 0;
				const q4 = result.q4 || 0;
				const validGrades = [q1, q2, q3, q4].filter((grade) => grade > 0);
				average =
					validGrades.length > 0
						? validGrades.reduce((a, b) => a + b) / validGrades.length
						: 0;
			}

			// If all grades are 0 or average is below 75, it's a back subject
			if (average === 0 || (average > 0 && average < 75)) {
				const subjectName = result.Lesson?.name || 'Unknown Subject';
				const gradeDisplay = average > 0 ? average.toFixed(2) : '0.00';
				student.backSubjects.push(`${subjectName} (${gradeDisplay})`);
				student.semesterStatus = 'Incomplete';
				student.yearStatus = 'Irregular';
			}
		});

		// Convert to arrays and separate by gender
		const students = Array.from(studentResults.values());
		const maleStudents = students.filter((student) => student.sex === 'MALE');
		const femaleStudents = students.filter(
			(student) => student.sex === 'FEMALE'
		);

		// Get class info from the first student (if exists)
		const firstStudent = students[0];
		const classInfo = firstStudent?.class || null;

		// Get strand info
		const strand = strandId
			? await prisma.strand.findUnique({
					where: { id: parseInt(strandId) },
			  })
			: null;

		const supervisorFullName = classInfo?.supervisor
			? `${classInfo.supervisor.name} ${classInfo.supervisor.surname}`
			: 'NO ASSIGNED SUPERVISOR';

		// Calculate summary data
		const calculateSummaryData = (students: any[]) => {
			const maleSummary = {
				complete: maleStudents.filter((s) => s.semesterStatus === 'Complete')
					.length,
				incomplete: maleStudents.filter(
					(s) => s.semesterStatus === 'Incomplete'
				).length,
				regular: maleStudents.filter((s) => s.yearStatus === 'Regular').length,
				irregular: maleStudents.filter((s) => s.yearStatus === 'Irregular')
					.length,
			};

			const femaleSummary = {
				complete: femaleStudents.filter((s) => s.semesterStatus === 'Complete')
					.length,
				incomplete: femaleStudents.filter(
					(s) => s.semesterStatus === 'Incomplete'
				).length,
				regular: femaleStudents.filter((s) => s.yearStatus === 'Regular')
					.length,
				irregular: femaleStudents.filter((s) => s.yearStatus === 'Irregular')
					.length,
			};

			return {
				male: maleSummary,
				female: femaleSummary,
				total: {
					complete: maleSummary.complete + femaleSummary.complete,
					incomplete: maleSummary.incomplete + femaleSummary.incomplete,
					regular: maleSummary.regular + femaleSummary.regular,
					irregular: maleSummary.irregular + femaleSummary.irregular,
				},
			};
		};

		// Construct the response
		const response = {
			schoolInfo: {
				name: 'Dr. Juan A. Pastor Memorial National High School',
				schoolId: '301155',
				district: 'Baco',
				division: 'Batangas',
				region: 'Region IV-A',
				semester: semester,
				schoolYear: schoolYear,
				section: classInfo?.name || 'Unknown Section',
				track: 'Academic Track',
				strand: strand?.name || 'Unknown Strand',
				supervisorName: supervisorFullName,
			},
			class: {
				supervisor: classInfo?.supervisor,
				grade: classInfo?.grade,
			},
			maleStudents,
			femaleStudents,
			totalMale: maleStudents.length,
			totalFemale: femaleStudents.length,
			grandTotal: students.length,
			summaryData: calculateSummaryData(students),
			strands: await prisma.strand.findMany(),
			classes: await prisma.class.findMany({
				where: strandId
					? {
							students: {
								some: {
									strandId: parseInt(strandId),
								},
							},
					  }
					: undefined,
			}),
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('Error in SF5 API:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
