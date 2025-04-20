import { default as FormContainer } from '@/components/FormContainer';
import Pagination from '@/components/Pagination';
import Table from '@/components/Table';
import TableSearch from '@/components/TableSearch';
import prisma from '@/lib/prisma';
import { ITEM_PER_PAGE } from '@/lib/settings';
import { getRole, getUserId } from '@/lib/utils';
import { Admin, Prisma } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

type AdminList = Admin;

const AdminInfoListPage = async ({
	searchParams,
}: {
	searchParams: { [key: string]: string | undefined };
}) => {
	const role = await getRole();
	const currentUserId = await getUserId();
	const columns = [
		{
			header: 'Admin username',
			accessor: 'adminId',
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

	const renderRow = (item: AdminList) => (
		<tr
			key={item.id}
			className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-najPurpleLight">
			<td className="hidden md:table-cell">{item.username}</td>
			<td>
				<div className="flex items-center gap-2">
					{role === 'admin' && (
						<>
							<FormContainer
								table="admin"
								type="update"
								data={item}
								id={item.id}
								userRole={role}
							/>
							<FormContainer table="admin" type="delete" id={item.id} />
						</>
					)}
				</div>
			</td>
		</tr>
	);

	const { page, ...queryParams } = searchParams;

	const p = page ? parseInt(page) : 1;

	// URL PARAMS CONDITION
	const query: Prisma.AdminWhereInput = {};

	if (queryParams) {
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined)
				switch (key) {
					case 'search':
						query.username = { contains: value, mode: 'insensitive' };
						break;
					default:
						break;
				}
		}
	}

	const [data, count] = await prisma.$transaction([
		prisma.admin.findMany({
			take: ITEM_PER_PAGE,
			skip: ITEM_PER_PAGE * (p - 1),
		}),
		prisma.admin.count({ where: query }),
	]);

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center">
				<h1 className="hidden md:block text-lg font-semibold">All Admin</h1>
				<div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
					<TableSearch />
					<div className="flex items-center gap-4 self-end">
						<button className="w-8 h-8 flex items-center justify-center rounded-full bg-najYellow">
							<Image src="/sort.png" alt="" width={14} height={14} />
						</button>
						{role === 'admin' && <FormContainer table="admin" type="create" />}
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

export default AdminInfoListPage;
