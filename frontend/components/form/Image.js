import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ alt, value }) => {
	if (!value) {
		// display a placeholder
		return (
			<svg viewBox="0 0 1600 900" width="100%" preserveAspectRatio="xMidYMid slice">
				<rect
					style={ { fill: '#eee' } }
					width="100%"
					height="100%"
					preserveAspectRatio="xMidYMid slice"
				/>
			</svg>
		);
	}

	return (
		<svg viewBox="0 0 16 9" width="100%" preserveAspectRatio="xMidYMid slice">
			<image
				xlinkHref={ value }
				alt={ alt }
				width="100%"
				height="100%"
				preserveAspectRatio="xMidYMid slice"
			/>
		</svg>
	);
};

Image.defaultProps = {
	alt: 'placeholder image',
	value: null,
};

Image.propTypes = {
	alt: PropTypes.string,
	value: PropTypes.string,
};

export default Image;
