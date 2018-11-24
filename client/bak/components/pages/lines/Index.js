import axios from 'axios';
import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';

import './Index.css';

class Index extends Component {
	constructor(props) {
		super(props);

		this.state = {
			lines: []
		};
	}

	componentDidMount() {
		console.log('componentDidMount');
    this.getLines();
  }

	getLines() {
		console.log('getLines');
		axios.get('/recipes/ingredientLines')
      .then(res => {
      	const lines = res.data.ingredientLines.map(l => l[1]);
      	this.setState({
      		lines
      	});
      	console.log(lines);
      })
      .catch(err => {
      	NotificationManager.error('', 'Could not get lines', 3000);
      });
	}

	render() {
		const { lines } = this.state;

		return (
			<article id="lines">
				<header>
					<h1>lines</h1>
				</header>
				<section>
					<ul>
						{ lines.map((i, j) => <li key={ `${j}_${i.reference}` }>
								{
									(i && i.values) ?
										i.values.map((v, k) => {
											return <span key={ `${j}_${i.reference}_${k}_${v.value}`} className={ v.type}>{ `${v.value} ` }</span>
										})
									: <span className='error'>{ i.reference }</span>
								}
						</li>) }
					</ul>
				</section>
			</article>
		);
	}
}

export default Index;