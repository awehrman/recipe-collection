import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';
import MagicIcon from 'public/icons/magic.svg';

import { Button } from '../../../../common';
import HighlightedInput from './common/highlighted-input';
import { localFields } from './common/validation';

const Plural = () => {
  const { edits, id, isEditMode, methods } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { plural } = ingredient;
  const isPluralSuggestEnabled = isEditMode;

  function handleAutoSuggest(e) {
    // TODO
	}

  const registerField = methods.register('plural', {
    validate: {
      validateLocalFields: (data: string) => localFields(data, 'plural', edits, ingredient),
      // validateAllIngredients,
    }
  });

  return (
    <Wrapper aria-busy={loading} disabled={loading}>
      {isPluralSuggestEnabled && <AutoSuggest icon={<MagicIcon />} onClick={handleAutoSuggest} />}
      <HighlightedInput
        className={isPluralSuggestEnabled ? 'auto-suggest' : ''}
        defaultValue={plural}
        fieldName='plural'
        isEditMode={isEditMode}
        isRequired
        isSpellCheck={isEditMode}
        loading={loading}
        placeholder='plural'
        registerField={registerField}
      />
    </Wrapper>
  );
};

export default Plural;

const Wrapper = styled.fieldset`
  display: flex;
  order: 3;
  flex-basis: 50%;

  span.auto-suggest {
    margin-right: 10px;
  }
`;

const AutoSuggest = styled(Button)`
  border: 0;
  padding: 0;
  margin-right: 10px;
  background: transparent;
  display: inline-block;
  cursor: pointer;

  svg {
		display: inline-block;
		width: 13px;
	}
`;