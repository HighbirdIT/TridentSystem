"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
document.getElementById('pageTabsContainer').innerHTML="<div class='navbar-brand'>PageOne</div>";

document.getElementById('pageContentContainer').innerHTML="<div class='d-flex h-100'>\
<div class='flex-grow-0' style='width:100px'>Toolbar</div>\
<div class='flex-grow-1 bg-info'>Page</div>\
<div class='flex-grow-0' style='width:200px'>Props</div>\
</div>";
*/

/*
    <div class="w-100 h-100 d-flex flex-column">
        <div id="mainMenuContainer" class="flex-grow-0 bg-primary">
            <div>主菜单</div>
        </div>
        <div class="flex-grow-1 h-100" style="overflow:auto">
            <div class="d-flex flex-column h-100">
                <div class="flex-grow-0 bg-" id="pageTabsContainer">

                </div>
                <div class="flex-grow-1 h-100" style="overflow:auto" id="pageContentContainer">
                    
                </div>
            </div>
        </div>
        <div class="flex-grow-0 bg-info">页脚</div>
    </div>
*/

window.addEventListener('mousemove', function (ev) {
    WindowMouse.x = ev.x;
    WindowMouse.y = ev.y;
});

var ErpDesigner = function (_React$PureComponent) {
    _inherits(ErpDesigner, _React$PureComponent);

    function ErpDesigner(props) {
        _classCallCheck(this, ErpDesigner);

        var _this = _possibleConstructorReturn(this, (ErpDesigner.__proto__ || Object.getPrototypeOf(ErpDesigner)).call(this, props));

        _this.state = {
            configDataIsLoaded: false
        };

        //fetchJsonPosts('onlineinterview_process', { action: 'pageinit' }, 'pageiniting')
        return _this;
    }

    _createClass(ErpDesigner, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                _extends({ id: "designerroot" }, this.props),
                React.createElement(MainMenu, null),
                React.createElement(
                    "div",
                    { className: "flex-grow-1 d-flex flex-column", style: { overflow: "hidden" } },
                    React.createElement(ProjectContainer, null)
                ),
                React.createElement(StatusBar, null)
            );
        }
    }]);

    return ErpDesigner;
}(React.PureComponent);

ReactDOM.render(React.createElement(ErpDesigner, { className: "w-100 h-100 d-flex flex-column" }), document.getElementById('reactRoot'));