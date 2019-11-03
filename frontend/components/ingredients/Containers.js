import React from 'react';
import { adopt } from 'react-adopt';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Container from './Container';
import ErrorMessage from '../ErrorMessage';
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

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getContainers: ({ group, ingredientID, render, view }) => (
		// eslint-disable-next-line object-curly-newline
		<Query fetchPolicy="network-only" notifyOnNetworkStatusChange query={ GET_ALL_CONTAINERS_QUERY } variables={ { group, ingredientID, view } }>
			{ render }
		</Query>
	),
});

// eslint-disable-next-line
class Containers extends React.Component {
	async componentDidUpdate() {
		const { client, group, ingredientID, view } = this.props;

		await client.query({
			fetchPolicy: 'network-only',
			query: GET_ALL_CONTAINERS_QUERY,
			variables: {
				group,
				ingredientID,
				view,
			},
		});
	}

	render() {
		const { group, ingredientID, view } = this.props;
		const message = (view === 'new') ? 'There are no new ingredients to review.' : 'There are no ingredients yet.';

		return (
			// eslint-disable-next-line object-curly-newline
			<Composed group={ group } ingredientID={ ingredientID } view={ view }>
				{
					({ getContainers }) => {
						const { loading, error, data } = getContainers;
						if (loading) return null;
						if (error) return <ErrorMessage error={ error } />;
						const { containers } = data;

						return (
							<ContainerStyles>
								{
									containers && containers.filter((ctn) => ctn.ingredients && (ctn.ingredients.length > 0))
										.map((c) => (
											<Container
												group={ group }
												id={ c.id }
												key={ c.id }
												view={ view }
											/>
										))
								}
								{/* if we have no containers then display a message */
									(containers.length === 0) ? <span className="message">{ message }</span> : null
								}
							</ContainerStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Containers.defaultProps = {
	group: 'name',
	ingredientID: null,
	view: 'all',
};

Containers.propTypes = {
	client: PropTypes.shape({ query: PropTypes.func }).isRequired,
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	ingredientID: PropTypes.string,
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default withApollo(Containers);
