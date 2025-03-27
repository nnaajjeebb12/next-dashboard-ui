const Loading = () => {
	return (
		<div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-najDepEdCoolGray mx-auto"></div>
				<p className="mt-4 text-gray-600">Loading forms...</p>
			</div>
		</div>
	);
};

export default Loading;
