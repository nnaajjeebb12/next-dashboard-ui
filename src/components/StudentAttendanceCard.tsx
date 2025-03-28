import prisma from '@/lib/prisma';

const StudentAttendanceCard = async ({ id }: { id: string }) => {
	const attendance = await prisma.attendance.findMany({
		where: {
			studentId: id,
			date: {
				gte: new Date(new Date().getFullYear(), 0, 1),
			},
		},
	});

	const totalDays = attendance.length;

	// Count days where status is '1', 'H', or 'E' as present
	const presentDays = attendance.filter((day) => {
		const status = day.status?.toString();
		return status === '1' || status === 'H' || status === 'E';
	}).length;

	// Calculate percentage, handling the case where there are no attendance records
	const percentage =
		totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

	return (
		<div className="">
			<h1 className="text-xl font-semibold">
				{totalDays > 0 ? `${percentage}%` : '-'}
			</h1>
			<span className="text-sm text-gray-400">Attendance</span>
		</div>
	);
};

export default StudentAttendanceCard;
