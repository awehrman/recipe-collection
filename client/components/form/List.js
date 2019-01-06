import { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
	}

	button.add:hover {
		border-bottom: 0 !important;
	}

	button.delete {
		cursor: pointer;
		display: inline-block;
		color: tomato !important;
		border: 0 !important;
		background: transparent;
		height: 12px;
		padding: 0 8px!important;
		margin: 0 !important;
		display: none;

		&:hover {
		  display: inline-block;
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
				font-size: 1em;
				color: ${ props => props.theme.highlight };
				font-weight: 400;
				padding: 4px;
				border: 0;
				border-bottom: 1px solid ${ props => props.theme.highlight };
				margin: 0;

				&:focus {
					outline: 0;
				}
			}
		}

		& + fieldset {
			position: relative;
			top: -8px;
		}
	}

	fieldset {
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
  	// hide the input element if we move focus off this element
  	if (!e.relatedTarget) {
  		this.setState({
	  		showInput: false,
	  		value: ''
	  	}, this.props.onValidation(this.props.name, ''));
  	}
  }

  onChange = (e) => {
  	const { value } = e.target;
  	const { name } = this.props;

  	this.setState({
  		value
  	}, this.props.onValidation(name, value));
  }

  onListChange = (item, listName, removeListItem = false) => {
  	const { defaultValue } = this.props;

  	this.setState({
  		showInput: false,
    	value: ''
  	}, this.props.onListChange(item, listName, removeListItem, defaultValue));
  }

  render() {
  	const { className, isEditMode, isRemoveable, isSuggestionEnabled, label, list, listType, loading,
  					name, placeholder, suggestionPool, warning } = this.props;
  	const { showInput, value } = this.state;

  	return (
			<ListStyles disabled={ loading } className={ className } aria-busy={ loading }>
				{/* List Label */}
				<label htmlFor={ name }>{ label }</label>

				{/* Add to List Button (+) */}
				{
					(isEditMode)
						? <Button className="add"
											icon={ <FontAwesomeIcon icon={ faPlus } /> }
											onClick={ e => this.onAddButtonClick(e) }
										/>
						: null
				}

				{/* List Items */}
				<ul className="list">
					{
						list.map(i => (
							<li key={ i.id || i }>
								{
									(listType === 'link')
										? <Button
												className="list"
												onClick={e => this.props.onListItemClick(e, i) }
												label={ i.name || i }
											/>
										: <span>{ i.name || i }</span>
								}
								{
									(isEditMode && isRemoveable)
										? <Button
												className="delete"
												onClick={ () => this.onListChange(i, name, true) }
												icon={ <FontAwesomeIcon icon={ faTimes } /> }
											/>
										: null
								}
							</li>
						))

					}
				</ul>

				{/* New List Item Input look into value assignment here */
					(showInput)
						? <Input
								isLabelDisplayed={ false }
		  					isSuggestionEnabled={ isSuggestionEnabled }
								name={ name }
								loading={ loading }
								onBlur={ this.onBlur }
								onChange={ this.onChange }
								onSubmit={ this.onListChange }
								placeholder={ placeholder }
								suggestionPool={ suggestionPool }
		  					value={ value }
		  					warning={ warning }
							/>
						: null
				}
			</ListStyles>
		);
	}
}

List.defaultProps = {
	isEditMode: true,
	isRemoveable: true,
	isSuggestionEnabled: false,
	loading: false,
	onListItemClick: () => {},
	onValidation: () => {},
	suppressWarnings: false,
	warning: ''
};

List.propTypes = {
	className: PropTypes.string,
	defaultValue: PropTypes.array,
	isEditMode: PropTypes.bool,
	isRemoveable: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	list: PropTypes.array.isRequired,
	listType: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onListChange: PropTypes.func,
	onListItemClick: PropTypes.func,
	onValidation: PropTypes.func,
	placeholder: PropTypes.string,
	suggestionPool: PropTypes.array,
	suppressWarnings: PropTypes.bool,
	value: PropTypes.string,
	warning: PropTypes.string
};

export default List;