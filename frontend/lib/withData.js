import ApolloClient, { InMemoryCache, defaultDataIdFromObject } from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';

import { endpoint } from '../config';
import { GET_ALL_CONTAINERS_QUERY } from '../components/ingredients/Containers';

// idk do i need a fucking container lookup where i pass an id or something?
// or is that the whole point of ReadQuery?
export const typeDefs = gql`
  type Query {
    containers: [ Container ]
  }

  type Container {
  	group: String
		view: String  	
  }

  type Mutation {
   	updateContainers(
	  	group: String
	  	view: String
    ) : Container
  }
`;

function createClient({ headers }) {
	const cache = new InMemoryCache({
		// TODO add __typename into your eslint file girl
		dataIdFromObject: (object) => {
			// eslint-disable-next-line no-underscore-dangle
			switch (object.__typename) {
			case 'Containers':
				console.warn('[cache] dataIdFromObject - Containers');
				console.log(object);
				console.log(`${ object.data.view }_${ object.data.group }`);
				// this is another one where i'd rather not use an id so could i slap
				// some combination of a `${ view }_${ group }` combo?
				// to be real i don't think i understand how this totalllly works in regards to read/write query
				// sure seems like something that i need to pass as a variable?
				// or does this just generate a custom id field?
				return `${ object.data.view }_${ object.data.group }`;
			default:
				return defaultDataIdFromObject(object); // fall back to default handling
			}
		},
	});

	// I DON'T FUCKING KNOW?? IS THIS A THING PEOPLE DO!?

	cache.writeData({
		data: {
			containers: [ {
				__typename: 'Container',
				// idk is this id ACTUALLY needed?
				// or does dataIdFromObject provide whatever lookup magic?
				// OBVIOUSLY I NEED TO READ MORE ABOUT THIS
				id: 'all_name', // and for whatever reason this doesn't fucking work
				group: 'name',	// in conjunction to dataIdFromObject
				view: 'all',		// it still yells at me cause these fucking variables DON'T WORK
			} ],
		},
		variables: {
			group: 'name',
			view: 'all',
		},
	});

	return new ApolloClient({
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: operation => operation.setContext({
			fetchOptions: { credentials: 'include' },
			headers,
		}),
		cache,
		clientState: {
			/*
			defaults: {
				// so this resolves to
				// containers: {"type":"json","json":[]}
				// which feels super wrong
				// containers: [],

				// now, if we try to set this up with an initial container...
				// okay this actually looks more normal than i last remember,
				// but it looks to be exactly the same as doing the initial
				// cache.writeData, and i mean it fucking should be right?
				// EXCEPT... what i still don't get is that in both instances
				// applying the variables do fucking nothing
				// and idk even know how you're supposed to pass those in defaults
				containers: [
					{
						__typename: 'Container',
						id: 'all_name',
						group: 'name',
						view: 'all',
					},
				],
			},
			*/
			resolvers: {
				Mutation: {
					// eslint-disable-next-line
					updateContainers(_, variables, { client, cache, getCacheKey }) {
						console.warn('[withData] updateContainers');
						// eslint-disable-next-line
						console.log({ _, variables });

						// eslint-disable-next-line
						const { currentIngredientID, group, view } = variables;

						const container = {
							__typename: 'Container',
							id: `${ view }_${ group }`,
							group,
							view,
						};

						let containers;

						const query = GET_ALL_CONTAINERS_QUERY;

						// Read the todo's from the cache
						try {
							// eslint-disable-next-line
							console.log({ query, variables });
							containers.containers = cache.readQuery({
								query,
								variables,
							});
							console.log(containers);
						} catch (err) {
							// because right now we sure can't fucking ready our cache with this dataIdFromObject
							console.error('no containers!');
							console.log(err);
							containers = [ container ];
						}

						const data = { containers };

						// Update the cached todos
						// NUMBER ONE??
						const res = cache.writeQuery({
							query,
							data,
							variables,
						});

						console.log(res);
						// OR NUMBER TWO??
						/*
						cache.writeData({
							fragmentId,
							data,
						});
						*/

						return data;
					},
				},
			},
			typeDefs,
		},
	});
}

export default withApollo(createClient);
