import { z } from 'zod';

// SUBJECT
export const subjectSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, { message: 'Subject name is required!' }),
	teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// CLASS
export const classSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, { message: 'Supervisor name is required!' }),
	capacity: z.coerce
		.number()
		.min(1, { message: 'Student capacity is required!' }),
	gradeId: z.coerce.number().min(1, { message: 'Grade is required!' }),
	supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

// TEACHER
export const teacherSchema = z.object({
	id: z.string().optional(),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(20, { message: 'Username must be at least 3 characters' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long!' })
		.optional()
		.or(z.literal('')),
	name: z.string().min(1, { message: 'First name is required!' }),
	surname: z.string().min(1, { message: 'Last name is required!' }),
	email: z
		.string()
		.email({ message: 'Invalid email address!' })
		.optional()
		.or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().min(1, { message: 'Address is required' }),
	img: z.string().optional(),
	bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
	birthday: z.coerce.date({ message: 'Birthday is required!' }),
	sex: z.enum(['MALE', 'FEMALE'], { message: 'Sex is required!' }),
	subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

// STUDENT
export const studentSchema = z.object({
	id: z.string().optional(),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(20, { message: 'Username must be at least 3 characters' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long!' })
		.optional()
		.or(z.literal('')),
	name: z.string().min(1, { message: 'First name is required!' }),
	surname: z.string().min(1, { message: 'Last name is required!' }),
	email: z
		.string()
		.email({ message: 'Invalid email address!' })
		.optional()
		.or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().min(1, { message: 'Address is required' }),
	img: z.string().optional(),
	bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
	birthday: z.coerce.date({ message: 'Birthday is required!' }),
	sex: z.enum(['MALE', 'FEMALE'], { message: 'Sex is required!' }),
	gradeId: z.coerce.number().min(1, { message: 'Grade is required' }),
	classId: z.coerce.number().min(1, { message: 'Class is required' }),
	parentId: z.string().min(1, { message: 'Parent is required' }), // maybe remove this
	strandId: z.coerce.number().min(1, { message: 'Class is required' }), // strand names
});

export type StudentSchema = z.infer<typeof studentSchema>;

// STRAND
export const strandSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(2, { message: 'Strand is required' }),
});

export type StrandSchema = z.infer<typeof strandSchema>;

// exam
export const examSchema = z.object({
	id: z.coerce.number().optional(),
	title: z.string().min(1, { message: 'Exam title is required!' }),
	startTime: z.coerce.date({ message: 'Start time is required' }),
	endTime: z.coerce.date({ message: 'End time is required' }),
	lessonId: z.coerce.number({ message: 'Lesson is required' }),
});

export type ExamSchema = z.infer<typeof examSchema>;

// LESSON
export const lessonSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, { message: 'Lesson Name is required!' }),
	// day: z.string().min(1, { message: 'Lesson Day is required!' }),
	day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'], {
		message: 'Lesson Day is required!',
	}),
	startTime: z.coerce.date({ message: 'Start time is required' }),
	endTime: z.coerce.date({ message: 'End time is required' }),
	subjectId: z.coerce.number({ message: 'Subject is required' }),
	classId: z.coerce.number({ message: 'Class is required' }),
	teacherId: z.string({ message: 'Teacher is required' }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
