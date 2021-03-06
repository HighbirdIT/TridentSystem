class AttributePanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {};
        if(this.props.project)
        {
            var editingPage = this.props.project.getEditingPage();
            initState = {
                target:editingPage == null ? this.props.project : editingPage,
            };
            this.props.project.designer.attributePanel = this;
        }
        this.state = initState;

        autoBind(this,{exclude:['renderAttribute']});
    }

    getTarget(){
        return this.state.target;
    }

    getAttrValue(attr){
        return this.state.target.getAttribute(attr.name);
    }

    setAttrValue(attr, newvalue){
        this.state.target.setAttibute(attr.name,newvalue);
    }

    componentWillUnmount(){
        this.unlistenTarget(this.state.target);
    }

    targetAttributeGroupChangedhandler(ev){
        this.setState({
            magicObj:{}
        });
    }

    listenTarget(target){
        if(target == null){
            return;
        }
        target.on('AttributeGroupChanged', this.targetAttributeGroupChangedhandler);
    }

    unlistenTarget(target){
        if(target == null){
            return;
        }
        target.off('AttributeGroupChanged', this.targetAttributeGroupChangedhandler);
    }

    setTarget(newTarget){
        if(newTarget == this.state.target){
            return;
        }
        this.unlistenTarget(this.state.target);
        if(this.state.target && this.state.target.setSelected){
            this.state.target.setSelected(false);
        }
        if(newTarget && newTarget.setSelected){
            newTarget.setSelected(true);
        }
        if(this.props.project){
            this.props.project.emit(ESELECTEDCHANGED);
        }
        this.listenTarget(newTarget);
        this.setState({
            target:newTarget,
        });
    }

    renderAttribute(target){
        if(target == null){
            return (<div>未选中任何对象</div>);
        }
        if(target.attrbuteGroups == null){
            return (<div>此对象没有属性</div>);
        }
        var projectName = this.props.project ? this.props.project.designeConfig.name : '未知';
        return(
            target.attrbuteGroups.map((attrGroup,attrGroupIndex)=>{
                return(
                    <AttributeGroup key={attrGroup.label} projectName={projectName} attrGroup={attrGroup} attrGroupIndex={attrGroupIndex} target={target}  />
                )
            })
        );
    }

    gotoUserControlTemplate(){
        var target = this.state.target;
        if(this.props.project && target.refID)
        {
            this.props.project.setEditingControlById(target.refID);
        }
    }

    render() {
        var target = this.state.target;
        var title = '';
        var ctlBtn = null;
        if(target){
            if(target.getReadableName){
                title = target.getReadableName()
            }
            else{
                title = target.description + (target.id ? '[' + target.id + ']' : '') + (target.name ? '(' + target.name + ')' : '');
            }
            if(target.type && target.type == UserControlKernel_Type && !target.isTemplate()){
                ctlBtn = <span type="button" className='btn btn-sm btn-dark fa fa-share ml-1' onClick={this.gotoUserControlTemplate}></span>;
            }
        }
        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column minh-0' style={this.props.nofixwidth ? null : {width:'300px'}}>
                <button type="button" className='mw-100 btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em',overflow:'hidden'}}>{title}{ctlBtn}</button>
                <div className='flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column autoScroll'>
                    {
                        this.renderAttribute(target)
                    }
                </div>
            </div>
        )
    }
}