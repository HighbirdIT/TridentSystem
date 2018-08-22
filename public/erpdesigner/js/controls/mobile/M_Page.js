'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_Page = function (_ControlBase) {
    _inherits(M_Page, _ControlBase);

    function M_Page() {
        _classCallCheck(this, M_Page);

        return _possibleConstructorReturn(this, (M_Page.__proto__ || Object.getPrototypeOf(M_Page)).call(this, false, '手机页面', '布局'));
    }

    return M_Page;
}(ControlBase);

DesignerConfig.registerControl({
    forPC: false,
    label: '页面',
    type: 'M_Page',
    invisible: true
}, '布局');