'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MyApp = function (_React$PureComponent) {
    _inherits(MyApp, _React$PureComponent);

    function MyApp(props) {
        _classCallCheck(this, MyApp);

        var _this = _possibleConstructorReturn(this, (MyApp.__proto__ || Object.getPrototypeOf(MyApp)).call(this, props));

        _this.state = {
            keyword: '',
            selectedCode: -1
        };

        _this.keyChanged = _this.keyChanged.bind(_this);
        _this.litItemClick = _this.litItemClick.bind(_this);
        return _this;
    }

    _createClass(MyApp, [{
        key: 'keyChanged',
        value: function keyChanged(ev) {
            var target = ev.target;
            var keyword = target.value;

            this.setState({ keyword: keyword });
        }
    }, {
        key: 'litItemClick',
        value: function litItemClick(ev) {
            var target = ev.target;
            if (!target.hasAttribute('code')) {
                target = target.parentElement;
            }
            var code = target.getAttribute('code');
            this.setState({ selectedCode: code });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var filted_arr = this.props.dataarr.filter(function (item) {
                return _this2.state.keyword == '' || _this2.state.keyword == ' ' || item.name.indexOf(_this2.state.keyword) >= 0;
            });
            var selectedItem = this.props.dataarr.find(function (item) {
                return _this2.state.selectedCode == item.code;
            });

            return React.createElement(
                'div',
                { className: 'w-100 h-100 d-flex flex-column' },
                React.createElement(
                    'div',
                    { className: 'bg-primary p-1 text-light d-flex felx-grow-0 flex-shrink-0 align-items-center' },
                    React.createElement(
                        'span',
                        { htmlFor: 'keyword', className: 'flex-grow-0 flex-shrink-0 ' },
                        '\u5173\u952E\u5B57:'
                    ),
                    React.createElement('input', { className: 'ml-1 flex-grow-1 flex-shrink-1', type: 'text', id: 'keyword', name: 'keyword', onChange: this.keyChanged }),
                    React.createElement(
                        'span',
                        null,
                        '\u8FC7\u6EE4\u51FA',
                        filted_arr.length,
                        '\u6761'
                    ),
                    React.createElement(
                        'span',
                        null,
                        selectedItem ? '"' + selectedItem.name + '"' : ''
                    )
                ),
                React.createElement(
                    'div',
                    { name: 'listDIV', className: 'list-group flex-grow-1 flex-shrink-1', style: { overflow: 'auto' } },
                    filted_arr.map(function (item, i) {
                        return React.createElement(
                            'div',
                            { onClick: _this2.litItemClick, className: 'd-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' + (item.code == _this2.state.selectedCode ? ' active' : ''), key: i, code: item.code },
                            React.createElement(
                                'div',
                                { className: 'col-6' },
                                item.name
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-6' },
                                item.code
                            )
                        );
                    })
                )
            );
        }
    }]);

    return MyApp;
}(React.PureComponent);

var data = [{ name: '叶媛媛', code: 1 }, { name: '潘佳伟', code: 2 }, { name: '陈怡', code: 3 }, { name: '沈珏茹', code: 4 }, { name: '顾熙', code: 5 }, { name: '沈晓霞', code: 6 }, { name: '赵智淼', code: 7 }, { name: '唐媛', code: 8 }, { name: '李烨', code: 9 }, { name: '王继红', code: 10 }, { name: '张琳', code: 11 }, { name: '周玲', code: 12 }, { name: '胡玲玲', code: 13 }, { name: '卢彩琴', code: 14 }, { name: '李悦', code: 15 }, { name: '陈晟', code: 16 }, { name: '金茂永', code: 17 }, { name: '肖康', code: 18 }, { name: '郭其宝', code: 19 }, { name: '李旭', code: 20 }, { name: '陈伟', code: 21 }, { name: '李晶晶', code: 22 }, { name: '吴溢华', code: 23 }, { name: '吕承梅', code: 24 }, { name: '陆敏', code: 25 }, { name: '吴安琴', code: 26 }, { name: '张霞', code: 27 }, { name: '谢颖清', code: 28 }, { name: '冯鑫', code: 29 }, { name: '张亚飞', code: 30 }, { name: '孙运姣', code: 31 }, { name: '杨振兴', code: 32 }, { name: '梁秀兰', code: 33 }, { name: '赵志良', code: 34 }, { name: '张贵', code: 35 }, { name: '金鑫华', code: 36 }, { name: '纪爱光', code: 37 }, { name: '谷德明', code: 38 }, { name: '李士娟', code: 39 }, { name: '石草林', code: 40 }, { name: '陈虎', code: 41 }, { name: '纪爱军', code: 42 }, { name: '张光运', code: 43 }, { name: '彭善文', code: 44 }, { name: '孙红闯', code: 45 }, { name: '陈光华', code: 46 }, { name: '龙腾云', code: 47 }, { name: '盛琴', code: 48 }, { name: '田石亚', code: 49 }, { name: '王敬', code: 50 }];

ReactDOM.render(React.createElement(MyApp, { name: 'Hello3React', dataarr: data }), document.getElementById('reactRoot'));