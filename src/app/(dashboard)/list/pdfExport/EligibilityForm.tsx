import { Checkbox, DatePicker, Input } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import dayjs from 'dayjs';
import React from 'react';

export interface EligibilityFormData {
	isHighSchoolCompleter: boolean;
	genAve: string;
	isJHSCompleter: boolean;
	jhsGenAve: string;
	dateOfGraduation: string;
	isPEPTCompleter: boolean;
	peptRating: string;
	isALSCompleter: boolean;
	alsRating: string;
	isOthersCompleter: boolean;
	othersSpecify: string;
}

interface EligibilityFormProps {
	data: EligibilityFormData;
	onChange: (data: Partial<EligibilityFormData>) => void;
}

const EligibilityForm: React.FC<EligibilityFormProps> = ({
	data,
	onChange,
}) => {
	const handleCheckboxChange =
		(field: keyof EligibilityFormData) => (e: CheckboxChangeEvent) => {
			onChange({ [field]: e.target.checked });
			// Reset related fields when unchecking
			if (!e.target.checked) {
				switch (field) {
					case 'isHighSchoolCompleter':
						onChange({ genAve: '' });
						break;
					case 'isJHSCompleter':
						onChange({ jhsGenAve: '' });
						break;
					case 'isPEPTCompleter':
						onChange({ peptRating: '' });
						break;
					case 'isALSCompleter':
						onChange({ alsRating: '' });
						break;
					case 'isOthersCompleter':
						onChange({ othersSpecify: '' });
						break;
				}
			}
		};

	const handleInputChange =
		(field: keyof EligibilityFormData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange({ [field]: e.target.value });
		};

	const handleDateChange = (date: dayjs.Dayjs | null) => {
		onChange({ dateOfGraduation: date ? date.format('MM/DD/YYYY') : '' });
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
			<h3 className="text-lg font-semibold mb-4">
				Eligibility for SHS Enrollment
			</h3>

			{/* First Line */}
			<div className="grid grid-cols-2 gap-6 mb-4">
				<div className="flex items-center gap-4">
					<Checkbox
						checked={data.isHighSchoolCompleter}
						onChange={handleCheckboxChange('isHighSchoolCompleter')}
						className="font-semibold">
						High School Completer*
					</Checkbox>
					<div className="flex items-center gap-2">
						<span className="font-semibold">Gen. Ave:</span>
						<Input
							className="w-20"
							value={data.genAve}
							onChange={handleInputChange('genAve')}
							disabled={!data.isHighSchoolCompleter}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Checkbox
						checked={data.isJHSCompleter}
						onChange={handleCheckboxChange('isJHSCompleter')}
						className="font-semibold">
						Junior High School Completer
					</Checkbox>
					<div className="flex items-center gap-2">
						<span className="font-semibold">Gen. Ave:</span>
						<Input
							className="w-20"
							value={data.jhsGenAve}
							onChange={handleInputChange('jhsGenAve')}
							disabled={!data.isJHSCompleter}
						/>
					</div>
				</div>
			</div>

			{/* Second Line */}
			<div className="mb-4">
				<div className="flex items-center gap-2">
					<span className="font-semibold">Date of Graduation/Completion:</span>
					<DatePicker
						format="MM/DD/YYYY"
						value={data.dateOfGraduation ? dayjs(data.dateOfGraduation) : null}
						onChange={handleDateChange}
						className="w-40"
					/>
				</div>
			</div>

			{/* Third Line */}
			<div className="grid grid-cols-3 gap-6">
				<div className="flex items-center gap-4">
					<Checkbox
						checked={data.isPEPTCompleter}
						onChange={handleCheckboxChange('isPEPTCompleter')}
						className="font-semibold">
						PEPT Passer**
					</Checkbox>
					<div className="flex items-center gap-2">
						<span className="font-semibold">Rating:</span>
						<Input
							className="w-20"
							value={data.peptRating}
							onChange={handleInputChange('peptRating')}
							disabled={!data.isPEPTCompleter}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Checkbox
						checked={data.isALSCompleter}
						onChange={handleCheckboxChange('isALSCompleter')}
						className="font-semibold">
						ALS A&E Passer***
					</Checkbox>
					<div className="flex items-center gap-2">
						<span className="font-semibold">Rating:</span>
						<Input
							className="w-20"
							value={data.alsRating}
							onChange={handleInputChange('alsRating')}
							disabled={!data.isALSCompleter}
						/>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Checkbox
						checked={data.isOthersCompleter}
						onChange={handleCheckboxChange('isOthersCompleter')}
						className="font-semibold">
						Others (Pls. Specify):
					</Checkbox>
					<Input
						className="w-40"
						value={data.othersSpecify}
						onChange={handleInputChange('othersSpecify')}
						disabled={!data.isOthersCompleter}
					/>
				</div>
			</div>

			{/* Footnotes */}
			<div className="mt-4 text-xs text-gray-500">
				<p>
					*High School Completers are students who graduated from secondary
					school under the old curriculum
				</p>
				<p>**PEPT - Philippine Educational Placement Test for JHS</p>
				<p>
					***ALS A&E - Alternative Learning System Accreditation and Equivalency
					Test for JHS
				</p>
			</div>
		</div>
	);
};

export default EligibilityForm;
