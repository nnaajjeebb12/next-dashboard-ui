'use client';

import SF10Document from '@/components/school-forms/SF10Document';
import SF1Document from '@/components/school-forms/SF1Document';
import SF2Document from '@/components/school-forms/SF2Document';
import SF5Document from '@/components/school-forms/SF5Document';
import SF9Document from '@/components/school-forms/SF9Document';
import {
	Student as ApiStudent,
	FormType,
	StudentResponse,
} from '@/components/school-forms/types';
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
import EligibilityForm, { EligibilityFormData } from './EligibilityForm';

// Add OBSERVED_VALUES constant
const OBSERVED_VALUES = [
	{
		core: '1. Maka-Diyos',
		behaviors: [
			"Expresses one's spiritual beliefs while respecting the spiritual beliefs of others",
			'Shows adherence to ethical principles by upholding truth in all undertakings',
		],
	},
	{
		core: '2. Makatao',
		behaviors: [
			'Is sensitive to individual social and cultural differences; resists stereotyping people',
			'Demonstrates contributions toward solidarity',
		],
	},
	{
		core: '3. Makakalikasen',
		behaviors: [
			'Cares for the environment and utilizes resources wisely, judiciously and economically',
		],
	},
	{
		core: '4. Makabansa',
		behaviors: [
			'Demonstrates pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen',
			'Demonstrates appropriate behavior in carrying out activities in the school, community and country',
		],
	},
];

// Define types for student data
interface ExtendedStudent extends ApiStudent {
	birthday?: string;
	sex?: 'MALE' | 'FEMALE';
	religion?: string | null;
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
}

type StudentData = ExtendedStudent;

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

// Add new types for observed values
interface ObservedValue {
	coreValue: string;
	behavior: string;
	quarters: {
		q1: string;
		q2: string;
		q3: string;
		q4: string;
	};
}

interface ObservedValuesFormProps {
	onSubmit: (values: ObservedValue[]) => void;
	isDisabled: boolean;
}

const OBSERVED_VALUES_OPTIONS = ['AO', 'SO', 'RO', 'NO'];

const ObservedValuesForm: React.FC<ObservedValuesFormProps> = ({
	onSubmit,
	isDisabled,
}) => {
	const [observedValues, setObservedValues] = useState<ObservedValue[]>([]);

	useEffect(() => {
		// Initialize the form with default values
		const initialValues = OBSERVED_VALUES.flatMap((value) =>
			value.behaviors.map((behavior) => ({
				coreValue: value.core,
				behavior,
				quarters: {
					q1: 'SO',
					q2: 'SO',
					q3: 'SO',
					q4: 'SO',
				},
			}))
		);
		setObservedValues(initialValues);
	}, []);

	const handleQuarterChange = (
		valueIndex: number,
		quarter: 'q1' | 'q2' | 'q3' | 'q4',
		newValue: string
	) => {
		const newValues = [...observedValues];
		newValues[valueIndex].quarters[quarter] = newValue;
		setObservedValues(newValues);
	};

	const handleSubmit = () => {
		onSubmit(observedValues);
	};

	return (
		<div className="mb-6">
			<h2 className="text-xl font-bold mb-4">Observed Values Form</h2>
			<div className="border rounded-lg p-4 bg-white">
				<table className="w-full">
					<thead>
						<tr className="bg-gray-100">
							<th className="px-4 py-2 text-left">Core Values</th>
							<th className="px-4 py-2 text-left">Behavior Statements</th>
							<th className="px-4 py-2 text-center">Q1</th>
							<th className="px-4 py-2 text-center">Q2</th>
							<th className="px-4 py-2 text-center">Q3</th>
							<th className="px-4 py-2 text-center">Q4</th>
						</tr>
					</thead>
					<tbody>
						{observedValues.map((value, index) => (
							<tr key={index} className="border-t">
								<td className="px-4 py-2">{value.coreValue}</td>
								<td className="px-4 py-2 text-blue-600">{value.behavior}</td>
								{['q1', 'q2', 'q3', 'q4'].map((quarter) => (
									<td key={quarter} className="px-4 py-2 text-center">
										<select
											value={
												value.quarters[quarter as keyof typeof value.quarters]
											}
											onChange={(e) =>
												handleQuarterChange(
													index,
													quarter as 'q1' | 'q2' | 'q3' | 'q4',
													e.target.value
												)
											}
											disabled={isDisabled}
											className="border rounded p-1 w-20">
											{OBSERVED_VALUES_OPTIONS.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
				{!isDisabled && (
					<div className="mt-4 flex justify-end">
						<button
							onClick={handleSubmit}
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
							Update Values
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

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

	const renderTableRow = (student: ExtendedStudent) => (
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
				{student.sex || ''}
			</Text>
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.birthDate, textAlign: 'center' },
				]}>
				{student.birthday
					? new Date(student.birthday).toLocaleDateString()
					: ''}
			</Text>
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.age, textAlign: 'center' },
				]}>
				{student.birthday ? calculateAge(new Date(student.birthday)) : ''}
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
		// Add // console.log for debugging
		// console.log('SchoolInfo:', data.schoolInfo);
		// console.log('Supervisor Name:', data.schoolInfo.supervisorName);

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
							{(data as any)?.totalMale ?? 0}
						</Text>
						<Text style={styles.registerCell}>
							{(data as any)?.totalMale ?? 0}
						</Text>
					</View>
					<View style={styles.registerRow}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							FEMALE
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							{(data as any)?.totalFemale ?? 0}
						</Text>
						<Text style={styles.registerCell}>
							{(data as any)?.totalFemale ?? 0}
						</Text>
					</View>
					<View style={[styles.registerRow, { borderBottomWidth: 0 }]}>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							TOTAL
						</Text>
						<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
							{(data as any)?.grandTotal ?? 0}
						</Text>
						<Text style={styles.registerCell}>
							{(data as any)?.grandTotal ?? 0}
						</Text>
					</View>
				</View>

				<View style={styles.signatureSection}>
					<Text style={styles.preparedByText}>Prepared by:</Text>
					<Text style={styles.signatureName}>
						{(data.schoolInfo as any)?.supervisorName ||
							'NO ASSIGNED SUPERVISOR'}
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
							<Text style={styles.value}>
								{(data.schoolInfo as any)?.district}
							</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Division</Text>
							<Text style={styles.value}>
								{(data.schoolInfo as any)?.division}
							</Text>
						</View>
						<View style={[styles.fieldContainer, styles.regularField]}>
							<Text style={styles.label}>Region</Text>
							<Text style={styles.value}>
								{(data.schoolInfo as any)?.region}
							</Text>
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
							<Text style={styles.value}>
								{(data.schoolInfo as any)?.gradeLevel}
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
						<View style={[styles.fieldContainer, styles.wideField]}>
							<Text style={styles.label}>Track and Strand</Text>
							<Text style={styles.value}>
								{`${(data.schoolInfo as any)?.track} - ${
									data.schoolInfo.strand
								}`}
							</Text>
						</View>
					</View>
				</View>

				<View style={styles.table}>
					{renderTableHeaders()}

					{(data as any)?.maleStudents?.map((student: any, index: any) =>
						renderTableRow(student)
					)}
					{renderGenderRow((data as any)?.totalMale ?? 0, '<=== TOTAL MALE')}

					{(data as any)?.femaleStudents?.map((student: any, index: any) =>
						renderTableRow(student)
					)}
					{renderGenderRow(
						(data as any)?.totalFemale ?? 0,
						'<=== TOTAL FEMALE'
					)}

					{renderGenderRow((data as any)?.grandTotal ?? 0, '<=== COMBINED')}
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

// Add the eligibility form data type to the existing data state
interface ExtendedStudentResponse extends StudentResponse {
	eligibilityData?: EligibilityFormData;
	student?: StudentData;
	class?: {
		id: number;
		name: string;
		supervisor?: { name: string; surname: string };
		grade?: { level: number };
	};
	grades?: any;
}

const defaultEligibilityData: EligibilityFormData = {
	isHighSchoolCompleter: false,
	genAve: '',
	isJHSCompleter: false,
	jhsGenAve: '',
	dateOfGraduation: '',
	isPEPTCompleter: false,
	peptRating: '',
	isALSCompleter: false,
	alsRating: '',
	isOthersCompleter: false,
	othersSpecify: '',
};

// Main Page Component
const PdfExportPage = () => {
	const [data, setData] = useState<ExtendedStudentResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedStrand, setSelectedStrand] = useState<string>('');
	const [selectedClass, setSelectedClass] = useState<string>('');
	const [selectedStudent, setSelectedStudent] = useState<string>('');
	const [selectedSchoolYear, setSelectedSchoolYear] =
		useState<string>('2023-2024');
	const [selectedForm, setSelectedForm] = useState<FormType>(FormType.SF1);
	const [selectedMonth, setSelectedMonth] = useState<(typeof MONTHS)[number]>(
		MONTHS[0]
	);
	const [selectedSemester, setSelectedSemester] = useState<
		'1st Semester' | '2nd Semester'
	>('1st Semester');
	const [showPdf, setShowPdf] = useState(false);
	const [observedValues, setObservedValues] = useState<ObservedValue[]>([]);
	const [eligibilityData, setEligibilityData] = useState<EligibilityFormData>(
		defaultEligibilityData
	);

	// Handle eligibility form changes
	const handleEligibilityChange = (updates: Partial<EligibilityFormData>) => {
		setEligibilityData((prev) => ({ ...prev, ...updates }));
		// Update the main data state with eligibility information
		setData((prev) =>
			prev
				? {
						...prev,
						eligibilityData: {
							...(prev.eligibilityData || defaultEligibilityData),
							...updates,
						},
				  }
				: null
		);
	};

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

	// Fetch initial data (like strands) or data for non-SF9 forms
	useEffect(() => {
		// Fetch data whenever school year, semester (for SF5), or form type changes
		fetchData();
	}, [selectedSchoolYear, selectedSemester, selectedForm]);

	const fetchData = async (
		strandId?: string,
		classId?: string,
		studentId?: string
	) => {
		try {
			setLoading(true);
			console.log('Fetching data with params:', {
				strandId,
				classId,
				studentId,
				selectedForm,
				selectedSchoolYear,
			});

			const params = new URLSearchParams();
			params.append('schoolYear', selectedSchoolYear);

			let apiUrl = '/api/students';

			if (selectedForm === FormType.SF5) {
				apiUrl = '/api/sf5';
				params.append('semester', selectedSemester);
				if (strandId) params.append('strandId', strandId);
				if (classId) params.append('classId', classId);
			} else if (selectedForm === FormType.SF9) {
				apiUrl = '/api/sf9';
				if (strandId) params.append('strandId', strandId);
				if (studentId) {
					params.append('studentId', studentId);
					const response = await fetch(`${apiUrl}?${params.toString()}`);
					if (!response.ok) {
						throw new Error(`Failed to fetch data from ${apiUrl}`);
					}
					const studentData = await response.json();
					console.log('Received student data:', studentData);

					setData((prevData) => {
						if (!prevData) return studentData;
						return {
							...studentData,
							strands: prevData.strands || [],
							classes: prevData.classes || [],
							students: prevData.students || [],
						};
					});
					setLoading(false);
					return;
				}
			} else if (selectedForm === FormType.SF10) {
				apiUrl = '/api/sf10';
				if (strandId) params.append('strandId', strandId);
				if (classId) params.append('classId', classId);
				if (studentId) {
					params.append('studentId', studentId);
					console.log(
						'Fetching SF10 data with URL:',
						`${apiUrl}?${params.toString()}`
					);
					const response = await fetch(`${apiUrl}?${params.toString()}`);
					if (!response.ok) {
						throw new Error(`Failed to fetch data from ${apiUrl}`);
					}
					const studentData = await response.json();
					console.log('Received SF10 student data:', studentData);

					setData((prevData) => {
						if (!prevData) return studentData;
						return {
							...prevData,
							...studentData,
							// Preserve dropdown data
							strands: prevData.strands || [],
							classes: prevData.classes || [],
							students: prevData.students || [],
							// Update specific student details
							student: studentData.student,
							schoolInfo: studentData.schoolInfo,
							class: studentData.class,
							grades: studentData.grades,
							eligibilityData: prevData.eligibilityData,
						};
					});
					setLoading(false);
					return;
				}
			} else {
				if (strandId) params.append('strandId', strandId);
				if (classId) params.append('classId', classId);
				params.append('semester', selectedSemester);
			}

			const response = await fetch(`${apiUrl}?${params.toString()}`);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('API Error Response:', errorText);
				throw new Error(`Failed to fetch data from ${apiUrl}`);
			}

			const responseData = await response.json();
			console.log('Received general data:', responseData);

			setData((prevData) => {
				const newData = {
					...prevData,
					...responseData,
					strands: responseData.strands || prevData?.strands || [],
					classes: responseData.classes || prevData?.classes || [],
					students: responseData.students || prevData?.students || [],
					...(selectedForm === FormType.SF10 && {
						student: prevData?.student,
						schoolInfo: prevData?.schoolInfo,
						class: prevData?.class,
						grades: prevData?.grades,
						eligibilityData: prevData?.eligibilityData,
					}),
				};
				console.log('Updated general data state:', newData);
				return newData;
			});
		} catch (err) {
			console.error('Error fetching data:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newForm = e.target.value as FormType;
		setSelectedForm(newForm);
		setData(null); // Reset data
		setError(null);
		setSelectedStrand('');
		setSelectedClass('');
		setSelectedStudent('');
		// Keep selectedSchoolYear or reset? Let's keep it for now.
		// setSelectedSchoolYear('2023-2024');
		setSelectedMonth(MONTHS[0]);
		setSelectedSemester('1st Semester');
		// useEffect will trigger fetchData
	};

	const handleStrandChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const newStrandId = e.target.value;
		console.log('Strand change - Previous values:', {
			strand: selectedStrand,
			class: selectedClass,
			student: selectedStudent,
		});
		setSelectedStrand(newStrandId);
		// Don't reset class and student selections
		if (newStrandId) {
			console.log('Fetching data for new strand:', newStrandId);
			await fetchData(newStrandId, selectedClass, selectedStudent);
		}
		console.log('Strand change - New values:', {
			strand: newStrandId,
			class: selectedClass,
			student: selectedStudent,
		});
	};

	const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newClassId = e.target.value;
		console.log('Class change - Previous values:', {
			strand: selectedStrand,
			class: selectedClass,
			student: selectedStudent,
		});
		setSelectedClass(newClassId);
		// Don't reset student selection
		if (newClassId && selectedStrand) {
			console.log('Fetching data for new class:', newClassId);
			await fetchData(selectedStrand, newClassId, selectedStudent);
		}
		console.log('Class change - New values:', {
			strand: selectedStrand,
			class: newClassId,
			student: selectedStudent,
		});
	};

	const handleSchoolYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSchoolYear(e.target.value);
		// Reset selections below school year
		setSelectedStrand('');
		setSelectedClass('');
		setSelectedStudent('');
		setSelectedSemester('1st Semester');
		setData(null); // Clear previous data
		setError(null);
		// useEffect will handle fetching initial data (strands) for the new year
	};

	const handleStudentChange = async (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const newStudentId = e.target.value;
		console.log('Student change - Previous values:', {
			strand: selectedStrand,
			class: selectedClass,
			student: selectedStudent,
		});
		setSelectedStudent(newStudentId);

		// Clear previous student data when selection changes
		if (selectedForm === FormType.SF10 || selectedForm === FormType.SF9) {
			setData((prevData) => {
				if (!prevData) return null;
				return {
					...prevData,
					student: undefined,
					grades: undefined,
					// Preserve other required fields
					schoolInfo: prevData.schoolInfo,
					strands: prevData.strands || [],
					classes: prevData.classes || [],
					students: prevData.students || [],
				};
			});
		}

		if (
			(selectedForm === FormType.SF9 || selectedForm === FormType.SF10) &&
			newStudentId &&
			selectedStrand
		) {
			console.log('Fetching data for new student:', newStudentId);
			await fetchData(selectedStrand, selectedClass, newStudentId);
		}

		console.log('Student change - New values:', {
			strand: selectedStrand,
			class: selectedClass,
			student: newStudentId,
		});
	};

	// Update validation for form completion
	const isFormComplete =
		selectedForm === FormType.SF9
			? selectedStrand && selectedStudent && selectedSchoolYear
			: selectedForm === FormType.SF10
			? selectedStrand && selectedClass && selectedStudent && selectedSchoolYear
			: selectedStrand && selectedClass && selectedSchoolYear;

	const handleObservedValuesSubmit = (values: ObservedValue[]) => {
		setObservedValues(values);
		setShowPdf(true);
	};

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
		// console.log('Rendering form:', {
		// 	selectedForm,
		// 	data,
		// 	selectedSchoolYear,
		// 	selectedMonth,
		// 	selectedSemester,
		// 	isFormComplete,
		// });

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
			selectedSemester,
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
					<SF9Document
						data={{
							...data,
							observedValues: observedValues,
						}}
						selectedSchoolYear={selectedSchoolYear}
					/>
				);
			case FormType.SF10:
				console.log('Rendering SF10 Document with data:', {
					fullData: data,
					student: data.student,
					class: data.class,
					supervisor: data.class?.supervisor,
					schoolInfo: data.schoolInfo,
				});
				return <SF10Document data={data} eligibilityData={eligibilityData} />;
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

				{(selectedForm === FormType.SF1 ||
					selectedForm === FormType.SF2 ||
					selectedForm === FormType.SF5) && (
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

						{selectedForm === FormType.SF5 && (
							<div className="flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Semester
								</label>
								<select
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
									value={selectedSemester}
									onChange={(e) => {
										setSelectedSemester(
											e.target.value as '1st Semester' | '2nd Semester'
										);
										setSelectedStrand('');
										setSelectedClass('');
									}}>
									<option value="1st Semester">1st Semester</option>
									<option value="2nd Semester">2nd Semester</option>
								</select>
							</div>
						)}

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Strand
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedStrand}
								onChange={handleStrandChange}>
								<option value="">Select Strand</option>
								{((data as any)?.strands ?? []).map((strand: any) => (
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
								{((data as any)?.classes ?? []).map(
									(cls: { id: number; name: string }) => (
										<option key={cls.id} value={cls.id}>
											{cls.name}
										</option>
									)
								)}
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
									onChange={(e) => {
										const value = e.target.value;
										if (MONTHS.includes(value as any)) {
											setSelectedMonth(value as (typeof MONTHS)[number]);
										}
									}}>
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

				{selectedForm === FormType.SF9 && (
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
								{((data as any)?.strands ?? []).map((strand: any) => (
									<option key={strand.id} value={strand.id}>
										{strand.name}
									</option>
								))}
							</select>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Student
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedStudent}
								onChange={handleStudentChange}
								disabled={!selectedStrand}>
								<option value="">Select Student</option>
								{(data as any)?.students?.map((student: ExtendedStudent) => (
									<option key={student.id} value={student.id}>
										{`${student.surname}, ${student.name} ${
											student.middleName || ''
										}`}
									</option>
								))}
							</select>
						</div>
					</>
				)}

				{selectedForm === FormType.SF10 && (
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
								{((data as any)?.strands ?? []).map((strand: any) => (
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
								{((data as any)?.classes ?? []).map(
									(cls: { id: number; name: string }) => (
										<option key={cls.id} value={cls.id}>
											{cls.name}
										</option>
									)
								)}
							</select>
						</div>

						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Student
							</label>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								value={selectedStudent}
								onChange={handleStudentChange}
								disabled={!selectedClass}>
								<option value="">Select Student</option>
								{(data as any)?.students?.map((student: ExtendedStudent) => (
									<option key={student.id} value={student.id}>
										{`${student.surname}, ${student.name} ${
											student.middleName || ''
										}`}
									</option>
								))}
							</select>
						</div>
					</>
				)}
			</div>

			{/* Show observed values form only for SF9 */}
			{selectedForm === FormType.SF9 && data && isFormComplete && !showPdf && (
				<ObservedValuesForm
					onSubmit={handleObservedValuesSubmit}
					isDisabled={false}
				/>
			)}

			{/* Show eligibility form for SF10 */}
			{selectedForm === FormType.SF10 && data && (
				<div className="mb-6">
					<EligibilityForm
						data={eligibilityData}
						onChange={handleEligibilityChange}
					/>
				</div>
			)}

			{/* Show PDF viewer for all forms */}
			{((selectedForm === FormType.SF9 && showPdf) ||
				(selectedForm !== FormType.SF9 && data && isFormComplete)) && (
				<>
					{selectedForm === FormType.SF9 && (
						<>
							<ObservedValuesForm
								onSubmit={handleObservedValuesSubmit}
								isDisabled={true}
							/>
							<button
								onClick={() => setShowPdf(false)}
								className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
								Edit Values
							</button>
						</>
					)}
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
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
						{({ loading: pdfLoading }) =>
							pdfLoading
								? 'Preparing document...'
								: `Download ${selectedForm} Form`
						}
					</PDFDownloadLink>
				</>
			)}

			{(!data ||
				!isFormComplete ||
				(selectedForm === FormType.SF9 && !showPdf)) && (
				<div className="text-center py-8 text-gray-500">
					{selectedForm === FormType.SF9 && isFormComplete
						? 'Please fill out the observed values form to view and download the PDF.'
						: 'Please select all required fields to view and download the form.'}
				</div>
			)}
		</div>
	);
};

export default PdfExportPage;
