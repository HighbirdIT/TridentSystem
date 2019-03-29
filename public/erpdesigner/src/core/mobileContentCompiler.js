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

    addRely_CallFunOnBPChanged(funName, berelyCtl, berelyPropName) {
        var pathid = 'callfun_' + funName + '_on_' + berelyCtl.id + '.' + berelyPropName;
        if (this.allpath_map[pathid]) {
            return this.allpath_map[pathid];
        }

        var path = new ControlGraphPath(ECtlReplyPathType.CallFun_On_BPChanged, null, null, {
            berelyPropName: berelyPropName,
            berelyCtl: berelyCtl,
            funName: funName,
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

        clientSide.pageLoadedReducerFun = clientSide.scope.getFunction('pageLoadedReducer', true, ['state']);
        clientSide.gotoPageReducerFun = clientSide.scope.getFunction('gotoPageReducer', true, ['state', 'action']);
        clientSide.gotoPageReducerFun.pushLine("return gotoPage(action.pageName, state);");

        clientSide.gotoPageFun = clientSide.scope.getFunction('gotoPage', true, ['pageName', 'state']);
        clientSide.gotoPageFun.pushLine("if (state.nowPage == pageName){return state;}");
        clientSide.gotoPageFun.scope.getVar(VarNames.ReState, true, 'state');
        var gotoPageSwitchBlock = new JSFile_Switch('gotopage', 'pageName');
        clientSide.gotoPageFun.pushChild(gotoPageSwitchBlock);
        clientSide.gotoPageFun.switchBlock = gotoPageSwitchBlock;
        clientSide.gotoPageFun.retBlock.pushLine("return Object.assign({}, " + VarNames.ReState + ");");

        clientSide.addReducer('AT_PAGELOADED', 'pageLoadedReducer.bind(window)');
        clientSide.addReducer('AT_GOTOPAGE', 'gotoPageReducer.bind(window)');

        this.mianPageKernel = null;
        for (var pi in project.content_Mobile.pages) {
            this.compileChain.push(project.content_Mobile.pages[pi]);
            if (this.compilePage(project.content_Mobile.pages[pi]) == false) {
                return false;
            }
        }
        if (this.mianPageKernel == null) {
            logManager.error('项目没有设置主页面');
        }
        clientSide.pageLoadedReducerFun.pushLine("return gotoPage('" + this.mianPageKernel.id + "', state);");

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className='w-100 h-100'>");
        clientSide.appClass.renderFun.pushLine("<CToastManger ref={gCToastMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<CMessageBoxManger ref={gCMessageBoxMangerRef} />");
        clientSide.appClass.renderFun.pushLine("<FixedContainer ref={gFixedContainerRef} />");
        clientSide.appClass.renderFun.pushLine("{this.renderLoadingTip()}");
        clientSide.appClass.renderFun.pushLine("{pageElem}", -1);
        clientSide.appClass.renderFun.pushLine("</div>);");

        for (var ki in this.compileChain) {
            this.endKernelCompile(this.compileChain[ki]);
        }

        // gen relyon code
        for (var pid in this.ctlRelyOnGraph.allpath_map) {
            var relyPath = this.ctlRelyOnGraph.allpath_map[pid];
            var propFulPath;
            var propChangedHandlerName;
            var changedFun;
            switch (relyPath.type) {
                case ECtlReplyPathType.SetAP_On_BPChanged:
                case ECtlReplyPathType.CallFun_On_BPChanged:
                    propFulPath = relyPath.berelyCtl.getStatePath(relyPath.berelyPropName);
                    propChangedHandlerName = relyPath.berelyCtl.id + '_' + relyPath.berelyPropName + '_changed';
                    changedFun = clientSide.scope.getFunction(propChangedHandlerName);
                    if (changedFun == null) {
                        changedFun = clientSide.scope.getFunction(propChangedHandlerName, true, [VarNames.State, 'newValue', 'oldValue', 'path', 'visited', 'delayActs']);
                        changedFun.scope.getVar(VarNames.NeedSetState, true, '{}');
                        changedFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, "''", VarNames.NeedSetState], ';'));
                        clientSide.stateChangedAct[singleQuotesStr(propFulPath)] = propChangedHandlerName + '.bind(window)';
                    }
                    if (relyPath.type == ECtlReplyPathType.SetAP_On_BPChanged) {
                        var getValueStr = '';
                        if (relyPath.approach.funName) {
                            getValueStr = makeStr_callFun(relyPath.approach.funName, [VarNames.State]);
                        }
                        else if (relyPath.approach.value) {
                            getValueStr = relyPath.approach.value;
                        }
                        else {
                            console.error('不支持的approach!');
                        }
                        changedFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, relyPath.relyCtl.getStatePath(relyPath.relyPropName)), getValueStr));
                    }
                    else {
                        var actKey = 'call_' + relyPath.funName;
                        changedFun.pushLine("if(delayActs['" + actKey + "'] == null){delayActs['" + actKey + "'] = {callfun:" + relyPath.funName + "};};");
                    }
                    break;
            }
        }

        return true;
    }

    modifyControlTag(ctlKernel, ctlTag){
        var belongForm = ctlKernel.searchParentKernel(M_FormKernel_Type, true);
        if(belongForm){
            var formType = belongForm.getAttribute(AttrNames.FormType);
            if(formType == EFormType.Grid){
                ctlTag.setAttr('rowIndex','{rowIndex}');
            }
        }
    }

    compileScriptBlueprint(targetBP) {
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
        this.compiledScriptBP_map[targetBP.id] = compileRet;
        return compileRet;
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
        var pageMidData = this.projectCompiler.getMidData(pageKernel.id);
        pageMidData.needSetKernels_arr = [];
        var pageReactClass = clientSide.getReactClass(pageKernel.getReactClassName(), true);
        pageReactClass.renderHeaderFun = pageReactClass.getFunction('renderHead', true);
        //pageReactClass.renderFootFun = pageReactClass.getFunction('renderFoot', true);
        //pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        var caseBlock = this.appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
        caseBlock.pushLine(makeLine_Assign('pageElem', '<' + pageKernel.getReactClassName(true) + ' />'));

        var gotoPageCaseBlock = clientSide.gotoPageFun.switchBlock.getCaseBlock(singleQuotesStr(pageKernel.id));
        gotoPageCaseBlock.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(makeFName_activePage(pageKernel), [VarNames.ReState])));

        pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
        pageReactClass.renderHeaderFun.pushLine("<h3>" + pageKernel.getAttribute(AttrNames.Title) + "</h3>", -1);
        pageReactClass.renderHeaderFun.pushLine("</div>);");

        /*
        pageReactClass.renderFootFun.pushLine("return (<div className='flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter'>", 1);
        pageReactClass.renderFootFun.pushLine("<h3>页脚</h3>", -1);
        pageReactClass.renderFootFun.pushLine("</div>);");
        */

        pageReactClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        pageReactClass.renderFun.pushLine("<div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>", 1);
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
        if(!autoHeight){
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
        var controlInitBlock = new FormatFileBlock('ctlinit');
        activePageFun.pushChild(controlInitBlock);
        activePageFun.pushLine(makeLine_Assign('state.nowPage', singleQuotesStr(pageKernel.id)));
        activePageFun.pushLine('setTimeout(() => {', 1);
        var activeTimeoutBlock = new FormatFileBlock('timeout');
        activePageFun.pushChild(activeTimeoutBlock);
        activePageFun.subNextIndent();
        activePageFun.pushLine('}, 50);');
        activePageFun.retBlock.pushLine('return state;');

        for (var ci in pageKernel.children) {
            var childKernel = pageKernel.children[ci];
            if (this.compileKernel(childKernel, pageRenderBlock, pageReactClass.renderContentFun) == false) {
                return false;
            }
        }

        if (pageMidData.needSetKernels_arr.length > 0) {
            var needSetStateVar = activePageFun.scope.getVar(VarNames.NeedSetState, true, '{}');
            for (ci in pageMidData.needSetKernels_arr) {
                var targetKernel = pageMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = targetKernel.getStatePath(stateItem.name);
                        if (stateItem.isDynamic) {
                            if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                var setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.State]));
                                controlInitBlock.pushLine(setLine);
                            }
                        } else {
                            if (stateItem.staticValue) {
                                controlInitBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), singleQuotesStr(stateItem.staticValue)));
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
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : '.') + rlt;
                    break;
                case M_FormKernel_Type:
                    rlt = nowKernel.id + (rlt.length == 0 ? '' : '.') + rlt;
                    break;
            }
            if (nowKernel) {
                nowKernel = nowKernel.parent;
            }
        } while (nowKernel != null);
        theKernel.parentPath = rlt;
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

    compileTextKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Text', this.clientSide);
        this.modifyControlTag(theKernel,ctlTag);
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
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var setValueStateItem = null;
            if (belongFormKernel != null) {
                var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                    formMidData.needSetKernels_arr.push(theKernel);
                }
                if (formColumns_arr.indexOf(textField) != -1) {
                    formMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
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
            if (setValueStateItem != null) {
                kernelMidData.needSetStates_arr.push(setValueStateItem);
            }
        }
    }

    compileCheckBoxKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_CheckBox', this.clientSide);
        this.modifyControlTag(theKernel,ctlTag);
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
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var setValueStateItem = null;
            if (belongFormKernel != null) {
                var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                    formMidData.needSetKernels_arr.push(theKernel);
                }
                if (formColumns_arr.indexOf(textField) != -1) {
                    formMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setValueStateItem = {
                        name: 'value',
                        useColumn: { name: textField },
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
        var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var belongPageKernel = theKernel.searchParentKernel(M_PageKernel_Type, true);
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
        var bindParentKernel = belongFormKernel ? belongFormKernel : belongPageKernel;
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

                        scriptCompileRet.startFtech_bk.pushLine("state = " + makeStr_callFun('setManyStateByPath', [VarNames.State, singleQuotesStr(theKernel.getStatePath()), '{fetching:true,fetchingErr:null}']));
                    }
                }
                scriptCompileRet.finalCallBackReturn_bk.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.State, singleQuotesStr(theKernel.getStatePath()), 'needSetState']) + ';');
            }
            else {
                scriptCompileRet.finalCallBackReturn_bk.pushLine("return err == null ? data : null;");
            }
        }

        var visibleStyle = VisibleStyle_Update;
        var useFormData = scriptCompileRet.useForm_map[bindParentKernel.id];
        var bindMode = ScriptBindMode.OnForm;
        var useColumn = false;
        var useControl = false;
        var useCtlData = null;
        var pName;
        var propApiitem;
        if (useFormData) {
            useColumn = !IsEmptyObject(useFormData.useColumns_map);
            useControl = !IsEmptyObject(useFormData.useControls_map);
            if (useColumn) {
                visibleStyle = VisibleStyle_Update;
            }
            else {
                if (useControl) {
                    bindMode = ScriptBindMode.OnRelAttrChanged;
                    for (var cid in useFormData.useControls_map) {
                        useCtlData = useFormData.useControls_map[cid];
                        for (pName in useCtlData.useprops_map) {
                            propApiitem = useCtlData.useprops_map[pName];
                            this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, stateName, useCtlData.kernel, propApiitem.stateName, {
                                funName: attrParseRet.jsBp.name,
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
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        var bindParentMidData = this.projectCompiler.getMidData(bindParentKernel.id);
        if (bindParentMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
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
            funName: attrParseRet.funName,
            bindMode: bindMode,
            useColumn: useColumn,
            useControl: useControl,
        };
        kernelMidData.needSetStates_arr.push(setStateItem);

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
            var scriptCompileRet = this.compileScriptAttribute(isdisplayParseRet, theKernel, 'visible', AttrNames.Isdisplay);
            /*
            if(theKernel.editor){
                scriptCompileRet.finalCallBackBody_bk.pushLine("state = " + makeStr_callFun('setStateByPath', [VarNames.State, singleQuotesStr(theKernel.editor.getStatePath()), '{visible:needSetState.visible}']));
            }
            */
        }
        else {
            if (!isdisplay) {
                ctlTag.setAttr('visible', '{false}');
            }
        }
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
        if(parentForm && parentForm.getAttribute(AttrNames.FormType) == EFormType.Page){
            childBlock = new FormatFileBlock('child');
            labeledCtrlTag.pushChild(childBlock);
            renderBlock.pushChild(labeledCtrlTag);
        }
        else{
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
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-form');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if (orientation == Orientation_V) {
            layoutConfig.addClass('flex-column');
        }

        var formType = theKernel.getAttribute(AttrNames.FormType);
        var isPageForm = formType == EFormType.Page;
        var isGridForm = formType == EFormType.Grid;

        var thisfullpath = makeStr_DotProp(parentPath, theKernel.id);
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
        var gridBodyPureRectClass = null;
        switch (formType) {
            case EFormType.Page:
                formReactClass.constructorFun.pushLine('ERPC_PageForm(this);');
                break;
            case EFormType.Grid:
                formReactClass.constructorFun.pushLine('ERPC_GridForm(this);');
                gridHeadPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_THead', true, true);
                gridBodyPureRectClass = clientSide.getReactClass(theKernel.getReactClassName() + '_TBody', true, true);
                var tableBodyScrollFun = formReactClass.getFunction('tableBodyScroll', true, ['ev']);
                formReactClass.constructorFun.pushLine('this.' + tableBodyScrollFun.name + '=' + 'this.' + tableBodyScrollFun.name + '.bind(this);');
                tableBodyScrollFun.pushLine("document.getElementById('" + theKernel.id + "tableheader').scrollLeft = ev.target.scrollLeft;");
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
            var ifNowRecordBlock = new JSFile_IF('hadnowrecord', '!this.props.canInsert && this.props.nowRecord == null');
            if(isGridForm){
                ifNowRecordBlock.condition = "!this.props.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)";
            }
            ifFetingBlock.falseBlock.pushChild(ifNowRecordBlock);
            ifNowRecordBlock.pushLine(VarNames.RetElem + " = <div>没有查询到数据</div>;");
            renderContentBlock = ifNowRecordBlock.falseBlock;
        }

        var formStyleID = theKernel.id + '_style';
        var hasFormStyle = this.clientSide.addStyleObject(formStyleID, layoutConfig.style);

        var childRenderBlock = null;
        if (isPageForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = (", 1);
            renderContentBlock.pushLine("<div className='" + layoutConfig.getClassName() + "'>", 1);
            childRenderBlock = new FormatFileBlock(theKernel.id + 'child');
            renderContentBlock.pushChild(childRenderBlock);
            var navigaterBlock = new FormatFileBlock('navigater');
            navigaterBlock.pushLine("{this.renderNavigater()}");
            formReactClass.navigaterBlock = navigaterBlock;
            renderContentBlock.pushChild(navigaterBlock);
            renderContentBlock.subNextIndent();
            renderContentBlock.pushLine("</div>);");

            renderContentFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        }
        else if (isGridForm) {
            renderContentBlock.pushLine(VarNames.RetElem + " = <" + gridBodyPureRectClass.name + " startRowIndex={this.props.startRowIndex} endRowIndex={this.props.endRowIndex} />");
            renderContentBlock.pushLine("if (this.props.pagebreak) {", 1);
            renderContentBlock.pushLine(VarNames.NavElem + " = <CBaseGridFormNavBar pageIndex={this.props.pageIndex} rowPerPage={this.props.rowPerPage} rowPerPageChangedHandler={this.rowPerPageChangedHandler} pageCount={this.props.pageCount} prePageClickHandler={this.prePageClickHandler} nxtPageClickHandler={this.nxtPageClickHandler} pageIndexChangedHandler={this.pageIndexChangedHandler} />", -1);
            renderContentBlock.pushLine("}");

            renderContentFun.pushLine('return (', 1);
            renderContentFun.pushLine("<div className='" + layoutConfig.getClassName() + "' " + (hasFormStyle ? "style={" + formStyleID + "}" : '') + ">", 1);
            renderContentFun.pushLine("{this.props.title && <div className='bg-dark text-light justify-content-center d-flex flex-shrink-0'><span>{this.props.title}</span></div>}");
            renderContentFun.pushLine("<div id='" + theKernel.id + "tableheader' className='mw-100 hidenOverflow flex-shrink-0'>", 1);
            renderContentFun.pushLine("<table className='table' style={" + headTableStyleID + "}>", 1);
            renderContentFun.pushLine("<" + gridHeadPureRectClass.name + ' />', -1);
            renderContentFun.pushLine("</table>", -1);
            renderContentFun.pushLine("</div>");
            renderContentFun.pushLine("<div onScroll={this.tableBodyScroll} className='mw-100 autoScroll h-100'>", 1);
            renderContentFun.pushLine("{" + VarNames.RetElem + "}", -1);
            renderContentFun.pushLine("</div>", -1);
            renderContentFun.pushLine("{" + VarNames.NavElem + "}", -1);
            renderContentFun.pushLine('</div>);');
        }

        formReactClass.renderFun.pushLine(VarNames.RetElem + " = this.renderContent();");

        var formTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        formTag.setAttr('id', theKernel.id);
        formTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
        var pageBreak = false;
        if (isGridForm) {
            var formTitle = theKernel.getAttribute(AttrNames.Title);
            if (!IsEmptyString(formTitle)) {
                formTag.setAttr('title', formTitle);
            }
            pageBreak = theKernel.getAttribute(AttrNames.PageBreak);
            formTag.setAttr('pagebreak', bigbracketStr(pageBreak));
            formTag.setAttr('reBindAT', 'ReBind' + theKernel.id + "Page");
        }

        renderBlock.pushChild(formTag);

        formReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "getStateByPath(state, '" + thisfullpath + "', {})");
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

        var freshFun = clientSide.scope.getFunction(makeFName_freshForm(theKernel), true, [VarNames.ReState, VarNames.Records_arr]);
        var bindFun = clientSide.scope.getFunction(makeFName_bindForm(theKernel), true, [VarNames.ReState, 'newIndex', 'oldIndex']);
        if (useDS) {
            clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.Records_arr))] = freshFun.name + '.bind(window)';
            if (isPageForm) {
                clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.RecordIndex))] = makeFName_bindForm(theKernel) + '.bind(window)';
                freshFun.pushLine(makeStr_callFun('simpleFreshFormFun', [VarNames.ReState, VarNames.Records_arr, singleQuotesStr(makeStr_DotProp(parentPath, theKernel.id)), bindFun.name], ';'));
            }
            if (isGridForm) {
                freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState]) + ';');
                clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath, VarNames.PageIndex))] = makeFName_bindForm(theKernel) + '.bind(window)';
            }
        }
        else {
            freshFun.pushLine(makeStr_callFun(bindFun.name, [VarNames.ReState]));
        }

        bindFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, singleQuotesStr(thisfullpath), '{}'));
        if (useDS) {
            bindFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
        }
        bindFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        var bundleVar = bindFun.scope.getVar('bundle', true, '{}');
        var saveInsertIfBlock = null;
        var insertModeIf = null;
        var hadInsertCacheIf = null;

        var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongForm = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var belongPageMidData = this.projectCompiler.getMidData(belongPage.id);
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
        var bindNowRecordBlock = new FormatFileBlock('bindbowrow');
        var formCanInsert = false;
        var bindInersetBlock = null;

        var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true, [VarNames.ReState]);
        pullFun.scope.getVar(VarNames.HadStateParam, true, VarNames.ReState + '!=null');

        if (!useDS) {
            pullFun.retBlock.pushLine(makeLine_Return(VarNames.ReState));
            pullFun.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(bindFun.name, [VarNames.ReState])));

            if(belongFormMidData != null){
                belongFormMidData.pullFun.beforeRetBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun(pullFun.name, [VarNames.ReState]));
            }
            else{
                var pageActiveFun = clientSide.scope.getFunction(makeFName_activePage(belongPage));
                pageActiveFun.pushLine(makeLine_Assign(VarNames.State, makeStr_callFun(bindFun.name, [VarNames.State])));
            }
        }
        else{
            pullFun.retBlock.pushLine(makeLine_Return(VarNames.State));
            pullFun.scope.getVar(VarNames.State, true, makeStr_AddAll(VarNames.HadStateParam,' ? ',VarNames.ReState,' : ','store.getState()'));
        }

        var dynamicSetBlock_hadRecord = new FormatFileBlock('dynamicbindhadrow');
        var staticBindBlock = new FormatFileBlock('static');
        bindFun.pushChild(staticBindBlock);
    
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
            pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), singleQuotesStr(parentPath), singleQuotesStr(theKernel.id), singleQuotesStr(VarNames.Records_arr), { bundle: 'bundle' }, false), -1);
            pullFun.pushLine('}, 50);');

            // gen back pull
            var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req', 'res']);
            serverSide.initProcessFun(serverPullFun);
            serverSide.processesMapVarInitVal[serverPullFun.name] = serverPullFun.name;
            var bodyCheckblock = new FormatFileBlock('bodyCheckblock');
            serverPullFun.pushChild(bodyCheckblock);
            thisFormMidData.bodyCheckblock = bodyCheckblock;
            thisFormMidData.pullFun = pullFun;
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
                if (formCanInsert) {
                    saveInsertIfBlock = new JSFile_IF('saveinsert', 'oldIndex == -1');
                    bindFun.saveInsertBlock = saveInsertIfBlock.trueBlock;
                    bindFun.pushChild(saveInsertIfBlock);
                    insertModeIf.trueBlock.pushLine(makeLine_Assign(VarNames.InsertCache, makeStr_getStateByPath("formState", singleQuotesStr(VarNames.InsertCache))));
                    hadInsertCacheIf = new JSFile_IF(VarNames.InsertCache, VarNames.InsertCache);
                    insertModeIf.trueBlock.pushChild(hadInsertCacheIf);
                }
                insertModeIf.falseBlock.pushChild(bindNowRecordBlock);
                insertModeIf.falseBlock.pushChild(dynamicSetBlock_hadRecord);
                bindInersetBlock = insertModeIf.trueBlock;
            }
            if (isGridForm) {
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
                    bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), VarNames.NeedSetState]) + ';');
                    bindFun.retBlock.pushLine('return ' + makeStr_callFun(makeFName_bindFormPage(theKernel), [VarNames.ReState]) + ';',-1);
                    bindFun.retBlock.pushLine('}');
                }
                else {
                    needActiveBindPageVar.initVal = 'true';
                    bindFun.retBlock.pushLine(VarNames.ReState + '=' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), VarNames.NeedSetState]) + ';');
                    bindFun.retBlock.pushLine('return ' + makeStr_callFun(makeFName_bindFormPage(theKernel), [VarNames.ReState]) + ';');
                }
                
            }
        }

        var ci;
        var childKernel;

        if (isPageForm) {
            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
                if (this.compileKernel(childKernel, childRenderBlock, renderFun) == false) {
                    return false;
                }
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

            var autoIndexColumn = theKernel.getAttribute(AttrNames.AutoIndexColumn);
            if(autoIndexColumn){
                sumTableWidth += 3;
                gridHeadRowRenderBlock.pushLine("<th scope='col' className='indexTableHeader'>序号 </th>");
            }

            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
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
                if(isNaN(columnWidth)){
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
                    width:columnWidth,
                    kernel:childKernel,
                    label:headTextValue,
                    index:gridColumnCount++,
                };
            }
            var gridHeadStyles_map = {};
            var gridHeadStyleCount = 0;
            var columnProfile;
            for(var gi in gridColumnsProfile_obj){
                columnProfile = gridColumnsProfile_obj[gi];
                var headStyleObj = gridHeadStyles_map[columnProfile.width];
                var tdStyleObj = gridHeadStyles_map[columnProfile.width + 'td'];
                if(headStyleObj == null){
                    var headStyleID = theKernel.id + 'headstyle' + gridHeadStyleCount;
                    var tdStyleID = theKernel.id + 'tdstyle' + gridHeadStyleCount;
                    ++gridHeadStyleCount;
                    if(gridWidthType == EGridWidthType.Fixed){
                        headStyleObj = {
                            width:(columnProfile.width / 10) + 'em',
                        };
                    }
                    else{
                        headStyleObj = {
                            width: (Math.round(1000 * columnProfile.width / sumTableWidth) / 10) + '%',
                        };
                    }
                    headStyleObj[AttrNames.StyleAttrNames.MaxWidth] = headStyleObj.width;
                    tdStyleObj = Object.assign({}, headStyleObj);
                    headStyleObj.whiteSpace = 'nowrap';
                    headStyleObj.overflow = 'hidden';
                    
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
            }

            var gridTableStyle = {
                marginTop: '-50px',
            };
            var gridHeadTableStyle = {
                marginBottom: '0px',
            };
            if(gridWidthType == EGridWidthType.Fixed){
                gridTableStyle.width = sumTableWidth + 'em';
                gridHeadTableStyle.width = sumTableWidth + 'em';
            }
            this.clientSide.addStyleObject(tableStyleID, gridTableStyle);
            this.clientSide.addStyleObject(headTableStyleID, gridHeadTableStyle);

            var bindPageFun = this.clientSide.scope.getFunction(makeFName_bindFormPage(theKernel), true, [VarNames.ReState]);
            clientSide.addReducer('ReBind' + theKernel.id + "Page", bindPageFun.name + '.bind(window)');
            bindPageFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, singleQuotesStr(thisfullpath), '{}'));
            bindPageFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
            bindPageFun.scope.getVar(VarNames.NeedSetState, true, '{}');
            if (pageBreak) {
                bindPageFun.scope.getVar(VarNames.PageIndex, true, 'formState.' + VarNames.PageIndex);
                bindPageFun.scope.getVar(VarNames.RowPerPage, true, 'formState.' + VarNames.RowPerPage);
                bindPageFun.scope.getVar(VarNames.StartRowIndex, true, VarNames.PageIndex + '*' + VarNames.RowPerPage);
                bindPageFun.scope.getVar(VarNames.EndRowIndex, true, '(' + VarNames.PageIndex + '+1)*' + VarNames.RowPerPage + '-1');
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
            bindPageFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), VarNames.NeedSetState], ';'));

            gridBodyPureRectClass.renderFun.scope.getVar('trElems_arr', true, '[]');
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.StartRowIndex, true, makeStr_DotProp('this.props', VarNames.StartRowIndex));
            gridBodyPureRectClass.renderFun.scope.getVar(VarNames.EndRowIndex, true, makeStr_DotProp('this.props', VarNames.EndRowIndex));
            gridBodyPureRectClass.renderFun.pushLine('for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {', 1);
            gridBodyPureRectClass.renderFun.pushLine('trElems_arr.push(', 1);
            gridBodyPureRectClass.renderFun.pushLine(makeStr_AddAll('<tr key={rowIndex-', VarNames.StartRowIndex, '}>'));
            var gridBodyTableRowRenderBlock = new FormatFileBlock('rowRender');
            gridBodyPureRectClass.renderFun.pushChild(gridBodyTableRowRenderBlock, -1);
            gridBodyPureRectClass.renderFun.pushLine('</tr>);', -1);
            gridBodyPureRectClass.renderFun.pushLine('}',-1);

            gridBodyPureRectClass.renderFun.retBlock.clear();
            gridBodyPureRectClass.renderFun.retBlock.pushLine("return (<table className='table table-striped table-hover ' style={" + tableStyleID + "}>", 1);
            gridBodyPureRectClass.renderFun.retBlock.pushLine(makeStr_AddAll('<', gridHeadPureRectClass.name, ' />'));
            gridBodyPureRectClass.renderFun.retBlock.pushLine('<tbody>{trElems_arr}</tbody>', -1);
            gridBodyPureRectClass.renderFun.retBlock.pushLine('</table>);');

            if(autoIndexColumn){
                gridBodyTableRowRenderBlock.pushLine("<td className='indexTableHeader'>{rowIndex-startRowIndex+1}</td>");
            }

            for (ci in theKernel.children) {
                childKernel = theKernel.children[ci];
                columnProfile = gridColumnsProfile_obj[childKernel.id];
                gridBodyTableRowRenderBlock.pushLine("<td style={" + columnProfile.tdStyleID + '}>', 1);
                if (this.compileKernel(childKernel, gridBodyTableRowRenderBlock, renderFun) == false) {
                    return false;
                }
                gridBodyTableRowRenderBlock.subNextIndent();
                gridBodyTableRowRenderBlock.pushLine('</td>');
            }
        }


        if (thisFormMidData.needSetKernels_arr) {
            for (ci in thisFormMidData.needSetKernels_arr) {
                var targetKernel = thisFormMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if(isPageForm){
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

                if (targetKernelMidData.needSetStates_arr.length > 0) {
                    targetKernelMidData.needSetStates_arr.forEach(stateItem => {
                        var stateName = makeStr_DotProp(targetKernel.id, stateItem.name);
                        if(isGridForm){
                            stateName = "row_'+rowIndex+'." + stateName;
                        }
                        var state_Name = makeStr_Join('_', targetKernel.id, stateItem.name);
                        if (stateItem.isDynamic) {
                            if (stateItem.bindMode == ScriptBindMode.OnForm) {
                                var setLine = makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName, [VarNames.ReState, bundleVar.name]));
                                if (stateItem.useColumn) {
                                    dynamicSetBlock_hadRecord.pushLine(setLine);
                                }
                                else {
                                    staticBindBlock.pushLine(setLine);
                                }
                            }
                        } else {
                            if (stateItem.staticValue) {
                                staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), singleQuotesStr(stateItem.staticValue)));
                            }
                            else if (stateItem.useColumn) {
                                if (formCanInsert) {
                                    if(isPageForm){
                                        saveInsertIfBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InsertCache + '.' + state_Name), makeStr_getStateByPath('formState', singleQuotesStr(stateName))));
                                    }
                                }
                                if (stateItem.useColumn) {
                                    if(isPageForm){
                                        if (formCanInsert) {
                                            hadInsertCacheIf.trueBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), VarNames.InsertCache + '.' + state_Name));
                                            hadInsertCacheIf.falseBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), "''"));
                                        }
                                    }
                                    bindNowRecordBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_DynamicAttr(VarNames.NowRecord, stateItem.useColumn.name)));
                                }
                            }
                            else if (stateItem.setNull) {
                                staticBindBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), 'null'));
                            }
                        }
                    });
                }
            }
        }

        if(isPageForm){
            if (useDS) {
                bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.NowRecord), VarNames.NowRecord));
            }
        }
        
        bindFun.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InvalidBundle), 'false'));
        bindFun.retBlock.pushLine('return ' + makeStr_callFun('setManyStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), VarNames.NeedSetState], ';'));
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
        this.modifyControlTag(theKernel,ctlTag);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
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

        var ctlTag = new FormatHtmlTag(theKernel.id, 'button', this.clientSide);
        this.modifyControlTag(theKernel,ctlTag);
        ctlTag.addClass('btn');
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.pushChild(new FormatFile_Line(theKernel.getAttribute(AttrNames.Name)));
        renderBlock.pushChild(ctlTag);

        var onclickFunName = theKernel.id + '_' + AttrNames.Event.OnClick;
        var onClickBp = project.scriptMaster.getBPByName(onclickFunName);
        if (onClickBp != null) {
            this.compileScriptBlueprint(onClickBp);
            ctlTag.setAttr('onClick', bigbracketStr(onclickFunName));
        }
    }

    compileDropdownKernel(theKernel, renderBlock, renderFun) {
        var project = this.project;
        var logManager = project.logManager;
        var clientSide = this.clientSide;
        var serverSide = this.serverSide;

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_DropDown', this.clientSide);
        this.modifyControlTag(theKernel,ctlTag);
        var layoutConfig = theKernel.getLayoutConfig();

        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        var thisfullpath = makeStr_DotProp(parentPath, theKernel.id);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        renderBlock.pushChild(ctlTag);
        this.compileIsdisplayAttribute(theKernel, ctlTag);
        this.compileValidCheckerAttribute(theKernel);

        var defaultVal = theKernel.getAttribute(AttrNames.DefaultValue);
        var defaultValParseRet = parseObj_CtlPropJsBind(defaultVal, project.scriptMaster);
        if (defaultValParseRet.isScript) {
            this.compileScriptAttribute(defaultValParseRet, theKernel, 'value', AttrNames.DefaultValue, { autoSetFetchState: true });
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
        var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true);
        ctlTag.setAttr('pullDataSource', '{' + pullFun.name + '}');
        ctlTag.setAttr('textAttrName', fromTextfield);
        ctlTag.setAttr('valueAttrName', fromValuefield);
        if (theKernel.parent.type == M_LabeledControlKernel_Type) {
            ctlTag.setAttr('label', theKernel.parent.getAttribute(AttrNames.TextField));
        }
        //clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath,VarNames.Records_arr))] = freshFun.name + '.bind(window)';
        pullFun.pushLine('var bundle = {};');
        pullFun.pushLine('var useState = store.getState();');
        var initbundleBlock = new FormatFileBlock('initbundle');
        pullFun.pushChild(initbundleBlock);
        pullFun.initbundleBlock = initbundleBlock;
        pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), singleQuotesStr(parentPath), singleQuotesStr(theKernel.id), singleQuotesStr('options_arr'), { bundle: 'bundle' }, false));

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
                    needSetParams_arr.push({ name: useName, value: 'req.body.bundle.' + useName });

                    if (autoClearValue) {
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'text', useCtl.kernel, propApi.stateName, {
                            value: 'null',
                        });
                        this.ctlRelyOnGraph.addRely_setAPOnBPChanged(theKernel, 'value', useCtl.kernel, propApi.stateName, {
                            value: 'null',
                        });
                    }
                    initbundleBlock.pushLine(makeLine_Assign(makeStr_DotProp('bundle', useName), makeStr_getStateByPath('useState', singleQuotesStr(makeStr_DotProp(useCtl.kernel.parentPath, useCtl.kernel.id + '.' + propApi.stateName)))));
                }
            }
        }
        if (needSetParams_arr.length > 0) {
            bodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '};');
            paramsetblock.pushLine("params_arr=[", 1);
            for (var si in needSetParams_arr) {
                var useParam = needSetParams_arr[si];
                paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.name + "', sqlTypes.NVarChar(4000), " + useParam.value + "),");
                bodyCheckblock.pushLine("if(req.body.bundle." + useParam.name + " == null){" + makeLine_RetServerError('没有提供' + useParam.value) + '};');
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
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            kernelMidData.hadValueField = hadValueField;
            var setTextStateItem = null;
            var setValueStateItem = null;
            if (belongFormKernel != null) {
                var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
                var formColumns_arr = belongFormKernel.getCanuseColumns();
                if (formMidData.needSetKernels_arr.indexOf(theKernel) == -1) {
                    formMidData.needSetKernels_arr.push(theKernel);
                }

                if (formColumns_arr.indexOf(textField) != -1) {
                    formMidData.useColumns_map[textField] = 1;
                    kernelMidData.columnName = textField;
                    setTextStateItem = {
                        name: 'text',
                        useColumn: { name: textField },
                    };
                }

                if (hadValueField && formColumns_arr.indexOf(valueField) != -1) {
                    formMidData.useColumns_map[valueField] = 1;
                    kernelMidData.columnName = valueField;
                    setValueStateItem = {
                        name: 'text',
                        useColumn: { name: textField },
                    };
                }
            }
            
            if (setValueStateItem != null && setTextStateItem == null) {
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '下拉框的码值字段能找到匹配但是显示字段找不到匹配']);
                return false;
            }

            if (setValueStateItem == null && setTextStateItem == null) {
                if (!defaultValParseRet.isScript) {
                    var hadDefaultStr = !IsEmptyString(defaultValParseRet.string);
                    setValueStateItem = {
                        name: 'value',
                        staticValue: hadDefaultStr ? defaultValParseRet.string : null,
                        setNull: !hadDefaultStr,
                    };

                    if (!hadDefaultStr) {
                        setTextStateItem = {
                            name: 'text',
                            setNull: true,
                        };
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
        var belongForm = theKernel.belongForm;
        var belongFormMidData = belongForm ? this.projectCompiler.getMidData(belongForm.id) : null;

        var pullFun = midData.pullFun;

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

                var theFun = pullFun;

                for (var formId in compilHelper.useForm_map) {
                    var useFormData = compilHelper.useForm_map[formId];
                    var formStateVarName = null;
                    ctlParentStateVarName = null;
                    ctlStateVarName = null;
                    if (!IsEmptyObject(useFormData.useControls_map)) {
                        formStateVarName = formId + '_state';
                        initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useFormData.formKernel.getStatePath()), '{}');
                        theFun.scope.getVar(formStateVarName, true, initValue);
    
                        for (usectlid in useFormData.useControls_map) {
                            useCtlData = useFormData.useControls_map[usectlid];
                            ctlStateVarName = usectlid + '_state';
                            initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(usectlid), '{}');
                            theFun.scope.getVar(ctlStateVarName, true, initValue);
                            if (useCtlData.kernel.isAEditor()) {
                                ctlParentStateVarName = useCtlData.kernel.parent.id + '_state';
                                initValue = makeStr_getStateByPath(formStateVarName, singleQuotesStr(useCtlData.kernel.parent.id), '{}');
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
                                needSetParams_arr.push({name:varName,value:varName});
                            }
                        }
                    }
                    if (!IsEmptyObject(useFormData.useColumns_map)) {
                        var nowRecordVarName = formId + '_nowrecord' + '';
                        initValue = makeStr_getStateByPath(formStateVarName == null ? VarNames.State : formStateVarName, singleQuotesStr(useFormData.formKernel.getStatePath(VarNames.NowRecord)));
                        theFun.scope.getVar(nowRecordVarName, true, initValue);
                        needCheckVars_arr.push(nowRecordVarName);
                    }
                }

                for (usectlid in compilHelper.useGlobalControls_map) {
                    useCtlData = compilHelper.useGlobalControls_map[usectlid];
                    ctlStateVarName = usectlid + '_state';
                    initValue = makeStr_getStateByPath(VarNames.State, singleQuotesStr(useCtlData.kernel.getStatePath()));
                    theFun.scope.getVar(ctlStateVarName, true, initValue);
    
                    for (propName in useCtlData.useprops_map) {
                        propApiitem = useCtlData.useprops_map[propName];
                        varName = usectlid + '_' + propApiitem.stateName;
                        theFun.scope.getVar(varName, true, ctlStateVarName + '.' + propApiitem.stateName);
                        if (propApiitem.needValid && needCheckProps_map[varName] == null) {
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
                        needSetParams_arr.push({name:varName,value:varName});
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
                            checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
                            return;
                        }
                        var valueType = 'string';
                        if(varObj.propApi){
                            this.ctlRelyOnGraph.addRely_CallFunOnBPChanged(theFun.name, varObj.kernel, varObj.propApi.stateName);
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
                            varObj.nullable.toString(),
                            singleQuotesStr(varObj.kernel.id),
                            validErrStateVar.name
                        ]) + ";");
                        validKernelBlock.pushLine("validErrState['" + infoStatePath + "']=validErr;");
                        validKernelBlock.pushLine("if(validErr != null) hadValidErr = true;");
                        //checkVarValidStr += (checkVarValidStr.length == 0 ? 'IsEmptyString(' : ' || IsEmptyString(') + varName + ')';
                    });
                    var dispatchErrLine = 'store.dispatch(makeAction_setStateByPath(gPreconditionInvalidInfo,' + singleQuotesStr(theKernel.getStatePath(VarNames.InvalidBundle)) + '));';
                    var setErrStateLine = makeStr_AddAll('return setStateByPath(',VarNames.State,',',singleQuotesStr(theKernel.getStatePath(VarNames.InvalidBundle)),",gPreconditionInvalidInfo);");
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
                    validKernelBlock.subNextIndent();
                    validKernelBlock.pushLine('}');
                }

                var serverBodyCheckblock = midData.bodyCheckblock;
                var paramsetblock = midData.serverSqlParamsetBLK;
                if (needSetParams_arr.length > 0) {
                    serverBodyCheckblock.pushLine("if(req.body.bundle == null){" + makeLine_RetServerError('没有提供bundle') + '};');
                    serverBodyCheckblock.pushLine("var bundle=req.body.bundle;");
                    paramsetblock.pushLine("params_arr=[", 1);
                    for (var si in needSetParams_arr) {
                        var useParam = needSetParams_arr[si];
                        initbundleBlock.pushLine(makeLine_Assign(VarNames.Bundle + '.' + useParam.name, useParam.name));
                        paramsetblock.pushLine("dbhelper.makeSqlparam('" + useParam.name + "', sqlTypes.NVarChar(4000), bundle." + useParam.value + "),");
                        serverBodyCheckblock.pushLine("if(bundle." + useParam.name + " == null){" + makeLine_RetServerError('没有提供' + useParam.value) + '};');
                    }
                }

                if (needSetParams_arr.length > 0) {
                    // 有用到参数,等待参数变更时触发pullfun

                }
                else{
                    // 没有用到参数，父对象刷新时出发pullfun
                    //var timeoutBlock = null;
                    if(belongFormMidData != null){
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
                       belongFormMidData.pullFun.beforeRetBlock.push(makeStr_callFun(pullFun.name, [VarNames.State]));
                    }
                    else{
                        var pageActiveFun = clientSide.scope.getFunction(makeFName_activePage(belongPage));
                        var timeoutBlock = pageActiveFun.getChild('timeout');
                        timeoutBlock.pushLine(makeStr_callFun(pullFun.name));
                    }
                    //timeoutBlock.pushLine(makeStr_callFun(pullFun.name, [VarNames.State]));
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
        else{

        }
    }
}