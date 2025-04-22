'use client';

import { useSearchParams } from 'next/navigation';

interface DatePickerProps {
	defaultValue: string;
}

const DatePicker = ({ defaultValue }: DatePickerProps) => {
	const searchParams = useSearchParams();

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('date', e.target.value);

		// Perform a full page navigation
		window.location.href = `?${params.toString()}`;
	};

	return (
		<input
			type="date"
			defaultValue={defaultValue}
			onChange={handleDateChange}
			className="border rounded px-3 py-1"
		/>
	);
};

export default DatePicker;
