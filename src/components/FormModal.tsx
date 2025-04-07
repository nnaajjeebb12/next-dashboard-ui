'use client';

import {
	deleteAdmin,
	deleteAssignment,
	deleteAttendance,
	deleteClass,
	deleteExam,
	deleteLesson,
	deleteResult,
	deleteStrand,
	deleteStudent,
	deleteSubject,
	deleteTeacher,
} from '@/lib/actions';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { toast } from 'react-toastify';
import { FormContainerProps } from './FormContainer';

const deleteActionMap = {
	subject: deleteSubject,
	student: deleteStudent,
	class: deleteClass,
	teacher: deleteTeacher,
	parent: deleteSubject,
	lesson: deleteLesson,
	exam: deleteExam,
	assignment: deleteAssignment,
	result: deleteResult,
	attendance: deleteAttendance,
	event: deleteSubject,
	announcement: deleteSubject,
	strand: deleteStrand,
	admin: deleteAdmin,
};

// import StudentForm from './forms/StudentForm';
// import TeacherForm from './forms/TeacherForm';

const TeacherForm = dynamic(() => import('./forms/TeacherForm'), {
	loading: () => <h1>Loading...</h1>,
});

const StudentForm = dynamic(() => import('./forms/StudentForm'), {
	loading: () => <h1>Loading...</h1>,
});

const SubjectForm = dynamic(() => import('./forms/SubjectForm'), {
	loading: () => <h1>Loading...</h1>,
});

const ClassForm = dynamic(() => import('./forms/ClassForm'), {
	loading: () => <h1>Loading...</h1>,
});

const EventForm = dynamic(() => import('./forms/EventForm'), {
	loading: () => <h1>Loading...</h1>,
});

const StrandForm = dynamic(() => import('./forms/StrandForm'), {
	loading: () => <h1>Loading...</h1>,
});

const ExamForm = dynamic(() => import('./forms/ExamForm'), {
	loading: () => <h1>Loading...</h1>,
});

const LessonForm = dynamic(() => import('./forms/LessonForm'), {
	loading: () => <h1>Loading...</h1>,
});

const AssignmentForm = dynamic(() => import('./forms/AssignmentForm'), {
	loading: () => <h1>Loading...</h1>,
});

const AttendanceForm = dynamic(() => import('./forms/AttendanceForm'), {
	loading: () => <h1>Loading...</h1>,
});

const ResultForm = dynamic(() => import('./forms/ResultForm'), {
	loading: () => <h1>Loading...</h1>,
});

const AdminInfoForm = dynamic(() => import('./forms/AdminInfoForm'), {
	loading: () => <h1>Loading...</h1>,
});

const forms: {
	[key: string]: (
		setOpen: Dispatch<SetStateAction<boolean>>,
		type: 'create' | 'update',
		data?: any,
		relatedData?: any,
		userRole?: string,
		currentUserId?: number | string
	) => JSX.Element;
} = {
	subject: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<SubjectForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	class: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<ClassForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	teacher: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<TeacherForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	strand: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<StrandForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	student: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<StudentForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	exam: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<ExamForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	lesson: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<LessonForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	assignment: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<AssignmentForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	attendance: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<AttendanceForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	result: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<ResultForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
	admin: (setOpen, type, data, relatedData, userRole, currentUserId) => (
		<AdminInfoForm
			type={type}
			data={data}
			setOpen={setOpen}
			relatedData={relatedData}
			userRole={userRole}
			currentUserId={currentUserId}
		/>
	),
};

const FormModal = ({
	table,
	type,
	data,
	id,
	relatedData,
	userRole,
	currentUserId,
}: FormContainerProps & { relatedData?: any }) => {
	const size = type === 'create' ? 'w-8 h-8' : 'w-7 h-7';
	const bgColor =
		type === 'create'
			? 'bg-najYellow'
			: type === 'update'
			? 'bg-najSky'
			: 'bg-najPurple';

	const [open, setOpen] = useState(false);

	const Form = () => {
		const [state, formAction] = useFormState(deleteActionMap[table], {
			success: false,
			error: false,
			message: '',
		});

		const router = useRouter();

		useEffect(() => {
			if (state.success) {
				toast.success(`${table} has been deleted!`);
				setOpen(false);
				router.refresh();
			}
		}, [state]);

		return type === 'delete' && id ? (
			<form action={formAction} className="p-4 flex flex-col gap-4">
				<input type="text | number" name="id" value={id} hidden />
				<span className="text-center font-medium">
					All data will be lost. Are you sure you want to delete this {table}?
				</span>
				<button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
					Delete
				</button>
			</form>
		) : type === 'create' || type === 'update' ? (
			forms[table](setOpen, type, data, relatedData, userRole, currentUserId)
		) : (
			'Form not found!'
		);
	};

	return (
		<>
			<button
				className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
				onClick={() => setOpen(true)}>
				<Image src={`/${type}.png`} alt="" width={16} height={16} />
			</button>
			{/* {open && (
				<div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
					<div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
						<Form />
						<div
							className="absolute top-4 right-4 cursor-pointer"
							onClick={() => setOpen(false)}>
							<Image src="/close.png" alt="" width={14} height={14} />
						</div>
					</div>
				</div>
			)} */}
			{open && (
				<div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center overflow-hidden">
					<div className="bg-white rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] flex flex-col">
						<div className="p-4 overflow-y-auto flex-grow">
							<Form />
						</div>
						<div
							className="absolute top-4 right-4 cursor-pointer"
							onClick={() => setOpen(false)}>
							<Image src="/close.png" alt="" width={14} height={14} />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default FormModal;
