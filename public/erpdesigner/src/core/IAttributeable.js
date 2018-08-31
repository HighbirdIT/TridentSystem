class IAttributeable extends EventEmitter{
    constructor(initAttrValues,consignor,description) {
        super();
        consignor = consignor == null ? this : consignor;
        this.consignor = consignor;
        this.attrVersion = 0;
        this.description = description == null ? '未知' : description;
        consignor = Object.assign(consignor, initAttrValues);
        //autoBind(this);
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
        if(this.consignor[attrName] == value){
            return false;
        }
        this.consignor[attrName] = value;
        return true;
    }

    setAttribute(attrName, value){
        if(typeof(this.consignor['set_' + attrName]) == 'function'){
            return this.consignor['set_' + attrName](value);
        }
        else
        {
            if(this.__setAttribute(attrName, value) != false){
                this.attrChanged(attrName);
            }
        }
    }

    getAttribute(attrName){
        if(typeof(this.consignor['get_' + attrName]) == 'function'){
            return this.consignor['get_' + attrName]();
        }
        return this[attrName];
    }

    someAttributeChanged(){
        this.attrVersion += 1;
    }

    attrChanged(attrName,params){
        //console.log(attrName + ' changed');
        this.emit(EATTRCHANGED, Object.assign({name:attrName}, params));
    }
    
    getAttrArrayCount(attrName){
        var countVarName = attrName + '_count';
        if(this[countVarName] == null){
            this[countVarName] = 0;
        }
        return parseInt(this[countVarName]);
    }

    growAttrArray(attrName){
        var countVarName = attrName + '_count';
        if(this[countVarName] == null){
            this[countVarName] = 0;
        }
        this[countVarName] = parseInt(this[countVarName]) + 1;
        return this[countVarName];
    }
}