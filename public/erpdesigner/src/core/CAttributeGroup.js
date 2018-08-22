class CAttributeGroup{
    constructor(label,attrs_arr) {
        var self = this;
        this.label = label;
        this.attrs_arr = attrs_arr;
        attrs_arr.forEach(attr=>{
            attr.group = self;
        });
    }
}