const fileSystemUrl = '/fileSystem';

const EAcceptFileType = {
    All: 1,
    Image: 2,
    Vedio: 3,
    Excel: 4,
    Word: 5,
    PDF: 6,
    ImageVedio: 7,
};


var FileAcceptStr = {
};
FileAcceptStr[EAcceptFileType.All] = '*/*';
FileAcceptStr[EAcceptFileType.Image] = 'image/*';
FileAcceptStr[EAcceptFileType.Vedio] = 'vedio/*';
FileAcceptStr[EAcceptFileType.Excel] = 'application/msexcel,application/vnd.openxmlformats-officedocument.spre,application/vnd.ms-excel';
FileAcceptStr[EAcceptFileType.Word] = 'application/msword,application/vnd.openxmlformats-officedocument.word';
FileAcceptStr[EAcceptFileType.PDF] = 'application/pdf';
FileAcceptStr[EAcceptFileType.ImageVedio] = 'image/*,vedio/*';

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

function DataSizeToString(size) {
    var kbsize = Math.round(size / 1024);
    var sizeStr = '';
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
    return sizeStr;
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
        this.uploading = false;
        this.blockreader = null;
        this.speed = null;
        this.changeState(EFileUploaderState.WAITFILE);

        if (this.hexWorker) {
            this.hexWorker.terminate();
            this.hexWorker = null;
            console.log('hexWorker 已终止 by reset');
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
        this.startPos = 0;
        this.speed = null;
        this.evalSize = 0;
        this.evalTime = 0;
        this.changeState(EFileUploaderState.PREPARE);
        this._prepare();

        if (theFile.type.indexOf('image/') != -1) {
            var imgReader = new FileReader();
            imgReader.onerror = null;
            imgReader.onload = ev => {
                if (self.fileProfile == null) {
                    console.log('上传器被删除');
                    return;
                }
                self.base64Data = imgReader.result;
                self._fireChanged();
            };
            imgReader.readAsDataURL(theFile);
        }
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
            type: theFile.type,
            md5: this.fileProfile.md5 == null ? '' : this.fileProfile.md5,
        };
        this.sizeStr = DataSizeToString(theFile.size);
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
        if (this.isPause || this.uploading || this.fileProfile == null) {
            return;
        }
        var self = this;
        var blockSize = this.fileProfile.size - this.startPos;
        if (blockSize == 0) {
            this.changeState(EFileUploaderState.COMPLETE);
            if (typeof this.uploadedCallBack === 'function') {
                this.uploadedCallBack(this);
            }
            return;
        }
        if (this.hexWorker == null) {
            console.log('hexWorker 已创建');
            this.hexWorker = new Worker("/js/woker_bytetohexstr3.js");
            this.hexWorker.onmessage = ev => {
                var bundle = {
                    fileIdentity: self.fileProfile.identity,
                    data: ev.data,
                    startPos: self.startPos,
                    fileFlow: self.fileFlow,
                    relrecordid: self.relrecordid,
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
                                self.speed = '0kb/s(E)';
                                console.log(error);
                                switch (error.code) {
                                    case EFileSystemError.WRONGSTART:
                                        if (isNaN(error.data)) {
                                            console.err("WRONGSTART's data is nan");
                                        }
                                        self.startPos = parseInt(error.data);
                                        error = null;
                                        break;
                                    case EFileSystemError.EMPTYDATA:
                                    case EFileSystemError.DATATOOLONG:
                                    case EFileSystemError.FILELOCKED:
                                        error = null;
                                        break;
                                    case EFileSystemError.UPLOADCOMPLATE:
                                        error = null;
                                        self.startPos = self.fileProfile.size;
                                        break;
                                }
                                if (error != null) {
                                    // 上传过程中遇到错误不断重试即可
                                    //console.log(error);
                                    self.myBlockMaxSize = MINPERBLOCKSIZE;
                                }

                                self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                                setTimeout(() => {
                                    self._fireChanged();
                                    self._uploadData();
                                }, 20);
                            }
                            else {
                                var thisUploadUseTime = (new Date().getTime() - self.uploadingStartTime);
                                self.evalSize += data.bytesWritten;
                                self.evalTime += thisUploadUseTime;
                                if (self.evalTime > 1000) {
                                    self.speed = DataSizeToString(Math.round((1000.0 * self.evalSize) / (self.evalTime))) + '/s';
                                    self.evalSize = 0;
                                    self.evalTime = 0;
                                }
                                //console.log('fetchUseTime:' + fetchUseTime + '  blksize:' + self.myBlockMaxSize);
                                if (fetchUseTime < 200) {
                                    self.myBlockMaxSize = Math.min(self.myBlockMaxSize + STEP_BLOCKSIZE, MAXPERBLOCKSIZE);
                                }
                                else if (fetchUseTime > 300) {
                                    self.myBlockMaxSize = Math.max(self.myBlockMaxSize - STEP_BLOCKSIZE, MINPERBLOCKSIZE);
                                }
                                self.startPos += data.bytesWritten;
                                self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                                //console.log(self.percent  + '%');
                                if (data.previewUrl) {
                                    self.previewUrl = data.previewUrl;
                                }
                                if (data.attachmentID > 0) {
                                    self.fileProfile.attachmentID = data.attachmentID;
                                }
                                setTimeout(() => {
                                    self._fireChanged();
                                    self._uploadData();
                                }, 20);
                            }
                        }, 20);
                    }, false)));
            };
        }
        var hexWorker = this.hexWorker;
        this.uploading = true;
        this.uploadingStartTime = new Date().getTime();
        if (blockSize > this.myBlockMaxSize) {
            blockSize = this.myBlockMaxSize;
        }
        var endPos = this.startPos + blockSize;
        var blockreader = this.blockreader;
        if (blockreader == null) {
            blockreader = new FileReader();
            blockreader.onerror = () => {
                blockreader.abort();
                if (self.fileProfile == null) {
                    console.log('上传器被删除');
                    return;
                }
                setTimeout(() => {
                    self._uploadData();
                }, 1000);
            };
            blockreader.onload = ev => {
                if (self.fileProfile == null) {
                    console.log('上传器被删除');
                    return;
                }
                var fileData = new Uint8Array(blockreader.result);
                hexWorker.postMessage(fileData);
            };
        }
        blockreader.readAsArrayBuffer(this.file.slice(this.startPos, endPos));

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
            if (this.hexWorker) {
                this.hexWorker.terminate();
                this.hexWorker = null;
                console.log('hexWorker 已终止');
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
            if (!isMobile) {
                dingdingKit.biz.util.isLocalFileExist({
                    params: [{ url: window.location.origin + url }],
                    onSuccess: function (result) {
                        if (result[0].isExist) {
                            dingdingKit.biz.util.openLocalFile({
                                url: window.location.origin + url, //本地文件的url，指的是调用DingTalkPC.biz.util.downloadFile接口下载时填入的url，配合DingTalkPC.biz.util.downloadFile使用
                                onSuccess: function (result) {
                                },
                                onFail: function () { }
                            });
                        }
                        else {
                            dingdingKit.biz.util.downloadFile({
                                url: window.location.origin + url, //要下载的文件的url
                                name: name, //定义下载文件名字
                                onProgress: function (msg) {
                                },
                                onSuccess: function (result) {
                                    dingdingKit.biz.util.openLocalFile({
                                        url: window.location.origin + url,
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
                });
            }
            else {
                dingdingKit.biz.util.openLink({
                    url: window.location.origin + url,
                });
            }
        }
    }
    else {
        SendToast('在钉钉中才可预览');
    }
}

class ERPC_QRCodeUploader extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        this.style = {
            width: '400px',
        };
        this.state = {
            info: ''
        }
    }

    watchingSingleMode(uuid) {
        var self = this;
        var fileFlow = this.props.fileFlow ? parseInt(this.props.fileFlow) : null;
        var relrecordid = this.props.relrecordid ? parseInt(this.props.relrecordid) : null;
        var fileRecord;
        var makeAttachmentProcess = (state, ret_data, ret_err) => {
            if (self.unmounted) {
                return;
            }
            if (ret_data != null) {
                fileRecord.attachmentID = ret_data.attachmentID;
                if (self.props.onUploaded) {
                    self.props.onUploaded(fileRecord);
                }
                return;
            }
            setTimeout(() => {
                if (self.unmounted) {
                    return;
                }
                store.dispatch(fetchJsonPost(fileSystemUrl, {
                    bundle: {
                        fileFlow: fileFlow,
                        relrecordid: relrecordid,
                        fileid: fileRecord.文件上传记录代码,
                    }, action: 'makeAttachment',
                }, makeFTD_Callback(makeAttachmentProcess)));
            }, 200);
        }
        var queryProcess = (state, ret_data, ret_err) => {
            if (self.unmounted) {
                return;
            }
            if (ret_data != null) {
                fileRecord = ret_data[0];
                if (fileFlow > 0 && relrecordid > 0) {
                    self.setState({
                        info: '正在生成附件记录'
                    });
                    makeAttachmentProcess();
                }
                else if (self.props.onUploaded) {
                    self.props.onUploaded(fileRecord);
                }
                return;
            }
            setTimeout(() => {
                if (this.unmounted) {
                    return;
                }
                store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { key: uuid }, action: 'queryQRCodeFiles', }, makeFTD_Callback(queryProcess)));
            }, 1000);
        };
        queryProcess();
    }

    watchingMultiMode(uuid) {
        var self = this;
        var processFile_map = {};
        var queryProcess = (state, ret_data, ret_err) => {
            if (self.unmounted) {
                return;
            }
            var addedFiles_arr = [];
            if (ret_data != null) {
                ret_data.forEach(
                    fileRecord => {
                        if (processFile_map[fileRecord.文件上传记录代码]) {
                            return;
                        }
                        processFile_map[fileRecord.文件上传记录代码] = true;
                        addedFiles_arr.push(fileRecord);
                    }
                );
            }
            if (addedFiles_arr.length > 0) {
                if (self.props.onUploaded) {
                    self.props.onUploaded(addedFiles_arr);
                }
                self.setState({
                    files_arr: ret_data,
                });
            }
            setTimeout(() => {
                if (this.unmounted) {
                    return;
                }
                store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { key: uuid }, action: 'queryQRCodeFiles', }, makeFTD_Callback(queryProcess)));
            }, 1000);
        };
        queryProcess();
    }

    componentWillMount() {
        var multiMode = this.props.multiMode == true;
        var uuid = guid2().toUpperCase();
        var self = this;
        this.uuid = uuid;

        store.dispatch(fetchJsonPost('/makeqrcode2', { text: window.location.origin + '/erppage/mb/SMSCWJ?flowStep=' + (multiMode ? 219 : 218) + '&stepData' + (multiMode ? 219 : 218) + '=' + uuid }, makeFTD_Callback((state, imgUrl) => {
            self.setState({
                imgUrl: imgUrl
            });
            if (!multiMode) {
                self.watchingSingleMode(uuid);
            }
            else {
                self.watchingMultiMode(uuid);
            }
        })));
    }

    componentWillUnmount() {
        this.unmounted = true;
    }

    clickCloseHandler(ev) {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    render() {
        var qrImg = null;
        if (this.state.imgUrl) {
            qrImg = <img src={this.state.imgUrl} />
        }
        else {
            qrImg = <span>二维码加载中<i className='fa fa-spinner fa-spin' /></span>
        }
        var fileListElem = null;
        if (this.state.files_arr) {
            fileListElem = <React.Fragment>
                <span>{'已上传' + this.state.files_arr.length + '个文件'}</span>
                <div className='list-group flex-grow-0 flex-shrink-0 autoScroll' style={{ maxHeight: '300px' }}>
                    {this.state.files_arr.map(x => {
                        return <div className='list-group-item' key={x.文件上传记录代码} >{x.文件名称}</div>
                    })}
                </div>
            </React.Fragment>
        }
        return <div className='d-fixed w-100 h-100 fixedBackGround'>
            <div className="position-absolute centerelem d-flex bg-light flex-column" style={this.style}>
                <div className="d-flex bg-primary p-1 ">
                    <h5 className="text-light flex-grow-1 flex-shrink-1">扫码上传{this.props.multiMode ? '多个' : '单个'}文件</h5>
                    <button onClick={this.clickCloseHandler} type="button" className="btn btn-sm btn-danger"><i className="fa fa-close" /></button>
                </div>
                <div className='d-flex p-1 flex-column'>
                    <span >请用钉钉扫码</span>
                    <div className='d-flex justify-content-center'>
                        {qrImg}
                    </div>
                    <span>{this.state.info}</span>
                    {fileListElem}
                </div>
            </div>
        </div>
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
        this.unmounted = false;
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
            attachmentID: this.props.defattachmentID,
            fileFlow: this.props.fileflow,
            relrecordid: this.props.relrecordid,
            fileIdentity: this.props.fileIdentity,
        };
        var self = this;
        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'getFileRecord' },
            makeFTD_Callback((state, data, error) => {
                var fileRecord = {
                    fileID: data ? data.文件上传记录代码 : null,
                    attachmentID: data ? data.附件记录代码 : null,
                    fileFlow: data ? data.归属流程代码 : bundle.fileFlow,
                    relrecordid: data ? data.关联记录代码 : bundle.relrecordid,
                    fileName: data ? data.文件名称 : null,
                    fileSize: data ? data.文件大小 : null,
                    type: data ? data.文件类型 : null,
                    url: data ? data.文件路径 : null,
                };
                setTimeout(() => {
                    if (self.props.defattachmentID == bundle.attachmentID && self.props.fileflow == bundle.fileFlow && self.props.relrecordid == bundle.relrecordid && self.props.fileIdentity == bundle.fileIdentity) {
                        var needSetState = {
                            fileID: fileRecord.fileID,
                            attachmentID: fileRecord.attachmentID,
                            invalidInfo: null,
                        };
                        if (data) {
                            if (bundle.attachmentID > 0) {
                                needSetState.fileFlow = fileRecord.fileFlow;
                                needSetState.relrecordid = fileRecord.relrecordid;
                            }
                        }
                        store.dispatch(makeAction_setManyStateByPath(needSetState, self.props.fullPath));

                        if (!this.unmounted) {
                            self.setState({
                                loading: false,
                                fileRecord: fileRecord,
                            });
                        }
                    }
                    else {
                        // 信息发生了更改，重新获取
                        console.log('信息发生了更改，重新获取');
                        if (!this.unmounted) {
                            self.setState({
                                loading: false,
                            });
                        }
                    }
                }, 20);
            }, false)));
    }

    componentWillUnmount() {
        this.unmounted = true;
        this.unlistenUploader(this.props.uploader);
    }

    uploaderJobDone(uploader) {
        if (this.props.onuploadcomplete) {
            this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code, uploader.fileProfile.identity);
        }
        store.dispatch(makeAction_setManyStateByPath({
            invalidInfo: null,
            fileID: uploader.fileProfile.code,
            attachmentID: uploader.fileProfile.attachmentID,
        }, this.props.fullPath));
    }

    startUploadFile(theFile) {
        this.uploader.fileFlow = this.props.fileflow;
        this.uploader.relrecordid = this.props.relrecordid;
        this.uploader.definfo = {
            defattachmentID: this.props.defattachmentID,
            relrecordid: this.props.relrecordid,
            fileIdentity: this.props.fileIdentity,
        };
        this.uploader.uploadFile(theFile, this.uploaderJobDone);
    }

    fileSelectedHandler(ev) {
        if (ev.target.files.length > 1) {
            SendToast('只能选一个文件');
            return;
        }
        var theFile = ev.target.files[0];
        this.startUploadFile(theFile);
        if (this.state.fileRecord) {
            this.setState({
                fileRecord: Object.assign({}, this.state.fileRecord, { abandon: true }),
            });
        }
    }

    clickQRCodehandler(ev) {
        var qrUploader;
        var self = this;
        var clickCloseAct = () => {
            removeFixedItem(qrUploader);
        };
        var uploaded = (fileRecord) => {
            var fileUploader = self.uploader;
            fileUploader.fileProfile = {
                name: fileRecord.文件名称,
                size: fileRecord.文件大小,
                type: fileRecord.文件类型,
                code: fileRecord.文件上传记录代码,
                attachmentID: fileRecord.attachmentID,
            };
            fileUploader.fileFlow = self.props.fileflow;
            fileUploader.relrecordid = self.props.relrecordid;
            fileUploader.definfo = {
                defattachmentID: self.props.defattachmentID,
                relrecordid: self.props.relrecordid,
                fileIdentity: self.props.fileIdentity,
            };
            fileUploader.previewUrl = fileRecord.文件路径;
            fileUploader.state = EFileUploaderState.COMPLETE;
            setTimeout(() => {
                removeFixedItem(qrUploader);
                self.uploaderJobDone(fileUploader);
            }, 500);
        };
        var qrUploader = <ERPC_QRCodeUploader fileFlow={self.props.fileflow} relrecordid={self.props.relrecordid} key='qrcodeUploader' onClose={clickCloseAct} onUploaded={uploaded} />
        addFixedItem(qrUploader);
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
        if (fileUploader.fileProfile != null) {
            if (fileUploader.previewUrl == null) {
                return;
            }
            fileType = fileUploader.fileProfile.type;
            fileName = fileUploader.fileProfile.name;
            url = fileUploader.previewUrl;
        }
        else if (this.state.fileRecord) {
            fileType = this.state.fileRecord.type;
            fileName = this.state.fileRecord.fileName;
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

    dragenter(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var items = ev.dataTransfer.items;
        var isGood = false;
        if (items && items.length == 1) {
            var item = items[0];
            if (item.kind == 'file') {
                isGood = true;
            }
        }
        this.setState({
            dragstate: isGood ? 'good' : 'bad'
        });
    }

    dragleave(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate: null
        });
    }

    drop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate: null
        });
        var fileList = ev.dataTransfer.files;
        if (fileList.length > 1) {
            SendToast('只能选一个文件');
            return;
        }
        this.startUploadFile(fileList[0]);
    }

    dragOver(ev) {
        ev.stopPropagation();
        ev.preventDefault();
    }

    render() {
        var preViewBtn = null;
        var canDelete = true;
        var fileUploader = this.props.uploader;
        if (fileUploader == null || this.props.visible == false) {
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
        var relrecordid = this.props.relrecordid;
        if (relrecordid == 0 || isNaN(relrecordid)) {
            relrecordid = null;
        }
        if (fileUploader.state != EFileUploaderState.WAITFILE) {
            var nowdefinfo = {
                defattachmentID: this.props.defattachmentID,
                relrecordid: this.props.relrecordid,
                fileIdentity: this.props.fileIdentity,
            };
            if (!ObjIsEqual(nowdefinfo, fileUploader.definfo)) {
                setTimeout(() => {
                    fileUploader.reset();
                }, 20);
            }
        }
        switch (fileUploader.state) {
            case EFileUploaderState.WAITFILE:
                canDelete = false;
                var fileRecord = this.state.fileRecord;
                var qrCodeBtn = null;
                if (this.state.loading) {
                    contentElem = <div className='w-100 h-100'>
                        <span className='centerelem position-absolute text-nowrap bg-white'><i className='fa fa-circle-o-notch fa-spin' />获取中</span>
                    </div>;
                }
                else if (this.props.mode == 'direct') {
                    if (this.props.fileIdentity != null && this.props.fileIdentity.length == 36) {
                        if (fileRecord == null) {
                            setTimeout(() => {
                                if (this.unmounted) {
                                    return;
                                }
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
                                invalidInfoElem = <span className='bg-danger text-white'><i className='fa fa-warning' />文件不存在</span>
                            }
                            else {
                                fileName = fileRecord.fileName;
                                fileSize = fileRecord.fileSize;
                                var aidData = getRenderAidDataFromFileType(fileRecord.type);
                                if (aidData.fileType == 'image') {
                                    iconElem = <img className='w-100 h-100 centerelem position-absolute cursor_hand' src={fileRecord.url} onClick={this.wantChangeFile} />
                                }
                                else {
                                    iconElem = <i className={'fa fa-5x centerelem position-absolute cursor_hand ' + aidData.fileIconType} onClick={this.wantChangeFile} />;
                                }
                                preViewBtn = <button onClick={this.clickPreviewHandler} type='button' className='btn btn-sm btn-primary'><i className={'fa fa-' + (aidData.canPreview ? 'eye' : 'download')} /></button>;
                                contentElem = <span />
                            }
                        }
                    }
                }
                else if ((this.props.defattachmentID > 0 || relrecordid != null) && (fileRecord == null || !fileRecord.abandon)) {
                    if (fileRecord == null || (this.props.defattachmentID > 0 && fileRecord.attachmentID != this.props.defattachmentID) || (relrecordid != null && fileRecord.relrecordid != this.props.relrecordid)) {
                        setTimeout(() => {
                            if (this.unmounted) {
                                return;
                            }
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
                            if (this.props.defattachmentID > 0) {
                                invalidInfoElem = <span className='bg-danger text-white'><i className='fa fa-warning' />文件不存在</span>
                            }
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
                            contentElem = <span />
                        }
                    }
                }
                if (contentElem == null) {
                    if (this.props.mode != 'direct' && !(relrecordid != null && this.props.fileflow > 0)) {
                        contentElem = <div className='w-100 h-100'>
                            <span className='centerelem position-absolute pointerevent-none' >
                                <div className='text-danger text-nowrap'><i className='fa fa-warning' />需要FR</div>
                            </span>
                        </div>;
                    }
                    else {
                        contentElem = <div className='flex-grow-1 flex-shrink-1 cursor_hand' onClick={this.clickPlusHandler} onDragEnter={this.dragenter} onDragLeave={this.dragleave} onDrop={this.drop} onDragOver={this.dragOver}>
                            <span className='centerelem position-absolute pointerevent-none' >
                                <div className='text-nowrap'><i className='fa fa-mouse-pointer' />上传文件</div>
                                {isMobile ? null : <div className='text-nowrap'><i className='fa fa-hand-rock-o' />拖拽文件</div>}
                            </span>
                        </div>;
                        if (!isMobile) {
                            qrCodeBtn = <div className='text-nowrap cursor_hand qrcodebtn' onClick={this.clickQRCodehandler}><i className='fa fa-qrcode' />扫码上传</div>
                        }
                    }
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
                    childElem = <div className='centerelem position-absolute text-nowrap bg-white'>
                        <div><i className='fa fa-circle-o-notch fa-spin' />{fileUploader.percent}%</div>
                        <div>{fileUploader.speed}</div>
                    </div>;
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
                if (fileUploader.base64Data == null && fileUploader.previewUrl && fileUploader.fileProfile.type.indexOf('image/') != -1) {
                    iconElem = <img className='border w-100 h-100 centerelem position-absolute' src={fileUploader.previewUrl} />;
                }
                break;
        }

        if (fileName) {
            var sizeStr = DataSizeToString(fileSize);
            fileName += '[' + sizeStr + ']';
            if (fileName.length > 32) {
                fileName = '...' + fileName.substr(-32);
            }
        }

        var className = 'fileuploadersingle ' + (this.props.className ? this.props.className : '');
        return <div className={className} style={this.props.style} fixedsize={this.props.fixedsize}>
            <input onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' accept="*/*" />
            <span id='title' className='flex-grow-0 flex-shrink-0 wb-all'>
                {this.props.title}
            </span>
            <div id='content' className='fileuploadersingle-content' dragstate={this.state.dragstate}>
                {iconElem}
                {contentElem}
                <div id='toolbar' className='btn-group'>
                    {qrCodeBtn}
                    {preViewBtn}
                    {canDelete ? <button onClick={this.clickTrashHandler} type='button' className='btn btn-sm btn-danger'><i className='fa fa-trash' /></button> : null}
                </div>
            </div>
            <div id='name'>
                {invalidInfoElem}
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
        relrecordid: ctlState.relrecordid,
        fileIdentity: ctlState.fileIdentity,
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
                            {fileUploader.speed}
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
            else if (fileUploader.previewUrl && fileUploader.fileProfile.type.indexOf('image/') != -1) {
                iconElem = <img className='border' style={{ width: '3em', height: '3em' }} src={fileUploader.previewUrl} />
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
            this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code, uploader.fileProfile.identity);
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

    addFileList(files) {
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

    clickQRCodehandler(ev) {
        var qrUploader;
        var self = this;
        var clickCloseAct = () => {
            removeFixedItem(qrUploader);
        };
        var uploaders = this.props.uploaders;
        var newuploaders = uploaders ? uploaders.concat() : [];
        var uploaded = (files_arr) => {
            newuploaders = newuploaders.concat();
            files_arr.forEach(fileRecord => {
                var fileUploader = new FileUploader();
                fileUploader.state = EFileUploaderState.COMPLETE;
                fileUploader.previewUrl = fileRecord.文件路径;
                fileUploader.fileProfile = {
                    name: fileRecord.文件名称,
                    size: fileRecord.文件大小,
                    type: fileRecord.文件类型,
                    code: fileRecord.文件上传记录代码,
                };
                fileUploader.file = {
                    name: fileRecord.文件名称,
                    size: fileRecord.文件大小,
                };
                newuploaders.push(fileUploader);
                fileRecord.fileUploader = fileUploader;
            });
            setTimeout(() => {
                store.dispatch(makeAction_setManyStateByPath({
                    uploaders: newuploaders,
                    invalidInfo: null,
                }, this.props.fullPath));

                files_arr.forEach(fileRecord => {
                    self.uploaderJobDone(fileRecord.fileUploader);
                });
            }, 200);
        };
        var qrUploader = <ERPC_QRCodeUploader multiMode={true} key='qrcodeUploader' onClose={clickCloseAct} onUploaded={uploaded} />
        addFixedItem(qrUploader);
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

    dragenter(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        var items = ev.dataTransfer.items;
        var isGood = false;
        if (items) {
            for (var i = 0; i < items.length; ++i) {
                var item = items[i];
                if (item.kind == 'file') {
                    isGood = true;
                    break;
                }
            }
        }
        this.setState({
            dragstate: isGood ? 'good' : 'bad'
        });
    }

    dragleave(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate: null
        });
    }

    drop(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        this.setState({
            dragstate: null
        });
        this.addFileList(ev.dataTransfer.files);
    }

    dragOver(ev) {
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
                    {isMobile ? null : <button className='btn btn-link btn-sm' onClick={this.clickQRCodehandler}><i className='fa fa-qrcode' />扫码上传</button>}
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
        var fileName = this.props.fileName;
        if(fileName == null){
            fileName = "";
        }
        if(this.props.filePath == null || this.props.filePath.length == 0){
            contetnElem = <img className='w-100 h-100' src={window.location.origin + "/res/img/404.png"} />
        }
        else{
            var aidData = getRenderAidDataFromFileType(this.props.fileType);
            this.canPreview = aidData.canPreview;
            this.fileType = aidData.fileType;
            var contetnElem = null;
            var iconSize = this.props.iconSize ? this.props.iconSize : "6.5em";
            if (aidData.fileType == 'image') {
                contetnElem = <img className='w-100 h-100' src={window.location.origin + this.props.filePath} onClick={this.clickIconHandler} />
            }
            else if (aidData.fileType == 'audio') {
                contetnElem = [
                    <audio key='audio' ref={this.audioTagRef} src={window.location.origin + this.props.filePath} />,
                    <i key='icon' style={{fontSize:iconSize}} className={'fa ' + aidData.fileIconType} onClick={this.clickIconHandler} />
                ];
            }
            else {
                if(this.fileType == "dwg" || fileName.indexOf(".dwg") != -1){
                    contetnElem = <img className='w-100 h-100' src={window.location.origin + "/res/img/cad.png"} onClick={this.clickIconHandler} />
                }
                else{
                    contetnElem = <i style={{fontSize:iconSize}} onClick={this.clickIconHandler} className={'fa ' + aidData.fileIconType} />
                }
            }
        }
        
        if (fileName.length > 15) {
            fileName = '...' + this.props.fileName.substr(-15);
        }
        var divClassName = 'filepreview ' + (this.props.className ? this.props.className : '');
        return <div className={divClassName} fixedsize={this.props.fixedsize} style={this.props.style}>
            {contetnElem}
            {
                this.props.hidetitle ? null :
                    <div id='name'>
                        {fileName}
                    </div>
            }
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

var ERP_Form_ShowData_RowHeight = 50;
class ERP_Form_ShowData extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPC_GridForm(this);
        this.tableBodyScroll = this.tableBodyScroll.bind(this);
        this.headtableStyle = { "marginBottom": "0px", width: '40em', "tableLayout": "fixed" };
        this.state = {
            percent: 0,
        };
    }
    render() {
        var percent = this.state.percent;
        var totalHeight = this.props.records_arr.length * ERP_Form_ShowData_RowHeight;
        var needShowHeight = Math.round((1.0 - percent) * totalHeight);
        var topBlankHeight = totalHeight - needShowHeight;
        var baseIndex = Math.floor(1.0 * topBlankHeight / ERP_Form_ShowData_RowHeight);
        var startIndex = baseIndex - 30;
        if (startIndex < 0) {
            startIndex = 0;
        }
        var endIndex = baseIndex + 29;
        if (endIndex > this.props.records_arr.length) {
            endIndex = this.props.records_arr.length;
        }
        this.startIndex = startIndex;
        return (
            <div ref={this.rootRef} className='flex-grow-1 flex-shrink-1 d-flex erp-form flex-column ' >
                {this.props.title && <div className='bg-dark text-light justify-content-start d-flex flex-shrink-0 p-1'><span>{this.props.title}{this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null}</span></div>}
                <div id={this.props.fullPath + 'tableheader'} className='mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv'>
                    <table className='table' style={this.headtableStyle}>
                        <ERP_Form_ShowData_THead headers={this.props.headers} />
                    </table>
                </div>
                <div id={this.props.fullPath + 'scroller'} onScroll={this.tableBodyScroll} className='mw-100 autoScroll'>
                    <ERP_Form_TBody fullPath={this.props.fullPath} form={this} headers={this.props.headers} records_arr={this.props.records_arr} startIndex={startIndex} endIndex={endIndex} />
                </div>
            </div>);
    }
    tableBodyScroll(ev) {
        if (this.memScrollTop) {
            document.getElementById(this.props.fullPath + 'scroller').scrollTop = this.memScrollTop;
            this.memScrollTop = null;
            return;
        }
        document.getElementById(this.props.fullPath + 'tableheader').scrollLeft = ev.target.scrollLeft;

        var scrollPercent = ev.target.scrollTop / ev.target.scrollHeight;
        var changeSize = Math.abs(scrollPercent - this.state.percent) * ev.target.scrollHeight;
        if (changeSize > ERP_Form_ShowData_RowHeight * 3) {
            this.memScrollTop = ev.target.scrollTop;
            console.log('fresh');
            this.setState({
                percent: scrollPercent,
            });
        }
    }
}

class ERP_Form_ShowData_THead extends React.PureComponent {
    constructor(props) {
        super(props);
        this.headstyle0 = { "width": "10em", "maxWidth": "10em", "minWidth": "10em", "whiteSpace": "nowrap", "overflow": "hidden" };
    }
    render() {
        var retElem = null;
        var ths_arr = this.props.headers.map((item, index) => {
            return <th key={'col' + index} style={this.headstyle0}>
                {item}
            </th>
        });

        return (<thead className="thead-light"><tr>
            <th scope='col' className='indexTableHeader'>序号</th>
            {ths_arr}
        </tr></thead>);
    }
}

class ERP_Form_TBody extends React.PureComponent {
    constructor(props) {
        super(props);
        this.tdStyle = { "width": "10em", "verticalAlign": "middle", "height": '' + ERP_Form_ShowData_RowHeight + 'px', "overflow": 'hidden', "whiteSpace": 'nowrap' };
        this.tableStyle = { "marginTop": "-50px", width: '40em', "tableLayout": "fixed" };
    }
    render() {
        var trElems_arr = [];
        var formProp = this.props.form.props;
        var records_arr = this.props.records_arr;
        var headers = this.props.headers;
        trElems_arr.push(<tr style={{ 'height': (this.props.startIndex * ERP_Form_ShowData_RowHeight) + 'px' }} key='extra_row_top' id='extra_row_top' />);
        for (var rowIndex = this.props.startIndex; rowIndex < this.props.endIndex; ++rowIndex) {
            var rowRecord = records_arr[rowIndex];
            var rowkey = rowIndex;
            trElems_arr.push(
                <tr rowkey={rowkey} key={rowIndex - this.props.startIndex}>
                    <td className='indexTableHeader'>{rowIndex + 1}</td>
                    {
                        headers.map((item, index) => {
                            return <td key={'col' + index} style={this.tdStyle}>
                                <span >{rowRecord[item]}</span>
                            </td>
                        })
                    }
                </tr>);
        }
        trElems_arr.push(<tr style={{ 'height': ((records_arr.length - this.props.endIndex) * ERP_Form_ShowData_RowHeight) + 'px' }} key='extra_row_bottom' id='extra_row_bottom' />);
        return (<table className='table table-striped table-hover ' style={this.tableStyle}>
            <ERP_Form_ShowData_THead form={this.props.form} headers={this.props.headers} />
            <tbody>{trElems_arr}</tbody>
        </table>);
    }

}

class ERPC_ExcelImporter extends React.PureComponent {
    constructor(props) {
        super();

        this.state = {
            f_name: '未选择文件',
        };
        autoBind(this);
        this.fileTagRef = React.createRef();
        this.btnTagRef = React.createRef();
    }

    componentWillMount() {
        var self = this;
        document.addEventListener('paste', this.pasteLinstener);
        setTimeout(() => {
            if (self.btnTagRef.current) {
                //self.btnTagRef.current.click();
            }
        }, 500);
    }

    componentWillUnmount() {
        document.removeEventListener('paste', this.pasteLinstener)
    }

    pasteLinstener(ev) {
        var ttext = ev.clipboardData.getData('text/plain');
        this.importFromText(ttext);
    }

    fileSelectedHandler(ev) {
        if (ev.target.files.length > 1) {
            SendToast('只能选一个文件');
            return;
        }
        var theFile = ev.target.files[0];
        var uploader = new FileUploader();
        this.setState({
            f_name: theFile.name,
            theFile: theFile,
            uploader: uploader,
        });

        uploader.uploadFile(theFile, this.uploaderJobDone);
    }

    uploaderJobDone(uploader) {
        this.setState({
            f_identity: uploader.fileProfile.identity,
            reading: true,
        });
        var self = this;
        var processKey = null;
        var queryProcess = (state, ret_data, ret_err) => {
            if (ret_data != null || ret_err != null) {
                if (ret_data) {
                    if (ret_data.rows == null || ret_data.rows.length == 0) {
                        ret_data = null;
                        ret_err = { info: '这是个空白的Excel文档' };
                    }
                }
                self.setState({
                    error: ret_err,
                    data: ret_data,
                    reading: false,
                });
                return;
            }
            setTimeout(() => {
                store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { key: processKey }, action: 'queryLongProcessResult', }, makeFTD_Callback(queryProcess)));
            }, 1000);
        };

        store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { fileIdentity: uploader.fileProfile.identity }, action: 'readExcelContent' },
            makeFTD_Callback((state, key, error) => {
                if (error) {
                    setTimeout(() => {
                        self.setState({
                            error: error,
                            reading: false,
                        });
                    }, 200);
                    return;
                }
                processKey = key;
                queryProcess(null, null, null);
            }, false)));
    }

    plusClickHandler(ev) {
        if (this.fileTagRef.current) {
            this.fileTagRef.current.click();
        }
    }

    cancelClickHandler(ev) {
        this.props.callback(false);
    }

    confirmClickHandler(ev) {
        this.props.callback(true, this.state.data.rows, this.state.data.headers);
    }

    importFromClipboard(ev) {
        if (window.clipboardData == null) {
            SendToast('请直接用"ctl + v"快捷键来黏贴数据', EToastType.Info, EToastTime.Small);
            return;
        }
        var clipText = window.clipboardData.getData("text");
        this.importFromText(clipText);
    }

    clearData() {
        var nowData = this.state.data;
        this.setState({
            error: null,
            data: null,
        });
    }

    importFromText(text) {
        if (this.state.reading) {
            return;
        }
        var self = this;
        var nowData = this.state.data;
        text = text.replace(/\n\r/g, '\n');
        text = text.replace(/\r/g, '');
        var data = {};
        let rows_arr = text.split("\n");//.map(x => { return x.trim(); }).filter(x => { return x.length > 0 });
        var hreaders_arr = [];
        var items_arr = [];
        if (rows_arr.length == 0) {
            SendToast('数据无效', EToastType.Error, EToastTime.Small);
            return;
        }

        if (nowData) {
            hreaders_arr = nowData.headers;
            if (rows_arr[0].split("\t").length != hreaders_arr.length) {
                SendToast('追加数据列数必须和现有的相同', EToastType.Error, EToastTime.Small);
                return;
            }
        }

        self.setState({
            reading: true,
        });
        var row_i = -1;
        var processEndFun = () => {
            var rlt = {
                rows: items_arr,
                headers: hreaders_arr
            }
            var newData = nowData;
            if (items_arr.length > 0) {
                if (nowData) {
                    newData = {
                        rows: nowData.rows.concat(items_arr),
                        headers: nowData.headers
                    };
                    SendToast(items_arr.length + '条数据已追加', EToastType.Info, EToastTime.Small);
                }
                else {
                    newData = rlt
                    SendToast(items_arr.length + '条数据已导入', EToastType.Info, EToastTime.Small);
                }
                self.setState({
                    error: null,
                    data: newData,
                    reading: false,
                });
            }
            else {
                if (nowData) {
                    SendToast(items_arr.length + '条数据被追加', EToastType.Info, EToastTime.Small);
                }
                else {
                    newData = rlt
                    SendToast(items_arr.length + '条数据被导入', EToastType.Info, EToastTime.Small);
                }
                self.setState({
                    reading: false,
                    readingInfo: null,
                });
            }
        }
        var startTime = new Date().getTime();
        var processFun = () => {
            ++row_i;
            if (row_i >= rows_arr.length) {
                processEndFun();
                return;
            }
            self.setState({
                readingInfo: '进度:' + (row_i) + '/' + rows_arr.length,
            });
            var rowStr = rows_arr[row_i];
            let cols_arr = rowStr.split("\t").map(x => { return x.trim(); });
            if (row_i == 0) {
                if (nowData) {
                    var allHit = true;
                    for (var i = 0; i < nowData.headers.length; ++i) {
                        if (cols_arr.indexOf(nowData.headers[i]) == -1) {
                            allHit = false;
                            break;;
                        }
                    }
                    if (allHit) {
                        cols_arr = null;
                    }
                }
                else {
                    hreaders_arr = cols_arr;
                    cols_arr = null;;
                }
            }
            if (cols_arr) {
                if (cols_arr.length == hreaders_arr.length) {
                    var item = {};
                    hreaders_arr.forEach((header, header_i) => {
                        item[header] = cols_arr[header_i];
                    });
                    items_arr.push(item);
                }
            }
            var nowTime = new Date().getTime();
            if ((nowTime - startTime) > 3000) {
                startTime = new Date().getTime();
                setTimeout(processFun, 100);
            }
            else {
                processFun();
            }
        }
        setTimeout(processFun, 100);
    }

    renderData() {
        var data = this.state.data;
        var bottomElem = null;
        if (this.state.reading) {
            bottomElem = <span><i className='fa fa-circle-o-notch fa-spin border' />{this.state.readingInfo ? this.state.readingInfo : '正在解析'}</span>
        }
        else {
            bottomElem = <React.Fragment>
                <button type='button' className='btn btn-primary' onClick={this.confirmClickHandler}>确认上传</button>
                <button type='button' className='btn btn-primary ml-1' onClick={this.importFromClipboard}>从剪贴板追加</button>
                <button type='button' className='btn btn-danger ml-1' onClick={this.cancelClickHandler}>取消上传</button>
                <button type='button' className='btn btn-danger ml-1' onClick={this.clearData}>清空数据</button>
            </React.Fragment>
        }
        return  <div className='d-fixed w-100 h-100 fixedBackGround'>
            <div className='w-100 h-100 d-flex p-3 flex-column align-items-center justify-content-center'>
                <div className='bg-light border d-flex flex-column p-1 rounded' style={{ maxWidth: '95%', maxHeight: '95%' }}>
                    <ERP_Form_ShowData id='dataform' parentPath='excelimporter' fullPath='excelimporter' pagebreak={false} selectMode='none' headers={data.headers} records_arr={data.rows} title={this.state.f_name} ></ERP_Form_ShowData>
                    <div className='d-flex justify-content-center flex-grow-0 flex-shrink-0 border-top p-1'>
                        {bottomElem}
                    </div>
                </div>
            </div>
        </div>;
    }

    render() {
        if (this.state.data) {
            return this.renderData();
        }
        var uploaderElem = null;
        var uploader = this.state.uploader;
        var selectorElem = null;
        if (this.state.uploader) {
            uploaderElem = <div d-fkey={uploader.file.name + uploader.file.size} className='flex-grow-0 flex-shrink-0'>
                <CFileUploaderBar uploader={uploader} />
            </div>
        }
        else {
            selectorElem = <div className='d-flex align-items-center border p-1' >
                <span className='flex-grow-1 flex-shrink-1 hidenOverflow mr-1'>{this.state.f_name}</span>
                <div className='btn-group flex-grow-0 flex-shrink-0'>
                    <button ref={this.btnTagRef} className={'btn btn-sm btn-primary' + (uploader ? ' d-none' : '')} onClick={this.plusClickHandler}>选择文件</button>
                    <button className={'btn btn-sm btn-danger' + (uploader ? ' d-none' : '')} onClick={this.cancelClickHandler}>取消上传</button>
                    <button type='button' className='btn btn-primary btn-sm' onClick={this.importFromClipboard}>从剪贴板导入</button>
                </div>
            </div>
        }
        return  <div className='d-fixed w-100 h-100 fixedBackGround'>
            <div className='card excelimporter'>
                <input id={this.props.id + '_file'} onChange={this.fileSelectedHandler} ref={this.fileTagRef} type='file' className='d-none' accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
                <div className='card-body'>
                    <div className='card-title'><h5>{this.props.title}</h5></div>
                    {selectorElem}
                    {uploaderElem}
                    {this.state.reading ? <span><i className='fa fa-circle-o-notch fa-spin' />{this.state.readingInfo ? this.state.readingInfo : '正在解析Excel内容'}</span> : null}
                    {this.state.error ? <div className='d-flex flex-column flex-grow-1 flex-shrink-1'>
                        <span className='text-danger flex-grow-1 flex-shrink-1'><i className='fa fa-warning' />{this.state.error.info}</span>
                        <span className='d-flex justify-content-center flex-grow-0 flex-shrink-0'>
                            <button className='btn btn-sm btn-danger' onClick={this.cancelClickHandler}>取消操作</button>
                        </span>
                    </div> : null}
                </div>
            </div>
        </div>
    }
}

function ERPC_ExcelImporter_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;

    return {
        title: IsEmptyString(ownprops.title) ? '上传Excel' : ownprops.title,
    };
}

function ERPC_ExcelImporter_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_MultiFileUploader = null;
var VisibleERPC_FilePreview = null;
var VisibleERPC_SingleFileUploader = null;
var VisibleERPC_ExcelImporter = null;
var VisibleERP_Form_ShowData = null;

gNeedCallOnErpControlInit_arr.push(() => {
    VisibleERPC_MultiFileUploader = ReactRedux.connect(ERPC_MultiFileUploader_mapstatetoprops, ERPC_MultiFileUploader_dispatchtorprops)(ERPC_MultiFileUploader);
    VisibleERPC_FilePreview = ReactRedux.connect(ERPC_FilePreview_mapstatetoprops, ERPC_FilePreview_dispatchtorprops)(ERPC_FilePreview);
    VisibleERPC_SingleFileUploader = ReactRedux.connect(ERPC_SingleFileUploader_mapstatetoprops, ERPC_SingleFileUploader_dispatchtorprops)(ERPC_SingleFileUploader);
    VisibleERPC_ExcelImporter = ReactRedux.connect(ERPC_ExcelImporter_mapstatetoprops, ERPC_ExcelImporter_dispatchtorprops)(ERPC_ExcelImporter);
});


function guid2() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}