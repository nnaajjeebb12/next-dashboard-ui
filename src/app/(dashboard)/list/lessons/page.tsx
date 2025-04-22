import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableFilter from '@/components/TableFilter';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Class, Lesson, Prisma, Subject, Teacher } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type LessonList = Lesson & {
	subject: { name: string; semester: string | null };
} & {
	class: {
		name: string;
		grade: {
			level: number;
		};
		students: {
			Strand: {
				name: string;
			};
		}[];
	};
} & {
	teacher: Teacher;
};

const getMajorityStrand = (students: { Strand: { name: string } }[]) => {
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

const LessonListpage = async ({
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
			header: 'Lesson Name',
			accessor: 'name',
		},
		{
			header: 'Subject Name',
			accessor: 'subject',
		},
		{
			header: 'Section Name',
			accessor: 'class',
		},
		{
			header: 'Grade',
			accessor: 'grade',
			className: 'hidden',
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
			header: 'Teacher Name',
			accessor: 'teacher',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Day',
			accessor: 'day',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'MONDAY', label: 'Monday' },
				{ value: 'TUESDAY', label: 'Tuesday' },
				{ value: 'WEDNESDAY', label: 'Wednesday' },
				{ value: 'THURSDAY', label: 'Thursday' },
				{ value: 'FRIDAY', label: 'Friday' },
				{ value: 'SATURDAY', label: 'Saturday' },
				{ value: 'SUNDAY', label: 'Sunday' },
			],
		},
		{
			header: 'Time',
			accessor: 'time',
			className: 'hidden md:table-cell',
			filterOptions: [
				{ value: 'morning', label: 'Morning (7AM-12PM)' },
				{ value: 'afternoon', label: 'Afternoon (12PM-5PM)' },
			],
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

	const renderRow = (item: LessonList) => {
		// Calculate majority strand
		const strandCounts = item.class.students.reduce((acc, student) => {
			const strandName = student.Strand.name;
			acc[strandName] = (acc[strandName] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const majorityStrand = Object.entries(strandCounts).reduce((a, b) =>
			strandCounts[a[0]] > strandCounts[b[0]] ? a : b
		)[0];

		return (
			<tr
				key={item.id}
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
				<td className="flex items-center gap-4 p-4">{item.name}</td>
				<td>{item.subject.name}</td>
				<td>{item.class.name}</td>
				<td className="hidden">{item.class.grade.level}</td>
				<td className="hidden md:table-cell">{majorityStrand}</td>
				<td className="hidden md:table-cell">
					{item.teacher.name + ' ' + item.teacher.surname}
				</td>
				<td className="hidden md:table-cell">{item.day}</td>
				<td className="hidden lg:table-cell">
					{new Intl.DateTimeFormat('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						hour12: true,
					}).format(item.startTime)}
					{' - '}
					{new Intl.DateTimeFormat('en-US', {
						hour: '2-digit',
						minute: '2-digit',
						hour12: true,
					}).format(item.endTime)}
				</td>
				<td>
					<div className="flex items-center gap-2">
						{role === 'admin' && (
							<>
								<FormContainer table="lesson" type="update" data={item} />
								<FormContainer table="lesson" type="delete" id={item.id} />
							</>
						)}
					</div>
				</td>
			</tr>
		);
	};

	const { page, filterColumn, filterValue, search, ...queryParams } =
		searchParams;

	const p = page ? parseInt(page) : 1;

	// Get all data first
	const [allData, totalCount] = await prisma.$transaction([
		prisma.lesson.findMany({
			include: {
				subject: { select: { name: true, semester: true } },
				class: {
					select: {
						name: true,
						grade: {
							select: { level: true },
						},
						students: {
							include: {
								Strand: true,
							},
						},
					},
				},
				teacher: { select: { name: true, surname: true } },
			},
		}),
		prisma.lesson.count(),
	]);

	// Filter data based on search term and filters
	let filteredData = allData;

	if (search) {
		const searchTerm = search.toLowerCase();
		filteredData = filteredData.filter((item) => {
			const majorityStrand = getMajorityStrand(item.class.students);

			return (
				item.name.toLowerCase().includes(searchTerm) ||
				(item.subject.name || '').toLowerCase().includes(searchTerm) ||
				item.class.name.toLowerCase().includes(searchTerm) ||
				item.class.grade.level.toString() === searchTerm ||
				majorityStrand.toLowerCase().includes(searchTerm) ||
				`${item.teacher.name} ${item.teacher.surname}`
					.toLowerCase()
					.includes(searchTerm)
			);
		});
	}

	if (filterColumn && filterValue) {
		filteredData = filteredData.filter((item) => {
			switch (filterColumn) {
				case 'grade':
					return item.class.grade.level === parseInt(filterValue);
				case 'strand':
					return getMajorityStrand(item.class.students) === filterValue;
				case 'day':
					return item.day === filterValue;
				case 'time':
					const hour = new Date(item.startTime).getHours();
					return filterValue === 'morning' ? hour < 12 : hour >= 12;
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
				<h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<TableFilter
							columns={columns.filter(
								(col) =>
									col.accessor !== 'action' &&
									col.accessor !== 'subject' &&
									col.accessor !== 'class' &&
									col.accessor !== 'teacher' &&
									col.filterOptions
							)}
						/>

						{role === 'admin' && <FormContainer table="lesson" type="create" />}
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

export default LessonListpage;
