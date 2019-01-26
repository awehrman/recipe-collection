import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { endpoint } from '../config';

//import { LOCAL_INGREDIENTS_QUERY, POPULATE_CONTAINERS_QUERY } from '../pages/ingredients';

export const typeDefs = `
  type Container {
  	id: ID!
  	label: String!
  	ingredients: [ Ingredient ]!
  	message: String
  	currentIngredientID: ID
    isExpanded: Boolean!
    isCardEnabled: Boolean!
  }

  type Mutation {
    updateContainer(container: Container, group: String, ingredientID: ID, removeCurrentFromList: Boolean, view: String): Container
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
        headers,
      });
    },
    // local data
    clientState: {
    	typeDefs,
    	resolvers: {
    		Mutation: {
    			updateContainer(_, variables, { cache, getCacheKey }) {
    				const { container, group, ingredientID, removeCurrentFromList, view } = variables;

    				let ing;
			      const fragmentId = getCacheKey({ id: container.id, __typename: "Container" });
			      const fragment = gql`
			        fragment isExpanded on Container {
			          currentIngredientID
			        	id
			          ingredients {
			          	id
									name
			          }
			          isCardEnabled
			          isExpanded
			        }
			      `;
			      
			      const ctn = cache.readFragment({
			        fragment,
			        id: fragmentId
			      });

			      // if we pass an ingredientID; lookup the ingredient from the cache and set it to the currentIngredientID
			      if (ingredientID) {
			      	ing = ctn.ingredients.filter(i => i.id === ingredientID)[0];
			      }

			      if (removeCurrentFromList && (view === 'new') && (container.currentIngredientID !== ingredientID)) {
			      	ctn.ingredients = ctn.ingredients.filter(i => i.id !== container.currentIngredientID);
			      }

			      const data = {
		          ...ctn,
		          isExpanded: container.isExpanded,
		          isCardEnabled: container.isCardEnabled,
		          currentIngredientID: (ing) ? ing.id : null
		        };

			      cache.writeFragment({
			        id: fragmentId,
			        fragment,
			        data
			      });

			      return data;
    			},
    		},
    		Container: {
			    isExpanded: () => true,
			    isCardEnabled: () => false,
			    currentIngredientID: () => null,
			  },
    	},
    	defaults: {
    	}
    }
  });
}

export default withApollo(createClient);
