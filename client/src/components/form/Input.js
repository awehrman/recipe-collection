import React, { Component } from 'react';

class Input extends Component {
	render() {
		const { autoFocus, className, id, placeholder, type, value } = this.props;
		return (
			<input
				autoFocus={ autoFocus }
				className={ className }
				id={ id }
				onBlur={ this.props.onBlur }
				onChange={ this.props.onChange }
				onClick={ this.props.onClick }
				onFocus={ this.props.onFocus }
				onKeyDown={ this.props.onKeyDown }
				placeholder={ placeholder }
				type={ type }
				value={ value }
			/>
		);
	}
}

export default Input;