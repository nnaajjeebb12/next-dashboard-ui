import { auth } from '@clerk/nextjs/server';

export async function getRole() {
	const { sessionClaims } = await auth();
	return (sessionClaims?.metadata as { role?: string })?.role;
}

export async function getUserId() {
	const { userId } = await auth();
	return userId;
}
