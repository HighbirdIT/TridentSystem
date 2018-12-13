var Container = AMUITouch.Container;
var Group = AMUITouch.Group;
var Field = AMUITouch.Field;
var List = AMUITouch.List;
var Switch = AMUITouch.Switch;
var NavBar = AMUITouch.NavBar;
var View = AMUITouch.View;
var Modal = AMUITouch.Modal;
var Button = AMUITouch.Button;
var Grid = AMUITouch.Grid;
var Col = AMUITouch.Col;
var Card = AMUITouch.Card;
var Icon = AMUITouch.Icon;
var Redux = window.Redux;
var Provider = ReactRedux.Provider;


const selectDefaultValue = '=select-default=';
function clickAdd(state, action) {
    let nextCount = (state.count == null ? 0 : state.count) + 1;
    console.log('CLICK_ADD');
    return Object.assign({}, state, { count: nextCount });
}

//Cookies.set('identify', '');
let pageInitState = {
    pageinited: false,
    pageiniting: true,
    step: getNumberFromCookies('lastStep', 0),
    identify: getValFromCookies('identify'),
}

const requestpostsHandler = (state, action) => {
    switch (action.key) {
        case 'pageiniting':
            setTimeout(() => {
                store.dispatch(uiModelOpen('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: true });

        case 'uploading':
            setTimeout(() => {
                if(action.postData.action == 'uploadBlock'){
                    store.dispatch(uiModelOpen('LoadingModel', '正上传照片' + Math.round(100 * action.postData.start / action.postData.max ) + '%'));
                }
                else{
                    store.dispatch(uiModelOpen('LoadingModel', '资料上传中'));
                }
            }, 1);
            return state;
    }
    return state;
}

const receivepostsHandler = (state, action) => {
    if (action.posts.err != null) {
        setTimeout(() => {
            store.dispatch(uiModelClose('all'));
            var aftAct = null;
            if(action.key == 'pageiniting'){
                aftAct = ()=>{
                    location.reload();
                }
            }
            store.dispatch(uiModelOpen('AlertModel', '通讯异常', action.posts.err.info, aftAct));
        }, 1);
        return state;
    }
    switch (action.key) {
        case 'pageiniting':
            pageInitDataLoaded(action.posts);
            setTimeout(() => {
                store.dispatch(quesCanInit());
                store.dispatch(uiModelClose('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: false, pageinited: true });

        case 'uploading':
        if(action.postData.action == 'uploadBlock'){
            setTimeout(() => {
                uploadedIndex = action.postData.end;
                doUpload();
            },1);
        }
        else{
            setTimeout(() => {
                store.dispatch(uiModelClose('LoadingModel'));
                store.dispatch(recordUploaedAction(action.posts.data.identify));
            }, 1);
        }
        break;
    }
    return state;
}

const RECORDUPLOADED = 'RECORDUPLOADED';
const recordUploaedAction = makeActionCreator(RECORDUPLOADED, 'identify');
const recordUploaedHandler = (sate, action) => {
    Cookies.set('identify', action.identify, { expires: 7 });
    Cookies.set('lastStep', 0, { expires: 7 });
    return updateObject(sate, { identify: action.identify, step: 0 });
}

const CHANGESTEP = 'CHANGESTEP';
const changeStepAction = makeActionCreator(CHANGESTEP, 'act');
const changeStepHandler = (state, action) => {
    let newStep = state.step + (action.act == 'pre' ? -1 : 1);
    Cookies.set('lastStep', newStep, { expires: 7 });
    return updateObject(state, { step: newStep });
}


const pageReducer = createReducer(pageInitState, {
    REQUEST_POSTS: requestpostsHandler,
    RECEIVE_POSTS: receivepostsHandler,
    CHANGESTEP: changeStepHandler,
    RECORDUPLOADED: recordUploaedHandler
});

const UI_MODEL_OPEN = "UI_MODEL_OPEN";
const UI_MODEL_CLOSE = "UI_MODEL_CLOSE";

const uiModelOpen = makeActionCreator(UI_MODEL_OPEN, 'modelid', 'title', 'content','aftAct');
const uiModelClose = makeActionCreator(UI_MODEL_CLOSE, 'modelid');

const uiModelOpenHandler = (state, action) => {
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: true, title: action.title == null ? '加载中' : action.title, content: action.content, aftAct:action.aftAct });
    var newModelState = updateObject(state.model, { [action.modelid]: newTargetModelState });
    return updateObject(state, { model: newModelState });
}

const uiModelCloseHandler = (state, action) => {
    var newModelState = null;
    if (action.modelid == 'all') {
        newModelState = updateObject(state.model, {});
        for (var child in newModelState) {
            newModelState[child].isopen = false;
        }
        return updateObject(state, { model: newModelState });
    }
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: false });
    newModelState = updateObject(state.model, { [action.modelid]: newTargetModelState });
    return updateObject(state, { model: newModelState });
}

let uiTipsInitState = {
    model: {
        LoadingModel: {
            isopen: false,
            title: '',
        },
        AlertModel: {
            isopen: false,
            title: '',
        }
    }
}

const uiTipsReducer = createReducer(uiTipsInitState, {
    UI_MODEL_OPEN: uiModelOpenHandler,
    UI_MODEL_CLOSE: uiModelCloseHandler,
});

function counterValueChangedHandler(state, action) {
    Cookies.set(action.counterID + action.name, action.value, { expires: 7 });
    var newtstate = Object.assign({}, state[action.counterID], { [action.name]: action.value });
    return Object.assign({}, state, {
        [action.counterID]: newtstate
    });
}

function getValFromCookies(identity, defaultVal) {
    var a = Cookies.get(identity);
    return a == null ? defaultVal : a;
}

function getNumberFromCookies(identity, defaultVal) {
    return parseFloat(getValFromCookies(identity, defaultVal));
}

const counters = [];
//[{ id: 'counter1', title: '计算器A' }, { id: 'counter2', title: '计算器B' }, { id: 'counter3', title: '计算器C' }, { id: 'counter4', title: '计算器D' }];

let counterInitData = {};
counters.forEach(item => {
    counterInitData[item.id] = {
        a: getNumberFromCookies(item.id + 'a', 0),
        b: getNumberFromCookies(item.id + 'a', 0),
        op: getValFromCookies(item.id + 'op', '+'),
    };
});


const counterReducer = createReducer(counterInitData, {
    COUNTER_VALUE_CHANGED: counterValueChangedHandler,
});

var employeeInfoInitState = {
    name: getValFromCookies('p-name', ''),
    sex: getValFromCookies('p-sex', selectDefaultValue),
    borndate: getValFromCookies('p-borndate', ''),
    jiguan: getValFromCookies('p-jiguan', ''),
    workState: getValFromCookies('p-workState', selectDefaultValue),
    scholl: getValFromCookies('p-scholl', ''),
    xueli: getValFromCookies('p-xueli', selectDefaultValue),
    school: getValFromCookies('p-school', ''),
    zhuanye: getValFromCookies('p-zhuanye', ''),
    englishlevel: getValFromCookies('p-englishlevel', selectDefaultValue),
    tel: getValFromCookies('p-tel', ''),
    address: getValFromCookies('p-address', ''),
    post: getValFromCookies('p-post', selectDefaultValue),
    money: getValFromCookies('p-money', ''),
    workyear: getValFromCookies('p-workyear', ''),
    fastdate: getValFromCookies('p-fastdate', ''),
    bodystate: getValFromCookies('p-bodystate', ''),
    quesIndex: 0,
};

const BASEINFOCHANGED = 'BASEINFOCHANGED';
const baseInfoChanged = makeActionCreator(BASEINFOCHANGED, 'name', 'value');

function baseInfoChangedHandler(state, action) {
    if (typeof (action.value) == 'string') {
        action.value = myTrim(action.value);
    }
    if (action.name == 'workyear') {
        action.value = parseInt(action.value);
    }
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, {
        [action.name]: action.value
    });
}


const WELCOMINFOCHANGED = 'WELCOMINFOCHANGED';
const welcomInfoChanged = makeActionCreator(WELCOMINFOCHANGED, 'name', 'value');
function welcomInfoChangedHandler(state, action) {
    console.log(action.name + '->' + action.value);
    Cookies.set('p-' + action.name, action.value, { expires: 7 });
    return updateObject(state, {
        [action.name]: action.value
    });
}

const QUES_ANSWER_CHANGED = 'QUES_ANSWER_CHANGED';
const QUES_CANINIT = 'QUES_CANINIT';
const QUES_NEXT = 'QUES_NEXT';
const QUES_PREVE = 'QUES_PREVE';
const quesAnserChanged = makeActionCreator(QUES_ANSWER_CHANGED, 'answer');
const quesCanInit = makeActionCreator(QUES_CANINIT);
const quesNext = makeActionCreator(QUES_NEXT);
const quesPreve = makeActionCreator(QUES_PREVE);
function quesAnserChangedHandler(state, action) {
    var mustAnserQues_arr = getMustAnswerQues(state);
    var nowQues = updateObject(mustAnserQues_arr[state.quesIndex], { answer: action.answer });
    var newQues_arr = mustAnserQues_arr.map(que => que.id == nowQues.id ? nowQues : que);
    Cookies.set('answer' + nowQues.id, nowQues.answer, { expires: 7 });

    return updateObject(state, {
        ques_arr: newQues_arr
    });
}
function quesCanInitHandler(state, action) {
    var newState = {
        quesCount: pageInitData.ques_arr.length,
        ques_arr: pageInitData.ques_arr.map(ques => {
            return {
                title: ques.title,
                id: ques.id,
                应届可答: ques.应届可答,
                可以跳过: ques.可以跳过,
                answer: getValFromCookies('answer' + ques.id, ''),
                relPost: ques.relPost
            };
        }),
    };
    return updateObject(state, newState);
}
function quesNextHandler(state, action) {
    let newIndex = state.quesIndex + 1;
    var mustAnserQues_arr = getMustAnswerQues(state);
    if (newIndex >= mustAnserQues_arr.length) {
        setTimeout(() => {
            store.dispatch(changeStepAction('aft'));
        }, 1);
        return state;
    }
    return updateObject(state, { quesIndex: newIndex });
}
function quesPreveHandler(state, action) {
    let newIndex = Math.max(0, state.quesIndex - 1);
    return updateObject(state, { quesIndex: newIndex });
}
function getMustAnswerQues(state) {
    return state.ques_arr == null ? [] : state.ques_arr.filter(que => (que.relPost == 0 || que.relPost == state.post) && (que.应届可答 || state.workState != '应届生'));
}

const WANTSUBMIT = 'WANTSUBMIT';
const submitInfo = makeActionCreator(WANTSUBMIT);
function submitHandler(state, action) {
    setTimeout(() => {
        store.dispatch(changeStepAction('aft'));
    }, 1);
    return state;
}


const mainReducer = createReducer(employeeInfoInitState, {
    BASEINFOCHANGED: baseInfoChangedHandler,
    WELCOMINFOCHANGED: welcomInfoChangedHandler,
    QUES_ANSWER_CHANGED: quesAnserChangedHandler,
    QUES_CANINIT: quesCanInitHandler,
    QUES_NEXT: quesNextHandler,
    QUES_PREVE: quesPreveHandler,
    WANTSUBMIT: submitHandler,
});

let reducer = Redux.combineReducers({ page: pageReducer, ui: uiTipsReducer, main: mainReducer });
let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

class ModalWind extends React.PureComponent {
    constructor(props) {
        super(props);
        this.getModalRole = this.getModalRole.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }

    getModalRole() {
        return this.props.modalProps.role;
    }

    handleAction(data){
        if (this.props.modalProps.role == 'alert') {
            if(this.props.aftAct){
                this.props.aftAct();
            }
            store.dispatch(uiModelClose(this.props.id));
        }
    }

    render() {
        return (
            <Modal
                isOpen={this.props.isModalOpen}
                onDismiss={this.closeModal}
                onOpen={this.onOpen}
                onClosed={this.onClosed}
                onAction={this.handleAction}
                title={this.props.title}
                {...this.props.modalProps}
            >
                {this.getModalRole() !== 'loading' && this.props.content}
                
            </Modal>
        );
    }
}

const isModalOpenSelector = Reselect.createSelector((state, ownProps) => state.ui.model[ownProps.id].isopen, op => op);

const ModalWind_mapStateToProps = (state, ownProps) => {
    return {
        isModalOpen: isModalOpenSelector(state, ownProps),
        modalProps: ownProps.modalProps,
        title: state.ui.model[ownProps.id].title,
        content: state.ui.model[ownProps.id].content,
        aftAct: state.ui.model[ownProps.id].aftAct,
    }
}

const ModalWind_mapDispatchToProps = (dispatch, ownProps) => {
    return {
        openModal: () => {
            dispatch(uiModelOpen(ownProps.id));
        },

        closeModal: () => {
            dispatch(uiModelClose(ownProps.id));
        },

        onOpen: () => {
            console.log('loading modal open....');
        },

        onClosed: () => {
            console.log('loading modal closed....');
        },
    }
}

const VisibleModalWind = ReactRedux.connect(
    ModalWind_mapStateToProps,
    ModalWind_mapDispatchToProps
)(ModalWind);

const makeBaseInfoItem = (name, label, type, isrequired, options, readonly) => {
    if (options != null) {
        options.unshift({ label: '请选择', value: selectDefaultValue });
    }
    return {
        attr: {
            name: name,
            label: label,
            type: type,
            readOnly: readonly ? 'readOnly' : null,
        },
        isrequired: isrequired,
        options: options,
        placeholder: (options == null && isrequired ? '必填项' : ''),
    }
};

let baseInfoFields = [];
let pageInitData = null;

function pageInitDataLoaded(postdata) {
    pageInitData = postdata.data;
    /*
        makeBaseInfoItem('post', '应聘岗位', 'select', true, postdata.data.pots_arr.map(item => { return { label: item.label, value: item.id }; })),
        makeBaseInfoItem('postInfo', '岗位信息', 'textarea', false, null, true),
    */
    baseInfoFields = [
        makeBaseInfoItem('name', '姓名', 'text', true),
        makeBaseInfoItem('sex', '性别', 'select', true, [{ label: '男', value: 'm' }, { label: '女', value: 'f' }]),
        makeBaseInfoItem('borndate', '出生日期', 'date', true),
        makeBaseInfoItem('jiguan', '籍贯', 'text', true),
        makeBaseInfoItem('workState', '当前状态', 'select', true, [{ label: '在职', value: '在职' },
        { label: '应届生', value: '应届生' },
        { label: '待业', value: '待业' },]),
        makeBaseInfoItem('school', '毕业院校', 'text', true),
        makeBaseInfoItem('xueli', '学历', 'select', true, [{ label: '大专', value: '大专' },
        { label: '本科', value: '本科' },
        { label: '硕士', value: '硕士' },
        { label: '博士', value: '博士' },]),
        makeBaseInfoItem('zhuanye', '专业名称', 'text', true),
        makeBaseInfoItem('englishlevel', '英语等级', 'select', true, postdata.data.englishLevels_arr.map(item => { return { label: item.label, value: item.id }; })),
        makeBaseInfoItem('tel', '手机号码', 'text', true),
        makeBaseInfoItem('address', '现居住地', 'text', true),
        makeBaseInfoItem('money', '期望薪资', 'number', true),
        makeBaseInfoItem('workyear', '工作年限', 'number', true),
        makeBaseInfoItem('fastdate', '最快到岗', 'date', true),
        makeBaseInfoItem('bodystate', '健康状态', 'select', true, [{ label: '良好', value: '良好' }, { label: '18周岁后住院超过3天或有可能传染的或影响工作及岗位安排', value: '18周岁后住院超过3天或有可能传染的或影响工作及岗位安排' }]),

    ];

    pageInitData.pots_arr.forEach(post => {
        let itemIndex = 0;
        post.infohtml = [];

        post.info.split('\n').forEach((str, i) => {
            let keypos = str.indexOf(':');
            if (keypos == -1)
                keypos = str.indexOf('：');
            if (keypos != -1 && keypos <= 5) {
                post.infohtml.push(<b key={itemIndex++}>{str.substr(0, keypos + 1)}</b>);
                if (keypos < str.length - 1)
                    post.infohtml.push(<span key={itemIndex++}>{str.substr(keypos + 1)}</span>);
            }
            else {
                post.infohtml.push(<span key={itemIndex++} className='postinfospan'>{str}</span>);
            }
            post.infohtml.push(<br key={itemIndex++} />);
        });
    });
}

function handleSwitch() {
    console.log(this.refs.field.checked);
}

const freshSwitch = <Switch onValueChange={handleSwitch} value={false} />;
const workingSwitch = <Switch onValueChange={handleSwitch} value={false} />;

class ErroInfo extends React.PureComponent {
    constructor(props) {
        super(props);
        this.refItem = this.refItem.bind(this);
    }
    refItem(item) {
        if (item == null) {
            return;
        }
        let $item = $(item);
    }
    render() {
        if (this.props.err == null)
            return null;
        return (
            <span style={{ color: 'red', paddingLeft: '5em' }}><Icon name='info' />{this.props.err}</span>
        );
    }
}


class BaseInfoView extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Container fill={true} style={{ display: 'flex', flexFlow: 'column nowrap' }}>
                <Container style={{ flex: '1 1 auto' }} scrollable={true}>
                    <List>
                        {getUsedFields(this.props).map((field, i) => {
                            return (
                                <List.Item key={field.attr.name} nested="input" after={<Icon name={field.iserr ? 'star' : 'check'} />}>
                                    <Container style={{ flex: '1 1 auto' }}>
                                        <Field
                                            {...field.attr}
                                            containerClassName="my-label"
                                            onChange={this.props.handleChange}
                                            value={this.props[field.attr.name]}
                                            placeholder={field.placeholder}
                                        >
                                            {
                                                field.options && field.options.map((opt, i) => {
                                                    return (
                                                        <option value={opt.value} key={opt.value}>{opt.label}</option>
                                                    );
                                                })
                                            }
                                        </Field>
                                        <ErroInfo err={field.err} />
                                    </Container>
                                </List.Item>
                            );
                        })
                        }
                    </List>
                </Container>
                <Button className='fixflex' amStyle='primary' block disabled={!this.props.canNext} onClick={this.props.clickNext}>{!this.props.canNext ? '请登记完整资料' : '继续'}</Button>
            </Container>
        );
    }
}

function getUsedFields(state) {
    return baseInfoFields.filter((field, i) => {
        if (field.attr.name == 'workyear' && (state.workState == 0 || state.workState == '应届生')) {
            return null;
        }
        return field;
    });
}

function BaseInfoView_mapStateToProps(state, ownprops) {
    let rlt = Object.assign({}, state.main);
    rlt.step = stepSelector(state);
    rlt.post = state.main.post;
    var usedFields_arr = getUsedFields(rlt);
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    usedFields_arr.forEach(field => {
        if (field.isrequired) {
            var nowValue = rlt[field.attr.name];
            let errInfo = null;
            let iserr = nowValue == null || (typeof(nowValue) == 'string' && nowValue == '') || (field.attr.type == 'select' && nowValue == selectDefaultValue);
            if (!iserr) {
                if (field.attr.name == 'name') {
                    errInfo = nowValue.length == 1 || nowValue.length > 5 ? '2-4位' : null;
                }
                else if (field.attr.name == 'workyear') {
                    errInfo = nowValue < 0 || nowValue > 30 ? '数据有误' : null;
                }
                else if (field.attr.name == 'money') {
                    errInfo = nowValue > 100000 ? '数据有误' : null;
                }
                else if (field.attr.name == 'tel') {
                    errInfo = nowValue.length != 11 ? '数据有误' : null;
                }
                else if (field.attr.name == 'zhuanye') {
                    errInfo = nowValue.length < 2 || nowValue.length > 30 ? '数据有误' : null;
                }
                else if (field.attr.name == 'school') {
                    errInfo = nowValue.length < 4 || nowValue.length > 30 ? '数据有误' : null;
                }
                else if (field.attr.name == 'jiguan') {
                    errInfo = nowValue.length < 2 || nowValue.length > 10 ? '数据有误' : null;
                }
                else if (field.attr.name == 'address') {
                    errInfo = nowValue.length < 2 || nowValue.length > 30 ? '数据有误' : null;
                }
                else if (field.attr.type == 'date') {
                    errInfo = nowValue != '' && !checkDate(nowValue) ? '格式错误' : null;
                    if (errInfo == null) {
                        var theDate = new Date(nowValue);
                        if (field.attr.name == 'borndate') {
                            var year = now.getFullYear() - theDate.getFullYear();
                            errInfo = year < 18 || year > 50 ? '年龄不合适' : null;
                        }
                        else if (field.attr.name == 'fastdate') {
                            var difday = (theDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                            errInfo = difday < 0 ? '数据有误' : (difday > 90 ? '只接受90天内' : null);
                        }
                    }
                }
            }
            field.err = errInfo;
            field.iserr = iserr || errInfo;
        }
    });
    rlt.canNext = usedFields_arr.find(item => item.iserr) == null;
    /*
    let postsField = baseInfoFields.find(x => x.attr.name == 'post');
    if (postsField) {
        let selectedPost = pageInitData.pots_arr.find(x => x.id == rlt.post);
        if (selectedPost) {
            rlt.postInfo = selectedPost.info;
        }
    }
    */
    return rlt;
}

function BaseInfoView_mapDisptch(dispatch, ownProps) {
    return {
        handleChange: (event) => {
            dispatch(baseInfoChanged(event.target.name, event.target.value));
            event.preventDefault();
        },
        clickNext: (event) => {
            dispatch(changeStepAction('next'));
        }
    };

}

const VisibleBaseInfoView = ReactRedux.connect(BaseInfoView_mapStateToProps, BaseInfoView_mapDisptch)(BaseInfoView);

class WelComeView extends React.PureComponent {
    constructor(props) {
        super(props),
            this.refItem = this.refItem.bind(this);
    }
    refItem(item) {
        if (item == null)
            return;
        if (item.name == 'logo') {
            let $item = $(item);
            let height = $item.height();
            let width = $item.width();
            let size = Math.min(width, height);
            $item.css('height', size + 'px');
            $item.css('width', size + 'px');
        }
    }
    getPostOptions() {
        if (this.props.post == 0) {
            return
        }
    }

    renderContent() {
        if (this.props.identify == null) {
            return (
                <Container style={{ flex: '1 1 auto' }}>
                    <Container>
                        <h3>应聘职位:</h3>
                        <select name='post' value={this.props.post} onChange={this.props.postChanged}>
                            {this.props.postOptions}
                        </select>
                    </Container>
                    <Container {... this.props.post == 0 ? { style: { display: 'none' } } : null}>
                        <Card>
                            {this.props.postInfos_arr}
                        </Card>
                    </Container>
                </Container>
            );
        }
        else {
            return (
                <Container style={{ flex: '1 1 auto' }}>
                    <h3>{this.props.name}</h3>
                    <h3>你应聘"{this.props.postName}"的资料已经提交</h3>
                </Container>
            );
        }
    }

    renderNextBtn() {
        if (this.props.identify == null) {
            return (<Button className='fixflex' amStyle='primary' block disabled={this.props.post == 0} onClick={this.props.clickNext}>继续</Button>)
        }
    }

    render() {
        return (
            <Container fill={true} style={{ display: 'flex', flexFlow: 'column nowrap' }}>
                <Container className='fixflex'>
                    <h1>海勃公司线上应聘系统</h1>
                </Container>
                <Container style={{ width: '10em', height: '10em', margin: 'auto', flex: '0 1 auto' }}>
                    <img name='logo' src='../res/img/logo.png' style={{ width: '100%', height: '100%' }} />
                </Container>
                {this.renderContent()};
                {this.renderNextBtn()};
            </Container>
        )
    }
}

function WelComeView_mapStateToProps(state, ownProps) {
    let rlt = Object.assign({}, state.main);
    let selectedPost = pageInitData.pots_arr.find(x => x.id == rlt.post);
    rlt.postOptions = pageInitData.pots_arr.map(item => (<option key={item.id} value={item.id}>{item.label}</option>));
    if (selectedPost) {
        let reg = new RegExp("\n", "g");
        rlt.postInfos_arr = selectedPost.infohtml;
        rlt.postName = selectedPost.label;
    }
    else {
        rlt.postInfo = '';
        rlt.postOptions = [<option key={0} value={0}>请选择</option>].concat(rlt.postOptions);
    }
    rlt.identify = state.page.identify && state.page.identify.length > 0 ? state.page.identify : null;
    return rlt;
}

function WelComeView_dispatchToProps(dispatch, ownpros) {
    return {
        postChanged: (event) => {
            dispatch(welcomInfoChanged(event.target.name, event.target.value));
            event.preventDefault();
        },
        clickNext: (event) => {
            dispatch(changeStepAction('next'));
        }
    }
}


const VisibleWelComeView = ReactRedux.connect(WelComeView_mapStateToProps, WelComeView_dispatchToProps)(WelComeView);


class QuestionView extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container fill={true} style={{ display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' }}>
                <Card className='fixflex'>
                    {this.props.nowQue.title}
                    {this.props.nowQue.可以跳过 ? '(可以跳过)' : ''}
                </Card>
                <textarea style={{ flex: '1 1 auto', margin: '0em 1em 1em 1em' }} name='回答' type='textarea' placeholder={'请作答'} onChange={this.props.answerChanged} value={this.props.nowQue.answer} />
                <Button className='fixflex' amStyle='primary' block disabled={!this.props.cannext} onClick={this.props.clickNext}>{this.props.cannext ? (this.props.nowQue.answer.length == 0 ? '跳过' : '继续') : '请作答'}</Button>
            </Container>
        );
    }
}

function QuestionView_mapstatetoprops(state, ownProps) {
    let rlt = {
        nowQue: {},
    };
    if (state.main.ques_arr != null) {
        var mustAnserQues = getMustAnswerQues(state.main);
        rlt.nowQue = mustAnserQues[state.main.quesIndex];
        rlt.cannext = rlt.nowQue.answer.length > 0 || rlt.nowQue.可以跳过;
    }

    return rlt;
}

function QuestionView_mapdisptchtoprops(dispatch, ownProps) {
    return {
        answerChanged: event => {
            dispatch(quesAnserChanged(event.target.value));
        },
        clickNext: event => {
            dispatch(quesNext());
        },
    };
}

const VisibleQuestionView = ReactRedux.connect(QuestionView_mapstatetoprops, QuestionView_mapdisptchtoprops)(QuestionView);
let selectedFileBase64 = null;
let nextBtnInPhoto = null;
let Orientation = null;
let uploadedIndex = 0;

class PhotoView extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    uploadCreated(divelem) {
        if (divelem == null)
            return;
        let preFileid = null;
        var uploader = WebUploader.create({
            auto: false, // 选完文件后，是否自动上传 
            server: 'upload', // 文件接收服务端 
            pick: { id: '#filePicker', multiple: false }, // 选择文件的按钮。可选
            resize: true,
            accept: {
                title: 'Images',
                extensions: 'jpg,jpeg,png',
                mimeTypes: 'image/jpg,image/jpeg,image/png'
            },
            thumb: {
                type: 'image/jpg,jpeg,png'
            },
            fileNumLimit: 2, //限制上传个数
            fileSingleSizeLimit: 1024000 * 5 //限制单个上传图片的大小
        });

        uploader.on('fileQueued', function (file) {
            if (preFileid != null) {
                uploader.removeFile(preFileid);
            }
            var srcSeted = false;
            var fileReaded = false;
            var orientationReaded = false;
            EXIF.getData(file.source.source, function () {
                EXIF.getAllTags(this);
                Orientation = EXIF.getTag(this, 'Orientation');
                orientationReaded = true;
                setSrcFunc();
            });
            var setSrcFunc = () => {
                if(!fileReaded || !orientationReaded)
                    return;
                let $img = $('#thumbImg');
                $img.attr('src', selectedFileBase64);
                let rotateDeg = 0;
                switch (Orientation) {
                    case 1:
                        rotateDeg = 0;
                        break;
                    case 3:
                        rotateDeg = 180;
                        break;
                    case 6:
                        rotateDeg = 90;
                        break;
                    case 8:
                        rotateDeg = -90;
                        break;
                }
                $img.css('transform', 'rotate(' + rotateDeg + 'deg)');
                /*
                let $imgparent = $('#imgContainer');
                let height = $img.height();
                let width = $img.width();
                let parentheight = $imgparent.height();
                let parentwidth = $imgparent.width();
                let scale = 1;
                if(parentheight > parentwidth){
                    scale = parentwidth / width;
                }
                else{
                    scale = parentheight / height;
                }
                $img.css('height', height * scale + 'px');
                $img.css('width', width * scale + 'px');
                */
                var nextBtn = document.getElementById('nextBtn');
                if (nextBtn) {
                    nextBtn.innerHTML = '确认提交';
                }
            }
            var reader = new FileReader();
            reader.onload = (function (file2) {
                return function (e) {
                    //console.info(this.result); //这个就是base64的数据了
                    selectedFileBase64 = this.result;
                    fileReaded = true;
                    setSrcFunc();
                };
            })(file);
            reader.readAsDataURL(file.source.source);
            preFileid = file;
        });

        uploader.on('uploadProgress', function (file, percentage) {
            console.log(file.id + '-' + percentage);
        });

        uploader.on('uploadSuccess', function (file) {

        });

        uploader.on('uploadError', function (file) {

        });
    }
    render() {
        return (
            <Container fill={true} style={{ display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' }}>
                <h3 style={{ textAlign: 'center' }}>可以留一张你的照片吗？</h3>
                <Container style={{ flex: '1 1 auto', display: 'flex', flexFlow: 'column nowrap', overflow: 'auto' }}>
                    <img id='thumbImg' src={selectedFileBase64} style={{ width: '100%', height: 'auto' }} />
                </Container>
                <div style={{ alignSelf: 'center', flex: '0 0 auto' }} id="filePicker" ref={this.uploadCreated}>{selectedFileBase64 == null ? '选择图片' : '更换图片'}</div>
                <Button className='fixflex' amStyle='primary' block id='nextBtn' onClick={this.props.clickNext}>{selectedFileBase64 == null ? '跳过' : '确认提交'}</Button>
            </Container>
        );
    }
}

function photoViewmapstatetoprops(state, ownProps) {
    return {

    };
}

function doUpload(){
    let postData = null;
    let state = store.getState();
    if(selectedFileBase64 != null && uploadedIndex < selectedFileBase64.length){
        var nextPos = Math.min(selectedFileBase64.length,uploadedIndex + 100000);
        postData = {action:'uploadBlock',name:(state.main.tel + state.main.name),start:uploadedIndex,end:nextPos,max:selectedFileBase64.length,data:selectedFileBase64.substring(uploadedIndex, nextPos)};
    }
    else{
        postData = updateObject(state.main, { action: 'upload' });
        postData.ques_arr = getMustAnswerQues(state.main);
        postData.photoName = state.main.tel + state.main.name;
        postData.Orientation = Orientation;
    }
    store.dispatch(fetchJsonPost('onlineinterview_process', postData, 'uploading'));
}

function photoViewDisptchToprops(dispatch, ownProps) {
    return {
        clickNext: () => {
            // 上传数据
            uploadedIndex = 0;
            doUpload(dispatch);
        }
    }
}

const VisiblePhotoView = ReactRedux.connect(null, photoViewDisptchToprops)(PhotoView);

class StepRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.renderNavBar = this.renderNavBar.bind(this);
        this.renderStep = this.renderStep.bind(this);
    }

    renderNavBar() {
        if (this.props.stepInfo.navTitle == undefined) {
            return null;
        }
        let navConfig = {
            title: this.props.stepInfo.navTitle,
            leftNav: this.props.stepInfo.leftNav
        };
        return (
            <NavBar {...navConfig}
                onAction={this.props.clickNavHandler}
                className='fixflex'
                amStyle="primary">
            </NavBar>
        );
    }

    renderStep() {
        if (this.props.step < 0) {
            return null;
        }
        { this.renderNavBar() }
        switch (this.props.step) {
            case 0: return (<VisibleWelComeView />);
            case 1: return (<VisibleBaseInfoView />);
            case 2: return (<VisibleQuestionView />);
            case 3: return (<VisiblePhotoView />);

            default: return null;
        }
    }

    render() {
        return (
            <View>
                {this.renderNavBar()}
                <Container fill={true} style={{ display: 'flex', overflowX: 'hidden' }}>
                    {this.renderStep()}
                </Container>
            </View>
        );
    }
}


const stepSelector = Reselect.createSelector(state => state.page.pageinited ? state.page.step : -1, b => b);
function selectStepInfo(state) {
    let step = stepSelector(state);
    let rlt = {};
    switch (step) {
        case 1:
            rlt = {
                navTitle: '基本资料',
                leftNav: [{ title: '上一步', icon: 'left-nav', act: 'pre', type: 'step' }],
            }
            break;
        case 2:
            let mustAnswerQues_arr = getMustAnswerQues(state.main);
            rlt = {
                navTitle: '问题 ' + (state.main.quesIndex + 1) + '/' + mustAnswerQues_arr.length,
                leftNav: [{ title: (state.main.quesIndex == 0 ? '上一步' : '上一题'), icon: 'left-nav', act: 'pre', type: (state.main.quesIndex == 0 ? 'step' : 'que') }],
            }
            break;
        case 3:
            rlt = {
                navTitle: '最后一步',
                leftNav: [{ title: '上一步', icon: 'left-nav', act: 'pre', type: 'step' }],
            }
            break;
    }
    return rlt;
}
const stepInfoSelector = Reselect.createSelector(selectStepInfo, b => b);

function StepRender_mapstatetoprops(state, ownprops) {
    return {
        step: stepSelector(state),
        stepInfo: stepInfoSelector(state),
    };
}

function StepRender_dispatchTorprops(dispatch, ownprops) {
    return {
        clickNavHandler: (navbtn) => {
            if (navbtn.type == 'step') {
                dispatch(changeStepAction(navbtn.act));
            }
            else if (navbtn.type == 'que') {
                dispatch(quesPreve());
            }
        },
    };
}

const VisibleStepRender = ReactRedux.connect(StepRender_mapstatetoprops, StepRender_dispatchTorprops)(StepRender);

class ThisPage extends React.Component {
    render() {
        return (
            <Container {...this.props} fill={true}>
                <VisibleModalWind title="Loading Modal" id="LoadingModel"
                    modalProps={{
                        role: 'loading'
                    }}>
                </VisibleModalWind>
                <VisibleModalWind
                    title="Alert Modal"
                    id="AlertModel"
                    modalProps={{
                        role: 'alert'
                    }}
                >
                </VisibleModalWind>
                <VisibleStepRender></VisibleStepRender>
            </Container>
        );
    }
}

/*
function Counter(props){
    PropTypes.checkPropTypes();
    return(
        <div>
            <input type='button' value='+' onClick={props.onClick} />
            <span>{props.count}</span>
        </div>
    );
}
*/

/*
class Counter extends React.Component {
    render() {
        return (
            <div>
                <div>{this.props.title}</div>
                <span>A:
                    <input name='a' type='number' value={this.props.a} onChange={this.props.inputChanged} />
                </span>
                <select name='op' onChange={this.props.inputChanged} value={this.props.op} >
                    <option value='+'>+</option>
                    <option value='-'>-</option>
                    <option value='*'>*</option>
                    <option value='/'>/</option>
                </select>
                <span>B:</span>
                <input name='b' type='number' value={this.props.b} onChange={this.props.inputChanged} />
                <span>{this.props.title}结果={this.props.rlt}</span>
                {this.children}
            </div>
        );
    }
}

Counter.propTypes = {
    inputChanged: PropTypes.func.isRequired,
    a: PropTypes.number.isRequired,
    b: PropTypes.number.isRequired,
}
*/

/*
function initCounterState(state, ownProps) {
    let counterName = ownProps.id;
    state.counter[counterName] = {
        a: 0,
        b: 0
    };
}
*/
/*
const getCounterValue = (state, ownProps, valueName) => {
    let counterName = ownProps.id;
    if (state.counter[counterName] == null) {
        return '';
    }
    return state.counter[counterName][valueName];
};

const getCounterValueA = (state, ownProp) => {
    return getCounterValue(state, ownProp, 'a');
}

const getCounterValueB = (state, ownProp) => {
    return getCounterValue(state, ownProp, 'b');
}

const counterValueASelector = Reselect.createSelector(
    getCounterValueA,
    a => { return a; }
);

const counterValueBSelector = Reselect.createSelector(
    getCounterValueB,
    b => { return b; }
);

const counterOPSelector = Reselect.createSelector(
    (state, ownProp) => { return getCounterValue(state, ownProp, 'op') },
    op => { return op; }
);

const counterRltSelector = Reselect.createSelector(
    [counterValueASelector, counterValueBSelector, counterOPSelector],
    (a, b, op) => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
            default:

        }
    }
);


const Counter_mapStateToProps = (state, ownProps) => {
    return {
        a: counterValueASelector(state, ownProps),
        b: counterValueBSelector(state, ownProps),
        op: counterOPSelector(state, ownProps),
        rlt: counterRltSelector(state, ownProps),
    }
}

const Counter_mapDispatchToProps = (dispatch, ownProps) => {
    return {
        inputChanged: (event) => {
            let inputed = event.target.value;
            if (event.target.name == 'a' || event.target.name == 'b') {
                inputed = parseFloat(inputed);
                if (isNaN(inputed)) {
                    event.preventDefault();
                    return;
                }
            }
            dispatch(counterValueChanged(event.target.name, inputed, ownProps.id));
            console.log(event.target.name + '->' + event.target.value);
            event.preventDefault();
        }
    }
}


const VisibleCounter = ReactRedux.connect(
    Counter_mapStateToProps,
    Counter_mapDispatchToProps
)(Counter);
*/

/*
$(function () {
    //alert('page loaded');
    ReactDOM.render(<LoadingModal title="Loading Modal"
    modalProps={{
      title: '初始化中...',
      role: 'loading'
    }}>
    </LoadingModal>, document.getElementById('root'));
    ReactDOM.render(<OnlineInterView />, document.getElementById('root'));
});
*/

//store.dispatch(Actions.pageLoaded());

/*
function TestKKK() {
    return (
        <div>
            {
                counters.map(item => { return (<VisibleCounter key={item.id} id={item.id} title={item.title} />); })
            }
        </div>
    );
}
*/

ReactDOM.render(<Provider store={store}>
    <ThisPage />
</Provider>, document.getElementById('root'));

store.dispatch(fetchJsonPost('onlineinterview_process', { action: 'pageinit' }, 'pageiniting'));