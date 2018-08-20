class AttributePanel extends React.PureComponent {
    constructor(props) {
        super(props);

        var initState = {
            target:this.props.project,
            version:this.props.project.attrVersion,
        };
        this.state = initState;
        this.props.project.designer.attributePanel = this;

        autoBind(this,{exclude:['renderAttribute']});
    }

    renderAttribute(target){
        if(target.attrbuteGroups == null){
            return (<div>此对象没有属性</div>);
        }
        return(
            target.attrbuteGroups.map((attrGroup,attrGroupIndex)=>{
                return(
                <React.Fragment key={attrGroup.label}>
                <button type="button" data-toggle="collapse" data-target={"#attrGroup" + attrGroup.label} className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em'}}>{attrGroup.label}</button>
                <div id={"attrGroup" + attrGroup.label} className={"list-group flex-grow-0 flex-shrink-0 collapse" + (attrGroupIndex==0 ? ' show' : '')} style={{ overflow: 'auto' }}>
                    {
                        attrGroup.attrs_arr.map(attr=>{
                            return(
                                <AttributeEditor key={attr.name} targetattr={attr} />
                            )
                        })
                    }
                </div>
                </React.Fragment>)
            })
        );
    }

    render() {
        var target = this.state.target;
        return (
            <div className='flex-grow-0 flex-shrink-0 bg-light d-flex flex-column' style={{width:'350px'}}>
            <button type="button" className='btn flex-grow-0 flex-shrink-0 bg-secondary text-light' style={{borderRadius:'0em',height:'2.5em',overflow:'hidden'}}>属性:{target.description}</button>
            <div className='flex-grow-1 flex-shrink-1 bg-secondary d-flex flex-column' style={{overflow:'auto'}}>
                {
                    this.renderAttribute(target)
                }
            </div>
            </div>
        )
    }
}