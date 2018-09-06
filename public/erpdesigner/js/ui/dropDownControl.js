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

        var formated_arr = _this.formatData(_this.props.options_arr, _this.props.textAttrName, _this.props.valueAttrName);
        var selectedOption = formated_arr.find(function (item) {
            return item.value == _this.props.value;
        });
        autoBind(_this);

        _this.state = {
            keyword: '',
            opened: false,
            options_arr: selectedOption ? [selectedOption] : [],
            selectedOption: selectedOption
        };

        _this.dropdownbtnRef = React.createRef();
        _this.editableInputRef = React.createRef();
        return _this;
    }

    _createClass(DropDownControl, [{
        key: 'getSelectedData',
        value: function getSelectedData() {
            return this.state.selectedOption ? this.state.selectedOption.data ? this.state.selectedOption.data : this.state.selectedOption.value : null;
        }
    }, {
        key: 'dropDowmDivRefFun',
        value: function dropDowmDivRefFun(elem) {
            this.$dropDowmDiv = $(elem);
            this.$dropDowmDiv.on('shown.bs.dropdown', this.dropDownOpened);
            this.$dropDowmDiv.on('hidden.bs.dropdown', this.dropDownClosed);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var $current = this.$dropDowmDiv;
            $current.off('shown.bs.dropdown', this.dropDownOpened);
            $current.off('hidden.bs.dropdown', this.dropDownClosed);
        }
    }, {
        key: 'dropDownOpened',
        value: function dropDownOpened() {
            console.log('菜单被打开了');
            var srcOptions_arr = this.props.options_arr;
            if (typeof srcOptions_arr === 'function') {
                srcOptions_arr = srcOptions_arr();
            }
            var formated_arr = this.formatData(srcOptions_arr, this.props.textAttrName, this.props.valueAttrName);
            this.setState({
                keyword: this.state.selectedOption ? '' : this.state.keyword,
                opened: true,
                options_arr: formated_arr
            });

            /*
            var self = this;
            setTimeout(() => {
                self.setState({options_arr:formated_arr});
            }, 2000);
            */
        }
    }, {
        key: 'keyChanged',
        value: function keyChanged(ev) {
            var target = ev.target;
            var keyword = target.value;

            this.setState({ keyword: keyword });
        }
    }, {
        key: 'dropDownClosed',
        value: function dropDownClosed() {
            console.log('菜单被关闭了');
            this.setState({ opened: false });
        }

        /*
        dropDowmDivRef(elem) {
            $(elem).on('shown.bs.dropdown', this.dropDownOpened);
            $(elem).on('hidden.bs.dropdown', this.dropDownClosed);
        }
        */

    }, {
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
            var selectedOpt = this.state.options_arr.find(function (item) {
                return item.text == keyword;
            });

            if (this.props.editable) {
                this.setState({ keyword: keyword,
                    selectedOption: selectedOpt });
            } else {
                if (selectedOpt) {
                    this.setState({ keyword: keyword,
                        selectedOption: selectedOpt });
                } else {
                    this.setState({ keyword: keyword });
                }
            }
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
            this.setState({ selectedOption: theOptionItem,
                keyword: '' });
            if (this.props.itemChanged) {
                this.props.itemChanged(theOptionItem.data ? theOptionItem.data : theOptionItem.value);
            }
        }
    }, {
        key: 'renderDropDown',
        value: function renderDropDown(filted_arr, selectedOption) {
            var _this2 = this;

            return React.createElement(
                React.Fragment,
                null,
                this.state.options_arr.length <= 10 || this.props.editable ? null : React.createElement(
                    'div',
                    { className: 'd-flex border' },
                    React.createElement(
                        'span',
                        { htmlFor: 'keyword', className: 'flex-grow-0 flex-shrink-0 ' },
                        '\u641C\u7D22:'
                    ),
                    React.createElement('input', { className: 'ml-1 flex-grow-1 flex-shrink-1', type: 'text', id: 'keyword', name: 'keyword', value: this.state.keyword.length > 0 || selectedOption == null ? this.state.keyword : selectedOption.text, onChange: this.keyChanged })
                ),
                React.createElement(
                    'div',
                    { name: 'listDIV', className: 'list-group flex-grow-1 flex-shrink-1', style: { overflow: 'auto', maxheight: '500px', padding: '5px' } },
                    filted_arr.map(function (item, i) {
                        return React.createElement(
                            'div',
                            { onClick: _this2.listItemClick, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedOption && item.value == selectedOption.value ? ' active' : ''), miniitem: 1, key: item.value, value: item.value },
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
        key: 'editableInputFocushandler',
        value: function editableInputFocushandler(ev) {
            if (this.dropdownbtnRef.current) {
                if (!this.state.opened) {
                    var inputElem = this.editableInputRef.current;
                    $(this.dropdownbtnRef.current).dropdown('toggle');
                    setTimeout(function () {
                        inputElem.focus();
                    }, 50);
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var filted_arr = this.state.options_arr.filter(function (item) {
                return _this3.state.keyword.trim().length == 0 || item.text.indexOf(_this3.state.keyword) >= 0;
            });
            var selectedOption = this.state.selectedOption;

            return React.createElement(
                'div',
                { className: "d-flex flex-column " + (this.props.rootclass ? this.props.rootclass : '') },
                React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 d-flex btn-group', ref: this.dropDowmDivRefFun },
                        this.props.editable ? React.createElement('input', { onFocus: this.editableInputFocushandler, ref: this.editableInputRef, type: 'text', className: 'flex-grow-1 flex-shrink-1', onChange: this.keyChanged, value: selectedOption ? selectedOption.text : this.state.keyword }) : React.createElement(
                            'button',
                            { type: 'button', className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-1 flex-shrink-1' + (selectedOption == null ? ' text-danger' : ''), 'data-toggle': 'dropdown' },
                            selectedOption ? selectedOption.text : '请选择'
                        ),
                        React.createElement('button', { ref: this.dropdownbtnRef, type: 'button', className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split', 'data-toggle': 'dropdown', 'data-reference': 'parent' }),
                        React.createElement(
                            'div',
                            { className: 'dropdown-menu w-100 autoScroll', style: { maxHeight: '500px' } },
                            (this.state.opened || this.state.options_arr.length > 0) && this.renderDropDown(filted_arr, selectedOption)
                        )
                    )
                )
            );
        }
    }]);

    return DropDownControl;
}(React.PureComponent);