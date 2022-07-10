import React from 'react';
import styled from 'styled-components';

const Loading = () => (
  <Icon>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </Icon>
);

const Icon = styled.div`
  display: inline-block;
  position: relative;
	right: 60px;
	top: 10px;

  div {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e5e5e5;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  div:nth-child(1) {
    left: 4px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  div:nth-child(2) {
    left: 4px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(3) {
    left: 28px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  div:nth-child(4) {
    left: 52px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }
`;

Loading.defaultProps = {};

Loading.displayName = 'Loading';

export default Loading;
