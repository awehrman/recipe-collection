import { Map as ImmutableMap } from 'immutable';
import React, { memo, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';

import Button from '../common/Button';
import Form from './Form';
import ViewContext from '../../lib/contexts/ingredients/viewContext';
import CardContext from '../../lib/contexts/ingredients/cardContext';

const Card = ({ className, id }) => {
	const viewContext = useContext(ViewContext);
	const view = viewContext.get('view');
	const [ isEditMode, setEditMode ] = useState(view === 'new');
	// console.log('[Card]', isEditMode);
	const disableEditMode = useCallback(() => setEditMode(false), [ setEditMode ]);
	const enableEditMode = useCallback(() => setEditMode(true), [ setEditMode ]);

	const cardContext = new ImmutableMap({
		isEditMode,
		enableEditMode,
		disableEditMode,
	});

	return (
		<CardContext.Provider value={ cardContext }>
			<CardStyles className={ className }>
				<Form
					className="card"
					id={ id }
				/>

				{/* Edit Button - TODO update the styling of this button so that it sticks to the bottom of the card and has a restricted height */
					(!isEditMode)
						? (
							<Button
								className="edit"
								icon={ <FontAwesomeIcon icon={ faEdit } /> }
								label="Edit"
								onClick={ enableEditMode }
							/>
						) : null
				}
			</CardStyles>
		</CardContext.Provider>
	);
};

Card.whyDidYouRender = true;

Card.defaultProps = { className: '' };

Card.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string.isRequired,
};

export default memo(Card);


const CardStyles = styled.div`
	min-height: ${ (props) => (props.theme.mobileCardHeight) };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;
	display: flex;
	flex-direction: column;
	position: relative;

	&.hidden {
		display: none;
	}

	button.edit {
		border: 0;
		background: transparent;
		cursor: pointer;
		color: ${ (props) => props.theme.highlight };
		font-weight: 600;
		font-size: 14px;
		align-self: flex-end;

	 	svg {
			margin-right: 8px;
			height: 14px;
		}
	}

	@media (min-width: ${ (props) => (props.theme.desktopCardWidth) }) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		height: ${ (props) => (props.theme.desktopCardHeight) };
		border-left: 1px solid #ddd;
		border-bottom: 0;
	}
`;
