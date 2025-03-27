'use client';

import { exportForm } from '@/app/actions/export-form';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';

const FormsPage = () => {
	const [selectedForm, setSelectedForm] = useState<string>('sf1-shs');
	const [selectedSchoolYear, setSelectedSchoolYear] =
		useState<string>('2023-2024');
	const [selectedSemester, setSelectedSemester] = useState<string>('1');
	const [selectedClass, setSelectedClass] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const schoolInfo = {
		schoolName: 'Dr. Juan A. Pastor Memorial National High School',
		schoolId: '301153',
		district: 'Baco',
		division: 'Batangas',
		region: 'IV-A',
	};

	const base64ToBlob = (base64: string) => {
		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return new Blob([bytes], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		});
	};

	const handleExport = async () => {
		try {
			if (!selectedClass) {
				toast.error('Please select a class');
				return;
			}

			setIsLoading(true);

			const base64Data = await exportForm(
				selectedForm,
				selectedSchoolYear,
				selectedSemester,
				parseInt(selectedClass)
			);

			// Convert base64 to Blob
			const blob = base64ToBlob(base64Data);

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${selectedForm}-${selectedSchoolYear}-${selectedSemester}.xlsx`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);

			toast.success('Form exported successfully!');
		} catch (error) {
			console.error('Error exporting form:', error);
			toast.error('Error exporting form. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
			{/* TOP */}
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-lg font-semibold">DepEd Forms Export</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<div>
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Form Type
						</label>
						<select
							value={selectedForm}
							onChange={(e) => setSelectedForm(e.target.value)}
							className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
							<option value="sf1-shs">School Form 1 (SF1-SHS)</option>
						</select>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							School Year
						</label>
						<select
							value={selectedSchoolYear}
							onChange={(e) => setSelectedSchoolYear(e.target.value)}
							className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
							<option value="2023-2024">2023-2024</option>
							<option value="2024-2025">2024-2025</option>
						</select>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Semester
						</label>
						<select
							value={selectedSemester}
							onChange={(e) => setSelectedSemester(e.target.value)}
							className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
							<option value="1">First Semester</option>
							<option value="2">Second Semester</option>
						</select>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Class
						</label>
						<select
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value)}
							className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
							<option value="">Select a class</option>
							<option value="1">Grade 11 - STEM A</option>
							<option value="2">Grade 11 - STEM B</option>
							<option value="3">Grade 12 - STEM A</option>
							<option value="4">Grade 12 - STEM B</option>
						</select>
					</div>

					<button
						onClick={handleExport}
						disabled={isLoading}
						className="bg-najDepEdCoolGray text-white py-2 px-4 rounded-md hover:bg-najDepEdDarkGray transition w-full">
						{isLoading ? 'Exporting...' : 'Export Form'}
					</button>
				</div>

				<div className="bg-gray-50 p-4 rounded-md">
					<h2 className="text-md font-semibold mb-4">School Information</h2>
					<div className="space-y-2">
						<div>
							<span className="font-medium">School Name:</span>{' '}
							{schoolInfo.schoolName}
						</div>
						<div>
							<span className="font-medium">School ID:</span>{' '}
							{schoolInfo.schoolId}
						</div>
						<div>
							<span className="font-medium">District:</span>{' '}
							{schoolInfo.district}
						</div>
						<div>
							<span className="font-medium">Division:</span>{' '}
							{schoolInfo.division}
						</div>
						<div>
							<span className="font-medium">Region:</span> {schoolInfo.region}
						</div>
					</div>

					<div className="mt-6">
						<h3 className="text-sm font-semibold mb-2">Form Information</h3>
						<p className="text-sm text-gray-600">
							School Form 1 (SF1-SHS) is the School Register for Senior High
							School. It contains:
						</p>
						<ul className="list-disc list-inside text-sm text-gray-600 mt-2">
							<li>Student personal information</li>
							<li>Parent/Guardian information</li>
							<li>Address and contact details</li>
							<li>Learner reference number (LRN)</li>
							<li>Other required DepEd data</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FormsPage;
