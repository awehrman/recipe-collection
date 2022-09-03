import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

import HighlightedInput from './common/highlighted-input';

const Name = () => {
  const { id, isEditMode, methods } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { name } = ingredient;
  const validation = data => console.log('validate', data) ?? true;
  const registerField = {...methods.register('name', { required: true, validate: { validation } })};

  function validateField(data) {
    console.log('validateField', data)
  }

  return (
    <Wrapper aria-busy={loading} disabled={loading}>
      <HighlightedInput
        defaultValue={name}
        fieldName='name'
        isEditMode={isEditMode}
        isRequired
        isSpellCheck={isEditMode}
        loading={loading}
        placeholder='name'
        registerField={registerField}
      />
    </Wrapper>
  );
};

export default Name;

const Wrapper = styled.fieldset`
  order: 0;
  background: yellow
  display: flex;
  flex-grow: 2;
  flex-basis: 50%;
`;
