import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

const CardStyles = styled.div`
	margin: 0 10px;

	&:first-of-type {
		margin-left: 0;
	}

	h2 {
		color: #222;
		display: inline-block;
		font-size: 16px;
		font-weight: 300;
		padding: 0 2px;

		&:hover {
			cursor: pointer;
			color: #000;
		}
	}
`;

const AspectRatio16x9 = styled.div`
	width: 100%;
  height: 0;
  padding-bottom: 62.5%;
  position: relative;

	&:hover {
		cursor: pointer;
	}
`;

const AspectRatioInner = styled.div`
	position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
	img {
		width: 100%;
  	height: 100%;
		object-fit: cover;
	}
`;

const Card = ({ className, recipe }) => {
	const { id, image, title } = recipe;
	const href = {
		pathname: '/recipes',
		query: { id },
	};

	return (
		<CardStyles className={ className }>
			<Link href={ href }>
				<AspectRatio16x9>
					<AspectRatioInner>
						<img src={ image } alt={ title } />
					</AspectRatioInner>
				</AspectRatio16x9>
			</Link>
			<Link href={ href }>
				<h2>{ title }</h2>
			</Link>
		</CardStyles>
	);
};

Card.defaultProps = { className: '' };

Card.propTypes = {
	className: PropTypes.string,
	recipe: PropTypes.shape({
		id: PropTypes.string.isRequired,
		image: PropTypes.string,
		title: PropTypes.string.isRequired,
	}).isRequired,
};

export default Card;
