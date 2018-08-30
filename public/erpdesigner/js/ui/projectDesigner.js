'use strict';

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
        _this.flowMCRef = React.createRef();
        _this.contenPanelRef = React.createRef();
        autoBind(_this);
        return _this;
    }

    _createClass(ProjectDesigner, [{
        key: 'mouseDownControlIcon',
        value: function mouseDownControlIcon(ctltype, mouseX, mouseY) {
            this.contenPanelRef.current.endPlace();
            var thisProject = this.props.project;
            var newKernel = thisProject.createKernalByType(ctltype);
            if (newKernel == null) {
                console.warn('从' + ctltype + '创建控件失败！');
                return;
            }

            this.flowMCRef.current.setGetContentFun(function () {
                return React.createElement(
                    'span',
                    null,
                    '\u653E\u7F6E:',
                    newKernel.description
                );
            }, mouseX, mouseY);

            window.addEventListener('mouseup', this.mouseUpWithFlowHandler);
            newKernel.__placing = true;
            this.contenPanelRef.current.startPlace(newKernel);
        }
    }, {
        key: 'mouseUpWithFlowHandler',
        value: function mouseUpWithFlowHandler(ev) {
            this.flowMCRef.current.setGetContentFun(null);
            window.removeEventListener('mouseup', this.mouseUpWithFlowHandler);
            this.contenPanelRef.current.endPlace();
        }
    }, {
        key: 'FMpositionChanged',
        value: function FMpositionChanged(newPos) {
            this.contenPanelRef.current.placePosChanged(newPos);
        }
    }, {
        key: 'render',
        value: function render() {
            var thisProject = this.props.project;
            thisProject.designer = this;
            return React.createElement(
                'div',
                { className: this.props.className },
                React.createElement(ControlPanel, { project: thisProject, mouseDownControlIcon: this.mouseDownControlIcon }),
                React.createElement(ContentPanel, { project: thisProject, ref: this.contenPanelRef }),
                React.createElement(AttributePanel, { project: thisProject }),
                React.createElement(FlowMouseContainer, { project: thisProject, ref: this.flowMCRef, positionChanged: this.FMpositionChanged })
            );
        }
    }]);

    return ProjectDesigner;
}(React.PureComponent);