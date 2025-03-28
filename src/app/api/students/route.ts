import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const strandId = searchParams.get('strandId');
		const classId = searchParams.get('classId');
		const schoolYear = searchParams.get('schoolYear');

		// Get all strands for the dropdown
		const strands = await prisma.strand.findMany({
			orderBy: {
				name: 'asc',
			},
		});

		// Get classes based on strand
		const classes = strandId
			? await prisma.class.findMany({
					where: {
						students: {
							some: {
								strandId: parseInt(strandId),
							},
						},
					},
					orderBy: {
						name: 'asc',
					},
			  })
			: [];

		// Base query conditions
		const whereConditions: any = {
			AND: [],
		};

		if (strandId) {
			whereConditions.AND.push({ strandId: parseInt(strandId) });
		}

		if (classId) {
			whereConditions.AND.push({ classId: parseInt(classId) });
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
				class: true,
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
				class: true,
				Strand: true,
			},
		});

		// Get school information
		const schoolInfo = {
			name: 'Dr. Juan A. Pastor Memorial National High School',
			schoolId: '301155',
			district: 'Baco',
			division: 'Batangas',
			region: 'Region IV-A',
			semester: '1st Semester',
			schoolYear: '2022-2023',
			gradeLevel: 'Grade 11',
			section: classId
				? classes.find((c) => c.id === parseInt(classId))?.name
				: 'All',
			track: 'Academic Track',
			strand: strandId
				? strands.find((s) => s.id === parseInt(strandId))?.name
				: 'All',
		};

		if (classId) {
			// Get class with supervisor information
			const selectedClass = await prisma.class.findUnique({
				where: { id: Number(classId) },
				include: {
					supervisor: {
						select: {
							id: true,
							name: true,
							surname: true,
						},
					},
				},
			});

			// Add console.log for debugging
			console.log('Selected Class:', selectedClass);
			console.log('Supervisor:', selectedClass?.supervisor);

			// Make sure we have both name and surname before creating the full name
			const supervisorFullName =
				selectedClass?.supervisor?.name && selectedClass?.supervisor?.surname
					? `${selectedClass.supervisor.surname.toUpperCase()}, ${selectedClass.supervisor.name.toUpperCase()}`
					: 'NO ASSIGNED SUPERVISOR';

			console.log('Supervisor Full Name:', supervisorFullName);

			return NextResponse.json({
				schoolInfo: {
					...schoolInfo,
					supervisorName: supervisorFullName,
				},
				strands,
				classes,
				maleStudents,
				femaleStudents,
				totalMale: maleStudents.length,
				totalFemale: femaleStudents.length,
				grandTotal: maleStudents.length + femaleStudents.length,
			});
		}

		return NextResponse.json({
			schoolInfo,
			strands,
			classes,
			maleStudents,
			femaleStudents,
			totalMale: maleStudents.length,
			totalFemale: femaleStudents.length,
			grandTotal: maleStudents.length + femaleStudents.length,
		});
	} catch (error) {
		console.error('Error fetching data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch data' },
			{ status: 500 }
		);
	}
}
