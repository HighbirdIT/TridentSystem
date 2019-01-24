const M_LabelKernel_Type = 'M_Label';
const M_PageKernel_Type = 'M_Page';
const M_ContainerKernel_Type = 'M_Div';
const M_LabeledControlKernel_Type = 'M_LC';
const M_FormKernel_Type = 'M_Form';
const M_TextKernel_Type = 'M_Text';
const ButtonKernel_Type = 'button';

const M_LabelKernel_Prefix = 'M_Label';
const M_PageKernel_Prefix = 'M_Page';
const M_ContainerKernel_Prefix = 'M_Div';
const M_LabeledControlKernel_Prefix = 'M_LC';
const M_FormKernel_Prefix = 'M_Form';
const M_TextKernel_Prefix = 'M_Text';
const ButtonKernel_Prefix = 'Btn';

function GetControlTypeReadableName(type){
    switch(type){
        case M_LabelKernel_Type:
        return '标签';
        case M_PageKernel_Type:
        return '页面';
        case M_ContainerKernel_Type:
        return 'DIV';
        case M_LabeledControlKernel_Type:
        return '操作控件';
        case M_FormKernel_Type:
        return 'Form';
        case M_TextKernel_Type:
        return '文本框';
        case ButtonKernel_Type:
        return '按钮';
    }
    return type;
}

class ControlAPIClass{
    constructor(ctltype){
        this.name = ctltype;
        this.ctltype = ctltype,
        this.ctllabel = GetControlTypeReadableName(ctltype);
        this.propapi_arr = [];
        this.funapi_arr = [];
        this.allapi_arr = [];
        this.api_map = {};
    }

    toString(){
        return this.ctllabel;
    }

    pushApi(apiItem){
        apiItem.setApiClass(this);
        this.api_map[apiItem.id] = apiItem;
        switch(apiItem.type){
            case EApiType.Prop:
                this.propapi_arr.push(apiItem);
            break;
            case EApiType.Fun:
                this.funapi_arr.push(apiItem);
            break;
        }
        this.allapi_arr.push(apiItem);
    }

    getApiItemByid(apiid){
        return this.api_map[apiid];
    }
}

class ApiItem_prop{
    constructor(attrItem, stateName){
        this.type = EApiType.Prop;
        this.attrItem = attrItem;
        this.stateName = stateName == null ? attrItem.name : stateName;
    }
    toString(){
        return 'Get:' + this.apiClass + '.' + this.attrItem.label;
    }
    setApiClass(apiClass){
        this.apiClass = apiClass;
        this.id = 'P-' + this.attrItem.label;
        this.uniqueID = apiClass.name + this.id;
    }
}

class ApiItem_propsetter{
    constructor(stateName){
        this.type = EApiType.PropSetter;
        this.stateName = stateName;
    }
    toString(){
        return 'Set:' + this.apiClass + '.' + this.stateName;
    }
    setApiClass(apiClass){
        this.apiClass = apiClass;
        this.id = 'SP-' + this.stateName;
        this.uniqueID = apiClass.name + this.id;
    }
}

class ApiItem_fun{
    constructor(funName){
        this.type = EApiType.Fun;
    }
    toString(){
        return 'Call:' + this.apiClass + '.' + this.attrItem.label;
    }
    setApiClass(apiClass){
        this.apiClass = apiClass;
        this.id = 'P-' + this.attrItem.label;
        this.uniqueID = apiClass.name + this.id;
    }
}