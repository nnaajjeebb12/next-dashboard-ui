import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Attendance, Prisma, Student } from '@prisma/client';
import Image from 'next/image';

type AttendanceRecord = {
	id: string;
	date: Date;
	present: boolean;
	student: {
		name: string;
		surname: string;
	};
};

type AttendanceList = Attendance & { student: Student };

const AttendanceListPage = async ({
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
			header: 'Date',
			accessor: 'date',
		},
		{
			header: 'Status',
			accessor: 'status',
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
				{new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}).format(new Date(item.date))}
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
					{(role === 'admin' || role === 'teacher') && (
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

	// Get current page from searchParams (defaults to page 1)
	const { page, ...queryParams } = searchParams;
	const p = page ? parseInt(page) : 1;

	// Initialize the query object
	let query: Prisma.AttendanceWhereInput = {};

	// Process query parameters
	if (queryParams) {
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined) {
				switch (key) {
					case 'search':
						// Search by student name instead of studentId
						query.student = {
							name: { contains: value, mode: 'insensitive' },
						};
						break;
					default:
						break;
				}
			}
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
				student: true,
				// Remove the lesson inclusion
			},
			orderBy: {
				date: 'desc',
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
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
						<button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<Image src="/sort.png" alt="" width={14} height={14} />
						</button>
						{(role === 'admin' || role === 'teacher') && (
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
