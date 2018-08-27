const CPage_MBAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('标题','title',ValueType.String,true),
        ]),
        new CAttributeGroup('测试设置',[
            new CAttribute('测试','test',ValueType.String,true,1),
        ]),
    ],
};

class CPage_MB extends IAttributeable{
    constructor(initData) {
        super(initData, null, '页面');

        var self = this;
        autoBind(self);
        this.attrbuteGroups = CPage_MBAttrsSetting.groups_arr;
    }

    set_title(newTitle){
        if(newTitle.length > 10){
            newTitle = newTitle.substring(0,10);
        }

        var flag = this.__setAttribute('title', newTitle);
        if(flag){
            this.attrChanged('title');
            this.project.attrChanged('pagetitle',{
                targetPage : this,
            });
        }
        return flag;
    }
}
