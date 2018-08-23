const EATTRCHANGED = 'attrChanged';

class IAttributeable extends EventEmitter{
    constructor(initAttrValues) {
        super();
        this.attrVersion = 0;
        this.description = '未知';
        this.attrValues = initAttrValues;
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

    __setAttribute(attrName, value){
        if(this.attrValues[attrName] == value){
            return false;
        }
        this.attrValues[attrName] = value;
        return true;
    }

    setAttribute(attrName, value){
        if(typeof(this['set_' + attrName]) == 'function'){
            return this['set_' + attrName](value);
        }
        else
        {
            if(this.__setAttribute(attrName, value) != false){
                this.attrChanged(attrName);
            }
        }
    }

    getAttribute(attrName){
        if(typeof(this['get_' + attrName]) == 'function'){
            return this['get_' + attrName]();
        }
        return this.attrValues[attrName];
    }

    someAttributeChanged(){
        this.attrVersion += 1;
    }

    attrChanged(attrName){
        this.emit(EATTRCHANGED, {name:attrName});
    }
}