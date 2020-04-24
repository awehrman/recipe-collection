import { useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import pure from 'recompose/pure';

import { GET_INGREDIENTS_COUNT_QUERY } from '../../lib/apollo/queries/ingredients';
import { getNextIngredientGroup } from '../../lib/util';
import ViewContext from '../../lib/contexts/ingredients/viewContext';

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
				color: ${ (props) => props.theme.highlight };
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
				color: ${ (props) => props.theme.lighterGrey };
				font-size: 1em;
				padding: 0;
				cursor: pointer;
				background: white;
			}
		}
`;

const Filters = () => {
	const ctx = useContext(ViewContext);
	const group = ctx.get('group');
	const view = ctx.get('view');

	// fetch the ingredient totals
	const { data } = useQuery(GET_INGREDIENTS_COUNT_QUERY);
	const { ingredientAggregate } = data || {};
	const { count = 0, unverified = 0 } = ingredientAggregate || {};

	return (
		<FilterStyles>
			{/* View Selection */}
			<div className="left">
				{/* eslint-disable-next-line object-curly-newline */}
				<Link href={ { pathname: '/ingredients', query: { view: 'all', group } } }>
					<a
						className={ (view === 'all') ? 'active' : '' }
						onKeyPress={ (e) => e.preventDefault() }
						role="button"
						tabIndex="0"
					>
						{ `View${ '\xa0' }All${ '\xa0' }${ count }` }
					</a>
				</Link>

				{/* eslint-disable-next-line object-curly-newline */}
				<Link href={ { pathname: '/ingredients', query: { view: 'new', group } } }>
					<a
						className={ (view === 'new') ? 'active' : '' }
						onKeyPress={ (e) => e.preventDefault() }
						role="button"
						tabIndex="0"
					>
						{ `Newly${ '\xa0' }Imported${ '\xa0' }${ unverified }` }
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
							onKeyPress={ (e) => e.preventDefault() }
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
};

export default pure(Filters);
