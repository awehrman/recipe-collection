import { createGlobalStyle } from "styled-components";

export const theme = {
  colors: {
    lighterGrey: 'rgba(144, 148, 151, 1)',
    red: 'rgba(255, 99, 72, 1)',
    green: 'rgba(120, 224, 143, 1)',
    orange: 'rgba(255, 159, 67, 1)',
    highlight: 'rgba(128, 174, 245, 1)',

    menuBackground: 'rgba(43, 61, 90, 1)',
    menuColor: '#c7d7f9',

    headerBackground: 'rgba(248, 248, 248, 1)',
    headerColor: 'rgba(144, 148, 151, 1)',

    bodyText: 'rgba(34, 34, 34, 1)',

    altGreen: '#73C6B6',
    greenBackground: '#E8F8F5',
  },
  sizes: {
    tablet_small: '500px',
    tablet: '768px',
    desktop_small: '1024px',
    desktop_large: '1300px',

    mobileCardHeight: '300px',
    desktopCardHeight: '500px',

    menuWidth: '200px',
    menuOffset: '160px',
    minMenuWidth: '40px',

    mobileListHeight: '200px',
    desktopListHeight: '200px',

    desktopCardWidth: '880px',
  }
};

export const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    height: 100%;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  *:focus {
    outline: 2px dotted ${ theme.colors.highlight };
  }

  body {
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    font-family: 'Source Sans Pro', Verdana, sans-serif;
    font-weight: 400;
    font-size: 100%;
    color: ${ theme.colors.bodyText };
    height: 100%;
  }

  h2 {
    font-size: 1em;
    font-weight: 600;
  }
`;
