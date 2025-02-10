'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

const LoginPage = () => {
	return (
		<div className="h-screen flex items-center justify-center bg-najSkyLight">
			<SignIn.Root>
				<SignIn.Step
					name="start"
					className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2">
					<h1>Dr. Juan A. </h1>
				</SignIn.Step>
			</SignIn.Root>
		</div>
	);
};

export default LoginPage;
