'use client';

import { createAttendance, updateAttendance } from '@/lib/actions';
import {
	AttendanceSchema,
	attendanceSchema,
} from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

type AttendanceFormProps = {
	type: 'create' | 'update';
	data?: any;
	setOpen: Dispatch<SetStateAction<boolean>>;
	relatedData?: {
		students?: { id: string; name: string; surname: string }[];
		lessons?: { id: number; name: string }[];
	};
};

const AttendanceForm = ({
	type,
	data,
	setOpen,
	relatedData,
}: AttendanceFormProps) => {
	const router = useRouter();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AttendanceSchema>({
		resolver: zodResolver(attendanceSchema),
		defaultValues: data ?? {
			present: false,
		},
	});

	const initialState = { success: false, error: false };
	const [state, formAction] = useFormState(
		type === 'create' ? createAttendance : updateAttendance,
		initialState
	);

	useEffect(() => {
		if (state.success) {
			toast.success(
				`Attendance ${type === 'create' ? 'recorded' : 'updated'} successfully!`
			);
			reset();
			setOpen(false);
			router.refresh();
		}

		if (state.error) {
			toast.error('Something went wrong!');
		}
	}, [state, reset, router, setOpen, type]);

	const onSubmit = (data: AttendanceSchema) => {
		const formData = new FormData();
		for (const [key, value] of Object.entries(data)) {
			formData.append(key, value.toString());
		}
		formAction(data);
	};

	return (
		<form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
			<h1 className="text-xl font-semibold">
				{type === 'create'
					? 'Create a new attendance'
					: 'Update the attendance'}
			</h1>
			<div className="flex justify-between flex-wrap gap-4 ">
				<InputField
					label="Date"
					name="date"
					defaultValue={data?.date}
					register={register}
					error={errors?.date}
					type="date"
				/>
				<div className="flex flex-col gap-2 w-full md:w-1/3">
					<label className="text-xs text-gray-500">Student</label>
					<select
						id="studentId"
						{...register('studentId')}
						className="border border-gray-300 p-2 rounded-md">
						{relatedData?.students?.map((student) => (
							<option key={student.id} value={student.id}>
								{student.name} {student.surname}
							</option>
						))}
					</select>
					{errors.studentId?.message && (
						<p className="text-xs text-red-400">
							{errors.studentId.message.toString()}
						</p>
					)}
				</div>

				<div className="flex flex-col gap-2 w-full md:w-1/3">
					<label className="text-xs text-gray-500">Lesson</label>
					<select
						id="lessonId"
						{...register('lessonId')}
						className="border border-gray-300 p-2 rounded-md">
						<option value="">Select Lesson</option>
						{relatedData?.lessons?.map((lesson) => (
							<option key={lesson.id} value={lesson.id}>
								{lesson.name}
							</option>
						))}
					</select>
					{errors.studentId?.message && (
						<p className="text-xs text-red-400">
							{errors.studentId.message.toString()}
						</p>
					)}
				</div>

				<div className="flex items-center gap-2">
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
				</div>

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
