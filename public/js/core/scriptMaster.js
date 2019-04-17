'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScriptMaster = function (_EventEmitter) {
    _inherits(ScriptMaster, _EventEmitter);

    function ScriptMaster(project) {
        _classCallCheck(this, ScriptMaster);

        var _this = _possibleConstructorReturn(this, (ScriptMaster.__proto__ || Object.getPrototypeOf(ScriptMaster)).call(this));

        autoBind(_this);
        _this.blueprints_arr = [];
        _this.project = project;

        //this.createBP('test', 'test');
        return _this;
    }

    _createClass(ScriptMaster, [{
        key: 'addBP',
        value: function addBP(bpItem) {
            if (this.blueprints_arr.indexOf(bpItem) != -1) {
                return;
            }
            var useCode = bpItem.code;
            var i = 0;
            if (IsEmptyString(useCode) || this.getBPByCode(useCode) != null) {
                for (i = 0; i < 9999; ++i) {
                    useCode = 'scriptBP_' + i;
                    if (this.getBPByCode(useCode) == null) {
                        break;
                    }
                }
            }
            var useName = bpItem.name;
            if (IsEmptyString(useName) || this.getBPByName(useName) != null) {
                for (i = 0; i < 9999; ++i) {
                    useName = '脚本蓝图_' + i;
                    if (this.getBPByName(useCode) == null) {
                        break;
                    }
                }
            }
            bpItem.master = this;
            bpItem.name = useName;
            bpItem.code = useCode;
            bpItem.id = useCode;
            this.blueprints_arr.push(bpItem);
        }
    }, {
        key: 'getBPByName',
        value: function getBPByName(name) {
            return this.blueprints_arr.find(function (item) {
                return item.name == name;
            });
        }
    }, {
        key: 'getBPByCode',
        value: function getBPByCode(code) {
            return this.blueprints_arr.find(function (item) {
                return item.code == code;
            });
        }
    }, {
        key: 'createBP',
        value: function createBP(name, type, group) {
            var newItem = new JSNode_BluePrint({ name: name, type: type, master: this, group: group });
            this.addBP(newItem);
            this.emit('bpchanged');
            return newItem;
        }
    }, {
        key: 'modifyBP',
        value: function modifyBP(sqpBP, name, type) {
            sqpBP.name = name;
            sqpBP.type = type;
            this.emit('bpchanged');
        }
    }, {
        key: 'deleteBP',
        value: function deleteBP(sqpBP) {
            var index = this.blueprints_arr.indexOf(sqpBP);
            if (index != -1) {
                this.blueprints_arr.splice(index, 1);
            }
            sqpBP.master = null;
        }
    }, {
        key: 'getJson',
        value: function getJson() {
            var rlt = {
                blueprints_arr: []
            };
            this.blueprints_arr.forEach(function (bp) {
                rlt.blueprints_arr.push(bp.getJson());
            });
            return rlt;
        }
    }, {
        key: 'restoreFromJson',
        value: function restoreFromJson(json) {
            var _this2 = this;

            if (json == null) {
                return;
            }
            if (json.blueprints_arr) {
                json.blueprints_arr.forEach(function (bpjson) {
                    var creationHelper = new NodeCreationHelper();
                    creationHelper.project = _this2.project;
                    var newbp = new JSNode_BluePrint(null, bpjson, creationHelper);
                    _this2.addBP(newbp);
                });
            }
        }
    }]);

    return ScriptMaster;
}(EventEmitter);