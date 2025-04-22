'use client';

import { updateAttendanceStatus } from './forms/AttendanceForm';

interface AttendanceRadioProps {
	studentId: string;
	currentStatus?: string;
	date: string;
}

const AttendanceRadio = ({
	studentId,
	currentStatus,
	date,
}: AttendanceRadioProps) => {
	return (
		<div className="flex items-center gap-4">
			<label className="inline-flex items-center">
				<input
					type="radio"
					name={`attendance-${studentId}`}
					value="1"
					defaultChecked={currentStatus === '1'}
					className="form-radio h-4 w-4 text-blue-600"
					onChange={(e) => {
						if (e.target.checked) {
							updateAttendanceStatus(studentId, '1', date);
						}
					}}
				/>
				<span className="ml-2">Present</span>
			</label>
			<label className="inline-flex items-center">
				<input
					type="radio"
					name={`attendance-${studentId}`}
					value="0"
					defaultChecked={currentStatus === '0'}
					className="form-radio h-4 w-4 text-red-600"
					onChange={(e) => {
						if (e.target.checked) {
							updateAttendanceStatus(studentId, '0', date);
						}
					}}
				/>
				<span className="ml-2">Absent</span>
			</label>
			<label className="inline-flex items-center">
				<input
					type="radio"
					name={`attendance-${studentId}`}
					value="E"
					defaultChecked={currentStatus === 'E'}
					className="form-radio h-4 w-4 text-yellow-600"
					onChange={(e) => {
						if (e.target.checked) {
							updateAttendanceStatus(studentId, 'E', date);
						}
					}}
				/>
				<span className="ml-2">Excused</span>
			</label>
		</div>
	);
};

export default AttendanceRadio;
