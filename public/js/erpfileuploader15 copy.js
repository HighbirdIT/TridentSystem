'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fileSystemUrl = '/fileSystem';

var EAcceptFileType = {
    All: 1,
    Image: 2,
    Vedio: 3,
    Excel: 4,
    Word: 5,
    PDF: 6,
    ImageVedio: 7
};

var FileAcceptStr = {};
FileAcceptStr[EAcceptFileType.All] = '*/*';
FileAcceptStr[EAcceptFileType.Image] = 'iamge/*';
FileAcceptStr[EAcceptFileType.Vedio] = 'vedio/*';
FileAcceptStr[EAcceptFileType.Excel] = 'application/msexcel,application/vnd.openxmlformats-officedocument.spre,application/vnd.ms-excel';
FileAcceptStr[EAcceptFileType.Word] = 'application/msword,application/vnd.openxmlformats-officedocument.word';
FileAcceptStr[EAcceptFileType.PDF] = 'application/pdf';
FileAcceptStr[EAcceptFileType.ImageVedio] = 'iamge/*,vedio/*';

var EFileUploaderState = {
    WAITFILE: 'waitfile',
    READING: 'reading',
    PREPARE: 'prepare',
    CALMD5: 'calmd5',
    UPLOADING: 'uploading',
    COMPLETE: 'complete',
    BEFOREEND: 'beforeend'
};

var EFileSystemError = {
    WRONGSTART: 1001,
    UPLOADCOMPLATE: 1002,
    EMPTYDATA: 1003,
    DATATOOLONG: 1004,
    FILELOCKED: 1005
};

function ResetMFileUploader(path) {
    var state = store.getState();
    var ctlState = getStateByPath(state, path, {});
    if (ctlState.uploaders && ctlState.uploaders.length > 0) {
        ctlState.uploaders.forEach(function (uploader) {
            uploader.reset();
        });
        setTimeout(function () {
            store.dispatch(makeAction_setManyStateByPath({
                uploaders: [],
                invalidInfo: null
            }, path));
        }, 20);
    }
}

function ResetSFileUploader(path) {
    var state = store.getState();
    var ctlState = getStateByPath(state, path, {});
    if (ctlState.uploader && ctlState.uploader.fileProfile) {
        ctlState.uploader.reset();
        setTimeout(function () {
            store.dispatch(makeAction_setManyStateByPath({
                invalidInfo: null
            }, path));
        }, 20);
    }
}

function DataSizeToString(size) {
    var kbsize = Math.round(size / 1024);
    var sizeStr = '';
    if (kbsize < 1000) {
        sizeStr = kbsize + 'KB';
    } else {
        var mbsize = Math.round(10 * kbsize / 1024) / 10.0;
        if (mbsize < 1000) {
            sizeStr = mbsize + 'MB';
        } else {
            var gbsize = Math.round(10 * kbsize / 1024) / 10.0;
            sizeStr = gbsize + 'GB';
        }
    }
    return sizeStr;
}

var gByteToHex = [];
for (var n = 0; n <= 0xff; ++n) {
    gByteToHex.push(n.toString(16).padStart(2, "0"));
}

var MAXPERBLOCKSIZE = 1024 * 1024 * 1;
var MINPERBLOCKSIZE = 1024 * 500;
var STEP_BLOCKSIZE = 1024 * 200;

var FileUploader = function (_EventEmitter) {
    _inherits(FileUploader, _EventEmitter);

    function FileUploader() {
        _classCallCheck(this, FileUploader);

        var _this = _possibleConstructorReturn(this, (FileUploader.__proto__ || Object.getPrototypeOf(FileUploader)).call(this));

        _this.state = EFileUploaderState.WAITFILE;
        _this.myBlockMaxSize = MINPERBLOCKSIZE;
        autoBind(_this);
        return _this;
    }

    _createClass(FileUploader, [{
        key: 'reset',
        value: function reset() {
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
    }, {
        key: 'uploadFile',
        value: function uploadFile(theFile, uploadedCallBack) {
            var self = this;
            this.fileProfile = {
                name: theFile.name,
                size: theFile.size,
                type: theFile.type
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
                imgReader.onload = function (ev) {
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
    }, {
        key: 'pause',
        value: function pause() {
            this.isPause = true;
            this._fireChanged();
            console.log('pause');
        }
    }, {
        key: 'resume',
        value: function resume() {
            console.log('resume');
            this.isPause = false;
            this._fireChanged();
            if (!self.uploading) {
                this._uploadData();
            }
        }
    }, {
        key: '_prepare',
        value: function _prepare() {
            var theFile = this.file;
            var bundle = {
                name: theFile.name,
                size: theFile.size,
                type: theFile.type,
                md5: this.fileProfile.md5 == null ? '' : this.fileProfile.md5
            };
            this.sizeStr = DataSizeToString(theFile.size);
            var self = this;
            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'applyForTempFile' }, makeFTD_Callback(function (state, data, error) {
                if (self.fileProfile == null) {
                    console.log('上传器被删除');
                    return;
                }
                if (error) {
                    self.meetError(error);
                    return;
                } else {
                    self.fileProfile.identity = data.identity;
                    self.fileProfile.code = data.code;
                    self.changeState(EFileUploaderState.UPLOADING);
                    setTimeout(function () {
                        self._uploadData();
                    }, 20);
                }
            }, false)));
            if (this.errorCode) {
                this.errorCode = 0;
                this._fireChanged();
            }
        }
    }, {
        key: '_uploadData',
        value: function _uploadData() {
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
                this.hexWorker.onmessage = function (ev) {
                    var bundle = {
                        fileIdentity: self.fileProfile.identity,
                        data: ev.data,
                        startPos: self.startPos,
                        fileFlow: self.fileFlow,
                        relrecordid: self.relrecordid
                    };
                    store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'uploadBlock' }, makeFTD_Callback(function (state, data, error, fetchUseTime) {
                        setTimeout(function () {
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
                                setTimeout(function () {
                                    self._fireChanged();
                                    self._uploadData();
                                }, 20);
                            } else {
                                var thisUploadUseTime = new Date().getTime() - self.uploadingStartTime;
                                self.evalSize += data.bytesWritten;
                                self.evalTime += thisUploadUseTime;
                                if (self.evalTime > 1000) {
                                    self.speed = DataSizeToString(Math.round(1000.0 * self.evalSize / self.evalTime)) + '/s';
                                    self.evalSize = 0;
                                    self.evalTime = 0;
                                }
                                //console.log('fetchUseTime:' + fetchUseTime + '  blksize:' + self.myBlockMaxSize);
                                if (fetchUseTime < 200) {
                                    self.myBlockMaxSize = Math.min(self.myBlockMaxSize + STEP_BLOCKSIZE, MAXPERBLOCKSIZE);
                                } else if (fetchUseTime > 300) {
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
                                setTimeout(function () {
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
                blockreader.onerror = function () {
                    blockreader.abort();
                    if (self.fileProfile == null) {
                        console.log('上传器被删除');
                        return;
                    }
                    setTimeout(function () {
                        self._uploadData();
                    }, 1000);
                };
                blockreader.onload = function (ev) {
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
    }, {
        key: 'meetError',
        value: function meetError(err) {
            this.errorCode = isNaN(err.code) ? 1 : err.code;
            this.errorMsg = err.info;
            this._fireChanged();
        }
    }, {
        key: 'changeState',
        value: function changeState(newState) {
            this.state = newState;
            this.errorCode = 0;
            this.errorMsg = null;
            if (newState == EFileUploaderState.UPLOADING) {
                this.percent = 0;
            } else if (newState == EFileUploaderState.COMPLETE) {
                if (this.hexWorker) {
                    this.hexWorker.terminate();
                    this.hexWorker = null;
                    console.log('hexWorker 已终止');
                }
            }
            this._fireChanged();
        }
    }, {
        key: '_fireChanged',
        value: function _fireChanged() {
            this.emit('changed');
        }
    }]);

    return FileUploader;
}(EventEmitter);

var FileUploaderManager = function () {
    function FileUploaderManager() {
        _classCallCheck(this, FileUploaderManager);

        this.uploader_map = {};
    }

    _createClass(FileUploaderManager, [{
        key: 'getUploader',
        value: function getUploader(key) {
            if (IsEmptyString(key)) {
                return null;
            }
            return this.uploader_map[key];
        }
    }, {
        key: 'createUploader',
        value: function createUploader(key) {
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
    }]);

    return FileUploaderManager;
}();

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
            } else if (fileType == 'vnd.openxmlformats-officedocument.word' || fileType == 'msword') {
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
        fileType: fileType
    };
}

function gPreviewFile(name, fileType, url) {
    var aidData = getRenderAidDataFromFileType(fileType);
    fileType = aidData.fileType;
    if (isInDingTalk) {
        if (fileType == 'image') {
            dingdingKit.biz.util.previewImage({
                urls: [window.location.origin + url],
                current: window.location.origin + url
            });
        } else if (fileType == 'video' || fileType == 'movie') {
            if (isMobile) {
                dingdingKit.biz.util.openLink({
                    url: window.location.origin + '/videoplayer?src=' + url
                });
            } else {
                dingdingKit.biz.util.openModal({
                    url: window.location.origin + '/videoplayer?src=' + url,
                    title: name
                });
            }
        } else if (fileType == 'audio' || fileType == 'sound') {
            if (isMobile) {
                dingdingKit.biz.util.openLink({
                    url: window.location.origin + '/audioplayer?src=' + url
                });
            } else {
                dingdingKit.biz.util.openModal({
                    url: window.location.origin + '/audioplayer?src=' + url,
                    title: fileProfile.name
                });
            }
        } else {
            dingdingKit.biz.util.openLink({
                url: window.location.origin + url
            });
        }
    } else {
        SendToast('在钉钉中才可预览');
    }
}

var ERPC_SingleFileUploader = function (_React$PureComponent) {
    _inherits(ERPC_SingleFileUploader, _React$PureComponent);

    function ERPC_SingleFileUploader(props) {
        _classCallCheck(this, ERPC_SingleFileUploader);

        var _this2 = _possibleConstructorReturn(this, (ERPC_SingleFileUploader.__proto__ || Object.getPrototypeOf(ERPC_SingleFileUploader)).call(this));

        autoBind(_this2);
        _this2.state = {
            loading: false
        };
        _this2.fileTagRef = React.createRef();
        return _this2;
    }

    _createClass(ERPC_SingleFileUploader, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'listenUploader',
        value: function listenUploader(uploader) {
            if (uploader) {
                uploader.on('changed', this.reDraw);
            }
            this.uploader = uploader;
        }
    }, {
        key: 'unlistenUploader',
        value: function unlistenUploader(uploader) {
            if (uploader) {
                uploader.off('changed', this.reDraw);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.unmounted = false;
            if (this.props.uploader == null) {
                var newUploader = new FileUploader();
                this.listenUploader(newUploader);
                store.dispatch(makeAction_setManyStateByPath({
                    uploader: newUploader
                }, this.props.fullPath));
            } else {
                this.listenUploader(this.props.uploader);
            }
        }
    }, {
        key: 'synRecordInfo',
        value: function synRecordInfo() {
            var _this3 = this;

            var bundle = {
                attachmentID: this.props.defattachmentID,
                fileFlow: this.props.fileflow,
                relrecordid: this.props.relrecordid,
                fileIdentity: this.props.fileIdentity
            };
            var self = this;
            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'getFileRecord' }, makeFTD_Callback(function (state, data, error) {
                var fileRecord = {
                    fileID: data ? data.文件上传记录代码 : null,
                    attachmentID: data ? data.附件记录代码 : null,
                    fileFlow: data ? data.归属流程代码 : bundle.fileFlow,
                    relrecordid: data ? data.关联记录代码 : bundle.relrecordid,
                    fileName: data ? data.文件名称 : null,
                    fileSize: data ? data.文件大小 : null,
                    type: data ? data.文件类型 : null,
                    url: data ? data.文件路径 : null
                };
                setTimeout(function () {
                    if (self.props.defattachmentID == bundle.attachmentID && self.props.fileflow == bundle.fileFlow && self.props.relrecordid == bundle.relrecordid && self.props.fileIdentity == bundle.fileIdentity) {
                        var needSetState = {
                            fileID: fileRecord.fileID,
                            attachmentID: fileRecord.attachmentID,
                            invalidInfo: null
                        };
                        if (data) {
                            if (bundle.attachmentID > 0) {
                                needSetState.fileFlow = fileRecord.fileFlow;
                                needSetState.relrecordid = fileRecord.relrecordid;
                            }
                        }
                        store.dispatch(makeAction_setManyStateByPath(needSetState, self.props.fullPath));

                        if (!_this3.unmounted) {
                            self.setState({
                                loading: false,
                                fileRecord: fileRecord
                            });
                        }
                    } else {
                        // 信息发生了更改，重新获取
                        console.log('信息发生了更改，重新获取');
                        if (!_this3.unmounted) {
                            self.setState({
                                loading: false
                            });
                        }
                    }
                }, 20);
            }, false)));
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unmounted = true;
            this.unlistenUploader(this.props.uploader);
        }
    }, {
        key: 'uploaderJobDone',
        value: function uploaderJobDone(uploader) {
            if (this.props.onuploadcomplete) {
                this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code, uploader.fileProfile.identity);
            }
            store.dispatch(makeAction_setManyStateByPath({
                invalidInfo: null,
                fileID: uploader.fileProfile.code,
                attachmentID: uploader.fileProfile.attachmentID
            }, this.props.fullPath));
        }
    }, {
        key: 'startUploadFile',
        value: function startUploadFile(theFile) {
            this.uploader.fileFlow = this.props.fileflow;
            this.uploader.relrecordid = this.props.relrecordid;
            this.uploader.definfo = {
                defattachmentID: this.props.defattachmentID,
                relrecordid: this.props.relrecordid,
                fileIdentity: this.props.fileIdentity
            };
            this.uploader.uploadFile(theFile, this.uploaderJobDone);
        }
    }, {
        key: 'fileSelectedHandler',
        value: function fileSelectedHandler(ev) {
            if (ev.target.files.length > 1) {
                SendToast('只能选一个文件');
                return;
            }
            var theFile = ev.target.files[0];
            this.startUploadFile(theFile);
            if (this.state.fileRecord) {
                this.setState({
                    fileRecord: Object.assign({}, this.state.fileRecord, { abandon: true })
                });
            }
        }
    }, {
        key: 'clickPlusHandler',
        value: function clickPlusHandler(ev) {
            if (this.fileTagRef.current) {
                this.fileTagRef.current.click();
            }
        }
    }, {
        key: 'clickContentHandler',
        value: function clickContentHandler(ev) {
            var uploader = this.props.uploader;
            if (uploader.fileProfile == null) {
                if (this.fileTagRef.current) {
                    this.fileTagRef.current.click();
                }
            }
        }
    }, {
        key: 'clickPreviewHandler',
        value: function clickPreviewHandler(ev) {
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
            } else if (this.state.fileRecord) {
                fileType = this.state.fileRecord.type;
                fileName = this.state.fileRecord.name;
                url = this.state.fileRecord.url;
            }
            gPreviewFile(fileName, fileType, url);
        }
    }, {
        key: 'alertErrorMsg',
        value: function alertErrorMsg() {
            var fileUploader = this.props.uploader;
            if (fileUploader && !IsEmptyString(fileUploader.errorMsg)) {
                alert(fileUploader.errorMsg);
            }
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler(ev) {
            var fileUploader = this.props.uploader;
            if (fileUploader && fileUploader.fileProfile) {
                var msg = PopMessageBox('', EMessageBoxType.Blank, '提示');
                msg.query('撤销当前文件"' + fileUploader.fileProfile.name + '"吗?', [{ label: '确认', key: '确认' }, { label: '算了', key: '算了' }], function (key) {
                    if (key == '确认') {
                        fileUploader.reset();
                    }
                });
            }
        }
    }, {
        key: 'wantChangeFile',
        value: function wantChangeFile() {
            var self = this;
            var msg = PopMessageBox('', EMessageBoxType.Blank, '提示');
            msg.query('重新选择一个文件替换"' + this.state.fileRecord.fileName + '"吗?', [{ label: '确认', key: '确认' }, { label: '算了', key: '算了' }], function (key) {
                if (key == '确认') {
                    self.clickPlusHandler();
                }
            });
        }
    }, {
        key: 'dragenter',
        value: function dragenter(ev) {
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
    }, {
        key: 'dragleave',
        value: function dragleave(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.setState({
                dragstate: null
            });
        }
    }, {
        key: 'drop',
        value: function drop(ev) {
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
    }, {
        key: 'dragOver',
        value: function dragOver(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

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
                iconElem = React.createElement('img', { className: 'border w-100 h-100 centerelem position-absolute', src: fileUploader.base64Data });
            }
            var fileName;
            var fileSize;
            if (fileUploader.fileProfile) {
                fileName = fileUploader.fileProfile.name;
                fileSize = fileUploader.fileProfile.size;
            }

            var invalidInfoElem = null;
            if (!IsEmptyString(this.props.invalidInfo)) {
                invalidInfoElem = React.createElement(
                    'span',
                    { className: 'bg-danger text-white' },
                    React.createElement('i', { className: 'fa fa-warning' }),
                    this.props.invalidInfo
                );
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
                    fileIdentity: this.props.fileIdentity
                };
                if (!ObjIsEqual(nowdefinfo, fileUploader.definfo)) {
                    setTimeout(function () {
                        fileUploader.reset();
                    }, 20);
                }
            }
            switch (fileUploader.state) {
                case EFileUploaderState.WAITFILE:
                    canDelete = false;
                    var fileRecord = this.state.fileRecord;
                    if (this.state.loading) {
                        contentElem = React.createElement(
                            'div',
                            { className: 'w-100 h-100' },
                            React.createElement(
                                'span',
                                { className: 'centerelem position-absolute text-nowrap bg-white' },
                                React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                '\u83B7\u53D6\u4E2D'
                            )
                        );
                    } else if (this.props.mode == 'direct') {
                        if (this.props.fileIdentity != null && this.props.fileIdentity.length == 36) {
                            if (fileRecord == null) {
                                setTimeout(function () {
                                    if (_this4.unmounted) {
                                        return;
                                    }
                                    self.setState({
                                        loading: true
                                    });
                                    self.synRecordInfo();
                                }, 20);
                                contentElem = React.createElement(
                                    'div',
                                    { className: 'w-100 h-100' },
                                    React.createElement(
                                        'span',
                                        { className: 'centerelem position-absolute text-nowrap bg-white' },
                                        React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                        '\u83B7\u53D6\u4E2D'
                                    )
                                );
                            } else {
                                if (fileRecord.fileName == null) {
                                    invalidInfoElem = React.createElement(
                                        'span',
                                        { className: 'bg-danger text-white' },
                                        React.createElement('i', { className: 'fa fa-warning' }),
                                        '\u6587\u4EF6\u4E0D\u5B58\u5728'
                                    );
                                } else {
                                    fileName = fileRecord.fileName;
                                    fileSize = fileRecord.size;
                                    var aidData = getRenderAidDataFromFileType(fileRecord.type);
                                    if (aidData.fileType == 'image') {
                                        iconElem = React.createElement('img', { className: 'w-100 h-100 centerelem position-absolute cursor_hand', src: fileRecord.url, onClick: this.wantChangeFile });
                                    } else {
                                        iconElem = React.createElement('i', { className: 'fa fa-5x centerelem position-absolute cursor_hand ' + aidData.fileIconType, onClick: this.wantChangeFile });
                                    }
                                    preViewBtn = React.createElement(
                                        'button',
                                        { onClick: this.clickPreviewHandler, type: 'button', className: 'btn btn-sm btn-primary' },
                                        React.createElement('i', { className: 'fa fa-' + (aidData.canPreview ? 'eye' : 'download') })
                                    );
                                    contentElem = React.createElement('span', null);
                                }
                            }
                        }
                    } else if ((this.props.defattachmentID > 0 || relrecordid != null) && (fileRecord == null || !fileRecord.abandon)) {
                        if (fileRecord == null || this.props.defattachmentID > 0 && fileRecord.attachmentID != this.props.defattachmentID || relrecordid != null && fileRecord.relrecordid != this.props.relrecordid) {
                            setTimeout(function () {
                                if (_this4.unmounted) {
                                    return;
                                }
                                self.setState({
                                    loading: true
                                });
                                self.synRecordInfo();
                            }, 20);
                            contentElem = React.createElement(
                                'div',
                                { className: 'w-100 h-100' },
                                React.createElement(
                                    'span',
                                    { className: 'centerelem position-absolute text-nowrap bg-white' },
                                    React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                    '\u83B7\u53D6\u4E2D'
                                )
                            );
                        } else {
                            if (fileRecord.fileName == null) {
                                if (this.props.defattachmentID > 0) {
                                    invalidInfoElem = React.createElement(
                                        'span',
                                        { className: 'bg-danger text-white' },
                                        React.createElement('i', { className: 'fa fa-warning' }),
                                        '\u6587\u4EF6\u4E0D\u5B58\u5728'
                                    );
                                }
                            } else {
                                fileName = fileRecord.fileName;
                                fileSize = fileRecord.size;
                                var aidData = getRenderAidDataFromFileType(fileRecord.type);
                                if (aidData.fileType == 'image') {
                                    iconElem = React.createElement('img', { className: 'w-100 h-100 centerelem position-absolute cursor_hand', src: fileRecord.url, onClick: this.wantChangeFile });
                                } else {
                                    iconElem = React.createElement('i', { className: 'fa fa-5x centerelem position-absolute cursor_hand ' + aidData.fileIconType, onClick: this.wantChangeFile });
                                }
                                preViewBtn = React.createElement(
                                    'button',
                                    { onClick: this.clickPreviewHandler, type: 'button', className: 'btn btn-sm btn-primary' },
                                    React.createElement('i', { className: 'fa fa-' + (aidData.canPreview ? 'eye' : 'download') })
                                );
                                contentElem = React.createElement('span', null);
                            }
                        }
                    }
                    if (contentElem == null) {
                        if (this.props.mode != 'direct' && !(relrecordid != null && this.props.fileflow > 0)) {
                            contentElem = React.createElement(
                                'div',
                                { className: 'w-100 h-100' },
                                React.createElement(
                                    'span',
                                    { className: 'centerelem position-absolute pointerevent-none' },
                                    React.createElement(
                                        'div',
                                        { className: 'text-danger text-nowrap' },
                                        React.createElement('i', { className: 'fa fa-warning' }),
                                        '\u9700\u8981FR'
                                    )
                                )
                            );
                        } else {
                            contentElem = React.createElement(
                                'div',
                                { className: 'flex-grow-1 flex-shrink-1 cursor_hand', onClick: this.clickPlusHandler, onDragEnter: this.dragenter, onDragLeave: this.dragleave, onDrop: this.drop, onDragOver: this.dragOver },
                                React.createElement(
                                    'span',
                                    { className: 'centerelem position-absolute pointerevent-none' },
                                    React.createElement(
                                        'div',
                                        { className: 'text-nowrap' },
                                        React.createElement('i', { className: 'fa fa-mouse-pointer' }),
                                        '\u4E0A\u4F20\u6587\u4EF6'
                                    ),
                                    isMobile ? null : React.createElement(
                                        'div',
                                        { className: 'text-nowrap' },
                                        React.createElement('i', { className: 'fa fa-hand-rock-o' }),
                                        '\u62D6\u62FD\u6587\u4EF6'
                                    )
                                )
                            );
                        }
                    }
                    break;
                case EFileUploaderState.READING:
                    if (fileUploader.errorCode > 0) {
                        childElem = React.createElement(
                            'button',
                            { className: 'btn btn-danger btn-sm centerelem position-absolute', onClick: this.alertErrorMsg },
                            '\u8BFB\u53D6\u51FA\u9519'
                        );
                    } else {
                        childElem = React.createElement(
                            'span',
                            { className: 'centerelem position-absolute text-nowrap bg-white' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            '\u8BFB\u53D6\u4E2D'
                        );
                    }
                    contentElem = React.createElement(
                        'div',
                        { className: 'w-100 h-100' },
                        childElem
                    );
                    break;
                case EFileUploaderState.PREPARE:
                    if (fileUploader.errorCode > 0) {
                        childElem = React.createElement(
                            'span',
                            { className: 'centerelem position-absolute btn-group' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-danger btn-sm', onClick: this.alertErrorMsg },
                                '\u51FA\u9519\u4E86'
                            ),
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary btn-sm', onClick: this.reTryPrepare },
                                React.createElement('i', { className: 'fa fa-refresh' })
                            )
                        );
                    } else {
                        childElem = React.createElement(
                            'span',
                            { className: 'centerelem position-absolute text-nowrap bg-white' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            '\u521B\u5EFA\u4E2D'
                        );
                    }
                    contentElem = React.createElement(
                        'div',
                        { className: 'w-100 h-100' },
                        childElem
                    );
                    break;
                case EFileUploaderState.CALMD5:
                    contentElem = React.createElement(
                        'div',
                        { className: 'w-100 h-100' },
                        React.createElement(
                            'span',
                            { className: 'centerelem position-absolute text-nowrap bg-white' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            '\u5206\u6790\u4E2D'
                        )
                    );
                    break;
                case EFileUploaderState.UPLOADING:
                    if (fileUploader.errorCode > 0) {
                        childElem = React.createElement(
                            'span',
                            { className: 'centerelem position-absolute btn-group' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-danger btn-sm', onClick: this.alertErrorMsg },
                                '\u51FA\u9519\u4E86'
                            ),
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary btn-sm', onClick: this.reTryUpload },
                                React.createElement('i', { className: 'fa fa-refresh' })
                            )
                        );
                    } else {
                        childElem = React.createElement(
                            'div',
                            { className: 'centerelem position-absolute text-nowrap bg-white' },
                            React.createElement(
                                'div',
                                null,
                                React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                fileUploader.percent,
                                '%'
                            ),
                            React.createElement(
                                'div',
                                null,
                                fileUploader.speed
                            )
                        );
                    }
                    contentElem = React.createElement(
                        'div',
                        { className: 'w-100 h-100' },
                        childElem
                    );
                    break;
                case EFileUploaderState.COMPLETE:
                    var aidData = getRenderAidDataFromFileType(fileUploader.fileProfile.type);
                    if (iconElem == null) {
                        iconElem = React.createElement('i', { className: 'fa fa-5x centerelem position-absolute ' + aidData.fileIconType });
                    }
                    preViewBtn = React.createElement(
                        'button',
                        { onClick: this.clickPreviewHandler, type: 'button', className: 'btn btn-sm btn-primary' },
                        React.createElement('i', { className: 'fa fa-' + (aidData.canPreview ? 'eye' : 'download') })
                    );
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
            return React.createElement(
                'div',
                { className: className, style: this.props.style, fixedsize: this.props.fixedsize },
                React.createElement('input', { onChange: this.fileSelectedHandler, ref: this.fileTagRef, type: 'file', className: 'd-none', accept: '*/*,image/*' }),
                React.createElement(
                    'span',
                    { id: 'title', className: 'flex-grow-0 flex-shrink-0 wb-all' },
                    this.props.title
                ),
                React.createElement(
                    'div',
                    { id: 'content', className: 'fileuploadersingle-content', dragstate: this.state.dragstate },
                    iconElem,
                    contentElem,
                    React.createElement(
                        'div',
                        { id: 'toolbar', className: 'btn-group' },
                        preViewBtn,
                        canDelete ? React.createElement(
                            'button',
                            { onClick: this.clickTrashHandler, type: 'button', className: 'btn btn-sm btn-danger' },
                            React.createElement('i', { className: 'fa fa-trash' })
                        ) : null
                    )
                ),
                React.createElement(
                    'div',
                    { id: 'name' },
                    invalidInfoElem,
                    fileName
                )
            );
        }
    }]);

    return ERPC_SingleFileUploader;
}(React.PureComponent);

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
        fileIdentity: ctlState.fileIdentity
    };
}

function ERPC_SingleFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var CFileUploaderBar = function (_React$PureComponent2) {
    _inherits(CFileUploaderBar, _React$PureComponent2);

    function CFileUploaderBar(props) {
        _classCallCheck(this, CFileUploaderBar);

        var _this5 = _possibleConstructorReturn(this, (CFileUploaderBar.__proto__ || Object.getPrototypeOf(CFileUploaderBar)).call(this));

        autoBind(_this5);
        return _this5;
    }

    _createClass(CFileUploaderBar, [{
        key: 'reDraw',
        value: function reDraw() {
            this.setState({
                magicObj: {}
            });
        }
    }, {
        key: 'listenUploader',
        value: function listenUploader(uploader) {
            if (uploader) {
                uploader.on('changed', this.reDraw);
            }
            this.uploader = uploader;
        }
    }, {
        key: 'unlistenUploader',
        value: function unlistenUploader(uploader) {
            if (uploader) {
                uploader.off('changed', this.reDraw);
            }
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.listenUploader(this.props.uploader);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenUploader(this.props.uploader);
        }
    }, {
        key: 'reTryUpload',
        value: function reTryUpload() {
            this.uploader._uploadData();
        }
    }, {
        key: 'reTryPrepare',
        value: function reTryPrepare() {
            this.uploader._prepare();
        }
    }, {
        key: 'clickPauseHandler',
        value: function clickPauseHandler() {
            if (this.uploader.isPause) {
                this.uploader.resume();
            } else {
                this.uploader.pause();
            }
        }
    }, {
        key: 'clickPreViewHandler',
        value: function clickPreViewHandler() {
            var fileUploader = this.props.uploader;
            if (fileUploader.previewUrl == null) {
                return;
            }
            var fileProfile = fileUploader.fileProfile;
            var fileType = fileProfile.type;
            gPreviewFile(fileProfile.name, fileType, fileUploader.previewUrl);
        }
    }, {
        key: 'render',
        value: function render() {
            var contentElem = null;
            var fileUploader = this.props.uploader;
            if (fileUploader != this.uploader) {
                this.unlistenUploader(this.uploader);
                this.listenUploader(fileUploader);
            }
            var fileProfile = fileUploader.fileProfile;
            var aidData = getRenderAidDataFromFileType(fileProfile ? fileProfile.type : null);

            if (fileUploader.state == EFileUploaderState.WAITFILE) {
                contentElem = React.createElement(
                    'div',
                    null,
                    '\u7B49\u5F85\u6587\u4EF6\u6307\u6D3E'
                );
            } else {
                var bottomBar = null;
                switch (fileUploader.state) {
                    case EFileUploaderState.READING:
                        if (fileUploader.errorCode > 0) {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'text-danger flex-grow-1 flex-shrink-1' },
                                '\u8BFB\u53D6\u9519\u8BEF:',
                                fileUploader.errorMsg
                            );
                        } else {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1' },
                                React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                '\u6587\u4EF6\u8BFB\u53D6\u4E2D'
                            );
                        }
                        break;
                    case EFileUploaderState.PREPARE:
                        if (fileUploader.errorCode > 0) {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1' },
                                React.createElement(
                                    'span',
                                    { className: 'text-danger' },
                                    '\u521B\u5EFA\u9519\u8BEF:',
                                    fileUploader.errorMsg
                                ),
                                React.createElement(
                                    'button',
                                    { className: 'btn btn-primary btn-sm', onClick: this.reTryPrepare },
                                    React.createElement('i', { className: 'fa fa-refresh' }),
                                    '\u91CD\u8BD5'
                                )
                            );
                        } else {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1' },
                                React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                                '\u9884\u521B\u5EFA'
                            );
                        }
                        break;
                    case EFileUploaderState.CALMD5:
                        bottomBar = React.createElement(
                            'span',
                            { className: 'flex-grow-1 flex-shrink-1' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            '\u8BA1\u7B97\u7535\u5B50\u6307\u7EB9'
                        );
                        break;
                    case EFileUploaderState.UPLOADING:
                        if (fileUploader.errorCode > 0) {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1' },
                                React.createElement(
                                    'span',
                                    { className: 'text-danger' },
                                    '\u4F20\u8F93\u9519\u8BEF:',
                                    fileUploader.errorMsg
                                ),
                                React.createElement(
                                    'button',
                                    { className: 'btn btn-primary btn-sm', onClick: this.reTryUpload },
                                    React.createElement('i', { className: 'fa fa-refresh' }),
                                    '\u91CD\u8BD5'
                                )
                            );
                        } else {
                            bottomBar = React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1 d-flex align-items-center' },
                                fileUploader.isPause ? '已暂停' : fileUploader.percent + '%',
                                React.createElement(
                                    'div',
                                    { className: 'progress flex-grow-1 flex-shrink-1' },
                                    React.createElement('div', { className: 'progress-bar progress-bar-striped', style: { width: fileUploader.percent + '%' } })
                                ),
                                fileUploader.speed
                            );
                        }
                        //<button className={'btn btn-sm btn-dark'} onClick={this.clickPauseHandler}><i className={'fa fa-2x ' + (fileUploader.isPause ? 'fa-play-circle-o' : 'fa-pause-circle-o')} /></button>
                        break;
                    case EFileUploaderState.COMPLETE:
                        bottomBar = React.createElement(
                            'span',
                            { className: 'd-flex align-items-center' },
                            React.createElement('i', { className: 'fa fa-check-square-o text-success' }),
                            '\u4E0A\u4F20\u5B8C\u6210',
                            aidData.canPreview && fileUploader.previewUrl ? React.createElement(
                                'button',
                                { onClick: this.clickPreViewHandler, className: 'ml-1 btn btn-sm btn-primary' },
                                React.createElement('i', { className: 'fa fa-eye' }),
                                '\u9884\u89C8'
                            ) : '(不支持预览))'
                        );
                        break;
                    case EFileUploaderState.BEFOREEND:
                        bottomBar = React.createElement(
                            'span',
                            { className: 'd-flex align-items-center' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            '\u5373\u5C06\u5B8C\u6210',
                            aidData.canPreview && fileUploader.previewUrl ? React.createElement(
                                'button',
                                { onClick: this.clickPreViewHandler, className: 'ml-1 btn btn-sm btn-primary' },
                                React.createElement('i', { className: 'fa fa-eye' }),
                                '\u9884\u89C8'
                            ) : '(不支持预览))'
                        );
                        break;
                }
                var iconElem = null;
                if (fileUploader.base64Data) {
                    iconElem = React.createElement('img', { className: 'border', style: { width: '3em', height: '3em' }, src: fileUploader.base64Data });
                } else {
                    iconElem = React.createElement('i', { className: 'fa fa-3x m-auto ' + aidData.fileIconType });
                }
                var fileName = fileProfile.name;
                if (fileName.length > 15) {
                    fileName = '...' + fileName.slice(-15);
                }
                contentElem = React.createElement(
                    'div',
                    { className: 'd-flex flex-grow-1 flex-shrink-1' },
                    React.createElement(
                        'div',
                        { className: 'flex-grow-0 flex-shrink-0 p-1 d-flex flex-column' },
                        iconElem,
                        fileUploader.sizeStr
                    ),
                    React.createElement(
                        'div',
                        { className: 'd-flex flex-grow-1 flex-shrink-1 flex-column' },
                        React.createElement(
                            'span',
                            { className: 'border-bottom' },
                            fileName
                        ),
                        bottomBar
                    )
                );
            }
            return React.createElement(
                'div',
                { className: 'd-flex' },
                contentElem
            );
        }
    }]);

    return CFileUploaderBar;
}(React.PureComponent);

var ERPC_MultiFileUploader = function (_React$PureComponent3) {
    _inherits(ERPC_MultiFileUploader, _React$PureComponent3);

    function ERPC_MultiFileUploader(props) {
        _classCallCheck(this, ERPC_MultiFileUploader);

        var _this6 = _possibleConstructorReturn(this, (ERPC_MultiFileUploader.__proto__ || Object.getPrototypeOf(ERPC_MultiFileUploader)).call(this));

        ERPControlBase(_this6);
        _this6.state = {};
        _this6.fileTagRef = React.createRef();

        autoBind(_this6);
        return _this6;
    }

    _createClass(ERPC_MultiFileUploader, [{
        key: 'uploaderJobDone',
        value: function uploaderJobDone(uploader) {
            if (this.props.onuploadcomplete) {
                this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code, uploader.fileProfile.identity);
            }
        }
    }, {
        key: 'cusComponentWillmount',
        value: function cusComponentWillmount() {
            if (this.props.uploaders == null) {
                store.dispatch(makeAction_setManyStateByPath({
                    uploaders: []
                }, this.props.fullPath));
            }
        }
    }, {
        key: 'cusComponentWillUnmount',
        value: function cusComponentWillUnmount() {}
    }, {
        key: 'addFileList',
        value: function addFileList(files) {
            var uploaders = this.props.uploaders;
            var newUploaders = uploaders ? uploaders.concat() : [];
            var addedCount = 0;
            for (var fi = 0; fi < files.length; ++fi) {
                var theFile = files[fi];
                var found = newUploaders.find(function (uploader) {
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
                invalidInfo: null
            }, this.props.fullPath));
        }
    }, {
        key: 'fileSelectedHandler',
        value: function fileSelectedHandler(ev) {
            this.addFileList(ev.target.files);
        }
    }, {
        key: 'plusClickHandler',
        value: function plusClickHandler(ev) {
            if (this.fileTagRef.current) {
                this.fileTagRef.current.click();
            }
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler(ev) {
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
                    var newUploaders = uploaders.filter(function (uploader) {
                        return uploader != targetUploader;
                    });
                    store.dispatch(makeAction_setManyStateByPath({
                        uploaders: newUploaders
                    }, this.props.fullPath));
                }
            }
        }
    }, {
        key: 'dragenter',
        value: function dragenter(ev) {
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
    }, {
        key: 'dragleave',
        value: function dragleave(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.setState({
                dragstate: null
            });
        }
    }, {
        key: 'drop',
        value: function drop(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            this.setState({
                dragstate: null
            });
            this.addFileList(ev.dataTransfer.files);
        }
    }, {
        key: 'dragOver',
        value: function dragOver(ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            if (this.props.visible == false) {
                return null;
            }
            var uploaders = this.props.uploaders;
            var uploaderElems_arr = [];
            if (uploaders && uploaders.length > 0) {
                uploaderElems_arr = uploaders.map(function (uploader) {
                    if (uploader.fileProfile == null) {
                        return null;
                    }
                    return React.createElement(
                        'div',
                        { key: uploader.file.name, 'd-fkey': uploader.file.name + uploader.file.size, className: 'list-group-item flex-grow-0 flex-shrink-0' },
                        React.createElement(
                            'div',
                            { className: 'd-flex w-100 align-items-center' },
                            React.createElement(
                                'span',
                                { className: 'flex-grow-1 flex-shrink-1 border-right mr-1' },
                                React.createElement(CFileUploaderBar, { uploader: uploader })
                            ),
                            React.createElement(
                                'button',
                                { onClick: _this7.clickTrashHandler, className: 'btn btn-danger flex-grow-0 flex-shrink-0' },
                                React.createElement('i', { className: 'fa fa-trash' })
                            )
                        )
                    );
                });
            }
            var rootClassName = 'd-flex flex-column' + (this.props.flexgrow == '1' ? ' flex-grow-1' : ' flex-grow-0') + (this.props.flexshrink == '1' ? ' flex-shrink-1' : ' flex-shrink-0');

            var bContentNeedScroll = false;
            if (this.props.flexgrow == '1' || this.props.flexshrink == '1' || this.props.style && (this.props.style.height || this.props.style.maxHeight)) {
                bContentNeedScroll = true;
            }

            var invalidInfoElem = null;
            if (!IsEmptyString(this.props.invalidInfo)) {
                invalidInfoElem = React.createElement(
                    'span',
                    { className: 'bg-danger text-white' },
                    React.createElement('i', { className: 'fa fa-warning' }),
                    this.props.invalidInfo
                );
            }

            return React.createElement(
                'div',
                { className: rootClassName, style: this.props.style },
                React.createElement('input', { onChange: this.fileSelectedHandler, ref: this.fileTagRef, type: 'file', className: 'd-none', multiple: 'multiple' }),
                React.createElement(
                    'div',
                    { className: 'bg-dark d-flex flex-shrink-0 flex-grow-0 p-1 align-items-center' },
                    React.createElement(
                        'span',
                        { className: 'text-light flex-grow-1 flex-shrink-1' },
                        React.createElement('i', { className: 'fa fa-list mr-1' }),
                        this.props.title
                    )
                ),
                invalidInfoElem,
                React.createElement(
                    'div',
                    { className: 'list-group flex-grow-1 flex-shrink-1 border' + (bContentNeedScroll ? ' autoScroll' : '') },
                    uploaderElems_arr,
                    React.createElement(
                        'div',
                        { className: 'list-group-item p-1' },
                        React.createElement(
                            'div',
                            null,
                            uploaderElems_arr.length == 0 ? '' : '共' + uploaderElems_arr.length + '个附件'
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn mfileuploader-addbtn', onClick: this.plusClickHandler, dragstate: this.state.dragstate, onDragEnter: this.dragenter, onDragLeave: this.dragleave, onDrop: this.drop, onDragOver: this.dragOver },
                            React.createElement(
                                'div',
                                { className: 'pointerevent-none' },
                                React.createElement('i', { className: 'fa fa-mouse-pointer' }),
                                '\u4E0A\u4F20\u6587\u4EF6'
                            ),
                            isMobile ? null : React.createElement(
                                'div',
                                { className: 'pointerevent-none' },
                                React.createElement('i', { className: 'fa fa-hand-rock-o' }),
                                '\u62D6\u62FD\u6587\u4EF6'
                            )
                        )
                    )
                )
            );
        }
    }]);

    return ERPC_MultiFileUploader;
}(React.PureComponent);

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
        invalidInfo: ctlState.invalidInfo
    };
}

function ERPC_MultiFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERPC_FilePreview = function (_React$PureComponent4) {
    _inherits(ERPC_FilePreview, _React$PureComponent4);

    function ERPC_FilePreview(props) {
        _classCallCheck(this, ERPC_FilePreview);

        var _this8 = _possibleConstructorReturn(this, (ERPC_FilePreview.__proto__ || Object.getPrototypeOf(ERPC_FilePreview)).call(this));

        ERPControlBase(_this8);
        _this8.state = {};
        autoBind(_this8);
        _this8.audioTagRef = React.createRef();
        return _this8;
    }

    _createClass(ERPC_FilePreview, [{
        key: 'clickIconHandler',
        value: function clickIconHandler(ev) {
            var fileUrl = window.location.origin + this.props.filePath;
            var fileName = this.props.fileName;
            if (this.fileType == 'image') {
                dingdingKit.biz.util.previewImage({
                    urls: [fileUrl],
                    current: fileUrl
                });
            } else if (this.fileType == 'audio') {
                if (this.audioTagRef.current) {
                    this.audioTagRef.current.src = fileUrl;
                    this.audioTagRef.current.play();
                }
            } else if (this.fileType == 'video' || this.fileType == 'movie') {
                if (isMobile) {
                    dingdingKit.biz.util.openLink({
                        url: fileUrl
                    });
                } else {
                    dingdingKit.biz.util.openModal({
                        url: fileUrl,
                        title: this.props.fileName
                    });
                }
            } else {
                if (!isMobile) {
                    dingdingKit.biz.util.isLocalFileExist({
                        params: [{ url: fileUrl }],
                        onSuccess: function onSuccess(result) {
                            if (result[0].isExist) {
                                dingdingKit.biz.util.openLocalFile({
                                    url: fileUrl, //本地文件的url，指的是调用DingTalkPC.biz.util.downloadFile接口下载时填入的url，配合DingTalkPC.biz.util.downloadFile使用
                                    onSuccess: function onSuccess(result) {},
                                    onFail: function onFail() {}
                                });
                            } else {
                                dingdingKit.biz.util.downloadFile({
                                    url: fileUrl, //要下载的文件的url
                                    name: fileName, //定义下载文件名字
                                    onProgress: function onProgress(msg) {},
                                    onSuccess: function onSuccess(result) {
                                        dingdingKit.biz.util.openLocalFile({
                                            url: fileUrl,
                                            onSuccess: function onSuccess(result) {},
                                            onFail: function onFail() {}
                                        });
                                    },
                                    onFail: function onFail() {}
                                });
                            }
                        },
                        onFail: function onFail() {}
                    });
                } else {
                    dingdingKit.biz.util.openLink({
                        url: fileUrl
                    });
                }
            }
        }
    }, {
        key: 'clickTrashHandler',
        value: function clickTrashHandler(ev) {
            var _this9 = this;

            if (this.deleting) {
                return;
            }

            var msg = PopMessageBox('删除附件:"' + this.props.fileName + '"?', EMessageBoxType.Blank, '附件删除');
            msg.query('删除附件"' + this.props.fileName + '" ?', [{ label: '删除', key: '删除' }, { label: '算了', key: '算了' }], function (key) {
                if (key == '删除') {
                    _this9.deleting = true;
                    var self = _this9;
                    store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { 附件id: _this9.props.attachmentID }, action: 'deleteAttachment' }, makeFTD_Callback(function (state, data, error) {
                        self.deleting = false;
                        if (error) {
                            alert(JSON.stringify(error));
                            return;
                        } else {
                            self.deletedAttachmentID = self.props.attachmentID;
                            setTimeout(function () {
                                self.setState({
                                    magicObj: {}
                                });
                            }, 20);
                        }
                    }, false)));
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.deletedAttachmentID && this.deletedAttachmentID == this.props.attachmentID) {
                return null;
            }
            var aidData = getRenderAidDataFromFileType(this.props.fileType);
            this.canPreview = aidData.canPreview;
            this.fileType = aidData.fileType;
            var contetnElem = null;
            if (aidData.fileType == 'image') {
                contetnElem = React.createElement('img', { className: 'w-100 h-100', src: window.location.origin + this.props.filePath, onClick: this.clickIconHandler });
            } else if (aidData.fileType == 'audio') {
                contetnElem = [React.createElement('audio', { key: 'audio', ref: this.audioTagRef, src: window.location.origin + this.props.filePath }), React.createElement('i', { key: 'icon', className: 'fa ' + aidData.fileIconType, onClick: this.clickIconHandler })];
            } else {
                contetnElem = React.createElement('i', { onClick: this.clickIconHandler, className: 'fa ' + aidData.fileIconType });
            }
            var fileName = this.props.fileName;
            if (fileName.length > 15) {
                fileName = '...' + this.props.fileName.substr(-15);
            }
            var divClassName = 'filepreview ' + (this.props.className ? this.props.className : '');
            return React.createElement(
                'div',
                { className: divClassName, fixedsize: this.props.fixedsize, style: this.props.style },
                contetnElem,
                this.props.hidetitle ? null : React.createElement(
                    'div',
                    { id: 'name' },
                    fileName
                ),
                !this.props.canDelte ? null : React.createElement(
                    'button',
                    { onClick: this.clickTrashHandler, id: 'del', className: 'btn btn-sm btn-danger' },
                    React.createElement('i', { className: 'fa ' + (this.deleting ? 'fa-circle-o-notch fa-spin' : 'fa-trash') })
                )
            );
        }
    }]);

    return ERPC_FilePreview;
}(React.PureComponent);

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
        fileName: ctlState.fileName
    };
}

function ERPC_FilePreview_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var ERP_Form_ShowData = function (_React$PureComponent5) {
    _inherits(ERP_Form_ShowData, _React$PureComponent5);

    function ERP_Form_ShowData(props) {
        _classCallCheck(this, ERP_Form_ShowData);

        var _this10 = _possibleConstructorReturn(this, (ERP_Form_ShowData.__proto__ || Object.getPrototypeOf(ERP_Form_ShowData)).call(this, props));

        ERPC_GridForm(_this10);
        _this10.tableBodyScroll = _this10.tableBodyScroll.bind(_this10);
        _this10.headtableStyle = { "marginBottom": "0px", width: '40em', "tableLayout": "fixed" };
        return _this10;
    }

    _createClass(ERP_Form_ShowData, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { ref: this.rootRef, className: 'flex-grow-1 flex-shrink-1 d-flex erp-form flex-column ' },
                this.props.title && React.createElement(
                    'div',
                    { className: 'bg-dark text-light justify-content-start d-flex flex-shrink-0 p-1' },
                    React.createElement(
                        'span',
                        null,
                        this.props.title,
                        this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null
                    )
                ),
                React.createElement(
                    'div',
                    { id: this.props.fullPath + 'tableheader', className: 'mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv' },
                    React.createElement(
                        'table',
                        { className: 'table', style: this.headtableStyle },
                        React.createElement(ERP_Form_ShowData_THead, { form: this })
                    )
                ),
                React.createElement(
                    'div',
                    { id: this.props.fullPath + 'scroller', onScroll: this.tableBodyScroll, className: 'mw-100 autoScroll' },
                    React.createElement(ERP_Form_TBody, { fullPath: this.props.fullPath, form: this })
                )
            );
        }
    }, {
        key: 'tableBodyScroll',
        value: function tableBodyScroll(ev) {
            document.getElementById(this.props.fullPath + 'tableheader').scrollLeft = ev.target.scrollLeft;
        }
    }]);

    return ERP_Form_ShowData;
}(React.PureComponent);

var ERP_Form_ShowData_THead = function (_React$PureComponent6) {
    _inherits(ERP_Form_ShowData_THead, _React$PureComponent6);

    function ERP_Form_ShowData_THead(props) {
        _classCallCheck(this, ERP_Form_ShowData_THead);

        var _this11 = _possibleConstructorReturn(this, (ERP_Form_ShowData_THead.__proto__ || Object.getPrototypeOf(ERP_Form_ShowData_THead)).call(this, props));

        _this11.headstyle0 = { "width": "10em", "maxWidth": "10em", "minWidth": "10em", "whiteSpace": "nowrap", "overflow": "hidden" };
        return _this11;
    }

    _createClass(ERP_Form_ShowData_THead, [{
        key: 'render',
        value: function render() {
            var _this12 = this;

            var retElem = null;
            var ths_arr = this.props.form.props.headers.map(function (item, index) {
                return React.createElement(
                    'th',
                    { key: 'col' + index, style: _this12.headstyle0 },
                    item
                );
            });

            return React.createElement(
                'thead',
                { className: 'thead-light' },
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        { scope: 'col', className: 'indexTableHeader' },
                        '\u5E8F\u53F7'
                    ),
                    ths_arr
                )
            );
            return retElem;
        }
    }]);

    return ERP_Form_ShowData_THead;
}(React.PureComponent);

var ERP_Form_TBody = function (_React$PureComponent7) {
    _inherits(ERP_Form_TBody, _React$PureComponent7);

    function ERP_Form_TBody(props) {
        _classCallCheck(this, ERP_Form_TBody);

        var _this13 = _possibleConstructorReturn(this, (ERP_Form_TBody.__proto__ || Object.getPrototypeOf(ERP_Form_TBody)).call(this, props));

        _this13.tdStyle = { "width": "10em", "maxWidth": "10em", "minWidth": "10em", "verticalAlign": "middle" };
        _this13.tableStyle = { "marginTop": "-50px", width: '40em', "tableLayout": "fixed" };
        return _this13;
    }

    _createClass(ERP_Form_TBody, [{
        key: 'render',
        value: function render() {
            var _this14 = this;

            var trElems_arr = [];
            var formProp = this.props.form.props;
            for (var rowIndex = 0; rowIndex < formProp.records_arr.length; ++rowIndex) {
                var rowRecord = formProp.records_arr[rowIndex];
                var rowkey = rowIndex;
                trElems_arr.push(React.createElement(
                    'tr',
                    { rowkey: rowkey, key: rowkey },
                    React.createElement(
                        'td',
                        { className: 'indexTableHeader' },
                        rowIndex + 1
                    ),
                    formProp.headers.map(function (item, index) {
                        return React.createElement(
                            'td',
                            { key: 'col' + index, style: _this14.tdStyle },
                            React.createElement(
                                'span',
                                null,
                                rowRecord[item]
                            )
                        );
                    })
                ));
            }
            return React.createElement(
                'table',
                { className: 'table table-striped table-hover ', style: this.tableStyle },
                React.createElement(ERP_Form_ShowData_THead, { form: this.props.form }),
                React.createElement(
                    'tbody',
                    null,
                    trElems_arr
                )
            );
        }
    }]);

    return ERP_Form_TBody;
}(React.PureComponent);

var ERPC_ExcelImporter = function (_React$PureComponent8) {
    _inherits(ERPC_ExcelImporter, _React$PureComponent8);

    function ERPC_ExcelImporter(props) {
        _classCallCheck(this, ERPC_ExcelImporter);

        var _this15 = _possibleConstructorReturn(this, (ERPC_ExcelImporter.__proto__ || Object.getPrototypeOf(ERPC_ExcelImporter)).call(this));

        _this15.state = {
            f_name: '未选择文件'
        };
        autoBind(_this15);
        _this15.fileTagRef = React.createRef();
        _this15.btnTagRef = React.createRef();
        return _this15;
    }

    _createClass(ERPC_ExcelImporter, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var self = this;
            setTimeout(function () {
                if (self.btnTagRef.current) {
                    self.btnTagRef.current.click();
                }
            }, 500);
        }
    }, {
        key: 'fileSelectedHandler',
        value: function fileSelectedHandler(ev) {
            if (ev.target.files.length > 1) {
                SendToast('只能选一个文件');
                return;
            }
            var theFile = ev.target.files[0];
            var uploader = new FileUploader();
            this.setState({
                f_name: theFile.name,
                theFile: theFile,
                uploader: uploader
            });

            uploader.uploadFile(theFile, this.uploaderJobDone);
        }
    }, {
        key: 'uploaderJobDone',
        value: function uploaderJobDone(uploader) {
            this.setState({
                f_identity: uploader.fileProfile.identity,
                reading: true
            });
            var self = this;
            var processKey = null;
            var queryProcess = function queryProcess(state, ret_data, ret_err) {
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
                        reading: false
                    });
                    return;
                }
                setTimeout(function () {
                    store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { key: processKey }, action: 'queryLongProcessResult' }, makeFTD_Callback(queryProcess)));
                }, 1000);
            };

            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { fileIdentity: uploader.fileProfile.identity }, action: 'readExcelContent' }, makeFTD_Callback(function (state, key, error) {
                if (error) {
                    setTimeout(function () {
                        self.setState({
                            error: error,
                            reading: false
                        });
                    }, 200);
                    return;
                }
                processKey = key;
                queryProcess(null, null, null);
            }, false)));
        }
    }, {
        key: 'plusClickHandler',
        value: function plusClickHandler(ev) {
            if (this.fileTagRef.current) {
                this.fileTagRef.current.click();
            }
        }
    }, {
        key: 'cancelClickHandler',
        value: function cancelClickHandler(ev) {
            this.props.callback(false);
        }
    }, {
        key: 'confirmClickHandler',
        value: function confirmClickHandler(ev) {
            this.props.callback(true, this.state.data.rows, this.state.data.headers);
        }
    }, {
        key: 'renderData',
        value: function renderData() {
            var data = this.state.data;
            return React.createElement(
                'div',
                { className: 'w-100 h-100 d-flex p-3 flex-column align-items-center justify-content-center' },
                React.createElement(
                    'div',
                    { className: 'bg-light border d-flex flex-column p-1 rounded', style: { maxWidth: '95%', maxHeight: '95%' } },
                    React.createElement(ERP_Form_ShowData, { id: 'dataform', parentPath: 'excelimporter', fullPath: 'excelimporter', pagebreak: false, selectMode: 'none', headers: data.headers, records_arr: data.rows, title: this.state.f_name }),
                    React.createElement(
                        'div',
                        { className: 'd-flex justify-content-center flex-grow-0 flex-shrink-0 border-top p-1' },
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-primary', onClick: this.confirmClickHandler },
                            '\u786E\u8BA4\u4E0A\u4F20'
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: 'btn btn-danger ml-1', onClick: this.cancelClickHandler },
                            '\u53D6\u6D88\u4E0A\u4F20'
                        )
                    )
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.state.data) {
                return this.renderData();
            }
            var uploaderElem = null;
            var uploader = this.state.uploader;
            var selectorElem = null;
            if (this.state.uploader) {
                uploaderElem = React.createElement(
                    'div',
                    { 'd-fkey': uploader.file.name + uploader.file.size, className: 'flex-grow-0 flex-shrink-0' },
                    React.createElement(CFileUploaderBar, { uploader: uploader })
                );
            } else {
                selectorElem = React.createElement(
                    'div',
                    { className: 'd-flex align-items-center border p-1' },
                    React.createElement(
                        'span',
                        { className: 'flex-grow-1 flex-shrink-1 hidenOverflow mr-1' },
                        this.state.f_name
                    ),
                    React.createElement(
                        'button',
                        { ref: this.btnTagRef, className: 'btn btn-sm btn-primary' + (uploader ? ' d-none' : ''), onClick: this.plusClickHandler },
                        '\u9009\u62E9\u6587\u4EF6'
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-sm btn-danger' + (uploader ? ' d-none' : ''), onClick: this.cancelClickHandler },
                        '\u53D6\u6D88\u4E0A\u4F20'
                    )
                );
            }
            return React.createElement(
                'div',
                { className: 'card excelimporter' },
                React.createElement('input', { id: this.props.id + '_file', onChange: this.fileSelectedHandler, ref: this.fileTagRef, type: 'file', className: 'd-none', accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' }),
                React.createElement(
                    'div',
                    { className: 'card-body' },
                    React.createElement(
                        'div',
                        { className: 'card-title' },
                        React.createElement(
                            'h5',
                            null,
                            this.props.title
                        )
                    ),
                    selectorElem,
                    uploaderElem,
                    this.state.reading ? React.createElement(
                        'span',
                        null,
                        React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                        '\u6B63\u5728\u89E3\u6790Excel\u5185\u5BB9'
                    ) : null,
                    this.state.error ? React.createElement(
                        'div',
                        { className: 'd-flex flex-column flex-grow-1 flex-shrink-1' },
                        React.createElement(
                            'span',
                            { className: 'text-danger flex-grow-1 flex-shrink-1' },
                            React.createElement('i', { className: 'fa fa-warning' }),
                            this.state.error.info
                        ),
                        React.createElement(
                            'span',
                            { className: 'd-flex justify-content-center flex-grow-0 flex-shrink-0' },
                            React.createElement(
                                'button',
                                { className: 'btn btn-sm btn-danger', onClick: this.cancelClickHandler },
                                '\u53D6\u6D88\u64CD\u4F5C'
                            )
                        )
                    ) : null
                )
            );
        }
    }]);

    return ERPC_ExcelImporter;
}(React.PureComponent);

function ERPC_ExcelImporter_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;

    return {
        title: IsEmptyString(ownprops.title) ? '上传Excel' : ownprops.title
    };
}

function ERPC_ExcelImporter_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_MultiFileUploader = null;
var VisibleERPC_FilePreview = null;
var VisibleERPC_SingleFileUploader = null;
var VisibleERPC_ExcelImporter = null;
var VisibleERP_Form_ShowData = null;

gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_MultiFileUploader = ReactRedux.connect(ERPC_MultiFileUploader_mapstatetoprops, ERPC_MultiFileUploader_dispatchtorprops)(ERPC_MultiFileUploader);
    VisibleERPC_FilePreview = ReactRedux.connect(ERPC_FilePreview_mapstatetoprops, ERPC_FilePreview_dispatchtorprops)(ERPC_FilePreview);
    VisibleERPC_SingleFileUploader = ReactRedux.connect(ERPC_SingleFileUploader_mapstatetoprops, ERPC_SingleFileUploader_dispatchtorprops)(ERPC_SingleFileUploader);
    VisibleERPC_ExcelImporter = ReactRedux.connect(ERPC_ExcelImporter_mapstatetoprops, ERPC_ExcelImporter_dispatchtorprops)(ERPC_ExcelImporter);
});