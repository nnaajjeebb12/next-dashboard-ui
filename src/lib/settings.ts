export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
	[key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
	'/admin(.*)': ['admin'],
	'/student(.*)': ['student'],
	'/teacher(.*)': ['teacher'],
	// '/parent(.*)': ['parent'],
	'/list/teachers': ['admin'],
	'/list/students': ['admin', 'teacher'],
	// '/list/parents': ['admin', 'teacher'],
	'/list/subjects': ['admin'],
	'/list/sections': ['admin', 'teacher'],
	'/list/lessons': ['admin', 'teacher'],
	// '/list/exams': ['admin', 'teacher', 'student', 'parent'],
	// '/list/assignments': ['admin', 'teacher', 'student', 'parent'],
	'/list/results': ['admin', 'teacher'], // , 'parent'
	'/list/attendance': ['admin', 'teacher', 'student', 'parent'],
	'/list/events': ['admin', 'teacher', 'student', 'parent'],
	'/list/announcements': ['admin', 'teacher', 'student', 'parent'],
	'/list/strand': ['admin'],
	'/list/pdfExport': ['teacher'],
	// '/list/forms': ['admin', 'teacher'],
	'/list/adminInfo': ['admin'],
};

export const formatDateForInput = (dateString: string | undefined) => {
	if (!dateString) {
		// Set today's date as default for new records
		const today = new Date();
		return today.toISOString().split('T')[0];
	}
	const date = new Date(dateString);
	return date.toISOString().split('T')[0];
};
