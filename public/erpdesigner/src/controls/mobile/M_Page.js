class M_Page extends ControlBase {
    constructor(props){
        super(props);
        
    }

    render(){
        return (<div>123</div>)
    }
}

DesignerConfig.registerControl(
{
    forPC : false,
    label : '页面',
    type : 'M_Page',
    invisible:true,
}, '布局');