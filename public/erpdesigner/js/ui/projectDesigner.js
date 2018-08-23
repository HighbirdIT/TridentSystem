"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProjectDesigner = function (_React$PureComponent) {
    _inherits(ProjectDesigner, _React$PureComponent);

    function ProjectDesigner(props) {
        _classCallCheck(this, ProjectDesigner);

        var _this = _possibleConstructorReturn(this, (ProjectDesigner.__proto__ || Object.getPrototypeOf(ProjectDesigner)).call(this, props));

        var initState = {};

        _this.state = initState;
        return _this;
    }

    _createClass(ProjectDesigner, [{
        key: "render",
        value: function render() {
            var thisProject = this.props.project;
            thisProject.designer = this;
            return React.createElement(
                "div",
                { className: this.props.className },
                React.createElement(ControlPanel, { project: thisProject }),
                React.createElement(ContentPanel, { project: thisProject }),
                React.createElement(AttributePanel, { project: thisProject })
            );
        }
    }]);

    return ProjectDesigner;
}(React.PureComponent);