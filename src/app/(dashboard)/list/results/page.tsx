import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Class, Lesson, Prisma, Result, Strand, Student } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

// Define the type with full relations
type ResultList = Result & {
	student: Student & {
		class: Class;
		Strand: Strand;
	};
	Lesson?: Lesson; // Lesson is optional since lessonId is optional
};

// type ResultList = Result & {student: Student} & {class: Class} & {lesson: Lesson} & {Strand: Strand}

const ResultListpage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const role = await getRole();
	const currentUserId = await getUserId();
	const columns = [
		{
			header: 'Student',
			accessor: 'student',
		},
		{
			header: 'Section',
			accessor: 'section',
		},
		{
			header: 'Subject',
			accessor: 'subject',
		},
		{
			header: 'Strand',
			accessor: 'strand',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Q1',
			accessor: 'q1',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Q2',
			accessor: 'q2',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Q3',
			accessor: 'q3',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Q4',
			accessor: 'q4',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Total Score',
			accessor: 'totalScore',
		},
		{
			header: 'Assesment',
			accessor: 'assesment',
		},
		...(role === 'admin' || role === 'teacher'
			? [
					{
						header: 'Actions',
						accessor: 'action',
					},
			  ]
			: []),
	];

	const renderRow = (item: ResultList) => {
		// Calculate total score from available quarters
		const scores = [item.q1, item.q2, item.q3, item.q4].filter(
			(score) => score !== null
		) as number[];
		const totalScore =
			scores.length > 0
				? scores.reduce((sum, score) => sum + score, 0) / scores.length
				: 0;
		// Check if all quarters have values
		const allQuartersComplete =
			item.q1 !== null &&
			item.q2 !== null &&
			item.q3 !== null &&
			item.q4 !== null;

		// Determine score assessment and style
		let scoreAssessment = 'School year not yet finished';
		let assessmentStyle = '';

		if (allQuartersComplete) {
			if (totalScore >= 75) {
				scoreAssessment = 'Passed';
				assessmentStyle = 'rounded-full bg-green-100 text-green-800 px-2 py-1';
			} else {
				scoreAssessment = 'Failed';
				assessmentStyle = 'rounded-full bg-red-100 text-red-800 px-2 py-1';
			}
		}

		return (
			<tr
				key={item.id}
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
				<td className="flex items-center gap-4 p-4">
					<Image
						src={item.student.img || '/noAvatar.png'}
						alt=""
						width={40}
						height={40}
						className="md:hidden xl:block  w-10 h-10 rounded-full object-cover"
					/>
					<div className="flex flex-col">
						{item.student.name + ' ' + item.student.surname}
					</div>
				</td>
				<td>{item.student.class.name}</td>
				<td className="hidden md:table-cell">{item.Lesson?.name || '-'}</td>
				<td className="hidden md:table-cell">{item.student.Strand.name}</td>
				<td className="hidden md:table-cell">{item.q1 || '-'}</td>
				<td className="hidden md:table-cell">{item.q2 || '-'}</td>
				<td className="hidden md:table-cell">{item.q3 || '-'}</td>
				<td className="hidden md:table-cell">{item.q4 || '-'}</td>
				<td>{Math.round(totalScore * 10) / 10}</td>
				<td>
					<span className={assessmentStyle}>{scoreAssessment}</span>
				</td>
				<td>
					<div className="flex items-center gap-2">
						{(role === 'admin' || role === 'teacher') && (
							<>
								<FormContainer table="result" type="update" data={item} />
							</>
						)}
						{role === 'admin' && (
							<>
								<FormContainer table="result" type="delete" id={item.id} />
							</>
						)}
					</div>
				</td>
			</tr>
		);
	};

	const { page, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.ResultWhereInput = {};

	if (queryParams) {
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined)
				switch (key) {
					case 'studentId':
						query.studentId = value;
						break;
					case 'search':
						query.OR = [
							{ student: { name: { contains: value, mode: 'insensitive' } } },
							{
								student: { surname: { contains: value, mode: 'insensitive' } },
							},
						];
						break;
					default:
						break;
				}
		}
	}

	// ROLE CONDITIONS
	switch (role) {
		case 'admin':
			break;
		case 'teacher':
			// For teachers, only show results for their students
			query.student = {
				OR: [
					// Students in classes where the teacher is the supervisor
					{ class: { supervisorId: currentUserId! } },
					// Students in classes where the teacher teaches at least one lesson
					{ class: { lessons: { some: { teacherId: currentUserId! } } } },
				],
			};
			break;
		case 'student':
			query.studentId = currentUserId!;
			break;
		default:
			break;
	}

	const [dataRes, count] = await prisma.$transaction([
		prisma.result.findMany({
			where: query,
			include: {
				student: {
					include: {
						class: true,
						Strand: true,
					},
				},
				Lesson: true, // include Lesson relation
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.result.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Results</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<Image src="/sort.png" alt="" width={14} height={14} />
						</button>
						{(role === 'admin' || role === 'teacher') && (
							<FormContainer table="result" type="create" />
						)}
					</div>
				</div>
			</div>

			{/* LIST */}
			<Table columns={columns} renderRow={renderRow} data={dataRes} />
			{/* PAGINATION */}
			<Pagination page={p} count={count} />
		</div>
	);
};

export default ResultListpage;
