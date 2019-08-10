import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import styled from 'styled-components';

import ErrorMessage from '../ErrorMessage';

const GET_VIEW_CONTAINERS_QUERY = gql`
	query GET_VIEW_CONTAINERS_QUERY($group: String, $view: String) {
		containers(group: $group, view: $view) @client {
			count
			id
			ingredientID
			isExpanded
			label
		}
	}
`;

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
	render() {
		console.warn('[Containers] render');
		const { group, view } = this.props;

		return (// TODO do i need to adjust the fetchPolicy here?
			// eslint-disable-next-line object-curly-newline
			<Query query={ GET_VIEW_CONTAINERS_QUERY } variables={ { group, view } }>
				{({ loading, error, data }) => {
					if (loading) return null;
					const { containers } = data;
					// eslint-disable-next-line object-curly-newline
					console.log({ containers });

					return (
						<ContainerStyles>
							{/* Error Messages */}
							{ (error) ? <ErrorMessage error={ error } /> : null }

							{
								containers.map(c => <div key={ c.id }>{ c.label }</div>)
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
