'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataBase = function (_EventEmitter) {
    _inherits(DataBase, _EventEmitter);

    function DataBase() {
        _classCallCheck(this, DataBase);

        var _this = _possibleConstructorReturn(this, (DataBase.__proto__ || Object.getPrototypeOf(DataBase)).call(this));

        _this.entities_arr = [];
        _this.entityCode_map = {};
        _this.entityName_map = {};
        return _this;
    }

    _createClass(DataBase, [{
        key: 'synEnityFromFetch',
        value: function synEnityFromFetch(data_arr) {
            var _this2 = this;

            var changed_arr = [];
            data_arr.forEach(function (entityData) {
                if (_this2.synEntity(entityData)) {
                    changed_arr.push(_this2.getEntityByCode(entityData.code));
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
    }]);

    return DataBase;
}(EventEmitter);

var DBEntityAgency = function (_EventEmitter2) {
    _inherits(DBEntityAgency, _EventEmitter2);

    function DBEntityAgency(name, code) {
        _classCallCheck(this, DBEntityAgency);

        var _this3 = _possibleConstructorReturn(this, (DBEntityAgency.__proto__ || Object.getPrototypeOf(DBEntityAgency)).call(this));

        _this3.columns = [];
        _this3.name = name;
        _this3.code = code;
        return _this3;
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

        var _this4 = _possibleConstructorReturn(this, (DBEntity.__proto__ || Object.getPrototypeOf(DBEntity)).call(this));

        Object.assign(_this4, initData);
        autoBind(_this4);
        return _this4;
    }

    _createClass(DBEntity, [{
        key: 'synData',
        value: function synData(newData) {
            Object.assign(this, newData);
            this.syning = false;
            this.synErr = null;
            this.loaded = true;
            this.emit('syned');
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
            } else if (json.data.length == 0) {
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
            fetchJsonPosts('server', { action: 'syndata_bycodes', codes_arr: [this.code] }, this.synComplete);
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
    }]);

    return DBEntity;
}(EventEmitter);

var g_dataBase = new DataBase();

var E_USED_ENITIES_CHANGED = 'E_USED_ENITIES_CHANGED';

var DataMaster = function (_EventEmitter4) {
    _inherits(DataMaster, _EventEmitter4);

    function DataMaster(project) {
        _classCallCheck(this, DataMaster);

        var _this5 = _possibleConstructorReturn(this, (DataMaster.__proto__ || Object.getPrototypeOf(DataMaster)).call(this));

        autoBind(_this5);
        _this5.database = g_dataBase;
        _this5.usedDBEnities_arr = [];
        _this5.dataView_usedDBEnities = new ListDataView(_this5.usedDBEnities_arr, 'name', 'code');
        //var cus1 = new SqlNode_BluePrint({name:'test',code:project.genControlName('cusDBE'),type:'表值',master:this});
        //var tVar = cus1.createEmptyVariable();
        //tVar.needEdit = false;
        _this5.customDBEntities_arr = [];
        _this5.project = project;

        _this5.dataView_usedDBEnities.on('changed', _this5.usedDBEnitiesChangedHandler);

        var testJson = { "code": "cusDBE13", "retNodeId": "select_0", "name": "dfsdfsdf", "type": "表值", "editorLeft": 1015, "editorTop": 669, "variables_arr": [{ "id": "def_variable_0", "type": "def_variable", "left": 0, "top": 0, "name": "员工代码", "valType": "int", "size_1": 0, "size_2": 0, "isParam": 0 }], "nodes_arr": [{ "id": "select_0", "type": "select", "left": -240, "top": -500, "title": "返回表", "editorLeft": -325, "editorTop": 429, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "select_0$in", "type": "table" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "select_0$out", "type": "table" }], "nodes_arr": [{ "id": "ret_columns_0", "type": "ret_columns", "left": 70, "top": 0, "inputScokets_arr": [{ "name": "in8", "isIn": true, "id": "ret_columns_0$in8", "type": "scalar", "extra": { "alias": "序号" } }, { "name": "in5", "isIn": true, "id": "ret_columns_0$in5", "type": "scalar", "extra": { "alias": "testcode" } }, { "name": "in10", "isIn": true, "id": "ret_columns_0$in10", "type": "scalar" }, { "name": "in11", "isIn": true, "id": "ret_columns_0$in11", "type": "scalar" }, { "name": "in12", "isIn": true, "id": "ret_columns_0$in12", "type": "scalar" }, { "name": "in9", "isIn": true, "id": "ret_columns_0$in9", "type": "scalar" }, { "name": "in14", "isIn": true, "id": "ret_columns_0$in14", "type": "scalar" }, { "name": "in15", "isIn": true, "id": "ret_columns_0$in15", "type": "scalar" }, { "name": "in13", "isIn": true, "id": "ret_columns_0$in13", "type": "scalar" }] }, { "id": "ret_condition_0", "type": "ret_condition", "left": 930, "top": -270, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "ret_condition_0$in", "type": "boolean" }] }, { "id": "ret_order_0", "type": "ret_order", "left": 990, "top": 350, "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "ret_order_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "ret_order_0$in1", "type": "scalar", "extra": { "orderType": "desc" } }] }, { "id": "constvalue_1", "type": "constvalue", "left": -196, "top": 116, "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "constvalue_1$out", "defval": "56", "type": "scalar" }] }, { "id": "compare_0", "type": "compare", "left": 720, "top": -390, "operator": "=", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "compare_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "compare_0$in1", "defval": "17", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "compare_0$out", "type": "boolean" }] }, { "id": "column_10", "type": "column", "left": -320, "top": 268, "tableName": "T100A员工登记姓名", "tableCode": 126, "columnName": "员工登记姓名", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_10$out", "type": "varchar" }] }, { "id": "column_11", "type": "column", "left": -320, "top": 154, "tableName": "T100A员工登记姓名", "tableCode": 126, "columnName": "身份证件地址", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_11$out", "type": "varchar" }] }, { "id": "column_0", "type": "column", "left": -276, "top": 192, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_0$out" }] }, { "id": "column_1", "type": "column", "left": -244, "top": 230, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记日期", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_1$out" }] }, { "id": "column_2", "type": "column", "left": -244, "top": 382, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记种类", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_2$out" }] }, { "id": "column_6", "type": "column", "left": -244, "top": 306, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记时间", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_6$out" }] }, { "id": "column_7", "type": "column", "left": -276, "top": 344, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记地点代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_7$out" }] }, { "id": "column_3", "type": "column", "left": 630, "top": 390, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_3$out" }] }, { "id": "column_4", "type": "column", "left": 660, "top": 430, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记时间", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_4$out" }] }, { "id": "column_5", "type": "column", "left": 420, "top": -330, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_5$out" }] }, { "id": "var_get_0", "type": "var_get", "left": 484, "top": -235, "varName": "员工代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "var_get_0$out", "defval": null, "type": "int" }] }, { "id": "rownumber_0", "type": "rownumber", "left": -110, "top": -170, "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "rownumber_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "rownumber_0$in1", "type": "scalar", "extra": { "orderType": "desc" } }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "rownumber_0$out", "type": "scalar" }] }, { "id": "column_12", "type": "column", "left": -450, "top": -140, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_12$out" }] }, { "id": "column_13", "type": "column", "left": -420, "top": -90, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记时间", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_13$out" }] }, { "id": "logical_not_0", "type": "logical_not", "left": 800, "top": -240, "inputScokets_arr": [{ "name": "input1", "isIn": true, "id": "logical_not_0$input1", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "logical_not_0$out", "type": "scalar" }] }] }, { "id": "noperand_0", "type": "noperand", "left": -430, "top": -150, "operator": "+", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "noperand_0$in0", "defval": "1", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "noperand_0$in1", "defval": "2", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "noperand_0$out", "type": "scalar" }] }, { "id": "dbEntity_0", "type": "dbEntity", "left": -870, "top": -720, "title": "考勤某日", "targetEntity": "dbe-1506", "inputScokets_arr": [{ "name": "@targetDate", "isIn": true, "id": "dbEntity_0$@targetDate", "defval": "2018-12-1", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "dbEntity_0$out", "type": "table" }] }, { "id": "constvalue_0", "type": "constvalue", "left": -640, "top": -170, "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "constvalue_0$out", "defval": "2018-8-2", "type": "scalar" }] }, { "id": "dbEntity_1", "type": "dbEntity", "left": -830, "top": -500, "targetEntity": "dbe-126", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "dbEntity_1$out", "type": "table" }] }, { "id": "xjion_0", "type": "xjion", "left": -550, "top": -490, "editorLeft": 197, "editorTop": 164, "joinType": "inner join", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "xjion_0$in0", "type": "table" }, { "name": "in1", "isIn": true, "id": "xjion_0$in1", "type": "table" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "xjion_0$out", "type": "table" }], "nodes_arr": [{ "id": "ret_condition_1", "type": "ret_condition", "left": 320, "top": -30, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "ret_condition_1$in", "type": "boolean" }] }, { "id": "column_9", "type": "column", "left": -260, "top": 10, "tableName": "T100A员工登记姓名", "tableCode": 126, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_9$out", "type": "int" }] }, { "id": "compare_1", "type": "compare", "left": 110, "top": -50, "operator": "=", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "compare_1$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "compare_1$in1", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "compare_1$out", "type": "boolean" }] }, { "id": "column_8", "type": "column", "left": -180, "top": -30, "tableAlias": "考勤某日", "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_8$out" }] }] }], "links_arr": [{ "inSocketID": "ret_columns_0$in5", "outSocketID": "constvalue_1$out" }, { "inSocketID": "xjion_0$in0", "outSocketID": "dbEntity_0$out" }, { "inSocketID": "xjion_0$in1", "outSocketID": "dbEntity_1$out" }, { "inSocketID": "select_0$in", "outSocketID": "xjion_0$out" }, { "inSocketID": "ret_columns_0$in9", "outSocketID": "column_10$out" }, { "inSocketID": "ret_columns_0$in10", "outSocketID": "column_11$out" }, { "inSocketID": "ret_condition_1$in", "outSocketID": "compare_1$out" }, { "inSocketID": "compare_1$in1", "outSocketID": "column_9$out" }, { "inSocketID": "compare_1$in0", "outSocketID": "column_8$out" }, { "inSocketID": "ret_columns_0$in11", "outSocketID": "column_0$out" }, { "inSocketID": "ret_columns_0$in12", "outSocketID": "column_1$out" }, { "inSocketID": "ret_columns_0$in13", "outSocketID": "column_2$out" }, { "inSocketID": "ret_columns_0$in14", "outSocketID": "column_6$out" }, { "inSocketID": "ret_columns_0$in15", "outSocketID": "column_7$out" }, { "inSocketID": "ret_order_0$in0", "outSocketID": "column_3$out" }, { "inSocketID": "ret_order_0$in1", "outSocketID": "column_4$out" }, { "inSocketID": "compare_0$in0", "outSocketID": "column_5$out" }, { "inSocketID": "compare_0$in1", "outSocketID": "var_get_0$out" }, { "inSocketID": "ret_columns_0$in8", "outSocketID": "rownumber_0$out" }, { "inSocketID": "rownumber_0$in0", "outSocketID": "column_12$out" }, { "inSocketID": "rownumber_0$in1", "outSocketID": "column_13$out" }, { "inSocketID": "ret_condition_0$in", "outSocketID": "logical_not_0$out" }, { "inSocketID": "logical_not_0$input1", "outSocketID": "compare_0$out" }]
            //console.log(testJson);
        };var creationHelper = new NodeCreationHelper();
        var newCus = new SqlNode_BluePrint(null, testJson, creationHelper);
        _this5.addCusDBE(newCus);

        creationHelper = new NodeCreationHelper();
        var testJson2 = { "code": "cusDBE46", "retNodeId": "select_0", "name": "test3333", "type": "表值", "editorLeft": 419, "editorTop": 147, "nodes_arr": [{ "id": "select_0", "type": "select", "left": 160, "top": -100, "title": "返回表", "editorLeft": 412, "editorTop": 135, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "select_0$in", "type": "table" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "select_0$out", "type": "table" }], "nodes_arr": [{ "id": "ret_columns_0", "type": "ret_columns", "left": 150, "top": -160, "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "ret_columns_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "ret_columns_0$in1", "type": "scalar" }, { "name": "in5", "isIn": true, "id": "ret_columns_0$in5", "type": "scalar", "extra": { "alias": "考勤地点代码2" } }] }, { "id": "ret_condition_0", "type": "ret_condition", "left": 440, "top": -380, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "ret_condition_0$in", "type": "boolean" }] }, { "id": "ret_order_0", "type": "ret_order", "left": 400, "top": 0 }, { "id": "column_2", "type": "column", "left": -320, "top": -300, "tableName": "V113A名册员工全部", "tableCode": 309, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_2$out", "type": "int" }] }, { "id": "isnulloperator_0", "type": "isnulloperator", "left": 30, "top": -330, "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "isnulloperator_0$in0", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "isnulloperator_0$out", "type": "scalar" }] }, { "id": "column_3", "type": "column", "left": -242, "top": -82, "tableName": "V113A名册员工全部", "tableCode": 309, "columnName": "员工登记姓名", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_3$out", "type": "varchar" }] }, { "id": "column_4", "type": "column", "left": -248, "top": -44, "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记日期", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_4$out" }] }, { "id": "column_5", "type": "column", "left": -370, "top": -220, "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记时间", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_5$out" }] }, { "id": "isnullfun_0", "type": "isnullfun", "left": -150, "top": 10, "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "isnullfun_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "isnullfun_0$in1", "defval": "-1", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "isnullfun_0$out", "type": "scalar" }] }, { "id": "column_6", "type": "column", "left": -530, "top": 40, "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记地点代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_6$out" }] }, { "id": "column_7", "type": "column", "left": -390, "top": -170, "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "考勤登记地点代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_7$out" }] }] }, { "id": "dbEntity_0", "type": "dbEntity", "left": -510, "top": -40, "targetEntity": "dbe-1506", "inputScokets_arr": [{ "name": "@targetDate", "isIn": true, "id": "dbEntity_0$@targetDate", "defval": "2018-12-8", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "dbEntity_0$out", "type": "table" }] }, { "id": "dbEntity_1", "type": "dbEntity", "left": -490, "top": -240, "targetEntity": "dbe-309", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "dbEntity_1$out", "type": "table" }] }, { "id": "xjion_0", "type": "xjion", "left": -140, "top": -160, "editorLeft": -13, "editorTop": 378, "joinType": "left join", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "xjion_0$in0", "type": "table" }, { "name": "in1", "isIn": true, "id": "xjion_0$in1", "type": "table" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "xjion_0$out", "type": "table" }], "nodes_arr": [{ "id": "ret_condition_1", "type": "ret_condition", "left": 340, "top": -160, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "ret_condition_1$in", "type": "boolean" }] }, { "id": "column_0", "type": "column", "left": -310, "top": -200, "tableName": "V113A名册员工全部", "tableCode": 309, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_0$out", "type": "int" }] }, { "id": "column_1", "type": "column", "left": -310, "top": -150, "tableName": "FT101C考勤记录某日", "tableCode": 1506, "columnName": "员工登记姓名代码", "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "column_1$out" }] }, { "id": "compare_0", "type": "compare", "left": 50, "top": -210, "operator": "=", "inputScokets_arr": [{ "name": "in0", "isIn": true, "id": "compare_0$in0", "type": "scalar" }, { "name": "in1", "isIn": true, "id": "compare_0$in1", "type": "scalar" }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "compare_0$out", "type": "boolean" }] }] }, { "id": "cast_0", "type": "cast", "left": -210, "top": 130, "inputScokets_arr": [{ "name": "in", "isIn": true, "id": "cast_0$in", "type": "table", "extra": { "valType": "decimal", "size1": "3", "size2": "2" } }], "outputScokets_arr": [{ "name": "out", "isIn": false, "id": "cast_0$out", "type": "boolean" }] }], "links_arr": [{ "inSocketID": "xjion_0$in0", "outSocketID": "dbEntity_1$out" }, { "inSocketID": "xjion_0$in1", "outSocketID": "dbEntity_0$out" }, { "inSocketID": "compare_0$in0", "outSocketID": "column_0$out" }, { "inSocketID": "compare_0$in1", "outSocketID": "column_1$out" }, { "inSocketID": "ret_condition_1$in", "outSocketID": "compare_0$out" }, { "inSocketID": "select_0$in", "outSocketID": "xjion_0$out" }, { "inSocketID": "isnulloperator_0$in0", "outSocketID": "column_2$out" }, { "inSocketID": "ret_columns_0$in0", "outSocketID": "column_3$out" }, { "inSocketID": "ret_columns_0$in1", "outSocketID": "column_4$out" }, { "inSocketID": "isnullfun_0$in0", "outSocketID": "column_6$out" }, { "inSocketID": "ret_columns_0$in5", "outSocketID": "isnullfun_0$out" }] };
        var newCus2 = new SqlNode_BluePrint(null, testJson2, creationHelper);
        _this5.addCusDBE(newCus2);
        return _this5;
    }

    _createClass(DataMaster, [{
        key: 'addCusDBE',
        value: function addCusDBE(cusdbeItem) {
            if (this.customDBEntities_arr.indexOf(cusdbeItem) != -1) {
                return;
            }
            var useCode = cusdbeItem.code;
            var i = 0;
            if (IsEmptyString(useCode) || this.getCusDBEByCode(useCode) != null) {
                for (i = 0; i < 9999; ++i) {
                    useCode = 'cusDBE_' + i;
                    if (this.getCusDBEByCode(useCode) == null) {
                        break;
                    }
                }
            }
            var useName = cusdbeItem.name;
            if (IsEmptyString(useName) || this.getCusDBEByName(useName) != null) {
                for (i = 0; i < 9999; ++i) {
                    useName = '自订数据源_' + i;
                    if (this.getCusDBEByName(useCode) == null) {
                        break;
                    }
                }
            }
            cusdbeItem.master = this;
            cusdbeItem.name = useName;
            cusdbeItem.code = useCode;
            cusdbeItem.id = useCode;
            this.customDBEntities_arr.push(cusdbeItem);
        }
    }, {
        key: 'getCusDBEByName',
        value: function getCusDBEByName(name) {
            return this.customDBEntities_arr.find(function (item) {
                return item.name == name;
            });
        }
    }, {
        key: 'getCusDBEByCode',
        value: function getCusDBEByCode(code) {
            return this.customDBEntities_arr.find(function (item) {
                return item.name == name;
            });
        }
    }, {
        key: 'createCusDBE',
        value: function createCusDBE(name, type) {
            var newItem = new SqlNode_BluePrint({ name: name, type: type, master: this });
            this.addCusDBE(newItem);
            this.emit('customDBEChanged');
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
            var index = this.usedDBEnities_arr;
            this.usedDBEnities_arr.push(data);
            this.usedDBEnities_arr.sort(function (a, b) {
                return a.name < b.name;
            });
            this.dataView_usedDBEnities.emit('changed', this);
            return true;
        }
    }]);

    return DataMaster;
}(EventEmitter);