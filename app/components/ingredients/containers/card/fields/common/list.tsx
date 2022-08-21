import React, { useContext } from 'react';
import styled from 'styled-components';

import CardContext from 'contexts/card-context';
import useIngredient from 'hooks/use-ingredient';
import PlusIcon from 'public/icons/plus.svg';

import { Button } from 'components/common';

const ListItems = ({ list = [] }) => {
  return (
    <StyledList />
  )
};

const SuggestedInput = () => {
  return (
    <Suggestions />
  )
};

const List = ({ fieldName = '', label = '' }) => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });

  const list = ingredient?.[fieldName] ?? [];
  const showButton = isEditMode;
  const showList = isEditMode || list.length;
  const showInput = isEditMode;
  console.log({ list })

  function handleAddToListClick(event) {
    event.preventDefault();
  }

  return (
    <Wrapper>
      {/* List Label */}
      {showList ? <label htmlFor={fieldName}>{label}</label> : null}

			{/* Add to List Button (+) */}
      {showButton ? <AddToListButton onClick={handleAddToListClick} icon={<PlusIcon />} /> : null}

			{/* List Items */}
      <ListItems list={list} />

			{/* Input */}
      {showInput ? <SuggestedInput /> : null}
    </Wrapper>
  )
}

export default List;

const Wrapper = styled.div``;

const AddToListButton = styled(Button)`
  display: inline-block;
  border: 0;
  height: 15px;
  margin: 0 0 0 5px;
  padding: 0;
  top: 2px;
  width: 16px;
  position: relative;
  background: transparent;

  svg {
    height: 15px;
    color: ${({ theme }) => theme.colors.altGreen};
    top: 0px;
  }
`;

const StyledList = styled.ul``;

const Suggestions = styled.div``;