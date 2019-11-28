// eslint-disable-next-line max-classes-per-file
import AutoSizer from 'react-virtualized-auto-sizer';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FixedSizeList as List } from 'react-window';
import memoize from 'memoize-one';

import Card from './Card';

const GridStyles = styled.article`
  margin: 0;
  padding: 0;
	height: 600px;
`;

const RowStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 20px;
`;

/* eslint-disable react/prop-types */
class Row extends React.PureComponent {
	render() {
		// data: recipe data, index: 0
		const { data, index } = this.props;
		const { itemsPerRow, recipes } = data;

		const items = [];
		const fromIndex = index * itemsPerRow;
		const toIndex = Math.min(fromIndex + itemsPerRow, recipes.length);

		for (let i = fromIndex; i < toIndex; i += 1) {
			items.push(<Card key={ i } recipe={ recipes[i] } />);
		}

		return (
			<RowStyles>
				{ items }
			</RowStyles>
		);
	}
}
/* eslint-enable react/prop-types */

class Grid extends React.PureComponent {
	getItemData = memoize((itemsPerRow, recipes) => ({
		itemsPerRow,
		recipes,
	}))

	render() {
		const { recipes } = this.props;

		return (
			<GridStyles>
				<AutoSizer>
					{({ height, width }) => {
						const itemsPerRow = 4;
						const rowCount = Math.ceil(recipes.length / itemsPerRow);
						const itemData = this.getItemData(itemsPerRow, recipes);

						return (
							<List
								height={ height }
								itemCount={ rowCount }
								itemData={ itemData }
								itemSize={ 290 /* TODO adjust this per window size */}
								width={ width }
							>
								{ Row }
							</List>
						);
					}}
				</AutoSizer>
			</GridStyles>
		);
	}
}

Grid.defaultProps = { recipes: [] };

Grid.propTypes = {
	recipes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	})),
};

export default Grid;
