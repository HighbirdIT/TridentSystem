class CAttribute{
    constructor(label,name,valueType,getFun,setFun) {
        Object.assign(this,{
            label:label,
            name : name,
            valueType:valueType,
            getFun:getFun,
            setFun:setFun,
            inputID:name + '_input',
        });
    }

    nowValue(){
        return this.getFun();
    }
}