'use client';

import SF10Document from '@/components/school-forms/SF10Document';
import SF1Document from '@/components/school-forms/SF1Document';
import SF2Document from '@/components/school-forms/SF2Document';
import SF5Document from '@/components/school-forms/SF5Document';
import SF9Document from '@/components/school-forms/SF9Document';
import { FormType, StudentResponse } from '@/components/school-forms/types';
import { MONTHS } from '@/components/school-forms/utils';
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
	const [selectedMonth, setSelectedMonth] = useState<(typeof MONTHS)[number]>(
		MONTHS[0]
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
	}, [selectedSchoolYear]);

	const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newForm = e.target.value as FormType;
		setSelectedForm(newForm);
		// Reset all other selectors when form changes
		setSelectedStrand('');
		setSelectedClass('');
		setSelectedSchoolYear('2023-2024');
		setSelectedMonth(MONTHS[0]);
	};

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
		setSelectedStrand(''); // Reset strand selection
		setSelectedClass(''); // Reset class selection
	};

	// Add validation for form completion
	const isFormComplete = selectedStrand && selectedClass && selectedSchoolYear;

	if (loading) {
		return <div>Loading students data...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!data) {
		return <div>No data available</div>;
	}

	const renderForm = () => {
		// Add console logs for debugging
		console.log('Rendering form:', {
			selectedForm,
			data,
			selectedSchoolYear,
			selectedMonth,
			isFormComplete,
		});

		// Return an empty document if data is not ready
		if (!data || !isFormComplete) {
			return (
				<Document>
					<Page size="A4">
						<View>
							<Text>Please select all required fields to view the form.</Text>
						</View>
					</Page>
				</Document>
			);
		}

		const props = {
			data,
			selectedSchoolYear,
			selectedMonth,
		};

		switch (selectedForm) {
			case FormType.SF1:
				return (
					<SF1Document data={data} selectedSchoolYear={selectedSchoolYear} />
				);
			case FormType.SF2:
				return <SF2Document {...props} />;
			case FormType.SF5:
				return (
					<SF5Document data={data} selectedSchoolYear={selectedSchoolYear} />
				);
			case FormType.SF9:
				return (
					<SF9Document data={data} selectedSchoolYear={selectedSchoolYear} />
				);
			case FormType.SF10:
				return (
					<SF10Document data={data} selectedSchoolYear={selectedSchoolYear} />
				);
			default:
				return (
					<Document>
						<Page size="A4">
							<View>
								<Text>Please select a valid form type.</Text>
							</View>
						</Page>
					</Document>
				);
		}
	};

	const getFormFileName = () => {
		switch (selectedForm) {
			case FormType.SF1:
				return 'SF1-SHS.pdf';
			case FormType.SF2:
				return `SF2-SHS-${selectedMonth}-${selectedSchoolYear}.pdf`;
			case FormType.SF5:
				return 'SF5-SHS.pdf';
			case FormType.SF9:
				return 'SF9-SHS.pdf';
			case FormType.SF10:
				return 'SF10-SHS.pdf';
		}
	};

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
						onChange={handleFormChange}>
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
									onChange={(e) =>
										setSelectedMonth(e.target.value as (typeof MONTHS)[number])
									}>
									{MONTHS.map((month) => (
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

			<div
				className={`${!isFormComplete ? 'opacity-50 cursor-not-allowed' : ''}`}>
				{data && isFormComplete && (
					<>
						<PDFViewer
							width="100%"
							height="500px"
							className="mb-4"
							showToolbar={true}>
							{renderForm()}
						</PDFViewer>

						<PDFDownloadLink
							document={renderForm()}
							fileName={getFormFileName()}
							className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
								!isFormComplete ? 'pointer-events-none' : ''
							}`}>
							{({ loading: pdfLoading }) =>
								pdfLoading
									? 'Preparing document...'
									: `Download ${selectedForm} Form`
							}
						</PDFDownloadLink>
					</>
				)}
				{(!data || !isFormComplete) && (
					<div className="text-center py-8 text-gray-500">
						Please select all required fields to view and download the form.
					</div>
				)}
			</div>
		</div>
	);
};

export default PdfExportPage;
