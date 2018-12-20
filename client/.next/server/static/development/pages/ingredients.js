module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/ErrorMessage.js":
/*!************************************!*\
  !*** ./components/ErrorMessage.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
var _jsxFileName = "/projects/recipe-collection/client/components/ErrorMessage.js";



var ErrorStyles = styled_components__WEBPACK_IMPORTED_MODULE_0___default.a.div.withConfig({
  displayName: "ErrorMessage__ErrorStyles",
  componentId: "sc-1ehr2yg-0"
})(["color:tomato;strong{padding-right:5px;}"]);

var DisplayError = function DisplayError(_ref) {
  var error = _ref.error;
  if (!error || !error.message) return null;

  if (error.networkError && error.networkError.result && error.networkError.result.errors.length) {
    return error.networkError.result.errors.map(function (error, i) {
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(ErrorStyles, {
        key: i,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 20
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", {
        "data-test": "graphql-error",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 21
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("strong", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 22
        },
        __self: this
      }, "An error occurred!"), error.message.replace('GraphQL error: ', '')));
    });
  }

  return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(ErrorStyles, {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", {
    "data-test": "graphql-error",
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31
    },
    __self: this
  }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("strong", {
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32
    },
    __self: this
  }, "An error occurred!"), error.message.replace('GraphQL error: ', '')));
};

DisplayError.defaultProps = {
  error: {}
};
DisplayError.propTypes = {
  error: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.object
};
/* harmony default export */ __webpack_exports__["default"] = (DisplayError);

/***/ }),

/***/ "./components/Header.js":
/*!******************************!*\
  !*** ./components/Header.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_1__);
var _jsxFileName = "/projects/recipe-collection/client/components/Header.js";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var HeaderStyles = styled_components__WEBPACK_IMPORTED_MODULE_1___default.a.div.withConfig({
  displayName: "Header__HeaderStyles",
  componentId: "iy4pru-0"
})(["background:", ";margin:0;display:flex;align-items:center;padding:40px;height:100px;h1{margin:0;font-weight:300;font-size:2em;color:", ";}"], function (props) {
  return props.theme.headerBackground;
}, function (props) {
  return props.theme.headerColor;
});

var Header =
/*#__PURE__*/
function (_Component) {
  _inherits(Header, _Component);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, _getPrototypeOf(Header).apply(this, arguments));
  }

  _createClass(Header, [{
    key: "render",
    value: function render() {
      var pageHeader = this.props.pageHeader;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(HeaderStyles, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 25
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: this
      }, pageHeader));
    }
  }]);

  return Header;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Header);

/***/ }),

/***/ "./components/form/Button.js":
/*!***********************************!*\
  !*** ./components/form/Button.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _jsxFileName = "/projects/recipe-collection/client/components/form/Button.js";


var Button = function Button(props) {
  return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("button", {
    className: props.className,
    type: props.type,
    onClick: props.onClick,
    id: props.id,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 4
    },
    __self: this
  }, props.icon, props.label);
};

/* harmony default export */ __webpack_exports__["default"] = (Button);

/***/ }),

/***/ "./components/form/CheckboxGroup.js":
/*!******************************************!*\
  !*** ./components/form/CheckboxGroup.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _jsxFileName = "/projects/recipe-collection/client/components/form/CheckboxGroup.js";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var CheckboxGroup =
/*#__PURE__*/
function (_Component) {
  _inherits(CheckboxGroup, _Component);

  function CheckboxGroup() {
    _classCallCheck(this, CheckboxGroup);

    return _possibleConstructorReturn(this, _getPrototypeOf(CheckboxGroup).apply(this, arguments));
  }

  _createClass(CheckboxGroup, [{
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = this.props,
          className = _this$props.className,
          isEditMode = _this$props.isEditMode,
          options = _this$props.options,
          type = _this$props.type;
      var keys = [],
          values = [];

      var _arr = Object.entries(options);

      for (var _i = 0; _i < _arr.length; _i++) {
        var _arr$_i = _slicedToArray(_arr[_i], 2),
            key = _arr$_i[0],
            value = _arr$_i[1];

        keys.push(key);
        values.push(value);
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("fieldset", {
        className: className,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 13
        },
        __self: this
      }, keys.map(function (k, i) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          key: k,
          className: type,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 17
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", {
          type: type,
          id: k,
          checked: values[i],
          onChange: isEditMode ? _this.props.onChange : function (e) {
            e.preventDefault();
          },
          value: k,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 18
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", {
          htmlFor: k,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 25
          },
          __self: this
        }, k));
      }));
    }
  }]);

  return CheckboxGroup;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (CheckboxGroup);

/***/ }),

/***/ "./components/form/Input.js":
/*!**********************************!*\
  !*** ./components/form/Input.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "@fortawesome/react-fontawesome");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faMagic__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/fontawesome-pro-regular/faMagic */ "@fortawesome/fontawesome-pro-regular/faMagic");
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faMagic__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_pro_regular_faMagic__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Suggestions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Suggestions */ "./components/form/Suggestions.js");
var _jsxFileName = "/projects/recipe-collection/client/components/form/Input.js";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }






var FieldSet = styled_components__WEBPACK_IMPORTED_MODULE_1___default.a.div.withConfig({
  displayName: "Input__FieldSet",
  componentId: "sc-13w928u-0"
})(["position:relative;width:380px;margin:20px 0;label{font-size:.875em;font-weight:600;color:#222;}.highlight{font-size:1em;user-select:none;line-height:1.2;border-top:3px solid ", ";position:absolute;left:0;bottom:0;max-width:100%;height:0;color:transparent;font-family:", ";overflow:hidden;}input{width:100%;min-width:100%;padding:8px 0;border-radius:0;line-height:1.2;background-color:transparent;color:#222;font-size:1em;border:none;outline:none;border-bottom:3px solid #ddd;font-family:", ";&::placeholder{font-style:italic;color:#ccc;}&:focus{+ .highlight{border-top:3px solid ", ";}}}.fa-magic{color:#ccc;cursor:pointer;width:13px;position:absolute;bottom:10px;right:0;&:hover{color:", ";}}"], function (props) {
  return props.theme.altGreen;
}, function (props) {
  return props.theme.fontFamily;
}, function (props) {
  return props.theme.fontFamily;
}, function (props) {
  return props.theme.highlight;
}, function (props) {
  return props.theme.altGreen;
});

var Input =
/*#__PURE__*/
function (_Component) {
  _inherits(Input, _Component);

  function Input(props) {
    var _this;

    _classCallCheck(this, Input);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Input).call(this, props));
    _this.state = {
      suggestions: [],
      currentSuggestion: -1
    };
    _this.onKeyDown = _this.onKeyDown.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onSelectSuggestion = _this.onSelectSuggestion.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(Input, [{
    key: "onSelectSuggestion",
    value: function onSelectSuggestion(e, suggestion) {
      this.setState({
        suggestions: [],
        currentSuggestion: -1
      }, this.props.onSelectSuggestion(this.props.name, suggestion));
    }
  }, {
    key: "onChange",
    value: function onChange(e) {
      var suggestions = [];
      var suggestionPool = this.props.suggestionPool;
      var value = e.target.value;

      if (value && value.length > 0 && suggestionPool) {
        suggestions = suggestionPool.filter(function (i) {
          return (// match on ingredient names
            i.name.indexOf(value) > -1 && // and its not the current value
            i.ingredientID !== value
          );
        });
        suggestions.sort(function (a, b) {
          return a.length - b.length;
        });
        suggestions = suggestions.slice(0, 5);
      }

      this.setState({
        suggestions: suggestions
      }, this.props.onChange(e));
    }
  }, {
    key: "onKeyDown",
    value: function onKeyDown(e) {
      // this doesn't work when focus moves to the first one; only only subsequent tabs thru the list
      var _this$state = this.state,
          suggestions = _this$state.suggestions,
          currentSuggestion = _this$state.currentSuggestion;
      var _this$props = this.props,
          name = _this$props.name,
          showSuggestions = _this$props.showSuggestions;

      if (e.key === 'Tab') {
        // only prevent tabbing if we're in an input component without suggestions
        // TODO need to re-enable this if we've selected a value
        if (showSuggestions) {
          e.preventDefault();
        }

        currentSuggestion = currentSuggestion < suggestions.length ? currentSuggestion + 1 : 0;
      }

      if (e.key === 'Enter') {
        e.preventDefault();

        if (showSuggestions) {
          if (suggestions[currentSuggestion]) {
            // accept suggestion
            this.props.onSelectSuggestion(e, suggestions[currentSuggestion]);
          } else {
            // accept new input
            this.props.onSelectSuggestion(e, {
              id: null,
              name: e.target.value
            });
          }

          suggestions = [];
          currentSuggestion = -1;
        } else {
          this.props.addToList(name, e.target.value);
        }
      }

      this.setState({
        suggestions: suggestions,
        currentSuggestion: currentSuggestion
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          autoFocus = _this$props2.autoFocus,
          label = _this$props2.label,
          name = _this$props2.name,
          required = _this$props2.required,
          placeholder = _this$props2.placeholder,
          showLabel = _this$props2.showLabel,
          showSuggestions = _this$props2.showSuggestions,
          suggestPlural = _this$props2.suggestPlural,
          tabIndex = _this$props2.tabIndex,
          value = _this$props2.value;
      var _this$state2 = this.state,
          currentSuggestion = _this$state2.currentSuggestion,
          suggestions = _this$state2.suggestions;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldSet, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 162
        },
        __self: this
      }, showLabel ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", {
        htmlFor: name,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 165
        },
        __self: this
      }, label) : null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", {
        autoFocus: autoFocus,
        autoComplete: "off",
        name: name,
        onBlur: this.props.onBlur,
        onChange: this.onChange,
        onKeyDown: this.onKeyDown,
        placeholder: placeholder,
        required: required,
        tabIndex: tabIndex,
        type: "text",
        value: value || '',
        __source: {
          fileName: _jsxFileName,
          lineNumber: 169
        },
        __self: this
      }), suggestPlural ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default.a, {
        icon: _fortawesome_fontawesome_pro_regular_faMagic__WEBPACK_IMPORTED_MODULE_3___default.a,
        onClick: function onClick(e) {
          return _this2.props.onSuggestPlural(e);
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 185
        },
        __self: this
      }) : null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
        className: "highlight",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 189
        },
        __self: this
      }, value && value.replace(/ /g, "\xA0")), showSuggestions ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Suggestions__WEBPACK_IMPORTED_MODULE_4__["default"], {
        onSelectSuggestion: this.onSelectSuggestion,
        value: value || '',
        currentSuggestion: currentSuggestion,
        suggestions: suggestions,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 195
        },
        __self: this
      }) : null);
    }
  }]);

  return Input;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]); // TODO add PropTypes


/* harmony default export */ __webpack_exports__["default"] = (Input);

/***/ }),

/***/ "./components/form/List.js":
/*!*********************************!*\
  !*** ./components/form/List.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "@fortawesome/react-fontawesome");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _fortawesome_fontawesome_pro_solid_faPlus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @fortawesome/fontawesome-pro-solid/faPlus */ "@fortawesome/fontawesome-pro-solid/faPlus");
/* harmony import */ var _fortawesome_fontawesome_pro_solid_faPlus__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_pro_solid_faPlus__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _fortawesome_fontawesome_pro_solid_faTimes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/fontawesome-pro-solid/faTimes */ "@fortawesome/fontawesome-pro-solid/faTimes");
/* harmony import */ var _fortawesome_fontawesome_pro_solid_faTimes__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_pro_solid_faTimes__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _Button__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Button */ "./components/form/Button.js");
/* harmony import */ var _Input__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Input */ "./components/form/Input.js");
var _jsxFileName = "/projects/recipe-collection/client/components/form/List.js";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }








var ListStyles = styled_components__WEBPACK_IMPORTED_MODULE_1___default.a.fieldset.withConfig({
  displayName: "List__ListStyles",
  componentId: "sc-17d9o75-0"
})(["border:0 !important;padding:0 !important;label{display:inline-block !important;}button.delete{cursor:pointer;background:white;margin-left:10px;padding:10px 20px;display:inline-block;color:tomato !important;border:0 !important;}button.add{display:inline-block;border:0;color:", ";text-decoration:underline;padding:0;margin:0 0 0 6px;background:transparent;cursor:pointer;svg{font-size:10px;margin-bottom:2px;}}button.add:hover{border-bottom:0 !important;}ul.list{list-style-type:none;margin:0;padding:0 !important;margin-bottom:4px;li{font-size:.8em;color:#222;line-height:1.6;button{font-size:1em;color:", ";line-height:1.6;font-weight:400;padding:4px 0 0;border:0;border-bottom:1px solid ", ";cursor:pointer;&:focus{outline:0;}}}}"], function (props) {
  return props.theme.altGreen;
}, function (props) {
  return props.theme.highlight;
}, function (props) {
  return props.theme.highlight;
});

var List =
/*#__PURE__*/
function (_Component) {
  _inherits(List, _Component);

  function List(props) {
    var _this;

    _classCallCheck(this, List);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(List).call(this, props));
    _this.state = {
      showInput: false,
      value: ''
    };
    _this.addToList = _this.addToList.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onBlur = _this.onBlur.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onChange = _this.onChange.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onDeleteClick = _this.onDeleteClick.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onSelectSuggestion = _this.onSelectSuggestion.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(List, [{
    key: "onAddToListClick",
    value: function onAddToListClick(e) {
      e.preventDefault();
      this.setState({
        showInput: true
      });
    }
  }, {
    key: "onBlur",
    value: function onBlur(e) {
      // re-hide the input if we click away
      if (!e.relatedTarget) {
        this.setState({
          showInput: false,
          value: ''
        });
      }
    }
  }, {
    key: "onChange",
    value: function onChange(e) {
      this.setState({
        value: e.target.value
      });
    }
  }, {
    key: "addToList",
    value: function addToList(list, item) {
      this.setState({
        showInput: false,
        value: ''
      }, this.props.onListChange(list, item));
    }
  }, {
    key: "onListItemClick",
    value: function onListItemClick(e, item) {
      e.preventDefault();
      this.props.onListItemClick(item);
    }
  }, {
    key: "onDeleteClick",
    value: function onDeleteClick(e, list, item) {
      e.preventDefault();
      this.props.onListChange(list, item, true);
    }
  }, {
    key: "onSelectSuggestion",
    value: function onSelectSuggestion(listName, suggestion) {
      this.setState({
        showInput: false,
        value: ''
      }, this.props.onListChange(listName, suggestion));
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          allowDelete = _this$props.allowDelete,
          isEditMode = _this$props.isEditMode,
          label = _this$props.label,
          list = _this$props.list,
          loading = _this$props.loading,
          name = _this$props.name,
          placeholder = _this$props.placeholder,
          showSuggestions = _this$props.showSuggestions,
          suggestionPool = _this$props.suggestionPool,
          type = _this$props.type;
      var _this$state = this.state,
          showInput = _this$state.showInput,
          value = _this$state.value;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ListStyles, {
        disabled: loading,
        "aria-busy": loading,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 147
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", {
        htmlFor: name,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 149
        },
        __self: this
      }, label),
      /* Add to List Button (+) */
      isEditMode ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button__WEBPACK_IMPORTED_MODULE_5__["default"], {
        className: "add",
        icon: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default.a, {
          icon: _fortawesome_fontawesome_pro_solid_faPlus__WEBPACK_IMPORTED_MODULE_3___default.a,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 155
          },
          __self: this
        }),
        type: "button",
        onClick: function onClick(e) {
          return _this2.onAddToListClick(e);
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 153
        },
        __self: this
      }) : null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
        className: "list",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 163
        },
        __self: this
      }, list.map(function (i) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, {
          key: i.id || i,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 166
          },
          __self: this
        }, type === 'link' ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button__WEBPACK_IMPORTED_MODULE_5__["default"], {
          className: "list",
          onClick: function onClick(e) {
            return _this2.onListItemClick(e, i);
          },
          label: i.name || i,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 169
          },
          __self: this
        }) : react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 174
          },
          __self: this
        }, i.name || i), allowDelete ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button__WEBPACK_IMPORTED_MODULE_5__["default"], {
          className: "delete",
          onClick: function onClick(e) {
            return _this2.onDeleteClick(e, name, i);
          },
          icon: react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_2___default.a, {
            icon: _fortawesome_fontawesome_pro_solid_faTimes__WEBPACK_IMPORTED_MODULE_4___default.a,
            __source: {
              fileName: _jsxFileName,
              lineNumber: 181
            },
            __self: this
          }),
          __source: {
            fileName: _jsxFileName,
            lineNumber: 178
          },
          __self: this
        }) : null);
      })),
      /* New List Item Input look into value assignment here*/
      showInput ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Input__WEBPACK_IMPORTED_MODULE_6__["default"], {
        addToList: this.addToList,
        autoFocus: true,
        onBlur: this.onBlur,
        onChange: this.onChange,
        onKeyDown: this.onKeyDown,
        name: name,
        required: false,
        placeholder: placeholder,
        showLabel: false,
        showSuggestions: showSuggestions,
        onSelectSuggestion: this.onSelectSuggestion,
        suggestionPool: suggestionPool,
        value: value,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 193
        },
        __self: this
      }) : null);
    }
  }]);

  return List;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (List);

/***/ }),

/***/ "./components/form/Suggestions.js":
/*!****************************************!*\
  !*** ./components/form/Suggestions.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_1__);
var _jsxFileName = "/projects/recipe-collection/client/components/form/Suggestions.js";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var SuggestionStyles = styled_components__WEBPACK_IMPORTED_MODULE_1___default.a.ul.withConfig({
  displayName: "Suggestions__SuggestionStyles",
  componentId: "sc-3bye1c-0"
})(["position:absolute;list-style-type:none;margin:0;padding:0;height:20px;overflow-y:hidden;margin-bottom:20px;a{color:", ";li{display:inline-block;padding:4px 10px;padding-left:0;font-size:.875em;}}a.active{color:", ";font-weight:600;}"], function (props) {
  return props.theme.altGreen;
}, function (props) {
  return props.theme.highlight;
}); // TODO tab thru suggestions

var Suggestions =
/*#__PURE__*/
function (_Component) {
  _inherits(Suggestions, _Component);

  function Suggestions() {
    _classCallCheck(this, Suggestions);

    return _possibleConstructorReturn(this, _getPrototypeOf(Suggestions).apply(this, arguments));
  }

  _createClass(Suggestions, [{
    key: "render",
    value: function render() {
      var _this = this;

      var suggestions = _toConsumableArray(this.props.suggestions);

      var _this$props = this.props,
          currentSuggestion = _this$props.currentSuggestion,
          value = _this$props.value;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(SuggestionStyles, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 38
        },
        __self: this
      }, value ? suggestions.map(function (s, index) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
          href: "#",
          key: s.id,
          onMouseDown: function onMouseDown(e) {
            return _this.props.onSelectSuggestion(e, s);
          },
          className: currentSuggestion === index ? 'active' : '',
          __source: {
            fileName: _jsxFileName,
            lineNumber: 42
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
          onClick: function onClick(e) {
            return _this.props.onSelectSuggestion(e, s);
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 43
          },
          __self: this
        }, s.name));
      }) : null);
    }
  }]);

  return Suggestions;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]); // TODO add PropTypes


/* harmony default export */ __webpack_exports__["default"] = (Suggestions);

/***/ }),

/***/ "./components/ingredients/CreateIngredient.js":
/*!****************************************************!*\
  !*** ./components/ingredients/CreateIngredient.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/regenerator */ "@babel/runtime/regenerator");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ "next/link");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-apollo */ "react-apollo");
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_apollo__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! graphql-tag */ "graphql-tag");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(graphql_tag__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var pluralize__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! pluralize */ "pluralize");
/* harmony import */ var pluralize__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(pluralize__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _form_Button__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../form/Button */ "./components/form/Button.js");
/* harmony import */ var _form_CheckboxGroup__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../form/CheckboxGroup */ "./components/form/CheckboxGroup.js");
/* harmony import */ var _ErrorMessage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../ErrorMessage */ "./components/ErrorMessage.js");
/* harmony import */ var _form_Input__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../form/Input */ "./components/form/Input.js");
/* harmony import */ var _form_List__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../form/List */ "./components/form/List.js");

var _jsxFileName = "/projects/recipe-collection/client/components/ingredients/CreateIngredient.js";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  mutation CREATE_INGREDIENT_MUTATION(\n\t\t$name: String!\n\t\t$plural: String\n\t\t$parentID: ID\n\t\t$parentName: String\n\t\t$properties: PropertyCreateInput!\n\t\t$alternateNames: [ String ]!\n\t\t$relatedIngredients: [ ID ]!\n\t\t$substitutes: [ ID ]!\n\t\t$references: [ ID ]!\n\t\t$isValidated: Boolean!\n  ) {\n    createIngredient(\n      name: $name\n      plural: $plural\n      parentID: $parentID\n      parentName: $parentName\n      properties: $properties\n      alternateNames: $alternateNames\n      relatedIngredients: $relatedIngredients\n      substitutes: $substitutes\n      references: $references\n      isValidated: $isValidated\n    ) {\n    \tid\n      name\n    }\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }












/*
	TODO
		- confirm parent submission success
		- alternateNames
		- relatedIngredients
		- substitutes
		- references

		- additional form validation needed
			- label name as required
			- warning if existing names are used and if will trigger merge
			- warning if parent ingredient is new
		- tabbing thru fields no longer registers
		- focus styling on plural field is broken
		- add success/error messaging
		- close this component once createIngredient is called
*/

var CREATE_INGREDIENT_MUTATION = graphql_tag__WEBPACK_IMPORTED_MODULE_4___default()(_templateObject());
var IngredientForm = styled_components__WEBPACK_IMPORTED_MODULE_5___default.a.form.withConfig({
  displayName: "CreateIngredient__IngredientForm",
  componentId: "nieevg-0"
})(["margin:20px 0;fieldset{border:0;border-bottom:2px solid #ccc;max-width:400px;label{display:block;font-size:.875em;padding-bottom:4px;font-weight:600;}}button{background:", ";border:0;border-radius:5px;padding:10px 20px;color:white;text-transform:uppercase;font-weight:600;font-size:1.025em;cursor:pointer;margin-top:20px;}.properties,.isValidated{border:0;padding-left:0;padding-right:0;color:#222;.checkbox{display:inline-block;& label{position:relative;padding-left:20px;margin-right:16px;font-weight:400;cursor:pointer;}& label::before{display:block;position:absolute;top:5px;left:0;width:11px;height:11px;border-radius:3px;background-color:white;border:1px solid #bbb;content:'';}}.checkbox:last-of-type{& label{padding-right:0;margin-right:0;}}input[type='checkbox']{border:1px solid green;position:absolute;top:0;left:0;width:0;height:0;opacity:0;pointer-events:none;display:none;&:checked + label::after{display:block;position:absolute;top:2px;left:1px;font-family:\"Font Awesome 5 Pro\";content:\"\f00c\";font-weight:900;color:", ";}}}"], function (props) {
  return props.theme.altGreen;
}, function (props) {
  return props.theme.altGreen;
});

var CreateIngredient =
/*#__PURE__*/
function (_Component) {
  _inherits(CreateIngredient, _Component);

  function CreateIngredient(props) {
    var _this;

    _classCallCheck(this, CreateIngredient);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(CreateIngredient).call(this, props));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handleChange", function (e) {
      var _e$target = e.target,
          name = _e$target.name,
          value = _e$target.value;

      _this.setState(_defineProperty({}, name, value));
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "handleListChange", function (list, item) {
      var toRemove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var currentList = _toConsumableArray(_this.state[list]);

      var index = currentList.indexOf(item);

      if (toRemove && index > -1) {
        currentList.splice(index, 1);
      } else if (index === -1) {
        currentList.push(item);
      }

      _this.setState(_defineProperty({}, list, currentList));
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "createIngredient",
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.mark(function _callee(e, mutation) {
        var relatedIngredients, substitutes, references, res;
        return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_0___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                e.preventDefault(); // clean up complex list structures so that we're only feeding an array of IDs

                relatedIngredients = _toConsumableArray(_this.state.relatedIngredients);
                relatedIngredients = relatedIngredients.map(function (r) {
                  return r.id;
                });
                substitutes = _toConsumableArray(_this.state.substitutes);
                substitutes = substitutes.map(function (r) {
                  return r.id;
                });
                references = _toConsumableArray(_this.state.references);
                references = references.map(function (r) {
                  return r.id;
                }); // override the complex lists on the mutation

                _context.next = 9;
                return mutation({
                  variables: {
                    relatedIngredients: relatedIngredients,
                    substitutes: substitutes,
                    references: references
                  }
                });

              case 9:
                res = _context.sent;
                console.log(res);

                _this.setState({
                  name: '',
                  plural: '',
                  parentID: null,
                  parentName: '',
                  properties: {
                    meat: false,
                    poultry: false,
                    fish: false,
                    dairy: false,
                    soy: false,
                    gluten: false
                  },
                  alternateNames: [],
                  relatedIngredients: [],
                  substitutes: [],
                  references: [],
                  isValidated: false
                }, _this.props.refreshContainers(e, _this.props.populateContainers, _this.props.ingredientCounts));

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _this.state = {
      name: '',
      plural: '',
      parentID: null,
      parentName: '',
      properties: {
        meat: false,
        poultry: false,
        fish: false,
        dairy: false,
        soy: false,
        gluten: false
      },
      alternateNames: [],
      relatedIngredients: [],
      substitutes: [],
      references: [],
      isValidated: false
    };
    _this.onCheckboxChange = _this.onCheckboxChange.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onValidatedChange = _this.onValidatedChange.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onSuggestPlural = _this.onSuggestPlural.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onSelectParent = _this.onSelectParent.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(CreateIngredient, [{
    key: "onCheckboxChange",
    value: function onCheckboxChange(e) {
      var properties = _objectSpread({}, this.state.properties);

      Object.entries(properties).forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            key = _ref3[0],
            value = _ref3[1];

        if (key === e.target.value) {
          properties[key] = !value;
        }
      });
      this.setState({
        properties: properties
      });
    }
  }, {
    key: "onValidatedChange",
    value: function onValidatedChange(e) {
      var isValidated = this.state.isValidated;
      isValidated = !isValidated;
      this.setState({
        isValidated: isValidated
      });
    }
  }, {
    key: "onSuggestPlural",
    value: function onSuggestPlural(e) {
      e.preventDefault();
      var name = this.state.name;
      var plural = name ? pluralize__WEBPACK_IMPORTED_MODULE_6___default()(name) : '';
      this.setState({
        plural: plural
      });
    }
  }, {
    key: "onSelectParent",
    value: function onSelectParent(e, suggestion) {
      e.preventDefault();
      var parentID = suggestion.id;
      var parentName = suggestion.name;
      this.setState({
        parentID: parentID,
        parentName: parentName
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$state = this.state,
          alternateNames = _this$state.alternateNames,
          isValidated = _this$state.isValidated,
          name = _this$state.name,
          parentID = _this$state.parentID,
          parentName = _this$state.parentName,
          plural = _this$state.plural,
          properties = _this$state.properties,
          relatedIngredients = _this$state.relatedIngredients,
          substitutes = _this$state.substitutes;
      var ingredients = this.props.ingredients;
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_3__["Mutation"], {
        mutation: CREATE_INGREDIENT_MUTATION,
        variables: this.state,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 297
        },
        __self: this
      }, function (createIngredient, _ref4) {
        var loading = _ref4.loading,
            error = _ref4.error,
            data = _ref4.data;
        if (loading) return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("p", {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 300
          },
          __self: this
        }, "Loading...");
        if (error) return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_ErrorMessage__WEBPACK_IMPORTED_MODULE_9__["default"], {
          error: error,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 301
          },
          __self: this
        });
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(IngredientForm, {
          onSubmit: function onSubmit(e) {
            return _this2.createIngredient(e, createIngredient);
          },
          autoComplete: "off",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 304
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_Input__WEBPACK_IMPORTED_MODULE_10__["default"], {
          label: "Name",
          name: "name",
          onChange: _this2.handleChange,
          required: true,
          placeholder: "fuji apple",
          showLabel: true,
          value: name,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 305
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_Input__WEBPACK_IMPORTED_MODULE_10__["default"], {
          label: "Plural",
          name: "plural",
          onChange: _this2.handleChange,
          required: false,
          placeholder: "fuji apples",
          showLabel: true,
          suggestPlural: true,
          onSuggestPlural: _this2.onSuggestPlural,
          value: plural,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 316
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_CheckboxGroup__WEBPACK_IMPORTED_MODULE_8__["default"], {
          className: "properties",
          isEditMode: true,
          onChange: _this2.onCheckboxChange,
          options: properties,
          type: "checkbox",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 328
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_Input__WEBPACK_IMPORTED_MODULE_10__["default"], {
          label: "Parent Ingredient",
          name: "parentName",
          onChange: _this2.handleChange,
          required: false,
          placeholder: "apple",
          showLabel: true,
          value: parentName,
          showSuggestions: true,
          onSelectSuggestion: _this2.onSelectParent,
          suggestionPool: ingredients,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 336
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_List__WEBPACK_IMPORTED_MODULE_11__["default"], {
          allowDelete: true,
          isEditMode: true,
          label: "Alternate Names",
          list: alternateNames,
          loading: false,
          name: "alternateNames",
          onListChange: _this2.handleListChange,
          placeholder: "fuji",
          required: false,
          showLabel: false,
          showSuggestions: false,
          type: "static",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 349
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_List__WEBPACK_IMPORTED_MODULE_11__["default"], {
          allowDelete: true,
          isEditMode: true,
          label: "Related Ingredients",
          list: relatedIngredients,
          loading: false,
          name: "relatedIngredients",
          onListChange: _this2.handleListChange,
          placeholder: "red apple",
          required: false,
          showLabel: false,
          showSuggestions: true,
          suggestionPool: ingredients,
          type: "static",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 364
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_List__WEBPACK_IMPORTED_MODULE_11__["default"], {
          allowDelete: true,
          isEditMode: true,
          label: "Substitutes",
          list: substitutes,
          loading: false,
          name: "substitutes",
          onListChange: _this2.handleListChange,
          placeholder: "red apple",
          required: false,
          showLabel: false,
          showSuggestions: true,
          suggestionPool: ingredients,
          type: "static",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 380
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_CheckboxGroup__WEBPACK_IMPORTED_MODULE_8__["default"], {
          className: "isValidated",
          isEditMode: true,
          onChange: _this2.onValidatedChange,
          options: {
            "Is Valid Ingredient?": isValidated
          },
          type: "checkbox",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 396
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(_form_Button__WEBPACK_IMPORTED_MODULE_7__["default"], {
          type: "submit",
          label: "Add Ingredient",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 404
          },
          __self: this
        }));
      });
    }
  }]);

  return CreateIngredient;
}(react__WEBPACK_IMPORTED_MODULE_1__["Component"]); // TODO add PropTypes


/* harmony default export */ __webpack_exports__["default"] = (CreateIngredient);

/***/ }),

/***/ "./components/ingredients/IngredientCard.js":
/*!**************************************************!*\
  !*** ./components/ingredients/IngredientCard.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "next/link");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_2__);
var _jsxFileName = "/projects/recipe-collection/client/components/ingredients/IngredientCard.js";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var CardStyles = styled_components__WEBPACK_IMPORTED_MODULE_2___default.a.div.withConfig({
  displayName: "IngredientCard__CardStyles",
  componentId: "wou9tg-0"
})(["max-height:", ";padding:20px;border-bottom:1px solid #ddd;width:100%;@media (min-width:880px){flex-basis:70%;flex-grow:2;order:1;height:", ";border-left:1px solid #ddd;}"], function (props) {
  return props.theme.mobileCardHeight;
}, function (props) {
  return props.theme.desktopCardHeight;
});

var IngredientCard =
/*#__PURE__*/
function (_Component) {
  _inherits(IngredientCard, _Component);

  function IngredientCard() {
    _classCallCheck(this, IngredientCard);

    return _possibleConstructorReturn(this, _getPrototypeOf(IngredientCard).apply(this, arguments));
  }

  _createClass(IngredientCard, [{
    key: "render",
    value: function render() {
      var currentIngredientID = this.props.currentIngredientID;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CardStyles, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 26
        },
        __self: this
      }, "Card ", currentIngredientID);
    }
  }]);

  return IngredientCard;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (IngredientCard);

/***/ }),

/***/ "./components/ingredients/IngredientsContainer.js":
/*!********************************************************!*\
  !*** ./components/ingredients/IngredientsContainer.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "next/link");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _IngredientCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./IngredientCard */ "./components/ingredients/IngredientCard.js");
var _jsxFileName = "/projects/recipe-collection/client/components/ingredients/IngredientsContainer.js";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }





var ContainerStyles = styled_components__WEBPACK_IMPORTED_MODULE_2___default.a.div.withConfig({
  displayName: "IngredientsContainer__ContainerStyles",
  componentId: "xn814v-0"
})(["margin-bottom:16px;display:flex;flex-wrap:wrap;"]);
var IngredientsList = styled_components__WEBPACK_IMPORTED_MODULE_2___default.a.ul.withConfig({
  displayName: "IngredientsContainer__IngredientsList",
  componentId: "xn814v-1"
})(["flex-basis:100%;margin:0;list-style-type:none;line-height:1.4;padding:10px;.hidden{display:none;}li a{text-decoration:none;color:#222;&:hover{color:", ";}}@media (min-width:500px){column-count:2;column-gap:16px;}@media (min-width:700px){column-count:3;}@media (min-width:900px){column-count:4;}@media (min-width:1100px){column-count:5;}"], function (props) {
  return props.theme.highlight;
});
var ContainerHeader = styled_components__WEBPACK_IMPORTED_MODULE_2___default.a.div.withConfig({
  displayName: "IngredientsContainer__ContainerHeader",
  componentId: "xn814v-2"
})(["flex-basis:100%;font-size:1.2em;padding-bottom:16px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;cursor:pointer;&.hidden{display:none;}.count{color:", ";text-align:right;}"], function (props) {
  return props.theme.lighterGrey;
});
var Message = styled_components__WEBPACK_IMPORTED_MODULE_2___default.a.div.withConfig({
  displayName: "IngredientsContainer__Message",
  componentId: "xn814v-3"
})(["font-style:italic;padding:20px 0;"]);

var IngredientsContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(IngredientsContainer, _Component);

  function IngredientsContainer() {
    _classCallCheck(this, IngredientsContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(IngredientsContainer).apply(this, arguments));
  }

  _createClass(IngredientsContainer, [{
    key: "render",
    value: function render() {
      var _this = this;

      var className = this.props.className;
      var _this$props$container = this.props.container,
          currentIngredientID = _this$props$container.currentIngredientID,
          ingredients = _this$props$container.ingredients,
          isCardEnabled = _this$props$container.isCardEnabled,
          label = _this$props$container.label,
          message = _this$props$container.message;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ContainerStyles, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 80
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Message, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 82
        },
        __self: this
      }, message), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ContainerHeader, {
        onClick: this.props.onContainerClick,
        className: message !== '' ? 'hidden' : '',
        __source: {
          fileName: _jsxFileName,
          lineNumber: 87
        },
        __self: this
      }, label, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
        className: "count",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 89
        },
        __self: this
      }, ingredients.length)), isCardEnabled ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_IngredientCard__WEBPACK_IMPORTED_MODULE_3__["default"], {
        currentIngredientID: currentIngredientID,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 95
        },
        __self: this
      }) : null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(IngredientsList, {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 99
        },
        __self: this
      },
      /* TODO check against the current ingredient to see if we need to pass an id or clear it out */
      ingredients.map(function (i) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
          key: "".concat(label, "_").concat(i.id),
          className: className,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 102
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
          href: {
            pathname: '/ingredients',
            query: {
              id: i.id
            }
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 103
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
          onClick: _this.props.onIngredientClick,
          id: i.id,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 104
          },
          __self: this
        }, i.name)));
      })));
    }
  }]);

  return IngredientsContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (IngredientsContainer);

/***/ }),

/***/ "./lib/util.js":
/*!*********************!*\
  !*** ./lib/util.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getNextIngredientGroup; });
function getNextIngredientGroup(currentGroup) {
  var GROUP_BY = ['name', 'property', 'count', 'relationship'];
  var groupIndex = GROUP_BY.findIndex(function (g) {
    return g === currentGroup;
  });
  var next = groupIndex !== GROUP_BY.length - 1 ? GROUP_BY[groupIndex + 1] : GROUP_BY[0];
  return next;
}

/***/ }),

/***/ "./pages/ingredients.js":
/*!******************************!*\
  !*** ./pages/ingredients.js ***!
  \******************************/
/*! exports provided: default, ALL_INGREDIENTS_QUERY, LOCAL_INGREDIENTS_QUERY, LOCAL_INGREDIENTS_MUTATION, POPULATE_CONTAINERS_QUERY */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ALL_INGREDIENTS_QUERY", function() { return ALL_INGREDIENTS_QUERY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOCAL_INGREDIENTS_QUERY", function() { return LOCAL_INGREDIENTS_QUERY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOCAL_INGREDIENTS_MUTATION", function() { return LOCAL_INGREDIENTS_MUTATION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "POPULATE_CONTAINERS_QUERY", function() { return POPULATE_CONTAINERS_QUERY; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-apollo */ "react-apollo");
/* harmony import */ var react_apollo__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_apollo__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_adopt__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-adopt */ "react-adopt");
/* harmony import */ var react_adopt__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_adopt__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! graphql-tag */ "graphql-tag");
/* harmony import */ var graphql_tag__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(graphql_tag__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/link */ "next/link");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ "next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styled-components */ "styled-components");
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "@fortawesome/react-fontawesome");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faPlus__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @fortawesome/fontawesome-pro-regular/faPlus */ "@fortawesome/fontawesome-pro-regular/faPlus");
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faPlus__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_pro_regular_faPlus__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _lib_util__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../lib/util */ "./lib/util.js");
/* harmony import */ var _components_ErrorMessage__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components/ErrorMessage */ "./components/ErrorMessage.js");
/* harmony import */ var _components_Header__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../components/Header */ "./components/Header.js");
/* harmony import */ var _components_ingredients_IngredientsContainer__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../components/ingredients/IngredientsContainer */ "./components/ingredients/IngredientsContainer.js");
/* harmony import */ var _components_ingredients_CreateIngredient__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../components/ingredients/CreateIngredient */ "./components/ingredients/CreateIngredient.js");
var _jsxFileName = "/projects/recipe-collection/client/pages/ingredients.js";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject6() {
  var data = _taggedTemplateLiteral(["\n  mutation updateContainer($container: Container, $ingredientID: ID) {\n    updateContainer(container: $container, ingredientID: $ingredientID) @client\n  }\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = _taggedTemplateLiteral(["\n  mutation updateConfig($view: String, $group: String, $isCreateEnabled: Boolean) {\n    updateConfig(view: $view, group: $group, isCreateEnabled: $isCreateEnabled) @client\n  }\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["\n\tquery POPULATE_CONTAINERS_QUERY($view: String!, $group: String!) {\n\t\tcontainers(view: $view, group: $group) {\n\t\t\tid\n\t\t\tlabel\n\t\t\tingredients {\n\t\t\t\tid\n\t\t\t\tname\n\t\t\t\tproperties {\n\t\t\t\t\tmeat\n\t\t\t\t  poultry\n\t\t\t\t  fish\n\t\t\t\t  dairy\n\t\t\t\t  soy\n\t\t\t\t  gluten\n\t\t\t\t}\n\t\t\t\tparent {\n\t\t\t\t\tid\n\t\t\t\t}\n\t\t\t\tisValidated\n\t\t\t}\n\t\t\tmessage\n\t\t\tisExpanded @client\n\t\t\tisCardEnabled @client\n\t\t\tcurrentIngredientID @client\n\t\t}\n\t}\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n  query ALL_INGREDIENTS_QUERY {\n  \tingredients {\n  \t\tid\n  \t\tname\n  \t}\n  }\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  query INGREDIENT_COUNTS_QUERY {\n  \tcounts {\n\t  \tingredients\n\t\t\tnewIngredients\n\t\t}\n  }\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  query {\n  \tcurrentView @client \n  \tcurrentGroup @client \n  \tisCreateEnabled @client\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }








 // TODO there's a pretty bad case of FOUT in next






 // TODO - not sure where this check goes, but need to look for any query params on load to assign the correct view
// not sure if this is supposed to go into getInitialProps or if i can still use an old school react lifecycle method

/*----------  Queries & Mutations  ----------*/

var LOCAL_INGREDIENTS_QUERY = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject());
var INGREDIENT_COUNTS_QUERY = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject2()); // TODO may need to add in plural, altNames, and property values here

var ALL_INGREDIENTS_QUERY = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject3());
var POPULATE_CONTAINERS_QUERY = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject4());
var LOCAL_INGREDIENTS_MUTATION = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject5());
var UPDATE_CONTAINER_MUTATION = graphql_tag__WEBPACK_IMPORTED_MODULE_3___default()(_templateObject6());
var Composed = Object(react_adopt__WEBPACK_IMPORTED_MODULE_2__["adopt"])({
  localState: function localState(_ref) {
    var render = _ref.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Query"], {
      query: LOCAL_INGREDIENTS_QUERY,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 93
      },
      __self: this
    }, render);
  },
  // use either the view/group from the url if we have it, or the defaults in cache
  populateContainers: function populateContainers(_ref2) {
    var queryView = _ref2.queryView,
        queryGroup = _ref2.queryGroup,
        localState = _ref2.localState,
        render = _ref2.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Query"], {
      query: POPULATE_CONTAINERS_QUERY,
      variables: {
        view: queryView || localState.data.currentView,
        group: queryGroup || localState.data.currentGroup
      },
      __source: {
        fileName: _jsxFileName,
        lineNumber: 95
      },
      __self: this
    }, render);
  },
  ingredientCounts: function ingredientCounts(_ref3) {
    var render = _ref3.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Query"], {
      query: INGREDIENT_COUNTS_QUERY,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96
      },
      __self: this
    }, render);
  },
  updateLocal: function updateLocal(_ref4) {
    var render = _ref4.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Mutation"], {
      mutation: LOCAL_INGREDIENTS_MUTATION,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 97
      },
      __self: this
    }, render);
  },
  updateContainer: function updateContainer(_ref5) {
    var render = _ref5.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Mutation"], {
      mutation: UPDATE_CONTAINER_MUTATION,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 98
      },
      __self: this
    }, render);
  },
  getIngredients: function getIngredients(_ref6) {
    var render = _ref6.render;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_apollo__WEBPACK_IMPORTED_MODULE_1__["Query"], {
      query: ALL_INGREDIENTS_QUERY,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 99
      },
      __self: this
    }, render);
  }
});
/*----------  Local Styles  ----------*/

var IngredientsPageStyles = styled_components__WEBPACK_IMPORTED_MODULE_6___default.a.article.withConfig({
  displayName: "ingredients__IngredientsPageStyles",
  componentId: "nx83r1-0"
})([""]);
var Containers = styled_components__WEBPACK_IMPORTED_MODULE_6___default.a.div.withConfig({
  displayName: "ingredients__Containers",
  componentId: "nx83r1-1"
})(["margin:20px 0;"]);
var Filters = styled_components__WEBPACK_IMPORTED_MODULE_6___default.a.div.withConfig({
  displayName: "ingredients__Filters",
  componentId: "nx83r1-2"
})(["display:flex;font-size:.875em;color:#222;.left{flex:1;a{text-decoration:none;margin-right:20px;color:#222;+.new{color:", ";}}a.active{font-weight:600;}}.right{flex:1;text-align:right;font-weight:600;a{text-decoration:none;margin-left:16px;text-transform:capitalize;color:", ";font-size:1em;padding:0;cursor:pointer;background:white;outline:0;}}"], function (props) {
  return props.theme.highlight;
}, function (props) {
  return props.theme.lighterGrey;
});
var AddNewIngredient = styled_components__WEBPACK_IMPORTED_MODULE_6___default.a.div.withConfig({
  displayName: "ingredients__AddNewIngredient",
  componentId: "nx83r1-3"
})(["background:", ";padding:16px;padding-left:40px;position:fixed;bottom:0;left:0px;right:0px;span{cursor:pointer;text-decoration:none;color:", ";font-size:16px;font-weight:600;.fa-plus{height:18px;margin-right:10px;}}@media (min-width:", "){left:40px;}"], function (props) {
  return props.theme.greenBackground;
}, function (props) {
  return props.theme.altGreen;
}, function (props) {
  return props.theme.tablet;
});
/*----------  Ingredients Component  ----------*/

var Ingredients =
/*#__PURE__*/
function (_Component) {
  _inherits(Ingredients, _Component);

  function Ingredients() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Ingredients);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Ingredients)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {});

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleContainer", function (e, container, updateContainersMutation) {
      e.preventDefault();
      container.isExpanded = !container.isExpanded;
      updateContainersMutation({
        variables: {
          container: container
        }
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "toggleIngredient", function (e, container, updateContainersMutation) {
      // TODO if we're closing out of an opened card; we need to adjust the link query
      var ingredientID = e.target.id;
      container.isCardEnabled = !container.isCardEnabled;
      updateContainersMutation({
        variables: {
          container: container,
          ingredientID: ingredientID
        }
      });
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "refreshContainers", function (e, populateContainers, ingredientCounts) {
      populateContainers.refetch();
      ingredientCounts.refetch();
    });

    return _this;
  }

  _createClass(Ingredients, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Composed, {
        queryView: this.props.query.view,
        queryGroup: this.props.query.group,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 207
        },
        __self: this
      }, function (_ref7) {
        var localState = _ref7.localState,
            populateContainers = _ref7.populateContainers,
            ingredientCounts = _ref7.ingredientCounts,
            updateLocal = _ref7.updateLocal,
            updateContainer = _ref7.updateContainer,
            getIngredients = _ref7.getIngredients;
        var _localState$data = localState.data,
            currentGroup = _localState$data.currentGroup,
            currentView = _localState$data.currentView,
            isCreateEnabled = _localState$data.isCreateEnabled;

        var _ref8 = populateContainers.data || {},
            containers = _ref8.containers;

        var _ref9 = populateContainers.data || {},
            loading = _ref9.loading,
            error = _ref9.error;

        var _ref10 = ingredientCounts.data || {},
            counts = _ref10.counts;

        var _ref11 = getIngredients.data || {},
            ingredients = _ref11.ingredients; // use the query params in the url if we have them


        currentGroup = _this2.props.query.group || currentGroup;
        currentView = _this2.props.query.view || currentView; // TODO expand loading and error messages for all queries/mutations

        currentGroup = currentGroup || 'name';
        currentView = currentView || 'all';
        if (loading) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 225
          },
          __self: this
        }, "Loading...");
        if (error) return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ErrorMessage__WEBPACK_IMPORTED_MODULE_10__["default"], {
          error: error,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 226
          },
          __self: this
        });
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(IngredientsPageStyles, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 229
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_Header__WEBPACK_IMPORTED_MODULE_11__["default"], {
          pageHeader: "Ingredients",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 230
          },
          __self: this
        }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("section", {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 231
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Filters, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 232
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "left",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 234
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_4___default.a, {
          href: {
            pathname: '/ingredients',
            query: {
              view: 'all',
              group: currentGroup
            }
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 235
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
          className: currentView === 'all' ? 'active' : '',
          onClick: function onClick(e) {
            return updateLocal({
              variables: {
                view: 'all'
              }
            });
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 236
          },
          __self: this
        }, "View".concat('\xa0', "All", '\xa0', counts ? counts.ingredients : 0))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_4___default.a, {
          href: {
            pathname: '/ingredients',
            query: {
              view: 'new',
              group: currentGroup
            }
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 241
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
          className: currentView === 'new' ? 'active' : '',
          onClick: function onClick(e) {
            return updateLocal({
              variables: {
                view: 'new'
              }
            });
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 242
          },
          __self: this
        }, "Newly".concat('\xa0', "Imported", '\xa0', counts ? counts.newIngredients : 0)))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "right",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 249
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "groupBy",
          __source: {
            fileName: _jsxFileName,
            lineNumber: 250
          },
          __self: this
        }, "Group By", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_4___default.a, {
          href: {
            pathname: '/ingredients',
            query: {
              view: currentView,
              group: Object(_lib_util__WEBPACK_IMPORTED_MODULE_9__["default"])(currentGroup)
            }
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 252
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
          onClick: function onClick(e) {
            return updateLocal({
              variables: {
                view: currentView,
                group: Object(_lib_util__WEBPACK_IMPORTED_MODULE_9__["default"])(currentGroup)
              }
            });
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 253
          },
          __self: this
        }, currentGroup.charAt(0).toUpperCase() + currentGroup.substr(1)))))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Containers, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 259
          },
          __self: this
        }, containers && containers.map(function (c) {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ingredients_IngredientsContainer__WEBPACK_IMPORTED_MODULE_12__["default"], {
            key: c.label,
            className: !c.isExpanded ? 'hidden' : '',
            container: c,
            onContainerClick: function onContainerClick(e) {
              return _this2.toggleContainer(e, c, updateContainer);
            },
            onIngredientClick: function onIngredientClick(e) {
              return _this2.toggleIngredient(e, c, updateContainer);
            },
            __source: {
              fileName: _jsxFileName,
              lineNumber: 262
            },
            __self: this
          });
        })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(AddNewIngredient, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 273
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
          onClick: function onClick(e) {
            return updateLocal({
              variables: {
                isCreateEnabled: !isCreateEnabled
              }
            });
          },
          __source: {
            fileName: _jsxFileName,
            lineNumber: 274
          },
          __self: this
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_7___default.a, {
          icon: _fortawesome_fontawesome_pro_regular_faPlus__WEBPACK_IMPORTED_MODULE_8___default.a,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 275
          },
          __self: this
        }), " Add Ingredient"), isCreateEnabled ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_ingredients_CreateIngredient__WEBPACK_IMPORTED_MODULE_13__["default"], {
          ingredientCounts: ingredientCounts,
          ingredients: ingredients,
          populateContainers: populateContainers,
          refreshContainers: _this2.refreshContainers,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 279
          },
          __self: this
        }) : null)));
      });
    }
  }]);

  return Ingredients;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Ingredients);


/***/ }),

/***/ 3:
/*!************************************!*\
  !*** multi ./pages/ingredients.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./pages/ingredients.js */"./pages/ingredients.js");


/***/ }),

/***/ "@babel/runtime/regenerator":
/*!*********************************************!*\
  !*** external "@babel/runtime/regenerator" ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@babel/runtime/regenerator");

/***/ }),

/***/ "@fortawesome/fontawesome-pro-regular/faMagic":
/*!***************************************************************!*\
  !*** external "@fortawesome/fontawesome-pro-regular/faMagic" ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/fontawesome-pro-regular/faMagic");

/***/ }),

/***/ "@fortawesome/fontawesome-pro-regular/faPlus":
/*!**************************************************************!*\
  !*** external "@fortawesome/fontawesome-pro-regular/faPlus" ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/fontawesome-pro-regular/faPlus");

/***/ }),

/***/ "@fortawesome/fontawesome-pro-solid/faPlus":
/*!************************************************************!*\
  !*** external "@fortawesome/fontawesome-pro-solid/faPlus" ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/fontawesome-pro-solid/faPlus");

/***/ }),

/***/ "@fortawesome/fontawesome-pro-solid/faTimes":
/*!*************************************************************!*\
  !*** external "@fortawesome/fontawesome-pro-solid/faTimes" ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/fontawesome-pro-solid/faTimes");

/***/ }),

/***/ "@fortawesome/react-fontawesome":
/*!*************************************************!*\
  !*** external "@fortawesome/react-fontawesome" ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@fortawesome/react-fontawesome");

/***/ }),

/***/ "graphql-tag":
/*!******************************!*\
  !*** external "graphql-tag" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("graphql-tag");

/***/ }),

/***/ "next/link":
/*!****************************!*\
  !*** external "next/link" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/link");

/***/ }),

/***/ "next/router":
/*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/router");

/***/ }),

/***/ "pluralize":
/*!****************************!*\
  !*** external "pluralize" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("pluralize");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-adopt":
/*!******************************!*\
  !*** external "react-adopt" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-adopt");

/***/ }),

/***/ "react-apollo":
/*!*******************************!*\
  !*** external "react-apollo" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-apollo");

/***/ }),

/***/ "styled-components":
/*!************************************!*\
  !*** external "styled-components" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("styled-components");

/***/ })

/******/ });
//# sourceMappingURL=ingredients.js.map