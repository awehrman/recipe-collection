import { Component } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';

const DashboardStyles = styled.article`

`;

class Index extends Component {
	render() {
		return (
			<DashboardStyles>
				<Header pageHeader="Dashboard" />
				<section>
				</section>
			</DashboardStyles>
		);		
	}
}


export default Index;