'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProjectCompiler = function (_EventEmitter) {
    _inherits(ProjectCompiler, _EventEmitter);

    function ProjectCompiler(project, projProfile) {
        _classCallCheck(this, ProjectCompiler);

        var _this = _possibleConstructorReturn(this, (ProjectCompiler.__proto__ || Object.getPrototypeOf(ProjectCompiler)).call(this));

        EnhanceEventEmiter(_this);
        _this.project = project;
        _this.projProfile = projProfile;

        autoBind(_this);
        return _this;
    }

    _createClass(ProjectCompiler, [{
        key: 'getMidData',
        value: function getMidData(key) {
            if (typeof key !== 'string') {
                console.error('getMidData key must string');
            }
            var rlt = this.midData_map[key];
            if (rlt == null) {
                rlt = {
                    needSetStates_arr: []
                };
                this.midData_map[key] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'getCache',
        value: function getCache(key) {
            if (typeof key !== 'string') {
                console.error('getCache key must string');
            }
            return this.cache_map[key];
        }
    }, {
        key: 'setCache',
        value: function setCache(key, value) {
            this.cache_map[key] = value;
        }
    }, {
        key: 'clickSqlCompilerLogBadgeItemHandler',
        value: function clickSqlCompilerLogBadgeItemHandler(badgeItem) {
            console.log('clickSqlCompilerLogBadgeItemHandler');
            if (badgeItem.data) {
                var project = this.project;
                var designer = project.designer;
                designer.forcusSqlNode(badgeItem.data);
            }
        }
    }, {
        key: 'clickKernelLogBadgeItemHandler',
        value: function clickKernelLogBadgeItemHandler(badgeItem) {
            console.log('clickSqlCompilerLogBadgeItemHandler');
            if (badgeItem.data) {
                var project = this.project;
                var designer = project.designer;
                designer.selectKernel(badgeItem.data);
            }
        }
    }, {
        key: 'stopCompile',
        value: function stopCompile(isCompleted, stopInfo) {
            var project = this.project;
            var logManager = project.logManager;
            var errCount = logManager.getCount(LogTag_Error);
            this.isCompleted = errCount == 0 && isCompleted;
            if (!IsEmptyString(stopInfo)) {
                logManager.log("发生错误,项目编译已终止");
                this.isCompleted = false;
            }
            logManager.log('项目编译完成,共' + logManager.getCount(LogTag_Warning) + '条警告,' + logManager.getCount(LogTag_Error) + '条错误,');
            this.fireEvent('completed');
        }
    }, {
        key: 'compile',
        value: function compile() {
            var project = this.project;
            var logManager = project.logManager;
            this.midData_map = {};
            this.cache_map = {};
            logManager.clear();
            logManager.log('执行项目编译');

            // compile all sql_blueprint
            var ti;
            var BP_sql_arr = project.dataMaster.BP_sql_arr;
            for (ti in BP_sql_arr) {
                var sql_blueprint = BP_sql_arr[ti];
                if (sql_blueprint.group != 'custom') {
                    continue;
                }
                logManager.log("编译[" + sql_blueprint.name + ']');
                var bpCompileHelper = new SqlNode_CompileHelper(logManager, null);
                bpCompileHelper.clickLogBadgeItemHandler = this.clickSqlCompilerLogBadgeItemHandler;
                var compileRet = sql_blueprint.compile(bpCompileHelper);
                if (compileRet == false) {
                    this.stopCompile(false, "发生错误,项目编译已终止");
                    return false;
                }
                this.setCache(sql_blueprint.code + '_sql', compileRet.sql);
            }

            this.projectName = this.projProfile ? this.projProfile.enName : project.getAttribute(AttrNames.RealName);
            this.flowName = this.projProfile ? this.projProfile.flowName : '';
            this.projectTitle = project.getAttribute(AttrNames.Title);

            var serverSide = new CP_ServerSide(this);
            this.serverSide = serverSide;

            var mobileContentCompiler = new MobileContentCompiler(this);
            this.mobileContentCompiler = mobileContentCompiler;

            mobileContentCompiler.compile();

            mobileContentCompiler.compileEnd();
            this.serverSide.compileEnd();

            console.log(mobileContentCompiler.getString());
            console.log(this.serverSide.getString());

            this.stopCompile(true);
        }
    }]);

    return ProjectCompiler;
}(EventEmitter);

var ContentCompiler = function (_EventEmitter2) {
    _inherits(ContentCompiler, _EventEmitter2);

    function ContentCompiler(projectCompiler) {
        _classCallCheck(this, ContentCompiler);

        var _this2 = _possibleConstructorReturn(this, (ContentCompiler.__proto__ || Object.getPrototypeOf(ContentCompiler)).call(this));

        EnhanceEventEmiter(_this2);
        _this2.project = projectCompiler.project;
        _this2.projectCompiler = projectCompiler;
        _this2.serverSide = projectCompiler.serverSide;
        _this2.logManager = projectCompiler.logManager;
        //this.handlebars = new CP_HandleBarsItem(this);

        _this2.clientSide = new CP_ClientSide(projectCompiler);
        return _this2;
    }

    _createClass(ContentCompiler, [{
        key: 'compile',
        value: function compile() {
            return true;
        }
    }, {
        key: 'compileEnd',
        value: function compileEnd() {
            this.clientSide.compileEnd();
        }
    }]);

    return ContentCompiler;
}(EventEmitter);

var CP_HandleBarsItem = function () {
    function CP_HandleBarsItem(belongCompiler) {
        _classCallCheck(this, CP_HandleBarsItem);

        this.belongCompiler = belongCompiler;
        this.headItemKeys = {};
        this.scriptItemKeys = {};
        this.headItems_arr = [];
        this.scriptItems_arr = [];
    }

    _createClass(CP_HandleBarsItem, [{
        key: 'pushHeadItem',
        value: function pushHeadItem(key, target) {
            if (target == null) {
                console.warn('pushHeadItem target is null');
                return false;
            }
            if (IsEmptyString(key)) {
                console.warn('pushHeadItem key is null');
                return false;
            }
            if (this.headItemKeys[key] != null) {
                this.belongCompiler.warn('Head item:' + key + ' 重复声明');
                return false;
            }
            this.headItems_arr.push(target);
            this.headItemKeys[key] = key;
            return true;
        }
    }, {
        key: 'pushScriptPath',
        value: function pushScriptPath(key, path) {
            if (IsEmptyString(path)) {
                console.warn('pushScriptPath path is null');
                return false;
            }
            if (IsEmptyString(key)) {
                console.warn('pushScriptPath key is null');
                return false;
            }
            if (this.scriptItemKeys[key] != null) {
                this.belongCompiler.warn('script path:' + key + ' 重复声明');
                return false;
            }
            this.scriptItems_arr.push(path);
            this.scriptItemKeys[key] = key;
            return true;
        }
    }, {
        key: 'compileEnd',
        value: function compileEnd() {
            var fileMaker = new FormatFileMaker();
            var targetBlock = fileMaker.defaultRegion.defaultBlock;
            if (this.headItems_arr.length > 0) {
                targetBlock.pushLine("{{#section 'head'}}", 1);
                this.headItems_arr.forEach(function (item) {
                    targetBlock.pushLine(item);
                });
                targetBlock.subNextIndent();
                targetBlock.pushLine("{{/section}}");
            }
            if (this.scriptItems_arr.length > 0) {
                targetBlock.pushLine("{{#section 'script'}}", 1);
                this.scriptItems_arr.forEach(function (path) {
                    targetBlock.pushLine('<script src="' + path + '"></script>');
                });
                targetBlock.subNextIndent();
                targetBlock.pushLine("{{/section}}");
            }
            this.fileMaker = fileMaker;
        }
    }, {
        key: 'getString',
        value: function getString() {
            return this.fileMaker.getString();
        }
    }]);

    return CP_HandleBarsItem;
}();