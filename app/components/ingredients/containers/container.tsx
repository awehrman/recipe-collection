import Link from 'next/link';
import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';
import { Ingredient } from '../../../types/ingredient';

type ContainerProps = {
  container: {
    id: string;
    name: string;
    count: number;
    currentIngredientId: string;
    isExpanded: boolean;
    ingredients: Ingredient[];
  };
  onClick: unknown;
};

const ExpandedCardView = () => {
  return <div>TODO</div>;
};

const ColumnsList = ({ container, onIngredientClick }) => {
  const { group, view } = useContext(ViewContext);
  const { id, ingredients = [] } = container;

  function handleIngredientClick(event: Event, ingredientId, index) {
    event.stopPropagation();
    // listRef.current.scrollToItem(index - 1, 'start');
    const showHideIngredientId = `${container.currentIngredientId}` === `${ingredientId}` ? null : `${ingredientId}`;
    onIngredientClick(`${container.id}`, showHideIngredientId);
  }

  function getIngredientLink(_id: string) {
    const { currentIngredientId } = container;
    const query = {
      group,
      view,
    };
    if (currentIngredientId !== _id) {
      query.id = _id;
    }
    return { pathname: '/ingredients', query };
  }

  function renderIngredientColumns() {
    return ingredients.map((ingredient, index) => (
      <IngredientColumnItem key={`columns_${id}_${ingredient.id}`}>
        <Link href={getIngredientLink(ingredient.id)}>
          <a
            onClick={(e: Event) => handleIngredientClick(e, ingredient.id, index)}
            onKeyPress={handleIngredientClick}
            role="link"
            tabIndex={0}
          >
            {ingredient.name}
          </a>
        </Link>
      </IngredientColumnItem>
    ));
  }

  return <Columns>{renderIngredientColumns()}</Columns>;
};

const Card = () => {
  // TODO
  return (
    <CardWrapper>
      card
    </CardWrapper>
  )
}

const Container: React.FC<ContainerProps> = ({
  container,
  onContainerClick,
  onIngredientClick,
}) => {
  return (
    <Wrapper onClick={() => onContainerClick(container.id)}>
      {/* Container Header */}
      <Header>
        {container.name}
        <Count>{container.count}</Count>
      </Header>

      {/* Ingredients */}
      <Ingredients className={container.isExpanded ? 'expanded' : ''}>
        <ColumnsList
          container={container}
          onIngredientClick={onIngredientClick}
        />
        {container.currentIngredientId && <Card />}
      </Ingredients>
    </Wrapper>
  );
};

export default Container;

const CardWrapper = styled.div`
  background: pink;
`

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  max-width: 1200px;
`;

const Header = styled.div`
  flex-basis: 100%;
  font-size: 1.2em;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.lighterGrey};
  text-align: right;
`;

const Ingredients = styled.div`
  display: none;

  &.expanded {
    display: flex;
  }
`;

const Columns = styled.ul`
  max-height: 500px;
  overflow-x: scroll;
  display: block;
  flex-basis: 100%;
  margin: 0;
  list-style-type: none;
  line-height: 1.4;
  overflow: scroll;
  position: relative;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;

  a {
    cursor: pointer;
    text-decoration: none;
    color: #222;
    display: inline-block; /* need to give these links height for the scroll! */

    &:hover {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }

  &.small {
    display: flex;
    align-items: start;
  }

  @media (min-width: 500px) {
    column-count: 2;
    column-gap: 16px;
  }

  @media (min-width: 700px) {
    column-count: 3;
  }

  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth}) {
    padding: 10px 0;

    /* swing the ingredient list over to the left */
    &.expanded {
      column-count: unset;
      flex-basis: 25%;
    }
  }

  @media (min-width: 900px) {
    column-count: 4;
  }

  @media (min-width: 1100px) {
    column-count: 5;
  }
`;

const IngredientColumnItem = styled.li`
  + .active {
    display: inline-block;
    background: rgba(128, 174, 245, 0.08);
    width: 100%;
  }

  + .child a {
    font-style: italic;
  }

  &.invalid > a {
    color: silver;
  }
`;
