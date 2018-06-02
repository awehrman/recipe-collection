import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { NotificationContainer } from 'react-notifications';

import Navigation from './components/layout/Navigation';
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
	      	<Navigation />
					<NotificationContainer />

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
