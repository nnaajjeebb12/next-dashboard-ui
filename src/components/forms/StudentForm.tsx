'use client';

import {
	createStudent,
	createTeacher,
	updateStudent,
	updateTeacher,
} from '@/lib/actions';
import { studentSchema, StudentSchema } from '@/lib/formValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import InputField from '../InputField';

const StudentForm = ({
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
	} = useForm<StudentSchema>({
		resolver: zodResolver(studentSchema),
	});

	const [img, setImg] = useState<any>();

	const [state, formAction] = useFormState(
		type === 'create' ? createStudent : updateStudent,
		{
			success: false,
			error: false,
			message: '',
		}
	);

	const onSubmit = handleSubmit((data) => {
		formAction({ ...data, img: img?.secure_url });
	});

	const router = useRouter();

	useEffect(() => {
		console.log(data);
		if (state.success) {
			toast.success(
				`Student has been ${type === 'create' ? 'created' : 'updated'}!`
			);
			setOpen(false);
			router.refresh();
		} else if (state.error && state.message) {
			toast.error(state.message);
		}
	}, [state, type, setOpen, router]);
	const { grades, classes, strands } = relatedData;

	return (
		<form className="flex flex-col gap-8" onSubmit={onSubmit}>
			<h1 className="text-xl font-semibold">
				{type === 'create' ? 'Create a new student' : 'Update the student info'}
			</h1>
			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Learner Reference Number"
					name="lrn"
					defaultValue={data?.lrn}
					register={register}
					error={errors.lrn}
				/>
			</div>
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
					label="Email"
					name="email"
					type="email"
					defaultValue={data?.email}
					register={register}
					error={errors.email}
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
			<span className="text-xs text-gray-400 font-medium">
				School Information
			</span>

			<div className="flex items-center gap-4">
				{/* Display the uploaded image as a circle */}
				{/* {img ? (
					<div className="flex items-center">
						<div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
							<Image
								src={img.secure_url}
								defaultValue={data?.img}
								alt="Uploaded profile"
								width={28}
								height={28}
								quality={90}
								priority={true}
								className="w-16 h-16 rounded-full object-cover"
								unoptimized={true}
							/>
						</div>
					</div>
				) : (
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
						<span className="text-xs text-gray-400">No image</span>
					</div>
				)} */}
				{data?.img ? (
					<div className="flex items-center">
						<div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
							<Image
								src={img ? img.secure_url : data.img}
								alt="Profile image"
								width={64}
								height={64}
								quality={90}
								priority={true}
								className="w-full h-full object-cover"
								unoptimized={true}
							/>
						</div>
					</div>
				) : img ? (
					<div className="flex items-center">
						<div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200">
							<Image
								src={img.secure_url}
								alt="Uploaded profile"
								width={64}
								height={64}
								quality={90}
								priority={true}
								className="w-full h-full object-cover"
								unoptimized={true}
							/>
						</div>
					</div>
				) : (
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
						<span className="text-xs text-gray-400">No image</span>
					</div>
				)}
				<CldUploadWidget
					uploadPreset="school"
					options={{
						sources: ['local', 'camera'],
						multiple: false,
						maxFiles: 1,
						clientAllowedFormats: ['jpg', 'jpeg', 'png'],
					}}
					onSuccess={(result, { widget }) => {
						setImg(result.info);
						widget.close();
					}}>
					{({ open }) => {
						return (
							<div
								className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
								onClick={() => open()}>
								<Image
									src="/upload.png"
									alt=""
									width={28}
									height={28}
									className=""
								/>
								<span className="">Upload a profile photo</span>
							</div>
						);
					}}
				</CldUploadWidget>
			</div>

			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="First Name"
					name="name"
					defaultValue={data?.name}
					register={register}
					error={errors.name}
				/>
				<InputField
					label="Middle Name"
					name="middleName"
					defaultValue={data?.middleName}
					register={register}
					error={errors.middleName}
				/>
				<InputField
					label="Last Name"
					name="surname"
					defaultValue={data?.surname}
					register={register}
					error={errors.surname}
				/>
				<InputField
					label="Phone Number"
					name="phone"
					defaultValue={data?.phone}
					register={register}
					error={errors.phone}
				/>
				<InputField
					label="House Number"
					name="address"
					defaultValue=""
					register={register}
					error={errors.address}
				/>
				<InputField
					label="Street"
					name="purok"
					defaultValue={data?.purok}
					register={register}
					error={errors.purok}
				/>
				<InputField
					label="Barangay"
					name="brgy"
					defaultValue={data?.brgy}
					register={register}
					error={errors.brgy}
				/>
				<InputField
					label="City"
					name="city"
					defaultValue={data?.city}
					register={register}
					error={errors.city}
				/>
				<InputField
					label="Province"
					name="province"
					defaultValue={data?.province}
					register={register}
					error={errors.province}
				/>
				<InputField
					label="Blood Type"
					name="bloodType"
					defaultValue={data?.bloodType}
					register={register}
					error={errors.bloodType}
				/>
				<InputField
					label="Birthday"
					name="birthday"
					defaultValue={data?.birthday.toISOString().split('T')[0]}
					register={register}
					error={errors.birthday}
					type="date"
				/>
				{/* <InputField
					label="Parent"
					name="parentId"
					defaultValue={data?.parentId}
					register={register}
					error={errors.parentId}
					type="string"
				/> */}
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
					<label className="text-xs text-gray-500">Grade</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('gradeId')}
						defaultValue={data?.gradeId}>
						{grades.map((grade: { id: number; level: number }) => (
							<option value={grade.id} key={grade.id}>
								{grade.level}
							</option>
						))}
					</select>
					{errors.gradeId?.message && (
						<p className=" text-xs text-red-400">
							{errors.gradeId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Section</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('classId')}
						defaultValue={data?.classId}>
						{classes.map(
							(classItem: {
								id: number;
								name: string;
								capacity: number;
								_count: { students: number };
							}) => (
								<option value={classItem.id} key={classItem.id}>
									{classItem.name} -{' '}
									{classItem._count.students + '/' + classItem.capacity}{' '}
									Capacity
								</option>
							)
						)}
					</select>
					{errors.classId?.message && (
						<p className=" text-xs text-red-400">
							{errors.classId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Strand</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('strandId')}
						defaultValue={data?.strandId}>
						{strands.map((strand: { id: number; name: string }) => (
							<option value={strand.id} key={strand.id}>
								{strand.name}
							</option>
						))}
					</select>
					{errors.strandId?.message && (
						<p className=" text-xs text-red-400">
							{errors.strandId.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Gender</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('sex')}
						defaultValue={data?.sex}>
						<option value="MALE">Male</option>
						<option value="FEMALE">Female</option>
					</select>
					{errors.sex?.message && (
						<p className=" text-xs text-red-400">
							{errors.sex.message.toString()}
						</p>
					)}
				</div>
				<InputField
					label="Religion"
					name="religion"
					defaultValue={data?.religion}
					register={register}
					error={errors.religion}
				/>
			</div>
			<span className="text-xs text-gray-400 font-medium">
				Personal Information
			</span>
			<div className="flex justify-between flex-wrap gap-4">
				<InputField
					label="Father's Name"
					name="fatherName"
					defaultValue={data?.fatherName}
					register={register}
					error={errors.fatherName}
				/>
				<InputField
					label="Father's Middle Name"
					name="fatherMiddleName"
					defaultValue={data?.fatherMiddleName}
					register={register}
					error={errors.fatherMiddleName}
				/>
				<InputField
					label="Father's Surname"
					name="fatherSurname"
					defaultValue={data?.fatherSurname}
					register={register}
					error={errors.fatherSurname}
				/>
				<InputField
					label="Mother's Name"
					name="motherName"
					defaultValue={data?.motherName}
					register={register}
					error={errors.motherName}
				/>
				<InputField
					label="Mother's Maiden Name"
					name="motherMiddleName"
					defaultValue={data?.motherMiddleName}
					register={register}
					error={errors.motherMiddleName}
				/>
				<InputField
					label="Mother's Surname"
					name="motherSurname"
					defaultValue={data?.motherSurname}
					register={register}
					error={errors.motherSurname}
				/>
				<InputField
					label="Guardian's Name"
					name="guardianName"
					defaultValue={data?.guardianName}
					register={register}
					error={errors.guardianName}
				/>
				<InputField
					label="Guardian's Middle Name"
					name="guardianMiddleName"
					defaultValue={data?.guardianMiddleName}
					register={register}
					error={errors.guardianMiddleName}
				/>
				<InputField
					label="Guardian's Surname"
					name="guardianSurname"
					defaultValue={data?.guardianSurname}
					register={register}
					error={errors.guardianSurname}
				/>
				<InputField
					label="Relationship to Guardian"
					name="guardianRelation"
					defaultValue={data?.guardianRelation}
					register={register}
					error={errors.guardianRelation}
				/>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Learning Modal</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('learningModal')}
						defaultValue={data?.learningModal}>
						<option value="face-to-face">Face to face</option>
						<option value="online-class">Online Class</option>
					</select>
					{errors.learningModal?.message && (
						<p className=" text-xs text-red-400">
							{errors.learningModal.message.toString()}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-2 w-full md:w-1/4">
					<label className="text-xs text-gray-500">Remarks</label>
					<select
						className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
						{...register('remarks')}
						defaultValue={data?.remarks}>
						<option value="None">None</option>
						<option value="T/O">Transfered Out</option>
						<option value="T/I">Transfered In</option>
						<option value="CCT">CCT Receipient</option>
						<option value="B/A">Balik Aral</option>
						<option value="LWE">Learner With Exceptionality</option>
						<option value="ACL">Accelerated</option>
					</select>
					{errors.remarks?.message && (
						<p className=" text-xs text-red-400">
							{errors.remarks.message.toString()}
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

export default StudentForm;
