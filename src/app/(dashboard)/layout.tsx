import Menu from '@/components/Menu';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import '/src/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'School Management System',
	description: 'Thesis School Management System',
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
					<Image src="/logo.png" alt="logo" width={32} height={32} />
					<span className="hidden lg:block font-bold">Naj School</span>
				</Link>
				<Menu />
			</div>
			{/* RIGHT */}
			<div className="w-[86%] md:[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll">
				<Navbar />
				{children}
			</div>
		</div>
	);
}
