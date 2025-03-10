'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { Lesson, Strand } from '@prisma/client';
import { error } from 'console';
import { revalidatePath } from 'next/cache';
import {
	AssignmentSchema,
	AttendanceSchema,
	ClassSchema,
	ExamSchema,
	LessonSchema,
	StrandSchema,
	StudentSchema,
	SubjectSchema,
	TeacherSchema,
} from './formValidationSchemas';
import prisma from './prisma';
import { getRole, getUserId } from './utils';

type CurrentState = { success: boolean; error: boolean };
async function urlToFile(
	url: string,
	fileName: string,
	mimeType: string
): Promise<File> {
	const response = await fetch(url);
	const blob = await response.blob();
	return new File([blob], fileName, { type: mimeType });
}

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

		// Update the user's profile image if an image link is provided
		if (data.img) {
			// Assuming data.img is a URL string, convert it to a File
			const fileToUpload = await urlToFile(
				data.img,
				'profile-pic.jpg',
				'image/jpeg'
			);
			const params = { file: fileToUpload };
			await client.users.updateUserProfileImage(clerkUser.id, params);
		}

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
				// parentId: data.parentId,
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
				// parentId: data.parentId,
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

// Exam
export const createExam = async (
	currentState: CurrentState,
	data: ExamSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}
		await prisma.exam.create({
			data: {
				title: data.title,
				startTime: data.startTime,
				endTime: data.endTime,
				lessonId: data.lessonId,
			},
		});

		// revalidatePath("/list/exams");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateExam = async (
	currentState: CurrentState,
	data: ExamSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}
		await prisma.exam.update({
			where: {
				id: data.id,
			},
			data: {
				title: data.title,
				startTime: data.startTime,
				endTime: data.endTime,
				lessonId: data.lessonId,
			},
		});
		// revalidatePath('/list/subjects');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteExam = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	const role = await getRole();
	const userId = await getUserId();

	try {
		await prisma.exam.delete({
			where: {
				id: parseInt(id),
				...(role === 'teacher' ? { lesson: { teacherId: userId! } } : {}),
			},
		});

		// revalidatePath('/list/exams');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// Lessons
export const createLesson = async (
	currentState: CurrentState,
	data: LessonSchema
) => {
	try {
		await prisma.lesson.create({
			data: {
				name: data.name,
				day: data.day,
				startTime: data.startTime,
				endTime: data.endTime,
				subjectId: data.subjectId,
				classId: data.classId,
				teacherId: data.teacherId,
			},
		});

		// revalidatePath("/list/lessons");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateLesson = async (
	currentState: CurrentState,
	data: LessonSchema
) => {
	try {
		await prisma.lesson.update({
			where: {
				id: data.id,
			},
			data: {
				name: data.name,
				day: data.day,
				startTime: data.startTime,
				endTime: data.endTime,
				subjectId: data.subjectId,
				classId: data.classId,
				teacherId: data.teacherId,
			},
		});
		// revalidatePath('/list/Lessons');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteLesson = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	try {
		await prisma.lesson.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/exams');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// ASSIGNMENTS
export const createAssignment = async (
	currentState: CurrentState,
	data: AssignmentSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}
		await prisma.assignment.create({
			data: {
				title: data.title,
				startDate: data.startDate,
				dueDate: data.dueDate,
				lessonId: data.lessonId,
			},
		});

		// revalidatePath("/list/assignment");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateAssignment = async (
	currentState: CurrentState,
	data: AssignmentSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}
		await prisma.assignment.update({
			where: {
				id: data.id,
			},
			data: {
				title: data.title,
				startDate: data.startDate,
				dueDate: data.dueDate,
				lessonId: data.lessonId,
			},
		});
		// revalidatePath('/list/assignments');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteAssignment = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	const role = await getRole();
	const userId = await getUserId();

	try {
		await prisma.assignment.delete({
			where: {
				id: parseInt(id),
				...(role === 'teacher' ? { lesson: { teacherId: userId! } } : {}),
			},
		});

		// revalidatePath('/list/exams');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

// ATTENDANCE
export const createAttendance = async (
	currentState: CurrentState,
	data: AttendanceSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}

		await prisma.attendance.create({
			data: {
				studentId: data.studentId,
				lessonId: data.lessonId,
				date: data.date,
				present: data.present,
			},
		});

		// revalidatePath("/list/attendance");
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const updateAttendance = async (
	currentState: CurrentState,
	data: AttendanceSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		if (role === 'teacher') {
			const teacherLesson = await prisma.lesson.findFirst({
				where: {
					teacherId: userId!,
					id: data.lessonId,
				},
			});

			if (!teacherLesson) {
				return { success: false, error: true };
			}
		}
		await prisma.attendance.update({
			where: {
				id: data.id,
			},
			data: {
				studentId: data.studentId,
				lessonId: data.lessonId,
				date: data.date,
				present: data.present,
			},
		});
		// revalidatePath('/list/attendance');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};

export const deleteAttendance = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	const role = await getRole();
	const userId = await getUserId();

	try {
		if (role === 'teacher') {
			// First check if the teacher has permission to delete this attendance
			const attendance = await prisma.attendance.findUnique({
				where: { id: parseInt(id) },
				include: { lesson: true },
			});

			if (!attendance || attendance.lesson.teacherId !== userId) {
				return { success: false, error: true };
			}
		}

		await prisma.attendance.delete({
			where: {
				id: parseInt(id),
			},
		});

		revalidatePath('/list/attendance');
		return { success: true, error: false };
	} catch (err) {
		console.log(err);
		return { success: false, error: true };
	}
};
