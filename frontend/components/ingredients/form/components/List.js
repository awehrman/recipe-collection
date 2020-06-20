import { List as ImmutableList } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import { faPlus, faTimes } from '@fortawesome/pro-solid-svg-icons';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import styled from 'styled-components';
import Suggestions from '../../../common/Suggestions';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import { GET_SUGGESTED_INGREDIENTS_QUERY } from '../../../../lib/apollo/queries/suggestions';
import Button from '../../../common/Button';
import ListInput from './ListInput';

const List = ({
	className,
	fieldName,
	isPluralSuggestEnabled,
	isRemovable,
	isSuggestionEnabled,
	label,
	list,
	loading,
	onChange,
	onListChange,
	value,
}) => {
	// console.log('LIST', { fieldName, list, value });
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	const [ isInputDisplayed, toggleInputDisplay ] = useState(false);

	useEffect(() => {
		if (value === '') {
			console.log('disabling');
			toggleInputDisplay(false);
		}
	}, [ value ]);

	function onAddButtonClick(e) {
		e.preventDefault();
		toggleInputDisplay(true);
	}

	function showPluralSuggest(listItem) {
		let plural = null;

		try {
			plural = pluralize(listItem.name);
		} catch { /* do nothing if this fails */ }

		if (!plural) return false;

		// only show if the plural value exists and its not already in this list
		const names = list.toJS().map((v) => v.name);
		const	showPlural = (plural) && !names.includes(plural);
		return showPlural;
	}

	function onBlur(e) {
		console.log('onBlur');
		// console.log(e.target);
		// TODO this is still pretty finicky; we need to clear out the value too
		// maybe look into mousedown alternatives
		e.preventDefault();
		toggleInputDisplay(false);
	}

	function onSuggestPlural(e, listItem) {
		e.preventDefault();
		let plural = null;

		try {
			plural = pluralize(listItem);
		} catch { /* do nothing if this fails */ }

		if (!plural) return null;

		return onListChange('add', plural, fieldName);
	}

	function onRemoveItem(e, listItem) {
		e.preventDefault();
		return onListChange('remove', listItem, fieldName);
	}

	function hideInput() {
		toggleInputDisplay(false);
	}

	return (
		<ListStyles>
			{/* List Label */}
			{
				(isEditMode || (list.size > 0))
					// eslint-disable-next-line jsx-a11y/label-has-for
					? <label htmlFor={ fieldName }>{ label }</label>
					: null
			}

			{/* Add to List Button (+) */}
			{
				(isEditMode)
					? (
						<Button
							className="add"
							icon={ <FontAwesomeIcon icon={ faPlus } /> }
							onClick={ onAddButtonClick }
						/>
					)
					: null
			}

			{/* List Items */}
			<ul className="list">
				{
					list.toJS().map((listItem, index) => {
						const {
							__typename,
							id,
							name,
							// type
						} = listItem;
						if (!name) return null;

						// TODO add warning classes
						return (
							// eslint-disable-next-line react/no-array-index-key
							<li key={ `${ __typename }_${ index }_${ id || name }` }>
								{/* list item name */
									(id)
										? (
											<Button
												className="list"
												id={ name }
												label={ name }
												onClick={ (e) => e.preventDefault } // TODO
											/>
										)
										: <span id={ name }>{ name }</span>
								}

								{/* Suggest Plural Button */
									(isEditMode && isPluralSuggestEnabled && showPluralSuggest(listItem))
										? (
											<FontAwesomeIcon
												className={ (!isEditMode) ? 'disabled' : '' }
												icon={ faMagic }
												onClick={ (e) => onSuggestPlural(e, name) }
											/>
										)
										: null
								}

								{/* TODO there's some wiggling happening on hover here */}
								{/* Delete List Item Button */
									(isEditMode && isRemovable)
										? (
											<Button
												className="delete"
												onClick={ (e) => onRemoveItem(e, name) }
												icon={ <FontAwesomeIcon icon={ faTimes } /> }
											/>
										)
										: null
								}
							</li>
						);
					})
				}
			</ul>

			{/* Input */
				(isEditMode && isInputDisplayed)
					? (
						<Suggestions
							isSuggestionEnabled={ isSuggestionEnabled }
							fieldName={ fieldName }
							onSelectSuggestion={ onListChange }
							suggestionQuery={ GET_SUGGESTED_INGREDIENTS_QUERY }
							type="ingredients"
							value={ value.name || value }
						>
							<ListInput
								className={ className }
								fieldName={ fieldName }
								hideInput={ hideInput }
								list={ list }
								loading={ loading }
								onAddItem={ onListChange }
								onChange={ onChange }
								onBlur={ onBlur }
								value={ value }
							/>
						</Suggestions>
					)
					: null
			}
		</ListStyles>
	);
};

List.defaultProps = {
	className: 'list',
	isPluralSuggestEnabled: false,
	isSuggestionEnabled: false,
	isRemovable: true,
	list: ImmutableList.of([]),
	loading: false,
	onChange: (e) => e.preventDefault(),
	onListChange: () => {},
	value: null,
};

List.propTypes = {
	className: PropTypes.string,
	fieldName: PropTypes.string.isRequired,
	isPluralSuggestEnabled: PropTypes.bool,
	isRemovable: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string.isRequired,
	list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onListChange: PropTypes.func,
	value: PropTypes.string,
};

export default List;

const ListStyles = styled.div`
	button.add {
		display: inline-block;
		border: 0;
		color: ${ (props) => props.theme.altGreen };
		text-decoration: underline;
		padding: 0;
		margin: 0 !important;
		position: relative;
		top: 2px;
		left: 8px;
		background: transparent;
		cursor: pointer;

		.fa-plus {
			margin: 0;
			font-size: 14px;
			height: 14px;
		}

		&:focus {
			outline: ${ (props) => props.theme.altGreen } auto 3px;
		}

		&:hover {
			border-bottom: 0 !important;
		}
	}

	ul.list {
		list-style-type: none;
		margin: 0;
		padding: 4px 0 10px;
		max-height: 200px;
		overflow: scroll;

		li {
			font-size: 12px;
			color: #222;
			padding-top: 2px;

			.warning {
				color: tomato !important;
			}

			span {
				color: #222;
				font-weight: 400;

				&:hover {
					cursor: default;
				}

				&:hover + button.delete {
					display: inline-block;
				}
			}

			button {
				&:hover + button.delete {
					display: inline-block;
				}
			}

			button.delete {
				cursor: pointer;
				display: inline-block;
				color: tomato !important;
				border: 0 !important;
				background: transparent;
				padding: 0 8px!important;
				margin: 0 !important;
				display: none;
				height: 16px;

				svg {
					height: 14px;
				}

				&:hover {
					display: inline-block;
				}
			}

			button.list {
				border: 0;
				background: transparent;
				color: ${ (props) => props.theme.altGreen };
				text-decoration: underline;
				padding: 0;
				cursor: pointer;
				font-size: 14px;
			}

			.fa-magic {
				color: #ccc;
				cursor: pointer;
				width: 13px;
				position: relative;
				left: 8px;
				top: 2px;
				margin-right: 8px;
				display: inline-block;
				z-index: 1;
				height: 16px;

				&:hover {
					color: ${ (props) => props.theme.altGreen };
				}

				&:hover + button.delete {
					display: inline-block;
				}
			}
		}
	}
`;
