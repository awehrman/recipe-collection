import React, { Component } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { darken } from 'polished';

import faPen from '@fortawesome/fontawesome-pro-regular/faPen';

const TagStyles = styled.div`
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

class Tag extends Component {
	static propTypes = {
		tag: PropTypes.object.isRequired,
	};

	render() {
		const { tag } = this.props;

		return (
			<TagStyles>
				<Link href={ { pathname: '/tag', query: { id: tag.id } } }>
					<a>{ tag.name }</a>
				</Link>
				<Link href={ { pathname: '/tag/edit', query: { id: tag.id } } }>
					<a className="edit"><FontAwesomeIcon icon={ faPen } /></a>
				</Link>
			</TagStyles>
		);

	}
};

export default Tag;