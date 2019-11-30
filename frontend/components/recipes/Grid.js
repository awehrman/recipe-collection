// eslint-disable-next-line max-classes-per-file
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';
import React from 'react';
import { withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FixedSizeList as List } from 'react-window';
import memoize from 'memoize-one';

import Card from './Card';
import Loading from '../Loading';
import { GET_PAGINATED_RECIPES_QUERY } from '../../lib/apollo/queries';

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

// TODO move this into its own file
/* eslint-disable react/prop-types */

class Row extends React.PureComponent {
	render() {
		const { data, index, style } = this.props;
		const { count, itemsPerRow, onRecipeClick, recipes } = data;
		const items = [];
		const fromIndex = index * itemsPerRow;
		const toIndex = Math.min(fromIndex + itemsPerRow, count);
		for (let i = fromIndex; i < toIndex; i += 1) {
			if (recipes[i]) {
				items.push(<Card key={ `card_${ recipes[i].id }` } recipe={ recipes[i] } onClick={ onRecipeClick } />);
			} else {
				items.push(<Loading className="card" key={ i } />);
			}
		}
		// console.log({ row: index, items: items.length, numLoading });
		return (
			<RowStyles style={ style }>
				{ items }
			</RowStyles>
		);
	}
}
/* eslint-enable react/prop-types */
const itemStatusMap = {};
class Grid extends React.Component {
	constructor(props) {
		super(props);

		this.state = { cursor: 0 };
	}

	getItemData = memoize((count, itemsPerRow, onRecipeClick, recipes) => ({
		count,
		itemsPerRow,
		onRecipeClick,
		recipes,
	}));

	isItemLoaded = (index) => {
		// const { itemStatusMap } = this.state;
		const isLoaded = itemStatusMap[index] === 'LOADED';
		// if (isLoaded) console.log(`is Item "${ index }" Loaded? ${ (itemStatusMap[index]) }`);

		return isLoaded;
	};

	loadMoreItems = (startIndex, stopIndex) => {
		const { client, count, fetchMore, recipes } = this.props;
		const { cursor } = this.state;
		const { cache } = client;
		const response = {
			recipes: {
				__typename: 'RecipesResponse',
				count,
				errors: [],
				recipes,
			},
		};

		return new Promise((resolve) => {
			// fetch more data if we're past the first index (which our initial query will handle)
			if (startIndex > 0) {
				console.warn(`fetchMore ${ cursor + 1 }`);
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
						console.warn({
							updateQuery: '*** updateQuery',
							response,
						});

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

			console.log({
				loadMoreItems: '*** loadMoreItems',
				response,
			});
			return resolve(response);
		});
	};

	render() {
		// console.log('grid render');
		const { count, onRecipeClick, recipes } = this.props;
		const itemsPerRow = 4;
		// instead of recipes.length here, lets try the entire query count
		const rowCount = Math.ceil(count / itemsPerRow);
		const itemData = this.getItemData(count, itemsPerRow, onRecipeClick, recipes);
		return (
			<GridStyles>
				<AutoSizer>
					{({ height, width }) => (
						<InfiniteLoader
							isItemLoaded={ this.isItemLoaded }
							itemCount={ count }
							loadMoreItems={ this.loadMoreItems }
						>
							{({ onItemsRendered, ref }) => (
								<List
									ref={ ref }
									height={ height }
									itemCount={ rowCount }
									itemData={ itemData }
									itemSize={ 280 }
									onItemsRendered={ onItemsRendered }
									width={ width }
								>
									{ Row }
								</List>
							)}
						</InfiniteLoader>
					)}
				</AutoSizer>
			</GridStyles>
		);
	}
}

Grid.defaultProps = {
	fetchMore: () => {},
	recipes: [],
};

Grid.propTypes = {
	client: PropTypes.shape({ cache: PropTypes.shape({ writeQuery: PropTypes.func.isRequired }) }).isRequired,
	count: PropTypes.number.isRequired,
	fetchMore: PropTypes.func,
	recipes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	})),
	onRecipeClick: PropTypes.func.isRequired,
};

export default withApollo(Grid);
