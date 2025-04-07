'use client';

import { createAttendance, updateAttendance } from '@/lib/actions';
import {
	AttendanceSchema,
	attendanceSchema,
} from '@/lib/formValidationSchemas';
import { formatDateForInput } from '@/lib/settings';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

const AttendanceForm = ({
	type,
	data,
	setOpen,
	relatedData,
	userRole,
	currentUserId,
}: {
	type: 'create' | 'update';
	data?: any;
	setOpen: Dispatch<SetStateAction<boolean>>;
	relatedData?: any;
	userRole?: string;
	currentUserId?: number | string;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AttendanceSchema>({
		resolver: zodResolver(attendanceSchema),
	});

	// AFTER REACT 19 IT'LL BE USEACTIONSTATE

	const [state, formAction] = useFormState(
		type === 'create' ? createAttendance : updateAttendance,
		{
			success: false,
			error: false,
			message: '',
		}
	);

	const onSubmit = handleSubmit((data) => {
		// console.log(data);
		formAction(data);
	});

	const router = useRouter();
	const isTeacherEditing = type === 'update' && userRole === 'teacher';

	useEffect(() => {
		if (state.success) {
			toast.success(
				`Attendance has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);

	const { students } = relatedData;

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create'
					? 'Create a new attendance'
					: 'Update the attendance'}
			</h1>
			<div className="flex justify-between flex-wrap gap-4 ">
				<InputField
					label="Date"
					name="date"
					defaultValue={formatDateForInput(data?.date)}
					register={register}
					error={errors?.date}
					type="date"
					hidden={isTeacherEditing}
				/>
				<div
					className={
						isTeacherEditing ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/3'
					}>
					<label className="text-xs text-gray-500">Student</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('studentId')}
						defaultValue={data?.studentId}>
						{students.map(
							(student: { id: string; name: string; surname: string }) => (
								<option value={student.id} key={student.id}>
									{student.name + ' ' + student.surname}
								</option>
							)
						)}
					</select>
					{errors.studentId?.message && (
						<p className="text-xs text-red-400">
							{errors.studentId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Semester</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('semester')}
						defaultValue={data?.semester}>
						<option value="1st Semester">1st Semester</option>
						<option value="2nd Semester">2nd Semester</option>
					</select>
					{errors.semester?.message && (
						<p className=" text-xs text-red-400">
							{errors.semester.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full">
					<label className="text-xs text-gray-500">Attendance Status</label>
					<div className="flex flex-wrap gap-4">
						<div className="flex items-center gap-1">
							<input
								id="status-present"
								type="radio"
								value="1"
								{...register('status')}
								className="w-4 h-4"
								defaultChecked={!data || data?.status === '1'}
							/>
							<label htmlFor="status-present" className="text-sm">
								Present
							</label>
						</div>

						<div className="flex items-center gap-1">
							<input
								id="status-absent"
								type="radio"
								value="0"
								{...register('status')}
								className="w-4 h-4"
								defaultChecked={data?.status === '0'}
							/>
							<label htmlFor="status-absent" className="text-sm">
								Absent
							</label>
						</div>

						<div className="flex items-center gap-1">
							<input
								id="status-excused"
								type="radio"
								value="E"
								{...register('status')}
								className="w-4 h-4"
								defaultChecked={data?.status === 'E'}
							/>
							<label htmlFor="status-excused" className="text-sm">
								Excused
							</label>
						</div>

						<div className="flex items-center gap-1">
							<input
								id="status-holiday"
								type="radio"
								value="H"
								{...register('status')}
								className="w-4 h-4"
								defaultChecked={data?.status === 'H'}
							/>
							<label htmlFor="status-holiday" className="text-sm">
								Holiday
							</label>
						</div>
					</div>
					{errors.status && (
						<span className="text-red-500 text-sm">
							{errors.status.message?.toString()}
						</span>
					)}
				</div>

				{/* <div className="flex items-center gap-2">
					<label htmlFor="present" className="font-medium">
						Present
					</label>
					<input
						id="present"
						type="checkbox"
						{...register('present')}
						className="w-4 h-4"
					/>
					{errors.present && (
						<span className="text-red-500 text-sm">
							{errors.present.message}
						</span>
					)}
				</div> */}

				{data && (
					<InputField
						label="Id"
						name="id"
						defaultValue={data?.id}
						register={register}
						error={errors?.id}
						hidden
					/>
				)}
			</div>

			<button
				type="submit"
				className="bg-blue-600 text-white py-2 px-4 rounded-md border-none">
				{type === 'create' ? 'Create' : 'Update'} Attendance
			</button>
		</form>
	);
};

export default AttendanceForm;
