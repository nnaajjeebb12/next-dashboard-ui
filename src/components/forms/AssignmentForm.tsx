'use client';

import { createAssignment, updateAssignment } from '@/lib/actions';
import {
	assignmentSchema,
	AssignmentSchema,
} from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

const AssignmentForm = ({
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
	} = useForm<AssignmentSchema>({
		resolver: zodResolver(assignmentSchema),
	});

	// AFTER REACT 19 IT'LL BE USEACTIONSTATE

	const [state, formAction] = useFormState(
		type === 'create' ? createAssignment : updateAssignment,
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
				`Assignment has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);
	const { lessons } = relatedData;

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create'
					? 'Create a new assignment'
					: 'Update the assignment'}
			</h1>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Assignment Name"
					name="title"
					defaultValue={data?.title}
					register={register}
					error={errors?.title}
				/>
				<InputField
					label="Start Date"
					name="startDate"
					defaultValue={data?.startDate}
					register={register}
					error={errors?.startDate}
					type="date"
				/>
				<InputField
					label="Due Date"
					name="dueDate"
					defaultValue={data?.dueDate}
					register={register}
					error={errors?.dueDate}
					type="date"
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
				<div className="flex flex-col gap-2 w-full md:w-1/2">
					<label className="text-xs text-gray-500">Lesson</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('lessonId')}
						defaultValue={data?.lessonId}>
						{lessons.map((lesson: { id: number; name: string }) => (
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

export default AssignmentForm;
