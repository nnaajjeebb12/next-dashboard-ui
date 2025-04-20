import { default as FormContainer } from '@/components/FormContainer';
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
	Prisma,
	Strand,
	Student,
	Subject,
	Teacher,
} from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type ClassWithDetails = Class & {
	grade: Grade;
	students: (Student & {
		Strand: Strand;
	})[];
};

type TeacherList = Teacher & {
	subjects: Subject[];
	classes: ClassWithDetails[];
};

const TeacherListpage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const role = await getRole();
	const currentUserId = await getUserId();
	const columns = [
		{
			header: 'Info',
			accessor: 'info',
		},
		{
			header: 'Teacher ID',
			accessor: 'teacherId',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Subjects',
			accessor: 'subjects',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'with_subjects', label: 'With Subjects' },
				{ value: 'no_subjects', label: 'No Subjects' },
			],
		},
		{
			header: 'Supervising Section',
			accessor: 'classes',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'with_class', label: 'With Section' },
				{ value: 'no_class', label: 'No Section' },
			],
		},
		{
			header: 'Supervising Grade',
			accessor: 'grade',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: '11', label: 'Grade 11' },
				{ value: '12', label: 'Grade 12' },
				{ value: 'none', label: 'No Grade' },
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

	const renderRow = (item: TeacherList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="flex items-center gap-4 p-4">
				<Image
					src={item.img || '/noAvatar.png'}
					alt=""
					width={40}
					height={40}
					className="md:hidden xl:block  w-10 h-10 rounded-full object-cover"
				/>
				<div className="flex flex-col">
					<h3 className="font-semibold">{item.name}</h3>
					<p className="text-xs text-gray-500">{item?.email}</p>
				</div>
			</td>
			<td className="hidden md:table-cell">{item.username}</td>
			<td className="hidden md:table-cell">
				{item.subjects.map((subject) => subject.name).join(', ')}
			</td>
			<td className="hidden md:table-cell">
				{item.classes.map((classItem) => classItem.name).join(', ') ||
					'No supervising class'}
			</td>
			<td className="hidden md:table-cell">
				{item.classes.map((classItem) => classItem.grade.level).join(', ') ||
					'No supervising grade'}
			</td>
			<td className="hidden md:table-cell">{item.phone}</td>
			<td className="hidden md:table-cell">{item.address}</td>
			<td>
				<div className="flex items-center gap-2">
					<Link href={`/list/teachers/${item.id}`}>
						<button className="w-7 h-7 flex items-center justify-center rounded-full bg-najSky">
							<Image src="/view.png" alt="" width={16} height={16} />
						</button>
					</Link>
					{role === 'admin' && (
						<FormContainer table="teacher" type="delete" id={item.id} />
					)}
				</div>
			</td>
		</tr>
	);

	const { page, filterColumn, filterValue, search, ...queryParams } =
		searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.TeacherWhereInput = {};

	if (search) {
		query.OR = [
			{ name: { contains: search, mode: 'insensitive' } },
			{ username: { contains: search, mode: 'insensitive' } },
			{
				classes: {
					some: {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ grade: { level: parseInt(search) || undefined } },
						],
					},
				},
			},
		];
	}

	if (filterColumn && filterValue) {
		switch (filterColumn) {
			case 'subjects':
				if (filterValue === 'with_subjects') {
					query.subjects = { some: {} };
				} else if (filterValue === 'no_subjects') {
					query.subjects = { none: {} };
				}
				break;
			case 'classes':
				if (filterValue === 'with_class') {
					query.classes = { some: {} };
				} else if (filterValue === 'no_class') {
					query.classes = { none: {} };
				}
				break;
			case 'grade':
				if (filterValue === 'none') {
					query.classes = { none: {} };
				} else {
					query.classes = {
						some: {
							grade: {
								level: parseInt(filterValue),
							},
						},
					};
				}
				break;
			default:
				break;
		}
	}

	const [data, count] = await prisma.$transaction([
		prisma.teacher.findMany({
			where: query,
			include: {
				subjects: true,
				classes: {
					include: {
						grade: true,
						students: {
							include: {
								Strand: true,
							},
						},
					},
				},
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.teacher.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) => col.accessor !== 'action' && col.accessor !== 'info'
							)}
						/>

						{role === 'admin' && (
							<FormContainer table="teacher" type="create" />
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

export default TeacherListpage;
