
const CProjectAttrsSetting = {
    groups_arr: [
        new CAttributeGroup('基本设置', [
            new CAttribute('页面名称', 'title', ValueType.String, true),
            new CAttribute('真实名称', 'realName', ValueType.String, false),
        ])
    ]
};

var projNames_project = {};
function genProjectName() {
    var rlt = '';
    for (var i = 1; i < 999; ++i) {
        rlt = 'PROJ_' + i;
        if (projNames_project[rlt] == null)
            break;
    }
    projNames_project[rlt] = 1;
    return rlt;
}


class CProject extends IAttributeable {
    constructor(title, jsonData) {
        super({
            title: title,
        }, null, '方案');

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

        var designeConfig = {
            name: genProjectName(),
            editingType: jsonData == null || jsonData.editingType == null ? 'MB' : jsonData.editingType,
            editingPage: {
                mbid:jsonData == null || jsonData.lastEditingMBPageID == null ? -1 : jsonData.lastEditingMBPageID,
                pcid:jsonData == null || jsonData.lastEditingPCPageID == null ? -1 : jsonData.lastEditingPCPageID,
                id: jsonData == null ? -1 : jsonData.lastEditingPageID
            },
            description: '页面',
            editingControl: {
                id: jsonData == null ? -1 : jsonData.lastEditingControlID
            },
        };
        this.designeConfig = designeConfig;

        this.content_PC = {
            pages: [],
        };

        this.content_Mobile = {
            pages: [],
        };

        this.logManager = new LogManager(this.designeConfig.name + '_lm');

        if (jsonData == null) {
            var mainPage = new M_PageKernel(null, this);
            mainPage.project = this;
            mainPage.set_ismain(true);
            mainPage.set_title('主页面');
            this.content_Mobile.pages.push(mainPage);
        }
        else {
            if (jsonData.attr != null) {
                Object.assign(this, jsonData.attr);
            }
            var restoreHelper = new RestoreHelper(jsonData.dictionary);
            this.dataMaster.restoreFromJson(jsonData.dataMaster, restoreHelper);
            this.scriptMaster.restoreFromJson(jsonData.scriptMaster, restoreHelper);

            var usertemplateCreatioinHelper = new CtlKernelCreationHelper();
            usertemplateCreatioinHelper.restoreHelper = restoreHelper;
            if (jsonData.userControls_arr) {
                jsonData.userControls_arr.forEach(ctlJson => {
                    ctlJson.restoreHelper = restoreHelper;
                    var newUCtl = new UserControlKernel({ project: this }, null, usertemplateCreatioinHelper, ctlJson);
                    this.userControls_arr.push(newUCtl);
                });

                jsonData.userControls_arr.forEach((ctlJson, index) => {
                    this.userControls_arr[index].__restoreChildren(usertemplateCreatioinHelper, ctlJson);
                });
            }


            var self = this;
            var ctlCreatioinHelper = new CtlKernelCreationHelper();
            ctlCreatioinHelper.restoreHelper = restoreHelper;
            var newPage;
            jsonData.content_Mobile.pages.forEach(pageJson => {
                pageJson.restoreHelper = restoreHelper;
                newPage = new M_PageKernel({}, this, ctlCreatioinHelper, pageJson);
                newPage.ispcPage = false;
                this.content_Mobile.pages.push(newPage);
            });

            jsonData.content_PC.pages.forEach(pageJson => {
                pageJson.restoreHelper = restoreHelper;
                newPage = new M_PageKernel({}, this, ctlCreatioinHelper, pageJson);
                newPage.ispcPage = true;
                this.content_PC.pages.push(newPage);
            });
        }
        this.loaded = true;
        this.emit('loaded');
        this.logManager.log('加载完成');
    }

    mainPageChanged(pagekernel) {
        var index = this.content_PC.pages.indexOf(pagekernel);
        if (index != -1) {
            this.content_PC.pages.forEach(pk => {
                if (pk != pagekernel) {
                    pk.__setAttribute(AttrNames.IsMain, false);
                }
            });
        }
        else {
            index = this.content_Mobile.pages.indexOf(pagekernel);
            if (index != -1) {
                this.content_Mobile.pages.forEach(pk => {
                    if (pk != pagekernel) {
                        pk.__setAttribute(AttrNames.IsMain, false);
                    }
                });
            }
        }
    }

    addUserControl(name) {
        name = name.trim();
        if (name.length < 2 || name.length > 20) {
            return null;
        }
        var foundItem = this.userControls_arr.find(x => { return x.name == name; });
        if (foundItem != null) {
            return null;
        }
        var newID = 'UserControl';
        var ki = 0;
        do {
            newID = 'UserControl_T' + ki;
            foundItem = this.userControls_arr.find(x => { return x.id == newID; });
            if (foundItem == null) {
                break;
            }
            ki++;
        } while (ki < 1000)
        var newControl = new UserControlKernel({ id: newID, name: name, project: this }, null);
        this.userControls_arr.push(newControl);
        this.emit('userControlChanged');
        return newControl;
    }

    deleteUserControl(userCtlKernel) {
        var index = this.userControls_arr.indexOf(userCtlKernel);
        if(index == -1){
            return;
        }
        var instances_arr = this.getControlsByType(UserControlKernel_Type).filter(p => {
            return p.refID == userCtlKernel.id;
        });
        var hadIntanceSelected = false;
        var selectedKernel = this.designer.getSelectedKernel();
        instances_arr.forEach(instance=>{
            if(instance.isAEditor()){
                instance.parent.setAttribute(AttrNames.EditorType, M_TextKernel_Type);
            }
            else{
                instance.parent.removeChild(instance);
            }
            if(!hadIntanceSelected && selectedKernel == instance){
                hadIntanceSelected = true;
            }
        });
        this.userControls_arr.splice(index, 1);
        var self = this;
        var targetOpened = this.designeConfig.editingControl.id == userCtlKernel.id;
        this.unRegisterControl(userCtlKernel);
        setTimeout(() => {
            self.emit('userControlChanged');
            if(targetOpened){
                self.setEditingPageById(-1);
            }
            if(hadIntanceSelected){
                self.designer.selectKernel(null);
            }
        }, 100);
    }

    getEditingControl() {
        return this.getUserControlById(this.designeConfig.editingControl.id);
    }

    getUserControlById(id) {
        return this.userControls_arr.find(x => { return x.id == id; });
    }

    setEditingControlById(ctlID) {
        this.designeConfig.editingPage.id = -1;
        this.designeConfig.editingControl.id = ctlID;
        this.attrChanged('editingPage');
    }

    registerControl(ctlKernel) {
        var useID = ctlKernel.id;
        var registedCtl = this.getControlById(useID);
        if (registedCtl == ctlKernel) {
            console.warn(useID + ' 重复注册');
        }
        else if (registedCtl != null) {
            console.warn(useID + ' 已被占用');
            useID = null;
        }
        var ctlType = ctlKernel.type;
        if (IsEmptyString(useID)) {
            if(ctlType == UserControlKernel_Type){
                ctlType = ctlKernel.refID == null ? 'UserControl_T' : 'UserControl';
            }
            for (var i = 0; i < 9999; ++i) {
                useID = ctlType + '_' + i;
                if (this.getControlById(useID) == null) {
                    break;
                }
            }
        }
        else{
            if(ctlType == UserControlKernel_Type){
                useID = useID[0].toUpperCase() + useID.substring(1, useID.length);
            }
        }
        ctlKernel.id = useID;
        this.controlId_map[useID] = ctlKernel;
    }

    unRegisterControl(ctlKernel) {
        var useID = ctlKernel.id;
        var registedCtl = this.getControlById(useID);
        if (registedCtl == null) {
            return true;
        }
        delete this.controlId_map[useID];

        var useBPs_arr = this.scriptMaster.getBPsByControlKernel(useID);
        useBPs_arr.forEach(bp => {
            this.scriptMaster.deleteBP(bp);
        });
    }


    getControlById(id) {
        return this.controlId_map[id];
    }

    getControlByName(name) {
        return this.controlName_map[name];
    }

    genControlName2(prefix) {
        if (prefix == null) {
            console.warn('genNodeId参数不能为空');
            return;
        }
        var testI = 0;
        var useID = '';
        while (testI < 9999) {
            useID = prefix + '_' + testI;
            if (this.controlName_map[useID] == null) {
                break;
            }
            ++testI;
        }
        return useID;
    }

    getControlsByType(theType) {
        var rlt_arr = [];
        for (var id in this.controlId_map) {
            var ctl = this.controlId_map[id];
            if (ctl && ctl.type == theType) {
                rlt_arr.push(ctl);
            }
        }
        return rlt_arr;
    }

    getUserControlByUUID(uuid) {
        return this.userControls_arr.find(t=>{
            return t.uuid == uuid;
        });
    }


    createKernalByType(ctlType) {
        var ctlConfig = DesignerConfig.findConfigByType(ctlType);
        if (ctlConfig == null) {
            console.warn('找不到ctl type:' + ctlType + '的config');
            return null;
        }
        return new ctlConfig.kernelClass({}, this);
    }

    setEditingPageById(pageID) {
        var thePage = this.getPageById(pageID);
        //if(thePage == null)
        //return false;
        this.designeConfig.editingControl.id = -1;
        this.designeConfig.editingPage.id = pageID;
        this.attrChanged('editingPage');
        if(thePage){
            this.setEditingType(!thePage.ispcPage ? 'MB' : 'PC');
        }
    }

    getPageById(pageID) {
        var rlt = this.content_PC.pages.find(item => { return item.id == pageID; });
        if (rlt == null) {
            rlt = this.content_Mobile.pages.find(item => { return item.id == pageID; });
        }
        return rlt;
    }

    deletePage(pageID) {
        var thePage = this.getPageById(pageID);
        if (thePage == null) {
            return;
        }
        var index = this.content_PC.pages.indexOf(thePage);
        if (index != -1) {
            this.content_PC.pages.splice(index, 1);
        }
        else {
            index = this.content_Mobile.pages.indexOf(thePage);
            if (index != -1) {
                this.content_Mobile.pages.splice(index, 1);
            }
        }
        if (this.designeConfig.editingPage.id == pageID) {
            this.setEditingPageById(-1);
        }
    }

    createEmptyPage(isPC) {
        var newPage = new M_PageKernel(null, this);
        newPage.project = this;
        newPage.set_ismain(false);
        var newTitle;
        for (var i = 1; i < 999; ++i) {
            var hadItem = null;
            newTitle = (!isPC ? '手机页面_' : 'PC页面_') + i;
            if (isPC) {
                hadItem = this.content_PC.pages.find(item => { return item.getAttribute('title') == newTitle;    });
            }
            else {
                hadItem = this.content_Mobile.pages.find(item => { return item.getAttribute('title') == newTitle; });
            }
            if (hadItem == null) {
                break;
            }
        }
        newPage.set_title(newTitle);
        if (isPC) {
            this.content_PC.pages.push(newPage);
        }
        else {
            this.content_Mobile.pages.push(newPage);
        }
        newPage.ispcPage = isPC;
        return newPage;
    }

    getAllPages(isPC) {
        if (isPC == null) {
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages : this.content_Mobile.pages;
    }

    getUseFlowSteps() {
        var rlt = [];
        this.content_PC.pages.forEach(page => {
            page.getUseFlowSteps().forEach(flowStep => {
                if (rlt.indexOf(flowStep) == -1) {
                    rlt.push(flowStep);
                }
            });
        });
        this.content_Mobile.pages.forEach(page => {
            page.getUseFlowSteps().forEach(flowStep => {
                if (rlt.indexOf(flowStep) == -1) {
                    rlt.push(flowStep);
                }
            });
        });
        return rlt;
    }

    getPopablePages(isPC) {
        if (isPC == null) {
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages.filter(page => { return page.getAttribute(AttrNames.PopablePage) == true; }) : this.content_Mobile.pages.filter(page => { return page.getAttribute(AttrNames.PopablePage) == true; });
        //return isPC ? this.content_PC.pages : this.content_Mobile.pages;
    }

    getJumpablePages(isPC) {
        if (isPC == null) {
            isPC = this.designeConfig.editingType == 'PC';
        }
        return isPC ? this.content_PC.pages.filter(page => { return page.getAttribute(AttrNames.PopablePage) != true; }) : this.content_Mobile.pages.filter(page => { return page.getAttribute(AttrNames.PopablePage) != true; });
    }

    getEditingPage() {
        return this.getPageById(this.designeConfig.editingPage.id);
    }

    setEditingType(newValue) {
        var nowValue = this.designeConfig.editingType;
        var editingPage = this.getEditingPage();
        if(newValue == nowValue){
            return;
        }
        if(nowValue == 'PC'){
            this.designeConfig.editingPage.pcid = editingPage == null ? -1 : editingPage.id;
        }
        else{
            this.designeConfig.editingPage.mbid = editingPage == null ? -1 : editingPage.id;
        }
        this.designeConfig.editingType = newValue == 'PC' ? 'PC' : 'MB';
        if(newValue == 'PC'){
            this.setEditingPageById(this.designeConfig.editingPage.pcid);
        }
        else{
            this.setEditingPageById(this.designeConfig.editingPage.mbid);
        }
        this.attrChanged('editingType');
    }

    toggleEditingType() {
        this.setEditingType(this.designeConfig.editingType == 'PC' ? 'MB' : 'PC');
        return true;
    }

    getNowEditingType(){
        return this.designeConfig.editingType;
    }

    set_title(newtitle) {
        if (newtitle.length > 8) {
            newtitle = newtitle.substring(0, 8);
        }
        if (this.__setAttribute(AttrNames.Title, newtitle)) {
            this.attrChanged([AttrNames.Title, AttrNames.RealName]);
            return true;
        }
        return false;
    }

    get_realName() {
        return this.getAttribute(AttrNames.Title) + 'Real';
    }

    getJson(jsonProf) {
        if (jsonProf == null) {
            jsonProf = new AttrJsonProfile();
        }
        //jsonProf.hadDictionary = true;
        var attrJson = super.getJson(jsonProf);
        var rlt = {
            attr: attrJson,
            editingType: this.designeConfig.editingType,
            lastEditingPageID: this.designeConfig.editingPage.id,
            lastEditingPCPageID: this.designeConfig.editingPage.pcid,
            lastEditingMBPageID: this.designeConfig.editingPage.mbid,
            lastEditingControlID: this.designeConfig.editingControl.id
        };
        rlt.content_PC = {
            pages: [],
        };
        this.content_PC.pages.forEach(
            page => {
                rlt.content_PC.pages.push(page.getJson(jsonProf));
            }
        );

        rlt.content_Mobile = {
            pages: [],
        };
        this.content_Mobile.pages.forEach(
            page => {
                rlt.content_Mobile.pages.push(page.getJson(jsonProf));
            }
        );
        rlt.userControls_arr = this.userControls_arr.map(ctl => {
            return ctl.getJson(jsonProf);
        });
        rlt.dataMaster = this.dataMaster.getJson(jsonProf);
        rlt.scriptMaster = this.scriptMaster.getJson(jsonProf);
        rlt.useEntities_arr = jsonProf.entities_arr.map(entity => {
            return entity.code;
        });
        //rlt.dictionary = jsonProf.getDictionaryObj();
        return rlt;
    }

    copyKernel(theKernel) {
        if (theKernel == null) {
            return;
        }
        var copyResult = {
            project: this,
            cusDS_arr: [],
            scripts_arr: [],
            userControls_arr: [],
            controlsID_map: {},
            refControlID_map: {},
            targetControl: null,
        };
        var controlJsonProf = new AttrJsonProfile();
        var controlJson = theKernel.getJson(controlJsonProf);
        var si;
        var ctlid;
        var meetCusDS_map = {};
        var meetScript_map = {};
        var meetUserControl_map = {};
        var copyCusDS = (cusEntity, cusDS_arr, refControl_map) => {
            if (meetCusDS_map[cusEntity.code]) {
                return;
            }
            meetCusDS_map[cusEntity.code] = 1;
            var cusDSJsonProf = new AttrJsonProfile();
            var dsJson = cusEntity.getJson(cusDSJsonProf);
            cusDSJsonProf.customDS_arr.forEach(entity => {
                if (entity.isCustomDS) {
                    copyCusDS(entity, cusDS_arr, refControl_map);
                }
            });
            if(refControl_map){
                for (var rcid in cusDSJsonProf.refControl_map) {
                    refControl_map[rcid] = cusDSJsonProf.refControl_map[rcid].type;
                }
            }
            cusDS_arr.push(dsJson);
        };
        controlJsonProf.customDS_arr.forEach(entity => {
            if (entity.isCustomDS) {
                copyCusDS(entity, copyResult.cusDS_arr, copyResult.refControlID_map);
            }
        });

        var copyScript = (scriptBP, scripts_arr, cusDS_arr, refControl_map) => {
            if (meetScript_map[scriptBP.code]) {
                return;
            }
            meetScript_map[scriptBP.code] = 1;
            var scriptJsonProf = new AttrJsonProfile();
            var scriptJson = scriptBP.getJson(scriptJsonProf);
            scriptJsonProf.customDS_arr.forEach(entity => {
                if (entity.isCustomDS) {
                    copyCusDS(entity, cusDS_arr, refControl_map);
                }
            });
            if(refControl_map){
                for (var rcid in scriptJsonProf.refControl_map) {
                    refControl_map[rcid] = scriptJsonProf.refControl_map[rcid].type;
                }
            }
            scripts_arr.push(scriptJson);
        };

        for (ctlid in controlJsonProf.useControl_map) {
            var ctlType = controlJsonProf.useControl_map[ctlid].type;
            if (copyResult.controlsID_map[ctlType] == null) {
                copyResult.controlsID_map[ctlType] = [];
            }
            copyResult.controlsID_map[ctlType].push(ctlid);
            var useScripteBP_arr = this.scriptMaster.getBPsByControlKernel(ctlid);
            useScripteBP_arr.forEach(scriptBP => {
                copyScript(scriptBP, copyResult.scripts_arr, copyResult.cusDS_arr, copyResult.refControlID_map);
            });
        }

        var copyUserControl = (UCKernel) => {
            if (meetUserControl_map[UCKernel.id]) {
                return;
            }
            var userCtlProfile = {
                controlsID_map:{},
                scripts_arr:[],
                cusDS_arr:[],
                refControlID_map:{}
            };
            meetUserControl_map[UCKernel.id] = 1;
            var UCJsonProf = new AttrJsonProfile();
            var UCJson = UCKernel.getJson(UCJsonProf);

            UCJsonProf.customDS_arr.forEach(entity => {
                if (entity.isCustomDS) {
                    copyCusDS(entity, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                }
            });

            for (ctlid in UCJsonProf.useControl_map) {
                var ctlType = UCJsonProf.useControl_map[ctlid].type;
                if (userCtlProfile.controlsID_map[ctlType] == null) {
                    userCtlProfile.controlsID_map[ctlType] = [];
                }
                userCtlProfile.controlsID_map[ctlType].push(ctlid);
                var useScripteBP_arr = this.scriptMaster.getBPsByControlKernel(ctlid);
                useScripteBP_arr.forEach(scriptBP => {
                    copyScript(scriptBP, userCtlProfile.scripts_arr, userCtlProfile.cusDS_arr, userCtlProfile.refControlID_map);
                });
            }

            for (ctlid in UCJsonProf.useUserControl_map) {
                copyUserControl(UCJsonProf.useUserControl_map[ctlid]);
            }
            userCtlProfile.jsonData = UCJson;
            copyResult.userControls_arr.push(userCtlProfile);
        };

        for (ctlid in controlJsonProf.useUserControl_map) {
            copyUserControl(controlJsonProf.useUserControl_map[ctlid]);
        }

        copyResult.targetControl = controlJson;
        return copyResult;
    }

    pasteKernel(copiedData, parentKernel, targetIndex) {
        var copyFromThisProject = copiedData.project == this;
        var ctlID;
        var oldID;
        var useUUID;
        var goodJson;
        var si;
        var i;
        var ctlType;
        var aidControlId_map = Object.assign({}, this.controlId_map);
        var renameContrls_map = {};
        var renameCusDS_map = {};
        var useControlsID_all = {};
        for (ctlType in copiedData.controlsID_map) {
            copiedData.controlsID_map[ctlType].forEach(ctlID => {
                useControlsID_all[ctlID] = 1;
            });
        }
        copiedData.userControls_arr.forEach(UCJson=>{
            useControlsID_all[UCJson.id] = 1;
        });
        for (var rcid in copiedData.refControlID_map) {
            if (useControlsID_all[rcid] == null) {
                renameContrls_map[rcid] = '';
            }
        }
        for (ctlType in copiedData.controlsID_map) {
            copiedData.controlsID_map[ctlType].forEach(ctlID => {
                if (aidControlId_map[ctlID] != null) {
                    var newID = '';
                    for (i = 0; i < 9999; ++i) {
                        newID = ctlType + '_' + i;
                        if (aidControlId_map[newID] == null) {
                            if (useControlsID_all[newID] == null) {
                                break;
                            }
                        }
                    }
                    aidControlId_map[newID] = 1;
                    renameContrls_map[ctlID] = newID;
                }
            });
        }

        var replaceIDChangedInJsonString = (pJsonStr) => {
            for (oldID in renameContrls_map) {
                pJsonStr = pJsonStr.replace(new RegExp(doubleQuotesStr(oldID), 'g'), doubleQuotesStr(renameContrls_map[oldID]));
                if(renameContrls_map[oldID].length > 0){
                    pJsonStr = pJsonStr.replace(new RegExp(oldID + '_', 'g'), renameContrls_map[oldID] + '_');
                }
            }
            for (oldID in renameCusDS_map) {
                pJsonStr = pJsonStr.replace(new RegExp(doubleQuotesStr(oldID), 'g'), doubleQuotesStr(renameCusDS_map[oldID]));
            }
            return pJsonStr;
        };

        var needPasteCusDS_arr = copiedData.cusDS_arr.concat();
        var needPasteScripts_arr = copiedData.scripts_arr.concat();

        if(!copyFromThisProject){
            copiedData.userControls_arr.forEach(userCtlProfile=>{
                var UCJson = userCtlProfile.jsonData;
                var hadUserControl = this.getUserControlByUUID(UCJson.uuid);
                if(hadUserControl){
                    if(hadUserControl.id != UCJson.id){
                        renameContrls_map[UCJson.id] = hadUserControl.id;
                    }
                    return;
                }
                if (aidControlId_map[UCJson.id] != null) {
                    var newID = '';
                    for (i = 0; i < 9999; ++i) {
                        newID = 'UserControl_T' + i;
                        if (aidControlId_map[newID] == null) {
                            if (useControlsID_all[newID] == null) {
                                break;
                            }
                        }
                    }
                    aidControlId_map[newID] = 1;
                    renameContrls_map[UCJson.id] = newID;
                }
                needPasteCusDS_arr = needPasteCusDS_arr.concat(userCtlProfile.cusDS_arr);
                needPasteScripts_arr = needPasteScripts_arr.concat(userCtlProfile.scripts_arr);

                for (ctlType in userCtlProfile.controlsID_map) {
                    userCtlProfile.controlsID_map[ctlType].forEach(ctlID => {
                        if (aidControlId_map[ctlID] != null && ctlID != UCJson.id) {
                            var newID = '';
                            for (i = 0; i < 9999; ++i) {
                                newID = ctlType + '_' + i;
                                if (aidControlId_map[newID] == null) {
                                    if (useControlsID_all[newID] == null) {
                                        break;
                                    }
                                }
                            }
                            aidControlId_map[newID] = 1;
                            renameContrls_map[ctlID] = newID;
                        }
                    });
                }
            });
        }

        var aidEntityCode_map = {};
        this.dataMaster.BP_sql_arr.forEach(bp=>{
            aidEntityCode_map[bp.code] = 1;
        });
        if (!copyFromThisProject) {
            var useDSID_all = {};
            needPasteCusDS_arr.forEach(cusDSBP => {
                useDSID_all[cusDSBP.code] = 1;
            });
            needPasteCusDS_arr.forEach(cusDSBP => {
                if (cusDSBP.group == 'custom') {
                    if (copyFromThisProject) {
                        return;// 从本方案里来的，自订数据源已经存在了肯定
                    }
                    var hadSqlBp = this.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
                    if (hadSqlBp) {
                        if (cusDSBP.code != hadSqlBp.code) {
                            renameCusDS_map[cusDSBP.code] = hadSqlBp.code;
                        }
                        return;
                    }
                    if (aidEntityCode_map[cusDSBP.code] != null) {
                        for (i = 0; i < 9999; ++i) {
                            var useCode = 'sqlBP_' + i;
                            if (aidEntityCode_map[useCode] == null && useDSID_all[useCode] == null) {
                                aidEntityCode_map[useCode] = 1;
                                renameCusDS_map[cusDSBP.code] = useCode;
                                break;
                            }
                        }
                    }
                }
            });
        }

        needPasteCusDS_arr.forEach(cusDSBP => {
            useUUID = cusDSBP.uuid;
            if (cusDSBP.group == 'custom') {
                if (copyFromThisProject) {
                    return;// 从本方案里来的，自订数据源已经存在了肯定
                }
                var hadSqlBp = this.dataMaster.getSqlBPByUUID(cusDSBP.uuid);
                if (hadSqlBp) {
                    return;
                }
            }
            else if (cusDSBP.group == 'ctlcus') {
                useUUID = null;
            }
            else {
                console.error('不支持的group:' + cusDSBP.group);
                return;
            }
            var expireBP = null;
            var sqlBPCreationHelper = new NodeCreationHelper();
            sqlBPCreationHelper.project = this.project;
            var jsonStr = JSON.stringify(cusDSBP);
            var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
            goodJson.uuid = useUUID;
            if (cusDSBP.group == 'ctlcus') {
                expireBP = this.dataMaster.getSqlBPByName(goodJson.name);
                if (expireBP) {
                    this.dataMaster.deleteSqlBP(expireBP);
                }
            }
            var newbp = new SqlNode_BluePrint({ master: this.dataMaster }, goodJson, sqlBPCreationHelper);
            this.dataMaster.addSqlBP(newbp);
        });

        needPasteScripts_arr.forEach(scriptBP => {
            useUUID = null;
            var expireBP = null;
            var scriptBPCreationHelper = new NodeCreationHelper();
            scriptBPCreationHelper.project = this.project;

            var jsonStr = JSON.stringify(scriptBP);
            var goodJson = JSON.parse(replaceIDChangedInJsonString(jsonStr));
            expireBP = this.scriptMaster.getBPByName(goodJson.name);
            if (expireBP) {
                this.scriptMaster.deleteBP(expireBP);
            }
            goodJson.uuid = useUUID;
            var newbp = new JSNode_BluePrint({ master: this.scriptMaster }, goodJson, scriptBPCreationHelper);
            this.scriptMaster.addBP(newbp);
        });

        var createdUserCtls_arr = [];
        if(!copyFromThisProject){
            copiedData.userControls_arr.forEach(userCtlProfile=>{
                var UCJson = userCtlProfile.jsonData;
                var hadUserControl = this.getUserControlByUUID(UCJson.uuid);
                if(!hadUserControl){
                    var userCtlCreatioinHelper = new CtlKernelCreationHelper();
                    userCtlCreatioinHelper.project = this;
                    var goodUserCtlJson = JSON.parse(replaceIDChangedInJsonString(JSON.stringify(UCJson)));
                    var newUCtl = new UserControlKernel({ project: this }, null, userCtlCreatioinHelper, goodUserCtlJson);
                    this.userControls_arr.push(newUCtl);
                    createdUserCtls_arr.push({
                        ctl:newUCtl,
                        json:goodUserCtlJson,
                    });
                }
            });

            createdUserCtls_arr.forEach(p => {
                p.ctl.__restoreChildren(null, p.json);
            });
        }

        var targetCtlJsonStr = JSON.stringify(copiedData.targetControl);
        var goodTargetCtlJson = JSON.parse(replaceIDChangedInJsonString(targetCtlJsonStr));
        var ctlCreatioinHelper = new CtlKernelCreationHelper();
        var ctlConfig = DesignerConfig.findConfigByType(goodTargetCtlJson.type);
        if (ctlConfig == null) {
            console.warn('type:' + goodTargetCtlJson.type + '未找到配置数据');
            return;
        }
        var initData = {};
        if (targetIndex >= 0) {
            initData.hintIndexInParent = targetIndex + 1;
        }
        var newCtl = new ctlConfig.kernelClass(initData, parentKernel, ctlCreatioinHelper, goodTargetCtlJson);
        var self = this;
        setTimeout(() => {
            self.designer.selectKernel(newCtl);
            if(createdUserCtls_arr.length > 0){
                self.emit('userControlChanged');
            }
        }, 50);
    }
}

class RestoreHelper{
    constructor(dictionary) {
        this.dictionary = dictionary;
    }

    queryDictionnary(key){
        if(this.dictionary == null || typeof key != 'string' || key[0] != '$' || this.dictionary[key] == null){
            return key;
        }
        return this.dictionary[key];
    }

    trasnlateJson(targetJson){
        if(this.dictionary == null){
            return;
        }
        for(var name in targetJson){
            var value = targetJson[name];
            if(typeof value == 'string'){
                targetJson[name] = this.queryDictionnary(value);
            }
        }
    }
}

class AttrJsonProfile {
    constructor(hadDictionary) {
        this.entities_arr = [];
        this.customDS_arr = [];
        this.useControl_map = {};
        this.useUserControl_map = {};
        this.refControl_map = {};
        this.dictionary = {};
        this.keyIndex = 0;
        this.hadDictionary = hadDictionary == true;
    }

    addDictionnary(value){
        if(!this.hadDictionary){
            return value;
        }
        if(typeof value != 'string' || value.length < 2){
            return value;
        }
        if(this.dictionary[value]){
            return this.dictionary[value];
        }
        var newKey = '$' + this.keyIndex.toString(16).toLocaleLowerCase();
        if(newKey.length >= value.length){
            return value;
        }
        this.dictionary[value] = newKey;
        this.keyIndex++;
        return newKey;
    }

    getDictionaryObj(){
        var rlt = {};
        if(this.hadDictionary){
            for(var key in this.dictionary){
                rlt[this.dictionary[key]] = key;
            }
        }
        return rlt;
    }

    useEntity(entity) {
        if (isNaN(entity.code)) {
            if (this.customDS_arr.indexOf(entity) == -1) {
                this.customDS_arr.push(entity);
            }
            return;
        }
        if (this.entities_arr.indexOf(entity) == -1) {
            this.entities_arr.push(entity);
        }
    }

    useControl(theCtl) {
        if (theCtl == null) {
            return;
        }
        this.useControl_map[theCtl.id] = theCtl;
    }

    useUserControl(theCtl) {
        if (theCtl == null) {
            return;
        }
        this.useUserControl_map[theCtl.id] = theCtl;
    }

    addRefControl(theCtl) {
        if (theCtl == null) {
            return;
        }
        this.refControl_map[theCtl.id] = theCtl;
    }
}