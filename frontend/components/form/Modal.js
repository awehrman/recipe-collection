import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from './Button';

const ModalStyles = styled.fieldset`
	border: 1px solid #ddd;
	border-radius: 3px;
	background: white;
	z-index: 100;
	padding: 30px 60px;
	position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
	align-self: flex-start;
	line-height: 1.8;
`;

class Modal extends Component {
  state = {
  	associated: [],
  	type: 'semantic',
  	warning: null
  };

  onSave = (e) => {
  	e.preventDefault();
  	console.warn('onSave');
  	// TODO
  }

  render() {
  	const { label, title } = this.props;

  	return (
			<ModalStyles>
				<div className="modal">
  			<h1>{ title }</h1>
  			{/* TODO this.renderContent() */}
  			<div className="controls">
					{/* TODO this.renderWarnings() */}

					<Button
		  			className="cancel"
		  			onClick={ e => this.props.onCancel(e) }
		  			label="Cancel"
		  		/>

		  		<Button
		  			className="save"
		  			onClick={ e => this.onSave(e) }
		  			label={ label }
		  		/>
	  		</div>
	  	</div>
			</ModalStyles>
		);
	}
}

Modal.defaultProps = {
};

Modal.propTypes = {
	label: PropTypes.string,
	onCancel: PropTypes.func,
	title: PropTypes.string,
};

export default Modal;
