'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Container = function (_React$PureComponent) {
    _inherits(M_Container, _React$PureComponent);

    function M_Container() {
        _classCallCheck(this, M_Container);

        return _possibleConstructorReturn(this, (M_Container.__proto__ || Object.getPrototypeOf(M_Container)).call(this, false, 'Flex容器', '布局'));
    }

    return M_Container;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: 'Flex容器',
    type: 'M_Container'
}, '布局');