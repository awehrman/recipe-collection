import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { endpoint } from '../config';

export const typeDefs = gql`
	type IngredientViewState {
		id: ID
		currentIngredientID: ID
    isCardEnabled: Boolean!
    isExpanded: Boolean!		
	}

  type Container {
  	id: ID!
  	label: String!
  	ingredients: [ Ingredient ]!
  	message: String
		settings: IngredientViewState
  }

  type Mutation {
    updateLocalCache(containerID: ID, ingredientID: ID, settings: IngredientViewState) : Container
  }

  type Query {
    containers: [ Containers ]
  }
`;

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers
      });
    },
    clientState: {
    	typeDefs,
    	resolvers: {
    		Mutation: {
    			// use our local cache to keep track of the UI state of:
    			//	- the current ingredient id,
    			//	- whether that card is open, and 
    			// 	- if the container itself is open

    			// let the server handle any updates to the ingredients list and assigning the next ing id in the view
    			updateLocalCache(_, { containerID, ingredientID = null, settings }, { cache, getCacheKey }) {
    				const fragment = gql`
			        fragment isExpanded on Container {
			        	id
			        	settings {
			        		id
				          currentIngredientID
				          isCardEnabled
				          isExpanded
				        }
			        }`;

			      const fragmentID = getCacheKey({ id: containerID, __typename: "Container" });

				    // lookup a fragment of our container from the cache
    				const ctnFragment = cache.readFragment({
    					id: fragmentID,
    					fragment
    				});

    				// prep container fragment updates
    				const data = {
		        	...ctnFragment,
		        	settings: {
			          __typename: 'IngredientViewState',
			          id: getCacheKey({ id: settings.id, __typename: "IngredientViewState" }),
			          currentIngredientID: ingredientID,
			          isCardEnabled: (settings.isCardEnabled || false),
			          isExpanded: (settings.isExpanded || true),
			        }
		        };

    				// update our fragment with our new UI info
			      cache.writeFragment({
			        id: fragmentID,
			        data,
			        fragment,
			      });

			      return data;
    			},
    		}
    	}
    }
  });
}

export default withApollo(createClient);
