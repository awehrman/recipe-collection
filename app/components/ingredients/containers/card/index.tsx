import React, { useContext, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import styled from 'styled-components';

import ViewContext from 'contexts/view-context';
import CardContext from 'contexts/card-context';
import useIngredient from 'hooks/use-ingredient';

import BaseFields from './base-fields';
import RelationalFields from './relational-fields';
import ValidationsAndActions from './validations-and-actions';

const Card = ({ id }) => {
  const { ingredient } = useIngredient({ id });
  const { name, plural } = ingredient;
  const methods = useForm({
    mode: 'all',
    defaultValues: {
      name,
      plural,
    }
  });
  const edits = useWatch({ control: methods.control });

  const { view } = useContext(ViewContext);
  const [isEditMode, setIsEditMode] = useState(view === 'new');

  function handleFormSubmit(data) {
    console.log('handleFormSubmit', data);
  }

  return (
    <CardContext.Provider value={{ edits, id, isEditMode, methods }}>
      <FormWrapper onSubmit={methods.handleSubmit(handleFormSubmit)}>
        {/* Name, Plural, Properties, isComposedIngredient */}
        <BaseFields />

        {/* Alternate Names, Related Ingredients, Substitutes, References */}
        <RelationalFields />

        {/* Warnings, Edit, Save, Cancel */}
        <ValidationsAndActions />
      </FormWrapper>
    </CardContext.Provider>
  )
}

export default Card;

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  order: 0;
  flex-basis: 100%;
  min-height: ${({ theme }) => theme.sizes.mobileCardHeight};
	border-bottom: 1px solid #ddd;
  position: relative;
  padding: 20px;

  fieldset {
    position: relative;
    border: 0;
    padding: 0;
    margin: 0;
  }

  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth}) {
    min-height: 500px;
    order: 2;
    flex-basis: calc(100% - 200px);
    min-height: ${({ theme }) => theme.sizes.desktopCardHeight};
    border-left: 1px solid #ddd;
  }
`;
