import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			colors: {
				najSky: '#C3EBFA',
				najSkyLight: '#EDF9FD',
				najPurple: '#CFCEFF',
				najPurpleLight: '#F1F0FF',
				najYellow: '#FAE27C',
				najYellowLight: '#FEFCE8',
				najDepEdRoyalBlue: '#172e73',
				najDepEdKleinBlue: '#132DB3',
				najDepEdEcruBrown: '#BDA75F',
				najDepEdCoolGray: '#9099C4',
				najDepEdBlack: '#040603',
				najDepEdVis2Blue: '#8CA3E8',
				najDepEdVistaBlue: '#97A6F4',
				najDepEdPearl: '#E7DFC4',
				najDepEdLavander: '#D6D9EA',
				najDepEdOlive: '#98C184',
			},
		},
	},
	plugins: [],
};
export default config;
