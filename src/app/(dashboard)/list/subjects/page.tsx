import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Prisma, Subject, Teacher } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListpage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const role = await getRole();
	const currentUserId = await getUserId();
	const columns = [
		{
			header: 'Subject Name',
			accessor: 'name',
		},
		{
			header: 'Semester',
			accessor: 'semester',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: '1st Semester', label: '1st Semester' },
				{ value: '2nd Semester', label: '2nd Semester' },
			],
		},
		{
			header: 'Subject Type',
			accessor: 'subjectType',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'CORE', label: 'Core Subject' },
				{ value: 'APPLIED', label: 'Applied Subject' },
				{ value: 'SPECIALIZED', label: 'Specialized Subject' },
			],
		},
		{
			header: 'Teachers',
			accessor: 'teachers',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'assigned', label: 'With Teacher' },
				{ value: 'unassigned', label: 'Without Teacher' },
			],
		},
		{
			header: 'Actions',
			accessor: 'action',
		},
	];

	const renderRow = (item: SubjectList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="flex items-center gap-4 p-4">{item.name}</td>
			<td className="hidden md:table-cell">{item.semester}</td>
			<td className="hidden md:table-cell">{item.subjectType}</td>
			<td className="hidden md:table-cell">
				{item.teachers.map((teacher) => teacher.name).join(', ')}
			</td>
			<td>
				<div className="flex items-center gap-2">
					{role === 'admin' && (
						<>
							<FormContainer table="subject" type="update" data={item} />
							<FormContainer table="subject" type="delete" id={item.id} />
						</>
					)}
				</div>
			</td>
		</tr>
	);

	const { page, search, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.SubjectWhereInput = {};

	if (search) {
		query.OR = [
			{
				name: { contains: search, mode: 'insensitive' },
			},
			{
				semester: { contains: search, mode: 'insensitive' },
			},
			{
				teachers: {
					some: {
						name: { contains: search, mode: 'insensitive' },
					},
				},
			},
		];
	}

	// Handle multiple filters for each column
	const filterConditions: Prisma.SubjectWhereInput[] = [];

	// Get all filter values for each column
	Object.entries(queryParams).forEach(([key, value]) => {
		if (key.endsWith('Filter') && value) {
			const column = key.replace('Filter', '');
			const values = Array.isArray(value) ? value : [value];

			switch (column) {
				case 'semester':
					filterConditions.push({
						OR: values.map((filterValue) => ({
							semester: { equals: filterValue },
						})),
					});
					break;
				case 'subjectType':
					filterConditions.push({
						OR: values.map((filterValue) => ({
							subjectType: { equals: filterValue },
						})),
					});
					break;
				case 'teachers':
					const teacherConditions = values.map((filterValue) => {
						if (filterValue === 'assigned') {
							return { teachers: { some: {} } };
						} else if (filterValue === 'unassigned') {
							return { teachers: { none: {} } };
						}
						return {};
					});
					filterConditions.push({ OR: teacherConditions });
					break;
			}
		}
	});

	// If there are filter conditions, add them to the query
	if (filterConditions.length > 0) {
		if (query.OR) {
			query.AND = [{ OR: query.OR }, ...filterConditions];
			delete query.OR;
		} else {
			query.AND = filterConditions;
		}
	}

	const [data, count] = await prisma.$transaction([
		prisma.subject.findMany({
			where: query,
			include: {
				teachers: true,
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.subject.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter((col) => col.accessor !== 'action')}
						/>

						{(role === 'admin' || role === 'teacher') && (
							<FormContainer table="subject" type="create" />
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

export default SubjectListpage;
