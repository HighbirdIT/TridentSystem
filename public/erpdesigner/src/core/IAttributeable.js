const EATTRCHANGED = 'attrChanged';

class IAttributeable extends EventEmitter{
    constructor() {
        super();
        this.attrVersion = 0;
        this.description = '未知';
        autoBind(this);
    }

    findAttributeByName(attrName){
        var foundAttr = null;
        this.attrbuteGroups.find(group=>{
            var t = group.attrs_arr.find(attr=>{
                return attr.name === attrName ? attr : null;
            });
            if(t){
                foundAttr = t;
                return true;
            }
            return false;
        });
        return foundAttr;
    }

    someAttributeChanged(){
        this.attrVersion += 1;
    }

    attrChanged(attrName){
        this.emit(EATTRCHANGED, {name:attrName});
    }
}