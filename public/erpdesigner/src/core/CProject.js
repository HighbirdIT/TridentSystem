
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
        this.loaded = false;
        this.attrbuteGroups = CProjectAttrsSetting.groups_arr;
        this.defaultNameCounter = {};
        this.controlName_map = {};
        this.controlId_map = {};
        this.cacheState = {};
        this.dataMaster = new DataMaster(this);
        this.scriptMaster = new ScriptMaster(this);
        this.project = this;
        this.userControls_arr = [];

        this.designeConfig={
            name:genProjectName(),
            editingType:'MB',
            editingPage:{
                id:jsonData == null ? -1 : jsonData.lastEditingPageID
            },
            description:'页面',
            editingControl:{
                id:jsonData == null ? -1 : jsonData.lastEditingControlID
            }
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
            this.dataMaster.restoreFromJson(jsonData.dataMaster);
            this.scriptMaster.restoreFromJson(jsonData.scriptMaster);
            
            if(jsonData.userControls_arr){
                jsonData.userControls_arr.forEach(ctlJson=>{
                    var newUCtl = new UserControlKernel({project:this},null,null,ctlJson);
                    this.userControls_arr.push(newUCtl);
                });

                jsonData.userControls_arr.forEach((ctlJson,index)=>{
                    this.userControls_arr[index].__restoreChildren(null,ctlJson);
                });
            }
            

            var self = this;
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            jsonData.content_Mobile.pages.forEach(pageJson=>{
                var newPage = new M_PageKernel({}, this, ctlCreatioinHelper, pageJson);
                this.content_Mobile.pages.push(newPage);
            });
        }
        this.loaded = true;
        this.emit('loaded');
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

    addUserControl(name){
        name = name.trim();
        if(name.length < 2 || name.length > 20){
            return null;
        }
        var foundItem = this.userControls_arr.find(x=>{return x.name == name;});
        if(foundItem != null){
            return null;
        }
        var newID = 'userControl';
        var ki = 0;
        do{
            newID = 'userControl_T' + ki;
            foundItem = this.userControls_arr.find(x=>{return x.id == newID;});
            if(foundItem == null){
                break;
            }
            ki++;
        }while(ki < 1000)
        var newControl = new UserControlKernel({id:newID,name:name,project:this},null);
        this.userControls_arr.push(newControl);
        this.emit('userControlChanged');
        return newControl;
    }

    getEditingControl(){
        return this.getUserControlById(this.designeConfig.editingControl.id);
    }

    getUserControlById(id){
        return this.userControls_arr.find(x=>{return x.id == id;});
    }

    setEditingControlById(ctlID){
        this.designeConfig.editingPage.id = -1;
        this.designeConfig.editingControl.id = ctlID;
        this.attrChanged('editingPage');
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

        var useBPs_arr = this.scriptMaster.getBPsByControlKernel(useID);
        useBPs_arr.forEach(bp=>{
            this.scriptMaster.deleteBP(bp);
        });
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

    getControlsByType(theType){
        var rlt_arr = [];
        for(var id in this.controlId_map){
            var ctl = this.controlId_map[id];
            if(ctl && ctl.type == theType){
                rlt_arr.push(ctl);
            }
        }
        return rlt_arr;
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
        this.designeConfig.editingControl.id = -1;
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

    getAllPages(isPC){
        if(isPC == null){
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages : this.content_Mobile.pages;
    }

    getUseFlowSteps(){
        var rlt = [];
        this.content_PC.pages.forEach(page=>{
            page.getUseFlowSteps().forEach(flowStep=>{
                if(rlt.indexOf(flowStep) == -1){
                    rlt.push(flowStep);
                }
            });
        });
        this.content_Mobile.pages.forEach(page=>{
            page.getUseFlowSteps().forEach(flowStep=>{
                if(rlt.indexOf(flowStep) == -1){
                    rlt.push(flowStep);
                }
            });
        });
        return rlt;
    }

    getPopablePages(isPC){
        if(isPC == null){
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages.filter(page=>{return page.getAttribute(AttrNames.PopablePage) == true;}) : this.content_Mobile.pages.filter(page=>{return page.getAttribute(AttrNames.PopablePage) == true;});
    }

    getJumpablePages(isPC){
        if(isPC == null){
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages.filter(page=>{return page.getAttribute(AttrNames.PopablePage) != true;}) : this.content_Mobile.pages.filter(page=>{return page.getAttribute(AttrNames.PopablePage) != true;});
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

    getJson(jsonProf){
        if(jsonProf == null){
            jsonProf = new AttrJsonProfile();
        }
        var attrJson=super.getJson(jsonProf);
        var rlt = {
            attr:attrJson,
            lastEditingPageID:this.designeConfig.editingPage.id,
            lastEditingControlID:this.designeConfig.editingControl.id
        };
        rlt.content_PC={
            pages:[],
        };
        this.content_PC.pages.forEach(
            page=>{
                rlt.content_PC.pages.push(page.getJson(jsonProf));
            }
        );

        rlt.content_Mobile={
            pages:[],
        };
        this.content_Mobile.pages.forEach(
            page=>{
                rlt.content_Mobile.pages.push(page.getJson(jsonProf));
            }
        );
        rlt.userControls_arr=this.userControls_arr.map(ctl=>{
            return ctl.getJson(jsonProf);
        });
        rlt.dataMaster = this.dataMaster.getJson(jsonProf);
        rlt.scriptMaster = this.scriptMaster.getJson(jsonProf);
        rlt.useEntities_arr = jsonProf.entities_arr.map(entity=>{
            return entity.code;
        });
        return rlt;
    }

    copy
}

class AttrJsonProfile{
    constructor(){
        this.entities_arr = [];
    }

    useEntity(entity){
        if(isNaN(entity.code)){
            return;
        }
        if(this.entities_arr.indexOf(entity) == -1){
            this.entities_arr.push(entity);
        }
    }
}