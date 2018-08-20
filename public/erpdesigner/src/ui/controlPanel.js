class ControlPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {};
        this.state = initState;
    }

    render() {
        return (
            <div {...this.props} style={{width:'200px'}}>
                <button type="button" data-toggle="collapse" data-target="#commonCtlList" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em'}}>界面控件</button>
                <div id="commonCtlList" className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">文本框</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">标签框</button>
                </div>
                <button type="button" data-toggle="collapse" data-target="#commandCtlList" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em'}}>按钮控件</button>
                <div id="commandCtlList" className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮1</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                    <button type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">按钮2</button>
                </div>
            </div>
        )
    }
}