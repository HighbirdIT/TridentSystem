'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CAttribute = function () {
    function CAttribute(label, name, valueType, defaultVal, editable, isArray, options_arr, dropdownSetting, visible) {
        _classCallCheck(this, CAttribute);

        Object.assign(this, {
            label: label,
            name: name,
            valueType: valueType,
            editable: editable != false,
            inputID: name + '_input',
            isArray: isArray,
            options_arr: options_arr,
            defaultVal: defaultVal,
            dropdownSetting: dropdownSetting,
            visible: visible != false
        });
    }

    _createClass(CAttribute, [{
        key: 'setVisible',
        value: function setVisible(target, val) {
            var nowVisible = target[this.name + '_visible'];
            if (nowVisible == val) {
                return;
            }
            target[this.name + '_visible'] = val;
            this.group.fireEvent('changed');
        }
    }]);

    return CAttribute;
}();

var VarNames = {
    RetProps: 'retProps',
    RetDispather: 'retDispather',
    NowPage: 'nowPage',
    RetElem: 'retElem',
    ThisProps: 'this.props'
};

var AttrNames = {
    Title: 'title',
    Text: 'text',
    Test: 'test',
    Orientation: 'orientation',
    RealName: 'realName',
    Chidlren: 'children',
    IsMain: 'ismain',
    Label: 'label',
    DataSource: 'datasource',
    Name: 'name',
    ValueType: 'valuetype',
    FloatNum: 'floatnum',
    DefaultValue: 'defaultvalue',

    LayoutNames: {
        APDClass: 'apdClass',
        StyleAttr: 'styleAttr'
    },

    StyleAttrNames: {
        Display: 'display',
        Width: 'width',
        Height: 'height',
        FlexGrow: 'flex-grow',
        FlexShrink: 'flex-shrink'
    },

    StyleValues: {
        Display: {
            None: 'none',
            Block: 'block',
            Inline: 'inline',
            InlineBlock: 'inline-block',
            Flex: 'flex'
        }
    }
};

function InitAttrNames(target) {
    var values_arr = [];
    var names_arr = [];
    for (var si in target) {
        var val = target[si];
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
            InitAttrNames(val);
        } else {
            if (target[val] != null) {
                console.error('AttrName:' + si + '设置错误!');
            }
            target[val] = 1;
            values_arr.push(val);
            names_arr.push(si);
        }
    }
    target.values_arr = values_arr;
    target.names_arr = names_arr;
}

InitAttrNames(AttrNames);

var StyleAttrSetting = {};

StyleAttrSetting[AttrNames.StyleAttrNames.Display] = { type: ValueType.String, def: AttrNames.StyleValues.Display.Flex, options_arr: AttrNames.StyleValues.Display.values_arr };
StyleAttrSetting[AttrNames.StyleAttrNames.FlexGrow] = { type: ValueType.Boolean, def: true };
StyleAttrSetting[AttrNames.StyleAttrNames.FlexShrink] = { type: ValueType.Boolean, def: true };
StyleAttrSetting[AttrNames.StyleAttrNames.Width] = { type: ValueType.String, def: '' };
StyleAttrSetting[AttrNames.StyleAttrNames.Height] = { type: ValueType.String, def: '' };

var CouldAppendClasses_arr = [''];