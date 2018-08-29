'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ContainerDataAttrsSetting = {
    groups_arr: [new CAttributeGroup('基本设置', [new CAttribute('补助方向', 'orientation', ValueType.String, true)])]
};

var M_ContainerData = function (_ControlDataBase) {
    _inherits(M_ContainerData, _ControlDataBase);

    function M_ContainerData(initData, project) {
        _classCallCheck(this, M_ContainerData);

        var _this = _possibleConstructorReturn(this, (M_ContainerData.__proto__ || Object.getPrototypeOf(M_ContainerData)).call(this, extractPropsFromObj(initData, [{ name: 'orientation', default: Orientation_H }]), project));

        var self = _this;
        autoBind(self);
        _this.attrbuteGroups = M_ContainerDataAttrsSetting.groups_arr;
        return _this;
    }

    return M_ContainerData;
}(ControlDataBase);

var M_Container = function (_React$PureComponent) {
    _inherits(M_Container, _React$PureComponent);

    function M_Container(props) {
        _classCallCheck(this, M_Container);

        return _possibleConstructorReturn(this, (M_Container.__proto__ || Object.getPrototypeOf(M_Container)).call(this, props));
    }

    _createClass(M_Container, [{
        key: 'render',
        value: function render() {
            return React.createElement('div', { className: 'bg-info d-flex flex-grow-1 flex-shrink-1'
            });
        }
    }]);

    return M_Container;
}(React.PureComponent);

DesignerConfig.registerControl({
    forPC: false,
    label: 'Flex容器',
    type: 'M_Container',
    namePrefix: 'M_CT',
    dataclass: M_ContainerData
}, '布局');