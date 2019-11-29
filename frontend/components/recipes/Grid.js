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
	height: 700px;
`;

const RowStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 20px;
`;

// TODO move this into its own file
/* eslint-disable react/prop-types */
class Row extends React.PureComponent {
	render() {
		const { data, index, style } = this.props;
		const { count, itemsPerRow, recipes } = data;
		const items = [];
		const fromIndex = index * itemsPerRow;
		const toIndex = Math.min(fromIndex + itemsPerRow, count);
		for (let i = fromIndex; i < toIndex; i += 1) {
			if (recipes[i]) {
				items.push(<Card key={ i } recipe={ recipes[i] }/>);
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

	getItemData = memoize((count, itemsPerRow, recipes) => ({
		count,
		itemsPerRow,
		recipes,
	}));

	isItemLoaded = (index) => {
		// const { itemStatusMap } = this.state;
		const isLoaded = itemStatusMap[index] === 'LOADED';
		// if (isLoaded) console.log(`is Item "${ index }" Loaded? ${ (itemStatusMap[index]) }`);

		return isLoaded;
	};

	loadMoreItems = (startIndex, stopIndex) => {
		const { client, fetchMore, recipes } = this.props;
		const { cursor } = this.state;
		const { cache } = client;

		return new Promise((resolve) => {
			if (startIndex > 0) {
				console.log(`fetchMore ${ cursor + 1 }`);
				fetchMore({
					updateQuery: async (prev, { fetchMoreResult }) => {
						if (!fetchMoreResult) return prev;
						const data = {
							recipes: {
								__typename: 'RecipesResponse',
								count: prev.recipes.count || fetchMoreResult.recipes.count,
								errors: [],
								recipes: [
									...prev.recipes.recipes,
									...fetchMoreResult.recipes.recipes,
								],
							},
						};

						for (let index = 0; index <= data.recipes.length; index += 1) {
							itemStatusMap[index] = (data.recipes[index]) ? 'LOADED' : 'LOADING';
						}
						console.warn({
							updateQuery: 'updateQuery',
							cursor: (cursor + 1),
							data,
						});
						await cache.writeQuery({
							query: GET_PAGINATED_RECIPES_QUERY,
							data,
							variables: { cursor: 0 },
						});

						this.setState({ cursor: (cursor + 1) });
						// i don't really get why just returning this data isn't enough to satisfy fetchMore,
						// so i end up writing to the cache directly to make sure this gets updated
						return resolve(data);
					},
					variables: { cursor: (cursor + 1) },
				});
			}

			for (let index = 0; index <= stopIndex; index += 1) {
				itemStatusMap[index] = (recipes[index]) ? 'LOADED' : 'LOADING';
			}

			// eslint-disable-next-line
			console.log({ startIndex, stopIndex, recipes, itemStatusMap });
			resolve(recipes);
		});
	};

	render() {
		console.log('grid render');
		const { count, recipes } = this.props;
		const itemsPerRow = 4;
		// instead of recipes.length here, lets try the entire query count
		const rowCount = Math.ceil(count / itemsPerRow);
		const itemData = this.getItemData(count, itemsPerRow, recipes);
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
									itemSize={ 290 /* TODO adjust this per window size */ }
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

Grid.defaultProps = { recipes: [] };

Grid.propTypes = {
	client: PropTypes.shape({ cache: PropTypes.shape({ writeQuery: PropTypes.func.isRequired }) }).isRequired,
	count: PropTypes.number.isRequired,
	fetchMore: PropTypes.func.isRequired,
	recipes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	})),
};

export default withApollo(Grid);
