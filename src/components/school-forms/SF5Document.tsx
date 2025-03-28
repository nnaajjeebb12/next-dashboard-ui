'use client';

import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import { PDFDocumentProps } from './types';

const SF5Document = ({ data, selectedSchoolYear }: PDFDocumentProps) => {
	const PAGE_HEIGHT = 1684.8;
	const PAGE_WIDTH = 1188;

	const styles = StyleSheet.create({
		page: {
			flexDirection: 'column',
			backgroundColor: '#FFFFFF',
			padding: 30,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			pageOrientation: 'landscape',
		},
		headerContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 30,
		},
		logoContainer: {
			width: 80,
			height: 80,
		},
		titleContainer: {
			flex: 1,
			marginHorizontal: 40,
		},
		formTitle: {
			fontSize: 24,
			textAlign: 'center',
			fontWeight: 'bold',
		},
		comingSoon: {
			fontSize: 36,
			textAlign: 'center',
			marginTop: 200,
			color: '#666',
		},
	});

	return (
		<Document>
			<Page size={[PAGE_HEIGHT, PAGE_WIDTH]} style={styles.page}>
				<View style={styles.headerContainer}>
					<Image style={styles.logoContainer} src="/DrJuanLogo.png" />
					<View style={styles.titleContainer}>
						<Text style={styles.formTitle}>
							School Form 5 Report on Promotion and Level of Proficiency
							(SF5-SHS)
						</Text>
					</View>
					<Image style={styles.logoContainer} src="/deped.png" />
				</View>
				<Text style={styles.comingSoon}>Coming Soon...</Text>
			</Page>
		</Document>
	);
};

export default SF5Document;
