class ControlPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            isPC:this.props.project.designeConfig.editingType == 'PC'
        };
        this.state = initState;
        this.watchedAttrs = ['editingType'];
        this.watchAttrMatch = attrName => this.watchedAttrs.indexOf(attrName) != -1;

        autoBind(this);
    }

    clickControlBtn(ev){

    }

    attrChangedHandler(ev){
        var needFresh = false;
        if(typeof ev.name === 'string'){
            needFresh = this.watchedAttrs.indexOf(ev.name) != -1;
        }
        else{
            needFresh = ev.name.some(this.watchAttrMatch);
        }
        if(needFresh){
            this.setState({
                isPC:this.props.project.designeConfig.editingType == 'PC',
            });
        }
    }

    forceUpdate(){
        this.setState({
            magicObj:{}
        });
    }

    componentWillMount(){
        this.props.project.on(EATTRCHANGED, this.attrChangedHandler);
        this.props.project.on('userControlChanged',this.forceUpdate);
    }

    componentWillUnmount(){
        this.props.project.off(EATTRCHANGED, this.attrChangedHandler);
        this.props.project.off('userControlChanged',this.forceUpdate);
    }

    controlIconMouseDown(ev){
        var ctltype = getAttributeByNode(ev.target, 'ctltype');
        if(ctltype == null){
            console.warn('未找到ctltype');
            return;
        }
        if(this.props.mouseDownControlIcon){
            var targetOffset = $(ev.target).offset();
            this.props.mouseDownControlIcon(ctltype, targetOffset.left, targetOffset.top);
        }
        //console.log('controlIconMouseDown:' + ctltype);
    }

    userControlIconMouseDown(ev){
        var uid = getAttributeByNode(ev.target, 'u-id');
        if(uid == null){
            console.warn('未找到uid');
            return;
        }
        if(this.props.mouseDownUserControlIcon){
            var targetOffset = $(ev.target).offset();
            this.props.mouseDownUserControlIcon(uid, targetOffset.left, targetOffset.top);
        } 
    }

    render() {
        var isPC = this.state.isPC;
        var projectName = this.props.project.designeConfig.name;
        return (
            <div className='flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column autoScroll'>
                {
                    DesignerConfig.controlConfig.groups.map(group=>{
                        return (
                            <React.Fragment key={group.name}>
                            <button type="button" data-toggle="collapse" data-target={"#" + projectName + group.name + "CtlList"} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light collapsbtn' style={{borderRadius:'0em',height:'2.5em'}}>{group.name}</button>
                            <div id={projectName + group.name + "CtlList"} className="list-group flex-grow-0 flex-shrink-0 collapse show" style={{ overflow: 'auto' }}>
                                {
                                    (isPC ? group.controlsForPC : group.controlsForMobile).map(
                                        ctl=>
                                        {
                                            return ctl.invisible ? null : (<button key={ctl.label} onMouseDown={this.controlIconMouseDown} ctltype={ctl.type} type="button" className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">{ctl.label}</button>)
                                        }
                                    )
                                }
                            </div>
                            </React.Fragment>
                        )
                    })
                }
                <button type="button" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em'}}>自订控件</button>
                <div id={projectName + "usercontrols"} className="list-group flex-grow-0 flex-shrink-0" style={{ overflow: 'auto' }}>
                    {
                        this.props.project.userControls_arr.map(userctl=>{
                            return <button key={userctl.id} u-id={userctl.id} type="button" onMouseDown={this.userControlIconMouseDown} className="list-group-item list-group-item-action flex-grow-0 flex-shrink-0">{userctl.name}</button>;
                        })
                    }
                </div>
            </div>
        )
    }
}