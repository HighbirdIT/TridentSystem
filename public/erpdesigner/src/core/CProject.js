
const CProjectAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('页面名称','title',ValueType.String,true),
            new CAttribute('真实名称','realName',ValueType.String,false),
        ])
    ]
}

class CProject extends IAttributeable{
    constructor(title) {
        super();
        this.config = {
            title : title,
            isPC : 0,
        };
        this.description = '页面';

        this.content_PC={
            
        };
        this.content_Mobile={
            pages:[],
        };

        var self = this;
        autoBind(self);
        this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
    }

    get_title(){
        return this.config.title;
    }

    set_title(newtitle){
        if(newtitle.length > 8){
            newtitle = newtitle.substring(0, 8);
        }
        if(newtitle == this.config.title){
            return false;
        }
        var newConfig = updateObject(this.config,{title:newtitle});
        this.projectManager.changeProjectConfig(this.projectIndex, newConfig);
        this.attrChanged(['title','realName']);
        return true;
    }

    get_realName(){
        return this.config.title + 'Real';
    }
}