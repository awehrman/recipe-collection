import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";

import Navigation from './components/layout/Navigation';
import Dashboard from './components/pages/dashboard/Index';
import Import from './components/pages/import/Index';
import Ingredients from './components/pages/ingredients/Index';
import Recipes from './components/pages/recipes/Index';

import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isMenuExpanded: false
		};
	}

	toggleMenu(e) {
		const { isMenuExpanded } = this.state;
		this.setState({
			isMenuExpanded: !isMenuExpanded
		});
	}

  render() {
  	const { isMenuExpanded } = this.state;
  	const className = isMenuExpanded ? 'expanded' : '';

    return (
    	<Router>
    		<div className="canvas">
		      <div className={ `wrapper ${ className }` }>
		      	<Navigation
		      		className={ className }
		      		onMenuToggle={ e => this.toggleMenu(e) }
		      	/>
		      	
		      	<Route exact path="/" component={ Dashboard }/>
		      	<Route path="/import" component={ Import }/>
					  <Route path="/ingredients" component={ Ingredients } />
					  <Route path="/recipes" component={ Recipes }/>
			    </div>
			  </div>
		   </Router>
    );
  }
}

export default App;
