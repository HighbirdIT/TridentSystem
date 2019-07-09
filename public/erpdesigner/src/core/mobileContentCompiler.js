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
    constructor() {
        this.allpath_map = {};
        this.allgraph_map = {};
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
        this.compileChain = [];
        this.compiledScriptBP_map = {};
        this.ctlRelyOnGraph = new ControlRelyOnGraph();

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        this.appRenderSwicth = theSwicth;
        clientSide.appClass.renderFun.pushChild(theSwicth);
        var pageElemVar = clientSide.appClass.renderFun.scope.getVar('pageElem', true);

        clientSide.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'loaded'), 'state.loaded'));
        var unloadedIfBlock = new JSFile_IF('unloaded', '!state.loaded');
        clientSide.appClass.mapStateFun.pushChild(unloadedIfBlock);
        unloadedIfBlock.pushLine(makeLine_Assign(VarNames.RetProps + '.fetchState', 'state.ui.fetchState'));

        clientSide.scope.getVar(VarNames.PageRouter, true, '[]');
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

        clientSide.pageRouteBackFun = clientSide.scope.getFunction('pageRoute_Back', true);
        clientSide.pageRouteBackFun.pushLine('if(' + VarNames.PageRouter + '.length > 1){', 1);
        clientSide.pageRouteBackFun.pushLine(VarNames.PageRouter + '.pop();');
        clientSide.pageRouteBackFun.pushLine('store.dispatch(makeAction_gotoPage(' + VarNames.PageRouter + '.pop()));', -1);
        clientSide.pageRouteBackFun.pushLine('}');

        clientSide.addReducer('AT_PAGELOADED', 'pageLoadedReducer.bind(window)');
        clientSide.addReducer('AT_GOTOPAGE', 'gotoPageReducer.bind(window)');

        for (var userCtli in project.userControls_arr) {
            if (!this.compileUserControlTemplate(project.userControls_arr[userCtli])) {
                return false;
            }
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
            logManager.error('项目没有设置主页面');
        }

        clientSide.pageLoadedReducerFun.pushLine("var flowStep = parseInt(getQueryVariable('flowStep'));");
        clientSide.pageLoadedReducerFun.pushLine("var targetPageID='" + this.mianPageKernel.id + "';");
        clientSide.pageLoadedReducerFun.pushChild(flowStepSwitch);
        clientSide.pageLoadedReducerFun.flowStepSwitch = flowStepSwitch;
        clientSide.pageLoadedReducerFun.pushLine("return gotoPage(targetPageID, state);");

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className='w-100 h-100'>");
        clientSide.appClass.renderFun.pushLine("<CToastManger ref={gCToastMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<CMessageBoxManger ref={gCMessageBoxMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<FixedContainer ref={gFixedContainerRef} />");
        clientSide.appClass.renderFun.pushLine("{this.renderLoadingTip()}");
        clientSide.appClass.renderFun.pushLine("{pageElem}", -1);
        clientSide.appClass.renderFun.pushLine("</div>);");

        this.compileChain.reverse();
        for (var ki in this.compileChain) {
            this.endKernelCompile(this.compileChain[ki]);
        }

        // gen relyon code
        for (var pid in this.ctlRelyOnGraph.allpath_map) {
            var relyPath = this.ctlRelyOnGraph.allpath_map[pid];
            var berelyCtl = relyPath.berelyCtl;
            var changedFun;
            var getValueStr = '';
            if (berelyCtl.parent == null) {
                console.error('这里berelyCtl.parent 不能为空');
            }
            else {
                var propFulPath;
                var propChangedHandlerName;
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                    case ECtlReplyPathType.CallFun_On_BPChanged:
                        if(relyPath.relyCtl == null){
                            console.log('sdf');
                        }
                        propFulPath = relyPath.berelyCtl.getStatePath(relyPath.berelyPropName, '.', null, true);
                        propChangedHandlerName = relyPath.berelyCtl.id + '_' + relyPath.berelyPropName + '_changed';
                        changedFun = clientSide.scope.getFunction(propChangedHandlerName);
                        if (changedFun == null) {
                            changedFun = clientSide.scope.getFunction(propChangedHandlerName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowIndexInfo_map']);
                            changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                            changedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                            clientSide.stateChangedAct[singleQuotesStr(propFulPath)] = propChangedHandlerName + '.bind(window)';
                        }
                        var accordionParents_arr = relyPath.relyCtl.searchParentKernel([Accordion_Type,TabItem_Type]);
                        if(accordionParents_arr){
                            var accordionCheckStr = '';
                            accordionParents_arr.forEach(accordionKernel=>{
                                changedFun.scope.getVar(accordionKernel.id + '_state', true, "getStateByPath("+VarNames.State+",'"+accordionKernel.getStatePath()+"',{});");
                                accordionCheckStr += (accordionCheckStr.length > 0 ? ' && ' : '') + accordionKernel.id + '_state.inited';
                            });
                            changedFun.pushLine('if(' + accordionCheckStr + '){',1);
                        }
                        if (relyPath.type == ECtlReplyPathType.SetAP_On_BPChanged) {
                            getValueStr = '';
                            if (relyPath.approach.funName) {
                                getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State]);
                            }
                            else if (relyPath.approach.value) {
                                getValueStr = relyPath.approach.value;
                            }
                            else {
                                console.error('不支持的approach!');
                            }
                            var rowIndexInfo_map = {
                                mapVarName: 'rowIndexInfo_map',
                            };
                            changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowIndexInfo_map)), getValueStr));
                        }
                        else {
                            var actKey = 'call_' + relyPath.funName;
                            changedFun.pushLine("if(delayActs['" + actKey + "'] == null){delayActs['" + actKey + "'] = {callfun:" + relyPath.funName + (relyPath.params_arr ? ",params_arr:[" + relyPath.params_arr.join(',') + ']' : '') + "};};");
                        }
                        if(accordionParents_arr){
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
            if (formType == EFormType.Grid) {
                var needModify = false;
                if (ctlKernel.parent.type == M_LabeledControlKernel_Type && ctlKernel.parent.parent == belongForm) {
                    needModify = true;
                }
                if (needModify) {
                    ctlTag.setAttr('rowIndex', '{rowIndex}');
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

    compileScriptBlueprint(targetBP, config) {
        if (this.compiledScriptBP_map[targetBP.id]) {
            return this.compiledScriptBP_map[targetBP.id];
        }
        var project = this.project;
        var logManager = project.logManager;
        var useScope = targetBP.type == FunType_Client ? this.clientSide.scope : this.serverSide.scope;
        var compileHelper = new JSNode_CompileHelper(logManager, null, useScope);
        compileHelper.serverSide = this.serverSide;
        compileHelper.clientSide = this.clientSide;
        compileHelper.sqlBPCacheManager = this.projectCompiler;
        compileHelper.config = config;
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
        return compileRet;
    }

    compileUserControlTemplate(userCtlKernel) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(userCtlKernel.getReactClassName(), true);
        var layoutConfig = userCtlKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('erp-control');
        var styleID = userCtlKernel.id + '_style';
        var styleStr = clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';
        var orientation = userCtlKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var ctlMidData = this.projectCompiler.getMidData(userCtlKernel.id);
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.inst_arr = [];
        ctlMidData.needSetStateChangedActs_arr = [];

        var childRenderBlock = new FormatFileBlock(userCtlKernel.id);
        var renderBlock = controlReactClass.renderFun;
        renderBlock.pushLine('if(this.props.visible == false){return null;}');
        renderBlock.pushLine(makeStr_AddAll(VarNames.RetElem, " = <div className='", layoutConfig.getClassName(), "' ", styleStr, " userctlpath={this.props.fullPath}", ">"), 1);
        renderBlock.pushChild(childRenderBlock);
        renderBlock.subNextIndent();
        renderBlock.pushLine('</div>');

        controlReactClass.constructorFun.pushLine('this.savedProps={};');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'visible'), makeStr_DotProp(VarNames.CtlState, 'visible != false')));
        userCtlKernel.getParamApiAttrArray().forEach(paramApiItem => {
            controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, paramApiItem.label), makeStr_DotProp(VarNames.CtlState, paramApiItem.label)));
        });


        var savePropCheckBlock = new FormatFileBlock('savePropCheckBlock');
        controlReactClass.renderFun.pushChild(savePropCheckBlock);
        controlReactClass.savePropCheckBlock = savePropCheckBlock;
        savePropCheckBlock.pushLine('var needSetState = {};');
        savePropCheckBlock.pushLine('var nowState = store.getState();');
        savePropCheckBlock.pushLine('var calledAct_map = {};');
        savePropCheckBlock.pushLine('var ctlState = getStateByPath(nowState,this.props.fullPath,{});');
        controlReactClass.renderFun.pushLine('if(!IsEmptyObject(needSetState)){', 1);
        controlReactClass.renderFun.pushLine('setTimeout(() => {store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));},50);', -1);
        controlReactClass.renderFun.pushLine('}');

        var ctlInitFun = null;
        var ctlPathParamName = 'ctlFullPath';
        ctlInitFun = clientSide.scope.getFunction('init' + userCtlKernel.id, true, [VarNames.State, ctlPathParamName]);
        ctlInitFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        ctlInitFun.scope.getVar(userCtlKernel.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, ctlPathParamName]));
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
            this.endKernelCompile(this.compileChain[ki]);
        }
        this.compileChain = [];

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
            var rowIndexInfo_map = {
                mapVarName: 'rowIndexInfo_map',
            };
            var actKey;
            if (berelyCtl == userCtlKernel) {
                // Usercontrol's rely
                var changedFunName = relyPath.berelyPropName + 'changed';
                changedFun = controlReactClass.getFunction(changedFunName);
                if (changedFun == null) {
                    changedFun = controlReactClass.getFunction(changedFunName, true, ['nowState', VarNames.State, 'calledAct_map']);
                    changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                    changedFun.retBlock.pushLine('return ' + VarNames.NeedSetState + ';');

                    controlReactClass.savePropCheckBlock.pushLine("if(this.savedProps." + relyPath.berelyPropName + " != this.props." + relyPath.berelyPropName + "){", 1);
                    controlReactClass.savePropCheckBlock.pushLine("needSetState = Object.assign(needSetState,this." + changedFunName + "(nowState,ctlState,calledAct_map));");
                    controlReactClass.savePropCheckBlock.pushLine("this.savedProps." + relyPath.berelyPropName + " = this.props." + relyPath.berelyPropName + ';', -1);
                    controlReactClass.savePropCheckBlock.pushLine('}');
                }
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                        getValueStr = '';
                        if (relyPath.approach.funName) {
                            var useParentPath = this.getKernelFullParentPath(relyPath.relyCtl);
                            if (useParentPath.length > 0) {
                                useParentPath = ' + ' + singleQuotesStr('.' + useParentPath);
                            }
                            getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State, 'null', 'this.props.fullPath' + useParentPath]);
                        }
                        else if (relyPath.approach.value) {
                            getValueStr = relyPath.approach.value;
                        }
                        else {
                            console.error('不支持的approach!');
                        }
                        changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowIndexInfo_map)), getValueStr));
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
            }
            else {
                var propFulPath;
                var propChangedHandlerName;
                switch (relyPath.type) {
                    case ECtlReplyPathType.SetAP_On_BPChanged:
                    case ECtlReplyPathType.CallFun_On_BPChanged:
                        var rootPathVarName = userCtlKernel.id + '_path';
                        propFulPath = relyPath.berelyCtl.getStatePath(relyPath.berelyPropName, '.', null, true);
                        propChangedHandlerName = relyPath.berelyCtl.id + '_' + relyPath.berelyPropName + '_changed';
                        changedFun = clientSide.scope.getFunction(propChangedHandlerName);
                        if (changedFun == null) {
                            changedFun = clientSide.scope.getFunction(propChangedHandlerName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs', 'rowIndexInfo_map']);
                            changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                            changedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                            ctlMidData.needSetStateChangedActs_arr.push(
                                {
                                    propName: propFulPath,
                                    funName: propChangedHandlerName + '.bind(window)',
                                }
                            );
                        }
                        var rootPathVar = changedFun.scope.getVar(rootPathVarName, true, makeStr_callFun('getBelongUserCtlPath', ['path']));
                        if (relyPath.type == ECtlReplyPathType.SetAP_On_BPChanged) {
                            getValueStr = '';
                            if (relyPath.approach.funName) {
                                getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State]);
                            }
                            else if (relyPath.approach.value) {
                                getValueStr = relyPath.approach.value;
                            }
                            else {
                                console.error('不支持的approach!');
                            }
                            changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "''+" + rootPathVarName + "+'." + relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowIndexInfo_map) + "'"), getValueStr));
                        }
                        else {
                            actKey = 'call_' + relyPath.funName;
                            changedFun.pushLine("if(delayActs['" + actKey + "'] == null){delayActs['" + actKey + "'] = {callfun:" + relyPath.funName + ",params_arr:[" + relyPath.params_arr + "]};};");
                        }
                        break;
                }
            }
        }
        this.ctlRelyOnGraph.allpath_map = [];
        this.ctlRelyOnGraph.allgraph_map = [];

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
        //pageReactClass.renderFootFun = pageReactClass.getFunction('renderFoot', true);
        //pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        if (!isPopable) {
            var caseBlock = this.appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
            caseBlock.pushLine(makeLine_Assign('pageElem', '<' + pageKernel.getReactClassName(true) + ' />'));

            var gotoPageCaseBlock = clientSide.gotoPageFun.switchBlock.getCaseBlock(singleQuotesStr(pageKernel.id));
            gotoPageCaseBlock.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(makeFName_activePage(pageKernel), [VarNames.ReState])));
        }

        pageReactClass.renderHeaderFun.pushLine("var routeElem = " + VarNames.PageRouter + ".length > 1 ? <i className='fa fa-arrow-left' /> : null;");
        pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
        pageReactClass.renderHeaderFun.pushLine("<h3 onClick={pageRoute_Back}>{routeElem}" + pageKernel.getAttribute(AttrNames.Title) + "</h3>", -1);
        pageReactClass.renderHeaderFun.pushLine("</div>);");

        /*
        pageReactClass.renderFootFun.pushLine("return (<div className='flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter'>", 1);
        pageReactClass.renderFootFun.pushLine("<h3>页脚</h3>", -1);
        pageReactClass.renderFootFun.pushLine("</div>);");
        */

        pageReactClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        if (isPopable) {
            var styleID = pageKernel.id + '_style';
            var styleStr = clientSide.addStyleObject(styleID, pageLayoutConfig.style) ? 'style={' + styleID + '}' : '';
            pageReactClass.renderFun.pushLine("<div className='d-flex flex-column popPage bg-light autoScroll' " + styleStr + ">", 1);
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
        var pageLayoutConfig = pageKernel.getLayoutConfig();
        var autoHeight = pageKernel.getAttribute(AttrNames.AutoHeight);
        pageLayoutConfig.addClass('d-flex');
        pageLayoutConfig.addClass('flex-grow-1');
        pageLayoutConfig.addClass('flex-shrink-0');
        pageLayoutConfig.addClass('autoScroll_Touch');
        if (pageOrientation == Orientation_V) {
            pageLayoutConfig.addClass('flex-column');
        }
        if (!autoHeight) {
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

        var activePageFun = clientSide.scope.getFunction(makeFName_activePage(pageKernel), true, ['state']);
        var initPageFun = clientSide.scope.getFunction(makeFName_initPage(pageKernel), true, ['state']);
        var pageLoadBlock = new FormatFileBlock('onLoad');
        var controlInitBlock = new FormatFileBlock('ctlinit');
        var userControlInitBlock = new FormatFileBlock('userctlinit');
        var activeTimeoutBlock = new FormatFileBlock('timeout');
        initPageFun.scope.getVar(VarNames.NeedSetState, true, '[]');
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
        initPageFun.pushLine('if(hadState){', 1);
        initPageFun.pushLine("state = setManyStateByPath(state,''," + VarNames.NeedSetState + ");", -1);
        initPageFun.pushLine('}else{', 1);
        initPageFun.pushLine("store.dispatch(makeAction_setManyStateByPath(" + VarNames.NeedSetState + ", ''));", -1);
        initPageFun.pushLine('}');
        initPageFun.retBlock.pushLine('return state;');

        var onloadFunName = pageKernel.id + '_' + AttrNames.Event.OnLoad;
        var onLoadBp = project.scriptMaster.getBPByName(onloadFunName);
        if (onLoadBp != null) {
            this.compileScriptBlueprint(onLoadBp, { nomsgbox: true });
            pageLoadBlock.pushLine('setTimeout(() => {' + makeStr_callFun(onloadFunName) + ';},50);');
        }

        if (isPopable) {
            // 弹出式窗体
        }
        else {
            // 非弹出式窗体
            activePageFun.pushLine(makeLine_Assign('state.nowPage', singleQuotesStr(pageKernel.id)));
            activePageFun.pushLine("if(" + makeActStr_getGDataCache(pageKernel.id + '_opened') + "){return state;}");
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


        renderBlock.pushChild(ctlTag);
        this.compileIsdisplayAttribute(theKernel, ctlTag);

        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongFormKernel = reactParentKernel.type == M_FormKernel_Type ? reactParentKernel : null;
        var parentMidData = this.projectCompiler.getMidData(reactParentKernel.id);
        if (parentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
            parentMidData.needSetKernels_arr.push(theKernel);
        }
        templateKernelMidData.inst_arr.push(theKernel);
        // param interface
        var attrsSetting = gUserControlAttsByType_map[theKernel.attrsSettingID];
        var paramGroup = attrsSetting.find(group => { return group.label == '属性接口'; });
        paramGroup.attrs_arr.forEach(paramAttribute => {
            var paramValue = theKernel.getAttribute(paramAttribute.name);
            var paramValueParseRet = parseObj_CtlPropJsBind(paramValue, project.scriptMaster);
            if (paramValueParseRet.isScript) {
                this.compileScriptAttribute(paramValueParseRet, theKernel, paramAttribute.label, paramAttribute.label, { autoSetFetchState: true });
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
                        };
                    }
                }
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        });

        if (templateReactClass.initFun) {
            kernelMidData.needSetStates_arr.push({
                isInitUserControlCall: true,
                funName: templateReactClass.initFun.name,
                kernel: theKernel,
            });
        }
        templateKernelMidData.needSetStateChangedActs_arr.forEach(actSetting => {
            this.clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisFullPath, actSetting.propName))] = actSetting.funName;
        });
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
        var isnullable = false;
        if (theKernel.isAEditor()) {
            isnullable = theKernel.parent.getAttribute(AttrNames.Nullable);
        }
        else {
            isnullable = theKernel.getAttribute(AttrNames.Nullable);
        }
        if (isnullable) {
            ctlTag.setAttr('nullable', '{true}');
        }
        renderBlock.pushChild(ctlTag);
        this.compileIsdisplayAttribute(theKernel, ctlTag);
        this.compileValidCheckerAttribute(theKernel);
        var editeable = theKernel.getAttribute(AttrNames.Editeable);
        if (!editeable) {
            ctlTag.setAttr('readonly', '{true}');
        }

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        var defaultCompileRet = null;
        if (defaultValParseRet.isScript) {
            defaultCompileRet = this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
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
            this.compileScriptAttribute(textFieldParseRet, theKernel, 'value', AttrNames.TextField, { autoSetFetchState: true });
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
            var hadDefaultStr = false;;
            if (!defaultValParseRet.isScript) {
                hadDefaultStr = !IsEmptyString(defaultValParseRet.string);
                if(hadDefaultStr){
                    alterValue = defaultValParseRet.string;
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
                        alterValue : alterValue,
                    };
                }
            }
            if (setValueStateItem == null) {
                if (!defaultValParseRet.isScript) {
                    setValueStateItem = {
                        name: 'value',
                        staticValue: IsEmptyString(defaultValParseRet.string) ? null : defaultValParseRet.string,
                        setNull: IsEmptyString(defaultValParseRet.string),
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
                        staticValue: IsEmptyString(defaultValParseRet.string) ? null : defaultValParseRet.string,
                        setNull: IsEmptyString(defaultValParseRet.string),
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
        this.compileIsdisplayAttribute(theKernel, ctlTag);
        this.compileValidCheckerAttribute(theKernel);
        var editeable = theKernel.getAttribute(AttrNames.Editeable);
        if (!editeable) {
            ctlTag.setAttr('readonly', '{true}');
        }

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        if (defaultValParseRet.isScript) {
            this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
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
            this.compileScriptAttribute(textFieldParseRet, theKernel, 'value', AttrNames.TextField, { autoSetFetchState: true });
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
            kernelMidData.needSetStates_arr.push(setValueStateItem);
        }
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
        var scriptCompileRet = this.compileScriptBlueprint(attrParseRet.jsBp);
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

                        scriptCompileRet.startFtech_bk.pushLine("state = " + makeStr_callFun('setManyStateByPath', [VarNames.State, VarNames.FullParentPath + "+'." + theKernel.id + "'", '{fetching:true,fetchingErr:null}']));
                    }
                }
                scriptCompileRet.finalCallBackReturn_bk.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, VarNames.FullParentPath + "+'." + theKernel.id + "'", 'needSetState']) + ';');
            }
            else {
                scriptCompileRet.finalCallBackReturn_bk.pushLine("return err == null ? data : null;");
            }
        }

        var visibleStyle = VisibleStyle_Both;
        var useFormData = belongFormKernel ? scriptCompileRet.useForm_map[belongFormKernel.id] : null;
        var bindMode = ScriptBindMode.OnForm;
        var useColumn = false;
        var useControl = false;
        var useCtlData = null;
        var delaySet = false;
        var pName;
        var propApiitem;
        if (useFormData) {
            useColumn = !IsEmptyObject(useFormData.useColumns_map);
            useControl = !IsEmptyObject(useFormData.useControls_map);
            if (useColumn) {
                visibleStyle = VisibleStyle_Update;
                delaySet = true;
            }
            else {
                if (useControl) {
                    bindMode = ScriptBindMode.OnRelAttrChanged;
                    for (var cid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[cid];
                        for (pName in useCtlData.useprops_map) {
                            propApiitem = useCtlData.useprops_map[pName];
                            this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.stateName, {
                                funName: scriptCompileRet.name,
                            });
                        }
                    }
                }
                else {
                    visibleStyle = VisibleStyle_Update;
                }
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
                    this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.stateName, {
                        funName: scriptCompileRet.name,
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
        kernelMidData.useFormData = useFormData;

        if (bindMode == ScriptBindMode.OnRelAttrChanged) {
            kernelMidData.isSelfCare = true;
        }
        var setStateItem = {
            name: stateName,
            isDynamic: true,
            funName: scriptCompileRet.name,
            bindMode: bindMode,
            useColumn: useColumn,
            useControl: useControl,
            delaySet: delaySet,
        };
        kernelMidData.needSetStates_arr.push(setStateItem);
        scriptCompileRet.setStateItem = setStateItem;
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
        }
        else {
            if (!isdisplay) {
                this.addNeedSetStateToParent(theKernel, { name: 'visible', staticValue: 'false' });
                ctlTag.setAttr('visible', '{false}');
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

        if (IsEmptyObject(label)) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '没有设置标签']);
            return false;
        }

        var parentForm = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var parentPath = this.getKernelParentPath(theKernel);
        var textFieldParseRet = parseObj_CtlPropJsBind(label, project.scriptMaster);

        var labeledCtrlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_LabeledControl', this.clientSide);
        labeledCtrlTag.class = layoutConfig.class;
        labeledCtrlTag.style = layoutConfig.style;
        labeledCtrlTag.setAttr('id', theKernel.id);
        labeledCtrlTag.setAttr('parentPath', parentPath);
        if (textFieldParseRet.isScript) {
            this.compileScriptAttribute(textFieldParseRet, theKernel, 'label', AttrNames.TextField, { autoSetFetchState: true });
        } else {
            labeledCtrlTag.setAttr('label', label);
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

        this.compileIsdisplayAttribute(theKernel, labeledCtrlTag);

        if (theKernel.editor) {
            this.compileKernel(theKernel.editor, childBlock, renderFun);
        }

        return labeledCtrlTag;
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
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-form');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var reactParentKernel = theKernel.getReactParentKernel(true);
        var belongUserControl = theKernel.searchParentKernel(UserControlKernel_Type, true);
        var belongUserCtlMidData = belongUserControl ? this.projectCompiler.getMidData(belongUserControl.id) : null;

        var formType = theKernel.getAttribute(AttrNames.FormType);
        var isPageForm = formType == EFormType.Page;
        var isGridForm = formType == EFormType.Grid;

        var thisfullpath = makeStr_DotProp(fullParentPath, theKernel.id);
        var pathVarName = theKernel.id + '_path';
        var useDS = theKernel.getAttribute(AttrNames.DataSource);
        if (useDS == null && isGridForm) {
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                'Grid表单需要数据源']);
            return false;
        }
        var tableStyleID = theKernel.id + "_tableStyle";
        var headTableStyleID = theKernel.id + "_headtableStyle";

        var formReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        var gridHeadPureRectClass = null;
        var gridHeadBodyPureRectClass = null;
        var gridBodyPureRectClass = null;

        var hadRowButton = false;
        var insertBtnSetting = null;
        var rowBtns_arr = [];

        switch (formType) {
            case EFormType.Page:
                formReactClass.constructorFun.pushLine('ERPC_PageForm(this);');
                break;
            case EFormType.Grid:
                insertBtnSetting = theKernel.getInsertSetting();
                formReactClass.constructorFun.pushLine('ERPC_GridForm(this);');
                gridHeadPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_THead', true, true);
                gridBodyPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_TBody', true, true);
                var tableBodyScrollFun = formReactClass.getFunction('tableBodyScroll', true, ['ev']);
                formReactClass.constructorFun.pushLine('this.' + tableBodyScrollFun.name + '=' + 'this.' + tableBodyScrollFun.name + '.bind(this);');
                tableBodyScrollFun.pushLine("document.getElementById('" + theKernel.id + "tableheader').scrollLeft = ev.target.scrollLeft;");

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
        }
        var renderContentFun = formReactClass.getFunction('renderContent', true);
        formReactClass.renderContentFun = renderContentFun;
        renderContentFun.scope.getVar(VarNames.RetElem, true, 'null');
        renderContentFun.scope.getVar(VarNames.NavElem, true, 'null');

        var ifFetingBlock = new JSFile_IF(VarNames.Fetching, "this.props.fetching");
        ifFetingBlock.trueBlock.pushLine(VarNames.RetElem + " = renderFetcingTipDiv();");
        renderContentFun.pushChild(ifFetingBlock);

        var ifFetchErrBlock = new JSFile_IF(VarNames.FetchErr, makeStr_ThisProp(VarNames.FetchErr));
        ifFetingBlock.falseBlock.pushChild(ifFetchErrBlock);
        ifFetchErrBlock.pushLine(VarNames.RetElem + " = renderFetcingErrDiv(" + makeStr_ThisProp(VarNames.FetchErr) + ".info);");

        var ifInvalidBundleBlock = new JSFile_IF(VarNames.InvalidBundle, makeStr_ThisProp(VarNames.InvalidBundle));
        ifFetchErrBlock.falseBlock.pushChild(ifInvalidBundleBlock);
        ifInvalidBundleBlock.pushLine(VarNames.RetElem + " = renderInvalidBundleDiv();");

        var renderContentBlock = ifInvalidBundleBlock.falseBlock;

        if (useDS != null) {
            var ifNowRecordBlock = new JSFile_IF('hadnowrecord', '!this.canInsert && this.props.nowRecord == null');
            if (isGridForm) {
                ifNowRecordBlock.condition = (insertBtnSetting ? 'this.state.hadNewRow != true && ' : '') + "!this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)";
            }
            ifInvalidBundleBlock.falseBlock.pushChild(ifNowRecordBlock);
            var noDataTip = theKernel.getAttribute(AttrNames.NoDataTip);
            if (IsEmptyString(noDataTip)) {
                noDataTip = '没有查询到数据';
            }
            ifNowRecordBlock.pushLine(VarNames.RetElem + " = <div className='m-auto'>" + noDataTip + "</div>;");
            renderContentBlock = ifNowRecordBlock.falseBlock;
        }

        var formStyleID = theKernel.id + '_style';
        var hasFormStyle = this.clientSide.addStyleObject(formStyleID, layoutConfig.style);
        var gridBottomDivBlock = new FormatFileBlock('gridBottom');

        var autoHeight = theKernel.getAttribute(AttrNames.AutoHeight);
        var childRenderBlock = null;
        if (isPageForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = (", 1);
            renderContentBlock.pushLine("<div className='d-flex flex-column " + layoutConfig.getClassName() + "'>", 1);
            renderContentBlock.pushLine("{this.props.title && <div className='bg-dark text-light justify-content-center d-flex flex-shrink-0'><span>{this.props.title}</span></div>}");
            renderContentBlock.pushLine("<div className='d-flex flex-grow-1 " + (orientation == Orientation_V ? ' flex-column' : '') + (autoHeight ? ' autoScroll_Touch' : '') + "'>", 1);
            childRenderBlock = new FormatFileBlock(theKernel.id + 'child');
            renderContentBlock.pushChild(childRenderBlock);
            renderContentBlock.pushLine('</div>');
            var navigaterBlock = new FormatFileBlock('navigater');
            if (theKernel.getAttribute(AttrNames.GenNavBar)) {
                navigaterBlock.pushLine("{this.renderNavigater()}");
            }
            formReactClass.navigaterBlock = navigaterBlock;
            renderContentBlock.pushChild(navigaterBlock);
            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine("</div>);");

            renderContentFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        }
        else if (isGridForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = <" + gridBodyPureRectClass.name + " startRowIndex={this.props.startRowIndex} endRowIndex={this.props.endRowIndex} form={this} fullPath={this.props.fullPath}" + (insertBtnSetting ? ' hadNewRow={this.state.hadNewRow}' : '') + " />");
            renderContentBlock.pushLine("if (this.props.pagebreak) {", 1);
            renderContentBlock.pushLine(VarNames.NavElem + " = <CBaseGridFormNavBar pageIndex={this.props.pageIndex} rowPerPage={this.props.rowPerPage} rowPerPageChangedHandler={this.rowPerPageChangedHandler} pageCount={this.props.pageCount} prePageClickHandler={this.prePageClickHandler} nxtPageClickHandler={this.nxtPageClickHandler} pageIndexChangedHandler={this.pageIndexChangedHandler} />", -1);
            renderContentBlock.pushLine("}");

            renderContentFun.pushLine('return (', 1);
            renderContentFun.pushLine("<div className='" + layoutConfig.getClassName() + "' " + (hasFormStyle ? "style={" + formStyleID + "}" : '') + ">", 1);
            renderContentFun.pushLine("{this.props.title && <div className='bg-dark text-light justify-content-center d-flex flex-shrink-0'><span>{this.props.title}</span></div>}");
            renderContentFun.pushLine("<div id='" + theKernel.id + "tableheader' className='mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv'>", 1);
            renderContentFun.pushLine("<table className='table' style={" + headTableStyleID + "}>", 1);
            renderContentFun.pushLine("<" + gridHeadPureRectClass.name + ' />', -1);
            if (gridHeadBodyPureRectClass) {
                renderContentFun.pushLine("<" + gridHeadBodyPureRectClass.name + ' form={this} />', -1);
            }
            renderContentFun.pushLine("</table>", -1);
            renderContentFun.pushLine("</div>");
            renderContentFun.pushLine("<div onScroll={this.tableBodyScroll} className='mw-100 autoScroll'>", 1);
            renderContentFun.pushLine("{" + VarNames.RetElem + "}");
            if (insertBtnSetting) {
                renderContentFun.pushLine("{!this.state.hadNewRow && <button onClick={this.clickNewRowHandler} type='button' className='btn btn-success' ><i className='fa fa-plus'/>新增</button>}");
            }
            renderContentFun.subNextIndent();
            renderContentFun.pushLine("</div>", -1);
            renderContentFun.pushChild(gridBottomDivBlock);
            renderContentFun.pushLine("{" + VarNames.NavElem + "}", -1);
            renderContentFun.pushLine('</div>);');
        }

        formReactClass.renderFun.pushLine(VarNames.RetElem + " = this.renderContent();");

        var formTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        formTag.setAttr('id', theKernel.id);
        formTag.setAttr('parentPath', parentPath);
        var pageBreak = false;
        var formTitle = theKernel.getAttribute(AttrNames.Title);
        if (!IsEmptyString(formTitle)) {
            formTag.setAttr('title', formTitle);
        }
        if (isGridForm) {
            pageBreak = theKernel.getAttribute(AttrNames.PageBreak);
            formTag.setAttr('pagebreak', bigbracketStr(pageBreak));
            formTag.setAttr('reBindAT', 'ReBind' + theKernel.id + "Page");
        }

        renderBlock.pushChild(formTag);

        formReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        formReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
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
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectMode), singleQuotesStr(theKernel.getAttribute(AttrNames.SelectMode))));
            formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectedRows_arr), 'ctlState.selectedRows_arr == null ? gEmptyArr : ctlState.selectedRows_arr'));
        }
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));

        var freshFun = clientSide.scope.getFunction(makeFName_freshForm(theKernel), true, [VarNames.ReState, VarNames.Records_arr, VarNames.OldValue, VarNames.SatePath]);
        freshFun.scope.getVar(pathVarName, true, makeStr_callFun('getParentPathByKey', [VarNames.SatePath, singleQuotesStr(theKernel.id)]));
        var bindFun = clientSide.scope.getFunction(makeFName_bindForm(theKernel), true, [VarNames.ReState, 'newIndex', 'oldIndex', VarNames.SatePath]);
        bindFun.scope.getVar(pathVarName, true, makeStr_callFun('getParentPathByKey', [VarNames.SatePath, singleQuotesStr(theKernel.id)]));

        if (useDS) {
            if (belongUserControl) {
                belongUserCtlMidData.needSetStateChangedActs_arr.push(
                    {
                        propName: makeStr_DotProp(thisfullpath, VarNames.Records_arr),
                        funName: freshFun.name + '.bind(window)',
                    }
                );
            }
            else {
                clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.Records_arr))] = freshFun.name + '.bind(window)';
            }
            if (isPageForm) {
                if (belongUserControl) {
                    belongUserCtlMidData.needSetStateChangedActs_arr.push(
                        {
                            propName: makeStr_DotProp(thisfullpath, VarNames.RecordIndex),
                            funName: makeFName_bindForm(theKernel) + '.bind(window)',
                        }
                    );
                }
                else {
                    clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.RecordIndex))] = makeFName_bindForm(theKernel) + '.bind(window)';
                }
                freshFun.pushLine(makeStr_callFun('simpleFreshFormFun', [VarNames.ReState, VarNames.Records_arr, pathVarName, bindFun.name], ';'));
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
                freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState, 'null', 'null', VarNames.SatePath]) + ';');
            }
        }
        else {
            freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState, 'null', 'null', VarNames.SatePath]));
        }

        bindFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, pathVarName, '{}'));
        if (useDS) {
            bindFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
        }
        bindFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        var bundleVar = bindFun.scope.getVar('bundle', true, '{}');
        var saveInsertBlock = null;
        var saveInsertIfBlock = null;
        var insertModeIf = null;
        var hadInsertCacheIf = null;
        var hadInsertCacheTrueDynamicBlock = null;
        var hadInsertCacheFlaseDynamicBlock = null;

        var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongForm = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var belongPageMidData = belongPage ? this.projectCompiler.getMidData(belongPage.id) : null;
        var belongFormMidData = belongForm ? this.projectCompiler.getMidData(belongForm.id) : null;
        var thisFormMidData = this.projectCompiler.getMidData(theKernel.id);
        thisFormMidData.needSetKernels_arr = [];
        thisFormMidData.useColumns_map = [];
        thisFormMidData.useControls_map = [];
        thisFormMidData.useDS = useDS;
        thisFormMidData.freshFun = freshFun;
        thisFormMidData.bindFun = bindFun;
        thisFormMidData.belongPage = belongPage;
        thisFormMidData.belongForm = belongForm;
        thisFormMidData.belongUserControl = belongUserControl;
        thisFormMidData.isPageForm = isPageForm;
        thisFormMidData.isGridForm = isGridForm;
        var bindNowRecordBlock = new FormatFileBlock('bindbowrow');
        var bindEndBlock = new FormatFileBlock('bindend');
        bindFun.bindEndBlock = bindEndBlock;
        var formCanInsert = false;
        var bindInersetBlock = null;

        var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true, [VarNames.ReState, VarNames.HoldSelected, 'fullParentPath']);
        pullFun.scope.getVar(VarNames.HadStateParam, true, VarNames.ReState + '!=null');

        if (!useDS) {
            pullFun.retBlock.pushLine(makeLine_Return(VarNames.ReState));
            pullFun.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(bindFun.name, [VarNames.ReState])));

            if (belongFormMidData != null) {
                belongFormMidData.pullFun.beforeRetBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun(pullFun.name, [VarNames.ReState, 'true', "fullParentPath + '." + belongForm.id + "'"]));
            }
            else {
                var pageInitFun = clientSide.scope.getFunction(makeFName_initPage(belongPage));
                pageInitFun.pushLine(makeLine_Assign(VarNames.State, makeStr_callFun(bindFun.name, [VarNames.State, 'null', 'null', "fullParentPath + '." + theKernel.id + "'"])));
            }
        }
        else {
            pullFun.retBlock.pushLine(makeLine_Return(VarNames.State));
            pullFun.scope.getVar(VarNames.State, true, makeStr_AddAll(VarNames.HadStateParam, ' ? ', VarNames.ReState, ' : ', 'store.getState()'));
        }

        var belongAccordionKernel = null;
        var belongAccordionMidData = null;
        if(reactParentKernel.type == Accordion_Type){
            belongAccordionKernel = reactParentKernel;
            belongAccordionMidData = this.projectCompiler.getMidData(belongAccordionKernel.id);
            belongAccordionMidData.needSetKernels_arr.push(theKernel);
            belongAccordionMidData.needCallOnInit_arr.push({
                name:pullFun.name,
                params_arr:['null','null','this.props.fullPath']
            });
        }

        var dynamicSetBlock_hadRecord = new FormatFileBlock('dynamicbindhadrow');
        var staticBindBlock = new FormatFileBlock('static');
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
            if (isGridForm) {
                pullFun.pushLine('if(!' + VarNames.HoldSelected + '){', 1);
                pullFun.pushLine('store.dispatch(makeAction_setStateByPath(null,' + singleQuotesStr(theKernel.getStatePath(VarNames.SelectedRows_arr)) + '));', -1);
                pullFun.pushLine('}');
            }
            pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), 'fullParentPath', singleQuotesStr(theKernel.id), singleQuotesStr(VarNames.Records_arr), { bundle: 'bundle' }, false), -1);
            pullFun.pushLine('}, 50);');

            // gen back pull
            var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req', 'res']);
            serverSide.initProcessFun(serverPullFun);
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
                    rowBtns_arr.forEach(btnSetting => {
                        btnsVarStr += (btnsVarStr.length == 0 ? '' : ',') + "{key:'" + btnSetting.key + "',content:" + btnSetting.elemText + "}";
                        this.compileScriptBlueprint(btnSetting.blueprint, {
                            funName: btnSetting.funName,
                            scope: formReactClass,
                            actLabel: btnSetting.actLabel
                        });
                    });
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

        var ci;
        var childKernel;
        var contentBlock = new FormatFileBlock('content');

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
                saveInsertIfBlock = new JSFile_IF('saveinsert', 'oldIndex == -1');
                saveInsertBlock.pushChild(saveInsertIfBlock);
                bindFun.saveInsertBlock = saveInsertIfBlock.trueBlock;
                insertModeIf.trueBlock.pushLine(makeLine_Assign('var ' + VarNames.InsertCache, makeStr_getStateByPath("formState", singleQuotesStr(VarNames.InsertCache))));
                hadInsertCacheIf = new JSFile_IF(VarNames.InsertCache, VarNames.InsertCache);
                hadInsertCacheTrueDynamicBlock = new FormatFileBlock('hadInsertCacheTrueDynamicBlock');
                hadInsertCacheFlaseDynamicBlock = new FormatFileBlock('hadInsertCacheFlaseDynamicBlock');
                insertModeIf.trueBlock.pushChild(hadInsertCacheIf);

                formReactClass.constructorFun.pushLine('this.canInsert = true;');
            }
        }

        var gridColumnsProfile_obj = {};
        var gridColumnCount = 0;

        if (isGridForm) {
            var sumTableWidth = 0;
            var gridWidthType = theKernel.getAttribute(AttrNames.WidthType);
            gridHeadPureRectClass.renderFun.pushLine('return (<thead className="thead-dark"><tr>', 1);
            var gridHeadRowRenderBlock = new FormatFileBlock('tr');
            gridHeadPureRectClass.renderFun.pushChild(gridHeadRowRenderBlock, -1);
            gridHeadPureRectClass.renderFun.pushLine('</tr></thead>);');
            var gridHeadBodyRowRenderBlock = null;
            if (gridHeadBodyPureRectClass) {
                gridHeadBodyPureRectClass.renderFun.pushLine(VarNames.RetElem + ' = (<tbody><tr>', 1);
                gridHeadBodyRowRenderBlock = new FormatFileBlock('tr');
                gridHeadBodyPureRectClass.renderFun.pushChild(gridHeadBodyRowRenderBlock, -1);
                gridHeadBodyPureRectClass.renderFun.pushLine('</tr></tbody>);');
            }

            var selectMode = theKernel.getAttribute(AttrNames.SelectMode);
            if (selectMode != ESelectMode.None) {
                sumTableWidth += 3.5;
                gridHeadRowRenderBlock.pushLine("<th scope='col' className='selectorTableHeader'></th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td className='selectorTableHeader'></td>");
                }
                formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.SelectMode), singleQuotesStr(selectMode)));
            }
            var autoIndexColumn = theKernel.getAttribute(AttrNames.AutoIndexColumn);
            if (autoIndexColumn) {
                sumTableWidth += 3;
                gridHeadRowRenderBlock.pushLine("<th scope='col' className='indexTableHeader'>序号</th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td className='indexTableHeader'></td>");
                }
            }

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

                var columnWidth = parseFloat(childKernel.getAttribute(AttrNames.ColumnWidth));
                var headTextValue = childKernel.getAttribute(AttrNames.TextField);
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
                columnWidth = Math.round(10 * columnWidth);
                sumTableWidth += columnWidth;
                gridColumnsProfile_obj[childKernel.id] = {
                    width: columnWidth,
                    kernel: childKernel,
                    label: headTextValue,
                    index: gridColumnCount++,
                };
            }
            var gridHeadStyles_map = {};
            var gridHeadStyleCount = 0;
            var columnProfile;
            for (var gi in gridColumnsProfile_obj) {
                columnProfile = gridColumnsProfile_obj[gi];
                var headStyleObj = gridHeadStyles_map[columnProfile.width];
                var tdStyleObj = gridHeadStyles_map[columnProfile.width + 'td'];
                if (headStyleObj == null) {
                    var headStyleID = theKernel.id + 'headstyle' + gridHeadStyleCount;
                    var tdStyleID = theKernel.id + 'tdstyle' + gridHeadStyleCount;
                    ++gridHeadStyleCount;
                    if (gridWidthType == EGridWidthType.Fixed) {
                        headStyleObj = {
                            width: (columnProfile.width / 10) + 'em',
                        };
                    }
                    else {
                        headStyleObj = {
                            width: (Math.round(1000 * columnProfile.width / sumTableWidth) / 10) + '%',
                        };
                    }
                    headStyleObj[AttrNames.StyleAttrNames.MaxWidth] = headStyleObj.width;
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

                gridHeadRowRenderBlock.pushLine("<th scope='col' style={" + headStyleObj.id + "}>" + columnProfile.label + "</th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td style={" + headStyleObj.id + "}></td>");
                }
            }
            if (hadRowButton || insertBtnSetting) {
                gridHeadRowRenderBlock.pushLine("<th scope='col'></th>");
                if (gridHeadBodyRowRenderBlock) {
                    gridHeadBodyRowRenderBlock.pushLine("<td><VisibleERPC_GridForm_BtnCol form={this.props.form} /></td>");
                }
            }

            var gridTableStyle = {
                marginTop: '-50px',
            };
            var gridHeadTableStyle = {
                marginBottom: '0px',
            };
            if (gridWidthType == EGridWidthType.Fixed) {
                gridTableStyle.width = sumTableWidth + 'em';
                gridHeadTableStyle.width = sumTableWidth + 'em';
            }
            this.clientSide.addStyleObject(tableStyleID, gridTableStyle);
            this.clientSide.addStyleObject(headTableStyleID, gridHeadTableStyle);

            var bindPageFun = this.clientSide.scope.getFunction(makeFName_bindFormPage(theKernel), true, [VarNames.ReState, 'formPath']);
            //clientSide.addReducer('ReBind' + theKernel.id + "Page", bindPageFun.name + '.bind(window)');
            bindPageFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, 'formPath', '{}'));
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
            bindPageFun.pushLine('for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {', 1);
            bindPageFun.pushLine('var ' + VarNames.NowRecord + ' = records_arr[rowIndex];');

            bindPageFun.pushChild(staticBindBlock);
            bindPageFun.pushChild(bindNowRecordBlock);
            bindPageFun.pushChild(dynamicSetBlock_hadRecord);
            bindPageFun.subNextIndent(2);
            bindPageFun.pushLine('}');
            bindPageFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.StartRowIndex), VarNames.StartRowIndex));
            bindPageFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.NeedSetState, VarNames.EndRowIndex), VarNames.EndRowIndex));
            bindPageFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, 'formPath', VarNames.NeedSetState], ';'));

            gridBodyPureRectClass.renderFun.scope.getVar('trElems_arr', true, '[]');
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.StartRowIndex, true, makeStr_DotProp('this.props', VarNames.StartRowIndex));
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.EndRowIndex, true, makeStr_DotProp('this.props', VarNames.EndRowIndex));
            gridBodyPureRectClass.renderFun.pushLine('for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {', 1);
            gridBodyPureRectClass.renderFun.pushLine('trElems_arr.push(', 1);
            if (selectMode != ESelectMode.None) {
                gridBodyPureRectClass.renderFun.pushLine(makeStr_AddAll('<VisibleERPC_GridSelectableRow key={rowIndex-', VarNames.StartRowIndex, '} ', 'rowIndex={rowIndex} form={this.props.form}>'));
            }
            else {
                gridBodyPureRectClass.renderFun.pushLine(makeStr_AddAll('<tr key={rowIndex-', VarNames.StartRowIndex, '}>'));
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
            gridBodyPureRectClass.renderFun.retBlock.pushLine("return (<table className='table table-striped table-hover ' style={" + tableStyleID + "}>", 1);
            gridBodyPureRectClass.renderFun.retBlock.pushLine(makeStr_AddAll('<', gridHeadPureRectClass.name, ' />'));
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
                gridBodyPureRectClass.renderFun.pushLine("rowIndex = 'new';");
                gridBodyPureRectClass.renderFun.pushLine('trElems_arr.push(', 1);
                gridBodyPureRectClass.renderFun.pushLine('<tr key={rowIndex}>', 1);
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
                childRederBlock.pushLine("<td style={" + columnProfile.tdStyleID + '}>', 1);
                if (this.compileKernel(childKernel, childRederBlock, renderFun) == false) {
                    return false;
                }
                childRederBlock.subNextIndent();
                childRederBlock.pushLine('</td>');
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

            if (hadRowButton || insertBtnSetting) {
                gridBodyTableRowRenderBlock.pushLine("<td><VisibleERPC_GridForm_BtnCol rowIndex={rowIndex} form={this.props.form} /></td>");
                if (insertBtnSetting) {
                    gridBodyTableNewRowRenderBlock.pushLine("<td><VisibleERPC_GridForm_BtnCol rowIndex={rowIndex} form={this.props.form} /></td>");
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
                        if (isGridForm) {
                            stateName = "row_'+rowIndex+'." + orginStateName;
                            if (stateItem.isDynamic) {
                                switch (stateItem.bindMode) {
                                    case ScriptBindMode.OnForm:
                                        bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, 'null', "formPath + '.row_' + rowIndex"])));
                                        break;
                                    case ScriptBindMode.OnNewRow:
                                        staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "row_new." + orginStateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, 'null', "formPath + '.row_new'"])));
                                        break;
                                }
                            } else {
                                if (stateItem.staticValue) {
                                    var sv = stateItem.staticValue;
                                    switch (sv.toLocaleLowerCase()) {
                                        case 'true':
                                        case 'false':
                                            break;
                                        default:
                                            sv = singleQuotesStr(sv);
                                    }
                                    switch (stateItem.bindMode) {
                                        case ScriptBindMode.OnForm:
                                            bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), sv));
                                            break;
                                        case ScriptBindMode.OnNewRow:
                                            staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, "row_new." + orginStateName), sv));
                                            break;
                                    }
                                }
                                else if (stateItem.useColumn) {
                                    bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_DynamicAttr(VarNames.NowRecord, stateItem.useColumn.name)));
                                }
                                else if (stateItem.setNull) {
                                    switch (stateItem.bindMode) {
                                        case ScriptBindMode.OnForm:
                                            bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
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
                                if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                    setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, bundleVar.name, pathVarName]));
                                    var otherUseColumnSetState = targetKernelMidData.needSetStates_arr.find(item=>{
                                        return item != stateItem && item.name == stateItem.name && !item.isDynamic && item.useColumn;
                                    });
                                    if(formCanInsert){
                                        if(otherUseColumnSetState){
                                            // 有另一个设值用的是数据列
                                            if (!stateItem.useColumn) {
                                                // 方法没有用到数据列，在insert模式中触发
                                                targetBlocks.push(hadInsertCacheFlaseDynamicBlock);
                                            }
                                        }
                                        else{
                                            // 此控件只有这一个设值项
                                            needSaveThisState = true;
                                            needResetThisState = false;
                                            if (stateItem.useColumn) {
                                                targetBlocks.push(insertModeIf.falseBlock);
                                            }
                                            else{
                                                targetBlocks.push(hadInsertCacheFlaseDynamicBlock);
                                                targetBlocks.push(insertModeIf.falseBlock);
                                            }
                                        }
                                    }
                                    else{
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
                            if(needSaveThisState){
                                saveInsertIfBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InsertCache + '.' + state_Name), makeStr_getStateByPath('formState', singleQuotesStr(stateName))));
                                hadInsertCacheIf.trueBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), VarNames.InsertCache + '.' + state_Name));
                                if(needResetThisState){
                                    hadInsertCacheIf.falseBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), stateItem.alterValue ? stateItem.alterValue : 'null'));
                                }
                            }
                            targetBlocks.forEach(blk=>{
                                blk.pushLine(setLine);
                            });
                        }
                    });
                }
            }
        }

        if(hadInsertCacheIf){
            hadInsertCacheIf.trueBlock.pushChild(hadInsertCacheTrueDynamicBlock);
            hadInsertCacheIf.falseBlock.pushChild(hadInsertCacheFlaseDynamicBlock);
        }

        if (isPageForm) {
            if (useDS) {
                bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.NowRecord), VarNames.NowRecord));
            }
        }

        bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InvalidBundle), 'false'));
        bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, pathVarName, VarNames.NeedSetState]) + ';');
        bindFun.retBlock.pushChild(bindEndBlock);
        bindFun.retBlock.pushLine('return ' + VarNames.ReState + ';');
    }

    compileContainerKernel(theKernel, renderBlock, renderFun) {
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-control');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var styleID = theKernel.id + '_style';
        var styleStr = this.clientSide.addStyleObject(styleID, layoutConfig.style) ? 'style={' + styleID + '}' : '';
        renderBlock.pushLine("<div className='" + layoutConfig.getClassName() + "' " + styleStr + ">", 1);
        renderBlock.pushChild(childRenderBlock);
        renderBlock.subNextIndent();
        renderBlock.pushLine('</div>');

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
        renderBlock.pushChild(ctlTag);

        this.compileIsdisplayAttribute(theKernel, ctlTag);

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);

        var textFieldParseRet = parseObj_CtlPropJsBind(textField, project.scriptMaster);
        if (textFieldParseRet.isScript) {
            this.compileScriptAttribute(textFieldParseRet, theKernel, 'text', AttrNames.TextField, { autoSetFetchState: true });
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
    }

    compileButtonKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Button', this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        ctlTag.addClass('btn');
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        ctlTag.setAttr('id', theKernel.id);
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('parentPath', parentPath);
        ctlTag.pushChild(new FormatFile_Line(theKernel.getAttribute(AttrNames.Name)));
        renderBlock.pushChild(ctlTag);


        var reactParentKernel = theKernel.getReactParentKernel(true);
        this.compileIsdisplayAttribute(theKernel, ctlTag);

        var onclickFunName = theKernel.id + '_' + AttrNames.Event.OnClick;
        var onClickBp = project.scriptMaster.getBPByName(onclickFunName);
        if (onClickBp != null) {
            var compileRet = this.compileScriptBlueprint(onClickBp, { params: ['ev'] });
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
                        if (useFormTable && useFormTable.useStage[EUseEntityStage.Insert]) {
                            // insert了form的操作表，认定为insert按钮
                            visibleType = EButtonVisibleType.Insert;
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

        var title = theKernel.getAttribute(AttrNames.Title);

        var ctlTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        if(!IsEmptyString(title)){
            ctlTag.setAttr('defaultTitle', title);
        }
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            ctlTag.setAttr('bodyIsColumn', '{true}');
        }
        var initCollapsed = theKernel.getAttribute(AttrNames.InitCollapsed);
        ctlTag.setAttr('initcollapsed', '{' + initCollapsed + '}');

        this.compileIsdisplayAttribute(theKernel, ctlTag);
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.needCallOnInit_arr = [];

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.pushLine(VarNames.RetElem + " = this.commonRender();");
        var renderBodyFun = controlReactClass.getFunction('rednerBody', true);
        renderBodyFun.pushLine("return <React.Fragment>",1);
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
                        var stateName = targetKernel.getStatePath(stateItem.name,'.',{},false,theKernel);
                        var setNeedStateLeftStr = VarNames.NeedSetState + '[' + thisFullPathVarName + "+'." + stateName + "']";
                        if (stateItem.isDynamic) {
                            var setLine = makeLine_Assign(setNeedStateLeftStr, makeStr_callFun(stateItem.funName, [VarNames.State, 'null', thisFullPathVarName]));
                            rebindBodyFun.pushLine(setLine);
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
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
        ctlMidData.needCallOnInit_arr.forEach(callSetting=>{
            rebindBodyFun.pushLine(makeStr_callFun(callSetting.name,callSetting.params_arr,';'));
        });
        return true;
    }

    compileTabControlKernel(theKernel, renderBlock, renderFun) {
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var controlReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        controlReactClass.constructorFun.pushLine('this.clickNavBtn = this.clickNavBtn.bind(this);');
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-column');
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

        this.compileIsdisplayAttribute(theKernel, ctlTag);
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];

        var clickNavBtnFun = controlReactClass.getFunction('clickNavBtn', true, ['ev']);
        clickNavBtnFun.pushLine('var itemid = ' + makeStr_callFun('getAttributeByNode', ['ev.target', "'d-id'"],';'));
        clickNavBtnFun.pushLine("store.dispatch(makeAction_setStateByPath(itemid,this.props.fullPath + '.selectedIndex'));");

        var renderItemFun = controlReactClass.getFunction('renderChild', true);
        controlReactClass.constructorFun.pushLine('this.' + renderItemFun.name + ' = this.' + renderItemFun.name + '.bind(this);');
        var itemSwitchBlock = new JSFile_Switch('renderItem', 'this.props.selectedIndex');
        
        var navBtnBlk = new FormatFileBlock('navbtn');
        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.scope.getVar('childElem',true);
        selftRenderBlock.pushChild(itemSwitchBlock);
        selftRenderBlock.pushLine(VarNames.RetElem + " = <div className='" + layoutConfig.getClassName() + "' " + styleStr + ">", 1);
        selftRenderBlock.pushLine("<div className='btn-group flex-grow-0 flex-shrink-0 border-bottom'>");
        selftRenderBlock.pushChild(navBtnBlk);
        selftRenderBlock.subNextIndent();
        selftRenderBlock.pushLine('</div>');
        selftRenderBlock.pushLine('{childElem}');
        selftRenderBlock.subNextIndent();
        selftRenderBlock.pushLine('</div>');

        controlReactClass.mapStateFun.scope.getVar('propProfile', true, "getControlPropProfile(ownprops, state)");
        controlReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "propProfile.ctlState");
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullParentPath), makeStr_DotProp('propProfile', VarNames.FullParentPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FullPath), makeStr_DotProp('propProfile', VarNames.FullPath)));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'visible'), makeStr_DotProp(VarNames.CtlState, 'visible != false')));
        controlReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'selectedIndex'), makeStr_DotProp(VarNames.CtlState, 'selectedIndex') + (defaultTabitemID == '0' ? '' : ' ? ' + makeStr_DotProp(VarNames.CtlState, 'selectedIndex') + ' : ' + singleQuotesStr(defaultTabitemID))));

        var isGreedMode = theKernel.getAttribute(AttrNames.GreedMode);
        var navBtnClassStr = "'btn " + (isGreedMode ? 'flex-grow-1 flex-shrink-1 ' : '') + "'";
        for (var ci in theKernel.children) {
            var childKernel = theKernel.children[ci];
            var childRenderBlock = new FormatFileBlock(childKernel.id);
            var childCaseBlock = itemSwitchBlock.getCaseBlock(singleQuotesStr(childKernel.id));
            childCaseBlock.pushLine('childElem =(', 1);
            childCaseBlock.pushChild(childRenderBlock);
            childCaseBlock.subNextIndent();
            childCaseBlock.pushLine(')');
            navBtnBlk.pushLine("<button type='button' onClick={this.clickNavBtn} d-id="+singleQuotesStr(childKernel.id)+" className={" + navBtnClassStr + '+(this.props.selectedIndex == '+singleQuotesStr(childKernel.id)+" ? 'btn-primary' : 'btn-dark')}" + ">" + childKernel.getAttribute(AttrNames.Title) + "</button>");

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

        var ctlTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        this.modifyControlTag(theKernel, ctlTag);
        var parentPath = this.getKernelParentPath(theKernel);
        var parentFullPath = this.getKernelFullParentPath(theKernel);
        var thisFullPath = makeStr_DotProp(parentFullPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('w-100');
        layoutConfig.addClass('h-100');
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }
        renderBlock.pushChild(ctlTag);

        var ctlMidData = this.projectCompiler.getMidData(theKernel.id);
        ctlMidData.needSetKernels_arr = [];
        ctlMidData.needCallOnInit_arr = [];

        var renderBodyFun = selftRenderBlock;
        var rebindBodyFun = controlReactClass.getFunction('rebindBody', true);

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var selftRenderBlock = controlReactClass.renderFun;
        selftRenderBlock.pushLine('if(this.props.inited == false){this.rebindBody(); return null;}');
        selftRenderBlock.pushLine('this.initing = false;');
        selftRenderBlock.pushLine(VarNames.RetElem + " = <div className='"+ layoutConfig.class +"'>");
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
                        var stateName = targetKernel.getStatePath(stateItem.name,'.',{},false,theKernel);
                        var setNeedStateLeftStr = VarNames.NeedSetState + '[' + thisFullPathVarName + "+'." + stateName + "']";
                        if (stateItem.isDynamic) {
                            var setLine = makeLine_Assign(setNeedStateLeftStr, makeStr_callFun(stateItem.funName, [VarNames.State, 'null', thisFullPathVarName]));
                            rebindBodyFun.pushLine(setLine);
                        } else {
                            if (stateItem.staticValue) {
                                var sv = stateItem.staticValue;
                                switch (sv.toLocaleLowerCase()) {
                                    case 'true':
                                    case 'false':
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
        ctlMidData.needCallOnInit_arr.forEach(callSetting=>{
            rebindBodyFun.pushLine(makeStr_callFun(callSetting.name,callSetting.params_arr,';'));
        });
        return true;
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
        var starSelectable = theKernel.getAttribute(AttrNames.StarSelectable);
        renderBlock.pushChild(ctlTag);
        var ismultiselect = theKernel.getAttribute(AttrNames.MultiSelect);
        if (ismultiselect) {
            ctlTag.setAttr('multiselect', '{true}');
            starSelectable = false; // 多选控件不可选星
        }
        var stableData = theKernel.getAttribute(AttrNames.StableData);
        if (stableData) {
            ctlTag.setAttr('pullOnce', '{true}');
        }
        var nullable = theKernel.getAttribute(AttrNames.Nullable);
        if (nullable) {
            ctlTag.setAttr('nullable', '{true}');
        }
        this.compileIsdisplayAttribute(theKernel, ctlTag);
        this.compileValidCheckerAttribute(theKernel);

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        if (defaultValParseRet.isScript) {
            this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
        }
        else {
            if (IsEmptyString(defaultValParseRet.string)) {
                if (starSelectable) {
                    defaultValParseRet.string = '*';    // 可选*，但默认值未设置，自动给个*
                }
            }
            else {
                if (defaultValParseRet.string == '*' && !starSelectable) {
                    if (!ismultiselect) {
                        starSelectable = true;  // 给了个*默认值，自动开启可选*
                    }
                }
            }
        }

        if (starSelectable) {
            ctlTag.setAttr('starSelectable', '{true}');
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
        ctlTag.setAttr('pullDataSource', '{' + pullFun.name + '}');
        ctlTag.setAttr('textAttrName', fromTextfield);
        ctlTag.setAttr('valueAttrName', fromValuefield);
        if (theKernel.parent.type == M_LabeledControlKernel_Type) {
            ctlTag.setAttr('label', theKernel.parent.getAttribute(AttrNames.TextField));
        }
        //clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath,VarNames.Records_arr))] = freshFun.name + '.bind(window)';
        pullFun.pushLine('var bundle = {};');
        pullFun.pushLine('var useState = store.getState();');
        if (belongUserControl) {
            pullFun.pushLine('var ' + belongUserControl.id + '_path = getBelongUserCtlPath(parentPath);');
            pullFun.pushLine('var ' + belongUserControl.id + '_state = getStateByPath(useState,' + belongUserControl.id + '_path);');
        }
        var initbundleBlock = new FormatFileBlock('initbundle');
        pullFun.scope.getVar(VarNames.RowIndexInfo_map, true, 'getRowIndexMapFromPath(' + VarNames.ParentPath + ')');
        pullFun.pushChild(initbundleBlock);
        pullFun.initbundleBlock = initbundleBlock;
        pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), VarNames.ParentPath, singleQuotesStr(theKernel.id), singleQuotesStr('options_arr'), { bundle: 'bundle' }, false));

        var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req', 'res']);
        serverSide.initProcessFun(serverPullFun);
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

        var autoClearValue = theKernel.getAttribute(AttrNames.AutoClearValue);
        var needSetParams_arr = [];
        if (!IsEmptyObject(bpCompileHelper.useGlobalControls_map)) {
            for (var ctlSI in bpCompileHelper.useGlobalControls_map) {
                var useCtl = bpCompileHelper.useGlobalControls_map[ctlSI];
                for (var useProp in useCtl.useprops_map) {
                    var propApi = useCtl.useprops_map[useProp];
                    var useName = useCtl.kernel.id + '_' + propApi.stateName;
                    needSetParams_arr.push({ bundleName: useName, clientValue: useName });

                    if (autoClearValue) {
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'text', useCtl.kernel, propApi.stateName, {
                            value: 'null',
                        });
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'value', useCtl.kernel, propApi.stateName, {
                            value: 'null',
                        });
                    }
                    if (stableData) {
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'options_arr', useCtl.kernel, propApi.stateName, {
                            value: 'null',
                        });
                    }
                    var propValue = makeStr_getStateByPath('useState', singleQuotesStr(makeStr_DotProp(useCtl.kernel.parentPath, useCtl.kernel.id + '.' + propApi.stateName)));
                    if (belongUserControl) {
                        if (useCtl.kernel == belongUserControl) {
                            // 所属的自订控件
                            propValue = makeStr_DotProp(belongUserControl.id + '_state', propApi.stateName);
                        }
                        else {
                            propValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(makeStr_DotProp(this.getKernelFullParentPath(useCtl.kernel), useCtl.kernel.id, propApi.stateName)));
                        }
                    }

                    initbundleBlock.pushLine(makeLine_Assign(makeStr_DotProp('bundle', useName), propValue));
                }
            }
        }

        if (!IsEmptyObject(bpCompileHelper.useForm_map)) {
            for (var formSI in bpCompileHelper.useForm_map) {
                var useForm = bpCompileHelper.useForm_map[formSI];
                for (var ctlSI in useForm.useControls_map) {
                    var useCtl = useForm.useControls_map[ctlSI];
                    for (var useProp in useCtl.useprops_map) {
                        var propApi = useCtl.useprops_map[useProp];
                        var useName = useCtl.kernel.id + '_' + propApi.stateName;
                        needSetParams_arr.push({ bundleName: useName, clientValue: useName });

                        if (autoClearValue) {
                            this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'text', useCtl.kernel, propApi.stateName, {
                                value: 'null',
                            });
                            this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'value', useCtl.kernel, propApi.stateName, {
                                value: 'null',
                            });
                        }
                        if (stableData) {
                            this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'options_arr', useCtl.kernel, propApi.stateName, {
                                value: 'null',
                            });
                        }
                        initbundleBlock.pushLine(makeLine_Assign(makeStr_DotProp('bundle', useName), makeStr_getStateByPath('useState', singleQuotesStr(useCtl.kernel.getStatePath(propApi.stateName, '.', { mapVarName: VarNames.RowIndexInfo_map })))));
                    }
                }
            }
        }

        if (!IsEmptyObject(bpCompileHelper.usePageParam)) {
            for (var usPageParamName in bpCompileHelper.usePageParam) {
                var usePageParamObj = { bundleName: 'pagein_' + usPageParamName, clientValue: makeStr_callFun('getPageEntryParam', [singleQuotesStr(belongPageKernel.id), singleQuotesStr(usPageParamName), bpCompileHelper.usePageParam[usPageParamName]]) };
                needSetParams_arr.push(usePageParamObj);
                initbundleBlock.pushLine(makeLine_Assign(makeStr_DotProp('bundle', usePageParamObj.bundleName), usePageParamObj.clientValue));
            }
        }

        if (needSetParams_arr.length > 0) {
            bodyCheckblock.pushLine("var bundle=req.body.bundle;");
            bodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '};');
            paramsetblock.pushLine("params_arr=[", 1);
            for (var si in needSetParams_arr) {
                var useParam = needSetParams_arr[si];
                var serverValue = ReplaceIfNull(useParam.serverValue, 'bundle.' + useParam.bundleName);
                paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.bundleName + "', sqlTypes.NVarChar(4000), " + serverValue + "),");
                bodyCheckblock.pushLine("if(req.body.bundle." + useParam.bundleName + " == null){" + makeLine_RetServerError('没有提供' + useParam.bundleName) + '};');
            }
        }

        if (!IsEmptyObject(bpCompileHelper.useEnvVars)) {
            if (paramsetblock.childs_arr.length == 0) {
                paramsetblock.pushLine("params_arr=[", 1);
            }
            //bodyCheckblock.pushLine("if(req.session.g_envVar == null){" + makeLine_RetServerError('登录信息失效，无法使用') + '};');
            for (var useEnvName in bpCompileHelper.useEnvVars) {
                paramsetblock.pushLine("dbhelper.makeSqlparam('" + useEnvName + "', sqlTypes.NVarChar(4000), req.session.g_envVar." + useEnvName + "),");
            }
        }

        if (paramsetblock.childs_arr.length > 0) {
            paramsetblock.subNextIndent();
            paramsetblock.pushLine('];');
        }

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
                if(hadDefaultStr){
                    alterValue = defaultValParseRet.string;
                }
            }

            if (reactParentKernel.type == M_FormKernel_Type) {
                var belongFormKernel = reactParentKernel;
                var formColumns_arr = belongFormKernel.getCanuseColumns();
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
                            alterValue:alterValue,
                        };
                        if(setTextStateItem == null){
                            setTextStateItem = {
                                name: 'text',
                                setNull: true,
                            };
                        }
                    }
                }
                else if(setTextStateItem){
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
                        alterValue:alterValue,
                    };
                    setTextStateItem.alterValue = alterValue;
                }
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
                    }
                }
            }

            if (setTextStateItem != null) {
                kernelMidData.needSetStates_arr.push(setTextStateItem);
            }
            if (setValueStateItem != null) {
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        }
    }

    compileEnd() {
        var clientSide = this.clientSide;

        super.compileEnd();
    }

    getString(indentChar, newLineChar) {
        return this.clientSide.getString(indentChar, newLineChar);
    }

    endKernelCompile(kernel) {
        switch (kernel.type) {
            case M_FormKernel_Type:
                this.endFormKernelCompile(kernel);
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

        var pullFun = midData.pullFun;

        if (belongUserControl) {
            pullFun.scope.getVar(belongUserControl.id + '_path', true, makeStr_callFun("getBelongUserCtlPath", [VarNames.FullParentPath]));
            pullFun.scope.getVar(belongUserControl.id + '_state', true, makeStr_callFun('getStateByPath', [VarNames.State, belongUserControl.id + '_path']));
        }

        if (midData.useDS) {
            var mustSelectColumns_arr = [];
            for (var colName in midData.useColumns_map) {
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
                var thisFormFullParentPath = singleQuotesStr(theKernel.fullParentPath);
                if (belongUserControl) {
                    thisFormFullParentPath = makeStr_callFun('CombiCombineDotStr', [belongUserControl.id + '_path', singleQuotesStr(theKernel.fullParentPath)]);
                }
                callParams_arr = ['null', true, thisFormFullParentPath];

                var theFun = pullFun;
                var hadNeedWatchParam = false;

                for (var formId in compilHelper.useForm_map) {
                    var useFormData = compilHelper.useForm_map[formId];
                    var useFormMidData = this.projectCompiler.getMidData(useFormData.formKernel.id);
                    var isGridForm = useFormData.formKernel.isGridForm();
                    var formSelectMode = useFormData.formKernel.getAttribute(AttrNames.SelectMode);
                    ctlParentStateVarName = null;
                    ctlStateVarName = null;

                    var formStateVarName = formId + '_state';
                    var nowRecordVarName = formId + '_' + VarNames.NowRecord + '';
                    var nowRowStateVarName = formId + '_' + VarNames.NowRow + '';
                    var selectedRowsVarName = formId + '_selectedRows_arr';
                    var isUseFormCtl = !IsEmptyObject(useFormData.useControls_map);
                    var isUseFormColumn = !IsEmptyObject(useFormData.useColumns_map);
                    var ctlBelongStateVarName = formStateVarName;

                    if (belongUserControl) {
                        initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                    }
                    else {
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                    }
                    theFun.scope.getVar(formStateVarName, true, initValue);

                    if (isUseFormCtl || isUseFormColumn) {
                        if (isGridForm) {
                            ctlBelongStateVarName = nowRowStateVarName;
                            theFun.scope.getVar(selectedRowsVarName, true, formStateVarName + '.' + VarNames.SelectedRows_arr);
                            if (isUseFormColumn) {
                                theFun.scope.getVar(nowRecordVarName, true);
                            }
                            if (isUseFormCtl) {
                                theFun.scope.getVar(nowRowStateVarName, true);
                            }
                            validBlock.pushLine(makeStr_AddAll('if(', selectedRowsVarName, '==null || ', selectedRowsVarName, '.length == 0){hadValidErr=true;}'));
                            validBlock.pushLine('else{', 1);
                            if (isUseFormColumn) {
                                validBlock.pushLine(makeStr_AddAll(nowRecordVarName, '=', formStateVarName, '.', VarNames.Records_arr, '[', selectedRowsVarName, '[0]];'));
                            }
                            if (isUseFormCtl) {
                                validBlock.pushLine(makeStr_AddAll(nowRowStateVarName, '=', formStateVarName, "['row_' + ", selectedRowsVarName, '[0]];'));
                            }
                            validBlock.subNextIndent();
                            validBlock.pushLine('}');
                            this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel,theFun.name, useFormData.formKernel, VarNames.SelectedRows_arr, callParams_arr);
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
                            ctlStateVarName = usectlid + '_state';
                            initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(usectlid), '{}');
                            theFun.scope.getVar(ctlStateVarName, true, initValue);
                            if (useCtlData.kernel.isAEditor()) {
                                ctlParentStateVarName = useCtlData.kernel.parent.id + '_state';
                                initValue = makeStr_getStateByPath(ctlBelongStateVarName, singleQuotesStr(useCtlData.kernel.parent.id), '{}');
                                theFun.scope.getVar(ctlParentStateVarName, true, initValue);
                            }

                            for (propName in useCtlData.useprops_map) {
                                propApiitem = useCtlData.useprops_map[propName];
                                varName = usectlid + '_' + propApiitem.stateName;
                                initValue = ctlStateVarName + '.' + propApiitem.stateName;
                                theFun.scope.getVar(varName, true, initValue);
                                if (propApiitem.needValid && needCheckProps_map[varName] == null) {
                                    needCheckProps_map[varName] = 1;
                                    nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
                                    needCheckVars_arr.push({
                                        kernel: useCtlData.kernel,
                                        nullable: nullableChecker != null ? nullableChecker.getAttribute(AttrNames.Nullable) : null,
                                        visibleStateVar: ctlParentStateVarName == null ? ctlStateVarName : ctlParentStateVarName,
                                        ctlStateVar: ctlStateVarName,
                                        valueVar: varName,
                                        propApi: propApiitem
                                    });
                                }
                                needSetParams_arr.push({ bundleName: varName, clientValue: varName });
                            }
                        }
                    }
                    if (!IsEmptyObject(useFormData.useColumns_map)) {
                        hadNeedWatchParam = true;
                        needCheckVars_arr.push(nowRecordVarName);
                        for (var colName in useFormData.useColumns_map) {
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
                    ctlStateVarName = usectlid + '_state';
                    if (belongUserControl) {
                        initValue = makeStr_getStateByPath(belongUserControl.id + '_state', singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                    }
                    else {
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()), '{}');
                    }
                    theFun.scope.getVar(ctlStateVarName, true, initValue);

                    for (propName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[propName];
                        varName = usectlid + '_' + propApiitem.stateName;
                        theFun.scope.getVar(varName, true, ctlStateVarName + '.' + propApiitem.stateName);
                        if (propApiitem.needValid) {
                            if (needCheckProps_map[varName] == null) {
                                needCheckProps_map[varName] = 1;
                                nullableChecker = ctlParentStateVarName ? useCtlData.kernel.parent : (useCtlData.kernel.hasAttribute(AttrNames.Nullable) ? useCtlData.kernel : null);
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
                            var tempCallParams_arr = callParams_arr;
                            if (useCtlData.kernel.parent == null) {
                                // 自订控件
                                tempCallParams_arr = ['nowState', true, 'this.props.fullPath'];
                                if (theKernel.parent != useCtlData.kernel) {
                                    tempCallParams_arr[2] += " + '." + theKernel.parentFullPath + "'";
                                }
                            }
                            this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel,theFun.name, useCtlData.kernel, propApiitem.stateName, tempCallParams_arr);
                        }
                        needSetParams_arr.push({ bundleName: varName, clientValue: varName });
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
                        var valueType = 'string';
                        if (varObj.propApi) {
                            this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theKernel,theFun.name, varObj.kernel, varObj.propApi.stateName, callParams_arr);
                        }
                        if (varObj.kernel.hasAttribute(AttrNames.ValueType)) {
                            valueType = varObj.kernel.getAttribute(AttrNames.ValueType);
                        }
                        var infoStatePath = varObj.kernel.getStatePath('invalidInfo');
                        validKernelBlock.pushLine('validErr = ' + makeStr_callFun('BaseIsValueValid', [
                            this.group == EJsBluePrintFunGroup.CtlValid ? 'comeState' : VarNames.State,
                            varObj.visibleStateVar,
                            varObj.ctlStateVar,
                            varObj.valueVar,
                            singleQuotesStr(valueType),
                            varObj.nullable ? varObj.nullable.toString() : 'false',
                            singleQuotesStr(varObj.kernel.id),
                            validErrStateVar.name
                        ]) + ";");
                        validKernelBlock.pushLine("validErrState[" + modifyStatePath(infoStatePath, belongUserControl) + "]=validErr;");
                        validKernelBlock.pushLine("if(validErr != null) hadValidErr = true;");
                        //checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
                    });
                    var invalidBundleStatePath = modifyStatePath(theKernel.getStatePath(VarNames.InvalidBundle), belongUserControl);
                    var dispatchErrLine = 'store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo,' + invalidBundleStatePath + '));';
                    var setErrStateLine = makeStr_AddAll('return setStateByPath(', VarNames.State, ',', invalidBundleStatePath, ",gPreconditionInvalidInfo);");
                    if (checkVarValidStr.length > 0) {
                        var checkVarValidIf = new JSFile_IF('checkVar', checkVarValidStr);
                        validBlock.pushChild(checkVarValidIf);
                        checkVarValidIf.trueBlock.pushLine('if(' + VarNames.HadStateParam + '){', 1);
                        checkVarValidIf.trueBlock.pushLine(setErrStateLine, -1);
                        checkVarValidIf.trueBlock.pushLine('}');
                        checkVarValidIf.trueBlock.pushLine('else{' + dispatchErrLine + '}');
                    }
                    validBlock.pushChild(validKernelBlock);
                    validKernelBlock.pushLine('if(hadValidErr){', 1);
                    validKernelBlock.pushLine('if(' + VarNames.HadStateParam + '){', 1);
                    validKernelBlock.pushLine(setErrStateLine, -1);
                    validKernelBlock.pushLine('}');
                    validKernelBlock.pushLine('else{' + dispatchErrLine + '}', -1);
                    validKernelBlock.pushLine('return;');
                    validKernelBlock.subNextIndent();
                    validKernelBlock.pushLine('}');
                }

                if (!IsEmptyObject(compilHelper.usePageParam)) {
                    for (var usPageParamName in compilHelper.usePageParam) {
                        needSetParams_arr.push({ bundleName: 'pagein_' + usPageParamName, clientValue: makeStr_callFun('getPageEntryParam', [singleQuotesStr(belongPage.id), singleQuotesStr(usPageParamName), compilHelper.usePageParam[usPageParamName]]) });
                    }
                }

                var serverBodyCheckblock = midData.bodyCheckblock;
                var paramsetblock = midData.serverSqlParamsetBLK;
                if (needSetParams_arr.length > 0) {
                    serverBodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '};');
                    serverBodyCheckblock.pushLine("var bundle=req.body.bundle;");
                    paramsetblock.pushLine("params_arr=[", 1);
                    for (var si in needSetParams_arr) {
                        var useParam = needSetParams_arr[si];
                        initbundleBlock.pushLine(makeLine_Assign(VarNames.Bundle + '.' + useParam.bundleName, useParam.clientValue));
                        var serverValue = ReplaceIfNull(useParam.serverValue, 'bundle.' + useParam.bundleName);
                        paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.bundleName + "', sqlTypes.NVarChar(4000), " + serverValue + "),");
                        serverBodyCheckblock.pushLine("if(bundle." + useParam.bundleName + " == null){" + makeLine_RetServerError('没有提供' + useParam.bundleName) + '};');
                    }
                }

                if (hadNeedWatchParam) {
                    // 有用到参数,等待参数变更时触发pullfun
                }
                else {
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
                        timeoutBlock.pushLine(makeStr_callFun(pullFun.name, ['null', true, singleQuotesStr(belongPage.id)]) + ';');
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