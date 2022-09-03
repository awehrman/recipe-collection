import _ from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { PROPERTY_ENUMS } from 'constants/ingredient';
import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

const Property = ({ property }) => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { properties = [] } = ingredient;

  return (
    <Checkbox className={isEditMode ? 'editable' : ''}>
      <label htmlFor={property}>
        <input
          type='checkbox'
          id={property}
          checked={properties.includes(property)}
          name={`properties_${property}`}
          // onChange={(e) => onPropertyChange(e, property)}
          // onKeyDown={onKeyDown}
          defaultValue={property}
        />
        <span>{_.capitalize(property)}</span>
      </label>
    </Checkbox>
  );
};

const Properties = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { properties = [] } = ingredient;

  function renderProperties() {
    let propertyKeys = PROPERTY_ENUMS;
    if (!isEditMode) {
      propertyKeys = propertyKeys.filter((key) => properties.includes(key))
    }
    return propertyKeys.map((property) => <Property key={property} property={property} />);
  }

  return <Wrapper>{renderProperties()}</Wrapper>;
};

export default Properties;

const Wrapper = styled.div`
  order: 1;
  text-align: right;
  flex-grow: 2;
  flex-basis: 50%;
`;

const Checkbox = styled.div`
  display: inline-block;
  margin-right: 10px;
  color: #222;

  &:last-of-type {
    margin-right: 0;
  }

  label {
    font-weight: 400 !important;
    position: relative;
    padding-left: 18px;

    input {
      background: tomato;
			margin-right: 8px;
			position: absolute;
			top: 0;
		  left: 0;
		  width: 0;
		  height: 0;
		  pointer-events: none;
			opacity: 0; /* we want to hide the original input, but maintain focus state */

      &:checked + span::after {
        position: absolute;
		    top: 0;
        color: ${({ theme }) => theme.colors.altGreen};
        display: block;
				font-style: normal;
				font-variant: normal;
				text-rendering: auto;
				-webkit-font-smoothing: antialiased;

				font-family: "Font Awesome 5 Pro";
				font-weight: 900;
				content: "\f00c";
      }
    }
  }

  label::before {
    display: block;
	  position: absolute;
	  top: 5px;
	  left: 0;
	  width: 11px;
	  height: 11px;
	  border-radius: 3px;
	  background-color: white;
	  border: 1px solid #ddd;
	  content: '';
  }

  &.editable > label {
    cursor: pointer;
  }

  /* apply fake focus highlighting */
  &.editable > input:focus + label::before {
    outline: ${({ theme }) => theme.colors.altGreen} auto 3px;
  }
`;
