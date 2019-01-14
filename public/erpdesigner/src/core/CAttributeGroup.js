class CAttributeGroup extends EventEmitter{
    constructor(label,attrs_arr) {
        super();
        EnhanceEventEmiter(this);
        var self = this;
        this.label = label;
        this.attrs_arr = attrs_arr;
        attrs_arr.forEach(attr=>{
            attr.group = self;
        });
    }
}