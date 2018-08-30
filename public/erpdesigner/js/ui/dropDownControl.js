'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DropDownControl = function (_React$PureComponent) {
    _inherits(DropDownControl, _React$PureComponent);

    function DropDownControl(props) {
        _classCallCheck(this, DropDownControl);

        var _this = _possibleConstructorReturn(this, (DropDownControl.__proto__ || Object.getPrototypeOf(DropDownControl)).call(this, props));

        autoBind(_this);

        var formated_arr = _this.formatData(_this.props.options_arr, _this.props.textAttrName, _this.props.valueAttrName);
        var selectedOption = formated_arr.find(function (item) {
            return item.value == _this.props.value;
        });

        _this.state = {
            keyword: '',
            selectedValue: selectedOption ? selectedOption.value : null,
            selectedText: selectedOption ? selectedOption.text : '请选择',
            opened: false,
            options_arr: formated_arr
        };
        return _this;
    }

    _createClass(DropDownControl, [{
        key: 'formatData',
        value: function formatData(orginData_arr, textAttrName, valueAttrName) {
            return orginData_arr.map(function (item) {
                return typeof item == 'string' ? { text: item, value: item } : { text: item[textAttrName], value: item[valueAttrName], data: item };
            });
        }
    }, {
        key: 'keyChanged',
        value: function keyChanged(ev) {
            var target = ev.target;
            var keyword = target.value;

            this.setState({ keyword: keyword });
        }
    }, {
        key: 'listItemClick',
        value: function listItemClick(ev) {
            var target = ev.target;
            var value = getAttributeByNode(target, 'value', true, 3);
            if (value == null) {
                console.warn('can not find value attr');
                return;
            }
            var theOptionItem = this.state.options_arr.find(function (item) {
                return item.value == value;
            });
            this.props.itemChanged(theOptionItem.data ? theOptionItem.data : theOptionItem.value);
        }
    }, {
        key: 'renderDropDown',
        value: function renderDropDown(filted_arr, selectedOption) {
            var _this2 = this;

            return React.createElement(
                React.Fragment,
                null,
                this.state.options_arr.length <= 10 ? null : React.createElement(
                    'div',
                    { className: 'd-flex border' },
                    React.createElement(
                        'span',
                        { htmlFor: 'keyword', className: 'flex-grow-0 flex-shrink-0 ' },
                        '\u641C\u7D22:'
                    ),
                    React.createElement('input', { className: 'ml-1 flex-grow-1 flex-shrink-1', type: 'text', id: 'keyword', name: 'keyword', value: this.state.keyword, onChange: this.keyChanged })
                ),
                React.createElement(
                    'div',
                    { name: 'listDIV', className: 'list-group flex-grow-1 flex-shrink-1', style: { overflow: 'auto', maxheight: '500px', padding: '5px' } },
                    filted_arr.map(function (item, i) {
                        return React.createElement(
                            'div',
                            { onClick: _this2.listItemClick, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item-sm list-group-item-action' + (item == selectedOption ? ' active' : ''), key: i, value: item.value },
                            React.createElement(
                                'div',
                                null,
                                item.text
                            )
                        );
                    })
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var filted_arr = this.state.options_arr.filter(function (item) {
                return _this3.state.keyword.trim().length == 0 || item.text.indexOf(_this3.state.keyword) >= 0;
            });
            var selectedOption = this.state.options_arr.find(function (item) {
                return _this3.props.value == item.value;
            });

            return React.createElement(
                'div',
                { className: 'd-flex flex-column' },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex btn-group' },
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-dark flex-grow-1 flex-shrink-1' + (this.state.selectedValue == null ? ' text-danger' : ''), 'data-toggle': 'dropdown' },
                            selectedOption ? selectedOption.text : '请选择'
                        ),
                        React.createElement('button', { type: 'button', className: 'btn btn-dark flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split', 'data-toggle': 'dropdown', 'data-reference': 'parent' }),
                        React.createElement(
                            'div',
                            { className: 'dropdown-menu' },
                            this.renderDropDown(filted_arr, selectedOption)
                        )
                    )
                )
            );
        }
    }]);

    return DropDownControl;
}(React.PureComponent);