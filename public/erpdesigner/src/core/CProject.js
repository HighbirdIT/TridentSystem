class CProject extends IAttributeable{
    constructor(title) {
        super();
        this.config = {
            title : title,
            isPC : 0,
        };
        this.description = '页面';

        var self = this;
        autoBind(self);
        this.attrbuteGroups = [
            new CAttributeGroup('基本设置',self,[
                new CAttribute('页面名称','title','', this.getLabel, this.setLabel),
                new CAttribute('真实名称','realName','', this.getRealName, null),
            ])
        ];
    }

    getLabel(){
        return this.config.title;
    }

    setLabel(newtitle){
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

    getRealName(){
        return this.config.title + 'Real';
    }
}