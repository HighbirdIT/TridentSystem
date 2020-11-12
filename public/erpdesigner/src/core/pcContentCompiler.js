class PCContentCompiler extends MobileContentCompiler {
    constructor(projectCompiler) {
        super(projectCompiler);
        autoBind(this);

        this.conetents_arr = this.project.content_PC;
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
        if(project.content_PC.pages.length == 0){
            return;
        }

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        this.appRenderSwicth = theSwicth;
        clientSide.appClass.renderFun.pushChild(theSwicth);
        var pageElemVar = clientSide.appClass.renderFun.scope.getVar('pageElem', true);

        if(isDebugMode){
            clientSide.globalVarBlock.pushLine("gDebugMode = true;");
        }
        clientSide.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'loaded'), 'state.loaded'));
        var unloadedIfBlock = new JSFile_IF('unloaded', '!state.loaded');
        clientSide.appClass.mapStateFun.pushChild(unloadedIfBlock);
        unloadedIfBlock.pushLine(makeLine_Assign(VarNames.RetProps + '.fetchState', 'state.ui.fetchState'));

        clientSide.scope.getVar(VarNames.PageRouter, true, '[]');
        clientSide.scope.getVar('gPCRenderMode', true, 'true');
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
        clientSide.pageRouteBackFun.pushLine('if(close_callback){close_callback({});}',-1);
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
        var setUserControlBeUsed = kernelid=>{
            beUsedUserControl_map[kernelid] = 1;
            kernelProfile = userCtlTemplateProfiles_map[kernelid];
            kernelProfile.relyOn_arr.forEach(tid=>{
                setUserControlBeUsed(tid);
            });
        };
        
        for (var pi in project.content_PC.pages) {
            useUserContrls_arr = project.content_PC.pages[pi].searchChildKernel(UserControlKernel_Type, false, true);
            if(useUserContrls_arr){
                useUserContrls_arr.forEach(tKernel=>{
                    setUserControlBeUsed(tKernel.refID);
                });
            }
        }

        var waitCompileUserCtls_arr = project.userControls_arr.concat().filter(ctl=>{return beUsedUserControl_map[ctl.id]});
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
        for (var pi in project.content_PC.pages) {
            var pcPage = project.content_PC.pages[pi];
            this.compileChain.push(pcPage);
            if (this.compilePage(pcPage) == false) {
                return false;
            }
            pcPage.getAttrArrayList(AttrNames.RelFlowStep).forEach(attr => {
                var flowStepCode = pcPage[attr.name];
                if (gFlowMaster.findStepByCode(flowStepCode)) {
                    var flowStepCaseBLK = flowStepSwitch.getCaseBlock(flowStepCode);
                    flowStepCaseBLK.pushLine("targetPageID='" + pcPage.id + "';");
                }
            });
        }
        if (this.mianPageKernel == null) {
            logManager.error('项目没有在PC端设置主页面');
        }

        clientSide.pageLoadedReducerFun.pushLine("var flowStep = parseInt(getQueryVariable('flowStep'));");
        clientSide.pageLoadedReducerFun.pushLine("var targetPageID='" + this.mianPageKernel.id + "';");
        clientSide.pageLoadedReducerFun.pushChild(flowStepSwitch);
        clientSide.pageLoadedReducerFun.flowStepSwitch = flowStepSwitch;
        clientSide.pageLoadedReducerFun.pushLine("return gotoPage(targetPageID, state);");

        var projLayoutConfig = project.getLayoutConfig(AttrNames.LayoutNames.APDClass, AttrNames.LayoutNames.StyleAttr);
        projLayoutConfig.addClass('w-100');
        projLayoutConfig.addClass('h-100');
        var projStyleID = '_project_style';
        var hasProjStyle = this.clientSide.addStyleObject(projStyleID, projLayoutConfig.style);

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className=" + singleQuotesStr(projLayoutConfig.getClassName()) + (hasProjStyle ? ' style={' + projStyleID + '}' : '') + ">");
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
                                else if(sameReactKernel.type == M_FormKernel_Type && !sameReactKernel.isPageForm()){
                                    thirdParam += '+ ".row_" + rowKeyInfo_map.' + sameReactKernel.id;
                                }
                                if(relyPath.approach.delaycall){
                                    actKey = 'call_' + relyPath.approach.funName;
                                    changedFun.pushLine("if(delayActs." + actKey + " == null){delayActs." + actKey + " = {callfun:" + relyPath.approach.funName + ",params_arr:[" + [VarNames.State, 'null', thirdParam].join(',') + "]};};");
                                    getValueStr = '';
                                }
                                else{
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
                            if(!IsEmptyString(getValueStr)){
                                changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName, '.', rowKeyInfo_map)), getValueStr));
                            }
                        }
                        else {
                            actKey = 'call_' + relyPath.funName;
                            changedFun.pushLine("if(delayActs." + actKey + " == null){delayActs." + actKey + " = {callfun:" + relyPath.funName + (relyPath.params_arr ? ",params_arr:[" + relyPath.params_arr.join(',') + ']' : '') + "};};");
                        }
                        if (accordionParents_arr) {
                            changedFun.subNextIndent();
                            changedFun.pushLine('}else{',1);
                            accordionParents_arr.forEach(accordionKernel => {
                                changedFun.pushLine('if(!' + accordionKernel.id + '_state.inited){gDataCache.set(' + singleQuotesStr(accordionKernel.getStatePath()) + ',true);}');
                            });
                            changedFun.subNextIndent();
                            changedFun.pushLine('}');
                        }
                        break;
                }
            }
        }

        return true;
    }

    getString(indentChar, newLineChar) {
        if(this.project.content_PC.pages.length == 0){
            return '';
        }
        return this.clientSide.getString(indentChar, newLineChar);
    }
}