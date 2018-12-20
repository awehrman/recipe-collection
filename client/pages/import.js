import { Component } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';

const ImportStyles = styled.article`

`;

class Import extends Component {
	render() {
		return (
			<ImportStyles>
				<Header pageHeader="Import" />
				<section>
				</section>
			</ImportStyles>
		);		
	}
}


export default Import;