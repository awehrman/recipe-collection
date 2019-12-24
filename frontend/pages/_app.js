/* eslint-disable react/jsx-props-no-spreading */
import { ApolloProvider } from 'react-apollo';
import App from 'next/app';

import Page from '../components/Page';
import withData from '../lib/withData';

class RecipeApp extends App {
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};
		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		// this exposes the query to the user
		pageProps.query = ctx.query;

		return { pageProps };
	}

	render() {
		const { apollo, Component, pageProps } = this.props;

		return (
			<ApolloProvider client={ apollo }>
				<Page>
					<Component { ...pageProps } />
				</Page>
			</ApolloProvider>
		);
	}
}

export default withData(RecipeApp);
