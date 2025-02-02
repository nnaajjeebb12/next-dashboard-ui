'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputField from '../InputField';

const schema = z.object({
	subjectName: z
		.string()
		.min(3, { message: 'Subject Name must be at least 3 characters' })
		.max(20, { message: 'Maximum of 20 character only' }),
	teacherName: z.string().min(1, { message: 'Teacher name is required!' }),
});

type Inputs = z.infer<typeof schema>;

const SubjectForm = ({
	type,
	data,
}: {
	type: 'create' | 'update';
	data?: any;
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		resolver: zodResolver(schema),
	});

	const onSubmit = handleSubmit((date) => {
		console.log({ data });
	});
	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">Add a new Subject</h1>
			<span className="text-xs text-gray-400 font-medium">
				Subject Information
			</span>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Subject Name"
					name="subjectName"
					defaultValue={data?.subjectName}
					register={register}
					error={errors.subjectName}
				/>
				<InputField
					label="Teacher Name"
					name="teacherName"
					defaultValue={data?.teacherName}
					register={register}
					error={errors.teacherName}
				/>
			</div>
			<button className="bg-blue-400 text-white p-2 rounded-md">
				{type === 'create' ? 'Create' : 'Update'}
			</button>
		</form>
	);
};

export default SubjectForm;
