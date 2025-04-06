export enum FormType {
	SF1 = 'SF1',
	SF2 = 'SF2',
	SF5 = 'SF5',
	SF9 = 'SF9',
	SF10 = 'SF10',
}

export interface StudentInfo {
	lrn?: string;
	name?: string;
	age?: number | null;
	sex?: string;
	grade?: string | number;
	section?: string;
	adviser?: string;
	strand?: string;
}

export interface SchoolInfo {
	name: string;
	schoolId: string;
	district: string;
	division: string;
	region: string;
	schoolYear: string;
	curriculum: string;
	semester: string;
	gradeLevel: string;
	section: string;
	track: string;
	strand: string;
	supervisorName?: string;
}

export interface AttendanceData {
	monthly: Array<{
		name: string;
		month: number;
		year: number;
		schoolDays: number;
		daysPresent: number;
		daysAbsent: number;
	}>;
	totals: {
		schoolDays: number;
		daysPresent: number;
		daysAbsent: number;
	};
}

export interface Strand {
	id: number;
	name: string;
}

export interface Student {
	id: string;
	name: string;
	surname: string;
	middleName?: string;
	lrn: string;
	birthday?: string;
	sex?: 'MALE' | 'FEMALE';
	dateOfSHSAdmission?: string;
	// SF10 specific fields
	isHighSchoolCompleter?: boolean;
	isJHSCompleter?: boolean;
	isPEPTCompleter?: boolean;
	isALSCompleter?: boolean;
	isOthersCompleter?: boolean;
	genAve?: string;
	jhsGenAve?: string;
	peptRating?: string;
	alsRating?: string;
	othersSpecify?: string;
	dateOfGraduation?: string;
	dateOfAssessment?: string;
	schoolName?: string;
	schoolAddress?: string;
	learningCenterAddress?: string;
	gradeId?: number;
}

export interface ObservedValue {
	coreValue: string;
	behavior: string;
	quarters: {
		q1: string;
		q2: string;
		q3: string;
		q4: string;
	};
}

export interface StudentResponse {
	student?: {
		id: number;
		name: string;
		surname: string;
		middleName?: string;
		lrn?: string;
		birthday?: string;
		sex?: string;
		dateOfSHSAdmission?: string;
		dateOfAssessment?: string;
		learningCenterAddress?: string;
		gradeId?: number;
		classId?: number;
	};
	class?: {
		supervisor?: {
			name: string;
			surname: string;
		};
	};
	studentInfo?: StudentInfo;
	schoolInfo: {
		name: string;
		schoolId: string;
		schoolYear: string;
		semester: string;
		strand: string;
		section: string;
		district?: string;
		division?: string;
		region?: string;
		gradeLevel?: string;
		track?: string;
		supervisorName?: string;
	};
	grades?: StudentGrades;
	maleStudents?: Student[];
	femaleStudents?: Student[];
	totalMale?: number;
	totalFemale?: number;
	grandTotal?: number;
	strands?: { id: number; name: string }[];
	classes?: { id: number; name: string }[];
	students?: Student[];
}

export interface SubjectGrades {
	name: string;
	type: 'CORE' | 'APPLIED' | 'SPECIALIZED';
	lesson?: {
		name: string;
	};
	q1: number;
	q2: number;
	q3?: number;
	q4?: number;
	final?: number;
}

export interface SemesterGrades {
	subjects: SubjectGrades[];
	averages: {
		q1: number;
		q2: number;
		q3?: number;
		q4?: number;
		final: number;
	};
}

export interface StudentGrades {
	firstSemester?: SemesterGrades;
	secondSemester?: SemesterGrades;
}
