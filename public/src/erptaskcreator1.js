const TaskTargetPage_style = { "width": "100%" };
const Form_1headstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "whiteSpace": "nowrap", "overflow": "hidden" };
const Form_1tdstyle0 = { "width": "89.6%", "maxWidth": "89.6%", "verticalAlign": "middle" };
const Form_1_tableStyle = { "marginTop": "-50px" };
const Form_1_headtableStyle = { "marginBottom": "0px" };

class ERPC_TaskCreator extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);
        this.contentDivRef = React.createRef();
        this.inited = false;
    }

    componentWillMount() {
        var self = this;
        setTimeout(() => {
            self.inited = true;
        }, 50);
    }

    componentWillUnmount() {
        this.inited = false;
    }

    foceClose() {
        this.clickCloseHandler();
    }

    clickCloseHandler() {
        this.props.selector.closeCreator();
    }

    renderHead() {
        return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>
            <h3 onClick={this.clickCloseHandler}><i className='fa fa-arrow-left' />任务创建</h3>
        </div>
        );
    }

    renderContent() {
        return <div className='d-flex flex-grow-1 flex-shrink-0 autoScroll_Touch flex-column'>
            <VisibleCForm0 id='Form0' parentPath='TaskCreatePage' />
        </div>;
    }

    render() {
        var retElem = null;
        retElem = (
            <div className='fixedBackGround'>
                <div className='d-flex flex-column flex-grow-1 flex-shrink-1 h-100 '>
                    {this.renderHead()}
                    {this.renderContent()}
                </div>
            </div>);
        return retElem;
    }
}

function ERPC_TaskCreator_mapstatetoprops(state, ownprops) {
    return {
    };
}

function ERPC_TaskCreator_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_TaskCreator = null;
var VisibleCForm0 = null;
gNeedCallOnErpControlInit_arr.push(() => {
    VisibleERPC_TaskCreator = ReactRedux.connect(ERPC_TaskCreator_mapstatetoprops, ERPC_TaskCreator_dispatchtoprops)(ERPC_TaskCreator);
    VisibleCForm0 = ReactRedux.connect(CForm0_mapstatetoprops, CForm0_disptchtoprops)(CForm0);
});


class CForm0 extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPC_PageForm(this);
        this.canInsert = true;
    }

    pullGeteUserSysUserList(parentPath) {
        store.dispatch(fetchJsonPost(TaskServerURL, { action: 'geteUserSysUserList', }, makeFTD_Prop(parentPath, 'M_Dropdown_1', 'options_arr', false), EFetchKey.FetchPropValue));
    }

    render() {
        var retElem = null;
        if (this.props.fetching) {
            retElem = renderFetcingTipDiv();
        }
        else {
            if (this.props.fetchingErr) {
                retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
            }
            else {
                if (this.props.invalidbundle) {
                    retElem = renderInvalidBundleDiv();
                }
                else {
                    if (!this.canInsert && this.props.nowRecord == null) {
                        retElem = <div className='m-auto'>没有查询到数据</div>;
                    }
                    else {
                        retElem = (
                            <div className='d-flex flex-column d-flex flex-grow-1 flex-shrink-1 erp-form flex-column '>
                                {this.props.title && <div className='bg-dark text-light justify-content-center d-flex flex-shrink-0'><span>{this.props.title}</span></div>}
                                <div className='d-flex flex-grow-1  flex-column'>
                                    <VisibleERPC_LabeledControl id='M_LC_0' parentPath={this.props.fullPath} label='任务标题'>
                                        <VisibleERPC_Text id='M_Text_0' parentPath={this.props.fullPath} type='string' linetype='single' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_1' parentPath={this.props.fullPath} label='任务描述'>
                                        <VisibleERPC_Text id='M_Text_1' parentPath={this.props.fullPath} type='string' linetype='1x' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_2' parentPath={this.props.fullPath} label='发起人'>
                                        <VisibleERPC_DropDown id='M_Dropdown_0' parentPath={this.props.fullPath} pullOnce={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={this.pullGeteUserSysUserList} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='发起人' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_3' parentPath={this.props.fullPath} label='执行人'>
                                        <VisibleERPC_DropDown id='M_Dropdown_1' parentPath={this.props.fullPath} pullOnce={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={this.pullGeteUserSysUserList} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='执行人' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_4' parentPath={this.props.fullPath} label='关联工作小组'>
                                        <VisibleERPC_DropDown id='M_Dropdown_2' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={pull_M_Dropdown_2} textAttrName='工作小组名称' valueAttrName='工作小组代码' label='关联工作小组' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_5' parentPath={this.props.fullPath} label='关联项目'>
                                        <VisibleERPC_DropDown id='M_Dropdown_3' parentPath={this.props.fullPath} pullOnce={true} groupAttr='项目运行阶段' pullDataSource={pull_M_Dropdown_3} textAttrName='项目登记名称' valueAttrName='项目登记名称代码' label='关联项目' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_6' parentPath={this.props.fullPath} label='抄送人员'>
                                        <VisibleERPC_DropDown id='M_Dropdown_4' parentPath={this.props.fullPath} textType='xml' multiselect={true} pullOnce={true} nullable={true} groupAttr='所属系统名称,所属部门名称' pullDataSource={pull_M_Dropdown_4} textAttrName='员工登记姓名' valueAttrName='员工登记姓名代码' label='抄送人员' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_14' parentPath={this.props.fullPath} label='开始日期'>
                                        <VisibleERPC_Text id='M_Text_4' parentPath={this.props.fullPath} type='date' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_7' parentPath={this.props.fullPath} label='有无期限'>
                                        <VisibleERPC_CheckBox id='M_CheckBox_0' parentPath={this.props.fullPath} />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_8' parentPath={this.props.fullPath} label='截止日期'>
                                        <VisibleERPC_Text id='M_Text_2' parentPath={this.props.fullPath} type='date' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_9' parentPath={this.props.fullPath} label='汇报频率'>
                                        <VisibleERPC_DropDown id='M_Dropdown_5' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={pull_M_Dropdown_5} textAttrName='汇报频率名称' valueAttrName='任务汇报频率代码' label='汇报频率' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_10' parentPath={this.props.fullPath} label='是否周期任务'>
                                        <VisibleERPC_CheckBox id='M_CheckBox_1' parentPath={this.props.fullPath} />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_11' parentPath={this.props.fullPath} label='周期单位'>
                                        <VisibleERPC_DropDown id='M_Dropdown_6' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={pull_M_Dropdown_6} textAttrName='周期单位' valueAttrName='任务周期单位代码' label='周期单位' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_12' parentPath={this.props.fullPath} label='周期数值'>
                                        <VisibleERPC_Text id='M_Text_3' parentPath={this.props.fullPath} type='float' precision='1' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_LabeledControl id='M_LC_13' parentPath={this.props.fullPath} label='重要程度代码'>
                                        <VisibleERPC_DropDown id='M_Dropdown_7' parentPath={this.props.fullPath} pullOnce={true} pullDataSource={pull_M_Dropdown_7} textAttrName='重要程度名称' valueAttrName='任务重要程度代码' label='重要程度代码' />
                                    </VisibleERPC_LabeledControl>
                                    <VisibleERPC_Button className='btn btn-primary erp-control ' id='button_2' parentPath={this.props.fullPath} onClick={this.button_2_onclick}>
                                        提交修改
									</VisibleERPC_Button>
                                    <VisibleERPC_Button className='btn btn-warning erp-control ' id='button_1' parentPath={this.props.fullPath} onClick={this.button_1_onclick}>
                                        撤销此任务
									</VisibleERPC_Button>
                                    <VisibleERPC_Button className='btn btn-primary erp-control ' id='button_0' parentPath={this.props.fullPath} onClick={this.button_0_onclick}>
                                        提交
									</VisibleERPC_Button>
                                </div>
                                {this.renderNavigater()}
                            </div>);
                    }
                }
            }
        }
        return retElem;
    }

}
function CForm0_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    return retProps;
}
function CForm0_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}