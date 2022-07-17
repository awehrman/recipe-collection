import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';
import useContainers from '../../../hooks/use-containers';

import Container from './container';

const Containers: React.FC = () => {
  const { group, view } = useContext(ViewContext);
  const { containers } = useContainers({ group, view });

  console.log({ containers });

  function renderContainers() {
    return containers.map((container) => (
      <Container container={container} key={container.id} />
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
