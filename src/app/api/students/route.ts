import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const strandId = searchParams.get('strandId');
		const classId = searchParams.get('classId');
		const schoolYear = searchParams.get('schoolYear');
		const semester = searchParams.get('semester');

		// Get all strands for the dropdown
		const strands = await prisma.strand.findMany({
			orderBy: {
				name: 'asc',
			},
		});

		// Get classes based on strand
		const classes = await prisma.class.findMany({
			where: strandId
				? {
						students: {
							some: {
								strandId: parseInt(strandId),
							},
						},
				  }
				: undefined,
			orderBy: {
				name: 'asc',
			},
			include: {
				supervisor: true,
			},
		});

		// Base query conditions
		const whereConditions: any = {};

		if (strandId) {
			whereConditions.strandId = parseInt(strandId);
		}

		if (classId) {
			whereConditions.classId = parseInt(classId);
		}

		// Get male students
		const maleStudents = await prisma.student.findMany({
			where: {
				...whereConditions,
				sex: 'MALE',
			},
			orderBy: {
				surname: 'asc',
			},
			include: {
				class: {
					include: {
						supervisor: true,
					},
				},
				Strand: true,
			},
		});

		// Get female students
		const femaleStudents = await prisma.student.findMany({
			where: {
				...whereConditions,
				sex: 'FEMALE',
			},
			orderBy: {
				surname: 'asc',
			},
			include: {
				class: {
					include: {
						supervisor: true,
					},
				},
				Strand: true,
			},
		});

		// Get class info from the first student (if exists)
		const firstStudent = [...maleStudents, ...femaleStudents][0];
		const classInfo = firstStudent?.class || null;

		// Get supervisor name
		const supervisorFullName = classInfo?.supervisor
			? `${classInfo.supervisor.name} ${classInfo.supervisor.surname}`
			: 'NO ASSIGNED SUPERVISOR';

		// Construct the response
		const response = {
			schoolInfo: {
				name: 'Dr. Juan A. Pastor Memorial National High School',
				schoolId: '301155',
				district: 'Baco',
				division: 'Batangas',
				region: 'Region IV-A',
				semester: semester || '1st Semester',
				schoolYear: schoolYear || '2023-2024',
				gradeLevel: 'Grade 11',
				section: classInfo?.name || 'Unknown Section',
				track: 'Academic Track',
				strand: firstStudent?.Strand?.name || 'Unknown Strand',
				supervisorName: supervisorFullName,
			},
			maleStudents,
			femaleStudents,
			totalMale: maleStudents.length,
			totalFemale: femaleStudents.length,
			grandTotal: maleStudents.length + femaleStudents.length,
			strands,
			classes,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error('Error in students API:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
