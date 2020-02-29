import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CardStyles = styled.div`
	margin: 0 10px;

	&:first-of-type {
		margin-left: 0;
	}

	a:hover h2 {
		color: #000;
	}

	h2 {
		color: #222;
		display: inline-block;
		font-size: 16px;
		font-weight: 300;
		padding: 0 2px;
	}
`;

const AspectRatio16x9 = styled.div`
	width: 100%;
  height: 0;
  padding-bottom: 62.5%;
  position: relative;
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

class Card extends React.PureComponent {
	render() {
		const { className, onClick, recipe } = this.props;
		const { id, image, title } = recipe;
		const href = {
			pathname: '/recipes',
			query: { id },
		};

		return (
			<CardStyles className={ className }>
				<a href={ href } onClick={ (e) => onClick(e, id) } alt={ title }>
					<AspectRatio16x9>
						<AspectRatioInner>
							<img src={ image } alt={ title } />
						</AspectRatioInner>
					</AspectRatio16x9>
					<h2>{ title }</h2>
				</a>
			</CardStyles>
		);
	}
}

Card.defaultProps = { className: '' };

Card.propTypes = {
	className: PropTypes.string,
	onClick: PropTypes.func.isRequired,
	recipe: PropTypes.shape({
		id: PropTypes.string.isRequired,
		image: PropTypes.string,
		title: PropTypes.string.isRequired,
	}).isRequired,
};

export default Card;
