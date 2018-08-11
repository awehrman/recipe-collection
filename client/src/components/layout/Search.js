import React, { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import faSearch from '@fortawesome/fontawesome-pro-regular/faSearch';

import Button from '../form/Button';
import Input from '../form/Input';

import './Search.css';

class Search extends Component {
	constructor(props) {
		super(props);

		this.state = {
			data: [],
			initialView: 'all',
			isSearchDisplayed: false,
			searchValue: '',
			searchFields: {
				ingredients: [ 'name', 'plural', 'alternateNames' ],
				recipes: [ 'title', 'ingredients' ]
			},
		};

		this.onChange = this.onChange.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	componentDidMount() {
		const { view } = this.props;
		const { initialView } = this.state;

		if (view !== 'search' && view !== initialView) {
			this.setState({
				initialView: view
			});
		}
	}

	componentWillReceiveProps(props) {
		const { view } = this.props;
		const { initialView } = this.state;

		if (view !== 'search' && view !== initialView) {
			this.setState({
				initialView: view
			});
		}
	}

	// TODO swap this out with a smarter/faster search solution
	searchResults(searchValue) {
		let results = [ ];
		const { data, route } = this.props;
		let searchFields = [ ...this.state.searchFields[route] ];

		searchValue = searchValue.toLowerCase();

		results = data.filter(d => {
			for (let field in searchFields) {
				const searchField = searchFields[field]; // i.e. 'name'
				let fieldValue = (typeof d[searchField] === 'string') ? d[searchField].toLowerCase() : null; // i.e. 'yellow onion'

				switch(typeof d[searchField]) {
					case 'string':
						fieldValue = d[searchField].toLowerCase();
						// if this field has a value that contains our search term, include it in our filtered results
						if (fieldValue && (fieldValue.length > 0) && searchValue && (~fieldValue.indexOf(searchValue))) {
							return true;
						}
						break;
					case 'object':
						// go through each item in this array
						if (d[searchField] && d[searchField].length > 0) {
							if (d[searchField] && d[searchField].length > 0) {
								let temp = d[searchField].filter(v => v && (v.toLowerCase().indexOf(searchValue) > -1));
								if (temp && temp.length > 0) {
									return true;
								}
							}
						}
						break;
					default:
						break;
				}

				
			}

			return false
		});

		return results;
	}

	onChange(e) {
		const searchValue = e.target.value;
		let results = [];
		let view = this.state.initialView;

		// if we have a search value
		if (searchValue.length > 0) {
			// switch us into the search view
			view = 'search';

			// filter result set
			results = this.searchResults(searchValue);
		}

		this.setState({
			searchValue,
		}, () => this.props.updateView(view, null, results, searchValue));
	}

	onClick() {
		let { isSearchDisplayed } = this.state;

		if (!isSearchDisplayed) {
			// show the search field
			this.setState({
				isSearchDisplayed: !isSearchDisplayed
			});
		} else {
			// hide the search field
			this.setState({
				isSearchDisplayed: !isSearchDisplayed
			});
		}
	}

	render() {
		const { isSearchDisplayed, searchValue } = this.state;
		const { pageHeader } = this.props;

		return (
			<div className="search">
				{
					(isSearchDisplayed)
						? <Input
								autoFocus={ true }
								onChange={ this.onChange }
								placeholder={ `Search for ${pageHeader}` }
								ref={ el => this.searchField = el }
								value={ searchValue }
							/>
						: <h1>{ pageHeader }</h1>
				}
				<Button
					className="search"
					icon={ <FontAwesomeIcon icon={ faSearch } /> }
					onClick={ this.onClick }
				/>
			</div>
		);
	}
}

export default Search;