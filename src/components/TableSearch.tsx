import Image from 'next/image';

const TableSearch = () => {
	return (
		<div className="w-full md:w-auto flex items-center text-xs rounded-full ring-[1.5px] ring-gray-300 p-2">
			<Image src="/search.png" alt="" width={14} height={14} />
			<input
				type="text"
				placeholder="Search..."
				className="w-[200px] p-0.5 bg-transparent ouline-none"
			/>
		</div>
	);
};

export default TableSearch;
