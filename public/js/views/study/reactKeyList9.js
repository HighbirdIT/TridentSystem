'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PersonList = function (_React$PureComponent) {
    _inherits(PersonList, _React$PureComponent);

    function PersonList(props) {
        _classCallCheck(this, PersonList);

        return _possibleConstructorReturn(this, (PersonList.__proto__ || Object.getPrototypeOf(PersonList)).call(this, props));
    }

    _createClass(PersonList, [{
        key: 'render',
        value: function render() {

            var arr1 = [300, 800, 800, 800, 900, 300, 900, 900, 1000, 600, 900, 600, 700, 1000, 900, 700, 900, 300, 1100, 800, 900, 900, 700, 500, 1000, 700, 1000, 0, 1000, 800, 900, 900];
            var arr2 = [600, 700, 300, 500, 800, 400, 900, 1000, 1100, 100, 1300, 1400, 1500, 1600, 0];
            var rlt_arr = arr2.map(function (item) {
                return arr1.length - arr1.lastIndexOf(item);
            });

            return arr2.map(function (item, i) {
                return React.createElement(
                    'div',
                    null,
                    rlt_arr[i] + 1
                );
            });

            if (this.props.data == null) {
                return React.createElement(
                    'div',
                    null,
                    '\u6B63\u5728\u901A\u4FE1'
                );
            }
            return React.createElement(
                'div',
                { className: 'list-group' },
                this.props.data.map(function (person_dr) {
                    return React.createElement(
                        'div',
                        { key: person_dr.员工登记姓名代码, className: 'list-group-item d-flex align-items-center' },
                        React.createElement(
                            'div',
                            { style: { width: '4em' }, className: '' },
                            person_dr.员工登记姓名
                        ),
                        React.createElement(
                            'div',
                            { className: 'd-flex flex-column col-2' },
                            React.createElement(
                                'div',
                                null,
                                '\u5E74\u9F84:',
                                person_dr.员工当前年龄
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u6027\u522B:',
                                person_dr.员工登记性别
                            )
                        ),
                        React.createElement(
                            'div',
                            { style: { width: '6em' }, className: 'ml-1' },
                            person_dr.所属公司名称
                        ),
                        React.createElement(
                            'div',
                            { className: 'd-flex flex-column ml-1 col-3' },
                            React.createElement(
                                'div',
                                null,
                                '\u7CFB\u7EDF:',
                                person_dr.所属系统名称
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u90E8\u95E8:',
                                person_dr.所属部门名称
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'd-flex flex-column ml-1 col-3' },
                            React.createElement(
                                'div',
                                null,
                                '\u7C7B\u522B:',
                                person_dr.员工工时状态
                            ),
                            React.createElement(
                                'div',
                                null,
                                '\u804C\u7EA7:',
                                person_dr.享受职级名称
                            )
                        )
                    );
                })
            );
        }
    }]);

    return PersonList;
}(React.PureComponent);

var MyApp = function (_React$PureComponent2) {
    _inherits(MyApp, _React$PureComponent2);

    function MyApp(props) {
        _classCallCheck(this, MyApp);

        var _this2 = _possibleConstructorReturn(this, (MyApp.__proto__ || Object.getPrototypeOf(MyApp)).call(this, props));

        _this2.state = {};

        var self = _this2;

        fetch('helloProcess', {
            method: "POST",
            body: JSON.stringify({
                tableName: 'V113A名册员工全部',
                action: 'getDataTable'
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                console.error(response.statusText);
                return null;
            }
        }).then(function (rltJson) {
            self.fetchComplete(rltJson.data);
        });
        return _this2;
    }

    _createClass(MyApp, [{
        key: 'fetchComplete',
        value: function fetchComplete(data) {
            this.setState({
                personDr_arr: data
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(PersonList, { data: this.state.personDr_arr });
        }
    }]);

    return MyApp;
}(React.PureComponent);

ReactDOM.render(React.createElement(MyApp, null), document.getElementById('reactRoot'));