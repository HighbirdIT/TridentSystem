class IAttributeable extends EventEmitter{
    constructor(initAttrValues,consignor,description) {
        super();
        consignor = consignor == null ? this : consignor;
        this.consignor = consignor;
        this.attrVersion = 0;
        this.description = description == null ? '未知' : description;
        consignor = Object.assign(consignor, initAttrValues);
        EnhanceEventEmiter(this);
        this.cacheObj = {};
        //autoBind(this);
    }

    findAttributeByName(attrName){
        var foundAttr = null;
        var rlt = this.cacheObj[attrName + '_c'];
        if(rlt != null){
            return rlt;
        }
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
        this.cacheObj[attrName + '_c'] = foundAttr;
        return foundAttr;
    }

    filterAttributesByValType(targetvaluetype){
        var rlt_arr = [];
        this.attrbuteGroups.forEach(group=>{
            group.attrs_arr.forEach(attr=>{
                if(attr.valueType === targetvaluetype){
                    rlt_arr.push(attr);
                }
            });
        });
        return rlt_arr;
    }

    __setAttribute(realAtrrName, value, attrName, indexInArray){
        var oldValue = this.consignor[realAtrrName];
        if(typeof value === 'string' && oldValue == value){
            return false;
        }
        if(attrName == null){
            attrName = realAtrrName;
        }
        this.consignor[realAtrrName] = value;
        if(this.__attributeChanged != null){
            this.__attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray);
        }
        return true;
    }

    setAttribute(attrName, value, indexInArray){
        if(typeof(this.consignor['set_' + attrName]) == 'function'){
            return this.consignor['set_' + attrName](value, indexInArray);
        }
        else
        {
            var realAtrrName = attrName + (indexInArray >= 0 ? '_' + indexInArray : '');
            if(this.__setAttribute(realAtrrName, value, attrName, indexInArray) != false){
                this.attrChanged(attrName, {index:indexInArray});
            }
        }
    }

    hasAttribute(attrName){
        return this.findAttributeByName(attrName) != null;
    }

    getAttribute(attrName, index){
        if(index == null){
            var keypos = attrName.lastIndexOf('_');
            if(keypos != -1){
                // maybe attrarry
                var nameStr = attrName.substring(0, keypos);
                var indexStr = attrName.substring(keypos + 1);
                attrName = nameStr;
                index = indexStr;
                if(isNaN(index)){
                    console.error('vist attrarray item without index:' + attrName);
                }
            }
        }
        if(typeof(this.consignor['get_' + attrName]) == 'function'){
            return this.consignor['get_' + attrName](index);
        }
        var realname = index == null ? attrName : attrName + '_' + index;
        var rlt = this[realname];
        if(rlt == null){
            var attrItem = this.findAttributeByName(attrName);
            if(attrItem == null){
                console.error('访问不存在的属性:' + attrName);
            }
            rlt = attrItem.defaultVal;
            if(rlt == null && attrItem.valueType != ValueType.Event){
                switch(attrItem.name){
                    case AttrNames.LayoutNames.StyleAttr:
                    case AttrNames.Name:
                    case AttrNames.DataSource:
                    case AttrNames.ProcessTable:
                    case AttrNames.CustomDataSource:
                    break;
                    default:
                    if(attrItem.valueType == ValueType.CustomDataSource){
                        break;
                    }
                    console.warn('属性:' + attrName + '没有默认值');
                }
            }
        }
        return rlt;
    }

    someAttributeChanged(){
        this.attrVersion += 1;
    }

    attrChanged(attrName,params){
        //console.log(attrName + ' changed');
        this.emit(EATTRCHANGED, Object.assign({name:attrName}, params));
    }
    
    getAttrArrayCount(attrName){
        return this.getAttrArrayNames(attrName).length;
    }

    attrNameArraySortFun(a,b){
        return a.index > b.index;
    }

    getAttrArrayList(attrName){
        var rlt = this.cacheObj[attrName + '_arry_cache'];
        if(rlt == null){
            var tem_arr = [];
            var nameReg = new RegExp(attrName + "_\\d+$");
            var indexReg = /\d+$/;
            for(var propName in this){
                if(nameReg.test(propName)){
                    var index = parseInt(indexReg.exec(propName)[0]);
                    tem_arr.push({index:index, name:propName});
                }
            }
            tem_arr.sort(this.attrNameArraySortFun);
            rlt = tem_arr;
            this.cacheObj[attrName + '_arry_cache'] = rlt;
        }
        return rlt;
    }

    growAttrArray(attrName){
        var nowAttrArrayList = this.getAttrArrayList(attrName);
        var useIndex = 0;
        var newAttrname = null;
        while(useIndex < 9999){
            newAttrname = attrName + '_' + useIndex;
            if(nowAttrArrayList.find(e=>{return e.name == newAttrname;}) == null){
                break;
            }
            ++useIndex;
        }
        this[newAttrname] = null;
        nowAttrArrayList.push({index:useIndex, name:newAttrname});
        //nowAttrArrayList.sort(this.attrNameArraySortFun);
        return nowAttrArrayList.length;
    }

    deleteAttrArrayItem(attrName, realName){
        var nowAttrArrayList = this.getAttrArrayList(attrName);
        var index = nowAttrArrayList.findIndex(e=>{return e.name == realName;});
        if(index != -1){
            nowAttrArrayList.splice(index, 1);
        }
        delete this[realName];
        //console.log('delete:' + realName);
        this.attrChanged(attrName);
        return nowAttrArrayList.length;
    }

    getJson(){
        var rlt={};
        this.attrbuteGroups.forEach(group=>{
            group.attrs_arr.forEach(attr=>{
                if(!attr.editable)
                    return;
                switch(attr.valueType){
                    case ValueType.CustomDataSource:
                    return;
                }
                var attrItemArray = null;
                if(attr.isArray){
                    attrItemArray = this.getAttrArrayList(attr.name).map(e=>{return e.name;});
                }
                else{
                    attrItemArray = [attr.name];
                }
                attrItemArray.forEach(attrName=>{
                    var val = this[attrName];
                    if(val == null || val == attr.defaultVal){
                        return;
                    }
                    switch(attr.valueType){
                        case ValueType.DataSource:
                        val = val.code;
                        break;
                    }
                    rlt[attrName] = val;
                });
            });
        });
        return rlt;
    }

    restoreJson(target){
        Object.assign(this, target);
    }
}