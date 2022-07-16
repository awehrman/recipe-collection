import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';
import useContainers from '../../../hooks/use-containers';

import Container from './container';

const Containers: React.FC = () => {
  const { group, view } = useContext(ViewContext);
  const { containers } = useContainers({ group, view });

  function renderContainers() {
    return containers.map((container) =>
      <Container container={container} key={container.id} />)
  }

  return (
    <Wrapper>
      {renderContainers()}
    </Wrapper>
  );
};

export default Containers;

const Wrapper = styled.div`
  display: flex;
	flex-wrap: wrap;
	margin: 20px 0;
`;