'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Modal from './Modal';

interface FilterOption {
	value: string;
	label: string;
}

interface Column {
	header: string;
	accessor: string;
	filterOptions?: FilterOption[];
}

interface TableFilterProps {
	columns: Column[];
}

const TableFilter = ({ columns }: TableFilterProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleFilter = (accessor: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		// If the same filter is clicked, remove it
		if (
			params.get('filterColumn') === accessor &&
			params.get('filterValue') === value
		) {
			params.delete('filterColumn');
			params.delete('filterValue');
		} else {
			// Set new filter
			params.set('filterColumn', accessor);
			params.set('filterValue', value);
		}

		// Reset to page 1 when filtering
		params.set('page', '1');

		router.push(`?${params.toString()}`);
		setIsOpen(false);
	};

	const clearFilter = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete('filterColumn');
		params.delete('filterValue');
		router.push(`?${params.toString()}`);
		setIsOpen(false);
	};

	const currentFilterColumn = searchParams.get('filterColumn');
	const currentFilterValue = searchParams.get('filterValue');

	// Only show columns that have filterOptions
	const filterableColumns = columns.filter(
		(col) => col.filterOptions && col.filterOptions.length > 0
	);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="w-8 h-8 flex items-center justify-center rounded-full bg-najPurple">
				<Image src="/filter.png" alt="Filter" width={14} height={14} />
			</button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filter By">
				<div className="p-4">
					<div className="space-y-6">
						{filterableColumns.map((column) => (
							<div key={column.accessor} className="space-y-2">
								<h3 className="font-semibold text-sm text-gray-700">
									{column.header}
								</h3>
								<div className="flex flex-wrap gap-2">
									{column.filterOptions?.map((option) => (
										<button
											key={option.value}
											onClick={() =>
												handleFilter(column.accessor, option.value)
											}
											className={`px-3 py-1 rounded-full text-sm transition-colors ${
												currentFilterColumn === column.accessor &&
												currentFilterValue === option.value
													? 'bg-najPurple text-white'
													: 'bg-gray-100 hover:bg-najPurpleLight'
											}`}>
											{option.label}
										</button>
									))}
								</div>
							</div>
						))}
					</div>
					{currentFilterColumn && currentFilterValue && (
						<button
							onClick={clearFilter}
							className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
							Clear Filter
						</button>
					)}
				</div>
			</Modal>
		</>
	);
};

export default TableFilter;
