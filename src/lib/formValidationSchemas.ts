import { z } from 'zod';

// SUBJECT
export const subjectSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, { message: 'Subject name is required!' }),
	semester: z.string().min(1, { message: 'Semester is required' }),
	subjectType: z.string().min(1, { message: 'Subject type is required' }),
	teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// ADMIN
export const adminSchema = z.object({
	id: z.string().optional(),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(20, { message: 'Username must be at least 3 characters' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters long!' }),
});

export type AdminSchema = z.infer<typeof adminSchema>;

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
	subjects: z.array(z.string()).default([]), // This ensures we always have an array
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

// STUDENT
export const studentSchema = z.object({
	id: z.string().optional(),
	lrn: z.string().min(12, { message: 'LRN must be atleast 12 characters' }),
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
	middleName: z.string().min(1, { message: 'Middle name is required!' }),
	surname: z.string().min(1, { message: 'Last name is required!' }),
	email: z
		.string()
		.email({ message: 'Invalid email address!' })
		.optional()
		.or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().min(1, { message: 'House number required' }),
	purok: z.string().min(1, { message: 'Street is required' }),
	brgy: z.string().min(1, { message: 'Baranggay is required' }),
	city: z.string().min(1, { message: 'City is required' }),
	province: z.string().min(1, { message: 'Province is required' }),
	img: z.string().optional(),
	bloodType: z.string().min(1, { message: 'Blood Type is required!' }),
	birthday: z.coerce.date({ message: 'Birthday is required!' }),
	sex: z.enum(['MALE', 'FEMALE'], { message: 'Sex is required!' }),
	gradeId: z.coerce.number().min(1, { message: 'Grade is required' }),
	classId: z.coerce.number().min(1, { message: 'Class is required' }),
	// parentId: z.string().min(1, { message: 'Parent is required' }).optional(), // maybe remove this
	strandId: z.coerce.number().min(1, { message: 'Class is required' }), // strand names
	religion: z.string().optional(),
	fatherName: z.string().optional(),
	fatherMiddleName: z.string().optional(),
	fatherSurname: z.string().optional(),
	motherName: z.string().optional(),
	motherMiddleName: z.string().optional(),
	motherSurname: z.string().optional(),
	guardianName: z.string().optional(),
	guardianMiddleName: z.string().optional(),
	guardianSurname: z.string().optional(),
	guardianRelation: z.string().optional(),
	learningModal: z.string().optional(),
	remarks: z.string().optional(),
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

// LESSON
export const assignmentSchema = z.object({
	id: z.coerce.number().optional(),
	title: z.string().min(1, { message: 'Assignment title is required!' }),
	startDate: z.coerce.date({ message: 'Start date is required' }),
	dueDate: z.coerce.date({ message: 'Due date is required' }),
	lessonId: z.coerce.number({ message: 'Lesson is required' }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// ATTENDANCE
// export const attendanceSchema = z.object({
// 	id: z.coerce.number().optional(),
// 	studentId: z.string().min(1, { message: 'Student is required' }),
// 	lessonId: z.coerce.number({ message: 'Lesson is required' }),
// 	date: z.coerce.date({ message: 'Date is required' }),
// 	present: z.coerce.boolean({ message: 'Attendance is required' }),
// });

// export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const attendanceSchema = z.object({
	id: z.coerce.number().optional(),
	studentId: z.string().min(1, { message: 'Student is required' }),
	date: z.coerce.date({ message: 'Date is required' }),
	status: z.string().refine((val) => ['1', '0', 'E', 'H'].includes(val), {
		message:
			'Status must be one of: Present (1), Absent (0), Excused (E), or Holiday (H)',
	}),
	semester: z.string().min(1, { message: 'Semester is required' }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

// RESULTS
export const resultSchema = z.object({
	id: z.coerce.number().optional(),
	q1: z.coerce.number().min(0).max(100).optional(),
	q2: z.coerce.number().min(0).max(100).optional(),
	q3: z.coerce.number().min(0).max(100).optional(),
	q4: z.coerce.number().min(0).max(100).optional(),
	studentId: z.string().min(1, { message: 'Student is required' }),
	lessonId: z.coerce.number({ message: 'Lesson is required' }),
});

export type ResultSchema = z.infer<typeof resultSchema>;
