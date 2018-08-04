import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faHome from '@fortawesome/fontawesome-pro-regular/faHome';
import faCloudDownload from '@fortawesome/fontawesome-pro-regular/faCloudDownload';
import faLemon from '@fortawesome/fontawesome-pro-regular/faLemon';
import faFolderOpen from '@fortawesome/fontawesome-pro-regular/faFolderOpen';
import faEllipsisV from '@fortawesome/fontawesome-pro-regular/faEllipsisV';

import './Navigation.css';

class Navigation extends Component {
	constructor(props) {
    super(props);

    this.onMouseOver = this.onMouseOver.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

	componentDidMount() {
		this.navigation.addEventListener('mouseover', this.onMouseOver);
		this.navigation.addEventListener('mouseleave', this.onMouseLeave);
	}

	componentWillUnmount() {
		this.navigation.removeEventListener('mouseover', this.onMouseOver);
		this.navigation.removeEventListener('mouseleave', this.onMouseLeave);
	}

	onMouseOver(e) {
		if (window.innerWidth > 768) {
			const yPosition = ((e.clientY - 20) < 0) ? 20 : e.clientY - 10;
			// move the menu icon to whereever our cursor is
			this.menuIcon.style = `top: ${yPosition}px;`;

			// keep updating this anytime we move our mouse around the nav
			this.navigation.addEventListener('mousemove', this.onMouseOver);
		}
	}

	onMouseLeave() {
		// cleanup this event if we're not in the nav
		this.navigation.removeEventListener('mousemove', this.onMouseOver);

		// if we're in mobile, make sure we put our menu icon back at the top
		if (window.innerWidth > 768) {
			this.menuIcon.style = 'top: 20px';
		}
	}

  render() {
  	const { className } = this.props;

  	return (
			<nav className={ className } ref={ el => this.navigation = el }>
				<div className="menu-icon" onClick={ this.props.onMenuToggle } ref={ el => this.menuIcon = el }>
					<FontAwesomeIcon icon={ faEllipsisV } />
				</div>
				<ul>
			    <li>
			    	<Link to="/" onClick={ this.props.onMenuToggle }>
			    		<span className="svg"><FontAwesomeIcon icon={ faHome } /></span>
			    		<span>Home</span>
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/import" onClick={ this.props.onMenuToggle }>
			    		<span className="svg"><FontAwesomeIcon icon={ faCloudDownload } /></span>
			    		<span>Import</span>
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/ingredients" onClick={ this.props.onMenuToggle }>
			    		<span className="svg"><FontAwesomeIcon icon={ faLemon } /></span>
			    		<span>Ingredients</span>
			    	</Link>
			    </li>
			    <li>
			    	<Link to="/recipes" onClick={ this.props.onMenuToggle }>
			    		<span className="svg"><FontAwesomeIcon icon={ faFolderOpen } /></span>
			    		<span>Recipes</span>
			    	</Link>
			    </li>
			  </ul>
			</nav>
		);
  }
}

export default Navigation;