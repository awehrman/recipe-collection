import React, { Component } from 'react';

import Button from './Button';
import Select from './Select';
import StylizedInput from './StylizedInput';
import List from './List';

import { clone } from '../../lib/util';

import './Modal.css';

class Modal extends Component {
	constructor(props) {
    super(props);

    this.state = {
    	associated: [],
    	type: 'data',
    	warning: null
    };

    this.onErrorSelect = this.onErrorSelect.bind(this);
    this.updateList = this.updateList.bind(this);
  }

  onCancel(e) {
  	e.preventDefault();
  	this.props.onButtonClick(e, 'modal');
  }

  onErrorSelect(e) {
  	this.setState({
  		type: e.target.value
  	});
  };

  onSave(e) {
  	console.warn('onSave');
  	e.preventDefault();
  	const { associated, type } = this.state;

  	switch (this.props.modal.type) {
  		case 'error':
		  	if (!type) {
		  		this.setState({
		  			warning: 'Must provide error type'
		  		});
		  	} else {
			  	const error = {
			  		associated,
			  		type
			  	};

			  	this.props.saveIngredient(null, error);
		  	}
		  	break;
		  default:
		  	break;
  	}
  }

  updateList(e, code, value) {
		const { associated } = this.state;
  	associated.push(value);
  	console.log('updateList ' + JSON.stringify(associated));

  	this.setState({
  		associated
  	});
  }

  renderContent() {
  	const ingredient = clone(this.props.ingredient);
  	const ingredients = clone(this.props.ingredients);

  	switch (this.props.modal.type) {
  		case 'error':
  			const associated = clone(this.state.associated);
		  	const { type } = this.state;
  			const errors = [
  				{ code: 'data', label: 'Bad Input' },
  				{ code: 'equipment', label: 'Equipment Item' },
  				{ code: 'instruction', label: 'Instruction Line' },
  				{ code: 'semantic', label: 'Incorrectly Parsed' },
  			];

		  	return (
		  		<React.Fragment>
		  			Flag <strong>{ ingredient.name }</strong> as a
		  			<Select
							fieldName={ 'errorType' }
							options={ errors }
							onChange={ this.onErrorSelect }
						/>
						{/* if this is a standard parsing error, allow to associate it with one or more ingredients */
							(type === 'semantic')
								? <List
										code={ "err" }
										currentIngredient={ ingredient }
										ingredients={ ingredients }
										isEditMode={ true }
										key={ "alt" }
										label={ "Associate Ingredient" }
										list={ associated }
										updateList={ this.updateList }
									/>
								: null
						}
		  		</React.Fragment>
		  	);
		  default:
		  	return null;
		}
  }

  renderWarnings() {
  	const { warning } = this.state;

  	if (warning) {
  		return (
  			<span className="warning">
  				{ warning }
  			</span>	
  		);
  	}
  }

  render() {
  	console.warn('Modal render');
  	const modal = clone(this.props.modal);

  	return (
  		<div className="modal">
  			<h1>{ modal.title }</h1>
  			{ this.renderContent() }
				{ this.renderWarnings() }

				<Button
	  			className="cancel"
	  			onClick={ e => this.onCancel(e) }
	  			label="Cancel"
	  		/>
	  		
	  		<Button
	  			className="save"
	  			onClick={ e => this.onSave(e) }
	  			label={ modal.label }
	  		/>
  		</div>
  	);
  }
}

export default Modal;