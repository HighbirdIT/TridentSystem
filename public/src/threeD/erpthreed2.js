THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
var threeDServerUrl = '/erppage/server/threeD/threeD_s1';

class THREE_UIItem {
    constructor(docElem, worldPosition) {
        this.docElem = docElem;
        this.worldPos = worldPosition;
    }
}

class THREE_LabelItem extends THREE_UIItem {
    constructor(docElem, worldPosition) {
        super(docElem, worldPosition);
    }
}

class THREE_ButtonItem extends THREE_UIItem {
    constructor(docElem, worldPosition) {
        super(docElem, worldPosition);
    }
}

class THREE_图纸部位Item {
    constructor(位置信息) {
        this.位置信息 = 位置信息;
        this.参数信息_arr = [];
        this.worldPos = new THREE.Vector3(0,0,0);
    }

    clearParam() {
        this.参数信息_arr = [];
    }

    addParam(target,startPos) {
        this.参数信息_arr.push(target);
        target.modelMeta = this;
        this.worldPos.add(startPos);
    }

    calWordlPos(){
        this.worldPos.divideScalar(this.参数信息_arr.length);
    }

    paramChanged() {
        this.paramCount = this.参数信息_arr.length;
        let completeCount = 0;
        this.参数信息_arr.forEach(paramItem => {
            if (paramItem.record.拍照状态 == 1) {
                completeCount += 1;
            }
        });
        this.completeCount = completeCount;
        this.allDone = completeCount == this.参数信息_arr.length;
        //this.docElem.innerHTML = `${this.位置信息.中文名称}</br>${completeCount}/${this.paramCount}`;
        //this.docElem.className = 'btn btn-' + (this.allDone ? 'success' : 'primary');
    }

    getNextParam(base){
        let index = this.参数信息_arr.indexOf(base) + 1;
        if(index >= this.参数信息_arr.length){
            index = 0;
        }
        return this.参数信息_arr[index];
    }

    getPreParam(base){
        let index = this.参数信息_arr.indexOf(base) - 1;
        if(index < 0){
            index = this.参数信息_arr.length - 1;
        }
        return this.参数信息_arr[index];
    }
}

class THREE_ParamItem extends THREE_ButtonItem {
    constructor(docElem, worldPosition, geometry, 位置信息, record) {
        super(docElem, worldPosition);
        this.位置信息 = 位置信息;
        this.geometry = geometry;
        this.record = record;
        this.recordChanged();
    }

    recordChanged() {
        if (this.record.拍照状态 == 0) {
            this.docElem.className = 'btn btn-warning btn-sm';
        }
        else {
            this.docElem.className = 'btn btn-success btn-sm';
        }
        var htmlText = '';
        if (this.record.一级序号 > 0) {
            let 序号str = "" + this.record.一级序号;
            if (this.record.二级序号 > 0) {
                序号str += "-" + this.record.二级序号;
            }
            htmlText = `${序号str}:${this.record.参数名称}${this.record.参数序号}`;
        }
        else {
            htmlText = `${this.record.参数名称}${this.record.参数序号}`;
        }
        // if (this.record.参数值 > 0) {
        //     htmlText += `</br>${RoundFloat(this.record.参数值)}`;
        // }
        this.docElem.innerHTML = htmlText;
    }
}

class PositionInfo {
    constructor(全局名称, 全局代码, 中文方位, 英文方位, 部位代码, 一级序号, 二级序号) {
        this.全局名称 = 全局名称;
        this.全局代码 = 全局代码;
        this.中文方位 = 中文方位;
        this.英文方位 = 英文方位;
        this.部位代码 = 部位代码;
        this.一级序号 = 一级序号;
        this.二级序号 = 二级序号;

        this.中文名称 = MakePositionName(全局名称, 中文方位, 部位代码, 一级序号, 二级序号);
        this.英文名称 = MakePositionName(全局名称, 英文方位, 部位代码, 一级序号, 二级序号);
    }
}

function MakePositionName(全局名称, 方位名称, 部位代码, 一级序号, 二级序号) {
    var name = 全局名称;
    var 序号 = "";
    if (一级序号 >= 0) {
        序号 = "" + 一级序号;
        if (二级序号 >= 0) {
            序号 += "-" + 二级序号;
        }
    }

    var bHad方位 = false;
    if (方位名称.length > 0 && 方位名称 != "无" && 方位名称 != "0") {
        bHad方位 = true;
        name += "-" + 方位名称;
        if (部位代码 >= 0) {
            name += "" + 部位代码;
        }
    }
    else if (部位代码 >= 0) {
        name += "-" + 部位代码;
    }

    if (序号.Length > 0) {
        name += (部位代码 >= 0 || !bHad方位 ? "-" : "") + 序号;
    }
    return name;
}

class ProjectMeta {
    constructor() {
        this.全局_map = {};
        this.方位_map = {};
        this.全局_arr = [];
    }

    createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号 = -1, 二级序号 = -1) {
        var 全局设置 = this.全局_map[全局代码];
        var 方位设置 = this.方位_map[方位名称];
        var rlt = new PositionInfo(全局设置.名称, 全局代码, 方位设置.中文名, 方位设置.英文名, 部位代码, 一级序号, 二级序号);
        return rlt;
    }

}

function makeInstance(geometry, color, coord) {
    var mat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
    var rlt = new THREE.Mesh(geometry, mat);
    rlt.position.copy(coord);
    return rlt;
}

function geoPointAtNormalizeLength(geo, lf) {
    if (geo == null || geo.geometry == null || geo.geometry.attributes == null || geo.geometry.attributes.position == null) {
        return null;
    }
    if (lf < 0) {
        lf = 0;
    }
    else if (lf > 1) {
        lf = 1;
    }
    let vec_a = new THREE.Vector3(0, 0, 0);
    let vec_b = new THREE.Vector3(0, 0, 0);
    let sumLen = 0;
    const posArr = geo.geometry.attributes.position;
    for (let i = 0; i < posArr.count; ++i) {
        vec_a.fromArray(posArr.array, i * 3);
        if (i != 0) {
            sumLen += vec_a.distanceTo(vec_b);
        }
        else if (lf == 0) {
            return vec_a;
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
    }
    if (lf == 1) {
        return vec_a;
    }

    let targetDis = lf * sumLen;
    sumLen = 0;
    let preSumLen = 0;
    for (let i = 0; i < posArr.count; ++i) {
        vec_a.fromArray(posArr.array, i * 3);
        if (i != 0) {
            let segLen = vec_a.distanceTo(vec_b);
            sumLen += segLen;
            if (targetDis <= sumLen) {
                let vec_seg = new THREE.Vector3();
                vec_seg.subVectors(vec_a, vec_b);
                vec_b.addScaledVector(vec_seg, (targetDis - preSumLen) / segLen);
                return vec_b;
            }
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
        preSumLen = sumLen;
    }
    return vec_a;
}

function getCurveGeoLength(geo) {
    if (geo == null || geo.geometry == null || geo.geometry.attributes == null || geo.geometry.attributes.position == null) {
        return null;
    }
    let vec_a = new THREE.Vector3(0, 0, 0);
    let vec_b = new THREE.Vector3(0, 0, 0);
    let sumLen = 0;
    const posArr = geo.geometry.attributes.position;
    for (let i = 0; i < posArr.count; ++i) {
        vec_a.fromArray(posArr.array, i * 3);
        if (i != 0) {
            sumLen += vec_a.distanceTo(vec_b);
        }
        vec_b.set(vec_a.x, vec_a.y, vec_a.z);
    }
    return sumLen;
}

const normalLineMat = new THREE.LineBasicMaterial( {
	color: 0x0000FF,
} );

class ERPC_ThreeDApp extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.initState = {
            fetching: false,
            fetch_title: "",
            fetch_percent: 0,
            fetch_error: "",
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true
        }
        this.state = this.initState;
        this.canvasRef = React.createRef();
        this.rootRef = React.createRef();
        this.labelsRef = React.createRef();
        this.btnsRef = React.createRef();
        this.drawingDataDirted = true;

        this.cubes_arr = [];
        this.uiItem_arr = [];
        this.图纸部位Btns_arr = [];
        this.paramBtns_arr = [];
        this.focusUIElem = null;
        this.focus图纸部位Btn = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
    }

    saveCameraView() {
        let nowPos = new THREE.Vector3();
        let nowTarget = new THREE.Vector3();
        nowPos.copy(this.camera.position);
        nowTarget.copy(this.controls.target);
        this.cameraInfo_arr.push({ pos: nowPos, target: nowTarget });
    }

    loadCameraView() {
        if (this.cameraInfo_arr.length > 0) {
            let item = this.cameraInfo_arr.pop();
            this.camera.position.copy(item.pos);
            this.controls.target.copy(item.target);
        }
    }

    cusComponentWillmount() {
        this.startAPP();
        let drawingFormPath = this.props.fullParentPath + '.DrawingSelectorForm';

    }

    cusComponentWillUnmount() {
    }

    turnOffShadow(object) {
        // object.castShadow = false;
    }

    clickModelMetaButtonHandler(ev) {
        let uiItem = null;
        let elem = ev.target;
        while (uiItem == null && elem != null) {
            uiItem = elem.uiItem;
            elem = elem.parentElement;
        }
        this.setShowingModelMeta(uiItem);
    }

    clickViewDrawingHandler(ev) {
        if (this.focus图纸部位Btn && this.focus图纸部位Btn.参数信息_arr.length > 0) {
            const 参数信息 = this.focus图纸部位Btn.参数信息_arr[0];
            view附件文件(this.focus图纸部位Btn.位置信息.中文名称, 参数信息.record.发图记录代码, 27);
        }
    }

    clickShotHandler(ev) {
        if (this.focusParam != null) {
            const self = this;
            let callBack = () => {
                if (self.focusParam != null) {
                    self.focusParam.record.拍照状态 = 1;
                    self.focusParam.recordChanged();
                    self.focus图纸部位Btn.paramChanged();
                }
            };
            shotParam(this.focusParam.位置信息.中文名称, this.focusParam.record.发图记录代码, this.focusParam.record.参数上传数据代码, callBack);
        }
    }

    clickParamButtonHandler(ev) {
        let uiItem = null;
        let elem = ev.target;
        while (uiItem == null && elem != null) {
            uiItem = elem.uiItem;
            elem = elem.parentElement;
        }
        this.setFocusParam(uiItem);
    }

    getNext图纸部位(base){
        let index = this.图纸部位Btns_arr.indexOf(base) + 1;
        if(index >= this.图纸部位Btns_arr.length){
            return null;
        }
        let rlt = this.图纸部位Btns_arr[index];
        if(rlt.位置信息.全局代码 != base.位置信息.全局代码){
            return null;
        }
        return this.图纸部位Btns_arr[index];
    }

    getPre图纸部位(base){
        let index = this.图纸部位Btns_arr.indexOf(base) - 1;
        if(index < 0){
            return null;
        }
        let rlt = this.图纸部位Btns_arr[index];
        if(rlt.位置信息.全局代码 != base.位置信息.全局代码){
            return null;
        }
        return this.图纸部位Btns_arr[index];
    }

    图纸部位Changed(want图纸部位) {
        if (want图纸部位 == this.focus图纸部位Btn) {
            return;
        }
        this.setFocusParam(null);
        const controls = this.controls;
        let self = this;
        let nowChildren = this.参数Parant.children.concat();
        nowChildren.forEach(x => {
            self.参数Parant.remove(x);
        });
        self.paramBtns_arr.forEach(tElem => {
            self.btnsRef.current.removeChild(tElem.docElem);
        });
        self.paramBtns_arr = [];

        if(this.focus图纸部位Btn != null){
            this.部位相机loc[this.focus图纸部位Btn.位置信息.英文名称] = new THREE.Vector3(this.camera.position.x,this.camera.position.y,this.camera.position.z);
        }
        this.focus图纸部位Btn = want图纸部位;
        if (want图纸部位 == null) {
            // controls.target.copy(this.originControlsTarget);
            this.loadCameraView();
            controls.enablePan = true;
        }
        else {
            let eyePos = this.部位相机loc[want图纸部位.位置信息.英文名称];
            if(eyePos == null){
                let pos_center = new THREE.Vector3(0,0,want图纸部位.worldPos.z);
                let theVec = new THREE.Vector3();
                theVec.subVectors(want图纸部位.worldPos, pos_center);
                theVec.normalize();
                eyePos = new THREE.Vector3(want图纸部位.worldPos.x,want图纸部位.worldPos.y,want图纸部位.worldPos.z + 0.2);
                eyePos.addScaledVector(theVec,1);
            }
            this.camera.position.copy(eyePos);

            //console.log(want图纸部位);
            this.saveCameraView();
            // this.originControlsTarget.copy(controls.target);
            controls.target.copy(want图纸部位.worldPos);
            controls.enablePan = false;

            want图纸部位.参数信息_arr.forEach(item => {
                self.参数Parant.add(item.geometry);
                self.paramBtns_arr.push(item);
                self.btnsRef.current.appendChild(item.docElem);
            });
        }
        this.setState({
            focus图纸部位: this.focus图纸部位Btn,
        });
        controls.update();
    }

    setFocusParam(paramItem) {
        if (paramItem == this.focusParam) {
            return;
        }
        const controls = this.controls;
        this.focusParam = paramItem;
        this.sphereInter.visible = false;
        if (paramItem == null) {
            this.loadCameraView();
            this.paramBtns_arr.forEach(btnItem => {
                btnItem.geometry.visible = true;
            });
        }
        else {
            this.saveCameraView();
            controls.target.copy(paramItem.worldPos);
            this.paramBtns_arr.forEach(btnItem => {
                btnItem.geometry.visible = false;
            });
            this.paramBtns_arr.forEach(btnItem => {
                if (btnItem == this.focusParam) {
                    btnItem.geometry.visible = true;
                }
            });
            if (paramItem.record.参数序号 == 0) {
                this.sphereInter.visible = true;
                this.sphereInter.position.copy(paramItem.worldPos);
            }
            else {
                if (getCurveGeoLength(paramItem.geometry) >= 0.2) {
                    this.sphereInter.visible = true;
                    this.sphereLocPercent = 0;
                }
            }
        }
        this.setState({
            focusParam: this.focusParam,
        });
        controls.update();
    }

    clickPreButtonHandler(ev){
        if(this.focusParam != null){
            this.setFocusParam(this.focus图纸部位Btn.getPreParam(this.focusParam));
        }
        let newItem = this.getPre图纸部位(this.focus图纸部位Btn);
        if(newItem){
            this.setState({watchPos:newItem.位置信息});
        }
    }

    clickNextButtonHandler(ev){
        if(this.focusParam != null){
            this.setFocusParam(this.focus图纸部位Btn.getNextParam(this.focusParam));
            return;
        }
        let newItem = this.getNext图纸部位(this.focus图纸部位Btn);
        if(newItem){
            this.setState({watchPos:newItem.位置信息});
        }
    }

    clickExitButtonHandler(ev){
        if(this.focusParam != null){
            this.setFocusParam(null);
            return;
        }
        let drawing = this.state.drawing;
        popLocationSelector(drawing.name,drawing.code,this.props.projectCode,drawing.关联模型代码,this.部位选择Callback);
    }

    clickKeyPointButtonHandler(ev) {
        let uiItem = null;
        let elem = ev.target;
        while (uiItem == null && elem != null) {
            uiItem = elem.uiItem;
            elem = elem.parentElement;
        }

    }

    toggleProjModelVisible(ev) {
        let newVisible = !this.state.projModelVisible;
        this.projModelObject.visible = newVisible;
        this.setState({
            projModelVisible: newVisible,
        });
    }

    toggleMetaModelVisible(ev) {
        let newVisible = !this.state.metaModelVisible;
        if(this.metaModelObject){
            this.metaModelObject.visible = newVisible;
        }
        this.setState({
            metaModelVisible: newVisible,
        });
    }

    toggleDoneVisible(ev) {
        let newVisible = !this.state.doneVisible;
        this.setState({
            doneVisible: newVisible,
        });
    }

    toggleUnDoneVisible(ev) {
        let newVisible = !this.state.undoneVisible;
        this.setState({
            undoneVisible: newVisible,
        });
    }

    initApp() {
        const canvas = this.canvasRef.current;
        const renderer = new THREE.WebGLRenderer({ canvas });
        this.renderer = renderer;

        const fov = 75;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const near = 0.1;
        const far = 500;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera = camera;

        camera.position.set(0, 0, 100);

        const scene = new THREE.Scene();
        this.scene = scene;
        //scene.background = new THREE.Color(0x9DA3AA);
        scene.background = new THREE.Color(0xEEEEEE);
        this.参数Parant = new THREE.Object3D();
        this.参数Parant.position.set(0, 0, 0);
        scene.add(this.参数Parant);

        // const geometry = new THREE.BoxGeometry(1,1,1);
        // this.cubes_arr.push(makeInstance(geometry, 0xff0000, new THREE.Vector3(-2,0,0)));
        // this.cubes_arr.push(makeInstance(geometry, 0x00ff00, new THREE.Vector3(0,0,0)));
        // this.cubes_arr.push(makeInstance(geometry, 0x0000ff, new THREE.Vector3(2,0,0)));

        // this.cubes_arr.forEach(cube=>{
        //     scene.add(cube);
        // });

        const lightColor = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(lightColor, intensity);
        light.castShadow = false;
        this.dirLight = light;
        light.position.set(-1, 2, 4);
        scene.add(light);
        scene.add(light.target)

        const controls = new OrbitControls(camera, canvas);
        this.controls = controls;
        controls.target.set(0, 0, 0);
        controls.update();
        controls.enableDamping = true;
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 0.3;
        controls.panSpeed = 0.5;
        controls.dampingFactor = 0.08;

        const geometry = new THREE.SphereGeometry(0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let sphereInter = new THREE.Mesh(geometry, material);
        this.sphereInter = sphereInter;
        sphereInter.visible = false;
        //scene.add(sphereInter);
    }

    ProjectChanged() {
        if (this.props.projectCode == null) {
            return;
        }
        if (this.state.showingProjectCode != this.props.projectCode) {
            this.setState({
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载项目元信息',
                fetch_error: '',
                projModelVisible: true,
                metaModelVisible: true,
            });
            this.drawingDataDirted = true;
            const self = this;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 项目代码: this.props.projectCode }, action: 'pulldata_ProjectMeta' }).then(json => {
                if (json.err != null) {
                    self.setState({
                        fetch_error: `出错了:${JSON.stringify(json.err)}`,
                    });
                    return;
                }

                var 全局_map = {};
                var 全局_arr = [];
                for (var key in json.data.全局_arr) {
                    var 全局 = json.data.全局_arr[key];
                    var 全局obj = { 代码: 全局.全局分类代码, 名称: 全局.全局分类名称, 全称: 全局.全局分类全称 };
                    全局_map[全局obj.代码] = 全局obj;
                    全局_arr.push(全局obj);
                }
                var 方位_map = {};
                for (var key in json.data.方位_arr) {
                    var 方位 = json.data.方位_arr[key];
                    var 方位obj = { 代码: 方位.路径代码, 英文名: 方位.英文名称, 中文名: 方位.中文名称 };
                    方位_map[方位obj.代码] = 方位obj;
                    方位_map[方位obj.英文名] = 方位obj;
                    方位_map[方位obj.中文名] = 方位obj;
                }

                if (self.ProjectMeta == null) {
                    self.ProjectMeta = new ProjectMeta();
                }
                self.ProjectMeta.全局_arr = 全局_arr;
                self.ProjectMeta.全局_map = 全局_map;
                self.ProjectMeta.方位_map = 方位_map;

                self.setState({
                    fetching: false,
                    showingProjectCode: self.props.projectCode,
                });
            });
        }
    }

    // 图元Changed() {
    //     if (this.state.drawing == null) {
    //         return;
    //     }
    //     if (this.state.showing图元代码 != this.state.drawing.图元代码) {
    //         this.setState({
    //             showing图元代码: this.state.drawing.图元代码,
    //             fetching: true,
    //             fetch_percent: 0,
    //             fetch_title: '加载图元数据',
    //             fetch_error: '',
    //         });
    //         const self = this;
    //         const scene = self.scene;
    //         const camera = self.camera;
    //         const controls = self.controls;

    //         nativeFetchJson(false, threeDServerUrl, { bundle: { 图元代码: this.state.drawing.图元代码 }, action: 'pulldata_图元明细数据' }).then(json => {
    //             if (json.err != null) {
    //                 self.setState({
    //                     fetch_error: `出错了:${JSON.stringify(json.err)}`,
    //                 });
    //                 return;
    //             }
    //             self.setState({
    //                 fetch_percent: 0.3,
    //                 fetch_title: '分析图元数据',
    //             });
    //             if (self.图纸部位Btns_arr != null) {
    //                 self.图纸部位Btns_arr.forEach(tElem => {
    //                     self.btnsRef.current.removeChild(tElem.docElem);
    //                 });
    //             }
    //             self.图纸部位_dic = {};
    //             self.图纸部位Btns_arr = [];
    //             for (let si in json.data) {
    //                 let dr = json.data[si];
    //                 let worldPos = new THREE.Vector3();
    //                 let t_arr = dr.放置点.split(',');
    //                 let X = parseFloat(t_arr[0]) * 0.001;
    //                 let Y = parseFloat(t_arr[1]) * 0.001;
    //                 let Z = parseFloat(t_arr[2]) * 0.001;
    //                 worldPos.set(X, Y, Z);
    //                 let btnElem = document.createElement('button');
    //                 btnElem.className = 'btn btn-primary';
    //                 btnElem.onclick = self.clickModelMetaButtonHandler;
    //                 let newMetaItem = new THREE_图纸部位Item(btnElem, worldPos, self.ProjectMeta.createPositionInfo(dr.全局代码, dr.方位名称, dr.部位代码));
    //                 btnElem.innerText = newMetaItem.位置信息.中文名称;
    //                 //btnElem.innerHTML = "<i class=\"fa fa-star\" />";
    //                 btnElem.uiItem = newMetaItem;
    //                 self.btnsRef.current.appendChild(btnElem);
    //                 self.图纸部位Btns_arr.push(newMetaItem);
    //                 self.图纸部位_dic[newMetaItem.位置信息.中文名称] = newMetaItem;
    //                 self.图纸部位_dic[newMetaItem.位置信息.英文名称] = newMetaItem;
    //             }
    //             if (this.state.drawing.图元信息文件路径 == '无') {
    //                 if (self.metaModelObject != null) {
    //                     scene.remove(self.metaModelObject);
    //                     self.metaModelObject = null;
    //                 }
    //                 self.setState({
    //                     fetching: false,
    //                     metaModelVisible: true,
    //                 });
    //             }
    //             else {
    //                 self.setState({
    //                     fetch_title: '加载图元模型',
    //                     fetch_percent: 0.5,
    //                 });
    //                 const loader = new Rhino3dmLoader();
    //                 loader.setLibraryPath('/vendor/other/');
    //                 loader.load(window.location.origin + this.state.drawing.图元信息文件路径, function (object) {
    //                     if (self.metaModelObject != null) {
    //                         scene.remove(self.metaModelObject);
    //                     }
    //                     self.metaModelObject = object;
    //                     scene.add(object);
    //                     self.setState({
    //                         fetching: false,
    //                         metaModelVisible: true,
    //                     });
    //                 }, (ev) => {
    //                     self.setState({
    //                         fetch_percent: 0.5 + (ev.loaded / ev.total) * 0.5,
    //                     });
    //                 }, (err) => {
    //                     self.setState({
    //                         fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
    //                     });
    //                     console.error(err);
    //                 });
    //             }
    //         });
    //     }
    // }


    modelChanged() {
        if (this.state.drawing == null) {
            return;
        }
        if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
            this.setState({
                showingModelPath: this.state.drawing.全局模型文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载图纸模型',
                fetch_error: '',
            });

            const loader = new Rhino3dmLoader();
            loader.setLibraryPath('/vendor/other/');
            const self = this;
            loader.load(window.location.origin + this.state.drawing.全局模型文件路径, function (object) {
                self.setState({
                    fetch_title: '解析图纸模型',
                });
                try {
                    const scene = self.scene;
                    const camera = self.camera;
                    const controls = self.controls;

                    // object.children.forEach(c=>{
                    //     c.material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
                    // });

                    scene.add(object);
                    let box = new THREE.Box3();
                    box.expandByObject(object);
                    let size = new THREE.Vector3();
                    let center = new THREE.Vector3();
                    box.getSize(size);
                    box.getCenter(center);
                    console.log('loaded');
                    controls.target.copy(center);
                    let cameraPos = center.clone();
                    cameraPos.add(new THREE.Vector3(size.x * 0.5, size.y * 0.5, size.z));
                    camera.position.copy(cameraPos);
                    if (self.projModelObject != null) {
                        self.projModelObject.clear();
                        scene.remove(self.projModelObject);
                    }
                    self.projModelObject = object;

                    object.userData['texts'].forEach(textGeo => {
                        let divElem = document.createElement('div');
                        divElem.innerText = textGeo.text;
                        divElem.className = 'badge badge-info';
                        let worldPos = new THREE.Vector3();
                        worldPos.fromArray(textGeo.point, 0);
                        // let helper = new THREE.AxesHelper(5);
                        // helper.position.copy(worldPos);
                        // scene.add(helper);

                        // let newLabelItem = new THREE_LabelItem(divElem, worldPos);
                        // self.labelsRef.current.appendChild(divElem);
                        // self.uiItem_arr.push(newLabelItem);

                        // let btnElem = document.createElement('button');
                        // btnElem.className = 'btn btn-primary';
                        // btnElem.onclick = self.clickKeyPointButtonHandler;
                        // btnElem.innerHTML = "<i class=\"fa fa-star\" />";
                        // let newBtnItem = new THREE_ButtonItem(btnElem,worldPos);
                        // btnElem.uiItem = newBtnItem;
                        // self.btnsRef.current.appendChild(btnElem);
                        // self.图纸部位Btns_arr.push(newBtnItem);
                    });
                    self.setState({
                        fetching: false,
                        projModelVisible: true,
                    });
                } catch (eo) {
                    self.setState({
                        fetch_error: JSON.stringify(`出错了:${eo.message}`),
                    });
                }
            }, (ev) => {
                self.setState({
                    fetch_percent: (ev.loaded / ev.total) * 0.8,
                });
            }, (err) => {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
                });
                console.error(err);
            });
        }
    }

    参数文件Changed() {
        if (this.state.drawing == null) {
            return;
        }
        if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
            this.setState({
                showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载参数数据',
                fetch_error: '',
            });

            const self = this;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: this.state.drawing.code }, action: 'pulldata_全局参数数据' }).then(json => {
                if (json.err != null) {
                    self.setState({
                        fetch_error: `出错了:${JSON.stringify(json.err)}`,
                    });
                    return;
                }
                let 参数名称_dic = {};
                let 参数数据_arr = json.data;
                参数数据_arr.forEach(item => {
                    参数名称_dic[item.加工图纸参数代码] = item.参数名称;
                });
                self.setState({
                    fetch_percent: 20,
                    fetch_title: '加载参数模型文件',
                });

                const loader = new Rhino3dmLoader();
                loader.setLibraryPath('/vendor/other/');
                loader.load(window.location.origin + this.state.drawing.参数信息文件路径, function (object) {
                    self.setState({
                        fetch_title: '解析参数数据模型',
                    });
                    try {
                        const scene = self.scene;
                        const camera = self.camera;
                        const controls = self.controls;

                        self.图纸部位Btns_arr.forEach(item => item.clearParam());

                        let 参数几何体_dic = {};
                        let layers_arr = object.userData['layers'];
                        object.children.forEach(obj => {
                            let layer = layers_arr[obj.userData.attributes.layerIndex];
                            let objName = obj.userData.attributes.name;
                            let centerPos = new THREE.Vector3();
                            let startPos = new THREE.Vector3();
                            let endPos = new THREE.Vector3();
                            let t_arr = layer.name.split('_');
                            let paramCode = parseInt(t_arr[1]);
                            let paramName = 参数名称_dic[paramCode];
                            obj.userData.attributes.userStrings.forEach(item => {
                                if (item[0] == 'center') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    centerPos.set(X, Y, Z);
                                }
                                else if (item[0] == 'start') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    startPos.set(X, Y, Z);
                                }
                                else if (item[0] == 'end') {
                                    t_arr = item[1].split(',');
                                    let X = parseFloat(t_arr[0]);
                                    let Y = parseFloat(t_arr[1]);
                                    let Z = parseFloat(t_arr[2]);
                                    endPos.set(X, Y, Z);
                                }
                            });
                            t_arr = objName.split('_');
                            let 全局代码 = t_arr[0];
                            let 方位名称 = t_arr[1];
                            let 部位代码 = t_arr[2];
                            let 一级序号 = t_arr[3];
                            let 二级序号 = t_arr[4];
                            let 参数序号 = t_arr[5];
                            let 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                            let 参数key = `${参数位置信息.英文名称}_${paramName}${参数序号}`;
                            obj.material = normalLineMat;
                            参数几何体_dic[参数key] = { obj: obj, center: centerPos, start: startPos, end: endPos, 位置信息: 参数位置信息 };
                        });
                        
                        self.图纸部位Btns_arr = [];
                        self.图纸部位_dic = {};
                        参数数据_arr.forEach(item => {
                            let 全局代码 = item.全局代码;
                            let 方位名称 = item.方位名称;
                            let 部位代码 = item.部位代码;
                            let 一级序号 = item.一级序号;
                            let 二级序号 = item.二级序号;
                            let 参数位置信息 = self.ProjectMeta.createPositionInfo(全局代码, 方位名称, 部位代码, 一级序号, 二级序号);
                            let 参数key = `${参数位置信息.英文名称}_${item.参数名称}${item.参数序号 == 0 ? 1 : item.参数序号}`;
                            let 参数几何体 = 参数几何体_dic[参数key];
                            if (参数几何体 == null) {
                                return;
                            }
                            if(self.图纸部位_dic[参数位置信息.英文名称] == null){
                                let new图纸部位Item = new THREE_图纸部位Item(参数位置信息);
                                self.图纸部位Btns_arr.push(new图纸部位Item);
                                self.图纸部位_dic[参数位置信息.英文名称] = new图纸部位Item;
                                self.图纸部位_dic[参数位置信息.中文名称] = new图纸部位Item;
                            }
                            let use图纸部位Item = self.图纸部位_dic[参数位置信息.英文名称];
                            let btnElem = document.createElement('button');
                            btnElem.className = 'btn btn-primary';
                            btnElem.onclick = self.clickParamButtonHandler;
                            let worldPos = 参数几何体.center;
                            if (item.参数序号 == 0) {
                                worldPos = 参数几何体.start;
                            }
                            let 参数item = new THREE_ParamItem(btnElem, worldPos, 参数几何体.obj, 参数位置信息, item);
                            use图纸部位Item.addParam(参数item,参数几何体.start);
                            btnElem.uiItem = 参数item;
                        });

                        self.图纸部位Btns_arr.forEach(meta => {
                            meta.paramChanged();
                            meta.calWordlPos();
                        });

                        //let newMetaItem = new THREE_图纸部位Item(btnElem,worldPos,self.ProjectMeta.createPositionInfo(dr.全局代码,dr.方位名称,dr.部位代码));
                        // scene.add(object);
                        // console.log(object);
                        self.setState({
                            fetching: false,
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify(`出错了:${eo.message}`),
                        });
                    }
                }, (ev) => {
                    self.setState({
                        fetch_percent: (ev.loaded / ev.total) * 0.8,
                    });
                }, (err) => {
                    self.setState({
                        fetch_error: JSON.stringify(`出错了:${err.target.statusText}`),
                    });
                    console.error(err);
                });

            });
        }
    }

    startAPP() {
        if (this.canvasRef.current == null) {
            setTimeout(this.startAPP, 100);
            return;
        }
        if (!this.state.inited) {
            this.initApp();
            this.setState({
                inited: true,
            });
        }
        this.preGameTime = 0;
        //console.log(this.canvasRef.current);
        requestAnimationFrame(this.renderFrame);
    }

    pauseAPP() {

    }

    smartUpdateButtonItem(btnItem, camera, canvas, maxDis = 100) {
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        let theVec = new THREE.Vector3();
        theVec.subVectors(btnItem.worldPos, camera.position);
        let dot = theVec.dot(cameraDir);
        let dis = btnItem.worldPos.distanceTo(camera.position);
        if (dot < 0 || dis > maxDis) {
            btnItem.docElem.style.display = 'none';
            return;
        }
        let tempV = new THREE.Vector3();
        tempV.copy(btnItem.worldPos);
        tempV.project(camera);
        const x = (tempV.x * .5 + .5) * canvas.clientWidth;
        const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

        btnItem.docElem.style.display = '';
        btnItem.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
        btnItem.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
    }

    clickDrawingBtnHandler(ev) {
        this.setState({ drawing: null });
    }

    drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码) {
        console.log(`name:${drawingName},code:${drawingCode},参数上传记录代码:${参数上传记录代码},参数信息文件路径:${参数信息文件路径},关联模型代码:${关联模型代码}`);
        this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码:关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码,全局模型文件代码:0,全局模型文件路径:null } });
        let self = this;
        this.setFocusParam(null);
        setTimeout(()=>{
            popLocationSelector(drawingName,drawingCode,self.props.projectCode,关联模型代码,self.部位选择Callback);
        },100);
    }

    部位选择Callback(rlt){
        if(rlt == null){
            if(this.state.focus图纸部位 == null){
                this.setState({ drawing: null });
            }
            return;
        }
        var posInfo = this.ProjectMeta.createPositionInfo(rlt.全局代码,rlt.方位名称,rlt.部位代码,rlt.一级序号,rlt.二级序号);
        var newdrawing = Object.assign(this.state.drawing, {全局模型文件代码:rlt.全局模型文件代码,全局模型文件路径:rlt.全局模型文件路径});
        this.setState({watchPos:posInfo,drawing:newdrawing});
    }

    resizeRendererToDisplaySize() {
        const canvas = this.canvasRef.current;
        const canvasParent = this.rootRef.current;
        const pixelRatio = 1;
        const width = canvasParent.clientWidth * pixelRatio | 0;
        const height = canvasParent.clientHeight * pixelRatio | 0;
        const needResize = canvas.width != width || canvas.height != height
        if (needResize) {
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

    renderFrame(gameTime) {
        const time = gameTime - this.preGameTime;
        this.preGameTime = gameTime;
        const camera = this.camera;
        const scene = this.scene;
        const canvas = this.canvasRef.current;
        const renderer = this.renderer;
        if (this.resizeRendererToDisplaySize()) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);

        let tempV = new THREE.Vector3();
        this.uiItem_arr.forEach(item => {
            tempV.copy(item.worldPos);
            // item.target.getWorldPosition(tempV);
            tempV.project(camera);
            const x = (tempV.x * .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
            item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
        });

        // this.图纸部位Btns_arr.forEach(keyBtn => {
        //     if (this.focus图纸部位Btn != null) {
        //         keyBtn.docElem.style.display = 'none';
        //     }
        //     else {
        //         if (keyBtn.allDone) {
        //             if (this.state.doneVisible == false) {
        //                 keyBtn.docElem.style.display = 'none';
        //                 return;
        //             }
        //         }
        //         else {
        //             if (this.state.undoneVisible == false) {
        //                 keyBtn.docElem.style.display = 'none';
        //                 return;
        //             }
        //         }
        //         this.smartUpdateButtonItem(keyBtn, camera, canvas);
        //     }
        // });

        this.paramBtns_arr.forEach(btnItem => {
            if (this.focusParam != null) {
                btnItem.docElem.style.display = 'none';
                return;
            }
            if (btnItem.record.拍照状态 == 1) {
                if (this.state.doneVisible == false) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
            }
            else {
                if (this.state.undoneVisible == false) {
                    btnItem.docElem.style.display = 'none';
                    return;
                }
            }
            this.smartUpdateButtonItem(btnItem, camera, canvas, 1000);
        });

        // if (this.focusParam != null) {
        //     if (this.sphereInter.visible && this.focusParam.record.参数序号 > 0) {
        //         let newPos = geoPointAtNormalizeLength(this.focusParam.geometry, this.sphereLocPercent);
        //         if (newPos != null) {
        //             this.sphereInter.position.copy(newPos);
        //             this.sphereLocPercent += (time / 1000) * 0.3;
        //             if (this.sphereLocPercent > 1.2) {
        //                 this.sphereLocPercent = 0;
        //             }
        //         }
        //     }
        // }

        renderer.render(scene, camera);
        requestAnimationFrame(this.renderFrame);
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        const self = this;
        let fetchBarElem = null;
        if (this.state.fetching) {
            let percentValue = Math.round(this.state.fetch_percent * 100);
            fetchBarElem = <div className='progressContainer' style={{ zIndex: 2000 }}>
                <div className='mask'></div>
                <div className='progressDiv'>
                    <h5><span className="badge badge-light flex-grow-0 flex-shrink-0 p-2 shadow" >{this.state.fetch_title}</span></h5>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: percentValue + '%' }}>{percentValue}%</div>
                    </div>
                    {this.state.fetch_error && this.state.fetch_error.length > 0 ? <div className='flex-grow-0 flex-shrink-0 mt-2 text-danger bg-light'>{this.state.fetch_error}</div> : null}
                </div>
            </div>
        }
        var rootDivClassName = 'erpc_threeD d-block hidenOverflow position-relative ' + (this.props.className == null ? '' : this.props.className);

        let topBtnsDiv = null;
        let 全局BtnsDiv = null;
        let nativeUIElem = null;
        let extraUIs_arr = [];

        let canvasWidth = 0;
        let canvasHeight = 0;
        if (this.rootRef.current != null) {
            canvasWidth = this.rootRef.current.clientWidth;
            canvasHeight = this.rootRef.current.clientHeight;
        }
        let canvasWidth_half = parseInt(canvasWidth * 0.5);
        let canvasHeight_half = parseInt(canvasHeight * 0.5);

        if (this.state.showingProjectCode != this.props.projectCode) {
            if (this.state.fetching == false) {
                if (this.state.showingProjectCode != this.props.projectCode) {
                    setTimeout(() => {
                        self.ProjectChanged();
                    }, 10);
                }
            }
        }
        else if (this.state.drawing == null) {
            // 选择全局图
            nativeUIElem = <div className='w-100 h-100 position-absolute' style={{ left: 0, top: 0, zIndex: 500 }}>
                {/* <button onClick={testHandler} className='btn btn-light'>测试功能</button> */}
                <VisibleCDrawingSelectorForm 项目代码={this.props.projectCode} id='DrawingSelectorForm' parentPath={this.props.fullParentPath} title='选择图纸' pagebreak={false} selectMode='single' keyColumn='项目图纸定义代码' onSelectedChanged={this.drawingChangedHandler} />
            </div>
            if (this.drawingDataDirted) {
                this.drawingDataDirted = false;
                setTimeout(() => {
                    pull_DrawingSelectorForm(null, self.props.fullParentPath, true, this.props.projectCode);
                }, 10);
            }
        }
        else{
            let drawingBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDrawingBtnHandler}><i className="fa fa-map" />{this.state.drawing.name}</button>
            topBtnsDiv = <div className="d-flex position-absolute" style={{ height: '30px', top: '5px', left: '5px' }}>
                {drawingBtn}
            </div>
            if(this.state.drawing.全局模型文件代码 == 0){
                // 等待选择全局模型文件
            }
            else if (this.state.fetching == false){
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.modelChanged();
                    }, 10);
                }
                else if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                    setTimeout(() => {
                        self.参数文件Changed();
                    }, 10);
                }
                else{
                    let wantfocus图纸部位 = this.图纸部位_dic[this.state.watchPos.英文名称];
                    if(this.state.focus图纸部位 != wantfocus图纸部位){
                        setTimeout(() => {
                            self.图纸部位Changed(wantfocus图纸部位);
                        }, 10);
                    }
                    else if (this.state.focus图纸部位 != null) {
                        let btnName = this.state.focus图纸部位.位置信息.中文名称 + '  ';
                        let shotBtn = null;
                        if (this.state.focusParam != null) {
                            btnName += this.state.focusParam.record.参数名称 + this.state.focusParam.record.参数序号;// + '[' + RoundFloat(this.state.focusParam.record.参数值) + ']';
                            shotBtn = <button onClick={this.clickShotHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 ml-2" ><i className="fa fa-camera" /></button>
                        }
                        extraUIs_arr.push(
                            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickPreButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-angle-left" /></button>
                                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" >{btnName}</button>
                                <button onClick={this.clickNextButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-angle-right" /></button>
                            </div>
                        );
                        extraUIs_arr.push(
                            <div key='middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 10) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickViewDrawingHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-file-image-o" /></button>
                                {/* <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-undo" /></button> */}
                                {shotBtn}
                            </div>
                        );
                    }
                }

                extraUIs_arr.push(
                    <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                        <button onClick={this.toggleProjModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0" ><i className={"fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '')}></i>场馆模型</button>
                        {/* <button onClick={this.toggleMetaModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.metaModelVisible == false ? '-slash text-danger' : '')}></i>图元模型</button> */}
                        <button onClick={this.toggleDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.doneVisible == false ? '-slash text-danger' : '')}></i>已完成</button>
                        <button onClick={this.toggleUnDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.undoneVisible == false ? '-slash text-danger' : '')}></i>未完成</button>
                    </div>
                );
                if (this.ProjectMeta != null) {
                    // 全局BtnsDiv = <div className="d-flex flex-column position-absolute" style={{width: '50px',left: '100%', transform: 'translate(-50%, -50%)'}}>
                    //     {this.ProjectMeta.全局_arr.map(全局item=>{
                    //         return <button key={全局item.代码} className="btn btn-light flex-grow-0 flex-shrink=0" >{全局item.名称}</button>;
                    //     })}
                    // </div>
                }
            }
        }

        // let midBtnsDiv = null;
        // if(midBtns_arr.length > 0){
        //     midBtnsDiv = <div className="d-flex flex-column position-absolute" style={{width: canvasWidth + 'px', height:'auto', left: '0px',bottom:canvasHeight+'px', transform: 'translate(0%, -0%)'}}>
        //             {midBtns_arr}
        //         </div>
        // }

        var needCtlPath = true;
        var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
        return <div ref={this.rootRef} className={useStyleClass.class} style={useStyleClass.style} ctl-fullpath={needCtlPath ? this.props.fullPath : null}>
            <canvas ref={this.canvasRef} className='w-100 h-100 d-block' />
            <div ref={this.labelsRef} className='three-label-container' style={{ left: 0, top: 0, zIndex: 10 }} />
            <div ref={this.btnsRef} className='three-ui-container' style={{ left: 0, top: 0, zIndex: 20 }} />
            <div className='position-absolute' style={{ left: 0, top: 0, zIndex: 30 }}>
                {topBtnsDiv}
                {extraUIs_arr}
            </div>
            {nativeUIElem}
            {fetchBarElem}
        </div>
    }
}

function ERPC_ThreeDApp_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode
    };
}

function ERPC_ThreeDApp_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_ThreeDApp = null;

function InitThreedApp() {
    VisibleERPC_ThreeDApp = ReactRedux.connect(ERPC_ThreeDApp_mapstatetoprops, ERPC_ThreeDApp_dispatchtorprops)(ERPC_ThreeDApp);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp);




// controls
// ui

const DrawingSelectorFormheadstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "minWidth": "33.3%", "whiteSpace": "nowrap", "overflow": "hidden" };
const DrawingSelectorFormtdstyle0 = { "width": "33.3%", "maxWidth": "33.3%", "minWidth": "33.3%", "verticalAlign": "middle" };
const DrawingSelectorFormheadstyle1 = { "width": "66.7%", "maxWidth": "66.7%", "minWidth": "66.7%", "whiteSpace": "nowrap", "overflow": "hidden" };
const DrawingSelectorFormtdstyle1 = { "width": "66.7%", "maxWidth": "66.7%", "minWidth": "66.7%", "verticalAlign": "middle" };
const DrawingSelectorForm_tableStyle = { "marginTop": "-50px" };
const DrawingSelectorForm_headtableStyle = { "marginBottom": "0px" };

function fresh_DrawingSelectorForm(retState, records_arr, oldValue, statePath, visited, delayActs, rowKeyInfo_map) {
    var DrawingSelectorForm_path = getParentPathByKey(statePath, 'DrawingSelectorForm');
    var DrawingSelectorForm_state = getStateByPath(retState, DrawingSelectorForm_path, {});
    var needSetState = {};
    if (oldValue != null) {
        var newRowCount = records_arr.length;
        oldValue.forEach((x, i) => {
            var rowkey = x.项目图纸定义代码;
            if (DrawingSelectorForm_state.hasOwnProperty('row_' + rowkey)) {
                needSetState['row_' + rowkey + '._isdirty'] = true;
            }
        });
    }
    var newKey_map = {};
    records_arr.forEach((rcd, index) => {
        var rowkey = rcd.项目图纸定义代码;
        rcd._key = rowkey;
        newKey_map[rowkey] = rcd;
    });
    gDataCache.set(DrawingSelectorForm_path + ".KeyToRcd_map", newKey_map);
    needSetState.selectedValue = GetFormSelectedProfile(DrawingSelectorForm_state, '项目图纸定义代码').key;
    retState = setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
    bind_DrawingSelectorForm(retState, null, null, statePath);
    var scrollSetting = gDataCache.get(DrawingSelectorForm_path + 'scrollsetting');
    if (scrollSetting) {
        setTimeout(() => {
            var scrollerElem = document.getElementById(DrawingSelectorForm_path + 'scroller');
            if (scrollerElem) { scrollerElem.scrollTop = scrollSetting.top; scrollerElem.scrollLeft = scrollSetting.left; }
        }, 200);
    }
}
function bind_DrawingSelectorForm(retState, newIndex, oldIndex, statePath) {
    var DrawingSelectorForm_path = getParentPathByKey(statePath, 'DrawingSelectorForm');
    var formState = getStateByPath(retState, DrawingSelectorForm_path, {});
    var records_arr = formState.records_arr;
    var needSetState = {};
    var bundle = {};
    var needActiveBindPage = true;
    needSetState['invalidbundle'] = false;
    retState = setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
    return bind_DrawingSelectorFormPage(retState, DrawingSelectorForm_path);
}
function DrawingSelectorForm_records_arr_changed(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map) {
    var needSetState = {};
    fresh_DrawingSelectorForm(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map)
    return setManyStateByPath(state, '', needSetState);
}
function pull_DrawingSelectorForm(retState, fullParentPath, holdScroll, 项目代码) {
    var hadStateParam = retState != null;
    var rowKeyInfo_map = getRowKeyMapFromPath(fullParentPath);
    var state = hadStateParam ? retState : store.getState();
    var scrollerElem = document.getElementById(fullParentPath + '.DrawingSelectorFormscroller');
    if (scrollerElem) { gDataCache.set(fullParentPath + '.DrawingSelectorFormscrollsetting', holdScroll ? { left: scrollerElem.scrollLeft, top: scrollerElem.scrollTop } : null); }
    var bundle = {
        项目代码: 项目代码
    };
    setTimeout(() => {
        store.dispatch(fetchJsonPost(threeDServerUrl, { bundle: bundle, action: 'pulldata_DrawingSelectorForm', }, makeFTD_Prop(fullParentPath, 'DrawingSelectorForm', 'records_arr', false), EFetchKey.FetchPropValue));
    }, 50);
    return state;
}

function bind_DrawingSelectorFormPage(retState, DrawingSelectorForm_path) {
    var formState = getStateByPath(retState, DrawingSelectorForm_path, {});
    var records_arr = formState.records_arr;
    var needSetState = {};
    var startRowIndex = 0;
    var endRowIndex = records_arr.length - 1;
    var freshrows_arr = [];
    for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
        var nowRecord = records_arr[rowIndex];
        if (nowRecord == null) { break; }
        var rowkey = GetFromatRowKey(nowRecord.项目图纸定义代码);
        var rowstate = getStateByPath(formState, "row_" + rowkey, {});
        if (rowstate._isdirty != false) {
            freshrows_arr.push(rowkey);
            needSetState["row_" + rowkey + "._isdirty"] = false;
            needSetState['row_' + rowkey + '.M_Label_42.text'] = nowRecord['加工图纸种类'];
            needSetState['row_' + rowkey + '.M_Label_53.text'] = nowRecord['图纸名称'];
        }
    }
    needSetState.startRowIndex = startRowIndex;
    needSetState.endRowIndex = endRowIndex;
    return setManyStateByPath(retState, DrawingSelectorForm_path, needSetState);
}

function DrawingSelectorForm_selectedValue_changed(state, newValue, oldValue, path, visited, delayActs, rowKeyInfo_map) {
    var formState = getStateByPath(state, this.props.fullPath)
    var selectedProfile = GetFormSelectedProfile(formState, '项目图纸定义代码');
    // console.log(selectedProfile.record);
    if (typeof this.props.onSelectedChanged == 'function') {
        this.props.onSelectedChanged(selectedProfile.record['图纸名称'], selectedProfile.record['项目图纸定义代码'], selectedProfile.record['参数上传记录代码'], selectedProfile.record['参数信息路径'], selectedProfile.record['关联模型代码']);
    }
}

class CDrawingSelectorForm extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPC_GridForm(this);
        gCreatFormSetting(this);
        this.clickRowHandler = this.clickRowHandler.bind(this);
        this.clickFreshHandler = this.clickFreshHandler.bind(this);

        this.DrawingSelectorForm_records_arr_changed = DrawingSelectorForm_records_arr_changed.bind(this);
        this.bind_DrawingSelectorForm = bind_DrawingSelectorForm.bind(this);
        this.DrawingSelectorForm_selectedValue_changed = DrawingSelectorForm_selectedValue_changed.bind(this);
    }

    componentWillMount() {
        let fullPath = this.props.fullPath;
        if (appStateChangedAct_map[fullPath + '.records_arr'] == null) {
            appStateChangedAct_map[fullPath + '.records_arr'] = this.DrawingSelectorForm_records_arr_changed;
            appStateChangedAct_map[fullPath + '.pageIndex'] = this.bind_DrawingSelectorForm;
            appStateChangedAct_map[fullPath + '.selectedValue'] = this.DrawingSelectorForm_selectedValue_changed;
        }
    }

    componentWillUnmount() {
        let fullPath = this.props.fullPath;
        if (appStateChangedAct_map[fullPath + '.records_arr'] != null) {
            appStateChangedAct_map[fullPath + '.records_arr'] = null;
            appStateChangedAct_map[fullPath + '.pageIndex'] = null;
            appStateChangedAct_map[fullPath + '.selectedValue'] = null;
            appStateChangedAct_map[fullPath + '.records_arr'] = null;
        }
    }

    render() {
        var retElem = null;
        if (this.props.visible == false) { return null; }
        retElem = this.renderContent();
        return retElem;
    }
    renderContent() {
        var retElem = null;
        var navElem = null;
        var bHadBottom = false;
        if (this.props.fetching) {
            retElem = renderFetcingTipDiv();
        }
        else {
            if (this.props.fetchingErr) {
                retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
            }
            else {
                if (this.props.invalidbundle) {
                    retElem = renderInvalidBundleDiv();
                }
                else {
                    bHadBottom = true;
                    if (!this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)) {
                        retElem = <div className='m-auto'>没有查询到数据</div>;
                    }
                    else {
                        var setting = gGetFormSetting(this.props.fullPath);
                        retElem = (
                            <CDrawingSelectorForm_TBody dataversion={setting.dataversion} records_arr={this.props.records_arr} startRowIndex={this.props.startRowIndex} endRowIndex={this.props.endRowIndex} fullPath={this.props.fullPath} form={this} clickRowHandler={this.clickRowHandler} selectedValue={this.props.selectedValue} />
                        );
                        if (this.props.pagebreak) {
                            navElem = <CBaseGridFormNavBar pageIndex={this.props.pageIndex} rowPerPage={this.props.rowPerPage} rowPerPageChangedHandler={this.rowPerPageChangedHandler} pageCount={this.props.pageCount} prePageClickHandler={this.prePageClickHandler} nxtPageClickHandler={this.nxtPageClickHandler} pageIndexChangedHandler={this.pageIndexChangedHandler} />
                        }
                    }
                }
            }
        }
        return (
            <div ref={this.rootRef} className='d-flex erp-form flexHelper flex-column centerelem w-100 position-absolute bg-light' style={{ maxHeight: '80%' }} >
                {this.props.title && <div className='bg-dark text-light justify-content-start d-flex flex-shrink-0 p-1'><span>{this.props.title}{this.props.records_arr && this.props.records_arr.length > 0 ? '[' + this.props.records_arr.length + '条]' : null}{this.props.fetching ? null : <i className='btn btn-sm fa fa-refresh' onClick={this.clickFreshHandler} />}</span></div>}
                <div id={this.props.fullPath + 'tableheader'} className='mw-100 hidenOverflow flex-shrink-0 gridFormFixHeaderDiv'>
                    <table className='table' style={DrawingSelectorForm_headtableStyle}>
                        <CDrawingSelectorForm_THead form={this} />
                    </table>
                </div>
                <div id={this.props.fullPath + 'scroller'} onScroll={this.tableBodyScroll} className='mw-100 autoScroll'>
                    {retElem}
                </div>
                {navElem}
            </div>);
    }
    clickFreshHandler(ev) {
        pull_DrawingSelectorForm(null, this.props.fullParentPath, true, this.props.项目代码);
    }
    clickRowHandler(ev) {
        var rowkey = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target, 'DrawingSelectorForm_rowkey'));
        var rowIndex = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target, 'DrawingSelectorForm_rowindex'));
        var state = store.getState();
        var formState = getStateByPath(state, this.props.fullPath, {});
        var keyvalue = rowkey;
        var nowRowKey = formState.selectedValue;
        if (nowRowKey == rowkey) {
            var selectedProfile = GetFormSelectedProfile(formState, '项目图纸定义代码');
            this.DrawingSelectorForm_selectedValue_changed(state, this.props.fullPath, selectedProfile.record, selectedProfile.index, selectedProfile.key);
            return;
        }
        var needSetState = {
            selectedValue: keyvalue,
            selectedRowIndex: rowIndex,
        }
        store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
    }

}

function CDrawingSelectorForm_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    retProps.visible = ctlState.visible == null ? true : ctlState.visible == true;
    retProps.fetching = ctlState.fetching;
    retProps.fetchingErr = ctlState.fetchingErr;
    retProps.records_arr = ctlState.records_arr;
    retProps.recordIndex = ctlState.recordIndex;
    retProps.nowRecord = ctlState.nowRecord;
    retProps.invalidbundle = ctlState.invalidbundle;
    retProps.loaded = ctlState.records_arr != null;
    retProps.startRowIndex = ctlState.startRowIndex;
    retProps.endRowIndex = ctlState.endRowIndex;
    retProps.pageCount = ctlState.pageCount;
    retProps.pageIndex = ctlState.pageIndex;
    retProps.rowPerPage = ctlState.rowPerPage;
    retProps.bindedRow = ctlState.bindedRow;
    retProps.selectedValue = ctlState.selectedValue == null ? null : ctlState.selectedValue;
    retProps.fullPath = propProfile.fullPath;
    retProps.fullParentPath = propProfile.fullParentPath;
    retProps.title = ctlState.title == null ? ownprops.title : ctlState.title;
    retProps.selectMode = 'single';
    retProps.项目代码 = ctlState.项目代码 == null ? ownprops.项目代码 : ctlState.项目代码;
    return retProps;
}
function CDrawingSelectorForm_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCDrawingSelectorForm = ReactRedux.connect(CDrawingSelectorForm_mapstatetoprops, CDrawingSelectorForm_disptchtoprops)(CDrawingSelectorForm);
class CDrawingSelectorForm_THead extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        var retElem = null;
        var simpleMode = this.props.simpleMode;
        return (<thead className="thead-light"><tr>
            <th scope='col' className='indexTableHeader'>序号</th>
            {this.props.M_LC_41_visible == false ? null : (
                <th style={DrawingSelectorFormheadstyle0}>
                    图纸种类
                </th>
            )}
            {this.props.M_LC_43_visible == false ? null : (
                <th style={DrawingSelectorFormheadstyle1}>
                    图纸名称
                </th>
            )}
        </tr></thead>);
        return retElem;
    }

}
class CDrawingSelectorForm_TBody extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        var retElem = null;
        var trElems_arr = [];
        var startRowIndex = this.props.startRowIndex;
        var endRowIndex = this.props.endRowIndex;
        var formProp = this.props.form.props;
        for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
            var rowRecord = formProp.records_arr[rowIndex];
            if (rowRecord == null) { break; }
            var rowkey = GetFromatRowKey(rowRecord.项目图纸定义代码);
            var selected = this.props.selectedValue == rowkey;
            trElems_arr.push(
                <VisibleERPC_GridSelectableRow key={rowkey} onMouseDown={this.props.clickRowHandler} rowClickable={true} rowkey={rowkey} form={this.props.form} selected={selected} hideSelector={true} >
                    <td className='indexTableHeader'>{rowIndex + 1}</td>
                    {this.props.M_LC_41_visible == false ? null : (
                        <td style={DrawingSelectorFormtdstyle0}>
                            <VisibleERPC_Label className='erp-control ' rowkey={rowkey} id='M_Label_42' parentPath={this.props.fullPath} type='string' />
                        </td>
                    )}
                    {this.props.M_LC_43_visible == false ? null : (
                        <td style={DrawingSelectorFormtdstyle1}>
                            <VisibleERPC_Label className='erp-control ' rowkey={rowkey} id='M_Label_53' parentPath={this.props.fullPath} type='string' />
                        </td>
                    )}
                </VisibleERPC_GridSelectableRow>);
        }
        return (<table className='table table-striped table-hover ' style={DrawingSelectorForm_tableStyle}>
            <CDrawingSelectorForm_THead simpleMode={true} />
            <tbody>{trElems_arr}</tbody>
        </table>);
    }
}

//===============
const M_Page_FileViewer_style = { "height": "100%" };
function view附件文件(图片名称, 关联记录代码, 归属流程代码) {
    var popPage_0entryParam = {
        显示名称: 图片名称,
        关联记录代码: 关联记录代码,
        归属流程代码: 归属流程代码,
        callBack: null,
    };
    gDataCache.set('M_Page_FileViewerentryParam', popPage_0entryParam);
    init_M_Page_FileViewer();
    popPage('M_Page_FileViewer', <VisibleCM_Page_FileViewer key='M_Page_FileViewer' />);
}
function shotParam(名称显示, 发图记录代码, 参数上传记录代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        if (popPage_1exportParam.拍照完成) {
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        发图记录代码: 发图记录代码,
        参数上传记录代码: 参数上传记录代码,
        名称显示: 名称显示,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ParamShoterentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter();
    popPage('M_Page_ParamShoter', <VisibleCM_Page_ParamShoter key='M_Page_ParamShoter' />);
}

function popLocationSelector(图纸名称, 图纸代码, 项目代码,关联模型代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(()=>{
            completeCallBack(popPage_1exportParam.部位信息);
        }, 50);
    };
    var popPage_1entryParam = {
        图纸名称:图纸名称,
		图纸代码:图纸代码,
		项目代码:项目代码,
		可视模型代码:关联模型代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_LocSelentryParam', popPage_1entryParam);
    init_M_Page_LocSel();
    popPage('M_Page_LocSel', <VisibleCM_Page_LocSel key='M_Page_LocSel' />);
}

function testHandler() {
    return;
    var popPage_1_callback = (popPage_1exportParam) => {
        if (popPage_1exportParam.拍照完成) {
            //setTimeout(() => {pull_M_Form_28(null,true,'M_Page_14.tabcontrol_4.tabitem_8',true);},50);
        }
    };
    var popPage_1entryParam = {
        发图记录代码: 3101,
        参数上传记录代码: 93095,
        名称显示: '一个地方',
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ParamShoterentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter();
    popPage('M_Page_ParamShoter', <VisibleCM_Page_ParamShoter key='M_Page_ParamShoter' />);
}

function init_M_Page_FileViewer(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_FileViewer';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_FileViewer_onLoad(); }, 50);
    setTimeout(() => {
    }, 50);
    needSetState['M_Page_FileViewer.parentPageID'] = parentPageID;
    needSetState['M_Page_FileViewer._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_FileViewer_onLoad() {
    var M_Page_FileViewer_显示名称 = getPageEntryParam('M_Page_FileViewer', '显示名称', 0);
    var M_Page_FileViewer_关联记录代码 = getPageEntryParam('M_Page_FileViewer', '关联记录代码', 0);
    var M_Page_FileViewer_归属流程代码 = getPageEntryParam('M_Page_FileViewer', '归属流程代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '查看文件', data: { 显示名称: M_Page_FileViewer_显示名称, 关联记录代码: M_Page_FileViewer_关联记录代码, 归属流程代码: M_Page_FileViewer_归属流程代码 } }, 'M_Page_FileViewer.iframe_fv.msg'));
    }, 50);
}

class CM_Page_FileViewer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_FileViewer';
        ERPC_Page(this);
    }
    render() {
        var retElem = null;
        retElem = (
            <div className={'d-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen')} style={M_Page_FileViewer_style}>
                {this.renderHead()}
                {this.renderContent()}
            </div>);
        return retElem;
    }
    renderHead() {
        return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>
            <h3 className='flex-grow-1 flex-shrink-1'>查看图纸</h3>
            <button onClick={this.close} className={'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '')}><i className='fa fa-close' /></button>
        </div>);
    }
    renderHeadButton() {
        var rlt_arr = [];
        return rlt_arr;
    }
    renderContent() {
        var retElem = null;
        retElem = (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column fixPageContent '>
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='286' pageType='mb' id='iframe_fv' parentPath='M_Page_FileViewer' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_FileViewer_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_FileViewer', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_FileViewer_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_FileViewer = ReactRedux.connect(CM_Page_FileViewer_mapstatetoprops, CM_Page_FileViewer_disptchtoprops)(CM_Page_FileViewer);

// M_Page_ParamShoter
function init_M_Page_ParamShoter(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ParamShoter';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ParamShoter_onLoad(); }, 50);
    setTimeout(() => {
    }, 50);
    needSetState['M_Page_ParamShoter.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_ParamShoter_onLoad() {
    var M_Page_ParamShoter_发图记录代码 = getPageEntryParam('M_Page_ParamShoter', '发图记录代码', 0);
    var M_Page_ParamShoter_参数上传记录代码 = getPageEntryParam('M_Page_ParamShoter', '参数上传记录代码', 0);
    var M_Page_ParamShoter_名称显示 = getPageEntryParam('M_Page_ParamShoter', '名称显示', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '刷新参数', data: { 发图记录代码: M_Page_ParamShoter_发图记录代码, 参数上传数据代码: M_Page_ParamShoter_参数上传记录代码, 构件全称: M_Page_ParamShoter_名称显示 } }, 'M_Page_ParamShoter.iframe_shot.msg'));
    }, 50);
}

function iframe_shot_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_shot_path = fullPath;
    if (msgtype == '拍照完成') {
        var closePage_0exportParam = {
            拍照完成: true,
        };
        closePage2('M_Page_ParamShoter', state);
        var closePage_0_callback = getPageEntryParam('M_Page_ParamShoter', 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_ParamShoter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_ParamShoter';
        ERPC_Page(this);
    }
    render() {
        var retElem = null;
        retElem = (
            <div className={'d-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen')} >
                {this.renderHead()}
                {this.renderContent()}
            </div>);
        return retElem;
    }
    renderHead() {
        return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>
            <h3 className='flex-grow-1 flex-shrink-1'>拍照上传</h3>
            <button onClick={this.close} className={'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '')}><i className='fa fa-close' /></button>
        </div>);
    }
    renderHeadButton() {
        var rlt_arr = [];
        return rlt_arr;
    }
    renderContent() {
        var retElem = null;
        retElem = (
            <div className='d-flex flex-grow-1 flex-shrink-1 flex-column fixPageContent '>
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='285' pageType='mb' onMessageFun={iframe_shot_onReceiveMsg} id='iframe_shot' parentPath='M_Page_ParamShoter' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_ParamShoter_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ParamShoter', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ParamShoter_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_ParamShoter = ReactRedux.connect(CM_Page_ParamShoter_mapstatetoprops, CM_Page_ParamShoter_disptchtoprops)(CM_Page_ParamShoter);


// M_Page_LocSel
function init_M_Page_LocSel(state,parentPageID){
	var needSetState={parentPageID:parentPageID};
	var fullParentPath='M_Page_LocSel';
	var hadState = state != null;
	if(!hadState){state = store.getState();}
	setTimeout(() => {M_Page_LocSel_onLoad();},50);
	setTimeout(() => {
	}, 50);
	needSetState['M_Page_LocSel.parentPageID']=parentPageID;
	needSetState['M_Page_LocSel._magicobj']={};
	if(hadState){
		state = setManyStateByPath(state,'',needSetState);
	}else{
		store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
	}
	return state;
}
function M_Page_LocSel_onLoad(){
	var M_Page_LocSel_图纸名称=getPageEntryParam('M_Page_LocSel','图纸名称',0);
	var M_Page_LocSel_项目代码=getPageEntryParam('M_Page_LocSel','项目代码',0);
	var M_Page_LocSel_可视模型代码=getPageEntryParam('M_Page_LocSel','可视模型代码',0);
	var M_Page_LocSel_图纸代码=getPageEntryParam('M_Page_LocSel','图纸代码',0);
	var state=store.getState();
	setTimeout(() => {
		store.dispatch(makeAction_setStateByPath({type:'设置参数',data:{图纸名称:M_Page_LocSel_图纸名称,项目代码:M_Page_LocSel_项目代码,可视模型代码:M_Page_LocSel_可视模型代码,图纸代码:M_Page_LocSel_图纸代码}},'M_Page_LocSel.iframe_locsel.msg'));
	},50);
}
function iframe_locsel_onReceiveMsg(msgtype,data,fullPath){
	var state=store.getState();
	var iframe_locsel_path=fullPath;
	if(msgtype=='选取完成'){
		var closePage_0exportParam={
			部位信息:data,
		};
		closePage2('M_Page_LocSel', state);
		var closePage_0_callback = getPageEntryParam('M_Page_LocSel','callBack');
		if(closePage_0_callback){setTimeout(()=>{closePage_0_callback(closePage_0exportParam);},20);}
	}
}

class CM_Page_LocSel extends React.PureComponent{
	constructor(props){
		super(props);
		this.id='M_Page_LocSel';
		ERPC_Page(this);
	}
	render(){
		var retElem=null;
		retElem = (
			<div className={'d-flex flex-column bg-light ' + (this.props.popInSide ? 'popPageChild' : 'popPage_fullscreen')} >
				{this.renderHead()}
				{this.renderContent()}
			</div>);
		return retElem;
	}
	renderHead(){
		return (<div className='d-flex flex-grow-0 flex-shrink-0 bg-primary text-light align-items-center text-nowrap pageHeader'>
			<h3 className='flex-grow-1 flex-shrink-1'>图纸部位选取</h3>
		<button onClick={this.close} className={'flex-grow-0 flex-shrink-0 btn btn-sm btn-danger mr-1' + (this.props.popInSide ? ' d-none' : '')}><i className='fa fa-close' /></button>
		</div>);
	}
	renderHeadButton(){
		var rlt_arr=[];
		return rlt_arr;
	}
	renderContent(){
		var retElem=null;
		retElem = (
			<div className='d-flex flex-grow-1 flex-shrink-1 flex-column fixPageContent '>
				<VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='287' pageType='auto' onMessageFun={iframe_locsel_onReceiveMsg} id='iframe_locsel' parentPath='M_Page_LocSel' />
				{this.renderSidePage()}
			</div>);
		return retElem;
	}

}
function CM_Page_LocSel_mapstatetoprops(state,ownprops){
	var retProps={};
	var pageState = getStateByPath(state, 'M_Page_LocSel', {});
	retProps['sidepages_arr']=pageState.sidepages_arr;
	retProps['parentPageID']=pageState.parentPageID;
	return retProps;
}
function CM_Page_LocSel_disptchtoprops(dispatch,ownprops){
	var retDispath={};
	return retDispath;
}
const VisibleCM_Page_LocSel = ReactRedux.connect(CM_Page_LocSel_mapstatetoprops, CM_Page_LocSel_disptchtoprops)(CM_Page_LocSel);