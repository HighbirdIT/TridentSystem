class CAttributeGroup extends EventEmitter{
    constructor(label,attrs_arr) {
        super();
        EnhanceEventEmiter(this);
        var self = this;
        this.label = label;
        this.setAttrs(attrs_arr);
    }

    appandAttr(target){
        if(Array.isArray(target)){
            this.attrs_arr = this.attrs_arr.concat(target);
            target.forEach(attr=>{
                attr.group = self;
            });
        }
        else{
            this.attrs_arr.push(target);
            target.group = self;
        }
    }

    setAttrs(attrs_arr){
        this.attrs_arr = attrs_arr;
        attrs_arr.forEach(attr=>{
            attr.group = self;
        });
    }

    findAttrByName(attrName){
        return this.attrs_arr.find(e=>{return e.name == attrName;});
    }
}