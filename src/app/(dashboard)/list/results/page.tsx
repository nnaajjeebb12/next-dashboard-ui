import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import {
	Class,
	Grade,
	Lesson,
	Prisma,
	Result,
	Strand,
	Student,
} from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

// Define the type with full relations
type ResultList = Result & {
	student: Student & {
		class: Class;
		grade: Grade;
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

	// Get all strands first
	const strands = await prisma.strand.findMany({
		select: { name: true },
		orderBy: { name: 'asc' },
	});

	const columns = [
		{
			header: 'Student',
			accessor: 'student',
		},
		{
			header: 'Grade',
			accessor: 'grade',
			filterOptions: [
				{ value: '11', label: 'Grade 11' },
				{ value: '12', label: 'Grade 12' },
			],
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
			filterOptions: strands.map((strand) => ({
				value: strand.name,
				label: strand.name,
			})),
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
			header: 'Assessment',
			accessor: 'assessment',
			filterOptions: [
				{ value: 'passed', label: 'Passed' },
				{ value: 'failed', label: 'Failed' },
				{ value: 'incomplete', label: 'Incomplete' },
			],
		},
		...(role === 'teacher'
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
				<td>{item.student.grade.level}</td>
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
						{role === 'teacher' && (
							<>
								<FormContainer table="result" type="update" data={item} />
							</>
						)}
						{role === 'teacher' && (
							<>
								<FormContainer table="result" type="delete" id={item.id} />
							</>
						)}
					</div>
				</td>
			</tr>
		);
	};

	const { page, filterColumn, filterValue, search } = searchParams;

	const p = page ? parseInt(page) : 1;

	// Initialize the query object
	const query: Prisma.ResultWhereInput = {};

	if (search) {
		query.OR = [
			{ student: { name: { contains: search, mode: 'insensitive' } } },
			{ student: { surname: { contains: search, mode: 'insensitive' } } },
			{ Lesson: { name: { contains: search, mode: 'insensitive' } } },
			{
				student: { class: { name: { contains: search, mode: 'insensitive' } } },
			},
			{
				student: {
					Strand: { name: { contains: search, mode: 'insensitive' } },
				},
			},
		];
		// Add grade level search if applicable
		const gradeLevel = parseInt(search);
		if (!isNaN(gradeLevel)) {
			query.OR.push({
				student: { grade: { level: gradeLevel } },
			});
		}
	}

	if (filterColumn && filterValue) {
		switch (filterColumn) {
			case 'grade':
				query.student = {
					grade: { level: parseInt(filterValue) },
				};
				break;
			case 'strand':
				query.student = {
					Strand: { name: filterValue },
				};
				break;
			case 'assessment':
				if (filterValue === 'passed') {
					// All quarters must be present and average must be >= 75
					query.AND = [
						{ q1: { not: null } },
						{ q2: { not: null } },
						{ q3: { not: null } },
						{ q4: { not: null } },
						{
							OR: [
								{
									AND: [
										{ q1: { gte: 0 } },
										{ q2: { gte: 0 } },
										{ q3: { gte: 0 } },
										{ q4: { gte: 0 } },
									],
								},
							],
						},
					];
					// Using a raw query to calculate average
					query.OR = undefined; // Clear any previous OR conditions
				} else if (filterValue === 'failed') {
					// All quarters must be present and average must be < 75
					query.AND = [
						{ q1: { not: null } },
						{ q2: { not: null } },
						{ q3: { not: null } },
						{ q4: { not: null } },
						{
							OR: [
								{
									AND: [
										{ q1: { gte: 0 } },
										{ q2: { gte: 0 } },
										{ q3: { gte: 0 } },
										{ q4: { gte: 0 } },
									],
								},
							],
						},
					];
					// Using a raw query to calculate average
					query.OR = undefined; // Clear any previous OR conditions
				} else if (filterValue === 'incomplete') {
					query.OR = [{ q1: null }, { q2: null }, { q3: null }, { q4: null }];
				}
				break;
			default:
				break;
		}
	}

	// ROLE CONDITIONS
	switch (role) {
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

	// Get the base query results
	const [dataRes, count] = await prisma.$transaction([
		prisma.result.findMany({
			where: {
				...query,
				...(filterColumn === 'assessment' &&
					filterValue === 'passed' && {
						AND: [
							{ q1: { not: null } },
							{ q2: { not: null } },
							{ q3: { not: null } },
							{ q4: { not: null } },
						],
					}),
			},
			include: {
				student: {
					include: {
						class: true,
						Strand: true,
						grade: true,
					},
				},
				Lesson: true,
			},
		}),
		prisma.result.count({ where: query }),
	]);

	// Post-process the results for assessment filtering
	let filteredData = dataRes;
	if (filterColumn === 'assessment') {
		filteredData = dataRes.filter((result) => {
			// Calculate average only if all quarters have values
			if (
				result.q1 !== null &&
				result.q2 !== null &&
				result.q3 !== null &&
				result.q4 !== null
			) {
				const average = (result.q1 + result.q2 + result.q3 + result.q4) / 4;

				if (filterValue === 'passed') {
					return average >= 75;
				} else if (filterValue === 'failed') {
					return average < 75;
				}
			} else if (filterValue === 'incomplete') {
				return (
					result.q1 === null ||
					result.q2 === null ||
					result.q3 === null ||
					result.q4 === null
				);
			}
			return true;
		});
	}

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Results</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) =>
									col.accessor !== 'action' &&
									col.accessor !== 'student' &&
									col.accessor !== 'section' &&
									col.accessor !== 'subject' &&
									col.filterOptions
							)}
						/>

						{role === 'teacher' && (
							<FormContainer table="result" type="create" />
						)}
					</div>
				</div>
			</div>

			{/* LIST */}
			<Table columns={columns} renderRow={renderRow} data={filteredData} />
			{/* PAGINATION */}
			{/* <Pagination page={p} count={count} /> */}
		</div>
	);
};

export default ResultListpage;
