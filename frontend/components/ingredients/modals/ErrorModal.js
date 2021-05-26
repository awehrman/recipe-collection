import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import Button from '../../common/Button';

const ErrorModal = ({ onCancel, onSave }) => (
	<Modal>
		<Title>Parsing Error</Title>
		<Controls>
			{/* Cancel Button */}
			<Button
				className="cancel"
				label="Cancel"
				onClick={ onCancel }
				type="button"
			/>

			{/* Save Button */}
			<Button
				className="save"
				label="Save"
				onClick={ onSave }
				type="button"
			/>
		</Controls>
	</Modal>
);

export default pure(ErrorModal);

const Modal = styled.div`
  width: 60%;
  height: 40%;
  position: absolute;
  top: 20%;
  left: 20%;
  z-index: 100;
  border: 1px solid #fff;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 10px;
  background: white;
  padding: 40px;
  line-height: 1.8;
`;

const Title = styled.h1`
`;

const Controls = styled.h1`
`;
