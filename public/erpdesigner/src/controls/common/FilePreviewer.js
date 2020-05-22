const FilePreviewer_TypeAttrsSetting = GenControlKernelAttrsSetting([
    new CAttributeGroup('基本设置', [
        genColumnFieldAttribute('文件ID', 'fileID', ''),
        genColumnFieldAttribute('附件ID', 'attachmentID', ''),
        genColumnFieldAttribute('文件类型', 'fileType', ''),
        genColumnFieldAttribute('文件路径', 'filePath', ''),
        genColumnFieldAttribute('文件名称', 'fileName', ''),
        new CAttribute('可否删除', 'deletable', ValueType.Boolean, false),
        new CAttribute('显示名称', 'showtitle', ValueType.Boolean, true),
    ]),
]);

class FilePreviewer extends ControlKernelBase {
    constructor(initData, parentKernel, createHelper, kernelJson) {
        super(initData,
            FilePreviewer_Type,
            '文件预览器',
            FilePreviewer_TypeAttrsSetting,
            parentKernel,
            createHelper, kernelJson
        );
        var self = this;
        autoBind(self);
    }

    renderSelf(clickHandler, replaceChildClick, designer){
        return (<CFilepreviewer key={this.id} designer={designer} ctlKernel={this} onClick={clickHandler ? clickHandler : this.clickHandler} />)
    }
}


class CFilepreviewer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            
        };

        autoBind(this);
        M_ControlBase(this, [
            AttrNames.Title,
            AttrNames.LayoutNames.APDClass,
            AttrNames.LayoutNames.StyleAttr,
        ]);
    }

    aAttrChanged(changedAttrName) {
        if (this.aAttrChangedBase(changedAttrName)) {
            return;
        }
        this.setState({
            title:this.props.ctlKernel.getAttribute(AttrNames.Title),
        });
    }

    render() {
        var ctlKernel = this.props.ctlKernel;
        var layoutConfig = ctlKernel.getLayoutConfig();
        if (this.props.ctlKernel.__placing) {
            layoutConfig.addClass('M_placingCtl');
            return (<div className={layoutConfig.getClassName()} style={layoutConfig.style} ref={this.rootElemRef}>文件预览器</div>);
        }
        layoutConfig.addClass('filepreviewer');
        layoutConfig.addClass('hb-control');
        return (
           <div className={layoutConfig.getClassName()} style={layoutConfig.style} onClick={this.props.onClick} ctlid={this.props.ctlKernel.id} ref={this.rootElemRef} ctlselected={this.state.selected ? '1' : null} autosize={layoutConfig.hadSizeSetting() ? 1 : 0}>
                {this.renderHandleBar()}
                <div>文件预览器</div>
            </div>
        );
    }
}

DesignerConfig.registerControl(
    {
        label: '文件预览器',
        type: FilePreviewer_Type,
        namePrefix: FilePreviewer_Prefix,
        kernelClass: FilePreviewer,
        reactClass: CFilepreviewer,
        canbeLabeled: true,
    }, '基础');