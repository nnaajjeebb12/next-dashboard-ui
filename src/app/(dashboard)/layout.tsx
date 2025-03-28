import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import '/src/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Dr. Juan A. Pastor',
	description: 'Thesis Dr. Juan A. Pastor',
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="h-screen flex">
			{/* LEFT */}
			<div className="w-[14%] md:[8%] lg:w-[16%] xl:w-[14%] p-4">
				<Link
					href="/"
					className="flex items-center justify-center lg:justify-start gap-2">
					<Image
						src="/edited-DrJuanLogo.png"
						alt="logo"
						width={32}
						height={32}
					/>
					<div className="">
						<span className="hidden lg:block font-bold">
							Dr. Juan A. Pastor
						</span>
						<span className="hidden lg:block font-bold">
							I N T E G R A T E D
						</span>
						<span className="hidden lg:block font-bold">
							National High School
						</span>
					</div>
				</Link>
				<Menu />
			</div>
			{/* RIGHT bg-[#F7F8FA]*/}
			<div className="w-[86%] md:[92%] lg:w-[84%] xl:w-[86%] bg-gray-50  overflow-scroll flex flex-col">
				<Navbar />
				{children}
			</div>
		</div>
	);
}
