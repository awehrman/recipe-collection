import React, { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faMagic from '@fortawesome/fontawesome-pro-regular/faMagic';

import './StylizedInput.css';

// TODO for extremely long values, we need to check if our input is longer than window.innerWidth
class StylizedInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	componentWillReceiveProps(nextProps) {
		const { isEditMode, label, value } = nextProps;

		let { isSuggestPlural } = this.state;
		isSuggestPlural = ((label === 'plural') && isEditMode && (value === ''));

		this.setState({
			isSuggestPlural
		}, this.updateWidth(this.stylizedContainer, this.input, 500, 'componentWillReceiveProps')); // start out with a large default width
	}

	componentDidMount() {
		const { isEditMode, label, value } = this.props;

		let { isSuggestPlural } = this.state;
		isSuggestPlural = ((label === 'plural') && isEditMode && (value === ''));

		this.setState({
			isSuggestPlural
		}, this.updateWidth(this.stylizedContainer, this.input, (label !== 'modal') ? 500 : 120, 'componentDidMount')); // start out with a large default width
	}

	componentDidUpdate() {
		this.updateWidth(this.stylizedContainer, this.input, this.span.clientWidth, 'componentDidUpdate'); // once the text has rendered, pass the actual width
	}

	updateWidth(stylizedContainer, input, width, caller) {
		const { placeholderWidth } = this.props;
		const { isSuggestPlural } = this.state;

		if (stylizedContainer && (width > 0)) {
			stylizedContainer.style.width = `${(isSuggestPlural) ? (width + 16) : (width + 3)}px`; // allow extra space for the pluralize icon
		} else {
			// adjust width for placeholder
			stylizedContainer.style.width = `${(isSuggestPlural) ? (placeholderWidth + 16) : placeholderWidth}px`; // allow extra space for the pluralize icon
		}

		if (input && (width > 0)) {
			input.style.width = `${(width + 3)}px`;
		} else {
			// adjust width for placeholder
			input.style.width = `${placeholderWidth}px`;
		}
	}

	render() {
		const { className, isEditMode, label, passesValidation, placeholder, value } = this.props;
		const { isSuggestPlural } = this.state;

		return (
			<div className={ `stylizedContainer ${className}` } ref={ el => this.stylizedContainer = el }>
				<input
					className={ `${(!passesValidation) ? 'warning' : ''}` }
					placeholder={ placeholder }
					type={ "text" }
					value={ value }
					onBlur={ e => this.props.onBlur(e) }
					onChange={ e => this.props.onChange(e, label) }
					onKeyDown={ e => this.props.onKeyDown(e) }
					onFocus={ e => e.preventDefault() }
					ref={ el => this.input = el }
					name={ label }
					disabled={ (isEditMode) ? false : true }
				/>
				{
					(isSuggestPlural)
						? <FontAwesomeIcon icon={ faMagic } onClick={ e => this.props.onSuggestPlural(e) } />
						: null
				}
				<span className={ `input-highlight ${(!passesValidation) ? 'warning' : ''}` }  ref={ el => this.span = el }>
		      { (value) ? value.replace(/ /g, "\u00a0") : null }
		    </span>
			</div>
		);
	}
}

export default StylizedInput;