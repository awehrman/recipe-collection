import React, { useContext, useState } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../../contexts/view-context';
import CardContext from '../../../../contexts/card-context';

import BaseFields from './base-fields';
import RelationalFields from './relational-fields';
import ValidationsAndActions from './validations-and-actions';

const Card = ({ id }) => {
  const { view } = useContext(ViewContext);
  const [isEditMode, setIsEditMode] = useState(view === 'new');

  function handleEditClick(event: Event) {
    setIsEditMode(!isEditMode);
  }

  return (
    <CardContext.Provider value={{ id, isEditMode, setIsEditMode }}>
      <Form>
        {/* Name, Plural, Properties, isComposedIngredient */}
        <BaseFields />

        {/* Alternate Names, Related Ingredients, Substitutes, References */}
        <RelationalFields />

        {/* Warnings, Edit, Save, Cancel */}
        <ValidationsAndActions />
      </Form>
    </CardContext.Provider>
  )
}

export default Card;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  order: 0;
  flex-basis: 100%;
  min-height: ${({ theme }) => theme.sizes.mobileCardHeight};
	border-bottom: 1px solid #ddd;
  background: pink;
  position: relative;

  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth}) {
    min-height: 500px;
    order: 2;
    flex-basis: calc(100% - 200px);
    min-height: ${({ theme }) => theme.sizes.desktopCardHeight};
  }
`;
