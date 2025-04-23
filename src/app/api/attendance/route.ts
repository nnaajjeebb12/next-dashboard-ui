import prisma from '@/lib/prisma';
import { getRole } from '@/lib/utils';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const start = searchParams.get('start');
		const end = searchParams.get('end');
		const students = searchParams.get('students');
		const semester = searchParams.get('semester');

		// Debug: Check if there's any data in the Attendance table
		const totalAttendanceCount = await prisma.attendance.count();

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

		if (!start || !end || !students) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 }
			);
		}

		// Parse student IDs from the comma-separated string
		const studentIds = students.split(',');

		// Debug: Check if these students have any attendance records
		const studentAttendanceCount = await prisma.attendance.count({
			where: {
				studentId: {
					in: studentIds,
				},
			},
		});

		// Debug: Check date range separately
		const dateRangeCount = await prisma.attendance.count({
			where: {
				date: {
					gte: new Date(start),
					lte: new Date(end),
				},
			},
		});

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

		return NextResponse.json(attendanceRecords);
	} catch (error) {
		console.error('Error fetching attendance data:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch attendance data' },
			{ status: 500 }
		);
	}
}

export async function POST(req: Request) {
	try {
		const role = await getRole();
		if (role !== 'teacher') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { studentId, status, date, semester } = await req.json();

		// Check if attendance record exists for this student and date
		const existingAttendance = await prisma.attendance.findFirst({
			where: {
				studentId,
				date: new Date(date),
			},
		});

		if (existingAttendance) {
			// Update existing attendance
			const updatedAttendance = await prisma.attendance.update({
				where: {
					id: existingAttendance.id,
				},
				data: {
					status,
					semester,
				},
			});
			return NextResponse.json(updatedAttendance);
		} else {
			// Create new attendance record
			const newAttendance = await prisma.attendance.create({
				data: {
					studentId,
					status,
					date: new Date(date),
					semester,
				},
			});
			return NextResponse.json(newAttendance);
		}
	} catch (error) {
		console.error('Error handling attendance:', error);
		return NextResponse.json(
			{ error: 'Failed to update attendance' },
			{ status: 500 }
		);
	}
}
