class MobileContentCompiler extends ContentCompiler{
    constructor(projectCompiler){
        super(projectCompiler);
        autoBind(this);
        
        this.conetents_arr = this.project.content_Mobile;
        this.compilePage = this.compilePage.bind(this);
        this.blocks_map = {};
    }

    compile(){
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;
        this.compileChain = [];
        this.compiledScriptBP_map = {};

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        this.appRenderSwicth = theSwicth;
        clientSide.appClass.renderFun.pushChild(theSwicth);
        var pageElemVar = clientSide.appClass.renderFun.scope.getVar('pageElem', true);

        clientSide.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps,'loaded'), 'state.loaded'));
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
        for(var pi in project.content_Mobile.pages){
            this.compileChain.push(project.content_Mobile.pages[pi]);
            if(this.compilePage(project.content_Mobile.pages[pi]) == false){
                return false;
            }
        }
        if(this.mianPageKernel == null){
            logManager.error('项目没有设置主页面');
        }
        clientSide.pageLoadedReducerFun.pushLine("return gotoPage('" + this.mianPageKernel.id + "', state);");

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className='w-100 h-100'>");
        clientSide.appClass.renderFun.pushLine("<FixedContainer ref={gFixedContainerRef} />");
        clientSide.appClass.renderFun.pushLine("{this.renderLoadingTip()}");
        clientSide.appClass.renderFun.pushLine("{pageElem}", -1);
        clientSide.appClass.renderFun.pushLine("</div>);");

        for(var ki in this.compileChain){
            this.endKernelCompile(this.compileChain[ki]);
        }

        return true;
    }

    compileScriptBlueprint(targetBP){
        if(this.compiledScriptBP_map[targetBP.id]){
            return this.compiledScriptBP_map[targetBP.id];
        }
        var project = this.project;
        var logManager = project.logManager;
        var useScope = targetBP.type == FunType_Client ? this.clientSide.scope : this.serverSide.scope;
        var compileHelper = new JSNode_CompileHelper(logManager, null, useScope);
        var compileRet = targetBP.compile(compileHelper);
        if(compileRet == false){
            return false;
        }
        this.compiledScriptBP_map[targetBP.id] = compileRet;
    }

    compilePage(pageKernel){
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;
        if(pageKernel.getAttribute(AttrNames.IsMain)){
            if(this.mianPageKernel == null){
                this.mianPageKernel = pageKernel;
            }
            else{
                logManager.error('重复设置主页面:' + pageKernel.getAttribute(AttrNames.Title));
            }
        }
        var thisMidData = this.projectCompiler.getMidData(pageKernel.id);
        var pageReactClass = clientSide.getReactClass(pageKernel.getReactClassName(), true);
        pageReactClass.renderHeaderFun = pageReactClass.getFunction('renderHead', true);
        //pageReactClass.renderFootFun = pageReactClass.getFunction('renderFoot', true);
        //pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        var caseBlock = this.appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
        caseBlock.pushLine(makeLine_Assign('pageElem', '<' + pageKernel.getReactClassName(true) + ' />'));

        var gotoPageCaseBlock = clientSide.gotoPageFun.switchBlock.getCaseBlock(singleQuotesStr(pageKernel.id));
        gotoPageCaseBlock.pushLine(makeLine_Assign(VarNames.ReState, makeStr_callFun(makeFName_activePage(pageKernel), [VarNames.ReState])));

        pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
        pageReactClass.renderHeaderFun.pushLine("<h3>" + pageKernel.getAttribute(AttrNames.Title) + "</h3>",-1);
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
        pageLayoutConfig.addClass('d-flex');
        pageLayoutConfig.addClass('flex-grow-1');
        pageLayoutConfig.addClass('flex-shrink-0');
        pageLayoutConfig.addClass('autoScroll_Touch');
        if(pageOrientation == Orientation_V){
            pageLayoutConfig.addClass('flex-column');
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
        activePageFun.pushLine(makeLine_Assign('state.nowPage', singleQuotesStr(pageKernel.id)));
        activePageFun.pushLine('setTimeout(() => {', 1);
        var activeTimeoutBlock = new FormatFileBlock('timeout');
        activePageFun.pushChild(activeTimeoutBlock);
        activePageFun.subNextIndent();
        activePageFun.pushLine('}, 50);');
        activePageFun.retBlock.pushLine('return state;');

        for(var ci in pageKernel.children){
            var childKernel = pageKernel.children[ci];
            if(this.compileKernel(childKernel, pageRenderBlock, pageReactClass.renderContentFun) == false){
                return false;
            }
        }
    }

    getKernelParentPath(theKernel){
        var nowKernel = theKernel.parent;
        var rlt ='';
        do{
            switch(nowKernel.type){
                case M_PageKernel_Type:
                rlt = nowKernel.id + (rlt.length == 0 ? '' : '.') + rlt;
                break;
                case M_FormKernel_Type:
                rlt = nowKernel.id + (rlt.length == 0 ? '' : '.') + rlt;
                break;
            }
            if(nowKernel){
                nowKernel = nowKernel.parent;
            }
        }while(nowKernel != null)
        return rlt;
    }

    compileKernel(theKernel, renderBlock, renderFun){
        this.compileChain.push(theKernel);
        var project = this.project;
        var logManager = project.logManager;
        var rlt = true;
        switch(theKernel.type){
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
            default:
            logManager.error('不支持的编译kernel type:' + theKernel.type);
        }
        return rlt;
    }

    genERPCTag(kernel, tagName){
        var rltTag = new FormatHtmlTag(kernel.id, tagName, this.clientSide);
        var parentPath = this.getKernelParentPath(theKernel);
        rltTag.setAttr('id', kernel.id);
        rltTag.setAttr('parentPath', parentPath);
        return rltTag;
    }

    compileTextKernel(theKernel, renderBlock, renderFun){
        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Text', this.clientSide);
        var layoutConfig = theKernel.getLayoutConfig();
        
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;
        var parentPath = this.getKernelParentPath(theKernel);
        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', parentPath);
        var valType = theKernel.getAttribute(AttrNames.ValueType);
        ctlTag.setAttr('type', valType);
        if(valType == ValueType.Float){
            ctlTag.setAttr('precision', theKernel.getAttribute(AttrNames.FloatNum));
        }
        renderBlock.pushChild(ctlTag);

        var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
        if(belongFormKernel != null){
            var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
            var formDS = belongFormKernel.getAttribute(AttrNames.DataSource);
            var textField = theKernel.getAttribute(AttrNames.TextField);
            var useColumn = formDS.getColumnByName(textField);
            if(useColumn){
                formMidData.needSetKernels_arr.push(theKernel);
                formMidData.useColumns_map[useColumn.name] = 1;
                kernelMidData.columnName = textField;
                kernelMidData.needSetStates_arr = [
                    {
                        name:'value',
                        useColumn:useColumn
                    }
                ];
            }
        }
    }

    compileLabeledControlKernel(theKernel, renderBlock, renderFun){
        var clientSide = this.clientSide;
        var layoutConfig = theKernel.getLayoutConfig();
        var project = this.project;
        var logManager = project.logManager;
        var label = theKernel.getAttribute(AttrNames.TextField);

        if(IsEmptyObject(label)){
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '没有设置标签']);
            return false;
        }

        var parentPath = this.getKernelParentPath(theKernel);
        var textFieldParseRet = parseObj_CtlPropJsBind(label, project.scriptMaster);
        
        var labeledCtrlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_LabeledControl', this.clientSide);
        labeledCtrlTag.class = layoutConfig.class;
        labeledCtrlTag.style = layoutConfig.style;
        labeledCtrlTag.setAttr('id', theKernel.id);
        labeledCtrlTag.setAttr('parentPath', parentPath);
        if(textFieldParseRet.isScript){
            if(textFieldParseRet.jsBp == null){
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '显示字段用到了脚本，但没有创建此脚本']);
                return false;
            }
            this.compileScriptBlueprint(textFieldParseRet.jsBp);
            var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
            if(belongFormKernel == null){
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '必须放置在Form之中']);
                return false;
            }
            var kernelMidData = this.projectCompiler.getMidData(theKernel.id);
            var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
            formMidData.needSetKernels_arr.push(theKernel);
            kernelMidData.needSetStates_arr = [
                {
                    name:'label',
                    funName:textFieldParseRet.funName,
                    isDynamic:true,
                }
            ];
        }else{
            labeledCtrlTag.setAttr('label', label);
        }
        var childBlock = new FormatFileBlock('child');
        labeledCtrlTag.pushChild(childBlock);
        renderBlock.pushChild(labeledCtrlTag);

        if(theKernel.editor){
            this.compileKernel(theKernel.editor, childBlock, renderFun);
        }
    }

    compileFormKernel(theKernel, renderBlock, renderFun){
        var clientSide = this.clientSide;
        var serverSide = this.serverSide;
        var layoutConfig = theKernel.getLayoutConfig();
        var parentPath = this.getKernelParentPath(theKernel);
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-form');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if(orientation == Orientation_V){
            layoutConfig.addClass('flex-column');
        }

        var formReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        var isPageForm = true;
        if(isPageForm)
        {
            formReactClass.constructorFun.pushLine('ERPC_PageForm(this);');
        }
        var renderContentFun = formReactClass.getFunction('renderContent', true);
        formReactClass.renderContentFun = renderContentFun;
        renderContentFun.scope.getVar(VarNames.RetElem, true, 'null');
        renderContentFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        var ifFetchErrBlock = new JSFile_IF(VarNames.FetchErr, makeStr_ThisProp(VarNames.FetchErr));
        renderContentFun.pushChild(ifFetchErrBlock);
        ifFetchErrBlock.pushLine("return renderFetcingErrDiv(" + makeStr_ThisProp(VarNames.FetchErr) + ".info);");

        var ifFetingBlock = new JSFile_IF(VarNames.Fetching, "!this.props.loaded || this.props.fetching");
        ifFetingBlock.pushLine("return renderFetcingTipDiv();");
        renderContentFun.pushChild(ifFetingBlock);
        renderContentFun.pushLine(VarNames.RetElem + " = (", 1);
        renderContentFun.pushLine("<div className='" + layoutConfig.getClassName() + "'>", 1);

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        formReactClass.renderContentFun.pushChild(childRenderBlock);

        var navigaterBlock = new FormatFileBlock('navigater');
        navigaterBlock.pushLine("{this.renderNavigater()}");
        formReactClass.navigaterBlock = navigaterBlock;
        formReactClass.renderContentFun.pushChild(navigaterBlock);
        formReactClass.renderContentFun.subNextIndent();
        formReactClass.renderContentFun.pushLine("</div>);");

        formReactClass.renderFun.pushLine(VarNames.RetElem + " = this.renderContent();");

        var formTag = new FormatHtmlTag(theKernel.id, theKernel.getReactClassName(true), this.clientSide);
        formTag.setAttr('id', theKernel.id);
        formTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
        renderBlock.pushChild(formTag);

        var thisfullpath = makeStr_DotProp(parentPath,theKernel.id);

        formReactClass.mapStateFun.scope.getVar(VarNames.CtlState, true, "getStateByPath(state, '" + thisfullpath + "', {})");
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.Fetching), makeStr_DotProp(VarNames.CtlState, VarNames.Fetching)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.FetchErr), makeStr_DotProp(VarNames.CtlState, VarNames.FetchErr)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.Records_arr), makeStr_DotProp(VarNames.CtlState, VarNames.Records_arr)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.RecordIndex), makeStr_DotProp(VarNames.CtlState, VarNames.RecordIndex)));
        formReactClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, 'loaded'), makeStr_DotProp(VarNames.CtlState, VarNames.Records_arr) + ' != ' + null));

        var useDS = theKernel.getAttribute(AttrNames.DataSource);

        var freshFun = clientSide.scope.getFunction(makeFName_freshForm(theKernel), true, [VarNames.ReState,VarNames.Records_arr]);
        clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath,VarNames.Records_arr))] = freshFun.name + '.bind(window)';
        clientSide.stateChangedAct[singleQuotesStr(makeStr_DotProp(thisfullpath,VarNames.RecordIndex))] = makeFName_bindForm(theKernel) + '.bind(window)';
        freshFun.pushLine(makeStr_callFun('simpleFreshFormFun', [VarNames.ReState,VarNames.Records_arr, singleQuotesStr(makeStr_DotProp(parentPath,theKernel.id))], ';'));
        
        var bindFun = clientSide.scope.getFunction(makeFName_bindForm(theKernel), true, [VarNames.ReState,'newIndex','oldIndex']);
        bindFun.scope.getVar('formState', true, makeStr_getStateByPath(VarNames.ReState, singleQuotesStr(thisfullpath)));
        bindFun.scope.getVar(VarNames.Records_arr, true, makeStr_DotProp('formState', VarNames.Records_arr));
        bindFun.scope.getVar(VarNames.NeedSetState, true, '{}');
        var saveInsertIfBlock = null;
        var insertModeIf = null;
        var hadInsertCacheIf = null;

        var belongPage = theKernel.searchParentKernel(M_PageKernel_Type, true);
        var belongPageMidData = this.projectCompiler.getMidData(belongPage.id);
        var belongPageActiveFun = clientSide.scope.getFunction(makeFName_activePage(belongPage));
        var thisFormMidData = this.projectCompiler.getMidData(theKernel.id);
        thisFormMidData.needSetKernels_arr = [];
        thisFormMidData.useColumns_map = [];
        if(useDS)
        {
            // gen pull fun
            var pullFun = clientSide.scope.getFunction(makeFName_pull(theKernel), true);
            pullFun.pushLine(makeLine_FetchPropValue(makeActStr_pullKernel(theKernel), singleQuotesStr(parentPath), singleQuotesStr(theKernel.id), singleQuotesStr(VarNames.Records_arr), false));
            
            var pageActiveFun = clientSide.scope.getFunction(makeFName_activePage(belongPage));
            var timeoutBlock = pageActiveFun.getChild('timeout');
            timeoutBlock.pushLine(pullFun.name + '();');

            // gen back pull
            var serverPullFun = serverSide.scope.getFunction(makeActStr_pullKernel(theKernel), true, ['req','res']);
            serverSide.initProcessFun(serverPullFun);
            serverSide.processesMapVarInitVal[serverPullFun.name] = serverPullFun.name;
            serverPullFun.pushLine("var params_arr = null;");
            thisFormMidData.serverSqlLine = new FormatFile_Line("var sql='';");
            thisFormMidData.useDS = useDS;
            serverPullFun.pushLine(thisFormMidData.serverSqlLine);
            serverPullFun.pushLine("if (sql == null) {return serverhelper.createErrorRet('生成sql失败');}");
            serverPullFun.pushLine("var rcdRlt = yield dbhelper.asynQueryWithParams(sql, params_arr);");
            serverPullFun.pushLine("return rcdRlt.recordset;");

            saveInsertIfBlock = new JSFile_IF('saveinsert', 'oldIndex == -1');
            bindFun.saveInsertBlock = saveInsertIfBlock.trueBlock;
            bindFun.pushChild(saveInsertIfBlock);
            insertModeIf = new JSFile_IF('validrow', 'records_arr == null || newIndex == -1');
            bindFun.pushLine('var useIndex = newIndex;');
            bindFun.pushChild(insertModeIf);
            insertModeIf.trueBlock.pushLine(makeLine_Assign(VarNames.InsertCache, makeStr_getStateByPath("formState", singleQuotesStr(VarNames.InsertCache))));
            hadInsertCacheIf = new JSFile_IF(VarNames.InsertCache, VarNames.InsertCache);
            insertModeIf.trueBlock.pushChild(hadInsertCacheIf);
            insertModeIf.falseBlock.pushLine('var ' + VarNames.NowRecord + '=' + VarNames.Records_arr + '[useIndex];');

            //belongPageActiveFun.pushLine(makeStr_callFun('setStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), 'false']));
        }
        else{
            
        }
        var dynamicSetBlock = new FormatFileBlock('dynamic');
        bindFun.pushChild(dynamicSetBlock);
        
        bindFun.pushLine(makeStr_callFun('setManyStateByPath', [VarNames.ReState, singleQuotesStr(thisfullpath), VarNames.NeedSetState], ';'));
        

        for(var ci in theKernel.children){
            var childKernel = theKernel.children[ci];
            if(this.compileKernel(childKernel, childRenderBlock, renderFun) == false){
                return false;
            }
        }
        
        if(thisFormMidData.needSetKernels_arr){
            for(ci in thisFormMidData.needSetKernels_arr){
                var targetKernel = thisFormMidData.needSetKernels_arr[ci];
                var targetKernelMidData = this.projectCompiler.getMidData(targetKernel.id);
                if(targetKernelMidData.needSetStates_arr){
                    targetKernelMidData.needSetStates_arr.forEach(stateItem=>{
                        var stateName = makeStr_DotProp(targetKernel.id, stateItem.name);
                        var state_Name = makeStr_join('_', targetKernel.id, stateItem.name);
                        if(stateItem.isDynamic){
                            if(stateItem.funName){
                                dynamicSetBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_callFun(stateItem.funName)));
                            }
                        }else{
                            if(useDS){
                                saveInsertIfBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, VarNames.InsertCache + '.' + state_Name), makeStr_getStateByPath('formState', singleQuotesStr(stateName))));
                                if(stateItem.useColumn){
                                    hadInsertCacheIf.trueBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), VarNames.InsertCache + '.' + state_Name));
                                    hadInsertCacheIf.falseBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), "''"));
                                    insertModeIf.falseBlock.pushLine(makeLine_Assign(makeStr_DynamicAttr(VarNames.NeedSetState, stateName), makeStr_DynamicAttr(VarNames.NowRecord, stateItem.useColumn.name)));
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    compileContainerKernel(theKernel, renderBlock, renderFun){
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-control');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if(orientation == Orientation_V){
            layoutConfig.addClass('flex-column');
        }

        var childRenderBlock = new FormatFileBlock(theKernel.id);
        var styleID = theKernel.id + '_style';
        var styleStr = this.clientSide.addStyleObject(styleID,layoutConfig.style) ? 'style={' + styleID + '}' : ''; 
        renderBlock.pushLine("<div className='" + layoutConfig.getClassName() + "' " + styleStr + ">", 1);
        renderBlock.pushChild(childRenderBlock);
        renderBlock.subNextIndent();
        renderBlock.pushLine('</div>');

        for(var ci in theKernel.children){
            var childKernel = theKernel.children[ci];
            if(this.compileKernel(childKernel, childRenderBlock, renderFun) == false){
                return false;
            }
        }
    }

    compileLabelKernel(theKernel, renderBlock, renderFun){
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('erp-control');

        var ctlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_Label', this.clientSide);
        ctlTag.class = layoutConfig.class;
        ctlTag.style = layoutConfig.style;

        ctlTag.setAttr('id', theKernel.id);
        ctlTag.setAttr('parentPath', this.getKernelParentPath(theKernel));
        renderBlock.pushChild(ctlTag);

        var textField = theKernel.getAttribute(AttrNames.TextField);
        var kernelMidData = this.projectCompiler.getMidData(theKernel.id);

        //var canUserComlumns_arr = GetKernelCanUseColumns(theKernel);
        //var userColumn = canUserComlumns_arr.find(x=>{return x.name == textField;});
        var belongFormKernel = theKernel.searchParentKernel(M_FormKernel_Type, true);
        if(belongFormKernel != null){
            var formMidData = this.projectCompiler.getMidData(belongFormKernel.id);
            if(formMidData.needSetKernels_arr == null){
                formMidData.needSetKernels_arr = [];
            }
            var formDS = belongFormKernel.getAttribute(AttrNames.DataSource);
            var useColumn = formDS.getColumnByName(textField);
            if(useColumn){
                formMidData.needSetKernels_arr.push(theKernel);
                formMidData.useColumns_map[useColumn.name] = 1;
                kernelMidData.columnName = textField;
                kernelMidData.needSetStates_arr = [
                    {
                        name:'text',
                        useColumn:useColumn
                    }
                ];
            }else{
                ctlTag.setAttr('text',textField);
            }
        }
        else{
            ctlTag.setAttr('text',textField);
        }
    }

    compileEnd(){
        var clientSide = this.clientSide;

        super.compileEnd();
    }
    
    getString(indentChar, newLineChar){
        return this.clientSide.getString(indentChar, newLineChar);
    }

    endKernelCompile(kernel){
        switch(kernel.type){
            case M_FormKernel_Type:
            this.endFormKernelCompile(kernel);
            break;
        }
    }

    endFormKernelCompile(theKernel){
        var project = this.project;
        var logManager = project.logManager;
        var midData = this.projectCompiler.getMidData(theKernel.id);
        if(midData.useDS){
            if(IsEmptyObject(midData.useColumns_map)){
                logManager.errorEx([logManager.createBadgeItem(
                    theKernel.getReadableName(),
                    theKernel,
                    this.projectCompiler.clickKernelLogBadgeItemHandler),
                    '没有任何列被使用']);
            }
            else{
                var sqlStr = '';
                for(var pname in midData.useColumns_map){
                    sqlStr += (sqlStr.length == 0 ? '' : ',') + pname;
                }
                midData.serverSqlLine.content = "var sql = 'select " + sqlStr + ' from '  + midData.useDS.name + "';";
            }
        }
    }
}