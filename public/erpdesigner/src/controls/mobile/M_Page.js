class M_Page extends ControlBase {
    constructor(){
        super(false,'手机页面','布局');
    }
}

DesignerConfig.registerControl(
{
    forPC : false,
    label : '页面',
    type : 'M_Page',
    invisible:true,
}, '布局');