/* eslint-disable react/jsx-props-no-spreading */
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import styled from 'styled-components';
import Card from './Card';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Cell = styled.div`
	border: 2px solid purple;
`;

const Carousel = ({ query }) => {
	// fetch recipes
	const {
		data,
		error,
		loading,
	} = useQuery(query);
	// TODO make this more generic
	const { dashboardRecipes } = data || {};
	const { newRecipes = [] } = dashboardRecipes || {};
	console.log({ newRecipes });
	const settings = {
		dots: true,
		slidesToShow: 2,
	};

	return (
		<Cell>
			{/* loading message */
				(loading)
					? <Loading name="recipes" />
					: null
			}

			{/* error message */
				(error)
					? <ErrorMessage error={ error } />
					: null
			}

			{/* TODO react slick carousel */}
			<Slider { ...settings }>
				{
					newRecipes.map((rp) => (
						<Card
							recipe={ rp }
						/>
					))
				}
			</Slider>
		</Cell>
	);
};

Carousel.propTypes = {
	query: PropTypes.shape({}).isRequired,
	title: PropTypes.string.isRequired,
};

export default Carousel;
