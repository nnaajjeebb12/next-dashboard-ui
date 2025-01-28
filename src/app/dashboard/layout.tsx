import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '/src/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Lama Dev School Management Dashboard',
	description: 'Next.js School Management System',
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div>dashboard{children}</div>;
}
