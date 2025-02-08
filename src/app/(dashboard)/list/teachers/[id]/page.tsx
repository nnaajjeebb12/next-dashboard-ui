import Announcements from '@/components/Announcements';
import BigCalendar from '@/components/BigCalendar';
import FormModal from '@/components/FormModal';
import Performance from '@/components/Performance';
import Image from 'next/image';
import Link from 'next/link';

const SingleTeacherPage = () => {
	return (
		<div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
			{/* LEFT */}
			<div className="w-full xl:w-2/3">
				{/* TOP */}
				<div className="flex flex-col lg:flex-row gap-4">
					{/* USER INFO CARD */}
					<div className="bg-najSky py-6 px-4 rounded-md flex-1 flex gap-4">
						<div className="w-1/3">
							<Image
								src="https://scontent.fmnl13-2.fna.fbcdn.net/v/t39.30808-6/317928724_6016268691751514_4122983082771521543_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFPVw9EWuZFKgdcFtaTb7YnDblLIy6YTIMNuUsjLphMg6P9m-AYewtLc3FDetc4pRuWtiGZmJh-dMfYvb_BTeUL&_nc_ohc=fjgA1YlMTzkQ7kNvgFxS1jp&_nc_zt=23&_nc_ht=scontent.fmnl13-2.fna&_nc_gid=A6FTQt4o9nqCCwQ0waI3i84&oh=00_AYBpIa3NQ20vgiwg6QiTQnLyHq3dN0qejuocvgdVRGUKDQ&oe=67A368FA"
								alt=""
								width={144}
								height={144}
								className="w-36 h-36 rounded-full object-cover"
							/>
						</div>
						<div className="w-2/3 flex flex-col justify-between gap-4">
							<div className="flex items-center gap-4">
								<h1 className="text-xl font-semibold">Najeeb Lopez</h1>
								<FormModal
									table="teacher"
									type="update"
									data={{
										id: 1,
										username: 'najeeblopez',
										email: 'najeeblopez@gmail.com',
										password: 'password',
										firstName: 'Najeeb',
										lastName: 'Lopez',
										phoneNumber: '09212130968',
										address: 'Somewhere in the Philippines',
										bloodType: 'A+',
										dateOfBirth: '01/01/2000',
										sex: 'male',
										img: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1200',
									}}
								/>
							</div>
							<p className="text-sm text-gray-500">
								Lorem ipsum dolor sit amet consectetur adipisicing elit.
							</p>
							<div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
								<div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
									<Image
										src="/blood.png"
										alt=""
										width={14}
										height={14}
										className=""
									/>
									<span>A+</span>
								</div>
								<div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
									<Image
										src="/date.png"
										alt=""
										width={14}
										height={14}
										className=""
									/>
									<span>January 2025</span>
								</div>
								<div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
									<Image
										src="/mail.png"
										alt=""
										width={14}
										height={14}
										className=""
									/>
									<span>najeeblopez@gmail.com</span>
								</div>
								<div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
									<Image
										src="/phone.png"
										alt=""
										width={14}
										height={14}
										className=""
									/>
									<span>09212130968</span>
								</div>
							</div>
						</div>
					</div>
					{/* SMALL CARD */}
					<div className="flex-1 flex g-4 justify-between flex-wrap">
						{/* ATTENDANCE CARD */}
						<div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
							<Image
								src="/singleAttendance.png"
								alt=""
								width={24}
								height={24}
								className="w-6 h-6"
							/>
							<div className="">
								<h1 className="text-xl font-semibold">90%</h1>
								<span className="text-sm text-gray-400">Attendance</span>
							</div>
						</div>
						{/* BRANCHES CARD */}
						<div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
							<Image
								src="/singleBranch.png"
								alt=""
								width={24}
								height={24}
								className="w-6 h-6"
							/>
							<div className="">
								<h1 className="text-xl font-semibold">2</h1>
								<span className="text-sm text-gray-400">Sections</span>
							</div>
						</div>
						{/* LESSONS CARD */}
						<div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
							<Image
								src="/singleLesson.png"
								alt=""
								width={24}
								height={24}
								className="w-6 h-6"
							/>
							<div className="">
								<h1 className="text-xl font-semibold">6</h1>
								<span className="text-sm text-gray-400">Lessons</span>
							</div>
						</div>
						{/* CLASSES CARD */}
						<div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
							<Image
								src="/singleClass.png"
								alt=""
								width={24}
								height={24}
								className="w-6 h-6"
							/>
							<div className="">
								<h1 className="text-xl font-semibold">6</h1>
								<span className="text-sm text-gray-400">Classes</span>
							</div>
						</div>
					</div>
				</div>
				{/* BOTTOM */}
				<div className="mt-4 bg-white rounded-md p-4 h-[800px]">
					<h1>Teacher&apos;s Schedule</h1>
					<BigCalendar />
				</div>
			</div>
			{/* RIGHT */}
			<div className="w-full xl:w-1/3 flex flex-col gap-4">
				<div className="bg-white p-4 rounded-md">
					<h1 className="text-xl font-semibold">Shortcuts</h1>
					<div className="mt-4 flex gap-4 flex-wrap text-xs to-gray-500">
						<Link className="p-3 rounded-md bg-najSkyLight" href="/">
							Teacher&apos;s Classes
						</Link>
						<Link
							className="p-3 rounded-md bg-najPurpleLight"
							href={`/list/students?teacherId=${'teacher2'}`}>
							Teacher&apos;s Students
						</Link>
						<Link className="p-3 rounded-md bg-najYellowLight" href="/">
							Teacher&apos;s Lessons
						</Link>
						<Link className="p-3 rounded-md bg-pink-50" href="/">
							Teacher&apos;s Exams
						</Link>
						<Link className="p-3 rounded-md bg-najSkyLight" href="/">
							Teacher&apos;s Assignments
						</Link>
					</div>
				</div>
				{/* <Performance /> */}
				<Announcements />
			</div>
		</div>
	);
};

export default SingleTeacherPage;
