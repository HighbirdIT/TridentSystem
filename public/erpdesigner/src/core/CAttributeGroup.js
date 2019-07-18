class CAttributeGroup extends EventEmitter{
    constructor(label,attrs_arr) {
        super();
        EnhanceEventEmiter(this);
        this.label = label;
        this.setAttrs(attrs_arr);
    }

    appandAttr(target){
        var self = this;
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
        var self = this;
        this.attrs_arr = attrs_arr;
        attrs_arr.forEach(attr=>{
            attr.group = self;
        });
    }

    findAttrByName(attrName){
        return this.attrs_arr.find(e=>{return e.name == attrName;});
    }

    setVisible(target, val) {
        var nowVisible = target[this.label + '_visible'];
        if(nowVisible == val)
        {
            return;
        }
        target[this.label + '_visible'] = val;
        this.fireEvent('changed');
    }

    clone(){
        var rlt = new CAttributeGroup(this.label, this.attrs_arr.concat());
        return rlt;
    }
}