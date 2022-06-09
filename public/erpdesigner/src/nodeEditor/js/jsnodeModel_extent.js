const JSNODE_EX_LF_SHUANGZHOUTESTCAL = 'liufengshuangzhoutestcal';
const JSNODE_EX_LF_SHUANGZHOUTESTDRAWFILE = 'liufengshuangzhoutestdrawfile';
const JSNODE_EX_LF_SHUANGZHOUTESTSPLITFILE = 'liufengshuangzhoutestsplitfile';
const JSNODE_EX_STATIONDATACHECKER = 'stationdatachecker';
const JSNODE_EX_STATIONDATALOADER = 'stationfataloader';

const JSNODE_DING_UPDATEUSER = 'updatedinguser';

class JSNODE_EX_LF_ShuangZhouTestCal extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EX_LF_SHUANGZHOUTESTCAL, '双轴拉伸试验计算', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'middata':
                        this.middataSocket = socket;
                        break;
                    case 'result':
                        this.resultSocket = socket;
                        break;
                    case 'fileResult_arr':
                        this.fileRltSocket = socket;
                        break;
                    case 'errinfo':
                        this.errinfoSocket = socket;
                        break;
                    case 'pic1':
                        this.pic1Socket = socket;
                        break;
                    case 'pic2':
                        this.pic2Socket = socket;
                        break;
                    case 'pic3':
                        this.pic3Socket = socket;
                        break;
                    case 'pic4':
                        this.pic4Socket = socket;
                        break;
                    case 'pic5':
                        this.pic5Socket = socket;
                        break;
                    case 'pic6':
                        this.pic6Socket = socket;
                        break;
                    case 'pic7':
                        this.pic7Socket = socket;
                        break;
                    case 'pic8':
                        this.pic8Socket = socket;
                        break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'files':
                        this.filesSocket = socket;
                        break;
                    case 'names':
                        this.namesSocket = socket;
                        break;
                    case 'calfiles':
                        this.calfilesSocket = socket;
                        break;
                    case '起始数据项':
                        this.起始数据项Socket = socket;
                        break;
                    case '试样宽度':
                        this.试样宽度Socket = socket;
                        break;
                    case '测试标距':
                        this.测试标距Socket = socket;
                        break;
                    case '最小应力':
                        this.最小应力Socket = socket;
                        break;
                    case '最大应力':
                        this.最大应力Socket = socket;
                        break;
                    case 'Area':
                        this.AreaSocket = socket;
                        break;
                    case '偏移原点':
                        this.偏移原点Socket = socket;
                        break;
                    case '参考方向':
                        this.参考方向Socket = socket;
                        break;
                }
            });
        }
        if(this.参考方向Socket != null) {
            this.removeSocket(this.参考方向Socket);
            this.参考方向Socket = null;
        }
        if (this.filesSocket == null) {
            this.filesSocket = new NodeSocket('files', this, true);
            this.addSocket(this.filesSocket);
        }
        if (this.namesSocket == null) {
            this.namesSocket = new NodeSocket('names', this, true);
            this.addSocket(this.namesSocket);
        }
        if (this.calfilesSocket == null) {
            this.calfilesSocket = new NodeSocket('calfiles', this, true);
            this.addSocket(this.calfilesSocket);
        }
        if (this.起始数据项Socket == null) {
            this.起始数据项Socket = new NodeSocket('起始数据项', this, true);
            this.addSocket(this.起始数据项Socket);
        }
        if (this.试样宽度Socket == null) {
            this.试样宽度Socket = new NodeSocket('试样宽度', this, true);
            this.addSocket(this.试样宽度Socket);
        }
        if (this.测试标距Socket == null) {
            this.测试标距Socket = new NodeSocket('测试标距', this, true);
            this.addSocket(this.测试标距Socket);
        }
        if (this.最小应力Socket == null) {
            this.最小应力Socket = new NodeSocket('最小应力', this, true);
            this.addSocket(this.最小应力Socket);
        }
        if (this.最大应力Socket == null) {
            this.最大应力Socket = new NodeSocket('最大应力', this, true);
            this.addSocket(this.最大应力Socket);
        }
        if (this.AreaSocket == null) {
            this.AreaSocket = new NodeSocket('Area', this, true);
            this.addSocket(this.AreaSocket);
        }
        if (this.偏移原点Socket == null) {
            this.偏移原点Socket = new NodeSocket('偏移原点', this, true);
            this.addSocket(this.偏移原点Socket);
        }

        this.filesSocket.type = ValueType.String;
        this.namesSocket.type = ValueType.String;
        this.calfilesSocket.type = ValueType.String;
        this.起始数据项Socket.type = ValueType.Int;
        this.试样宽度Socket.type = ValueType.Int;
        this.测试标距Socket.type = ValueType.Int;
        this.最大应力Socket.type = ValueType.Int;
        this.最小应力Socket.type = ValueType.Int;
        this.AreaSocket.type = ValueType.String;
        this.偏移原点Socket.type = ValueType.Boolean;

        this.起始数据项Socket.label = '起始数据项';
        this.试样宽度Socket.label = '试样宽度';
        this.测试标距Socket.label = '测试标距';
        this.最小应力Socket.label = '最小应力';
        this.最大应力Socket.label = '最大应力';
        this.AreaSocket.label = 'Area';
        this.偏移原点Socket.label = '偏移原点';
        this.filesSocket.label = '数据文件';
        this.namesSocket.label = '数据文件名称';
        this.calfilesSocket.label = '计算文件名称';

        if (this.middataSocket == null) {
            this.middataSocket = new NodeSocket('middata', this, false);
            this.addSocket(this.middataSocket);
        }
        if (this.resultSocket == null) {
            this.resultSocket = new NodeSocket('result', this, false);
            this.addSocket(this.resultSocket);
        }
        if (this.errinfoSocket == null) {
            this.errinfoSocket = new NodeSocket('errinfo', this, false);
            this.addSocket(this.errinfoSocket);
        }
        if (this.fileRltSocket == null) {
            this.fileRltSocket = new NodeSocket('fileResult_arr', this, false);
            this.addSocket(this.fileRltSocket);
        }
        if (this.pic1Socket == null) {
            this.pic1Socket = new NodeSocket('pic1', this, false);
            this.addSocket(this.pic1Socket);
        }
        if (this.pic2Socket == null) {
            this.pic2Socket = new NodeSocket('pic2', this, false);
            this.addSocket(this.pic2Socket);
        }
        if (this.pic3Socket == null) {
            this.pic3Socket = new NodeSocket('pic3', this, false);
            this.addSocket(this.pic3Socket);
        }
        if (this.pic4Socket == null) {
            this.pic4Socket = new NodeSocket('pic4', this, false);
            this.addSocket(this.pic4Socket);
        }
        if (this.pic5Socket == null) {
            this.pic5Socket = new NodeSocket('pic5', this, false);
            this.addSocket(this.pic5Socket);
        }
        if (this.pic6Socket == null) {
            this.pic6Socket = new NodeSocket('pic6', this, false);
            this.addSocket(this.pic6Socket);
        }
        if (this.pic7Socket == null) {
            this.pic7Socket = new NodeSocket('pic7', this, false);
            this.addSocket(this.pic7Socket);
        }
        if (this.pic8Socket == null) {
            this.pic8Socket = new NodeSocket('pic8', this, false);
            this.addSocket(this.pic8Socket);
        }

        this.middataSocket.type = ValueType.String;
        this.resultSocket.type = ValueType.String;
        this.errinfoSocket.type = ValueType.String;
        this.pic1Socket.type = ValueType.String;
        this.pic2Socket.type = ValueType.String;
        this.pic3Socket.type = ValueType.String;
        this.pic4Socket.type = ValueType.String;
        this.pic5Socket.type = ValueType.String;
        this.pic6Socket.type = ValueType.String;
        this.pic7Socket.type = ValueType.String;
        this.pic8Socket.type = ValueType.String;
        this.fileRltSocket.type = ValueType.Array;
        this.middataSocket.label = '中间数据';
        this.resultSocket.label = '计算结果';
        this.pic1Socket.label = 'pic1';
        this.pic2Socket.label = 'pic2';
        this.pic3Socket.label = 'pic3';
        this.pic4Socket.label = 'pic4';
        this.pic5Socket.label = 'pic5';
        this.pic6Socket.label = 'pic6';
        this.pic7Socket.label = 'pic7';
        this.pic8Socket.label = 'pic8';
        this.errinfoSocket.label = '错误信息';
        this.fileRltSocket.label = '每个文件结果';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_liufeng', '../../../../extend_liufeng.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        myServerBlock.pushLine('var ' + this.id + '_config={', 1);
        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
            myServerBlock.pushLine(socket.name + ':' + this.id + '_' + socket.name + ',');
        });
        myServerBlock.subIndent();
        myServerBlock.pushLine('};');

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;

        myServerBlock.pushLine('var ' + dataVarName + " = yield extend_liufeng.cal_shuangzhoutest(" + this.id + "_config);");
        myServerBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        this.outputScokets_arr.forEach(socket => {
            selfCompileRet.setSocketOut(socket, dataVarName + '.' + socket.name);
        });
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }

            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_EX_LF_ShuangZhouTestDrawFile extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EX_LF_SHUANGZHOUTESTDRAWFILE, '双轴拉伸试验_绘制数据文件', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'picdata':
                        this.picdataSocket = socket;
                        break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'fileid':
                        this.fileidSocket = socket;
                        break;
                }
            });
        }
        if (this.fileidSocket == null) {
            this.fileidSocket = new NodeSocket('fileid', this, true);
            this.addSocket(this.fileidSocket);
        }

        this.fileidSocket.type = ValueType.Int;
        this.fileidSocket.label = '文件代码';

        if (this.picdataSocket == null) {
            this.picdataSocket = new NodeSocket('picdata', this, false);
            this.addSocket(this.picdataSocket);
        }


        this.picdataSocket.type = ValueType.Int;
        this.picdataSocket.label = '图像数据';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_liufeng', '../../../../extend_liufeng.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;

        myServerBlock.pushLine('var ' + dataVarName + " = yield extend_liufeng.draw_suangzhoudatafile(" + this.id + "_fileid);");
        myServerBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        this.outputScokets_arr.forEach(socket => {
            selfCompileRet.setSocketOut(socket, dataVarName + '.' + socket.name);
        });
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }

            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_EX_LF_ShuangZhouTestSplitFile extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EX_LF_SHUANGZHOUTESTSPLITFILE, '双轴拉伸试验_拆分数据文件', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'outPut': this.outSocket1 = socket; break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'fileid':
                        this.fileidSocket = socket;
                        break;
                }
            });
        }
        if (this.fileidSocket == null) {
            this.fileidSocket = new NodeSocket('fileid', this, true);
            this.addSocket(this.fileidSocket);
        }

        this.fileidSocket.type = ValueType.Int;
        this.fileidSocket.label = '文件代码';

        if (this.outSocket1 == null) {this.outSocket1 = this.addSocket(new NodeSocket('outPut', this, false));}
        this.outSocket1.type = ValueType.Object;
        this.outSocket1.label = 'outPut';
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_liufeng', '../../../../extend_liufeng.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;

        myServerBlock.pushLine('var ' + dataVarName + " = yield extend_liufeng.split_suangzhoudatafile(" + this.id + "_fileid);");
        myServerBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.outSocket1, dataVarName);
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }

            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_Ding_UpdateUser extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_DING_UPDATEUSER, '钉钉-更新用户信息', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case 'usercode':
                        this.usercodeSocket = socket;
                        break;
                    case 'dept_id_list':
                        this.dept_id_listSocket = socket;
                        break;
                        
                }
            });
        }
        if (this.usercodeSocket == null) {
            this.usercodeSocket = new NodeSocket('usercode', this, true);
            this.addSocket(this.usercodeSocket);
        }

        this.usercodeSocket.type = ValueType.Int;
        this.usercodeSocket.label = '用户代码';

        if (this.dept_id_listSocket == null) {
            this.dept_id_listSocket = new NodeSocket('dept_id_list', this, true);
            this.addSocket(this.dept_id_listSocket);
        }


        this.dept_id_listSocket.type = ValueType.String;
        this.dept_id_listSocket.label = '部门列表';
    }

    compileOnServer(helper, preNodes_arr, belongBlock) {
        var nodeThis = this;
        var thisNodeTitle = nodeThis.getNodeTitle();

        var params_arr = [];
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, theSocket != this.usercodeSocket);
                if (socketComRet.err) {
                    return false;
                }
                var socketValue = socketComRet.value;
                params_arr.push({ name: theSocket.name.trim().replace('@', ''), value: socketValue });
            }
        }

        var myJSBlock = new FormatFileBlock(this.id);
        belongBlock.pushChild(myJSBlock);

        var retVarName = 'ret_' + this.id;
        var dataVarName = 'data_' + this.id;
        myJSBlock.pushLine('var ' + dataVarName + '={', 1);
        this.inputScokets_arr.forEach(socket => {
            myJSBlock.pushLine(socket.name + ':' + inputSocketsVal[socket.name] + ',');
        });
        myJSBlock.subIndent();
        myJSBlock.pushLine('}');
        myServerBlock.pushLine('var ' + retVarName + " = yield dingHelper.modifyUser(" + dataVarName + ");");

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.inFlowSocket, '', myJSBlock);
        helper.setCompileRetCache(this, selfCompileRet);

        if (this.compileOutFlow(helper, usePreNodes_arr, belongBlock) == false) {
            return false;
        }
        return selfCompileRet;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.bluePrint.group == EJsBluePrintFunGroup.ServerScript) {
            return this.compileOnServer(helper, preNodes_arr, belongBlock);
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, theSocket != this.usercodeSocket);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');
        postCheckBlock.addIndent();

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        var retVarName = 'ret_' + this.id;
        var dataVarName = 'data_' + this.id;
        postCheckBlock.pushLine('var ' + dataVarName + '={', 1);
        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine(socket.name + ':' + inputSocketsVal[socket.name] + ',');
        });
        postCheckBlock.subIndent();
        postCheckBlock.pushLine('}');

        var errVarName = 'error_' + this.id;
        myServerBlock.pushLine('var ' + retVarName + " = yield dingHelper.modifyUser(" + dataVarName + ");");
        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        this.outputScokets_arr.forEach(socket => {
            selfCompileRet.setSocketOut(socket, dataVarName + '.' + socket.name);
        });
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            fetchEndBlock.pushLine('if(' + errVarName + '){callback_final(state, null,' + errVarName + ');}');
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }

            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + retVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_EX_StationDataChecker extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EX_STATIONDATACHECKER, '全站仪数据分析', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '返回值': this.returnValueSocket = socket; break;
                    case 'data': this.outDataSocket = socket; break;
                    case 'baseX': this.baseXSocket = socket; break;
                    case 'baseY': this.baseYSocket = socket; break;
                    case 'baseZ': this.baseZSocket = socket; break;
                    case '错误信息': this.错误信息Socket = socket; break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '项目代码':
                        this.项目代码Socket = socket;
                        break;
                    case '组号':
                        this.组号Socket = socket;
                        break;
                    case '顺序号':
                        this.顺序号Socket = socket;
                        break;
                    case '分序号':
                        this.分序号Socket = socket;
                        break;
                    case '数据文件代码':
                        this.数据文件代码Socket = socket;
                        break;
                    case '最大容差':
                        this.最大容差Socket = socket;
                        break;
                    case '最小间距':
                        this.最小间距Socket = socket;
                        break;
                    case '最小垂距':
                        this.最小垂距Socket = socket;
                        break;
                    case '锚点配置':
                        this.锚点配置Socket = socket;
                        break;
                }
            });
        }
        
        if (this.项目代码Socket == null) {
            this.项目代码Socket = new NodeSocket('项目代码', this, true);
            this.addSocket(this.项目代码Socket);
        }
        if (this.组号Socket == null) {
            this.组号Socket = new NodeSocket('组号', this, true);
            this.addSocket(this.组号Socket);
        }
        if (this.顺序号Socket == null) {
            this.顺序号Socket = new NodeSocket('顺序号', this, true);
            this.addSocket(this.顺序号Socket);
        }
        if (this.分序号Socket == null) {
            this.分序号Socket = new NodeSocket('分序号', this, true);
            this.addSocket(this.分序号Socket);
        }
        if (this.数据文件代码Socket == null) {
            this.数据文件代码Socket = new NodeSocket('数据文件代码', this, true);
            this.addSocket(this.数据文件代码Socket);
        }
        if (this.最大容差Socket == null) {
            this.最大容差Socket = new NodeSocket('最大容差', this, true);
            this.addSocket(this.最大容差Socket);
        }
        if (this.最小间距Socket == null) {
            this.最小间距Socket = new NodeSocket('最小间距', this, true);
            this.addSocket(this.最小间距Socket);
        }
        if (this.最小垂距Socket == null) {
            this.最小垂距Socket = new NodeSocket('最小垂距', this, true);
            this.addSocket(this.最小垂距Socket);
        }
        if (this.锚点配置Socket == null) {
            this.锚点配置Socket = new NodeSocket('锚点配置', this, true);
            this.addSocket(this.锚点配置Socket);
        }
        
        if (this.returnValueSocket == null) {
            this.returnValueSocket = this.addSocket(new NodeSocket('返回值', this, false));
        }
        if (this.outDataSocket == null) {
            this.outDataSocket = this.addSocket(new NodeSocket('data', this, false));
        }
        if(this.baseXSocket == null) {
            this.baseXSocket = this.addSocket(new NodeSocket('baseX', this, false));
        }
        if(this.baseYSocket == null) {
            this.baseYSocket = this.addSocket(new NodeSocket('baseY', this, false));
        }
        if(this.baseZSocket == null) {
            this.baseZSocket = this.addSocket(new NodeSocket('baseZ', this, false));
        }
        if(this.错误信息Socket == null) {
            this.错误信息Socket = this.addSocket(new NodeSocket('错误信息', this, false));
        }

        this.项目代码Socket.label = '项目代码';
        this.组号Socket.label = '组号';
        this.顺序号Socket.label = '顺序号';
        this.分序号Socket.label = '分序号';
        this.数据文件代码Socket.label = '数据文件代码';
        this.最大容差Socket.label = '最大容差';
        this.最大容差Socket.inputable = true;
        this.最小间距Socket.label = '最小间距';
        this.最小间距Socket.inputable = true;
        this.最小垂距Socket.label = '最小垂距';
        this.最小垂距Socket.inputable = true;
        this.锚点配置Socket.label = '锚点配置';

        this.returnValueSocket.label = '返回值';
        this.outDataSocket.label = '测点数据';
        this.outDataSocket.type = ValueType.Array;
        this.baseXSocket.label = 'baseX';
        this.baseYSocket.label = 'baseY';
        this.baseZSocket.label = 'baseZ';
        this.错误信息Socket.label = '错误信息';
        this.错误信息Socket.type = ValueType.Array;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_zhaozhimiao', '../../../../extend_zhaozhimiao.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        myServerBlock.pushLine(`var ${dataVarName}=null;`);
        var tryBlock = new JSFile_Try('try');
        myServerBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(`${dataVarName} = yield extend_zhaozhimiao.checkStationData(${this.id}_锚点配置,${this.id}_项目代码,${this.id}_组号,${this.id}_顺序号,${this.id}_分序号,${this.id}_数据文件代码,${this.id}_最大容差,${this.id}_最小间距,${this.id}_最小垂距);`);
        tryBlock.bodyBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.returnValueSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName + '.rcd_arr');
        selfCompileRet.setSocketOut(this.baseXSocket, dataVarName + '.baseX');
        selfCompileRet.setSocketOut(this.baseYSocket, dataVarName + '.baseY');
        selfCompileRet.setSocketOut(this.baseZSocket, dataVarName + '.baseZ');
        selfCompileRet.setSocketOut(this.错误信息Socket, dataVarName + '.errList');
        
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

class JSNODE_EX_StationDataLoader extends JSNode_Base {
    constructor(initData, parentNode, createHelper, nodeJson) {
        super(initData, parentNode, createHelper, JSNODE_EX_STATIONDATALOADER, '全站仪数据读取', false, nodeJson);
        autoBind(this);
        this.hadFetchFun = true;
        this.genCloseure = true;

        if (this.inFlowSocket == null) {
            this.inFlowSocket = new NodeFlowSocket('flow_i', this, true);
            this.addSocket(this.inFlowSocket);
        }

        if (this.outFlowSockets_arr == null || this.outFlowSockets_arr.length == 0) {
            this.outFlowSockets_arr = [];
            this.serverFlowSocket = new NodeFlowSocket('server', this, false);
            this.addSocket(this.serverFlowSocket);
            this.clientFlowSocket = new NodeFlowSocket('client', this, false);
            this.addSocket(this.clientFlowSocket);
        }
        else {
            for (var si in this.outFlowSockets_arr) {
                switch (this.outFlowSockets_arr[si].name) {
                    case 'server':
                        this.serverFlowSocket = this.outFlowSockets_arr[si];
                        break;
                    case 'client':
                        this.clientFlowSocket = this.outFlowSockets_arr[si];
                        break;
                }
            }
        }
        this.serverFlowSocket.label = 'server';
        this.clientFlowSocket.label = 'client';

        if (this.outputScokets_arr.length > 0) {
            this.outputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '返回值': this.returnValueSocket = socket; break;
                    case 'data': this.outDataSocket = socket; break;
                    case 'baseX': this.baseXSocket = socket; break;
                    case 'baseY': this.baseYSocket = socket; break;
                    case 'baseZ': this.baseZSocket = socket; break;
                    case 'tag': this.tagSocket = socket; break;
                    case '错误信息': this.错误信息Socket = socket; break;
                }
            });
        }
        if (this.inputScokets_arr.length > 0) {
            this.inputScokets_arr.forEach(socket => {
                switch (socket.name) {
                    case '数据文件代码':
                        this.数据文件代码Socket = socket;
                        break;
            }});
        }
        

        if (this.数据文件代码Socket == null) {
            this.数据文件代码Socket = new NodeSocket('数据文件代码', this, true);
            this.addSocket(this.数据文件代码Socket);
        }
        
        if (this.returnValueSocket == null) {
            this.returnValueSocket = this.addSocket(new NodeSocket('返回值', this, false));
        }
        if (this.outDataSocket == null) {
            this.outDataSocket = this.addSocket(new NodeSocket('data', this, false));
        }
        if(this.baseXSocket == null) {
            this.baseXSocket = this.addSocket(new NodeSocket('baseX', this, false));
        }
        if(this.baseYSocket == null) {
            this.baseYSocket = this.addSocket(new NodeSocket('baseY', this, false));
        }
        if(this.baseZSocket == null) {
            this.baseZSocket = this.addSocket(new NodeSocket('baseZ', this, false));
        }
        if(this.tagSocket == null) {
            this.tagSocket = this.addSocket(new NodeSocket('tag', this, false));
        }
        if(this.错误信息Socket == null) {
            this.错误信息Socket = this.addSocket(new NodeSocket('错误信息', this, false));
        }

        this.数据文件代码Socket.label = '数据文件代码';

        this.returnValueSocket.label = '返回值';
        this.outDataSocket.label = '测点数据';
        this.outDataSocket.type = ValueType.Array;
        this.tagSocket.label = 'tag';
        this.baseXSocket.label = 'baseX';
        this.baseYSocket.label = 'baseY';
        this.baseZSocket.label = 'baseZ';
        this.错误信息Socket.label = '错误信息';
        this.错误信息Socket.type = ValueType.Array;
    }

    compile(helper, preNodes_arr, belongBlock) {
        var superRet = super.compile(helper, preNodes_arr);
        if (superRet == false || superRet != null) {
            return superRet;
        }

        var nodeThis = this;
        var usePreNodes_arr = preNodes_arr.concat(this);
        if (this.checkCompileFlag(this.bluePrint.group == EJsBluePrintFunGroup.ServerScript, '此节点的暂不支持在服务端被使用', helper)) {
            return false;
        }

        var theScope = belongBlock.getScope();
        var blockInServer = theScope && theScope.isServerSide;
        var belongFun = theScope ? theScope.fun : null;
        var theServerSide = helper.serverSide;

        var inputSocketsVal = {};
        if (this.inputScokets_arr.length > 0) {
            for (var i = 0; i < this.inputScokets_arr.length; ++i) {
                var theSocket = this.inputScokets_arr[i];
                var socketComRet = this.getSocketCompileValue(helper, theSocket, usePreNodes_arr, belongBlock, true, false);
                if (socketComRet.err) {
                    return false;
                }
                inputSocketsVal[theSocket.name] = socketComRet.value;
            }
        }
        var myServerBlock = new FormatFileBlock('serverblock');
        var postBundleVarName = this.bluePrint.id + '_bundle';

        var serverFun = null;
        var serverFunBodyBlock = null;
        var postCheckBlock = new FormatFileBlock('postCheckBlock');
        var postVarinitBlock = new FormatFileBlock('postVarInit');

        if (theServerSide == null) {
            theServerSide = new CP_ServerSide({});
        }
        else {
            theServerSide.appendImport('extend_zhaozhimiao', '../../../../extend_zhaozhimiao.js');
        }

        var serverSideActName = this.bluePrint.id + '_' + this.id;
        if (!blockInServer) {
            var serverSideFun = theServerSide.scope.getFunction(serverSideActName, true, ['req', 'res']);
            theServerSide.initProcessFun(serverSideFun, this.bluePrint.ctlKernel, true);
            helper.appendOutputItem(serverSideFun);

            serverSideFun.scope.getVar(postBundleVarName, true, "req.body." + VarNames.Bundle);
            serverSideFun.pushLine("if(" + postBundleVarName + "==null){return serverhelper.createErrorRet('缺少参数bundle');}");
            postCheckBlock.pushChild(postVarinitBlock);
            serverSideFun.bundleCheckBlock = postCheckBlock;
            serverSideFun.postVarinitBlock = postVarinitBlock;
            theServerSide.processesMapVarInitVal[serverSideFun.name] = serverSideFun.name;
            serverFun = serverSideFun;
            serverFunBodyBlock = serverSideFun.bodyBlock;
        }
        else {
            // 已处于服务端
            serverFun = belongFun;
            serverFunBodyBlock = belongBlock;
            postVarinitBlock = belongFun.postVarinitBlock;
        }
        this.serverFun = serverFun;
        serverFunBodyBlock.pushChild(postCheckBlock);
        serverFunBodyBlock.pushChild(myServerBlock);
        var initBundleBlock = null;
        if (serverFun.bundleCheckBlock.initBundleBlock) {
            initBundleBlock = serverFun.bundleCheckBlock.initBundleBlock;
        }
        else {
            initBundleBlock = new FormatFileBlock('initbundle');
            serverFun.bundleCheckBlock.initBundleBlock = initBundleBlock;
        }
        helper.addInitClientBundleBlock(initBundleBlock);

        var useClientVariablesRlt = new UseClientVariableResult();
        this.getUseClientVariable(helper, this, belongFun, null, useClientVariablesRlt);
        useClientVariablesRlt.variables_arr.forEach(varCon => {
            initBundleBlock.params_map[varCon.name] = varCon.name;
            if (serverFun) {
                serverFun.scope.getVar(varCon.name, true);
                postVarinitBlock.pushLine(makeLine_Assign(varCon.name, postBundleVarName + '.' + varCon.name));
            }
        });

        this.inputScokets_arr.forEach(socket => {
            postCheckBlock.pushLine('var ' + this.id + '_' + socket.name + '=' + inputSocketsVal[socket.name] + ';');
            postCheckBlock.pushLine("if(" + this.id + '_' + socket.name + ' == null' + '){return serverhelper.createErrorRet("缺少参数[' + socket.name + ']");}');
        });

        var dataVarName = 'data_' + this.id;
        var errVarName = 'error_' + this.id;
        myServerBlock.pushLine(`var ${dataVarName}=null;`);
        var tryBlock = new JSFile_Try('try');
        myServerBlock.pushChild(tryBlock);
        tryBlock.errorBlock.pushLine("return serverhelper.createErrorRet(eo.message);");
        tryBlock.bodyBlock.pushLine(`${dataVarName} = yield extend_zhaozhimiao.loadStationData(${this.id}_数据文件代码);`);
        tryBlock.bodyBlock.pushLine('if(' + dataVarName + '.err){return serverhelper.createErrorRet(' + dataVarName + '.err);}');

        var myClientBlock = new FormatFileBlock('client');
        var fetchEndBlock = null;

        var serverFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.serverFlowSocket);
        var clientFlow_links = this.bluePrint.linkPool.getLinksBySocket(this.clientFlowSocket);
        if (blockInServer) {
            if (this.checkCompileFlag(clientFlow_links.length > 0, '此节点的client流无法被执行到', helper)) {
                return false;
            }
        }
        else {
            helper.compilingFun.hadServerFetch = true;
            this.hadServerFetch = !blockInServer;
            belongBlock.pushChild(myClientBlock);

            var bundleVarName = VarNames.Bundle + '_' + this.id;
            myClientBlock.pushLine("var " + bundleVarName + " = Object.assign({}," + VarNames.BaseBunlde + ",{", 1);
            myClientBlock.pushChild(initBundleBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('});');

            var callBack_bk = new FormatFileBlock('callback' + this.id);
            myClientBlock.pushChild(callBack_bk);
            var inreducer = this.isInReducer(preNodes_arr);
            if (inreducer) {
                myClientBlock.pushLine('setTimeout(() => {', 1);
            }
            if (this.bluePrint.group != EJsBluePrintFunGroup.Custom) {
                myClientBlock.pushLine("if(fetchTracer[" + VarNames.FetchKey + "] != fetchid) return;");
            }
            myClientBlock.pushLine(makeLine_FetchFTDCallBack(this.bluePrint.ctlKernel, serverSideActName, bundleVarName, dataVarName, errVarName), 1);
            fetchEndBlock = new FormatFileBlock('fetchend');
            if (this.bluePrint.group == EJsBluePrintFunGroup.Custom) {
                fetchEndBlock.pushLine('if(' + errVarName + '){return _callback(null,' + errVarName + ');}');
            }
            else {
                fetchEndBlock.pushLine('if(' + errVarName + '){return callback_final(state, null,' + errVarName + ');}');
            }
            myClientBlock.pushChild(fetchEndBlock);
            myClientBlock.subNextIndent();
            myClientBlock.pushLine('},false)));');
            myClientBlock.subNextIndent();
            if (inreducer) {
                myClientBlock.pushLine('}, 50);');
            }
        }

        var selfCompileRet = new CompileResult(this);
        selfCompileRet.setSocketOut(this.returnValueSocket, dataVarName);
        selfCompileRet.setSocketOut(this.outDataSocket, dataVarName + '.rcd_arr');
        selfCompileRet.setSocketOut(this.tagSocket, dataVarName + '.tag');
        selfCompileRet.setSocketOut(this.baseXSocket, dataVarName + '.baseX');
        selfCompileRet.setSocketOut(this.baseYSocket, dataVarName + '.baseY');
        selfCompileRet.setSocketOut(this.baseZSocket, dataVarName + '.baseZ');
        selfCompileRet.setSocketOut(this.错误信息Socket, dataVarName + '.errList');
        
        helper.setCompileRetCache(this, selfCompileRet);

        if (blockInServer) {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myServerBlock);
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, myServerBlock) == false) {
                    return false;
                }
            }
        }
        else {
            selfCompileRet.setSocketOut(this.inFlowSocket, '', myClientBlock);
            if (clientFlow_links.length > 0) {
                if (this.compileFlowNode(clientFlow_links[0], helper, usePreNodes_arr, fetchEndBlock) == false) {
                    return false;
                }
            }
            if (serverFlow_links.length > 0) {
                if (this.compileFlowNode(serverFlow_links[0], helper, usePreNodes_arr, tryBlock.bodyBlock) == false) {
                    return false;
                }
            }
            else {
                myServerBlock.pushLine('return ' + dataVarName + ';');
            }
        }
        return selfCompileRet;
    }
}

JSNodeClassMap[JSNODE_EX_LF_SHUANGZHOUTESTCAL] = {
    modelClass: JSNODE_EX_LF_ShuangZhouTestCal,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_EX_LF_SHUANGZHOUTESTDRAWFILE] = {
    modelClass: JSNODE_EX_LF_ShuangZhouTestDrawFile,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_EX_LF_SHUANGZHOUTESTSPLITFILE] = {
    modelClass: JSNODE_EX_LF_ShuangZhouTestSplitFile,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_DING_UPDATEUSER] = {
    modelClass: JSNODE_Ding_UpdateUser,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_EX_STATIONDATACHECKER] = {
    modelClass: JSNODE_EX_StationDataChecker,
    comClass: C_Node_SimpleNode,
};

JSNodeClassMap[JSNODE_EX_STATIONDATALOADER] = {
    modelClass: JSNODE_EX_StationDataLoader,
    comClass: C_Node_SimpleNode,
};

JSNodeEditorControls_arr.push(
{
    label: '双轴拉伸试验计算',
    nodeClass: JSNODE_EX_LF_ShuangZhouTestCal,
    type: '扩展'
});

JSNodeEditorControls_arr.push(
{
    label: '双轴拉伸绘制数据文件',
    nodeClass: JSNODE_EX_LF_ShuangZhouTestDrawFile,
    type: '扩展'
});

JSNodeEditorControls_arr.push(
{
    label: '双轴拉伸绘制拆分文件',
    nodeClass: JSNODE_EX_LF_ShuangZhouTestSplitFile,
    type: '扩展'
});

JSNodeEditorControls_arr.push(
{
    label: '钉钉-更新用户信息',
    nodeClass: JSNODE_Ding_UpdateUser,
    type: '扩展'
});

JSNodeEditorControls_arr.push(
{
    label: '全站仪数据分析',
    nodeClass: JSNODE_EX_StationDataChecker,
    type: '扩展'
});

JSNodeEditorControls_arr.push(
{
    label: '加载全站仪数据',
    nodeClass: JSNODE_EX_StationDataLoader,
    type: '扩展'
});
