import AttendanceRadio from '@/components/AttendanceRadio';
import DatePicker from '@/components/DatePicker';
import FormContainer from '@/components/FormContainer';
import { updateAttendanceStatus } from '@/components/forms/AttendanceForm';
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

	// Get today's date in YYYY-MM-DD format
	const today = new Date().toISOString().split('T')[0];

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
			header: 'Attendance',
			accessor: 'attendance',
		},
	];

	const { page, search, date = today, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.StudentWhereInput = {};

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

	// Get all students first
	const [students, totalCount] = await prisma.$transaction([
		prisma.student.findMany({
			where: query,
			include: {
				class: true,
				grade: true,
				Strand: true,
				attendances: {
					where: {
						date: new Date(date),
					},
				},
			},
			orderBy: [
				{ class: { name: 'asc' } },
				{ surname: 'asc' },
				{ name: 'asc' },
			],
		}),
		prisma.student.count({ where: query }),
	]);

	// Filter students based on search term and filters
	let filteredData = students;

	if (search) {
		const searchTerm = search.toLowerCase();
		filteredData = filteredData.filter((item) => {
			const studentName = `${item.name} ${item.surname}`.toLowerCase();
			const className = item.class.name.toLowerCase();
			const strandName = item.Strand.name.toLowerCase();

			return (
				studentName.includes(searchTerm) ||
				className.includes(searchTerm) ||
				strandName.includes(searchTerm) ||
				item.grade.level.toString() === searchTerm
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
							return item.grade.level === parseInt(filterValue);
						case 'strand':
							return item.Strand.name === filterValue;
						case 'section':
							return item.class.name === filterValue;
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

	const renderRow = (item: (typeof students)[0]) => {
		const attendance = item.attendances[0];

		return (
			<tr
				key={item.id}
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
				<td className="flex items-center gap-4 p-4">
					<Image
						src={item.img || '/noAvatar.png'}
						alt=""
						width={40}
						height={40}
						className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
					/>
					<div className="flex flex-col">{item.name + ' ' + item.surname}</div>
				</td>
				<td>
					<div className="flex flex-col">{item.grade.level}</div>
				</td>
				<td>
					<div className="flex flex-col">{item.Strand.name}</div>
				</td>
				<td>
					<div className="flex flex-col">{item.class.name}</div>
				</td>
				<td>
					<AttendanceRadio
						studentId={item.id}
						currentStatus={attendance?.status}
						date={date}
					/>
				</td>
			</tr>
		);
	};

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-lg font-semibold">Attendance Records</h1>
				<div className="flex items-center gap-4">
					<DatePicker defaultValue={date} />
				</div>
			</div>

			<div className="flex flex-col md:flex-row items-center gap-4 mb-4">
				<TableSearch />
				<div className="flex items-center gap-4 self-end">
					<TableFilter
						columns={columns.filter(
							(col) =>
								col.accessor !== 'attendance' &&
								col.accessor !== 'student' &&
								col.filterOptions
						)}
					/>
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
