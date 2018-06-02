import React, { Component } from 'react';
//import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {

		return (
			<article id="import">
				<header>
					<h1>Import</h1>
				</header>
				<section>
					{/* TODO the evernote sdk doesn't support CORS and 
							my local dev setup needs some additional work so hack in this for now */}
					<iframe title="CORS Hack" src="http://localhost:3001/import"></iframe>
				</section>
			</article>
		);
	}
}

export default Index;