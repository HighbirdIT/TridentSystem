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

let pageInitState = {
    pageinited: false,
    pageiniting: true,
}

let urlParam = null;
function GetUrlPara() {
    if (urlParam == null) {
        urlParam = {};
        var url = document.location.toString();
        var arrUrl = url.split("?");
        var urlParamStr = arrUrl[1];
        if (urlParamStr != null) {
            urlParamStr.split("&").forEach(paramStr => {
                var pairArr = paramStr.split("=");
                if (pairArr.length == 2 && pairArr[0].length > 0 && pairArr[1].length > 0) {
                    urlParam[pairArr[0]] = decodeURIComponent(pairArr[1]);
                }
            });
        }
    }
    return urlParam;
}

function getQueryString(name) {
    return GetUrlPara()[name];
}

const requestpostsHandler = (state, action) => {
    switch (action.key) {
        case 'pageiniting':
            setTimeout(() => {
                store.dispatch(uiModelOpen('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: true });
    }
    return state;
}

const receivepostsHandler = (state, action) => {
    if (action.posts.err != null) {
        setTimeout(() => {
            store.dispatch(uiModelClose('all'));
            var aftAct = null;
            if (action.key == 'pageiniting') {
                aftAct = () => {
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
                store.dispatch(uiModelClose('LoadingModel'));
            }, 1);
            return updateObject(state, { pageiniting: false, pageinited: true });
    }
    return state;
}

const pageReducer = createReducer(pageInitState, {
    REQUEST_POSTS: requestpostsHandler,
    RECEIVE_POSTS: receivepostsHandler,
});

const UI_MODEL_OPEN = "UI_MODEL_OPEN";
const UI_MODEL_CLOSE = "UI_MODEL_CLOSE";

const uiModelOpen = makeActionCreator(UI_MODEL_OPEN, 'modelid', 'title', 'content', 'aftAct');
const uiModelClose = makeActionCreator(UI_MODEL_CLOSE, 'modelid');

const uiModelOpenHandler = (state, action) => {
    var newTargetModelState = updateObject(state.model[action.modelid], { isopen: true, title: action.title == null ? '加载中' : action.title, content: action.content, aftAct: action.aftAct });
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

let reducer = Redux.combineReducers({ page: pageReducer, ui: uiTipsReducer });

let store = Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()));

function formatDate(theDate){
    return theDate.getFullYear() + '-' + (theDate.getMonth() + 1) + '-' + theDate.getDate()
}
let pageInitData = null;
function pageInitDataLoaded(postdata) {
    pageInitData = postdata.data;
    if (pageInitData.rcdRow) {
        for (var i in pageInitData.rcdRow) {
            if (i.indexOf('日期') == i.length - 2) {
                pageInitData.rcdRow[i] = formatDate(new Date(pageInitData.rcdRow[i]));
            }
        }
    }
}

class ModalWind extends React.PureComponent {
    constructor(props) {
        super(props);
        this.getModalRole = this.getModalRole.bind(this);
        this.handleAction = this.handleAction.bind(this);
    }

    getModalRole() {
        return this.props.modalProps.role;
    }

    handleAction(data) {
        if (this.props.modalProps.role == 'alert') {
            if (this.props.aftAct) {
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

class Record extends React.PureComponent {
    render() {
        if (this.props.unFound) {
            return (
                <Card>
                   指定的应聘者资料未找到!
                </Card>
            )
        } else {
            return (
                <View>
                    <NavBar title={this.props.title}
                        className='fixflex'
                        amStyle="primary">
                    </NavBar>
                    
                    <Container fill={true} scrollable={true}>
                    <Group header="基本资料" noPadded>
                        <List>
                            {this.props.recordData.map(
                                item => {
                                    return (
                                        <List.Item key={item.name} title={item.name}  >
                                            <div className='dataItem'>
                                                {item.value}
                                            </div>
                                        </List.Item>
                                    );
                                }
                            )}
                        </List>
                        </Group>
                        <Group header="答题信息" noPadded>
                        {
                            this.props.quesData.map(item => {
                                return (
                                    <Card title={item.title}>
                                        {item.answer.length == 0 ? '跳过' : item.answer}
                                    </Card>
                                );
                            })
                        }
                        </Group>
                        <Group header="个人照片" noPadded>
                        <Container style={{ flex: '1 1 auto', display: 'flex', flexFlow: 'column nowrap', overflow: 'auto', alignItems: 'center' }}>
                            <img id='thumbImg' src={'/res/img/interviewee/' + rcdUID + '.jpg'} style={{ width: '50%', height: 'auto' }} />
                        </Container>
                        </Group>
                    </Container>
                </View>
            );
        }
    }
}

function getRecordInfoArr() {
    if (pageInitData == null || pageInitData.rcdRow == null) {
        return [];
    }
    var rlt = [];
    var rcdData = pageInitData.rcdRow;
    for (var i in rcdData) {
        rlt.push({ name: i, value: rcdData[i] });
    }
    return rlt;
}

function geQuesDataArr() {
    if (pageInitData == null || pageInitData.ques == null) {
        return [];
    }
    return pageInitData.ques;
}

function getRecordTitle() {
    if (pageInitData == null || pageInitData.rcdRow == null) {
        return '';
    }

    return pageInitData.rcdRow.人员姓名 + '应聘:' + pageInitData.rcdRow.应聘岗位;
}

const Record_mapStateToProps = (state, ownProps) => {
    return {
        recordData: getRecordInfoArr(),
        quesData: geQuesDataArr(),
        title: getRecordTitle(),
        unFound: pageInitData != null && pageInitData.rcdRow == null
    }
}

const VisibleRecord = ReactRedux.connect(
    Record_mapStateToProps
)(Record);

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
                <VisibleRecord />
            </Container>
        );
    }
}

ReactDOM.render(<Provider store={store}>
    <ThisPage />
</Provider>, document.getElementById('root'));

var rcdUID = getQueryString('rcdUID');
if (rcdUID == null || rcdUID.length != 36) {
    store.dispatch(uiModelOpen('AlertModel', '错误', '没有提供目标参数'));
}
else {
    store.dispatch(fetchJsonPost('recordinfo_process', { action: 'pageinit', rcdUID: getQueryString('rcdUID') }, 'pageiniting'));
}