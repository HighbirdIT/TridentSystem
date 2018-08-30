class CAttribute{
    constructor(label,name,valueType,editable,isArray,options_arr) {
        Object.assign(this,{
            label:label,
            name : name,
            valueType:valueType,
            editable:editable != false,
            inputID:name + '_input',
            isArray:isArray,
            options_arr:options_arr,
        });
    }
}