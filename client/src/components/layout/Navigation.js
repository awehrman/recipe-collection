import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

class Navigation extends Component {
  render() {
  	return (
			<nav>
				<ul>
			    <li><Link to="/">Home</Link></li>
			    <li><Link to="/import">Import</Link></li>
			    <li><Link to="/ingredients">Ingredients</Link></li>
			    <li><Link to="/recipes">Recipes</Link></li>
			  </ul>
			</nav>
		);
  }
}

export default Navigation;