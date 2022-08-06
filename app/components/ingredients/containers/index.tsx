import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';
import useContainers from '../../../hooks/use-containers';

import Container from './container';

const Containers: React.FC = (props) => {
  const { group, view } = useContext(ViewContext);
  const { containers, onContainerClick, onIngredientClick } = useContainers({
    group,
    view,
  });

  function renderContainers() {
    return containers.map((container) => (
      <Container
        onIngredientClick={onIngredientClick}
        container={container}
        key={container.id}
        onContainerClick={onContainerClick}
      />
    ));
  }

  return (
    <Wrapper>
      {containers.length > 0 ? renderContainers() : 'No ingredients imported.'}
    </Wrapper>
  );
};


export default Containers;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
`;
