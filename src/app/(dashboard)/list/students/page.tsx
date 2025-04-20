import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Class, Grade, Prisma, Strand, Student } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type StudentList = Student & { class: Class } & { Strand: Strand } & {
	grade: Grade;
};

const StudentListpage = async ({
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
			header: 'LRN',
			accessor: 'lrn',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Name',
			accessor: 'name',
		},
		{
			header: 'Student ID',
			accessor: 'studentId',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Strand',
			accessor: 'Strand',
			filterOptions: strands.map((strand) => ({
				value: strand.name,
				label: strand.name,
			})),
		},
		{
			header: 'Section',
			accessor: 'section',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Grade',
			accessor: 'grade',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: '11', label: 'Grade 11' },
				{ value: '12', label: 'Grade 12' },
			],
		},
		{
			header: 'Phone',
			accessor: 'phone',
			className: 'hidden lg:table-cell',
		},
		{
			header: 'Address',
			accessor: 'address',
			className: 'hidden lg:table-cell',
		},
		...(role === 'admin'
			? [
					{
						header: 'Actions',
						accessor: 'action',
					},
			  ]
			: []),
	];

	const renderRow = (item: StudentList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="">{item.lrn}</td>
			<td className="flex items-center gap-1 p-1">
				<h3 className="font-semibold">{item.name}</h3>
			</td>
			<td className="hidden md:table-cell">{item.username}</td>
			<td className="hidden md:table-cell">{item.Strand.name}</td>
			<td className="hidden md:table-cell">{item.class.name}</td>
			<td className="hidden md:table-cell">{item.grade.level}</td>
			<td className="hidden md:table-cell">{item.phone}</td>
			<td className="hidden md:table-cell">{item.address}</td>
			<td>
				<div className="flex items-center gap-2">
					<Link href={`/list/students/${item.id}`}>
						<button className="w-7 h-7 flex items-center justify-center rounded-full bg-najSky">
							<Image src="/view.png" alt="" width={16} height={16} />
						</button>
					</Link>
					{role === 'admin' && (
						<FormContainer table="student" type="delete" id={item.id} />
					)}
				</div>
			</td>
		</tr>
	);

	const { page, filterColumn, filterValue, search, ...queryParams } =
		searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.StudentWhereInput = {};

	if (search) {
		// Only try to parse as number if it's a small number (for grade levels)
		const isGradeSearch = !isNaN(parseInt(search)) && search.length <= 2;
		const gradeLevel = isGradeSearch ? parseInt(search) : null;

		query.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ username: { contains: search, mode: 'insensitive' } },
			{ lrn: { contains: search, mode: 'insensitive' } },
			{ Strand: { name: { contains: search, mode: 'insensitive' } } },
			{ class: { name: { contains: search, mode: 'insensitive' } } },
		];

		// Only add grade search if it's likely a grade level (1-2 digits)
		if (gradeLevel !== null) {
			query.OR.push({ grade: { level: gradeLevel } });
		}
	}

	if (filterColumn && filterValue) {
		switch (filterColumn) {
			case 'Strand':
				query.Strand = {
					name: filterValue,
				};
				break;
			case 'grade':
				query.grade = {
					level: parseInt(filterValue),
				};
				break;
			default:
				break;
		}
	}

	// If teacher is logged in, only show their students
	if (role === 'teacher' && currentUserId) {
		query.class = {
			OR: [
				{ supervisorId: currentUserId },
				{
					lessons: {
						some: {
							teacherId: currentUserId,
						},
					},
				},
			],
		};
	}

	const [data, count] = await prisma.$transaction([
		prisma.student.findMany({
			where: query,
			include: {
				Strand: true,
				class: true,
				grade: true,
			},
			take: 10,
			skip: 10 * (p - 1),
		}),
		prisma.student.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Students</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) => col.accessor !== 'action' && col.filterOptions
							)}
						/>

						{role === 'admin' && (
							<FormContainer table="student" type="create" />
						)}
					</div>
				</div>
			</div>

			{/* LIST */}
			<Table columns={columns} renderRow={renderRow} data={data} />
			{/* PAGINATION */}
			<Pagination page={p} count={count} />
		</div>
	);
};

export default StudentListpage;
