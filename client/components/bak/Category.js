import React, { Component } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { darken } from 'polished';

import faPen from '@fortawesome/fontawesome-pro-regular/faPen';

const CategoryStyles = styled.div`
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

class Category extends Component {
	static propTypes = {
		category: PropTypes.object.isRequired,
	};

	render() {
		const { category } = this.props;

		return (
			<CategoryStyles>
				<Link href={ { pathname: '/category', query: { id: category.id } } }>
					<a>{ category.name }</a>
				</Link>
				<Link href={ { pathname: '/category/edit', query: { id: category.id } } }>
					<a className="edit"><FontAwesomeIcon icon={ faPen } /></a>
				</Link>
			</CategoryStyles>
		);

	}
};

export default Category;