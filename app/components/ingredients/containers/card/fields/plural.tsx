import React, { useContext } from 'react';
import styled from 'styled-components';

import { Button, HighlightedInput } from '../../../../common';
import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';
import MagicIcon from 'public/icons/magic.svg';

const Plural = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient, loading } = useIngredient({ id });
  const { plural } = ingredient;
  const isPluralSuggestEnabled = isEditMode;

  function handlePluralChange(event: Event) {
    const { target: { value, name } } = event;
    console.log({ value, name });
    // TODO
  }

  function handleAutoSuggest(e) {
    // TODO
	}

  return (
    <Wrapper aria-busy={loading} disabled={loading}>
      {isPluralSuggestEnabled && <AutoSuggest icon={<MagicIcon />} onClick={handleAutoSuggest} />}
      <Input
        className={isPluralSuggestEnabled ? 'auto-suggest' : ''}
        fieldName="plural"
        isEditMode={isEditMode}
        isRequired
        isSpellCheck={isEditMode}
        loading={loading}
        onChange={handlePluralChange}
        placeholder="plural"
        value={plural}
      />
    </Wrapper>
  );
};

export default Plural;

const Wrapper = styled.fieldset`
  order: 3;
  flex-basis: 50%;

  span.auto-suggest {
    margin-right: 10px;
  }
`;

const Input = styled(HighlightedInput)`
  display: inline-block;
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