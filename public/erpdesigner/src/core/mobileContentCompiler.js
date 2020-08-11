class ControlGraphNode {
    constructor(kernel) {
        this.kernel = kernel;
        this.id = kernel.id;
        this.outpath_arr = [];
        this.inpath_arr = [];
    }

    addOut(targetNode) {
        if (this.outpath_arr.indexOf(targetNode) == -1) {
            this.outpath_arr.push(targetNode);
            targetNode.addIn(this);
        }
    }

    addIn(targetNode) {
        if (this.inpath_arr.indexOf(targetNode) == -1) {
            this.inpath_arr.push(targetNode);
        }
    }
}

const ECtlReplyPathType = {
    SetAP_On_BPChanged: 'SetAP_On_BPChanged',
    CallFun_On_BPChanged: 'CallFun_On_BPChanged',
};

class ControlGraphPath {
    constructor(type, relyNode, berelyNode, initData) {
        this.type = type;
        this.relyNode = relyNode;
        this.berelyNode = berelyNode;
        if (relyNode) {
            relyNode.addOut(berelyNode);
        }
        Object.assign(this, initData);
    }
}

class ControlRelyOnGraph {
    constructor(compiler) {
        this.allpath_map = {};
        this.allgraph_map = {};
        this.compiler = compiler;
    }

    addRely_setAPOnBPChanged(relyCtl, relyPropName, berelyCtl, berelyPropName, approach) {
        var pathid = 'set_' + relyCtl.id + '.' + relyPropName + '_on_' + berelyCtl.id + '.' + berelyPropName;
        if (this.allpath_map[pathid]) {
            return this.allpath_map[pathid];
        }
        if (this.allgraph_map[relyCtl.id] == null) {
            this.allgraph_map[relyCtl.id] = new ControlGraphNode(relyCtl);
        }
        if (this.allgraph_map[berelyCtl.id] == null) {
            this.allgraph_map[berelyCtl.id] = new ControlGraphNode(berelyCtl);
        }
        var path = new ControlGraphPath(ECtlReplyPathType.SetAP_On_BPChanged, this.allgraph_map[relyCtl.id], this.allgraph_map[berelyCtl.id], {
            approach: approach,
            berelyPropName: berelyPropName,
            relyPropName: relyPropName,
            relyCtl: relyCtl,
            berelyCtl: berelyCtl,
        });
        path.id = pathid;
        this.allpath_map[pathid] = path;
        return path;
    }

    addRely_CallFunOnBPChanged(relyCtl, funName, berelyCtl, berelyPropName, params_arr) {
        var pathid = 'callfun_' + funName + '_on_' + berelyCtl.id + '.' + berelyPropName;
        if (this.allpath_map[pathid]) {
            return this.allpath_map[pathid];
        }

        var path = new ControlGraphPath(ECtlReplyPathType.CallFun_On_BPChanged, null, null, {
            berelyPropName: berelyPropName,
            berelyCtl: berelyCtl,
            funName: funName,
            params_arr: params_arr,
            relyCtl: relyCtl,
        });
        path.id = pathid;
        this.allpath_map[pathid] = path;
        return path;
    }
}

class MobileContentCompiler extends ContentCompiler {
    constructor(projectCompiler) {
        super(projectCompiler);
        autoBind(this);

        this.conetents_arr = this.project.content_Mobile;
        this.compilePage = this.compilePage.bind(this);
        this.blocks_map = {};
    }

    compile() {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;
        var isDebugMode = project.getAttribute('debugmode');
        this.compileChain = [];
        this.compiledScriptBP_map = {};
        this.ctlRelyOnGraph = new ControlRelyOnGraph(this);
        if (project.content_Mobile.pages.length == 0) {
            return;
        }

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        this.appRenderSwicth = theSwicth;
        clientSide.appClass.renderFun.pushChild(theSwicth);
        var pageElemVar = clientSide.appClass.renderFun.scope.getVar('pageElem', true);

        clientSide.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'loaded'), 'state.loaded'));
        var unloadedIfBlock = new JSFile_IF('unloaded', '!state.loaded');
        clientSide.appClass.mapStateFun.pushChild(unloadedIfBlock);
        unloadedIfBlock.pushLine(makeLine_Assign(VarNames.RetProps + '.fetchState', 'state.ui.fetchState'));

        if (isDebugMode) {
            clientSide.globalVarBlock.pushLine("gDebugMode = true;");
        }
        clientSide.scope.getVar(VarNames.PageRouter, true, '[]');
        clientSide.scope.getVar('gPCRenderMode', true, 'false');
        clientSide.pageLoadedReducerFun = clientSide.scope.getFunction('pageLoadedReducer', true, ['state']);
        clientSide.gotoPageReducerFun = clientSide.scope.getFunction('gotoPageReducer', true, ['state', 'action']);
        clientSide.gotoPageReducerFun.pushLine("return gotoPage(action.pageName, state);");

        clientSide.gotoPageFun = clientSide.scope.getFunction('gotoPage', true, ['pageName', 'state']);
        clientSide.gotoPageFun.pushLine("if (state.nowPage == pageName){return state;}");
        clientSide.gotoPageFun.pushLine(VarNames.PageRouter + '.push(pageName);');
        clientSide.gotoPageFun.scope.getVar(VarNames.ReState, true, 'state');
        var gotoPageSwitchBlock = new JSFile_Switch('gotopage', 'pageName');
        clientSide.gotoPageFun.pushChild(gotoPageSwitchBlock);
        clientSide.gotoPageFun.switchBlock = gotoPageSwitchBlock;
        clientSide.gotoPageFun.retBlock.pushLine("return Object.assign({}, " + VarNames.ReState + ");");

        clientSide.pageRouteBackFun = clientSide.scope.getFunction('pageRoute_Back', true, ['trigerCallBack']);
        clientSide.pageRouteBackFun.pushLine('if(' + VarNames.PageRouter + '.length > 1){', 1);
        clientSide.pageRouteBackFun.pushLine('var popedPageName = ' + VarNames.PageRouter + '.pop();');
        clientSide.pageRouteBackFun.pushLine('store.dispatch(makeAction_gotoPage(' + VarNames.PageRouter + '.pop()));');
        clientSide.pageRouteBackFun.pushLine('if(trigerCallBack != false){', 1);
        clientSide.pageRouteBackFun.pushLine("var close_callback = getPageEntryParam(popedPageName,'callBack');");
        clientSide.pageRouteBackFun.pushLine('if(close_callback){close_callback({});}', -1);
        clientSide.pageRouteBackFun.pushLine('}', -1);
        clientSide.pageRouteBackFun.pushLine('}');

        clientSide.addReducer('AT_PAGELOADED', 'pageLoadedReducer.bind(window)');
        clientSide.addReducer('AT_GOTOPAGE', 'gotoPageReducer.bind(window)');

        var si;
        var userCtlTemplate;
        var userCtlTemplateProfiles_map = {};
        var userCtli;
        for (userCtli in project.userControls_arr) {
            userCtlTemplateProfiles_map[project.userControls_arr[userCtli].id] = {
                count: 0,
                relyOn_arr: [],
                beRely_arr: [],
            };
        }
        var kernelProfile;
        var setRelyFun = (kernelid, relyOnid) => {
            kernelProfile = userCtlTemplateProfiles_map[kernelid];
            var relyOnKernelProfile = userCtlTemplateProfiles_map[relyOnid];

            if (kernelProfile.relyOn_arr.indexOf((relyOnid)) == -1) {
                kernelProfile.relyOn_arr.push(relyOnid);
                kernelProfile.beRely_arr.forEach(tid => {
                    setRelyFun(tid, relyOnid);
                });
            }
            if (relyOnKernelProfile.beRely_arr.indexOf(kernelid) == -1) {
                relyOnKernelProfile.beRely_arr.push(kernelid);
            }
        };

        for (userCtli in project.userControls_arr) {
            userCtlTemplate = project.userControls_arr[userCtli];
            var useOtherTemplates_arr = userCtlTemplate.searchChildKernel(UserControlKernel_Type, false, true);
            if (useOtherTemplates_arr) {
                useOtherTemplates_arr.forEach(tKernel => {
                    setRelyFun(userCtlTemplate.id, tKernel.refID);
                });
            }
        }

        var beUsedUserControl_map = {};
        var useUserContrls_arr;
        var setUserControlBeUsed = kernelid => {
            beUsedUserControl_map[kernelid] = 1;
            kernelProfile = userCtlTemplateProfiles_map[kernelid];
            kernelProfile.relyOn_arr.forEach(tid => {
                setUserControlBeUsed(tid);
            });
        };

        for (var pi in project.content_Mobile.pages) {
            useUserContrls_arr = project.content_Mobile.pages[pi].searchChildKernel(UserControlKernel_Type, false, true);
            if (useUserContrls_arr) {
                useUserContrls_arr.forEach(tKernel => {
                    setUserControlBeUsed(tKernel.refID);
                });
            }
        }

        var waitCompileUserCtls_arr = project.userControls_arr.concat().filter(ctl => { return beUsedUserControl_map[ctl.id] });
        while (waitCompileUserCtls_arr.length > 0) {
            var targetUserCtl = null;
            var targetUserCtlProfile = null;
            var targetUserCtlIndex = 0;
            waitCompileUserCtls_arr.forEach((userCtl, index) => {
                if (targetUserCtl != null) {
                    return;
                }
                targetUserCtlProfile = userCtlTemplateProfiles_map[userCtl.id];
                if (targetUserCtlProfile.relyOn_arr.length == 0) {
                    targetUserCtlIndex = index;
                    targetUserCtl = userCtl;
                }
            });
            if (targetUserCtl == null) {
                logManager.error('无法继续编译自定义控件');
            }
            console.log('compile userTemplate:' + targetUserCtl.id);
            if (!this.compileUserControlTemplate(targetUserCtl)) {
                return false;
            }
            waitCompileUserCtls_arr.splice(targetUserCtlIndex, 1);
            targetUserCtlProfile.beRely_arr.forEach(tid => {
                var tindex = userCtlTemplateProfiles_map[tid].relyOn_arr.indexOf(targetUserCtl.id);
                if (tindex >= 0) {
                    userCtlTemplateProfiles_map[tid].relyOn_arr.splice(tindex, 1);
                }
            });
        }

        this.mianPageKernel = null;
        var flowStepSwitch = new JSFile_Switch('flowstepswitch', 'flowStep');
        for (var pi in project.content_Mobile.pages) {
            var mobilePage = project.content_Mobile.pages[pi];
            this.compileChain.push(mobilePage);
            if (this.compilePage(mobilePage) == false) {
                return false;
            }
            mobilePage.getAttrArrayList(AttrNames.RelFlowStep).forEach(attr => {
                var flowStepCode = mobilePage[attr.name];
                if (gFlowMaster.findStepByCode(flowStepCode)) {
                    var flowStepCaseBLK = flowStepSwitch.getCaseBlock(flowStepCode);
                    flowStepCaseBLK.pushLine("targetPageID='" + mobilePage.id + "';");
                }
            });
        }
        if (this.mianPageKernel == null) {
            logManager.error('项目没有在移动端设置主页面');
        }

        clientSide.pageLoadedReducerFun.pushLine("var flowStep = parseInt(getQueryVariable('flowStep'));");
        clientSide.pageLoadedReducerFun.pushLine("var targetPageID='" + this.mianPageKernel.id + "';");
        clientSide.pageLoadedReducerFun.pushChild(flowStepSwitch);
        clientSide.pageLoadedReducerFun.flowStepSwitch = flowStepSwitch;
        clientSide.pageLoadedReducerFun.pushLine("return gotoPage(targetPageID, state);");

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className='w-100 h-100'>");
        clientSide.appClass.renderFun.pushLine("<ERPC_TopLevelFrame ref={gTopLevelFrameRef} />");
        clientSide.appClass.renderFun.pushLine("<CToastManger ref={gCToastMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<CMessageBoxManger ref={gCMessageBoxMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<FixedContainer ref={gFixedContainerRef} />");
        clientSide.appClass.renderFun.pushLine("{this.renderLoadingTip()}");
        clientSide.appClass.renderFun.pushLine("{pageElem}", -1);
        clientSide.appClass.renderFun.pushLine("</div>);");

        this.compileChain.reverse();
        for (var ki in this.compileChain) {
            if (this.endKernelCompile(this.compileChain[ki]) == false) {
                return false;
            }
        }

        var sendMessageFun = clientSide.scope.getFunction("sendMessage", true, ['type', 'data']);
        sendMessageFun.pushLine("gPageReceiveMsgHandlers_arr.forEach(handler=>{", 1);
        sendMessageFun.pushLine("handler(type,data);", -1);
        sendMessageFun.pushLine("});");


        // gen relyon code
        for (var pid in this.ctlRelyOnGraph.allpath_map) {
            var relyPath = this.ctlRelyOnGraph.allpath_map[pid];
            var berelyCtl = relyPath.berelyCtl;
            var changedFun;
            var getValueStr = '';
            if (berelyCtl.parent == null && berelyCtl.type != M_PageKernel_Type) {
                console.error('这里berelyCtl.parent 不能为空');
            }
            else {
                var propFulPath;
                var propChangedHandlerName;
                var actKey;
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                    case ECtlReplyPathType.CallFun_On_BPChanged:
                        if (relyPath.relyCtl == null) {
                            console.log('sdf');
                        }
                        propFulPath = relyPath.berelyCtl.getStatePath(relyPath.berelyPropName, '.', null, true);
                        propChangedHandlerName = relyPath.berelyCtl.id + '_' + relyPath.berelyPropName + '_changed';
                        changedFun = clientSide.scope.getFunction(propChangedHandlerName);
                        if (changedFun == null) {
                            changedFun = clientSide.scope.getFunction(propChangedHandlerName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
                            changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                            changedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                            clientSide.stateChangedAct[singleQuotesStr(propFulPath)] = propChangedHandlerName + '.bind(window)';
                        }
                        var accordionParents_arr = relyPath.relyCtl.searchParentKernel([Accordion_Type, TabItem_Type]);
                        if (accordionParents_arr) {
                            var accordionCheckStr = '';
                            accordionParents_arr.forEach(accordionKernel => {
                                changedFun.scope.getVar(accordionKernel.id + '_state', true, "getStateByPath(" + VarNames.State + ",'" + accordionKernel.getStatePath() + "',{});");
                                accordionCheckStr += (accordionCheckStr.length > 0 ? ' && ' : '') + accordionKernel.id + '_state.inited';
                            });
                            changedFun.pushLine('if(' + accordionCheckStr + '){', 1);
                        }
                        if (relyPath.type == ECtlReplyPathType.SetAP_On_BPChanged) {
                            getValueStr = '';
                            if (relyPath.approach.funName) {
                                var relyCtlReactParent = relyPath.relyCtl.getReactParentKernel(true);
                                var sameReactKernel = relyPath.berelyCtl.searchSameReactParentKernel(relyPath.relyCtl);
                                var thirdParam = sameReactKernel.id + '_path';
                                var sameReactKernelPathInitStr = sameReactKernel.isComplicatedPath() ? "getParentPathByKey(path,'" + sameReactKernel.id + "')" : singleQuotesStr(sameReactKernel.getStatePath(''));
                                changedFun.scope.getVar(sameReactKernel.id + '_path', true, sameReactKernelPathInitStr);
                                if (sameReactKernel != relyCtlReactParent) {
                                    thirdParam += "+" + singleQuotesStr('.' + relyCtlReactParent.getStatePath('', '.', null, true, sameReactKernel));
                                }
                                else if (sameReactKernel.type == M_FormKernel_Type && !sameReactKernel.isPageForm()) {
                                    thirdParam += ' + ".row_" + rowKeyInfo_map.' + sameReactKernel.id;
                                }
                                if (relyPath.approach.delaycall) {
                                    actKey = 'call_' + relyPath.approach.funName;
                                    changedFun.pushLine("if(delayActs." + actKey + " == null){delayActs." + actKey + " = {callfun:" + relyPath.approach.funName + ",params_arr:[" + [VarNames.State, 'null', thirdParam].join(',') + "]};};");
                                    getValueStr = '';
                                }
                                else {
                                    getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State, 'null', thirdParam]);
                                }
                            }
                            else if (relyPath.approach.value) {
                                getValueStr = relyPath.approach.value;
                            }
                            else {
                                console.error('不支持的approach!');
                            }
                            var rowKeyInfo_map = {
                                mapVarName: 'rowKeyInfo_map',
                            };
                            if (!IsEmptyString(getValueStr)) {
                                changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowKeyInfo_map)), getValueStr));
                            }
                        }
                        else {
                            var actKey = 'call_' + relyPath.funName;
                            changedFun.pushLine("if(delayActs['" + actKey + "'] == null){delayActs['" + actKey + "'] = {callfun:" + relyPath.funName + (relyPath.params_arr ? ",params_arr:[" + relyPath.params_arr.join(',') + ']' : '') + "};};");
                        }
                        if (accordionParents_arr) {
                            changedFun.subNextIndent();
                            changedFun.pushLine('}');
                        }
                        break;
                }
            }
        }

        return true;
    }

    modifyControlTag(ctlKernel, ctlTag) {
        var belongForm = ctlKernel.searchParentKernel(M_FormKernel_Type, true);
        if (belongForm) {
            var formType = belongForm.getAttribute(AttrNames.FormType);
            if (formType == EFormType.Grid || formType == EFormType.List) {
                var needModify = false;
                if (formType == EFormType.Grid) {
                    needModify = belongForm.isKernelInRow(ctlKernel);
                }
                else {
                    needModify = true;
                }

                if (needModify) {
                    ctlTag.setAttr('rowkey', '{rowkey}');
                    /*
                    if (formType == EFormType.List) {
                        if(belongForm == ctlKernel.parent){
                            ctlTag.setAttr('key', '{rowkey}');
                        }
                    }
                    */
                }
            }
        }
        /*
        var belongUserControl = ctlKernel.searchParentKernel(UserControlKernel_Type, true);
        if(belongUserControl){
            ctlTag.setAttr('parentPath', '{this.props.fullPath}');
        }
        */
    }

    compileOnChangedEventBlueprint(theKernel, ctlTag) {
        var onchangedFunName = theKernel.id + '_' + AttrNames.Event.OnChanged;
        var onchangedBp = this.project.scriptMaster.getBPByName(onchangedFunName);
        if (onchangedBp != null) {
            var config = { nomsgbox: true };
            if (theKernel.type == M_DropdownKernel_Type) {
                config.params = [VarNames.ParentPath, 'newText', 'newValue', VarNames.NowRecord];
            }
            var compileRet = this.compileScriptBlueprint(onchangedBp, config);
            if (compileRet == false) {
                return false;
            }
            if (theKernel.type == M_DropdownKernel_Type) {
                var appandColumns_arr = theKernel.getAppandColumns();
                appandColumns_arr.forEach(x => {
                    compileRet.scope.getVar(x, true, VarNames.NowRecord + '.' + x);
                });
            }
            ctlTag.setAttr('onchanged', '{' + onchangedFunName + '}');
        }
    }

    compileScriptBlueprint(targetBP, config) {
        if (this.compiledScriptBP_map[targetBP.id]) {
            return this.compiledScriptBP_map[targetBP.id];
        }
        var project = this.project;
        var logManager = project.logManager;
        var useScope = targetBP.type == FunType_Client ? this.clientSide.scope : this.serverSide.scope;
        var compileHelper = new JSNode_CompileHelper(logManager, null, useScope);
        compileHelper.clickLogBadgeItemHandler = this.projectCompiler.clickJSCompilerLogBadgeItemHandler;
        compileHelper.serverSide = this.serverSide;
        compileHelper.clientSide = this.clientSide;
        compileHelper.sqlBPCacheManager = this.projectCompiler;
        compileHelper.jsBPCacheManager = this.projectCompiler;
        compileHelper.config = config;
        compileHelper.projectCompiler = this.projectCompiler;
        logManager.log('编译脚本:' + targetBP.name);
        var compileRet = targetBP.compile(compileHelper);
        if (compileRet == false) {
            return false;
        }
        var cname;
        for (var fi in compileHelper.useForm_map) {
            var formMidData = this.projectCompiler.getMidData(fi);
            var useColumns_map = compileHelper.useForm_map[fi].useColumns_map;
            var useControls_map = compileHelper.useForm_map[fi].useControls_map;
            for (cname in useColumns_map) {
                formMidData.useColumns_map[cname] = 1;
            }
            for (cname in useControls_map) {
                formMidData.useControls_map[cname] = 1;
            }
        }
        compileRet.useForm_map = compileHelper.useForm_map;
        compileRet.useGlobalControls_map = compileHelper.useGlobalControls_map;
        compileRet.useEntities_map = compileHelper.useEntities_map;
        this.compiledScriptBP_map[targetBP.id] = compileRet;
        var apiName;
        if (!IsEmptyObject(compileHelper.useMobileDDApi)) {
            for (apiName in compileHelper.useMobileDDApi) {
                this.clientSide.mobileDDApis_map[apiName] = 1;
            }
        }
        if (!IsEmptyObject(compileHelper.usePcDDApi)) {
            for (apiName in compileHelper.usePcDDApi) {
                this.clientSide.pcDDApis_map[apiName] = 1;
            }
        }
        return compileRet;
    }

    compileUserControlTemplate(userCtlKernel) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(userCtlKernel.getReactClassName(), true);
        var layoutConfig = userCtlKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        var styleID = userCtlKernel.id + '_style';
        var styleStr = 'style={this.props.style}';
        if(clientSide.addStyleObject(styleID, layoutConfig.style)){
            styleStr = 'style={this.props.style ? this.props.style : ' + styleID + '}';
        }
        var orientation = userCtlKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var ctlMidData = this.projectCompiler.getMidData(userCtlKernel.id);
        ctlMidData.layoutConfig = layoutConfig;
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.inst_arr = [];
        ctlMidData.needSetStateChangedActs_arr = [];
        ctlMidData.initOnRowChanged = userCtlKernel.getAttribute(AttrNames.InitOnRowChanged);
        ctlMidData.propChecker_map = {};
        var invisbleAct = userCtlKernel.getAttribute(AttrNames.InvisibleAct);

        var childRenderBlock = new FormatFileBlock(userCtlKernel.id);
        var renderBlock = controlReactClass.renderFun;
        var retElemClassName = '{(this.props.className ? this.props.className : ';
        if (invisbleAct == EInvisibleAct.Default) {
            layoutConfig.addClass('d-flex');
            renderBlock.pushLine('if(this.props.visible == false){return null;}');
            retElemClassName += singleQuotesStr(layoutConfig.getClassName()) + ')}';
        }
        else {
            retElemClassName += singleQuotesStr(layoutConfig.getClassName()) + ")+(this.props.visible == false ? ' d-none' : ' d-flex')}";
        }
        renderBlock.pushLine('var needFullPath = this.props.onMouseDown != null;');
        renderBlock.pushLine(makeStr_AddAll(VarNames.RetElem, " = <div className=", retElemClassName, " ", styleStr, " userctlpath={this.props.fullPath} ctl-fullpath={needFullPath ? this.props.fullPath : null} onMouseDown={this.props.onMouseDown}", ">"), 1);
        renderBlock.pushChild(childRenderBlock);
        renderBlock.subNextIndent();
        renderBlock.pushLine('</div>');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'visible'), '(' + makeStr_DotProp(VarNames.CtlState, VarNames.Visible) + ' == null && ownprops.' + AttrNames.DefaultVisible + ' != false) || ' + makeStr_DotProp(VarNames.CtlState, VarNames.Visible) + ' == true'));
        var cusParams_arr = [];
        userCtlKernel.getParamApiAttrArray().forEach(paramApiItem => {
            cusParams_arr.push(paramApiItem.label);
            controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, paramApiItem.label), makeStr_DotProp(VarNames.CtlState, paramApiItem.label)));
        });
        var attrValue;
        var eventApiAttr_arr = userCtlKernel.getEventApiAttrArray();
        for (var eai in eventApiAttr_arr) {
            var eventApiItem = eventApiAttr_arr[eai];
            attrValue = userCtlKernel.getAttribute(eventApiItem.name.replace('#', '_'));
            if (attrValue != null) {
                if (IsEmptyString(attrValue.name)) {
                    logManager.errorEx([logManager.createBadgeItem(
                        userCtlKernel.getReadableName(),
                        userCtlKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        '自订事件没有名称']);
                    return false;
                }
            }
        }

        var funApiAttr_arr = userCtlKernel.getFunctionApiAttrArray();
        for (var fai in funApiAttr_arr) {
            var funApiItem = funApiAttr_arr[fai];
            attrValue = userCtlKernel.getAttribute(funApiItem.name);
            if (IsEmptyString(attrValue)) {
                logManager.errorEx([logManager.createBadgeItem(
                    userCtlKernel.getReadableName(),
                    userCtlKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '自订方法没有名称']);
                return false;
            }
            var funBPname = userCtlKernel.id + '_' + funApiItem.name;
            var funBp = project.scriptMaster.getBPByName(funBPname);
            if (funBp == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    userCtlKernel.getReadableName(),
                    userCtlKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '自订方法没有实现']);
                return false;
            }
            var funBoComRet = this.compileScriptBlueprint(funBp, null);
            if (funBoComRet == false) {
                return false;
            }
        }

        var savePropCheckBlock = new FormatFileBlock('savePropCheckBlock');
        controlReactClass.renderFun.pushChild(savePropCheckBlock);
        controlReactClass.savePropCheckBlock = savePropCheckBlock;
        savePropCheckBlock.pushLine('var needSetState = {};');
        savePropCheckBlock.pushLine('var nowState = store.getState();');
        savePropCheckBlock.pushLine('var calledAct_map = {};');
        savePropCheckBlock.pushLine('var ctlState = getStateByPath(nowState,this.props.fullPath,{});');
        savePropCheckBlock.pushLine('var savedProps = Object.assign({}, ctlState.savedProps);');
        savePropCheckBlock.pushLine('var savedPropsChanged = false;');
        savePropCheckBlock.pushLine('var rowChanged = savedProps.rowkey != null && this.props.rowkey != savedProps.rowkey;');
        controlReactClass.renderFun.pushLine('if(rowChanged || savedProps.rowkey == null){savedProps.rowkey = this.props.rowkey;}');
        controlReactClass.renderFun.pushLine('if(rowChanged || savedPropsChanged){needSetState.savedProps = savedProps;}');
        controlReactClass.renderFun.pushLine('if(!IsEmptyObject(needSetState)){', 1);
        controlReactClass.renderFun.pushLine('setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));},50);', -1);
        controlReactClass.renderFun.pushLine('}');

        var ctlInitFun = null;
        var ctlPathParamName = 'ctlFullPath';
        ctlInitFun = clientSide.scope.getFunction('init' + userCtlKernel.id, true, [VarNames.State, ctlPathParamName]);
        ctlInitFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        ctlInitFun.scope.getVar(userCtlKernel.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, ctlPathParamName, '{}']));
        controlReactClass.initFun = ctlInitFun;
        ctlInitFun.retBlock.pushLine(makeLine_Return(VarNames.State));


        for (var ci in userCtlKernel.children) {
            var childKernel = userCtlKernel.children[ci];
            if (this.compileKernel(childKernel, childRenderBlock, controlReactClass.renderFun) == false) {
                return false;
            }
        }

        this.compileChain.reverse();
        for (var ki in this.compileChain) {
            if (this.endKernelCompile(this.compileChain[ki]) == false) {
                return false;
            }
        }
        this.compileChain = [];

        var createPropChangedFun = (propName) => {
            var changedFunName = propName + 'changed';
            var changedFun = controlReactClass.getFunction(changedFunName);
            if (changedFun == null) {
                changedFun = controlReactClass.getFunction(changedFunName, true, ['nowState', VarNames.State, 'calledAct_map']);
                changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                changedFun.retBlock.pushLine('return ' + VarNames.NeedSetState + ';');

                controlReactClass.savePropCheckBlock.pushLine("if(rowChanged || savedProps." + propName + " != this.props." + propName + "){", 1);
                controlReactClass.savePropCheckBlock.pushLine("needSetState = Object.assign(needSetState,this." + changedFunName + "(nowState,ctlState,calledAct_map));");
                controlReactClass.savePropCheckBlock.pushLine("savedPropsChanged = true;");
                controlReactClass.savePropCheckBlock.pushLine("savedProps." + propName + " = this.props." + propName + ';', -1);
                controlReactClass.savePropCheckBlock.pushLine('}');
            }
            return changedFun;
        };

        var targetParam;
        var attrHookAttr_arr = userCtlKernel.getAttrArrayList(AttrNames.AttrHook);
        for (var ahi in attrHookAttr_arr) {
            var hookAttr = attrHookAttr_arr[ahi];
            attrValue = userCtlKernel.getAttribute(hookAttr.name);
            if (attrValue == null) {
                continue;
            }
            if (IsEmptyString(attrValue.params)) {
                continue;
            }
            var hookParams_arr = attrValue.params.split(';');
            var hookfunBPname = userCtlKernel.id + '_' + hookAttr.name;
            var hookfunBp = project.scriptMaster.getBPByName(hookfunBPname);
            if (hookfunBp == null) {
                continue;
            }
            var hookFunComRet = this.compileScriptBlueprint(hookfunBp, null);
            if (hookFunComRet == false) {
                return false;
            }

            for (var hpi in hookParams_arr) {
                targetParam = hookParams_arr[hpi];
                if (cusParams_arr.indexOf(targetParam) == -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        userCtlKernel.getReadableName(),
                        userCtlKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '属性钩子' + ahi + '的属性"' + targetParam + '"找不到']);
                    return false;
                }
                var changedFun = createPropChangedFun(targetParam);
                var actKey = 'call_' + hookfunBPname;
                changedFun.pushLine("if(calledAct_map['" + actKey + "'] == null){", 1);
                changedFun.pushLine('calledAct_map[' + singleQuotesStr(actKey) + ']=1;');
                changedFun.pushLine(makeStr_callFun(hookfunBPname, ['nowState', 'this.props.fullPath', VarNames.State, VarNames.NeedSetState], ';'), -1);
                changedFun.pushLine('}');
            }
        }
        var attrCheckerAttr_arr = userCtlKernel.getAttrArrayList(AttrNames.AttrChecker);
        for (var aci in attrCheckerAttr_arr) {
            var checkerAttr = attrCheckerAttr_arr[aci];
            attrValue = userCtlKernel.getAttribute(checkerAttr.name);
            if (attrValue == null) {
                continue;
            }
            if (IsEmptyString(attrValue.params)) {
                continue;
            }
            var checkParams_arr = attrValue.params.split(';');
            var checkfunBPname = userCtlKernel.id + '_' + checkerAttr.name;
            var checkfunBp = project.scriptMaster.getBPByName(checkfunBPname);
            if (checkfunBp == null) {
                continue;
            }
            var checkFunComRet = this.compileScriptBlueprint(checkfunBp, null);
            if (checkFunComRet == false) {
                return false;
            }

            for (var cpi in checkParams_arr) {
                targetParam = checkParams_arr[cpi];
                if (cusParams_arr.indexOf(targetParam) == -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        userCtlKernel.getReadableName(),
                        userCtlKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '属性验证器' + cpi + '的属性"' + targetParam + '"找不到']);
                    return false;
                }
                if (ctlMidData.propChecker_map[targetParam] != null) {
                    logManager.errorEx([logManager.createBadgeItem(
                        userCtlKernel.getReadableName(),
                        userCtlKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '属性验证器' + cpi + '的属性"' + targetParam + '"已经重复设置']);
                    return false;
                }
                ctlMidData.propChecker_map[targetParam] = checkfunBp.name;
            }
        }

        if (ctlMidData.needSetKernels_arr.length > 0) {
            var userControlInitBlock = new FormatFileBlock('userControlInitBlock');
            for (ci in ctlMidData.needSetKernels_arr) {
                var targetKernel = ctlMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = targetKernel.getStatePath(stateItem.name);
                        if (stateItem.isInitUserControlCall) {
                            userControlInitBlock.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, ctlPathParamName + "+ '." + stateItem.kernel.id + "'"], ';'));
                        }
                        else if (stateItem.isDynamic) {
                            if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                var setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.State, 'null', ctlPathParamName]));
                                ctlInitFun.pushLine(setLine);
                            }
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
                                    case '""':
                                    case "''":
                                        break;
                                    default:
                                        sv = singleQuotesStr(sv);
                                }
                                ctlInitFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv));
                            }
                            else if (stateItem.setNull) {
                                ctlInitFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
                            }
                            else {
                                console.error('无法处理的kernel');
                            }
                        }
                    });
                }
            }
            ctlInitFun.pushLine(VarNames.State + ' = ' + makeStr_callFun('setManyStateByPath', [VarNames.State, ctlPathParamName, VarNames.NeedSetState]));
            ctlInitFun.pushChild(userControlInitBlock);
        }
        // gen relyon code
        //userCtlKernel 
        //ctlMidData
        //controlReactClass
        for (var pid in this.ctlRelyOnGraph.allpath_map) {
            var relyPath = this.ctlRelyOnGraph.allpath_map[pid];
            var berelyCtl = relyPath.berelyCtl;
            var changedFun;
            var getValueStr = '';
            var rowKeyInfo_map = {
                mapVarName: 'rowKeyInfo_map',
            };

            var actKey;
            var accordionParents_arr = relyPath.relyCtl.searchParentKernel([Accordion_Type, TabItem_Type]);
            var accordionCheckStr = '';

            if (berelyCtl == userCtlKernel) {
                // Usercontrol's rely
                var changedFunName = relyPath.berelyPropName + 'changed';
                changedFun = createPropChangedFun(relyPath.berelyPropName);
                if (accordionParents_arr) {
                    accordionCheckStr = '';
                    accordionParents_arr.forEach(accordionKernel => {
                        changedFun.scope.getVar(accordionKernel.id + '_state', true, "getStateByPath(" + VarNames.State + ",'" + accordionKernel.getStatePath() + "',{});");
                        accordionCheckStr += (accordionCheckStr.length > 0 ? ' && ' : '') + accordionKernel.id + '_state.inited';
                    });
                    changedFun.pushLine('if(' + accordionCheckStr + '){', 1);
                }
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                        getValueStr = '';
                        var parentForms_arr = relyPath.relyCtl.searchParentKernel(M_FormKernel_Type, false);
                        if (parentForms_arr && parentForms_arr.find(form => { return form.isListForm() || form.isGridForm(); })) {
                            // gird、list里面的关联让其自身去管理，不在自订控件中管理了
                        }
                        else {
                            if (relyPath.approach.funName) {
                                var useParentPath = this.getKernelFullParentPath(relyPath.relyCtl);
                                if (useParentPath.length > 0) {
                                    useParentPath = ' + ' + singleQuotesStr('.' + useParentPath);
                                }
                                if (relyPath.approach.delaycall) {
                                    actKey = 'call_' + relyPath.approach.funName;
                                    changedFun.pushLine("if(delayActs." + actKey + " == null){delayActs." + actKey + " = {callfun:" + relyPath.approach.funName + ",params_arr:[" + [VarNames.State, 'null', 'this.props.fullPath' + useParentPath].join(',') + "]};};");
                                    getValueStr = '';
                                }
                                else {
                                    getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State, 'null', 'this.props.fullPath' + useParentPath]);
                                }
                            }
                            else if (relyPath.approach.value) {
                                getValueStr = relyPath.approach.value;
                            }
                            else {
                                console.error('不支持的approach!');
                            }
                            if (!IsEmptyString(getValueStr)) {
                                changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowKeyInfo_map)), getValueStr));
                            }
                        }
                        break;
                    case ECtlReplyPathType.CallFun_On_BPChanged:
                        actKey = 'call_' + relyPath.funName;
                        changedFun.pushLine("if(calledAct_map['" + actKey + "'] == null){", 1);
                        changedFun.pushLine('calledAct_map[' + singleQuotesStr(actKey) + ']=1;');
                        changedFun.pushLine(makeStr_callFun(relyPath.funName, relyPath.params_arr, ';'), -1);
                        changedFun.pushLine('}');
                        break;
                    default:
                        console.error('自订控件不支持的:' + relyPath.type);
                        break;
                }
                if (accordionParents_arr) {
                    changedFun.subNextIndent();
                    changedFun.pushLine('}');
                }
            }
            else {
                var propFulPath;
                var propChangedHandlerName;
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                    case ECtlReplyPathType.CallFun_On_BPChanged:
                        var rootPathVarName = userCtlKernel.id + '_path';
                        var rootStateVarName = userCtlKernel.id + '_state';
                        propFulPath = relyPath.berelyCtl.getStatePath(relyPath.berelyPropName, '.', null, true);
                        propChangedHandlerName = relyPath.berelyCtl.id + '_' + relyPath.berelyPropName + '_changed';
                        changedFun = clientSide.scope.getFunction(propChangedHandlerName);
                        if (changedFun == null) {
                            changedFun = clientSide.scope.getFunction(propChangedHandlerName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
                            changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                            changedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                            ctlMidData.needSetStateChangedActs_arr.push(
                                {
                                    propName: propFulPath,
                                    funName: propChangedHandlerName + '.bind(window)',
                                }
                            );
                        }
                        
                        var rootPathInit = makeStr_callFun('getBelongUserCtlPath', ['path']);
                        if(relyPath.berelyCtl.type == UserControlKernel_Type){
                            rootPathInit =  makeStr_callFun('getBelongUserCtlPath', ['path', 'null', 'true']);
                        }
                        var rootPathVar = changedFun.scope.getVar(rootPathVarName, true, rootPathInit);
                        var rootStateVar = changedFun.scope.getVar(rootStateVarName, true, makeStr_callFun('getStateByPath', [VarNames.State, rootPathVarName, '{}']));
                        if (accordionParents_arr) {
                            accordionCheckStr = '';
                            accordionParents_arr.forEach(accordionKernel => {
                                changedFun.scope.getVar(accordionKernel.id + '_state', true, "getStateByPath(" + rootStateVarName + ",'" + accordionKernel.getStatePath() + "',{});");
                                accordionCheckStr += (accordionCheckStr.length > 0 ? ' && ' : '') + accordionKernel.id + '_state.inited';
                            });
                            changedFun.pushLine('if(' + accordionCheckStr + '){', 1);
                        }
                        if (relyPath.type == ECtlReplyPathType.SetAP_On_BPChanged) {
                            getValueStr = '';
                            if (relyPath.approach.funName) {
                                var useParentPath = this.getKernelFullParentPath(relyPath.relyCtl);
                                if (useParentPath.length > 0) {
                                    useParentPath = ' + ' + singleQuotesStr('.' + useParentPath);
                                }
                                if (relyPath.approach.delaycall) {
                                    actKey = 'call_' + relyPath.approach.funName;
                                    changedFun.pushLine("if(delayActs." + actKey + " == null){delayActs." + actKey + " = {callfun:" + relyPath.approach.funName + ",params_arr:[" + [VarNames.State, 'null', rootPathVarName + useParentPath].join(',') + "]};};");
                                    getValueStr = '';
                                }
                                else {
                                    getValueStr = makeStr_callFun(relyPath.approach.funName, [rootStateVarName, 'null', rootPathVarName + useParentPath]);
                                }
                            }
                            else if (relyPath.approach.value) {
                                getValueStr = relyPath.approach.value;
                            }
                            else {
                                console.error('不支持的approach!');
                            }
                            if (!IsEmptyString(getValueStr)) {
                                changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "''+" + rootPathVarName + "+'." + relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowKeyInfo_map) + "'"), getValueStr));
                            }
                        }
                        else {
                            actKey = 'call_' + relyPath.funName;
                            changedFun.pushLine("if(delayActs['" + actKey + "'] == null){delayActs['" + actKey + "'] = {callfun:" + relyPath.funName + ",params_arr:[" + relyPath.params_arr + "]};};");
                        }
                        break;
                }
                if (accordionParents_arr) {
                    changedFun.subNextIndent();
                    changedFun.pushLine('}');
                }
            }
        }
        this.ctlRelyOnGraph.allpath_map = [];
        this.ctlRelyOnGraph.allgraph_map = [];

        var onInitunName = userCtlKernel.id + '_' + AttrNames.Event.OnInit;
        var onInitBp = project.scriptMaster.getBPByName(onInitunName);
        if (onInitBp != null) {
            if (this.compileScriptBlueprint(onInitBp, { nomsgbox: true, muteMode: true }) == false) {
                return false;
            }
            ctlInitFun.pushLine(makeStr_callFun(onInitunName, [userCtlKernel.id + '_state', ctlPathParamName]));
        }

        return true;
    }

    compilePage(pageKernel) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;
        if (pageKernel.getAttribute(AttrNames.IsMain)) {
            if (this.mianPageKernel == null) {
                this.mianPageKernel = pageKernel;
            }
            else {
                logManager.error('重复设置主页面:' + pageKernel.getAttribute(AttrNames.Title));
            }
        }
        var pageLayoutConfig = pageKernel.getLayoutConfig();
        var isPopable = pageKernel.getAttribute(AttrNames.PopablePage);
        var pageMidData = this.projectCompiler.getMidData(pageKernel.id);
        pageMidData.needSetKernels_arr = [];
        var pageReactClass = clientSide.getReactClass(pageKernel.getReactClassName(), true);
        pageReactClass.renderHeaderFun = pageReactClass.getFunction('renderHead', true);
        pageReactClass.renderHeadButtonFun = pageReactClass.getFunction('renderHeadButton', true);
        var pageTitle = pageKernel.getAttribute(AttrNames.Title);
        var hideTitle = pageKernel.getAttribute(AttrNames.HideTitle);

        pageReactClass.constructorFun.pushLine('this.id=' + singleQuotesStr(pageKernel.id) + ';');
        pageReactClass.constructorFun.pushLine('ERPC_Page(this);');
        pageReactClass.renderHeadButtonFun.headBlock.pushLine('var rlt_arr=[];');
        pageReactClass.renderHeadButtonFun.retBlock.pushLine('return rlt_arr;');
        //pageReactClass.renderFootFun = pageReactClass.getFunction('renderFoot', true);
        //pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        if (!isPopable) {
            var autoHomeBtn = pageKernel.getAttribute(AttrNames.AutoHomeBtn);
            var caseBlock = this.appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
            caseBlock.pushLine(makeLine_Assign('pageElem', '<' + pageKernel.getReactClassName(true) + ' />'));

            var gotoPageCaseBlock = clientSide.gotoPageFun.switchBlock.getCaseBlock(singleQuotesStr(pageKernel.id));
            gotoPageCaseBlock.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(makeFName_activePage(pageKernel), [VarNames.ReState])));
            if (!hideTitle) {
                pageReactClass.renderHeaderFun.pushLine("var routeElem = " + VarNames.PageRouter + ".length > 1 ? <i className='fa fa-arrow-left' /> : null;");
                pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
                pageReactClass.renderHeaderFun.pushLine("<h3 onClick={pageRoute_Back}>{routeElem}" + pageTitle + "</h3>");
                pageReactClass.renderHeaderFun.pushLine("<span className='flex-grow-1 flex-shrink-1' />");
                pageReactClass.renderHeaderFun.pushLine("{this.renderHeadButton()}");
                pageReactClass.renderHeaderFun.subNextIndent();
                pageReactClass.renderHeaderFun.pushLine("</div>);");

                pageReactClass.renderHeadButtonFun.pushLine("if(gParentFrame){rlt_arr.push(<button key='_closebtn' onClick={wantCloseInFramePage} className='btn-sm btn-danger mr-1'><i className='fa fa-close' /></button>)}");
                pageReactClass.renderHeadButtonFun.pushLine("else{", 1);
                if (autoHomeBtn) {
                    pageReactClass.renderHeaderFun.pushLine("rlt_arr.push(<button key='homebtn' onClick={wantGoHomePage} className='btn-sm btn-light mr-1'><i className='fa fa-home' /></button>);");
                }
                pageReactClass.renderHeadButtonFun.subNextIndent();
                pageReactClass.renderHeadButtonFun.pushLine('}');
            }
        }
        else {
            if (!hideTitle) {
                pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
                pageReactClass.renderHeaderFun.pushLine("<h3 className='flex-grow-1 flex-shrink-1'>" + pageTitle + "</h3>", -1);
                if (pageKernel.getAttribute(AttrNames.AutoCloseBtn)) {
                    pageReactClass.renderHeaderFun.pushLine("<button onClick={this.close} className={'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '')}><i className='fa fa-close' /></button>");
                }
                pageReactClass.renderHeaderFun.pushLine("</div>);");
            }

            //pageReactClass.constructorFun.pushLine('this.close = this.close.bind(this);');
            //var closeFun = pageReactClass.getFunction('close', true, ['exportParam']);

            var onClickCloseFunName = pageKernel.id + '_' + AttrNames.Event.OnClickCloseBtn;
            var onClickCloseBp = project.scriptMaster.getBPByName(onClickCloseFunName);
            if (onClickCloseBp != null) {
                var compileRet = this.compileScriptBlueprint(onClickCloseBp, { params: [], haveDoneTip: false });
                if (compileRet == false) {
                    return false;
                }
                //closeFun.pushLine(onClickCloseFunName + '();');
                pageReactClass.constructorFun.pushLine('this.clickCloseFun = ' + onClickCloseFunName + ';');
            }
            /*
            else {
                closeFun.pushLine('exportParam = exportParam == null ? {} : exportParam;');
                closeFun.pushLine('closePage(' + singleQuotesStr(pageKernel.id) + ');');
                closeFun.pushLine('var callBack = ' + makeStr_callFun('getPageEntryParam', [singleQuotesStr(pageKernel.id), singleQuotesStr('callBack')], ';'));
                closeFun.pushLine('if(callBack){callBack(exportParam);}');
            }
            */
        }
        /*
        pageReactClass.renderFootFun.pushLine("return (<div className='flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter'>", 1);
        pageReactClass.renderFootFun.pushLine("<h3>页脚</h3>", -1);
        pageReactClass.renderFootFun.pushLine("</div>);");
        */

        pageReactClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        if (isPopable) {
            var styleID = pageKernel.id + '_style';
            var styleStr = clientSide.addStyleObject(styleID, pageLayoutConfig.style) ? 'style={' + styleID + '}' : '';
            pageReactClass.renderFun.pushLine("<div className={'d-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage')} " + styleStr + ">", 1);
        }
        else {
            pageReactClass.renderFun.pushLine("<div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>", 1);
        }
        pageReactClass.renderFun.pushLine("{this." + pageReactClass.renderHeaderFun.name + "()}");
        pageReactClass.renderFun.pushLine("{this.renderContent()}");
        //pageReactClass.renderFun.pushLine("{this." + pageReactClass.renderFootFun.name + "()}", -1);
        pageReactClass.renderFun.subNextIndent();
        pageReactClass.renderFun.pushLine("</div>);");

        var pageOrientation = pageKernel.getAttribute(AttrNames.Orientation);
        var hadScroll = pageKernel.getAttribute(AttrNames.HadScroll);
        pageLayoutConfig.addClass('d-flex');
        pageLayoutConfig.addClass('flex-grow-1');
        if (isPopable) {
            pageLayoutConfig.addClass('flex-shrink-1');
        }
        else {
            pageLayoutConfig.addClass('flex-shrink-0');
        }
        if (pageOrientation == Orientation_V) {
            pageLayoutConfig.addClass('flex-column');
        }
        if (hadScroll) {
            pageLayoutConfig.addClass('autoScroll_Touch');
        }
        if(hideTitle){
            pageLayoutConfig.addClass('fixPageContent_notitle');
        }
        else{
            pageLayoutConfig.addClass('fixPageContent');
        }

        pageReactClass.renderContentFun = pageReactClass.getFunction('renderContent', true);
        pageReactClass.renderContentFun.pushLine(VarNames.RetElem + " = (", 1);
        pageReactClass.renderContentFun.pushLine("<div className='" + pageLayoutConfig.getClassName() + "'>", 1);
        var pageRenderBlock = new FormatFileBlock(pageKernel.id);
        pageReactClass.renderContentFun.pushChild(pageRenderBlock);
        pageReactClass.renderContentFun.subNextIndent();
        pageReactClass.renderContentFun.pushLine("</div>);");
        pageReactClass.renderContentFun.scope.getVar(VarNames.RetElem, true, 'null');
        pageReactClass.renderContentFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));

        var funApiAttr_arr = pageKernel.getFunctionApiAttrArray();
        var attrValue;
        for (var fai in funApiAttr_arr) {
            var funApiItem = funApiAttr_arr[fai];
            attrValue = pageKernel.getAttribute(funApiItem.name);
            if (IsEmptyString(attrValue)) {
                logManager.errorEx([logManager.createBadgeItem(
                    pageKernel.getReadableName(),
                    pageKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '自订方法没有名称']);
                return false;
            }
            var funBPname = pageKernel.id + '_' + funApiItem.name;
            var funBp = project.scriptMaster.getBPByName(funBPname);
            if (funBp == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    pageKernel.getReadableName(),
                    pageKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '自订方法没有实现']);
                return false;
            }
            var funBoComRet = this.compileScriptBlueprint(funBp, null);
            if (funBoComRet == false) {
                return false;
            }
        }

        var activePageFun = clientSide.scope.getFunction(makeFName_activePage(pageKernel), true, ['state']);
        var initPageFun = clientSide.scope.getFunction(makeFName_initPage(pageKernel), true, ['state', 'parentPageID']);
        var pageLoadBlock = new FormatFileBlock('onLoad');
        var controlInitBlock = new FormatFileBlock('ctlinit');
        var userControlInitBlock = new FormatFileBlock('userctlinit');
        var activeTimeoutBlock = new FormatFileBlock('timeout');
        initPageFun.scope.getVar(VarNames.NeedSetState, true, '{parentPageID:parentPageID}');
        initPageFun.scope.getVar(VarNames.FullParentPath, true, singleQuotesStr(pageKernel.id));
        initPageFun.pushLine('var hadState = state != null;');
        initPageFun.pushLine('if(!hadState){state = store.getState();}');
        initPageFun.pushChild(pageLoadBlock);
        initPageFun.pushChild(controlInitBlock);
        initPageFun.pushChild(userControlInitBlock);
        initPageFun.pushLine('setTimeout(() => {', 1);
        initPageFun.pushChild(activeTimeoutBlock);
        initPageFun.subNextIndent();
        initPageFun.pushLine('}, 50);');
        initPageFun.pushLine(VarNames.NeedSetState + "[" + singleQuotesStr(pageKernel.id + '.parentPageID') + "]=parentPageID;");
        initPageFun.pushLine(VarNames.NeedSetState + "[" + singleQuotesStr(pageKernel.id + '._magicobj') + "]={};");
        initPageFun.pushLine('if(hadState){', 1);
        initPageFun.pushLine("state = setManyStateByPath(state,''," + VarNames.NeedSetState + ");", -1);
        initPageFun.pushLine('}else{', 1);
        initPageFun.pushLine("store.dispatch(makeAction_setManyStateByPath(" + VarNames.NeedSetState + ", ''));", -1);
        initPageFun.pushLine('}');
        initPageFun.retBlock.pushLine('return state;');

        var onloadFunName = pageKernel.id + '_' + AttrNames.Event.OnLoad;
        var onLoadBp = project.scriptMaster.getBPByName(onloadFunName);
        if (onLoadBp != null) {
            if (this.compileScriptBlueprint(onLoadBp, { nomsgbox: true }) == false) {
                return false;
            }
            pageLoadBlock.pushLine('setTimeout(() => {' + makeStr_callFun(onloadFunName) + ';},50);');
        }

        var onreceiveMsgFunName = pageKernel.id + '_' + AttrNames.Event.OnReceiveMsg;
        var onReceiveMsgBp = project.scriptMaster.getBPByName(onreceiveMsgFunName);
        if (onReceiveMsgBp != null) {
            if (this.compileScriptBlueprint(onReceiveMsgBp, { nomsgbox: true }) == false) {
                return false;
            }
            clientSide.endBlock.pushLine('gPageReceiveMsgHandlers_arr.push(' + onreceiveMsgFunName + ');');
        }

        if (isPopable) {
            // 弹出式窗体
        }
        else {
            // 非弹出式窗体
            activePageFun.pushLine(makeLine_Assign('state.nowPage', singleQuotesStr(pageKernel.id)));
            if (pageKernel.getAllEntryParams().length == 0) {
                // 有入口参数的页面需要每次都执行init
                activePageFun.pushLine("if(" + makeActStr_getGDataCache(pageKernel.id + '_opened') + "){return state;}");
            }
            activePageFun.pushLine(makeLine_setGDataCache(pageKernel.id + '_opened', 1));
        }
        activePageFun.retBlock.pushLine('return ' + makeStr_callFun(initPageFun.name, ['state'], ';'));

        for (var ci in pageKernel.children) {
            var childKernel = pageKernel.children[ci];
            if (this.compileKernel(childKernel, pageRenderBlock, pageReactClass.renderContentFun) == false) {
                return false;
            }
        }

        if (pageMidData.needSetKernels_arr.length > 0) {
            var needSetStateVar = initPageFun.scope.getVar(VarNames.NeedSetState, true, '{}');
            for (ci in pageMidData.needSetKernels_arr) {
                var targetKernel = pageMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = targetKernel.getStatePath(stateItem.name);
                        if (stateItem.isInitUserControlCall) {
                            userControlInitBlock.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, singleQuotesStr(pageKernel.id + '.' + stateItem.kernel.id)], ';'));
                        }
                        else if (stateItem.isDynamic) {
                            if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                var setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.State, 'null', singleQuotesStr(pageKernel.id)]));
                                controlInitBlock.pushLine(setLine);
                            }
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
                                    case '""':
                                    case "''":
                                        break;
                                    default:
                                        sv = singleQuotesStr(sv);
                                }
                                controlInitBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv));
                            }
                            else if (stateItem.setNull) {
                                controlInitBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
                            }
                            else {
                                console.error('无法处理的kernel');
                            }
                        }
                    });
                }
            }
            controlInitBlock.pushLine('state = ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
        }

        pageReactClass.mapStateFun.pushLine("var pageState = getStateByPath(state, '" + pageKernel.id + "', {});");
        pageReactClass.addMapState('sidepages_arr', 'pageState.sidepages_arr');
        pageReactClass.addMapState('parentPageID', 'pageState.parentPageID');
        pageRenderBlock.pushLine('{this.renderSidePage()}');
    }

    getKernelParentPath(theKernel) {
        var nowKernel = theKernel.parent;
        var rlt = '';
        do {
            switch (nowKernel.type) {
                case M_PageKernel_Type:
                    rlt = nowKernel.id;
                    break;
                case M_LabeledControlKernel_Type:
                case M_ContainerKernel_Type:
                case PopperButtonKernel_Type:
                    nowKernel = nowKernel.parent;
                    break;
                default:
                    rlt = '{this.props.fullPath}';
            }
            if (rlt.length > 0) {
                break;
            }
        } while (nowKernel != null);
        theKernel.parentPath = rlt;
        return rlt;
    }

    getKernelFullParentPath(theKernel) {
        var nowKernel = theKernel.parent;
        var rlt = '';
        do {
            switch (nowKernel.type) {
                case M_FormKernel_Type:
                case M_PageKernel_Type:
                case Accordion_Type:
                case TabItem_Type:
                case TabControl_Type:
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : '.') + rlt;
                    break;
                case UserControlKernel_Type:
                    //rlt = (nowKernel.parent == null ? nowKernel.id : nowKernel.refID) + (rlt.length == 0 ? '' : '.') + rlt;
                    nowKernel = null;
                    break;
            }
            if (nowKernel) {
                nowKernel = nowKernel.parent;
            }
        } while (nowKernel != null);
        theKernel.fullParentPath = rlt;
        return rlt;
    }

    compileKernel(theKernel, renderBlock, renderFun) {
        this.compileChain.push(theKernel);
        var project = this.project;
        var logManager = project.logManager;
        var rlt = true;
        switch (theKernel.type) {
            case M_ContainerKernel_Type:
                rlt = this.compileContainerKernel(theKernel, renderBlock, renderFun);
                break;
            case M_LabelKernel_Type:
                rlt = this.compileLabelKernel(theKernel, renderBlock, renderFun);
                break;
            case M_ImageKernel_Type:
                rlt = this.compileImageKernel(theKernel, renderBlock, renderFun);
                break;
            case M_FormKernel_Type:
                rlt = this.compileFormKernel(theKernel, renderBlock, renderFun);
                break;
            case M_LabeledControlKernel_Type:
                rlt = this.compileLabeledControlKernel(theKernel, renderBlock, renderFun);
                break;
            case M_TextKernel_Type:
                rlt = this.compileTextKernel(theKernel, renderBlock, renderFun);
                break;
            case ButtonKernel_Type:
                rlt = this.compileButtonKernel(theKernel, renderBlock, renderFun);
                break;
            case M_DropdownKernel_Type:
                rlt = this.compileDropdownKernel(theKernel, renderBlock, renderFun);
                break;
            case M_CheckBoxKernel_Type:
                rlt = this.compileCheckBoxKernel(theKernel, renderBlock, renderFun);
                break;
            case UserControlKernel_Type:
                rlt = this.compileUserControlKernel(theKernel, renderBlock, renderFun);
                break;
            case Accordion_Type:
                rlt = this.compileAccordionKernel(theKernel, renderBlock, renderFun);
                break;
            case TabControl_Type:
                rlt = this.compileTabControlKernel(theKernel, renderBlock, renderFun);
                break;
            case TabItem_Type:
                rlt = this.compileTabItemKernel(theKernel, renderBlock, renderFun);
                break;
            case TaskSelector_Type:
                rlt = this.compileTaskSelectorKernel(theKernel, renderBlock, renderFun);
                break;
            case MFileUploader_Type:
                rlt = this.compileMFileUploaderKernel(theKernel, renderBlock, renderFun);
                break;
            case SingleFileUploader_Type:
                rlt = this.compileSingleFileUploaderKernel(theKernel, renderBlock, renderFun);
                break;
            case FilePreviewer_Type:
                rlt = this.compileFilePreviewerKernel(theKernel, renderBlock, renderFun);
                break;
            case PopperButtonKernel_Type:
                rlt = this.compilePopperButtonKernel(theKernel, renderBlock, renderFun);
                break;
            case FrameSetKernel_Type:
                rlt = this.compileFrameSetKernel(theKernel, renderBlock, renderFun);
                break;
            case IFrameKernel_Type:
                rlt = this.compileIFrameKernel(theKernel, renderBlock, renderFun);
                break;
            case ChartKernel_Type:
                rlt = this.compileChartKernel(theKernel, renderBlock, renderFun);
                break;
            default:
                logManager.error('不支持的编译kernel type:' + theKernel.type);
        }
        return rlt;
    }

    genERPCTag(kernel, tagName) {
        var rltTag = new FormatHtmlTag(kernel.id, tagName, this.clientSide);
        var parentPath = this.getKernelParentPath(theKernel);
        rltTag.setAttr('id', kernel.id);
        rltTag.setAttr('parentPath', parentPath);
        return rltTag;
    }

    compileUserControlKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var templateKernel = project.getUserControlById(theKernel.refID);
        var templateKernelMidData = this.projectCompiler.getMidData(templateKernel.id);
        var templateReactClass = this.clientSide.getReactClass(templateKernel.getReactClassName());
        var ctlTag = new FormatHtmlTag(theKernel.id, templateKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        if (!theKernel.getAttribute(AttrNames.DefaultVisible)) {
            ctlTag.setAttr('defvisible', '{false}');
        }

        if (this.compileOnMouseDownEvent(theKernel, ctlTag) == false) {
            return false;
        }

        var insLayoutConfig = theKernel.getInsLayoutConfig();
        if(!IsEmptyObject(insLayoutConfig.class) || !IsEmptyObject(insLayoutConfig.style)){
            var templeteLayoutConfg = templateKernelMidData.layoutConfig.clone();
            templeteLayoutConfg.overrideBy(insLayoutConfig);
            if(!IsEmptyObject(insLayoutConfig.style)){
                var styleID = theKernel.id + '_style';
                this.clientSide.addStyleObject(styleID, templeteLayoutConfg.style);
                ctlTag.setAttr('style', bigbracketStr(styleID));
            }
            if(!IsEmptyObject(insLayoutConfig.class)){
                ctlTag.setAttr('className', singleQuotesStr(templeteLayoutConfg.getClassName()));
            }
        }

        renderBlock.pushChild(ctlTag);
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }
        templateKernelMidData.inst_arr.push(theKernel);
        // param interface
        var attrsSetting = gUserControlAttsByType_map[theKernel.attrsSettingID];
        var paramGroup = attrsSetting.find(group => { return group.label == '属性接口'; });
        var cusParams_arr = [];

        for(var attr_i in paramGroup.attrs_arr){
            var paramAttribute = paramGroup.attrs_arr[attr_i];
            var paramValue = theKernel.getAttribute(paramAttribute.name);
            var paramValueParseRet = parseObj_CtlPropJsBind(paramValue, project.scriptMaster);
            cusParams_arr.push(paramAttribute.label);
            if (paramValueParseRet.isScript) {
                if (this.compileScriptAttribute(paramValueParseRet, theKernel, paramAttribute.label, paramAttribute.label, { autoSetFetchState: true }) == false) {
                    return false;
                }
            }
            else {
                //ctlTag.setAttr(paramAttribute.label, paramValue);
                var setValueStateItem = null;

                if (IsEmptyString(paramValue)) {
                    setValueStateItem = {
                        name: paramAttribute.label,
                        setNull: true,
                    };
                }
                else {
                    if (belongFormKernel != null) {
                        var formColumns_arr = belongFormKernel.getCanuseColumns();
                        if (formColumns_arr.indexOf(paramValue) != -1) {
                            parentMidData.useColumns_map[paramValue] = 1;
                            setValueStateItem = {
                                name: paramAttribute.label,
                                useColumn: { name: paramValue },
                            };
                        }
                    }
                    if (setValueStateItem == null) {
                        setValueStateItem = {
                            name: paramAttribute.label,
                            staticValue: paramValue,
                            bindMode: ScriptBindMode.OnForm
                        };
                    }
                }
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        }

        var belongUserControlMidData = null;
        if (belongUserControl) {
            belongUserControlMidData = this.projectCompiler.getMidData(belongUserControl.id);
        }
        var eventParamGroup = attrsSetting.find(group => { return group.label == '事件接口'; });
        for (var eventAttribute_i in eventParamGroup.attrs_arr) {
            var eventAttribute = eventParamGroup.attrs_arr[eventAttribute_i];
            var eventBPname = theKernel.id + '_' + eventAttribute.name;
            var eventBp = project.scriptMaster.getBPByName(eventBPname);
            if (eventBp != null) {
                eventBp.startIsInReducer = true;  // 自订事件都是在reducer中
                var templateAttrValue = templateKernel.getAttribute(eventAttribute.name.replace('#', '_'));
                var eventFunName = theKernel.id + '_' + templateAttrValue.name;
                var compileRet = this.compileScriptBlueprint(eventBp, { funName: eventFunName, params: ['state', '_params', '_oldParams', '_path'] });
                if (compileRet == false) {
                    return false;
                }
                if (belongUserControl == null) {
                    this.clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, 'fun_' + templateAttrValue.name))] = eventFunName + '.bind(window)';
                }
                else {
                    // 嵌套在别的自定义控件中
                    belongUserControlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisFullPath, 'fun_' + templateAttrValue.name),
                            funName: eventFunName + '.bind(window)',
                        }
                    );
                }
            }
        }

        var clientSide = this.clientSide;
        // 实例属性侦听器
        var insAttrHooks_arr = theKernel.getAttrArrayList(AttrNames.InsAttrHook);
        for (var ahi in insAttrHooks_arr) {
            var hookAttr = insAttrHooks_arr[ahi];
            var attrValue = theKernel.getAttribute(hookAttr.name);
            if (attrValue == null) {
                continue;
            }
            if (IsEmptyString(attrValue.params)) {
                continue;
            }
            var hookParams_arr = attrValue.params.split(';');
            var hookfunBPname = theKernel.id + '_' + hookAttr.name;
            var hookfunBp = project.scriptMaster.getBPByName(hookfunBPname);
            if (hookfunBp == null) {
                continue;
            }
            var hookFunComRet = this.compileScriptBlueprint(hookfunBp, null);
            if (hookFunComRet == false) {
                return false;
            }
            var shellFun = clientSide.scope.getFunction('shell_' + hookfunBp.name, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
            shellFun.pushLine('if(delayActs.' + hookfunBp.name + ' == null){', 1);
            shellFun.pushLine("delayActs." + hookfunBp.name + " = {callfun:" + hookfunBp.name + ",params_arr:[getBelongUserCtlPath(path), rowKeyInfo_map]};",-1);
            shellFun.pushLine('}');

            for (var hpi in hookParams_arr) {
                var targetParam = hookParams_arr[hpi];
                if (cusParams_arr.indexOf(targetParam) == -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '实例属性钩子' + ahi + '的属性"' + targetParam + '"找不到']);
                    return false;
                }
                if (belongUserControl == null) {
                    this.clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, targetParam))] = shellFun.name + '.bind(window)';
                }
                else {
                    // 嵌套在别的自定义控件中
                    belongUserControlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisFullPath, targetParam),
                            funName: shellFun
                            .name + '.bind(window)',
                        }
                    );
                }
            }
        }

        templateKernel.getFunctionApiAttrArray().forEach(funAttribute => {
            var funBPname = templateKernel.id + '_' + funAttribute.name;
            var funBp = project.scriptMaster.getBPByName(funBPname);
            if (funBp != null) {
                if (belongUserControl == null) {
                    this.clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, 'fun_' + funBPname))] = funBPname + '.bind(window)';
                }
                else {
                    // 嵌套在别的自定义控件中
                    belongUserControlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisFullPath, 'fun_' + funBPname),
                            funName: funBPname + '.bind(window)',
                        }
                    );
                }
            }
        });

        if (templateReactClass.initFun) {
            kernelMidData.needSetStates_arr.push({
                isInitUserControlCall: true,
                funName: templateReactClass.initFun.name,
                kernel: theKernel,
                isDynamic: true,
                initOnRowChanged: templateKernelMidData.initOnRowChanged,
            });
        }
        if (belongUserControl == null) {
            templateKernelMidData.needSetStateChangedActs_arr.forEach(actSetting => {
                this.clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, actSetting.propName))] = actSetting.funName;
            });
            //添加授权检测
            if(templateKernelMidData.needCheckAccessFuns_arr){
                templateKernelMidData.needCheckAccessFuns_arr.forEach(theFun=>{
                    theFun.addPageCheck(belongPage);
                });
            }
        }
        else {
            // 嵌套在别的自定义控件中
            templateKernelMidData.needSetStateChangedActs_arr.forEach(actSetting => {
                belongUserControlMidData.needSetStateChangedActs_arr.push(
                    {
                        propName: makeStr_DotProp(thisFullPath, actSetting.propName),
                        funName: actSetting.funName,
                    }
                );
            });

            //添加授权检测
            if(templateKernelMidData.needCheckAccessFuns_arr){
                var belongUserControlTemplateMidData = this.projectCompiler.getMidData(belongUserControl.getTemplateKernel().id);
                if(belongUserControlTemplateMidData.needCheckAccessFuns_arr == null){
                    belongUserControlTemplateMidData.needCheckAccessFuns_arr = templateKernelMidData.needCheckAccessFuns_arr;
                }
                else{
                    belongUserControlTemplateMidData.needCheckAccessFuns_arr = belongUserControlTemplateMidData.needCheckAccessFuns_arr.concat(templateKernelMidData.needCheckAccessFuns_arr);
                }
            }
        }
    }

    compileTextKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Text', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var valType = theKernel.getAttribute(AttrNames.ValueType);
        ctlTag.setAttr('type', valType);
        if (valType == ValueType.Float) {
            ctlTag.setAttr('precision', theKernel.getAttribute(AttrNames.FloatNum));
        }
        else if (valType == ValueType.String) {
            var linetype = theKernel.getAttribute(AttrNames.LineType);
            switch (linetype) {
                case LineType_Single:
                    ctlTag.setAttr('linetype', 'single');
                    break;
                case LineType_BigMulti:
                    ctlTag.setAttr('linetype', '2x');
                    break;
                default:
                    ctlTag.setAttr('linetype', '1x');
            }
        }
        var textAlign = theKernel.getAttribute(AttrNames.TextAlign);
        if (textAlign != ETextAlign.Left) {
            ctlTag.setAttr('align', textAlign);
        }
        var isnullable = false;
        var parentLabledCtl = theKernel.getParentLabledCtl();
        if (parentLabledCtl) {
            isnullable = parentLabledCtl.getAttribute(AttrNames.Nullable);
        }
        else {
            isnullable = theKernel.getAttribute(AttrNames.Nullable);
        }
        if (isnullable) {
            ctlTag.setAttr('nullable', '{true}');
        }
        renderBlock.pushChild(ctlTag);
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileValidCheckerAttribute(theKernel) == false) { return false; }
        if (this.compileOnChangedEventBlueprint(theKernel, ctlTag) == false) { return false; }

        var editeable = theKernel.getAttribute(AttrNames.Editeable);
        if (!editeable) {
            ctlTag.setAttr('readonly', '{true}');
        }

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        var defaultCompileRet = null;
        if (defaultValParseRet.isScript) {
            defaultCompileRet = this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
            if (defaultCompileRet == false) {
                return false;
            }
        }

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            if (defaultValParseRet.isScript) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '为默认值、显示字段同时设置了脚本']);
                return false;
            }
            if (this.compileScriptAttribute(textFieldParseRet, theKernel, 'value', AttrNames.TextField, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            var reactParentKernel = theKernel.getReactParentKernel(true);
            var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var setValueStateItem = null;
            var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
            var alterValue = null;
            var hadDefaultStr = false;
            var defVal = '';
            if (!defaultValParseRet.isScript) {
                hadDefaultStr = !IsEmptyString(defaultValParseRet.string);
                defVal = defaultValParseRet.string;
                if (hadDefaultStr) {
                    alterValue = singleQuotesStr(defVal);
                }
            }
            if (belongFormKernel != null) {
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formColumns_arr.indexOf(textField) != -1) {
                    parentMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
                        alterValue: alterValue,
                    };
                }
            }
            if (setValueStateItem == null) {
                if (!defaultValParseRet.isScript) {
                    setValueStateItem = {
                        name: 'value',
                        staticValue: !hadDefaultStr ? null : defVal,
                        setNull: !hadDefaultStr,
                    };
                }
            }
            else if (belongFormKernel && belongFormKernel.getInsertSetting()) {
                // 所在gridform有新增行
                var setDefaultStateItem = null;
                if (defaultCompileRet) {
                    setDefaultStateItem = defaultCompileRet.setStateItem;
                }
                else if (!defaultValParseRet.isScript) {
                    setDefaultStateItem = {
                        name: 'value',
                        staticValue: !hadDefaultStr ? null : defVal,
                        setNull: !hadDefaultStr,
                    };
                    kernelMidData.needSetStates_arr.push(setDefaultStateItem);
                }
                setDefaultStateItem.bindMode = ScriptBindMode.OnNewRow;
            }
            if (setValueStateItem != null) {
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        }
    }

    compileCheckBoxKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_CheckBox', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        renderBlock.pushChild(ctlTag);
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileValidCheckerAttribute(theKernel) == false) { return false; }
        if (this.compileOnChangedEventBlueprint(theKernel, ctlTag) == false) { return false; }
        var editeable = theKernel.getAttribute(AttrNames.Editeable);
        if (!editeable) {
            ctlTag.setAttr('readonly', '{true}');
        }

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        if (defaultValParseRet.isScript) {
            if (this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true }) == false) {
                return false;
            }
        }

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            if (defaultValParseRet.isScript) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '为默认值、显示字段同时设置了脚本']);
                return false;
            }
            if (this.compileScriptAttribute(textFieldParseRet, theKernel, 'value', AttrNames.TextField, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var reactParentKernel = theKernel.getReactParentKernel(true);
            var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
            var setValueStateItem = null;
            var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
            if (belongFormKernel != null) {
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formColumns_arr.indexOf(textField) != -1) {
                    parentMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
                        alterValue: !defaultValParseRet.isScript && IsEmptyString(defaultValParseRet.string) ? '0' : defaultValParseRet.string,
                    };
                }
            }
            if (setValueStateItem == null) {
                if (!defaultValParseRet.isScript) {
                    setValueStateItem = {
                        name: 'value',
                        staticValue: IsEmptyString(defaultValParseRet.string) ? '0' : defaultValParseRet.string,
                    };
                }
            }
            if (setValueStateItem != null) {
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        }
    }

    compileOnMouseDownEvent(theKernel, ctlTag) {
        var project = this.project;
        var onMouseDownFunName = theKernel.id + '_' + AttrNames.Event.OnMouseDown;
        var onMouseDownBp = project.scriptMaster.getBPByName(onMouseDownFunName);
        if (onMouseDownBp != null) {
            var compileRet = this.compileScriptBlueprint(onMouseDownBp, { params: ['ev'], haveDoneTip: false });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr('onMouseDown', bigbracketStr(onMouseDownFunName));
        }
        return onMouseDownBp;
    }

    compileScriptAttribute(attrParseRet, theKernel, stateName, attrLabel, config) {
        var project = this.project;
        var logManager = project.logManager;
        if (attrParseRet.jsBp == null) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
            attrLabel + '用到了脚本，但没有创建此脚本']);
            return false;
        }

        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        /*
        if(belongFormKernel == null){
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '必须放置在Form之中']);
            return false;
        }
        */
        var scriptCompileRet = this.compileScriptBlueprint(attrParseRet.jsBp, { muteMode: true });
        if (scriptCompileRet == false) {
            return false;
        }
        if (scriptCompileRet.finalCallBackBody_bk) {
            if (scriptCompileRet.hadServerFetch) {
                scriptCompileRet.finalCallBackBody_bk.pushLine("var needSetState = {};");
                scriptCompileRet.finalCallBackBody_bk.pushLine("needSetState." + stateName + " = err == null ? data : null;");
                if (config != null) {
                    if (config.autoSetFetchState) {
                        scriptCompileRet.finalCallBackBody_bk.pushLine("needSetState.fetching = false;");
                        scriptCompileRet.finalCallBackBody_bk.pushLine("needSetState.fetchingErr = err;");
                        var ctlStatePath = VarNames.FullParentPath + '+' + singleQuotesStr('.' + theKernel.id);
                        if (belongUserControl) {
                            var ctlRelpath = theKernel.getStatePath('', '.', null, true, belongUserControl);
                            if (ctlRelpath.indexOf('.') != -1) {
                                scriptCompileRet.startFtech_bk.pushLine('var _realstatepath = ' + VarNames.FullParentPath + '.replace(' + belongUserControl.id + '_path' + " + '.','') + " + singleQuotesStr('.' + theKernel.id) + ";");
                                ctlStatePath = '_realstatepath';
                            }
                            else {
                                ctlStatePath = singleQuotesStr(theKernel.id);
                            }
                        }
                        scriptCompileRet.startFtech_bk.pushLine("state = " + makeStr_callFun('setManyStateByPath', [VarNames.State, ctlStatePath, '{fetching:true,fetchingErr:null}']));
                    }
                }
                scriptCompileRet.finalCallBackReturn_bk.pushLine("if(state == null){store.dispatch(makeAction_setManyStateByPath(needSetState, " + VarNames.FullParentPath + "+'." + theKernel.id + "'));return;}");
                scriptCompileRet.finalCallBackReturn_bk.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, VarNames.FullParentPath + "+'." + theKernel.id + "'", 'needSetState']) + ';');
            }
            else {
                scriptCompileRet.finalCallBackReturn_bk.pushLine("return err == null ? data : null;");
            }
        }

        if (config == null || config.autobind != false) {
            var visibleStyle = VisibleStyle_Both;
            var useThisFormData = null;
            var bindMode = ScriptBindMode.OnForm;
            var useThisFormColumn = false;
            var useThisFormControl = false;
            var useCtlData = null;
            var delaySet = false;
            var pName;
            var propApiitem;
            var cid;

            for (var formID in scriptCompileRet.useForm_map) {
                var useFormData = scriptCompileRet.useForm_map[formID];
                if (belongFormKernel && belongFormKernel.id == formID) {
                    useThisFormData = useFormData;
                }
                var useControl = !IsEmptyObject(useFormData.useControls_map);
                var useColumn = !IsEmptyObject(useFormData.useColumns_map);
                if (useControl) {
                    bindMode = ScriptBindMode.OnRelAttrChanged;
                    for (cid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[cid];
                        for (pName in useCtlData.useprops_map) {
                            propApiitem = useCtlData.useprops_map[pName];
                            if (propApiitem.norelyact) {
                                continue;
                            }
                            if (useFormData.useTraversal) {
                                // 使用了遍历form节点，延迟执行属性刷新
                                this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.relyStateName, {
                                    funName: scriptCompileRet.name,
                                    delaycall: true,
                                });
                            }
                            else {
                                this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.relyStateName, {
                                    funName: scriptCompileRet.name
                                });
                            }
                        }
                    }
                }
                else {
                    if (useFormData.useSelectedRow) {
                        if (useFormData.formKernel.isListForm() || useFormData.formKernel.isGridForm()) {
                            bindMode = ScriptBindMode.OnRelAttrChanged;
                            var formSelectedMode = useFormData.formKernel.getAttribute(AttrNames.SelectMode);
                            if (formSelectedMode != ESelectMode.None) {
                                var relyStateName = formSelectedMode == ESelectMode.Single ? VarNames.SelectedValue : VarNames.SelectedValues_arr;
                                this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useFormData.formKernel, relyStateName, {
                                    funName: scriptCompileRet.name
                                });
                            }
                        }
                    }
                    else if (useFormData.formKernel.isPageForm()) {
                        if (useColumn) {
                            if (belongFormKernel == null || belongFormKernel.id != formID) {
                                bindMode = ScriptBindMode.OnRelAttrChanged;
                                this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useFormData.formKernel, VarNames.RecordIndex, {
                                    funName: scriptCompileRet.name
                                });
                            }
                        }
                    }
                    else {
                        visibleStyle = VisibleStyle_Update;
                    }
                }
            }

            if (useThisFormData) {
                useThisFormColumn = !IsEmptyObject(useThisFormData.useColumns_map);
                useThisFormControl = !IsEmptyObject(useThisFormData.useControls_map);
                if (useThisFormColumn) {
                    visibleStyle = VisibleStyle_Update;
                    delaySet = true;
                }
            }

            if (!IsEmptyObject(scriptCompileRet.useGlobalControls_map)) {
                //bindMode = ScriptBindMode.OnRelAttrChanged;
                if (belongFormKernel == null) {
                    // 这个控件也是全局控件
                    bindMode = ScriptBindMode.OnRelAttrChanged;
                }
                else {
                    // 关联的是全局控件的话，不影响其在所在容器中进行初始绑定
                }
                for (var useGCSI in scriptCompileRet.useGlobalControls_map) {
                    useCtlData = scriptCompileRet.useGlobalControls_map[useGCSI];
                    for (pName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[pName];
                        if (propApiitem.norelyact) {
                            continue;
                        }
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.relyStateName, {
                            funName: scriptCompileRet.name
                        });
                    }
                }
            }
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var bindParentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
            if (bindParentMidData && bindParentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                bindParentMidData.needSetKernels_arr.push(theKernel);
            }
            kernelMidData.visibleStyle = visibleStyle;
            kernelMidData.useFormData = useThisFormData;

            if (bindMode == ScriptBindMode.OnRelAttrChanged) {
                kernelMidData.isSelfCare = true;
            }
            var setStateItem = {
                name: stateName,
                isDynamic: true,
                funName: scriptCompileRet.name,
                bindMode: bindMode,
                useColumn: useThisFormColumn,
                useControl: useThisFormControl,
                delaySet: delaySet,
            };
            kernelMidData.needSetStates_arr.push(setStateItem);
            scriptCompileRet.setStateItem = setStateItem;
        }
        return scriptCompileRet;
    }

    compileIsdisplayAttribute(theKernel, ctlTag) {
        if (!theKernel.hasAttribute(AttrNames.Isdisplay)) {
            return;
        }
        if (theKernel.parent && theKernel.parent.editor == theKernel) {
            // eidtor
            return;
        }
        var project = this.project;
        var isdisplay = theKernel.getAttribute(AttrNames.Isdisplay);
        var isdisplayParseRet = parseObj_CtlPropJsBind(isdisplay, project.scriptMaster);
        if (isdisplayParseRet.isScript) {
            var scriptCompileRet = this.compileScriptAttribute(isdisplayParseRet, theKernel, 'visible', AttrNames.Isdisplay, { autoSetFetchState: true });
            if (scriptCompileRet == false) {
                return false;
            }
            if (scriptCompileRet.defRetValue == false) {
                if (ctlTag) {
                    ctlTag.setAttr('defVisible', '{false}');
                }
            }
            if (theKernel.hasAttribute(AttrNames.DefaultVisible)) {
                if (ctlTag) {
                    if (!theKernel.getAttribute(AttrNames.DefaultVisible)) {
                        ctlTag.setAttr('definvisible', '{true}');
                    }
                }
            }
        }
        else {
            if (!isdisplay) {
                this.addNeedSetStateToParent(theKernel, { name: 'visible', staticValue: 'false' });
                if (ctlTag) {
                    ctlTag.setAttr('visible', '{false}');
                }
            }
        }
    }

    addNeedSetStateToParent(theKernel, valueItem) {
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }
        kernelMidData.needSetStates_arr.push(valueItem);
    }

    compileValidCheckerAttribute(theKernel) {
        if (!theKernel.hasAttribute(AttrNames.ValidChecker)) {
            return;
        }
        var project = this.project;
        var funName = theKernel.id + '_' + AttrNames.ValidChecker;
        var jsBP = project.scriptMaster.getBPByName(funName);
        if (jsBP) {
            var scriptCompileRet = this.compileScriptBlueprint(jsBP);
            if (scriptCompileRet == false) {
                return false;
            }
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            var useControl = false;
            var useCtlData = null;
            var pName;
            var propApiitem;
            /*
            if (belongFormKernel != null) {
                var useFormData = scriptCompileRet.useForm_map[belongFormKernel.id];
                var useColumn = false;
                if (useFormData) {
                    useColumn = !IsEmptyObject(useFormData.useColumns_map);
                    useControl = !IsEmptyObject(useFormData.useControls_map);
                    if (useControl) {
                        for (var cid in useFormData.useControls_map) {
                            useCtlData = useFormData.useControls_map[cid];
                            for (pName in useCtlData.useprops_map) {
                                propApiitem = useCtlData.useprops_map[pName];
                                this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.stateName, {
                                    funName: jsBP.name,
                                });
                            }
                        }
                    }
                }
            }
            if (!IsEmptyObject(scriptCompileRet.useGlobalControls_map)) {
                //bindMode = ScriptBindMode.OnRelAttrChanged;
                // 关联的是全局控件的话，不影响其在所在容器中进行初始绑定
                for (var useGCSI in scriptCompileRet.useGlobalControls_map) {
                    useCtlData = scriptCompileRet.useGlobalControls_map[useGCSI];
                    for (pName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[pName];
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.stateName, {
                            funName: attrParseRet.jsBp.name,
                        });
                    }
                }
            }
            */
            if (scriptCompileRet.finalCallBackBody_bk) {
                scriptCompileRet.finalCallBackBody_bk.pushLine("return err == null ? null : err.info;");
            }
        }
    }

    compileLabeledControlKernel(theKernel, renderBlock, renderFun) {
        var clientSide = this.clientSide;
        var layoutConfig = theKernel.getLayoutConfig();
        var project = this.project;
        var logManager = project.logManager;
        var label = theKernel.getAttribute(AttrNames.TextField);
        //layoutConfig.addClass('border-bottom');
        if (IsEmptyObject(label)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '没有设置标签']);
            return false;
        }

        /*
        if(){
            var ControlKernel_targetArr = [];
            ControlKernel_targetArr = theKernel.parent.children;
            var current_ControlKernelId = theKernel.id;
    
            for (var i = 0; i < ControlKernel_targetArr.length; i++) {
                var CKtemporary_Id = ControlKernel_targetArr[i].id;
                if (current_ControlKernelId == CKtemporary_Id) {
                    if(i == ControlKernel_targetArr.length - 1 || ControlKernel_targetArr[i + 1].type != M_LabeledControlKernel_Type){
                        layoutConfig.addClass('border-bottom');
                    }
                }
            }
        }
        */


        var parentForm = theKernel.parent.type == M_FormKernel_Type ? theKernel.parent : null;
        var parentPath = this.getKernelParentPath(theKernel);
        var textFieldParseRet = parseObj_CtlPropJsBind(label, project.scriptMaster);

        var labeledCtrlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_LabeledControl', this.clientSide);
        labeledCtrlTag.class = layoutConfig.class;
        labeledCtrlTag.style = layoutConfig.style;
        labeledCtrlTag.setAttr('id', theKernel.id);
        labeledCtrlTag.setAttr('parentPath', parentPath);
        var widthFactor = theKernel.getAttribute(AttrNames.WidthFactor);
        labeledCtrlTag.setAttr('wf', widthFactor);
        var renderMode = theKernel.getAttribute(AttrNames.RenderMode);
        if (renderMode != ERenderMode.Auto) {
            labeledCtrlTag.setAttr('rm', renderMode);
        }
        else {
            var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
            if (belongUserControl) {
                labeledCtrlTag.setAttr('rm', belongUserControl.getAttribute('DefRender') == '电脑' ? ERenderMode.PC : ERenderMode.Mobile);
            }
        }
        var wordNum = theKernel.getAttribute('WordNum');
        if (wordNum != 6) {
            labeledCtrlTag.setAttr('wn', wordNum);
        }

        var dynamicColumn_obj = null;
        var compileConfig = null;
        var compileRet;
        if (parentForm && parentForm.isGridForm()) {
            var parentFormMidData = this.projectCompiler.getMidData(parentForm.id);
            if (parentFormMidData.dynamicColumn_map[theKernel.id] == null) {
                parentFormMidData.dynamicColumn_map[theKernel.id] = {};
            }
            dynamicColumn_obj = parentFormMidData.dynamicColumn_map[theKernel.id];
        }

        if (textFieldParseRet.isScript) {
            compileConfig = { autoSetFetchState: true };
            if (dynamicColumn_obj) {
                compileConfig.autobind = false;
            }
            compileRet = this.compileScriptAttribute(textFieldParseRet, theKernel, 'label', AttrNames.TextField, compileConfig);
            if (compileRet == false) {
                return false;
            }
            if (dynamicColumn_obj) {
                dynamicColumn_obj.label = makeStr_callFun(compileRet.name, [VarNames.ReState, 'null', parentForm.id + '_path']);
            }
        } else {
            labeledCtrlTag.setAttr('label', label);
        }


        var isdisplay = theKernel.getAttribute(AttrNames.Isdisplay);
        var isdisplayParseRet = parseObj_CtlPropJsBind(isdisplay, project.scriptMaster);
        if (isdisplayParseRet.isScript) {
            compileConfig = { autoSetFetchState: true };
            if (dynamicColumn_obj) {
                compileConfig.autobind = false;
            }
            compileRet = this.compileScriptAttribute(isdisplayParseRet, theKernel, 'visible', AttrNames.Isdisplay, compileConfig);
            if (compileRet == false) {
                return false;
            }
            if (dynamicColumn_obj) {
                dynamicColumn_obj.visible = makeStr_callFun(compileRet.name, [VarNames.ReState, 'null', parentForm.id + '_path']);
            }
        }
        else {
            if (!isdisplay) {
                if (dynamicColumn_obj != null) {
                    dynamicColumn_obj.visible = 'false';
                }
                else {
                    this.addNeedSetStateToParent(theKernel, { name: 'visible', staticValue: 'false' });
                    labeledCtrlTag.setAttr('visible', '{false}');
                }
            }
        }

        if (!dynamicColumn_obj) {
            var tooltip = theKernel.getAttribute(AttrNames.ToolTip);
            var tooltipParseRet = parseObj_CtlPropJsBind(tooltip, project.scriptMaster);
            if (tooltipParseRet.isScript) {
                compileConfig = { autoSetFetchState: true };
                compileRet = this.compileScriptAttribute(textFieldParseRet, theKernel, 'tooltip', AttrNames.TextField, compileConfig);
                if (compileRet == false) {
                    return false;
                }
            } else {
                labeledCtrlTag.setAttr('tooltip', tooltip);
            }
        }

        var childBlock = null;
        if (parentForm == null || parentForm.getAttribute(AttrNames.FormType) == EFormType.Page) {
            childBlock = new FormatFileBlock('child');
            labeledCtrlTag.pushChild(childBlock);
            renderBlock.pushChild(labeledCtrlTag);
        }
        else {
            childBlock = renderBlock;
        }

        if (theKernel.editor) {
            if (this.compileKernel(theKernel.editor, childBlock, renderFun) == false) {
                return false;
            }
        }

        return labeledCtrlTag;
    }
    
    getFormRowBindFun(formKernel){
        var clientSide = this.clientSide;
        var rowBindFun = clientSide.scope.getFunction(makeFName_RowBind(formKernel));
        if(rowBindFun == null){
            rowBindFun = clientSide.scope.getFunction(makeFName_RowBind(formKernel), true, [VarNames.State, formKernel.id + '_path', formKernel.id + '_state',formKernel.id + '_rowpath', formKernel.id + '_rowstate', formKernel.id + '_' + VarNames.NowRecord]);
            var kernelMidData = this.projectCompiler.getMidData(formKernel.id);
            kernelMidData.rowBindFun = rowBindFun;
        }
        return rowBindFun;
    }

    compileFormKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;
        var clientSide = this.clientSide;
        var serverSide = this.serverSide;
        var layoutConfig = theKernel.getLayoutConfig();
        var parentPath = this.getKernelParentPath(theKernel);
        var fullParentPath = this.getKernelFullParentPath(theKernel);
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-0');
        layoutConfig.addClass('flex-shrink-0');
        layoutConfig.addClass('erp-form');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        var belongUserCtlMidData = belongUserControl ? this.projectCompiler.getMidData(belongUserControl.id) : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);

        var formType = theKernel.getAttribute(AttrNames.FormType);
        var isPageForm = formType == EFormType.Page;
        var isGridForm = formType == EFormType.Grid;
        var isListForm = formType == EFormType.List;
        var selectMode = theKernel.getAttribute(AttrNames.SelectMode);
        var rowKeyAttrName = theKernel.id.toLocaleLowerCase() + '_rowkey';
        var rowIndexAttrName = theKernel.id.toLocaleLowerCase() + '_rowindex';
        var hadRefreshIcon = theKernel.getAttribute(AttrNames.RefreshIcon);
        var awaysEditable = theKernel.getAttribute(AttrNames.AwaysEditable);
        var stableData = theKernel.getAttribute(AttrNames.StableData);
        var autoPull = theKernel.getAttribute(AttrNames.AutoPull);
        var isWrap = theKernel.getAttribute(AttrNames.Wrap);

        var thisfullpath = makeStr_DotProp(fullParentPath, theKernel.id);
        var pathVarName = theKernel.id + '_path';
        var stateVarName = theKernel.id + '_state';
        var useDS = theKernel.getAttribute(AttrNames.DataSource);
        if (useDS == null && !isPageForm) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '非Page表单需要数据源']);
            return false;
        }
        var tableStyleID = theKernel.id + "_tableStyle";
        var headTableStyleID = theKernel.id + "_headtableStyle";

        if (this.compileIsdisplayAttribute(theKernel, null) == false) {
            return false;
        }

        var formReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        var gridHeadPureRectClass = null;
        var gridHeadBodyPureRectClass = null;
        var gridBodyPureRectClass = null;

        var hadRowButton = false;
        var insertBtnSetting = null;
        var rowBtns_arr = [];

        var clickSelectable = theKernel.getAttribute(AttrNames.ClickSelectable);
        var OnSelectedChangedFunName = theKernel.id + '_' + AttrNames.Event.OnSelectedChanged;
        var OnSelectedChangedBp = project.scriptMaster.getBPByName(OnSelectedChangedFunName);
        var onRowChangedFunName = theKernel.id + '_' + AttrNames.Event.OnRowChanged;
        var onRowChangedBp = project.scriptMaster.getBPByName(onRowChangedFunName);
        var onDataSourceChangedFunName = theKernel.id + '_' + AttrNames.Event.OnDataSourceChanged;
        var onDataSourceChangedBp = project.scriptMaster.getBPByName(onDataSourceChangedFunName);
        var watchStateName = null;
        var callRowBindBlks = null;
        var canUseColumns_arr = theKernel.getCanuseColumns();

        if (selectMode == ESelectMode.None) {
            if (OnSelectedChangedBp) {
                if (!clickSelectable) {
                    OnSelectedChangedBp = null;
                }
            }
        }
        else {
            watchStateName = selectMode == ESelectMode.Single ? VarNames.SelectedValue : VarNames.SelectedValues_arr;
        }

        if (clickSelectable) {
            if (isGridForm) {
                if (selectMode != ESelectMode.None) {
                    clickSelectable = false;    // grid开始了选择模式后就不能再用点选功能了
                }
            }
        }
        else {
            if (isListForm && selectMode != ESelectMode.None) {
                clickSelectable = true;    // 可选list
            }
        }

        switch (formType) {
            case EFormType.Page:
                formReactClass.constructorFun.pushLine('ERPC_PageForm(this);');
                break;
            case EFormType.Grid:
                insertBtnSetting = theKernel.getInsertSetting();
                formReactClass.constructorFun.pushLine('ERPC_GridForm(this);');
                formReactClass.constructorFun.pushLine('gCreatFormSetting(this);');
                if (clickSelectable) {
                    formReactClass.constructorFun.pushLine('this.clickRowHandler = this.clickRowHandler.bind(this);');
                }
                gridHeadPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_THead', true, true);
                gridBodyPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_TBody', true, true);
                
                var tableBodyScrollFun = formReactClass.getFunction('tableBodyScroll', true, ['ev']);
                formReactClass.constructorFun.pushLine('this.' + tableBodyScrollFun.name + '=' + 'this.' + tableBodyScrollFun.name + '.bind(this);');
                tableBodyScrollFun.pushLine("document.getElementById(this.props.fullPath + 'tableheader').scrollLeft = ev.target.scrollLeft;");

                rowBtns_arr = theKernel.getRowBtnSetting();
                hadRowButton = rowBtns_arr.length > 0;
                if (hadRowButton || insertBtnSetting) {
                    var btnsVarStr = '';
                    rowBtns_arr.forEach(btnSetting => {
                        btnsVarStr += (btnsVarStr.length == 0 ? '' : ',') + "{key:'" + btnSetting.key + "',content:" + btnSetting.elemText + ", handler:this." + btnSetting.funName + ".bind(this)}";
                    });
                    formReactClass.constructorFun.pushLine('this.btns = [' + btnsVarStr + '];');
                    formReactClass.constructorFun.pushLine('this.state={};');
                    gridHeadBodyPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_THeadBody', true, true);
                }
                break;
            case EFormType.List:
                formReactClass.constructorFun.pushLine('ERPC_ListForm(this);');
                if (clickSelectable) {
                    formReactClass.constructorFun.pushLine('this.clickRowHandler = this.clickRowHandler.bind(this);');
                }
                break;
        }
        var renderContentFun = formReactClass.getFunction('renderContent', true);
        formReactClass.renderContentFun = renderContentFun;
        renderContentFun.scope.getVar(VarNames.RetElem, true, 'null');
        renderContentFun.scope.getVar(VarNames.NavElem, true, 'null');
        renderContentFun.scope.getVar('bHadBottom', true, useDS != null ? 'false' : 'true');

        var ifFetingBlock = new JSFile_IF(VarNames.Fetching, "this.props.fetching");
        ifFetingBlock.trueBlock.pushLine(VarNames.RetElem + " = renderFetcingTipDiv();");
        renderContentFun.pushChild(ifFetingBlock);

        var ifFetchErrBlock = new JSFile_IF(VarNames.FetchErr, makeStr_ThisProp(VarNames.FetchErr));
        ifFetingBlock.falseBlock.pushChild(ifFetchErrBlock);
        var fetchErrDataAct = theKernel.getAttribute(AttrNames.FetchErrAct);
        switch (fetchErrDataAct) {
            case ENoDataAct.Hidden:
                ifFetchErrBlock.pushLine("return null;");
                break;
            default:
                ifFetchErrBlock.pushLine(VarNames.RetElem + " = renderFetcingErrDiv(" + makeStr_ThisProp(VarNames.FetchErr) + ".info);");
        }

        var ifInvalidBundleBlock = new JSFile_IF(VarNames.InvalidBundle, makeStr_ThisProp(VarNames.InvalidBundle));
        ifFetchErrBlock.falseBlock.pushChild(ifInvalidBundleBlock);
        var invalidAct = theKernel.getAttribute(AttrNames.InvalidAct);
        switch (invalidAct) {
            case ENoDataAct.Hidden:
                ifInvalidBundleBlock.pushLine("return null;");
                break;
            default:
                ifInvalidBundleBlock.pushLine(VarNames.RetElem + " = renderInvalidBundleDiv();");
        }

        var renderContentBlock = ifInvalidBundleBlock.falseBlock;

        if (useDS != null) {
            var ifNowRecordBlock = new JSFile_IF('hadnowrecord', '!this.canInsert && this.props.nowRecord == null');
            if (isGridForm) {
                ifNowRecordBlock.condition = (insertBtnSetting ? 'this.state.hadNewRow != true && ' : '') + "!this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)";
            }
            else if (isListForm) {
                ifNowRecordBlock.condition = " this.props.records_arr == null || this.props.records_arr.length == 0";
            }
            ifInvalidBundleBlock.falseBlock.pushLine('bHadBottom = true;');
            ifInvalidBundleBlock.falseBlock.pushChild(ifNowRecordBlock);
            var noDataTip = theKernel.getAttribute(AttrNames.NoDataTip);
            if (IsEmptyString(noDataTip)) {
                noDataTip = '没有查询到数据';
            }
            var noDataAct = theKernel.getAttribute(AttrNames.NoDataAct);
            switch (noDataAct) {
                case ENoDataAct.Hidden:
                    ifNowRecordBlock.pushLine("return null;");
                    break;
                default:
                    ifNowRecordBlock.pushLine(VarNames.RetElem + " = <div className='m-auto'>" + noDataTip + "</div>;");
            }
            renderContentBlock = ifNowRecordBlock.falseBlock;

            formReactClass.constructorFun.pushLine('this.clickFreshHandler = this.clickFreshHandler.bind(this);');
            var clickFreshHandlerFun = formReactClass.getFunction('clickFreshHandler', true, ['ev']);
            var cusRefreshFunName = theKernel.id + '_' + AttrNames.Event.OnClickRefresh;
            var cusRefreshBP = this.project.scriptMaster.getBPByName(cusRefreshFunName);
            if (cusRefreshBP) {
                var cusRefreshCompileRet = this.compileScriptBlueprint(cusRefreshBP);
                if (cusRefreshCompileRet == false) {
                    return false;
                }
                clickFreshHandlerFun.pushLine('var scrollerElem=document.getElementById(this.props.fullParentPath+' + singleQuotesStr('.' + theKernel.id + 'scroller') + ');');
                clickFreshHandlerFun.pushLine('if(scrollerElem){gDataCache.set(this.props.fullParentPath + ' + singleQuotesStr('.' + theKernel.id + 'scrollsetting') + ',{left:scrollerElem.scrollLeft,top:scrollerElem.scrollTop});}');
                clickFreshHandlerFun.pushLine("var needSetState={fetching:true,fetchingErr:null};");
                clickFreshHandlerFun.pushLine("store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));");
                clickFreshHandlerFun.pushLine(cusRefreshFunName +  "(this.props.fullParentPath);");
            }else{
                clickFreshHandlerFun.pushLine(makeFName_pull(theKernel) + "(null, true, this.props.fullParentPath, true);");
            }
        }

        var formStyleID = theKernel.id + '_style';
        var hasFormStyle = this.clientSide.addStyleObject(formStyleID, layoutConfig.style);
        var gridBottomDivBlock = new FormatFileBlock('gridBottom');
        var hideHeader = theKernel.getAttribute(AttrNames.HideTabHead);
        var headClassInBodyTag = null;
        var headClassInFormTag = null;

        var keyColumn = theKernel.getAttribute(AttrNames.KeyColumn);
        if (keyColumn == null) {
            keyColumn = DefaultKeyColumn;
        }
        var autoHeight = theKernel.getAttribute(AttrNames.AutoHeight);
        var gridBodyTag = null;
        var childRenderBlock = null;
        var titleAlgin = theKernel.getAttribute(AttrNames.TextAlign);
        var titleAlginStr = 'justify-content-center';
        switch (titleAlgin) {
            case ETextAlign.Left:
                titleAlginStr = 'justify-content-start';
                break;
            case ETextAlign.Right:
                titleAlginStr = 'justify-content-end';
                break;
        }
        var alignitems = theKernel.getAttribute('alignitems');
        if(alignitems == 'initial'){
            alignitems = '';
        }
        else{
            alignitems = " align-items-" + alignitems;
        }
        if (isPageForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = (<React.Fragment>", 1);
            renderContentBlock.pushLine("<div " + (autoHeight ? " id={this.props.fullPath + 'scroller'}" : '') + " className='d-flex flex-grow-1 flex-shrink-1 " + (orientation == Orientation_V ? ' flex-column' : '') + (autoHeight ? ' autoScroll_Touch' : '') + (isWrap ? ' flex-wrap' : '') + alignitems + "'>", 1);
            childRenderBlock = new FormatFileBlock(theKernel.id + 'child');
            renderContentBlock.pushChild(childRenderBlock);
            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine('</div>');
            var navigaterBlock = new FormatFileBlock('navigater');
            if (theKernel.getAttribute(AttrNames.GenNavBar)) {
                navigaterBlock.pushLine("{this.renderNavigater()}");
            }
            formReactClass.navigaterBlock = navigaterBlock;
            renderContentBlock.pushChild(navigaterBlock);
            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine("</React.Fragment>);");

            renderContentFun.retBlock.pushLine("return (<div className='d-flex flex-column " + layoutConfig.getClassName() + "'" + (hasFormStyle ? " style={" + formStyleID + "}" : '') + ">", 1);
            renderContentFun.retBlock.pushLine("{this.props.title && <div className='bg-dark text-light " + titleAlginStr + " d-flex flex-shrink-0 p-1'><span>{this.props.title}</span></div>}");
            renderContentFun.retBlock.pushLine('{' + VarNames.RetElem + '}');
            renderContentFun.retBlock.subNextIndent();
            renderContentFun.retBlock.pushLine("</div>);");
        }
        else if (isGridForm) {
            gridBodyTag = new FormatHtmlTag('bodytag', gridBodyPureRectClass.name, this.clientSide);
            gridBodyTag.setAttr('dataversion', '{setting.dataversion}');
            gridBodyTag.setAttr('startRowIndex', '{this.props.startRowIndex}');
            gridBodyTag.setAttr('endRowIndex', '{this.props.endRowIndex}');
            gridBodyTag.setAttr('fullPath', '{this.props.fullPath}');
            gridBodyTag.setAttr('form', '{this}');
            if (insertBtnSetting) {
                gridBodyTag.setAttr('hadNewRow', '{this.state.hadNewRow}');

            }
            if (clickSelectable) {
                gridBodyTag.setAttr('clickRowHandler', '{this.clickRowHandler}');
            }
            switch (selectMode) {
                case ESelectMode.Single:
                    gridBodyTag.setAttr(VarNames.SelectedValue, bigbracketStr('this.props.' + VarNames.SelectedValue));
                    break;
                case ESelectMode.Multi:
                    gridBodyTag.setAttr(VarNames.SelectedValues_arr, bigbracketStr('this.props.' + VarNames.SelectedValues_arr));
                    break;
            }
            renderContentBlock.pushLine("var setting = gGetFormSetting(this.props.fullPath);");
            renderContentBlock.pushLine(VarNames.RetElem + " = (", 1);
            renderContentBlock.pushChild(gridBodyTag);
            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine(');');
            renderContentBlock.pushLine("if (this.props.pagebreak) {", 1);
            renderContentBlock.pushLine(VarNames.NavElem + " = <CBaseGridFormNavBar pageIndex={this.props.pageIndex} rowPerPage={this.props.rowPerPage} rowPerPageChangedHandler={this.rowPerPageChangedHandler} pageCount={this.props.pageCount} prePageClickHandler={this.prePageClickHandler} nxtPageClickHandler={this.nxtPageClickHandler} pageIndexChangedHandler={this.pageIndexChangedHandler} />", -1);
            renderContentBlock.pushLine("}");

            renderContentFun.pushLine('return (', 1);
            renderContentFun.pushLine("<div ref={this.rootRef} className='" + layoutConfig.getClassName() + "' " + (hasFormStyle ? "style={" + formStyleID + "}" : '') + ">", 1);
            renderContentFun.pushLine("{this.props.title && <div className='bg-dark text-light " + titleAlginStr + " d-flex flex-shrink-0 p-1'><span>{this.props.title}{this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null}" + (hadRefreshIcon ? "{this.props.fetching ? null : <i className='btn btn-sm fa fa-refresh' onClick={this.clickFreshHandler} />}" : '') + "</span></div>}");
            if (!hideHeader) {
                renderContentFun.pushLine("<div id={this.props.fullPath + 'tableheader'} className='mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv'>", 1);
                renderContentFun.pushLine("<table className='table' style={" + headTableStyleID + "}>", 1);
                headClassInFormTag = new FormatHtmlTag('headClassInFormTag', gridHeadPureRectClass.name, this.clientSide);
                headClassInFormTag.setAttr('form', '{this}');
                renderContentFun.pushChild(headClassInFormTag);
                renderContentFun.subNextIndent();
                if (gridHeadBodyPureRectClass && !hideHeader) {
                    renderContentFun.pushLine("<" + gridHeadBodyPureRectClass.name + ' form={this} />', -1);
                }
                renderContentFun.pushLine("</table>", -1);
                renderContentFun.pushLine("</div>");
                renderContentFun.pushLine("<div id={this.props.fullPath + 'scroller'} onScroll={this.tableBodyScroll} className='mw-100 autoScroll'>", 1);
            }
            else {
                renderContentFun.pushLine("<div id={this.props.fullPath + 'scroller'} className='mw-100 autoScroll'>", 1);
            }
            renderContentFun.pushLine("{" + VarNames.RetElem + "}");
            if (insertBtnSetting) {
                var newbtnlabel = theKernel.getAttribute(AttrNames.InsertBtnLabel);
                renderContentFun.pushLine("{!this.state.hadNewRow && <button onClick={this.clickNewRowHandler} type='button' className='btn btn-success' ><i className='fa fa-plus'/>" + (IsEmptyString(newbtnlabel) ? '新增' : newbtnlabel) + "</button>}");
            }
            renderContentFun.subNextIndent();
            renderContentFun.pushLine("</div>");
            if (theKernel.gridFormBottomDiv.children.length > 0) {
                renderContentFun.pushLine("{bHadBottom &&");
                renderContentFun.pushChild(gridBottomDivBlock);
                renderContentFun.subNextIndent();
                renderContentFun.pushLine('}');
            }
            renderContentFun.pushLine("{" + VarNames.NavElem + "}", -1);
            renderContentFun.pushLine('</div>);');
        }
        else if (isListForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = this.props.records_arr.map((record," + VarNames.RowIndex + ")=>{", 1);
            renderContentBlock.pushLine('var ' + VarNames.RowKey + ' = ' + (keyColumn == DefaultKeyColumn ? VarNames.RowIndex : 'GetFromatRowKey(record.' + keyColumn + ')') + ';');
            var itemLayoutConfig = theKernel.getLayoutConfig('item' + AttrNames.LayoutNames.APDClass, 'item' + AttrNames.LayoutNames.StyleAttr);
            itemLayoutConfig.addClass('list-group-item');
            itemLayoutConfig.addClass('flex-grow-0');
            itemLayoutConfig.addClass('flex-shrink-0');
            var itemStyleID = theKernel.id + '_item_style';
            var hasItemFormStyle = this.clientSide.addStyleObject(itemStyleID, itemLayoutConfig.style);

            var listItemTag = new FormatHtmlTag('listitem', 'div', this.clientSide);
            listItemTag.setAttr('key', bigbracketStr(VarNames.RowKey));
            listItemTag.setAttr(rowKeyAttrName, bigbracketStr(VarNames.RowKey));
            listItemTag.setAttr(rowIndexAttrName, bigbracketStr(VarNames.RowIndex));
            listItemTag.setAttr('className', itemLayoutConfig.getClassName());
            if (hasItemFormStyle) {
                listItemTag.setAttr('style', bigbracketStr(itemStyleID));
            }
            if (clickSelectable) {
                itemLayoutConfig.addClass('list-group-item-action');
                if (selectMode == ESelectMode.Single) {
                    renderContentBlock.pushLine('var selected = ' + VarNames.RowKey + ' == this.props.' + VarNames.SelectedValue + ';');
                }
                else {
                    renderContentBlock.pushLine('var selected = this.props.' + VarNames.SelectedValues_arr + '.indexOf(' + VarNames.RowKey + ') != -1;');
                }
                listItemTag.setAttr(AttrNames.Event.OnMouseDown, bigbracketStr('this.clickRowHandler'));
                listItemTag.setAttr('className', bigbracketStr(singleQuotesStr(itemLayoutConfig.getClassName()) + " + (selected ? ' active' : '')"));
            }
            renderContentBlock.pushChild(listItemTag);
            childRenderBlock = new FormatFileBlock(theKernel.id + 'child');
            listItemTag.pushChild(childRenderBlock);

            listItemTag.getStringCallbacker.push((rlt) => {
                var keyPos = rlt.indexOf('<');
                return rlt.substr(0, keyPos) + 'return ' + rlt.substr(keyPos);
            });


            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine('});');

            renderContentFun.retBlock.pushLine("return (<div className='d-flex flex-column " + layoutConfig.getClassName() + "'" + (hasFormStyle ? " style={" + formStyleID + "}" : '') + ">", 1);
            renderContentFun.retBlock.pushLine("{this.props.title && <div className='bg-dark text-light " + titleAlginStr + " d-flex flex-shrink-0 p-1'><span>{this.props.title}" + (hadRefreshIcon ? "{this.props.fetching ? null : <i className='btn btn-sm fa fa-refresh' onClick={this.clickFreshHandler} />}" : '') + "</span></div>}");
            var contentDivClassStr = 'd-flex flex-grow-1 flex-shrink-1' + (isWrap ? ' flex-wrap' : '') + (autoHeight ? ' autoScroll ' : '');
            if (orientation == Orientation_V) {
                contentDivClassStr += ' flex-column';
            }
            renderContentFun.retBlock.pushLine("<div" + (autoHeight ? " id={this.props.fullPath + 'scroller'}" : '') + " className='" + contentDivClassStr + alignitems + "'>");
            renderContentFun.retBlock.addNextIndent();
            renderContentFun.retBlock.pushLine('{' + VarNames.RetElem + '}');
            renderContentFun.retBlock.subNextIndent();
            renderContentFun.retBlock.pushLine("</div>");
            renderContentFun.retBlock.subNextIndent();
            renderContentFun.retBlock.pushLine("</div>);");
        }

        formReactClass.renderFun.pushLine('if(this.props.visible == false){return null;}');
        formReactClass.renderFun.pushLine(VarNames.RetElem + " = this.renderContent();");

        var formColumns_arr;
        var formTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        formTag.setAttr('id', theKernel.id);
        formTag.setAttr('parentPath', parentPath);
        var pageBreak = false;
        var formTitle = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(formTitle, project.scriptMaster);
        var setTitleStateItem = null;
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (belongFormKernel != null && (belongFormKernel.isPageForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(formTitle) != -1) {
                        parentMidData.useColumns_map[formTitle] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: formTitle },
                        };
                    }
                    else {
                        formTag.setAttr('title', formTitle);
                    }
                }
                else {
                    formTag.setAttr('title', formTitle);
                }
            }
        }
        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        if (isGridForm) {
            pageBreak = theKernel.getAttribute(AttrNames.PageBreak);
            formTag.setAttr('pagebreak', bigbracketStr(pageBreak));
            if (pageBreak) {
                formTag.setAttr('bindpagefun', bigbracketStr(makeFName_bindFormPage(theKernel)));
            }
        }

        var defVisble = theKernel.getAttribute(AttrNames.DefaultVisible);
        renderBlock.pushChild(formTag);
        this.modifyControlTag(theKernel, formTag);

        formReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        formReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");

        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.Visible), makeStr_DotProp(VarNames.CtlState, VarNames.Visible) + ' == null ? ' + defVisble + ' : ' + makeStr_DotProp(VarNames.CtlState, VarNames.Visible) + ' == true'));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.Fetching), makeStr_DotProp(VarNames.CtlState, VarNames.Fetching)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FetchErr), makeStr_DotProp(VarNames.CtlState, VarNames.FetchErr)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.Records_arr), makeStr_DotProp(VarNames.CtlState, VarNames.Records_arr)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.RecordIndex), makeStr_DotProp(VarNames.CtlState, VarNames.RecordIndex)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.NowRecord), makeStr_DotProp(VarNames.CtlState, VarNames.NowRecord)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.InvalidBundle), makeStr_DotProp(VarNames.CtlState, VarNames.InvalidBundle)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'loaded'),
            useDS == null ? 'true' : makeStr_DotProp(VarNames.CtlState, VarNames.Records_arr) + ' != ' + null));
        if (isGridForm) {
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.StartRowIndex), makeStr_DotProp(VarNames.CtlState, VarNames.StartRowIndex)));
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.EndRowIndex), makeStr_DotProp(VarNames.CtlState, VarNames.EndRowIndex)));
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.PageCount), makeStr_DotProp(VarNames.CtlState, VarNames.PageCount)));
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.PageIndex), makeStr_DotProp(VarNames.CtlState, VarNames.PageIndex)));
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.RowPerPage), makeStr_DotProp(VarNames.CtlState, VarNames.RowPerPage)));
        }
        if (isGridForm || isListForm) {
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.RowBindInfo), makeStr_DotProp(VarNames.CtlState, VarNames.RowBindInfo)));
            formTag.setAttr(VarNames.SelectMode, theKernel.getAttribute(AttrNames.SelectMode));
            if (keyColumn != DefaultKeyColumn) {
                if (canUseColumns_arr.indexOf(keyColumn) == -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        'Key列无效']);
                    return false;
                }
                kernelMidData.useColumns_map[keyColumn] = 1;
            }
            if (selectMode != ESelectMode.None || clickSelectable) {
                if (keyColumn != DefaultKeyColumn) {
                    formTag.setAttr(AttrNames.KeyColumn, keyColumn);
                }
                if (selectMode == ESelectMode.Single) {
                    formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectedValue), 'ctlState.' + VarNames.SelectedValue + ' == null ? null : ctlState.' + VarNames.SelectedValue));
                }
                else {
                    formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectedValues_arr), 'ctlState.' + VarNames.SelectedValues_arr + ' == null ? gEmptyArr : ctlState.' + VarNames.SelectedValues_arr));
                }
            }
        }
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, AttrNames.Title), makeStr_DotProp(VarNames.CtlState, AttrNames.Title) + ' == null ? ownprops.title : ' + makeStr_DotProp(VarNames.CtlState, AttrNames.Title)));


        var freshFun = clientSide.scope.getFunction(makeFName_freshForm(theKernel), true, [VarNames.ReState, VarNames.Records_arr, VarNames.OldValue, VarNames.SatePath, 'visited', 'delayActs', 'rowKeyInfo_map']);
        freshFun.scope.getVar(pathVarName, true, makeStr_callFun('getParentPathByKey', [VarNames.SatePath, singleQuotesStr(theKernel.id)]));
        var bindFun = clientSide.scope.getFunction(makeFName_bindForm(theKernel), true, [VarNames.ReState, 'newIndex', 'oldIndex', VarNames.SatePath]);
        bindFun.scope.getVar(pathVarName, true, makeStr_callFun('getParentPathByKey', [VarNames.SatePath, singleQuotesStr(theKernel.id)]));
        if (belongUserControl) {
            bindFun.scope.getVar(belongUserControl.id + '_path', true, makeStr_callFun('getBelongUserCtlPath', [pathVarName]));
        }

        var statColumn_arr = [];

        if (useDS) {
            if (isGridForm) {
                theKernel.getRowLabeledControls().forEach(labeledKernel=>{
                    var statFun = labeledKernel.getAttribute(AttrNames.StatFun);
                    if(statFun != StatFun_NONE){
                        var theEditor = labeledKernel.editor;
                        var valueColumn = null;
                        var validStat = false;
                        var kernelLabel = labeledKernel.getAttribute(AttrNames.TextField);
                        switch(theEditor.type){
                            case M_LabelKernel_Type:
                            case M_TextKernel_Type:
                                valueColumn = theEditor.getAttribute(AttrNames.TextField);
                                validStat = true;
                            break;
                            case PopperButtonKernel_Type:
                            case ButtonKernel_Type:
                                valueColumn = theEditor.getAttribute(AttrNames.Title);
                                validStat = true;
                            break;
                            default:
                                if(canUseColumns_arr.indexOf(kernelLabel) != -1){
                                    valueColumn = kernelLabel;
                                    validStat = true;
                                }
                            break;
                        }
                        if(validStat){
                            statColumn_arr.push({
                                fun:statFun,
                                kernel:labeledKernel,
                                key:kernelLabel,
                                valueColumn:valueColumn,
                            });
                        }
                    }
                });
                if(statColumn_arr.length > 0){
                    var reCalStatFun = clientSide.scope.getFunction(makeFName_reCalFormStat(theKernel), true, [VarNames.State, pathVarName]);
                    reCalStatFun.pushLine('var hadStateParam = true;');
                    reCalStatFun.pushLine('if(state == null){hadStateParam = false;state = store.getState();}');
                    reCalStatFun.pushLine('var ' + stateVarName + '=' + makeStr_callFun('getStateByPath', [VarNames.State, pathVarName],';'));
                    var records_arrVarName = theKernel.id + '_' + VarNames.Records_arr;
                    reCalStatFun.pushLine('var ' + records_arrVarName + '=' + stateVarName + '.' + VarNames.Records_arr + ';');
                    statColumn_arr.forEach(item=>{
                        reCalStatFun.pushLine("var stat" + item.key +"=0;");
                    });
                    reCalStatFun.pushLine(records_arrVarName + '.forEach(record=>{',1);
                    statColumn_arr.forEach(item=>{
                        switch(item.fun){
                            case StatFun_SUM:
                            reCalStatFun.pushLine("stat" + item.key +"+=record." + item.key + ";");
                            break;
                        }
                    });
                    reCalStatFun.subNextIndent();
                    reCalStatFun.pushLine('});');
                    reCalStatFun.pushLine('var needSetState={};');
                    statColumn_arr.forEach(item=>{
                        reCalStatFun.pushLine("needSetState['row_统计." + item.key + ".text']=stat" + item.key +";");
                    });
                    reCalStatFun.pushLine('');
                    reCalStatFun.pushLine('if(hadStateParam){state=setManyStateByPath(state,'+pathVarName+',needSetState);return state;}');
                    reCalStatFun.pushLine('store.dispatch(makeAction_setManyStateByPath(needSetState, ' + pathVarName + '));');
                }
            }
            var recordsArraychangedFunName = theKernel.id + '_' + VarNames.Records_arr + '_changed';
            var recordsArraychangedFun = clientSide.scope.getFunction(recordsArraychangedFunName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
            recordsArraychangedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
            recordsArraychangedFun.initBlk = new FormatFileBlock('inint');
            recordsArraychangedFun.pushChild(recordsArraychangedFun.initBlk);
            kernelMidData.recordsArraychangedFun = recordsArraychangedFun;
            recordsArraychangedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
            recordsArraychangedFun.pushLine(makeStr_callFun(freshFun.name, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']));

            if (onDataSourceChangedBp) {
                var onDataSourceChangedCompileRet = this.compileScriptBlueprint(onDataSourceChangedBp);
                if (onDataSourceChangedCompileRet == false) {
                    return false;
                }
                recordsArraychangedFun.pushLine('setTimeout(() => {' + makeStr_callFun(onDataSourceChangedFunName, ["getParentPathByKey(path,'" + theKernel.id + "')", 'newValue'], ';') + '},20);', 1);
            }

            if (belongUserControl) {
                belongUserCtlMidData.needSetStateChangedActs_arr.push(
                    {
                        propName: makeStr_DotProp(thisfullpath, VarNames.Records_arr),
                        funName: recordsArraychangedFunName + '.bind(window)',
                    }
                );
            }
            else {
                clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.Records_arr))] = recordsArraychangedFunName + '.bind(window)';
            }
            if (isPageForm) {
                var recordIndexchangedFunName = theKernel.id + '_' + VarNames.RecordIndex + '_changed';
                var recordIndexchangedFun = clientSide.scope.getFunction(recordIndexchangedFunName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
                recordIndexchangedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                recordIndexchangedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                recordIndexchangedFun.pushLine(makeStr_callFun(makeFName_bindForm(theKernel), [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']));

                if (belongUserControl) {
                    belongUserCtlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisfullpath, VarNames.RecordIndex),
                            funName: recordIndexchangedFunName + '.bind(window)',
                        }
                    );
                }
                else {
                    clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.RecordIndex))] = recordIndexchangedFunName + '.bind(window)';
                }
                freshFun.pushLine(makeStr_callFun('simpleFreshFormFun2', [VarNames.ReState, VarNames.Records_arr, pathVarName, recordIndexchangedFunName, 'visited', 'delayActs', 'rowKeyInfo_map'], ';'));
            }
            if (isGridForm) {
                if (belongUserControl) {
                    belongUserCtlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisfullpath, VarNames.PageIndex),
                            funName: makeFName_bindForm(theKernel) + '.bind(window)',
                        }
                    );
                }
                else {
                    clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.PageIndex))] = makeFName_bindForm(theKernel) + '.bind(window)';
                }
            }

            if (isGridForm || isListForm) {
                freshFun.scope.getVar(stateVarName, true, makeStr_callFun('getStateByPath', [VarNames.ReState, pathVarName, '{}']));
                freshFun.pushLine('var needSetState={};');

                freshFun.pushLine('if(oldValue != null){', 1);
                freshFun.pushLine('var newRowCount = ' + VarNames.Records_arr + '.length;');
                freshFun.pushLine('oldValue.forEach((x,i)=>{', 1);
                freshFun.pushLine('var rowkey=' + (keyColumn == DefaultKeyColumn ? 'i' : 'x.' + keyColumn) + ';');
                freshFun.pushLine("if(" + stateVarName + ".hasOwnProperty('row_' + rowkey)){", 1);
                freshFun.pushLine("needSetState['row_' + rowkey + '._isdirty'] = true;", -1);
                freshFun.pushLine("}", -1);
                freshFun.pushLine("});");
                freshFun.subNextIndent();
                freshFun.pushLine("}");

                freshFun.pushLine(makeLine_DeclareVar('newKey_map', '{}', false));
                freshFun.pushLine(VarNames.Records_arr + '.forEach((rcd,index)=>{',1);
                freshFun.pushLine('var rowkey=' + (keyColumn == DefaultKeyColumn ? 'index' : 'rcd.' + keyColumn) + ';');
                freshFun.pushLine('rcd._key = rowkey;');
                statColumn_arr.forEach(item=>{
                    if(canUseColumns_arr.indexOf(item.valueColumn) != -1){
                        freshFun.pushLine('rcd.' + item.key + '=parseFloat(rcd.' + item.valueColumn + ');');
                    }
                    else if(canUseColumns_arr.indexOf(item.key) != -1){
                        freshFun.pushLine('rcd.' + item.key + '=parseFloat(rcd.' + item.key + ');');
                    }
                    else{
                        freshFun.pushLine('rcd.' + item.key + '=0;');
                    }
                });
                freshFun.pushLine('newKey_map[rowkey]=rcd;');
                freshFun.subNextIndent();
                freshFun.pushLine('});');
                freshFun.pushLine(makeLine_setGDataCache(theKernel.id + '_path + ".KeyToRcd_map"', 'newKey_map', false));

                if (isGridForm) {
                    var setColumnNameBlock = new FormatFileBlock('setColumnNameBlock');
                    freshFun.setColumnNameBlock = setColumnNameBlock;
                    freshFun.pushChild(setColumnNameBlock);
                }
                else {
                    var initListRowBlock = new FormatFileBlock('initListRow');
                    freshFun.rowInitBlk = initListRowBlock;
                    freshFun.pushChild(initListRowBlock);
                }
                var defaultSelectFirst = theKernel.getAttribute(AttrNames.DefaultSelectFirst);
                if (selectMode == ESelectMode.Single) {
                    if (defaultSelectFirst) {
                        freshFun.pushLine('var nowKey = ' + makeStr_callFun('GetFormSelectedProfile', [stateVarName, singleQuotesStr(keyColumn)]) + '.key;');
                        freshFun.pushLine('if(nowKey == null){', 1);
                        //freshFun.pushLine('if(' + VarNames.Records_arr + '.length > 0){nowKey = ' + VarNames.Records_arr + '[0].' + keyColumn + ';}', -1);
                        freshFun.pushLine('if(' + VarNames.Records_arr + '.length > 0){', 1);
                        freshFun.pushLine("var preSelectedRowIndex = " + stateVarName + ".selectedRowIndex;");
                        freshFun.pushLine("var useRowIndex = 0;");
                        freshFun.pushLine("if(preSelectedRowIndex == null || preSelectedRowIndex <= 0){useRowIndex=0;}");
                        freshFun.pushLine("else if(preSelectedRowIndex < " + VarNames.Records_arr + ".length){useRowIndex=preSelectedRowIndex;}");
                        freshFun.pushLine("else {useRowIndex=" + VarNames.Records_arr + ".length - 1;}");
                        freshFun.pushLine('nowKey = ' + VarNames.Records_arr + '[useRowIndex].' + keyColumn + ';');
                        freshFun.pushLine('needSetState.selectedRowIndex = useRowIndex;');
                        freshFun.subNextIndent();
                        freshFun.pushLine('}');
                        freshFun.subNextIndent();
                        freshFun.pushLine('}');
                        freshFun.pushLine('needSetState.' + VarNames.SelectedValue + ' = nowKey;');
                    }
                    else {
                        freshFun.pushLine('needSetState.' + VarNames.SelectedValue + ' = ' + makeStr_callFun('GetFormSelectedProfile', [stateVarName, singleQuotesStr(keyColumn)]) + '.key;');
                    }
                }
                else {
                    if (defaultSelectFirst) {
                        freshFun.pushLine('var nowKeys_arr = ' + makeStr_callFun('GetFormSelectedProfile', [stateVarName, singleQuotesStr(keyColumn)]) + '.keys_arr;');
                        freshFun.pushLine('if(nowKeys_arr.length == 0){', 1);
                        freshFun.pushLine('if(' + VarNames.Records_arr + '.length > 0){nowKeys_arr = [' + VarNames.Records_arr + '[0].' + keyColumn + '];}');
                        freshFun.pushLine('}');
                        freshFun.pushLine('needSetState.' + VarNames.SelectedValues_arr + ' = nowKeys_arr;');
                    }
                    else {
                        freshFun.pushLine('needSetState.' + VarNames.SelectedValues_arr + ' = ' + makeStr_callFun('GetFormSelectedProfile', [stateVarName, singleQuotesStr(keyColumn)]) + '.keys_arr;');
                    }
                }
                freshFun.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, pathVarName, 'needSetState'], ';'), -1);
                if(statColumn_arr.length > 0){
                    freshFun.pushLine(makeStr_callFun(makeFName_reCalFormStat(theKernel), [VarNames.ReState, theKernel.id + '_path'], ';'));
                }
                freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState, 'null', 'null', VarNames.SatePath]) + ';');

            }
        }
        else {
            freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState, 'null', 'null', VarNames.SatePath]));
        }
        freshFun.pushLine('var scrollSetting = gDataCache.get(' + theKernel.id + "_path + 'scrollsetting');");
        freshFun.pushLine('if(scrollSetting){setTimeout(() => {',1);
        freshFun.pushLine('var scrollerElem=document.getElementById(' + theKernel.id + '_path' + "+'scroller');");
        freshFun.pushLine('if(scrollerElem){scrollerElem.scrollTop = scrollSetting.top;scrollerElem.scrollLeft = scrollSetting.left;}');
        freshFun.subNextIndent();
        freshFun.pushLine('},200);}');

        bindFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, pathVarName, '{}'));
        if (useDS) {
            bindFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
        }
        bindFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        var bundleVar = bindFun.scope.getVar('bundle', true, '{}');
        var saveInsertBlock = null;
        var insertModeIf = null;
        var hadInsertCacheIf = null;
        var hadInsertCacheTrueDynamicBlock = null;
        var hadInsertCacheFlaseDynamicBlock = null;

        var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongForm = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var belongPageMidData = belongPage ? this.projectCompiler.getMidData(belongPage.id) : null;
        var belongFormMidData = belongForm ? this.projectCompiler.getMidData(belongForm.id) : null;
        var thisFormMidData = this.projectCompiler.getMidData(theKernel.id);
        if (thisFormMidData.needSetKernels_arr == null) {
            thisFormMidData.needSetKernels_arr = [];
        }
        if (thisFormMidData.useColumns_map == null) {
            thisFormMidData.useColumns_map = [];
        }
        if (thisFormMidData.useControls_map == null) {
            thisFormMidData.useControls_map = [];
        }
        thisFormMidData.useDS = useDS;
        thisFormMidData.freshFun = freshFun;
        thisFormMidData.bindFun = bindFun;
        thisFormMidData.belongPage = belongPage;
        thisFormMidData.belongForm = belongForm;
        thisFormMidData.belongUserControl = belongUserControl;
        thisFormMidData.isPageForm = isPageForm;
        thisFormMidData.isGridForm = isGridForm;
        thisFormMidData.dynamicColumn_map = {};
        var bindNowRecordBlock = new FormatFileBlock('bindbowrow');
        var bindEndBlock = new FormatFileBlock('bindend');
        bindFun.bindEndBlock = bindEndBlock;
        var formCanInsert = false;
        var bindInersetBlock = null;

        var acessAsserFunName = theKernel.id + '_' + AttrNames.AcessAssert;
        var acessAsserBP = this.project.scriptMaster.getBPByName(acessAsserFunName);
        if (acessAsserBP) {
            var acessAsserCompileRet = this.compileScriptBlueprint(acessAsserBP, { params: ['state', theKernel.id + '_path'] });
            if (acessAsserCompileRet == false) {
                return false;
            }
        }

        var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true, [VarNames.ReState, VarNames.HoldSelected, VarNames.FullParentPath, VarNames.HoldScroll]);
        pullFun.scope.getVar(VarNames.HadStateParam, true, VarNames.ReState + '!=null');
        pullFun.scope.getVar(VarNames.RowKeyInfo_map, true, 'getRowKeyMapFromPath(' + VarNames.FullParentPath + ')');
        if (acessAsserBP) {
            var assertVarName = theKernel.id + '_assert';
            var errTipStatePath = makeStr_AddAll(VarNames.FullParentPath, "+'.", theKernel.id, ".", VarNames.FetchErr, "'");
            pullFun.pushLine('var ' + assertVarName + '=' + makeStr_callFun(acessAsserFunName, [VarNames.State, VarNames.FullParentPath + "+'." + theKernel.id + "'"], ';'));
            pullFun.pushLine('if(' + assertVarName + ' && ' + assertVarName + '.length > 0){', 1);
            pullFun.pushLine('if(' + VarNames.HadStateParam + '){', 1);
            pullFun.pushLine('return ' + makeStr_callFun('setStateByPath', [VarNames.State, errTipStatePath, '{info:' + assertVarName + '}'], ';'));
            pullFun.subNextIndent();
            pullFun.pushLine('}');
            pullFun.pushLine('setTimeout(() => {', 1);
            pullFun.pushLine("store.dispatch(makeAction_setStateByPath({info:" + assertVarName + "}, " + errTipStatePath + '));');
            pullFun.subNextIndent();
            pullFun.pushLine('},50);');
            pullFun.pushLine("return " + VarNames.ReState + ';');
            pullFun.subNextIndent();
            pullFun.pushLine('}');
        }

        if (!useDS) {
            pullFun.retBlock.pushLine(makeLine_Return(VarNames.ReState));
            pullFun.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(bindFun.name, [VarNames.ReState])));

            if (belongFormMidData != null) {
                belongFormMidData.pullFun.beforeRetBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun(pullFun.name, [VarNames.ReState, 'true', "fullParentPath + '." + belongForm.id + "'"]));
            }
            else if (belongUserControl != null) {
                // 在自订控件里
                var templateReactClass = this.clientSide.getReactClass(belongUserControl.getReactClassName());

                // 延迟调用
                templateReactClass.initFun.pushLine('setTimeout(() => {', 1);
                templateReactClass.initFun.pushLine('store.dispatch(makeAction_callFunction(state=>{', 1);
                templateReactClass.initFun.pushLine(makeStr_callFun(bindFun.name, ['state', 'null', 'null', "ctlFullPath + '." + theKernel.id + "'"]));
                templateReactClass.initFun.subNextIndent();
                templateReactClass.initFun.pushLine('}));');
                templateReactClass.initFun.subNextIndent();
                templateReactClass.initFun.pushLine('},20);');
            }
            else {
                var pageInitFun = clientSide.scope.getFunction(makeFName_initPage(belongPage));
                pageInitFun.pushLine(makeLine_Assign(VarNames.State, makeStr_callFun(bindFun.name, [VarNames.State, 'null', 'null', "fullParentPath + '." + theKernel.id + "'"])));
            }
        }
        else {
            if(autoHeight || isGridForm){
                pullFun.pushLine('var scrollerElem=document.getElementById(fullParentPath+' + singleQuotesStr('.' + theKernel.id + 'scroller') + ');');
                pullFun.pushLine('if(scrollerElem){gDataCache.set(fullParentPath + ' + singleQuotesStr('.' + theKernel.id + 'scrollsetting') + ',' + VarNames.HoldScroll + ' ? {left:scrollerElem.scrollLeft,top:scrollerElem.scrollTop} : null);}');
            }

            pullFun.retBlock.pushLine(makeLine_Return(VarNames.State));
            pullFun.scope.getVar(VarNames.State, true, makeStr_AddAll(VarNames.HadStateParam, ' ? ', VarNames.ReState, ' : ', 'store.getState()'));

            if (stableData) {
                pullFun.scope.getVar('formState', true, makeStr_callFun('getStateByPath', [VarNames.State, 'fullParentPath + ' + singleQuotesStr('.' + theKernel.id), '{}']));
                pullFun.pushLine('if(formState.' + VarNames.Records_arr + ' != null && ' + 'formState.' + VarNames.Records_arr + '.length > 0){return ' + VarNames.State + ';}');
            }

            if(isListForm || isGridForm){
                var rowBindFunName = makeFName_RowBind(theKernel);
                var rowBindBp = project.scriptMaster.getBPByName(rowBindFunName);
                if(rowBindBp){
                    var rowBindBpCompileRet = this.compileScriptBlueprint(rowBindBp);
                    if (rowBindBpCompileRet == false) {
                        return false;
                    }
                    thisFormMidData.rowBindFun = rowBindBpCompileRet;
                }
            }
        }

        var belongAccordionKernel = null;
        var belongAccordionMidData = null;
        var belongTabItem = null;
        var belongTabItemMidData = null;
        if (reactParentKernel.type == Accordion_Type) {
            belongAccordionKernel = reactParentKernel;
            belongAccordionMidData = this.projectCompiler.getMidData(belongAccordionKernel.id);
            belongAccordionMidData.needSetKernels_arr.push(theKernel);
            if (autoPull) {
                belongAccordionMidData.needCallOnInit_arr.push({
                    name: pullFun.name,
                    params_arr: ['null', 'null', 'this.props.fullPath']
                });
            }
        }
        else if(reactParentKernel.type == TabItem_Type){
            belongTabItem = reactParentKernel;
            belongTabItemMidData = this.projectCompiler.getMidData(belongTabItem.id);
            if (autoPull) {
                belongTabItemMidData.needCallOnInit_arr.push({
                    name: pullFun.name,
                    params_arr: ['null', 'null', 'this.props.fullPath']
                });
            }
        }

        var dynamicSetBlock_hadRecord = new FormatFileBlock('dynamicbindhadrow');
        var staticBindBlock = new FormatFileBlock('static');
        var initUserControlBlock = new FormatFileBlock('initUserControl');
        var rowInitUserControlBlock = new FormatFileBlock('rowinitUserControl');
        bindFun.pushChild(staticBindBlock);
        thisFormMidData.pullFun = pullFun;

        if (useDS) {
            // gen pull fun
            var pullValidBlockBlock = new FormatFileBlock('validBlock');
            pullFun.pushChild(pullValidBlockBlock);
            pullFun.validBlock = pullValidBlockBlock;
            pullFun.pushLine('var bundle = {};');
            var initbundleBlock = new FormatFileBlock('initbundle');
            pullFun.pushChild(initbundleBlock);
            pullFun.initbundleBlock = initbundleBlock;

            pullFun.pushLine('setTimeout(() => {', 1);
            /*
            if (isGridForm) {
                pullFun.pushLine('if(!' + VarNames.HoldSelected + '){', 1);
                switch(selectMode){
                    case ESelectMode.Single:
                    pullFun.pushLine('store.dispatch(makeAction_setStateByPath(null,' + singleQuotesStr(theKernel.getStatePath(VarNames.SelectedValue)) + '));', -1);
                    break;
                    case ESelectMode.MultiSelect:
                    pullFun.pushLine('store.dispatch(makeAction_setStateByPath(null,' + singleQuotesStr(theKernel.getStatePath(VarNames.SelectedValues_arr)) + '));', -1);
                    break;
                }
                pullFun.pushLine('}');
            }
            */
            pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), 'fullParentPath', singleQuotesStr(theKernel.id), singleQuotesStr(VarNames.Records_arr), { bundle: 'bundle' }, false), -1);
            pullFun.pushLine('}, 50);');

            // gen back pull
            var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req', 'res']);
            serverSide.initProcessFun(serverPullFun, theKernel, true);
            serverSide.processesMapVarInitVal[serverPullFun.name] = serverPullFun.name;
            var bodyCheckblock = new FormatFileBlock('bodyCheckblock');
            serverPullFun.pushChild(bodyCheckblock);
            thisFormMidData.bodyCheckblock = bodyCheckblock;
            serverPullFun.pushLine("var params_arr = null;");
            var paramsetblock = new FormatFileBlock('paramset');
            serverPullFun.pushChild(paramsetblock);
            thisFormMidData.serverSqlLine = new FormatFile_Line("var sql='';");
            thisFormMidData.serverSqlParamsetBLK = paramsetblock;
            thisFormMidData.useDS = useDS;
            serverPullFun.pushLine(thisFormMidData.serverSqlLine);
            serverPullFun.pushLine("if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}");
            serverPullFun.pushLine("var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);");
            serverPullFun.pushLine("return rcdRlt.recordset;");

            if (isPageForm) {
                bindFun.scope.getVar(VarNames.NowRecord, true, 'null');
                insertModeIf = new JSFile_IF('validrow', 'records_arr == null || newIndex == -1 || records_arr.length == 0');
                bindFun.scope.getVar('useIndex', true, 'newIndex');
                bindFun.pushChild(insertModeIf);
                insertModeIf.falseBlock.pushLine(VarNames.NowRecord + '=' + VarNames.Records_arr + '[useIndex];');
                insertModeIf.falseBlock.pushLine(VarNames.Bundle + "." + theKernel.id + '_' + VarNames.NowRecord + "=" + VarNames.NowRecord + ';');
                saveInsertBlock = new FormatFileBlock('saveInsertBlock');
                bindFun.pushChild(saveInsertBlock);
                insertModeIf.falseBlock.pushChild(bindNowRecordBlock);
                insertModeIf.falseBlock.pushChild(dynamicSetBlock_hadRecord);
                bindInersetBlock = insertModeIf.trueBlock;
            }
            if (isGridForm) {
                if (hadRowButton) {
                    for (var rowBtni in rowBtns_arr) {
                        var btnSetting = rowBtns_arr[rowBtni];
                        if (this.compileScriptBlueprint(btnSetting.blueprint, {
                            funName: btnSetting.funName,
                            scope: formReactClass,
                            actLabel: btnSetting.actLabel
                        }) == false) {
                            return false;
                        }
                    }
                }
                var needActiveBindPageVar = bindFun.scope.getVar('needActiveBindPage', true, 'false');
                if (pageBreak) {
                    bindFun.pushLine('var ' + VarNames.PageCount + ' = formState.' + VarNames.PageCount + ';');
                    bindFun.pushLine('var ' + VarNames.PageIndex + ' = formState.' + VarNames.PageIndex + ';');
                    var recordEmptyCheckBlock = new JSFile_IF('isempty', 'records_arr != null && records_arr.length > 0');
                    bindFun.pushChild(recordEmptyCheckBlock);
                    var rowPerPage = theKernel.getAttribute(AttrNames.RowPerPage);
                    recordEmptyCheckBlock.trueBlock.pushLine("var rowPerPage = formState.rowPerPage == null ? " + rowPerPage + " : formState.rowPerPage;");
                    recordEmptyCheckBlock.trueBlock.pushLine(VarNames.NeedSetState + '.rowPerPage = rowPerPage;');
                    recordEmptyCheckBlock.trueBlock.pushLine(VarNames.PageCount + " = Math.ceil(records_arr.length / rowPerPage);");
                    recordEmptyCheckBlock.trueBlock.pushLine(makeStr_AddAll("if (", VarNames.PageIndex, "==null || ", VarNames.PageIndex, " < 0) {", VarNames.PageIndex, "=0;}"));
                    recordEmptyCheckBlock.trueBlock.pushLine(makeStr_AddAll("else if(", VarNames.PageIndex, '>=', VarNames.PageCount, '){', VarNames.PageIndex, '=', VarNames.PageCount, '-1;}'));

                    recordEmptyCheckBlock.falseBlock.pushLine(makeLine_Assign(VarNames.PageCount, '0'));
                    recordEmptyCheckBlock.falseBlock.pushLine(makeLine_Assign(VarNames.PageIndex, '0'));

                    bindFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.PageCount), VarNames.PageCount));
                    bindFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.PageIndex), VarNames.PageIndex));
                    bindFun.pushLine(makeLine_Assign(needActiveBindPageVar.name, VarNames.PageIndex + '==formState.' + VarNames.PageIndex));

                    bindFun.retBlock.pushLine("if(needActiveBindPage){", 1);
                    bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, pathVarName, VarNames.NeedSetState]) + ';');
                    bindFun.retBlock.pushLine('return ' + makeStr_callFun(makeFName_bindFormPage(theKernel), [VarNames.ReState, pathVarName]) + ';', -1);
                    bindFun.retBlock.pushLine('}');
                }
                else {
                    needActiveBindPageVar.initVal = 'true';
                    bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, pathVarName, VarNames.NeedSetState]) + ';');
                    bindFun.retBlock.pushLine('return ' + makeStr_callFun(makeFName_bindFormPage(theKernel), [VarNames.ReState, pathVarName]) + ';');
                }

            }
        }

        var endBindBlock = new FormatFileBlock('endbind');
        bindFun.pushChild(endBindBlock);

        var ci;
        var childKernel;
        var contentBlock = new FormatFileBlock('content');

        if (isListForm || isGridForm) {
            if (clickSelectable) {
                var clickRowHandlerFun = formReactClass.getFunction('clickRowHandler', true, ['ev']);
                clickRowHandlerFun.pushLine("var rowkey = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target,'" + rowKeyAttrName + "'));");
                clickRowHandlerFun.pushLine("var rowIndex = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target,'" + rowIndexAttrName + "'));");
                clickRowHandlerFun.pushLine("var state = store.getState();");
                clickRowHandlerFun.pushLine("var formState = getStateByPath(state, this.props.fullPath,{});");
                clickRowHandlerFun.pushLine("var keyvalue = rowkey;");
                if (selectMode == ESelectMode.Multi) {
                    clickRowHandlerFun.pushLine("var nowArr = formState." + VarNames.SelectedValues_arr + ";");
                    clickRowHandlerFun.pushLine("if(nowArr == null){nowArr=[keyvalue];}");
                    clickRowHandlerFun.pushLine('else{', 1);
                    clickRowHandlerFun.pushLine('var index = nowArr.indexOf(keyvalue);');
                    clickRowHandlerFun.pushLine('if(index == -1){nowArr=nowArr.concat(keyvalue);}');
                    clickRowHandlerFun.pushLine('else{', 1);
                    clickRowHandlerFun.pushLine('nowArr = nowArr.concat();');
                    clickRowHandlerFun.pushLine('nowArr.splice(index, 1);');
                    clickRowHandlerFun.subNextIndent();
                    clickRowHandlerFun.pushLine('}');
                    clickRowHandlerFun.subNextIndent();
                    clickRowHandlerFun.pushLine('}');
                    clickRowHandlerFun.pushLine("store.dispatch(makeAction_setStateByPath(nowArr,this.props.fullPath + '." + VarNames.SelectedValues_arr + "'));");
                }
                else {
                    if (OnSelectedChangedBp) {
                        clickRowHandlerFun.pushLine("var nowRowKey = formState." + VarNames.SelectedValue + ";");
                        clickRowHandlerFun.pushLine("if(nowRowKey == rowkey){", 1);
                        clickRowHandlerFun.pushLine("var selectedProfile = GetFormSelectedProfile(formState,'" + keyColumn + "');", 1);
                        clickRowHandlerFun.pushLine(makeStr_callFun(OnSelectedChangedBp.name, ['state', 'this.props.fullPath', 'selectedProfile.record', 'selectedProfile.index', 'selectedProfile.key'], ';'));
                        clickRowHandlerFun.pushLine("return;");
                        clickRowHandlerFun.subNextIndent();
                        clickRowHandlerFun.pushLine('}');
                        clickRowHandlerFun.subNextIndent();
                    }
                    clickRowHandlerFun.pushLine('var needSetState={', 1);
                    clickRowHandlerFun.pushLine(VarNames.SelectedValue + ':keyvalue,');
                    clickRowHandlerFun.pushLine('selectedRowIndex:rowIndex,',-1);
                    clickRowHandlerFun.pushLine('}');
                    clickRowHandlerFun.pushLine("store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));");
                }
            }

            if (OnSelectedChangedBp) {
                var OnSelectedChangedCompileRet = this.compileScriptBlueprint(OnSelectedChangedBp);
                if (OnSelectedChangedCompileRet == false) {
                    return false;
                }

                var formRowSelectedChangedFun = clientSide.scope.getFunction('_' + theKernel.id + '_selectedChanged', true, [VarNames.State, VarNames.FullPath]);
                formRowSelectedChangedFun.pushLine('var formState = getStateByPath(' + VarNames.State + ',' + VarNames.FullPath + ')');
                formRowSelectedChangedFun.pushLine('var selectedProfile = ' + makeStr_callFun('GetFormSelectedProfile', ['formState', singleQuotesStr(keyColumn)], ';'));

                var callParams_arr = [];
                if (selectMode != ESelectMode.Multi) {
                    callParams_arr = ['state', VarNames.FullPath, 'selectedProfile.record', 'selectedProfile.index', 'selectedProfile.key'];
                }
                else {
                    callParams_arr = ['state', VarNames.FullPath, 'selectedProfile.records_arr', 'selectedProfile.indexes_arr', 'selectedProfile.keys_arr'];
                }

                this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, formRowSelectedChangedFun.name, theKernel, selectMode == ESelectMode.Multi ? VarNames.SelectedValues_arr : VarNames.SelectedValue, ['state', makeStr_callFun('getParentPathByKey', ['path', singleQuotesStr(theKernel.id)])]);
                formRowSelectedChangedFun.pushLine('setTimeout(() => {' + makeStr_callFun(OnSelectedChangedFunName, callParams_arr, ';') + '},20);', 1);
            }
        }

        if (isPageForm) {
            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
                if (childKernel == theKernel.gridFormBottomDiv || childKernel.type == EmptyKernel_Type) {
                    continue;
                }
                if (this.compileKernel(childKernel, childRenderBlock, renderBlock) == false) {
                    return false;
                }
            }

            formCanInsert = thisFormMidData.hadInsertMode == true;
            if (formCanInsert) {
                var saveInsertFun = formReactClass.getFunction('saveInsertCache', true);
                saveInsertFun.scope.getVar(theKernel.id + '_path', true, 'this.props.fullPath');
                saveInsertFun.scope.getVar('state', true, 'store.getState()');
                saveInsertFun.scope.getVar('formState', true, 'getStateByPath(state,' + theKernel.id + '_path)');
                saveInsertFun.scope.getVar('needSetState', true, '{}');
                saveInsertFun.retBlock.pushLine('store.dispatch(makeAction_setStateByPath(needSetState, ' + theKernel.id + '_path + ".insertCache"));');
                formReactClass.saveInsertFun = saveInsertFun;

                insertModeIf.trueBlock.pushLine(makeLine_Assign('var ' + VarNames.InsertCache, makeStr_getStateByPath("formState", singleQuotesStr(VarNames.InsertCache))));
                hadInsertCacheIf = new JSFile_IF(VarNames.InsertCache, VarNames.InsertCache);
                hadInsertCacheTrueDynamicBlock = new FormatFileBlock('hadInsertCacheTrueDynamicBlock');
                hadInsertCacheFlaseDynamicBlock = new FormatFileBlock('hadInsertCacheFlaseDynamicBlock');
                insertModeIf.trueBlock.pushChild(hadInsertCacheIf);

                formReactClass.constructorFun.pushLine('this.canInsert = true;');
            }

            if (onRowChangedBp) {
                var onRowChangedCompileRet = this.compileScriptBlueprint(onRowChangedBp);
                if (onRowChangedCompileRet == false) {
                    return false;
                }
                bindFun.pushLine('setTimeout(() => {' + makeStr_callFun(onRowChangedFunName, [theKernel.id + '_path', 'useIndex', 'nowRecord'], ';') + '},20);', 1);
            }
        }

        if (isListForm) {
            if (this.compileKernel(theKernel.editor, childRenderBlock, renderBlock) == false) {
                return false;
            }
            callRowBindBlks = {};
            callRowBindBlks.beforeFor = new FormatFileBlock('beforeFor');
            freshFun.rowInitBlk.pushChild(callRowBindBlks.beforeFor);
            freshFun.rowInitBlk.pushLine("for (var rowIndex = 0; rowIndex < " + VarNames.Records_arr + ".length; ++rowIndex) {", 1);
            freshFun.rowInitBlk.pushLine(makeLine_DeclareVar(VarNames.NowRecord, VarNames.Records_arr + '[rowIndex]', false));
            freshFun.rowInitBlk.pushLine('var ' + VarNames.RowKey + ' = ' + (keyColumn == DefaultKeyColumn ? VarNames.RowIndex : 'GetFromatRowKey(' + VarNames.NowRecord + '.' + keyColumn + ')') + ';');
            freshFun.rowInitBlk.pushLine('needSetState["row_" + ' + VarNames.RowKey + ' + "._isdirty"] = false;');
            //freshFun.rowInitBlk.pushLine('if(needSetState.hasOwnProperty("row_"+'+VarNames.RowKey+')){delete needSetState["row_"+'+VarNames.RowKey+'];}');
            //freshFun.rowInitBlk.pushLine('var rowstate=getStateByPath(' + theKernel.id + '_state,"row_" + ' + VarNames.RowKey + ');');
            //freshFun.rowInitBlk.pushLine('if(rowstate == null){',1);
            freshFun.rowInitBlk.pushChild(bindNowRecordBlock);
            callRowBindBlks.inFor = new FormatFileBlock('inFor');
            freshFun.rowInitBlk.pushChild(callRowBindBlks.inFor);
            //freshFun.rowInitBlk.subNextIndent();
            //freshFun.rowInitBlk.pushLine('}');
            freshFun.rowInitBlk.subNextIndent();
            freshFun.rowInitBlk.pushLine('}');
            freshFun.rowInitBlk.pushChild(endBindBlock);
            callRowBindBlks.endfor = new FormatFileBlock('endfor');
            freshFun.rowInitBlk.pushChild(callRowBindBlks.endfor);

        }

        var gridColumnsProfile_obj = {};
        var gridColumnCount = 0;

        if (isGridForm) {
            var sumTableWidth = 0;
            var gridWidthType = theKernel.getAttribute(AttrNames.WidthType);
            gridHeadPureRectClass.renderFun.pushLine('var simpleMode = this.props.simpleMode;');
            gridHeadPureRectClass.renderFun.pushLine('return (<thead className="thead-light"><tr>', 1);
            var gridHeadRowRenderBlock = new FormatFileBlock('tr');
            gridHeadPureRectClass.renderFun.pushChild(gridHeadRowRenderBlock, -1);
            gridHeadPureRectClass.renderFun.pushLine('</tr></thead>);');
            var gridHeadBodyRowRenderBlock = null;
            if (gridHeadBodyPureRectClass) {
                gridHeadBodyPureRectClass.renderFun.pushLine(VarNames.RetElem + ' = (<tbody className="border border-top-0 border-bottom-0"><tr>', 1);
                gridHeadBodyRowRenderBlock = new FormatFileBlock('tr');
                gridHeadBodyPureRectClass.renderFun.pushChild(gridHeadBodyRowRenderBlock, -1);
                gridHeadBodyPureRectClass.renderFun.pushLine('</tr></tbody>);');
            }


            if (selectMode != ESelectMode.None) {
                if (gridWidthType == EGridWidthType.Fixed) {
                    sumTableWidth += 3.5;
                }
                if(selectMode == ESelectMode.Multi){
                    gridHeadRowRenderBlock.pushLine("<th scope='col' className='selectorTableHeader'><CGridFormSelectCog form={this.props.form} /></th>");
                }
                else{
                    gridHeadRowRenderBlock.pushLine("<th scope='col' className='selectorTableHeader'></th>");
                }
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td className='selectorTableHeader'></td>");
                }
                formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectMode), singleQuotesStr(selectMode)));
            }
            var autoIndexColumn = theKernel.getAttribute(AttrNames.AutoIndexColumn);
            if (autoIndexColumn) {
                if (gridWidthType == EGridWidthType.Fixed) {
                    sumTableWidth += 3;
                }
                gridHeadRowRenderBlock.pushLine("<th scope='col' className='indexTableHeader'>序号</th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td className='indexTableHeader'></td>");
                }
            }

            var hadAdvanceHeader = false;
            var hadDynamicColumn = false;
            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
                switch (childKernel.type) {
                    case EmptyKernel_Type:
                        continue;
                }
                if (childKernel == theKernel.gridFormBottomDiv) {
                    continue;
                }
                if (childKernel.type != M_LabeledControlKernel_Type) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        'Grid表单里必须全是操作控件']);
                    return false;
                }

                var sortable = hideHeader ? false : childKernel.getAttribute(AttrNames.Sortable);
                var filtable = hideHeader ? false : childKernel.getAttribute(AttrNames.Filtable);
                var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                var textField = childKernel.getAttribute(AttrNames.TextField);
                var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
                var headTextValue = '';
                var dynamicLabel = false;
                if (textFieldParseRet.isScript) {
                    hadDynamicColumn = true;
                    dynamicLabel = true;
                }
                else {
                    headTextValue = textFieldParseRet.string;
                }
                var isdisplay = childKernel.getAttribute(AttrNames.Isdisplay);
                var isdisplayParseRet = parseObj_CtlPropJsBind(isdisplay, project.scriptMaster);
                var dynamicVisible = false;
                if (isdisplayParseRet.isScript) {
                    dynamicVisible = true;
                }
                else if (!IsEmptyString(isdisplayParseRet.string)) {
                    dynamicVisible = true;
                }

                var useColValueField = '';
                if(sortable || filtable){
                    hadAdvanceHeader = true;
                    useColValueField = headTextValue;
                    if(canUseColumns_arr.indexOf(useColValueField) == -1){
                        switch(childKernel.editor.type){
                            case M_TextKernel_Type:
                            case M_LabelKernel_Type:
                                useColValueField = childKernel.editor.getAttribute(AttrNames.TextField);
                                break;
                            case M_DropdownKernel_Type:
                                useColValueField = childKernel.editor.getAttribute(AttrNames.ValueField);
                                useColValueField = IsEmptyString(useColValueField) ? childKernel.editor.getAttribute(AttrNames.TextField) : '';
                        }
                        if(canUseColumns_arr.indexOf(useColValueField) == -1){
                            useColValueField = childKernel.getAttribute(AttrNames.ColumnValueField);
                            if(canUseColumns_arr.indexOf(useColValueField) == -1){
                                logManager.errorEx([logManager.createBadgeItem(
                                    theKernel.getReadableName(),
                                    theKernel,
                                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                                '列' + headTextValue + '找不到合适的值字段']);
                                return false;
                            }
                        }
                    }
                }

                if (isNaN(columnWidth)) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '列' + headTextValue + '列宽设置错误']);
                    return false;
                }
                if (columnWidth == 0) {
                    columnWidth = headTextValue.length * GridHead_PerCharWidth;
                    if (columnWidth == 0) {
                        columnWidth = 4 * GridHead_PerCharWidth;
                    }
                }
                columnWidth = columnWidth;
                sumTableWidth += columnWidth;
                gridColumnsProfile_obj[childKernel.id] = {
                    id: childKernel.id,
                    width: columnWidth,
                    kernel: childKernel,
                    label: headTextValue,
                    index: gridColumnCount++,
                    dynamicLabel: dynamicLabel,
                    dynamicVisible: dynamicVisible,
                    sortable:sortable,
                    filtable:filtable,
                    colValueField:useColValueField,
                };
            }
            
            kernelMidData.hadAdvanceHeader = hadAdvanceHeader;
            if(hadAdvanceHeader){
                var recordsArraychangedFunInitBlk = kernelMidData.recordsArraychangedFun.initBlk;
                recordsArraychangedFunInitBlk.pushLine("var formpath = getParentPathByKey(path,'" + theKernel.id + "');");
                recordsArraychangedFunInitBlk.pushLine("var setting = gGetFormSetting(formpath);");
                recordsArraychangedFunInitBlk.pushLine("if(setting.records_arr == null || !newValue.fromReProcess){", 1);
                recordsArraychangedFunInitBlk.pushLine("if(setting.setRecords(newValue)){", 1);
                recordsArraychangedFunInitBlk.pushLine("setting.useOldValue = oldValue;");
                recordsArraychangedFunInitBlk.pushLine("return state;", -1);
                recordsArraychangedFunInitBlk.pushLine("}", -1);
                recordsArraychangedFunInitBlk.pushLine("} else{", 1);
                recordsArraychangedFunInitBlk.pushLine("oldValue = setting.useOldValue ? setting.useOldValue : oldValue;");
                recordsArraychangedFunInitBlk.pushLine("setting.useOldValue = null;", -1);
                recordsArraychangedFunInitBlk.pushLine("}");
                recordsArraychangedFunInitBlk.pushLine("");

                pullFun.pushLine("gGetFormSetting(fullParentPath + '." + theKernel.id + "').setRecords(null);");
            }
            var gridHeadStyles_map = {};
            var gridHeadStyleCount = 0;
            var columnProfile;
            var headThTag_map = {};
            var thTag;
            for (var gi in gridColumnsProfile_obj) {
                columnProfile = gridColumnsProfile_obj[gi];
                /*
                if (hadDynamicColumn) {
                    columnProfile.width = 'auto';
                }
                */
                var isAdvanceCol = columnProfile.sortable || columnProfile.filtable;
                var headStyleObj = gridHeadStyles_map[columnProfile.width];
                var tdStyleObj = gridHeadStyles_map[columnProfile.width + 'td'];
                if (headStyleObj == null) {
                    var headStyleID = theKernel.id + 'headstyle' + gridHeadStyleCount;
                    var tdStyleID = theKernel.id + 'tdstyle' + gridHeadStyleCount;
                    ++gridHeadStyleCount;
                    if (columnProfile.width != 'auto') {
                        if (gridWidthType == EGridWidthType.Fixed) {
                            headStyleObj = {
                                width: (columnProfile.width) + 'em',
                            };
                        }
                        else {
                            headStyleObj = {
                                width: (Math.round(1000 * columnProfile.width / sumTableWidth) / 10) + '%',
                            };
                        }
                    }
                    else {
                        headStyleObj = {
                            width: '8em',
                        };
                    }
                    headStyleObj[AttrNames.StyleAttrNames.MaxWidth] = headStyleObj.width;
                    headStyleObj[AttrNames.StyleAttrNames.MinWidth] = headStyleObj.width;
                    tdStyleObj = Object.assign({}, headStyleObj);
                    headStyleObj.whiteSpace = 'nowrap';
                    headStyleObj.overflow = 'hidden';
                    tdStyleObj.verticalAlign = 'middle';

                    this.clientSide.addStyleObject(headStyleID, headStyleObj);
                    this.clientSide.addStyleObject(tdStyleID, tdStyleObj);

                    headStyleObj.id = headStyleID;
                    tdStyleObj.id = tdStyleID;
                    gridHeadStyles_map[columnProfile.width] = headStyleObj;
                    gridHeadStyles_map[columnProfile.width + 'td'] = tdStyleObj;
                }
                columnProfile.headStyleID = headStyleObj.id;
                columnProfile.tdStyleID = tdStyleObj.id;

                thTag = new FormatHtmlTag(gi, 'th', this.clientSide);
                headThTag_map[gi] = thTag;
                thTag.setAttr('style', '{' + headStyleObj.id + '}');
                if (!columnProfile.dynamicLabel) {
                    if(isAdvanceCol){
                        thTag.pushLine("{simpleMode ? '" + columnProfile.label + "' : <ERPC_AdvanceFormHeader canFilt={" + (columnProfile.filtable ? 'true' : 'false') + "} title='" + columnProfile.label + "' colkey='" + columnProfile.colValueField + "' form={this.props.form} />}");
                    }
                    else{
                        thTag.pushLine(columnProfile.label);
                    }
                }
                if (columnProfile.dynamicVisible) {
                    gridHeadRowRenderBlock.pushLine('{this.props.' + columnProfile.id + '_visible == false ? null : (', 1);
                }
                gridHeadRowRenderBlock.pushChild(thTag);
                if (columnProfile.dynamicVisible) {
                    gridHeadRowRenderBlock.subNextIndent();
                    gridHeadRowRenderBlock.pushLine(')}');
                }
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td style={" + headStyleObj.id + "}></td>");
                }
            }
            if (hadRowButton || insertBtnSetting) {
                gridHeadRowRenderBlock.pushLine("<th scope='col'></th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td className='gridbtncoltd'><VisibleERPC_GridForm_BtnCol form={this.props.form} /></td>");
                }
            }

            var gridTableStyle = {
                marginTop: hideHeader ? '0px' : '-50px',
            };
            var gridHeadTableStyle = {
                marginBottom: '0px',
            };
            if (gridWidthType == EGridWidthType.Fixed) {
                gridTableStyle.width = sumTableWidth + 'em';
                gridHeadTableStyle.width = sumTableWidth + 'em';
                gridTableStyle.tableLayout = 'fixed';
                gridHeadTableStyle.tableLayout = 'fixed';
            }
            this.clientSide.addStyleObject(tableStyleID, gridTableStyle);
            this.clientSide.addStyleObject(headTableStyleID, gridHeadTableStyle);

            var formPathVarName = theKernel.id + "_path";
            var bindPageFun = this.clientSide.scope.getFunction(makeFName_bindFormPage(theKernel), true, [VarNames.ReState, formPathVarName]);
            //clientSide.addReducer('ReBind' + theKernel.id + "Page", bindPageFun.name + '.bind(window)');
            bindPageFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, formPathVarName, '{}'));
            bindPageFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
            bindPageFun.scope.getVar(VarNames.NeedSetState, true, '{}');
            if (pageBreak) {
                bindPageFun.scope.getVar(VarNames.PageIndex, true, 'formState.' + VarNames.PageIndex);
                bindPageFun.scope.getVar(VarNames.RowPerPage, true, 'formState.' + VarNames.RowPerPage);
                bindPageFun.scope.getVar(VarNames.StartRowIndex, true, VarNames.PageIndex + '*' + VarNames.RowPerPage);
                bindPageFun.scope.getVar(VarNames.EndRowIndex, true, '(' + VarNames.PageIndex + '+1)*' + VarNames.RowPerPage + '-1');
                bindPageFun.pushLine('if(' + VarNames.EndRowIndex + '>=' + VarNames.Records_arr + '.length){' + VarNames.EndRowIndex + '=' + VarNames.Records_arr + '.length-1;}');
            }
            else {
                bindPageFun.scope.getVar(VarNames.StartRowIndex, true, '0');
                bindPageFun.scope.getVar(VarNames.EndRowIndex, true, VarNames.Records_arr + '.length-1');
            }
            bindPageFun.pushLine('var freshrows_arr = [];');
            bindPageFun.pushLine('for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {', 1);
            bindPageFun.pushLine('var ' + VarNames.NowRecord + ' = records_arr[rowIndex];');
            bindPageFun.pushLine('var ' + VarNames.RowKey + ' = ' + (keyColumn == DefaultKeyColumn ? VarNames.RowIndex : 'GetFromatRowKey(' + VarNames.NowRecord + '.' + keyColumn + ')') + ';');
            bindPageFun.pushLine('var rowstate=getStateByPath(formState,"row_" + ' + VarNames.RowKey + ',{});');
            bindPageFun.pushLine('if(rowstate._isdirty != false){', 1);
            bindPageFun.pushLine('freshrows_arr.push(' + VarNames.RowKey + ');');
            bindPageFun.pushLine('needSetState["row_" + ' + VarNames.RowKey + ' + "._isdirty"] = false;');
            if (awaysEditable) {
                bindPageFun.pushLine('needSetState["row_" + ' + VarNames.RowKey + ' + ".editing"] = true;');
            }
            //bindPageFun.pushChild(staticBindBlock);
            bindPageFun.pushChild(bindNowRecordBlock);
            bindPageFun.pushChild(dynamicSetBlock_hadRecord);
            bindPageFun.subNextIndent();
            bindPageFun.pushLine('}');
            bindPageFun.subNextIndent(2);
            bindPageFun.pushLine('}');
            bindPageFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.StartRowIndex), VarNames.StartRowIndex));
            bindPageFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.EndRowIndex), VarNames.EndRowIndex));
            bindPageFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, formPathVarName, VarNames.NeedSetState], ';'));

            gridBodyPureRectClass.renderFun.scope.getVar('trElems_arr', true, '[]');
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.StartRowIndex, true, makeStr_DotProp('this.props', VarNames.StartRowIndex));
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.EndRowIndex, true, makeStr_DotProp('this.props', VarNames.EndRowIndex));
            gridBodyPureRectClass.renderFun.scope.getVar('formProp', true, 'this.props.form.props');
            callRowBindBlks = {};
            gridBodyPureRectClass.renderFun.callRowBindBlks = callRowBindBlks;
            callRowBindBlks.beforeFor = new FormatFileBlock('beforeFor');
            gridBodyPureRectClass.renderFun.pushChild(callRowBindBlks.beforeFor);
            gridBodyPureRectClass.renderFun.pushLine('for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {', 1);
            gridBodyPureRectClass.renderFun.pushLine('var rowRecord = formProp.records_arr[rowIndex];');
            gridBodyPureRectClass.renderFun.pushLine('var ' + VarNames.RowKey + ' = ' + (keyColumn == DefaultKeyColumn ? 'rowIndex' : 'GetFromatRowKey(rowRecord.' + keyColumn + ')') + ';');
            callRowBindBlks.inFor = new FormatFileBlock('inFor');
            gridBodyPureRectClass.renderFun.pushChild(callRowBindBlks.inFor);
            if (selectMode != ESelectMode.None) {
                if (selectMode == ESelectMode.Single) {
                    gridBodyPureRectClass.renderFun.pushLine("var selected = this.props." + VarNames.SelectedValue + " == " + VarNames.RowKey + ";");
                }
                else {
                    gridBodyPureRectClass.renderFun.pushLine("var selected = this.props." + VarNames.SelectedValues_arr + ".indexOf(" + VarNames.RowKey + ") != -1;");
                }
            }
            gridBodyPureRectClass.renderFun.pushLine('trElems_arr.push(', 1);
            if (selectMode != ESelectMode.None) {
                gridBodyPureRectClass.renderFun.pushLine(makeStr_AddAll('<VisibleERPC_GridSelectableRow key={', VarNames.RowKey, '} ', (clickSelectable || OnSelectedChangedBp ? ' onMouseDown={this.props.clickRowHandler}' : ''), 'rowkey={rowkey} form={this.props.form} selected={selected}>'));
            }
            else {
                gridBodyPureRectClass.renderFun.pushLine(makeStr_AddAll('<tr rowkey={rowkey} key={rowkey}', (clickSelectable || OnSelectedChangedBp ? " className='cursor_hand' onMouseDown={this.props.clickRowHandler}" : ''), '>'));
            }
            var gridBodyTableRowRenderBlock = new FormatFileBlock('rowRender');
            gridBodyPureRectClass.renderFun.pushChild(gridBodyTableRowRenderBlock, -1);
            if (selectMode != ESelectMode.None) {
                gridBodyPureRectClass.renderFun.pushLine('</VisibleERPC_GridSelectableRow>);', -1);
            }
            else {
                gridBodyPureRectClass.renderFun.pushLine('</tr>);', -1);
            }
            gridBodyPureRectClass.renderFun.pushLine('}', -1);

            gridBodyPureRectClass.renderFun.retBlock.clear();
            var statrowBlk = null;
            var statTDBlk = null;
            if(statColumn_arr.length > 0){
                var statrowBlk = new FormatFileBlock('statrow');
                gridBodyPureRectClass.renderFun.retBlock.pushChild(statrowBlk);
                statrowBlk.pushLine('if(trElems_arr.length>1){', 1);
                statrowBlk.pushLine('trElems_arr.push(', 1);
                statrowBlk.pushLine("<tr key='统计'>", 1);
                if (selectMode != ESelectMode.None) {
                    statrowBlk.pushLine("<td className='selectorTableHeader'></td>");
                }
                if (autoIndexColumn) {
                    statrowBlk.pushLine("<td className='indexTableHeader'></td>");
                }
                var statTDBlk = new FormatFileBlock('stattd');
                statrowBlk.pushChild(statTDBlk);
                statrowBlk.subNextIndent();
                statrowBlk.pushLine('</tr>');
                statrowBlk.subNextIndent();
                statrowBlk.pushLine(');');
                statrowBlk.subNextIndent();
                statrowBlk.pushLine('}');
            }

            callRowBindBlks.endfor = new FormatFileBlock('endfor');
            gridBodyPureRectClass.renderFun.retBlock.pushChild(callRowBindBlks.endfor);
            gridBodyPureRectClass.renderFun.retBlock.pushLine("return (<table className='table table-striped table-hover ' style={" + tableStyleID + "}>", 1);
            if (!hideHeader) {
                headClassInBodyTag = new FormatHtmlTag('headClassInFormTag', gridHeadPureRectClass.name, this.clientSide);
                headClassInBodyTag.setAttr('simpleMode', '{true}');
                gridBodyPureRectClass.renderFun.retBlock.pushChild(headClassInBodyTag);
            }
            gridBodyPureRectClass.renderFun.retBlock.pushLine('<tbody>{trElems_arr}</tbody>', -1);
            gridBodyPureRectClass.renderFun.retBlock.pushLine('</table>);');

            var gridBodyTableNewRowRenderBlock = new FormatFileBlock('newrowRender');
            if (selectMode != ESelectMode.None) {
                //gridBodyTableRowRenderBlock.pushLine("<td className='selectorTableHeader'></td>");
                if (insertBtnSetting) {
                    gridBodyTableNewRowRenderBlock.pushLine("<td className='selectorTableHeader'></td>");
                }
            }
            if (autoIndexColumn) {
                gridBodyTableRowRenderBlock.pushLine("<td className='indexTableHeader'>{rowIndex+1}</td>");
                if (insertBtnSetting) {
                    gridBodyTableNewRowRenderBlock.pushLine("<td className='indexTableHeader'>新</td>");
                }
            }

            var insertBtnUseThisFormData = null;
            var insertBtnUseFormChild_map = {};
            if (insertBtnSetting) {
                // compile insertbtn
                gridBodyPureRectClass.renderFun.pushLine('if(this.props.hadNewRow){', 1);
                gridBodyPureRectClass.renderFun.pushLine("rowkey = 'new';");
                gridBodyPureRectClass.renderFun.pushLine('trElems_arr.push(', 1);
                gridBodyPureRectClass.renderFun.pushLine('<tr key={rowkey}>', 1);
                gridBodyPureRectClass.renderFun.pushChild(gridBodyTableNewRowRenderBlock, -1);
                gridBodyPureRectClass.renderFun.pushLine('</tr>);', -1);
                gridBodyPureRectClass.renderFun.pushLine('}', -1);

                var insertCompareRet = this.compileScriptBlueprint(insertBtnSetting.blueprint, {
                    funName: insertBtnSetting.funName,
                    scope: formReactClass,
                    actLabel: insertBtnSetting.actLabel,
                    key: 'insert',
                });
                if (insertCompareRet == false) {
                    return false;
                }
                insertBtnUseThisFormData = insertCompareRet.useForm_map[theKernel.id];
                if (insertBtnUseThisFormData == null || IsEmptyObject(insertBtnUseThisFormData.useControls_map)) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        'insert操作中没有用到本窗体的控件']);
                    return false;
                }
                //useControls_map 里是实际的control，要把顶级control找出来
                for (var ctlId in insertBtnUseThisFormData.useControls_map) {
                    var theControl = insertBtnUseThisFormData.useControls_map[ctlId].kernel;
                    var theParent = theControl;
                    while (theParent.parent && theParent.parent != theKernel) {
                        theParent = theParent.parent;
                    }
                    if (theParent.parent) {
                        insertBtnUseFormChild_map[theParent.id] = true;
                    }
                }
            }

            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
                if (childKernel.type == EmptyKernel_Type || childKernel == theKernel.gridFormBottomDiv) {
                    continue;
                }
                columnProfile = gridColumnsProfile_obj[childKernel.id];
                var childRederBlock = new FormatFileBlock('child_' + childKernel.id);
                gridBodyTableRowRenderBlock.pushChild(childRederBlock);
                var statSetting = statColumn_arr.find(x=>{return x.kernel == childKernel;});
                if (columnProfile.dynamicVisible) {
                    childRederBlock.pushLine('{this.props.' + columnProfile.id + '_visible == false ? null : (', 1);
                    if(statTDBlk){
                        statTDBlk.pushLine('{this.props.' + columnProfile.id + '_visible == false ? null : (', 1);
                    }
                }
                childRederBlock.pushLine("<td style={" + columnProfile.tdStyleID + '}>', 1);
                if (this.compileKernel(childKernel, childRederBlock, renderFun) == false) {
                    return false;
                }
                childRederBlock.subNextIndent();
                childRederBlock.pushLine('</td>');
                if(statTDBlk){
                    statTDBlk.pushLine("<td style={" + columnProfile.tdStyleID + '}>');
                    if(statSetting){
                        statTDBlk.pushLine("<VisibleERPC_Label className='erp-control' rowkey='统计' id='" + statSetting.key + "' parentPath={this.props.fullPath} type='float' />");
                    }
                    statTDBlk.pushLine('</td>');
                }
                if (columnProfile.dynamicVisible) {
                    childRederBlock.subNextIndent();
                    childRederBlock.pushLine(')}');
                    if(statTDBlk){
                        statTDBlk.subNextIndent();
                        statTDBlk.pushLine(')}');
                    }
                }
                if (insertBtnSetting) {
                    if (insertBtnUseFormChild_map[childKernel.id] || childKernel.getAttribute(AttrNames.NewRowDepend)) {
                        gridBodyTableNewRowRenderBlock.pushChild(childRederBlock.clone());
                    }
                    else {
                        gridBodyTableNewRowRenderBlock.pushLine("<td style={" + columnProfile.tdStyleID + '}/>');
                    }
                }
            }
            if (theKernel.gridFormBottomDiv.children.length > 0) {
                if (this.compileKernel(theKernel.gridFormBottomDiv, gridBottomDivBlock, renderFun) == false) {
                    return false;
                }
            }
            for (ci in thisFormMidData.dynamicColumn_map) {
                var dynamicCol = thisFormMidData.dynamicColumn_map[ci];
                thTag = headThTag_map[ci];
                columnProfile = gridColumnsProfile_obj[ci];
                
                if (dynamicCol.visible || dynamicCol.label) {
                    thTag.clear();
                }
                if (dynamicCol.visible && !hideHeader) {
                    freshFun.setColumnNameBlock.pushLine(VarNames.NeedSetState + '.' + ci + '_visible = ' + dynamicCol.visible);
                    formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, ci + '_visible'), VarNames.CtlState + '.' + ci + '_visible'));
                    headClassInBodyTag.setAttr(ci + '_visible', '{this.props.' + ci + '_visible}');
                    headClassInFormTag.setAttr(ci + '_visible', '{this.props.' + ci + '_visible}');
                    gridBodyTag.setAttr(ci + '_visible', '{this.props.' + ci + '_visible}');
                }
                if (dynamicCol.label && !hideHeader) {
                    if(columnProfile.sortable || columnProfile.filtable){
                        thTag.pushLine("{simpleMode ? " + ('this.props.' + ci + '_label') + " : <ERPC_AdvanceFormHeader canFilt={" + (columnProfile.filtable ? 'true' : 'false') + "} title={" + ('this.props.' + ci + '_label') + "} colkey='" + columnProfile.colValueField + "' form={this.props.form} />}");
                    }
                    else{
                        thTag.pushLine('{this.props.' + ci + '_label}');
                    }
                    freshFun.setColumnNameBlock.pushLine(VarNames.NeedSetState + '.' + ci + '_label = ' + dynamicCol.label);
                    formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, ci + '_label'), VarNames.CtlState + '.' + ci + '_label'));
                    headClassInBodyTag.setAttr(ci + '_label', '{this.props.' + ci + '_label}');
                    headClassInFormTag.setAttr(ci + '_label', '{this.props.' + ci + '_label}');
                    gridBodyTag.setAttr(ci + '_label', '{this.props.' + ci + '_label}');

                }
            }

            if (hadRowButton || insertBtnSetting) {
                gridBodyTableRowRenderBlock.pushLine("<td className='gridbtncoltd'><VisibleERPC_GridForm_BtnCol rowkey={rowkey} form={this.props.form} /></td>");
                if (insertBtnSetting) {
                    gridBodyTableNewRowRenderBlock.pushLine("<td className='gridbtncoltd'><VisibleERPC_GridForm_BtnCol rowkey={rowkey} form={this.props.form} /></td>");
                }
            }
        }


        if (thisFormMidData.needSetKernels_arr) {
            for (ci in thisFormMidData.needSetKernels_arr) {
                var targetKernel = thisFormMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (isPageForm) {
                    if (useDS) {
                        if (!targetKernelMidData.isSelfCare) {
                            if (formCanInsert) {
                                // set visible attr
                                var visibleStyle = targetKernelMidData.visibleStyle;
                                if (visibleStyle == null) {
                                    logManager.warnEx([logManager.createBadgeItem(
                                        targetKernel.getReadableName(),
                                        targetKernel,
                                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                                        '没有提供VisibleStyle']);
                                    visibleStyle = VisibleStyle_Both;
                                }
                                if (visibleStyle == VisibleStyle_Insert || visibleStyle == VisibleStyle_Update) {
                                    var visibleStateName = makeStr_DynamicAttr(VarNames.NeedSetState, makeStr_DotProp(targetKernel.id, 'visible'));
                                    if (targetKernel.parent.type == M_LabeledControlKernel_Type) {
                                        visibleStateName = makeStr_DynamicAttr(VarNames.NeedSetState, makeStr_DotProp(targetKernel.parent.id, 'visible'));
                                    }
                                    bindInersetBlock.pushLine(makeLine_Assign(visibleStateName, visibleStyle == VisibleStyle_Insert ? 'true' : 'false'));
                                    bindNowRecordBlock.pushLine(makeLine_Assign(visibleStateName, visibleStyle == VisibleStyle_Insert ? 'false' : 'true'));
                                }
                            }
                        }
                    }
                }

                var targetBlocks = null;
                var saveInsertCacheLine = null;
                var readInsertCacheLine = null;
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = makeStr_DotProp(targetKernel.id, stateItem.name);
                        var orginStateName = stateName;
                        var state_Name = makeStr_Join('_', targetKernel.id, stateItem.name);
                        var setLine;
                        var sv;
                        if (isGridForm || isListForm) {
                            var kernelInRow = theKernel.isKernelInRow(targetKernel);
                            if (kernelInRow) {
                                stateName = "row_'+rowkey+'." + orginStateName;
                            }
                            else {
                                console.log(stateName);
                            }
                            if (stateItem.isDynamic) {
                                if (stateItem.isInitUserControlCall) {
                                    if (kernelInRow) {
                                        if (stateItem.initOnRowChanged) {
                                            rowInitUserControlBlock.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, theKernel.id + "_path + '.row_' + rowkey + " + singleQuotesStr('.' + stateItem.kernel.getStatePath(null, null, null, true, theKernel))], ';'));
                                        }
                                    }
                                    else {
                                        initUserControlBlock.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, theKernel.id + "_path + " + singleQuotesStr('.' + stateItem.kernel.getStatePath(null, null, null, true, theKernel))], ';'));
                                    }
                                }
                                else {
                                    switch (stateItem.bindMode) {
                                        case ScriptBindMode.OnForm:
                                            if (kernelInRow) {
                                                bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, 'null', theKernel.id + "_path + '.row_' + rowkey"])));
                                            }
                                            else {
                                                endBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, 'null', theKernel.id + '_path'])));
                                            }
                                            break;
                                        case ScriptBindMode.OnNewRow:
                                            staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "row_new." + orginStateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, 'null', theKernel.id + "_path + '.row_new'"])));
                                            break;
                                    }
                                }
                            } else {
                                if (stateItem.staticValue) {
                                    var sv = stateItem.staticValue;
                                    switch (sv.toLocaleLowerCase()) {
                                        case 'true':
                                        case 'false':
                                        case '""':
                                        case "''":
                                            break;
                                        default:
                                            sv = singleQuotesStr(sv);
                                    }
                                    switch (stateItem.bindMode) {
                                        case ScriptBindMode.OnForm:
                                            if (kernelInRow) {
                                                bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv));
                                            }
                                            else {
                                                endBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv));
                                            }
                                            break;
                                        case ScriptBindMode.OnNewRow:
                                            staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "row_new." + orginStateName), sv));
                                            break;
                                        default:
                                            console.error('没有bindMode');
                                            break;
                                    }
                                }
                                else if (stateItem.useColumn) {
                                    if (kernelInRow) {
                                        bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_DynamicAttr(VarNames.NowRecord, stateItem.useColumn.name)));
                                    }
                                }
                                else if (stateItem.setNull) {
                                    switch (stateItem.bindMode) {
                                        case ScriptBindMode.OnForm:
                                            if (kernelInRow) {
                                                bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
                                            }
                                            else {
                                                endBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
                                            }
                                            break;
                                        case ScriptBindMode.OnNewRow:
                                            staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "row_new." + orginStateName), 'null'));
                                            break;
                                    }
                                }
                            }
                        }
                        else {
                            // pageform
                            var needSaveThisState = false;
                            var needResetThisState = true;
                            targetBlocks = [];
                            if (stateItem.isDynamic) {
                                if (stateItem.isInitUserControlCall) {
                                    initUserControlBlock.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, theKernel.id + '_path + ' + singleQuotesStr('.' + stateItem.kernel.getStatePath(null, null, null, true, theKernel))], ';'));
                                }
                                else if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                    setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, bundleVar.name, pathVarName]));
                                    var otherUseColumnSetState = targetKernelMidData.needSetStates_arr.find(item => {
                                        return item != stateItem && item.name == stateItem.name && !item.isDynamic && item.useColumn;
                                    });
                                    if (formCanInsert) {
                                        if (otherUseColumnSetState) {
                                            // 有另一个设值用的是数据列
                                            if (!stateItem.useColumn) {
                                                // 方法没有用到数据列，在insert模式中触发
                                                targetBlocks.push(hadInsertCacheFlaseDynamicBlock);
                                            }
                                        }
                                        else {
                                            // 此控件只有这一个设值项
                                            needSaveThisState = true;
                                            needResetThisState = false;
                                            if (stateItem.useColumn) {
                                                targetBlocks.push(insertModeIf.falseBlock);
                                            }
                                            else {
                                                targetBlocks.push(hadInsertCacheFlaseDynamicBlock);
                                                targetBlocks.push(insertModeIf.falseBlock);
                                            }
                                        }
                                    }
                                    else {
                                        if (stateItem.useColumn) {
                                            targetBlocks.push(dynamicSetBlock_hadRecord);
                                        }
                                        else {
                                            targetBlocks.push(staticBindBlock);
                                        }
                                    }
                                }
                            } else {
                                if (formCanInsert) {
                                    needSaveThisState = true;
                                }
                                if (stateItem.staticValue) {
                                    needResetThisState = false;
                                    sv = stateItem.staticValue;
                                    switch (sv.toLocaleLowerCase()) {
                                        case 'true':
                                        case 'false':
                                        case '""':
                                        case "''":
                                            break;
                                        default:
                                            sv = singleQuotesStr(sv);
                                    }
                                    setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv);
                                    targetBlocks.push(staticBindBlock);
                                }
                                else if (stateItem.useColumn) {
                                    if (stateItem.useColumn) {
                                        setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_DynamicAttr(VarNames.NowRecord, stateItem.useColumn.name));
                                        targetBlocks.push(bindNowRecordBlock);
                                    }
                                }
                                else if (stateItem.setNull) {
                                    needResetThisState = false;
                                    setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null');
                                    targetBlocks.push(staticBindBlock);
                                }
                            }
                            if (needSaveThisState) {
                                if (formReactClass.saveInsertFun) {
                                    formReactClass.saveInsertFun.pushLine(makeLine_Assign(VarNames.NeedSetState + '.' + state_Name, makeStr_getStateByPath('formState', singleQuotesStr(stateName))));
                                }
                                hadInsertCacheIf.trueBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), VarNames.InsertCache + '.' + state_Name));
                                if (needResetThisState) {
                                    hadInsertCacheIf.falseBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), stateItem.alterValue ? stateItem.alterValue : 'null'));
                                }
                            }
                            targetBlocks.forEach(blk => {
                                blk.pushLine(setLine);
                            });
                        }
                    });
                }
            }
        }

        if (hadInsertCacheIf) {
            hadInsertCacheIf.trueBlock.pushChild(hadInsertCacheTrueDynamicBlock);
            hadInsertCacheIf.falseBlock.pushChild(hadInsertCacheFlaseDynamicBlock);
        }

        if (isPageForm) {
            if (useDS) {
                bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.NowRecord), VarNames.NowRecord));
            }
            if (initUserControlBlock.childs_arr.length > 0) {
                bindFun.pushLine('setTimeout(() => {', 1);
                bindFun.pushLine('store.dispatch(makeAction_callFunction(state=>{', 1);
                bindFun.pushChild(initUserControlBlock);
                bindFun.subNextIndent();
                bindFun.pushLine('}));');
                bindFun.subNextIndent();
                bindFun.pushLine('},20);');
            }
        }
        else {
            if (rowInitUserControlBlock.childs_arr.length > 0 || initUserControlBlock.childs_arr.length > 0) {
                var useBindFun = isGridForm ? bindPageFun : freshFun;
                useBindFun.pushLine('setTimeout(() => {', 1);
                useBindFun.pushLine('store.dispatch(makeAction_callFunction(state=>{', 1);
                if (rowInitUserControlBlock.childs_arr.length > 0) {
                    if (isGridForm) {
                        useBindFun.pushLine('freshrows_arr.forEach(rowkey=>{', 1);
                    }
                    else {
                        useBindFun.pushLine(VarNames.Records_arr + ".forEach(record=>{", 1);
                        useBindFun.pushLine('var rowkey = record.' + keyColumn + ';');
                    }
                    useBindFun.pushChild(rowInitUserControlBlock);
                    useBindFun.subNextIndent();
                    useBindFun.pushLine('});');
                }
                useBindFun.pushChild(initUserControlBlock);
                useBindFun.subNextIndent();
                useBindFun.pushLine('}));');
                useBindFun.subNextIndent();
                useBindFun.pushLine('},20);');
            }
        }

        if (theKernel.getAttribute(AttrNames.NoRender)) {
            renderContentFun.clear();
            renderContentFun.pushLine('return null;');
        }

        thisFormMidData.callRowBindBlks = callRowBindBlks;
        bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InvalidBundle), 'false'));
        bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, pathVarName, VarNames.NeedSetState]) + ';');
        bindFun.retBlock.pushChild(bindEndBlock);
        bindFun.retBlock.pushLine('return ' + VarNames.ReState + ';');
    }

    compileContainerKernel(theKernel, renderBlock, renderFun) {
        var layoutConfig = theKernel.getLayoutConfig();
        var tagType = theKernel.getAttribute(AttrNames.TagType);
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-control');

        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var styleID = theKernel.id + '_style';
        var styleStr = this.clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';
        renderBlock.pushLine("<" + tagType + " className='" + layoutConfig.getClassName() + "' " + styleStr + ">", 1);
        renderBlock.pushChild(childRenderBlock);
        renderBlock.subNextIndent();
        renderBlock.pushLine('</' + tagType + '>');

        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            if (this.compileKernel(childKernel, childRenderBlock, renderFun) == false) {
                return false;
            }
        }
    }

    compileLabelKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Label', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
        var valType = theKernel.getAttribute(AttrNames.ValueType);
        ctlTag.setAttr('type', valType);
        if (valType == ValueType.Float) {
            ctlTag.setAttr('precision', theKernel.getAttribute(AttrNames.FloatNum));
        }
        if (theKernel.getAttribute(AttrNames.OutputCharCount)) {
            ctlTag.setAttr('boutcharlen', true);
        }
        renderBlock.pushChild(ctlTag);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);

        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            if (this.compileScriptAttribute(textFieldParseRet, theKernel, 'text', AttrNames.TextField, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            if (belongFormKernel != null) {
                var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                    formMidData.needSetKernels_arr.push(theKernel);
                }
                if (formColumns_arr.indexOf(textField) != -1) {
                    formMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    kernelMidData.needSetStates_arr.push(
                        {
                            name: 'text',
                            useColumn: { name: textField }
                        }
                    );
                } else {
                    ctlTag.setAttr('text', textField);
                }
            }
            else {
                ctlTag.setAttr('text', textField);
            }
        }

        if (this.compileOnMouseDownEvent(theKernel, ctlTag) == false) {
            return false;
        }
    }

    compileImageKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Img', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
        renderBlock.pushChild(ctlTag);
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var srcField = theKernel.getAttribute('src');
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);

        var srcFieldParseRet = parseObj_CtlPropJsBind(srcField, project.scriptMaster);
        if (srcFieldParseRet.isScript) {
            if (this.compileScriptAttribute(srcFieldParseRet, theKernel, 'src', 'src', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            if (belongFormKernel != null) {
                var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                    formMidData.needSetKernels_arr.push(theKernel);
                }
                if (formColumns_arr.indexOf(srcField) != -1) {
                    formMidData.useColumns_map[srcField] = 1;
                    kernelMidData.columnName = srcField;
                    kernelMidData.needSetStates_arr.push(
                        {
                            name: 'src',
                            useColumn: { name: srcField }
                        }
                    );
                } else {
                    ctlTag.setAttr('src', srcField);
                }
            }
            else {
                ctlTag.setAttr('src', srcField);
            }
        }

        if (this.compileOnMouseDownEvent(theKernel, ctlTag) == false) {
            return false;
        }
    }

    compileButtonKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Button', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);
        var iconType = theKernel.getAttribute(AttrNames.IconType);
        if (!IsEmptyString(iconType)) {
            ctlTag.pushLine("<i className='fa fa-" + iconType + "' />");
        }
        if (!theKernel.getAttribute(AttrNames.HideLabel)) {
            if (!IsEmptyString(theKernel.getAttribute(AttrNames.Name))) {
                ctlTag.pushChild(new FormatFile_Line(theKernel.getAttribute(AttrNames.Name)));
            }
        }
        var btnType = theKernel.getAttribute(AttrNames.ButtonType);
        if (btnType != ButtonType_Normal) {
            ctlTag.setAttr('btnType', btnType);
        }
        renderBlock.pushChild(ctlTag);

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var setTitleStateItem = null;
        var title = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(title, project.scriptMaster);
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (belongFormKernel != null && (!belongFormKernel.isGridForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    var formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(title) != -1) {
                        parentMidData.useColumns_map[title] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: title },
                        };
                    }
                }
            }
        }

        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        var onclickFunName = theKernel.id + '_' + AttrNames.Event.OnClick;
        var onClickBp = project.scriptMaster.getBPByName(onclickFunName);
        if (onClickBp != null) {
            var compileRet = this.compileScriptBlueprint(onClickBp, { params: ['ev'], haveDoneTip: theKernel.getAttribute(AttrNames.HaveDoneTip) });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr('onClick', bigbracketStr(onclickFunName));

            if (reactParentKernel.type == M_FormKernel_Type && reactParentKernel.isPageForm()) {
                var formDS = reactParentKernel.getAttribute(AttrNames.DataSource);
                var formTable = reactParentKernel.getAttribute(AttrNames.ProcessTable);
                if (formDS && formTable) {
                    // 按钮在一个有数据源有操作表的页面式Form当中
                    var visibleType = theKernel.getAttribute(AttrNames.ButtonVisibleType);
                    var reactParentMid = this.projectCompiler.getMidData(reactParentKernel.id);
                    if (visibleType == EButtonVisibleType.Default) {
                        visibleType = EButtonVisibleType.Both;

                        var useFormTable = compileRet.useEntities_map[formTable.code];
                        if (useFormTable) {
                            if (useFormTable.useStage[EUseEntityStage.Insert]) {
                                // insert了form的操作表，认定为insert按钮
                                visibleType = EButtonVisibleType.Insert;
                            }
                            else {
                                visibleType = EButtonVisibleType.Update;
                            }
                        }
                        var useFormDS = compileRet.useEntities_map[formDS.code];
                        if (useFormDS) {
                            if (useFormDS.useStage[EUseEntityStage.Select] != null) {
                                // 按钮用到了form数据源中的数据
                                visibleType = EButtonVisibleType.Update;
                            }
                        }
                    }
                    if (visibleType != EButtonVisibleType.Both) {
                        if (visibleType == EButtonVisibleType.Insert) {
                            reactParentMid.hadInsertMode = true;
                        }
                        var thisMidData = this.projectCompiler.getMidData(theKernel.id);
                        thisMidData.visibleStyle = visibleType == EButtonVisibleType.Insert ? VisibleStyle_Insert : VisibleStyle_Update;
                        reactParentMid.needSetKernels_arr.push(theKernel);
                    }
                    else{
                        reactParentMid.hadInsertMode = true;
                    }
                }
            }
        }
    }

    compileAccordionKernel(theKernel, renderBlock, renderFun) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        controlReactClass.constructorFun.pushLine('this.state=ERPC_Accordion(this);');
        controlReactClass.constructorFun.pushLine('this.rednerBody = this.rednerBody.bind(this);');
        controlReactClass.constructorFun.pushLine('this.rebindBody = this.rebindBody.bind(this);');
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        layoutConfig.addClass('card');
        var styleID = theKernel.id + '_style';
        var styleStr = clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';

        var ctlTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            ctlTag.setAttr('bodyIsColumn', '{true}');
        }
        var initCollapsed = theKernel.getAttribute(AttrNames.InitCollapsed);
        ctlTag.setAttr('initcollapsed', '{' + initCollapsed + '}');
        var ctlMode = theKernel.getAttribute(AttrNames.Mode);
        if (ctlMode != AccordionMode.Default) {
            ctlTag.setAttr('mode', ctlMode);
        }

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.needCallOnInit_arr = [];

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.pushLine(VarNames.RetElem + " = this.commonRender();");
        var renderBodyFun = controlReactClass.getFunction('rednerBody', true);
        renderBodyFun.pushLine("return <React.Fragment>", 1);
        renderBodyFun.pushChild(childRenderBlock);
        renderBodyFun.subNextIndent();
        renderBodyFun.pushLine('</React.Fragment>');
        var rebindBodyFun = controlReactClass.getFunction('rebindBody', true);
        rebindBodyFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        rebindBodyFun.scope.getVar(VarNames.State, true, 'store.getState()');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'visible'), makeStr_DotProp(VarNames.CtlState, 'visible != false')));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'title'), "ctlState.title ? ctlState.title : (ownprops.defaultTitle ? ownprops.defaultTitle : '未命名')"));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'collapsed'), 'ctlState.collapsed == null ? ownprops.initcollapsed : ctlState.collapsed;'));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'inited'), 'ctlState.inited == true;'));


        var onUnCollapseFunName = theKernel.id + '_' + AttrNames.Event.OnUnCollapse;
        var onUnCollapseBp = project.scriptMaster.getBPByName(onUnCollapseFunName);
        if (onUnCollapseBp != null) {
            var compileRet = this.compileScriptBlueprint(onUnCollapseBp, { params: [theKernel.id + '_path'] });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr(AttrNames.Event.OnUnCollapse, bigbracketStr(onUnCollapseFunName));
        }

        var title = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(title, project.scriptMaster);
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(title)) {
                ctlTag.setAttr('defaultTitle', title);
            }
        }

        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            if (this.compileKernel(childKernel, childRenderBlock, controlReactClass.renderFun) == false) {
                return false;
            }
        }

        var thisFullPathVarName = 'this.props.fullPath';
        if (ctlMidData.needSetKernels_arr.length > 0) {
            for (ci in ctlMidData.needSetKernels_arr) {
                var targetKernel = ctlMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = targetKernel.getStatePath(stateItem.name, '.', {}, false, theKernel);
                        var setNeedStateLeftStr = VarNames.NeedSetState + '[' + thisFullPathVarName + "+'." + stateName + "']";
                        if (stateItem.isInitUserControlCall) {
                            rebindBodyFun.pushLine(makeStr_callFun(stateItem.funName, [VarNames.State, thisFullPathVarName + "+ '." + stateItem.kernel.id + "'"], ';'));
                        }
                        else if (stateItem.isDynamic) {
                            var setLine = makeLine_Assign(setNeedStateLeftStr, makeStr_callFun(stateItem.funName, [VarNames.State, 'null', thisFullPathVarName]));
                            rebindBodyFun.pushLine(setLine);
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
                                    case '""':
                                    case "''":
                                        break;
                                    default:
                                        sv = singleQuotesStr(sv);
                                }
                                rebindBodyFun.pushLine(makeLine_Assign(setNeedStateLeftStr, sv));
                            }
                            else if (stateItem.setNull) {
                                rebindBodyFun.pushLine(makeLine_Assign(setNeedStateLeftStr, 'null'));
                            }
                            else {
                                console.error('无法处理的kernel');
                            }
                        }
                    });
                }
            }
        }
        rebindBodyFun.pushLine(VarNames.NeedSetState + '[' + thisFullPathVarName + "+'.inited'] = true;"),
            rebindBodyFun.pushLine("setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(needSetState, ''));},50);", -1);
        ctlMidData.needCallOnInit_arr.forEach(callSetting => {
            rebindBodyFun.pushLine(makeStr_callFun(callSetting.name, callSetting.params_arr, ';'));
        });
        return true;
    }

    compileTabControlKernel(theKernel, renderBlock, renderFun) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        controlReactClass.constructorFun.pushLine('this.clickNavBtn = this.clickNavBtn.bind(this);');
        var dockType = theKernel.getAttribute(AttrNames.DockType);
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        layoutConfig.addClass('d-flex');
        if (dockType == DockType_Top || dockType == DockType_Bottom) {
            layoutConfig.addClass('flex-column');
        }
        layoutConfig.addClass('border');
        var styleID = theKernel.id + '_style';
        var styleStr = clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';

        var ctlTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var defaultTabitemID = theKernel.getAttribute('defaultTabitemID');

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];

        var clickNavBtnFun = controlReactClass.getFunction('clickNavBtn', true, ['ev']);
        clickNavBtnFun.pushLine('var itemid = ' + makeStr_callFun('getAttributeByNode', ['ev.target', "'d-id'"], ';'));
        clickNavBtnFun.pushLine("store.dispatch(makeAction_setStateByPath(itemid,this.props.fullPath + '.selectedIndex'));");

        var renderItemFun = controlReactClass.getFunction('renderChild', true);
        controlReactClass.constructorFun.pushLine('this.' + renderItemFun.name + ' = this.' + renderItemFun.name + '.bind(this);');

        var navBtnBlk = new FormatFileBlock('navbtn');
        var navBtnContainerBlk = new FormatFileBlock('navbtncontainer');
        switch (dockType) {
            case DockType_Top:
                navBtnContainerBlk.pushLine("<div className='btn-group flex-grow-0 flex-shrink-0 border-bottom'>");
                break;
            case DockType_Bottom:
                navBtnContainerBlk.pushLine("<div className='btn-group flex-grow-0 flex-shrink-0 border-top'>");
                break;
            case DockType_Left:
                navBtnContainerBlk.pushLine("<div className='btn-group-vertical flex-grow-0 flex-shrink-0 border-right justify-content-start'>");
                break;
            case DockType_Right:
                navBtnContainerBlk.pushLine("<div className='btn-group-vertical flex-grow-0 flex-shrink-0 border-left justify-content-start'>");
                break;
        }
        navBtnContainerBlk.addNextIndent();
        navBtnContainerBlk.pushChild(navBtnBlk);
        navBtnContainerBlk.subNextIndent();
        navBtnContainerBlk.pushLine('</div>');

        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.scope.getVar('self', true, 'this');
        selftRenderBlock.pushLine('if(this.props.visible == false){return null;}');
        var genItemBlk = new FormatFileBlock('genitem');
        selftRenderBlock.pushChild(genItemBlk);
        selftRenderBlock.pushLine(VarNames.RetElem + " = <div className='" + layoutConfig.getClassName() + "' " + styleStr + ">", 1);
        if (dockType == DockType_Top || dockType == DockType_Left) {
            selftRenderBlock.pushChild(navBtnContainerBlk);
        }
        selftRenderBlock.pushLine("<div className='d-flex flex-grow-1 flex-shrink-1' >", 1);
        var renderItemsBlk = new FormatFileBlock('renderitems');
        selftRenderBlock.pushChild(renderItemsBlk);
        selftRenderBlock.subNextIndent();
        selftRenderBlock.pushLine('</div>');
        if (dockType == DockType_Bottom || dockType == DockType_Right) {
            selftRenderBlock.pushChild(navBtnContainerBlk);
        }
        selftRenderBlock.pushLine('</div>');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.scope.getVar('visible', true, makeStr_DotProp(VarNames.CtlState, 'visible'));
        controlReactClass.mapStateFun.pushLine('if(visible == null){visible = ownprops.definvisible ? false : true;}');
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'visible'), 'visible'));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'selectedIndex'), makeStr_DotProp(VarNames.CtlState, 'selectedIndex') + (defaultTabitemID == '0' ? '' : ' ? ' + makeStr_DotProp(VarNames.CtlState, 'selectedIndex') + ' : ' + singleQuotesStr(defaultTabitemID))));
        var isGreedMode = theKernel.getAttribute(AttrNames.GreedMode);
        var navBtnClassStr = "'btn rounded-0 " + (isGreedMode ? 'flex-grow-1 flex-shrink-1 ' : '') + "'";
        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            var elemVarName = 'elem_' + childKernel.id;
            renderItemsBlk.pushLine(bigbracketStr(elemVarName));
            selftRenderBlock.scope.getVar(elemVarName, true);
            var childRenderBlock = new FormatFileBlock(childKernel.id);
            var invisibleAct = childKernel.getAttribute(AttrNames.InvisibleAct);
            if(invisibleAct == EInvisibleAct.DNONE){
                genItemBlk.pushLine(elemVarName + '=(', 1);
            }
            else{
                genItemBlk.pushLine('if(this.props.selectedIndex == ' + singleQuotesStr(childKernel.id) + '){', 1);
                genItemBlk.pushLine(elemVarName + '=(', 1);
            }
            genItemBlk.pushChild(childRenderBlock);
            genItemBlk.subNextIndent();
            genItemBlk.pushLine(');');

            if(invisibleAct != EInvisibleAct.DNONE){
                genItemBlk.subNextIndent();
                genItemBlk.pushLine('}');
            }
            var iconType = childKernel.getAttribute(AttrNames.IconType);
            var btnStr = "<button type='button' onClick={this.clickNavBtn} d-id=" + singleQuotesStr(childKernel.id) + " className={" + navBtnClassStr + '+(this.props.selectedIndex == ' + singleQuotesStr(childKernel.id) + " ? 'btn-primary' : 'btn-dark')}" + ">";
            var btnTitle = childKernel.getAttribute(AttrNames.Title);
            if (!IsEmptyString(iconType)) {
                btnStr += "<i className='fa fa-" + iconType + "' />";
            }
            if (dockType == DockType_Left || dockType == DockType_Right) {
                if (!IsEmptyString(iconType)) {
                    btnStr += '<br/>';
                }
                for (var bi = 0; bi < btnTitle.length; ++bi) {
                    btnStr += btnTitle[bi] + (bi < btnTitle.length - 1 ? '<br/>' : '');
                }
            }
            else {
                btnStr += btnTitle;
            }
            navBtnBlk.pushLine(btnStr + "</button>");

            if (this.compileKernel(childKernel, childRenderBlock, selftRenderBlock) == false) {
                return false;
            }
        }

        return true;
    }

    compileTabItemKernel(theKernel, renderBlock, renderFun) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        controlReactClass.constructorFun.pushLine('this.rebindBody = this.rebindBody.bind(this);');
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        var styleID = theKernel.id + '_style';
        var styleStr = clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';

        /*
        var initFun = clientSide.scope.getFunction('Init' + theKernel.id, true, [VarNames.FullParentPath]);
        var theKernelPathVarName = theKernel.id + '_path';
        initFun.scope.getVar(theKernelPathVarName, true, VarNames.FullParentPath + " + '." + theKernel.id + "'");
        initFun.pushLine('if(' + makeActStr_getGDataCache(theKernelPathVarName + '.inited') + '==1){return;}');
        initFun.pushLine(makeLine_setGDataCache(theKernelPathVarName + '.inited', 1));
        */

        var ctlTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        if (theKernel.getAttribute(AttrNames.AutoHeight)) {
            layoutConfig.addClass('autoScroll');
        }
        var invisibleAct = theKernel.getAttribute(AttrNames.InvisibleAct);
        if(invisibleAct == EInvisibleAct.DNONE){
            ctlTag.setAttr('selected', bigbracketStr(singleQuotesStr(theKernel.id) + '==this.props.selectedIndex'));
        }
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.needCallOnInit_arr = [];

        var renderBodyFun = selftRenderBlock;
        var rebindBodyFun = controlReactClass.getFunction('rebindBody', true);
        ctlMidData.renderBodyFun = renderBodyFun;

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.pushLine('if(this.props.inited == false){this.rebindBody(); return null;}');
        selftRenderBlock.pushLine('this.initing = false;');

        if(invisibleAct == EInvisibleAct.DNONE){
            layoutConfig.removeClass('d-flex');
            selftRenderBlock.pushLine(VarNames.RetElem + " = <div className={'" + layoutConfig.getClassName() + "' + (this.props.selected == false ? ' d-none' : ' d-flex')}>");
        }
        else{
            selftRenderBlock.pushLine(VarNames.RetElem + " = <div className='" + layoutConfig.getClassName() + "'>");
        }
        selftRenderBlock.pushChild(childRenderBlock);
        selftRenderBlock.subNextIndent();
        selftRenderBlock.pushLine('</div>');

        rebindBodyFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        rebindBodyFun.scope.getVar(VarNames.State, true, 'store.getState()');
        rebindBodyFun.pushLine('if(this.initing){return}');
        rebindBodyFun.pushLine('this.initing=true;');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'inited'), 'ctlState.inited == true;'));

        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            if (this.compileKernel(childKernel, childRenderBlock, renderBodyFun) == false) {
                return false;
            }
        }

        var thisFullPathVarName = 'this.props.fullPath';
        if (ctlMidData.needSetKernels_arr.length > 0) {
            for (ci in ctlMidData.needSetKernels_arr) {
                var targetKernel = ctlMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = targetKernel.getStatePath(stateItem.name, '.', {}, false, theKernel);
                        var setNeedStateLeftStr = VarNames.NeedSetState + '[' + thisFullPathVarName + "+'." + stateName + "']";
                        if (stateItem.isDynamic) {
                            var setLine = null;
                            if (stateItem.isInitUserControlCall) {
                                setLine = makeStr_callFun(stateItem.funName, [VarNames.State, thisFullPathVarName + "+'." + targetKernel.id + "'"]);
                            }
                            else if (IsEmptyString(stateItem.name)) {
                                setLine = makeStr_callFun(stateItem.funName, [VarNames.State, 'null', thisFullPathVarName]);
                            }
                            else {
                                setLine = makeLine_Assign(setNeedStateLeftStr, makeStr_callFun(stateItem.funName, [VarNames.State, 'null', thisFullPathVarName]));
                            }
                            rebindBodyFun.pushLine(setLine);
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
                                    case '""':
                                    case "''":
                                        break;
                                    default:
                                        sv = singleQuotesStr(sv);
                                }
                                rebindBodyFun.pushLine(makeLine_Assign(setNeedStateLeftStr, sv));
                            }
                            else if (stateItem.setNull) {
                                rebindBodyFun.pushLine(makeLine_Assign(setNeedStateLeftStr, 'null'));
                            }
                            else {
                                console.error('无法处理的kernel');
                            }
                        }
                    });
                }
            }
        }
        rebindBodyFun.pushLine(VarNames.NeedSetState + '[' + thisFullPathVarName + "+'.inited'] = true;"),
            rebindBodyFun.pushLine("setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(needSetState, ''));},50);", -1);
        ctlMidData.needCallOnInit_arr.forEach(callSetting => {
            rebindBodyFun.pushLine(makeStr_callFun(callSetting.name, callSetting.params_arr, ';'));
        });
        return true;
    }

    compileTaskSelectorKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_TaskSelector', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var tipStr = theKernel.getAttribute(AttrNames.TipInfo);
        if (!IsEmptyString(tipStr)) {
            ctlTag.setAttr('label', tipStr);
        }

        var isnullable = false;
        var parentLabledCtl = theKernel.getParentLabledCtl();
        if (parentLabledCtl) {
            isnullable = parentLabledCtl.getAttribute(AttrNames.Nullable);
        }
        else {
            isnullable = theKernel.getAttribute(AttrNames.Nullable);
        }
        if (isnullable) {
            ctlTag.setAttr('nullable', '{true}');
        }
        renderBlock.pushChild(ctlTag);
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileOnChangedEventBlueprint(theKernel, ctlTag) == false) { return false; }

        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }

        var setTextStateItem = {
            name: 'value',
            setNull: true,
        };
        var setValueStateItem = {
            name: 'value',
            setNull: true,
        };
        var formColumns_arr;

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            if (this.compileScriptAttribute(textFieldParseRet, theKernel, 'text', AttrNames.TextField, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (IsEmptyString(textFieldParseRet.string)) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '显示字段不可为空']);
                return false;
            }
            if (belongFormKernel != null) {
                formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formColumns_arr.indexOf(textField) != -1) {
                    parentMidData.useColumns_map[textField] = 1;
                    setTextStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
                    };
                }
            }
        }
        var valueField = theKernel.getAttribute(AttrNames.ValueField);
        var valueFieldParseRet = parseObj_CtlPropJsBind(valueField, project.scriptMaster);
        if (valueFieldParseRet.isScript) {
            if (this.compileScriptAttribute(valueFieldParseRet, theKernel, 'value', AttrNames.ValueField, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (IsEmptyString(valueFieldParseRet.string)) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '码值字段不可为空']);
                return false;
            }
            if (belongFormKernel != null) {
                formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formColumns_arr.indexOf(valueField) != -1) {
                    parentMidData.useColumns_map[valueField] = 1;
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: valueField },
                    };
                }
            }
        }
        kernelMidData.needSetStates_arr.push(setTextStateItem);
        kernelMidData.needSetStates_arr.push(setValueStateItem);
    }

    compileMFileUploaderKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_MultiFileUploader', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        if (layoutConfig.hadClass('flex-grow-1')) {
            ctlTag.setAttr('flexgrow', '1');
        }
        if (layoutConfig.hadClass('flex-shrink-1')) {
            ctlTag.setAttr('flexshrink', '1');
        }
        ctlTag.style = layoutConfig.style;
        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);

        var title = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(title, project.scriptMaster);
        var setTitleStateItem = null;
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (belongFormKernel != null && (belongFormKernel.isPageForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    var formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(title) != -1) {
                        parentMidData.useColumns_map[title] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: title },
                        };
                    }
                }
                if (setTitleStateItem == null) {
                    ctlTag.setAttr('title', title);
                }
            }
            else {
                ctlTag.setAttr('title', '附件列表');
            }
        }
        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileValidCheckerAttribute(theKernel) == false) { return false; }
        var onUploadCompleteFunName = theKernel.id + '_' + AttrNames.Event.OnUploadComplete;
        var onUploadCompleteBp = project.scriptMaster.getBPByName(onUploadCompleteFunName);
        if (onUploadCompleteBp != null) {
            var compileRet = this.compileScriptBlueprint(onUploadCompleteBp, { muteMode: true, fetchKey: "'fileuploaded' + fileID" });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr('onuploadcomplete', bigbracketStr(onUploadCompleteFunName));
        }

        renderBlock.pushChild(ctlTag);
    }

    compileSingleFileUploaderKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var layoutConfig = theKernel.getLayoutConfig();
        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_SingleFileUploader', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.style = layoutConfig.style;
        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);

        var fileFlow = theKernel.getAttribute('fileFlow');
        var fileFlowItem = AllFileFlows_arr.find(x => { return x.code > 0 && x.code == fileFlow; });
        if (fileFlowItem) {
            ctlTag.setAttr('fileflow', fileFlow);
        }
        if(layoutConfig.hadSizeSetting()){
            ctlTag.setAttr('fixedsize', singleQuotesStr(0));
        }
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var formColumns_arr = null;
        if (belongFormKernel != null && (belongFormKernel.isPageForm() || belongFormKernel.isKernelInRow(theKernel))) {
            formColumns_arr = belongFormKernel.getCanuseColumns();
        }

        var title = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(title, project.scriptMaster);
        var setTitleStateItem = null;
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (formColumns_arr) {
                    if (formColumns_arr.indexOf(title) != -1) {
                        parentMidData.useColumns_map[title] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: title },
                        };
                    }
                }
                if(setTitleStateItem == null) {
                    ctlTag.setAttr('title', title);
                }
            }
        }

        var keyrecordid = theKernel.getAttribute(AttrNames.KeyRecrodID);
        var keyrecordidParseRet = parseObj_CtlPropJsBind(keyrecordid, project.scriptMaster);
        var setkeyrecordidStateTiem = null;
        if (keyrecordidParseRet.isScript) {
            if (this.compileScriptAttribute(keyrecordidParseRet, theKernel, 'relrecordid', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(keyrecordidParseRet.string)) {
                if (formColumns_arr) {
                    if (formColumns_arr.indexOf(keyrecordid) != -1) {
                        parentMidData.useColumns_map[keyrecordid] = 1;
                        setkeyrecordidStateTiem = {
                            name: 'relrecordid',
                            useColumn: { name: keyrecordid },
                        };
                    }
                }
                if (setkeyrecordidStateTiem == null) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        '关联记录代码设置有误']);
                    return false;
                }
            }
        }

        var attachmentid = theKernel.getAttribute(AttrNames.AttachmentID);
        var attachmentidParseRet = parseObj_CtlPropJsBind(attachmentid, project.scriptMaster);
        var setattachmentidStateTiem = null;
        if (attachmentidParseRet.isScript) {
            if (this.compileScriptAttribute(attachmentidParseRet, theKernel, 'defattachmentID', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(attachmentidParseRet.string)) {
                if (formColumns_arr) {
                    if (formColumns_arr.indexOf(attachmentid) != -1) {
                        parentMidData.useColumns_map[attachmentid] = 1;
                        setattachmentidStateTiem = {
                            name: 'defattachmentID',
                            useColumn: { name: attachmentid },
                        };
                    }
                }
                if (setattachmentidStateTiem == null) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        '附件记录代码设置有误']);
                    return false;
                }
                else if (setkeyrecordidStateTiem != null || keyrecordidParseRet.isScript) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        '关联记录代码和附件记录代码不可同时设置']);
                    return false;
                }
            }
        }

        var fileIdentity = theKernel.getAttribute(AttrNames.FileIdentity);
        var fileIdentityParseRet = parseObj_CtlPropJsBind(fileIdentity, project.scriptMaster);
        var setfileIdentityStateItem = null;
        if (fileIdentityParseRet.isScript) {
            if (this.compileScriptAttribute(fileIdentityParseRet, theKernel, 'fileIdentity', AttrNames.FileIdentity, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(fileIdentityParseRet.string)) {
                if (formColumns_arr) {
                    if (formColumns_arr.indexOf(fileIdentity) != -1) {
                        parentMidData.useColumns_map[fileIdentity] = 1;
                        setfileIdentityStateItem = {
                            name: 'fileIdentity',
                            useColumn: { name: fileIdentity },
                        };
                    }
                }
            }
        }

        if(fileIdentityParseRet.isScript || setfileIdentityStateItem != null){
            if(!(setkeyrecordidStateTiem == null && !keyrecordidParseRet.isScript && setattachmentidStateTiem == null && !attachmentidParseRet.isScript)){
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '设置了[文件记录标识]后不可再设置[附件记录代码]或[关联记录代码]']);
                return false;
            }
            ctlTag.setAttr('mode', singleQuotesStr('direct'));
        }
        else{
            if (setkeyrecordidStateTiem == null && !keyrecordidParseRet.isScript && setattachmentidStateTiem == null && !attachmentidParseRet.isScript) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '关联记录代码和附件记录代码必须设置一项']);
                return false;
            }
    
            if (setattachmentidStateTiem == null && !attachmentidParseRet.isScript && fileFlowItem == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '不设置附件记录代码的情况下必须选择文件流程']);
                return false;
            }
        }

        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
        }
        if (setkeyrecordidStateTiem) {
            kernelMidData.needSetStates_arr.push(setkeyrecordidStateTiem);
        }
        if (setattachmentidStateTiem) {
            kernelMidData.needSetStates_arr.push(setattachmentidStateTiem);
        }
        if (setfileIdentityStateItem) {
            kernelMidData.needSetStates_arr.push(setfileIdentityStateItem);
        }

        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileValidCheckerAttribute(theKernel) == false) { return false; }
        var onUploadCompleteFunName = theKernel.id + '_' + AttrNames.Event.OnUploadComplete;
        var onUploadCompleteBp = project.scriptMaster.getBPByName(onUploadCompleteFunName);
        if (onUploadCompleteBp != null) {
            var compileRet = this.compileScriptBlueprint(onUploadCompleteBp, { muteMode: true, fetchKey: "'fileuploaded' + fileID" });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr('onuploadcomplete', bigbracketStr(onUploadCompleteFunName));
        }

        renderBlock.pushChild(ctlTag);
    }

    compileDropdownKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;
        var clientSide = this.clientSide;
        var serverSide = this.serverSide;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_DropDown', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        var thisfullpath = makeStr_DotProp(parentPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var textValueType = theKernel.getAttribute(AttrNames.ValueType);
        if (textValueType != ValueType.String) {
            ctlTag.setAttr('textType', textValueType);
        }
        var hisKey = theKernel.getAttribute(AttrNames.HisKey);
        if (!IsEmptyString(hisKey)) {
            ctlTag.setAttr('recentCookieKey', hisKey);
        }
        var starSelectable = theKernel.getAttribute(AttrNames.StarSelectable);
        renderBlock.pushChild(ctlTag);
        var ismultiselect = theKernel.getAttribute(AttrNames.MultiSelect);
        if (ismultiselect) {
            ctlTag.setAttr('multiselect', '{true}');
        }
        var stableData = theKernel.getAttribute(AttrNames.StableData);
        if (stableData) {
            ctlTag.setAttr('pullOnce', '{true}');
        }
        var nullable = theKernel.getAttribute(AttrNames.Nullable);
        if (nullable) {
            ctlTag.setAttr('nullable', '{true}');
        }
        if (!theKernel.getAttribute(AttrNames.Growable)) {
            ctlTag.setAttr('growable', '{false}');
        }
        if (theKernel.getAttribute('poppanelminwidth') > 100) {
            ctlTag.setAttr('poppanelminwidth', theKernel.getAttribute('poppanelminwidth'));
        }
        var appandColumns_arr = [];
        var appandColAttrs_arr = theKernel.getAttrArrayList(AttrNames.AppandColumn);
        var canuseColumns = theKernel.getCanuseColumns();
        appandColAttrs_arr.forEach((attr, attrIndex) => {
            var attrValue = theKernel.getAttribute(attr.name);
            if (attrValue != null && !IsEmptyString(attrValue.name)) {
                if (canuseColumns.indexOf(attrValue.name) != -1) {
                    var funName = theKernel.id + '_' + attr.name;
                    var jsBP = project.scriptMaster.getBPByName(funName);
                    appandColumns_arr.push({
                        name: attrValue.name,
                        jsBP: jsBP,
                    });
                }
                else {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '附加数据列' + attrIndex + '不在数据源中']);
                    return false;
                }
            }
        });
        if (appandColumns_arr.length > 0) {
            ctlTag.setAttr('dataCols', singleQuotesStr(appandColumns_arr.map(item => { return item.name; }).join(',')));
        }
        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
        if (this.compileValidCheckerAttribute(theKernel) == false) { return false; }
        if (this.compileOnChangedEventBlueprint(theKernel, ctlTag) == false) { return false; }

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        var defaultCompileRet;
        if (defaultValParseRet.isScript) {
            defaultCompileRet = this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
            if (defaultCompileRet == false) {
                return false;
            }
        }
        else {
            if (IsEmptyString(defaultValParseRet.string)) {
                if (starSelectable) {
                    //defaultValParseRet.string = '*';    // 可选*，但默认值未设置，自动给个*
                }
            }
            else {
                if (defaultValParseRet.string == '*' && !starSelectable) {
                    starSelectable = true;  // 给了个*默认值，自动开启可选*
                }
            }
        }

        var starValue = theKernel.getAttribute('starvalue');
        if (starSelectable) {
            ctlTag.setAttr('starSelectable', '{true}');
            if (starValue.length > 0 && starValue != '*') {
                ctlTag.setAttr('starval', starValue);
            }
            else {
                starValue = '*';
            }
        }

        var useDS = theKernel.getAttribute(AttrNames.DataSource);
        if (useDS == null) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '需要数据源']);
            return false;
        }
        var canUseColumns_arr = theKernel.getCanuseColumns();
        var fromTextfield = theKernel.getAttribute(AttrNames.FromTextField);
        var fromValuefield = theKernel.getAttribute(AttrNames.FromValueField);
        var textField = theKernel.getAttribute(AttrNames.TextField);
        var valueField = theKernel.getAttribute(AttrNames.ValueField);
        var hadValueField = !IsEmptyString(fromValuefield);

        var inputable = theKernel.getAttribute(AttrNames.Editeable);
        if (inputable) {
            ctlTag.setAttr('editable', '{true}');
            if (hadValueField) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '接受输入的下拉框不可再设定绑定字段']);
                return false;
            }
        }
        if (!useDS.containColumn(fromTextfield)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '来源文本字段设置错误']);
            return false;
        }
        if (hadValueField && !useDS.containColumn(fromValuefield)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '来源码值字段设置错误']);
            return false;
        }
        if (IsEmptyString(textField)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '未设置显示字段']);
            return false;
        }
        if (hadValueField && IsEmptyString(valueField)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '未设置码值字段']);
            return false;
        }
        if (!hadValueField && !IsEmptyString(valueField)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '码值字段设置错误']);
            return false;
        }

        var dataGroupAttr_arr = theKernel.getAttrArrayList('datagroup');
        var groupCols_arr = [];
        if (dataGroupAttr_arr.length > 0) {
            for (var agai in dataGroupAttr_arr) {
                var atrrItem = dataGroupAttr_arr[agai];
                var colName = theKernel[atrrItem.name];
                if (IsEmptyString(colName)) {
                    continue;
                }
                if (groupCols_arr.indexOf(colName) != -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '重复设置分层列:' + colName]);
                    return false;
                }
                groupCols_arr.push(colName);
                if (colName == fromValuefield || colName == fromTextfield || canUseColumns_arr.indexOf(colName) == -1) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '错误的分层列:' + colName]);
                    return false;
                }
            }
            if (groupCols_arr.length > 0) {
                ctlTag.setAttr('groupAttr', groupCols_arr.join(','));
            }
        }

        var belongPageKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongUserControl = null;
        if (belongPageKernel == null) {
            belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        }

        theKernel.autoSetCusDataSource(groupCols_arr);
        var autoClearValue = theKernel.getAttribute(AttrNames.AutoClearValue);
        var stableData = theKernel.getAttribute(AttrNames.StableData);
        var self = this;
        var compileCDSRet = this.compileCustomDataSourceAttribute(theKernel, 'options_arr', {
            useCtlProp: (useCtlData, propApiitem) => {
                if (autoClearValue) {
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'text', useCtlData.kernel, propApiitem.relyStateName, {
                        value: 'null',
                    });
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'value', useCtlData.kernel, propApiitem.relyStateName, {
                        value: 'null',
                    });
                }
                if (stableData) {
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'options_arr', useCtlData.kernel, propApiitem.relyStateName, {
                        value: 'null',
                    });
                }
            },
            useFormColumn: (useFormData) => {
                if (autoClearValue) {
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'text', useFormData.formKernel, useFormData.formKernel.getSelectedValueStateName(), {
                        value: 'null',
                    });
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'value', useFormData.formKernel, useFormData.formKernel.getSelectedValueStateName(), {
                        value: 'null',
                    });
                }
                if (stableData) {
                    self.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'options_arr', useFormData.formKernel, useFormData.formKernel.getSelectedValueStateName(), {
                        value: 'null',
                    });
                }
            },
            invalidProcess: (validErrStateVar, checkVarValidStr, validBlock, validKernelBlock) => {
                var dispatchErrLine = 'store.dispatch(makeAction_setManyStateByPath(' + validErrStateVar.name + ',""));';
                dispatchErrLine += "SendToast('条件不足', EToastType.Warning);";
                if (checkVarValidStr.length > 0) {
                    var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                    validBlock.pushChild(checkVarValidIf);
                    checkVarValidIf.trueBlock.pushLine(dispatchErrLine);
                }
                validBlock.pushChild(validKernelBlock);
                validKernelBlock.pushLine('if(hadValidErr){' + dispatchErrLine + ' return false;}');
            }
        });
        ctlTag.setAttr('pullDataSource', '{' + compileCDSRet.pullFun.name + '}');
        ctlTag.setAttr('textAttrName', fromTextfield);
        ctlTag.setAttr('valueAttrName', fromValuefield);

        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '请不要为下拉框显示字段设置脚本']);
            return false;
        }
        else {
            var reactParentKernel = theKernel.getReactParentKernel(true);
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            kernelMidData.hadValueField = hadValueField;
            var setTextStateItem = null;
            var setValueStateItem = null;

            var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }

            var alterValue = null;
            var hadDefaultStr = false;;
            if (!defaultValParseRet.isScript) {
                hadDefaultStr = !IsEmptyString(defaultValParseRet.string);
                if (hadDefaultStr) {
                    alterValue = singleQuotesStr(defaultValParseRet.string);
                }
            }

            var belongFormKernel;
            var formColumns_arr;
            if (reactParentKernel.type == M_FormKernel_Type) {
                belongFormKernel = reactParentKernel;
                formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formColumns_arr.indexOf(textField) != -1) {
                    parentMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setTextStateItem = {
                        name: 'text',
                        useColumn: { name: textField },
                    };
                }

                if (hadValueField) {
                    if (formColumns_arr.indexOf(valueField) != -1) {
                        parentMidData.useColumns_map[valueField] = 1;
                        kernelMidData.columnName = valueField;
                        setValueStateItem = {
                            name: 'value',
                            useColumn: { name: valueField },
                            alterValue: alterValue,
                        };
                        if (setTextStateItem == null) {
                            setTextStateItem = {
                                name: 'text',
                                setNull: true,
                            };
                        }
                    }
                }
                else if (setTextStateItem) {
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
                        alterValue: alterValue,
                    };
                    setTextStateItem.alterValue = alterValue;
                }
            }

            if (defaultCompileRet && belongFormKernel && belongFormKernel.getInsertSetting()) {
                // 所在gridform有新增行,默认值要绑定到新增行
                defaultCompileRet.setStateItem.bindMode = ScriptBindMode.OnNewRow;
            }

            if (setValueStateItem != null && setTextStateItem == null) {
                logManager.warnEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '下拉框的码值字段能找到匹配但是显示字段找不到匹配']);
                //return false;
            }

            if (setValueStateItem == null && setTextStateItem == null) {
                if (hadValueField) {
                    setTextStateItem = {
                        name: 'text',
                        setNull: true,
                    };
                }
                if (hadDefaultStr) {
                    setValueStateItem = {
                        name: 'value',
                        staticValue: hadDefaultStr ? defaultValParseRet.string : null,
                        setNull: !hadDefaultStr,
                    };
                    if (defaultValParseRet.string == '*') {
                        if (setTextStateItem) {
                            setTextStateItem.setNull = false;
                            setTextStateItem.staticValue = '*';
                        }
                        setValueStateItem.staticValue = starValue;
                    }
                }
            }

            if (setTextStateItem != null) {
                kernelMidData.needSetStates_arr.push(setTextStateItem);
            }
            if (setValueStateItem != null) {
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
            if (appandColumns_arr.length > 0) {
                for (var apci in appandColumns_arr) {
                    var apc = appandColumns_arr[apci];
                    if (apc.jsBP) {
                        if (this.compileScriptAttribute({ jsBp: apc.jsBP }, theKernel, apc.name, apc.name, { autoSetFetchState: true }) == false) {
                            return false;
                        }
                    }
                    else {
                        if (belongFormKernel && formColumns_arr.indexOf(apc.name) != -1) {
                            parentMidData.useColumns_map[apc.name] = 1;
                            kernelMidData.needSetStates_arr.push({
                                name: apc.name,
                                useColumn: { name: apc.name },
                            });
                        }
                        else {
                            kernelMidData.needSetStates_arr.push({
                                name: apc.name,
                                setNull: true,
                            });
                        }
                    }
                }
            }
        }
    }

    compileFilePreviewerKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_FilePreview', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);

        if(layoutConfig.hadSizeSetting()){
            ctlTag.setAttr('fixedsize', singleQuotesStr(0));
        }

        if (theKernel.getAttribute('deletable')) {
            ctlTag.setAttr('canDelte', '{true}');
        }
        if (theKernel.getAttribute('showtitle') == false) {
            ctlTag.setAttr('hidetitle', '{true}');
        }


        renderBlock.pushChild(ctlTag);

        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }

        var formColumns_arr = null;
        if (belongFormKernel) {
            formColumns_arr = belongFormKernel.getCanuseColumns();
        }

        var setFileIDStateItem = null;
        var fileIDField = theKernel.getAttribute('fileID');
        var fileIDFieldParseRet = parseObj_CtlPropJsBind(fileIDField, project.scriptMaster);
        if (fileIDFieldParseRet.isScript) {
            if (this.compileScriptAttribute(fileIDFieldParseRet, theKernel, 'fileID', 'fileID', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (formColumns_arr && formColumns_arr.indexOf(fileIDField) != -1) {
                parentMidData.useColumns_map[fileIDField] = 1;
                kernelMidData.columnName = fileIDField;
                setFileIDStateItem = {
                    name: 'fileID',
                    useColumn: { name: fileIDField },
                };
            }
            if (setFileIDStateItem == null) {
                setFileIDStateItem = {
                    name: 'fileID',
                    staticValue: null,
                    setNull: true,
                };
            }
            if (setFileIDStateItem != null) {
                kernelMidData.needSetStates_arr.push(setFileIDStateItem);
            }
        }

        var setAttachmentIDStateItem = null;
        var attachmentIDField = theKernel.getAttribute('attachmentID');
        var attachmentIDFieldParseRet = parseObj_CtlPropJsBind(attachmentIDField, project.scriptMaster);
        if (attachmentIDFieldParseRet.isScript) {
            if (this.compileScriptAttribute(attachmentIDFieldParseRet, theKernel, 'attachmentID', 'attachmentID', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (formColumns_arr && formColumns_arr.indexOf(attachmentIDField) != -1) {
                parentMidData.useColumns_map[attachmentIDField] = 1;
                kernelMidData.columnName = attachmentIDField;
                setAttachmentIDStateItem = {
                    name: 'attachmentID',
                    useColumn: { name: attachmentIDField },
                };
            }
            if (setAttachmentIDStateItem == null) {
                setAttachmentIDStateItem = {
                    name: 'attachmentID',
                    staticValue: null,
                    setNull: true,
                };
            }
            if (setAttachmentIDStateItem != null) {
                kernelMidData.needSetStates_arr.push(setAttachmentIDStateItem);
            }
        }

        var setFileTypeStateItem = null;
        var fileTypeField = theKernel.getAttribute('fileType');
        var fileTypeieldParseRet = parseObj_CtlPropJsBind(attachmentIDField, project.scriptMaster);
        if (fileTypeieldParseRet.isScript) {
            if (this.compileScriptAttribute(fileTypeieldParseRet, theKernel, 'fileType', 'fileType', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (formColumns_arr && formColumns_arr.indexOf(fileTypeField) != -1) {
                parentMidData.useColumns_map[fileTypeField] = 1;
                kernelMidData.columnName = fileTypeField;
                setFileTypeStateItem = {
                    name: 'fileType',
                    useColumn: { name: fileTypeField },
                };
            }
            if (setFileTypeStateItem == null) {
                setFileTypeStateItem = {
                    name: 'fileType',
                    staticValue: null,
                    setNull: true,
                };
            }
            if (setFileTypeStateItem != null) {
                kernelMidData.needSetStates_arr.push(setFileTypeStateItem);
            }
        }

        var setFilePathStateItem = null;
        var filePathField = theKernel.getAttribute('filePath');
        var filePathieldParseRet = parseObj_CtlPropJsBind(attachmentIDField, project.scriptMaster);
        if (fileTypeieldParseRet.isScript) {
            if (this.compileScriptAttribute(filePathieldParseRet, theKernel, 'filePath', 'filePath', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (formColumns_arr && formColumns_arr.indexOf(filePathField) != -1) {
                parentMidData.useColumns_map[filePathField] = 1;
                kernelMidData.columnName = filePathField;
                setFilePathStateItem = {
                    name: 'filePath',
                    useColumn: { name: filePathField },
                };
            }
            if (setFilePathStateItem == null) {
                setFilePathStateItem = {
                    name: 'filePath',
                    staticValue: null,
                    setNull: true,
                };
            }
            if (setFilePathStateItem != null) {
                kernelMidData.needSetStates_arr.push(setFilePathStateItem);
            }
        }

        var setFileNameStateItem = null;
        var fileNameField = theKernel.getAttribute('fileName');
        var fileNameieldParseRet = parseObj_CtlPropJsBind(attachmentIDField, project.scriptMaster);
        if (fileTypeieldParseRet.isScript) {
            if (this.compileScriptAttribute(fileNameieldParseRet, theKernel, 'fileName', 'fileName', { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (formColumns_arr && formColumns_arr.indexOf(fileNameField) != -1) {
                parentMidData.useColumns_map[fileNameField] = 1;
                kernelMidData.columnName = fileNameField;
                setFileNameStateItem = {
                    name: 'fileName',
                    useColumn: { name: fileNameField },
                };
            }
            if (setFileNameStateItem == null) {
                setFileNameStateItem = {
                    name: 'fileName',
                    staticValue: null,
                    setNull: true,
                };
            }
            if (setFileNameStateItem != null) {
                kernelMidData.needSetStates_arr.push(setFileNameStateItem);
            }
        }
    }

    compilePopperButtonKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        var clientSide = this.clientSide;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_PopperBtn', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);
        var titleElemStr = 'null';
        var iconType = theKernel.getAttribute(AttrNames.IconType);
        if (!IsEmptyString(iconType)) {
            titleElemStr = "<i className='fa fa-" + iconType + "' />";
            ctlTag.setAttr('labelelem', bigbracketStr(titleElemStr));
        }
        ctlTag.setAttr('anchor', theKernel.getAttribute('anchor'));
        if (!theKernel.getAttribute('hideclosebtn')) {
            ctlTag.setAttr('hideCloseBtn', bigbracketStr('true'));
        }
        ctlTag.setAttr('strategy', theKernel.getAttribute('strategy'));

        renderBlock.pushChild(ctlTag);

        var panelLayoutConfig = theKernel.getLayoutConfig('panel' + AttrNames.LayoutNames.APDClass, 'panel' + AttrNames.LayoutNames.StyleAttr);
        if (!IsEmptyString(panelLayoutConfig.getClassName())) {
            ctlTag.setAttr('popperclassname', panelLayoutConfig.getClassName());
        }
        var popperStyleID = theKernel.id + '_popperstyle';
        if (clientSide.addStyleObject(popperStyleID, panelLayoutConfig.style)) {
            ctlTag.setAttr('popperstyle', bigbracketStr(popperStyleID));
        }

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var setTitleStateItem = null;
        var title = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(title, project.scriptMaster);
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (belongFormKernel != null && (!belongFormKernel.isGridForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    var formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(title) != -1) {
                        parentMidData.useColumns_map[title] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: title },
                        };
                    }
                }
                if (setTitleStateItem == null) {
                    ctlTag.setAttr('title', title);
                }
            }
        }

        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        var childBlock = new FormatFileBlock('child');
        ctlTag.pushChild(childBlock);
        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            if (this.compileKernel(childKernel, childBlock, renderFun) == false) {
                return false;
            }
        }
    }

    compileFrameSetKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        var clientSide = this.clientSide;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_FrameSet', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);
        renderBlock.pushChild(ctlTag);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
    }

    compileIFrameKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        var clientSide = this.clientSide;

        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-column');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_IFrame', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        this.modifyControlTag(theKernel, ctlTag);
        var projCode = theKernel.getAttribute(AttrNames.ProjectCode);
        var projItem = ProjectRecords_arr.find(item => { return item.value == projCode; });
        if (projItem) {
            ctlTag.setAttr('proj', projItem.英文名称);
        }
        var flowCode = theKernel.getAttribute(AttrNames.FlowStepCode);
        if (!IsEmptyString(flowCode)) {
            ctlTag.setAttr('flowCode', flowCode);
        }
        var pageType = theKernel.getAttribute('pageType');
        if (!IsEmptyString(pageType)) {
            ctlTag.setAttr('pageType', pageType);
        }

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        var setFlowDataStateItem = null;
        var flowData = theKernel.getAttribute(AttrNames.FlowStepData);
        var flowDataParseRet = parseObj_CtlPropJsBind(flowData, project.scriptMaster);
        if (flowDataParseRet.isScript) {
            if (this.compileScriptAttribute(flowDataParseRet, theKernel, 'flowData', AttrNames.FlowStepData, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(flowDataParseRet.string)) {
                if (belongFormKernel != null && (!belongFormKernel.isGridForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    var formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(flowData) != -1) {
                        parentMidData.useColumns_map[flowData] = 1;
                        setFlowDataStateItem = {
                            name: 'flowData',
                            useColumn: { name: flowData },
                        };
                    }
                }
                if (setFlowDataStateItem == null) {
                    ctlTag.setAttr('flowData', flowData);
                }
            }
        }

        if (setFlowDataStateItem) {
            kernelMidData.needSetStates_arr.push(setFlowDataStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        var onreceiveFunName = theKernel.id + '_' + AttrNames.Event.OnReceiveMsg;
        var onReceiveBp = project.scriptMaster.getBPByName(onreceiveFunName);
        if (onReceiveBp != null) {
            var compileRet = this.compileScriptBlueprint(onReceiveBp, { haveDoneTip: false, nomsgbox: true });
            if (compileRet == false) {
                return false;
            }
            ctlTag.setAttr('onMessageFun', bigbracketStr(onreceiveFunName));
        }

        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);
        renderBlock.pushChild(ctlTag);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
    }

    compileChartKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        var clientSide = this.clientSide;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Chart', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        this.modifyControlTag(theKernel, ctlTag);
        var chartType = theKernel.getAttribute(AttrNames.ChartType);
        ctlTag.setAttr('type', chartType);
        ctlTag.setAttr('hovermode', theKernel.getAttribute('hovermode'));
        ctlTag.setAttr('intersect', '{' + theKernel.getAttribute('intersect') + '}');

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }

        var belongPageKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongUserControl = null;
        if (belongPageKernel == null) {
            belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        }
        var belongUserCtlMidData = belongUserControl ? this.projectCompiler.getMidData(belongUserControl.id) : null;

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        var belongFormMidData = belongFormKernel ? this.projectCompiler.getMidData(belongFormKernel.id) : null;

        var chartTitle = theKernel.getAttribute(AttrNames.Title);
        var titleParseRet = parseObj_CtlPropJsBind(chartTitle, project.scriptMaster);
        var setTitleStateItem = null;
        if (titleParseRet.isScript) {
            if (this.compileScriptAttribute(titleParseRet, theKernel, 'title', AttrNames.Title, { autoSetFetchState: true }) == false) {
                return false;
            }
        }
        else {
            if (!IsEmptyString(titleParseRet.string)) {
                if (belongFormKernel != null && (!belongFormKernel.isGridForm() || belongFormKernel.isKernelInRow(theKernel))) {
                    var formColumns_arr = belongFormKernel.getCanuseColumns();
                    if (formColumns_arr.indexOf(chartTitle) != -1) {
                        parentMidData.useColumns_map[chartTitle] = 1;
                        setTitleStateItem = {
                            name: 'title',
                            useColumn: { name: chartTitle },
                        };
                    }
                }
                if (setTitleStateItem == null) {
                    ctlTag.setAttr('title', chartTitle);
                }
            }
        }

        if (setTitleStateItem) {
            kernelMidData.needSetStates_arr.push(setTitleStateItem);
            if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                parentMidData.needSetKernels_arr.push(theKernel);
            }
        }

        var pureFullParentPath = this.getKernelFullParentPath(theKernel);
        var fullParentPath = pureFullParentPath;
        if (belongUserControl) {
            if (IsEmptyString(fullParentPath)) {
                fullParentPath = belongUserControl.id + '_path';
            }
            else {
                fullParentPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + fullParentPath);
            }
        }
        else {
            fullParentPath = singleQuotesStr(fullParentPath);
        }
        var self = this;
        var needCallPullFun = true;
        var autoPull = theKernel.getAttribute(AttrNames.AutoPull);
        var compileCDSRet = this.compileCustomDataSourceAttribute(theKernel, 'records_arr', {
            useCtlProp: (useCtlData, propApiitem, pullFun) => {
                if (autoPull) {
                    var useFullParentPath = fullParentPath;
                    if (useCtlData.kernel.type == UserControlKernel_Type && useCtlData.kernel.isTemplate()) {
                        if (IsEmptyString(pureFullParentPath)) {
                            useFullParentPath = 'this.props.fullPath';
                        }
                        else {
                            useFullParentPath = 'this.props.fullPath + ' + singleQuotesStr('.' + pureFullParentPath);
                        }
                    }
                    this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, pullFun.name, useCtlData.kernel, propApiitem.relyStateName, [useFullParentPath]);
                }
                needCallPullFun = false;
            },
            useFormColumn: (useFormData, pullFun) => {
                var useFormMidData = this.projectCompiler.getMidData(useFormData.formKernel.id);
                if (useFormMidData.isPageForm) {
                    if (autoPull) {
                        useFormMidData.bindFun.bindEndBlock.pushLine(makeStr_callFun(pullFun.name, [fullParentPath], ';'));
                    }
                }
                needCallPullFun = false;
            },
            invalidProcess: (validErrStateVar, checkVarValidStr, validBlock, validKernelBlock) => {
                var dispatchErrLine = 'store.dispatch(makeAction_setManyStateByPath(' + validErrStateVar.name + ',""));';
                if (checkVarValidStr.length > 0) {
                    var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                    validBlock.pushChild(checkVarValidIf);
                    checkVarValidIf.trueBlock.pushLine(dispatchErrLine);
                }
                validBlock.pushChild(validKernelBlock);
                validKernelBlock.pushLine('if(hadValidErr){' + dispatchErrLine + ' return false;}');
            }
        });
        var pullFun = compileCDSRet.pullFun;
        ctlTag.setAttr('pullDataSource', '{' + compileCDSRet.pullFun.name + '}');
        if (needCallPullFun && autoPull) {
            if (belongFormMidData != null) {
                if (belongFormMidData.useDS) {
                    belongFormMidData.pullFun.beforeRetBlock.pushLine(makeStr_callFun(pullFun.name, [fullParentPath]));
                }
                else {
                    belongFormMidData.bindFun.beforeRetBlock.pushLine(makeStr_callFun(pullFun.name, [fullParentPath]));
                }
            }
            else if (belongUserControl != null) {
                // 在自订控件里
                var templateReactClass = this.clientSide.getReactClass(belongUserControl.getReactClassName());
                templateReactClass.initFun.pushLine(makeStr_callFun(pullFun.name, ['ctlFullPath']));
            }
            else {
                var pageInitFun = clientSide.scope.getFunction(makeFName_initPage(belongPageKernel));
                var timeoutBlock = pageInitFun.getChild('timeout');
                timeoutBlock.pushLine(makeStr_callFun(pullFun.name, [fullParentPath]) + ';');
            }
        }

        var genDataFunName = theKernel.id + '_' + AttrNames.Function.GenarateChartData;
        var genDataBp = project.scriptMaster.getBPByName(genDataFunName);
        if (genDataBp == null) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '必须设置生成数据方法']);
            return false;
        }
        var compileRet = this.compileScriptBlueprint(genDataBp);
        if (compileRet == false) {
            return false;
        }

        var recordsArraychangedFunName = theKernel.id + '_' + VarNames.Records_arr + '_changed';
        var recordsArraychangedFun = clientSide.scope.getFunction(recordsArraychangedFunName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowKeyInfo_map']);
        recordsArraychangedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        recordsArraychangedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
        recordsArraychangedFun.scope.getVar('labels_arr', true, '[]');
        recordsArraychangedFun.scope.getVar('datasets_arr', true, '[]');
        recordsArraychangedFun.scope.getVar('ctlpath', true, "getParentPathByKey(path,'" + theKernel.id + "')");
        recordsArraychangedFun.pushLine(makeStr_callFun(compileRet.name, [VarNames.State, 'newValue', 'labels_arr', 'datasets_arr'], ';'));
        recordsArraychangedFun.pushLine('datasets_arr.forEach(dataset=>{', 1);
        recordsArraychangedFun.pushLine('if(dataset.backgroundColor.length == 1){dataset.backgroundColor = dataset.backgroundColor[0];}', -1);
        recordsArraychangedFun.pushLine('});');
        recordsArraychangedFun.pushLine(VarNames.NeedSetState + "[ctlpath+'.data']={labels: labels_arr,datasets: datasets_arr};");

        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        if (belongUserControl) {
            belongUserCtlMidData.needSetStateChangedActs_arr.push(
                {
                    propName: makeStr_DotProp(thisFullPath, VarNames.Records_arr),
                    funName: recordsArraychangedFunName + '.bind(window)',
                }
            );
        }
        else {
            clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, VarNames.Records_arr))] = recordsArraychangedFunName + '.bind(window)';
        }
        ctlTag.setAttr('parentPath', parentPath);
        renderBlock.pushChild(ctlTag);

        if (this.compileIsdisplayAttribute(theKernel, ctlTag) == false) { return false; }
    }

    compileCustomDataSourceAttribute(theKernel, optionStateName, config) {
        var project = this.project;
        var logManager = project.logManager;
        var clientSide = this.clientSide;
        var serverSide = this.serverSide;

        var belongPageKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongUserControl = null;
        if (belongPageKernel == null) {
            belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        }

        var cusDS_bp = theKernel.getAttribute(AttrNames.CustomDataSource);
        logManager.log("编译[" + cusDS_bp.name + ']');
        var bpCompileHelper = new SqlNode_CompileHelper(logManager, null);
        bpCompileHelper.clickLogBadgeItemHandler = this.projectCompiler.clickSqlCompilerLogBadgeItemHandler;
        var compileRet = cusDS_bp.compile(bpCompileHelper);
        if (compileRet == false) {
            return false;
        }

        // create pull fun
        var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true, [VarNames.ParentPath]);
        pullFun.pushLine('var bundle = {};');
        pullFun.scope.getVar('useState', true, 'store.getState();');
        if (belongUserControl) {
            pullFun.scope.getVar(belongUserControl.id + '_path', true, 'getBelongUserCtlPath(parentPath)');
            pullFun.scope.getVar(belongUserControl.id + '_state', true, 'getStateByPath(useState,' + belongUserControl.id + '_path,{});');
        }
        pullFun.scope.getVar(VarNames.RowKeyInfo_map, true, 'getRowKeyMapFromPath(' + VarNames.ParentPath + ')');
        var validBlock = new FormatFileBlock('valid');
        pullFun.pushChild(validBlock);
        var declareVars = {}
        var initbundleBlock = new FormatFileBlock('initbundle');
        pullFun.pushChild(initbundleBlock);
        pullFun.initbundleBlock = initbundleBlock;
        pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), VarNames.ParentPath, singleQuotesStr(theKernel.id), singleQuotesStr(optionStateName), { bundle: 'bundle' }, false));

        var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req', 'res']);
        serverSide.initProcessFun(serverPullFun, theKernel, true);
        serverSide.processesMapVarInitVal[serverPullFun.name] = serverPullFun.name;
        var bodyCheckblock = new FormatFileBlock('bodyCheckblock');
        serverPullFun.pushChild(bodyCheckblock);
        serverPullFun.pushLine("var params_arr = null;");
        var paramsetblock = new FormatFileBlock('paramset');
        serverPullFun.pushChild(paramsetblock);
        serverPullFun.pushLine('var sql = "' + compileRet.sql + '";');
        serverPullFun.pushLine("if (sql == null || sql.length == 0) {return serverhelper.createErrorRet('生成sql失败');}");
        serverPullFun.pushLine("var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);");
        serverPullFun.pushLine("return rcdRlt.recordset;");

        var needSetParams_arr = [];
        var needCheckVars_arr = [];
        var needCheckProps_map = {};
        var propApiitem;
        var usectlid;
        var useCtlData;
        var propName;
        var varName;
        var ctlStateVarName;
        var ctlParentStateVarName;
        var initValue;
        var nullableChecker;
        var needPostValid;
        var useStateVarName = 'useState';
        var parentLabledCtl;
        var initPath = '';
        var bundleParam = null;
        var hadNeedWatchParam = false;
        var pullFun = pullFun;
        var colName;
        if (!IsEmptyObject(bpCompileHelper.useGlobalControls_map)) {
            hadNeedWatchParam = true;
            for (usectlid in bpCompileHelper.useGlobalControls_map) {
                useCtlData = bpCompileHelper.useGlobalControls_map[usectlid];
                ctlStateVarName = usectlid + '_state';
                initPath = singleQuotesStr(useCtlData.kernel.getStatePath());
                if (useCtlData.kernel.type == UserControlKernel_Type) {
                    if (belongUserControl) {
                        initPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + useCtlData.kernel.getStatePath());
                    }
                    pullFun.scope.getVar(useCtlData.kernel.id + '_path', true, initPath);
                }
                if (belongUserControl) {
                    initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                }
                else {
                    initValue = makeStr_getStateByPath(useStateVarName, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                }
                pullFun.scope.getVar(ctlStateVarName, true, initValue);

                ctlParentStateVarName = null;
                parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                if (parentLabledCtl) {
                    ctlParentStateVarName = parentLabledCtl.id + '_state';
                    initValue = makeStr_getStateByPath(useStateVarName, singleQuotesStr(parentLabledCtl.getStatePath()), '{}');
                    pullFun.scope.getVar(ctlParentStateVarName, true, initValue);
                }

                initValue = makeStr_getStateByPath(useStateVarName, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                pullFun.scope.getVar(ctlStateVarName, true, initValue);

                for (propName in useCtlData.useprops_map) {
                    propApiitem = useCtlData.useprops_map[propName];
                    varName = usectlid + '_' + propApiitem.stateName;
                    initValue = ctlStateVarName + '.' + propApiitem.stateName;
                    if (propApiitem.getInitValueFun) {
                        initValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                    }
                    pullFun.scope.getVar(varName, true, initValue);
                    needPostValid = true;
                    if (propApiitem.needValid) {
                        if (needCheckProps_map[varName] == null) {
                            needCheckProps_map[varName] = 1;
                            nullableChecker = ctlParentStateVarName ? parentLabledCtl : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                            needPostValid = (nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : true) != true;
                            needCheckVars_arr.push({
                                kernel: useCtlData.kernel,
                                nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                visibleStateVar: ctlStateVarName,
                                ctlStateVar: ctlStateVarName,
                                valueVar: varName,
                                propApi: propApiitem
                            });
                        }
                    }
                    else {
                        if (useCtlData.kernel.type == UserControlKernel_Type) {
                            if (useCtlData.kernel.isTemplate()) {
                                needPostValid = false;  // 模板自订控件里面的方法一律不做属性验证
                            }
                            else {
                                var templateKernelMidData = this.projectCompiler.getMidData(useCtlData.kernel.getTemplateKernel().id);
                                var propChecker = templateKernelMidData.propChecker_map[propApiitem.stateName];
                                if (propChecker) {
                                    if (needCheckProps_map[useCtlData.kernel.id + propChecker] == null) {
                                        needCheckProps_map[useCtlData.kernel.id + propChecker] = 1;
                                        needCheckVars_arr.push({
                                            callFun: makeStr_callFun(propChecker, [useStateVarName, usectlid + '_path', 'null']),
                                        });
                                    }
                                }
                            }
                        }
                    }
                    if (config.useCtlProp) {
                        config.useCtlProp(useCtlData, propApiitem, pullFun);
                    }
                    needSetParams_arr.push({ bundleName: varName, clientValue: varName, needPostValid: needPostValid });
                }
            }
        }

        if (!IsEmptyObject(bpCompileHelper.useForm_map)) {
            for (var formId in bpCompileHelper.useForm_map) {
                var useFormData = bpCompileHelper.useForm_map[formId];
                var useFormMidData = this.projectCompiler.getMidData(useFormData.formKernel.id);
                var isGridForm = useFormData.formKernel.isGridForm();
                var isListForm = useFormData.formKernel.isListForm();
                var formSelectMode = useFormData.formKernel.getAttribute(AttrNames.SelectMode);
                ctlParentStateVarName = null;
                ctlStateVarName = null;

                var formStateVarName = formId + '_state';
                var nowRecordVarName = formId + '_' + VarNames.NowRecord + '';
                var nowRowStateVarName = formId + '_' + VarNames.NowRow + '';
                var formPathVarName = formId + '_path';
                var formRowPathVarName = formId + '_rowpath';
                var formPath = useFormData.formKernel.getStatePath();
                var selectedRowsVarName = formId + '_' + VarNames.SelectedRows_arr;
                var isUseFormCtl = !IsEmptyObject(useFormData.useControls_map);
                var isUseFormColumn = !IsEmptyObject(useFormData.useColumns_map);
                var ctlBelongStateVarName = formStateVarName;

                if (belongUserControl) {
                    formPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + formPath);
                    initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                }
                else {
                    formPath = singleQuotesStr(formPath);
                    initValue = makeStr_getStateByPath(useStateVarName, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                }
                pullFun.scope.getVar(formPathVarName, true, formPath);
                pullFun.scope.getVar(formStateVarName, true, initValue);

                var inGridRow = useFormData.formKernel.isKernelInRow(theKernel);
                if (isUseFormCtl || isUseFormColumn) {
                    hadNeedWatchParam = true;
                    var forUseDS = useFormData.formKernel.getAttribute(AttrNames.DataSource);
                    if (isGridForm || isListForm) {
                        ctlBelongStateVarName = nowRowStateVarName;
                        pullFun.scope.getVar(formRowPathVarName, true);
                        if (isUseFormColumn) {
                            pullFun.scope.getVar(nowRecordVarName, true);
                            pullFun.scope.getVar(nowRowStateVarName, true);
                            needCheckVars_arr.push(nowRecordVarName);
                        }
                        if (isUseFormCtl) {
                            pullFun.scope.getVar(nowRecordVarName, true);
                            pullFun.scope.getVar(nowRowStateVarName, true);
                            needCheckVars_arr.push(nowRowStateVarName);
                        }
                        if (inGridRow) {
                            validBlock.pushLine(makeLine_SetValue(formRowPathVarName, formPathVarName + " + '.row_' + " + VarNames.RowKeyInfo_map + "." + formId));
                            validBlock.pushLine(makeStr_AddAll(nowRowStateVarName, '=', makeStr_getStateByPath(formStateVarName, "'row_' + " + VarNames.RowKeyInfo_map + "." + formId, '{}'), ';'));
                            validBlock.pushLine(nowRecordVarName + '=' + makeStr_callFun('getRecordFromRowKey', [formPathVarName, VarNames.RowKeyInfo_map + "." + formId], ';'));
                        }
                        else {
                            pullFun.scope.getVar(selectedRowsVarName, true, makeStr_callFun('GetFormSelectedRows', [formStateVarName, singleQuotesStr(useFormData.formKernel.getAttribute(AttrNames.KeyColumn))]));
                            validBlock.pushLine(makeStr_AddAll('if(', selectedRowsVarName, '==null || ', selectedRowsVarName, '.length == 0){hadValidErr=true;}'));
                            validBlock.pushLine('else{', 1);
                            if (isUseFormColumn) {
                                validBlock.pushLine(nowRecordVarName + '=' + makeStr_callFun('getRecordFromRowKey', [formPathVarName, selectedRowsVarName + '[0]'], ';'));
                            }
                            if (isUseFormCtl) {
                                validBlock.pushLine(makeLine_SetValue(formRowPathVarName, makeStr_callFun('CombineDotStr', [formPathVarName, selectedRowsVarName + '[0]'])));
                                validBlock.pushLine(makeStr_AddAll(nowRowStateVarName, '=', formStateVarName, "['row_' + ", selectedRowsVarName, '[0]];'));
                            }
                            validBlock.subNextIndent();
                            validBlock.pushLine('}');
                        }
                    }
                    else {
                        if (isUseFormColumn) {
                            initValue = formStateVarName + '.' + VarNames.NowRecord;
                            pullFun.scope.getVar(nowRecordVarName, true, initValue);
                            needCheckVars_arr.push(nowRecordVarName);
                        }
                    }
                }

                if (isUseFormColumn) {
                    for (colName in useFormData.useColumns_map) {
                        needSetParams_arr.push({ bundleName: colName + '_' + useFormData.useDS.code, clientValue: nowRecordVarName + '.' + colName });
                        useFormMidData.useColumns_map[colName] = 1;
                    }
                    if (!isUseFormCtl) {
                        if (config.useFormColumn) {
                            config.useFormColumn(useFormData, pullFun);
                        }
                    }
                }

                var ctlDeclareBlock = new FormatFileBlock('ctlDeclare');
                validBlock.pushChild(ctlDeclareBlock);

                for (usectlid in useFormData.useControls_map) {
                    useCtlData = useFormData.useControls_map[usectlid];
                    if (belongUserControl) {
                        initPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + useCtlData.kernel.getStatePath());
                    }
                    if (useCtlData.kernel.type == UserControlKernel_Type) {
                        ctlDeclareBlock.pushLine(makeLine_DeclareVar(useCtlData.kernel.id + '_path', formRowPathVarName + singleQuotesStr('.' + useCtlData.kernel.getStatePath('', '.', { mapVarName: VarNames.RowKeyInfo_map }, false, useFormData.formKernel)), false));
                    }

                    ctlStateVarName = usectlid + '_state';
                    initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(usectlid), '{}');
                    ctlDeclareBlock.pushLine(makeLine_DeclareVar(ctlStateVarName, initValue, false));
                    ctlParentStateVarName = null;
                    parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                    if (parentLabledCtl) {
                        ctlParentStateVarName = parentLabledCtl.id + '_state';
                        if (declareVars[ctlParentStateVarName] == null) {
                            initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(parentLabledCtl.id), '{}');
                            ctlDeclareBlock.pushLine(makeLine_DeclareVar(ctlParentStateVarName, initValue, false));
                            declareVars[ctlParentStateVarName] = 1;
                        }
                    }

                    for (propName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[propName];
                        varName = useCtlData.kernel.id + '_' + propApiitem.stateName;
                        if (declareVars[varName] == null) {
                            initValue = ctlStateVarName + '.' + propApiitem.stateName;
                            if (propApiitem.getInitValueFun) {
                                initValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                            }
                            ctlDeclareBlock.pushLine(makeLine_DeclareVar(varName, initValue, false));
                            declareVars[varName] = 1;
                        }
                        needPostValid = true;
                        if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                            needCheckProps_map[varName] = 1;
                            nullableChecker = ctlParentStateVarName ? parentLabledCtl : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                            needPostValid = (nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : true) != true;
                            needCheckVars_arr.push({
                                kernel: useCtlData.kernel,
                                nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                visibleStateVar: ctlParentStateVarName == null ? ctlStateVarName : ctlParentStateVarName,
                                ctlStateVar: ctlStateVarName,
                                valueVar: varName,
                                propApi: propApiitem
                            });
                        }
                        else {
                            if (useCtlData.kernel.type == UserControlKernel_Type) {
                                var templateKernelMidData = this.projectCompiler.getMidData(useCtlData.kernel.getTemplateKernel().id);
                                var propChecker = templateKernelMidData.propChecker_map[propApiitem.stateName];
                                if (propChecker) {
                                    if (needCheckProps_map[useCtlData.kernel.id + propChecker] == null) {
                                        needCheckProps_map[useCtlData.kernel.id + propChecker] = 1;
                                        needCheckVars_arr.push({
                                            callFun: makeStr_callFun(propChecker, [useStateVarName, usectlid + '_path', 'null']),
                                        });
                                    }
                                }
                            }
                        }
                        needSetParams_arr.push({ bundleName: varName, clientValue: varName, needPostValid: needPostValid });
                        if (config.useCtlProp) {
                            config.useCtlProp(useCtlData, propApiitem, pullFun);
                        }
                    }
                }
            }
        }
        if (needCheckVars_arr.length > 0) {
            var validErrVar = pullFun.scope.getVar('validErr', true);
            var hadValidErrVar = pullFun.scope.getVar('hadValidErr', true, 'false');
            var validErrStateVarInitval = '{}';
            var validErrStateVar = pullFun.scope.getVar('validErrState', true, validErrStateVarInitval);
            var checkVarValidStr = '';
            var validKernelBlock = new FormatFileBlock('validkernel');
            needCheckVars_arr.forEach(varObj => {
                if (typeof varObj === 'string') {
                    checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varObj + ')';
                    return;
                }
                if (varObj.callFun != null) {
                    validKernelBlock.pushLine('validErr = ' + varObj.callFun + ';');
                    validKernelBlock.pushLine("if(validErr != null){hadValidErr = true;}");
                    return;
                }
                var valueType = 'string';
                if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                    valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                }
                var infoStatePath = varObj.kernel.getStatePath('invalidInfo', '.', { mapVarName: VarNames.RowKeyInfo_map });
                validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [
                    useStateVarName,
                    varObj.visibleStateVar,
                    varObj.ctlStateVar,
                    varObj.valueVar,
                    singleQuotesStr(valueType),
                    varObj.nullable ? varObj.nullable.toString() : 'false',
                    singleQuotesStr(varObj.kernel.id),
                    validErrStateVar.name,
                    VarNames.ParentPath
                ]) + ";");
                validKernelBlock.pushLine("validErrState[" + modifyStatePath(infoStatePath, belongUserControl) + "]=validErr;");
                validKernelBlock.pushLine("if(validErr != null){hadValidErr = true;}");
            });

            if (config.invalidProcess) {
                config.invalidProcess(validErrStateVar, checkVarValidStr, validBlock, validKernelBlock);
            }
        }

        if (!IsEmptyObject(bpCompileHelper.usePageParam)) {
            if(belongPageKernel == null){
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '没有关联页面缺使用了获取页面入库参数']);
                return false;
            }
            for (var usPageParamName in bpCompileHelper.usePageParam) {
                pullFun.scope.getVar('pagein_' + usPageParamName, true, makeStr_callFun('getPageEntryParam', [singleQuotesStr(belongPageKernel.id), singleQuotesStr(usPageParamName), bpCompileHelper.usePageParam[usPageParamName]]));
                needSetParams_arr.push({ bundleName: 'pagein_' + usPageParamName, clientValue: 'pagein_' + usPageParamName });
            }
        }

        if (!IsEmptyObject(bpCompileHelper.useUrlVar_map)) {
            for (var varName in bpCompileHelper.useUrlVar_map) {
                pullFun.scope.getVar(varName, true, makeStr_callFun('getQueryVariable', [singleQuotesStr(varName), bpCompileHelper.useUrlVar_map[varName]]));
                var useUrlVarObj = { bundleName: varName, clientValue: varName };
                needSetParams_arr.push(useUrlVarObj);
            }
        }

        if (needSetParams_arr.length > 0) {
            bodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '}');
            bodyCheckblock.pushLine("var bundle=req.body.bundle;");
            paramsetblock.pushLine("params_arr=[", 1);
            for (var si in needSetParams_arr) {
                var useParam = needSetParams_arr[si];
                initbundleBlock.pushLine(makeLine_Assign(VarNames.Bundle + '.' + useParam.bundleName, useParam.clientValue));
                var serverValue = ReplaceIfNull(useParam.serverValue, 'bundle.' + useParam.bundleName);
                paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.bundleName + "', sqlTypes.NVarChar(4000), " + serverValue + "),");
                if (useParam.needPostValid != false) {
                    bodyCheckblock.pushLine("if(bundle." + useParam.bundleName + " == null){" + makeLine_RetServerError('没有提供' + useParam.bundleName) + '};');
                }
            }
        }

        if (!IsEmptyObject(bpCompileHelper.useEnvVars)) {
            if (paramsetblock.childs_arr.length == 0) {
                paramsetblock.pushLine("params_arr=[", 1);
            }
            for (var useEnvName in bpCompileHelper.useEnvVars) {
                paramsetblock.pushLine("dbhelper.makeSqlparam('" + useEnvName + "', sqlTypes.NVarChar(4000), req.session.g_envVar." + useEnvName + "),");
            }
        }

        if (paramsetblock.childs_arr.length > 0) {
            paramsetblock.subNextIndent();
            paramsetblock.pushLine('];');
        }
        return {
            pullFun: pullFun,
            serverPullFun: serverPullFun,
        };
    }

    compileEnd() {
        super.compileEnd();
    }

    getString(indentChar, newLineChar) {
        if (this.project.content_Mobile.pages.length == 0) {
            return '';
        }
        return this.clientSide.getString(indentChar, newLineChar);
    }

    endKernelCompile(kernel) {
        switch (kernel.type) {
            case M_FormKernel_Type:
                if (this.endFormKernelCompile(kernel) == false) {
                    return false;
                }
                break;
        }
    }

    endFormKernelCompile(theKernel) {
        var project = this.project;
        var logManager = project.logManager;
        var clientSide = this.clientSide;
        var midData = this.projectCompiler.getMidData(theKernel.id);
        var belongPage = midData.belongPage;
        var belongForm = midData.belongForm;
        var belongUserControl = midData.belongUserControl;
        var belongFormMidData = belongForm ? this.projectCompiler.getMidData(belongForm.id) : null;
        var belongUserCtlMidData = belongUserControl ? this.projectCompiler.getMidData(belongUserControl.id) : null;
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var autoPull = theKernel.getAttribute(AttrNames.AutoPull);
        var parentLabledCtl;

        var selectMode = theKernel.getAttribute(AttrNames.SelectMode);

        var pullFun = midData.pullFun;
        var colName;

        if (belongUserControl) {
            pullFun.scope.getVar(belongUserControl.id + '_path', true, makeStr_callFun("getBelongUserCtlPath", [VarNames.FullParentPath]));
            pullFun.scope.getVar(belongUserControl.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, belongUserControl.id + '_path', '{}']));
        }

        if (midData.useFormXML || midData.useFormXMLText) {
            var getXmlRowFunName = theKernel.id + '_' + AttrNames.Function.GetXMLRowItem;
            var getXmlRowBp = project.scriptMaster.getBPByName(getXmlRowFunName);
            if (getXmlRowBp == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '有地方使用了此Grid的XML数据，却没有设定[获取XML行]方法']);
                return false;
            }
            var returnVars_arr = getXmlRowBp.returnVars_arr.filter(item => {
                return item.name != AttrNames.RowText;
            });
            if (midData.useFormXML) {
                if (returnVars_arr.length == 0) {
                    logManager.errorEx([logManager.createBadgeItem(
                        theKernel.getReadableName(),
                        theKernel,
                        this.projectCompiler.clickKernelLogBadgeItemHandler),
                        '[获取XML行]方法必须要有返回值设置']);
                    return false;
                }
            }
            if (midData.useFormXMLText && returnVars_arr.length == getXmlRowBp.returnVars_arr.length) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '有地方使用了此Grid的文本数据，却没在[获取XML行]设定RowText返回']);
                return false;
            }
            var compileRet = this.compileScriptBlueprint(getXmlRowBp);
            if (compileRet == false) {
                return false;
            }

            var xmlconfig = {
                colcount: returnVars_arr.length
            };
            returnVars_arr.forEach((varData, index) => {
                xmlconfig['col' + (index + 1)] = varData.name;
            });
            clientSide.scope.getVar(theKernel.id + '_xmlconfig', true, JSON.stringify(xmlconfig));
        }

        if (midData.useFormJSON) {
            var getJsonRowFunName = theKernel.id + '_' + AttrNames.Function.GetJSONRowItem;
            var getJsonRowBp = project.scriptMaster.getBPByName(getJsonRowFunName);
            if (getJsonRowBp == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '有地方使用了此表格的Json数据，却没有设定[获取JSON行]方法']);
                return false;
            }
            var returnVars_arr = getJsonRowBp.returnVars_arr.filter(item => {
                return item.name != AttrNames.RowText;
            });
            var compileRet = this.compileScriptBlueprint(getJsonRowBp);
            if (compileRet == false) {
                return false;
            }
            var headers_arr = returnVars_arr.map(v=>{return v.name;});
            clientSide.scope.getVar(theKernel.id + '_jsonHeaders', true, JSON.stringify(headers_arr));
        }

        if (midData.useDS) {
            var mustSelectColumns_arr = [];
            for (colName in midData.useColumns_map) {
                mustSelectColumns_arr.push(colName);
            }
            if (mustSelectColumns_arr.length == 0) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '没有任何列被使用']);
                return false;
            }
            else {
                theKernel.autoSetCusDataSource(mustSelectColumns_arr);
                var cusDS_bp = theKernel.getAttribute(AttrNames.CustomDataSource);
                logManager.log("编译[" + cusDS_bp.name + ']');
                var compilHelper = new SqlNode_CompileHelper(logManager, null);
                compilHelper.clickLogBadgeItemHandler = this.projectCompiler.clickSqlCompilerLogBadgeItemHandler;
                var compileRet = cusDS_bp.compile(compilHelper);
                if (compileRet == false) {
                    return false;
                }

                var initbundleBlock = midData.pullFun.initbundleBlock;
                var validBlock = midData.pullFun.validBlock;
                var needSetParams_arr = [];

                var initValue;
                var varName;
                var usectlid;
                var useCtlData;
                var propName;
                var propApiitem;
                var needCheckVars_arr = [];
                var needCheckProps_map = {};
                var ctlStateVarName;
                var ctlParentStateVarName;
                var nullableChecker = null;
                var callParams_arr = null;
                var initPath = '';
                var thisFormFullParentPath = singleQuotesStr(theKernel.fullParentPath);
                if (belongUserControl) {
                    thisFormFullParentPath = makeStr_callFun('CombineDotStr', [belongUserControl.id + '_path', singleQuotesStr(theKernel.fullParentPath)]);
                }
                callParams_arr = ['null', true, thisFormFullParentPath];

                var theFun = pullFun;
                var hadNeedWatchParam = false;
                var needPostValid = false;

                for (var formId in compilHelper.useForm_map) {
                    var useFormData = compilHelper.useForm_map[formId];
                    var useFormMidData = this.projectCompiler.getMidData(useFormData.formKernel.id);
                    var isGridForm = useFormData.formKernel.isGridForm();
                    var isListForm = useFormData.formKernel.isListForm();
                    var formSelectMode = useFormData.formKernel.getAttribute(AttrNames.SelectMode);
                    ctlParentStateVarName = null;
                    ctlStateVarName = null;

                    var formStateVarName = formId + '_state';
                    var nowRecordVarName = formId + '_' + VarNames.NowRecord + '';
                    var nowRowStateVarName = formId + '_' + VarNames.NowRow + '';
                    var selectedRowsVarName = formId + '_' + VarNames.SelectedRows_arr;
                    var isUseFormCtl = !IsEmptyObject(useFormData.useControls_map);
                    var isUseFormColumn = !IsEmptyObject(useFormData.useColumns_map);
                    var ctlBelongStateVarName = formStateVarName;
                    var formPathVarName = formId + '_path';
                    var formPath = useFormData.formKernel.getStatePath();

                    var isUseParentForm = useFormData.formKernel.isKernelInRow(theKernel);
                    if(isUseParentForm){
                        formPath = makeStr_callFun('getParentPathByKey', [VarNames.FullParentPath, singleQuotesStr(formId)]);
                        initValue = makeStr_getStateByPath(VarNames.State, formPathVarName, '{}');
                    }
                    else if (belongUserControl) {
                        formPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + formPath);
                        initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                    }
                    else {
                        formPath = singleQuotesStr(formPath);
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                    }
                    theFun.scope.getVar(formPathVarName, true, formPath);
                    theFun.scope.getVar(formStateVarName, true, initValue);

                    if (isUseFormCtl || isUseFormColumn) {
                        if (isGridForm || isListForm) {
                            ctlBelongStateVarName = nowRowStateVarName;
                            if(isUseParentForm){
                                if (isUseFormColumn) {
                                    theFun.scope.getVar(nowRecordVarName, true);
                                }
                                if (isUseFormCtl) {
                                    theFun.scope.getVar(nowRowStateVarName, true);
                                }
                                if (isUseFormColumn) {
                                    validBlock.pushLine(nowRecordVarName + '=' + makeStr_callFun('getRecordFromRowKey', [formPathVarName, VarNames.RowKeyInfo_map + '.' + formId], ';'));
                                }
                                if (isUseFormCtl) {
                                    validBlock.pushLine(makeStr_AddAll(nowRowStateVarName, '=', formStateVarName, "['row_' + ", VarNames.RowKeyInfo_map + '.' + formId, '];'));
                                }
                                var theFormRowBindFun = this.getFormRowBindFun(useFormData.formKernel);
                                theFormRowBindFun.pushLine(makeStr_callFun(pullFun.name, [VarNames.State, 'null', useFormData.formKernel.id + '_rowpath']));
                            }
                            else{
                                theFun.scope.getVar(selectedRowsVarName, true, makeStr_callFun('GetFormSelectedRows', [formStateVarName, singleQuotesStr(useFormData.formKernel.getAttribute(AttrNames.KeyColumn))]));
                                if (isUseFormColumn) {
                                    theFun.scope.getVar(nowRecordVarName, true);
                                }
                                if (isUseFormCtl) {
                                    theFun.scope.getVar(nowRowStateVarName, true);
                                }
                                validBlock.pushLine(makeStr_AddAll('if(', selectedRowsVarName, '==null || ', selectedRowsVarName, '.length == 0){hadValidErr=true;}'));
                                validBlock.pushLine('else{', 1);
                                if (isUseFormColumn) {
                                    validBlock.pushLine(nowRecordVarName + '=' + makeStr_callFun('getRecordFromRowKey', [formPathVarName, selectedRowsVarName + '[0]'], ';'));
                                }
                                if (isUseFormCtl) {
                                    validBlock.pushLine(makeStr_AddAll(nowRowStateVarName, '=', formStateVarName, "['row_' + ", selectedRowsVarName, '[0]];'));
                                }
                                validBlock.subNextIndent();
                                validBlock.pushLine('}');
                                if (autoPull) {
                                    this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, theFun.name, useFormData.formKernel, useFormData.formKernel.getSelectedValueStateName(), callParams_arr);
                                }
                            }
                            hadNeedWatchParam = true;
                        }
                        else {
                            if (isUseFormColumn) {
                                initValue = formStateVarName + '.' + VarNames.NowRecord;
                                theFun.scope.getVar(nowRecordVarName, true, initValue);
                            }
                        }
                    }

                    if (!IsEmptyObject(useFormData.useControls_map)) {
                        hadNeedWatchParam = true;
                        for (usectlid in useFormData.useControls_map) {
                            useCtlData = useFormData.useControls_map[usectlid];
                            initPath = singleQuotesStr(useCtlData.kernel.getStatePath('', '.', { mapVarName: VarNames.RowKeyInfo_map }));
                            if (belongUserControl) {
                                initPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + useCtlData.kernel.getStatePath());
                            }
                            if (useCtlData.kernel.type == UserControlKernel_Type) {
                                theFun.scope.getVar(useCtlData.kernel.id + '_path', true, initPath);
                            }
                            ctlStateVarName = usectlid + '_state';
                            initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(usectlid), '{}');
                            theFun.scope.getVar(ctlStateVarName, true, initValue);
                            ctlParentStateVarName = null;
                            parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                            if (parentLabledCtl) {
                                ctlParentStateVarName = parentLabledCtl.id + '_state';
                                initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(parentLabledCtl.id), '{}');
                                theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                            }

                            for (propName in useCtlData.useprops_map) {
                                propApiitem = useCtlData.useprops_map[propName];
                                varName = usectlid + '_' + propApiitem.stateName;
                                initValue = ctlStateVarName + '.' + propApiitem.stateName;
                                if (propApiitem.getInitValueFun) {
                                    initValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                                }
                                theFun.scope.getVar(varName, true, initValue);
                                needPostValid = true;
                                if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                                    needCheckProps_map[varName] = 1;
                                    nullableChecker = ctlParentStateVarName ? parentLabledCtl : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                                    needPostValid = (nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : true) != true;
                                    needCheckVars_arr.push({
                                        kernel: useCtlData.kernel,
                                        nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                        visibleStateVar: ctlParentStateVarName == null ? ctlStateVarName : ctlParentStateVarName,
                                        ctlStateVar: ctlStateVarName,
                                        valueVar: varName,
                                        propApi: propApiitem
                                    });
                                }
                                else {
                                    if (useCtlData.kernel.type == UserControlKernel_Type) {
                                        var templateKernelMidData = this.projectCompiler.getMidData(useCtlData.kernel.getTemplateKernel().id);
                                        var propChecker = templateKernelMidData.propChecker_map[propApiitem.stateName];
                                        if (propChecker) {
                                            if (needCheckProps_map[useCtlData.kernel.id + propChecker] == null) {
                                                needCheckProps_map[useCtlData.kernel.id + propChecker] = 1;
                                                needCheckVars_arr.push({
                                                    callFun: makeStr_callFun(propChecker, [VarNames.State, usectlid + '_path']),
                                                });
                                            }
                                        }
                                    }
                                }
                                needSetParams_arr.push({ bundleName: varName, clientValue: varName, needPostValid: needPostValid });
                                if (autoPull) {
                                    this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, theFun.name, useCtlData.kernel, propApiitem.relyStateName, callParams_arr);
                                }
                            }
                        }
                    }
                    if (!IsEmptyObject(useFormData.useColumns_map)) {
                        hadNeedWatchParam = true;
                        needCheckVars_arr.push(nowRecordVarName);
                        for (colName in useFormData.useColumns_map) {
                            needSetParams_arr.push({ bundleName: colName + '_' + useFormData.useDS.code, clientValue: nowRecordVarName + '.' + colName });
                            useFormMidData.useColumns_map[colName] = 1;
                        }
                        if (IsEmptyObject(useFormData.useControls_map)) {
                            // 只用到了目标form的数据列，需要在其bind的时候进行重新bind
                            if (useFormMidData.isPageForm) {
                                useFormMidData.bindFun.bindEndBlock.pushLine(makeStr_callFun(pullFun.name, [VarNames.ReState, true, thisFormFullParentPath], ';'));
                            }
                        }
                    }
                }

                for (usectlid in compilHelper.useGlobalControls_map) {
                    hadNeedWatchParam = true;
                    useCtlData = compilHelper.useGlobalControls_map[usectlid];
                    initPath = singleQuotesStr(useCtlData.kernel.getStatePath());
                    if (useCtlData.kernel.type == UserControlKernel_Type) {
                        if (belongUserControl) {
                            initPath = belongUserControl.id + '_path + ' + singleQuotesStr('.' + useCtlData.kernel.getStatePath());
                        }
                        pullFun.scope.getVar(useCtlData.kernel.id + '_path', true, initPath);
                    }
                    ctlStateVarName = usectlid + '_state';
                    if (belongUserControl) {
                        initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                    }
                    else {
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                    }
                    theFun.scope.getVar(ctlStateVarName, true, initValue);

                    ctlParentStateVarName = null;
                    parentLabledCtl = useCtlData.kernel.getParentLabledCtl();
                    if (parentLabledCtl) {
                        ctlParentStateVarName = parentLabledCtl.id + '_state';
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(parentLabledCtl.id), '{}');
                        theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                    }

                    for (propName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[propName];
                        varName = usectlid + '_' + propApiitem.stateName;
                        initValue = ctlStateVarName + '.' + propApiitem.stateName;
                        if (propApiitem.getInitValueFun) {
                            initValue = propApiitem.getInitValueFun(ctlStateVarName, useCtlData.kernel, propApiitem);
                        }
                        theFun.scope.getVar(varName, true, initValue);
                        needPostValid = true;
                        if (propApiitem.needValid) {
                            if (needCheckProps_map[varName] == null) {
                                needCheckProps_map[varName] = 1;
                                nullableChecker = ctlParentStateVarName ? parentLabledCtl : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                                needPostValid = (nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : true) != true;
                                needCheckVars_arr.push({
                                    kernel: useCtlData.kernel,
                                    nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                    visibleStateVar: ctlStateVarName,
                                    ctlStateVar: ctlStateVarName,
                                    valueVar: varName,
                                    propApi: propApiitem
                                });
                            }
                        }
                        else {
                            // 模板自订控件里面的方法一律不做属性验证
                            if (useCtlData.kernel.type == UserControlKernel_Type) {
                                if (useCtlData.kernel.isTemplate()) {
                                    needPostValid = false;
                                }
                                else {
                                    var templateKernelMidData = this.projectCompiler.getMidData(useCtlData.kernel.getTemplateKernel().id);
                                    var propChecker = templateKernelMidData.propChecker_map[propApiitem.stateName];
                                    if (propChecker) {
                                        if (needCheckProps_map[useCtlData.kernel.id + propChecker] == null) {
                                            needCheckProps_map[useCtlData.kernel.id + propChecker] = 1;
                                            needCheckVars_arr.push({
                                                callFun: makeStr_callFun(propChecker, [VarNames.State, usectlid + '_path']),
                                            });
                                        }
                                    }
                                }
                            }
                            var tempCallParams_arr = callParams_arr;
                            if (useCtlData.kernel.parent == null) {
                                if (useCtlData.kernel.type == UserControlKernel_Type) {
                                    // 自订控件
                                    tempCallParams_arr = ['nowState', true, 'this.props.fullPath'];
                                    if (this.getKernelFullParentPath(theKernel).length > 0) {
                                        tempCallParams_arr[2] += " + '." + this.getKernelFullParentPath(theKernel) + "'";
                                    }
                                }
                                else {
                                    // 页面
                                    tempCallParams_arr = ['state', true, singleQuotesStr(useCtlData.kernel.id)];
                                }
                            }
                            if (autoPull) {
                                this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, theFun.name, useCtlData.kernel, propApiitem.relyStateName, tempCallParams_arr);
                            }
                        }
                        needSetParams_arr.push({ bundleName: varName, clientValue: varName, needPostValid: needPostValid });
                    }
                }

                if (needCheckVars_arr.length > 0) {
                    var validErrVar = theFun.scope.getVar('validErr', true);
                    var hadValidErrVar = theFun.scope.getVar('hadValidErr', true, 'false');
                    var validErrStateVarInitval = '{}';
                    var validErrStateVar = theFun.scope.getVar('validErrState', true, validErrStateVarInitval);
                    var checkVarValidStr = '';
                    var validKernelBlock = new FormatFileBlock('validkernel');
                    needCheckVars_arr.forEach(varObj => {
                        if (typeof varObj === 'string') {
                            checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varObj + ')';
                            return;
                        }
                        if (varObj.callFun != null) {
                            validKernelBlock.pushLine('validErr = ' + varObj.callFun + ';');
                            validKernelBlock.pushLine("if(validErr != null){hadValidErr = true;}");
                            return;
                        }
                        var valueType = 'string';
                        if (varObj.propApi) {
                            if (autoPull) {
                                this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel, theFun.name, varObj.kernel, varObj.propApi.relyStateName, callParams_arr);
                            }
                        }
                        if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                            valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                        }
                        var infoStatePath = varObj.kernel.getStatePath('invalidInfo', '.', { mapVarName: VarNames.RowKeyInfo_map });
                        validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [
                            this.group == EJsBluePrintFunGroup.CtlValid ? 'comeState' : VarNames.State,
                            varObj.visibleStateVar,
                            varObj.ctlStateVar,
                            varObj.valueVar,
                            singleQuotesStr(valueType),
                            varObj.nullable ? varObj.nullable.toString() : 'false',
                            singleQuotesStr(varObj.kernel.id),
                            validErrStateVar.name,
                            VarNames.FullParentPath
                        ]) + ";");
                        validKernelBlock.pushLine("validErrState[" + modifyStatePath(infoStatePath, belongUserControl) + "]=validErr;");
                        validKernelBlock.pushLine("if(validErr != null) hadValidErr = true;");
                        //checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
                    });


                    validBlock.pushLine('var _invalidstate={};');
                    validBlock.pushLine('_invalidstate[' + modifyStatePath(theKernel.getStatePath(VarNames.InvalidBundle,'.', {mapVarName: VarNames.RowKeyInfo_map}), belongUserControl) + ']=gPreconditionInvalidInfo;');
                    validBlock.pushLine('_invalidstate[' + modifyStatePath(theKernel.getStatePath(VarNames.Records_arr,'.', {mapVarName: VarNames.RowKeyInfo_map}), belongUserControl) + ']=[];');
                    if (theKernel.isPageForm()) {
                        validBlock.pushLine('_invalidstate[' + modifyStatePath(theKernel.getStatePath(VarNames.RecordIndex), belongUserControl) + ']=-1;');
                    }
                    else {
                        if (selectMode == ESelectMode.Single) {
                            validBlock.pushLine('_invalidstate[' + modifyStatePath(theKernel.getStatePath(VarNames.SelectedValue), belongUserControl) + ']=null;');
                        }
                        else if (selectMode == ESelectMode.Multi) {
                            validBlock.pushLine('_invalidstate[' + modifyStatePath(theKernel.getStatePath(VarNames.SelectedValues_arr), belongUserControl) + ']=[];');
                        }
                    }
                    var dispatchErrLine = "store.dispatch(makeAction_setManyStateByPath(_invalidstate,''));";
                    var setErrStateLine = makeStr_AddAll('return setManyStateByPath(', VarNames.State, ",'',_invalidstate);");
                    if (checkVarValidStr.length > 0) {
                        var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                        validBlock.pushChild(checkVarValidIf);
                        checkVarValidIf.trueBlock.pushLine('if(' + VarNames.HadStateParam + '){', 1);
                        checkVarValidIf.trueBlock.pushLine(setErrStateLine, -1);
                        checkVarValidIf.trueBlock.pushLine('}');
                        checkVarValidIf.trueBlock.pushLine('else{' + dispatchErrLine + ' return;}');
                    }
                    validBlock.pushChild(validKernelBlock);
                    validKernelBlock.pushLine('if(hadValidErr){', 1);
                    validKernelBlock.pushLine('if(' + VarNames.HadStateParam + '){', 1);
                    validKernelBlock.pushLine(setErrStateLine, -1);
                    validKernelBlock.pushLine('}');
                    validKernelBlock.pushLine('else{' + dispatchErrLine + ' return;}', -1);
                    validKernelBlock.subNextIndent();
                    validKernelBlock.pushLine('}');
                }

                if (validKernelBlock && !theKernel.isPageForm()) {
                    validKernelBlock.pushLine('if(' + VarNames.HoldSelected + ' == false){', 1);
                    validKernelBlock.pushLine('var resetState={};');
                    if (selectMode == ESelectMode.Single) {
                        validKernelBlock.pushLine('resetState[' + modifyStatePath(theKernel.getStatePath(VarNames.SelectedValue), belongUserControl) + ']=null;');
                    }
                    else if (selectMode == ESelectMode.Multi) {
                        validKernelBlock.pushLine('resetState[' + modifyStatePath(theKernel.getStatePath(VarNames.SelectedValues_arr), belongUserControl) + ']=[];');
                    }
                    validKernelBlock.pushLine('if(' + VarNames.HadStateParam + '){' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''",'resetState']) + ';}');
                    validKernelBlock.pushLine("else{store.dispatch(makeAction_setManyStateByPath(resetState,''));}", -1);
                    validKernelBlock.subNextIndent();
                    validKernelBlock.pushLine('}');
                }

                if (!IsEmptyObject(compilHelper.usePageParam)) {
                    for (var usPageParamName in compilHelper.usePageParam) {
                        pullFun.scope.getVar('pagein_' + usPageParamName, true, makeStr_callFun('getPageEntryParam', [singleQuotesStr(belongPage.id), singleQuotesStr(usPageParamName), compilHelper.usePageParam[usPageParamName]]));
                        needSetParams_arr.push({ bundleName: 'pagein_' + usPageParamName, clientValue: 'pagein_' + usPageParamName });
                    }
                }

                if (!IsEmptyObject(compilHelper.useUrlVar_map)) {
                    for (varName in compilHelper.useUrlVar_map) {
                        pullFun.scope.getVar(varName, true, makeStr_callFun('getQueryVariable', [singleQuotesStr(varName), compilHelper.useUrlVar_map[varName]]));
                        var useUrlVarObj = { bundleName: varName, clientValue: varName };
                        needSetParams_arr.push(useUrlVarObj);
                    }
                }

                var serverBodyCheckblock = midData.bodyCheckblock;
                var paramsetblock = midData.serverSqlParamsetBLK;
                if (needSetParams_arr.length > 0) {
                    serverBodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '}');
                    serverBodyCheckblock.pushLine("var bundle=req.body.bundle;");
                    paramsetblock.pushLine("params_arr=[", 1);
                    for (var si in needSetParams_arr) {
                        var useParam = needSetParams_arr[si];
                        initbundleBlock.pushLine(makeLine_Assign(VarNames.Bundle + '.' + useParam.bundleName, useParam.clientValue));
                        var serverValue = ReplaceIfNull(useParam.serverValue, 'bundle.' + useParam.bundleName);
                        paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.bundleName + "', sqlTypes.NVarChar(4000), " + serverValue + "),");
                        if (useParam.needPostValid != false) {
                            serverBodyCheckblock.pushLine("if(bundle." + useParam.bundleName + " == null){" + makeLine_RetServerError('没有提供' + useParam.bundleName) + '};');
                        }
                    }
                }

                if(midData.rowBindFun){
                    if(theKernel.isListForm()){
                        midData.callRowBindBlks.endfor.pushLine('if(records_arr.length > 0){', 1);
                        midData.callRowBindBlks.endfor.pushLine('var formPath = ' + theKernel.id +'_path;');
                        midData.callRowBindBlks.endfor.pushLine('setTimeout(() => {',1);
                        midData.callRowBindBlks.endfor.pushLine('store.dispatch(makeAction_callFunction(state => {', 1);
                        midData.callRowBindBlks.endfor.pushLine("var formState = getStateByPath(state, formPath);");
                        midData.callRowBindBlks.endfor.pushLine('records_arr.forEach(rcd=>{', 1);
                        midData.callRowBindBlks.endfor.pushLine("var rowPath = formPath + '.row_' +rcd._key;");
                        midData.callRowBindBlks.endfor.pushLine("var rowState = getStateByPath(state, rowPath);");
                        midData.callRowBindBlks.endfor.pushLine(makeStr_callFun(midData.rowBindFun.name,[
                            'state', 
                            'formPath',
                            'formState',
                            'rowPath',
                            'rowState',
                            'rcd',
                        ]), -1);
                        midData.callRowBindBlks.endfor.pushLine('});');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('}));');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('},200);');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('}');
                    }
                    else if(theKernel.isGridForm()){
                        midData.bindFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.RowBindInfo), '{}'));
                        midData.callRowBindBlks.beforeFor.pushLine('var bindrows_arr=[];');
                        midData.callRowBindBlks.beforeFor.pushLine('var rowbindInfo = formProp.' + VarNames.RowBindInfo + ' == null ? {} : formProp.' + VarNames.RowBindInfo + ';');
                        midData.callRowBindBlks.inFor.pushLine('if(rowbindInfo[rowkey] == null){',1);
                        midData.callRowBindBlks.inFor.pushLine('bindrows_arr.push(rowkey);');
                        midData.callRowBindBlks.inFor.pushLine('rowbindInfo[rowkey]=1;');
                        midData.callRowBindBlks.inFor.subNextIndent();
                        midData.callRowBindBlks.inFor.pushLine('}');
                        midData.callRowBindBlks.endfor.pushLine('if(bindrows_arr.length > 0){', 1);
                        midData.callRowBindBlks.endfor.pushLine('var formPath = formProp.fullPath;');
                        midData.callRowBindBlks.endfor.pushLine('var rowKeyInfo_map = getRowKeyMapFromPath(formPath);');
                        midData.callRowBindBlks.endfor.pushLine('setTimeout(() => {',1);
                        midData.callRowBindBlks.endfor.pushLine('store.dispatch(makeAction_setStateByPath(rowbindInfo,formPath + ' + singleQuotesStr('.' + VarNames.RowBindInfo) + '));');
                        midData.callRowBindBlks.endfor.pushLine('store.dispatch(makeAction_callFunction(state => {', 1);
                        midData.callRowBindBlks.endfor.pushLine('var formState = getStateByPath(state, formPath);');
                        midData.callRowBindBlks.endfor.pushLine('bindrows_arr.forEach(rowKey=>{', 1);
                        midData.callRowBindBlks.endfor.pushLine("var rowPath = formPath + '.row_' + rowKey;");
                        midData.callRowBindBlks.endfor.pushLine("var rowState = getStateByPath(state, rowPath);");
                        midData.callRowBindBlks.endfor.pushLine(makeStr_callFun(midData.rowBindFun.name,[
                            'state', 
                            'formPath',
                            'formState',
                            'rowPath',
                            'rowState',
                            'getRecordFromRowKey(formPath,rowKey)',
                        ]), -1);
                        midData.callRowBindBlks.endfor.pushLine('});');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('}));');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('},200);');
                        midData.callRowBindBlks.endfor.subNextIndent();
                        midData.callRowBindBlks.endfor.pushLine('}');
                    }
                }

                if (hadNeedWatchParam) {
                    // 有用到参数,等待参数变更时触发pullfun
                }
                else if (autoPull) {
                    // 没有用到参数，父对象刷新时出发pullfun
                    //var timeoutBlock = null;
                    if (belongFormMidData != null) {
                        /*
                        var beforeRetBlock = belongFormMidData.pullFun.beforeRetBlock;
                        beforeRetBlock.pushChild();
                        timeoutBlock = beforeRetBlock.getChild('timeout');
                        if(timeoutBlock == null){
                            beforeRetBlock.pushLine('setTimeout(() => {', 1);
                            timeoutBlock = new FormatFileBlock('timeout');
                            beforeRetBlock.pushChild(timeoutBlock);
                            beforeRetBlock.subNextIndent();
                            beforeRetBlock.pushLine('}');
                        }
                        */
                        if (belongFormMidData.useDS) {
                            belongFormMidData.pullFun.beforeRetBlock.pushLine(makeStr_callFun(pullFun.name, [VarNames.State, true, thisFormFullParentPath]));
                        }
                        else {
                            belongFormMidData.bindFun.beforeRetBlock.pushLine(makeStr_callFun(pullFun.name, [VarNames.ReState, true, thisFormFullParentPath]));
                        }
                    }
                    else if (belongUserControl != null) {
                        // 在自订控件里
                        var templateReactClass = this.clientSide.getReactClass(belongUserControl.getReactClassName());
                        templateReactClass.initFun.pushLine(makeStr_callFun(pullFun.name, [belongUserControl.id + '_state', true, 'ctlFullPath']));
                    }
                    else {
                        var pageInitFun = clientSide.scope.getFunction(makeFName_initPage(belongPage));
                        var timeoutBlock = pageInitFun.getChild('timeout');
                        timeoutBlock.pushLine(makeStr_callFun(pullFun.name, ['null', true, singleQuotesStr(theKernel.fullParentPath)]) + ';');
                    }
                }

                if (!IsEmptyObject(compilHelper.useEnvVars)) {
                    if (paramsetblock.childs_arr.length == 0) {
                        paramsetblock.pushLine("params_arr=[", 1);
                    }
                    serverBodyCheckblock.pushLine("if(req.session == null){" + makeLine_RetServerError('no session 无法使用') + '};');
                    for (var useEnvName in compilHelper.useEnvVars) {
                        paramsetblock.pushLine("dbhelper.makeSqlparam('" + useEnvName + "', sqlTypes.NVarChar(4000), req.session.g_envVar." + useEnvName + "),");
                    }
                }
                if (paramsetblock.childs_arr.length > 0) {
                    paramsetblock.subNextIndent();
                    paramsetblock.pushLine('];');
                }

                midData.serverSqlLine.content = 'var sql = "' + compileRet.sql + '";';
            }
        }
        else {

        }
    }
}