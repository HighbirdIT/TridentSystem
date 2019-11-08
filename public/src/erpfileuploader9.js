const fileSystemUrl = '/fileSystem';

const EAcceptFileType={
    All:1,
    Image:2,
    Vedio:3,
    Excel:4,
    Word:5,
    PDF:6,
    ImageVedio:7,
};

var FileAcceptStr = {
};
FileAcceptStr[EAcceptFileType.All] = '*/*';
FileAcceptStr[EAcceptFileType.Image] = 'iamge/*';
FileAcceptStr[EAcceptFileType.Vedio] = 'vedio/*';
FileAcceptStr[EAcceptFileType.Excel] = 'application/msexcel,application/vnd.openxmlformats-officedocument.spre,application/vnd.ms-excel';
FileAcceptStr[EAcceptFileType.Word] = 'application/msword,application/vnd.openxmlformats-officedocument.word';
FileAcceptStr[EAcceptFileType.PDF] = 'application/pdf';
FileAcceptStr[EAcceptFileType.ImageVedio] = 'iamge/*,vedio/*';

const EFileUploaderState = {
    WAITFILE: 'waitfile',
    READING: 'reading',
    PREPARE: 'prepare',
    CALMD5: 'calmd5',
    UPLOADING: 'uploading',
    COMPLETE: 'complete',
    BEFOREEND: 'beforeend',
};

const EFileSystemError = {
    WRONGSTART: 1001,
    UPLOADCOMPLATE: 1002,
    EMPTYDATA: 1003,
    DATATOOLONG: 1004,
    FILELOCKED: 1005,
};


function ResetMFileUploader(path) {
    var state = store.getState();
    var ctlState = getStateByPath(state, path, {});
    if (ctlState.uploaders && ctlState.uploaders.length > 0) {
        ctlState.uploaders.forEach(uploader => {
            uploader.reset();
        });
        setTimeout(() => {
            store.dispatch(makeAction_setManyStateByPath({
                uploaders: [],
                invalidInfo: null,
            }, path));
        }, 20);
    }
}

function ResetSFileUploader(path) {
    var state = store.getState();
    var ctlState = getStateByPath(state, path, {});
    if (ctlState.uploader && ctlState.uploader.fileProfile) {
        ctlState.uploader.reset();
        setTimeout(() => {
            store.dispatch(makeAction_setManyStateByPath({
                invalidInfo: null,
            }, path));
        }, 20);
    }
}

const gByteToHex = [];
for (var n = 0; n <= 0xff; ++n) {
    gByteToHex.push(n.toString(16).padStart(2, "0"));
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

        if (this.readWorker) {
            this.readWorker.terminate();
            this.readWorker = null;
            console.log('readWorker 已终止 by reset');
        }
    }

    uploadFile(theFile, uploadedCallBack) {
        var self = this;
        this.fileProfile = {
            name: theFile.name,
            size: theFile.size,
            type: theFile.type,
        };

        this.uploadedCallBack = uploadedCallBack;
        this.file = theFile;
        this.base64Data = null;
        this.isPause = false;
        this.previewUrl = null;
        this.uploading = false;
        this.changeState(EFileUploaderState.READING);
        var reader = new FileReader();
        reader.onerror = () => {
            reader.abort();
            self.meetError({ errorMsg: '读取文件出错' });
        };
        reader.onload = ev => {
            if (self.fileProfile == null) {
                console.log('上传器被删除');
                return;
            }
            self.fileData = new Uint8Array(reader.result);
            self.startPos = 0;
            self.changeState(EFileUploaderState.CALMD5);
            self._calMD5();

            if (theFile.type.indexOf('image/') != -1) {
                reader.onerror = null;
                reader.onload = ev => {
                    if (self.fileProfile == null) {
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

    _calMD5() {
        var self = this;
        if (typeof (Worker) !== "undefined") {
            if (this.readWorker == null) {
                console.log('readWorker 已创建');
                this.readWorker = new Worker("/js/woker_bytetohexstr2.js");
                this.readWorker.onmessage = ev => {
                    self._readerMsgHandler(ev.data);
                };
            }
        }
        this.readWorker.postMessage({ act: 'tohex', data: this.fileData });
    }

    _readerMsgHandler(ev) {
        if (this.fileProfile == null) {
            console.log('上传器被删除');
            return;
        }
        if (ev.act == 'tohex') {
            this.fileProfile.dataHexStr = ev.data;
            this.readWorker.postMessage({ act: 'calmd5', data: ev.data });
        }
        else if (ev.act == 'calmd5') {
            this.fileProfile.md5 = ev.data;
            this.readWorker.terminate();
            this.readWorker = null;
            this.changeState(EFileUploaderState.PREPARE);
            this._prepare();
        }
    }

    _prepare() {
        var theFile = this.file;
        var bundle = {
            name: theFile.name,
            size: theFile.size,
            type: theFile.type,
            md5: this.fileProfile.md5,
        };
        var kbsize = Math.round(theFile.size / 1024);
        if (kbsize < 1000) {
            this.sizeStr = kbsize + 'KB';
        }
        else {
            var mbsize = Math.round(10 * kbsize / 1024) / 10.0;
            if (mbsize < 1000) {
                this.sizeStr = mbsize + 'MB';
            }
            else {
                var gbsize = Math.round(10 * kbsize / 1024) / 10.0;
                this.sizeStr = gbsize + 'GB';
            }
        }
        var self = this;
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'applyForTempFile' },
            makeFTD_Callback((state, data, error) => {
                if (self.fileProfile == null) {
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
                    self.changeState(EFileUploaderState.UPLOADING);
                    setTimeout(() => {
                        self._uploadData();
                    }, 20);
                }
            }, false)));
        if (this.errorCode) {
            this.errorCode = 0;
            this._fireChanged();
        }
    }

    _uploadData() {
        if (this.isPause || this.uploading) {
            return;
        }
        var self = this;
        var blockSize = this.fileProfile.size - this.startPos;
        if (blockSize == 0) {
            if (typeof this.uploadedCallBack === 'function') {
                this.uploadedCallBack(this);
            }
            this.changeState(EFileUploaderState.COMPLETE);
            return;
        }
        this.uploading = true;
        if (blockSize > this.myBlockMaxSize) {
            blockSize = this.myBlockMaxSize;
        }
        var endPos = this.startPos + blockSize;

        var bundle = {
            fileIdentity: this.fileProfile.identity,
            data: this.fileProfile.dataHexStr.slice(this.startPos * 2, endPos * 2),
            startPos: this.startPos,
        };
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'uploadBlock' },
            makeFTD_Callback((state, data, error, fetchUseTime) => {
                setTimeout(() => {
                    if (self.fileProfile == null) {
                        console.log('上传器被删除');
                        return;
                    }
                    self.uploading = false;
                    if (error) {
                        console.log(error);
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
                        setTimeout(() => {
                            self._fireChanged();
                            self._uploadData();
                        }, 20);
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
                        if (data.previewUrl) {
                            this.previewUrl = data.previewUrl;
                        }
                        setTimeout(() => {
                            self._fireChanged();
                            self._uploadData();
                        }, 20);
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
        }
        else if (newState == EFileUploaderState.COMPLETE) {
            if (this.readWorker) {
                this.readWorker.terminate();
                this.readWorker = null;
                console.log('readWorker 已终止');
            }
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

function getRenderAidDataFromFileType(pFileType) {
    var fileIconType = 'fa-file-o';
    var canPreview = false;
    var fileType = pFileType;
    if (pFileType) {
        var ftype_arr = pFileType.split('/');
        fileType = ftype_arr[0];
        if (fileType == 'application') {
            fileType = ftype_arr[1];
            if (fileType == 'vnd.openxmlformats-officedocument.spre' || fileType == 'vnd.ms-excel') {
                fileType = 'excel';
            }
            else if (fileType == 'vnd.openxmlformats-officedocument.word' || fileType == 'msword') {
                fileType = 'word';
            }
        }
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
            case 'sound':
            case 'video':
                canPreview = true;
        }
    }
    return {
        fileIconType: fileIconType,
        canPreview: canPreview,
        fileType: fileType,
    };
}

function gPreviewFile(name, fileType, url) {
    var aidData = getRenderAidDataFromFileType(fileType);
    fileType = aidData.fileType;
    if (isInDingTalk) {
        if (fileType == 'image') {
            dingdingKit.biz.util.previewImage({
                urls: [window.location.origin + url],
                current: window.location.origin + url,
            });
        }
        else if (fileType == 'video' || fileType == 'movie') {
            if (isMobile) {
                dingdingKit.biz.util.openLink({
                    url: window.location.origin + '/videoplayer?src=' + url,
                });
            }
            else {
                dingdingKit.biz.util.openModal({
                    url: window.location.origin + '/videoplayer?src=' + url,
                    title: name,
                });
            }
        }
        else if (fileType == 'audio' || fileType == 'sound') {
            if (isMobile) {
                dingdingKit.biz.util.openLink({
                    url: window.location.origin + '/audioplayer?src=' + url,
                });
            }
            else {
                dingdingKit.biz.util.openModal({
                    url: window.location.origin + '/audioplayer?src=' + url,
                    title: fileProfile.name,
                });
            }
        }
        else {
            dingdingKit.biz.util.openLink({
                url: window.location.origin + url,
            });
        }
    }
    else {
        SendToast('在钉钉中才可预览');
    }
}

class ERPC_SingleFileUploader extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        this.state = {
            loading: false
        };
        this.fileTagRef = React.createRef();
    }

    reDraw() {
        this.setState({
            magicObj: {},
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
            uploader.off('changed', this.reDraw);
        }
    }

    componentWillMount() {
        if (this.props.uploader == null) {
            var newUploader = new FileUploader();
            this.listenUploader(newUploader);
            store.dispatch(makeAction_setManyStateByPath({
                uploader: newUploader,
            }, this.props.fullPath));
        }
        else {
            this.listenUploader(this.props.uploader);
        }
    }

    synRecordInfo() {
        var bundle = {
            fileid: this.props.deffileID,
            attachmentID: this.props.defattachmentID,
        };
        var self = this;
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'getFileRecord' },
            makeFTD_Callback((state, data, error) => {
                var fileRecord = {
                    fileid: bundle.fileid,
                    attachmentID: bundle.attachmentID,
                    fileName: data ? data.文件名称 : null,
                    fileSize: data ? data.文件大小 : null,
                    type: data ? data.文件类型 : null,
                    url: data ? data.文件路径 : null,
                };
                setTimeout(() => {
                    self.setState({
                        fileRecord: fileRecord,
                        loading: false,
                    });
                }, 20);
            }, false)));
    }

    componentWillUnmount() {
        this.unlistenUploader(this.props.uploader);
    }

    fileSelectedHandler(ev) {
        var theFile = ev.target.files[0];
        this.uploader.uploadFile(theFile);
        if (this.state.fileRecord) {
            this.setState({
                fileRecord: Object.assign({}, this.state.fileRecord, { abandon: true }),
            });
        }
    }

    clickPlusHandler(ev) {
        if (this.fileTagRef.current) {
            this.fileTagRef.current.click();
        }
    }

    clickContentHandler(ev) {
        var uploader = this.props.uploader;
        if (uploader.fileProfile == null) {
            if (this.fileTagRef.current) {
                this.fileTagRef.current.click();
            }
        }
    }

    clickPreviewHandler(ev) {
        var fileUploader = this.props.uploader;
        var fileType;
        var fileName;
        var url;
        if(fileUploader.fileProfile != null){
            if (fileUploader.previewUrl == null) {
                return;
            }
            fileType = fileUploader.fileProfile.type;
            fileName = fileUploader.fileProfile.name;
            url = fileUploader.previewUrl;
        }
        else if(this.state.fileRecord){
            fileType = this.state.fileRecord.type;
            fileName = this.state.fileRecord.name;
            url = this.state.fileRecord.url;
        }
        gPreviewFile(fileName, fileType, url);
    }

    alertErrorMsg() {
        var fileUploader = this.props.uploader;
        if (fileUploader && !IsEmptyString(fileUploader.errorMsg)) {
            alert(fileUploader.errorMsg);
        }
    }

    clickTrashHandler(ev) {
        var fileUploader = this.props.uploader;
        if (fileUploader && fileUploader.fileProfile) {
            var msg = PopMessageBox('', EMessageBoxType.Blank, '提示');
            msg.query('撤销当前文件"' + fileUploader.fileProfile.name + '"吗?', [{ label: '确认', key: '确认' }, { label: '算了', key: '算了' }], (key) => {
                if (key == '确认') {
                    fileUploader.reset();
                }
            });

        }
    }

    wantChangeFile() {
        var self = this;
        var msg = PopMessageBox('', EMessageBoxType.Blank, '提示');
        msg.query('重新选择一个文件替换"' + this.state.fileRecord.fileName + '"吗?', [{ label: '确认', key: '确认' }, { label: '算了', key: '算了' }], (key) => {
            if (key == '确认') {
                self.clickPlusHandler();
            }
        });
    }

    dragenter(ev){
        ev.stopPropagation();
        ev.preventDefault();

        var items = ev.dataTransfer.items;
        var isGood = false;
        if(items){
            for(var i=0;i<items.length;++i){
                var item = items[i];
                if(item.kind == 'file'){
                    isGood = true;
                    break;
                }
            }
        }
        this.setState({
            dragstate:isGood ? 'good' : 'bad'
        });
    }

    dragleave(ev){
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate:null
        });
    }

    drop(ev){
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate:null
        });
        var fileList = ev.dataTransfer.files;
        var targetFile = null;
        if(fileList.length > 0){
            targetFile = fileList[0];
        }
        if(targetFile){
            this.uploader.uploadFile(targetFile);
        }
    }

    dragOver(ev){
        ev.stopPropagation();
        ev.preventDefault();
    }

    render() {
        var preViewBtn = null;
        var canDelete = true;
        var fileUploader = this.props.uploader;
        if (fileUploader == null) {
            return null;
        }
        var contentElem = null;
        var iconElem = null;
        var nameElem = null;
        if (fileUploader.base64Data) {
            iconElem = <img className='border w-100 h-100 centerelem position-absolute' src={fileUploader.base64Data} />;
        }
        var fileName;
        var fileSize;
        if (fileUploader.fileProfile) {
            fileName = fileUploader.fileProfile.name;
            fileSize = fileUploader.fileProfile.size;
        }

        var invalidInfoElem = null;
        if (!IsEmptyString(this.props.invalidInfo)) {
            invalidInfoElem = <span className='bg-danger text-white'><i className='fa fa-warning' />{this.props.invalidInfo}</span>
        }

        var childElem = null;
        var self = this;
        switch (fileUploader.state) {
            case EFileUploaderState.WAITFILE:
                canDelete = false;
                var fileRecord = this.state.fileRecord;
                if (this.state.loading) {
                    contentElem = <div className='w-100 h-100'>
                        <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />获取中</span>
                    </div>;
                }
                else if ((this.props.deffileID != null || this.props.defattachmentID != null) && (fileRecord == null || !fileRecord.abandon)) {
                    if (fileRecord == null || fileRecord.fileid != this.props.deffileID || fileRecord.attachmentID != this.props.defattachmentID) {
                        setTimeout(() => {
                            self.setState({
                                loading: true,
                            });
                            self.synRecordInfo();
                        }, 20);
                        contentElem = <div className='w-100 h-100'>
                            <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />获取中</span>
                        </div>;
                    }
                    else {
                        if (fileRecord.fileName == null) {
                            childElem = <span className='centerelem position-absolute text-nowrap text-danger'><i className='fa fa-warninig' />文件不存在</span>;
                        }
                        else {
                            fileName = fileRecord.fileName;
                            fileSize = fileRecord.size;
                            var aidData = getRenderAidDataFromFileType(fileRecord.type);
                            if (aidData.fileType == 'image') {
                                iconElem = <img className='w-100 h-100 centerelem position-absolute cursor_hand' src={fileRecord.url} onClick={this.wantChangeFile} />
                            }
                            else {
                                iconElem = <i className={'fa fa-5x centerelem position-absolute cursor_hand ' + aidData.fileIconType} onClick={this.wantChangeFile} />;
                            }
                            preViewBtn = <button onClick={this.clickPreviewHandler} type='button' className='btn btn-sm btn-primary'><i className={'fa fa-' + (aidData.canPreview ? 'eye' : 'download')} /></button>;
                        }
                    }
                } else {
                    contentElem = <div className='w-100 h-100 cursor_hand' onClick={this.clickPlusHandler} onDragEnter={this.dragenter} onDragLeave={this.dragleave} onDrop={this.drop} onDragOver={this.dragOver}>
                        <span className='centerelem position-absolute pointerevent-none' >
                            <div className='text-nowrap'><i className='fa fa-mouse-pointer' />上传文件</div>
                            {isMobile ? null : <div className='text-nowrap'><i className='fa fa-hand-rock-o' />拖拽文件</div>}
                        </span>
                    </div>;
                }
                break;
            case EFileUploaderState.READING:
                if (fileUploader.errorCode > 0) {
                    childElem = <button className='btn btn-danger btn-sm centerelem position-absolute' onClick={this.alertErrorMsg}>读取出错</button>;
                }
                else {
                    childElem = <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />读取中</span>;
                }
                contentElem = <div className='w-100 h-100'>
                    {childElem}
                </div>;
                break;
            case EFileUploaderState.PREPARE:
                if (fileUploader.errorCode > 0) {
                    childElem = <span className='centerelem position-absolute btn-group'>
                        <button className='btn btn-danger btn-sm' onClick={this.alertErrorMsg}>出错了</button>
                        <button className='btn btn-primary btn-sm' onClick={this.reTryPrepare}><i className='fa fa-refresh' /></button>
                    </span>;
                }
                else {
                    childElem = <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />创建中</span>;
                }
                contentElem = <div className='w-100 h-100'>
                    {childElem}
                </div>;
                break;
            case EFileUploaderState.CALMD5:
                contentElem = <div className='w-100 h-100'>
                    <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />分析中</span>
                </div>;
                break;
            case EFileUploaderState.UPLOADING:
                if (fileUploader.errorCode > 0) {
                    childElem = <span className='centerelem position-absolute btn-group'>
                        <button className='btn btn-danger btn-sm' onClick={this.alertErrorMsg}>出错了</button>
                        <button className='btn btn-primary btn-sm' onClick={this.reTryUpload}><i className='fa fa-refresh' /></button>
                    </span>;
                }
                else {
                    childElem = <span className='centerelem position-absolute text-nowrap bg-white'>
                        <i className='fa fa-circle-o-notch fa-spin' />
                        {fileUploader.percent}%
                        </span>;
                }
                contentElem = <div className='w-100 h-100'>
                    {childElem}
                </div>;
                break;
            case EFileUploaderState.COMPLETE:
                var aidData = getRenderAidDataFromFileType(fileUploader.fileProfile.type);
                if (iconElem == null) {
                    iconElem = <i className={'fa fa-5x centerelem position-absolute ' + aidData.fileIconType} />;
                }
                preViewBtn = <button onClick={this.clickPreviewHandler} type='button' className='btn btn-sm btn-primary'><i className={'fa fa-' + (aidData.canPreview ? 'eye' : 'download')} /></button>;
                break;
        }

        if (fileName) {
            var sizeStr = '';
            var kbsize = Math.round(fileSize / 1024);
            if (kbsize < 1000) {
                sizeStr = kbsize + 'KB';
            }
            else {
                var mbsize = Math.round(10 * kbsize / 1024) / 10.0;
                if (mbsize < 1000) {
                    sizeStr = mbsize + 'MB';
                }
                else {
                    var gbsize = Math.round(10 * kbsize / 1024) / 10.0;
                    sizeStr = gbsize + 'GB';
                }
            }
            fileName += '[' + sizeStr + ']';
            if (fileName.length > 32) {
                fileName = '...' + fileName.substr(-32);
            }
        }

        return <div className='fileuploadersingle'>
            <input onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' accept="image/*" />
            <span id='title' className='flex-grow-0 flex-shrink-0'>
                成果名称s
            </span>
            <div id='content' className='fileuploadersingle-content' dragstate={this.state.dragstate}>
                {iconElem}
                {contentElem}
                {invalidInfoElem}
                <div id='toolbar' className='btn-group'>
                    {preViewBtn}
                    {canDelete ? <button onClick={this.clickTrashHandler} type='button' className='btn btn-sm btn-danger'><i className='fa fa-trash' /></button> : null}
                </div>
            </div>
            <div id='name'>
                {fileName}
            </div>
        </div>
    }
}

function ERPC_SingleFileUploader_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        title: ctlState.title == null ? ownprops.title : ctlState.title,
        invalidInfo: ctlState.invalidInfo,
        uploader: ctlState.uploader,
        attachmentID: ctlState.attachmentID,
        fileID: ctlState.fileID,
        defattachmentID: ctlState.defattachmentID,
        deffileID: ctlState.deffileID,
    };
}

function ERPC_SingleFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {
    };
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
            uploader.off('changed', this.reDraw);
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

    clickPreViewHandler() {
        var fileUploader = this.props.uploader;
        if (fileUploader.previewUrl == null) {
            return;
        }
        var fileProfile = fileUploader.fileProfile;
        var fileType = fileProfile.type;
        gPreviewFile(fileProfile.name, fileType, fileUploader.previewUrl);
    }

    render() {
        var contentElem = null;
        var fileUploader = this.props.uploader;
        if (fileUploader != this.uploader) {
            this.unlistenUploader(this.uploader);
            this.listenUploader(fileUploader);
        }
        var fileProfile = fileUploader.fileProfile;
        var aidData = getRenderAidDataFromFileType(fileProfile ? fileProfile.type : null);

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
                case EFileUploaderState.CALMD5:
                    bottomBar = <span className='flex-grow-1 flex-shrink-1'><i className='fa fa-circle-o-notch fa-spin' />计算电子指纹</span>;
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
                        {aidData.canPreview && fileUploader.previewUrl ? <button onClick={this.clickPreViewHandler} className='ml-1 btn btn-sm btn-primary'><i className='fa fa-eye' />预览</button> : '(不支持预览))'}
                    </span>
                    break;
                case EFileUploaderState.BEFOREEND:
                    bottomBar = <span className='d-flex align-items-center'>
                        <i className='fa fa-circle-o-notch fa-spin' />即将完成
                        {aidData.canPreview && fileUploader.previewUrl ? <button onClick={this.clickPreViewHandler} className='ml-1 btn btn-sm btn-primary'><i className='fa fa-eye' />预览</button> : '(不支持预览))'}
                    </span>
                    break;
            }
            var iconElem = null;
            if (fileUploader.base64Data) {
                iconElem = <img className='border' style={{ width: '3em', height: '3em' }} src={fileUploader.base64Data} />
            }
            else {
                iconElem = <i className={'fa fa-3x m-auto ' + aidData.fileIconType} />
            }
            var fileName = fileProfile.name;
            if (fileName.length > 15) {
                fileName = '...' + fileName.slice(-15);
            }
            contentElem = <div className='d-flex flex-grow-1 flex-shrink-1'>
                <div className='flex-grow-0 flex-shrink-0 p-1 d-flex flex-column'>
                    {iconElem}
                    {fileUploader.sizeStr}
                </div>
                <div className='d-flex flex-grow-1 flex-shrink-1 flex-column'>
                    <span className='border-bottom'>{fileName}</span>
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

        ERPControlBase(this);
        this.state = {};
        this.fileTagRef = React.createRef();

        autoBind(this);
    }

    uploaderJobDone(uploader) {
        if (this.props.onuploadcomplete) {
            this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code);
        }
    }

    cusComponentWillmount() {
        if (this.props.uploaders == null) {
            store.dispatch(makeAction_setManyStateByPath({
                uploaders: [],
            }, this.props.fullPath));
        }
    }

    cusComponentWillUnmount() {

    }

    addFileList(files){
        var uploaders = this.props.uploaders;
        var newUploaders = uploaders ? uploaders.concat() : [];
        var addedCount = 0;
        for (var fi = 0; fi < files.length; ++fi) {
            var theFile = files[fi];
            var found = newUploaders.find(uploader => {
                return uploader.file && uploader.file.name == theFile.name && uploader.file.size == theFile.size;
            });
            if (!found) {
                var newUploader = new FileUploader();
                newUploader.uploadFile(theFile, this.uploaderJobDone);
                newUploaders.push(newUploader);
                ++addedCount;
                if (addedCount == 9) {
                    SendToast("一次只能添加9个文件");
                    break;
                }
            }
        }
        store.dispatch(makeAction_setManyStateByPath({
            uploaders: newUploaders,
            invalidInfo: null,
        }, this.props.fullPath));
    }

    fileSelectedHandler(ev) {
        this.addFileList(ev.target.files);
    }

    plusClickHandler(ev) {
        if (this.fileTagRef.current) {
            this.fileTagRef.current.click();
        }
    }

    clickTrashHandler(ev) {
        var fkey = getAttributeByNode(ev.target, 'd-fkey');
        var uploaders = this.props.uploaders;
        if (uploaders) {
            var targetUploader = null;
            for (var pi = 0; pi < uploaders.length; ++pi) {
                var uploader = uploaders[pi];
                if (uploader.file.name + uploader.file.size == fkey) {
                    targetUploader = uploader;
                    break;
                }
            }
            if (targetUploader) {
                targetUploader.reset();
                var newUploaders = uploaders.filter(uploader => {
                    return uploader != targetUploader;
                })
                store.dispatch(makeAction_setManyStateByPath({
                    uploaders: newUploaders,
                }, this.props.fullPath));
            }
        }
    }

    dragenter(ev){
        ev.stopPropagation();
        ev.preventDefault();

        var items = ev.dataTransfer.items;
        var isGood = false;
        if(items){
            for(var i=0;i<items.length;++i){
                var item = items[i];
                if(item.kind == 'file'){
                    isGood = true;
                    break;
                }
            }
        }
        this.setState({
            dragstate:isGood ? 'good' : 'bad'
        });
    }

    dragleave(ev){
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate:null
        });
    }

    drop(ev){
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate:null
        });
        this.addFileList(ev.dataTransfer.files);
    }

    dragOver(ev){
        ev.stopPropagation();
        ev.preventDefault();
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        var uploaders = this.props.uploaders;
        var uploaderElems_arr = [];
        if (uploaders && uploaders.length > 0) {
            uploaderElems_arr = uploaders.map(uploader => {
                if (uploader.fileProfile == null) {
                    return null;
                }
                return <div key={uploader.file.name} d-fkey={uploader.file.name + uploader.file.size} className='list-group-item flex-grow-0 flex-shrink-0'>
                    <div className='d-flex w-100 align-items-center'>
                        <span className='flex-grow-1 flex-shrink-1 border-right mr-1'>
                            <CFileUploaderBar uploader={uploader} />
                        </span>
                        <button onClick={this.clickTrashHandler} className='btn btn-danger flex-grow-0 flex-shrink-0'><i className='fa fa-trash' /></button>
                    </div>
                </div>
            });
        }
        var rootClassName = 'd-flex flex-column'
            + (this.props.flexgrow == '1' ? ' flex-grow-1' : ' flex-grow-0')
            + (this.props.flexshrink == '1' ? ' flex-shrink-1' : ' flex-shrink-0');

        var bContentNeedScroll = false;
        if (this.props.flexgrow == '1' || this.props.flexshrink == '1' || (this.props.style && (this.props.style.height || this.props.style.maxHeight))) {
            bContentNeedScroll = true;
        }

        var invalidInfoElem = null;
        if (!IsEmptyString(this.props.invalidInfo)) {
            invalidInfoElem = <span className='bg-danger text-white'><i className='fa fa-warning' />{this.props.invalidInfo}</span>
        }

        return <div className={rootClassName} style={this.props.style}>
            <input onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' multiple="multiple" />
            <div className='bg-dark d-flex flex-shrink-0 flex-grow-0 p-1 align-items-center'>
                <span className='text-light flex-grow-1 flex-shrink-1'><i className='fa fa-list mr-1' />{this.props.title}</span>
            </div>
            {invalidInfoElem}
            <div className={'list-group flex-grow-1 flex-shrink-1 border' + (bContentNeedScroll ? ' autoScroll' : '')}>
                {uploaderElems_arr}
                <div className='list-group-item p-1'>
                    <div>{uploaderElems_arr.length == 0 ? '' : '共' + uploaderElems_arr.length + '个附件'}</div>
                    <button className='btn mfileuploader-addbtn' onClick={this.plusClickHandler} dragstate={this.state.dragstate} onDragEnter={this.dragenter} onDragLeave={this.dragleave} onDrop={this.drop} onDragOver={this.dragOver}>
                        <div className='pointerevent-none'><i className='fa fa-mouse-pointer' />上传文件</div>
                        {isMobile ? null : <div className='pointerevent-none'><i className='fa fa-hand-rock-o' />拖拽文件</div>}
                    </button>
                </div>
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
        invalidInfo: ctlState.invalidInfo,
    };
}

function ERPC_MultiFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

class ERPC_FilePreview extends React.PureComponent {
    constructor(props) {
        super();

        ERPControlBase(this);
        this.state = {};
        autoBind(this);
        this.audioTagRef = React.createRef();
    }

    clickIconHandler(ev) {
        var fileUrl = window.location.origin + this.props.filePath;
        var fileName = this.props.fileName;
        if (this.fileType == 'image') {
            dingdingKit.biz.util.previewImage({
                urls: [fileUrl],
                current: fileUrl,
            });
        }
        else if (this.fileType == 'audio') {
            if (this.audioTagRef.current) {
                this.audioTagRef.current.src = fileUrl;
                this.audioTagRef.current.play();
            }
        }
        else if (this.fileType == 'video' || this.fileType == 'movie') {
            if (isMobile) {
                dingdingKit.biz.util.openLink({
                    url: fileUrl,
                });
            }
            else {
                dingdingKit.biz.util.openModal({
                    url: fileUrl,
                    title: this.props.fileName,
                });
            }
        }
        else {
            if (!isMobile) {
                dingdingKit.biz.util.isLocalFileExist({
                    params: [{ url: fileUrl }],
                    onSuccess: function (result) {
                        if (result[0].isExist) {
                            dingdingKit.biz.util.openLocalFile({
                                url: fileUrl, //本地文件的url，指的是调用DingTalkPC.biz.util.downloadFile接口下载时填入的url，配合DingTalkPC.biz.util.downloadFile使用
                                onSuccess: function (result) {
                                },
                                onFail: function () { }
                            });
                        }
                        else {
                            dingdingKit.biz.util.downloadFile({
                                url: fileUrl, //要下载的文件的url
                                name: fileName, //定义下载文件名字
                                onProgress: function (msg) {
                                },
                                onSuccess: function (result) {
                                    dingdingKit.biz.util.openLocalFile({
                                        url: fileUrl,
                                        onSuccess: function (result) {
                                        },
                                        onFail: function () { }
                                    });
                                },
                                onFail: function () { }
                            });
                        }
                    },
                    onFail: function () { }
                })
            }
            else {
                dingdingKit.biz.util.openLink({
                    url: fileUrl,
                });
            }
        }
    }

    clickTrashHandler(ev) {
        if (this.deleting) {
            return;
        }

        var msg = PopMessageBox('删除附件:"' + this.props.fileName + '"?', EMessageBoxType.Blank, '附件删除');
        msg.query('删除附件"' + this.props.fileName + '" ?', [{ label: '删除', key: '删除' }, { label: '算了', key: '算了' }], (key) => {
            if (key == '删除') {
                this.deleting = true;
                var self = this;
                store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { 附件id: this.props.attachmentID }, action: 'deleteAttachment' },
                    makeFTD_Callback((state, data, error) => {
                        self.deleting = false;
                        if (error) {
                            alert(JSON.stringify(error));
                            return;
                        }
                        else {
                            self.deletedAttachmentID = self.props.attachmentID;
                            setTimeout(() => {
                                self.setState({
                                    magicObj: {}
                                });
                            }, 20);
                        }
                    }, false)));
            }
        });
    }

    render() {
        if (this.deletedAttachmentID && this.deletedAttachmentID == this.props.attachmentID) {
            return null;
        }
        var aidData = getRenderAidDataFromFileType(this.props.fileType);
        this.canPreview = aidData.canPreview;
        this.fileType = aidData.fileType;
        var contetnElem = null;
        if (aidData.fileType == 'image') {
            contetnElem = <img className='w-100 h-100' src={window.location.origin + this.props.filePath} onClick={this.clickIconHandler} />
        }
        else if (aidData.fileType == 'audio') {
            contetnElem = [
                <audio key='audio' ref={this.audioTagRef} src={window.location.origin + this.props.filePath} />,
                <i key='icon' className={'fa ' + fileIconType} onClick={this.clickIconHandler} />
            ];
        }
        else {
            contetnElem = <i onClick={this.clickIconHandler} className={'fa ' + fileIconType} />
        }
        var fileName = this.props.fileName;
        if (fileName.length > 15) {
            fileName = '...' + this.props.fileName.substr(-15);
        }
        return <div className='filepreview'>
            {contetnElem}
            <div id='name'>
                {fileName}
            </div>
            {!this.props.canDelte ? null : <button onClick={this.clickTrashHandler} id='del' className='btn btn-sm btn-danger'><i className={'fa ' + (this.deleting ? 'fa-circle-o-notch fa-spin' : 'fa-trash')} /></button>}
        </div>
    }
}

function ERPC_FilePreview_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        fileID: ctlState.fileID,
        attachmentID: ctlState.attachmentID,
        fileType: ctlState.fileType,
        filePath: ctlState.filePath,
        fileName: ctlState.fileName,
    };
}

function ERPC_FilePreview_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_MultiFileUploader = null;
var VisibleERPC_FilePreview = null;
var VisibleERPC_SingleFileUploader = null;

gNeedCallOnErpControlInit_arr.push(() => {
    VisibleERPC_MultiFileUploader = ReactRedux.connect(ERPC_MultiFileUploader_mapstatetoprops, ERPC_MultiFileUploader_dispatchtorprops)(ERPC_MultiFileUploader);
    VisibleERPC_FilePreview = ReactRedux.connect(ERPC_FilePreview_mapstatetoprops, ERPC_FilePreview_dispatchtorprops)(ERPC_FilePreview);
    VisibleERPC_SingleFileUploader = ReactRedux.connect(ERPC_SingleFileUploader_mapstatetoprops, ERPC_SingleFileUploader_dispatchtorprops)(ERPC_SingleFileUploader);
});
