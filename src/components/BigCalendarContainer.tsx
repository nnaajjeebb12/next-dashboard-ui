import prisma from '@/lib/prisma';
import { adjustScheduleToCurrentWeek } from '@/lib/utils';
import moment from 'moment';
import BigCalendar from './BigCalendar';

const BigCalendarContainer = async ({
	type,
	id,
}: {
	type: 'teacherId' | 'classId';
	id: string | number;
}) => {
	const dataRes = await prisma.lesson.findMany({
		where: {
			...(type === 'teacherId'
				? { teacherId: id as string }
				: { classId: id as number }),
		},
	});

	const data = dataRes.map((lesson) => ({
		title: lesson.name,
		// start: new Date(lesson.startTime),
		// end: new Date(lesson.endTime),
		start: moment.utc(lesson.startTime).toDate(),
		end: moment.utc(lesson.endTime).toDate(),
	}));

	const schedule = adjustScheduleToCurrentWeek(data);

	return (
		<div className="">
			<BigCalendar data={schedule} />
		</div>
	);
};

export default BigCalendarContainer;
