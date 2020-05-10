// eslint-disable-next-line max-classes-per-file
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import React from 'react';
// import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';
import memoize from 'memoize-one';

import Card from './Card';
import Loading from '../common/Loading';
// import { GET_PAGINATED_RECIPES_QUERY } from '../../lib/apollo/queries/recipes';

const GridStyles = styled.article`
  margin: 0;
  padding: 0;
	height: 720px;
`;

const RowStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 0 4px;
`;

const Cell = styled.div`
	flex-basis: 100%;

	@media (min-width: ${ (props) => props.theme.tablet_small }) {
		flex-basis: 50%;
	}

	@media (min-width: ${ (props) => props.theme.tablet }) {
		flex-basis: 33%;
	}

	@media (min-width: ${ (props) => props.theme.desktop_small }) {
		flex-basis: 25%;
	}
`;

/* eslint-disable react/prop-types */
const RecipeCell = ({ recipe }) => (
	<Cell key={ `cell_${ recipe.id }` }>
		<Card recipe={ recipe } />
	</Cell>
);

const Row = ({ data, index, style }) => {
	const { count, itemsPerRow, recipes } = data;
	const items = [];
	const fromIndex = index * itemsPerRow;
	const toIndex = Math.min(fromIndex + itemsPerRow, count);

	for (let i = fromIndex; i < toIndex; i += 1) {
		if (recipes[i]) {
			items.push(<RecipeCell key={ `cell_${ recipes[i].id }` } recipe={ recipes[i] } />);
		} else {
			items.push(<Loading key={ `loading${ i }` } className="card" />);
		}
	}

	return (
		<RowStyles key={ `grid_${ index }` } style={ style }>
			{ items }
		</RowStyles>
	);
};

/* eslint-enable react/prop-types */
const itemStatusMap = {};
const getItemData = memoize((count, itemsPerRow, recipes) => ({
	count,
	itemsPerRow,
	recipes,
}));

const Grid = ({ count, recipes }) => {
	// [ cursor, setCursor ] = useState(0);

	const isItemLoaded = (index) => {
		const isLoaded = itemStatusMap[index] === 'LOADED';
		return isLoaded;
	};

	/*
	const loadMoreItems = (startIndex, stopIndex) => {
		// TODO lol all this needs to be redone... what a mess
		return new Promise((resolve) => {
			// fetch more data if we're past the first index (which our initial query will handle)
			if (startIndex > 0) {
				fetchMore({
					updateQuery: async (prev, { fetchMoreResult }) => {
						if (!fetchMoreResult) return prev;
						// merge data sets
						response.recipes.recipes = [
							...prev.recipes.recipes,
							...fetchMoreResult.recipes.recipes,
						];

						// update status map
						for (let index = 0; index <= response.recipes.length; index += 1) {
							itemStatusMap[index] = (response.recipes[index]) ? 'LOADED' : 'LOADING';
						}

						// i don't really get why just returning this data isn't enough to satisfy fetchMore,
						// so i end up writing to the cache directly to make sure this gets updated
						await cache.writeQuery({
							data: response,
							query: GET_PAGINATED_RECIPES_QUERY,
							variables: { cursor: 0 },
						});
						this.setState({ cursor: (cursor + 1) });
						return resolve(response);
					},
					variables: { cursor: (cursor + 1) },
				});
			}

			// update status map
			for (let index = 0; index <= stopIndex; index += 1) {
				itemStatusMap[index] = (recipes[index]) ? 'LOADED' : 'LOADING';
			}

			return resolve(response);
		});
	};
	*/

	const itemsPerRow = 4;
	// instead of recipes.length here, lets try the entire query count
	const rowCount = Math.ceil(count / itemsPerRow);
	const itemData = getItemData(count, itemsPerRow, recipes);
	return (
		<GridStyles>
			<AutoSizer>
				{({ height, width }) => (
					<InfiniteLoader
						isItemLoaded={ isItemLoaded }
						itemCount={ count }
						loadMoreItems={ /* TODO */ () => {} }
					>
						{({ onItemsRendered, ref }) => (
							<FixedSizeList
								ref={ ref }
								height={ height }
								itemCount={ rowCount }
								itemData={ itemData }
								itemSize={ 280 }
								onItemsRendered={ onItemsRendered }
								width={ width }
							>
								{ Row }
							</FixedSizeList>
						)}
					</InfiniteLoader>
				)}
			</AutoSizer>
		</GridStyles>
	);
};

Grid.defaultProps = { recipes: [] };

Grid.propTypes = {
	count: PropTypes.number.isRequired,
	// fetchMore: PropTypes.func.isRequired,
	recipes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	})),
};

export default Grid;
