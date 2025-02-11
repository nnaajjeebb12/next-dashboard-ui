'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPage = () => {
	const { isSignedIn, user, isLoaded } = useUser();

	const router = useRouter();

	useEffect(() => {
		const role = user?.publicMetadata.role;

		if (role) {
			router.push(`/${role}`);
		}
	}, [user, router]);
	return (
		<div className="h-screen flex items-center justify-center bg-najDepEdLavander rounded-lg">
			<SignIn.Root>
				<SignIn.Step
					name="start"
					className="bg-najDepEdVis2Blue p-12 rounded-md shadow-2xl flex flex-col gap-2">
					<div className="flex flex-col items-center justify-center gap-2">
						<Image
							src="/edited-DrJuanLogo.png"
							alt=""
							width={100}
							height={100}
						/>
					</div>
					<h1 className="text-xl font-bold flex items-center justify-center gap-2">
						Dr. Juan A. Pastor
					</h1>
					<h2 className="text-sm text-gray-500 flex items-center justify-center">
						School Management System
					</h2>

					<Clerk.GlobalError className="text-sm text-red-400" />
					<Clerk.Field name="identifier" className="flex flex-col gap-2">
						<Clerk.Label className="text-xs to-gray-500">Username</Clerk.Label>
						<Clerk.Input
							type="text"
							required
							className="p-2 rounded-md ring-1 ring-gray-300"
						/>
						<Clerk.FieldError className="text-xs text-red-700" />
					</Clerk.Field>
					<Clerk.Field name="password" className="flex flex-col gap-2">
						<Clerk.Label className="text-xs to-gray-500">password</Clerk.Label>
						<Clerk.Input
							type="password"
							required
							className="p-2 rounded-md ring-1 ring-gray-300"
						/>
						<Clerk.FieldError className="text-xs text-red-700" />
					</Clerk.Field>
					<SignIn.Action
						submit
						className="bg-najDepEdRoyalBlue text-white  my-1 rounded-md p-[10px]">
						Sign In
					</SignIn.Action>
				</SignIn.Step>
			</SignIn.Root>
		</div>
	);
};

export default LoginPage;
