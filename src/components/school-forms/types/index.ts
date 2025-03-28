import { MONTHS } from '../utils';

// Student data interface
export interface StudentData {
	id: string;
	lrn: string;
	name: string;
	middleName?: string | null;
	surname: string;
	birthday: Date;
	sex: 'MALE' | 'FEMALE';
	religion?: string | null;
	address: string;
	purok?: string | null;
	brgy?: string | null;
	city?: string | null;
	province?: string | null;
	fatherName?: string | null;
	fatherMiddleName?: string | null;
	fatherSurname?: string | null;
	motherName?: string | null;
	motherMiddleName?: string | null;
	motherSurname?: string | null;
	guardianName?: string | null;
	guardianMiddleName?: string | null;
	guardianSurname?: string | null;
	guardianContact?: string | null;
	learningModal?: string | null;
	remarks?: string | null;
	class: { name: string };
	Strand: { name: string };
}

// School information interface
export interface SchoolInfo {
	name: string;
	schoolId: string;
	district: string;
	division: string;
	region: string;
	semester: string;
	schoolYear: string;
	gradeLevel: string;
	section: string;
	track: string;
	strand: string;
	supervisorName: string;
}

// Strand interface
export interface Strand {
	id: number;
	name: string;
}

// Class interface
export interface Class {
	id: number;
	name: string;
}

// Student response interface
export interface StudentResponse {
	schoolInfo: SchoolInfo;
	strands: Strand[];
	classes: Class[];
	maleStudents: StudentData[];
	femaleStudents: StudentData[];
	totalMale: number;
	totalFemale: number;
	grandTotal: number;
}

// Form type enum
export enum FormType {
	SF1 = 'SF1',
	SF2 = 'SF2',
	SF5 = 'SF5',
	SF9 = 'SF9',
	SF10 = 'SF10',
}

// SF2 specific data interface
export interface SF2Data {
	schoolInfo: {
		name: string;
		schoolId: string;
		district: string;
		division: string;
		region: string;
		semester: string;
		schoolYear: string;
		gradeLevel: string;
		section: string;
		track: string;
		strand: string;
	};
}

// Props interfaces for PDF documents
export interface PDFDocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
}

export interface SF2DocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
	selectedMonth: (typeof MONTHS)[number];
}
