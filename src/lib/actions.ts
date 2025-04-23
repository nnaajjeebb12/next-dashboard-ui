'use server';

import { clerkClient, type User } from '@clerk/nextjs/server';
import { Admin, Lesson, Strand } from '@prisma/client';
import { error } from 'console';
import { revalidatePath } from 'next/cache';
import {
	AdminSchema,
	AssignmentSchema,
	AttendanceSchema,
	ClassSchema,
	ExamSchema,
	LessonSchema,
	ResultSchema,
	StrandSchema,
	StudentSchema,
	SubjectSchema,
	TeacherSchema,
} from './formValidationSchemas';
import prisma from './prisma';
import { getRole, getUserId } from './utils';

type CurrentState = {
	success: boolean;
	error: boolean;
	message?: string;
};

async function urlToFile(
	url: string,
	fileName: string,
	mimeType: string
): Promise<File> {
	const response = await fetch(url);
	const blob = await response.blob();
	return new File([blob], fileName, { type: mimeType });
}

function generateStudentId(length: number = 27): string {
	const chars =
		'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
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
				semester: data.semester,
				subjectType: data.subjectType,
				teachers: {
					connect: data.teachers.map((teacherId) => ({ id: teacherId })),
				},
			},
		});

		// revalidatePath("/list/subjects");
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error creating subject' };
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
				semester: data.semester,
				subjectType: data.subjectType,
				teachers: {
					set: data.teachers.map((teacherId) => ({ id: teacherId })),
				},
			},
		});

		// revalidatePath('/list/subjects');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error updating the subject',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting the subject',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error creating the section',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating section' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting the section',
		};
	}
};

// TEACHER
export const createTeacher = async (
	currentState: CurrentState,
	data: TeacherSchema
) => {
	let clerkUser: User | undefined;
	const client = await clerkClient();
	try {
		// Check for empty password during creation
		if (!data.password) {
			return {
				success: false,
				error: true,
				message: 'Password is required when creating a new teacher account.',
			};
		}

		// Check for existing username/email/phone in database first
		const existingTeacher = await prisma.teacher.findFirst({
			where: {
				OR: [
					{ username: data.username },
					...(data.email ? [{ email: data.email }] : []),
					...(data.phone ? [{ phone: data.phone }] : []),
				],
			},
		});

		if (existingTeacher) {
			if (existingTeacher.username === data.username) {
				return {
					success: false,
					error: true,
					message:
						'Username is already taken. Please choose a different username.',
				};
			}
			if (data.email && existingTeacher.email === data.email) {
				return {
					success: false,
					error: true,
					message: 'Email is already registered to another teacher.',
				};
			}
			if (data.phone && existingTeacher.phone === data.phone) {
				return {
					success: false,
					error: true,
					message: 'Phone number is already registered to another teacher.',
				};
			}
		}

		try {
			clerkUser = await client.users.createUser({
				username: data.username,
				password: data.password,
				firstName: data.name,
				lastName: data.surname,
				publicMetadata: { role: 'teacher' },
			});
		} catch (clerkError: any) {
			if (clerkError.message?.includes('already exists')) {
				return {
					success: false,
					error: true,
					message: 'Username is already taken in the authentication system.',
				};
			}
			return {
				success: false,
				error: true,
				message:
					'Failed to create authentication account: ' + clerkError.message,
			};
		}

		try {
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
		} catch (dbError: any) {
			// Clean up Clerk user if database operation fails
			if (clerkUser) {
				await client.users.deleteUser(clerkUser.id).catch(() => {});
			}

			if (dbError.code === 'P2002') {
				const field = dbError.meta?.target?.[0];
				return {
					success: false,
					error: true,
					message: `The ${field} is already taken. Please choose a different ${field}.`,
				};
			}

			return {
				success: false,
				error: true,
				message:
					'Failed to create teacher record in database: ' + dbError.message,
			};
		}

		return { success: true, error: false, message: '' };
	} catch (err: any) {
		if (clerkUser) {
			await client.users.deleteUser(clerkUser.id).catch(() => {});
		}
		return {
			success: false,
			error: true,
			message: 'An unexpected error occurred: ' + err.message,
		};
	}
};

export const updateTeacher = async (
	currentState: CurrentState,
	data: TeacherSchema
) => {
	if (!data.id) {
		return {
			success: false,
			error: true,
			message: 'Teacher ID is required for update',
		};
	}

	try {
		// Check for existing username/email/phone but exclude current teacher
		const existingTeacher = await prisma.teacher.findFirst({
			where: {
				AND: [
					{ id: { not: data.id } },
					{
						OR: [
							{ username: data.username },
							...(data.email ? [{ email: data.email }] : []),
							...(data.phone ? [{ phone: data.phone }] : []),
						],
					},
				],
			},
		});

		if (existingTeacher) {
			if (existingTeacher.username === data.username) {
				return {
					success: false,
					error: true,
					message:
						'Username is already taken. Please choose a different username.',
				};
			}
			if (data.email && existingTeacher.email === data.email) {
				return {
					success: false,
					error: true,
					message: 'Email is already registered to another teacher.',
				};
			}
			if (data.phone && existingTeacher.phone === data.phone) {
				return {
					success: false,
					error: true,
					message: 'Phone number is already registered to another teacher.',
				};
			}
		}

		const client = await clerkClient();

		try {
			await client.users.updateUser(data.id, {
				username: data.username,
				...(data.password !== '' && { password: data.password }),
				firstName: data.name,
				lastName: data.surname,
				publicMetadata: { role: 'teacher' },
			});
		} catch (clerkError: any) {
			if (clerkError.message?.includes('already exists')) {
				return {
					success: false,
					error: true,
					message: 'Username is already taken in the authentication system.',
				};
			}
			return {
				success: false,
				error: true,
				message:
					'Failed to update authentication account: ' + clerkError.message,
			};
		}

		try {
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
					...(data.img !== '' && { img: data.img }),
					bloodType: data.bloodType,
					sex: data.sex,
					birthday: data.birthday,
					subjects: {
						set: (data.subjects || []).map((subjectId: string) => ({
							id: parseInt(subjectId),
						})),
					},
				},
			});
		} catch (dbError: any) {
			if (dbError.code === 'P2002') {
				const field = dbError.meta?.target?.[0];
				return {
					success: false,
					error: true,
					message: `The ${field} is already taken. Please choose a different ${field}.`,
				};
			}

			return {
				success: false,
				error: true,
				message:
					'Failed to update teacher record in database: ' + dbError.message,
			};
		}

		return { success: true, error: false, message: '' };
	} catch (err: any) {
		return {
			success: false,
			error: true,
			message: 'An unexpected error occurred: ' + err.message,
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting the Teacher',
		};
	}
};

// STUDENT
export const createStudent = async (
	currentState: CurrentState,
	data: StudentSchema
) => {
	try {
		// Validate required fields first
		const requiredFields = {
			name: 'First Name',
			surname: 'Last Name',
			middleName: 'Middle Name',
			lrn: 'LRN',
			address: 'House Number',
			purok: 'Purok',
			brgy: 'Barangay',
			city: 'City',
			province: 'Province',
			bloodType: 'Blood Type',
			birthday: 'Birthday',
			sex: 'Gender',
			gradeId: 'Grade Level',
			classId: 'Section',
			strandId: 'Strand',
		};

		for (const [field, label] of Object.entries(requiredFields)) {
			if (!data[field as keyof typeof data]) {
				return {
					success: false,
					error: true,
					message: `${label} is required`,
				};
			}
		}

		// Check for existing LRN/email/phone in database first
		const existingStudent = await prisma.student.findFirst({
			where: {
				OR: [
					{ lrn: data.lrn },
					...(data.email ? [{ email: data.email }] : []),
					...(data.phone ? [{ phone: data.phone }] : []),
				],
			},
		});

		if (existingStudent) {
			if (existingStudent.lrn === data.lrn) {
				return {
					success: false,
					error: true,
					message: 'This LRN is already registered to another student',
				};
			}
			if (data.email && existingStudent.email === data.email) {
				return {
					success: false,
					error: true,
					message: 'This email is already registered to another student',
				};
			}
			if (data.phone && existingStudent.phone === data.phone) {
				return {
					success: false,
					error: true,
					message: 'This phone number is already registered to another student',
				};
			}
		}

		const classItem = await prisma.class.findUnique({
			where: { id: data.classId },
			include: { _count: { select: { students: true } } },
		});

		if (classItem && classItem.capacity === classItem._count.students) {
			return {
				success: false,
				error: true,
				message: 'Full capacity for this section',
			};
		}

		const combinedAddress = `${data.address} ,${data.purok}, ${data.brgy}, ${data.city}, ${data.province}`;

		// Generate a unique student ID
		let studentId;
		let isUnique = false;
		while (!isUnique) {
			studentId = generateStudentId();
			const existingStudentId = await prisma.student.findUnique({
				where: { id: studentId },
			});
			if (!existingStudentId) {
				isUnique = true;
			}
		}

		// Generate username from name and surname
		const username =
			`${data.name.toLowerCase()}.${data.surname.toLowerCase()}`.replace(
				/\s+/g,
				''
			);

		try {
			await prisma.student.create({
				data: {
					id: studentId as string,
					lrn: data.lrn,
					username: username,
					name: data.name,
					middleName: data.middleName,
					surname: data.surname,
					email: data.email || null,
					phone: data.phone || null,
					address: combinedAddress,
					purok: data.purok,
					brgy: data.brgy,
					city: data.city,
					province: data.province,
					img: data.img || null,
					bloodType: data.bloodType,
					sex: data.sex,
					birthday: data.birthday,
					gradeId: data.gradeId,
					classId: data.classId,
					strandId: data.strandId,
					religion: data.religion,
					fatherName: data.fatherName,
					fatherMiddleName: data.fatherMiddleName,
					fatherSurname: data.fatherSurname,
					motherName: data.motherName,
					motherMiddleName: data.motherMiddleName,
					motherSurname: data.motherSurname,
					guardianName: data.guardianName,
					guardianMiddleName: data.guardianMiddleName,
					guardianSurname: data.guardianSurname,
					guardianRelation: data.guardianRelation,
					learningModal: data.learningModal,
					remarks: data.remarks,
				},
			});
		} catch (dbError: any) {
			if (dbError.code === 'P2002') {
				const field = dbError.meta?.target?.[0];
				return {
					success: false,
					error: true,
					message: `The ${field} is already taken. Please choose a different ${field}.`,
				};
			}
			return {
				success: false,
				error: true,
				message: 'Failed to create student record: ' + dbError.message,
			};
		}

		return { success: true, error: false, message: '' };
	} catch (err: any) {
		return {
			success: false,
			error: true,
			message: 'An unexpected error occurred: ' + err.message,
		};
	}
};

export const updateStudent = async (
	currentState: CurrentState,
	data: StudentSchema
) => {
	if (!data.id) {
		return {
			success: false,
			error: true,
			message: 'Student ID is required for update',
		};
	}

	try {
		// Validate required fields first
		const requiredFields = {
			name: 'First Name',
			surname: 'Last Name',
			middleName: 'Middle Name',
			lrn: 'LRN',
			address: 'House Number',
			purok: 'Purok',
			brgy: 'Barangay',
			city: 'City',
			province: 'Province',
			bloodType: 'Blood Type',
			birthday: 'Birthday',
			sex: 'Gender',
			gradeId: 'Grade Level',
			classId: 'Section',
			strandId: 'Strand',
		};

		for (const [field, label] of Object.entries(requiredFields)) {
			if (!data[field as keyof typeof data]) {
				return {
					success: false,
					error: true,
					message: `${label} is required`,
				};
			}
		}

		// Check for existing LRN/email/phone but exclude current student
		const existingStudent = await prisma.student.findFirst({
			where: {
				AND: [
					{ id: { not: data.id } },
					{
						OR: [
							{ lrn: data.lrn },
							...(data.email ? [{ email: data.email }] : []),
							...(data.phone ? [{ phone: data.phone }] : []),
						],
					},
				],
			},
		});

		if (existingStudent) {
			if (existingStudent.lrn === data.lrn) {
				return {
					success: false,
					error: true,
					message: 'This LRN is already registered to another student',
				};
			}
			if (data.email && existingStudent.email === data.email) {
				return {
					success: false,
					error: true,
					message: 'This email is already registered to another student',
				};
			}
			if (data.phone && existingStudent.phone === data.phone) {
				return {
					success: false,
					error: true,
					message: 'This phone number is already registered to another student',
				};
			}
		}

		const firstPart = data.address.split(',')[0];
		const houseNumber = !isNaN(Number(firstPart)) ? firstPart : '0000';
		const combinedAddress = `${houseNumber}, ${data.purok}, ${data.brgy}, ${data.city}, ${data.province}`;

		// Generate username from name and surname
		const username =
			`${data.name.toLowerCase()}.${data.surname.toLowerCase()}`.replace(
				/\s+/g,
				''
			);

		try {
			await prisma.student.update({
				where: {
					id: data.id,
				},
				data: {
					lrn: data.lrn,
					username: username,
					name: data.name,
					middleName: data.middleName,
					surname: data.surname,
					email: data.email || null,
					phone: data.phone || null,
					address: combinedAddress,
					purok: data.purok,
					brgy: data.brgy,
					city: data.city,
					province: data.province,
					...(data.img !== '' && { img: data.img }),
					bloodType: data.bloodType,
					sex: data.sex,
					birthday: data.birthday,
					gradeId: data.gradeId,
					classId: data.classId,
					strandId: data.strandId,
					religion: data.religion,
					fatherName: data.fatherName,
					fatherMiddleName: data.fatherMiddleName,
					fatherSurname: data.fatherSurname,
					motherName: data.motherName,
					motherMiddleName: data.motherMiddleName,
					motherSurname: data.motherSurname,
					guardianName: data.guardianName,
					guardianMiddleName: data.guardianMiddleName,
					guardianSurname: data.guardianSurname,
					guardianRelation: data.guardianRelation,
					learningModal: data.learningModal,
					remarks: data.remarks,
				},
			});
		} catch (dbError: any) {
			if (dbError.code === 'P2002') {
				const field = dbError.meta?.target?.[0];
				return {
					success: false,
					error: true,
					message: `The ${field} is already taken. Please choose a different ${field}.`,
				};
			}
			return {
				success: false,
				error: true,
				message: 'Failed to update student record: ' + dbError.message,
			};
		}

		return { success: true, error: false, message: '' };
	} catch (err: any) {
		return {
			success: false,
			error: true,
			message: 'An unexpected error occurred: ' + err.message,
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting the student',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error creating the strand',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating strand' };
	}
};

export const deleteStrand = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;
	try {
		await prisma.strand.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/class');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error deleting strand' };
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
				return {
					success: false,
					error: true,
					message: 'Cannot create exam for this teacher',
				};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error creating exam' };
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
				return { success: false, error: true, message: 'Error updating exam' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating exam' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error deleting exam' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error creating lesson' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating lesson' };
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error deleting lesson' };
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
				return {
					success: false,
					error: true,
					message: 'Cannot create assignment for this teacher',
				};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error creating assignment',
		};
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
				return {
					success: false,
					error: true,
					message: 'Cannot update assignment for this teacher',
				};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error updating assignment',
		};
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
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting assignment',
		};
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
		// Check for duplicate attendance
		const existingAttendance = await prisma.attendance.findFirst({
			where: {
				studentId: data.studentId,
				// lessonId: data.lessonId,
				date: data.date,
			},
		});

		if (existingAttendance) {
			return {
				success: false,
				error: true,
				message: 'Attendance for this date already exist.',
			};
		}

		await prisma.attendance.create({
			data: {
				studentId: data.studentId,
				// lessonId: data.lessonId,
				date: data.date,
				status: data.status,
				semester: data.semester,
			},
		});

		// revalidatePath("/list/attendance");
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error creating attendance',
		};
	}
};

export const updateAttendance = async (
	currentState: CurrentState,
	data: AttendanceSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		await prisma.attendance.update({
			where: {
				id: data.id,
			},
			data: {
				studentId: data.studentId,
				// lessonId: data.lessonId,
				date: data.date,
				status: data.status,
				semester: data.semester,
			},
		});
		// revalidatePath('/list/attendance');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error updating attendance',
		};
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
				// include: { lesson: true },
			});
		}

		await prisma.attendance.delete({
			where: {
				id: parseInt(id),
			},
		});

		revalidatePath('/list/attendance');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: '' };
	}
};

// Exam
export const createResult = async (
	currentState: CurrentState,
	data: ResultSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		// if (role === 'teacher') {
		// 	const teacherClass = await prisma.class.findFirst({
		// 		where: {
		// 			supervisorId: userId!,
		// 			id: data.lessonId,
		// 		},
		// 	});

		// 	if (!teacherClass) {
		// 		return { success: false, error: true, message: 'Incorrect class' };
		// 	}
		// }

		// Check for duplicate result
		const existingResult = await prisma.result.findFirst({
			where: {
				studentId: data.studentId,
				lessonId: data.lessonId,
			},
		});

		if (existingResult) {
			return {
				success: false,
				error: true,
				message: 'Result for this student already exists',
			};
		}
		await prisma.result.create({
			data: {
				q1: data.q1,
				q2: data.q2,
				q3: data.q3,
				q4: data.q4,
				studentId: data.studentId,
				lessonId: data.lessonId,
			},
		});

		// revalidatePath("/list/results");
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error creating result' };
	}
};

export const updateResult = async (
	currentState: CurrentState,
	data: ResultSchema
) => {
	const role = await getRole();
	const userId = await getUserId();
	try {
		await prisma.result.update({
			where: {
				id: data.id,
			},
			data: {
				q1: data.q1,
				q2: data.q2,
				q3: data.q3,
				q4: data.q4,
				studentId: data.studentId,
				lessonId: data.lessonId,
			},
		});
		// revalidatePath('/list/results');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating result' };
	}
};

export const deleteResult = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	try {
		await prisma.result.delete({
			where: {
				id: parseInt(id),
			},
		});

		// revalidatePath('/list/results');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return { success: false, error: true, message: 'Error updating result' };
	}
};

// In your data fetching function (likely in actions.js or similar)
export async function getRelatedDataForResultForm(teacherId: string) {
	// Get students under this teacher's classes
	const teacherClasses = await prisma.class.findMany({
		where: {
			supervisorId: teacherId,
		},
	});

	const classIds = teacherClasses.map((c) => c.id);

	const students = await prisma.student.findMany({
		where: {
			classId: {
				in: classIds,
			},
		},
		select: {
			id: true,
			name: true,
			surname: true,
		},
	});

	// Get lessons taught by this teacher
	const lessons = await prisma.lesson.findMany({
		where: {
			teacherId: teacherId,
		},
		select: {
			id: true,
			name: true,
		},
	});

	return { students, lessons };
}

// TEACHER
export const createAdmin = async (
	currentState: CurrentState,
	data: AdminSchema
) => {
	let clerkUser;
	const client = await clerkClient();
	try {
		clerkUser = await client.users.createUser({
			username: data.username,
			password: data.password,
			publicMetadata: { role: 'admin' },
		});

		// Create the teacher in the database with the image URL from Cloudinary
		await prisma.admin.create({
			data: {
				id: clerkUser.id,
				username: data.username,
			},
		});

		// revalidatePath("/list/admin");
		return { success: true, error: false, message: '' };
	} catch (err) {
		if (clerkUser) {
			try {
				await client.users.deleteUser(clerkUser.id);
			} catch (deleteErr) {}
		}
		return {
			success: false,
			error: true,
			message: 'Error creating the admin',
		};
	}
};

export const updateAdmin = async (
	currentState: CurrentState,
	data: AdminSchema
) => {
	if (!data.id) {
		return { success: false, error: true, message: 'Error fetching data' };
	}
	try {
		const client = await clerkClient();

		const user = await client.users.updateUser(data.id, {
			username: data.username,
			...(data.password !== '' && { password: data.password }),
			publicMetadata: { role: 'admin' },
		});

		await prisma.admin.update({
			where: {
				id: data.id,
			},
			data: {
				...(data.password !== '' && { password: data.password }),
				username: data.username,
			},
		});

		// revalidatePath('/list/admin');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error updating the admin',
		};
	}
};

export const deleteAdmin = async (
	currentState: CurrentState,
	data: FormData
) => {
	const id = data.get('id') as string;

	try {
		const client = await clerkClient();
		await client.users.deleteUser(id);
		await prisma.admin.delete({
			where: {
				id,
			},
		});

		// revalidatePath('/list/teacher');
		return { success: true, error: false, message: '' };
	} catch (err) {
		return {
			success: false,
			error: true,
			message: 'Error deleting the Admin',
		};
	}
};
