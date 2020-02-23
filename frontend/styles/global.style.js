import { createGlobalStyle } from 'styled-components';
import styledNormalize from 'styled-normalize';
import theme from './theme.style';

export default createGlobalStyle`
  ${ styledNormalize }

	@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700');

	html {
	  box-sizing: border-box;
	  height: 100%;
	}

	*, *:before, *:after {
		box-sizing: inherit;
	}

	*:focus {
		/* for whatever reason its not picking up a passed props.theme value here */
		outline: 2px dotted rgba(128, 174, 245, 1);
	}

	body {
		-webkit-font-smoothing: antialiased;
	  margin: 0;
		padding: 0;
		font-family: "Source Sans Pro", Verdana, sans-serif;
		font-weight: 400;
		font-size: 100%;
		color: ${ theme.bodyText };
		height: 100%;
	}

	h2 {
		font-size: 1em;
		font-weight: 600;
	}
`;
