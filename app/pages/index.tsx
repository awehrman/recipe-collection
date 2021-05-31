import { useQuery, gql } from '@apollo/client';
import React from 'react'
import Page from '../components/Page';
import { initializeApollo } from '../graphql/apollo';
import { contextResolver } from '../graphql/context';

const MyQuery = gql`
  query MyQuery {
    users {
      name
    }
  }
`;

type DashboardProps = {
}

const Dashboard: React.FC<DashboardProps> = () => {
  const { data, loading } = useQuery(MyQuery);
  return (
    <Page title='Dashboard'>
      {loading ? <span>Loading...</span> : null}
      {<pre>{JSON.stringify(data, null, 2)}</pre>}
      There's nothing here yet!
    </Page>
  )
}

export default Dashboard;

export async function getStaticProps(ctx: Context) {
  await contextResolver(ctx)
  console.log({ ctx });
  const apolloClient = initializeApollo(null, ctx);

  await apolloClient.query({
    query: MyQuery
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    }
  };
}
