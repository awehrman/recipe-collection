import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import { faPlus, faTimes } from '@fortawesome/pro-solid-svg-icons';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from './Button';
import Input from './Input';
import Suggestions from './Suggestions';
import { GET_SUGGESTED_INGREDIENTS_QUERY } from '../../lib/apollo/queries';

const ListStyles = styled.fieldset`
	border: 0;
	padding: 0;

	button.add {
		display: inline-block;
		border: 0;
		color: ${ props => props.theme.altGreen };
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
		}

		&:focus {
			outline: ${ props => props.theme.altGreen } auto 3px;
		}

		&:hover {
			border-bottom: 0 !important;
		}
	}

	ul.list {
		list-style-type: none;
		margin: 0;
		padding: 4px 0 10px;

		li {
			font-size: 14px;
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
				color: ${ props => props.theme.altGreen };
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
				height: 18px;

				&:hover {
					color: ${ props => props.theme.altGreen };
				}

				&:hover + button.delete {
					display: inline-block;
				}
			}
		}

		& + fieldset {
			position: relative;
			top: -8px;
		}
	}
`;

// TODO replace this with react-window at some point
class List extends Component {
	state = {
		showInput: false,
		value: '',				// input value
	};

	onAddButtonClick = (e) => {
		e.preventDefault();
		this.setState({ showInput: true });
	}

	onBlur = (e) => {
		const { fieldName, validate } = this.props;
		// hide the input element if we move focus off this element
		if (!e.relatedTarget) {
			this.setState({
				showInput: false,
				value: '',
			}, () => validate(fieldName, null));
		}
	}

	onChange = (e) => {
		const { value } = e.target;
		const { fieldName, validate } = this.props;

		this.setState({ value }, () => validate(fieldName, (typeof value === 'string') ? value : value.name));
	}

	onListChange = (e, listItem, fieldName, removeListItem = false) => {
		if (e) e.preventDefault();
		const { onListChange } = this.props;
		let item;
		if (typeof listItem === 'string') {
			item = listItem;
		} else {
			item = {
				id: listItem.id || null,
				name: listItem.name,
			};
		}
		this.setState({
			showInput: false,
			value: '',
		}, onListChange(item, fieldName, removeListItem));
	}

	onSuggestPlural = (e, value) => {
		e.preventDefault();
		const { fieldName } = this.props;
		const { name } = value;
		let plural = null;

		try {
			plural = pluralize(name);
		} catch {
			// do nothing if this fails
		}

		if (plural) {
			const listItem = { name: plural };
			this.onListChange(e, listItem, fieldName, false);
		}
	}

	showPluralSuggest = (value, list) => {
		const { name } = value;
		let plural = null;
		let showPlural = false;

		try {
			plural = pluralize(name);
		} catch {
			// do nothing if this fails
		}

		// only show if the plural value exists and its not already in this list
		if (plural) {
			showPlural = (plural && !~list.findIndex(l => l.name === plural));
		}

		return showPlural;
	}

	render() {
		const {
			className, defaultValues, isEditMode, isPluralSuggestEnabled,
			isRemovable, isSuggestionEnabled, label, loading, fieldName, onListItemClick,
			placeholder, suppressLocalWarnings, type, warnings, validate, values,
		} = this.props;
		const { showInput, value } = this.state;
		let list = (isEditMode && (values !== undefined)) ? values : defaultValues;
		list = list || [];

		if (isEditMode || (!isEditMode && list.length > 0)) {
			return (
				<ListStyles disabled={ loading } className={ className } aria-busy={ loading }>
					{/* List Label */}
					{
						(isEditMode || (list.length > 0))
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
									onClick={ e => this.onAddButtonClick(e) }
								/>
							)
							: null
					}

					{/* List Items */}
					<ul className="list">
						{
							list.map((i, index) => {
								if (!i.name) return null;
								const warningIndex = warnings.findIndex(w => (w.value === i.name));
								const key = `${ type }_${ index }_${ i.id || i.name }`;
								return (
									<li key={ key }>
										{/* TODO we might want to switch link types to return a <Link> so that the URL updates;
												the suggestion is cool being a button */
											(type === 'link' || type === 'suggestion')
												? (
													<Button
														className="list"
														onClick={ e => onListItemClick(e, i) }
														label={ i.name || i }
													/>
												)
												: <span className={ (warningIndex > -1) ? 'warning' : '' }>{ i.name || i }</span>
										}

										{
											(isEditMode && isPluralSuggestEnabled && this.showPluralSuggest(i, list))
												? (
													<FontAwesomeIcon
														className={ (!isEditMode) ? 'disabled' : '' }
														icon={ faMagic }
														onClick={ e => this.onSuggestPlural(e, i, list) }
													/>
												)
												: null
										}

										{/* delete button */
											(isEditMode && isRemovable)
												? (
													<Button
														className="delete"
														onClick={ e => this.onListChange(e, { name: i.name }, fieldName, true) }
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

					{/* New List Item Input look into value assignment here */
						(showInput)
							? (
								<Suggestions
									isSuggestionEnabled={ isSuggestionEnabled }
									fieldName={ fieldName }
									onSelectSuggestion={ this.onListChange }
									suggestionQuery={ GET_SUGGESTED_INGREDIENTS_QUERY }
									value={ value.name || value }
								>
									<Input
										isLabelDisplayed={ false }
										fieldName={ fieldName }
										loading={ loading }
										onBlur={ this.onBlur }
										onChange={ this.onChange }
										onSubmit={ this.onListChange }
										placeholder={ placeholder }
										suppressLocalWarnings={ suppressLocalWarnings }
										validate={ validate }
										value={ value.name || value }
										warnings={ warnings || undefined }
									/>
								</Suggestions>
							)
							: null
					}
				</ListStyles>
			);
		}
		return null;
	}
}

List.defaultProps = {
	className: '',
	defaultValues: [],
	isEditMode: true,
	isPluralSuggestEnabled: false,
	isRemovable: true,
	isSuggestionEnabled: false,
	label: '',
	loading: false,
	onListItemClick: e => e.preventDefault(),
	placeholder: '',
	suppressLocalWarnings: false,
	type: 'static',
	values: [],
	warnings: [],
};

List.propTypes = {
	className: PropTypes.string,
	defaultValues: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
	fieldName: PropTypes.string.isRequired,
	isEditMode: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRemovable: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	onListChange: PropTypes.func.isRequired,
	onListItemClick: PropTypes.func,
	placeholder: PropTypes.string,
	suppressLocalWarnings: PropTypes.bool,
	type: PropTypes.string,
	validate: PropTypes.func.isRequired,
	values: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string, // TODO isRequired
	})),
	warnings: PropTypes.arrayOf(PropTypes.shape({
		__typename: PropTypes.string,
		fieldName: PropTypes.string.isRequired,
		preventSave: PropTypes.bool.isRequired,
		value: PropTypes.string.isRequired,
		message: PropTypes.string.isRequired,
	})),
};

export default List;
