import React, { Component } from 'react';

import Button from './Button';
import Select from './Select';
import List from './List';

import { clone } from '../../lib/util';

import './Modal.css';

class Modal extends Component {
	constructor(props) {
    super(props);

    this.state = {
    	associated: [],
    	type: 'semantic',
    	warning: null
    };

    this.onErrorSelect = this.onErrorSelect.bind(this);
    this.updateList = this.updateList.bind(this);
  }

  onCancel(e) {
  	e.preventDefault();
  	this.props.onCancel(e, 'modal');
  }

  onErrorSelect(e) {
  	this.setState({
  		type: e.target.value
  	});
  };

  onSave(e) {
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
		  case 'merge':
		  	if (!associated) {
		  		this.setState({
		  			warning: 'Must provide an ingredient to merge with'
		  		});
		  	} else {
			  	this.props.saveIngredient(associated[0]);
		  	}
		  	break;
		  default:
		  	break;
  	}
  }

  updateList(e, code, value) {
		const { associated } = this.state;
  	associated.push(value);

  	this.setState({
  		associated
  	});
  }

  renderContent() {
  	const associated = clone(this.state.associated);
  	const ingredient = clone(this.props.ingredient);
  	const ingredients = clone(this.props.ingredients);

  	switch (this.props.modal.type) {
  		case 'error':
  			
		  	const { type } = this.state;
  			const errors = [
  				{ code: 'semantic', label: 'Incorrectly Parsed' },
  				{ code: 'data', label: 'Bad Input Data' },
  				{ code: 'equipment', label: 'Equipment' },
  				{ code: 'instruction', label: 'Instruction Line' },
  			];

		  	return (
		  		<div className="content">
		  			Flag <strong>"{ ingredient.name }"</strong> as
		  			{ (type === 'equipment') ? ' a piece of ' : null }
		  			{ (type === 'instruction') ? ' an ' : null }
		  			<Select
							fieldName={ 'errorType' }
							options={ errors }
							onChange={ this.onErrorSelect }
						/>
						{/* if this is a standard parsing error, allow to associate it with one or more ingredients */
							(type === 'semantic' || type === 'data')
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
		  		</div>
		  	);
		  case 'merge':
		  	return (
		  		<React.Fragment>
						<span>Merge <strong>{ ingredient.name }</strong> with the</span>
						<List
							code={ "merge" }
							currentIngredient={ ingredient }
							ingredients={ ingredients }
							isEditMode={ true }
							key={ "alt" }
							label={ "Merge Ingredient" }
							list={ associated }
							updateList={ this.updateList }
						/>
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
  	const modal = clone(this.props.modal);

  	return (
  		<div className="modal">
  			<h1>{ modal.title }</h1>
  			{ this.renderContent() }
  			<div className="controls">
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
	  	</div>
  	);
  }
}

export default Modal;