import FormContainer from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Class, Lesson, Prisma, Subject, Teacher } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
	teacher: Teacher;
};

const LessonListpage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const role = await getRole();
	const currentUserId = await getUserId();
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
			header: 'Teacher Name',
			accessor: 'teacher',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Day',
			accessor: 'day',
			className: 'hidden md:table-cell',
		},
		{
			header: 'Start Time',
			accessor: 'startTime',
			className: 'hidden md:table-cell',
		},
		{
			header: 'End Time',
			accessor: 'endTime',
			className: 'hidden md:table-cell',
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

	const renderRow = (item: LessonList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="flex items-center gap-4 p-4">{item.name}</td>
			<td>{item.subject.name}</td>
			<td>{item.class.name}</td>
			<td className="hidden md:table-cell">
				{item.teacher.name + ' ' + item.teacher.surname}
			</td>
			<td className="hidden md:table-cell">{item.day}</td>
			<td className="hidden lg:table-cell">
				{new Intl.DateTimeFormat('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: true, // or false for 24-hour format
				}).format(item.startTime)}
			</td>
			<td className="hidden lg:table-cell">
				{new Intl.DateTimeFormat('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: true, // or false for 24-hour format
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

	const { page, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.LessonWhereInput = {};

	if (queryParams) {
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined)
				switch (key) {
					case 'classId':
						query.classId = parseInt(value);
						break;
					case 'teacherId':
						query.teacherId = value;
						break;
					case 'search':
						query.OR = [
							{ name: { contains: value, mode: 'insensitive' } },
							{ subject: { name: { contains: value, mode: 'insensitive' } } },
							{
								teacher: {
									OR: [
										{ name: { contains: value, mode: 'insensitive' } },
										{ surname: { contains: value, mode: 'insensitive' } },
									],
								},
							},
						];
						break;
					default:
						break;
				}
		}
	}

	const [data, count] = await prisma.$transaction([
		prisma.lesson.findMany({
			where: query,
			include: {
				subject: { select: { name: true, semester: true } },
				class: { select: { name: true } },
				teacher: { select: { name: true, surname: true } },
			},
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.lesson.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						{/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<Image src="/filter.png" alt="" width={14} height={14} />
						</button> */}
						{/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<Image src="/sort.png" alt="" width={14} height={14} />
						</button>
						</button> */}
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
