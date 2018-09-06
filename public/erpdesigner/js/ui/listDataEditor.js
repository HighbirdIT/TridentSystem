'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListDataView = function (_EventEmitter) {
    _inherits(ListDataView, _EventEmitter);

    function ListDataView(source_arr, textName, valueName) {
        _classCallCheck(this, ListDataView);

        var _this = _possibleConstructorReturn(this, (ListDataView.__proto__ || Object.getPrototypeOf(ListDataView)).call(this));

        _this.source_arr = source_arr;
        _this.textName = textName;
        _this.valueName = valueName;
        return _this;
    }

    _createClass(ListDataView, [{
        key: 'fireChanged',
        value: function fireChanged() {
            this.emit('changed');
        }
    }, {
        key: 'deleteItem',
        value: function deleteItem(item) {
            var index = this.source_arr.indexOf(item);
            if (index >= 0) {
                this.source_arr.splice(index, 1);
                this.fireChanged();
            }
        }
    }]);

    return ListDataView;
}(EventEmitter);

var ListDataEditor = function (_React$PureComponent) {
    _inherits(ListDataEditor, _React$PureComponent);

    function ListDataEditor(props) {
        _classCallCheck(this, ListDataEditor);

        var _this2 = _possibleConstructorReturn(this, (ListDataEditor.__proto__ || Object.getPrototypeOf(ListDataEditor)).call(this, props));

        _this2.state = {
            items_arr: _this2.props.dataView.source_arr,
            selected_arr: []
        };

        autoBind(_this2);
        return _this2;
    }

    _createClass(ListDataEditor, [{
        key: 'dataviewChangedHandler',
        value: function dataviewChangedHandler() {
            var _this3 = this;

            var newSelected_arr = [];
            this.state.selected_arr.forEach(function (v) {
                if (_this3.state.items_arr.find(function (e) {
                    return e[_this3.props.dataView.valueName].toString() == v;
                })) {
                    newSelected_arr.push(v);
                }
            });
            this.setState({ selected_arr: newSelected_arr });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.props.dataView.on('changed', this.dataviewChangedHandler);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.props.dataView.off('changed', this.dataviewChangedHandler);
        }
    }, {
        key: 'itemClickHandler',
        value: function itemClickHandler(ev) {
            var itemvalue = getAttributeByNode(ev.target, 'itemvalue');
            if (itemvalue == null) {
                return;
            }
            var nowArr = this.state.selected_arr;
            var nowIndex = nowArr.indexOf(itemvalue);
            if (nowIndex >= 0) {
                nowArr = nowArr.concat();
                nowArr.splice(nowIndex, 1);
            } else {
                nowArr = nowArr.concat(itemvalue);
            }
            this.setState({
                selected_arr: nowArr
            });
        }
    }, {
        key: 'clickDeleteHandler',
        value: function clickDeleteHandler(ev) {
            var _this4 = this;

            var itemvalue = getAttributeByNode(ev.target, 'itemvalue');
            if (itemvalue == null) {
                return;
            }
            var item = this.state.items_arr.find(function (e) {
                return e[_this4.props.dataView.valueName].toString() == itemvalue;
            });
            this.props.dataView.deleteItem(item);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this5 = this;

            return React.createElement(
                'div',
                { className: 'd-flex flex-column flex-grow-1 flex-shrink-1 list-group' },
                this.state.items_arr.map(function (item) {
                    var text = item[_this5.props.dataView.textName];
                    var value = item[_this5.props.dataView.valueName].toString();
                    var selected = _this5.state.selected_arr.indexOf(value) != -1;
                    return React.createElement(
                        'div',
                        { key: value, className: 'd-flex flex-grow-0 flex-shrink-0', itemvalue: value },
                        React.createElement(
                            'div',
                            { key: value, onClick: _this5.itemClickHandler, className: 'list-group-item list-group-item-action flex-grow-1 flex-shrink-1 align-items-baseline' + (selected ? ' active' : ''), miniitem: '1' },
                            text
                        ),
                        selected ? React.createElement('button', { onClick: _this5.clickDeleteHandler, type: 'button', className: 'ml-1 btn btn-danger icon icon-trash' }) : null
                    );
                })
            );
        }
    }]);

    return ListDataEditor;
}(React.PureComponent);