import React, { useContext } from 'react';
import styled from 'styled-components';

import { Button } from '../../../common';
import CardContext from 'contexts/card-context';
import EditIcon from 'public/icons/edit.svg';

const ValidationsAndActions = () => {
  const { isEditMode, setIsEditMode } = useContext(CardContext);

  function handleEditClick(event: Event) {
    setIsEditMode(true);
  }

  function handleCancelClick(event: Event) {
    setIsEditMode(false);
  }

  return (
    <Wrapper>
      {/* Warnings */}

      {/* Edit Button */}
      {!isEditMode && (
        <EditButton
          icon={<EditIcon />}
          label="Edit"
          onClick={handleEditClick}
        />
      )}

      {/* Save Button */}

      {/* Cancel Button */}
      {isEditMode && (
        <CancelButton label="Cancel" onClick={handleCancelClick} />
      )}
    </Wrapper>
  );
};

export default ValidationsAndActions;

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const EditButton = styled(Button)`
  border: 0;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.highlight};
  font-weight: 600;
  font-size: 14px;
  align-self: flex-end;

  svg {
    margin-right: 8px;
    height: 14px;
  }
`;

const CancelButton = styled(Button)`
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #ccc;
  font-weight: 400;
  margin-right: 10px;
`;
