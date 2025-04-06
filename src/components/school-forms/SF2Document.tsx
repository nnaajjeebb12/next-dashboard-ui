'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import { Student as ApiStudent, StudentResponse } from './types';
import { MONTHS, getNumberOfDays } from './utils';

// Define Props locally
interface SF2DocumentProps {
	data: StudentResponse;
	selectedSchoolYear: string;
	selectedMonth: (typeof MONTHS)[number];
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
}: SF2DocumentProps) => {
	// Define dimensions for landscape orientation
	const PAGE_HEIGHT = 1684.8; // 16.5 inches
	const PAGE_WIDTH = 1188; // 23.4 inches

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
				const monthIndex = MONTHS.indexOf(selectedMonth);
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

				// Ensure student lists are arrays
				const maleStudents = data.maleStudents ?? [];
				const femaleStudents = data.femaleStudents ?? [];
				const allStudents = [...maleStudents, ...femaleStudents];

				// Create student IDs string for the API
				const studentIds = allStudents.map((student) => student.id).join(',');

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
					const student = allStudents.find((s) => s.id === record.studentId);
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

	const renderLegend = () => (
		<View style={styles.legendContainer}>
			<Text style={styles.legendTitle}>LEGEND:</Text>
			<View style={styles.legendContent}>
				<View style={styles.legendColumn}>
					<Text style={styles.legendText}>(blank) - Present</Text>
					<Text style={styles.legendText}>X - Absent</Text>
				</View>
				<View style={styles.legendColumn}>
					<Text style={styles.legendText}>H - Holiday</Text>
					<Text style={styles.legendText}>E - Excused</Text>
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
							REMARKS (If &lt; 5 days present, please refer to legend numbers.
							If TRANSFERRED-OUT/IN/DROPPED, write the name of School)
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

				{/* Legend */}
				{renderLegend()}
			</Page>
		</Document>
	);
};

export default SF2Document;
