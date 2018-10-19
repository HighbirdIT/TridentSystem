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

var DBEntity = function (_EventEmitter2) {
    _inherits(DBEntity, _EventEmitter2);

    function DBEntity(initData) {
        _classCallCheck(this, DBEntity);

        var _this3 = _possibleConstructorReturn(this, (DBEntity.__proto__ || Object.getPrototypeOf(DBEntity)).call(this));

        Object.assign(_this3, initData);
        autoBind(_this3);
        return _this3;
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
    }]);

    return DBEntity;
}(EventEmitter);

var g_dataBase = new DataBase();

var E_USED_ENITIES_CHANGED = 'E_USED_ENITIES_CHANGED';

var DataMaster = function (_EventEmitter3) {
    _inherits(DataMaster, _EventEmitter3);

    function DataMaster(project) {
        _classCallCheck(this, DataMaster);

        var _this4 = _possibleConstructorReturn(this, (DataMaster.__proto__ || Object.getPrototypeOf(DataMaster)).call(this));

        autoBind(_this4);
        _this4.database = g_dataBase;
        _this4.usedDBEnities_arr = [];
        _this4.dataView_usedDBEnities = new ListDataView(_this4.usedDBEnities_arr, 'name', 'code');
        _this4.customDBEntities_arr = [new CustomDbEntity({ name: 'test', code: project.genControlName('cusDBE'), type: '表值' }), new CustomDbEntity({ name: 'test2', code: project.genControlName('cusDBE'), type: '标量值' })];
        _this4.project = project;

        _this4.dataView_usedDBEnities.on('changed', _this4.usedDBEnitiesChangedHandler);
        return _this4;
    }

    _createClass(DataMaster, [{
        key: 'hadCusDBE',
        value: function hadCusDBE(name) {
            return this.customDBEntities_arr.find(function (item) {
                return item.name == name;
            }) != null;
        }
    }, {
        key: 'createCusDBE',
        value: function createCusDBE(name, type) {
            this.customDBEntities_arr.push(new CustomDbEntity({ name: name, code: this.project.genControlName('cusDBE'), type: type }));
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