'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import React from 'react';
import { StudentResponse, SubjectGrades } from './types';

// Add ObservedValue interface
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

const styles = StyleSheet.create({
	page: {
		flexDirection: 'row',
		backgroundColor: '#ffffff',
		padding: 20,
		fontFamily: 'Helvetica',
	},
	leftSection: {
		width: '50%',
		paddingRight: 15,
	},
	rightSection: {
		width: '50%',
		paddingLeft: 15,
	},
	attendanceHeader: {
		fontSize: 11,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		marginTop: 5,
	},
	attendanceTable: {
		border: '1px solid black',
		marginBottom: 20,
	},
	tableRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
	},
	firstColumnCell: {
		width: '20%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'left',
	},
	monthCell: {
		width: '6.67%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	totalCell: {
		width: '7%',
		padding: 5,
		fontSize: 8,
		textAlign: 'center',
	},
	signatureSection: {
		marginTop: 20,
		marginBottom: 20,
	},
	signatureHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	signatureRow: {
		flexDirection: 'row',
		marginBottom: 8,
	},
	signatureLabel: {
		width: '20%',
		fontSize: 8,
	},
	signatureLine: {
		width: '100%',
		borderBottom: '1px solid black',
		marginBottom: 2,
	},
	certificateSection: {
		marginTop: 20,
	},
	certificateTitle: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	certificateRow: {
		flexDirection: 'row',
		marginBottom: 7,
	},
	certificateLabel: {
		width: '40%',
		fontSize: 8,
	},
	certificateValue: {
		flex: 1,
		borderBottom: '1px solid black',
		height: 10,
	},
	approvedRow: {
		flexDirection: 'row',
		marginTop: 15,
		justifyContent: 'space-between',
	},
	signatureBlock: {
		width: '45%',
		alignItems: 'center',
	},
	signatureName: {
		fontSize: 8,
		marginTop: 2,
		fontStyle: 'italic',
		textAlign: 'center',
	},
	cancelSection: {
		marginTop: 30,
	},
	lrnContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginBottom: 15,
	},
	lrnLabel: {
		fontSize: 9,
		marginRight: 5,
		alignSelf: 'center',
	},
	lrnBoxContainer: {
		flexDirection: 'row',
	},
	lrnBox: {
		width: 15,
		height: 15,
		border: '1px solid black',
		marginRight: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	lrnDigit: {
		fontSize: 8,
	},
	formCode: {
		position: 'absolute',
		top: 10,
		right: 10,
		fontSize: 8,
	},
	logo: {
		width: 50,
		height: 50,
		alignSelf: 'center',
		marginBottom: 5,
	},
	schoolHeaderContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	republicText: {
		fontSize: 10,
	},
	departmentText: {
		fontSize: 10,
		fontWeight: 'bold',
	},
	regionText: {
		fontSize: 10,
		marginTop: 5,
		fontStyle: 'italic',
	},
	divisionText: {
		fontSize: 10,
		fontWeight: 'bold',
		textDecoration: 'underline',
	},
	divisionLabel: {
		fontSize: 8,
		fontStyle: 'italic',
	},
	schoolText: {
		fontSize: 10,
		fontWeight: 'bold',
		marginTop: 5,
	},
	schoolLabel: {
		fontSize: 8,
		fontStyle: 'italic',
	},
	studentInfoContainer: {
		marginTop: 15,
	},
	studentInfoRow: {
		flexDirection: 'row',
		marginBottom: 8,
		alignItems: 'flex-end',
	},
	infoLabel: {
		fontSize: 9,
		width: 60,
	},
	infoColonText: {
		fontSize: 9,
		marginRight: 5,
	},
	infoValue: {
		fontSize: 9,
		flex: 1,
		borderBottom: '1px solid black',
		paddingBottom: 1,
		fontWeight: 'bold',
	},
	infoSecondLabel: {
		fontSize: 9,
		width: 30,
		marginLeft: 5,
	},
	gradeLabel: {
		fontSize: 9,
		width: 60,
	},
	gradeValue: {
		fontSize: 9,
		width: '30%',
		borderBottom: '1px solid black',
		paddingBottom: 1,
		fontWeight: 'bold',
	},
	sectionLabel: {
		fontSize: 9,
		width: 40,
		marginLeft: 10,
	},
	sectionValue: {
		fontSize: 9,
		flex: 1,
		borderBottom: '1px solid black',
		paddingBottom: 1,
		fontWeight: 'bold',
	},
	messageContainer: {
		marginTop: 20,
		fontSize: 9,
		fontStyle: 'italic',
		lineHeight: 1.5,
	},
	signaturesRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		position: 'absolute',
		bottom: 25,
		left: 0,
		right: 0,
		paddingHorizontal: 20,
	},
	adviserContainer: {
		alignItems: 'center',
		width: '40%',
	},
	adviserName: {
		fontSize: 10,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	adviserUnderline: {
		width: '100%',
		borderBottom: '1px solid black',
		marginBottom: 2,
	},
	adviserTitle: {
		fontSize: 8,
		fontStyle: 'italic',
	},
	principalContainer: {
		alignItems: 'center',
		width: '40%',
	},
	principalLine: {
		width: '100%',
		borderBottom: '1px solid black',
		marginBottom: 2,
	},
	principalTitle: {
		fontSize: 8,
		fontStyle: 'italic',
	},
	curriculumValue: {
		fontSize: 9,
		flex: 1,
		borderBottom: '1px solid black',
		paddingBottom: 1,
		fontWeight: 'bold',
	},
});

const MONTHS = [
	'Jun',
	'Jul',
	'Aug',
	'Sept',
	'Oct',
	'Nov',
	'Dec',
	'Jan',
	'Feb',
	'Mar',
	'Apr',
];

// Month name to index mapping for easier lookup
const MONTH_INDEX_MAP = {
	Jun: 5,
	Jul: 6,
	Aug: 7,
	Sept: 8,
	Oct: 9,
	Nov: 10,
	Dec: 11,
	Jan: 0,
	Feb: 1,
	Mar: 2,
	Apr: 3,
};

// Define fixed values for school days matching the provided image
const FIXED_SCHOOL_DAYS = {
	Jun: 20,
	Jul: 23,
	Aug: 22,
	Sept: 21,
	Oct: 23,
	Nov: 21,
	Dec: 22,
	Jan: 23,
	Feb: 20,
	Mar: 21,
	Apr: 22,
};

const FIXED_TOTAL_SCHOOL_DAYS = 238;

// Define the type for the monthly attendance data from the API
interface MonthlyAttendance {
	month: number;
	year?: number;
	name: string;
	schoolDays: number;
	daysPresent: number;
	daysAbsent: number;
}

// Define the type for the attendance data from the API
interface AttendanceData {
	monthly: MonthlyAttendance[];
	totals: {
		schoolDays: number;
		daysPresent: number;
		daysAbsent: number;
	};
}

// Update the Props interface to include the attendance data
interface Props {
	data: StudentResponse & {
		attendance?: AttendanceData;
		observedValues?: ObservedValue[];
	};
	selectedSchoolYear: string;
}

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

const OBSERVED_VALUES_LEGEND = [
	{ marking: 'AO', rating: 'Always Observed' },
	{ marking: 'SO', rating: 'Sometimes Observed' },
	{ marking: 'RO', rating: 'Rarely Observed' },
	{ marking: 'NO', rating: 'Not Observed' },
];

const GRADING_SCALE = [
	{ descriptor: 'Outstanding', scale: '90-100', remarks: 'Passed' },
	{ descriptor: 'Very Satisfactory', scale: '85-89', remarks: 'Passed' },
	{ descriptor: 'Satisfactory', scale: '80-84', remarks: 'Passed' },
	{ descriptor: 'Fairly Satisfactory', scale: '75-79', remarks: 'Passed' },
	{
		descriptor: 'Did Not Meet Expectation',
		scale: 'Below 75',
		remarks: 'Failed',
	},
];

// Add additional page styles
const page2Styles = StyleSheet.create({
	observedValuesHeader: {
		fontSize: 11,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		marginTop: 5,
	},
	valueTable: {
		marginTop: 8,
		border: '1px solid black',
	},
	valueTableHeader: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
		backgroundColor: '#e0e0e0',
	},
	coreValueCell: {
		width: '20%',
		padding: 3,
		fontSize: 7,
		borderRight: '1px solid black',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	behaviorCell: {
		width: '55%',
		padding: 3,
		fontSize: 7,
		borderRight: '1px solid black',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	quarterHeaderContainer: {
		width: '25%',
		borderLeft: '1px solid black',
	},
	quarterHeader: {
		flexDirection: 'row',
		borderTop: '1px solid black',
	},
	quarterHeaderText: {
		fontSize: 7,
		textAlign: 'center',
		fontWeight: 'bold',
		padding: 3,
		flex: 1,
		borderRight: '1px solid black',
	},
	quarterLabelText: {
		fontSize: 7,
		textAlign: 'center',
		fontWeight: 'bold',
		padding: 3,
		borderBottom: '1px solid black',
	},
	valueTableRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
		minHeight: 16,
	},
	coreValueRowCell: {
		width: '20%',
		padding: 3,
		fontSize: 7,
		borderRight: '1px solid black',
		textAlign: 'left',
	},
	behaviorRowCell: {
		width: '55%',
		padding: 3,
		fontSize: 7,
		borderRight: '1px solid black',
		textAlign: 'left',
	},
	quarterGradeCell: {
		width: '6.25%',
		padding: 3,
		fontSize: 7,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	legendTable: {
		border: '1px solid black',
		marginTop: 10,
		marginBottom: 20,
	},
	legendHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 5,
		marginTop: 10,
	},
	legendRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
	},
	legendCell: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	gradingScaleTable: {
		border: '1px solid black',
		marginTop: 10,
	},
	gradingScaleHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 5,
		marginTop: 10,
	},
	gradingRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
	},
	descriptorCell: {
		width: '40%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	scaleCell: {
		width: '30%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	remarksCell: {
		width: '30%',
		padding: 5,
		fontSize: 8,
		textAlign: 'center',
	},
	// Left page styles for learner progress report card
	reportCardHeader: {
		fontSize: 11,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		marginTop: 5,
	},
	semesterHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginTop: 5,
		marginBottom: 5,
	},
	subjectsTable: {
		border: '1px solid black',
		marginBottom: 15,
	},
	subjectHeaderRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
		backgroundColor: '#e0e0e0',
	},
	subjectColumn: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	quarterColumn: {
		width: '35%',
		borderRight: '1px solid black',
	},
	quarterColumnsContainer: {
		flexDirection: 'row',
	},
	quarterColumnCell: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	finalGradeColumn: {
		width: '15%',
		padding: 5,
		fontSize: 8,
		textAlign: 'center',
		fontWeight: 'bold',
	},
	subjectCategoryRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
		backgroundColor: '#f0f0f0',
	},
	subjectCategoryCell: {
		padding: 5,
		fontSize: 8,
		fontWeight: 'bold',
		textAlign: 'left',
		flex: 1,
	},
	subjectRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
	},
	subjectNameCell: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'left',
	},
	quarterGradesContainer: {
		width: '35%',
		flexDirection: 'row',
		borderRight: '1px solid black',
	},
	quarterGrade: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'center',
	},
	finalGradeCell: {
		width: '15%',
		padding: 5,
		fontSize: 8,
		textAlign: 'center',
	},
	generalAverageRow: {
		flexDirection: 'row',
		borderBottom: '1px solid black',
		backgroundColor: '#f0f0f0',
	},
	generalAverageLabel: {
		width: '50%',
		padding: 5,
		fontSize: 8,
		borderRight: '1px solid black',
		textAlign: 'right',
		fontWeight: 'bold',
	},
});

const SF9Document = ({ data, selectedSchoolYear }: Props) => {
	const renderLRN = () => {
		const lrnDigits = data.studentInfo?.lrn?.split('') || Array(12).fill('');
		return (
			<View style={styles.lrnContainer}>
				<Text style={styles.lrnLabel}>LRN</Text>
				<View style={styles.lrnBoxContainer}>
					{lrnDigits.map((digit, index) => (
						<View key={index} style={styles.lrnBox}>
							<Text style={styles.lrnDigit}>{digit || ''}</Text>
						</View>
					))}
				</View>
			</View>
		);
	};

	const renderAttendanceTable = () => {
		// Use actual attendance data from the API if available
		return (
			<View style={styles.attendanceTable}>
				<View style={styles.tableRow}>
					<View style={styles.firstColumnCell}>
						<Text></Text>
					</View>
					{MONTHS.map((month) => (
						<View key={month} style={styles.monthCell}>
							<Text>{month}</Text>
						</View>
					))}
					<View style={styles.totalCell}>
						<Text>Total</Text>
					</View>
				</View>

				{[
					'No. of School Days',
					'No. of Days Present',
					'No. of Days Absent',
				].map((rowLabel, rowIndex) => (
					<View key={rowIndex} style={styles.tableRow}>
						<View style={styles.firstColumnCell}>
							<Text>{rowLabel}</Text>
						</View>
						{MONTHS.map((month) => {
							// Get the month index from our mapping
							const monthIndex =
								MONTH_INDEX_MAP[month as keyof typeof MONTH_INDEX_MAP];

							// Find the month data in the attendance data by month index
							const monthData = data.attendance?.monthly?.find(
								(m) => m.month === monthIndex
							);

							// If we have actual data, use it; otherwise use defaults
							let value = 0;

							if (monthData) {
								if (rowIndex === 0) {
									value = monthData.schoolDays;
								} else if (rowIndex === 1) {
									value = monthData.daysPresent || 0;
								} else if (rowIndex === 2) {
									value = monthData.daysAbsent || 0;
								}
							} else {
								// Fallback to fixed values ONLY if no data for the month exists
								if (rowIndex === 0) {
									value =
										FIXED_SCHOOL_DAYS[month as keyof typeof FIXED_SCHOOL_DAYS];
								}
								// For present/absent, default is 0 if no data
							}

							return (
								<View key={month} style={styles.monthCell}>
									<Text>{value}</Text>
								</View>
							);
						})}
						<View style={styles.totalCell}>
							{rowIndex === 0 ? (
								<Text>
									{data.attendance?.totals?.schoolDays ||
										FIXED_TOTAL_SCHOOL_DAYS}
								</Text>
							) : rowIndex === 1 ? (
								<Text>{data.attendance?.totals?.daysPresent || 0}</Text>
							) : (
								<Text>{data.attendance?.totals?.daysAbsent || 0}</Text>
							)}
						</View>
					</View>
				))}
			</View>
		);
	};

	const renderSignatureSection = () => {
		return (
			<View style={styles.signatureSection}>
				<Text style={styles.signatureHeader}>
					PARENT'S / GUARDIAN'S SIGNATURE
				</Text>
				{['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'].map(
					(quarter, index) => (
						<View key={index} style={styles.signatureRow}>
							<Text style={styles.signatureLabel}>{quarter}</Text>
							<View style={styles.signatureLine} />
						</View>
					)
				)}
			</View>
		);
	};

	const renderCertificateSection = () => {
		return (
			<View style={styles.certificateSection}>
				<Text style={styles.certificateTitle}>Certificate of Transfer</Text>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>Admitted to Grade:</Text>
					<View style={styles.certificateValue} />
				</View>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>Section:</Text>
					<View style={styles.certificateValue} />
				</View>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>
						Eligibility for Admission to Grade:
					</Text>
					<View style={styles.certificateValue} />
				</View>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>Approved:</Text>
				</View>
				<View style={styles.approvedRow}>
					<View style={styles.signatureBlock}>
						<View style={styles.signatureLine} />
						<Text style={styles.signatureName}>School Head</Text>
					</View>
					<View style={styles.signatureBlock}>
						<View style={styles.signatureLine} />
						<Text style={styles.signatureName}>Adviser</Text>
					</View>
				</View>
			</View>
		);
	};

	const renderCancellationSection = () => {
		return (
			<View style={styles.cancelSection}>
				<Text style={styles.certificateTitle}>
					Cancellation of Eligibility to Transfer
				</Text>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>Admitted in:</Text>
					<View style={styles.certificateValue} />
				</View>
				<View style={styles.certificateRow}>
					<Text style={styles.certificateLabel}>Date:</Text>
					<View style={styles.certificateValue} />
				</View>
				<View style={styles.approvedRow}>
					<View style={styles.signatureBlock} />
					<View style={styles.signatureBlock}>
						<View style={styles.signatureLine} />
						<Text style={styles.signatureName}>School Head</Text>
					</View>
				</View>
			</View>
		);
	};

	const renderObservedValuesTable = () => {
		return (
			<View style={page2Styles.valueTable}>
				{/* Header Row */}
				<View style={page2Styles.valueTableHeader}>
					<View style={page2Styles.coreValueCell}>
						<Text>Core Values</Text>
					</View>
					<View style={page2Styles.behaviorCell}>
						<Text>Behavior Statements</Text>
					</View>
					<View style={page2Styles.quarterHeaderContainer}>
						<View style={page2Styles.quarterLabelText}>
							<Text>Quarter</Text>
						</View>
						<View style={page2Styles.quarterHeader}>
							<Text style={page2Styles.quarterHeaderText}>1</Text>
							<Text style={page2Styles.quarterHeaderText}>2</Text>
							<Text style={page2Styles.quarterHeaderText}>3</Text>
							<Text
								style={[
									page2Styles.quarterHeaderText,
									{ borderRight: 'none' },
								]}>
								4
							</Text>
						</View>
					</View>
				</View>

				{/* Value Rows */}
				{OBSERVED_VALUES.map((value, valueIndex) => {
					const totalBehaviors = value.behaviors.length;

					return (
						<React.Fragment key={valueIndex}>
							{value.behaviors.map((behavior, behaviorIndex) => {
								// Find the corresponding observed value from the form data
								const observedValue = data.observedValues?.find(
									(ov) =>
										ov.coreValue === value.core && ov.behavior === behavior
								);

								return (
									<View
										key={`${valueIndex}-${behaviorIndex}`}
										style={page2Styles.valueTableRow}>
										<View style={page2Styles.coreValueRowCell}>
											{/* Only show core value for first behavior */}
											<Text>{behaviorIndex === 0 ? value.core : ''}</Text>
										</View>
										<View style={page2Styles.behaviorRowCell}>
											<Text style={{ color: '#0000FF' }}>{behavior}</Text>
										</View>
										<View style={page2Styles.quarterGradeCell}>
											<Text>{observedValue?.quarters.q1 || 'SO'}</Text>
										</View>
										<View style={page2Styles.quarterGradeCell}>
											<Text>{observedValue?.quarters.q2 || 'SO'}</Text>
										</View>
										<View style={page2Styles.quarterGradeCell}>
											<Text>{observedValue?.quarters.q3 || 'SO'}</Text>
										</View>
										<View
											style={[
												page2Styles.quarterGradeCell,
												{ borderRight: 'none' },
											]}>
											<Text>{observedValue?.quarters.q4 || 'SO'}</Text>
										</View>
									</View>
								);
							})}
						</React.Fragment>
					);
				})}
			</View>
		);
	};

	const renderObservedValuesLegend = () => {
		return (
			<>
				<Text style={page2Styles.legendHeader}>Observed Values</Text>
				<View style={page2Styles.legendTable}>
					<View style={page2Styles.legendRow}>
						<View style={page2Styles.legendCell}>
							<Text style={{ fontWeight: 'bold' }}>Marking</Text>
						</View>
						<View style={[page2Styles.legendCell, { borderRight: 'none' }]}>
							<Text style={{ fontWeight: 'bold' }}>Non-numerical Rating</Text>
						</View>
					</View>
					{OBSERVED_VALUES_LEGEND.map((item, index) => (
						<View
							key={index}
							style={[
								page2Styles.legendRow,
								index === OBSERVED_VALUES_LEGEND.length - 1
									? { borderBottom: 'none' }
									: {},
							]}>
							<View style={page2Styles.legendCell}>
								<Text>{item.marking}</Text>
							</View>
							<View style={[page2Styles.legendCell, { borderRight: 'none' }]}>
								<Text>{item.rating}</Text>
							</View>
						</View>
					))}
				</View>
			</>
		);
	};

	const renderGradingScale = () => {
		return (
			<>
				<Text style={page2Styles.gradingScaleHeader}>
					Learner Progress and Achievement
				</Text>
				<View style={page2Styles.gradingScaleTable}>
					<View style={page2Styles.gradingRow}>
						<View style={page2Styles.descriptorCell}>
							<Text style={{ fontWeight: 'bold' }}>Descriptors</Text>
						</View>
						<View style={page2Styles.scaleCell}>
							<Text style={{ fontWeight: 'bold' }}>Grading Scale</Text>
						</View>
						<View style={page2Styles.remarksCell}>
							<Text style={{ fontWeight: 'bold' }}>Remarks</Text>
						</View>
					</View>
					{GRADING_SCALE.map((item, index) => (
						<View
							key={index}
							style={[
								page2Styles.gradingRow,
								index === GRADING_SCALE.length - 1
									? { borderBottom: 'none' }
									: {},
							]}>
							<View style={page2Styles.descriptorCell}>
								<Text>{item.descriptor}</Text>
							</View>
							<View style={page2Styles.scaleCell}>
								<Text>{item.scale}</Text>
							</View>
							<View style={page2Styles.remarksCell}>
								<Text>{item.remarks}</Text>
							</View>
						</View>
					))}
				</View>
			</>
		);
	};

	const renderReportCard = () => {
		return (
			<>
				<Text style={page2Styles.reportCardHeader}>
					LEARNER'S PROGRESS REPORT CARD
				</Text>

				{/* First Semester */}
				<Text style={page2Styles.semesterHeader}>First Semester</Text>
				<View style={page2Styles.subjectsTable}>
					{/* Header Row */}
					<View style={page2Styles.subjectHeaderRow}>
						<View style={page2Styles.subjectColumn}>
							<Text>Subjects</Text>
						</View>
						<View style={page2Styles.quarterColumn}>
							<Text
								style={{
									textAlign: 'center',
									fontSize: 8,
									fontWeight: 'bold',
									padding: 3,
								}}>
								Quarter
							</Text>
							<View style={page2Styles.quarterColumnsContainer}>
								<View style={page2Styles.quarterColumnCell}>
									<Text>1</Text>
								</View>
								<View
									style={[
										page2Styles.quarterColumnCell,
										{ borderRight: 'none' },
									]}>
									<Text>2</Text>
								</View>
							</View>
						</View>
						<View style={page2Styles.finalGradeColumn}>
							<Text>Semester Final Grade</Text>
						</View>
					</View>

					{/* Core Subjects */}
					<View style={page2Styles.subjectCategoryRow}>
						<View style={page2Styles.subjectCategoryCell}>
							<Text>Core Subjects</Text>
						</View>
					</View>
					{data.grades?.firstSemester?.subjects
						?.filter((subject) => subject.type === 'CORE')
						.map((subject: SubjectGrades, index: number) => (
							<View key={index} style={page2Styles.subjectRow}>
								<View style={page2Styles.subjectNameCell}>
									<Text>{subject.name}</Text>
								</View>
								<View style={page2Styles.quarterGradesContainer}>
									<View style={page2Styles.quarterGrade}>
										<Text>{subject.q1 || ''}</Text>
									</View>
									<View
										style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
										<Text>{subject.q2 || ''}</Text>
									</View>
								</View>
								<View style={page2Styles.finalGradeCell}>
									<Text>{subject.final || ''}</Text>
								</View>
							</View>
						))}

					{/* Applied and Specialized Subjects */}
					<View style={page2Styles.subjectCategoryRow}>
						<View style={page2Styles.subjectCategoryCell}>
							<Text>Applied and Specialized Subjects</Text>
						</View>
					</View>
					{data.grades?.firstSemester?.subjects
						?.filter(
							(subject) =>
								subject.type === 'APPLIED' || subject.type === 'SPECIALIZED'
						)
						.map((subject: SubjectGrades, index: number) => (
							<View key={index} style={page2Styles.subjectRow}>
								<View style={page2Styles.subjectNameCell}>
									<Text>{subject.name}</Text>
								</View>
								<View style={page2Styles.quarterGradesContainer}>
									<View style={page2Styles.quarterGrade}>
										<Text>{subject.q1 || ''}</Text>
									</View>
									<View
										style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
										<Text>{subject.q2 || ''}</Text>
									</View>
								</View>
								<View style={page2Styles.finalGradeCell}>
									<Text>{subject.final || ''}</Text>
								</View>
							</View>
						))}

					{/* General Average */}
					<View style={page2Styles.generalAverageRow}>
						<View style={page2Styles.generalAverageLabel}>
							<Text>General Average for the Semester</Text>
						</View>
						<View style={page2Styles.quarterGradesContainer}>
							<View style={page2Styles.quarterGrade}>
								<Text>{data.grades?.firstSemester?.averages.q1 || ''}</Text>
							</View>
							<View style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
								<Text>{data.grades?.firstSemester?.averages.q2 || ''}</Text>
							</View>
						</View>
						<View style={page2Styles.finalGradeCell}>
							<Text>{data.grades?.firstSemester?.averages.final || ''}</Text>
						</View>
					</View>
				</View>

				{/* Second Semester */}
				<Text style={page2Styles.semesterHeader}>Second Semester</Text>
				<View style={page2Styles.subjectsTable}>
					{/* Header Row */}
					<View style={page2Styles.subjectHeaderRow}>
						<View style={page2Styles.subjectColumn}>
							<Text>Subjects</Text>
						</View>
						<View style={page2Styles.quarterColumn}>
							<Text
								style={{
									textAlign: 'center',
									fontSize: 8,
									fontWeight: 'bold',
									padding: 5,
								}}>
								Quarter
							</Text>
							<View style={page2Styles.quarterColumnsContainer}>
								<View style={page2Styles.quarterColumnCell}>
									<Text>3</Text>
								</View>
								<View
									style={[
										page2Styles.quarterColumnCell,
										{ borderRight: 'none' },
									]}>
									<Text>4</Text>
								</View>
							</View>
						</View>
						<View style={page2Styles.finalGradeColumn}>
							<Text>Semester Final Grade</Text>
						</View>
					</View>

					{/* Core Subjects */}
					<View style={page2Styles.subjectCategoryRow}>
						<View style={page2Styles.subjectCategoryCell}>
							<Text>Core Subjects</Text>
						</View>
					</View>
					{data.grades?.secondSemester?.subjects
						?.filter((subject) => subject.type === 'CORE')
						.map((subject: SubjectGrades, index: number) => (
							<View key={index} style={page2Styles.subjectRow}>
								<View style={page2Styles.subjectNameCell}>
									<Text>{subject.name}</Text>
								</View>
								<View style={page2Styles.quarterGradesContainer}>
									<View style={page2Styles.quarterGrade}>
										<Text>{subject.q3 || ''}</Text>
									</View>
									<View
										style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
										<Text>{subject.q4 || ''}</Text>
									</View>
								</View>
								<View style={page2Styles.finalGradeCell}>
									<Text>{subject.final || ''}</Text>
								</View>
							</View>
						))}

					{/* Applied and Specialized Subjects */}
					<View style={page2Styles.subjectCategoryRow}>
						<View style={page2Styles.subjectCategoryCell}>
							<Text>Applied and Specialized Subjects</Text>
						</View>
					</View>
					{data.grades?.secondSemester?.subjects
						?.filter(
							(subject) =>
								subject.type === 'APPLIED' || subject.type === 'SPECIALIZED'
						)
						.map((subject: SubjectGrades, index: number) => (
							<View key={index} style={page2Styles.subjectRow}>
								<View style={page2Styles.subjectNameCell}>
									<Text>{subject.name}</Text>
								</View>
								<View style={page2Styles.quarterGradesContainer}>
									<View style={page2Styles.quarterGrade}>
										<Text>{subject.q3 || ''}</Text>
									</View>
									<View
										style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
										<Text>{subject.q4 || ''}</Text>
									</View>
								</View>
								<View style={page2Styles.finalGradeCell}>
									<Text>{subject.final || ''}</Text>
								</View>
							</View>
						))}

					{/* General Average */}
					<View style={page2Styles.generalAverageRow}>
						<View style={page2Styles.generalAverageLabel}>
							<Text>General Average for the Semester</Text>
						</View>
						<View style={page2Styles.quarterGradesContainer}>
							<View style={page2Styles.quarterGrade}>
								<Text>{data.grades?.secondSemester?.averages.q3 || ''}</Text>
							</View>
							<View style={[page2Styles.quarterGrade, { borderRight: 'none' }]}>
								<Text>{data.grades?.secondSemester?.averages.q4 || ''}</Text>
							</View>
						</View>
						<View style={page2Styles.finalGradeCell}>
							<Text>{data.grades?.secondSemester?.averages.final || ''}</Text>
						</View>
					</View>
				</View>
			</>
		);
	};

	return (
		<Document>
			{/* Page 1 */}
			<Page size="LETTER" orientation="landscape" style={styles.page}>
				<Text style={styles.formCode}>SF9-SHS</Text>

				<View style={styles.leftSection}>
					<Text style={styles.attendanceHeader}>REPORT ON ATTENDANCE</Text>
					{renderAttendanceTable()}
					{renderSignatureSection()}
					{renderCertificateSection()}
					{renderCancellationSection()}
				</View>

				<View style={styles.rightSection}>
					{renderLRN()}

					<View style={styles.schoolHeaderContainer}>
						<Image style={styles.logo} src="/DrJuanLogo.png" />
						<Text style={styles.republicText}>Republic of the Philippines</Text>
						<Text style={styles.departmentText}>DEPARTMENT OF EDUCATION</Text>
						<Text style={styles.regionText}>Region IV-B</Text>
						<Text style={styles.divisionText}>DIVISION OF BATANGAS</Text>
						<Text style={styles.divisionLabel}>Division</Text>
						<Text style={styles.schoolText}>
							Dr. Juan A. Pastor Integrated National High School
						</Text>
						<Text style={styles.schoolLabel}>School</Text>
					</View>

					<View style={styles.studentInfoContainer}>
						<View style={styles.studentInfoRow}>
							<Text style={styles.infoLabel}>Name</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.infoValue}>
								{data.studentInfo?.name || ''}
							</Text>
						</View>

						<View style={styles.studentInfoRow}>
							<Text style={styles.infoLabel}>Age</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.infoValue}>
								{data.studentInfo?.age || ''}
							</Text>
							<Text style={styles.infoSecondLabel}>Sex</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.infoValue}>
								{data.studentInfo?.sex || ''}
							</Text>
						</View>

						<View style={styles.studentInfoRow}>
							<Text style={styles.gradeLabel}>Grade</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.gradeValue}>
								{data.studentInfo?.grade || ''}
							</Text>
							<Text style={styles.sectionLabel}>Section</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.sectionValue}>
								{data.studentInfo?.section || ''}
							</Text>
						</View>

						<View style={styles.studentInfoRow}>
							<Text style={styles.infoLabel}>Curriculum</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.curriculumValue}>
								K to 12 Basic Education Curriculum
							</Text>
						</View>

						<View style={styles.studentInfoRow}>
							<Text style={styles.infoLabel}>School Year</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.infoValue}>{selectedSchoolYear}</Text>
						</View>

						<View style={styles.studentInfoRow}>
							<Text style={styles.infoLabel}>Track/Strand</Text>
							<Text style={styles.infoColonText}>:</Text>
							<Text style={styles.infoValue}>
								{data.studentInfo?.strand || ''}
							</Text>
						</View>
					</View>

					<View style={styles.messageContainer}>
						<Text>Dear Parent/Guardian,</Text>
						<Text style={{ marginTop: 8 }}>
							This report card shows the ability and progress your child has
							made in the different learning areas as well as his/her core
							values.
						</Text>
						<Text style={{ marginTop: 8 }}>
							The school welcomes you should you desire to know more about your
							child's progress.
						</Text>
					</View>

					<View style={styles.signaturesRow}>
						<View style={styles.principalContainer}>
							<View style={styles.principalLine} />
							<Text style={styles.principalTitle}>Principal IV</Text>
						</View>
						<View style={styles.adviserContainer}>
							<Text style={styles.adviserName}>
								{data.studentInfo?.adviser || ''}
							</Text>
							<View style={styles.adviserUnderline} />
							<Text style={styles.adviserTitle}>Adviser</Text>
						</View>
					</View>
				</View>
			</Page>

			{/* Page 2 */}
			<Page size="LETTER" orientation="landscape" style={styles.page}>
				<Text style={styles.formCode}>SF9-SHS</Text>

				<View style={styles.leftSection}>{renderReportCard()}</View>

				<View style={styles.rightSection}>
					<Text style={page2Styles.observedValuesHeader}>
						REPORT ON LEARNER'S OBSERVED VALUES
					</Text>
					{renderObservedValuesTable()}
					{renderObservedValuesLegend()}
					{renderGradingScale()}
				</View>
			</Page>
		</Document>
	);
};

export default SF9Document;
