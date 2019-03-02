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
  	value: ''
  };

	onAddButtonClick = (e) => {
  	this.setState({
  		showInput: true
  	});
	}

  onBlur = (e) => {
  	const { name } = this.props;
  	// hide the input element if we move focus off this element
  	if (!e.relatedTarget) {
  		this.setState({
	  		showInput: false,
	  		value: ''
	  	}, () => this.props.onValidation(null, name));
  	}
  }

  onChange = (e) => {
  	const { value } = e.target;
  	const { name } = this.props;

  	this.setState({
  		value
  	}, () => this.props.onValidation(value, name));
  }

  onListChange = (listItem, fieldName, removeListItem = false) => {
  	if (fieldName === 'alternateNames') {
  		listItem = { name: listItem }; // TODO clean up the alt name input so that this happens automatically
  	}
  	
  	this.setState({
  		showInput: false,
    	value: ''
  	}, this.props.onListChange(listItem, fieldName, removeListItem));
  }

  onSuggestPlural = (e, value) => {
  	e.preventDefault();
  	const { name, type } = this.props;
  	const plural = (value) ? pluralize(value) : null;

  	if (plural) {
  		this.props.onListChange(plural, name, false);
  	}
  }

  showPluralSuggest = (value, list) => {
  	const { warnings } = this.props;
  	let showPlural = (warnings.length > 0) ? true : false;
  	let plural = null;

  	try {
  		plural = pluralize(value);
  	} catch {}

  	showPlural = (list.indexOf(plural) > 0) ? false : showPlural;

  	return showPlural;
  }

  render() {
  	const { className, defaultValues, excludedSuggestions, isEditMode, isPluralSuggestEnabled, isRemoveable, isSuggestionEnabled,
  					label, loading, name, placeholder, suggestionPool, suppressWarnings, type, warnings, values } = this.props;
  	const { showInput, value } = this.state;

  	let list = (isEditMode && (values !== undefined)) ? values : defaultValues;
  	list = list || [];

  	const warningValues = warnings.map(w => w.value);

  	if (isEditMode || (!isEditMode && list.length > 0)) {
	  	return (
				<ListStyles disabled={ loading } className={ className } aria-busy={ loading }>
					{/* List Label */}
					{
						(isEditMode || (list.length > 0))
							? <label htmlFor={ name }>{ label }</label>
							: null
					}

					{/* Add to List Button (+) */}
					{
						(isEditMode)
							? <Button 
									className="add"
									icon={ <FontAwesomeIcon icon={ faPlus } /> }
									onClick={ e => this.onAddButtonClick(e) }
								/>
							: null
					}

					{/* List Items */}
					<ul className="list">
						{
							list.map((i, index) => {
								const warningIndex = warningValues.findIndex(w => (w === i.name) || (w === i));
								
								return (
									<li key={ `${ type }_${ index }_${ i.id || i.name || i }` }>
										{/* TODO we might want to switch link types to return a <Link> so that the URL updates; the suggestion is cool being a button */
											(type === 'link' || type === 'suggestion')
												? <Button
														className="list"
														onClick={e => this.props.onListItemClick(e, i) }
														label={ i.name || i }
													/>
												: <span className={ (warningIndex > -1) ? 'warning' : '' }>{ i.name || i }</span>
										}

										{
											(isEditMode && isPluralSuggestEnabled && this.showPluralSuggest(i, list))
												? <FontAwesomeIcon
														className={ (!isEditMode) ? 'disabled' : '' }
														icon={ faMagic }
														onClick={ e => this.onSuggestPlural(e, i, list) } />
												: null
										}

										{/* delete button */
											(isEditMode && isRemoveable)
												? <Button
														className="delete"
														onClick={ () => this.onListChange(i.name, name, true) }
														icon={ <FontAwesomeIcon icon={ faTimes } /> }
													/>
												: null
										}
									</li>
								);
							})

						}
					</ul>

					{/* New List Item Input look into value assignment here */
						(showInput)
							? <Input
									excludedSuggestions={ excludedSuggestions }
									isLabelDisplayed={ false }
			  					isSuggestionEnabled={ isSuggestionEnabled }
									name={ name }
									loading={ loading }
									onBlur={ this.onBlur }
									onChange={ this.onChange }
									onSubmit={ this.onListChange }
									placeholder={ placeholder }
									suggestionPool={ suggestionPool }
									suppressWarnings={ suppressWarnings }
			  					value={ value.name || value }
			  					warning={ warnings.filter(w => w.fieldName === name)[0] }
								/>
							: null
					}
				</ListStyles>
			);
		}
		return null;
	}
}

List.defaultProps = {
	excludedSuggestions: {},
	isEditMode: true,
	isPluralSuggestEnabled: false,
	isRemoveable: true,
	isSuggestionEnabled: false,
	loading: false,
	onListItemClick: () => {},
	onSuggestPlural: () => {},
	onValidation: () => {},
	suppressWarnings: false,
	type: 'static',
	warnings: []
};

List.propTypes = {
	className: PropTypes.string,
	defaultValues: PropTypes.array,
	excludedSuggestions: PropTypes.object,
	isEditMode: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRemoveable: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onListChange: PropTypes.func,
	onListItemClick: PropTypes.func,
	onSuggestPlural: PropTypes.func,
	onValidation: PropTypes.func,
	placeholder: PropTypes.string,
	suggestionPool: PropTypes.array,
	suppressWarnings: PropTypes.bool,
	type: PropTypes.string,
	values: PropTypes.array,
	warnings: PropTypes.array
};

export default List;