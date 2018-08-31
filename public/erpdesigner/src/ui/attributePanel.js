class AttributePanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var editingPage = this.props.project.getEditingPage();
        var initState = {
            target:editingPage == null ? this.props.project : editingPage,
        };
        this.state = initState;
        this.props.project.designer.attributePanel = this;

        autoBind(this,{exclude:['renderAttribute']});
    }

    getAttrValue(attr){
        return this.state.target.getAttribute(attr.name);
    }

    setAttrValue(attr, newvalue){
        this.state.target.setAttibute(attr.name,newvalue);
    }

    setTarget(newTarget){
        if(newTarget == this.state.target){
            return;
        }
        if(this.state.target && this.state.target.setSelected){
            this.state.target.setSelected(false);
        }
        if(newTarget && newTarget.setSelected){
            newTarget.setSelected(true);
        }
        this.props.project.emit(ESELECTEDCHANGED);
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
        var projectName = this.props.project.designeConfig.name;
        return(
            target.attrbuteGroups.map((attrGroup,attrGroupIndex)=>{
                return(
                    <AttributeGroup key={attrGroup.label} projectName={projectName} attrGroup={attrGroup} attrGroupIndex={attrGroupIndex} target={target}  />
                )
            })
        );
    }

    render() {
        var target = this.state.target;
        return (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                <button type="button" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em',overflow:'hidden'}}>属性:{target == null ? '' : target.description + (target.name ? '(' + target.name + ')' : '')}</button>
                <div className='flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column autoScroll'>
                    {
                        this.renderAttribute(target)
                    }
                </div>
            </div>
        )
    }
}