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
                nowEntity = new DBEntity(entityData);
                this.entities_arr.push(nowEntity);
                this.entityCode_map[code] = nowEntity;
                this.entityCode_map[entityData.name] = nowEntity;
                return true;
            } else {
                return nowEntity.synData(entityData);
            }
        }
    }, {
        key: 'getEntityByCode',
        value: function getEntityByCode(code) {
            return this.entityCode_map[code];
        }
    }]);

    return DataBase;
}(EventEmitter);

var DBEntity = function (_EventEmitter2) {
    _inherits(DBEntity, _EventEmitter2);

    function DBEntity(initData) {
        _classCallCheck(this, DBEntity);

        var _this3 = _possibleConstructorReturn(this, (DBEntity.__proto__ || Object.getPrototypeOf(DBEntity)).call(this));

        Object.assign(_this3, initData);
        return _this3;
    }

    _createClass(DBEntity, [{
        key: 'synData',
        value: function synData(newData) {
            return false;
        }
    }]);

    return DBEntity;
}(EventEmitter);

var CustomDbEntity = function (_EventEmitter3) {
    _inherits(CustomDbEntity, _EventEmitter3);

    function CustomDbEntity(initData) {
        _classCallCheck(this, CustomDbEntity);

        var _this4 = _possibleConstructorReturn(this, (CustomDbEntity.__proto__ || Object.getPrototypeOf(CustomDbEntity)).call(this));

        Object.assign(_this4, initData);
        return _this4;
    }

    return CustomDbEntity;
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
        _this5.customDBEntities_arr = [new CustomDbEntity({ name: '测试源', code: project.genControlName('cusDBE') }), new CustomDbEntity({ name: '测试源2', code: project.genControlName('cusDBE') })];

        _this5.dataView_usedDBEnities.on('changed', _this5.usedDBEnitiesChangedHandler);
        return _this5;
    }

    _createClass(DataMaster, [{
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