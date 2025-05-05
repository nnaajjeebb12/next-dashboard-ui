'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import {
	eachDayOfInterval,
	endOfMonth,
	isWeekend,
	startOfMonth,
} from 'date-fns';
import { useEffect, useState } from 'react';
import { Student as ApiStudent, StudentResponse } from './types';
import { MONTHS, getNumberOfDays } from './utils';

// Define Props locally
interface SF2DocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
	selectedMonth: (typeof MONTHS)[number];
	loggedInUser?: string;
}

// Define StudentData locally (assuming similar structure to SF1)
interface StudentData extends ApiStudent {
	// Add any SF2 specific fields if needed, otherwise keep it based on SF1
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

const SF2Document = ({
	data,
	selectedSchoolYear,
	selectedMonth,
	loggedInUser = '',
}: SF2DocumentProps) => {
	// Define dimensions for landscape orientation
	const PAGE_HEIGHT = 1684.8; // 16.5 inches
	const PAGE_WIDTH = 1188; // 23.4 inches

	const daysInMonth = getNumberOfDays(selectedMonth, selectedSchoolYear);

	// Get month and year information
	const monthIndex = MONTHS.indexOf(selectedMonth);
	const [startYear, endYear] = selectedSchoolYear.split('-');
	const yearToUse = monthIndex >= 7 ? parseInt(startYear) : parseInt(endYear);

	// Calculate working days in the month
	const calculateWorkingDays = () => {
		const monthIndex = MONTHS.indexOf(selectedMonth);
		const [startYear, endYear] = selectedSchoolYear.split('-');
		const yearToUse = monthIndex >= 7 ? parseInt(startYear) : parseInt(endYear);

		const start = startOfMonth(new Date(yearToUse, monthIndex));
		const end = endOfMonth(new Date(yearToUse, monthIndex));

		const allDays = eachDayOfInterval({ start, end });
		const workingDays = allDays.filter((day) => !isWeekend(day));

		return workingDays.length;
	};

	const workingDaysInMonth = calculateWorkingDays();

	// Organize the attendance data for easy lookup
	const [attendanceMap, setAttendanceMap] = useState<{
		[key: string]: { [key: string]: string };
	}>({});

	useEffect(() => {
		// This function will fetch attendance data for the selected month
		const fetchAttendanceData = async () => {
			try {
				// Extract month and year for filtering
				const monthIndex = MONTHS.indexOf(selectedMonth);
				const [startYear, endYear] = selectedSchoolYear.split('-');

				// Determine the correct year based on the month
				const yearToUse =
					monthIndex >= 7 ? parseInt(startYear) : parseInt(endYear);

				// Create date objects for the first and last day of the selected month
				// Use UTC to avoid timezone issues
				const startDate = new Date(Date.UTC(yearToUse, monthIndex, 1));
				const endDate = new Date(Date.UTC(yearToUse, monthIndex + 1, 0));

				// Format dates for API query (YYYY-MM-DD format)
				const start = startDate.toISOString().split('T')[0];
				const end = endDate.toISOString().split('T')[0];

				// Ensure student lists are arrays and filter out any null/undefined values
				const maleStudents = data.maleStudents?.filter(Boolean) ?? [];
				const femaleStudents = data.femaleStudents?.filter(Boolean) ?? [];
				const allStudents = [...maleStudents, ...femaleStudents];

				if (allStudents.length === 0) {
					setAttendanceMap({});
					return;
				}

				// Create student IDs string for the API
				const studentIds = allStudents.map((student) => student.id).join(',');

				// Fetch attendance data from API
				const response = await fetch(
					`/api/attendance?start=${start}&end=${end}&students=${studentIds}`
				);

				if (!response.ok) {
					const errorText = await response.text();
					console.error('API Error Response:', errorText);
					throw new Error(
						`API request failed: ${response.status} ${response.statusText}`
					);
				}

				const attendanceData = await response.json();

				// Check if attendanceData is an array and has items
				if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
					setAttendanceMap({});
					return;
				}

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
						case 'L': // Tardy
							statusCode = 'L';
							break;
						case 'C': // Cutting
							statusCode = 'C';
							break;
						default:
							statusCode = 'X';
					}

					map[record.studentId][day] = statusCode;
				});

				setAttendanceMap(map);
			} catch (error) {
				console.error('Error fetching attendance data:', error);
			}
		};

		fetchAttendanceData();
	}, [selectedMonth, selectedSchoolYear, data]);

	// Ensure student lists are arrays
	const maleStudents = data.maleStudents ?? [];
	const femaleStudents = data.femaleStudents ?? [];
	const allStudents = [...maleStudents, ...femaleStudents];

	const getAttendanceForDay = (student: StudentData, day: number) => {
		if (
			attendanceMap &&
			attendanceMap[student.id] &&
			attendanceMap[student.id][day] !== undefined
		) {
			return attendanceMap[student.id][day];
		}
		return 'X';
	};

	const calculateMonthTotals = (student: StudentData) => {
		let present = 0;
		let absent = 0;

		for (let day = 1; day <= daysInMonth; day++) {
			const status = getAttendanceForDay(student, day);
			if (status === '' || status === 'E') {
				present++;
			} else if (status === 'X') {
				absent++;
			}
		}

		return { present, absent };
	};

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

	// Calculate Average Daily Attendance for a group of students
	const calculateAverageAttendance = (students: StudentData[]) => {
		if (students.length === 0) return 0;

		let totalDailyAttendance = 0;

		// For each working day in the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(yearToUse, monthIndex, day);
			if (!isWeekend(date)) {
				// Count present students for this day
				const presentCount = students.reduce((count, student) => {
					const status = getAttendanceForDay(student, day);
					return count + (status === '' || status === 'E' ? 1 : 0);
				}, 0);
				totalDailyAttendance += presentCount;
			}
		}

		return Math.round(totalDailyAttendance / workingDaysInMonth);
	};

	// Calculate Percentage of Attendance
	const calculateAttendancePercentage = (
		averageAttendance: number,
		totalStudents: number
	) => {
		if (totalStudents === 0) return 0;
		return Math.round((averageAttendance / totalStudents) * 100);
	};

	// Check for students with 5 consecutive absences
	const checkConsecutiveAbsences = (students: StudentData[]) => {
		return students.filter((student) => {
			let maxConsecutiveAbsences = 0;
			let currentConsecutiveAbsences = 0;

			for (let day = 1; day <= daysInMonth; day++) {
				const date = new Date(yearToUse, monthIndex, day);
				if (!isWeekend(date)) {
					const status = getAttendanceForDay(student, day);
					if (status === 'X') {
						currentConsecutiveAbsences++;
						maxConsecutiveAbsences = Math.max(
							maxConsecutiveAbsences,
							currentConsecutiveAbsences
						);
					} else {
						currentConsecutiveAbsences = 0;
					}
				}
			}

			return maxConsecutiveAbsences >= 5;
		}).length;
	};

	// Calculate metrics for display
	const maleAverageAttendance = calculateAverageAttendance(maleStudents);
	const femaleAverageAttendance = calculateAverageAttendance(femaleStudents);
	const totalAverageAttendance =
		maleAverageAttendance + femaleAverageAttendance;

	const maleAttendancePercentage = calculateAttendancePercentage(
		maleAverageAttendance,
		maleStudents.length
	);
	const femaleAttendancePercentage = calculateAttendancePercentage(
		femaleAverageAttendance,
		femaleStudents.length
	);
	const totalAttendancePercentage = calculateAttendancePercentage(
		totalAverageAttendance,
		allStudents.length
	);

	const maleConsecutiveAbsences = checkConsecutiveAbsences(maleStudents);
	const femaleConsecutiveAbsences = checkConsecutiveAbsences(femaleStudents);

	// Get supervisor name from class data
	const supervisorName = data.class?.supervisor
		? `${data.class.supervisor.name} ${data.class.supervisor.surname}`
		: 'N/A';

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
		table: {
			width: '100%',
			display: 'flex',
			borderStyle: 'solid',
			borderWidth: 1,
			borderRightWidth: 1,
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
		remarksHeader: {
			width: '15%',
			fontSize: 6,
			textAlign: 'center',
			padding: 4,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
			borderRightWidth: 0,
		},
		remarksCell: {
			width: '15%',
			textAlign: 'center',
			padding: 4,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRightWidth: 0,
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
		legendContainer: {
			marginTop: 20,
			borderWidth: 1,
			borderColor: '#000',
			padding: 10,
			width: '50%',
		},
		legendTitle: {
			fontSize: 12,
			fontWeight: 'bold',
			marginBottom: 5,
		},
		legendContent: {
			flexDirection: 'row',
		},
		legendColumn: {
			marginRight: 20,
		},
		legendText: {
			fontSize: 8,
		},
	});

	const renderDayColumns = () => {
		const columns = [];
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

	const renderStudentRow = (student: StudentData, index: number) => {
		const totals = calculateMonthTotals(student);

		return (
			<View key={student.id} style={styles.tableRow}>
				<Text style={[styles.tableCell, styles.noCell]}>{index + 1}.</Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`${student.surname.toUpperCase()}, ${student.name.toUpperCase()} ${
						student.middleName ? student.middleName.toUpperCase() : ''
					}`}
				</Text>

				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
					<Text
						key={`student-${student.id}-day-${day}`}
						style={[styles.tableCell, styles.dayCell]}>
						{day <= daysInMonth ? getAttendanceForDay(student, day) : ''}
					</Text>
				))}

				<Text style={[styles.tableCell, styles.totalCell]}>
					{totals.absent}
				</Text>
				<Text style={[styles.tableCell, styles.totalCell]}>
					{totals.present}
				</Text>

				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
			</View>
		);
	};

	const renderGenderTotalRow = (
		students: StudentData[],
		genderLabel: string
	) => {
		// No need to calculate attendance totals for this row
		const studentCount = students.length;

		return (
			<View style={[styles.tableRow, styles.totalRow]}>
				<Text style={[styles.tableCell, styles.noCell]}></Text>
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`${studentCount} <=== ${genderLabel}`}
				</Text>
				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
					<Text
						key={`total-${genderLabel.toLowerCase()}-day-${day}`}
						style={[styles.tableCell, styles.dayCell]}>
						{day <= daysInMonth ? calculateDayTotals(students, day) : ''}
					</Text>
				))}
				{/* Leave total cells blank */}
				<Text style={[styles.tableCell, styles.totalCell]}></Text> {/* Blank */}
				<Text style={[styles.tableCell, styles.totalCell]}></Text> {/* Blank */}
				{/* Leave remarks blank */}
				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
			</View>
		);
	};

	const renderCombinedTotalRow = () => {
		// No need to calculate attendance totals for this row
		const combinedCount = allStudents.length; // Use the already defined allStudents

		return (
			<View style={[styles.tableRow, styles.totalRow]}>
				<Text style={[styles.tableCell, styles.noCell]}></Text>{' '}
				{/* Show count */}
				<Text style={[styles.tableCell, styles.nameCell]}>
					{`${combinedCount} <=== COMBINED`} {/* Simplified label */}
				</Text>
				{/* Leave day cells blank */}
				{Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
					<Text
						key={`combined-total-day-${day}`}
						style={[styles.tableCell, styles.dayCell]}>
						{/* Blank */}
					</Text>
				))}
				{/* Leave total cells blank */}
				<Text style={[styles.tableCell, styles.totalCell]}></Text> {/* Blank */}
				<Text style={[styles.tableCell, styles.totalCell]}></Text> {/* Blank */}
				{/* Leave remarks blank */}
				<Text style={[styles.tableCell, styles.remarksCell]}></Text>
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
							School Form 2 Daily Attendance Report of Learners (SF2)
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
						<Text style={[styles.tableHeaderCell, styles.noCell]}>No.</Text>
						<Text style={[styles.tableHeaderCell, styles.nameCell]}>
							NAME{'\n'}(Last Name, First Name, Middle Name)
						</Text>

						{renderDayColumns()}

						<View
							style={{
								width: '6%',
								borderRightWidth: 1,
								borderRightColor: '#000000',
							}}>
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

						<Text style={styles.remarksHeader}>
							REMARKS
							{'\n'}
							(If &lt; 5 days present, please refer to legend numbers.{'\n'}If
							TRANSFERRED-OUT/IN/DROPPED, write the name of School)
						</Text>
					</View>

					{/* Male Students */}
					{maleStudents.map((student: StudentData, index: number) =>
						renderStudentRow(student, index)
					)}
					{renderGenderTotalRow(maleStudents, 'MALE')}

					{/* Female Students */}
					{femaleStudents.map((student: StudentData, index: number) =>
						renderStudentRow(student, index)
					)}
					{renderGenderTotalRow(femaleStudents, 'FEMALE')}

					{/* Combined Total */}
					{renderCombinedTotalRow()}
				</View>

				{/* Guidelines and Summary Container */}
				<View
					style={{
						marginTop: 20,
						flexDirection: 'row',
						borderWidth: 1,
						borderColor: '#000',
					}}>
					{/* Left Part - Guidelines */}
					<View
						style={{
							width: '50%',
							borderRightWidth: 1,
							borderRightColor: '#000',
							padding: 10,
						}}>
						<Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 5 }}>
							GUIDELINES:
						</Text>
						<Text style={{ fontSize: 7, marginBottom: 3 }}>
							1. The attendance shall be accomplished daily. Refer to the codes
							for checking learners' attendance.
						</Text>
						<Text style={{ fontSize: 7, marginBottom: 3 }}>
							2. Dates shall be written in the columns after Learner's Name.
						</Text>
						<Text style={{ fontSize: 7, marginBottom: 3 }}>
							3. To compute the following:
						</Text>

						{/* Formula a */}
						<View style={{ marginLeft: 15, marginBottom: 3 }}>
							<Text style={{ fontSize: 7 }}>a. Percentage of Enrolment =</Text>
							<View style={{ alignItems: 'center', marginVertical: 2 }}>
								<Text
									style={{
										fontSize: 7,
										borderBottomWidth: 1,
										borderBottomColor: '#000',
										paddingHorizontal: 5,
									}}>
									Registered Learners as of end of the month
								</Text>
								<Text style={{ fontSize: 7 }}>
									Enrolment as of 1st Friday of the school year
								</Text>
								<Text style={{ fontSize: 7 }}>x 100</Text>
							</View>
						</View>

						{/* Formula b */}
						<View style={{ marginLeft: 15, marginBottom: 3 }}>
							<Text style={{ fontSize: 7 }}>b. Average Daily Attendance =</Text>
							<View style={{ alignItems: 'center', marginVertical: 2 }}>
								<Text
									style={{
										fontSize: 7,
										borderBottomWidth: 1,
										borderBottomColor: '#000',
										paddingHorizontal: 5,
									}}>
									Total Daily Attendance
								</Text>
								<Text style={{ fontSize: 7 }}>
									Number of School Days in reporting month
								</Text>
							</View>
						</View>

						{/* Formula c */}
						<View style={{ marginLeft: 15, marginBottom: 3 }}>
							<Text style={{ fontSize: 7 }}>
								c. Percentage of Attendance for the month =
							</Text>
							<View style={{ alignItems: 'center', marginVertical: 2 }}>
								<Text
									style={{
										fontSize: 7,
										borderBottomWidth: 1,
										borderBottomColor: '#000',
										paddingHorizontal: 5,
									}}>
									Average daily attendance
								</Text>
								<Text style={{ fontSize: 7 }}>
									Registered Learners as of end of the month
								</Text>
								<Text style={{ fontSize: 7 }}>x 100</Text>
							</View>
						</View>

						<Text style={{ fontSize: 7, marginBottom: 3 }}>
							4. Every end of the month, the class adviser will submit this form
							to the office of the principal for recording of summary table into
							School Form 4. Once signed by the principal, this form should be
							returned to the adviser.
						</Text>
						<Text style={{ fontSize: 7, marginBottom: 3 }}>
							5. The adviser will provide necessary interventions including but
							not limited to home visitation to learners who were absent for 5
							consecutive days and/or those at risk of dropping out.
						</Text>
						<Text style={{ fontSize: 7 }}>
							6. Attendance performance of learners will be reflected in Form
							137 and Form 138 every grading period.
						</Text>
					</View>

					{/* Right Part - Split into Two Columns */}
					<View
						style={{
							width: '50%',
							flexDirection: 'row',
						}}>
						{/* Left Column of Right Part */}
						<View
							style={{
								width: '50%',
								borderRightWidth: 1,
								borderRightColor: '#000',
								padding: 10,
							}}>
							{/* Codes for Checking Attendance */}
							<View style={{ marginBottom: 10 }}>
								<Text
									style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}>
									1. CODES FOR CHECKING ATTENDANCE
								</Text>
								<Text style={{ fontSize: 7, marginLeft: 5 }}>
									(blank) - Present; (X)- Absent; (L) Tardy; (C) Cutting;{' '}
									{'{E}'} Excused
								</Text>
							</View>

							{/* Reasons/Causes for NLS */}
							<View>
								<Text
									style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}>
									2. REASONS/CAUSES FOR NLS
								</Text>

								{/* Domestic-Related Factors */}
								<View style={{ marginBottom: 8 }}>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										a. Domestic-Related Factors
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										a.1. Had to take care of siblings
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										a.2. Early marriage/pregnancy
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										a.3. Parents' attitude toward schooling
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										a.4. Family problems
									</Text>
								</View>

								{/* Individual-Related Factors */}
								<View style={{ marginBottom: 8 }}>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										b. Individual-Related Factors
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.1. Illness
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.2. Overage
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>b.3. Death</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.4. Drug Abuse
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.5. Poor academic performance
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.6. Lack of interest/Distractions
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										b.7. Hunger/Malnutrition
									</Text>
								</View>

								{/* School-Related Factors */}
								<View style={{ marginBottom: 8 }}>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										c. School-Related Factors
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										c.1. Teacher Factor
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										c.2. Physical condition of classroom
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										c.3. Peer influence
									</Text>
								</View>

								{/* Geographic/Environmental */}
								<View style={{ marginBottom: 8 }}>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										d. Geographic/Environmental
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										d.1. Distance between home and school
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										d.2. Armed conflict (incl. Tribal wars & clanfeuds)
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										d.3. Calamities/Disasters
									</Text>
								</View>

								{/* Financial-Related */}
								<View style={{ marginBottom: 8 }}>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										e. Financial-Related
									</Text>
									<Text style={{ fontSize: 7, marginLeft: 5 }}>
										e.1. Child labor, work
									</Text>
								</View>

								{/* Others */}
								<View>
									<Text style={{ fontSize: 7, fontWeight: 'bold' }}>
										f. Others (Specify)
									</Text>
								</View>
							</View>
						</View>

						{/* Right Column of Right Part */}
						<View
							style={{
								width: '50%',
								padding: 10,
							}}>
							{/* Summary Header */}
							<View style={{ flexDirection: 'row', marginBottom: 5 }}>
								<Text style={{ fontSize: 7, width: '40%' }}>
									Month: {selectedMonth}
								</Text>
								<Text style={{ fontSize: 7, width: '60%' }}>
									No. of Days of Classes: {workingDaysInMonth}
								</Text>
							</View>

							{/* Summary Table */}
							<View
								style={{
									borderWidth: 1,
									borderColor: '#000',
									marginBottom: 10,
								}}>
								{/* Table Header */}
								<View
									style={{
										flexDirection: 'row',
										borderBottomWidth: 1,
										borderColor: '#000',
										backgroundColor: '#f0f0f0',
									}}>
									<Text
										style={{
											fontSize: 7,
											width: '40%',
											padding: 2,
											borderRightWidth: 1,
											borderColor: '#000',
										}}></Text>
									<Text
										style={{
											fontSize: 7,
											width: '20%',
											padding: 2,
											borderRightWidth: 1,
											borderColor: '#000',
											textAlign: 'center',
										}}>
										M
									</Text>
									<Text
										style={{
											fontSize: 7,
											width: '20%',
											padding: 2,
											borderRightWidth: 1,
											borderColor: '#000',
											textAlign: 'center',
										}}>
										F
									</Text>
									<Text
										style={{
											fontSize: 7,
											width: '20%',
											padding: 2,
											textAlign: 'center',
										}}>
										TOTAL
									</Text>
								</View>

								{/* Table Rows */}
								{[
									{
										label: '* Enrolment as of (1st Friday of the SY)',
										male: maleStudents.length,
										female: femaleStudents.length,
										total: allStudents.length,
									},
									{
										label: 'Late enrolment during the month (beyond cut-off)',
										male: 0,
										female: 0,
										total: 0,
									},
									{
										label: 'Registered Learners as of end of month',
										male: maleStudents.length,
										female: femaleStudents.length,
										total: allStudents.length,
									},
									{
										label: 'Percentage of Enrolment as of end of month',
										male: '100%',
										female: '100%',
										total: '100%',
									},
									{
										label: 'Average Daily Attendance',
										male: maleAverageAttendance,
										female: femaleAverageAttendance,
										total: totalAverageAttendance,
									},
									{
										label: 'Percentage of Attendance for the month',
										male: `${maleAttendancePercentage}%`,
										female: `${femaleAttendancePercentage}%`,
										total: `${totalAttendancePercentage}%`,
									},
									{
										label: 'Number of students absent for 5 consecutive days',
										male: maleConsecutiveAbsences,
										female: femaleConsecutiveAbsences,
										total: maleConsecutiveAbsences + femaleConsecutiveAbsences,
									},
									{
										label: 'NLS',
										male: 0,
										female: 0,
										total: 0,
									},
									{
										label: 'Transferred Out¹',
										male: 0,
										female: 0,
										total: 0,
									},
									{
										label: 'Transferred In',
										male: 0,
										female: 0,
										total: 0,
									},
									{
										label: 'Shifted Out',
										male: 0,
										female: 0,
										total: 0,
									},
									{
										label: 'Shifted In',
										male: 0,
										female: 0,
										total: 0,
									},
								].map((row, index) => (
									<View
										key={index}
										style={{
											flexDirection: 'row',
											borderBottomWidth: index !== 11 ? 1 : 0,
											borderColor: '#000',
										}}>
										<Text
											style={{
												fontSize: 7,
												width: '40%',
												padding: 2,
												borderRightWidth: 1,
												borderColor: '#000',
											}}>
											{row.label}
										</Text>
										<Text
											style={{
												fontSize: 7,
												width: '20%',
												padding: 2,
												borderRightWidth: 1,
												borderColor: '#000',
												textAlign: 'center',
											}}>
											{row.male}
										</Text>
										<Text
											style={{
												fontSize: 7,
												width: '20%',
												padding: 2,
												borderRightWidth: 1,
												borderColor: '#000',
												textAlign: 'center',
											}}>
											{row.female}
										</Text>
										<Text
											style={{
												fontSize: 7,
												width: '20%',
												padding: 2,
												textAlign: 'center',
											}}>
											{row.total}
										</Text>
									</View>
								))}
							</View>

							{/* Certification Section */}
							<View style={{ marginTop: 20 }}>
								<Text
									style={{
										fontSize: 7,
										marginBottom: 15,
										textAlign: 'center',
									}}>
									I certify that this is a true and correct report.
								</Text>

								<View style={{ alignItems: 'center', marginBottom: 20 }}>
									<Text
										style={{
											fontSize: 7,
											textAlign: 'center',
											marginBottom: 2,
										}}>
										{supervisorName}
									</Text>
									<Text
										style={{
											fontSize: 7,
											borderTopWidth: 1,
											borderTopColor: '#000',
											paddingTop: 2,
											textAlign: 'center',
											width: '80%',
										}}>
										(Signature of Adviser over Printed Name)
									</Text>
								</View>

								<Text style={{ fontSize: 7, marginBottom: 5 }}>
									Attested by:
								</Text>

								<View style={{ alignItems: 'center', marginBottom: 10 }}>
									<Text
										style={{
											fontSize: 7,
											borderTopWidth: 1,
											borderTopColor: '#000',
											paddingTop: 2,
											textAlign: 'center',
											width: '80%',
										}}>
										(Signature of School Head over Printed Name)
									</Text>
								</View>

								<View style={{ marginTop: 20, alignItems: 'center' }}>
									<Text
										style={{
											fontSize: 7,
											textAlign: 'center',
											marginBottom: 2,
										}}>
										{loggedInUser}
									</Text>
									<Text
										style={{
											fontSize: 7,
											borderTopWidth: 1,
											borderTopColor: '#000',
											width: '80%',
											textAlign: 'center',
											paddingTop: 2,
										}}>
										Generated thru LIS
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default SF2Document;
