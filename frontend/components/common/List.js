import { List as ImmutableList } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import { faPlus, faTimes } from '@fortawesome/pro-solid-svg-icons';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import styled from 'styled-components';
import Suggestions from './Suggestions';

import CardContext from '../../lib/contexts/ingredients/cardContext';
import { GET_SUGGESTED_INGREDIENTS_QUERY } from '../../lib/apollo/queries/suggestions';
import Button from './Button';
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
	placeholder,
	type,
	value,
}) => {
	// console.log('LIST', { fieldName, list, value });
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	const [ isInputDisplayed, toggleInputDisplay ] = useState(false);

	useEffect(() => {
		if (value === '') {
			// console.log('disabling');
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
		// console.log('onBlur');
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
									(type === 'ingredient')
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
							value={ value?.name || value }
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
								placeholder={ placeholder }
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
	placeholder: '',
	type: null,
	value: '',
	values: {},
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
	placeholder: PropTypes.string,
	type: PropTypes.string,
	value: PropTypes.string,
	values: PropTypes.shape({}),
};

export default List;

const ListStyles = styled.div`
	label {
		display: inline-block;
		margin-bottom: 10px;
	}

	button.add {
		display: inline-block;
		border: 0;
		height: 14px;
		margin-left: 6px;
		width: 16px;
		position: relative;

		svg {
			height: 14px;
			color: ${ (props) => props.theme.altGreen };
			top: 0px;
			left: 2px;
		}
	}

	ul {
		margin: 0;
		margin-bottom: 10px;
		padding: 0;
		list-style-type: none;
		font-size: 13px;

		li {
			font-weight: normal;
			padding: 4px 0;
			position: relative;

			.delete {
				display: none;
				padding: 0;
				position: absolute;

				svg:hover {
					color: tomato;
				}
			}

			&:hover {
				.delete {
					display: inline-block;
				}
			}

			svg {
				height: 13px;
				color: #ccc;
				position: relative;
				top: 2px;

				&:hover {
					color: ${ (props) => props.theme.altGreen };
					cursor: pointer;
				}

				&:first-of-type {
					margin-left: 6px;
				}
			}
		}
	}
`;