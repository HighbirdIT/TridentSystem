function autoBind(self, options){
	options = Object.assign({}, options);
	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		if (options.include) {
			return options.include.some(match);
		}
		if (options.exclude) {
			return !options.exclude.some(match);
		}
		return true;
	};

	for (const key of Object.getOwnPropertyNames(self.constructor.prototype)) {
		const val = self[key];

		if (key !== 'constructor' && typeof val === 'function' && filter(key)) {
			self[key] = val.bind(self);
		}
	}

	return self;
}

function updateObject(oldObject, newValues) {
    return Object.assign({}, oldObject, newValues);
}

function updateItemInArray(array, itemId, updateItemCallback) {
    var updatedItems = array.map(function (item) {
        if (item.id !== itemId) {
            return item;
        }
        var updatedItem = updateItemCallback(item);
        return updatedItem;
    });

    return updatedItems;
}

function updateItemInArrayByIndex(array, index, updateItemCallback) {
    var updatedItems = array.map(function (item,i) {
        if (i !== index) {
            return item;
        }
        var updatedItem = updateItemCallback(item);
        return updatedItem;
    });

    return updatedItems;
}

function getAttributeByNode(targetNode, attrName, upserach, maxDeep){
	if(upserach == null)
		upserach = true;
	var tNode = targetNode;
	var count = 0;
	do{
		if(tNode.hasAttribute(attrName)){
			return tNode.getAttribute(attrName);
		}
		tNode = tNode.parentNode;
		++count;
	}while(tNode && (maxDeep == null || count < maxDeep));
	return null;
}

function extractPropsFromObj(obj, props_arr){
    var rlt = {};
    props_arr.forEach(prop=>{
        if(obj && obj[prop.name] != null)
            rlt[prop.name] = obj[prop.name];
        else{
            rlt[prop.name] = typeof prop.default == 'function' ? prop.default() : prop.default;
        }
    });
    return rlt;
}