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
            this.changeState(EFileUploaderState.WAITFILE);

            if (this.readWorker) {
                this.readWorker.terminate();
                this.readWorker = null;
                console.log('readWorker 已终止 by reset');
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
            this.changeState(EFileUploaderState.READING);
            var reader = new FileReader();
            reader.onerror = function () {
                reader.abort();
                self.meetError({ errorMsg: '读取文件出错' });
            };
            reader.onload = function (ev) {
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
                    reader.onload = function (ev) {
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
        key: '_calMD5',
        value: function _calMD5() {
            var self = this;
            if (typeof Worker !== "undefined") {
                if (this.readWorker == null) {
                    console.log('readWorker 已创建');
                    this.readWorker = new Worker("/js/woker_bytetohexstr2.js");
                    this.readWorker.onmessage = function (ev) {
                        self._readerMsgHandler(ev.data);
                    };
                }
            }
            this.readWorker.postMessage({ act: 'tohex', data: this.fileData });
        }
    }, {
        key: '_readerMsgHandler',
        value: function _readerMsgHandler(ev) {
            if (this.fileProfile == null) {
                console.log('上传器被删除');
                return;
            }
            if (ev.act == 'tohex') {
                this.fileProfile.dataHexStr = ev.data;
                this.readWorker.postMessage({ act: 'calmd5', data: ev.data });
            } else if (ev.act == 'calmd5') {
                this.fileProfile.md5 = ev.data;
                this.readWorker.terminate();
                this.readWorker = null;
                this.changeState(EFileUploaderState.PREPARE);
                this._prepare();
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
                md5: this.fileProfile.md5
            };
            var kbsize = Math.round(theFile.size / 1024);
            if (kbsize < 1000) {
                this.sizeStr = kbsize + 'KB';
            } else {
                var mbsize = Math.round(kbsize / 1024);
                if (mbsize < 1000) {
                    this.sizeStr = mbsize + 'MB';
                } else {
                    var gbsize = Math.round(kbsize / 1024);
                    this.sizeStr = gbsize + 'GB';
                }
            }
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
            var _this2 = this;

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
                startPos: this.startPos
            };
            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'uploadBlock' }, makeFTD_Callback(function (state, data, error, fetchUseTime) {
                setTimeout(function () {
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
                                _this2.startPos = parseInt(error.data);
                                error = null;
                                break;
                            case EFileSystemError.EMPTYDATA:
                            case EFileSystemError.DATATOOLONG:
                            case EFileSystemError.FILELOCKED:
                                error = null;
                                break;
                            case EFileSystemError.UPLOADCOMPLATE:
                                error = null;
                                _this2.startPos = self.fileProfile.size;
                                break;
                        }
                        if (error != null) {
                            // 上传过程中遇到错误不断重试即可
                            //console.log(error);
                            _this2.myBlockMaxSize = MINPERBLOCKSIZE;
                        }

                        self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                        setTimeout(function () {
                            self._fireChanged();
                            self._uploadData();
                        }, 20);
                    } else {
                        //console.log('fetchUseTime:' + fetchUseTime + '  blksize:' + this.myBlockMaxSize);
                        if (fetchUseTime < 200) {
                            _this2.myBlockMaxSize = Math.min(_this2.myBlockMaxSize + STEP_BLOCKSIZE, MAXPERBLOCKSIZE);
                        } else if (fetchUseTime > 300) {
                            _this2.myBlockMaxSize = Math.max(_this2.myBlockMaxSize - STEP_BLOCKSIZE, MINPERBLOCKSIZE);
                        }
                        self.startPos += data.bytesWritten;
                        self.percent = Math.floor(100.0 * self.startPos / self.fileProfile.size);
                        //console.log(self.percent  + '%');
                        if (data.previewUrl) {
                            _this2.previewUrl = data.previewUrl;
                        }
                        setTimeout(function () {
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
                if (this.readWorker) {
                    this.readWorker.terminate();
                    this.readWorker = null;
                    console.log('readWorker 已终止');
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

        var _this3 = _possibleConstructorReturn(this, (ERPC_SingleFileUploader.__proto__ || Object.getPrototypeOf(ERPC_SingleFileUploader)).call(this));

        autoBind(_this3);
        _this3.state = {
            loading: false
        };
        _this3.fileTagRef = React.createRef();
        return _this3;
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
            var bundle = {
                fileid: this.props.deffileID,
                attachmentID: this.props.defattachmentID
            };
            var self = this;
            store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: bundle, action: 'getFileRecord' }, makeFTD_Callback(function (state, data, error) {
                var fileRecord = {
                    fileid: bundle.fileid,
                    attachmentID: bundle.attachmentID,
                    fileName: data ? data.文件名称 : null,
                    fileSize: data ? data.文件大小 : null,
                    type: data ? data.文件类型 : null,
                    url: data ? data.文件路径 : null
                };
                setTimeout(function () {
                    self.setState({
                        fileRecord: fileRecord,
                        loading: false
                    });
                }, 20);
            }, false)));
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unlistenUploader(this.props.uploader);
        }
    }, {
        key: 'fileSelectedHandler',
        value: function fileSelectedHandler(ev) {
            var theFile = ev.target.files[0];
            this.uploader.uploadFile(theFile);
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
        key: 'render',
        value: function render() {
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
                    } else if ((this.props.deffileID != null || this.props.defattachmentID != null) && (fileRecord == null || !fileRecord.abandon)) {
                        if (fileRecord == null || fileRecord.fileid != this.props.deffileID || fileRecord.attachmentID != this.props.defattachmentID) {
                            setTimeout(function () {
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
                                childElem = React.createElement(
                                    'span',
                                    { className: 'centerelem position-absolute text-nowrap text-danger' },
                                    React.createElement('i', { className: 'fa fa-warninig' }),
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
                            }
                        }
                    } else {
                        contentElem = React.createElement(
                            'div',
                            { className: 'w-100 h-100 cursor_hand', onClick: this.clickPlusHandler },
                            React.createElement(
                                'span',
                                { className: 'centerelem position-absolute text-nowrap' },
                                React.createElement('i', { className: 'fa fa-plus' }),
                                '\u4E0A\u4F20\u6587\u4EF6'
                            )
                        );
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
                            'span',
                            { className: 'centerelem position-absolute text-nowrap bg-white' },
                            React.createElement('i', { className: 'fa fa-circle-o-notch fa-spin' }),
                            fileUploader.percent,
                            '%'
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
                var sizeStr = '';
                var kbsize = Math.round(fileSize / 1024);
                if (kbsize < 1000) {
                    sizeStr = kbsize + 'KB';
                } else {
                    var mbsize = Math.round(kbsize / 1024);
                    if (mbsize < 1000) {
                        sizeStr = mbsize + 'MB';
                    } else {
                        var gbsize = Math.round(kbsize / 1024);
                        sizeStr = gbsize + 'GB';
                    }
                }
                fileName += '[' + sizeStr + ']';
                if (fileName.length > 32) {
                    fileName = '...' + fileName.substr(-32);
                }
            }

            return React.createElement(
                'div',
                { className: 'fileuploadersingle' },
                React.createElement('input', { onChange: this.fileSelectedHandler, ref: this.fileTagRef, type: 'file', className: 'd-none', accept: 'image/*' }),
                React.createElement(
                    'span',
                    { id: 'title', className: 'flex-grow-0 flex-shrink-0' },
                    '\u6210\u679C\u540D\u79F0s'
                ),
                React.createElement(
                    'div',
                    { id: 'content' },
                    iconElem,
                    contentElem,
                    invalidInfoElem,
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
        deffileID: ctlState.deffileID
    };
}

function ERPC_SingleFileUploader_dispatchtorprops(dispatch, ownprops) {
    return {};
}

var CFileUploaderBar = function (_React$PureComponent2) {
    _inherits(CFileUploaderBar, _React$PureComponent2);

    function CFileUploaderBar(props) {
        _classCallCheck(this, CFileUploaderBar);

        var _this4 = _possibleConstructorReturn(this, (CFileUploaderBar.__proto__ || Object.getPrototypeOf(CFileUploaderBar)).call(this));

        autoBind(_this4);
        return _this4;
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
                                )
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

        var _this5 = _possibleConstructorReturn(this, (ERPC_MultiFileUploader.__proto__ || Object.getPrototypeOf(ERPC_MultiFileUploader)).call(this));

        ERPControlBase(_this5);
        _this5.state = {};
        _this5.fileTagRef = React.createRef();

        autoBind(_this5);
        return _this5;
    }

    _createClass(ERPC_MultiFileUploader, [{
        key: 'uploaderJobDone',
        value: function uploaderJobDone(uploader) {
            if (this.props.onuploadcomplete) {
                this.props.onuploadcomplete(this.props.fullPath, uploader.fileProfile.code);
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
        key: 'fileSelectedHandler',
        value: function fileSelectedHandler(ev) {
            var uploaders = this.props.uploaders;
            var newUploaders = uploaders ? uploaders.concat() : [];
            var addedCount = 0;
            for (var fi = 0; fi < ev.target.files.length; ++fi) {
                var theFile = ev.target.files[fi];
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
        key: 'render',
        value: function render() {
            var _this6 = this;

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
                                { onClick: _this6.clickTrashHandler, className: 'btn btn-danger flex-grow-0 flex-shrink-0' },
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
                    ),
                    React.createElement(
                        'button',
                        { className: 'btn btn-success', onClick: this.plusClickHandler },
                        React.createElement('i', { className: 'fa fa-plus' }),
                        '\u6DFB\u52A0\u9644\u4EF6'
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
                        uploaderElems_arr.length == 0 ? '' : '共' + uploaderElems_arr.length + '个附件',
                        React.createElement(
                            'button',
                            { className: 'btn btn-success m-1 btn-sm', onClick: this.plusClickHandler },
                            React.createElement('i', { className: 'fa fa-plus' }),
                            '\u6DFB\u52A0\u9644\u4EF6'
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

        var _this7 = _possibleConstructorReturn(this, (ERPC_FilePreview.__proto__ || Object.getPrototypeOf(ERPC_FilePreview)).call(this));

        ERPControlBase(_this7);
        _this7.state = {};
        autoBind(_this7);
        _this7.audioTagRef = React.createRef();
        return _this7;
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
            var _this8 = this;

            if (this.deleting) {
                return;
            }

            var msg = PopMessageBox('删除附件:"' + this.props.fileName + '"?', EMessageBoxType.Blank, '附件删除');
            msg.query('删除附件"' + this.props.fileName + '" ?', [{ label: '删除', key: '删除' }, { label: '算了', key: '算了' }], function (key) {
                if (key == '删除') {
                    _this8.deleting = true;
                    var self = _this8;
                    store.dispatch(fetchJsonPost(fileSystemUrl, { bundle: { 附件id: _this8.props.attachmentID }, action: 'deleteAttachment' }, makeFTD_Callback(function (state, data, error) {
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
                contetnElem = [React.createElement('audio', { key: 'audio', ref: this.audioTagRef, src: window.location.origin + this.props.filePath }), React.createElement('i', { key: 'icon', className: 'fa ' + fileIconType, onClick: this.clickIconHandler })];
            } else {
                contetnElem = React.createElement('i', { onClick: this.clickIconHandler, className: 'fa ' + fileIconType });
            }
            var fileName = this.props.fileName;
            if (fileName.length > 15) {
                fileName = '...' + this.props.fileName.substr(-15);
            }
            return React.createElement(
                'div',
                { className: 'filepreview' },
                contetnElem,
                React.createElement(
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

var VisibleERPC_MultiFileUploader = null;
var VisibleERPC_FilePreview = null;
var VisibleERPC_SingleFileUploader = null;

gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_MultiFileUploader = ReactRedux.connect(ERPC_MultiFileUploader_mapstatetoprops, ERPC_MultiFileUploader_dispatchtorprops)(ERPC_MultiFileUploader);
    VisibleERPC_FilePreview = ReactRedux.connect(ERPC_FilePreview_mapstatetoprops, ERPC_FilePreview_dispatchtorprops)(ERPC_FilePreview);
    VisibleERPC_SingleFileUploader = ReactRedux.connect(ERPC_SingleFileUploader_mapstatetoprops, ERPC_SingleFileUploader_dispatchtorprops)(ERPC_SingleFileUploader);
});