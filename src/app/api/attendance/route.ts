import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		const students = searchParams.get('students');
		const semester = searchParams.get('semester');

		console.log('API Request Parameters:', {
			start,
			end,
			students,
			semester,
		});

		// Debug: Check if there's any data in the Attendance table
		const totalAttendanceCount = await prisma.attendance.count();
		console.log('Total records in Attendance table:', totalAttendanceCount);

		// Debug: Get a sample of attendance records
		const sampleAttendance = await prisma.attendance.findMany({
			take: 5,
			include: {
				student: {
					select: {
						name: true,
						surname: true,
					},
				},
			},
		});
		console.log('Sample attendance records:', sampleAttendance);

		if (!start || !end || !students) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 }
			);
		}

		// Parse student IDs from the comma-separated string
		const studentIds = students.split(',');
		console.log('Searching for students:', studentIds);

		// Debug: Check if these students have any attendance records
		const studentAttendanceCount = await prisma.attendance.count({
			where: {
				studentId: {
					in: studentIds,
				},
			},
		});
		console.log(
			'Found attendance records for these students:',
			studentAttendanceCount
		);

		// Debug: Check date range separately
		const dateRangeCount = await prisma.attendance.count({
			where: {
				date: {
					gte: new Date(start),
					lte: new Date(end),
				},
			},
		});
		console.log('Records within date range:', dateRangeCount);

		// Original query with all conditions
		const attendanceRecords = await prisma.attendance.findMany({
			where: {
				studentId: {
					in: studentIds,
				},
				date: {
					gte: new Date(start),
					lte: new Date(end),
				},
				...(semester ? { semester: semester } : {}),
			},
			select: {
				id: true,
				date: true,
				status: true,
				studentId: true,
			},
			orderBy: {
				date: 'asc',
			},
		});

		console.log('Final attendance records found:', attendanceRecords);

		return NextResponse.json(attendanceRecords);
	} catch (error) {
		console.error('Error fetching attendance data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch attendance data' },
			{ status: 500 }
		);
	}
}
