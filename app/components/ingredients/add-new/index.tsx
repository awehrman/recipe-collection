import React from 'react';
import styled from 'styled-components';

import Button from '../../common/Button';

const AddNew: React.FC = () => {
  return (
    <Wrapper>
      {/* Add New Ingredient */}
      <AddNewButton label='Add New' />
    </Wrapper>
  );
};

export default AddNew;

const Wrapper = styled.div`
  background: ${ ({ theme }) => theme.colors.greenBackground };
	padding: 16px 40px 6px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;
	box-shadow: 0 0 10px 0 rgba(115, 198, 182, .2) inset;
  max-height: 60%;
  overflow-y: scroll;
	z-index: 600;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

const AddNewButton = styled(Button)`
  cursor: pointer;
  border: 0;
  background: transparent;
  color: ${ ({ theme }) => theme.colors.altGreen };
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px;
  padding: 0;
`;