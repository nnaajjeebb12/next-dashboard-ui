import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.nextUrl.toString());
	const schoolYear = searchParams.get('schoolYear');
	const strandId = searchParams.get('strandId');
	const classId = searchParams.get('classId');
	const studentId = searchParams.get('studentId');

	if (!schoolYear) {
		return NextResponse.json(
			{ error: 'School year is required' },
			{ status: 400 }
		);
	}

	try {
		// If only schoolYear is provided, return strands
		if (!strandId) {
			const strands = await prisma.strand.findMany({
				// Add filtering by school year if necessary in your schema
			});
			return NextResponse.json({ strands });
		}

		// If strandId is provided but not classId, return classes for that strand
		if (!classId) {
			const classes = await prisma.class.findMany({
				where: {
					// Assuming classes are linked to strands indirectly via students or need another relation
					// This might need adjustment based on your exact schema structure linking classes and strands
					students: {
						some: {
							strandId: parseInt(strandId),
						},
					},
					// Add filtering by school year if necessary
				},
			});
			return NextResponse.json({ classes });
		}

		// If classId is provided but not studentId, return students in that class
		if (!studentId) {
			const students = await prisma.student.findMany({
				where: {
					classId: parseInt(classId),
					strandId: parseInt(strandId),
					// Add filtering by school year if necessary
				},
			});
			return NextResponse.json({ students });
		}

		// If studentId is provided, fetch detailed student data including grades based on subject semester
		const studentData = await prisma.student.findUnique({
			where: { id: studentId },
			include: {
				class: {
					include: {
						supervisor: true,
						lessons: {
							include: {
								subject: true, // Include subject details, including semester
							},
						},
					},
				},
				Strand: true,
				results: true, // Fetch all results for the student
			},
		});

		if (!studentData) {
			return NextResponse.json({ error: 'Student not found' }, { status: 404 });
		}

		// Process grades, separating by semester based on Subject.semester
		const firstSemesterSubjects: any[] = [];
		const secondSemesterSubjects: any[] = [];
		let firstSemTotal = 0;
		let firstSemCount = 0;
		let secondSemTotal = 0;
		let secondSemCount = 0;

		for (const lesson of studentData.class?.lessons || []) {
			const result = studentData.results.find((r) => r.lessonId === lesson.id);
			const subject = lesson.subject;

			if (!subject) continue; // Skip if lesson has no subject

			const commonSubjectData = {
				type: subject.subjectType,
				name: subject.name,
				lesson: { id: lesson.id, name: lesson.name }, // Include lesson name if needed
			};

			if (subject.semester === '1st Semester') {
				const q1 = result?.q1 ?? null;
				const q2 = result?.q2 ?? null;
				let final = null;
				if (q1 !== null && q2 !== null) {
					final = Math.round((q1 + q2) / 2);
					firstSemTotal += final;
					firstSemCount++;
				} else if (q1 !== null) {
					final = q1; // Or handle as incomplete?
					// Decide if single quarter grades contribute to average
				} else if (q2 !== null) {
					final = q2; // Or handle as incomplete?
					// Decide if single quarter grades contribute to average
				}

				firstSemesterSubjects.push({
					...commonSubjectData,
					q1: q1,
					q2: q2,
					final: final,
				});
			} else if (subject.semester === '2nd Semester') {
				const q3 = result?.q3 ?? null;
				const q4 = result?.q4 ?? null;
				let final = null;
				if (q3 !== null && q4 !== null) {
					final = Math.round((q3 + q4) / 2);
					secondSemTotal += final;
					secondSemCount++;
				} else if (q3 !== null) {
					final = q3; // Or handle as incomplete?
				} else if (q4 !== null) {
					final = q4; // Or handle as incomplete?
				}

				secondSemesterSubjects.push({
					...commonSubjectData,
					q3: q3,
					q4: q4,
					final: final,
				});
			}
		}

		const firstSemAverage =
			firstSemCount > 0 ? Math.round(firstSemTotal / firstSemCount) : null;
		const secondSemAverage =
			secondSemCount > 0 ? Math.round(secondSemTotal / secondSemCount) : null;

		const response = {
			student: {
				id: studentData.id,
				name: studentData.name,
				surname: studentData.surname,
				middleName: studentData.middleName,
				lrn: studentData.lrn,
				birthday: studentData.birthday,
				sex: studentData.sex,
				// Add other necessary student fields like dateOfSHSAdmission etc.
				dateOfSHSAdmission: null, // Replace with actual data if available
				dateOfAssessment: null,
				learningCenterAddress: null,
				gradeId: studentData.gradeId,
			},
			schoolInfo: {
				name: 'Dr. Juan A. Pastor Memorial National High School', // Replace with dynamic data if needed
				schoolId: '301304', // Replace with dynamic data if needed
				schoolYear: schoolYear,
				semester: '1st Semester', // This might need adjustment based on context?
				strand: studentData.Strand?.name || '',
				section: studentData.class?.name || '',
			},
			class: {
				id: studentData.class?.id,
				name: studentData.class?.name,
				supervisor: studentData.class?.supervisor
					? {
							name: studentData.class.supervisor.name,
							surname: studentData.class.supervisor.surname,
					  }
					: null,
			},
			grades: {
				firstSemester: {
					subjects: firstSemesterSubjects,
					averages: {
						final: firstSemAverage,
					},
				},
				secondSemester: {
					subjects: secondSemesterSubjects,
					averages: {
						final: secondSemAverage,
					},
				},
			},
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('Error fetching SF10 data:', error);
		return NextResponse.json(
			{ error: 'Internal server error fetching SF10 data' }, // More specific error
			{ status: 500 }
		);
	}
}
