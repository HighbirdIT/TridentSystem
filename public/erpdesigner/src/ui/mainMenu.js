class MenuCammandItem extends React.PureComponent {
    constructor(props){
        super(props);

        this.state = {};

        autoBind(this);
    }

    clickHandler(ev){
        var cmd = getAttributeByNode(ev.target, 'd-cmd');
        if(this.props.executFun){
            this.props.executFun({cmd:cmd});
        }
    }

    render(){
        return (
            <a className="dropdown-item" href="#" onClick={this.clickHandler} d-cmd={IsEmptyString(this.props.cmd) ? this.props.text : this.props.cmd}>{this.props.text}</a>
        );
    }
}

class MenuItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className={"dropdown ml-1 " + this.props.className}>
                <button className="btn btn-secondary dropdown-toggle" type="button" id={this.props.id + "dmb"} data-toggle="dropdown">
                    {this.props.text}
                </button>
                <div className="dropdown-menu">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

class MainMenu extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return null;
        return (
            <div id="mainMenuContainer" className="flex-grow-0 flex-shrink-0 bg-secondary d-flex MainMenu">
                <div className="btn-group" role="group">
                    <MenuItem id='MI_FILE' text="文件" >
                        <MenuCammandItem text="打开" />
                        <MenuCammandItem text="创建" />
                    </MenuItem>
                    <MenuItem id='MI_FILE' text="数据库" >
                        <MenuCammandItem text="管理" />
                    </MenuItem>
                </div>
            </div>
        );
    }
}