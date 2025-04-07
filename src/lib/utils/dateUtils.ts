// List of Philippine holidays (can be expanded)
const HOLIDAYS = [
	// Regular Holidays
	{ month: 1, day: 1 }, // New Year's Day
	{ month: 4, day: 9 }, // Araw ng Kagitingan
	{ month: 5, day: 1 }, // Labor Day
	{ month: 6, day: 12 }, // Independence Day
	{ month: 8, day: 21 }, // Ninoy Aquino Day
	{ month: 8, day: 28 }, // National Heroes Day
	{ month: 11, day: 30 }, // Bonifacio Day
	{ month: 12, day: 25 }, // Christmas Day
	{ month: 12, day: 30 }, // Rizal Day
];

export function isHoliday(date: Date): boolean {
	const month = date.getMonth() + 1; // JavaScript months are 0-based
	const day = date.getDate();

	return HOLIDAYS.some(
		(holiday) => holiday.month === month && holiday.day === day
	);
}
