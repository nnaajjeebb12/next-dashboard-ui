import { Student } from '@prisma/client';
import * as XLSX from 'xlsx';

interface SchoolInfo {
	schoolName: string;
	schoolId: string;
	district: string;
	division: string;
	region: string;
}

export const exportSF1Form = async (
	students: Student[],
	schoolInfo: SchoolInfo,
	schoolYear: string,
	semester: string,
	advisorName: string
) => {
	// Create workbook and worksheet
	const wb = XLSX.utils.book_new();
	const ws = XLSX.utils.aoa_to_sheet([]);

	// Set column widths
	const colWidths = [
		{ wch: 5 }, // LRN
		{ wch: 30 }, // Name
		{ wch: 10 }, // Sex
		{ wch: 12 }, // Birthday
		{ wch: 15 }, // Religion
		{ wch: 30 }, // Address
		{ wch: 30 }, // Parent Name
		{ wch: 30 }, // Guardian Name
		{ wch: 15 }, // Contact
		{ wch: 10 }, // Status
	];
	ws['!cols'] = colWidths;

	// Add header information
	XLSX.utils.sheet_add_aoa(
		ws,
		[
			[`School Form 1 (SF1) School Register for Senior High School`],
			[`School Name: ${schoolInfo.schoolName}`],
			[`School ID: ${schoolInfo.schoolId}`],
			[`District: ${schoolInfo.district}`],
			[`Division: ${schoolInfo.division}`],
			[`Region: ${schoolInfo.region}`],
			[`School Year: ${schoolYear}`],
			[`Semester: ${semester}`],
			[`Adviser: ${advisorName}`],
			[],
			// Header row
			[
				'LRN',
				'NAME (Last Name, First Name, Middle Name)',
				'SEX',
				'BIRTH DATE',
				'RELIGION',
				'ADDRESS',
				"FATHER's NAME",
				"MOTHER's NAME",
				'GUARDIAN NAME',
				'CONTACT',
				'REMARKS',
			],
		],
		{ origin: 'A1' }
	);

	// Add student data
	const studentData = students.map((student) => [
		student.lrn || '',
		`${student.surname}, ${student.name} ${student.middleName || ''}`,
		student.sex,
		new Date(student.birthday).toLocaleDateString(),
		student.religion || '',
		`${student.purok || ''} ${student.brgy || ''} ${student.city || ''} ${
			student.province || ''
		}`,
		student.fatherName
			? `${student.fatherSurname}, ${student.fatherName} ${
					student.fatherMiddleName || ''
			  }`
			: '',
		student.motherName
			? `${student.motherSurname}, ${student.motherName} ${
					student.motherMiddleName || ''
			  }`
			: '',
		student.guardianName
			? `${student.guardianSurname}, ${student.guardianName} ${
					student.guardianMiddleName || ''
			  }`
			: '',
		student.phone || '',
		student.remarks || '',
	]);

	XLSX.utils.sheet_add_aoa(ws, studentData, { origin: 'A12' });

	// Add the worksheet to the workbook
	XLSX.utils.book_append_sheet(wb, ws, 'SF1-SHS');

	// Return base64 string instead of Blob (which is not serializable)
	const b64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
	return b64;
};
