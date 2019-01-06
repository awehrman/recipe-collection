import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { endpoint } from '../config';

import { LOCAL_INGREDIENTS_QUERY } from '../pages/ingredients';

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

  type IngredientConfig {
  	currentView: String,
		currentGroup: String
  }

  type Mutation {
  	updateIngredientConfig(view: String, group: String, isCreateEnabled: Boolean): IngredientConfig
    updateContainer(container: Container, ingredientID: ID): Container
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
    			updateIngredientConfig(_, { view, group, isCreateEnabled }, { cache }) {
    				let { currentView, currentGroup } = cache.readQuery({
    					query: LOCAL_INGREDIENTS_QUERY
    				});
    				
    				const data = {
    					data: {
    						currentView: (view) ? view : currentView,
    						currentGroup: (group) ? group : currentGroup,
    						isCreateEnabled: isCreateEnabled || false
    					}
    				};

    				cache.writeData(data);
    				return data;
    			},
    			updateContainer(_, variables, { cache, getCacheKey }) {
    				const { container, ingredientID } = variables;
    				let ing;
			      const fragmentId = getCacheKey({ id: container.id, __typename: "Container" });
			      const fragment = gql`
			        fragment isExpanded on Container {
			        	id
			          isExpanded
			          currentIngredientID
			          ingredients {
			          	id
			          	name
			          }
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

			      cache.writeData({
			        id: fragmentId,
			        data: {
			          ...ctn,
			          isExpanded: container.isExpanded,
			          isCardEnabled: container.isCardEnabled,
			          currentIngredientID: (ing) ? ing.id : null
			        }
			      });

			      return null;
    			}
    		},
    		Container: {
			    isExpanded: () => true,
			    isCardEnabled: () => false,
			    currentIngredientID: () => null,
			  }
    	},
    	// TODO move these into a Config object similar to Container
    	defaults: {
  			currentView: 'all', // TODO i don't have access to this.props.query here do i?
  			currentGroup: 'name',
  			isCreateEnabled: false
    	}
    }
  });
}

export default withApollo(createClient);
