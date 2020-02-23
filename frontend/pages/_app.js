import { ApolloProvider } from '@apollo/client';
import App from 'next/app';
import { withRouter } from 'next/router';

import Page from '../components/Page';
import withData from '../lib/withData';

class RecipesApp extends App {
	render() {
		const { apollo, Component, router } = this.props;
		const { query } = router;
		const pageProps = { ...query };
		return (
			<ApolloProvider client={ apollo }>
				<Page>
					{/* eslint-disable-next-line react/jsx-props-no-spreading */}
					<Component { ...pageProps } />
				</Page>
			</ApolloProvider>
		);
	}
}

export default withRouter(withData(RecipesApp));
