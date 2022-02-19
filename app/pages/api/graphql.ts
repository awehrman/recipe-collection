import { ApolloServer } from 'apollo-server-micro';

import { schema } from '../../graphql/schema';
import { contextResolver } from './../../graphql/context';

const apolloServer = new ApolloServer({
  context: contextResolver,
  schema,
  tracing: process.env.NODE_ENV === 'development'
});

export const config = {
  api: {
    bodyParser: false
  }
};

export default apolloServer.createHandler({
  path: '/api/graphql'
});