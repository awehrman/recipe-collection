import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { getNextIngredientGroup } from '../../lib/util';

const FilterStyles = styled.div`
	display: flex;
	font-size: .875em;
	color: #222;

	.left {
		flex: 1;

		a {
			text-decoration: none;
			margin-right: 20px;
			color: #222;

			+.new {
				color: ${ props => props.theme.highlight };
			}
		}

		a.active {
			font-weight: 600;
		}
	}

	.right {
			flex: 1;
			text-align: right;
			font-weight: 600;

			a {
				text-decoration: none;
				margin-left: 16px;
				text-transform: capitalize; /* TODO well this sure isn't working */
				color: ${ props => props.theme.lighterGrey };
				font-size: 1em;
				padding: 0;
				cursor: pointer;
				background: white;
			}
		}
`;

class Filters extends React.PureComponent {
	render() {
		// console.warn('[Filters] render');
		const { group, ingredientsCount, newIngredientsCount, view } = this.props;

		return (
			<FilterStyles>
				{/* View Selection */}
				<div className="left">
					{/* eslint-disable-next-line object-curly-newline */}
					<Link href={ { pathname: '/ingredients', query: { view: 'all', group } } }>
						<a
							className={ (view === 'all') ? 'active' : '' }
							onKeyPress={ e => e.preventDefault() }
							role="button"
							tabIndex="0"
						>
							{ `View${ '\xa0' }All${ '\xa0' }${ ingredientsCount }` }
						</a>
					</Link>

					{/* eslint-disable-next-line object-curly-newline */}
					<Link href={ { pathname: '/ingredients', query: { view: 'new', group } } }>
						<a
							className={ (view === 'new') ? 'active' : '' }
							onKeyPress={ e => e.preventDefault() }
							role="button"
							tabIndex="0"
						>
							{ `Newly${ '\xa0' }Imported${ '\xa0' }${ newIngredientsCount }` }
						</a>
					</Link>
				</div>

				{/* Group By Selection */}
				<div className="right">
					<div className="groupBy">
						<span>Group By</span>
						{/* eslint-disable-next-line object-curly-newline */}
						<Link href={ { pathname: '/ingredients', query: { view, group: getNextIngredientGroup(group) } } }>
							<a
								onKeyPress={ e => e.preventDefault() }
								role="button"
								tabIndex="0"
							>
								{ group.charAt(0).toUpperCase() + group.substr(1) }
							</a>
						</Link>
					</div>
				</div>
			</FilterStyles>
		);
	}
}

Filters.defaultProps = {
	ingredientsCount: 0,
	newIngredientsCount: 0,
	group: 'name',
	view: 'all',
};

Filters.propTypes = {
	ingredientsCount: PropTypes.number,
	newIngredientsCount: PropTypes.number,
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default Filters;
