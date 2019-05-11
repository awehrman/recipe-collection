import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

// import ErrorMessage from '../ErrorMessage';

// ($group: String!, $view: String!)
// group: $group, view: $view) @client @connection(key: "containers", filter: [ "view", "group" ])
const GET_ALL_CONTAINERS_QUERY = gql`
	query GET_ALL_CONTAINERS($group: String, $view: String) {
	  containers(group: $group, view: $view) @client {
	    container @client {
				group
				view
	    }
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
	componentDidMount() {
		console.warn('[Containers] componentDidMount');
		// eslint-disable-next-line object-curly-newline
		const { group, view, updateContainers } = this.props;
		// eslint-disable-next-line object-curly-newline
		updateContainers({ variables: { group, view } });
	}

	componentDidUpdate(prevProps) {
		console.warn('[Containers] componentDidUpdate');
		// eslint-disable-next-line object-curly-newline
		const { group, view, updateContainers } = this.props;

		if (prevProps.view !== view) {
			console.log('updating...');
			// eslint-disable-next-line object-curly-newline
			updateContainers({ variables: { group, view } });
		}
	}

	render() {
		console.warn('[Containers] render');
		return <ContainerStyles>Containers</ContainerStyles>;
	}
}

Containers.defaultProps = {
	currentIngredientID: null,
	group: 'name',
	view: 'all',
};

Containers.propTypes = {
	currentIngredientID: PropTypes.string,
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	view: PropTypes.oneOf([ 'all', 'new' ]),
	updateContainers: PropTypes.func.isRequired,
};

export default Containers;
export { GET_ALL_CONTAINERS_QUERY };
