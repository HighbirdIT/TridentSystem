class CAttribute{
    constructor(label,name,valueType,editable,isArray) {
        Object.assign(this,{
            label:label,
            name : name,
            valueType:valueType,
            editable:editable,
            inputID:name + '_input',
            isArray:isArray
        });
    }
}