'use server';

import prisma from '@/lib/prisma';
import { exportSF1Form } from '../services/excel';

export async function exportForm(
	formType: string,
	schoolYear: string,
	semester: string,
	classId: number
) {
	try {
		// Get class information including supervisor (teacher)
		const classInfo = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				supervisor: true,
				students: {
					orderBy: {
						surname: 'asc',
					},
				},
			},
		});

		if (!classInfo) {
			throw new Error('Class not found');
		}

		const schoolInfo = {
			schoolName: 'Dr. Juan A. Pastor Memorial National High School',
			schoolId: '301153',
			district: 'Baco',
			division: 'Batangas',
			region: 'IV-A',
		};

		const advisorName = classInfo.supervisor
			? `${classInfo.supervisor.name} ${classInfo.supervisor.surname}`
			: 'N/A';

		switch (formType) {
			case 'sf1-shs':
				return await exportSF1Form(
					classInfo.students,
					schoolInfo,
					schoolYear,
					semester,
					advisorName
				);
			default:
				throw new Error('Unsupported form type');
		}
	} catch (error) {
		console.error('Error exporting form:', error);
		throw error;
	}
}
