'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmptyDBEntity = {
    loaded: true,
    code: 0,
    columns: null,
    name: '无'
};

var DataBase = function (_EventEmitter) {
    _inherits(DataBase, _EventEmitter);

    function DataBase() {
        _classCallCheck(this, DataBase);

        var _this = _possibleConstructorReturn(this, (DataBase.__proto__ || Object.getPrototypeOf(DataBase)).call(this));

        _this.entities_arr = [];
        _this.entityCode_map = {};
        _this.entityName_map = {};

        autoBind(_this);
        return _this;
    }

    _createClass(DataBase, [{
        key: 'doSyn_Unload_bycodes',
        value: function doSyn_Unload_bycodes(codes_arr, callBack) {
            var _this2 = this;

            console.log('doSyn_Unload_bycodes:' + codes_arr);
            var maxCountPerFetch = 10;
            var needSynCodes_arr = [];
            var newCodes_arr = [];
            if (codes_arr) {
                codes_arr.forEach(function (code) {
                    if (_this2.entityCode_map[code] == null) {
                        if (needSynCodes_arr.length == maxCountPerFetch) {
                            return;
                        }
                        needSynCodes_arr.push(code);
                    }
                });

                if (needSynCodes_arr.length == maxCountPerFetch) {
                    newCodes_arr = codes_arr.filter(function (code) {
                        return needSynCodes_arr.indexOf(code) == -1;
                    });
                }
            }
            if (needSynCodes_arr.length == 0) {
                if (callBack != null) {
                    callBack();
                }
                return;
            }
            this.doSyn_Unload_bycodes_callback = callBack;
            var self = this;
            fetchJsonPost('server', { action: 'syndata_bycodes', codes_arr: needSynCodes_arr }, function (fetchData) {
                var json = fetchData.json;
                if (json.err) {
                    console.error(json.err);
                    return;
                }
                self.synEnityFromFetch(json.data);
                if (newCodes_arr.length > 0) {
                    _this2.doSyn_Unload_bycodes(newCodes_arr, callBack);
                } else if (callBack != null) {
                    callBack();
                }
            });
        }
    }, {
        key: 'synEnityFromFetch',
        value: function synEnityFromFetch(data_arr) {
            var _this3 = this;

            var changed_arr = [];
            data_arr.forEach(function (entityData) {
                if (_this3.synEntity(entityData)) {
                    changed_arr.push(_this3.getEntityByCode(entityData.code));
                }
            });
            console.log(changed_arr);
        }
    }, {
        key: 'synEntity',
        value: function synEntity(entityData) {
            if (entityData == null) return false;
            var code = entityData.code;
            if (isNaN(code)) {
                console.warn('错误的entityData.code' + code);
                return false;
            }
            var nowEntity = this.entityCode_map[code];
            if (nowEntity == null) {
                nowEntity = this.createEnity(entityData);
                nowEntity.loaded = true;
                return true;
            } else {
                this.entityCode_map[entityData.name] = nowEntity;
                nowEntity.synData(entityData);
            }
            return true;
        }
    }, {
        key: 'createEnity',
        value: function createEnity(initData) {
            if (initData.code == null) {
                console.error('createEnity的参数必须要有code!');
                return null;
            }
            var newEntity = new DBEntity(initData);
            this.entities_arr.push(newEntity);
            this.entityCode_map[initData.code] = newEntity;
            if (initData.name) {
                this.entityCode_map[initData.name] = newEntity;
            }
            return newEntity;
        }
    }, {
        key: 'getEntityByCode',
        value: function getEntityByCode(code) {
            if (code == null || code == 0) {
                return null;
            }
            if (isNaN(code)) {
                console.error('getDataSourceByCode只接受整数');
            }

            var rlt = this.entityCode_map[code.toString()];
            if (rlt == null) {
                rlt = this.createEnity({ code: code });
                rlt.loaded = false;
                rlt.doSyn();
            }
            return this.entityCode_map[code.toString()];
        }
    }, {
        key: 'synBykeyword',
        value: function synBykeyword(callback) {}
    }, {
        key: 'getEntitiesByType',
        value: function getEntitiesByType(tType) {
            if (tType == null) {
                tType = '*';
            }
            return this.entities_arr.filter(function (e) {
                if (tType == '*') {
                    return true;
                }
                return e.type == tType;
            }).concat(EmptyDBEntity);
        }
    }, {
        key: 'getAllTable',
        value: function getAllTable() {
            return this.getEntitiesByType('U');
        }
    }, {
        key: 'getAllProduce',
        value: function getAllProduce() {
            return this.getEntitiesByType('P');
        }
    }]);

    return DataBase;
}(EventEmitter);

var DBEntityAgency = function (_EventEmitter2) {
    _inherits(DBEntityAgency, _EventEmitter2);

    function DBEntityAgency(name, code) {
        _classCallCheck(this, DBEntityAgency);

        var _this4 = _possibleConstructorReturn(this, (DBEntityAgency.__proto__ || Object.getPrototypeOf(DBEntityAgency)).call(this));

        _this4.columns = [];
        _this4.name = name;
        _this4.code = code;
        return _this4;
    }

    _createClass(DBEntityAgency, [{
        key: 'containColumn',
        value: function containColumn(colName) {
            return this.getColumnByName(colName) != null;
        }
    }, {
        key: 'getColumnByName',
        value: function getColumnByName(colName) {
            return this.columns.find(function (x) {
                return x.name == colName;
            });
        }
    }]);

    return DBEntityAgency;
}(EventEmitter);

var DBEntity = function (_EventEmitter3) {
    _inherits(DBEntity, _EventEmitter3);

    function DBEntity(initData) {
        _classCallCheck(this, DBEntity);

        var _this5 = _possibleConstructorReturn(this, (DBEntity.__proto__ || Object.getPrototypeOf(DBEntity)).call(this));

        Object.assign(_this5, initData);
        autoBind(_this5);
        return _this5;
    }

    _createClass(DBEntity, [{
        key: 'synData',
        value: function synData(newData) {
            Object.assign(this, newData);
            this.syning = false;
            this.synErr = null;
            this.loaded = true;
            this.emit('syned', this);
            return true;
        }
    }, {
        key: 'synComplete',
        value: function synComplete(fetchData) {
            console.log('synComplete');
            this.syning = false;
            this.loaded = true;
            var json = fetchData.json;
            if (json.err) {
                console.error(json.err);
                this.synErr = err;
                return;
            } else if (json.data.length == 0 || json.data[0] == null) {
                console.warn(this.code + '没有在数据库中找到');
                this.synErr = { info: '不存在了' + this.code };
                return;
            } else {
                this.synData(json.data[0]);
            }
        }
    }, {
        key: 'doSyn',
        value: function doSyn() {
            if (this.syning) return;
            this.syning = true;
            fetchJsonPost('server', { action: 'syndata_bycodes', codes_arr: [this.code] }, this.synComplete);
        }
    }, {
        key: 'containColumn',
        value: function containColumn(colName) {
            return this.getColumnByName(colName) != null;
        }
    }, {
        key: 'getColumnByName',
        value: function getColumnByName(colName) {
            return this.columns.find(function (x) {
                return x.name == colName;
            });
        }
    }, {
        key: 'getParamByName',
        value: function getParamByName(pName) {
            if (this.params == null) {
                return null;
            }
            return this.params.find(function (x) {
                return x.name == pName;
            });
        }
    }, {
        key: 'toString',
        value: function toString() {
            return IsEmptyString(this.name) ? this.code : this.name;
        }
    }, {
        key: 'isScalar',
        value: function isScalar() {
            return this.type == 'FB';
        }
    }, {
        key: 'isFunction',
        value: function isFunction() {
            return this.type == 'FB' || this.type == 'FT';
        }
    }, {
        key: 'getParams',
        value: function getParams() {
            return this.params;
        }
    }, {
        key: 'getColumns',
        value: function getColumns() {
            return this.columns;
        }
    }]);

    return DBEntity;
}(EventEmitter);

var g_dataBase = new DataBase();

var E_USED_ENITIES_CHANGED = 'E_USED_ENITIES_CHANGED';

var DataMaster = function (_EventEmitter4) {
    _inherits(DataMaster, _EventEmitter4);

    function DataMaster(project) {
        _classCallCheck(this, DataMaster);

        var _this6 = _possibleConstructorReturn(this, (DataMaster.__proto__ || Object.getPrototypeOf(DataMaster)).call(this));

        autoBind(_this6);
        _this6.database = g_dataBase;
        _this6.usedDBEnities_arr = [];
        _this6.dataView_usedDBEnities = new ListDataView(_this6.usedDBEnities_arr, 'name', 'code');
        _this6.BP_sql_arr = [];
        _this6.project = project;

        _this6.dataView_usedDBEnities.on('changed', _this6.usedDBEnitiesChangedHandler);

        /*
        creationHelper = new NodeCreationHelper(); 
        var testJson2 = {"code":"cusDBE46","retNodeId":"select_0","name":"test3333","type":"表值","editorLeft":419,"editorTop":147,"nodes_arr":[{"id":"select_0","type":"select","left":160,"top":-100,"title":"返回表","editorLeft":412,"editorTop":135,"inputScokets_arr":[{"name":"in","isIn":true,"id":"select_0$in","type":"table"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"select_0$out","type":"table"}],"nodes_arr":[{"id":"ret_columns_0","type":"ret_columns","left":150,"top":-160,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"ret_columns_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"ret_columns_0$in1","type":"scalar"},{"name":"in5","isIn":true,"id":"ret_columns_0$in5","type":"scalar","extra":{"alias":"考勤地点代码2"}}]},{"id":"ret_condition_0","type":"ret_condition","left":440,"top":-380,"inputScokets_arr":[{"name":"in","isIn":true,"id":"ret_condition_0$in","type":"boolean"}]},{"id":"ret_order_0","type":"ret_order","left":400,"top":0},{"id":"column_2","type":"column","left":-320,"top":-300,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_2$out","type":"int"}]},{"id":"isnulloperator_0","type":"isnulloperator","left":30,"top":-330,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"isnulloperator_0$in0","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"isnulloperator_0$out","type":"scalar"}]},{"id":"column_3","type":"column","left":-242,"top":-82,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_3$out","type":"varchar"}]},{"id":"column_4","type":"column","left":-248,"top":-44,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记日期","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_4$out"}]},{"id":"column_5","type":"column","left":-370,"top":-220,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记时间","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_5$out"}]},{"id":"isnullfun_0","type":"isnullfun","left":-150,"top":10,"inputScokets_arr":[{"name":"in0","isIn":true,"id":"isnullfun_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"isnullfun_0$in1","defval":"-1","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"isnullfun_0$out","type":"scalar"}]},{"id":"column_6","type":"column","left":-530,"top":40,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记地点代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_6$out"}]},{"id":"column_7","type":"column","left":-390,"top":-170,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"考勤登记地点代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_7$out"}]}]},{"id":"dbEntity_0","type":"dbEntity","left":-510,"top":-40,"targetEntity":"dbe-1506","inputScokets_arr":[{"name":"@targetDate","isIn":true,"id":"dbEntity_0$@targetDate","defval":"2018-12-8","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"dbEntity_0$out","type":"table"}]},{"id":"dbEntity_1","type":"dbEntity","left":-490,"top":-240,"targetEntity":"dbe-309","outputScokets_arr":[{"name":"out","isIn":false,"id":"dbEntity_1$out","type":"table"}]},{"id":"xjion_0","type":"xjion","left":-140,"top":-160,"editorLeft":-13,"editorTop":378,"joinType":"left join","inputScokets_arr":[{"name":"in0","isIn":true,"id":"xjion_0$in0","type":"table"},{"name":"in1","isIn":true,"id":"xjion_0$in1","type":"table"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"xjion_0$out","type":"table"}],"nodes_arr":[{"id":"ret_condition_1","type":"ret_condition","left":340,"top":-160,"inputScokets_arr":[{"name":"in","isIn":true,"id":"ret_condition_1$in","type":"boolean"}]},{"id":"column_0","type":"column","left":-310,"top":-200,"tableName":"V113A名册员工全部","tableCode":309,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_0$out","type":"int"}]},{"id":"column_1","type":"column","left":-310,"top":-150,"tableName":"FT101C考勤记录某日","tableCode":1506,"columnName":"员工登记姓名代码","outputScokets_arr":[{"name":"out","isIn":false,"id":"column_1$out"}]},{"id":"compare_0","type":"compare","left":50,"top":-210,"operator":"=","inputScokets_arr":[{"name":"in0","isIn":true,"id":"compare_0$in0","type":"scalar"},{"name":"in1","isIn":true,"id":"compare_0$in1","type":"scalar"}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"compare_0$out","type":"boolean"}]}]},{"id":"cast_0","type":"cast","left":-210,"top":130,"inputScokets_arr":[{"name":"in","isIn":true,"id":"cast_0$in","type":"table","extra":{"valType":"decimal","size1":"3","size2":"2"}}],"outputScokets_arr":[{"name":"out","isIn":false,"id":"cast_0$out","type":"boolean"}]}],"links_arr":[{"inSocketID":"xjion_0$in0","outSocketID":"dbEntity_1$out"},{"inSocketID":"xjion_0$in1","outSocketID":"dbEntity_0$out"},{"inSocketID":"compare_0$in0","outSocketID":"column_0$out"},{"inSocketID":"compare_0$in1","outSocketID":"column_1$out"},{"inSocketID":"ret_condition_1$in","outSocketID":"compare_0$out"},{"inSocketID":"select_0$in","outSocketID":"xjion_0$out"},{"inSocketID":"isnulloperator_0$in0","outSocketID":"column_2$out"},{"inSocketID":"ret_columns_0$in0","outSocketID":"column_3$out"},{"inSocketID":"ret_columns_0$in1","outSocketID":"column_4$out"},{"inSocketID":"isnullfun_0$in0","outSocketID":"column_6$out"},{"inSocketID":"ret_columns_0$in5","outSocketID":"isnullfun_0$out"}]};
        var newCus2 = new SqlNode_BluePrint(null, testJson2,creationHelper);
        this.addSqlBP(newCus2);
        */
        return _this6;
    }

    _createClass(DataMaster, [{
        key: 'addSqlBP',
        value: function addSqlBP(bpItem) {
            if (this.BP_sql_arr.indexOf(bpItem) != -1) {
                return;
            }
            var useCode = bpItem.code;
            var i = 0;
            if (IsEmptyString(useCode) || this.getSqlBPByCode(useCode) != null) {
                for (i = 0; i < 9999; ++i) {
                    useCode = 'sqlBP_' + i;
                    if (this.getSqlBPByCode(useCode) == null) {
                        break;
                    }
                }
            }
            var useName = bpItem.name;
            if (IsEmptyString(useName) || this.getSqlBPByName(useName) != null) {
                for (i = 0; i < 9999; ++i) {
                    useName = 'sql蓝图_' + i;
                    if (this.getSqlBPByName(useCode) == null) {
                        break;
                    }
                }
            }
            bpItem.master = this;
            bpItem.name = useName;
            bpItem.code = useCode;
            bpItem.id = useCode;
            this.BP_sql_arr.push(bpItem);
        }
    }, {
        key: 'getSqlBPByName',
        value: function getSqlBPByName(name) {
            return this.BP_sql_arr.find(function (item) {
                return item.name == name;
            });
        }
    }, {
        key: 'getSqlBPByCode',
        value: function getSqlBPByCode(code) {
            return this.BP_sql_arr.find(function (item) {
                return item.code == code;
            });
        }
    }, {
        key: 'getSqlBPByUUID',
        value: function getSqlBPByUUID(uuid) {
            return this.BP_sql_arr.find(function (item) {
                return item.uuid == uuid;
            });
        }
    }, {
        key: 'createSqlBP',
        value: function createSqlBP(name, type, group) {
            if (group == null) {
                group = 'custom';
            }
            var newItem = new SqlNode_BluePrint({ name: name, type: type, master: this, group: group });
            this.addSqlBP(newItem);
            this.emit('sqlbpchanged');
            return newItem;
        }
    }, {
        key: 'modifySqlBP',
        value: function modifySqlBP(sqpBP, name, type) {
            sqpBP.name = name;
            sqpBP.type = type;
            this.emit('sqlbpchanged');
            sqpBP.fireChanged();
        }
    }, {
        key: 'deleteSqlBP',
        value: function deleteSqlBP(sqpBP) {
            var index = this.BP_sql_arr.indexOf(sqpBP);
            if (index == -1) {
                return;
            }
            this.BP_sql_arr.splice(index, 1);
            sqpBP.master = null;
        }
    }, {
        key: 'usedDBEnitiesChangedHandler',
        value: function usedDBEnitiesChangedHandler(source) {
            this.emit(E_USED_ENITIES_CHANGED);
        }
    }, {
        key: 'synEnityFromFetch',
        value: function synEnityFromFetch(data_arr) {
            this.database.synEnityFromFetch(data_arr);
        }
    }, {
        key: 'useEnity',
        value: function useEnity(data) {
            if (this.usedDBEnities_arr.find(function (e) {
                return e.code == data.code;
            })) {
                return false;
            }
            this.usedDBEnities_arr.push(data);
            this.usedDBEnities_arr.sort(function (a, b) {
                return a.name < b.name;
            });
            this.dataView_usedDBEnities.emit('changed', this);
            return true;
        }
    }, {
        key: 'getJson',
        value: function getJson(jsonProf) {
            var rlt = {
                BP_sql_arr: []
            };
            this.BP_sql_arr.forEach(function (bp) {
                rlt.BP_sql_arr.push(bp.getJson(jsonProf));
                //console.log(JSON.stringify(rlt.BP_sql_arr[rlt.BP_sql_arr.length - 1]));
            });
            return rlt;
        }
    }, {
        key: 'getDataSourceByCode',
        value: function getDataSourceByCode(code) {
            if (code == 0) {
                return EmptyDBEntity;
            }
            var rlt = this.getSqlBPByCode(code);
            if (rlt == null && !isNaN(code)) {
                rlt = g_dataBase.getEntityByCode(code);
            }
            return rlt;
        }
    }, {
        key: 'getAllEntities',
        value: function getAllEntities() {
            return this.BP_sql_arr.filter(function (x) {
                return x.group == 'custom' && x.type != 'delete';
            }).concat(g_dataBase.entities_arr).concat(EmptyDBEntity);
        }
    }, {
        key: 'getDeleteEntities',
        value: function getDeleteEntities() {
            return this.BP_sql_arr.filter(function (x) {
                return x.group == 'custom' && x.type == 'delete';
            }).concat(EmptyDBEntity);
        }
    }, {
        key: 'restoreFromJson',
        value: function restoreFromJson(json, restoreHelper) {
            var _this7 = this;

            if (json == null) {
                return;
            }
            if (json.BP_sql_arr) {
                json.BP_sql_arr.forEach(function (bpjson) {
                    var creationHelper = new NodeCreationHelper();
                    creationHelper.restoreHelper = restoreHelper;
                    var newbp = new SqlNode_BluePrint(null, bpjson, creationHelper);
                    _this7.addSqlBP(newbp);
                });
            }
        }
    }]);

    return DataMaster;
}(EventEmitter);

function gGetAllEntitiesByKernel(theKernel) {
    return theKernel.project.dataMaster.getAllEntities();
}