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

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        var pageElemVar = clientSide.appClass.renderFun.scope.getVar('pageElem', true);
        clientSide.appClass.renderFun.pushChild(theSwicth);

        this.mianPageKernel = null;
        for(var pi in project.content_Mobile.pages){
            if(this.compilePage(project.content_Mobile.pages[pi]) == false){
                return false;
            }
        }
        if(this.mianPageKernel == null){
            logManager.error('项目没有设置主页面');
        }

        clientSide.appClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        clientSide.appClass.renderFun.pushLine("<div className='w-100 h-100'>");
        clientSide.appClass.renderFun.pushLine("<FixedContainer ref={gFixedContainerRef} />");
        clientSide.appClass.renderFun.pushLine("{this.renderLoadingTip()}");
        clientSide.appClass.renderFun.pushLine("{pageElem}", -1);
        clientSide.appClass.renderFun.pushLine("</div>);");

        return true;
    }

    compilePage(pageKernel){
        var clientSide = this.clientSide;
        if(pageKernel.getAttribute(AttrNames.IsMain)){
            if(this.mianPageKernel == null){
                this.mianPageKernel = pageKernel;
            }
            else{
                logManager.error('重复设置主页面:' + pageKernel.getAttribute(AttrNames.Title));
            }
        }
        var pageReactClass = clientSide.getReactClass(pageKernel.getReactClassName(), true);
        pageReactClass.renderHeaderFun = pageReactClass.getFunction('renderHead', true);
        pageReactClass.renderFootFun = pageReactClass.getFunction('renderFoot', true);
        //pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        var appRenderSwicth = clientSide.appClass.renderFun.getChild('switchpage');
        var caseBlock = appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
        caseBlock.pushLine(makeLine_Assign('pageElem', '<' + pageKernel.getReactClassName(true) + ' />'));

        pageReactClass.renderHeaderFun.pushLine("return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>", 1);
        pageReactClass.renderHeaderFun.pushLine("<h3>" + pageKernel.getAttribute(AttrNames.Title) + "</h3>",-1);
        pageReactClass.renderHeaderFun.pushLine("</div>);");

        pageReactClass.renderFootFun.pushLine("return (<div className='flex-grow-0 flex-shrink-0 bg-primary text-light pageFooter'>", 1);
        pageReactClass.renderFootFun.pushLine("<h3>页脚</h3>", -1);
        pageReactClass.renderFootFun.pushLine("</div>);");

        pageReactClass.renderFun.pushLine(VarNames.RetElem + " = (", 1);
        pageReactClass.renderFun.pushLine("<div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100'>", 1);
        pageReactClass.renderFun.pushLine("{this." + pageReactClass.renderHeaderFun.name + "()}");
        pageReactClass.renderFun.pushLine("{this.renderContent()}");
        pageReactClass.renderFun.pushLine("{this." + pageReactClass.renderFootFun.name + "()}", -1);
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

        renderBlock.pushChild(ctlTag);
    }

    compileLabeledControlKernel(theKernel, renderBlock, renderFun){
        var clientSide = this.clientSide;
        var layoutConfig = theKernel.getLayoutConfig();
        var project = this.project;
        var logManager = project.logManager;
        var label = theKernel.getAttribute(AttrNames.Label);

        if(IsEmptyObject(label)){
            logManager.errorEx([logManager.createBadgeItem(
                theKernel.getReadableName(),
                theKernel,
                this.projectCompiler.clickKernelLogBadgeItemHandler),
                '没有设置标签']);
            return false;
        }

        var parentPath = this.getKernelParentPath(theKernel);
        
        var labeledCtrlTag = new FormatHtmlTag(theKernel.id, 'VisibleERPC_LabeledControl', this.clientSide);
        labeledCtrlTag.class = layoutConfig.class;
        labeledCtrlTag.style = layoutConfig.style;
        labeledCtrlTag.setAttr('id', theKernel.id);
        labeledCtrlTag.setAttr('parentPath', parentPath);
        labeledCtrlTag.setAttr('label', label);
        labeledCtrlTag.pushLine("<div>这是内容</div>");
        renderBlock.pushChild(labeledCtrlTag);
    }

    compileFormKernel(theKernel, renderBlock, renderFun){
        var clientSide = this.clientSide;
        var layoutConfig = theKernel.getLayoutConfig();
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('flex-grow-1');
        layoutConfig.addClass('flex-shrink-1');
        layoutConfig.addClass('erp-form');
        var orientation = theKernel.getAttribute(AttrNames.Orientation);
        if(orientation == Orientation_V){
            layoutConfig.addClass('flex-column');
        }

        var formReactClass = clientSide.getReactClass(theKernel.getReactClassName(), true);
        var renderContentFun = formReactClass.getFunction('renderContent', true);
        formReactClass.renderContentFun = renderContentFun;
        renderContentFun.scope.getVar(VarNames.RetElem, true, 'null');
        renderContentFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        renderContentFun.pushLine(VarNames.RetElem + " = (", 1);
        renderContentFun.pushLine("<div className='" + layoutConfig.getClassName() + "'>", 1);
        var childRenderBlock = new FormatFileBlock(theKernel.id);
        formReactClass.renderContentFun.pushChild(childRenderBlock);
        formReactClass.renderContentFun.subNextIndent();
        formReactClass.renderContentFun.pushLine("</div>);");

        formReactClass.renderFun.pushLine(VarNames.RetElem + " = this.renderContent();");

        renderBlock.pushLine('<' + theKernel.getReactClassName(true) + ' />');

        for(var ci in theKernel.children){
            var childKernel = theKernel.children[ci];
            if(this.compileKernel(childKernel, childRenderBlock, renderFun) == false){
                return false;
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
        var styleID = theKernel.id + '_style';
        var styleStr = this.clientSide.addStyleObject(styleID,layoutConfig.style) ? 'style={' + styleID + '}' : ''; 
        renderBlock.pushLine("<span className='" + layoutConfig.getClassName() + "' " + styleStr + ">" + theKernel.getAttribute(AttrNames.Text) + "</span>");
    }

    compileEnd(){
        var clientSide = this.clientSide;
        if(this.mianPageKernel)
        {
            clientSide.appInitState[VarNames.NowPage] = singleQuotesStr(this.mianPageKernel.id);
        }

        super.compileEnd();
    }
    
    getString(indentChar, newLineChar){
        return this.clientSide.getString(indentChar, newLineChar);
    }
}