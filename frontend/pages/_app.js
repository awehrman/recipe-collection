/* eslint-disable react/prop-types */
import { ApolloProvider } from '@apollo/client';
import App from 'next/app';
import React from 'react';
import { withRouter } from 'next/router';
import whyDidYouRender from '@welldone-software/why-did-you-render';

import Page from '../components/Page';
import withData from '../lib/withData';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
	whyDidYouRender(React);
}

function WithApollo({ props, pageProps }) {
	const { apollo, Component } = props;

	// lol nope this breaks all sorts of things
	// const memoizedClient = useMemo(() => ({ apollo }), [ apollo ]);
	const combined = {
		apollo,
		...pageProps,
	};

	return (
		<ApolloProvider client={ apollo }>
			<Page>
				{/* eslint-disable-next-line react/jsx-props-no-spreading */}
				<Component { ...combined } />
			</Page>
		</ApolloProvider>
	);
}

class RecipesApp extends App {
	render() {
		const { query } = this.props.router;
		const pageProps = { ...query };

		return (
			<WithApollo
				props={ this.props }
				pageProps={ pageProps }
			/>
		);
	}
}

export default withRouter(withData(RecipesApp));
