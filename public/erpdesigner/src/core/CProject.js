
const CProjectAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('页面名称','title',ValueType.String,true),
            new CAttribute('真实名称','realName',ValueType.String,false),
        ])
    ]
}

var projNames_project = {};
function genProjectName(){
    var rlt = '';
    for(var i=1; i<999; ++i){
        rlt = 'PROJ_' + i;
        if(projNames_project[rlt] == null)
            break;
    }
    projNames_project[rlt] = 1;
    return rlt;
}

class CProject extends IAttributeable{
    constructor(title) {
        super({
            title:title,
        },null,'方案');

        var self = this;
        autoBind(self);
        this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        this.defaultNameCounter = {};
        this.controlName_map = {};
        this.cacheState = {};
        this.dataMaster = new DataMaster(this);

        this.designeConfig={
            name:genProjectName(),
            editingType:'MB',
            editingPage:{
                name:''
            },
            description:'页面'
        }

        this.content_PC={
            pages:[],
        };
        var mainPage=new M_PageKernel({
            title:'主页面',
            isMain:1,
            nav:{
                hidden:1,
                leftBtn:{
                    hidden:0,
                    label:'返回',
                    action:'retutn'
                },
                rightBtn:{
                    hidden:0
                }
            },
            body:{
                direction:'column'
            }
        }, this);
        /*
        var secondPage=new M_PageKernel({
            title:'次页面',
            isMain:0,
            nav:{
                hidden:1,
                leftBtn:{
                    hidden:0,
                    label:'返回',
                    action:'retutn'
                },
                rightBtn:{
                    hidden:0
                }
            },
            body:{
                direction:'column'
            }
        }, this);
        */
        mainPage.project = this;
        //secondPage.project = this;
        this.content_Mobile={
            pages:[mainPage],
        };
    }

    genControlName(prefix){
        if(prefix == null){
            console.warn('genNodeId参数不能为空');
            return;
        }
        var testI = 0;
        var useID = '';
        while(testI < 9999){
            useID = prefix + '_' + testI;
            if(this.controlName_map[useID] == null){
                break;
            }
            ++testI;
        }
        return useID;
    }

    createKernalByType(ctlType){
        var ctlConfig = DesignerConfig.findConfigByType(ctlType);
        if(ctlConfig == null){
            console.warn('找不到ctl type:' + ctlType + '的config');
            return null;
        }
        return new ctlConfig.kernelClass({}, this);
    }

    setEditingPageByName(pageName){
        var thePage = this.getPageByName(pageName);
        if(thePage == null)
            return false;
        this.designeConfig.editingPage.name = thePage.name;
        this.attrChanged('editingPage');
    }

    getPageByName(pageName){
        var rlt = null;
        if(this.designeConfig.editingType == 'PC'){
            rlt = this.content_PC.pages.find(item=>{return item.name == pageName;});
            if(rlt == null){
                rlt = this.content_PC.pages.length > 0 ? this.content_PC.pages[0] : null;
            }
        }
        else{
            rlt = this.content_Mobile.pages.find(item=>{return item.name == pageName;});
            if(rlt == null){
                rlt = this.content_Mobile.pages.length > 0 ? this.content_Mobile.pages[0] : null;
            }
        }
        return rlt;
    }

    getEditingPage(){
        var nowEditingPageName = this.designeConfig.editingPage.name;
        return this.getPageByName(this.designeConfig.editingPage.name);
    }

    setEditingType(newValue){
        
    }

    toggleEditingType(newValue){
        this.designeConfig.editingType = this.designeConfig.editingType == 'PC' ? 'MB' : 'PC';
        this.attrChanged('editingType');
        return true;
    }

    set_title(newtitle){
        if(newtitle.length > 8){
            newtitle = newtitle.substring(0, 8);
        }
        if(this.__setAttribute('title', newtitle)){
            this.attrChanged(['title','realName']);
            return true;
        }
        return false;
    }

    get_realName(){
        return this.getAttribute('title') + 'Real';
    }
}