/* eslint-disable react/jsx-props-no-spreading */
import { useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import styled from 'styled-components';
import Card from './Card';
import ErrorMessage from '../common/ErrorMessage';
import Loading from '../common/Loading';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Cell = styled.div`
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
	const settings = {
		dots: true,
		slidesToShow: 4,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 3,
					infinite: true,
					dots: true,
				},
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2,
					initialSlide: 2,
				},
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				},
			},
		],
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

			{/* TODO there's some warnings being thrown here
				https://github.com/akiran/react-slick/issues/1720
			*/}
			<Slider { ...settings }>
				{
					newRecipes.map((rp) => (
						<Card
							key={ `newRP_${ rp.id }` }
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
