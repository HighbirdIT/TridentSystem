
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
        this.project = this;

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
                    pk.__setAttribute(AttrNames.isMain, false);
                }
            });
        }
        else{
            index = this.content_Mobile.pages.indexOf(pagekernel);
            if(index != -1){
                this.content_Mobile.pages.forEach(pk=>{
                    if(pk != pagekernel){
                        pk.__setAttribute(AttrNames.isMain, false);
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
        return rlt;
    }
}