import { auth } from '@clerk/nextjs/server';
import { start } from 'repl';
import prisma from './prisma';

export async function getRole() {
	const { sessionClaims } = await auth();
	return (sessionClaims?.metadata as { role?: string })?.role;
}

export async function getUserId() {
	const { userId } = await auth();
	return userId;
}

const getLatestMonday = (): Date => {
	const today = new Date();
	const dayOfWeek = today.getDay();

	// Create a new Date object to avoid modifying the original
	const monday = new Date(today);

	if (dayOfWeek === 0) {
		// If today is Sunday, get tomorrow (the upcoming Monday)
		monday.setDate(today.getDate() + 1);
	} else {
		// Otherwise, get the most recent Monday
		const daysSinceMonday = dayOfWeek - 1;
		monday.setDate(today.getDate() - daysSinceMonday);
	}

	return monday;
};

export const adjustScheduleToCurrentWeek = (
	lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
	const latestMonday = getLatestMonday();

	return lessons.map((lesson) => {
		const lessonDayOfWeek = lesson.start.getDay();

		const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

		const adjustedStartDate = new Date(latestMonday);

		adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
		adjustedStartDate.setHours(
			lesson.start.getHours(),
			lesson.start.getMinutes(),
			lesson.start.getSeconds()
		);
		const adjustedEndDate = new Date(adjustedStartDate);
		adjustedEndDate.setHours(
			lesson.end.getHours(),
			lesson.end.getMinutes(),
			lesson.end.getSeconds()
		);

		return {
			title: lesson.title,
			start: adjustedStartDate,
			end: adjustedEndDate,
		};
	});
};
