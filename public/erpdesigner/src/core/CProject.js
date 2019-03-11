
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
    constructor(title, jsonData) {
        super({
            title:title,
        },null,'方案');

        var self = this;
        autoBind(self);
        this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        this.defaultNameCounter = {};
        this.controlName_map = {};
        this.controlId_map = {};
        this.cacheState = {};
        this.dataMaster = new DataMaster(this);
        this.scriptMaster = new ScriptMaster(this);
        this.project = this;

        this.designeConfig={
            name:genProjectName(),
            editingType:'MB',
            editingPage:{
                id:jsonData.lastEditingPageID
            },
            description:'页面'
        }

        this.content_PC={
            pages:[],
        };

        this.content_Mobile={
            pages:[],
        };

        this.logManager = new LogManager(this.designeConfig.name + '_lm');
        
        if(jsonData == null){
            var mainPage=new M_PageKernel(null, this);
            mainPage.project = this;
            mainPage.set_ismain(true);
            mainPage.set_title('主页面');
            this.content_Mobile.pages.push(mainPage);
        }
        else{
            if(jsonData.attr != null){
                Object.assign(this, jsonData.attr );
            }
            var self = this;
            this.dataMaster.restoreFromJson(jsonData.dataMaster);
            this.scriptMaster.restoreFromJson(jsonData.scriptMaster);

            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            jsonData.content_Mobile.pages.forEach(pageJson=>{
                var newPage = new M_PageKernel({}, this, ctlCreatioinHelper, pageJson);
                this.content_Mobile.pages.push(newPage);
            });
        }
        this.logManager.log('加载完成');
    }

    mainPageChanged(pagekernel){
        var index = this.content_PC.pages.indexOf(pagekernel);
        if(index != -1){
            this.content_PC.pages.forEach(pk=>{
                if(pk != pagekernel){
                    pk.__setAttribute(AttrNames.IsMain, false);
                }
            });
        }
        else{
            index = this.content_Mobile.pages.indexOf(pagekernel);
            if(index != -1){
                this.content_Mobile.pages.forEach(pk=>{
                    if(pk != pagekernel){
                        pk.__setAttribute(AttrNames.IsMain, false);
                    }
                });
            }
        }
    }

    registerControl(ctlKernel){
        var useID = ctlKernel.id;
        var registedCtl = this.getControlById(useID);
        if(registedCtl == ctlKernel){
            console.warn(useID + ' 重复注册');
        }
        else if(registedCtl != null){
            console.warn(useID + ' 已被占用');
            useID = null;
        }
        if(IsEmptyString(useID)){
            for(var i=0;i<9999;++i){
                useID = ctlKernel.type + '_' + i;
                if(this.getControlById(useID) == null){
                    break;
                }
            }
        }
        ctlKernel.id = useID;
        this.controlId_map[useID] = ctlKernel;
    }

    unRegisterControl(ctlKernel){
        var useID = ctlKernel.id;
        var registedCtl = this.getControlById(useID);
        if(registedCtl == null){
            return true;
        }
        delete this.controlId_map[useID];
    }

    getControlById(id){
        return this.controlId_map[id];
    }

    getControlByName(name){
        return this.controlName_map[name];
    }

    genControlName2(prefix){
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

    setEditingPageById(pageID){
        var thePage = this.getPageById(pageID);
        //if(thePage == null)
            //return false;
        this.designeConfig.editingPage.id = pageID;
        this.attrChanged('editingPage');
    }

    getPageById(pageID){
        var rlt = this.content_PC.pages.find(item=>{return item.id == pageID;});
        if(rlt == null){
            rlt = this.content_Mobile.pages.find(item=>{return item.id == pageID;});
        }
        return rlt;
    }

    deletePage(pageID){
        var thePage = this.getPageById(pageID);
        if(thePage == null){
            return;
        }
        var index = this.content_PC.pages.indexOf(thePage);
        if(index != -1){
            this.content_PC.pages.splice(index, 1);
        }
        else{
            index = this.content_Mobile.pages.indexOf(thePage);
            if(index != -1){
                this.content_Mobile.pages.splice(index, 1);
            }
        }
        if(this.designeConfig.editingPage.id == pageID)
        {
            this.setEditingPageById(-1);
        }
    }

    createEmptyPage(isPC){
        var newPage = new M_PageKernel(null, this);
        newPage.project = this;
        newPage.set_ismain(false);
        var newTitle;
        for(var i=1;i<999;++i){
            var hadItem = null;
            newTitle = (!isPC ? '手机页面_' : 'PC页面_') + i;
            if(isPC){
                hadItem = this.content_PC.pages.find(item=>{return item.getAttribute('title') == newTitle;});
            }
            else{
                hadItem = this.content_Mobile.pages.find(item=>{return item.getAttribute('title') == newTitle;});
            }
            if(hadItem == null){
                break;
            }
        }
        newPage.set_title(newTitle);
        if(isPC){
            this.content_PC.pages.push(newPage);
        }
        else{
            this.content_Mobile.pages.push(newPage);
        }
        return newPage;
    }

    getEditingPage(){
        return this.getPageById(this.designeConfig.editingPage.id);
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
        if(this.__setAttribute(AttrNames.Title, newtitle)){
            this.attrChanged([AttrNames.Title,AttrNames.RealName]);
            return true;
        }
        return false;
    }

    get_realName(){
        return this.getAttribute(AttrNames.Title) + 'Real';
    }

    getJson(){
        var attrJson=super.getJson();
        var rlt = {
            attr:attrJson,
            lastEditingPageID:this.designeConfig.editingPage.id
        };
        rlt.content_PC={
            pages:[],
        }
        this.content_PC.pages.forEach(
            page=>{
                rlt.content_PC.pages.push(page.getJson());
            }
        );

        rlt.content_Mobile={
            pages:[],
        }
        this.content_Mobile.pages.forEach(
            page=>{
                rlt.content_Mobile.pages.push(page.getJson());
            }
        );
        rlt.dataMaster = this.dataMaster.getJson();
        rlt.scriptMaster = this.scriptMaster.getJson();
        return rlt;
    }
}