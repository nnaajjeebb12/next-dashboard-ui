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

	const { page, filterColumn, filterValue, search } = searchParams;
	const p = page ? parseInt(page) : 1;

	// Initialize the query object
	let query: Prisma.AttendanceWhereInput = {};

	if (search) {
		query.OR = [
			{ student: { name: { contains: search, mode: 'insensitive' } } },
			{ student: { surname: { contains: search, mode: 'insensitive' } } },
			{
				student: { class: { name: { contains: search, mode: 'insensitive' } } },
			},
			{
				student: {
					Strand: { name: { contains: search, mode: 'insensitive' } },
				},
			},
			{ semester: { contains: search, mode: 'insensitive' } },
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
			case 'semester':
				query.semester = filterValue;
				break;
			case 'status':
				query.status = filterValue;
				break;
			default:
				break;
		}
	}

	// Build query conditions based on user role
	if (role === 'student') {
		query = {
			...query,
			studentId: currentUserId!,
		};
	}
	// Admin gets all records; no additional conditions needed

	// Execute the database queries
	const [data, count] = await prisma.$transaction([
		prisma.attendance.findMany({
			where: query,
			include: {
				student: {
					include: {
						class: true,
						Strand: true,
						grade: true,
					},
				},
			},
			orderBy: {
				date: 'desc',
			},
			// take: ITEM_PER_PAGE,
			// skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.attendance.count({
			where: query,
		}),
	]);

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
									col.accessor !== 'section' &&
									col.accessor !== 'date' &&
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
			{/* <Pagination page={p} count={count} /> */}
		</div>
	);
};

export default AttendanceListPage;
