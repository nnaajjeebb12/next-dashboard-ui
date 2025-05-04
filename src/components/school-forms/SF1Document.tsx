'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import { Student as ApiStudent, StudentResponse } from './types';
import { calculateAge, getSexDisplay } from './utils';

// Define the props interface locally
interface SF1DocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
}

// Define StudentData locally based on usage in renderTableRow
interface StudentData extends ApiStudent {
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

// PDF Document Component
const SF1Document = ({ data, selectedSchoolYear }: SF1DocumentProps) => {
	// Define dimensions for landscape orientation
	const PAGE_HEIGHT = 1684.8; // 16.5 inches
	const PAGE_WIDTH = 1188; // 23.4 inches

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
			borderColor: '#000000',
			marginTop: 10,
		},
		tableRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			borderBottomStyle: 'solid',
			minHeight: 25,
			alignItems: 'center',
		},
		tableCell: {
			padding: 4,
			fontSize: 10,
			borderRightWidth: 1,
			borderRightColor: '#000000',
			borderRightStyle: 'solid',
			textAlign: 'left',
			minHeight: 25,
			justifyContent: 'center',
		},
		tableHeaderCell: {
			padding: 4,
			fontSize: 10,
			fontWeight: 'bold',
			backgroundColor: '#f0f0f0',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			borderRightStyle: 'solid',
			textAlign: 'center',
			minHeight: 25,
			justifyContent: 'center',
		},
		tableHeaderRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			borderBottomStyle: 'solid',
			backgroundColor: '#f0f0f0',
		},
		genderHeaderRow: {
			backgroundColor: '#e0e0e0',
		},
		genderRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			borderBottomStyle: 'solid',
		},
		genderCell: {
			padding: 4,
			fontSize: 10,
			borderRightWidth: 1,
			borderRightColor: '#000000',
			borderRightStyle: 'solid',
			minHeight: 25,
			justifyContent: 'center',
		},
		legendContainer: {
			marginTop: 20,
			borderWidth: 1,
			borderColor: '#000',
			padding: 10,
			width: '100%',
		},
		legendTitle: {
			fontSize: 12,
			fontWeight: 'bold',
			marginBottom: 5,
		},
		legendTable: {
			width: '100%',
			marginTop: 5,
		},
		legendRow: {
			flexDirection: 'row',
			marginBottom: 5,
		},
		legendCell: {
			fontSize: 8,
			padding: 2,
		},
		legendOuterContainer: {
			marginTop: 20,
			width: '100%',
		},
		bottomContainer: {
			marginTop: 20,
			width: '100%',
		},
		summarySection: {
			marginTop: 20,
			flexDirection: 'row',
			justifyContent: 'space-between',
		},
		registerContainer: {
			borderWidth: 1,
			borderColor: '#000',
			width: '30%',
		},
		registerRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000',
		},
		registerCell: {
			padding: 4,
			fontSize: 8,
			width: '33.33%',
			textAlign: 'center',
		},
		signatureSection: {
			width: '30%',
			alignItems: 'center',
		},
		preparedByText: {
			fontSize: 10,
			marginBottom: 30,
		},
		signatureName: {
			fontSize: 10,
			borderBottomWidth: 1,
			borderBottomColor: '#000',
			paddingBottom: 2,
			marginBottom: 2,
		},
		signatureCaption: {
			fontSize: 8,
		},
		generatedText: {
			fontSize: 8,
			marginTop: 10,
			textAlign: 'right',
			color: '#666',
		},
	});

	const columnWidths = {
		lrn: '5%',
		name: '14%',
		sex: '2%',
		birthDate: '5%',
		age: '2%',
		religion: '4%',
		purok: '4%',
		brgy: '5%',
		city: '4%',
		province: '4%',
		fatherSurname: '4%',
		fatherFirstName: '5%',
		fatherMiddleName: '6%',
		motherSurname: '5%',
		motherFirstName: '5%',
		motherMiddleName: '6%',
		guardianSurname: '5%',
		guardianFirstName: '5%',
		guardianMiddleName: '5%',
		guardianRelationship: '5%',
		guardianContact: '4%',
		learningModal: '4%',
		remarks: '4%',
	};

	const renderTableHeaders = () => (
		<View style={styles.tableHeaderRow}>
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
					{ width: columnWidths.guardianRelationship },
				]}>
				Relationship
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
				{student.sex ? getSexDisplay(student.sex) : ''}
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
			<Text
				style={[
					styles.tableCell,
					{ width: columnWidths.guardianRelationship },
				]}>
				{''}
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
		<View style={[styles.tableRow, styles.genderHeaderRow]}>
			<Text style={[styles.tableCell, { width: '19%' }]}>
				{`${count} ${label}`}
			</Text>
			<Text style={[styles.tableCell, { width: '81%' }]}></Text>
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

	const renderRegisterAndSignature = () => (
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
						{(data as any).totalMale}
					</Text>
					<Text style={styles.registerCell}>{(data as any).totalMale}</Text>
				</View>
				<View style={styles.registerRow}>
					<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
						FEMALE
					</Text>
					<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
						{(data as any).totalFemale}
					</Text>
					<Text style={styles.registerCell}>{(data as any).totalFemale}</Text>
				</View>
				<View style={[styles.registerRow, { borderBottomWidth: 0 }]}>
					<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
						TOTAL
					</Text>
					<Text style={[styles.registerCell, { borderRightWidth: 1 }]}>
						{(data as any).grandTotal}
					</Text>
					<Text style={styles.registerCell}>{(data as any).grandTotal}</Text>
				</View>
			</View>

			<View style={styles.signatureSection}>
				<Text style={styles.preparedByText}>Prepared by:</Text>
				<Text style={styles.signatureName}>
					{(data.schoolInfo as any).supervisorName || 'NO ASSIGNED SUPERVISOR'}
				</Text>
				<Text style={styles.signatureCaption}>
					(Signature of Adviser over Printed Name)
				</Text>
			</View>
		</>
	);

	// Add console logs for debugging

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
							<Text style={styles.value}>{`Grade ${
								data.class?.grade?.level || ''
							}`}</Text>
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

					{(data.maleStudents ?? []).map(
						(student: StudentData, index: number) => renderTableRow(student)
					)}
					{renderGenderRow((data as any).totalMale ?? 0, '<=== TOTAL MALE')}

					{(data.femaleStudents ?? []).map(
						(student: StudentData, index: number) => renderTableRow(student)
					)}
					{renderGenderRow((data as any).totalFemale ?? 0, '<=== TOTAL FEMALE')}

					{renderGenderRow((data as any).grandTotal ?? 0, '<=== COMBINED')}
				</View>

				<View style={styles.bottomContainer}>
					{/* Legend section */}
					<View style={styles.legendOuterContainer}>{renderLegend()}</View>

					{/* Register and Signature section */}
					<View style={styles.summarySection}>
						{renderRegisterAndSignature()}
					</View>

					<Text style={styles.generatedText}>
						Generated on: {new Date().toLocaleDateString()}
					</Text>
				</View>
			</Page>
		</Document>
	);
};

export default SF1Document;
