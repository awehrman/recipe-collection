import React, { Component } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { darken } from 'polished';

import faPen from '@fortawesome/fontawesome-pro-regular/faPen';

const IngredientStyles = styled.div`
	a {
		text-decoration: none;
		color: ${ props => props.theme.highlight };
	}

	a:hover {
		color: ${ props => darken(0.1, props.theme.highlight) };
	}

	a.edit {
		margin-left: 5px;

		svg {
			height: 12px;
		}
	}
`;

class Ingredient extends Component {
	static propTypes = {
		ingredient: PropTypes.object.isRequired,
	};

	render() {
		const { ingredient } = this.props;

		return (
			<IngredientStyles>
				<Link href={ { pathname: '/ingredients', query: { id: ingredient.id } } }>
					<a>{ ingredient.name }</a>
				</Link>
				<Link href={ { pathname: '/ingredients', query: { id: ingredient.id, edit: true } } }>
					<a className="edit"><FontAwesomeIcon icon={ faPen } /></a>
				</Link>
			</IngredientStyles>
		);

	}
};

export default Ingredient;