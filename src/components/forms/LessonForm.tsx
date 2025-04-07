'use client';

import { createLesson, updateLesson } from '@/lib/actions';
import { lessonSchema, LessonSchema } from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Day } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

const LessonForm = ({
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
	const [dayOfWeek, setDayOfWeek] = useState<Day>(data?.day || 'MONDAY');

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<LessonSchema>({
		resolver: zodResolver(lessonSchema),
		defaultValues: {
			day: data?.day || 'MONDAY',
		},
	});

	// Watch the startTime field
	const startTime = watch('startTime');

	// Update day of week whenever startTime changes
	useEffect(() => {
		if (startTime) {
			const date = new Date(startTime);
			if (!isNaN(date.getTime())) {
				const dayNumber = date.getDay();
				let newDay: Day = 'MONDAY'; // Default to Monday

				switch (dayNumber) {
					case 1:
						newDay = 'MONDAY';
						break;
					case 2:
						newDay = 'TUESDAY';
						break;
					case 3:
						newDay = 'WEDNESDAY';
						break;
					case 4:
						newDay = 'THURSDAY';
						break;
					case 5:
						newDay = 'FRIDAY';
						break;
					// case 0:
					// 	newDay = 'SUNDAY';
					// 	break;
					// case 6:
					// 	newDay = 'SATURDAY';
					// 	break;
				}

				setValue('day', newDay);
				setDayOfWeek(newDay);
			}
		}
	}, [startTime, setValue]);

	const [state, formAction] = useFormState(
		type === 'create' ? createLesson : updateLesson,
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

	useEffect(() => {
		if (state.success) {
			toast.success(
				`Lesson has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);

	const { subjects, sections, teachers } = relatedData;

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create' ? 'Create a new lesson' : 'Update the lesson'}
			</h1>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Lesson Name"
					name="name"
					defaultValue={data?.name}
					register={register}
					error={errors?.name}
				/>
				<InputField
					label="Start Time"
					name="startTime"
					defaultValue={data?.startTime}
					register={register}
					error={errors?.startTime}
					type="dateTime-local"
				/>
				<InputField
					label="End Time"
					name="endTime"
					defaultValue={data?.endTime}
					register={register}
					error={errors?.endTime}
					type="dateTime-local"
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
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Lesson Day</label>
					<input
						type="text"
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100"
						value={dayOfWeek}
						disabled
					/>
					<input type="hidden" {...register('day')} value={dayOfWeek} />
					{errors.day?.message && (
						<p className="text-xs text-red-400">
							{errors.day.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/2">
					<label className="text-xs text-gray-500">Subject</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('subjectId')}
						defaultValue={data?.subjectId}>
						{subjects.map((subject: { id: number; name: string }) => (
							<option value={subject.id} key={subject.id}>
								{subject.name}
							</option>
						))}
					</select>
					{errors.subjectId?.message && (
						<p className="text-xs text-red-400">
							{errors.subjectId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/2">
					<label className="text-xs text-gray-500">Section</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('classId')}
						defaultValue={data?.classId}>
						{sections.map((section: { id: number; name: string }) => (
							<option value={section.id} key={section.id}>
								{section.name}
							</option>
						))}
					</select>
					{errors.classId?.message && (
						<p className="text-xs text-red-400">
							{errors.classId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/2">
					<label className="text-xs text-gray-500">Teacher</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('teacherId')}
						defaultValue={data?.teacherId}>
						{teachers.map(
							(teacher: { id: string; name: string; surname: string }) => (
								<option value={teacher.id} key={teacher.id}>
									{teacher.name + ' ' + teacher.surname}
								</option>
							)
						)}
					</select>
					{errors.teacherId?.message && (
						<p className="text-xs text-red-400">
							{errors.teacherId.message.toString()}
						</p>
					)}
				</div>
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

export default LessonForm;
