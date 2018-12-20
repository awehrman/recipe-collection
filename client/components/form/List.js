import React, { Component } from 'react';
import styled from 'styled-components';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlus from '@fortawesome/fontawesome-pro-solid/faPlus';
import faTimes from '@fortawesome/fontawesome-pro-solid/faTimes';

import Button from './Button';
import Input from './Input';

const ListStyles = styled.fieldset`
	border: 0 !important;
	padding: 0 !important;

	label {
		display: inline-block !important;
	}

	button.delete {
		cursor: pointer;
		background: white;
		margin-left: 10px;
		padding: 10px 20px;
		display: inline-block;
		color: tomato !important;
		border: 0 !important;
	}

	button.add {
		display: inline-block;
		border: 0;
		color: ${ props => props.theme.altGreen };
		text-decoration: underline;
		padding: 0;
		margin: 0 0 0 6px;
		background: transparent;
		cursor: pointer;

		svg {
			font-size: 10px;
			margin-bottom: 2px;
		}
	}

	button.add:hover {
		border-bottom: 0 !important;
	}

	ul.list {
		list-style-type: none;
		margin: 0;
		padding: 0 !important;
		margin-bottom: 4px;

		li {
			font-size: .8em;
			color: #222;
			line-height: 1.6;

			button {
				font-size: 1em;
				color: ${ props => props.theme.highlight };
				line-height: 1.6;
				font-weight: 400;
				padding: 4px 0 0;
				border: 0;
				border-bottom: 1px solid ${ props => props.theme.highlight };
				cursor: pointer;

				&:focus {
					outline: 0;
				}
			}
		}
	}
`;

class List extends Component {
	constructor(props) {
    super(props);

    this.state = {
    	showInput: false,
    	value: ''
    };

    this.addToList = this.addToList.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onSelectSuggestion = this.onSelectSuggestion.bind(this);
  }

	onAddToListClick(e) {
		e.preventDefault();

  	this.setState({
  		showInput: true
  	});
	}

  onBlur(e) {
  	// re-hide the input if we click away
  	if (!e.relatedTarget) {
  		this.setState({
	  		showInput: false,
	  		value: ''
	  	});
  	}
  }

  onChange(e) {
  	this.setState({
  		value: e.target.value
  	});
  }

  addToList(list, item) {
  	this.setState({
  		showInput: false,
    	value: ''
  	}, this.props.onListChange(list, item));
  }

  onListItemClick(e, item) {
  	e.preventDefault();
  	this.props.onListItemClick(item);
  }

  onDeleteClick(e, list, item) {
  	e.preventDefault();
  	this.props.onListChange(list, item, true)
  }

  onSelectSuggestion(listName, suggestion) {
		this.setState({
  		showInput: false,
  		value: ''
	  }, this.props.onListChange(listName, suggestion));
  }

  render() {
  	const { allowDelete, isEditMode, label, list, loading, name, placeholder, showSuggestions, suggestionPool, type } = this.props;
  	const { showInput, value } = this.state;

  	return (
			<ListStyles disabled={ loading } aria-busy={ loading }>
				{/* List Label */}
				<label htmlFor={ name }>{ label }</label>

				{/* Add to List Button (+) */
					(isEditMode)
						? <Button
								className="add"
								icon={ <FontAwesomeIcon icon={ faPlus } /> }
								type="button"
								onClick={ e => this.onAddToListClick(e) }
							/>
						: null 
				}

				{/* List Items */}
				<ul className="list">
					{
						list.map(i => (
							<React.Fragment key={ i.id || i }>
								{
									(type === 'link')
										? <Button
												className="list"
												onClick={ e => this.onListItemClick(e, i) }
												label={ i.name || i }
											/>
										: <span>{ i.name || i }</span>
								}
								{
									(allowDelete)
										? <Button
												className="delete"
												onClick={ e => this.onDeleteClick(e, name, i) }
												icon={ <FontAwesomeIcon icon={ faTimes } /> }
											/>
										: null
								}
							</React.Fragment>
						))

					}
				</ul>

				{/* New List Item Input look into value assignment here*/
					(showInput)
						? <Input
								addToList={ this.addToList }
								autoFocus={ true }
								onBlur={ this.onBlur }
								onChange={ this.onChange }
								onKeyDown={ this.onKeyDown }
								name={ name }
								required={ false }
		  					placeholder={ placeholder }
		  					showLabel={ false }
		  					showSuggestions={ showSuggestions }
		  					onSelectSuggestion={ this.onSelectSuggestion }
		  					suggestionPool={ suggestionPool }
		  					value={ value }
							/>
						: null
				}
			</ListStyles>
		);
	}
}

export default List;