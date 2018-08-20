class CAttributeGroup{
    constructor(label,belongObj,attrs_arr) {
        var self = this;
        this.label = label;
        this.attrs_arr = attrs_arr;
        this.belongObj = belongObj;
        attrs_arr.forEach(attr=>{
            attr.group = self;
        });
    }
}