webpackHotUpdate("static/development/pages/_app.js",{

/***/ "./components/Nav.js":
/*!***************************!*\
  !*** ./components/Nav.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! styled-components */ "./node_modules/styled-components/dist/styled-components.browser.esm.js");
/* harmony import */ var polished__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! polished */ "./node_modules/polished/dist/polished.es.js");
/* harmony import */ var _fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @fortawesome/react-fontawesome */ "./node_modules/@fortawesome/react-fontawesome/index.es.js");
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faEllipsisV__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @fortawesome/fontawesome-pro-regular/faEllipsisV */ "./node_modules/@fortawesome/fontawesome-pro-regular/faEllipsisV.js");
/* harmony import */ var _fortawesome_fontawesome_pro_regular_faEllipsisV__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_fortawesome_fontawesome_pro_regular_faEllipsisV__WEBPACK_IMPORTED_MODULE_5__);
var _jsxFileName = "/projects/recipe-collection/client/components/Nav.js";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }






 // import faHome from '@fortawesome/fontawesome-pro-regular/faHome';
// import faCloudDownload from '@fortawesome/fontawesome-pro-regular/faCloudDownload';
// import faLemon from '@fortawesome/fontawesome-pro-regular/faLemon';
// import faFolderOpen from '@fortawesome/fontawesome-pro-regular/faFolderOpen';

var NavStyles = styled_components__WEBPACK_IMPORTED_MODULE_2__["default"].nav.withConfig({
  displayName: "Nav__NavStyles",
  componentId: "ld8pfz-0"
})(["background:", ";position:fixed;top:0;width:100%;.menu-icon{color:", ";cursor:pointer;display:block;margin:10px auto;}.menu-icon:hover{color:", ";}ul{display:", ";}@media (min-width:", "){width:", ";left:-", ";bottom:0;transition:.2s ease-out;.menu-icon{position:relative;left:80px;width:40px;}}"], function (props) {
  return props.theme.menuBackground;
}, function (props) {
  return props.theme.menuColor;
}, function (props) {
  return Object(polished__WEBPACK_IMPORTED_MODULE_3__["lighten"])(0.1, props.theme.menuColor);
}, function (props) {
  return props.expanded ? 'block' : 'none';
}, function (props) {
  return props.theme.tablet;
}, function (props) {
  return props.theme.menuWidth;
}, function (props) {
  return props.expanded ? 0 : props.theme.menuOffset;
});

var Nav =
/*#__PURE__*/
function (_Component) {
  _inherits(Nav, _Component);

  function Nav(props) {
    var _this;

    _classCallCheck(this, Nav);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Nav).call(this, props));
    _this.onMouseOver = _this.onMouseOver.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.onMouseLeave = _this.onMouseLeave.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(Nav, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.navigation.addEventListener('mouseover', this.onMouseOver);
      this.navigation.addEventListener('mouseleave', this.onMouseLeave);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.navigation.removeEventListener('mouseover', this.onMouseOver);
      this.navigation.removeEventListener('mouseleave', this.onMouseLeave);
    }
  }, {
    key: "onMouseOver",
    value: function onMouseOver(e) {
      console.warn('onMouseOver'); // withTheme() gives us access to the theme props here

      var tablet = this.props.theme.tablet;
      console.log(tablet);

      if (window.innerWidth > tablet) {//const yPosition = ((e.clientY - 20) < 0) ? 20 : e.clientY - 10;
        // move the menu icon to whereever our cursor is
        //this.menuIcon.style = `top: ${yPosition}px;`;
        // keep updating this anytime we move our mouse around the nav
        //this.navigation.addEventListener('mousemove', this.onMouseOver);
      }
    }
  }, {
    key: "onMouseLeave",
    value: function onMouseLeave() {
      console.warn('onMouseLeave'); // cleanup this event if we're not in the nav
      //this.navigation.removeEventListener('mousemove', this.onMouseOver);
      // if we're in mobile, make sure we put our menu icon back at the top

      if (window.innerWidth > 768) {//this.menuIcon.style = 'top: 20px';
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var isExpanded = this.props.isExpanded;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(NavStyles, {
        expanded: isExpanded,
        innerRef: function innerRef(el) {
          return _this2.navigation = el;
        },
        __source: {
          fileName: _jsxFileName,
          lineNumber: 99
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_fortawesome_react_fontawesome__WEBPACK_IMPORTED_MODULE_4__["default"], {
        icon: _fortawesome_fontawesome_pro_regular_faEllipsisV__WEBPACK_IMPORTED_MODULE_5___default.a,
        className: "menu-icon",
        onClick: this.props.onMenuIconClick,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 100
        },
        __self: this
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("ul", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 102
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 103
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
        href: "/",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 104
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 105
        },
        __self: this
      }, "Home"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 108
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
        href: "/import",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 109
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 110
        },
        __self: this
      }, "Import"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 113
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
        href: "/ingredients",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 114
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 115
        },
        __self: this
      }, "Ingredients"))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("li", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 118
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(next_link__WEBPACK_IMPORTED_MODULE_1___default.a, {
        href: "/recipes",
        __source: {
          fileName: _jsxFileName,
          lineNumber: 119
        },
        __self: this
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("a", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 120
        },
        __self: this
      }, "Recipes")))));
    }
  }]);

  return Nav;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(styled_components__WEBPACK_IMPORTED_MODULE_2__["withTheme"])(Nav));

/***/ })

})
//# sourceMappingURL=_app.js.60770a7cbe4ec72b145c.hot-update.js.map