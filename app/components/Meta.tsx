import React from 'react';
import Head from 'next/head';

const Meta: React.FC = () => (
	<Head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta charSet="utf-8" />
		<link rel="shortcut icon" href="/static/favicon.ico" />
		<title>Recipe Collection</title>
	</Head>
);

export default Meta;
