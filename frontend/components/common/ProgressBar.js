import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ProgressBar = ({ width, percent }) => {
	const [ value, setValue ] = useState(0);

	useEffect(() => {
		setValue((percent * width) / 100);
	});

	return (
		<Progress>
			<div className="progress-div" style={ { width } }>
				<div style={ { width: `${ value }px` } } className="progress" />
			</div>
		</Progress>
	);
};
ProgressBar.defaultProps = {
	width: 400,
	percent: 95,
};

ProgressBar.propTypes = {
	width: PropTypes.number,
	percent: PropTypes.number,
};

export default ProgressBar;

const Progress = styled.div`
	.progress-div {
		background-color: rgb(233, 233, 233);
		border-radius: 0.4rem;
	}

	.progress {
		background: #ddd;
		height: 10px;
		transition: 5s ease;
		transition-delay: 0.5s;
		border-radius: 0.4rem;
		margin: 0;
	}

	h1 {
		font-size: 10px;
	}

	.percent-number {
		color: rgb(121, 121, 121);
	}
`;
