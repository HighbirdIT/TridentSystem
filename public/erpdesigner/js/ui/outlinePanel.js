'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OutlineItem = function (_React$PureComponent) {
    _inherits(OutlineItem, _React$PureComponent);

    function OutlineItem(props) {
        _classCallCheck(this, OutlineItem);

        var _this = _possibleConstructorReturn(this, (OutlineItem.__proto__ || Object.getPrototypeOf(OutlineItem)).call(this, props));

        if (_this.props.kernel.outlineProfile == null) {
            _this.props.kernel.outlineProfile = {
                collapsed: false,
                selected: false
            };
        } else {
            _this.props.kernel.outlineProfile.outlineItem = _this;
        }
        if (_this.props.kernel.currentControl) {
            _this.props.kernel.outlineProfile.selected = _this.props.kernel.currentControl.state.selected == true;
        }
        _this.state = Object.assign({ kernel: _this.props.kernel }, _this.props.kernel.outlineProfile);
        autoBind(_this);
        React_Make_AttributeListener(_this, ['children', 'selected', 'unselected', 'placeChanged']);
        _this.rootElemRef = React.createRef();
        return _this;
    }

    _createClass(OutlineItem, [{
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (changedAttrName == 'children') {
                this.setState({
                    magicObj: {}
                });
            } else if (changedAttrName == 'selected') {
                this.props.kernel.outlineProfile.selected = true;
                this.setState({
                    selected: true
                });
                this.props.itemSelected(this, this.rootElemRef.current);
            } else if (changedAttrName == 'unselected') {
                this.props.kernel.outlineProfile.selected = false;
                this.setState({
                    selected: false
                });
            } else if (changedAttrName == 'placeChanged') {
                this.props.itemSelected(this, this.rootElemRef.current);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.kernel);
            if (this.props.kernel.outlineProfile.outlineItem == this) {
                this.props.kernel.outlineProfile.outlineItem = null;
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenTarget(this.props.kernel);
            this.props.kernel.outlineProfile.outlineItem = this;
        }
    }, {
        key: 'toggleCollapse',
        value: function toggleCollapse() {
            this.props.kernel.outlineProfile.collapsed = !this.state.collapsed;
            this.setState({
                collapsed: !this.state.collapsed
            });
        }
    }, {
        key: 'collapse',
        value: function collapse() {
            this.props.kernel.outlineProfile.collapsed = true;
            this.setState({
                collapsed: true
            });
        }
    }, {
        key: 'uncollapse',
        value: function uncollapse() {
            this.props.kernel.outlineProfile.collapsed = false;
            this.setState({
                collapsed: false
            });
        }
    }, {
        key: 'clickhandler',
        value: function clickhandler() {
            this.state.kernel.project.designer.selectKernel(this.state.kernel);
        }
    }, {
        key: 'dragTimeOutHandler',
        value: function dragTimeOutHandler() {
            //console.log('dragTimeOutHandler');
            this.props.wantDragAct(this);
        }
    }, {
        key: 'mouseDownHandler',
        value: function mouseDownHandler(ev) {
            this.dragTimeOut = setTimeout(this.dragTimeOutHandler, 400);
            //console.log(ev.target);
            window.addEventListener('mouseup', this.windowMouseUpHandler);
        }
    }, {
        key: 'windowMouseUpHandler',
        value: function windowMouseUpHandler(ev) {
            if (this.dragTimeOut) {
                clearTimeout(this.dragTimeOut);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var self = this;
            if (this.state.kernel != this.props.kernel) {
                if (this.state.kernel) {
                    this.unlistenTarget(this.state.kernel);
                }
                if (this.props.kernel) {
                    this.listenTarget(this.props.kernel);
                    if (this.props.kernel.outlineProfile) {
                        this.props.kernel.outlineProfile = {
                            collapsed: false,
                            selected: false
                        };
                    }
                }
                setTimeout(function () {
                    self.setState(_this2.props.kernel.outlineProfile);
                }, 1);
                return null;
            }

            var kernel = this.state.kernel;
            if (kernel == null) return null;
            var isContainer = kernel.children != null;
            var hasChild = isContainer && kernel.children.length > 0;
            var offsetStyle = { width: this.props.deep * 25 + (hasChild ? 0 : 7) + 'px' };
            return React.createElement(
                'div',
                { key: kernel.name, className: 'outlineItemDiv' + (this.props.deep ? ' ' : ' topest') + (isContainer ? " d-felx flex-column" : '') },
                React.createElement(
                    'div',
                    { className: 'd-flex' },
                    React.createElement('span', { style: offsetStyle, className: 'flex-grow-0 flex-shrink-0' }),
                    !hasChild ? null : React.createElement('span', { onClick: this.toggleCollapse, className: 'flex-grow-0 flex-shrink-0 ml-1 icon-sm btn-secondary btn-sm' + (this.state.collapsed ? ' icon-right btn-info' : ' icon-down btn-secondary') }),
                    React.createElement(
                        'div',
                        { className: 'outlineItem flex-grow-0 flex-shrink-0' + (kernel.__placing ? ' bg-dark text-light' : ''), ctlselected: this.state.selected ? ' active' : null, onClick: this.clickhandler, onMouseDown: this.mouseDownHandler, ref: this.rootElemRef },
                        (kernel.__placing ? '*' : '') + kernel.name
                    )
                ),
                kernel.__placing || this.state.collapsed || kernel.children == null || kernel.children.length == 0 ? null : kernel.children.map(function (childKernel) {
                    return React.createElement(OutlineItem, { key: childKernel.name, kernel: childKernel, deep: _this2.props.deep + 1, itemSelected: _this2.props.itemSelected, wantDragAct: _this2.props.wantDragAct });
                })
            );
        }
    }]);

    return OutlineItem;
}(React.PureComponent);

var OutlinePanel = function (_React$PureComponent2) {
    _inherits(OutlinePanel, _React$PureComponent2);

    function OutlinePanel(props) {
        _classCallCheck(this, OutlinePanel);

        var _this3 = _possibleConstructorReturn(this, (OutlinePanel.__proto__ || Object.getPrototypeOf(OutlinePanel)).call(this, props));

        var editingPage = _this3.props.project.getEditingPage();
        _this3.state = { editingPage: editingPage };
        React_Make_AttributeListener(_this3, ['editingPage', 'children']);
        autoBind(_this3);

        _this3.listenTarget(editingPage);
        _this3.scrollDivRef = React.createRef();
        _this3.bottomDivRef = React.createRef();
        return _this3;
    }

    _createClass(OutlinePanel, [{
        key: 'selectKernel',
        value: function selectKernel(kernel) {
            this.setState({ selectedKernel: kernel });
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenTarget(this.props.project);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenTarget(this.props.project);
        }
    }, {
        key: 'aAttrChanged',
        value: function aAttrChanged(changedAttrName) {
            if (changedAttrName == 'children') {
                this.setState({ magicObj: {} });
            } else if (changedAttrName == 'editingPage') {
                var newEditingPage = this.props.project.getEditingPage();
                if (newEditingPage != this.state.editingPage) {
                    if (this.state.editingPage) {
                        this.unlistenTarget(this.state.editingPage);
                    }
                    if (newEditingPage) {
                        this.listenTarget(newEditingPage);
                    }
                    this.setState({
                        editingPage: newEditingPage
                    });
                }
            }
        }
    }, {
        key: 'wantDragAct',
        value: function wantDragAct(targetItem) {
            console.log(targetItem);
            this.beforeDragData = {
                kernel: targetItem.props.kernel,
                parent: targetItem.props.kernel.parent,
                index: targetItem.props.kernel.parent.getChildIndex(targetItem.props.kernel)
            };

            //targetItem.collapse();
            this.props.project.designer.startPlaceKernel(targetItem.props.kernel, this.dragEndHandler);
        }
    }, {
        key: 'dragEndHandler',
        value: function dragEndHandler(theKernel) {
            if (theKernel == this.beforeDragData.kernel) {
                if (theKernel.parent == null) {
                    this.beforeDragData.parent.appandChild(theKernel, this.beforeDragData.index);
                }
            }
            if (this.autoScrollInt) {
                clearInterval(this.autoScrollInt);
                this.autoScrollInt = null;
            }
            this.beforeDragData = null;
        }
    }, {
        key: 'itemSelected',
        value: function itemSelected(itemCtl, itemElem) {
            if (this.props.project.placingKernel != null && this.bMouseInPanel) {
                return;
            }
            var itemRect = itemElem.getBoundingClientRect();
            var scrollDivRect = this.scrollDivRef.current.getBoundingClientRect();
            var scrollBarSize = 25;
            if (itemRect.left < scrollDivRect.left) {
                this.scrollDivRef.current.scrollLeft -= scrollDivRect.left - itemRect.left + scrollBarSize;
            } else if (itemRect.right > scrollDivRect.right - scrollBarSize) {
                this.scrollDivRef.current.scrollLeft += itemRect.right - scrollDivRect.right + scrollBarSize;
            }

            if (itemRect.top < scrollDivRect.top) {
                this.scrollDivRef.current.scrollTop -= scrollDivRect.top - itemRect.top + scrollBarSize;
            } else if (itemRect.bottom > scrollDivRect.bottom - scrollBarSize) {
                this.scrollDivRef.current.scrollTop += itemRect.bottom - scrollDivRect.bottom + scrollBarSize;
            }
        }
    }, {
        key: 'searchHitResult',
        value: function searchHitResult(pos, kernel) {
            var outlineItem = kernel.outlineProfile && kernel.outlineProfile.outlineItem ? kernel.outlineProfile.outlineItem : null;
            if (outlineItem == null) return null;
            var kernelRect = outlineItem.rootElemRef.current ? outlineItem.rootElemRef.current.getBoundingClientRect() : null;
            if (!kernelRect) {
                return null;
            }
            if (MyMath.isPointInRect(kernelRect, pos)) {
                return { kernel: kernel, outlineItem: outlineItem, rect: kernelRect };
            }
            if (pos.y < kernelRect.bottom) {
                return { lastKernel: kernel, lastRect: kernelRect };
            }
            if (kernel.children && kernel.children.length > 0) {
                for (var ci in kernel.children) {
                    var rlt = this.searchHitResult(pos, kernel.children[ci]);
                    if (rlt) return rlt;
                }
            }
            return null;
        }
    }, {
        key: 'placePosChanged',
        value: function placePosChanged(newPos, targetKernel) {
            var nowScrollDiv = this.scrollDivRef.current;
            var scrollDivRect = nowScrollDiv.getBoundingClientRect();
            this.bMouseInPanel = MyMath.isPointInRect(scrollDivRect, newPos);
            if (this.bMouseInPanel) {
                //console.log('isPointInRect');
                var checkBound = 40;
                var step = 5;
                if (newPos.x - scrollDivRect.left < checkBound) {
                    this.scrollHStep = -step;
                } else if (scrollDivRect.right - newPos.x < checkBound) {
                    this.scrollHStep = step;
                } else {
                    this.scrollHStep = 0;
                }

                if (newPos.y - scrollDivRect.top < checkBound) {
                    this.scrollVStep = -step;
                } else if (scrollDivRect.bottom - newPos.y < checkBound) {
                    this.scrollVStep = step;
                } else {
                    this.scrollVStep = 0;
                }

                var targetKernelRect = targetKernel.outlineProfile && targetKernel.outlineProfile.outlineItem && targetKernel.outlineProfile.outlineItem.rootElemRef.current ? targetKernel.outlineProfile.outlineItem.rootElemRef.current.getBoundingClientRect() : null;
                if (targetKernelRect && MyMath.isPointInRect(targetKernelRect, newPos)) {
                    //console.log('move in self outlineItem');
                    return;
                }

                var hitResult = null;
                for (var ci in this.state.editingPage.children) {
                    hitResult = this.searchHitResult(newPos, this.state.editingPage.children[ci]);
                    if (hitResult) break;
                }
                if (hitResult && hitResult.kernel) {
                    if (hitResult.kernel == targetKernel) return;
                    if (hitResult.kernel.children != null) {
                        if (newPos.y - hitResult.rect.top <= 5) {
                            hitResult.kernel.parent.appandChild(targetKernel, hitResult.kernel.parent.getChildIndex(hitResult.kernel));
                        } else {
                            hitResult.kernel.appandChild(targetKernel);
                        }
                    } else if (hitResult.kernel.parent) {
                        hitResult.kernel.parent.appandChild(targetKernel, hitResult.kernel.parent.getChildIndex(hitResult.kernel));
                    }
                } else {
                    // can not found
                    var bottomDivRect = this.bottomDivRef.current.getBoundingClientRect();
                    if (bottomDivRect.top < newPos.y) {
                        this.state.editingPage.appandChild(targetKernel);
                    }
                }
            }
        }
    }, {
        key: 'startPlace',
        value: function startPlace() {
            this.autoScrollInt = setInterval(this.autoScrollHandler, 50);
            this.scrollHStep = 0;
            this.scrollVStep = 0;
        }
    }, {
        key: 'endPlace',
        value: function endPlace() {
            clearInterval(this.autoScrollInt);
            this.autoScrollInt = null;
        }
    }, {
        key: 'autoScrollHandler',
        value: function autoScrollHandler() {
            this.scrollDivRef.current.scrollLeft += this.scrollHStep;
            this.scrollDivRef.current.scrollTop += this.scrollVStep;
            //console.log(this.scrollHStep);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            return React.createElement(
                'div',
                { id: 'outlineRoot', className: 'flex-grow-1 flex-shrink-1 bg-light d-flex flex-column mw-100' },
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn flex-grow-0 flex-shrink-0 bg-secondary text-light', style: { borderRadius: '0em', height: '2.5em', overflow: 'hidden' } },
                    '\u5927\u7EB2'
                ),
                React.createElement(
                    'div',
                    { className: 'flex-grow-1 flex-shrink-1 autoScroll', ref: this.scrollDivRef },
                    this.state.editingPage && this.state.editingPage.children.map(function (kernal) {
                        return React.createElement(OutlineItem, { key: kernal.name, kernel: kernal, deep: 0, itemSelected: _this4.itemSelected, wantDragAct: _this4.wantDragAct });
                    }),
                    React.createElement('div', { ref: this.bottomDivRef, style: { height: '20px' } })
                )
            );
        }
    }]);

    return OutlinePanel;
}(React.PureComponent);