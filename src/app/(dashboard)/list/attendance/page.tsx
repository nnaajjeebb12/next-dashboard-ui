import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import {
	Attendance,
	Class,
	Grade,
	Prisma,
	Strand,
	Student,
} from '@prisma/client';
import Image from 'next/image';

type AttendanceRecord = {
	id: string;
	date: Date;
	present: boolean;
	student: {
		name: string;
		surname: string;
	};
	semester: string;
};

type AttendanceList = Attendance & {
	student: Student & {
		class: Class;
		grade: Grade;
		Strand: Strand;
	};
};

const AttendanceListPage = async ({
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

	// Get all classes/sections
	const classes = await prisma.class.findMany({
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
			header: 'Section',
			accessor: 'section',
			className: 'hidden md:table-cell',
			filterOptions: classes.map((cls) => ({
				value: cls.name,
				label: cls.name,
			})),
		},
		{
			header: 'Date',
			accessor: 'date',
		},
		{
			header: 'Semester',
			accessor: 'semester',
			filterOptions: [
				{ value: '1st Semester', label: '1st Semester' },
				{ value: '2nd Semester', label: '2nd Semester' },
			],
		},
		{
			header: 'Status',
			accessor: 'status',
			filterOptions: [
				{ value: '1', label: 'Present' },
				{ value: '0', label: 'Absent' },
				{ value: 'E', label: 'Excused' },
				{ value: 'H', label: 'Holiday' },
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

	const { page, search, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.AttendanceWhereInput = {};

	// If teacher is logged in, only show their students' attendance
	if (role === 'teacher' && currentUserId) {
		query.student = {
			class: {
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
			},
		};
	}

	// Get all data first to perform in-memory filtering
	const [allData, totalCount] = await prisma.$transaction([
		prisma.attendance.findMany({
			where: query,
			include: {
				student: {
					include: {
						class: true,
						grade: true,
						Strand: true,
					},
				},
			},
		}),
		prisma.attendance.count({ where: query }),
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
			const date = new Date(item.date).toLocaleDateString().toLowerCase();

			return (
				studentName.includes(searchTerm) ||
				className.includes(searchTerm) ||
				strandName.includes(searchTerm) ||
				date.includes(searchTerm) ||
				item.student.grade.level.toString() === searchTerm ||
				item.semester?.toLowerCase().includes(searchTerm)
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
						case 'strand':
							return item.student.Strand.name === filterValue;
						case 'section':
							return item.student.class.name === filterValue;
						case 'semester':
							return item.semester === filterValue;
						case 'status':
							return item.status === filterValue;
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

	const renderRow = (item: AttendanceList) => (
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
			<td>
				<div className="flex flex-col">{item.student.grade.level}</div>
			</td>
			<td>
				<div className="flex flex-col">{item.student.Strand.name}</div>
			</td>
			<td>
				<div className="flex flex-col">{item.student.class.name}</div>
			</td>

			<td>
				{new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}).format(new Date(item.date))}
			</td>

			<td>
				<div className="flex flex-col">{item.semester}</div>
			</td>

			<td>
				<span
					className={`px-2 py-1 rounded-full text-xs ${
						item.status === '1'
							? 'bg-green-100 text-green-800'
							: item.status === '0'
							? 'bg-red-100 text-red-800'
							: item.status === 'E'
							? 'bg-yellow-100 text-yellow-800'
							: item.status === 'H'
							? 'bg-blue-100 text-blue-800'
							: 'bg-gray-100 text-gray-800'
					}`}>
					{item.status === '1'
						? 'Present'
						: item.status === '0'
						? 'Absent'
						: item.status === 'E'
						? 'Excused'
						: item.status === 'H'
						? 'Holiday'
						: 'Unknown'}
				</span>
			</td>
			<td>
				<div className="flex items-center gap-2">
					{role === 'teacher' && (
						<>
							<FormContainer
								table="attendance"
								type="update"
								data={item}
								id={item.id}
								userRole={role}
							/>
							<FormContainer table="attendance" type="delete" id={item.id} />
						</>
					)}
				</div>
			</td>
		</tr>
	);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">
					Attendance Records
				</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) =>
									col.accessor !== 'action' &&
									col.accessor !== 'student' &&
									col.filterOptions
							)}
						/>

						{role === 'teacher' && (
							<FormContainer table="attendance" type="create" />
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

export default AttendanceListPage;
