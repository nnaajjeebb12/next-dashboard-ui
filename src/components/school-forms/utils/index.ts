// Calculate age function
export const calculateAge = (
	birthDate: Date,
	asOfDate: Date = new Date(new Date().getFullYear(), 9, 31)
) => {
	const birth = new Date(birthDate);
	let age = asOfDate.getFullYear() - birth.getFullYear();
	const monthDiff = asOfDate.getMonth() - birth.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && asOfDate.getDate() < birth.getDate())
	) {
		age--;
	}

	return age;
};

// Months array
export const MONTHS = [
	'JANUARY',
	'FEBRUARY',
	'MARCH',
	'APRIL',
	'MAY',
	'JUNE',
	'JULY',
	'AUGUST',
	'SEPTEMBER',
	'OCTOBER',
	'NOVEMBER',
	'DECEMBER',
] as const;

// Get number of days in a month
export const getNumberOfDays = (
	month: (typeof MONTHS)[number],
	year: string
) => {
	const monthIndex = MONTHS.indexOf(month);
	const yearNumber = parseInt(year.split('-')[0]);
	return new Date(yearNumber, monthIndex + 1, 0).getDate();
};

// Generate school year options
export const generateSchoolYearOptions = () => {
	const currentYear = new Date().getFullYear();
	const years = [];
	for (let i = -5; i <= 5; i++) {
		const startYear = currentYear + i;
		const endYear = startYear + 1;
		years.push(`${startYear}-${endYear}`);
	}
	return years;
};

// Get sex display
export const getSexDisplay = (sex: 'MALE' | 'FEMALE') =>
	sex === 'MALE' ? 'M' : 'F';
