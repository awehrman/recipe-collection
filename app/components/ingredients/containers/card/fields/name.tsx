import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

import HighlightedInput from './common/highlighted-input';
import { localFields } from './common/validation';

const Name = () => {
  const { edits, id, isEditMode, methods: { register } } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { name } = ingredient;

  const registerField = register('name', {
    minLength: 1,
    required: true,
    validate: {
      validateLocalFields: (data: string) => localFields(data, 'name', edits, ingredient),
      // validateAllIngredients,
    }
  });

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
