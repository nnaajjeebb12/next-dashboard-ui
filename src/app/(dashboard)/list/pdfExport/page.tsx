'use client';

import {
	Document,
	Image,
	Page,
	PDFDownloadLink,
	PDFViewer,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';

// Define types for student data
interface StudentData {
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

interface SchoolInfo {
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

interface Strand {
	id: number;
	name: string;
}

interface Class {
	id: number;
	name: string;
}

interface StudentResponse {
	schoolInfo: SchoolInfo;
	strands: Strand[];
	classes: Class[];
	maleStudents: StudentData[];
	femaleStudents: StudentData[];
	totalMale: number;
	totalFemale: number;
	grandTotal: number;
}

// Add form type enum
enum FormType {
	SF1 = 'SF1',
	SF2 = 'SF2',
	SF5 = 'SF5',
	SF9 = 'SF9',
	SF10 = 'SF10',
}

const calculateAge = (
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

// PDF Document Component
const PDFDocument = ({
	data,
	selectedSchoolYear,
}: {
	data: StudentResponse;
	selectedSchoolYear: string;
}) => {
	// Define dimensions for landscape orientation
	// Note: We're swapping height and width to force landscape
	const PAGE_HEIGHT = 1684.8; // 16.5 inches
	const PAGE_WIDTH = 1188; // 23.4 inches

	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			backgroundColor: '#FFFFFF',
			padding: 30,
			// Force landscape orientation by setting explicit dimensions
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			pageOrientation: 'landscape',
		},
		headerContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 30,
		},
		logoContainer: {
			width: 80,
			height: 80,
		},
		titleContainer: {
			flex: 1,
			marginHorizontal: 40,
		},
		formTitle: {
			fontSize: 24,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		infoGrid: {
			marginTop: 10,
		},
		row: {
			flexDirection: 'row',
			marginBottom: 10,
			alignItems: 'center',
		},
		fieldContainer: {
			flexDirection: 'column',
			marginRight: 15,
		},
		fieldRow: {
			flexDirection: 'row',
			alignItems: 'flex-start',
		},
		label: {
			fontSize: 8,
			marginBottom: 2,
		},
		value: {
			fontSize: 8,
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			paddingBottom: 1,
			paddingTop: 1,
		},
		schoolNameField: {
			flex: 2.5,
		},
		regularField: {
			flex: 1,
		},
		wideField: {
			flex: 2,
		},
		table: {
			width: '100%',
			display: 'flex',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRightWidth: 0,
			borderBottomWidth: 0,
			marginTop: 10,
		},
		tableRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			minHeight: 25,
			alignItems: 'center',
		},
		tableCell: {
			padding: 4,
			fontSize: 10,
			borderRightWidth: 1,
			borderRightColor: '#000000',
			textAlign: 'left',
		},
		tableHeaderCell: {
			padding: 4,
			fontSize: 10,
			fontWeight: 'bold',
			backgroundColor: '#f0f0f0',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			textAlign: 'center',
		},
		columnLRN: { width: '5%' },
		columnName: { width: '14%' },
		columnSex: { width: '3%' },
		columnBirthDate: { width: '6%' },
		columnAge: { width: '3%' },
		columnReligion: { width: '7%' },
		columnPurok: { width: '4%' },
		columnBrgy: { width: '4%' },
		columnCity: { width: '4%' },
		columnProvince: { width: '4%' },
		columnFather: { width: '8%' },
		columnMother: { width: '8%' },
		columnGuardian: { width: '5%' },
		columnGuardianContact: { width: '5%' },
		columnLearningModality: { width: '5%' },
		columnRemarks: { width: '4%' },
		genderRow: {
			backgroundColor: '#f0f0f0',
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			minHeight: 20,
		},
		genderCell: {
			padding: 4,
			fontSize: 10,
			fontWeight: 'bold',
			borderRightWidth: 1,
			borderRightColor: '#000000',
		},
		bottomContainer: {
			marginTop: 20,
			width: '100%',
		},
		legendOuterContainer: {
			width: '50%',
		},
		legendContainer: {
			borderWidth: 1,
			borderColor: '#000',
			width: '100%',
		},
		legendTitle: {
			fontSize: 8,
			padding: 4,
			borderBottomWidth: 1,
			borderBottomColor: '#000',
		},
		legendTable: {
			width: '100%',
		},
		legendRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000',
		},
		legendCell: {
			padding: 4,
			fontSize: 7,
			borderRightWidth: 1,
			borderRightColor: '#000',
		},
		summarySection: {
			marginTop: 20,
			flexDirection: 'row',
			justifyContent: 'space-between',
			width: '100%',
		},
		registerContainer: {
			width: '20%',
			borderWidth: 1,
			borderColor: '#000',
			alignSelf: 'flex-start',
		},
		registerRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000',
		},
		registerCell: {
			padding: 4,
			fontSize: 8,
			borderRightWidth: 1,
			borderRightColor: '#000',
			flex: 1,
			textAlign: 'center',
		},
		signatureSection: {
			width: '25%',
			alignItems: 'center',
			marginRight: 20,
		},
		preparedByText: {
			fontSize: 8,
			marginBottom: 15,
		},
		signatureName: {
			fontSize: 9,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		signatureCaption: {
			fontSize: 8,
			textAlign: 'center',
			marginTop: 2,
		},
		generatedText: {
			fontSize: 7,
			marginTop: 15,
			color: '#666',
		},
	});

	const getSexDisplay = (sex: 'MALE' | 'FEMALE') =>
		sex === 'MALE' ? 'M' : 'F';

	const columnWidths = {
		lrn: '5%',
		name: '14%',
		sex: '3%',
		birthDate: '6%',
		age: '3%',
		religion: '4%',
		purok: '4%',
		brgy: '4%',
		city: '4%',
		province: '4%',
		fatherSurname: '5%',
		fatherFirstName: '5%',
		fatherMiddleName: '5%',
		motherSurname: '5%',
		motherFirstName: '5%',
		motherMiddleName: '5%',
		guardianSurname: '5%',
		guardianFirstName: '5%',
		guardianMiddleName: '5%',
		guardianContact: '4%',
		learningModal: '5%',
		remarks: '4%',
	};

	const renderTableHeaders = () => (
		<View style={styles.tableRow}>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.lrn }]}>
				LRN
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.name }]}>
				LEARNER'S NAME
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.sex }]}>
				SEX
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.birthDate }]}>
				BIRTH DATE
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.age }]}>
				AGE
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.religion }]}>
				RELIGION
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.purok }]}>
				PUROK
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.brgy }]}>
				BARANGAY
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.city }]}>
				CITY
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.province }]}>
				PROVINCE
			</Text>
			<Text
				style={[styles.tableHeaderCell, { width: columnWidths.fatherSurname }]}>
				Father's Surname
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.fatherFirstName },
				]}>
				Father's First Name
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.fatherMiddleName },
				]}>
				Father's Middle Name
			</Text>
			<Text
				style={[styles.tableHeaderCell, { width: columnWidths.motherSurname }]}>
				Mother's Surname
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.motherFirstName },
				]}>
				Mother's First Name
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.motherMiddleName },
				]}>
				Mother's Middle Name
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.guardianSurname },
				]}>
				Guardian's Surname
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.guardianFirstName },
				]}>
				Guardian's First Name
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.guardianMiddleName },
				]}>
				Guardian's Middle Name
			</Text>
			<Text
				style={[
					styles.tableHeaderCell,
					{ width: columnWidths.guardianContact },
				]}>
				Guardian Contact
			</Text>
			<Text
				style={[styles.tableHeaderCell, { width: columnWidths.learningModal }]}>
				LM
			</Text>
			<Text style={[styles.tableHeaderCell, { width: columnWidths.remarks }]}>
				Remarks
			</Text>
		</View>
	);

	const renderTableRow = (student: StudentData) => (
		<View style={styles.tableRow}>
			<Text style={[styles.tableCell, { width: columnWidths.lrn }]}>
				{student.lrn || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.name }]}>
				{`${student.surname}, ${student.name} ${student.middleName || ''}`}
			</Text>
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.sex, textAlign: 'center' },
				]}>
				{getSexDisplay(student.sex)}
			</Text>
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.birthDate, textAlign: 'center' },
				]}>
				{new Date(student.birthday).toLocaleDateString()}
			</Text>
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.age, textAlign: 'center' },
				]}>
				{calculateAge(student.birthday)}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.religion }]}>
				{student.religion || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.purok }]}>
				{student.purok || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.brgy }]}>
				{student.brgy || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.city }]}>
				{student.city || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.province }]}>
				{student.province || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.fatherSurname }]}>
				{student.fatherSurname || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.fatherFirstName }]}>
				{student.fatherName || ''}
			</Text>
			<Text
				style={[styles.tableCell, { width: columnWidths.fatherMiddleName }]}>
				{student.fatherMiddleName || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.motherSurname }]}>
				{student.motherSurname || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.motherFirstName }]}>
				{student.motherName || ''}
			</Text>
			<Text
				style={[styles.tableCell, { width: columnWidths.motherMiddleName }]}>
				{student.motherMiddleName || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.guardianSurname }]}>
				{student.guardianSurname || ''}
			</Text>
			<Text
				style={[styles.tableCell, { width: columnWidths.guardianFirstName }]}>
				{student.guardianName || ''}
			</Text>
			<Text
				style={[styles.tableCell, { width: columnWidths.guardianMiddleName }]}>
				{student.guardianMiddleName || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.guardianContact }]}>
				{student.guardianContact || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.learningModal }]}>
				{student.learningModal || ''}
			</Text>
			<Text style={[styles.tableCell, { width: columnWidths.remarks }]}>
				{student.remarks || ''}
			</Text>
		</View>
	);

	const renderGenderRow = (count: number, label: string) => (
		<View style={styles.genderRow}>
			<Text
				style={[
					styles.genderCell,
					{ width: '19%' },
				]}>{`${count} ${label}`}</Text>
			<Text style={[styles.genderCell, { width: '81%' }]}></Text>
		</View>
	);

	const renderLegend = () => (
		<View style={styles.legendContainer}>
			<Text style={styles.legendTitle}>
				Legend: List and Code of Indicators under REMARKS column
			</Text>
			<View style={styles.legendTable}>
				<View style={styles.legendRow}>
					<Text style={[styles.legendCell, { width: '15%' }]}>Indicator</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>Code</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Required Information
					</Text>
					<Text style={[styles.legendCell, { width: '15%' }]}>Indicator</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>Code</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Required Information
					</Text>
				</View>
				<View style={styles.legendRow}>
					<Text style={[styles.legendCell, { width: '15%' }]}>
						Transferred Out
					</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>T/O</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Name of School, Date of 1st Attendance
					</Text>
					<Text style={[styles.legendCell, { width: '15%' }]}>
						CCT Receipient
					</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>CCT</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						CCT Control/reference number & Effectivity Date
					</Text>
				</View>
				<View style={styles.legendRow}>
					<Text style={[styles.legendCell, { width: '15%' }]}>
						Transferred In
					</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>T/I</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Date of Last Attendance if Transferred Out
					</Text>
					<Text style={[styles.legendCell, { width: '15%' }]}>Balik Aral</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>B/A</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Name of school last attended & Year
					</Text>
				</View>
				<View style={styles.legendRow}>
					<Text style={[styles.legendCell, { width: '15%' }]}></Text>
					<Text style={[styles.legendCell, { width: '8%' }]}></Text>
					<Text style={[styles.legendCell, { width: '27%' }]}></Text>
					<Text style={[styles.legendCell, { width: '15%' }]}>
						Learner With Exceptionality Accelerated
					</Text>
					<Text style={[styles.legendCell, { width: '8%' }]}>LWE ACL</Text>
					<Text style={[styles.legendCell, { width: '27%' }]}>
						Specify Exceptionality of the Learner Specify Level & Effectivity
						Date
					</Text>
				</View>
			</View>
		</View>
	);

	const renderRegisterAndSignature = () => {
		// Add console.log for debugging
		console.log('SchoolInfo:', data.schoolInfo);
		console.log('Supervisor Name:', data.schoolInfo.supervisorName);

		return (
			<>
				<View style={styles.registerContainer}>
					<View style={styles.registerRow}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							REGISTER ED
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							Beginning of the Semester
						</Text>
						<Text style={styles.registerCell}>End of the Semester</Text>
					</View>
					<View style={styles.registerRow}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							MALE
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							{data.totalMale}
						</Text>
						<Text style={styles.registerCell}>{data.totalMale}</Text>
					</View>
					<View style={styles.registerRow}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							FEMALE
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							{data.totalFemale}
						</Text>
						<Text style={styles.registerCell}>{data.totalFemale}</Text>
					</View>
					<View style={[styles.registerRow, { borderBottomWidth: 0 }]}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							TOTAL
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							{data.grandTotal}
						</Text>
						<Text style={styles.registerCell}>{data.grandTotal}</Text>
					</View>
				</View>

				<View style={styles.signatureSection}>
					<Text style={styles.preparedByText}>Prepared by:</Text>
					<Text style={styles.signatureName}>
						{data.schoolInfo.supervisorName || 'NO ASSIGNED SUPERVISOR'}
					</Text>
					<Text style={styles.signatureCaption}>
						(Signature of Adviser over Printed Name)
					</Text>
				</View>
			</>
		);
	};

	return (
		<Document>
			<Page size={[PAGE_HEIGHT, PAGE_WIDTH]} style={styles.page}>
				{/* Header with Logos */}
				<View style={styles.headerContainer}>
					<Image style={styles.logoContainer} src="/DrJuanLogo.png" />
					<View style={styles.titleContainer}>
						<Text style={styles.formTitle}>
							School Form 1 School Register for Senior High School (SF1-SHS)
						</Text>
					</View>
					<Image style={styles.logoContainer} src="/deped.png" />
				</View>

				{/* School Information Grid */}
				<View style={styles.infoGrid}>
					{/* First Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.schoolNameField]}>
							<Text style={styles.label}>School Name</Text>
							<Text style={styles.value}>{data.schoolInfo.name}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>School ID</Text>
							<Text style={styles.value}>{data.schoolInfo.schoolId}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>District</Text>
							<Text style={styles.value}>{data.schoolInfo.district}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Division</Text>
							<Text style={styles.value}>{data.schoolInfo.division}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Region</Text>
							<Text style={styles.value}>{data.schoolInfo.region}</Text>
						</View>
					</View>

					{/* Second Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Semester</Text>
							<Text style={styles.value}>{data.schoolInfo.semester}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>School Year</Text>
							<Text style={styles.value}>{selectedSchoolYear}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Grade Level</Text>
							<Text style={styles.value}>{data.schoolInfo.gradeLevel}</Text>
						</View>
					</View>

					{/* Third Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Section</Text>
							<Text style={styles.value}>{data.schoolInfo.section}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.wideField]}>
							<Text style={styles.label}>Course (for TVL only)</Text>
							<Text style={styles.value}>{''}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.wideField]}>
							<Text style={styles.label}>Track and Strand</Text>
							<Text style={styles.value}>
								{`${data.schoolInfo.track} - ${data.schoolInfo.strand}`}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.table}>
					{renderTableHeaders()}

					{data.maleStudents.map((student, index) => renderTableRow(student))}
					{renderGenderRow(data.totalMale, '<=== TOTAL MALE')}

					{data.femaleStudents.map((student, index) => renderTableRow(student))}
					{renderGenderRow(data.totalFemale, '<=== TOTAL FEMALE')}

					{renderGenderRow(data.grandTotal, '<=== COMBINED')}
				</View>

				<View style={styles.bottomContainer}>
					{/* Legend section */}
					<View style={styles.legendOuterContainer}>{renderLegend()}</View>

					{/* Register and Signature section */}
					<View style={styles.summarySection}>
						{renderRegisterAndSignature()}
					</View>

					<Text style={styles.generatedText}>
						Generated on: Thursday, February 23, 2023
					</Text>
				</View>
			</Page>
		</Document>
	);
};

// First, let's create an interface for SF2 data
interface SF2Data {
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

// Create the SF2 PDF Document Component
const SF2Document = ({
	data,
	selectedSchoolYear,
	selectedMonth,
}: {
	data: StudentResponse;
	selectedSchoolYear: string;
	selectedMonth: string;
}) => {
	// Define dimensions for landscape orientation - match SF1 dimensions
	const PAGE_HEIGHT = 1684.8; // 16.5 inches
	const PAGE_WIDTH = 1188; // 23.4 inches

	// Define months array within the component
	const months = [
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
	];

	// Get the number of days in the selected month
	const getNumberOfDays = (month: string, year: string) => {
		const monthIndex = months.indexOf(month);
		const yearNumber = parseInt(year.split('-')[0]);
		return new Date(yearNumber, monthIndex + 1, 0).getDate();
	};

	const daysInMonth = getNumberOfDays(selectedMonth, selectedSchoolYear);

	// Organize the attendance data for easy lookup
	const [attendanceMap, setAttendanceMap] = useState<{
		[key: string]: { [key: string]: string };
	}>({});

	useEffect(() => {
		// This function will fetch attendance data for the selected month
		const fetchAttendanceData = async () => {
			try {
				// Extract month and year for filtering
				const monthIndex = months.indexOf(selectedMonth);
				const [startYear, endYear] = selectedSchoolYear.split('-');

				// Determine which year to use based on the month
				// If month is January to March, use the end year (2025 for 2024-2025)
				// If month is April to December, use the start year (2024 for 2024-2025)
				const yearToUse =
					monthIndex <= 2 ? parseInt(endYear) : parseInt(startYear);

				// Prepare date range for the selected month
				const startDate = new Date(yearToUse, monthIndex, 1);
				const endDate = new Date(yearToUse, monthIndex + 1, 0);

				console.log('School Year Calculation:', {
					selectedSchoolYear,
					startYear,
					endYear,
					monthIndex,
					monthName: selectedMonth,
					yearUsed: yearToUse,
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
				});

				// Format dates for API query
				const start = startDate.toISOString().split('T')[0];
				const end = endDate.toISOString().split('T')[0];

				// Create student IDs string for the API
				const studentIds = [...data.maleStudents, ...data.femaleStudents]
					.map((student) => student.id)
					.join(',');

				// Fetch attendance data from API
				const response = await fetch(
					`/api/attendance?start=${start}&end=${end}&students=${studentIds}&semester=${data.schoolInfo.semester}`
				);

				if (!response.ok) {
					throw new Error('Failed to fetch attendance data');
				}

				const attendanceData = await response.json();

				// Log detailed attendance information
				console.log('Attendance Records Details:');
				attendanceData.forEach((record: any, index: number) => {
					const student = [...data.maleStudents, ...data.femaleStudents].find(
						(s) => s.id === record.studentId
					);
					console.log(`Record ${index + 1}:`, {
						date: new Date(record.date).toLocaleDateString(),
						status: record.status,
						studentName: student
							? `${student.surname}, ${student.name}`
							: 'Unknown Student',
						studentId: record.studentId,
					});
				});

				// Process attendance data into a lookup map
				const map: { [key: string]: { [key: string]: string } } = {};

				attendanceData.forEach((record: any) => {
					if (!map[record.studentId]) {
						map[record.studentId] = {};
					}

					const date = new Date(record.date);
					const day = date.getDate();

					let statusCode;
					switch (record.status) {
						case '1': // Present
							statusCode = '';
							break;
						case '0': // Absent
							statusCode = 'X';
							break;
						case 'H': // Holiday
							statusCode = 'H';
							break;
						case 'E': // Excused
							statusCode = 'E';
							break;
						default:
							statusCode = 'X';
					}

					map[record.studentId][day] = statusCode;
				});

				console.log('Processed attendance map:', map);
				setAttendanceMap(map);
			} catch (error) {
				console.error('Error fetching attendance data:', error);
			}
		};

		fetchAttendanceData();
	}, [selectedMonth, selectedSchoolYear, data]);

	// Add console.log to getAttendanceForDay function
	const getAttendanceForDay = (student: StudentData, day: number) => {
		console.log('Getting attendance for:', {
			studentId: student.id,
			studentName: `${student.surname}, ${student.name}`,
			day,
			hasData: attendanceMap && attendanceMap[student.id] ? 'yes' : 'no',
			status:
				attendanceMap && attendanceMap[student.id]
					? attendanceMap[student.id][day]
					: 'not found',
		});

		// Check if we have attendance data for this student and day
		if (
			attendanceMap &&
			attendanceMap[student.id] &&
			attendanceMap[student.id][day] !== undefined
		) {
			return attendanceMap[student.id][day];
		}

		// Return 'X' for absent as default (when no entry exists)
		return 'X';
	};

	// Calculate total present/absent days for a student
	const calculateMonthTotals = (student: StudentData) => {
		// This will be calculated based on attendance records
		let present = 0;
		let absent = 0;

		// Calculate for all days in the month
		for (let day = 1; day <= daysInMonth; day++) {
			const status = getAttendanceForDay(student, day);

			// Count as present if status is blank (present) or E (excused)
			if (status === '' || status === 'E') {
				present++;
			}
			// Count as absent if status is X (absent)
			else if (status === 'X') {
				absent++;
			}
			// Holidays (H) are not counted in either present or absent
		}

		return { present, absent };
	};

	// Calculate per-day attendance totals for a gender group
	const calculateDayTotals = (students: StudentData[], day: number) => {
		let presentCount = 0;

		students.forEach((student) => {
			const status = getAttendanceForDay(student, day);
			if (status === '' || status === 'E') {
				presentCount++;
			}
		});

		return presentCount;
	};

	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			backgroundColor: '#FFFFFF',
			padding: 30,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			pageOrientation: 'landscape',
		},
		headerContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 30,
		},
		logoContainer: {
			width: 80,
			height: 80,
		},
		titleContainer: {
			flex: 1,
			marginHorizontal: 40,
		},
		formTitle: {
			fontSize: 24,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		infoGrid: {
			marginTop: 10,
		},
		row: {
			flexDirection: 'row',
			marginBottom: 10,
			alignItems: 'center',
		},
		fieldContainer: {
			flexDirection: 'column',
			marginRight: 15,
		},
		label: {
			fontSize: 8,
			marginBottom: 2,
		},
		value: {
			fontSize: 8,
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			paddingBottom: 1,
			paddingTop: 1,
			minWidth: 100,
		},
		schoolNameField: {
			flex: 2.5,
		},
		regularField: {
			flex: 1,
		},
		wideField: {
			flex: 2,
		},
		// Attendance table styles
		table: {
			width: '100%',
			display: 'flex',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRightWidth: 0,
			borderBottomWidth: 0,
			marginTop: 20,
		},
		tableRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
		},
		tableHeaderRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			backgroundColor: '#f0f0f0',
		},
		tableCell: {
			padding: 2,
			fontSize: 6,
			borderRightWidth: 1,
			borderRightColor: '#000000',
			textAlign: 'center',
			minHeight: 20,
			justifyContent: 'center',
		},
		tableHeaderCell: {
			padding: 2,
			fontSize: 6,
			fontWeight: 'bold',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			textAlign: 'center',
			backgroundColor: '#f0f0f0',
			minHeight: 20,
			justifyContent: 'center',
		},
		noCell: {
			width: '2%',
			textAlign: 'center',
		},
		nameCell: {
			width: '20%',
			textAlign: 'left',
		},
		dayCell: {
			width: '1.5%',
			textAlign: 'center',
		},
		totalCell: {
			width: '3%',
			textAlign: 'center',
		},
		remarksCell: {
			width: '15%',
			textAlign: 'left',
		},
		genderHeaderRow: {
			backgroundColor: '#e0e0e0',
			fontWeight: 'bold',
		},
		totalRow: {
			backgroundColor: '#e0e0e0',
			fontWeight: 'bold',
		},
		mainHeader: {
			fontSize: 8,
			fontWeight: 'bold',
			padding: 3,
			textAlign: 'center',
			borderRightWidth: 1,
			borderRightColor: '#000000',
		},
		subHeader: {
			fontSize: 7,
			padding: 2,
			textAlign: 'center',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			borderTopWidth: 1,
			borderTopColor: '#000000',
		},
		remarksHeader: {
			width: '15%',
			fontSize: 6,
			textAlign: 'center',
			borderRightWidth: 1,
			borderRightColor: '#000000',
		},
	});

	// Helper function to render day columns in the header
	const renderDayColumns = () => {
		const columns = [];
		// Show all days 1-31 in the month
		for (let day = 1; day <= 31; day++) {
			columns.push(
				<Text
					key={`day-${day}`}
					style={[styles.tableHeaderCell, styles.dayCell]}>
					{day}
				</Text>
			);
		}
		return columns;
	};

	// Render a student row
	const renderStudentRow = (student: StudentData, index: number) => {
		// Get attendance totals
		const totals = calculateMonthTotals(student);

		return (
			<View key={student.id} style={styles.tableRow}>
				<Text style={[styles.tableCell, styles.noCell]}>{index + 1}.</Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`${student.surname.toUpperCase()}, ${student.name.toUpperCase()} ${
						student.middleName ? student.middleName.toUpperCase() : ''
					}`}
				</Text>

				{/* Render cells for days 1-31 */}
				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
					<Text
						key={`student-${student.id}-day-${day}`}
						style={[styles.tableCell, styles.dayCell]}>
						{day <= daysInMonth ? getAttendanceForDay(student, day) : ''}
					</Text>
				))}

				{/* Total for the Month */}
				<Text style={[styles.tableCell, styles.totalCell]}>
					{totals.absent}
				</Text>
				<Text style={[styles.tableCell, styles.totalCell]}>
					{totals.present}
				</Text>

				{/* Remarks */}
				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
			</View>
		);
	};

	// Render gender total row
	const renderGenderTotalRow = (
		students: StudentData[],
		genderLabel: string
	) => {
		// Calculate total present/absent for the month
		let totalPresent = 0;
		let totalAbsent = 0;

		students.forEach((student) => {
			const totals = calculateMonthTotals(student);
			totalPresent += totals.present;
			totalAbsent += totals.absent;
		});

		return (
			<View style={[styles.tableRow, styles.totalRow]}>
				<Text style={[styles.tableCell, styles.noCell]}></Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`<--- ${genderLabel} | TOTAL Per Day --->`}
				</Text>

				{/* Total cells for days 1-31 */}
				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
					<Text
						key={`total-${genderLabel.toLowerCase()}-day-${day}`}
						style={[styles.tableCell, styles.dayCell]}>
						{day <= daysInMonth ? calculateDayTotals(students, day) : ''}
					</Text>
				))}

				{/* Month Totals */}
				<Text style={[styles.tableCell, styles.totalCell]}>{totalAbsent}</Text>
				<Text style={[styles.tableCell, styles.totalCell]}>{totalPresent}</Text>

				{/* Remarks */}
				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
			</View>
		);
	};

	// Render combined total row
	const renderCombinedTotalRow = () => {
		// Calculate combined present/absent for all students
		let totalPresent = 0;
		let totalAbsent = 0;

		// Process all students (both male and female)
		const allStudents = [...data.maleStudents, ...data.femaleStudents];
		allStudents.forEach((student) => {
			const totals = calculateMonthTotals(student);
			totalPresent += totals.present;
			totalAbsent += totals.absent;
		});

		return (
			<View style={[styles.tableRow, styles.totalRow]}>
				<Text style={[styles.tableCell, styles.noCell]}>{data.grandTotal}</Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					Combined TOTAL Per Day
				</Text>

				{/* Total cells for days 1-31 */}
				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
					const maleTotal = calculateDayTotals(data.maleStudents, day);
					const femaleTotal = calculateDayTotals(data.femaleStudents, day);
					return (
						<Text
							key={`combined-total-day-${day}`}
							style={[styles.tableCell, styles.dayCell]}>
							{day <= daysInMonth ? maleTotal + femaleTotal : ''}
						</Text>
					);
				})}

				{/* Month Totals */}
				<Text style={[styles.tableCell, styles.totalCell]}>{totalAbsent}</Text>
				<Text style={[styles.tableCell, styles.totalCell]}>{totalPresent}</Text>

				{/* Remarks */}
				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
			</View>
		);
	};

	// Add a legend section
	const renderLegend = () => (
		<View
			style={{
				marginTop: 20,
				borderWidth: 1,
				borderColor: '#000',
				padding: 10,
				width: '50%',
			}}>
			<Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>
				LEGEND:
			</Text>
			<View style={{ flexDirection: 'row' }}>
				<View style={{ marginRight: 20 }}>
					<Text style={{ fontSize: 8 }}>(blank) - Present</Text>
					<Text style={{ fontSize: 8 }}>X - Absent</Text>
				</View>
				<View>
					<Text style={{ fontSize: 8 }}>H - Holiday</Text>
					<Text style={{ fontSize: 8 }}>E - Excused</Text>
				</View>
			</View>
		</View>
	);

	return (
		<Document>
			<Page size={[PAGE_HEIGHT, PAGE_WIDTH]} style={styles.page}>
				{/* Header with Logos */}
				<View style={styles.headerContainer}>
					<Image style={styles.logoContainer} src="/DrJuanLogo.png" />
					<View style={styles.titleContainer}>
						<Text style={styles.formTitle}>
							School Form 2 Daily Attendance Report of Learners For Senior High
							School (SF2-SHS)
						</Text>
					</View>
					<Image style={styles.logoContainer} src="/deped.png" />
				</View>

				{/* School Information Grid */}
				<View style={styles.infoGrid}>
					{/* First Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.schoolNameField]}>
							<Text style={styles.label}>School Name</Text>
							<Text style={styles.value}>{data.schoolInfo.name}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>School ID</Text>
							<Text style={styles.value}>{data.schoolInfo.schoolId}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>District</Text>
							<Text style={styles.value}>{data.schoolInfo.district}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Division</Text>
							<Text style={styles.value}>{data.schoolInfo.division}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Region</Text>
							<Text style={styles.value}>{data.schoolInfo.region}</Text>
						</View>
					</View>

					{/* Second Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Semester</Text>
							<Text style={styles.value}>{data.schoolInfo.semester}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>School Year</Text>
							<Text style={styles.value}>{selectedSchoolYear}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Grade Level</Text>
							<Text style={styles.value}>{data.schoolInfo.gradeLevel}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Track and Strand</Text>
							<Text style={styles.value}>
								{`${data.schoolInfo.track} - ${data.schoolInfo.strand}`}
							</Text>
						</View>
					</View>

					{/* Third Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Section</Text>
							<Text style={styles.value}>{data.schoolInfo.section}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.wideField]}>
							<Text style={styles.label}>Course (for TVL only)</Text>
							<Text style={styles.value}>{''}</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Month of</Text>
							<Text style={styles.value}>{selectedMonth}</Text>
						</View>
					</View>
				</View>

				{/* Attendance Table */}
				<View style={styles.table}>
					{/* Table Headers */}
					<View style={styles.tableHeaderRow}>
						{/* No. column */}
						<Text style={[styles.tableHeaderCell, styles.noCell]}>No.</Text>

						{/* Name column */}
						<Text style={[styles.tableHeaderCell, styles.nameCell]}>
							NAME{'\n'}(Last Name, First Name, Middle Name)
						</Text>

						{/* Day columns - showing days 1-31 */}
						{renderDayColumns()}

						{/* Total for the Month columns */}
						<View
							style={[
								{
									width: '6%',
									borderRightWidth: 1,
									borderRightColor: '#000000',
								},
							]}>
							<Text
								style={[
									styles.mainHeader,
									{ borderBottomWidth: 1, borderBottomColor: '#000000' },
								]}>
								Total for the Month
							</Text>
							<View style={{ flexDirection: 'row' }}>
								<Text style={[styles.subHeader, { width: '50%' }]}>ABSENT</Text>
								<Text style={[styles.subHeader, { width: '50%' }]}>
									PRESENT
								</Text>
							</View>
						</View>

						{/* Remarks column */}
						<Text style={[styles.remarksHeader]}>
							REMARKS (If &lt; 5 days present, please refer to legend numbers.
							If TRANSFERRED-OUT/IN/DROPPED, write the name of School)
						</Text>
					</View>

					{/* Male Students */}
					{data.maleStudents.map((student, index) =>
						renderStudentRow(student, index)
					)}

					{/* Male Total */}
					{renderGenderTotalRow(data.maleStudents, 'MALE')}

					{/* Female Students */}
					{data.femaleStudents.map((student, index) =>
						renderStudentRow(student, index)
					)}

					{/* Female Total */}
					{renderGenderTotalRow(data.femaleStudents, 'FEMALE')}

					{/* Combined Total */}
					{renderCombinedTotalRow()}
				</View>

				{/* Legend */}
				{renderLegend()}
			</Page>
		</Document>
	);
};

// Main Page Component
const PdfExportPage = () => {
	const [data, setData] = useState<StudentResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedStrand, setSelectedStrand] = useState<string>('');
	const [selectedClass, setSelectedClass] = useState<string>('');
	const [selectedSchoolYear, setSelectedSchoolYear] =
		useState<string>('2023-2024');
	const [selectedForm, setSelectedForm] = useState<FormType>(FormType.SF1);
	const [selectedMonth, setSelectedMonth] = useState<string>(
		new Date().toLocaleString('default', { month: 'long' }).toUpperCase()
	);

	// Generate school year options (current year ± 5 years)
	const generateSchoolYearOptions = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let i = -5; i <= 5; i++) {
			const startYear = currentYear + i;
			const endYear = startYear + 1;
			years.push(`${startYear}-${endYear}`);
		}
		return years;
	};

	const schoolYearOptions = generateSchoolYearOptions();

	const fetchData = async (strandId?: string, classId?: string) => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (strandId) params.append('strandId', strandId);
			if (classId) params.append('classId', classId);
			params.append('schoolYear', selectedSchoolYear);

			const response = await fetch(`/api/students?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to fetch students');
			}
			const responseData = await response.json();
			setData(responseData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [selectedSchoolYear]); // Add selectedSchoolYear to dependency array

	const handleStrandChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const newStrandId = e.target.value;
		setSelectedStrand(newStrandId);
		setSelectedClass(''); // Reset class selection
		await fetchData(newStrandId);
	};

	const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newClassId = e.target.value;
		setSelectedClass(newClassId);
		await fetchData(selectedStrand, newClassId);
	};

	const handleSchoolYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSchoolYear(e.target.value);
	};

	// Add validation for form completion
	const isFormComplete = selectedStrand && selectedClass && selectedSchoolYear;

	// Add the months array
	const months = [
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
	];

	if (loading) {
		return <div>Loading students data...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!data) {
		return <div>No data available</div>;
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">School Forms Export</h1>

			<div className="mb-6 flex gap-4">
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Form Type
					</label>
					<select
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
						value={selectedForm}
						onChange={(e) => setSelectedForm(e.target.value as FormType)}>
						<option value={FormType.SF1}>
							School Form 1 (SF1-SHS) - School Register
						</option>
						<option value={FormType.SF2}>
							School Form 2 (SF2-SHS) - Daily Attendance
						</option>
						<option value={FormType.SF5}>
							School Form 5 (SF5-SHS) - Report on Promotion
						</option>
						<option value={FormType.SF9}>
							School Form 9 (SF9-SHS) - Report Card
						</option>
						<option value={FormType.SF10}>
							School Form 10 (SF10-SHS) - Permanent Record
						</option>
					</select>
				</div>

				{(selectedForm === FormType.SF1 || selectedForm === FormType.SF2) && (
					<>
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								School Year
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedSchoolYear}
								onChange={handleSchoolYearChange}>
								<option value="">Select School Year</option>
								{schoolYearOptions.map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Strand
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedStrand}
								onChange={handleStrandChange}>
								<option value="">Select Strand</option>
								{data.strands.map((strand) => (
									<option key={strand.id} value={strand.id}>
										{strand.name}
									</option>
								))}
							</select>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Section
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedClass}
								onChange={handleClassChange}
								disabled={!selectedStrand}>
								<option value="">Select Section</option>
								{data.classes.map((cls) => (
									<option key={cls.id} value={cls.id}>
										{cls.name}
									</option>
								))}
							</select>
						</div>

						{selectedForm === FormType.SF2 && (
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Month
								</label>
								<select
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
									value={selectedMonth}
									onChange={(e) => setSelectedMonth(e.target.value)}>
									{months.map((month) => (
										<option key={month} value={month}>
											{month}
										</option>
									))}
								</select>
							</div>
						)}
					</>
				)}
			</div>

			{selectedForm === FormType.SF1 ? (
				<div
					className={`${
						!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''
					}`}>
					<PDFViewer
						width="100%"
						height="500px"
						className="mb-4"
						showToolbar={true}>
						<PDFDocument data={data} selectedSchoolYear={selectedSchoolYear} />
					</PDFViewer>

					<PDFDownloadLink
						document={
							<PDFDocument
								data={data}
								selectedSchoolYear={selectedSchoolYear}
							/>
						}
						fileName="SF1-SHS.pdf"
						className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
							!isFormComplete ? 'pointer-events-none' : ''
						}`}>
						{({ loading: pdfLoading }) =>
							pdfLoading ? 'Preparing document...' : 'Download SF1-SHS Form'
						}
					</PDFDownloadLink>
				</div>
			) : selectedForm === FormType.SF2 ? (
				<div
					className={`${
						!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''
					}`}>
					<PDFViewer
						width="100%"
						height="500px"
						className="mb-4"
						showToolbar={true}>
						<SF2Document
							data={data}
							selectedSchoolYear={selectedSchoolYear}
							selectedMonth={selectedMonth}
						/>
					</PDFViewer>
					<PDFDownloadLink
						document={
							<SF2Document
								data={data}
								selectedSchoolYear={selectedSchoolYear}
								selectedMonth={selectedMonth}
							/>
						}
						fileName={`SF2-SHS-${selectedMonth}-${selectedSchoolYear}.pdf`}
						className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
							!isFormComplete ? 'pointer-events-none' : ''
						}`}>
						{({ loading: pdfLoading }) =>
							pdfLoading ? 'Preparing document...' : 'Download SF2-SHS Form'
						}
					</PDFDownloadLink>
				</div>
			) : selectedForm === FormType.SF5 ? (
				<div className="text-center py-8 text-gray-600">
					SF5 form implementation coming soon...
				</div>
			) : selectedForm === FormType.SF9 ? (
				<div className="text-center py-8 text-gray-600">
					SF9 form implementation coming soon...
				</div>
			) : (
				<div className="text-center py-8 text-gray-600">
					SF10 form implementation coming soon...
				</div>
			)}
		</div>
	);
};

export default PdfExportPage;
