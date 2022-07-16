import React from 'react';
import styled from 'styled-components';

type ContainerProps = {
  container: {
    id: string;
    name: string;
  }
}

const Container: React.FC<ContainerProps> = ({ container }) => {
  return (
    <Wrapper>
      {/* Container Header */}
				<Header>
					{container.name}
					{/* TODO ref count */}
				</Header>
    </Wrapper>
  );
};

export default Container;

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