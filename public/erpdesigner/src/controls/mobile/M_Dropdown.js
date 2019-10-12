const M_DropdownKernelAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        new CAttribute('数据源', AttrNames.DataSource, ValueType.DataSource, null, true, false, [], {text:'name', value:'code', pullDataFun:gGetAllEntitiesByKernel}),
        new CAttribute('来源文本字段', AttrNames.FromTextField, ValueType.String, '', true, false, 'getUseDSColumns'),
        new CAttribute('来源码值字段', AttrNames.FromValueField, ValueType.String, '', true, false, 'getUseDSColumns'),
        genTextFiledAttribute(),
        genValueFiledAttribute(),
        new CAttribute('默认值', AttrNames.DefaultValue, ValueType.String, '', true, false, null, null,true,{
            scriptable:true,
            type:FunType_Client,
            group:EJsBluePrintFunGroup.CtlAttr,
        } ),
        genIsdisplayAttribute(),
        genNullableAttribute(),
        genValidCheckerAttribute(),
        new CAttribute('', AttrNames.CustomDataSource, ValueType.CustomDataSource, null, true),
        new CAttribute('自动感应消值', AttrNames.AutoClearValue, ValueType.Boolean, true),
        new CAttribute('允许多选', AttrNames.MultiSelect, ValueType.Boolean, false),
        new CAttribute('允许选星', AttrNames.StarSelectable, ValueType.Boolean, false),
        new CAttribute('稳定的数据', AttrNames.StableData, ValueType.Boolean, true),
        new CAttribute('数据分层', 'datagroup', ValueType.String, '', true, true, 'getCanuseColumns'),
        new CAttribute('数据类型', AttrNames.ValueType, ValueType.String, ValueType.String, true, false, JsValueTypes),
        new CAttribute('接受输入值', AttrNames.Editeable, ValueType.Boolean, false),
        new CAttribute('历史Key', AttrNames.HisKey, ValueType.String, '', true, false),
        new CAttribute('Growable', AttrNames.Growable, ValueType.Boolean, true),
    ]),
    new CAttributeGroup('事件',[
        new CAttribute('OnChanged', AttrNames.Event.OnChanged, ValueType.Event),
    ]),
]);


class M_DropdownKernel extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            M_DropdownKernel_Type,
            '下拉框',
            M_DropdownKernelAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        
        var cusDsName = this.id + '_' + AttrNames.CustomDataSource;
        var cusDS_bp = this.project.dataMaster.getSqlBPByName(cusDsName);
        if(cusDS_bp == null){
            cusDS_bp = this.project.dataMaster.createSqlBP(cusDsName, '表值', 'ctlcus');
        }
        cusDS_bp.ctlID = this.id;
        cusDS_bp.ctlKernel = this;
        cusDS_bp.group = 'ctlcus';
        this.setAttribute(AttrNames.CustomDataSource, cusDS_bp);

        var self = this;
        autoBind(self);

        this.autoSetCusDataSource();

        var funName = this.id + '_' + AttrNames.Event.OnChanged;
        var eventBP = this.project.scriptMaster.getBPByName(funName);
        if(eventBP){
            eventBP.ctlID = this.id;
            this.scriptCreated(AttrNames.Event.OnChanged,eventBP);
        }
    }

    autoSetCusDataSource(groupCols_arr){
        var cusDS_bp = this.getAttribute(AttrNames.CustomDataSource);
        var theLinks = cusDS_bp.linkPool.getLinksBySocket(cusDS_bp.finalSelectNode.inSocket);
        var dsnode = null;
        var theLink = null;
        if(theLinks.length == 1){
            theLink = theLinks[0];
            if(theLink.outSocket.node.type == SQLNODE_DBENTITY){
                dsnode = theLink.outSocket.node;
            }
        }
        if(theLinks.length == 0 || dsnode == null){
            if(dsnode == null){
                dsnode = new SqlNode_DBEntity({}, cusDS_bp);   
                dsnode.left = cusDS_bp.finalSelectNode.left - 300;
            }
            cusDS_bp.linkPool.addLink(dsnode.outSocket, cusDS_bp.finalSelectNode.inSocket);
        }
        var useDS = this.getAttribute(AttrNames.DataSource);
        dsnode.setEntity(useDS);

        var fromtextfield = this.getAttribute(AttrNames.FromTextField);
        var fromValueField = this.getAttribute(AttrNames.FromValueField);
        var columnNode = cusDS_bp.finalSelectNode.columnNode;
        columnNode.distChecked = true;
        var needSelectColumns_arr = [];
        if(useDS && !IsEmptyString(fromtextfield)){
            needSelectColumns_arr.push(fromtextfield);
        }
        if(useDS && !IsEmptyString(fromValueField)){
            needSelectColumns_arr.push(fromValueField);
        }
        if(useDS && groupCols_arr != null && groupCols_arr.length > 0){
            needSelectColumns_arr = needSelectColumns_arr.concat(groupCols_arr);
        }

        while(columnNode.inputScokets_arr.length < needSelectColumns_arr.length){
            columnNode.addSocket(columnNode.genInSocket());
        }

        while(columnNode.inputScokets_arr.length > needSelectColumns_arr.length){
            columnNode.removeSocket(columnNode.inputScokets_arr[columnNode.inputScokets_arr.length - 1]);
        }

        var hadChanged = false;
        var theSocket;
        var colNode = null;
        for(var i=0; i < needSelectColumns_arr.length; ++i){
            colNode = null;
            theSocket = columnNode.inputScokets_arr[i];
            theLinks = cusDS_bp.linkPool.getLinksBySocket(theSocket);
            if(theLinks.length == 1){
                theLink = theLinks[0];
                if(theLink.outSocket.node.type == SQLNODE_COLUMN){
                    colNode = theLink.outSocket.node;
                }
            }
            if(theLinks.length == 0 || colNode == null){
                if(colNode == null){
                    colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);   
                    colNode.left = columnNode.left - 400;
                    colNode.top = columnNode.top + 150 + i * 50;
                }
                cusDS_bp.linkPool.addLink(colNode.outSocket, theSocket);
            }
            if(colNode.setFromObj({
                tableCode:useDS.code,
                tableAlias:null,
                tableName:useDS.name,
                columnName:needSelectColumns_arr[i],
            })){
                hadChanged = true;
            }
        }

        var orderNode = cusDS_bp.finalSelectNode.orderNode;
        if(orderNode.inputScokets_arr.length == 0){
            orderNode.addSocket(orderNode.genInSocket());
        }
        theSocket = orderNode.inputScokets_arr[0];
        theLinks = cusDS_bp.linkPool.getLinksBySocket(theSocket);
        colNode = null;
        if(theLinks.length == 1){
            theLink = theLinks[0];
            if(theLink.outSocket.node.type == SQLNODE_COLUMN){
                colNode = theLink.outSocket.node;
            }
        }
        if(useDS && !IsEmptyString(fromtextfield)){
            if(theLinks.length == 0 || colNode == null){
                if(colNode == null){
                    colNode = new SqlNode_Column({}, cusDS_bp.finalSelectNode);   
                    colNode.left = orderNode.left - 300;
                    colNode.top = orderNode.top + 50;
                }
                cusDS_bp.linkPool.addLink(colNode.outSocket, theSocket);
            }
            colNode.setFromObj({
                tableCode:useDS.code,
                tableAlias:null,
                tableName:useDS.name,
                columnName:fromtextfield,
            })
        }
    }

    getUseDSColumns(){
        var rlt = [''];
        var useDS = this.getAttribute(AttrNames.DataSource);
        if(useDS != null){
            rlt = rlt.concat(useDS.columns.map((col)=>{
                return col.name;
            }));
        }
        return rlt;
    }

    getCanuseColumns(){
        return getDSAttrCanuseColumns.call(this,AttrNames.DataSource,AttrNames.CustomDataSource);
    }

    renderSelf(clickHandler, replaceChildClick, designer) {
        return (<M_Dropdown key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler}/>)
    }

    get_valuetype(){
        var allowMulti = this.getAttribute(AttrNames.MultiSelect);
        if(allowMulti){
            return ValueType.XML;
        }
        var val = this[AttrNames.ValueType];
        return val == null ? ValueType.String : val;
    }

    scriptCreated(attrName, scriptBP){
        if(attrName == AttrNames.Event.OnChanged){
            scriptBP.setFixParam([VarNames.ParentPath, 'newText', 'newValue']);
        }
    }

    __attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray) {
        super.__attributeChanged(attrName, oldValue, newValue, realAtrrName, indexInArray);
        var attrItem = this.findAttributeByName(attrName);
        if (attrItem.name == AttrNames.FromTextField) {
            var nowTextField = this.getAttribute(AttrNames.TextField);
            if(nowTextField.length == 0 || nowTextField == oldValue){
                this.setAttribute(AttrNames.TextField, newValue);
            }
        }
        else if (attrItem.name == AttrNames.FromValueField) {
            var nowValueField = this.getAttribute(AttrNames.ValueField);
            if(nowValueField.length == 0 || nowValueField == oldValue){
                this.setAttribute(AttrNames.ValueField, newValue);
            }
        }

        switch(attrItem.name){
            case AttrNames.DataSource:
            case AttrNames.FromTextField:
            case AttrNames.FromValueField:
                this.autoSetCusDataSource();
                break;
        }
    }
}

var M_DropdownKernel_api = new ControlAPIClass(M_DropdownKernel_Type);
M_DropdownKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.TextField,M_DropdownKernelAttrsSetting), 'text', true));
M_DropdownKernel_api.pushApi(new ApiItem_propsetter('value'));
M_DropdownKernel_api.pushApi(new ApiItem_propsetter('text'));
M_DropdownKernel_api.pushApi(new ApiItem_prop(findAttrInGroupArrayByName(AttrNames.ValueField,M_DropdownKernelAttrsSetting), 'value', true));
g_controlApi_arr.push(M_DropdownKernel_api);

class M_Dropdown extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            value: this.props.ctlKernel.getAttribute(AttrNames.ValueField),
            fromtext: this.props.ctlKernel.getAttribute(AttrNames.FromTextField),
            fromvalue: this.props.ctlKernel.getAttribute(AttrNames.FromValueField),
            growable: this.props.ctlKernel.getAttribute(AttrNames.Growable),
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.DefaultValue,
            AttrNames.TextField,
            AttrNames.ValueField,
            AttrNames.FromTextField,
            AttrNames.FromValueField,
            AttrNames.Growable,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            defaultVal: this.props.ctlKernel.getAttribute(AttrNames.DefaultValue),
            text: this.props.ctlKernel.getAttribute(AttrNames.TextField),
            value: this.props.ctlKernel.getAttribute(AttrNames.ValueField),
            fromtext: this.props.ctlKernel.getAttribute(AttrNames.FromTextField),
            fromvalue: this.props.ctlKernel.getAttribute(AttrNames.FromValueField),
            growable: this.props.ctlKernel.getAttribute(AttrNames.Growable),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文本框</div>);
        }
        /*
            <span style={{width:'calc(100% - 30px)'}} className='bg-dark text-light flex-grow-1 flex-shrink-1 dropdown-toggle' >1234</span>
                <span style={{width:'30px'}} className='bg-dark text-light flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' />
        */
        layoutConfig.addClass('M_Dropdown');
        layoutConfig.addClass('border');
        layoutConfig.addClass('hb-control');
        //layoutConfig.addClass('w-100');
        layoutConfig.addClass('btn-group');
        //layoutConfig.addClass('h-100');
        var defaultParseRet = parseObj_CtlPropJsBind(this.state.defaultVal);
        var textParseRet = parseObj_CtlPropJsBind(this.state.text);
        var valueParseRet = parseObj_CtlPropJsBind(this.state.value);
        var fromText = this.state.fromtext;
        var fromValue = this.state.fromvalue;

        layoutConfig.removeClass(AttrNames.StyleAttrNames.FlexGrow);
        layoutConfig.removeClass(AttrNames.StyleAttrNames.FlexShrink);

        if(this.state.growable){
            layoutConfig.addClass('w-100');
        }
        layoutConfig.addClass('flex-grow-' + (this.state.growable ? '1' : '0'));

        var showText = textParseRet.isScript ? '[{脚本}]' : '[' + textParseRet.string + ']';
        /*
        var showText = (textParseRet.isScript ? '[{脚本}' : '[' + textParseRet.string) + (valueParseRet.isScript ? ':{脚本}]' : (IsEmptyString(valueParseRet.string) ? ']' : valueParseRet.string + ']')) 
                        + ('[' + fromText + (IsEmptyString(fromValue) ? ']' : fromValue + ']'));
        */
        return (
           <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null}>
                {this.renderHandleBar()}
                <span style={{width:'calc(100% - 30px)'}} className='bg-dark text-light flex-grow-1 flex-shrink-1 hidenOverflow text-nowrap' >{showText}</span>
                <span style={{width:'30px'}} className='bg-dark text-light flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' />
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC: false,
        label: '下拉框',
        type: M_DropdownKernel_Type,
        namePrefix: M_DropdownKernel_Prefix,
        kernelClass: M_DropdownKernel,
        reactClass: M_Dropdown,
        canbeLabeled: true,
    }, '基础');