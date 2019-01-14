'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContainerKernelBase = function (_ControlKernelBase) {
    _inherits(ContainerKernelBase, _ControlKernelBase);

    function ContainerKernelBase(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, ContainerKernelBase);

        var _this = _possibleConstructorReturn(this, (ContainerKernelBase.__proto__ || Object.getPrototypeOf(ContainerKernelBase)).call(this, initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson));

        _this.children = [];

        if (kernelJson != null) {
            if (kernelJson.children != null) {
                kernelJson.children.forEach(function (childJson) {
                    var ctlConfig = DesignerConfig.findConfigByType(childJson.type);
                    if (ctlConfig == null) {
                        console.warn('type:' + childJson.type + '未找到配置数据');
                        return;
                    }
                    var newCtl = new ctlConfig.kernelClass(initData, _this, createHelper, childJson);
                });
            }
        }
        return _this;
    }

    _createClass(ContainerKernelBase, [{
        key: 'getChildIndex',
        value: function getChildIndex(childKernel) {
            return this.children.indexOf(childKernel);
        }
    }, {
        key: 'appandChild',
        value: function appandChild(childKernel, index) {
            var temp = null;
            if (childKernel.parent == this) {
                if (index >= this.children.length) {
                    index = this.children.length - 1;
                }
                if (index >= 0 && index <= this.children.length) {
                    var nowIndex = this.children.indexOf(childKernel);
                    if (nowIndex != index) {
                        if (nowIndex != -1) {
                            var step = Math.sign(index - nowIndex);
                            while (nowIndex != index) {
                                this.children[nowIndex] = this.children[nowIndex + step];
                                nowIndex += step;
                            }
                            this.children[index] = childKernel;
                        } else {
                            if (index == this.children.length) {
                                this.children.push(childKernel);
                            } else if (index == 0) {
                                this.children.unshift(childKernel);
                            } else {
                                var moveingIndex = this.children.length + 1;
                                while (moveingIndex != index) {
                                    this.children[moveingIndex] = this.children[moveingIndex - 1];
                                    --moveingIndex;
                                }
                                this.children[index] = childKernel;
                            }
                        }

                        this.attrChanged(AttrNames.Chidlren);
                        //console.log('swap:' + nowIndex + '->' + index);
                    }
                }
                return;
            }
            if (childKernel.parent) {
                childKernel.parent.removeChild(childKernel);
            }
            if (index < 0) index = 0;
            if (isNaN(index)) index = this.children.length;
            if (index > this.children.length) index = this.children.length;

            //console.log('appandIndex:' + index);
            if (index == 0) {
                index = index;
            }
            this.children.splice(index, 0, childKernel);
            //this.children.push(childKernel);
            childKernel.parent = this;
            this.attrChanged(AttrNames.Chidlren);
        }
    }, {
        key: 'removeChild',
        value: function removeChild(childKernel) {
            var i = this.children.indexOf(childKernel);
            if (i != -1) {
                this.children.splice(i, 1);
                childKernel.parent = null;
                this.attrChanged(AttrNames.Chidlren);
            }
            childKernel.parent = null;
        }
    }, {
        key: 'getChildIndex',
        value: function getChildIndex(childKernel) {
            return this.children.indexOf(childKernel);
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var rlt = _get(ContainerKernelBase.prototype.__proto__ || Object.getPrototypeOf(ContainerKernelBase.prototype), 'getJson', this).call(this);
            rlt.children = [];
            this.children.forEach(function (child) {
                rlt.children.push(child.getJson());
            });
            return rlt;
        }
    }]);

    return ContainerKernelBase;
}(ControlKernelBase);