const fileSystemUrl = '/fileSystem';

const EFileUploaderState = {
    WAITFILE: 'waitfile',
    READING: 'reading',
    PREPARE: 'prepare',
    UPLOADING: 'uploading',
    COMPLETE: 'complete',
};

const EFileSystemError = {
    WRONGSTART: 1001,
    UPLOADCOMPLATE: 1002,
    EMPTYDATA: 1003,
    DATATOOLONG: 1004,
    FILELOCKED: 1005,
};

function dataBuffer2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const MAXPERBLOCKSIZE = 1024 * 1024 * 1;
const MINPERBLOCKSIZE = 1024 * 500;
const STEP_BLOCKSIZE = 1024 * 200;

class FileUploader extends EventEmitter {
    constructor() {
        super();
        this.state = EFileUploaderState.WAITFILE;
        this.myBlockMaxSize = MINPERBLOCKSIZE;
        autoBind(this);
    }

    reset() {
        this.fileProfile = null;
        this.file = null;
        this.base64Data = null;
        this.fileData = null;
        this.previewUrl = null;
        this.changeState(EFileUploaderState.WAITFILE);
    }

    uploadFile(theFile) {
        var self = this;
        this.fileProfile = {
            name: theFile.name,
            size: theFile.size,
            type: theFile.type,
        };
        this.file = theFile;
        this.base64Data = null;
        this.isPause = false;
        this.previewUrl = null;
        this.changeState(EFileUploaderState.READING);
        var reader = new FileReader();
        reader.onerror = () => {
            reader.abort();
            self.meetError({ errorMsg: '读取文件出错' });
        };
        reader.onload = ev => {
            if(self.fileProfile == null){
                console.log('上传器被删除');
                return;
            }
            self.fileData = new Uint8Array(reader.result);
            self.startPos = 0;
            self.changeState(EFileUploaderState.PREPARE);
            self._prepare();

            if (theFile.type.indexOf('image/') != -1) {
                reader.onerror = null;
                reader.onload = ev => {
                    if(self.fileData == null){
                        console.log('上传器被删除');
                        return;
                    }
                    self.base64Data = reader.result;
                    self._fireChanged();
                };
                reader.readAsDataURL(theFile);
            }
        };
        reader.readAsArrayBuffer(theFile);
    }

    pause() {
        this.isPause = true;
        this._fireChanged();
        console.log('pause');
    }

    resume() {
        console.log('resume');
        this.isPause = false;
        this._fireChanged();
        if (!self.uploading) {
            this._uploadData();
        }
    }

    _prepare() {
        var theFile = this.file;
        var bundle = {
            name: theFile.name,
            size: theFile.size,
            type: theFile.type
        };
        var kbsize = Math.round(theFile.size / 1024);
        if (kbsize < 1000) {
            this.sizeStr = kbsize + 'KB';
        }
        else {
            var mbsize = Math.round(kbsize / 1024);
            if (mbsize < 1000) {
                this.sizeStr = mbsize + 'MB';
            }
            else {
                var gbsize = Math.round(kbsize / 1024);
                this.sizeStr = gbsize + 'GB';
            }
        }
        var self = this;
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'applyForTempFile' },
            makeFTD_Callback((state, data, error) => {
                if(self.fileData == null){
                    console.log('上传器被删除');
                    return;
                }
                if (error) {
                    self.meetError(error);
                    return;
                }
                else {
                    self.fileProfile.identity = data.identity;
                    self.fileProfile.code = data.code;
                    setTimeout(() => {
                        self.changeState(EFileUploaderState.UPLOADING);
                    }, 20);
                }
            }, false)));
        if (this.errorCode) {
            this.errorCode = 0;
            this._fireChanged();
        }
    }

    _uploadData() {
        if (this.isPause || this.uploading || this.fileData == null) {
            console.log('_uploadData ret');
            return;
        }
        var blockSize = this.fileProfile.size - this.startPos;
        if (blockSize == 0) {
            this.changeState(EFileUploaderState.COMPLETE);
            return;
        }
        if (blockSize > this.myBlockMaxSize) {
            blockSize = this.myBlockMaxSize;
        }
        var endPos = this.startPos + blockSize;
        var hexStr = '';
        for (var pos = this.startPos; pos < endPos; ++pos) {
            hexStr += ('00' + this.fileData[pos].toString(16)).slice(-2);
        }
        var bundle = {
            fileIdentity: this.fileProfile.identity,
            data: hexStr,
            startPos: this.startPos,
        };
        var self = this;
        this.uploading = true;
        //console.log('uploading');
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'uploadBlock' },
            makeFTD_Callback((state, data, error, fetchUseTime) => {
                setTimeout(() => {
                    if(self.fileData == null){
                        console.log('上传器被删除');
                        return;
                    }
                    //console.log('uploading end');
                    self.uploading = false;
                    if (error) {
                        switch (error.code) {
                            case EFileSystemError.WRONGSTART:
                                if (isNaN(error.data)) {
                                    console.err("WRONGSTART's data is nan");
                                }
                                this.startPos = parseInt(error.data);
                                error = null;
                                break;
                            case EFileSystemError.EMPTYDATA:
                            case EFileSystemError.DATATOOLONG:
                            case EFileSystemError.FILELOCKED:
                                error = null;
                                break;
                            case EFileSystemError.UPLOADCOMPLATE:
                                error = null;
                                this.startPos = self.fileProfile.size;
                                break;
                        }
                        if (error != null) {
                            // 上传过程中遇到错误不断重试即可
                            //console.log(error);
                            this.myBlockMaxSize = MINPERBLOCKSIZE;
                        }

                        self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                        self._fireChanged();
                        self._uploadData();
                    }
                    else {
                        //console.log('fetchUseTime:' + fetchUseTime + '  blksize:' + this.myBlockMaxSize);
                        if (fetchUseTime < 200) {
                            this.myBlockMaxSize = Math.min(this.myBlockMaxSize + STEP_BLOCKSIZE, MAXPERBLOCKSIZE);
                        }
                        else if (fetchUseTime > 300) {
                            this.myBlockMaxSize = Math.max(this.myBlockMaxSize - STEP_BLOCKSIZE, MINPERBLOCKSIZE);
                        }
                        self.startPos += data.bytesWritten;
                        self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                        //console.log(self.percent  + '%');
                        if(data.previewUrl){
                            this.previewUrl = data.previewUrl;
                        }
                        self._fireChanged();
                        self._uploadData();
                    }
                }, 20);
            }, false)));

        if (this.errorCode) {
            this.errorCode = 0;
            this._fireChanged();
        }
    }

    meetError(err) {
        this.errorCode = isNaN(err.code) ? 1 : err.code;
        this.errorMsg = err.info;
        this._fireChanged();
    }

    changeState(newState) {
        this.state = newState;
        this.errorCode = 0;
        this.errorMsg = null;
        if (newState == EFileUploaderState.UPLOADING) {
            this.percent = 0;
            this._uploadData();
        }
        this._fireChanged();
    }

    _fireChanged() {
        this.emit('changed');
    }
}

class FileUploaderManager {
    constructor() {
        this.uploader_map = {};
    }

    getUploader(key) {
        if (IsEmptyString(key)) {
            return null;
        }
        return this.uploader_map[key];
    }

    createUploader(key) {
        if (IsEmptyString(key)) {
            return null;
        }
        var rlt = this.getUploader(key);
        if (rlt == null) {
            rlt = new FileUploader();
            this.uploader_map[key] = rlt;
        }
        return rlt;
    }
}

var gFileUploaderManager = new FileUploaderManager();

class CSingleFileUploader extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        this.state = {
        };
        this.fileTagRef = React.createRef();
    }

    reDraw() {
        this.setState({
            magicObj: {}
        });
    }

    componentWillMount() {
        this.uploader = gFileUploaderManager.createUploader(this.props.path);
        this.uploader.on('changed', this.reDraw);
    }

    componentWillUnmount() {
        if (this.uploader) {
            this.uploader.off('changed', this.reDraw);
        }
    }

    plusClickHandler(ev) {
        if (this.fileTagRef.current) {
            this.fileTagRef.current.click();
        }
    }

    fileSelectedHandler(ev) {
        var theFile = ev.target.files[0];
        this.uploader.uploadFile(theFile);
    }

    reTryUpload() {
        this.uploader._uploadData();
    }

    reTryPrepare() {
        this.uploader._prepare();
    }

    clickPauseHandler() {
        if (this.uploader.isPause) {
            this.uploader.resume();
        }
        else {
            this.uploader.pause();
        }
    }

    render() {
        var contentElem = null;
        var fileUploader = this.uploader;
        var fileProfile = fileUploader.fileProfile;
        var fileIconType = 'fa-file-o';
        if (fileProfile) {
            var fileType = fileProfile.type.split('/')[0];
            switch (fileType) {
                case 'archive':
                case 'audio':
                case 'code':
                case 'excel':
                case 'image':
                case 'movie':
                case 'pdf':
                case 'photo':
                case 'picture':
                case 'powerpoint':
                case 'sound':
                case 'text':
                case 'video':
                case 'word':
                case 'zip':
                    fileIconType = 'fa-file-' + fileType + '-o';
            }
        }

        if (fileUploader.state == EFileUploaderState.WAITFILE) {
            contentElem = <button className='btn btn-primary' onClick={this.plusClickHandler}><i className='fa fa-plus' />添加附件</button>
        }
        else {
            var bottomBar = null;
            switch (fileUploader.state) {
                case EFileUploaderState.READING:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='text-danger flex-grow-1 flex-shrink-1'>读取错误:{fileUploader.errorMsg}</span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-circle-o-notch fa-spin' />文件读取中</span>;
                    }
                    break;
                case EFileUploaderState.PREPARE:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'>
                            <span className='text-danger'>创建错误:{fileUploader.errorMsg}</span>
                            <button className='btn btn-primary btn-sm' onClick={this.reTryPrepare}><i className='fa fa-refresh' />重试</button>
                        </span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-circle-o-notch fa-spin' />预创建</span>;
                    }
                    break;
                case EFileUploaderState.UPLOADING:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'>
                            <span className='text-danger'>传输错误:{fileUploader.errorMsg}</span>
                            <button className='btn btn-primary btn-sm' onClick={this.reTryUpload}><i className='fa fa-refresh' />重试</button>
                        </span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1 d-flex align-items-center'>
                            {fileUploader.isPause ? '已暂停' : fileUploader.percent + '%'}
                            <div className='progress flex-grow-1 flex-shrink-1'>
                                <div className="progress-bar progress-bar-striped" style={{ width: fileUploader.percent + '%' }} />
                            </div>
                        </span>;
                    }
                    //<button className={'btn btn-sm btn-dark'} onClick={this.clickPauseHandler}><i className={'fa fa-2x ' + (fileUploader.isPause ? 'fa-play-circle-o' : 'fa-pause-circle-o')} /></button>
                    break;
                case EFileUploaderState.COMPLETE:
                    bottomBar = <span><i className='fa fa-check-square-o text-success' />上传完成</span>
                    break;
            }
            var iconElem = null;
            if (fileUploader.base64Data) {
                iconElem = <img className='border' style={{ width: '3em', height: '3em' }} src={fileUploader.base64Data} />
            }
            else {
                iconElem = <i className={'fa fa-3x m-auto ' + fileIconType} />
            }
            contentElem = <div className='d-flex flex-grow-1 flex-shrink-1'>
                <div className='flex-grow-0 flex-shrink-0 p-1 d-flex flex-column'>
                    {iconElem}
                    {fileUploader.sizeStr}
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <span className='border-bottom'>{fileProfile.name}</span>
                    {bottomBar}
                </div>
            </div>;
        }


        return <div className='d-flex'>
            <input onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' />
            {contentElem}
        </div>
    }
}

class CFileUploaderBar extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
    }

    reDraw() {
        this.setState({
            magicObj: {}
        });
    }

    listenUploader(uploader) {
        if (uploader) {
            uploader.on('changed', this.reDraw);
        }
        this.uploader = uploader;
    }

    unlistenUploader(uploader) {
        if (uploader) {
            uploader.on('changed', this.reDraw);
        }
    }

    componentWillMount() {
        this.listenUploader(this.props.uploader);
    }

    componentWillUnmount() {
        this.unlistenUploader(this.props.uploader);
    }

    reTryUpload() {
        this.uploader._uploadData();
    }

    reTryPrepare() {
        this.uploader._prepare();
    }

    clickPauseHandler() {
        if (this.uploader.isPause) {
            this.uploader.resume();
        }
        else {
            this.uploader.pause();
        }
    }

    clickPreViewHandler(){
        var fileUploader = this.props.uploader;
        if(this.uploader.previewUrl == null){
            return;
        }
        var fileProfile = fileUploader.fileProfile;
        var fileType = fileProfile.type.split('/')[0];

        if(isInDingTalk){
            if(fileType == 'image'){
                dingdingKit.biz.util.openLink({
                    url:this.uploader.previewUrl,
                });
            }
            else{
                dingdingKit.biz.util.openModal({
                    url:this.uploader.previewUrl,
                    title: fileProfile.name, //顶部标题
                })
            }
        }
        else{

        }
    }

    render() {
        var contentElem = null;
        var fileUploader = this.props.uploader;
        if (fileUploader != this.uploader) {
            this.unlistenUploader(this.uploader);
            this.listenUploader(fileUploader);
        }
        var fileProfile = fileUploader.fileProfile;
        var fileIconType = 'fa-file-o';
        var canPreview = false;
        if (fileProfile) {
            var fileType = fileProfile.type.split('/')[0];
            switch (fileType) {
                case 'archive':
                case 'audio':
                case 'code':
                case 'excel':
                case 'image':
                case 'movie':
                case 'pdf':
                case 'photo':
                case 'picture':
                case 'powerpoint':
                case 'sound':
                case 'text':
                case 'video':
                case 'word':
                case 'zip':
                    fileIconType = 'fa-file-' + fileType + '-o';
            }

            switch (fileType) {
                case 'audio':
                case 'image':
                case 'movie':
                case 'pdf':
                case 'sound':
                case 'video':
                case 'text':
                case 'excel':
                case 'word':
                    canPreview = true;
            }
        }

        if (fileUploader.state == EFileUploaderState.WAITFILE) {
            contentElem = <div>等待文件指派</div>
        }
        else {
            var bottomBar = null;
            switch (fileUploader.state) {
                case EFileUploaderState.READING:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='text-danger flex-grow-1 flex-shrink-1'>读取错误:{fileUploader.errorMsg}</span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-circle-o-notch fa-spin' />文件读取中</span>;
                    }
                    break;
                case EFileUploaderState.PREPARE:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'>
                            <span className='text-danger'>创建错误:{fileUploader.errorMsg}</span>
                            <button className='btn btn-primary btn-sm' onClick={this.reTryPrepare}><i className='fa fa-refresh' />重试</button>
                        </span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-circle-o-notch fa-spin' />预创建</span>;
                    }
                    break;
                case EFileUploaderState.UPLOADING:
                    if (fileUploader.errorCode > 0) {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1'>
                            <span className='text-danger'>传输错误:{fileUploader.errorMsg}</span>
                            <button className='btn btn-primary btn-sm' onClick={this.reTryUpload}><i className='fa fa-refresh' />重试</button>
                        </span>;
                    }
                    else {
                        bottomBar = <span className='flex-grow-1 flex-shrink-1 d-flex align-items-center'>
                            {fileUploader.isPause ? '已暂停' : fileUploader.percent + '%'}
                            <div className='progress flex-grow-1 flex-shrink-1'>
                                <div className="progress-bar progress-bar-striped" style={{ width: fileUploader.percent + '%' }} />
                            </div>
                        </span>;
                    }
                    //<button className={'btn btn-sm btn-dark'} onClick={this.clickPauseHandler}><i className={'fa fa-2x ' + (fileUploader.isPause ? 'fa-play-circle-o' : 'fa-pause-circle-o')} /></button>
                    break;
                case EFileUploaderState.COMPLETE:
                    bottomBar = <span className='d-flex align-items-center'>
                        <i className='fa fa-check-square-o text-success' />上传完成
                        {canPreview && fileUploader.previewUrl ? <button onClick={this.clickPreViewHandler} className='ml-1 btn btn-sm btn-primary'><i className='fa fa-eye' />预览</button> : '(不支持预览))'}
                    </span>
                    break;
            }
            var iconElem = null;
            if (fileUploader.base64Data) {
                iconElem = <img className='border' style={{ width: '3em', height: '3em' }} src={fileUploader.base64Data} />
            }
            else {
                iconElem = <i className={'fa fa-3x m-auto ' + fileIconType} />
            }
            contentElem = <div className='d-flex flex-grow-1 flex-shrink-1'>
                <div className='flex-grow-0 flex-shrink-0 p-1 d-flex flex-column'>
                    {iconElem}
                    {fileUploader.sizeStr}
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <span className='border-bottom'>{fileProfile.name}</span>
                    {bottomBar}
                </div>
            </div>;
        }
        return <div className='d-flex'>
            {contentElem}
        </div>
    }
}

class ERPC_MultiFileUploader extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
        this.fileTagRef = React.createRef();
    }

    cusComponentWillMount() {

    }

    cusComponentWillUnmount() {

    }

    fileSelectedHandler(ev) {
        var uploaders = this.props.uploaders;
        var newUploaders = uploaders ? uploaders.concat() : [];
        for (var fi = 0; fi < ev.target.files.length; ++fi) {
            var theFile = ev.target.files[fi];
            var found = newUploaders.find(uploader => {
                return uploader.file && uploader.file.name == theFile.name && uploader.file.size == theFile.size;
            });
            if (!found) {
                var newUploader = new FileUploader();
                newUploader.uploadFile(theFile);
                newUploaders.push(newUploader);
            }
        }
        store.dispatch(makeAction_setManyStateByPath({
            uploaders: newUploaders,
        }, this.props.fullPath));
    }

    plusClickHandler(ev) {
        if (this.fileTagRef.current) {
            this.fileTagRef.current.click();
        }
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var uploaders = this.props.uploaders;
        var uploaderElems_arr = [];
        if (uploaders && uploaders.length > 0) {
            uploaderElems_arr = uploaders.map(uploader => {
                return <div key={uploader.file.name} className='list-group-item'>
                    <CFileUploaderBar uploader={uploader} />
                </div>
            });
        }
        var rootClassName = 'd-flex flex-column' 
        + (this.props.flexgrow == '1' ? ' flex-grow-1' : ' flex-grow-0')
        + (this.props.flexshrink == '1' ? ' flex-shrink-1' : ' flex-shrink-0');

        var bContentNeedScroll = false;
        if(this.props.flexgrow == '1' || this.props.flexshrink == '1' || (this.props.style && (this.props.style.height || this.props.style.maxHeight))){
            bContentNeedScroll = true;
        }

        return <div className={rootClassName} style={this.props.style}>
            <input onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' multiple="multiple" />
            <div className='bg-dark d-flex flex-shrink-0 flex-grow-0 p-1 align-items-center'>
                <span className='text-light flex-grow-1 flex-shrink-1'><i className='fa fa-list mr-1' />{this.props.title}</span>
                <button className='btn btn-success' onClick={this.plusClickHandler}><i className='fa fa-plus' />添加</button>
            </div>
            <div className={'list-group flex-grow-1 flex-shrink-1 border' + (bContentNeedScroll ? ' autoScroll' : '')}>
                {uploaderElems_arr}
                <div className='list-group-item'>{uploaderElems_arr.length == 0 ? '没有附件' : '共' + uploaderElems_arr.length + '个附件'}</div>
            </div>
        </div>
    }
}

function ERPC_MultiFileUploader_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        title: ctlState.title == null ? ownprops.title : ctlState.title,
        uploaders: ctlState.uploaders,
    };
}

function ERPC_MultiFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_MultiFileUploader = null;
gNeedCallOnErpControlInit_arr.push(()=>{
    VisibleERPC_MultiFileUploader = ReactRedux.connect(ERPC_MultiFileUploader_mapstatetoprops, ERPC_MultiFileUploader_dispatchtorprops)(ERPC_MultiFileUploader);
});