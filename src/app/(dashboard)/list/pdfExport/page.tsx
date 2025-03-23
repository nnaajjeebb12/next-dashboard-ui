'use client';

import {
	Document,
	Page,
	PDFDownloadLink,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import React from 'react';

// Define types
interface DataItem {
	name: string;
	value: number;
}

// PDF Document Component
const PDFDocument = ({ data }: { data: DataItem[] }) => {
	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			backgroundColor: '#FFFFFF',
			padding: 30,
		},
		title: {
			fontSize: 24,
			textAlign: 'center',
			marginBottom: 20,
		},
		table: {
			display: 'flex',
			width: 'auto',
			borderStyle: 'solid',
			borderWidth: 1,
			borderColor: '#bfbfbf',
			marginBottom: 20,
		},
		tableRow: {
			flexDirection: 'row',
		},
		tableHeaderCell: {
			backgroundColor: '#f0f0f0',
			padding: 5,
			borderWidth: 1,
			borderColor: '#bfbfbf',
			width: '50%',
			textAlign: 'center',
			fontWeight: 'bold',
		},
		tableCell: {
			padding: 5,
			borderWidth: 1,
			borderColor: '#bfbfbf',
			width: '50%',
			textAlign: 'center',
		},
	});

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>Data Export</Text>

				{/* Table Header */}
				<View style={styles.table}>
					<View style={styles.tableRow}>
						<Text style={styles.tableHeaderCell}>Name</Text>
						<Text style={styles.tableHeaderCell}>Value</Text>
					</View>

					{/* Table Rows */}
					{data.map((item, index) => (
						<View style={styles.tableRow} key={index}>
							<Text style={styles.tableCell}>{item.name}</Text>
							<Text style={styles.tableCell}>{item.value}</Text>
						</View>
					))}
				</View>
			</Page>
		</Document>
	);
};

// Main Page Component
const PdfExportPage = () => {
	// Example data - to be replaced with database data later
	const sampleData: DataItem[] = [
		{ name: 'Item 1', value: 500 },
		{ name: 'Item 2', value: 300 },
		{ name: 'Item 3', value: 700 },
		{ name: 'Item 4', value: 250 },
	];

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-2xl font-bold mb-6">PDF Export</h1>

			{/* Display data as HTML table on the page */}
			<div className="overflow-x-auto mb-8">
				<table className="min-w-full bg-white border border-gray-300">
					<thead>
						<tr>
							<th className="py-2 px-4 border-b">Name</th>
							<th className="py-2 px-4 border-b">Value</th>
						</tr>
					</thead>
					<tbody>
						{sampleData.map((item, index) => (
							<tr
								key={index}
								className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
								<td className="py-2 px-4 border-b">{item.name}</td>
								<td className="py-2 px-4 border-b">{item.value}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* PDF Download Button */}
			<PDFDownloadLink
				document={<PDFDocument data={sampleData} />}
				fileName="export.pdf"
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				{({ loading }) => (loading ? 'Preparing document...' : 'Download PDF')}
			</PDFDownloadLink>
		</div>
	);
};

export default PdfExportPage;
