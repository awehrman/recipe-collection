import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Container from './Container';
import { GET_ALL_CONTAINERS_QUERY } from '../../lib/apollo/queries';

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

const Containers = ({ group, view }) => {
	console.log('Containers');
	const message = (view === 'new')
		? 'No new ingredients to review.'
		: 'No ingredients have been added yet.';

	return (
		<Query
			query={ GET_ALL_CONTAINERS_QUERY }
			variables={ {
				group,
				view,
			} }
		>
			{
				({ loading, data = {} }) => {
					if (loading) return null;
					const { containers = [] } = data;
					console.log({ containers });

					return (
						<ContainerStyles>
							{/* no containers message */
								(!containers.length)
									? <span className="message">{ message }</span>
									: null
							}

							{/* display grouped containers of ingredients */
								containers && containers
									.filter((ctn) => ctn.ingredients && (ctn.ingredients.length > 0))
									.map((c) => (
										<Container
											group={ group }
											id={ c.id }
											key={ c.id }
											view={ view }
										/>
									))
							}
						</ContainerStyles>
					);
				}
			}
		</Query>
	);
};

Containers.defaultProps = {
	group: 'name',
	view: 'all',
};

Containers.propTypes = {
	client: PropTypes.shape({
		mutate: PropTypes.func,
		query: PropTypes.func,
		readQuery: PropTypes.func,
	}).isRequired,
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default withApollo(Containers);
