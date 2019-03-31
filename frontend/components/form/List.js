import { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import faMagic from '@fortawesome/fontawesome-pro-regular/faMagic';
import faPlus from '@fortawesome/fontawesome-pro-solid/faPlus';
import faTimes from '@fortawesome/fontawesome-pro-solid/faTimes';

import Button from './Button';
import Input from './Input';

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
				top: 0;
				margin-right: 8px;
				display: inline-block;
				z-index: 1;

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
		const { addWarning, fieldName, validate, resetWarnings } = this.props;
		// hide the input element if we move focus off this element
		if (!e.relatedTarget) {
			this.setState({
				showInput: false,
				value: '',
			}, () => validate(null, fieldName, addWarning, resetWarnings));
		}
	}

	onChange = (e) => {
		const { value } = e.target;
		const { addWarning, fieldName, validate, resetWarnings } = this.props;

		this.setState({ value }, () => validate(value, fieldName, addWarning, resetWarnings));
	}

	onListChange = (listItem, fieldName, removeListItem = false) => {
		const { addWarning, onListChange, resetWarnings } = this.props;

		this.setState({
			showInput: false,
			value: '',
		}, onListChange(listItem, fieldName, removeListItem, addWarning, resetWarnings));
	}

	onSuggestPlural = (e, value) => {
		e.preventDefault();
		const { addWarning, fieldName, resetWarnings } = this.props;
		const { name } = value;
		let plural = null;

		try {
			plural = pluralize(name);
		} catch {
			// do nothing if this fails
		}

		if (plural) {
			const listItem = { name: plural };
			this.onListChange(listItem, fieldName, false, addWarning, resetWarnings);
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
			className, defaultValues, excludedSuggestions, isEditMode, isPluralSuggestEnabled, isRemoveable, isSuggestionEnabled,
			label, loading, fieldName, onListItemClick, placeholder, suggestionPool, suppressLocalWarnings, type, warnings, values,
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
								// const warningIndex = warningValues.findIndex(w => (w === i.name) || (w === i));
								const warningIndex = -1; // TODO
								const key = `${ type }_${ index }_${ i.id || i.name || i }`;
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
											(isEditMode && isRemoveable)
												? (
													<Button
														className="delete"
														onClick={ () => this.onListChange(i.name, fieldName, true) }
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
								<Input
									excludedSuggestions={ excludedSuggestions }
									isLabelDisplayed={ false }
									isSuggestionEnabled={ isSuggestionEnabled }
									fieldName={ fieldName }
									loading={ loading }
									onBlur={ this.onBlur }
									onChange={ this.onChange }
									onSubmit={ this.onListChange }
									placeholder={ placeholder }
									suggestionPool={ suggestionPool }
									suppressLocalWarnings={ suppressLocalWarnings }
									value={ value.name || value }
									warnings={ warnings || undefined }
								/>
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
	addWarning: () => {},
	className: '',
	defaultValues: [],
	excludedSuggestions: [],
	isEditMode: true,
	isPluralSuggestEnabled: false,
	isRemoveable: true,
	isSuggestionEnabled: false,
	label: '',
	loading: false,
	onListChange: () => {
		console.log('*** [List] psst! You didnt pass an onListChange function!');
		return null;
	},
	onListItemClick: () => {
		console.log('*** [List] psst! You didnt pass an onListItemClick function!');
		return null;
	},
	placeholder: '',
	resetWarnings: () => {},
	suggestionPool: [],
	suppressLocalWarnings: false,
	type: 'static',
	validate: () => {
		console.log('*** [List] psst! You didnt pass a validate function!');
		return null;
	},
	values: [],
	warnings: null,
};

List.propTypes = {
	addWarning: PropTypes.func,
	className: PropTypes.string,
	defaultValues: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string.isRequired,
	})),
	excludedSuggestions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	fieldName: PropTypes.string.isRequired,
	isEditMode: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRemoveable: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	onListChange: PropTypes.func,
	onListItemClick: PropTypes.func,
	placeholder: PropTypes.string,
	resetWarnings: PropTypes.func,
	suggestionPool: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	suppressLocalWarnings: PropTypes.bool,
	type: PropTypes.string,
	validate: PropTypes.func,
	values: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string.isRequired,
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
