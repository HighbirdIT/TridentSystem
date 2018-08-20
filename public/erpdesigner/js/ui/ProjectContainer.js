'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProjectContainer = function (_React$PureComponent) {
    _inherits(ProjectContainer, _React$PureComponent);

    function ProjectContainer(props) {
        _classCallCheck(this, ProjectContainer);

        var _this = _possibleConstructorReturn(this, (ProjectContainer.__proto__ || Object.getPrototypeOf(ProjectContainer)).call(this, props));

        var initState = {
            projects: [new CProject('员工信息管理'), new CProject('行政管理'), new CProject('行政是的管理')],
            selectedIndex: 0
        };

        _this.state = initState;
        autoBind(_this);
        return _this;
    }

    _createClass(ProjectContainer, [{
        key: 'clickTitlehandler',
        value: function clickTitlehandler(ev) {
            var newIndex = this.getProjectIndexFromElem(ev.target);
            if (newIndex < 0) return;
            if (newIndex != this.state.selectedIndex) {
                this.setState({ selectedIndex: newIndex });
            }
        }
    }, {
        key: 'getProjectIndexFromElem',
        value: function getProjectIndexFromElem(elem) {
            while (elem && !elem.hasAttribute('projectindex')) {
                elem = elem.parentElement;
            }
            if (elem == null) {
                return -1;
            }
            return parseInt(elem.getAttribute('projectindex'));
        }
    }, {
        key: 'clickClosehandler',
        value: function clickClosehandler(ev) {
            var deleteIndex = this.getProjectIndexFromElem(ev.target);
            if (deleteIndex < 0) return;
            var new_arr = this.state.projects.concat();
            new_arr.splice(deleteIndex, 1);
            var selectedIndex = this.state.selectedIndex;
            if (selectedIndex >= new_arr.length) {
                selectedIndex = Math.max(new_arr.length - 1, 0);
            }
            this.setState({ projects: new_arr, selectedIndex: selectedIndex });
        }
    }, {
        key: 'changeProjectVersion',
        value: function changeProjectVersion(index, isPC) {
            if (index < 0) return;
            if (this.state.projects[index].config.isPC == isPC) {
                if (this.state.selectedIndex != index) {
                    this.setState({ selectedIndex: index });
                }
                return;
            }
            var new_arr = updateItemInArrayByIndex(this.state.projects, index, function (item) {
                var newConfig = updateObject(item.config, { isPC: isPC });
                return updateObject(item, { config: newConfig });
            });

            var selectedIndex = this.state.selectedIndex == index ? this.state.selectedIndex : index;
            this.setState({ projects: new_arr, selectedIndex: selectedIndex });
        }
    }, {
        key: 'switchProjectVersion',
        value: function switchProjectVersion(index) {
            if (index < 0) return;
            var theProject = this.state.projects[index];
            var newConfig = updateObject(theProject.config, { isPC: theProject.config.isPC ? 0 : 1 });
            this.changeProjectConfig(index, newConfig);
        }
    }, {
        key: 'changeProjectConfig',
        value: function changeProjectConfig(index, newConfig) {
            if (index < 0) return;
            var new_arr = updateItemInArrayByIndex(this.state.projects, index, function (item) {
                item.config = newConfig;
                return item;
            });
            this.setState({ projects: new_arr });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var projectManager = this;
            return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 d-flex flex-column' },
                    React.createElement(
                        'div',
                        { className: 'btn-group flex-grow-0 flex-shrink-0', role: 'group' },
                        React.createElement(
                            MenuItem,
                            { id: 'MI_HB', text: 'HB', className: 'text-primary' },
                            React.createElement(MenuCammandItem, { text: '\u6253\u5F00' }),
                            React.createElement(MenuCammandItem, { text: '\u521B\u5EFA' })
                        ),
                        this.state.projects.map(function (item, i) {
                            return React.createElement(
                                'div',
                                { key: i, className: 'btn-group', projectindex: i },
                                React.createElement(
                                    'button',
                                    { onClick: _this2.clickTitlehandler, type: 'button', className: "btn btn-" + (_this2.state.selectedIndex == i ? 'primary' : 'dark') },
                                    item.config.title
                                ),
                                React.createElement(
                                    'button',
                                    { onClick: _this2.clickClosehandler, className: "btn btn-" + (_this2.state.selectedIndex == i ? 'primary' : 'dark'), type: 'button' },
                                    React.createElement(
                                        'span',
                                        null,
                                        '\xD7'
                                    )
                                )
                            );
                        })
                    ),
                    React.createElement(
                        'div',
                        { className: 'flex-grow-1 flex-shrink-1 bg-dark d-flex' },
                        this.state.projects.map(function (item, i) {
                            item.projectIndex = i;
                            item.projectManager = projectManager;
                            return React.createElement(ProjectDesigner, { key: i, project: item, projConfig: item.config, className: 'flex-grow-1 flex-shrink-1 ' + (_this2.state.selectedIndex == i ? 'd-flex' : 'd-none') });
                        })
                    )
                )
            );
        }
    }]);

    return ProjectContainer;
}(React.PureComponent);