import prisma from '@/lib/prisma';
import { getRole, getUserId } from '@/lib/utils';
import FormModal from './FormModal';

export type FormContainerProps = {
	table:
		| 'teacher'
		| 'student'
		| 'parent'
		| 'subject'
		| 'class'
		| 'lesson'
		| 'exam'
		| 'assignment'
		| 'result'
		| 'attendance'
		| 'event'
		| 'announcement'
		| 'strand';
	type: 'create' | 'update' | 'delete';
	data?: any;
	id?: number | string;
	userRole?: string;
};

const FormContainer = async ({
	table,
	type,
	data,
	id,
	userRole,
}: FormContainerProps) => {
	let relatedData = {};

	const role = await getRole();
	const userId = await getUserId();

	if (type !== 'delete') {
		switch (table) {
			case 'subject':
				const subjectTeachers = await prisma.teacher.findMany({
					select: { id: true, name: true, surname: true },
				});
				relatedData = { teachers: subjectTeachers };
				break;
			case 'class':
				const classGrades = await prisma.grade.findMany({
					select: { id: true, level: true },
				});
				const classTeachers = await prisma.teacher.findMany({
					select: { id: true, name: true, surname: true },
				});
				relatedData = { teachers: classTeachers, grades: classGrades };
				break;
			case 'teacher':
				const teacherSubjects = await prisma.subject.findMany({
					select: { id: true, name: true },
				});
				relatedData = { subjects: teacherSubjects };
				break;
			case 'strand':
				const strandStudents = await prisma.student.findMany({
					select: { id: true, name: true, surname: true },
				});
				relatedData = { students: strandStudents };
				break;
			case 'student':
				const studentGrades = await prisma.grade.findMany({
					select: { id: true, level: true },
				});
				const studentClasses = await prisma.class.findMany({
					include: { _count: { select: { students: true } } },
				});
				const studentStrand = await prisma.strand.findMany({
					select: { id: true, name: true },
				});
				relatedData = {
					grades: studentGrades,
					classes: studentClasses,
					strands: studentStrand,
				};
				break;
			case 'exam':
				const examLessons = await prisma.lesson.findMany({
					where: {
						...(role === 'teacher' ? { teacherId: userId! } : {}),
					},
					select: { id: true, name: true },
				});
				relatedData = {
					lessons: examLessons,
				};
				break;
			case 'lesson':
				const lessonSubjects = await prisma.subject.findMany({
					select: { id: true, name: true },
				});
				const lessonSections = await prisma.class.findMany({
					select: { id: true, name: true },
				});
				const lessonTeachers = await prisma.teacher.findMany({
					select: { id: true, name: true, surname: true },
				});
				relatedData = {
					subjects: lessonSubjects,
					sections: lessonSections,
					teachers: lessonTeachers,
				};
				break;
			case 'assignment':
				const assignmentLessons = await prisma.lesson.findMany({
					where: {
						...(role === 'teacher' ? { teacherId: userId! } : {}),
					},
					select: { id: true, name: true },
				});
				relatedData = {
					lessons: assignmentLessons,
				};
				break;
			case 'attendance':
				const attendanceStudents = await prisma.student.findMany({
					select: { id: true, name: true, surname: true },
				});
				const attendanceLessons = await prisma.lesson.findMany({
					where: {
						...(role === 'teacher' ? { teacherId: userId! } : {}),
					},
					select: { id: true, name: true },
				});
				relatedData = {
					students: attendanceStudents,
					lessons: attendanceLessons,
				};
				break;
			case 'result':
				const resultStudents = await prisma.student.findMany({
					select: { id: true, name: true, surname: true },
				});
				relatedData = {
					students: resultStudents,
				};
				break;
			default:
				break;
		}
	}

	return (
		<div className="">
			<FormModal
				table={table}
				type={type}
				data={data}
				id={id}
				relatedData={relatedData}
				userRole={role}
			/>
		</div>
	);
};

export default FormContainer;
