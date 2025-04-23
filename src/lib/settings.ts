export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
	[key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
	'/admin(.*)': ['admin'],
	'/student(.*)': ['student'],
	'/teacher(.*)': ['teacher'],
	'/list/teachers': ['admin'],
	'/list/students': ['admin', 'teacher'],
	'/list/subjects': ['admin'],
	'/list/sections': ['admin', 'teacher'],
	'/list/lessons': ['teacher'],
	'/list/results': ['teacher'],
	'/list/attendance': ['teacher'],
	'/list/events': ['admin', 'teacher', 'student', 'parent'],
	'/list/announcements': ['admin', 'teacher', 'student', 'parent'],
	'/list/strand': ['admin'],
	'/list/pdfExport': ['teacher'],
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
