class MobileContentCompiler extends ContentCompiler{
    constructor(projectCompiler){
        super(projectCompiler);
        autoBind(this);
        
        this.conetents_arr = this.project.content_Mobile;
        this.compilePage = this.compilePage.bind(this);
    }

    compile(){
        var clientSide = this.clientSide;
        var project = this.project;
        var logManager = project.logManager;

        var theSwicth = new JSFile_Switch('switchpage', makeStr_ThisProp(VarNames.NowPage));
        clientSide.appClass.renderContentFun.pushChild(theSwicth);

        this.mianPageKernel = null;
        project.content_Mobile.pages.forEach(this.compilePage);
        if(this.mianPageKernel == null){
            logManager.error('项目没有设置主页面');
        }

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
        pageReactClass.renderFun.pushLine(makeLine_Assign(VarNames.RetElem, '<div>' + pageKernel.getAttribute(AttrNames.Title) + '</div>'));

        var appRenderSwicth = clientSide.appClass.renderContentFun.getChild('switchpage');
        var caseBlock = appRenderSwicth.getCaseBlock(singleQuotesStr(pageKernel.id));
        caseBlock.pushLine(makeLine_Assign(VarNames.RetElem, '<' + pageKernel.getReactClassName(true) + ' />'));
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