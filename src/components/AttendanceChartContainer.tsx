import prisma from '@/lib/prisma';
import Image from 'next/image';
import AttendanceChart from './AttendanceChart';

const AttendanceChartContainer = async () => {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

	const lastMonday = new Date(today);
	lastMonday.setDate(today.getDate() - daysSinceMonday - 1);

	const resData = await prisma.attendance.findMany({
		where: {
			date: {
				gte: lastMonday,
			},
		},
		select: {
			date: true,
			status: true,
		},
	});

	const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

	// Initialize attendance map with all status types
	const attendanceMap: {
		[key: string]: {
			present: number;
			absent: number;
			excused: number;
			holiday: number;
		};
	} = {
		Mon: { present: 0, absent: 0, excused: 0, holiday: 0 },
		Tue: { present: 0, absent: 0, excused: 0, holiday: 0 },
		Wed: { present: 0, absent: 0, excused: 0, holiday: 0 },
		Thu: { present: 0, absent: 0, excused: 0, holiday: 0 },
		Fri: { present: 0, absent: 0, excused: 0, holiday: 0 },
	};

	resData.forEach((item) => {
		const itemDate = new Date(item.date);
		const dayOfWeek = itemDate.getDay();

		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			const dayName = daysOfWeek[dayOfWeek - 1];

			// Handle different status types
			switch (item.status) {
				case '1':
					attendanceMap[dayName].present += 1;
					break;
				case '0':
					attendanceMap[dayName].absent += 1;
					break;
				case 'E':
					attendanceMap[dayName].excused += 1;
					break;
				case 'H':
					attendanceMap[dayName].holiday += 1;
					break;
				default:
					// For backward compatibility in case some records still use boolean
					if (item.status) {
						attendanceMap[dayName].present += 1;
					} else {
						attendanceMap[dayName].absent += 1;
					}
			}
		}
	});

	const data = daysOfWeek.map((day) => ({
		name: day,
		present: attendanceMap[day].present,
		absent: attendanceMap[day].absent,
		excused: attendanceMap[day].excused,
		holiday: attendanceMap[day].holiday,
	}));

	return (
		<div className="bg-white rounded-lg p-4 h-full">
			<div className="flex justify-between items-center">
				<h1 className="text-lg font-semibold">ATTENDANCE</h1>
				<Image src="/moreDark.png" alt="" width={20} height={20} />
			</div>
			<AttendanceChart data={data} />
		</div>
	);
};

export default AttendanceChartContainer;
