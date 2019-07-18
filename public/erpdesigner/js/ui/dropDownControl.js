'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DropDownControl = function (_React$PureComponent) {
    _inherits(DropDownControl, _React$PureComponent);

    function DropDownControl(props) {
        _classCallCheck(this, DropDownControl);

        var _this = _possibleConstructorReturn(this, (DropDownControl.__proto__ || Object.getPrototypeOf(DropDownControl)).call(this, props));

        var valueAttrName = _this.props.valueAttrName == null ? _this.props.textAttrName : _this.props.valueAttrName;
        if (_this.props.editable && _this.props.valueAttrName != null && _this.props.valueAttrName != _this.props.textAttrName) {
            //console.error('下拉框设置为editable 但同时设置了text和value属性明');
            _this.editIsKeyword = true;
        }

        var selectedOption = null;
        if (!_this.props.editable || _this.editIsKeyword) {
            var formated_arr = _this.formatData(_this.props.options_arr, _this.props.textAttrName, _this.props.valueAttrName);
            selectedOption = formated_arr.find(function (item) {
                if (_typeof(_this.props.value) === 'object') {
                    return item == _this.props.value || item.value == _this.props.value[valueAttrName];
                }
                return item.value == _this.props.value;
            });
        }

        autoBind(_this);

        _this.state = {
            keyword: '',
            value: _this.props.value,
            prePropsValue: _this.props.value,
            opened: false,
            options_arr: selectedOption ? [selectedOption] : [],
            selectedOption: selectedOption
        };

        _this.dropdownbtnRef = React.createRef();
        _this.editableInputRef = React.createRef();
        _this.dropmenudivRef = React.createRef();
        _this.rootDivRef = React.createRef();
        return _this;
    }

    _createClass(DropDownControl, [{
        key: 'setValue',
        value: function setValue(val) {
            if (this.props.editable && !this.editIsKeyword) {
                this.setState({
                    value: val
                });
            } else {
                var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
                var selectedOption = formated_arr.find(function (item) {
                    return item.value == val;
                });
                this.setState({
                    options_arr: formated_arr,
                    selectedOption: selectedOption
                });
            }
        }
    }, {
        key: 'getSelectedData',
        value: function getSelectedData() {
            return this.state.selectedOption ? this.state.selectedOption.data ? this.state.selectedOption.data : this.state.selectedOption.value : null;
        }
    }, {
        key: 'dropDowmDivRefFun',
        value: function dropDowmDivRefFun(elem) {
            this.$dropDowmDiv = $(elem);
            /*
            this.$dropDowmDiv.on('shown.bs.dropdown', this.dropDownOpened);
            this.$dropDowmDiv.on('hidden.bs.dropdown', this.dropDownClosed);
            */
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            /*
            var $current = this.$dropDowmDiv;
            $current.off('shown.bs.dropdown', this.dropDownOpened);
            $current.off('hidden.bs.dropdown', this.dropDownClosed);
            */
        }
    }, {
        key: 'dropDownOpened',
        value: function dropDownOpened() {
            console.log('菜单被打开了');
            /*
            var srcOptions_arr = this.props.options_arr;
            if(typeof srcOptions_arr === 'function'){
                srcOptions_arr = srcOptions_arr();
            }
            */
            var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
            this.setState({
                keyword: '',
                opened: true,
                options_arr: formated_arr
            });

            this.popMenuHeight = 0;
            //this.freshPopUpPos();

            window.addEventListener('mouseup', this.windowMouseUpWidthPopintg);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.state.opened) {
                var $dropDowmDiv = $(this.rootDivRef.current);
                var popMenu = $dropDowmDiv.find('.dropdown-menu');
                if (this.popMenuHeight == popMenu.height()) {
                    return;
                }
                this.freshPopUpPos();
            }
        }
    }, {
        key: 'freshPopUpPos',
        value: function freshPopUpPos() {
            var $dropDowmDiv = $(this.rootDivRef.current);
            var popMenu = $dropDowmDiv.find('.dropdown-menu');
            var $current = $dropDowmDiv;
            var divTop = $current.offset().top;
            var divBottom = divTop + $current.outerHeight(true);
            var windowTop = document.body.scrollTop;
            var windowBottom = windowTop + $(window).height();
            var popToUp = divBottom - windowTop > windowBottom - divBottom;
            var popMenuHeight = popMenu.outerHeight();
            this.popMenuHeight = popMenuHeight;
            var popUpCss = {
                "top": (popToUp ? divTop - popMenuHeight : divBottom) + 'px',
                "left": $current.offset().left + "px",
                "min-width": $current.width() + 'px'
            };
            popMenu.css(popUpCss);
            popMenu.find('#listDIV').css({
                "max-height": (popToUp ? divTop - windowTop - 50 : windowBottom - divBottom - 50) + 'px'
            });
        }
    }, {
        key: 'windowMouseUpWidthPopintg',
        value: function windowMouseUpWidthPopintg(ev) {
            var $dropDowmDiv = $(this.rootDivRef.current);
            if (isNodeHasParent(ev.target, $dropDowmDiv[0])) {
                return;
            }
            this.dropDownClosed();
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
            window.removeEventListener('mouseup', this.windowMouseUpWidthPopintg);

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
            if (orginData_arr == null) {
                console.warn('orginData_arr == null');
                return [];
            }
            if (typeof orginData_arr === 'function') {
                orginData_arr = orginData_arr(this.props.funparamobj);
            }
            if (valueAttrName == null) {
                valueAttrName = textAttrName;
            }
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

            if (selectedOpt) {
                this.setState({ keyword: keyword,
                    selectedOption: selectedOpt });
            } else {
                this.setState({ keyword: keyword });
            }
        }
    }, {
        key: 'inputChangedHandler',
        value: function inputChangedHandler(ev) {
            if (this.editIsKeyword) {
                this.keyChanged(ev);
                return;
            }
            this.setState({
                value: ev.target.value.trim()
            });
        }
    }, {
        key: 'inputBlurHandler',
        value: function inputBlurHandler(ev) {
            if (this.state.value != this.props.value) {
                if (this.props.itemChanged) {
                    //theOptionItem.data ? theOptionItem.data : theOptionItem.value
                    this.props.itemChanged(this.state.value, this);
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
                keyword: '',
                opened: false,
                value: theOptionItem.text });
            if (this.props.itemChanged) {
                //theOptionItem.data ? theOptionItem.data : theOptionItem.value
                this.props.itemChanged(value, this, theOptionItem.data);
            }
        }
    }, {
        key: 'renderDropDown',
        value: function renderDropDown(filted_arr, selectedOption) {
            var _this2 = this;

            return React.createElement(
                React.Fragment,
                null,
                this.state.options_arr.length <= 5 || this.editIsKeyword == true ? null : React.createElement(
                    'div',
                    { className: 'd-flex border' },
                    React.createElement(
                        'div',
                        { htmlFor: 'keyword', className: 'flex-grow-0 flex-shrink-0 ' },
                        '\u641C\u7D22:'
                    ),
                    React.createElement('input', { className: 'flex-grow-1 flex-shrink-1 flexinput', type: 'text', id: 'keyword', name: 'keyword', value: this.state.keyword, onChange: this.keyChanged })
                ),
                React.createElement(
                    'div',
                    { id: 'listDIV', className: 'list-group flex-grow-1 flex-shrink-1 autoScroll', style: { overflow: 'auto', maxHeight: '500px', padding: '5px' } },
                    filted_arr.map(function (item, i) {
                        if (item.text == null) {
                            console.warn('item text 不能为null');
                        }
                        return React.createElement(
                            'div',
                            { onClick: _this2.listItemClick, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedOption && item.value == selectedOption.value ? ' active' : ''), menuitem: 1, miniitem: 1, key: item.value, value: item.value },
                            React.createElement(
                                'div',
                                null,
                                item.text == null || item.text.length == 0 ? '(空值)' : item.text
                            )
                        );
                    })
                )
            );
        }
    }, {
        key: 'editableInputFocushandler',
        value: function editableInputFocushandler(ev) {
            if (!this.state.opened) {
                this.dropDownOpened();
                var inputElem = this.editableInputRef.current;
                setTimeout(function () {
                    inputElem.focus();
                }, 50);
            }
        }
    }, {
        key: 'clickOpenHandler',
        value: function clickOpenHandler() {
            if (!this.state.opened) {
                this.dropDownOpened();
            } else {
                this.dropDownClosed();
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
            if (this.state.prePropsValue != this.props.value) {
                var self = this;
                setTimeout(function () {
                    self.setState({
                        value: self.props.value,
                        prePropsValue: self.props.value
                    });
                }, 50);
            }
            var inputValue = this.editIsKeyword ? this.state.keyword == '' ? selectedOption == null ? '' : selectedOption.text : this.state.keyword : this.state.value;

            var useClassName = this.props.rootclass ? this.props.rootclass : '';
            if (useClassName.indexOf('flex-grow-') == -1) {
                useClassName += ' flex-grow-1';
            }
            if (useClassName.indexOf('flex-shrink-') == -1) {
                useClassName += ' flex-shrink-0';
            }
            return React.createElement(
                'div',
                { className: "d-flex btn-group " + useClassName, style: this.props.style, ref: this.rootDivRef },
                this.props.editable ? React.createElement('input', { onFocus: this.editableInputFocushandler, ref: this.editableInputRef, type: 'text', className: 'flex-grow-1 flex-shrink-1 flexinput', onChange: this.inputChangedHandler, onBlur: this.inputBlurHandler, value: inputValue }) : React.createElement(
                    'button',
                    { onClick: this.clickOpenHandler, style: { maxWidth: this.props.miniBtn ? 'calc(100% - 30px)' : '100%', minHeight: '38px' }, type: 'button', className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1' + (selectedOption == null ? ' text-danger' : '') },
                    React.createElement(
                        'div',
                        { style: { overflow: 'hidden' }, className: 'flex-grow-1 flex-shrink-1' },
                        React.createElement(
                            'div',
                            null,
                            selectedOption ? selectedOption.text : '请选择'
                        )
                    )
                ),
                this.props.miniBtn && React.createElement('button', { ref: this.dropdownbtnRef, style: { width: '30px' }, type: 'button', onClick: this.clickOpenHandler, className: (this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' }),
                React.createElement(
                    'div',
                    { className: "dropdown-menu " + (this.state.opened ? 'show' : ''), ref: this.dropmenudivRef },
                    (this.state.opened || this.state.options_arr.length > 0) && this.renderDropDown(filted_arr, selectedOption)
                )
            );
        }
    }]);

    return DropDownControl;
}(React.PureComponent);