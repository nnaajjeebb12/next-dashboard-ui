'use client';
import { count } from 'console';
import Image from 'next/image';
import {
	Legend,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
} from 'recharts';

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
	const data = [
		{
			name: 'Total',
			count: boys + girls,
			fill: 'White',
		},
		{
			name: 'Girls',
			count: girls,
			fill: '#BDA75F',
		},
		{
			name: 'Boys',
			count: boys,
			fill: '#9099C4',
		},
	];

	return (
		<div className="relative w-full h-[75%]">
			<ResponsiveContainer>
				<RadialBarChart
					cx="50%"
					cy="50%"
					innerRadius="40%"
					outerRadius="100%"
					barSize={32}
					data={data}>
					<RadialBar background dataKey="count" />
				</RadialBarChart>
			</ResponsiveContainer>
			<Image
				src="/maleFemale.png"
				alt=""
				width={50}
				height={50}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
			/>
		</div>
	);
};

export default CountChart;
