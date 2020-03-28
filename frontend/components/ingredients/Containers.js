import { useMutation, useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import styled from 'styled-components';

import Container from './Container';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import { GET_ALL_CONTAINERS_QUERY } from '../../lib/apollo/queries/containers';
import IngredientsContext from '../../lib/contexts/ingredientsContext';
import { CREATE_CONTAINERS_MUTATION } from '../../lib/apollo/mutations/containers';

const ContainerStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: 20px 0;

	&.hidden {
		border-bottom: 0;
	}

	ul.hidden {
		display: none;
	}

	span.message {
		font-size: 14px;
		font-style: italic;
		color: '#222';
	}
`;

const Containers = () => {
	const { currentIngredientID, group, view } = useContext(IngredientsContext);

	// setup create/refresh containers mutation
	const [ createContainers ] = useMutation(CREATE_CONTAINERS_MUTATION);

	const message = (view === 'new')
		? 'No new ingredients to review.'
		: 'No ingredients have been added yet.';

	// query containers
	const {
		data,
		error,
		loading,
	} = useQuery(GET_ALL_CONTAINERS_QUERY, {
		fetchPolicy: 'cache-and-network',
		onCompleted: async (d) => {
			const { containers } = d;
			// console.warn('> [Containers] (GET_ALL_CONTAINERS_QUERY) onCompleted', containers);
			if (containers && (containers.length === 0)) {
				// if we didn't find any containers in the cache, then we'll have to create them
				await createContainers({
					variables: {
						currentIngredientID,
						group,
						view,
					},
				});
			}
		},
		variables: {
			group,
			view,
		},
	});

	const { containers = [] } = data || {};
	// console.log('> [Containers]', (loading) ? 'loading...' : containers);

	return (
		<ContainerStyles>
			{/* error message */
				(error)
					? <ErrorMessage error={ error } />
					: null
			}

			{/* loading message */
				(loading && !containers.length)
					? <Loading />
					: null
			}

			{/* no containers message */
				(!loading && !containers.length)
					? <span className="message">{ message }</span>
					: null
			}

			{/* display grouped containers of ingredients */
				(!loading)
					? (
						containers && containers.map((c) => (
							<Container
								id={ c.id }
								key={ c.id }
							/>
						))
					)
					: null
			}
		</ContainerStyles>
	);
};

export default Containers;
