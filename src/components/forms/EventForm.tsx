'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import InputField from '../InputField';

const schema = z.object({
	eventName: z
		.string()
		.min(3, { message: 'Event Name must be at least 3 characters' })
		.max(20, { message: 'Maximum of 20 character only' }),
	section: z.string().min(1, { message: 'Section is required!' }),
	date: z.date({ message: 'Date is required!' }),
});

type Inputs = z.infer<typeof schema>;

const EventForm = ({
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

	const onSubmit = handleSubmit((data) => {});
	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">Add a new Event</h1>
			<span className="text-xs text-gray-400 font-medium">
				Event Information
			</span>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Event Name"
					name="eventName"
					defaultValue={data?.eventName}
					register={register}
					error={errors.eventName}
				/>
				<InputField
					label="Section"
					name="section"
					defaultValue={data?.section}
					register={register}
					error={errors.section}
				/>
				<InputField
					label="Date"
					name="date"
					defaultValue={data?.date}
					register={register}
					error={errors.date}
					type="date"
				/>
			</div>
			<button className="bg-blue-400 text-white p-2 rounded-md">
				{type === 'create' ? 'Create' : 'Update'}
			</button>
		</form>
	);
};

export default EventForm;
