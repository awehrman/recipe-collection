import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import React from 'react';
import { ThemeProvider } from "styled-components";
import { Provider } from 'next-auth/client';

import useApollo from './../graphql/apollo';
import { theme, GlobalStyle } from './theme';

export default function App({ Component, pageProps }: AppProps): React.ReactElement {
  const client = useApollo(pageProps.initialApolloState);
  return (
    <ApolloProvider client={client}>
      <Provider session={pageProps.session}>
        <GlobalStyle />
        <ThemeProvider theme={theme}>
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </ApolloProvider>
  );
}