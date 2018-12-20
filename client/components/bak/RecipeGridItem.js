import React, { Component } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { darken } from 'polished';

import faPen from '@fortawesome/fontawesome-pro-regular/faPen';

const RecipeStyles = styled.div`
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

class RecipeGridItem extends Component {
	static propTypes = {
		recipe: PropTypes.object.isRequired,
	};

	render() {
		const { recipe } = this.props;

		return (
			<RecipeStyles>
				<Link href={ { pathname: '/recipes', query: { id: recipe.id } } }>
					<a>{ recipe.title }</a>
				</Link>
				<Link href={ { pathname: '/recipes', query: { id: recipe.id, edit: true } } }>
					<a className="edit"><FontAwesomeIcon icon={ faPen } /></a>
				</Link>
			</RecipeStyles>
		);

	}
};

export default RecipeGridItem;