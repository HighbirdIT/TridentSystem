class ControlPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {};
        this.state = initState;
    }

    clickControlBtn(ev){

    }

    render() {
        return (
            <div style={{width:'200px'}} className='flex-grow-0 flex-shrink-0 bg-secondary d-flex flex-column'>
                {
                    DesignerConfig.controlConfig.groups.map(group=>{
                        return (
                            <React.Fragment key={group.name}>
                            <button type="button" data-toggle="collapse" data-target={"#" + group.name + "CtlList"} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em'}}>{group.name}</button>
                            <div id={group.name + "CtlList"} className="list-group flex-grow-1 flex-shrink-1 collapse show" style={{ overflow: 'auto' }}>
                                {
                                    (this.props.projconfig.isPC ? group.controlsForPC : group.controlsForMobile).map(
                                        ctl=>
                                        {
                                            return ctl.invisible ? null : (<button key={ctl.label} onClick={this.clickControlBtn} type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">{ctl.label}</button>)
                                        }
                                    )
                                }
                            </div>
                            </React.Fragment>
                        )
                    })
                }
            </div>
        )
    }
}