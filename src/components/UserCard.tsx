import prisma from '@/lib/prisma';
import Image from 'next/image';

const getCurrentAcademicYear = () => {
	const now = new Date();
	const year = now.getFullYear();
	const shortNextYear = (year + 1).toString();
	return `${year} - ${shortNextYear}`;
};

const UserCard = async ({
	type,
}: {
	type: 'admin' | 'teacher' | 'student' | 'parent';
}) => {
	const modelMap: Record<typeof type, any> = {
		admin: prisma.admin,
		teacher: prisma.teacher,
		student: prisma.student,
		parent: prisma.parent,
	};

	const data = await modelMap[type].count();
	return (
		// <div className="rounded-2xl odd:bg-najPurple even:bg-najYellow p-4 flex-1 min-[130px]">
		<div className="rounded-2xl odd:bg-najDepEdCoolGray even:bg-najDepEdEcruBrown p-4 flex-1 min-[130px]">
			<div className="flex justify-between items-center">
				<span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
					{getCurrentAcademicYear()}
				</span>
				<Image src="/more.png" alt="" width={20} height={20} />
			</div>
			<h1 className="text-2xl font-semibold my-4">{data}</h1>
			<h2 className="capitalize text-sm font-medium text-gray-700">{type}</h2>
		</div>
	);
};

export default UserCard;
