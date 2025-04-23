'use client';

import { createResult, updateResult } from '@/lib/actions';
import { resultSchema, ResultSchema } from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

const ResultForm = ({
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
	const [filteredLessons, setFilteredLessons] = useState<any[]>([]);
	const [selectedStudentId, setSelectedStudentId] = useState<string>(
		data?.studentId || ''
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ResultSchema>({
		resolver: zodResolver(resultSchema),
	});

	// Watch for changes in studentId
	const studentId = watch('studentId');
	const { students, lessons } = relatedData;

	useEffect(() => {
		if (type === 'update' && data) {
			setValue('lessonId', Number(data.lessonId));
			setValue('studentId', data.studentId);
		}
	}, [type, data, setValue]);

	useEffect(() => {
		if (type === 'create') {
			if (studentId) {
				const student = students.find((s: any) => s.id === studentId);
				if (student && student.class) {
					const studentLessons = student.class.lessons;
					setFilteredLessons(studentLessons);
				} else {
					setFilteredLessons([]);
				}
			}
		} else if (type === 'update') {
			// For update, use the lessons from relatedData and maintain the selected lesson
			const currentLesson = lessons.find(
				(lesson: any) => lesson.id === data?.lessonId
			);
			setFilteredLessons(currentLesson ? [currentLesson] : lessons);
		}
	}, [studentId, type, lessons, students, data]);

	// AFTER REACT 19 IT'LL BE USEACTIONSTATE

	const [state, formAction] = useFormState(
		type === 'create' ? createResult : updateResult,
		{
			success: false,
			error: false,
			message: '',
		}
	);

	const onSubmit = handleSubmit((data) => {
		formAction(data);
	});

	const router = useRouter();
	const isTeacherEditing = type === 'update' && userRole === 'teacher';

	useEffect(() => {
		if (state.success) {
			toast.success(
				`Result has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create' ? 'Create a new result' : 'Update the result'}
			</h1>

			{/* <div className="flex flex-col gap-2 w-full md:w-1/2"> */}
			<div
				className={
					isTeacherEditing ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/3'
				}>
				<label className="text-xs text-gray-500">Student</label>
				<select
					className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
					{...register('studentId')}
					defaultValue={data?.studentId}>
					{type === 'create' && <option value="">Select a Student</option>}
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
			<div
				className={
					isTeacherEditing ? 'hidden' : 'flex flex-col gap-2 w-full md:w-1/3'
				}>
				<label className="text-xs text-gray-500">Lesson</label>
				<select
					className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
					{...register('lessonId')}
					defaultValue={data?.lessonId}>
					{type === 'create' && <option value="">Select a Lesson</option>}
					{filteredLessons.map((lesson: { id: number; name: string }) => (
						<option value={lesson.id} key={lesson.id}>
							{lesson.name}
						</option>
					))}
				</select>
				{errors.lessonId?.message && (
					<p className="text-xs text-red-400">
						{errors.lessonId.message.toString()}
					</p>
				)}
			</div>
			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Q1 grade"
					name="q1"
					defaultValue={data?.q1}
					register={register}
					error={errors?.q1}
				/>
				<InputField
					label="Q2 grade"
					name="q2"
					defaultValue={data?.q2}
					register={register}
					error={errors?.q2}
				/>
				<InputField
					label="Q3 grade"
					name="q3"
					defaultValue={data?.q3}
					register={register}
					error={errors?.q3}
				/>
				<InputField
					label="Q4 grade"
					name="q4"
					defaultValue={data?.q4}
					register={register}
					error={errors?.q4}
				/>
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
			{state.error && (
				<span className="text-red-500">Something went wrong!</span>
			)}
			<button className="bg-blue-400 text-white p-2 rounded-md">
				{type === 'create' ? 'Create' : 'Update'}
			</button>
		</form>
	);
};

export default ResultForm;
