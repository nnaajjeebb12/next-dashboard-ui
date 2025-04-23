'use client';

import { EligibilityFormData } from '@/app/(dashboard)/list/pdfExport/EligibilityForm';
import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import React, { useEffect } from 'react';
import { StudentResponse, SubjectGrades } from './types';

interface SF10DocumentProps {
	data: StudentResponse;
	eligibilityData?: EligibilityFormData;
}

const SF10Document = ({ data, eligibilityData }: SF10DocumentProps) => {
	useEffect(() => {}, [data]);

	// Increase the width while keeping the height the same
	const PAGE_HEIGHT = 620;
	const PAGE_WIDTH = 842.4;

	const convertGradeIdToWords = (gradeId: number | undefined) => {
		switch (gradeId) {
			case 7:
				return 'SEVEN';
			case 8:
				return 'EIGHT';
			case 9:
				return 'NINE';
			case 10:
				return 'TEN';
			case 11:
				return 'ELEVEN';
			case 12:
				return 'TWELVE';
			default:
				return '';
		}
	};

	const formatSemester = (semester: string) => {
		return semester.replace(' Semester', '');
	};

	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			backgroundColor: '#FFFFFF',
			padding: 20,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			pageOrientation: 'landscape',
		},
		headerContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		logoContainer: {
			width: 40,
			height: 40,
		},
		headerTextContainer: {
			flex: 1,
			alignItems: 'center',
		},
		headerText: {
			fontSize: 8,
			textAlign: 'center',
			fontFamily: 'Helvetica-Bold',
		},
		formTitle: {
			fontSize: 10,
			textAlign: 'center',
			fontFamily: 'Helvetica-Bold',
			marginTop: 4,
		},
		formSubtitle: {
			fontSize: 8,
			textAlign: 'center',
			marginTop: 2,
		},
		formNumber: {
			position: 'absolute',
			top: 5,
			right: 5,
			fontSize: 8,
			fontFamily: 'Helvetica-Bold',
		},
		learnerInfoContainer: {
			marginTop: 8,
			borderWidth: 0.86,
			borderColor: '#000000',
		},
		learnerInfoHeader: {
			backgroundColor: '#D3D3D3',
			padding: 3,
		},
		learnerInfoHeaderText: {
			fontSize: 8,
			fontFamily: 'Helvetica-Bold',
			textAlign: 'center',
		},
		learnerInfoContent: {
			padding: 4,
		},
		infoRow: {
			flexDirection: 'row',
			marginBottom: 4,
			alignItems: 'center',
		},
		infoLabel: {
			fontSize: 7,
			width: 55,
			marginRight: 1,
		},
		infoValue: {
			fontSize: 7,
			flex: 1,
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			marginRight: 4,
			paddingBottom: 1,
			paddingLeft: 2,
		},
		infoValueSmall: {
			fontSize: 7,
			width: 65,
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			marginRight: 4,
			paddingBottom: 1,
			paddingLeft: 2,
		},
		eligibilityContainer: {
			marginTop: 4,
			borderWidth: 0.8,
			borderColor: '#000000',
		},
		eligibilityHeader: {
			backgroundColor: '#D3D3D3',
			padding: 2,
		},
		eligibilityHeaderText: {
			fontSize: 7,
			fontFamily: 'Helvetica-Bold',
			textAlign: 'center',
		},
		eligibilityContent: {
			padding: 3,
		},
		checkboxRow: {
			flexDirection: 'row',
			marginBottom: 2,
			alignItems: 'center',
		},
		firstLineContainer: {
			flexDirection: 'row',
			marginBottom: 2,
			alignItems: 'center',
			justifyContent: 'flex-start',
		},
		checkbox: {
			width: 6,
			height: 6,
			borderWidth: 0.5,
			borderColor: '#000000',
			marginRight: 2,
			backgroundColor: '#ffffff',
		},
		checkedBox: {
			backgroundColor: '#000000',
		},
		checkboxLabel: {
			fontSize: 7,
			marginRight: 4,
			fontFamily: 'Helvetica-Bold',
		},
		genAveLabel: {
			fontSize: 7,
			marginRight: 2,
			marginLeft: 15,
			fontFamily: 'Helvetica-Bold',
		},
		genAveField: {
			fontSize: 7,
			width: 25,
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			marginRight: 15,
			textAlign: 'center',
		},
		dateLabel: {
			fontSize: 7,
			marginRight: 2,
			fontFamily: 'Helvetica-Bold',
		},
		dateField: {
			fontSize: 7,
			width: 60,
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			marginRight: 4,
		},
		schoolLabel: {
			fontSize: 7,
			marginRight: 2,
			marginLeft: 4,
			fontFamily: 'Helvetica-Bold',
		},
		schoolField: {
			fontSize: 7,
			flex: 1,
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			marginRight: 4,
		},
		fixedText: {
			fontSize: 7,
		},
		footnoteText: {
			fontSize: 5,
			marginTop: 2,
			fontStyle: 'italic',
		},
		section: {
			marginTop: 10,
			borderWidth: 0.86,
			borderColor: '#000000',
		},
		sectionHeader: {
			backgroundColor: '#D3D3D3',
			padding: 3,
		},
		sectionTitle: {
			fontSize: 8,
			fontFamily: 'Helvetica-Bold',
			textAlign: 'center',
		},
		sectionContent: {
			padding: 4,
		},
		eligibilityRow: {
			marginBottom: 4,
		},
		scholasticTable: {
			width: '100%',
			borderWidth: 0.5,
			borderColor: '#000000',
		},
		tableHeader: {
			flexDirection: 'row',
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
		},
		tableRow: {
			flexDirection: 'row',
			borderBottomWidth: 0.5,
			borderBottomColor: '#000000',
			minHeight: 16,
		},
		subjectTypeCell: {
			width: '15%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
			textAlign: 'center',
		},
		subjectCell: {
			width: '45%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
		},
		quarterCell: {
			width: '10%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
			textAlign: 'center',
		},
		finalGradeCell: {
			width: '10%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
			textAlign: 'center',
		},
		actionCell: {
			width: '10%',
			padding: 4,
			fontSize: 7,
			textAlign: 'center',
		},
		tableHeaderText: {
			fontFamily: 'Helvetica-Bold',
			fontSize: 7,
		},
		averageRow: {
			flexDirection: 'row',
			borderTopWidth: 0.5,
			borderTopColor: '#000000',
			minHeight: 16,
		},
		averageLabel: {
			width: '60%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
			textAlign: 'right',
			fontFamily: 'Helvetica-Bold',
		},
		averageGrade: {
			width: '10%',
			padding: 4,
			borderRightWidth: 0.5,
			borderRightColor: '#000000',
			fontSize: 7,
			textAlign: 'center',
		},
		averageAction: {
			width: '10%',
			padding: 4,
			fontSize: 7,
			textAlign: 'center',
		},
		schoolInfo: {
			marginBottom: 10,
		},
		schoolName: {
			fontSize: 10,
			fontFamily: 'Helvetica-Bold',
			marginBottom: 2,
		},
		schoolDetails: {
			fontSize: 8,
		},
		classDetails: {
			fontSize: 8,
			marginBottom: 2,
		},
		scholasticHeader: {
			flexDirection: 'column',
			marginBottom: 5,
		},
		scholasticHeaderRow: {
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			marginBottom: 2,
			flexWrap: 'nowrap',
		},
		scholasticHeaderText: {
			fontSize: 8.5,
			fontFamily: 'Helvetica',
			marginRight: 10,
			whiteSpace: 'nowrap',
		},
		scholasticHeaderLabel: {
			fontFamily: 'Helvetica-Bold',
		},
		trackStrandRow: {
			flexDirection: 'row',
			marginTop: 1,
		},
	});

	const getCheckboxStyle = (isChecked: boolean | undefined) => {
		return isChecked ? [styles.checkbox, styles.checkedBox] : styles.checkbox;
	};

	return (
		<Document>
			<Page size={[PAGE_HEIGHT, PAGE_WIDTH]} style={styles.page}>
				{/* Header */}
				<View style={styles.headerContainer}>
					<Image style={styles.logoContainer} src="/DrJuanLogo.png" />
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerText}>REPUBLIC OF THE PHILIPPINES</Text>
						<Text style={styles.headerText}>DEPARTMENT OF EDUCATION</Text>
						<Text style={styles.formTitle}>
							SENIOR HIGH SCHOOL STUDENT PERMANENT RECORD
						</Text>
					</View>
					<Image style={styles.logoContainer} src="/deped.png" />
					<Text style={styles.formNumber}>SF10-SHS</Text>
				</View>

				{/* Learner's Information Section */}
				<View style={styles.learnerInfoContainer}>
					<View style={styles.learnerInfoHeader}>
						<Text style={styles.learnerInfoHeaderText}>
							LEARNER'S INFORMATION
						</Text>
					</View>
					<View style={styles.learnerInfoContent}>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>LAST NAME:</Text>
							<Text style={styles.infoValue}>
								{data.student?.surname || ''}
							</Text>
							<Text style={[styles.infoLabel, { width: 60 }]}>FIRST NAME:</Text>
							<Text style={styles.infoValue}>{data.student?.name || ''}</Text>
							<Text style={[styles.infoLabel, { width: 70 }]}>
								MIDDLE NAME:
							</Text>
							<Text style={styles.infoValue}>
								{data.student?.middleName || ''}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={[styles.infoLabel, { width: 30 }]}>LRN:</Text>
							<Text style={[styles.infoValue, { flex: 0.8 }]}>
								{data.student?.lrn || ''}
							</Text>
							<Text style={[styles.infoLabel, { width: 65 }]}>
								Date of Birth:
							</Text>
							<Text style={[styles.infoValueSmall, { width: 70 }]}>
								{data.student?.birthday
									? new Date(data.student.birthday).toLocaleDateString()
									: ''}
							</Text>
							<Text style={[styles.infoLabel, { width: 30 }]}>Sex:</Text>
							<Text style={[styles.infoValueSmall, { width: 50 }]}>
								{data.student?.sex || ''}
							</Text>
							<Text style={[styles.infoLabel, { width: 100 }]}>
								Date of SHS Admission:
							</Text>
							<Text style={[styles.infoValueSmall, { flex: 1 }]}>
								{data.student?.dateOfSHSAdmission || ''}
							</Text>
						</View>
					</View>
				</View>

				{/* Eligibility Section */}
				<View style={styles.eligibilityContainer}>
					<View style={styles.eligibilityHeader}>
						<Text style={styles.eligibilityHeaderText}>
							ELIGIBILITY FOR SHS ENROLMENT
						</Text>
					</View>
					<View style={styles.eligibilityContent}>
						{/* First Line - High School and Junior High School Completers */}
						<View style={styles.firstLineContainer}>
							<View
								style={getCheckboxStyle(eligibilityData?.isHighSchoolCompleter)}
							/>
							<Text style={styles.checkboxLabel}>High School Completer*</Text>
							<Text style={styles.genAveLabel}>Gen. Ave:</Text>
							<Text style={styles.genAveField}>
								{eligibilityData?.genAve || ''}
							</Text>

							<View style={getCheckboxStyle(eligibilityData?.isJHSCompleter)} />
							<Text style={styles.checkboxLabel}>
								Junior High School Completer
							</Text>
							<Text style={styles.genAveLabel}>Gen. Ave:</Text>
							<Text style={styles.genAveField}>
								{eligibilityData?.jhsGenAve || ''}
							</Text>
						</View>

						{/* Second Line - Date of Graduation and School Info */}
						<View style={styles.checkboxRow}>
							<Text style={styles.dateLabel}>
								Date of Graduation/Completion (MM/DD/YYYY):
							</Text>
							<Text style={styles.dateField}>
								{eligibilityData?.dateOfGraduation || ''}
							</Text>
							<Text style={styles.schoolLabel}>Name of School:</Text>
							<Text style={styles.fixedText}>
								Dr. Juan A. Pastor Memorial National High School
							</Text>
							<Text style={styles.schoolLabel}>School Address:</Text>
							<Text style={styles.fixedText}>Talaibon, Ibaan, Batangas</Text>
						</View>

						{/* Third Line - PEPT, ALS, and Others */}
						<View style={styles.checkboxRow}>
							<View
								style={getCheckboxStyle(eligibilityData?.isPEPTCompleter)}
							/>
							<Text style={styles.checkboxLabel}>PEPT Passer**</Text>
							<Text style={styles.genAveLabel}>Rating:</Text>
							<Text style={styles.genAveField}>
								{eligibilityData?.peptRating || ''}
							</Text>

							<View style={getCheckboxStyle(eligibilityData?.isALSCompleter)} />
							<Text style={styles.checkboxLabel}>ALS A&E Passer***</Text>
							<Text style={styles.genAveLabel}>Rating:</Text>
							<Text style={styles.genAveField}>
								{eligibilityData?.alsRating || ''}
							</Text>

							<View
								style={getCheckboxStyle(eligibilityData?.isOthersCompleter)}
							/>
							<Text style={styles.checkboxLabel}>Others (Pls. Specify):</Text>
							<Text style={styles.schoolField}>
								{eligibilityData?.othersSpecify || ''}
							</Text>
						</View>

						{/* Last Line - Date of Assessment and Learning Center */}
						<View style={styles.checkboxRow}>
							<Text style={styles.dateLabel}>
								Date of Examination/Assessment (MM/DD/YYYY):
							</Text>
							<Text style={styles.dateField}>
								{data.student?.dateOfAssessment || ''}
							</Text>
							<Text style={styles.schoolLabel}>
								Name and Address of Community Learning Center:
							</Text>
							<Text style={styles.schoolField}>
								{data.student?.learningCenterAddress || ''}
							</Text>
						</View>

						<Text style={styles.footnoteText}>
							*High School Completers are students who graduated from secondary
							school under the old curriculum
						</Text>
						<Text style={styles.footnoteText}>
							**PEPT - Philippine Educational Placement Test for JHS
						</Text>
						<Text style={styles.footnoteText}>
							***ALS A&E - Alternative Learning System Accreditation and
							Equivalency Test for JHS
						</Text>
					</View>
				</View>

				{/* Scholastic Record */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>SCHOLASTIC RECORD</Text>
					</View>
					<View style={styles.sectionContent}>
						{/* Updated School Info Header */}
						<View style={styles.scholasticHeader}>
							<View style={styles.scholasticHeaderRow}>
								<Text style={[styles.scholasticHeaderText, { flex: 4.5 }]}>
									<Text style={styles.scholasticHeaderLabel}>SCHOOL: </Text>
									{data.schoolInfo.name}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 1.6 }]}>
									<Text style={styles.scholasticHeaderLabel}>SCHOOL ID: </Text>
									{data.schoolInfo.schoolId}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 2 }]}>
									<Text style={styles.scholasticHeaderLabel}>GRADE LEVEL:</Text>
									{` ${convertGradeIdToWords(data.student?.gradeId)}`}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 1.3 }]}>
									<Text style={styles.scholasticHeaderLabel}>SY: </Text>
									{data.schoolInfo.schoolYear}
								</Text>
								<Text
									style={[
										styles.scholasticHeaderText,
										{ flex: 0.8, marginRight: 0 },
									]}>
									<Text style={styles.scholasticHeaderLabel}>SEM: </Text>
									{formatSemester(data.schoolInfo.semester)}
								</Text>
							</View>
							<View style={styles.trackStrandRow}>
								<Text style={styles.scholasticHeaderText}>
									<Text style={styles.scholasticHeaderLabel}>
										TRACK/STRAND:{' '}
									</Text>
									{data.schoolInfo.strand}
								</Text>
								<Text style={[styles.scholasticHeaderText, { marginRight: 0 }]}>
									<Text style={styles.scholasticHeaderLabel}>SECTION: </Text>
									{data.schoolInfo.section}
								</Text>
							</View>
						</View>

						<View style={styles.scholasticTable}>
							<View style={styles.tableHeader}>
								<View style={styles.subjectTypeCell}>
									<Text style={styles.tableHeaderText}>
										Indicate if Subject is
									</Text>
									<Text style={styles.tableHeaderText}>CORE, APPLIED, or</Text>
									<Text style={styles.tableHeaderText}>SPECIALIZED</Text>
								</View>
								<View style={styles.subjectCell}>
									<Text style={styles.tableHeaderText}>SUBJECTS</Text>
								</View>
								<View style={styles.quarterCell}>
									<Text style={styles.tableHeaderText}>Quarter</Text>
									<Text style={styles.tableHeaderText}>1ST</Text>
								</View>
								<View style={styles.quarterCell}>
									<Text style={styles.tableHeaderText}>Quarter</Text>
									<Text style={styles.tableHeaderText}>2ND</Text>
								</View>
								<View style={styles.finalGradeCell}>
									<Text style={styles.tableHeaderText}>SEM FINAL</Text>
									<Text style={styles.tableHeaderText}>GRADE</Text>
								</View>
								<View style={styles.actionCell}>
									<Text style={styles.tableHeaderText}>ACTION</Text>
									<Text style={styles.tableHeaderText}>TAKEN</Text>
								</View>
							</View>

							{data.grades?.firstSemester?.subjects?.map((subject, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={styles.subjectTypeCell}>{subject.type}</Text>
									<Text style={styles.subjectCell}>
										{subject.lesson?.name || subject.name}
									</Text>
									<Text style={styles.quarterCell}>{subject.q1}</Text>
									<Text style={styles.quarterCell}>{subject.q2}</Text>
									<Text style={styles.finalGradeCell}>{subject.final}</Text>
									<Text style={styles.actionCell}>
										{(subject.final ?? 0) >= 75 ? 'PASSED' : 'FAILED'}
									</Text>
								</View>
							))}

							<View style={styles.averageRow}>
								<Text style={styles.averageLabel}>
									General Ave. for the Semester:
								</Text>
								<Text style={styles.averageGrade}>
									{data.grades?.firstSemester?.averages?.final || ''}
								</Text>
								<Text style={styles.averageAction}>
									{(data.grades?.firstSemester?.averages?.final || 0) >= 75
										? 'PASSED'
										: 'FAILED'}
								</Text>
							</View>
						</View>

						{/* Add Remarks Section */}
						<View style={{ marginTop: 5 }}>
							<Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
								REMARKS:{' '}
								<Text style={{ fontFamily: 'Helvetica' }}>
									{(data.grades?.firstSemester?.averages?.final || 0) >= 75
										? 'Complete-Regular'
										: 'Incomplete-Irregular'}
								</Text>
							</Text>
						</View>

						{/* Add Signature Section */}
						<View
							style={{
								marginTop: 15,
								flexDirection: 'row',
								justifyContent: 'space-between',
							}}>
							{/* Prepared by */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Prepared by:
								</Text>
								<View
									style={{
										width: 120,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{data.class?.supervisor
											? `${data.class.supervisor.surname}, ${data.class.supervisor.name}`
											: ''}
									</Text>
								</View>
								<Text style={{ fontSize: 7, marginTop: 2 }}>
									Signature of Adviser over Printed Name
								</Text>
							</View>

							{/* Certified True and Correct */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Certified True and Correct:
								</Text>
								<View
									style={{
										width: 120,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{'\u00A0'}
									</Text>
								</View>
								<Text
									style={{
										fontSize: 7,
										marginTop: 2,
										width: 200,
										textAlign: 'center',
									}}>
									Signature of Authorized Person over Printed Name, Designation
								</Text>
							</View>

							{/* Date Checked */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Date Checked (MM/DD/YYYY):
								</Text>
								<View
									style={{
										width: 100,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{'\u00A0'}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Remedial Classes Section */}
				<View style={styles.section}>
					{/* First Line - Header */}
					<View
						style={{
							flexDirection: 'row',
							borderBottomWidth: 0.5,
							borderBottomColor: '#000000',
							backgroundColor: '#f0f0f0',
						}}>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
								REMEDIAL CLASSES
							</Text>
						</View>
						<View
							style={{
								width: '30%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>Conducted from (MM/DD/YYYY):</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{'\u00A0'}
							</Text>
						</View>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>to (MM/DD/YYYY):</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{'\u00A0'}
							</Text>
						</View>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>SCHOOL:</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{'\u00A0'}
							</Text>
						</View>
						<View style={{ width: '10%', padding: 4 }}>
							<Text style={{ fontSize: 7 }}>SCHOOL ID:</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{'\u00A0'}
							</Text>
						</View>
					</View>

					{/* Second Line - Table */}
					<View
						style={{ borderBottomWidth: 0.5, borderBottomColor: '#000000' }}>
						{/* Table Headers */}
						<View
							style={{
								flexDirection: 'row',
								borderBottomWidth: 0.5,
								borderBottomColor: '#000000',
							}}>
							<View
								style={{
									width: '15%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									Indicate if Subject is{'\n'}CORE, APPLIED, or{'\n'}SPECIALIZED
								</Text>
							</View>
							<View
								style={{
									width: '45%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7 }}>SUBJECTS</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									SEM FINAL{'\n'}GRADE
								</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									REMEDIAL{'\n'}CLASS{'\n'}MARK
								</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									RECOMPUTED{'\n'}FINAL GRADE
								</Text>
							</View>
							<View style={{ width: '10%', padding: 4 }}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									ACTION{'\n'}TAKEN
								</Text>
							</View>
						</View>

						{/* Empty Table Rows */}
						{[1, 2, 3].map((index) => (
							<View
								key={index}
								style={{
									flexDirection: 'row',
									minHeight: 20,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
								}}>
								<View
									style={{
										width: '15%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text>{'\u00A0'}</Text>
								</View>
								<View
									style={{
										width: '45%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text>{'\u00A0'}</Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text>{'\u00A0'}</Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text>{'\u00A0'}</Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text>{'\u00A0'}</Text>
								</View>
								<View style={{ width: '10%', padding: 4 }}>
									<Text>{'\u00A0'}</Text>
								</View>
							</View>
						))}
					</View>

					{/* Third Line - Name and Signature */}
					<View style={{ flexDirection: 'row', padding: 8, marginTop: 4 }}>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 7, marginBottom: 2 }}>
								Name of Teacher/Adviser:
							</Text>
							<View
								style={{
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									width: '60%',
								}}>
								<Text style={{ fontSize: 7, padding: 2 }}>{'\u00A0'}</Text>
							</View>
						</View>
						<View style={{ flex: 1, alignItems: 'flex-end' }}>
							<Text style={{ fontSize: 7, marginBottom: 2 }}>Signature:</Text>
							<View
								style={{
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									width: '40%',
								}}>
								<Text style={{ fontSize: 7, padding: 2 }}>{'\u00A0'}</Text>
							</View>
						</View>
					</View>
				</View>
			</Page>

			{/* Page 2: Second Semester */}
			<Page size={[PAGE_HEIGHT, PAGE_WIDTH]} style={styles.page}>
				{/* Header (can be repeated or simplified for subsequent pages) */}
				<View style={styles.headerContainer}>
					<Image style={styles.logoContainer} src="/DrJuanLogo.png" />
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerText}>REPUBLIC OF THE PHILIPPINES</Text>
						<Text style={styles.headerText}>DEPARTMENT OF EDUCATION</Text>
						<Text style={styles.formTitle}>
							SENIOR HIGH SCHOOL STUDENT PERMANENT RECORD
						</Text>
					</View>
					<Image style={styles.logoContainer} src="/deped.png" />
					<Text style={styles.formNumber}>SF10-SHS</Text>
				</View>

				{/* Scholastic Record - Second Semester */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>SCHOLASTIC RECORD</Text>
					</View>
					<View style={styles.sectionContent}>
						{/* School Info Header for Second Semester */}
						<View style={styles.scholasticHeader}>
							<View style={styles.scholasticHeaderRow}>
								<Text style={[styles.scholasticHeaderText, { flex: 4.5 }]}>
									<Text style={styles.scholasticHeaderLabel}>SCHOOL: </Text>
									{data.schoolInfo.name} {/* Assuming same school */}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 1.6 }]}>
									<Text style={styles.scholasticHeaderLabel}>SCHOOL ID: </Text>
									{data.schoolInfo.schoolId}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 2 }]}>
									<Text style={styles.scholasticHeaderLabel}>GRADE LEVEL:</Text>
									{` ${convertGradeIdToWords(data.student?.gradeId)}`}
								</Text>
								<Text style={[styles.scholasticHeaderText, { flex: 1.3 }]}>
									<Text style={styles.scholasticHeaderLabel}>SY: </Text>
									{data.schoolInfo.schoolYear}
								</Text>
								<Text
									style={[
										styles.scholasticHeaderText,
										{ flex: 0.8, marginRight: 0 },
									]}>
									<Text style={styles.scholasticHeaderLabel}>SEM: </Text>
									2ND {/* Hardcoded for Page 2 */}
								</Text>
							</View>
							<View style={styles.trackStrandRow}>
								<Text style={styles.scholasticHeaderText}>
									<Text style={styles.scholasticHeaderLabel}>
										TRACK/STRAND:{' '}
									</Text>
									{data.schoolInfo.strand}
								</Text>
								<Text style={[styles.scholasticHeaderText, { marginRight: 0 }]}>
									<Text style={styles.scholasticHeaderLabel}>SECTION: </Text>
									{data.schoolInfo.section}
								</Text>
							</View>
						</View>

						<View style={styles.scholasticTable}>
							<View style={styles.tableHeader}>
								<View style={styles.subjectTypeCell}>
									<Text style={styles.tableHeaderText}>
										Indicate if Subject is
									</Text>
									<Text style={styles.tableHeaderText}>CORE, APPLIED, or</Text>
									<Text style={styles.tableHeaderText}>SPECIALIZED</Text>
								</View>
								<View style={styles.subjectCell}>
									<Text style={styles.tableHeaderText}>SUBJECTS</Text>
								</View>
								<View style={styles.quarterCell}>
									<Text style={styles.tableHeaderText}>Quarter</Text>
									<Text style={styles.tableHeaderText}>3RD</Text>{' '}
									{/* Updated for Sem 2 */}
								</View>
								<View style={styles.quarterCell}>
									<Text style={styles.tableHeaderText}>Quarter</Text>
									<Text style={styles.tableHeaderText}>4TH</Text>{' '}
									{/* Updated for Sem 2 */}
								</View>
								<View style={styles.finalGradeCell}>
									<Text style={styles.tableHeaderText}>SEM FINAL</Text>
									<Text style={styles.tableHeaderText}>GRADE</Text>
								</View>
								<View style={styles.actionCell}>
									<Text style={styles.tableHeaderText}>ACTION</Text>
									<Text style={styles.tableHeaderText}>TAKEN</Text>
								</View>
							</View>

							{/* Use second semester data */}
							{data.grades?.secondSemester?.subjects?.map((subject, index) => (
								<View key={index} style={styles.tableRow}>
									<Text style={styles.subjectTypeCell}>{subject.type}</Text>
									<Text style={styles.subjectCell}>
										{subject.lesson?.name || subject.name}
									</Text>
									<Text style={styles.quarterCell}>{subject.q3}</Text>{' '}
									{/* Updated for Sem 2 */}
									<Text style={styles.quarterCell}>{subject.q4}</Text>{' '}
									{/* Updated for Sem 2 */}
									<Text style={styles.finalGradeCell}>{subject.final}</Text>
									<Text style={styles.actionCell}>
										{(subject.final ?? 0) >= 75 ? 'PASSED' : 'FAILED'}
									</Text>
								</View>
							))}

							{/* Add empty rows if needed to fill space, e.g., if fewer subjects */}
							{Array.from({
								length: Math.max(
									0,
									10 - (data.grades?.secondSemester?.subjects?.length || 0)
								),
							}).map((_, index) => (
								<View
									key={`empty-${index}`}
									style={[
										styles.tableRow,
										{
											borderBottomWidth:
												index ===
												Math.max(
													0,
													10 -
														(data.grades?.secondSemester?.subjects?.length || 0)
												) -
													1
													? 0
													: 0.5,
										},
									]}>
									<Text style={styles.subjectTypeCell}>{'\u00A0'}</Text>
									<Text style={styles.subjectCell}>{'\u00A0'}</Text>
									<Text style={styles.quarterCell}>{'\u00A0'}</Text>
									<Text style={styles.quarterCell}>{'\u00A0'}</Text>
									<Text style={styles.finalGradeCell}>{'\u00A0'}</Text>
									<Text style={styles.actionCell}>{'\u00A0'}</Text>
								</View>
							))}

							<View style={styles.averageRow}>
								<Text style={styles.averageLabel}>
									General Ave. for the Semester:
								</Text>
								<Text style={styles.averageGrade}>
									{data.grades?.secondSemester?.averages?.final || ''}{' '}
									{/* Use Sem 2 Avg */}
								</Text>
								<Text style={styles.averageAction}>
									{(data.grades?.secondSemester?.averages?.final || 0) >= 75
										? 'PASSED'
										: 'FAILED'}
								</Text>
							</View>
						</View>

						{/* Remarks Section for Second Semester */}
						<View style={{ marginTop: 5 }}>
							<Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
								REMARKS:{' '}
								<Text style={{ fontFamily: 'Helvetica' }}>
									{(data.grades?.secondSemester?.averages?.final || 0) >= 75
										? 'Complete-Regular'
										: 'Incomplete-Irregular'}
								</Text>
							</Text>
						</View>

						{/* Signature Section (can be repeated or placed once at the end) */}
						<View
							style={{
								marginTop: 15,
								flexDirection: 'row',
								justifyContent: 'space-between',
							}}>
							{/* Prepared by */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Prepared by:
								</Text>
								<View
									style={{
										width: 120,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{data.class?.supervisor
											? `${data.class.supervisor.surname}, ${data.class.supervisor.name}`
											: ''}
									</Text>
								</View>
								<Text style={{ fontSize: 7, marginTop: 2 }}>
									Signature of Adviser over Printed Name
								</Text>
							</View>

							{/* Certified True and Correct */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Certified True and Correct:
								</Text>
								<View
									style={{
										width: 120,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{' '}
									</Text>
								</View>
								<Text
									style={{
										fontSize: 7,
										marginTop: 2,
										width: 200,
										textAlign: 'center',
									}}>
									Signature of Authorized Person over Printed Name, Designation
								</Text>
							</View>

							{/* Date Checked */}
							<View style={{ flex: 1, alignItems: 'center' }}>
								<Text style={{ fontSize: 7, marginBottom: 15 }}>
									Date Checked (MM/DD/YYYY):
								</Text>
								<View
									style={{
										width: 100,
										alignItems: 'center',
										borderBottomWidth: 0.5,
										borderBottomColor: '#000000',
										marginBottom: 2,
									}}>
									<Text
										style={{
											fontSize: 8,
											fontFamily: 'Helvetica-Bold',
											textAlign: 'center',
											paddingBottom: 2,
										}}>
										{' '}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* Remedial Classes Section - Now on Page 2 */}
				<View style={[styles.section, { marginTop: 10 }]}>
					{/* First Line - Header */}
					<View
						style={{
							flexDirection: 'row',
							borderBottomWidth: 0.5,
							borderBottomColor: '#000000',
							backgroundColor: '#f0f0f0',
						}}>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>
								REMEDIAL CLASSES
							</Text>
						</View>
						<View
							style={{
								width: '30%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>Conducted from (MM/DD/YYYY):</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{' '}
							</Text>
						</View>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>to (MM/DD/YYYY):</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{' '}
							</Text>
						</View>
						<View
							style={{
								width: '20%',
								padding: 4,
								borderRightWidth: 0.5,
								borderRightColor: '#000000',
							}}>
							<Text style={{ fontSize: 7 }}>SCHOOL:</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{' '}
							</Text>
						</View>
						<View style={{ width: '10%', padding: 4 }}>
							<Text style={{ fontSize: 7 }}>SCHOOL ID:</Text>
							<Text
								style={{
									fontSize: 7,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									marginTop: 2,
								}}>
								{' '}
							</Text>
						</View>
					</View>

					{/* Second Line - Table */}
					<View
						style={{ borderBottomWidth: 0.5, borderBottomColor: '#000000' }}>
						{/* Table Headers */}
						<View
							style={{
								flexDirection: 'row',
								borderBottomWidth: 0.5,
								borderBottomColor: '#000000',
							}}>
							<View
								style={{
									width: '15%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									Indicate if Subject is CORE, APPLIED, or SPECIALIZED
								</Text>
							</View>
							<View
								style={{
									width: '45%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7 }}>SUBJECTS</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									SEM FINAL GRADE
								</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									REMEDIAL CLASS MARK
								</Text>
							</View>
							<View
								style={{
									width: '10%',
									padding: 4,
									borderRightWidth: 0.5,
									borderRightColor: '#000000',
								}}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									RECOMPUTED FINAL GRADE
								</Text>
							</View>
							<View style={{ width: '10%', padding: 4 }}>
								<Text style={{ fontSize: 7, textAlign: 'center' }}>
									ACTION TAKEN
								</Text>
							</View>
						</View>

						{/* Empty Table Rows */}
						{[1, 2, 3].map((index) => (
							<View
								key={index}
								style={{
									flexDirection: 'row',
									minHeight: 20,
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
								}}>
								<View
									style={{
										width: '15%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text> </Text>
								</View>
								<View
									style={{
										width: '45%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text> </Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text> </Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text> </Text>
								</View>
								<View
									style={{
										width: '10%',
										padding: 4,
										borderRightWidth: 0.5,
										borderRightColor: '#000000',
									}}>
									<Text> </Text>
								</View>
								<View style={{ width: '10%', padding: 4 }}>
									<Text> </Text>
								</View>
							</View>
						))}
					</View>

					{/* Third Line - Name and Signature */}
					<View style={{ flexDirection: 'row', padding: 8, marginTop: 4 }}>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 7, marginBottom: 2 }}>
								Name of Teacher/Adviser:
							</Text>
							<View
								style={{
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									width: '60%',
								}}>
								<Text style={{ fontSize: 7, padding: 2 }}> </Text>
							</View>
						</View>
						<View style={{ flex: 1, alignItems: 'flex-end' }}>
							<Text style={{ fontSize: 7, marginBottom: 2 }}>Signature:</Text>
							<View
								style={{
									borderBottomWidth: 0.5,
									borderBottomColor: '#000000',
									width: '40%',
								}}>
								<Text style={{ fontSize: 7, padding: 2 }}> </Text>
							</View>
						</View>
					</View>
				</View>

				{/* Certification Section */}
				<View style={[styles.section, { marginTop: 10 }]}>
					{/* Top Row: Track/Strand, Awards, Gen Ave, Graduation Date */}
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginBottom: 10,
						}}>
						<View style={{ width: '45%' }}>
							<View style={{ flexDirection: 'row', marginBottom: 3 }}>
								<Text style={{ fontSize: 7, width: '40%' }}>
									Track/Strand Accomplished:
								</Text>
								<View
									style={{
										flex: 1,
										borderBottomWidth: 0.5,
										borderBottomColor: '#000',
									}}
								/>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ fontSize: 7, width: '40%' }}>
									Awards/Honors Received:
								</Text>
								<View
									style={{
										flex: 1,
										borderBottomWidth: 0.5,
										borderBottomColor: '#000',
									}}
								/>
							</View>
						</View>
						<View style={{ width: '45%' }}>
							<View style={{ flexDirection: 'row', marginBottom: 3 }}>
								<Text style={{ fontSize: 7, width: '40%' }}>
									SHS General Average:
								</Text>
								<View
									style={{
										flex: 1,
										borderBottomWidth: 0.5,
										borderBottomColor: '#000',
									}}
								/>
							</View>
							<View style={{ flexDirection: 'row' }}>
								<Text style={{ fontSize: 7, width: '40%' }}>
									Date of SHS Graduation (MM/DD/YYYY):
								</Text>
								<View
									style={{
										flex: 1,
										borderBottomWidth: 0.5,
										borderBottomColor: '#000',
									}}
								/>
							</View>
						</View>
					</View>

					{/* Certified By and School Seal */}
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginBottom: 5,
						}}>
						<View style={{ width: '55%' }}>
							<Text style={{ fontSize: 7, marginBottom: 2 }}>
								Certified by:
							</Text>
							<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
								<View style={{ width: '70%', alignItems: 'center' }}>
									<View
										style={{
											borderBottomWidth: 0.5,
											borderBottomColor: '#000',
											width: '100%',
											paddingBottom: 2,
											marginBottom: 2,
										}}></View>
									<Text style={{ fontSize: 7, textAlign: 'center' }}>
										Signature of School Head over Printed Name
									</Text>
								</View>
								<View
									style={{
										width: '30%',
										alignItems: 'center',
										marginLeft: 10,
									}}>
									<View
										style={{
											borderBottomWidth: 0.5,
											borderBottomColor: '#000',
											width: '100%',
											paddingBottom: 2,
											marginBottom: 2,
										}}>
										<Text style={{ fontSize: 8, textAlign: 'center' }}>
											{'\u00A0'}
										</Text>
									</View>
									<Text style={{ fontSize: 7, textAlign: 'center' }}>Date</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								width: '35%',
								borderLeftWidth: 0.5,
								borderLeftColor: '#000',
								paddingLeft: 10,
							}}>
							<Text style={{ fontSize: 7 }}>Place School Seal Here:</Text>
							{/* Placeholder for Seal */}
							<View style={{ height: 50, marginTop: 5 }} />
						</View>
					</View>

					{/* NOTE Section */}
					<View
						style={{
							borderWidth: 0.5,
							borderColor: '#000',
							padding: 5,
							marginBottom: 10,
						}}>
						<Text
							style={{
								fontSize: 7,
								fontFamily: 'Helvetica-Bold',
								marginBottom: 3,
							}}>
							NOTE:
						</Text>
						<Text style={{ fontSize: 7, textAlign: 'justify' }}>
							This permanent record or a photocopy of this permanent record that
							bears the seal of the school and the original signature in ink of
							the School Head shall be considered valid for all legal purposes.
							Any erasure or alteration made on this copy should be validated by
							the School Head. If the student transfers to another school, the
							originating school should produce one (1) certified true copy of
							this permanent record for safekeeping. The receiving school shall
							continue filling up the original form. Upon graduation, the school
							from which the student graduated should keep the original form and
							produce one (1) certified true copy for the Division Office.
						</Text>
					</View>

					{/* REMARKS Section */}
					<View style={{ marginBottom: 3 }}>
						<Text style={{ fontSize: 7 }}>
							<Text style={{ fontFamily: 'Helvetica-Bold' }}>REMARKS:</Text>{' '}
							(Please indicate the purpose for which this permanent record will
							be used)
						</Text>
						<View
							style={{
								borderBottomWidth: 0.5,
								borderBottomColor: '#000',
								marginTop: 2,
								paddingBottom: 2,
							}}>
							<Text style={{ fontSize: 7 }}>
								Copy for Local Employment Only
							</Text>
						</View>
					</View>

					{/* Date Issued */}
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ fontSize: 7, width: '25%' }}>
							Date Issued (MM/DD/YYYY):
						</Text>
						<View
							style={{
								width: '25%',
								borderBottomWidth: 0.5,
								borderBottomColor: '#000',
							}}
						/>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default SF10Document;
