'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { Strand } from '@prisma/client';
import { error } from 'console';
import { revalidatePath } from 'next/cache';
import {
	ClassSchema,
	StrandSchema,
	StudentSchema,
	SubjectSchema,
	TeacherSchema,
} from './formValidationSchemas';
import prisma from './prisma';

type CurrentState = { success: boolean; error: boolean };

// SUBJECT
export const createSubject = async (
	currentState: CurrentState,
	data: SubjectSchema
) => {
	try {
		await prisma.subject.create({
			data: {
				name: data.name,
				teachers: {
					connect: data.teachers.map((teacherId) => ({ id: teacherId })),
				},
			},
		});

		// revalidatePath("/list/subjects");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateSubject = async (
	currentState: CurrentState,
	data: SubjectSchema
) => {
	try {
		await prisma.subject.update({
			where: {
				id: data.id,
			},
			data: {
				name: data.name,
				teachers: {
					set: data.teachers.map((teacherId) => ({ id: teacherId })),
				},
			},
		});

		// revalidatePath('/list/subjects');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteSubject = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;
	try {
		await prisma.subject.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/subjects');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// CLASS
export const createClass = async (
	currentState: CurrentState,
	data: ClassSchema
) => {
	try {
		await prisma.class.create({
			data,
		});

		// revalidatePath("/list/class");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateClass = async (
	currentState: CurrentState,
	data: ClassSchema
) => {
	try {
		await prisma.class.update({
			where: {
				id: data.id,
			},
			data,
		});

		// revalidatePath('/list/class');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteClass = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;
	try {
		await prisma.class.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/class');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// TEACHER
export const createTeacher = async (
	currentState: CurrentState,
	data: TeacherSchema
) => {
	let clerkUser;
	const client = await clerkClient();
	try {
		clerkUser = await client.users.createUser({
			username: data.username,
			password: data.password,
			firstName: data.name,
			lastName: data.surname,
			publicMetadata: { role: 'teacher' },
		});

		await prisma.teacher.create({
			data: {
				id: clerkUser.id,
				username: data.username,
				name: data.name,
				surname: data.surname,
				email: data.email || null,
				phone: data.phone || null,
				address: data.address,
				img: data.img || null,
				bloodType: data.bloodType,
				sex: data.sex,
				birthday: data.birthday,
				subjects: {
					connect: data.subjects?.map((subjectId: string) => ({
						id: parseInt(subjectId),
					})),
				},
			},
		});

		// revalidatePath("/list/teacher");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		console.log('clerkid = ' + clerkUser?.id);
		if (clerkUser) {
			try {
				await client.users.deleteUser(clerkUser.id);
			} catch (deleteErr) {
				console.log(
					'Failed to delete Clerk user after teacher creation failure:',
					deleteErr
				);
			}
		}
		return { success: false, error: true };
	}
};

export const updateTeacher = async (
	currentState: CurrentState,
	data: TeacherSchema
) => {
	if (!data.id) {
		return { success: false, error: true };
	}
	try {
		const client = await clerkClient();

		const user = await client.users.updateUser(data.id, {
			username: data.username,
			...(data.password !== '' && { password: data.password }),
			firstName: data.name,
			lastName: data.surname,
			publicMetadata: { role: 'teacher' },
		});

		await prisma.teacher.update({
			where: {
				id: data.id,
			},
			data: {
				...(data.password !== '' && { password: data.password }),
				username: data.username,
				name: data.name,
				surname: data.surname,
				email: data.email || null,
				phone: data.phone || null,
				address: data.address,
				// img: data.img !== undefined ? data.img : null,
				...(data.img !== '' && { img: data.img }),
				bloodType: data.bloodType,
				sex: data.sex,
				birthday: data.birthday,
				subjects: {
					connect: data.subjects?.map((subjectId: string) => ({
						id: parseInt(subjectId),
					})),
				},
			},
		});

		// revalidatePath('/list/teacher');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteTeacher = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	try {
		const client = await clerkClient();
		await client.users.deleteUser(id);
		await prisma.teacher.delete({
			where: {
				id,
			},
		});

		// revalidatePath('/list/teacher');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// STUDENT
export const createStudent = async (
	currentState: CurrentState,
	data: StudentSchema
) => {
	let clerkUser;
	const client = await clerkClient();

	try {
		const classItem = await prisma.class.findUnique({
			where: { id: data.classId },
			include: { _count: { select: { students: true } } },
		});

		if (classItem && classItem.capacity === classItem._count.students) {
			return { success: false, error: true };
		}

		clerkUser = await client.users.createUser({
			username: data.username,
			password: data.password,
			firstName: data.name,
			lastName: data.surname,
			publicMetadata: { role: 'student' },
		});

		await prisma.student.create({
			data: {
				id: clerkUser.id,
				username: data.username,
				name: data.name,
				surname: data.surname,
				email: data.email || null,
				phone: data.phone || null,
				address: data.address,
				img: data.img || null,
				bloodType: data.bloodType,
				sex: data.sex,
				birthday: data.birthday,
				gradeId: data.gradeId,
				classId: data.classId,
				parentId: data.parentId,
				// Connect to the strand using its ID
				strandId: data.strandId,
			},
		});

		// revalidatePath("/list/student");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		console.log('clerkid = ' + clerkUser?.id);
		if (clerkUser) {
			try {
				await client.users.deleteUser(clerkUser.id);
			} catch (deleteErr) {
				console.log(
					'Failed to delete Clerk user after teacher creation failure:',
					deleteErr
				);
			}
		}
		return { success: false, error: true };
	}
};

export const updateStudent = async (
	currentState: CurrentState,
	data: StudentSchema
) => {
	if (!data.id) {
		return { success: false, error: true };
	}
	try {
		const client = await clerkClient();

		const user = await client.users.updateUser(data.id, {
			username: data.username,
			...(data.password !== '' && { password: data.password }),
			firstName: data.name,
			lastName: data.surname,
			publicMetadata: { role: 'student' },
		});

		await prisma.student.update({
			where: {
				id: data.id,
			},
			data: {
				...(data.password !== '' && { password: data.password }),
				username: data.username,
				name: data.name,
				surname: data.surname,
				email: data.email || null,
				phone: data.phone || null,
				address: data.address,
				// img: data.img !== undefined ? data.img : null,
				...(data.img !== '' && { img: data.img }),
				bloodType: data.bloodType,
				sex: data.sex,
				birthday: data.birthday,
				gradeId: data.gradeId,
				classId: data.classId,
				parentId: data.parentId,
				// Connect to the strand using its ID
				strandId: data.strandId,
			},
		});

		// revalidatePath('/list/student');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteStudent = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	try {
		const client = await clerkClient();
		await client.users.deleteUser(id);
		await prisma.student.delete({
			where: {
				id,
			},
		});

		// revalidatePath('/list/student');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// STRAND
export const createStrand = async (
	currentState: CurrentState,
	data: StrandSchema
) => {
	try {
		await prisma.strand.create({
			data: {
				name: data.name,
			},
		});

		// revalidatePath("/list/strand");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateStrand = async (
	currentState: CurrentState,
	data: StrandSchema
) => {
	try {
		await prisma.strand.update({
			where: {
				id: data.id,
			},
			data: {
				name: data.name,
			},
		});

		// revalidatePath('/list/class');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteStrand = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;
	try {
		await prisma.class.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/class');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};
