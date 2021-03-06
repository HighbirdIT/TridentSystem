function GetTabItems(tabControlKernel){
    return tabControlKernel.children.map(child=>{
        return {
            name:child.getAttribute(AttrNames.Title),
            code:child.id,
        };
    }).concat({
        name:'无',
        code:'0'
    });
}

const HERPTabControlKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置',[
        genIsdisplayAttribute(),
        new CAttribute('默认可见', AttrNames.DefaultVisible, ValueType.Boolean, true),
        new CAttribute('selectedItemID','selectedItemID',ValueType.String,'',true,false,null,null,false),
        new CAttribute('贪心模式', AttrNames.GreedMode, ValueType.Boolean, false),
        new CAttribute('默认打开', 'defaultTabitemID', ValueType.String, 0, true, false, [], {text:'name', value:'code',pullDataFun:GetTabItems}),
        new CAttribute('样式', AttrNames.DockType, ValueType.String, DockType_Top, true, false, DockType_Options_arr),
    ]),
]);


class HERPTabControlKernel extends ContainerKernelBase{
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(  initData,
                TabControl_Type,
                '选项卡',
                HERPTabControlKernelAttrsSetting,
                parentKernel,
                createHelper,kernelJson
            );
        this.hadReactClass = true;
        this.staticChild = true;
        var self = this;
        autoBind(self);
    }
    
    appandChild(childKernel, index) {
        return super.appandChild(childKernel, index);
    }

    canAppand(target){
        return target.type == TabItem_Type;
    }

    __attributeChanged(attrName, oldValue, value, realAtrrName, indexInArray){
    }

    renderSelf(clickHandler, replaceChildClick, designer){
        return (<HERPTabControl key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} replaceChildClick={replaceChildClick} />)
    }
}

var TabControl_api = new ControlAPIClass(TabControl_Type);
g_controlApi_arr.push(TabControl_api);

class HERPTabControl extends React.PureComponent {
    constructor(props){
        super(props);

        var ctlKernel = this.props.ctlKernel;
        var inintState = M_ControlBase(this, LayoutAttrNames_arr.concat([AttrNames.Chidlren,'selectedItemID',AttrNames.GreedMode,AttrNames.DockType]));
        M_ContainerBase(this);
        
        inintState.children = ctlKernel.children;
        inintState.selectedItemID = ctlKernel.selectedItemID;
        inintState.greedMode = ctlKernel.getAttribute(AttrNames.GreedMode);
        inintState.dockType = ctlKernel.getAttribute(AttrNames.DockType);

        this.state = inintState;

        autoBind(this);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        var childrenVal = this.state.children;
        var ctlKernel = this.props.ctlKernel;
        if (changedAttrName == AttrNames.Chidlren) {
            childrenVal = ctlKernel.children.concat();
        }
        this.setState({
            children: childrenVal,
            selectedItemID:ctlKernel.getAttribute('selectedItemID'),
            greedMode: ctlKernel.getAttribute(AttrNames.GreedMode),
            dockType: ctlKernel.getAttribute(AttrNames.DockType),
        });
    }

    clickCreateButtonHandler(ev){
        var ctlKernel = this.props.ctlKernel;
        var newItem = new HERPTabItemKernel({title:'未命名'}, ctlKernel);
        ctlKernel.setAttribute('selectedItemID', newItem.id);
    }

    clickTabItemHandler(ev){
        var itemid = getAttributeByNode(ev.target, 'ctlid');
        var ctlKernel = this.props.ctlKernel;
        ctlKernel.setAttribute('selectedItemID', itemid);
        if(!this.props.replaceChildClick){
            var itemKernel = ctlKernel.project.getControlById(itemid);
            if(itemKernel){
                var newEv = {
                    target:ev.target
                }
                setTimeout(() => {
                    itemKernel.clickHandler(newEv);
                }, 50);
            }
        }
    }

    render(){
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        var selectedItemID = this.state.selectedItemID;
        if(this.props.ctlKernel.__placing){
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>自订控件</div>);
        }
        layoutConfig.addClass('hb-control');
        layoutConfig.addClass('d-flex');
        layoutConfig.addClass('border');
        var rootStyle = layoutConfig.style;
        var itemBtns_arr = [];
        ctlKernel.children.forEach(tabItemKernel => {
            var iconType = tabItemKernel.getAttribute(AttrNames.IconType);
            var iconElem = null;
            if(!IsEmptyString(iconType)){
                iconElem = <i className={'fa fa-' + iconType} />
            }
            itemBtns_arr.push(<button onClick={this.clickTabItemHandler} key={tabItemKernel.id} ctlid={tabItemKernel.id} type='button' className={'btn ' + (tabItemKernel.id == selectedItemID ? 'btn-primary' : 'btn-dark') + (this.state.greedMode ? ' flex-grow-1 flex-shrink-1' : '')}>
                {iconElem}
                {tabItemKernel.getAttribute(AttrNames.Title)}
                </button>);
        });
        if(!this.props.replaceChildClick){
            itemBtns_arr.push(<button onClick={this.clickCreateButtonHandler} key='add' type='button' className='btn btn-success'>新建<i className='fa fa-plus' /></button>);
        }

        var title = IsEmptyString(this.state.title) ? '[未命名]' : this.state.title;
        var retElem = null;
        var dockType = this.state.dockType;
        var bodyDivClassName = 'd-flex flex-grow-1 flex-shrink-1';

        switch(dockType){
            case DockType_Top:
            layoutConfig.addClass('flex-column');
            bodyDivClassName += ' border-top';
            break;
            case DockType_Bottom:
            layoutConfig.addClass('flex-column');
            bodyDivClassName += ' border-bottom';
            break;
            case DockType_Left:
            bodyDivClassName += ' border-left';
            break;
            case DockType_Right:
            bodyDivClassName += ' border-right';
            break;
        }

        var cardItemsElem = (<div className={'btn-group' + (dockType == DockType_Left || dockType == DockType_Right ? '-vertical' : '')}>
                                {itemBtns_arr}
                                <button type='button' className='btn btn-dark flex-shrink-0'><i className='fa fa-at' /></button>
                            </div>);
        
        return <div className={layoutConfig.getClassName()} style={rootStyle} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                {dockType == DockType_Top || dockType == DockType_Left ? cardItemsElem : null}
                <div className={bodyDivClassName} style={{minHeight:'2em'}}>
                {
                    ctlKernel.children.length == 0 ?
                    ctlKernel.id :
                    ctlKernel.children.map(childKernel => {
                        if(childKernel.id != selectedItemID){
                            return null;
                        }
                        return childKernel.renderSelf(this.props.replaceChildClick ? this.props.onClick : null,this.props.replaceChildClick, this.props.designer);
                    })
                }
                </div>
                {dockType == DockType_Bottom || dockType == DockType_Right ? cardItemsElem : null}
            </div>
    }
}

DesignerConfig.registerControl(
    {
        label : '选项卡',
        type : TabControl_Type,
        namePrefix : TabControl_Prefix,
        kernelClass:HERPTabControlKernel,
        reactClass:HERPTabControl,
    }, '布局');