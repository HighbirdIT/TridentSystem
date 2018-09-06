'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function CreateNavItemData(text, contentReact) {
    return { text: text, content: contentReact };
}

var TabNavBar = function (_React$PureComponent) {
    _inherits(TabNavBar, _React$PureComponent);

    function TabNavBar(props) {
        _classCallCheck(this, TabNavBar);

        var _this = _possibleConstructorReturn(this, (TabNavBar.__proto__ || Object.getPrototypeOf(TabNavBar)).call(this, props));

        _this.state = {
            selectedItem: _this.props.navData.selectedItem
        };
        autoBind(_this);
        return _this;
    }

    _createClass(TabNavBar, [{
        key: 'clickItemBtnHandler',
        value: function clickItemBtnHandler(ev) {
            var navtext = getAttributeByNode(ev.target, 'navtext');
            if (navtext == null) {
                console.warn('navtext is null');
                return;
            }
            var wantItem = this.props.navData.items.find(function (item) {
                return item.text == navtext;
            });
            if (wantItem == null) {
                console.warn('wantItem is null');
                return;
            }

            var nowItem = this.state.selectedItem;
            if (wantItem == nowItem) return;
            this.setState({
                selectedItem: wantItem
            });
            this.props.navData.selectedItem = wantItem;
            this.props.navChanged(nowItem, wantItem);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                { className: 'btn-group', projectindex: this.props.index },
                this.props.navData.items.map(function (item) {
                    return React.createElement(
                        'button',
                        { key: item.text, navtext: item.text, onClick: _this2.clickItemBtnHandler, type: 'button', className: "btn btn-" + (item == _this2.state.selectedItem ? 'primary' : 'dark') },
                        item.text
                    );
                })
            );
        }
    }]);

    return TabNavBar;
}(React.PureComponent);