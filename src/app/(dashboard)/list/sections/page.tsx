import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Class, Grade, Prisma, Strand, Student, Teacher } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type ClassList = Class & {
	supervisor: Teacher;
	grade: Grade;
	students: (Student & { Strand: Strand })[];
};

const getMajorityStrand = (students: (Student & { Strand: Strand })[]) => {
	if (students.length === 0) return 'No students';

	const strandCount = students.reduce((acc, student) => {
		const strandName = student.Strand.name;
		acc[strandName] = (acc[strandName] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const majorityStrand = Object.entries(strandCount).reduce((a, b) =>
		a[1] > b[1] ? a : b
	)[0];

	return majorityStrand;
};

const ClassListpage = async ({
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
			header: 'Section Name',
			accessor: 'name',
		},
		{
			header: 'Capacity',
			accessor: 'capacity',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'available', label: 'Has Space' },
				{ value: 'full', label: 'Full' },
			],
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
			header: 'Strand',
			accessor: 'strand',
			className: 'hidden md:table-cell',
			filterOptions: strands.map((strand) => ({
				value: strand.name,
				label: strand.name,
			})),
		},
		{
			header: 'Supervisor',
			accessor: 'supervisor',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'assigned', label: 'With Supervisor' },
				{ value: 'unassigned', label: 'Without Supervisor' },
			],
		},
		...(role == 'admin'
			? [
					{
						header: 'Actions',
						accessor: 'action',
					},
			  ]
			: []),
	];

	const renderRow = (item: ClassList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="flex items-center gap-4 p-4">{item.name}</td>
			<td className="hidden md:table-cell">{item.capacity}</td>
			<td className="hidden md:table-cell">{item.grade.level}</td>
			<td className="hidden md:table-cell">
				{getMajorityStrand(item.students)}
			</td>
			<td className="hidden md:table-cell">
				{item.supervisor?.name
					? item.supervisor.name + ' ' + item.supervisor.surname
					: 'No supervisor'}
			</td>
			<td>
				<div className="flex items-center gap-2">
					{role === 'admin' && (
						<>
							<FormContainer table="class" type="update" data={item} />
							<FormContainer table="class" type="delete" id={item.id} />
						</>
					)}
				</div>
			</td>
		</tr>
	);

	const { page, filterColumn, filterValue, search, ...queryParams } =
		searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.ClassWhereInput = {};

	// Add supervisor filter for teachers
	if (role === 'teacher') {
		query.supervisorId = currentUserId;
	}

	// Get all data first
	const [allData, totalCount] = await prisma.$transaction([
		prisma.class.findMany({
			where: query,
			include: {
				supervisor: true,
				grade: true,
				students: {
					include: {
						Strand: true,
					},
				},
			},
		}),
		prisma.class.count({ where: query }),
	]);

	// Filter data based on search term and filters
	let filteredData = allData;

	if (search) {
		const searchTerm = search.toLowerCase();
		filteredData = filteredData.filter((item) => {
			const majorityStrand = getMajorityStrand(item.students);

			return (
				item.name.toLowerCase().includes(searchTerm) ||
				item.grade.level.toString() === searchTerm ||
				majorityStrand.toLowerCase().includes(searchTerm) ||
				(item.supervisor &&
					`${item.supervisor.name} ${item.supervisor.surname}`
						.toLowerCase()
						.includes(searchTerm))
			);
		});
	}

	if (filterColumn && filterValue) {
		filteredData = filteredData.filter((item) => {
			switch (filterColumn) {
				case 'capacity':
					const isFull = item.students.length >= item.capacity;
					return filterValue === 'full' ? isFull : !isFull;
				case 'grade':
					return item.grade.level === parseInt(filterValue);
				case 'strand':
					return getMajorityStrand(item.students) === filterValue;
				case 'supervisor':
					const hasSupervisor = !!item.supervisor;
					return filterValue === 'assigned' ? hasSupervisor : !hasSupervisor;
				default:
					return true;
			}
		});
	}

	// Apply pagination after filtering
	const data = filteredData.slice(ITEM_PER_PAGE * (p - 1), ITEM_PER_PAGE * p);
	const count = filteredData.length;

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">Sections</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) => col.accessor !== 'action' && col.filterOptions
							)}
						/>

						{role === 'admin' && <FormContainer table="class" type="create" />}
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

export default ClassListpage;
