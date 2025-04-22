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

	// Get classes based on role
	const classes =
		role === 'teacher'
			? await prisma.$queryRaw<{ name: string }[]>`
			SELECT DISTINCT c.name 
			FROM "Class" c
			LEFT JOIN "Lesson" l ON l."classId" = c.id
			WHERE c."supervisorId" = ${currentUserId}
			OR l."teacherId" = ${currentUserId}
			ORDER BY c.name ASC
		`
			: await prisma.class.findMany({
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
			accessor: 'student.class.name',
			filterOptions: classes.map((cls) => ({
				value: cls.name,
				label: cls.name,
			})),
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

	const { page, search, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.ResultWhereInput = {};

	// If teacher is logged in, only show their results
	if (role === 'teacher' && currentUserId) {
		query.OR = [
			{
				student: {
					class: {
						supervisorId: currentUserId,
					},
				},
			},
			{
				Lesson: {
					teacherId: currentUserId,
				},
			},
		];
	}

	// Get all data first to perform in-memory filtering
	const [allData, totalCount] = await prisma.$transaction([
		prisma.result.findMany({
			where: query,
			include: {
				student: {
					include: {
						class: true,
						grade: true,
						Strand: true,
					},
				},
				Lesson: true,
			},
		}),
		prisma.result.count({ where: query }),
	]);

	// Filter data based on search term and filters
	let filteredData = allData;

	if (search) {
		const searchTerm = search.toLowerCase();
		filteredData = filteredData.filter((item) => {
			const studentName =
				`${item.student.name} ${item.student.surname}`.toLowerCase();
			const className = item.student.class.name.toLowerCase();
			const strandName = item.student.Strand.name.toLowerCase();
			const lessonName = item.Lesson?.name?.toLowerCase() || '';

			return (
				studentName.includes(searchTerm) ||
				className.includes(searchTerm) ||
				strandName.includes(searchTerm) ||
				lessonName.includes(searchTerm) ||
				item.student.grade.level.toString() === searchTerm
			);
		});
	}

	// Handle multiple filters
	Object.entries(queryParams).forEach(([key, value]) => {
		if (key.endsWith('Filter') && value) {
			const column = key.replace('Filter', '');
			const values = Array.isArray(value) ? value : [value];

			filteredData = filteredData.filter((item) => {
				return values.some((filterValue) => {
					switch (column) {
						case 'grade':
							return item.student.grade.level === parseInt(filterValue);
						case 'student.class.name':
							return item.student.class.name === filterValue;
						case 'strand':
							return item.student.Strand.name === filterValue;
						case 'assessment':
							const scores = [item.q1, item.q2, item.q3, item.q4].filter(
								(score) => score !== null
							) as number[];
							const totalScore =
								scores.length > 0
									? scores.reduce((sum, score) => sum + score, 0) /
									  scores.length
									: 0;
							const allQuartersComplete =
								item.q1 !== null &&
								item.q2 !== null &&
								item.q3 !== null &&
								item.q4 !== null;

							if (!allQuartersComplete && filterValue === 'incomplete') {
								return true;
							}

							if (allQuartersComplete) {
								if (filterValue === 'passed') {
									return totalScore >= 75;
								} else if (filterValue === 'failed') {
									return totalScore < 75;
								}
							}
							return false;
						default:
							return true;
					}
				});
			});
		}
	});

	// Apply pagination after filtering
	const data = filteredData.slice(ITEM_PER_PAGE * (p - 1), ITEM_PER_PAGE * p);
	const count = filteredData.length;

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
			<Table columns={columns} renderRow={renderRow} data={data} />
			{/* PAGINATION */}
			{/* <Pagination page={p} count={count} /> */}
		</div>
	);
};

export default ResultListpage;
