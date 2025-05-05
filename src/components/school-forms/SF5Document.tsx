'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import { StudentResponse } from './types';

interface SF5DocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
}

const SF5Document = ({ data, selectedSchoolYear }: SF5DocumentProps) => {
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
		// Table styles
		table: {
			width: '100%',
			display: 'flex',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRightWidth: 0,
			borderBottomWidth: 0,
		},
		tableRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			minHeight: 25,
			alignItems: 'center',
		},
		tableHeaderRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			backgroundColor: '#f0f0f0',
			alignItems: 'center',
		},
		tableCell: {
			borderRightWidth: 1,
			borderRightColor: '#000000',
			padding: 4,
			fontSize: 8,
			minHeight: 20,
		},
		tableHeaderCell: {
			backgroundColor: '#f0f0f0',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			padding: 4,
			fontSize: 8,
			fontWeight: 'bold',
			textAlign: 'center',
		},
		noCell: {
			width: '5%',
			textAlign: 'center',
		},
		lrnCell: {
			width: '15%',
		},
		nameCell: {
			width: '30%',
		},
		backSubjectsCell: {
			width: '25%',
			padding: 4,
			fontSize: 8,
		},
		statusCell: {
			width: '12.5%',
			textAlign: 'center',
		},
		genderRow: {
			backgroundColor: '#f0f0f0',
		},
		genderCell: {
			flexDirection: 'row',
			borderRightWidth: 1,
			borderRightColor: '#000000',
		},
		// Summary table styles
		summaryContainer: {
			marginBottom: 10,
		},
		summaryTable: {
			width: '100%',
			borderWidth: 1,
			borderColor: '#000000',
			marginBottom: 10,
			backgroundColor: '#FFFFFF',
		},
		summaryTitle: {
			fontSize: 10,
			fontWeight: 'bold',
			textAlign: 'center',
			padding: 4,
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			backgroundColor: '#f0f0f0',
		},
		summaryRow: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
		},
		summaryHeaderCell: {
			width: '25%',
			padding: 4,
			fontSize: 8,
			fontWeight: 'bold',
			borderRightWidth: 1,
			borderRightColor: '#000000',
			backgroundColor: '#f0f0f0',
		},
		summaryCell: {
			width: '25%',
			padding: 4,
			fontSize: 8,
			borderRightWidth: 1,
			borderRightColor: '#000000',
			textAlign: 'center',
		},
		mainContainer: {
			flexDirection: 'row',
			width: '100%',
			marginTop: 20,
			justifyContent: 'space-between',
		},
		leftSection: {
			width: '65%',
		},
		rightSection: {
			width: '33%',
		},
		guidelinesContainer: {
			marginTop: 10,
			fontSize: 8,
		},
		guidelineTitle: {
			fontWeight: 'bold',
			marginBottom: 5,
		},
		guidelineText: {
			marginBottom: 3,
		},
		indicatorsContainer: {
			marginTop: 20,
			fontSize: 8,
		},
		indicatorTitle: {
			fontWeight: 'bold',
			marginBottom: 5,
		},
		indicatorText: {
			marginBottom: 3,
		},
		preparedByContainer: {
			marginTop: 30,
			fontSize: 8,
		},
		preparedByLabel: {
			marginBottom: 20,
		},
		signatureLine: {
			borderBottomWidth: 1,
			borderBottomColor: '#000000',
			width: '100%',
			marginBottom: 5,
		},
		signatureName: {
			textAlign: 'center',
			fontWeight: 'bold',
		},
		signatureTitle: {
			textAlign: 'center',
			fontSize: 7,
			fontStyle: 'italic',
		},
		// New styles for certification section
		certificationContainer: {
			marginTop: 20,
			fontSize: 8,
		},
		certificationLabel: {
			marginBottom: 10,
			fontWeight: 'bold',
		},
		signatureBlock: {
			marginTop: 15,
			marginBottom: 15,
		},
		reviewSection: {
			marginTop: 20,
		},
		reviewLabel: {
			fontWeight: 'bold',
			marginBottom: 10,
		},
		memberSignature: {
			marginTop: 15,
			marginBottom: 15,
		},
		generatedNote: {
			fontSize: 7,
			fontStyle: 'italic',
			marginTop: 5,
		},
	});

	const calculateStudentStatus = (student: any) => {
		// Use the pre-calculated values from the API
		return {
			backSubjects: student.backSubjects || [],
			semesterStatus: student.semesterStatus || 'Incomplete',
			yearStatus: student.yearStatus || 'Irregular',
		};
	};

	const renderTableHeaders = () => (
		<View style={styles.tableHeaderRow}>
			<Text style={[styles.tableHeaderCell, styles.noCell]}>NO</Text>
			<Text style={[styles.tableHeaderCell, styles.lrnCell]}>LRN</Text>
			<Text style={[styles.tableHeaderCell, styles.nameCell]}>
				LEARNER'S NAME{'\n'}(Last Name, First Name, Middle Name)
			</Text>
			<Text style={[styles.tableHeaderCell, styles.backSubjectsCell]}>
				BACK SUBJECTS{'\n'}(List Down Subjects where learner obtain a rating
				below 75%)
			</Text>
			<Text style={[styles.tableHeaderCell, styles.statusCell]}>
				END OF SEMESTER STATUS{'\n'}(Complete/Incomplete)
			</Text>
			<Text style={[styles.tableHeaderCell, styles.statusCell]}>
				END OF SCHOOL YEAR{'\n'}STATUS(Regular/Irregular)
			</Text>
		</View>
	);

	const renderStudentRow = (student: any, index: number) => {
		const status = calculateStudentStatus(student);

		return (
			<View style={styles.tableRow}>
				<Text style={[styles.tableCell, styles.noCell]}>{index + 1}</Text>
				<Text style={[styles.tableCell, styles.lrnCell]}>{student.lrn}</Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`${student.surname}, ${student.name} ${student.middleName || ''}`}
				</Text>
				<Text style={[styles.tableCell, styles.backSubjectsCell]}>
					{status.backSubjects.join('\n')}
				</Text>
				<Text style={[styles.tableCell, styles.statusCell]}>
					{status.semesterStatus}
				</Text>
				<Text style={[styles.tableCell, styles.statusCell]}>
					{status.yearStatus}
				</Text>
			</View>
		);
	};

	const calculateTotals = () => {
		const maleStatuses = (data.maleStudents ?? []).map((student) =>
			calculateStudentStatus(student)
		);
		const femaleStatuses = (data.femaleStudents ?? []).map((student) =>
			calculateStudentStatus(student)
		);

		const maleTotals = {
			complete: maleStatuses.filter(
				(status) => status.semesterStatus === 'Complete'
			).length,
			incomplete: maleStatuses.filter(
				(status) => status.semesterStatus === 'Incomplete'
			).length,
			regular: maleStatuses.filter((status) => status.yearStatus === 'Regular')
				.length,
			irregular: maleStatuses.filter(
				(status) => status.yearStatus === 'Irregular'
			).length,
			total: maleStatuses.length,
		};

		const femaleTotals = {
			complete: femaleStatuses.filter(
				(status) => status.semesterStatus === 'Complete'
			).length,
			incomplete: femaleStatuses.filter(
				(status) => status.semesterStatus === 'Incomplete'
			).length,
			regular: femaleStatuses.filter(
				(status) => status.yearStatus === 'Regular'
			).length,
			irregular: femaleStatuses.filter(
				(status) => status.yearStatus === 'Irregular'
			).length,
			total: femaleStatuses.length,
		};

		return {
			male: maleTotals,
			female: femaleTotals,
			combined: maleTotals.total + femaleTotals.total,
		};
	};

	const totals = calculateTotals();

	// Updated renderGenderRow function
	const renderGenderRow = (type: 'male' | 'female' | 'combined') => {
		let count = 0;
		let label = '';

		switch (type) {
			case 'male':
				count = totals.male.total;
				label = 'TOTAL MALE';
				break;
			case 'female':
				count = totals.female.total;
				label = 'TOTAL FEMALE';
				break;
			case 'combined':
				count = totals.combined;
				label = 'COMBINED';
				break;
		}

		return (
			<View style={[styles.tableRow, styles.genderRow]}>
				<Text style={[styles.tableCell, styles.noCell]}>{count}</Text>
				<Text
					style={[styles.tableCell, { width: '95%' }]}>{`<=== ${label}`}</Text>
			</View>
		);
	};

	const calculateSummaryData = () => {
		const maleStatuses = (data.maleStudents ?? []).map((student) =>
			calculateStudentStatus(student)
		);
		const femaleStatuses = (data.femaleStudents ?? []).map((student) =>
			calculateStudentStatus(student)
		);

		const countByStatus = (
			statuses: any[],
			statusType: 'semesterStatus' | 'yearStatus',
			value: string
		) => {
			const count = statuses.filter(
				(status) => status[statusType] === value
			).length;
			return count;
		};

		const semesterSummary = {
			complete: {
				male: countByStatus(maleStatuses, 'semesterStatus', 'Complete'),
				female: countByStatus(femaleStatuses, 'semesterStatus', 'Complete'),
			},
			incomplete: {
				male: countByStatus(maleStatuses, 'semesterStatus', 'Incomplete'),
				female: countByStatus(femaleStatuses, 'semesterStatus', 'Incomplete'),
			},
		};

		const yearSummary = {
			regular: {
				male: countByStatus(maleStatuses, 'yearStatus', 'Regular'),
				female: countByStatus(femaleStatuses, 'yearStatus', 'Regular'),
			},
			irregular: {
				male: countByStatus(maleStatuses, 'yearStatus', 'Irregular'),
				female: countByStatus(femaleStatuses, 'yearStatus', 'Irregular'),
			},
		};

		return {
			semesterSummary,
			yearSummary,
		};
	};

	const summaryData = calculateSummaryData();

	// Updated renderSummaryTable function
	const renderSummaryTable = (title: string, summaryData: any) => {
		const renderSummaryRow = (label: string, male: number, female: number) => {
			const total = male + female;
			return (
				<View style={styles.summaryRow}>
					<Text style={[styles.summaryCell, { textAlign: 'left' }]}>
						{label}
					</Text>
					<Text style={styles.summaryCell}>{male}</Text>
					<Text style={styles.summaryCell}>{female}</Text>
					<Text style={styles.summaryCell}>{total}</Text>
				</View>
			);
		};

		const renderTotalRow = (data: any) => {
			const maleTotalCount = title.includes('End of School Year')
				? data.regular.male + data.irregular.male
				: data.complete.male + data.incomplete.male;
			const femaleTotalCount = title.includes('End of School Year')
				? data.regular.female + data.irregular.female
				: data.complete.female + data.incomplete.female;

			return renderSummaryRow('TOTAL', maleTotalCount, femaleTotalCount);
		};

		return (
			<View style={styles.summaryTable}>
				<Text style={styles.summaryTitle}>{title}</Text>
				<View style={styles.summaryRow}>
					<Text style={styles.summaryHeaderCell}>STATUS</Text>
					<Text style={styles.summaryHeaderCell}>Male</Text>
					<Text style={styles.summaryHeaderCell}>Female</Text>
					<Text style={styles.summaryHeaderCell}>Total</Text>
				</View>
				{title.includes('End of School Year') ? (
					<>
						{renderSummaryRow(
							'Regular',
							summaryData.regular.male,
							summaryData.regular.female
						)}
						{renderSummaryRow(
							'Irregular',
							summaryData.irregular.male,
							summaryData.irregular.female
						)}
						{renderTotalRow(summaryData)}
					</>
				) : (
					<>
						{renderSummaryRow(
							'Complete',
							summaryData.complete.male,
							summaryData.complete.female
						)}
						{renderSummaryRow(
							'Incomplete',
							summaryData.incomplete.male,
							summaryData.incomplete.female
						)}
						{renderTotalRow(summaryData)}
					</>
				)}
			</View>
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
							School Form 5A End of Semester and School Year Status of Learners
							for Senior High School (SF5-SHS)
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
						<View style={[styles.fieldContainer, styles.wideField]}>
							<Text style={styles.label}>Section</Text>
							<Text style={styles.value}>{data.schoolInfo.section}</Text>
						</View>
					</View>

					{/* Third Row */}
					<View style={styles.row}>
						<View style={[styles.fieldContainer, { flex: 2 }]}>
							<Text style={styles.label}>Track and Strand</Text>
							<Text style={styles.value}>
								{`${data.schoolInfo.track} - ${data.schoolInfo.strand}`}
							</Text>
						</View>
						<View style={[styles.fieldContainer, { flex: 2 }]}>
							<Text style={styles.label}>Course (only for TVL)</Text>
							<Text style={styles.value}>{''}</Text>
						</View>
					</View>
				</View>

				{/* New layout with LEFT and RIGHT sections */}
				<View style={styles.mainContainer}>
					{/* LEFT Section */}
					<View style={styles.leftSection}>
						<View style={styles.table}>
							{renderTableHeaders()}
							{(data.maleStudents ?? []).map((student, index) =>
								renderStudentRow(student, index)
							)}
							{renderGenderRow('male')}
							{(data.femaleStudents ?? []).map((student, index) =>
								renderStudentRow(student, index)
							)}
							{renderGenderRow('female')}
							{renderGenderRow('combined')}
						</View>
					</View>

					{/* RIGHT Section */}
					<View style={styles.rightSection}>
						{/* Always show both semester summaries and end of year summary */}
						<View style={styles.summaryContainer}>
							{renderSummaryTable(
								'Summary Table 1st Sem',
								summaryData.semesterSummary
							)}
						</View>
						<View style={styles.summaryContainer}>
							{renderSummaryTable(
								'Summary Table 2nd Sem',
								summaryData.semesterSummary
							)}
						</View>
						<View style={styles.summaryContainer}>
							{renderSummaryTable(
								'Summary Table(End of School Year Only)',
								summaryData.yearSummary
							)}
						</View>

						{/* Guidelines Section */}
						<View style={styles.guidelinesContainer}>
							<Text style={styles.guidelineTitle}>GUIDELINES:</Text>
							<Text style={styles.guidelineText}>
								This form shall be accomplished after each semester in a school
								year, leaving the End of School Year Status Column and Summary
								Table for End of School Year Status blank/unfilled at the end of
								the 1st Semester. These data elements shall be filled up only
								after the 2nd semester or at the end of the School Year.
							</Text>
						</View>

						{/* Indicators Section */}
						<View style={styles.indicatorsContainer}>
							<Text style={styles.indicatorTitle}>INDICATORS:</Text>
							<Text style={styles.indicatorText}>
								End of Semester Status: Complete - number of learners who
								completed/satisfied the requirements in all subject areas (with
								grade of at least 75%)
							</Text>
							<Text style={styles.indicatorText}>
								Incomplete - number of learners who did not meet expectations in
								one or more subject areas, regardless of number of subjects
								failed (with grade less than 75%)
							</Text>
							<Text style={styles.indicatorText}>
								End of Program Status: Regular - number of learners who
								completed/satisfied the requirements in all subject areas both
								in 1st and 2nd semester
							</Text>
							<Text style={styles.indicatorText}>
								Irregular - number of learners who were not able to
								satisfy/complete requirements in one or both semesters
							</Text>
							<Text style={styles.indicatorText}>
								Note: Do not include learners who are Not Longer in School
							</Text>
						</View>

						{/* Prepared By Section */}
						<View style={styles.preparedByContainer}>
							<Text style={styles.preparedByLabel}>PREPARED BY:</Text>
							<View style={styles.signatureLine} />
							<Text style={styles.signatureName}>
								{data.schoolInfo.supervisorName}
							</Text>
							<Text style={styles.signatureTitle}>(Class Adviser)</Text>
						</View>

						{/* Certification Section */}
						<View style={styles.certificationContainer}>
							<Text style={styles.certificationLabel}>
								CERTIFIED CORRECT & SUBMITTED BY:
							</Text>
							<View style={styles.signatureBlock}>
								<View style={styles.signatureLine} />
								<Text style={styles.signatureTitle}>
									(School Head & SCC Chair)
								</Text>
								<Text style={styles.signatureTitle}>(Name and Signature)</Text>
							</View>

							<View style={styles.reviewSection}>
								<Text style={styles.reviewLabel}>REVIEWED BY: SCC Members</Text>

								<View style={styles.memberSignature}>
									<View style={styles.signatureLine} />
									<Text style={styles.signatureTitle}>
										Signature over Printed Name
									</Text>
								</View>

								<View style={styles.memberSignature}>
									<View style={styles.signatureLine} />
									<Text style={styles.signatureTitle}>
										Signature over Printed Name
									</Text>
								</View>

								<View style={styles.memberSignature}>
									<View style={styles.signatureLine} />
									<Text style={styles.signatureTitle}>
										Signature over Printed Name
									</Text>
								</View>

								<View style={styles.memberSignature}>
									<View style={styles.signatureLine} />
									<Text style={styles.signatureTitle}>
										Signature over Printed Name
									</Text>
									<Text style={styles.generatedNote}>(SCC CO-Chair)</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default SF5Document;
