/* eslint-disable react/prop-types */
import React from 'react';
import whyDidYouRender from '@welldone-software/why-did-you-render';

import Page from '../components/Page';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') whyDidYouRender(React);

function RecipesApp({ Component, pageProps }) {
	return (
		<Page>
			{ /* eslint-disable-next-line react/jsx-props-no-spreading */ }
			<Component { ...pageProps } />
		</Page>
	);
}

export default RecipesApp;
