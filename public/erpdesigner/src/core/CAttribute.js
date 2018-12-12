class CAttribute{
    constructor(label,name,valueType,defaultVal,editable,isArray,options_arr) {
        Object.assign(this,{
            label:label,
            name : name,
            valueType:valueType,
            editable:editable != false,
            inputID:name + '_input',
            isArray:isArray,
            options_arr:options_arr,
            defaultVal:defaultVal,
        });
    }
}

const AttrNames={
    Title:'title',
    Text:'text',
    Test:'test',
    Orientation:'orientation',
    RealName:'realName',
    Chidlren:'children',

    LayoutNames:{
        APDClass:'apdClass',
        StyleAttr:'styleAttr',
    },

    StyleAttrNames:{
        Display:'display',
        Width:'width',
        Height:'height',
        FlexGrow:'flex-grow',
        FlexShrink:'flex-shrink',
    },

    StyleValues:{
        Display:{
            None:'none',
            Block:'block',
            Inline:'inline',
            InlineBlock:'inline-block',
            Flex:'flex',
        }
    }
};

function InitAttrNames(target){
    var values_arr = [];
    var names_arr = [];
    for(var si in target){
        var val = target[si];
        if(typeof val === 'object'){
            InitAttrNames(val);
        }
        else{
            if(target[val] != null){
                console.error('AttrName:'+ si + '设置错误!');
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

const StyleAttrSetting={};

StyleAttrSetting[AttrNames.StyleAttrNames.Display] = {type:ValueType.String, def:AttrNames.StyleValues.Display.Flex,options_arr:AttrNames.StyleValues.Display.values_arr};
StyleAttrSetting[AttrNames.StyleAttrNames.FlexGrow] = {type:ValueType.Boolean, def:true};
StyleAttrSetting[AttrNames.StyleAttrNames.FlexShrink] = {type:ValueType.Boolean, def:true};
StyleAttrSetting[AttrNames.StyleAttrNames.Width] = {type:ValueType.String, def:''};
StyleAttrSetting[AttrNames.StyleAttrNames.Height] = {type:ValueType.String, def:''};

const CouldAppendClasses_arr = [''];