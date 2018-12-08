'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var M_ControlKernelBaseAttrsSetting = {
    layoutGrop: new CAttributeGroup('布局设置', [new CAttribute('Style', AttrNames.LayoutNames.StyleAttr, ValueType.StyleValues, null, true, true), new CAttribute('Class', AttrNames.LayoutNames.APDClass, ValueType.String, '', true, true)])
};

/*
new CAttribute('宽度',AttrNames.Width,ValueType.String,''),
            new CAttribute('高度',AttrNames.Height,ValueType.String,''),
            new CAttribute('FlexGrow',AttrNames.FlexGrow,ValueType.Boolean,true),
            new CAttribute('FlexShrink',AttrNames.FlexShrink,ValueType.Boolean,true),
*/

var LayoutAttrNames_arr = M_ControlKernelBaseAttrsSetting.layoutGrop.attrs_arr.map(function (e) {
    return e.name;
});

var ControlKernelBase = function (_IAttributeable) {
    _inherits(ControlKernelBase, _IAttributeable);

    function ControlKernelBase(initData, type, description, attrbuteGroups, parentKernel, createHelper, kernelJson) {
        _classCallCheck(this, ControlKernelBase);

        var _this = _possibleConstructorReturn(this, (ControlKernelBase.__proto__ || Object.getPrototypeOf(ControlKernelBase)).call(this, initData, null, description));

        _this.project = parentKernel.project;
        _this.type = type;
        if (attrbuteGroups == null) {
            attrbuteGroups = [];
        }
        if (attrbuteGroups[0] != M_ControlKernelBaseAttrsSetting.layoutGrop) {
            attrbuteGroups.unshift(M_ControlKernelBaseAttrsSetting.layoutGrop);
        }
        _this.attrbuteGroups = attrbuteGroups;

        _this.clickHandler = _this.clickHandler.bind(_this);

        _this.project.registerControl(_this);
        if (parentKernel.project != parentKernel) {
            parentKernel.appandChild(_this);
        }
        return _this;
    }

    _createClass(ControlKernelBase, [{
        key: 'renderSelf',
        value: function renderSelf() {
            return null;
        }
    }, {
        key: 'fireForceRender',
        value: function fireForceRender() {
            this.emit(EFORCERENDER);
        }
    }, {
        key: 'setSelected',
        value: function setSelected(flag) {
            if (this.currentControl) {
                this.currentControl.setSelected(flag);
            }
            this.attrChanged(flag ? 'selected' : 'unselected');
        }
    }, {
        key: 'clickHandler',
        value: function clickHandler(ev) {
            //return;
            var ctlid = getAttributeByNode(ev.target, 'ctlid', true);
            if (ctlid == this.id && this.project.designer) {
                //this.project.designer.attributePanel.setTarget(this);
                this.project.designer.selectKernel(this);
            }
            ev.preventDefault();
        }
    }, {
        key: 'getRootDivClass',
        value: function getRootDivClass() {
            var _this2 = this;

            var apdAttrList = this.getAttrArrayList(AttrNames.LayoutNames.APDClass);
            var temmap = {};
            var self = this;
            apdAttrList.forEach(function (attrArrayItem) {
                var val = _this2.getAttribute(attrArrayItem.name);
                if (!IsEmptyString(val) && temmap[val] == null) {
                    temmap[val] = 1;
                }
            });
            var rlt = '';
            for (var si in temmap) {
                rlt += ' ' + si;
            }
            return rlt;
        }
    }]);

    return ControlKernelBase;
}(IAttributeable);