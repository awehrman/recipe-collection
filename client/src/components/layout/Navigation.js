import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faHome from '@fortawesome/fontawesome-pro-regular/faHome';
import faCloudDownload from '@fortawesome/fontawesome-pro-regular/faCloudDownload';
import faLemon from '@fortawesome/fontawesome-pro-regular/faLemon';
import faFolderOpen from '@fortawesome/fontawesome-pro-regular/faFolderOpen';

import './Navigation.css';

class Navigation extends Component {
  render() {
  	return (
			<nav>
				<ul>
			    <li>
			    	<Link to="/">
			    		<span>Home</span>
			    		<FontAwesomeIcon icon={ faHome } />
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/import">
			    		<span>Import</span>
			    		<FontAwesomeIcon icon={ faCloudDownload } />
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/ingredients">
			    		<span>Ingredients</span>
			    		<FontAwesomeIcon icon={ faLemon } />
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/recipes">
			    		<span>Recipes</span>
			    		<FontAwesomeIcon icon={ faFolderOpen } />
			    	</Link>
			    </li>
			  </ul>
			</nav>
		);
  }
}

export default Navigation;