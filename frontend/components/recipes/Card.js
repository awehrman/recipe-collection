import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const CardStyles = styled.article`
	box-sizing: border-box;
	width: 23%;
	height: 250px;

	h2 {
		margin: 10px 0;
		font-weight: 400;
		font-size: 12px;
	}
`;

const AspectRatio16x9 = styled.div`
	width: 100%;
  height: 0;
  padding-bottom: 62.5%; /* 9/16 */
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
		const { recipe } = this.props;
		const { image, title } = recipe;
		console.warn({ recipe });

		return (
			<CardStyles>
				<AspectRatio16x9>
					<AspectRatioInner>
						<img src={ image } alt={ title } />
					</AspectRatioInner>
				</AspectRatio16x9>
				<h2>{ title }</h2>
			</CardStyles>
		);
	}
}

Card.defaultProps = {};

Card.propTypes = {
	recipe: {
		id: PropTypes.string.isRequired,
		image: PropTypes.string,
		title: PropTypes.string.isRequired,
	}.isRequired,
};

export default Card;
