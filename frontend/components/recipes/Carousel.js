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
	margin: 0 auto;
  padding: 40px;
  width: 80%;
  color: #333;
  background: #419be0;
`;


const Border = styled.div`
	background: pink;
	border: 2px solid coral;
	width: 200px;
	height: 150px;
	display: block;
	margin: 10px;
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
						<div key={ rp.id }>
							{ rp.title }
						</div>
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
