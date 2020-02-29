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
	// associated: [],
	// type: 'semantic',
	// warning: null

	onSave = (e) => {
		e.preventDefault();
		// TODO onSave
	}

	render() {
		const { label, onCancel, title } = this.props;

		return (
			<ModalStyles>
				<div className="modal">
					<h1>{ title }</h1>
					{/* TODO render modal content */}
					<div className="controls">
						{/* TODO render modal warnings */}

						<Button
							className="cancel"
							onClick={ (e) => onCancel(e) }
							label="Cancel"
						/>

						<Button
							className="save"
							onClick={ (e) => this.onSave(e) }
							label={ label }
						/>
					</div>
				</div>
			</ModalStyles>
		);
	}
}

Modal.defaultProps = {};

Modal.propTypes = {
	label: PropTypes.string.isRequired,
	onCancel: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
};

export default Modal;
