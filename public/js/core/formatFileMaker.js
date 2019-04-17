'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormatFile_ItemBase = function () {
    function FormatFile_ItemBase(indent) {
        _classCallCheck(this, FormatFile_ItemBase);

        this.indent = ReplaceIfNaN(indent, 0);
    }

    _createClass(FormatFile_ItemBase, [{
        key: 'addIndent',
        value: function addIndent() {
            this.indent += 1;
        }
    }, {
        key: 'subIndent',
        value: function subIndent() {
            this.indent -= 1;
        }
    }, {
        key: 'getIndentString',
        value: function getIndentString(indentChar) {
            var indentContent = '';
            for (var i = 0; i < this.indent; ++i) {
                indentContent += indentChar;
            }
            return indentContent;
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar) {
            return 'not impleted';
        }
    }, {
        key: 'getScope',
        value: function getScope() {
            var testObj = this;
            while (testObj) {
                if (testObj.scope) {
                    return testObj.scope;
                }
                testObj = testObj.parent;
            }
            return null;
        }
    }]);

    return FormatFile_ItemBase;
}();

var FormatFile_Line = function (_FormatFile_ItemBase) {
    _inherits(FormatFile_Line, _FormatFile_ItemBase);

    function FormatFile_Line(content, indent, endChar) {
        _classCallCheck(this, FormatFile_Line);

        var _this = _possibleConstructorReturn(this, (FormatFile_Line.__proto__ || Object.getPrototypeOf(FormatFile_Line)).call(this, indent));

        if (content == null) {
            console.warn('FormatFile_Line content is null');
            content = '';
        } else {
            content = content.trim();
        }
        _this.endChar = endChar;
        _this.hadEndChar = !IsEmptyString(endChar);
        if (content.length > 0 && _this.hadEndChar) {
            if (content[content.length - 1] != endChar) {
                content += endChar;
            }
        }
        _this.content = content;
        return _this;
    }

    _createClass(FormatFile_Line, [{
        key: 'clone',
        value: function clone() {
            return new FormatFile_Line(this.content, this.indent, this.endChar);
        }
    }, {
        key: 'append',
        value: function append(content) {
            if (content == null) {
                console.warn('FormatFile_Line append content is null');
                content = '';
            }
            if (this.hadEndChar) {
                this.content = this.content.substr(0, this.content.length - 1) + content;
            }
            this.content = this.content + content;
            if (this.hadEndChar) {
                if (content[content.length - 1] != endChar) {
                    this.content += endChar;
                }
            }
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar) {
            return prefixStr + this.getIndentString(indentChar) + this.content;
        }
    }]);

    return FormatFile_Line;
}(FormatFile_ItemBase);

var FormatFileBlock = function (_FormatFile_ItemBase2) {
    _inherits(FormatFileBlock, _FormatFile_ItemBase2);

    function FormatFileBlock(name, priority) {
        _classCallCheck(this, FormatFileBlock);

        var _this2 = _possibleConstructorReturn(this, (FormatFileBlock.__proto__ || Object.getPrototypeOf(FormatFileBlock)).call(this));

        _this2.name = name;
        _this2.priority = ReplaceIfNaN(priority, 1);

        _this2.childs_arr = [];
        _this2.getStringCallbacker = [];
        _this2.nextLineIndent = 0;
        _this2.childs_map = {};
        return _this2;
    }

    _createClass(FormatFileBlock, [{
        key: 'isEmpty',
        value: function isEmpty() {
            return this.childs_arr.length == 0;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.childs_arr = [];
            this.nextLineIndent = 0;
            this.childs_map = {};
        }
    }, {
        key: 'clone',
        value: function clone() {
            var rlt = new FormatFileBlock(this.name, this.priority);
            this.childs_arr.forEach(function (child) {
                rlt.pushChild(child.clone());
            });
            rlt.nextLineIndent = this.nextLineIndent;
            return rlt;
        }
    }, {
        key: 'addGetStringLisener',
        value: function addGetStringLisener(fun) {
            var index = this.getStringCallbacker.indexOf(fun);
            if (index == -1) {
                this.getStringCallbacker.push(fun);
            }
        }
    }, {
        key: 'removeGetStringLisener',
        value: function removeGetStringLisener(fun) {
            var index = this.getStringCallbacker.indexOf(fun);
            if (index != -1) {
                this.getStringCallbacker.splice(indent, 1);
            }
        }
    }, {
        key: 'addNextIndent',
        value: function addNextIndent() {
            this.nextLineIndent += 1;
        }
    }, {
        key: 'subNextIndent',
        value: function subNextIndent() {
            this.nextLineIndent -= 1;
        }
    }, {
        key: 'pushChild',
        value: function pushChild(child) {
            if (!IsEmptyString(child.name)) {
                this.childs_map[child.name] = child;
            }
            child.parent = this;
            child.indent = this.nextLineIndent;
            this.childs_arr.push(child);
        }
    }, {
        key: 'getChild',
        value: function getChild(childName) {
            return this.childs_map[childName];
        }
    }, {
        key: 'pushLine',
        value: function pushLine(lineItem, indentOffset) {
            var itemType = typeof lineItem === 'undefined' ? 'undefined' : _typeof(lineItem);
            if (itemType === 'string') {
                lineItem = new FormatFile_Line(lineItem, this.nextLineIndent);
            } else if (!FormatFile_Line.prototype.isPrototypeOf(lineItem)) {
                console.error('不支持的lineitem！');
            } else {
                lineItem.indent = this.nextLineIndent;
            }
            lineItem.parent = this;
            this.childs_arr.push(lineItem);
            this.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var indentString = this.getIndentString(indentChar);
            var rlt = '';
            this.childs_arr.forEach(function (child) {
                var childStr = child.getString(prefixStr + indentString, indentChar, newLineChar);
                if (childStr.length > 0) {
                    rlt += childStr + (childStr[childStr.length - 1] == newLineChar ? '' : newLineChar);
                }
            });

            this.getStringCallbacker.forEach(function (callBack) {
                rlt = callBack(rlt, indentChar, newLineChar, prefixStr);
                if (rlt == null) {
                    console.error('getStringCallbacker return null');
                }
            });

            return rlt;
        }
    }]);

    return FormatFileBlock;
}(FormatFile_ItemBase);

var FormatHtmlTag = function (_FormatFile_ItemBase3) {
    _inherits(FormatHtmlTag, _FormatFile_ItemBase3);

    function FormatHtmlTag(name, tagName, clientSide) {
        _classCallCheck(this, FormatHtmlTag);

        var _this3 = _possibleConstructorReturn(this, (FormatHtmlTag.__proto__ || Object.getPrototypeOf(FormatHtmlTag)).call(this));

        _this3.name = name;
        _this3.tagName = tagName;
        _this3.clientSide = clientSide;
        _this3.class = {};
        _this3.style = {};
        _this3.switch = {};
        _this3.attrObj = {};
        _this3.childs_map = {};
        _this3.childs_arr = [];
        return _this3;
    }

    _createClass(FormatHtmlTag, [{
        key: 'clone',
        value: function clone() {
            var rlt = new FormatHtmlTag(this.name, this.tagName, this.clientSide);
            this.childs_arr.forEach(function (child) {
                rlt.pushChild(child.clone());
            });
            rlt.class = Object.assign({}, this.class);
            rlt.style = Object.assign({}, this.style);
            rlt.switch = Object.assign({}, this.switch);
            rlt.attrObj = Object.assign({}, this.attrObj);
            return rlt;
        }
    }, {
        key: 'setAttr',
        value: function setAttr(name, value) {
            this.attrObj[name] = value;
        }
    }, {
        key: 'addSwitchClass',
        value: function addSwitchClass(switchName, switchVal, existsProcess) {
            if (this.switch[switchName] != null) {
                switch (existsProcess) {
                    case 'set':
                        this.class[this.switch[switchName].name] = 0;
                        break;
                    default:
                        return false;
                }
            }
            var className = switchName + '-' + switchVal;
            this.switch[switchName] = { name: className, val: switchVal };
            this.class[className] = 1;
            return true;
        }
    }, {
        key: 'addClass',
        value: function addClass(className, existsProcess) {
            if (IsEmptyString(className)) {
                return false;
            }
            var t_arr = g_switchClassNameReg.exec(className);
            if (t_arr != null) {
                var switchName = className.substr(0, className.length - t_arr[0].length);
                var switchVal = t_arr[0].substr(1);
                return this.addSwitchClass(switchName, switchVal, existsProcess);
            }

            this.class[className] = 1;
            return true;
        }
    }, {
        key: 'addStyle',
        value: function addStyle(name, val) {
            if (IsEmptyString(name) || val == null) {
                return false;
            }
            this.style[name] = val;
            return true;
        }
    }, {
        key: 'getClassName',
        value: function getClassName() {
            var rlt = '';
            for (var si in this.class) {
                if (this.class[si] == 0) continue;
                rlt += si + ' ';
            }
            return rlt;
        }
    }, {
        key: 'pushChild',
        value: function pushChild(child) {
            if (!IsEmptyString(child.name)) {
                this.childs_map[child.name] = child;
            }
            child.parent = this;
            child.indent = this.nextLineIndent;
            this.childs_arr.push(child);
        }
    }, {
        key: 'pushLine',
        value: function pushLine(lineItem, indentOffset) {
            var itemType = typeof lineItem === 'undefined' ? 'undefined' : _typeof(lineItem);
            if (itemType === 'string') {
                lineItem = new FormatFile_Line(lineItem, this.nextLineIndent);
            } else if (!FormatFile_Line.prototype.isPrototypeOf(lineItem)) {
                console.error('不支持的lineitem！');
            } else {
                lineItem.indent = this.nextLineIndent;
            }
            lineItem.parent = this;
            this.childs_arr.push(lineItem);
            this.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
        }
    }, {
        key: 'getChild',
        value: function getChild(childName) {
            return this.childs_map[childName];
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var rlt = prefixStr + '<' + this.tagName;
            var className = this.getClassName();
            if (!IsEmptyString(className)) {
                rlt += " className='" + className + "'";
            }
            var styleID = (this.attrObj.id == null ? this.styleCounter++ : this.attrObj.id) + '_style';
            if (this.clientSide.addStyleObject(styleID, this.style)) {
                rlt += " style={" + styleID + "}";
            }

            for (var i in this.attrObj) {
                var attrVal = this.attrObj[i];
                if (IsEmptyString(attrVal)) {
                    continue;
                }
                switch (attrVal[0]) {
                    case '{':
                    case "'":
                        break;
                    default:
                        attrVal = "'" + attrVal + "'";
                }
                rlt += ' ' + i + '=' + attrVal;
            }
            if (this.childs_arr.length > 0) {
                rlt += '>' + newLineChar;
                for (var ci in this.childs_arr) {
                    var child = this.childs_arr[ci];
                    rlt += child.getString(prefixStr + indentChar, indentChar, newLineChar) + newLineChar;
                }
                rlt += prefixStr + '</' + this.tagName + '>';
            } else {
                rlt += ' />';
            }
            return rlt;
        }
    }]);

    return FormatHtmlTag;
}(FormatFile_ItemBase);

var FormatFileRegion = function (_FormatFile_ItemBase4) {
    _inherits(FormatFileRegion, _FormatFile_ItemBase4);

    function FormatFileRegion(name, priority) {
        _classCallCheck(this, FormatFileRegion);

        var _this4 = _possibleConstructorReturn(this, (FormatFileRegion.__proto__ || Object.getPrototypeOf(FormatFileRegion)).call(this));

        _this4.name = name;
        _this4.blocks_map = {};
        _this4.blocks_arr = [];
        _this4.priority = ReplaceIfNaN(priority, 1);
        var defaultBlock = _this4.getBlock('default', true, 0);
        _this4.defaultBlock = defaultBlock;
        return _this4;
    }

    _createClass(FormatFileRegion, [{
        key: 'clone',
        value: function clone() {
            var rlt = new FormatFileRegion(this.name, this.priority);
            rlt.blocks_map = {};
            rlt.blocks_arr = [];
            this.blocks_arr.forEach(function (block) {
                var newBlock = block.clone();
                rlt.getBlock(newBlock.name, true, newBlock.priority);
            });
            rlt.defaultBlock = rlt.getBlock('default');
            return rlt;
        }
    }, {
        key: 'sortFun',
        value: function sortFun(a, b) {
            return a.priority <= b.priority;
        }
    }, {
        key: 'getBlock',
        value: function getBlock(blockName, autoCreate, priority) {
            var rlt = this.blocks_map[blockName];
            if (rlt == null && autoCreate) {
                if (priority == null && this.blocks_arr.length > 0) {
                    var nowMax = 0;
                    this.blocks_arr.forEach(function (x) {
                        nowMax = Math.max(x.priority, nowMax);
                    });
                    priority = nowMax + 1;
                }

                rlt = new FormatFileBlock(blockName, priority);
                this.blocks_arr.push(rlt);
                this.blocks_map[rlt.name] = rlt;
                rlt.parent = this;
            }
            return rlt;
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var indentString = this.getIndentString(indentChar);
            var rlt = '';

            this.blocks_arr.sort(this.sortFun);
            this.blocks_arr.forEach(function (block) {
                rlt += block.getString(prefixStr + indentString, indentChar, newLineChar);
            });
            return rlt;
        }
    }]);

    return FormatFileRegion;
}(FormatFile_ItemBase);

var FormatFileMaker = function () {
    function FormatFileMaker() {
        _classCallCheck(this, FormatFileMaker);

        this.regions_arr = [];
        this.regions_map = {};
        this.defaultRegion = this.getRegion('default', true, 0);
    }

    _createClass(FormatFileMaker, [{
        key: 'getRegion',
        value: function getRegion(regionName, autoCreate, priority) {
            var rlt = this.regions_map[regionName];
            if (priority == null && this.regions_arr.length > 0) {
                var nowMax = 0;
                this.regions_arr.forEach(function (x) {
                    nowMax = Math.max(x.priority, nowMax);
                });
                priority = nowMax + 1;
            }
            if (rlt == null && autoCreate) {
                rlt = new FormatFileRegion(regionName, priority);
                rlt.parent = this;
                this.regions_arr.push(rlt);
                this.regions_map[rlt.name] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'sortFun',
        value: function sortFun(a, b) {
            return a.priority > b.priority;
        }
    }, {
        key: 'getString',
        value: function getString() {
            var indentChar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '\t';
            var newLineChar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\n';

            var rlt = '';
            this.regions_arr.sort(this.sortFun);
            this.regions_arr.forEach(function (region) {
                rlt += region.getString('', indentChar, newLineChar);
            });
            return rlt;
        }
    }]);

    return FormatFileMaker;
}();

var JSFile_Variable = function JSFile_Variable(name, initVal) {
    _classCallCheck(this, JSFile_Variable);

    this.name = name;
    this.initVal = initVal;
};

var JSFile_Scope = function () {
    function JSFile_Scope(name, outScope) {
        _classCallCheck(this, JSFile_Scope);

        this.name = name;
        this.vars_map = {};
        this.functions_map = {};
        this.outScope = outScope;
    }

    _createClass(JSFile_Scope, [{
        key: 'getVar',
        value: function getVar(name, autoCreate, initVal) {
            var rlt = this.vars_map[name];
            if (rlt == null && autoCreate) {
                if (initVal != null && typeof initVal != 'string') {
                    console.error('scope var initval 只支持字符串');
                }
                rlt = new JSFile_Variable(name, initVal);
                this.vars_map[name] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'getFunction',
        value: function getFunction(funName, autoCreate, params_arr, declareType) {
            var funNameKey = '_' + funName + '_';
            var rlt = this.functions_map[funNameKey];
            if (rlt == null && autoCreate) {
                if (params_arr == null) {
                    //console.error('getFunction autoCreate no params_arr');
                    params_arr = [];
                }
                rlt = new JSFile_Funtion(funName, params_arr, declareType);
                this.functions_map[funNameKey] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'getVarDeclareString',
        value: function getVarDeclareString() {
            var preFixStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var newLineChar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '\n';

            var rlt = '';
            for (var varName in this.vars_map) {
                var varData = this.vars_map[varName];
                if (varData == null) {
                    continue;
                }
                rlt += preFixStr + 'var ' + varData.name + (varData.initVal ? '=' + varData.initVal : '') + ';' + newLineChar;
            }
            return rlt;
        }
    }, {
        key: 'getFunctionDeclareString',
        value: function getFunctionDeclareString(prefixStr, indentChar, newLineChar) {
            var rlt = '';
            for (var fName in this.functions_map) {
                var theFun = this.functions_map[fName];
                rlt += theFun.getString(prefixStr, indentChar, newLineChar);
            }
            return rlt;
        }
    }]);

    return JSFile_Scope;
}();

var JSFile_Switch = function (_FormatFileBlock) {
    _inherits(JSFile_Switch, _FormatFileBlock);

    function JSFile_Switch(name, flagName) {
        _classCallCheck(this, JSFile_Switch);

        var _this5 = _possibleConstructorReturn(this, (JSFile_Switch.__proto__ || Object.getPrototypeOf(JSFile_Switch)).call(this, name));

        _this5.flagName = flagName;

        _this5.caseBloks_map = {};
        _this5.defaultBlock = new FormatFileBlock('default');
        return _this5;
    }

    _createClass(JSFile_Switch, [{
        key: 'clone',
        value: function clone() {
            var rlt = new JSFile_Switch(this.name, this.flagName);
            for (var ci in this.caseBloks_map) {
                rlt.caseBloks_map[ci] = this.caseBloks_map[ci].clone();
            }
            return rlt;
        }
    }, {
        key: 'getCaseBlock',
        value: function getCaseBlock(caseVal) {
            var rlt = this.caseBloks_map[caseVal];
            if (rlt == null) {
                rlt = new FormatFileBlock(caseVal);
                this.caseBloks_map[caseVal] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var indentString = this.getIndentString(indentChar);
            var rlt = prefixStr + 'switch(' + this.flagName + '){' + newLineChar;

            for (var si in this.caseBloks_map) {
                rlt += prefixStr + indentChar + 'case ' + si + ':{' + newLineChar;
                rlt += this.caseBloks_map[si].getString(prefixStr + indentChar, indentChar, newLineChar);
                rlt += prefixStr + indentChar + 'break;}' + newLineChar;
            }

            if (this.defaultBlock.childs_arr.length > 0) {
                rlt += prefixStr + indentChar + 'default:{' + newLineChar;
                rlt += this.defaultBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
                rlt += prefixStr + indentChar + 'break;}' + newLineChar;
            }
            rlt += prefixStr + '}';

            return rlt;
        }
    }]);

    return JSFile_Switch;
}(FormatFileBlock);

var JSFile_IF = function (_FormatFileBlock2) {
    _inherits(JSFile_IF, _FormatFileBlock2);

    function JSFile_IF(name, condition) {
        _classCallCheck(this, JSFile_IF);

        var _this6 = _possibleConstructorReturn(this, (JSFile_IF.__proto__ || Object.getPrototypeOf(JSFile_IF)).call(this, name));

        _this6.condition = condition;

        _this6.trueBlock = new FormatFileBlock('true');
        _this6.falseBlock = new FormatFileBlock('false');
        _this6.elseIfs_arr = [];
        return _this6;
    }

    _createClass(JSFile_IF, [{
        key: 'clone',
        value: function clone() {
            var rlt = new JSFile_IF(this.name, this.condition);
            rlt.trueBlock = this.trueBlock.clone();
            rlt.falseBlock = this.falseBlock.clone();
            for (var ci in this.elseIfs_arr) {
                rlt.elseIfs_arr.push(this.elseIfs_arr[ci].clone());
            }
            return rlt;
        }
    }, {
        key: 'pushChild',
        value: function pushChild() {
            console.error("if block can't call pushChild");
        }
    }, {
        key: 'pushLine',
        value: function pushLine(lineItem, indentOffset) {
            this.trueBlock.pushLine(lineItem, indentOffset);
        }
    }, {
        key: 'pushElseIf',
        value: function pushElseIf(name, condition) {
            var nowBlock = this.getElseIfBlock(name);
            if (nowBlock != null) {
                console.error('重复的 else if:' + name);
                return;
            }
            var rltBlock = new FormatFileBlock(name);
            rltBlock.pushLine('else if(' + condition + '){', 1);
        }
    }, {
        key: 'getElseIfBlock',
        value: function getElseIfBlock(name) {
            return this.elseIfs_arr.filter(function (item) {
                return item.name == name;
            });
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            if (IsEmptyString(this.condition)) {
                console.error('JSFile_IF:' + this.name + ' confition为空');
            }
            var rlt = prefixStr + 'if(' + this.condition + '){' + newLineChar;
            rlt += this.trueBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + '}' + newLineChar;
            for (var ei in this.elseIfs_arr) {
                var elseIfBlock = this.elseIfs_arr[ei];
                rlt += elseIfBlock.getString(prefixStr, indentChar, newLineChar);
                rlt += prefixStr + '}' + newLineChar;
            }
            if (this.falseBlock.childs_arr.length > 0) {
                rlt += prefixStr + 'else{' + newLineChar;
                rlt += this.falseBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
                rlt += prefixStr + '}' + newLineChar;
            }
            return rlt;
        }
    }]);

    return JSFile_IF;
}(FormatFileBlock);

var JSFile_Try = function (_FormatFileBlock3) {
    _inherits(JSFile_Try, _FormatFileBlock3);

    function JSFile_Try(name) {
        _classCallCheck(this, JSFile_Try);

        var _this7 = _possibleConstructorReturn(this, (JSFile_Try.__proto__ || Object.getPrototypeOf(JSFile_Try)).call(this, name));

        _this7.bodyBlock = new FormatFileBlock('body');
        _this7.errorBlock = new FormatFileBlock('error');
        return _this7;
    }

    _createClass(JSFile_Try, [{
        key: 'clone',
        value: function clone() {
            var rlt = new JSFile_Try(this.name);
            rlt.bodyBlock = this.bodyBlock.clone();
            rlt.errorBlock = this.errorBlock.clone();
            return rlt;
        }
    }, {
        key: 'pushChild',
        value: function pushChild() {
            console.error("try block can't call pushChild");
        }
    }, {
        key: 'pushLine',
        value: function pushLine(lineItem, indentOffset) {
            this.bodyBlock.pushLine(lineItem, indentOffset);
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var rlt = prefixStr + 'try{' + newLineChar;
            rlt += this.bodyBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + '}' + newLineChar;
            rlt += prefixStr + 'catch(eo){' + newLineChar;
            rlt += this.errorBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            rlt += prefixStr + '}' + newLineChar;
            return rlt;
        }
    }]);

    return JSFile_Try;
}(FormatFileBlock);

var JSFile_Funtion = function (_FormatFileBlock4) {
    _inherits(JSFile_Funtion, _FormatFileBlock4);

    function JSFile_Funtion(name, params_arr, declareType) {
        _classCallCheck(this, JSFile_Funtion);

        var _this8 = _possibleConstructorReturn(this, (JSFile_Funtion.__proto__ || Object.getPrototypeOf(JSFile_Funtion)).call(this, name));

        _this8.params_arr = params_arr == null ? [] : params_arr;
        var paramsStr = '';
        _this8.params_arr.forEach(function (e) {
            paramsStr += (paramsStr.length == 0 ? '' : ',') + e;
        });
        //this.pushLine('function ' + name + '(' + paramsStr + ')', true);
        _this8.headBlock = new FormatFileBlock('head');
        _this8.bodyBlock = new FormatFileBlock('body');
        _this8.retBlock = new FormatFileBlock('ret');
        _this8.beforeRetBlock = new FormatFileBlock('beforeRet');

        _this8.scope = new JSFile_Scope('_localfun', _this8.getScope());
        _this8.scope.fun = _this8;
        _this8.headBlock.parent = _this8;
        _this8.bodyBlock.parent = _this8;
        _this8.retBlock.parent = _this8;
        _this8.declareType = declareType;
        return _this8;
    }

    _createClass(JSFile_Funtion, [{
        key: 'addNextIndent',
        value: function addNextIndent() {
            this.bodyBlock.nextLineIndent += 1;
        }
    }, {
        key: 'subNextIndent',
        value: function subNextIndent() {
            this.bodyBlock.nextLineIndent -= 1;
        }
    }, {
        key: 'pushChild',
        value: function pushChild(child) {
            if (!IsEmptyString(child.name)) {
                this.bodyBlock.childs_map[child.name] = child;
            }
            child.parent = this.bodyBlock;
            child.indent = this.bodyBlock.nextLineIndent;
            this.bodyBlock.childs_arr.push(child);
        }
    }, {
        key: 'getChild',
        value: function getChild(childName) {
            return this.bodyBlock.childs_map[childName];
        }
    }, {
        key: 'pushLine',
        value: function pushLine(lineItem, indentOffset) {
            var itemType = typeof lineItem === 'undefined' ? 'undefined' : _typeof(lineItem);
            if (itemType === 'string') {
                lineItem = new FormatFile_Line(lineItem, this.bodyBlock.nextLineIndent);
            } else if (!FormatFile_Line.prototype.isPrototypeOf(lineItem)) {
                console.error('不支持的lineitem！');
            } else {
                lineItem.indent = this.bodyBlock.nextLineIndent;
            }
            lineItem.parent = this.bodyBlock;
            this.bodyBlock.childs_arr.push(lineItem);
            this.bodyBlock.nextLineIndent += indentOffset == null ? 0 : Math.sign(indentOffset);
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var paramsStr = '';
            this.params_arr.forEach(function (e) {
                if (e == null) {
                    return;
                }
                paramsStr += (paramsStr.length == 0 ? '' : ',') + e;
            });
            var indentString = this.getIndentString(indentChar);
            var declareLine = 'function ' + this.name + '(' + paramsStr + '){';
            var endDeclareLine = prefixStr + indentString + '}' + newLineChar;
            switch (this.declareType) {
                case 'classfun':
                    declareLine = this.name + '(' + paramsStr + '){';
                    break;
                case 'lambda':
                    declareLine = '(' + paramsStr + ')=>{';
                    break;
                case 'cofun':
                    declareLine += newLineChar + prefixStr + indentString + 'return co(function* () {';
                    endDeclareLine = newLineChar + prefixStr + indentString + '});' + endDeclareLine;
                    break;
            }
            //this.childs_arr[0].content = declareLine;

            var headStr = '';
            if (this.headBlock.childs_arr.length > 0) {
                headStr = this.headBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            }
            var bodyStr = '';
            if (this.bodyBlock.childs_arr.length > 0) {
                bodyStr = this.bodyBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            }
            var retStr = '';
            if (this.beforeRetBlock.childs_arr.length > 0) {
                retStr = this.beforeRetBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            }
            if (this.retBlock.childs_arr.length > 0) {
                retStr += this.retBlock.getString(prefixStr + indentChar, indentChar, newLineChar);
            }

            var varDeclareStr = this.scope.getVarDeclareString(prefixStr + indentString + indentChar, newLineChar);
            return prefixStr + indentString + declareLine + newLineChar + varDeclareStr + headStr + bodyStr + retStr + endDeclareLine;
        }
    }]);

    return JSFile_Funtion;
}(FormatFileBlock);

var JSFile_Class = function (_JSFile_Scope) {
    _inherits(JSFile_Class, _JSFile_Scope);

    function JSFile_Class(name, parentClassName, outScope) {
        _classCallCheck(this, JSFile_Class);

        var _this9 = _possibleConstructorReturn(this, (JSFile_Class.__proto__ || Object.getPrototypeOf(JSFile_Class)).call(this, name, outScope));

        _this9.parentClassName = parentClassName;
        _this9.constructorFun = _this9.getFunction('constructor', true);
        return _this9;
    }

    _createClass(JSFile_Class, [{
        key: 'getFunction',
        value: function getFunction(funName, autoCreate, params_arr) {
            var rlt = _get(JSFile_Class.prototype.__proto__ || Object.getPrototypeOf(JSFile_Class.prototype), 'getFunction', this).call(this, funName, autoCreate, params_arr);
            if (rlt.declareType != 'classfun') {
                rlt.declareType = 'classfun';
            }
            return rlt;
        }
    }, {
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var rlt = prefixStr + 'class ' + this.name + (IsEmptyString(this.parentClassName) ? '' : ' extends ' + this.parentClassName) + '{' + newLineChar;
            for (var fName in this.functions_map) {
                var theFun = this.functions_map[fName];
                rlt += theFun.getString(prefixStr + indentChar, indentChar, newLineChar);
            }
            return rlt + newLineChar + prefixStr + '}' + newLineChar;
        }
    }]);

    return JSFile_Class;
}(JSFile_Scope);

var JSFile_ReactClass = function (_JSFile_Class) {
    _inherits(JSFile_ReactClass, _JSFile_Class);

    function JSFile_ReactClass(name, outScope) {
        _classCallCheck(this, JSFile_ReactClass);

        var _this10 = _possibleConstructorReturn(this, (JSFile_ReactClass.__proto__ || Object.getPrototypeOf(JSFile_ReactClass)).call(this, name, outScope));

        _this10.parentClassName = 'React.PureComponent';
        _this10.constructorFun.params_arr = ['props'];
        _this10.constructorFun.pushLine('super(props);');

        _this10.renderFun = _this10.getFunction('render', true);
        _this10.renderFun.scope.getVar(VarNames.RetElem, true, 'null');
        _this10.renderFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        _this10.visibleComScope = new JSFile_Scope('visible' + name, outScope);

        _this10.mapStateFun = _this10.visibleComScope.getFunction(name + '_mapstatetoprops', true, ['state', 'ownprops']);
        _this10.mapDispathFun = _this10.visibleComScope.getFunction(name + '_disptchtoprops', true, ['dispatch', 'ownprops']);

        _this10.mapStateFun.scope.getVar(VarNames.RetProps, true, '{}');
        _this10.mapStateFun.retBlock.pushLine('return ' + VarNames.RetProps + ';');
        _this10.mapDispathFun.scope.getVar('retDispath', true, '{}');
        _this10.mapDispathFun.retBlock.pushLine('return retDispath;');
        return _this10;
    }

    _createClass(JSFile_ReactClass, [{
        key: 'getString',
        value: function getString(prefixStr, indentChar, newLineChar) {
            var classStr = _get(JSFile_ReactClass.prototype.__proto__ || Object.getPrototypeOf(JSFile_ReactClass.prototype), 'getString', this).call(this, prefixStr, indentChar, newLineChar);
            var visibleComFunStr = this.visibleComScope.getFunctionDeclareString(prefixStr, indentChar, newLineChar);
            var rlt = classStr + visibleComFunStr;
            rlt += prefixStr + 'const Visible' + this.name + ' = ReactRedux.connect(' + this.mapStateFun.name + ', ' + this.mapDispathFun.name + ')(' + this.name + ');' + newLineChar;
            return rlt;
        }
    }]);

    return JSFile_ReactClass;
}(JSFile_Class);

var JSFile_PureReactClass = function (_JSFile_Class2) {
    _inherits(JSFile_PureReactClass, _JSFile_Class2);

    function JSFile_PureReactClass(name, outScope) {
        _classCallCheck(this, JSFile_PureReactClass);

        var _this11 = _possibleConstructorReturn(this, (JSFile_PureReactClass.__proto__ || Object.getPrototypeOf(JSFile_PureReactClass)).call(this, name, outScope));

        _this11.parentClassName = 'React.PureComponent';
        _this11.constructorFun.params_arr = ['props'];
        _this11.constructorFun.pushLine('super(props);');

        _this11.renderFun = _this11.getFunction('render', true);
        _this11.renderFun.scope.getVar(VarNames.RetElem, true, 'null');
        _this11.renderFun.retBlock.pushLine(makeLine_Return(VarNames.RetElem));
        return _this11;
    }

    return JSFile_PureReactClass;
}(JSFile_Class);

var JSFileMaker = function (_FormatFileMaker) {
    _inherits(JSFileMaker, _FormatFileMaker);

    function JSFileMaker() {
        _classCallCheck(this, JSFileMaker);

        var _this12 = _possibleConstructorReturn(this, (JSFileMaker.__proto__ || Object.getPrototypeOf(JSFileMaker)).call(this));

        _this12.importRegion = _this12.getRegion('import', true);
        _this12.importBlock = _this12.importRegion.defaultBlock;
        _this12.globalVarRegion = _this12.getRegion('globalVar', true);
        _this12.globalVarBlock = _this12.globalVarRegion.defaultBlock;

        _this12.globalFunRegion = _this12.getRegion('globalFun', true);
        _this12.globalFunBlock = _this12.globalFunRegion.defaultBlock;

        _this12.classDefRegion = _this12.getRegion('classdef', true);
        _this12.classDefBlock = _this12.classDefRegion.defaultBlock;

        _this12.endRegion = _this12.getRegion('end', true);
        _this12.endBlock = _this12.endRegion.defaultBlock;

        _this12.classes_map = {};
        _this12.scope = new JSFile_Scope('global');
        _this12.globalVarGetStringProcess = _this12.globalVarGetStringProcess.bind(_this12);
        _this12.globalVarBlock.addGetStringLisener(_this12.globalVarGetStringProcess);
        _this12.classDefGetStringProcess = _this12.classDefGetStringProcess.bind(_this12);
        _this12.classDefBlock.addGetStringLisener(_this12.classDefGetStringProcess);
        _this12.globalFunGetStringProcess = _this12.globalFunGetStringProcess.bind(_this12);
        _this12.globalFunBlock.addGetStringLisener(_this12.globalFunGetStringProcess);
        return _this12;
    }

    _createClass(JSFileMaker, [{
        key: 'globalFunGetStringProcess',
        value: function globalFunGetStringProcess(str, indentStr, newLineChar, prefixStr) {
            return str + this.scope.getFunctionDeclareString(prefixStr, indentStr, newLineChar) + newLineChar;
        }
    }, {
        key: 'globalVarGetStringProcess',
        value: function globalVarGetStringProcess(str, indentStr, newLineChar, prefixStr) {
            return str + this.scope.getVarDeclareString(prefixStr, newLineChar) + newLineChar;
        }
    }, {
        key: 'classDefGetStringProcess',
        value: function classDefGetStringProcess(str, indentStr, newLineChar, prefixStr) {
            var allClassDefStr = '';
            for (var cName in this.classes_map) {
                allClassDefStr += this.classes_map[cName].getString('', indentStr, newLineChar);
            }

            return str + allClassDefStr + newLineChar;
        }
    }, {
        key: 'getClass',
        value: function getClass(name, autoCreate, parentClassName) {
            var rlt = this.classes_map[name];
            if (rlt == null && autoCreate) {
                rlt = new JSFile_Class(name, parentClassName, this.scope);
                this.classes_map[name] = rlt;
            }
            return rlt;
        }
    }, {
        key: 'getReactClass',
        value: function getReactClass(name, autoCreate, noVisibleCom) {
            var rlt = this.classes_map[name];
            if (rlt == null && autoCreate) {
                if (noVisibleCom) {
                    rlt = new JSFile_PureReactClass(name, this.scope);
                } else {
                    rlt = new JSFile_ReactClass(name, this.scope);
                }
                this.classes_map[name] = rlt;
            }
            return rlt;
        }
    }]);

    return JSFileMaker;
}(FormatFileMaker);

var FlowScriptFile = function (_JSFileMaker) {
    _inherits(FlowScriptFile, _JSFileMaker);

    function FlowScriptFile(flow) {
        _classCallCheck(this, FlowScriptFile);

        var _this13 = _possibleConstructorReturn(this, (FlowScriptFile.__proto__ || Object.getPrototypeOf(FlowScriptFile)).call(this));

        _this13.flow = flow;
        _this13.fileName = 'serverFlow' + flow.code;

        _this13.importBlock.pushLine("const dbhelper = require('../../../../dbhelper.js');");
        _this13.importBlock.pushLine("const serverhelper = require('../../../../erpserverhelper.js');");
        _this13.importBlock.pushLine("const co = require('co');");
        _this13.importBlock.pushLine("const sqlTypes = dbhelper.Types;");
        _this13.importBlock.pushLine("const fs = require('fs');");
        _this13.importBlock.pushLine("const forge = require('node-forge');");

        _this13.processFun = _this13.scope.getFunction('process', true, ['stepCode', 'pram1', 'param2', 'param3']);

        return _this13;
    }

    _createClass(FlowScriptFile, [{
        key: 'compile',
        value: function compile() {
            return true;
        }
    }, {
        key: 'compileEnd',
        value: function compileEnd() {
            this.endBlock.pushLine('module.exports = process;');
        }
    }, {
        key: 'initProcessFun',
        value: function initProcessFun(theFun) {
            if (theFun.inited) {
                return;
            }
            theFun.headBlock.pushLine("return co(function* () {");
            theFun.bodyBlock.addNextIndent();
            theFun.retBlock.pushLine("});");
            theFun.inited = true;
            theFun.scope.isServerSide = true;
        }
    }]);

    return FlowScriptFile;
}(JSFileMaker);

var CP_ServerSide = function (_JSFileMaker2) {
    _inherits(CP_ServerSide, _JSFileMaker2);

    function CP_ServerSide(projectCompiler) {
        _classCallCheck(this, CP_ServerSide);

        var _this14 = _possibleConstructorReturn(this, (CP_ServerSide.__proto__ || Object.getPrototypeOf(CP_ServerSide)).call(this));

        _this14.projectCompiler = projectCompiler;
        _this14.fileName = projectCompiler.projectName + '_server';
        _this14.project = projectCompiler.project;

        _this14.importBlock.pushLine("const dbhelper = require('../../../../dbhelper.js');");
        _this14.importBlock.pushLine("const serverhelper = require('../../../../erpserverhelper.js');");
        _this14.importBlock.pushLine("const co = require('co');");
        _this14.importBlock.pushLine("const sqlTypes = dbhelper.Types;");
        _this14.importBlock.pushLine("const sharp = require('sharp');");
        _this14.importBlock.pushLine("const fs = require('fs');");
        _this14.importBlock.pushLine("const forge = require('node-forge');");

        _this14.processFun = _this14.scope.getFunction('process', true, ['req', 'res', 'next']);
        _this14.processFun.pushLine('serverhelper.commonProcess(req, res, next, processes_map);');
        _this14.pageLoadedFun = _this14.scope.getFunction('pageloaded', true, ['req', 'res'], 'cofun');
        _this14.pageLoadedFun.pushLine('var rlt = {};');

        _this14.processesMapVar = _this14.scope.getVar('processes_map', true);
        _this14.processesMapVarInitVal = {
            pageloaded: 'pageloaded'
        };
        return _this14;
    }

    _createClass(CP_ServerSide, [{
        key: 'compile',
        value: function compile() {
            return true;
        }
    }, {
        key: 'compileEnd',
        value: function compileEnd() {
            this.processesMapVar.initVal = JsObjectToString(this.processesMapVarInitVal);
            this.endBlock.pushLine('module.exports = process;');

            this.pageLoadedFun.pushLine('return rlt;');
        }
    }, {
        key: 'initProcessFun',
        value: function initProcessFun(theFun) {
            if (theFun.inited) {
                return;
            }
            theFun.headBlock.pushLine("return co(function* () {");
            theFun.bodyBlock.addNextIndent();
            theFun.retBlock.pushLine("});");
            theFun.inited = true;
            theFun.scope.isServerSide = true;
        }
    }]);

    return CP_ServerSide;
}(JSFileMaker);

var CP_ClientSide = function (_JSFileMaker3) {
    _inherits(CP_ClientSide, _JSFileMaker3);

    function CP_ClientSide(projectCompiler) {
        _classCallCheck(this, CP_ClientSide);

        var _this15 = _possibleConstructorReturn(this, (CP_ClientSide.__proto__ || Object.getPrototypeOf(CP_ClientSide)).call(this));

        _this15.projectCompiler = projectCompiler;
        _this15.project = projectCompiler.project;

        _this15.importBlock.pushLine('var Redux = window.Redux;');
        _this15.importBlock.pushLine('var Provider = ReactRedux.Provider;');

        _this15.scope.getVar('isDebug', true, 'false');
        _this15.scope.getVar('appServerUrl', true, "'/erppage/server/" + projectCompiler.projectName + "'");
        _this15.scope.getVar('thisAppTitle', true, singleQuotesStr(projectCompiler.projectTitle));
        _this15.appInitStateVar = _this15.scope.getVar('appInitState', true);
        _this15.appInitState = _this15.appInitState = {
            loaded: false,
            ui: {}
        };
        _this15.appClass = _this15.getReactClass('App', true);
        _this15.reducers_map = {};

        _this15.appClass.constructorFun.pushLine("this.renderLoadingTip = baseRenderLoadingTip.bind(this)");

        _this15.appReducerSettingVar = _this15.scope.getVar('appReducerSetting', true);
        _this15.appReducerVar = _this15.scope.getVar('appReducer', true, 'createReducer(appInitState, Object.assign(baseReducerSetting,appReducerSetting))');
        _this15.reducerVar = _this15.scope.getVar('reducer', true, 'appReducer');
        _this15.storeVar = _this15.scope.getVar('store', true, 'Redux.createStore(reducer, Redux.applyMiddleware(logger, crashReporter, createThunkMiddleware()))');
        _this15.stateChangedAct_mapVar = _this15.scope.getVar('appStateChangedAct_map', true);
        _this15.stateChangedAct = {};

        _this15.appClass.mapStateFun.pushLine(makeLine_Assign(makeStr_DotProp(VarNames.RetProps, VarNames.NowPage), makeStr_DotProp('state', VarNames.NowPage)));

        var setCusValidCheckerBlock = new FormatFileBlock('setCusValidChecker');
        _this15.endBlock.pushChild(setCusValidCheckerBlock);
        _this15.setCusValidCheckerBlock = setCusValidCheckerBlock;
        return _this15;
    }

    _createClass(CP_ClientSide, [{
        key: 'compile',
        value: function compile() {
            this.styleCounter = 1;
            return true;
        }
    }, {
        key: 'addReducer',
        value: function addReducer(reducerKey, reducerName) {
            this.reducers_map[reducerKey] = reducerName;
        }
    }, {
        key: 'compileEnd',
        value: function compileEnd() {
            this.appInitStateVar.initVal = JsObjectToString(this.appInitState);
            this.appReducerSettingVar.initVal = JsObjectToString(this.reducers_map);
            this.stateChangedAct_mapVar.initVal = JsObjectToString(this.stateChangedAct);

            var ifLoginBK = new JSFile_IF('iflogin', 'g_envVar.userid != null');
            this.endBlock.pushChild(ifLoginBK);
            ifLoginBK.trueBlock.pushLine('ErpControlInit();');
            ifLoginBK.trueBlock.pushLine('ReactDOM.render(<Provider store={store}>', 1);
            ifLoginBK.trueBlock.pushLine('<VisibleApp />', -1);
            ifLoginBK.trueBlock.pushLine("</Provider>, document.getElementById('reactRoot'));");

            ifLoginBK.falseBlock.pushLine("var search = location.search.replace('?','');");
            ifLoginBK.falseBlock.pushLine("location.href = '/?goto=' + location.pathname + '&' + search;");

            this.endBlock.pushLine("store.dispatch(fetchJsonPost(appServerUrl, { action: 'pageloaded' }, null, 'pageloaded', '正在加载[' + thisAppTitle + ']'));");
        }
    }, {
        key: 'getString',
        value: function getString(indentChar, newLineChar) {
            return _get(CP_ClientSide.prototype.__proto__ || Object.getPrototypeOf(CP_ClientSide.prototype), 'getString', this).call(this, indentChar, newLineChar);
        }
    }, {
        key: 'addStyleObject',
        value: function addStyleObject(styleId, styleObj) {
            if (IsEmptyObject(styleObj)) {
                return false;
            }
            var rightSyleObj = {};
            for (var sn in styleObj) {
                rightSyleObj[gStyleAttrNameToCssName(sn)] = styleObj[sn];
            }
            if (this.styleDefBlock == null) {
                this.styleDefBlock = this.defaultRegion.getBlock('styledef', true, 2);
            }
            var styleBlock = this.styleDefBlock.getChild(styleId);
            if (styleBlock == null) {
                styleBlock = new FormatFileBlock(styleId);
                this.styleDefBlock.pushChild(styleBlock);

                styleBlock.pushLine('const ' + styleId + '=' + JSON.stringify(styleObj) + ';');
            }
            return true;
        }
    }]);

    return CP_ClientSide;
}(JSFileMaker);