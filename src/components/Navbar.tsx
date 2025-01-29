import Image from 'next/image';

const Navbar = () => {
	return (
		<div className="flex items-center justify-between p-4">
			{/* SEARCH BAR */}
			<div className="hidden md:flex items-center text-xs rounded-full ring-[1.5px] ring-gray-300 p-2">
				<Image src="/search.png" alt="" width={14} height={14} />
				<input
					type="text"
					placeholder="Search..."
					className="w-[200px] p-0.5 bg-transparent ouline-none"
				/>
			</div>
			{/* ICONS AND USER */}
			<div className="flex items-center gap-6 justify-end w-full">
				<div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
					<Image src="/message.png" alt="" width={20} height={20} />
				</div>
				<div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
					<Image src="/announcement.png" alt="" width={20} height={20} />
					<div className="absolute -top-3 -right-3 w-5 h-5 flex items-center bg-purple-500 text-white rounded-full text-xs"></div>
				</div>
				<div className="flex flex-col">
					<span className="text-s leading-3 font-medium">Najeeb Lopez</span>
					<span className='="text-xs text-gray-500 text-right'>Admin</span>
				</div>
				<Image
					src="/avatar.png"
					alt=""
					width={36}
					height={36}
					className="rounded-full"
				/>
			</div>
		</div>
	);
};

export default Navbar;
