import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { NotificationContainer } from 'react-notifications';

import Dashboard from './components/pages/dashboard/Index';
import Import from './components/pages/import/Index';
import Ingredients from './components/pages/ingredients/Index';
import Recipes from './components/pages/recipes/Index';

import './App.css';

class App extends Component {
  render() {
    return (
    	<Router>
	      <div className="wrapper">
					<NotificationContainer />

					<ul>
		        <li>
		          <Link to="/">Dashboard</Link>
		        </li>
		        <li>
		          <Link to="/import">Import</Link>
		        </li>
		        <li>
		          <Link to="/ingredients">Ingredients</Link>
		        </li>
		        <li>
		          <Link to="/recipes">Recipes</Link>
		        </li>
		      </ul>

	      	<Route exact path="/" component={ Dashboard }/>
	      	<Route path="/import" component={ Import }/>
				  <Route path="/ingredients" component={ Ingredients } />
				  <Route path="/recipes" component={ Recipes }/>
		    </div>
		   </Router>
    );
  }
}

export default App;
