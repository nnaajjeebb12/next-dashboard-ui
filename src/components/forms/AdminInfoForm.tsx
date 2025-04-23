'use client';

import {
	createAdmin,
	createTeacher,
	updateAdmin,
	updateTeacher,
} from '@/lib/actions';
import {
	adminSchema,
	AdminSchema,
	teacherSchema,
	TeacherSchema,
} from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import InputField from '../InputField';

const AdminInfoForm = ({
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
	} = useForm<AdminSchema>({
		resolver: zodResolver(adminSchema),
	});

	const [img, setImg] = useState<any>();

	const [state, formAction] = useFormState(
		type === 'create' ? createAdmin : updateAdmin,
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

	useEffect(() => {
		if (state.success) {
			toast.success(
				`Admin has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);
	const { subjects } = relatedData;

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create' ? 'Create a new admin' : 'Update the admin info'}
			</h1>
			<span className="text-xs text-gray-400 font-medium">
				Authentication Information
			</span>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Username"
					name="username"
					defaultValue={data?.username}
					register={register}
					error={errors.username}
				/>
				<InputField
					label="Password"
					name="password"
					type="password"
					defaultValue={data?.password}
					register={register}
					error={errors.password}
				/>
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

export default AdminInfoForm;
