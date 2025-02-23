/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: 'images.pexels.com',
			},
			{ hostname: 'www.facebook.com' },
			{ hostname: 'scontent.fmnl13-2.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-1.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-3.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-4.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-5.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-6.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-7.fna.fbcdn.net' },
			{ hostname: 'scontent.fmnl13-8.fna.fbcdn.net' },
			{ hostname: 'media.discordapp.net' },
			{ hostname: 'res.cloudinary.com' },
		],
	},
};

export default nextConfig;
