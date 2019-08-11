import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Container from './Container';
import ErrorMessage from '../ErrorMessage';
import { GET_CONTAINERS_QUERY } from '../../lib/apollo/queries';

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
`;

class Containers extends React.PureComponent {
	// TODO i might need to toggle a separate mutation to set ingredientID within the appropriate containers
	render() {
		console.warn('[Containers] render');
		const { group, view } = this.props;

		return (// TODO do i need to adjust the fetchPolicy here?
			// eslint-disable-next-line object-curly-newline
			<Query query={ GET_CONTAINERS_QUERY } variables={ { group, view } }>
				{({ loading, error, data }) => {
					if (loading) return null;
					const { containers } = data;

					return (
						<ContainerStyles>
							{ (error) ? <ErrorMessage error={ error } /> : null }
							{
								containers.filter(ctn => ctn.ingredients && (ctn.ingredients.length > 0))
									.map(c => (
										<Container
											group={ group }
											id={ c.id }
											ingredientID={ c.ingredientID }
											ingredients={ c.ingredients }
											isExpanded={ c.isExpanded }
											key={ c.id }
											label={ c.label }
											view={ view }
										/>
									))
							}
						</ContainerStyles>
					);
				}}
			</Query>
		);
	}
}

Containers.defaultProps = {
	group: 'name',
	ingredientID: null,
	view: 'all',
};

Containers.propTypes = {
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	ingredientID: PropTypes.string,
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default withApollo(Containers);
