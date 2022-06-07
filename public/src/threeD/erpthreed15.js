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
        this.worldPos = new THREE.Vector3(0, 0, 0);
    }

    clearParam() {
        this.参数信息_arr = [];
    }

    addParam(target, startPos) {
        this.参数信息_arr.push(target);
        target.modelMeta = this;
        this.worldPos.add(startPos);
    }

    calWordlPos() {
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

    getNextParam(base) {
        let index = this.参数信息_arr.indexOf(base) + 1;
        if (index >= this.参数信息_arr.length) {
            index = 0;
        }
        return this.参数信息_arr[index];
    }

    getPreParam(base) {
        let index = this.参数信息_arr.indexOf(base) - 1;
        if (index < 0) {
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
        this.参数名称 = record.参数名称;
        this.参数序号 = record.参数序号;
    }

    recordChanged() {
        if (this.record.拍照状态 == 0) {
            this.docElem.className = 'btn btn-warning btn-sm';
        }
        else {
            this.docElem.className = 'btn btn-success btn-sm';
        }
        var htmlText = '';
        // if (this.record.一级序号 > 0) {
        //     let 序号str = "" + this.record.一级序号;
        //     if (this.record.二级序号 > 0) {
        //         序号str += "-" + this.record.二级序号;
        //     }
        //     htmlText = `${序号str}:${this.record.参数名称}${this.record.参数序号}`;
        // }
        // else {
        //     htmlText = `${this.record.参数名称}${this.record.参数序号}`;
        // }
        htmlText = `${this.record.参数名称}${this.record.参数序号}`;
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

    clone() {
        let rlt = new PositionInfo(this.全局名称, this.全局代码, this.中文方位, this.英文方位, this.部位代码, this.一级序号, this.二级序号);
        return rlt;
    }
}


class C构件上传记录{
    constructor() {
        this.复核参数_arr = []
    }

    set(上传记录代码,构件编号, 构件全称, 文件路径, 上传时间, 构件代码, worldPos, 生存状态代码){
        this.上传记录代码 = 上传记录代码;
        this.构件编号 = 构件编号;
        this.构件全称 = 构件全称;
        this.上传时间 = 上传时间;
        this.构件代码 = 构件代码;
        this.worldPos = worldPos;
        this.生存状态代码 = 生存状态代码;

        if(this.文件路径 != 文件路径){
            this.文件路径 = 文件路径;
            this.object3d = null;
        }
    }

    copy(other){
        this.set(other.上传记录代码,other.构件编号, other.构件全称, other.文件路径, other.上传时间, other.构件代码, other.worldPos, other.生存状态代码)
    }

    add复核参数(rcd){
        for(var si in this.复核参数_arr){
            let 参数item = this.复核参数_arr[si];
            if(参数item.参数上传数据代码 == rcd.参数上传数据代码){
                for(var pn in rcd){
                    参数item[pn] = rcd[pn];
                }
                return;
            }
        }
        this.复核参数_arr.push(rcd);
    }
}

class C关联构件模型 {
    constructor(posInfo) {
        this.posInfo = posInfo;
        this.构件记录_arr = [];
    }

    append(构件记录) {
        if(this.构件记录_arr.indexOf(构件记录) == -1){
            this.构件记录_arr.push(构件记录);
        }
    }
}

function SetObejectMaterail(object,mat){
    for (var si in object.children) {
        object.children[si].material = mat;
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

    if (序号.length > 0) {
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
        if(方位名称 == '' || 方位名称 == '无'){
            方位名称 = '0';
        }
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

const normalLineMat = new THREE.LineBasicMaterial({
    color: 0x0000FF,
});

const redLineMat = new THREE.LineBasicMaterial({
    color: 0xFF0000,
});

const dashLineMat = new THREE.LineDashedMaterial({
    color: 0x0000FF, dashSize: 0.3, gapSize: 0.1
});

const focusComponentModelMat = new THREE.MeshStandardMaterial({ color: 0xFF9933, side: THREE.DoubleSide });
const componentModelMat = new THREE.MeshStandardMaterial({ color: 0x052C6E, side: THREE.DoubleSide });
const 未到货构件Mat = new THREE.MeshStandardMaterial({ color: 0x052C6E, side: THREE.DoubleSide });
const 已到货构件Mat = new THREE.MeshStandardMaterial({ color: 0x6A92D4, side: THREE.DoubleSide });
const 已安装构件Mat = new THREE.MeshStandardMaterial({ color: 0x8EEB00, side: THREE.DoubleSide });

function 判断构件使用Mat(生存状态代码){
    if(生存状态代码 > 4){
        return 已安装构件Mat;
    }
    else if(生存状态代码 == 4){
        return 已到货构件Mat;
    }
    return 未到货构件Mat;
}

function SmartUpdateButtonItem(btnItem, camera, canvas, maxDis = 100) {
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

function TurnOffShadow(object) {
    object.castShadow = false;
}

function InitApp1() {
    const canvas = this.canvasRef.current;
    let renderer = null;
    try{
        renderer = new THREE.WebGLRenderer({ canvas });
    }catch(eo){
        alert('需要开启钉钉的WebGL功能');
        return;
    }
    if(renderer == null){
        alert('需要开启钉钉的WebGL功能');
        return;
    }
    this.renderer = renderer;

    const fov = 75;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;

    camera.position.set(0, 0, 100);

    let self = this;
    const scene = new THREE.Scene();
    if(scene == null){
        alert('无法创建THREE.Scene对象');
    }
    this.scene = scene;
    //scene.background = new THREE.Color(0x9DA3AA);
    scene.background = new THREE.Color(0xEEEEEE);
    this.参数Parant = new THREE.Object3D();
    this.参数Parant.position.set(0, 0, 0);
    scene.add(this.参数Parant);
    this.构件模型Parant = new THREE.Object3D();
    this.构件模型Parant.position.set(0, 0, 0);
    scene.add(this.构件模型Parant);

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

function ProjectChanged1() {
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
            comModelVisible: true,
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
                fetch_percent: 0,
                showingProjectCode: self.props.projectCode,
            });
        });
    }
}

function ResizeRendererToDisplaySize() {
    const canvas = this.canvasRef.current;
    const canvasParent = this.rootRef.current;
    if(canvasParent == null){
        return;
    }
    const pixelRatio = 1;
    const width = canvasParent.clientWidth * pixelRatio | 0;
    const height = canvasParent.clientHeight * pixelRatio | 0;
    const needResize = canvas.width != width || canvas.height != height
    if (needResize) {
        this.renderer.setSize(width, height, false);
    }
    return needResize;
}

function StartAPP() {
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

function SaveCameraView() {
    let nowPos = new THREE.Vector3();
    let nowTarget = new THREE.Vector3();
    nowPos.copy(this.camera.position);
    nowTarget.copy(this.controls.target);
    this.cameraInfo_arr.push({ pos: nowPos, target: nowTarget });
}

function LoadCameraView() {
    if (this.cameraInfo_arr.length > 0) {
        let item = this.cameraInfo_arr.pop();
        this.camera.position.copy(item.pos);
        this.controls.target.copy(item.target);
    }
}

function ThreeDApp_CusComponentWillmount() {
    store.dispatch(makeAction_setManyStateByPath({
        app: this,
    }, this.props.fullPath));
    this.startAPP();
    
}

function ThreeDApp_CusComponentWillUnmount() {
}

function ThreeD_Load3DM(modelPath,title,minP,maxP,loadCompleteAct) {
    let self = this;
    setTimeout(() => {
        self.setState({
            fetching: true,
            fetch_percent: minP,
            fetch_title: title,
            fetch_error: '',
        });
    }, 10);

    const loader = this.mainLoader;
    loader.load(modelPath, function (object) {
        loadCompleteAct(object);
    }, (ev) => {
        self.setState({
            fetch_percent: (ev.loaded / ev.total) * (maxP - minP) + minP,
        });
    }, (err) => {
        var msg = '';
        if(err.target && err.target.statusText){
            msg = err.target.statusText;
        }
        else if(err.message){
            msg = err.message;
        }
        self.setState({
            fetch_error: JSON.stringify(`出错了:${msg}`),
        });
        console.error(err);
    });
}

function ThreeD_Load全局模型(callback, reSetCamera = true) {
    if (this.state.drawing == null) {
        return;
    }
    let self = this;
    const scene = self.scene;
    const camera = self.camera;
    const controls = self.controls;
    if(this.projModelObject_cache == null){
        this.projModelObject_cache = {};
    }

    if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
        let 全局模型文件路径 = this.state.drawing.全局模型文件路径;
        let 全局模型文件代码 = this.state.drawing.全局模型文件代码;
        if (this.projModelObject != null) {
            scene.remove(self.projModelObject);
            this.projModelObject = null;
        }
        let labelsRefDiv = self.labelsRef.current;
        if(labelsRefDiv != null){
            self.projLabelItem_arr.forEach(item=>{
                labelsRefDiv.removeChild(item.docElem);
            });
            self.projLabelItem_arr = [];
        }
        if(全局模型文件代码 == 0){
            // 没有全局模型
            this.setState({
                showingModelPath: 全局模型文件路径,
                fetching: false,
            });
            
            if(callback != null){
                callback();
            }
            return;
        }
        if(this.projModelObject_cache[全局模型文件代码] != null){
            let cache = this.projModelObject_cache[全局模型文件代码];
            scene.add(cache.object);
            if(reSetCamera){
                controls.target.copy(cache.center);
            }
            this.projModelObject = cache.object;
            this.projLabelItem_arr = cache.projLabelItem_arr;
            this.projLabelItem_arr.forEach(item=>{
                labelsRefDiv.appendChild(item.docElem);
            });

            this.setState({
                fetching: false,
                fetch_percent: 0,
                projModelVisible: true,
                showingModelPath: 全局模型文件路径,
            });
            if(callback != null){
                callback(object);
            }
            return;
        }

        this.setState({
            showingModelPath: 全局模型文件路径,
            fetching: true,
        });
        this.load3dm(全局模型文件路径,'加载图纸模型',0,0.8,(object)=>{
            self.setState({
                fetch_title: '解析图纸模型',
            });
            try {
                scene.add(object);
                let box = new THREE.Box3();
                box.expandByObject(object);
                let size = new THREE.Vector3();
                let center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                if(reSetCamera){
                    controls.target.copy(center);
                    let cameraPos = center.clone();
                    cameraPos.add(new THREE.Vector3(size.x * 0.5, size.y * 0.5, size.z));
                    camera.position.copy(cameraPos);
                }
                if (self.projModelObject != null) {
                    self.projModelObject.clear();
                    scene.remove(self.projModelObject);
                }
                self.projModelObject = object;

                let projLabelItem_arr = [];
                object.userData['texts'].forEach(textGeo => {
                    let divElem = document.createElement('div');
                    divElem.innerText = textGeo.text;
                    divElem.className = 'badge badge-info';
                    let worldPos = new THREE.Vector3();
                    worldPos.fromArray(textGeo.point, 0);

                    let newLabelItem = new THREE_LabelItem(divElem, worldPos);
                    newLabelItem.isProjectLabel = true;
                    self.labelsRef.current.appendChild(divElem);
                    projLabelItem_arr.push(newLabelItem);
                });
                self.projLabelItem_arr = projLabelItem_arr;
                self.projModelObject_cache[全局模型文件代码] = {
                    object:object,
                    center:center,
                    projLabelItem_arr:projLabelItem_arr,
                };
                self.setState({
                    fetching: false,
                    fetch_percent: 0,
                    projModelVisible: true,
                });
                if(callback != null){
                    callback(object);
                }
            } catch (eo) {
                self.setState({
                    fetch_error: `出错了:${eo.message}:${JSON.stringify(logData)}`,
                });
            }
        });
    }
}

function ERP_ThreeDAppBase(target, initState) {
    let useInitState = Object.assign({
        fetching: false,
        fetch_title: "",
        fetch_percent: 0,
        fetch_error: "",
    },initState);

    target.state = useInitState;
    target.mainLoader = new Rhino3dmLoader();
    target.mainLoader.setLibraryPath('/vendor/other/');

    target.canvasRef = React.createRef();
    target.rootRef = React.createRef();
    target.labelsRef = React.createRef();
    target.btnsRef = React.createRef();
    target.projLabelItem_arr = [];
    target.cameraInfo_arr = [];

    target.resizeRendererToDisplaySize = ResizeRendererToDisplaySize.bind(target);
    target.startAPP = StartAPP.bind(target);
    target.saveCameraView = SaveCameraView.bind(target);
    target.loadCameraView = LoadCameraView.bind(target);
    target.cusComponentWillmount = ThreeDApp_CusComponentWillmount.bind(target);
    target.cusComponentWillUnmount = ThreeDApp_CusComponentWillUnmount.bind(target);
    target.load3dm = ThreeD_Load3DM.bind(target);
    target.全局模型changed = ThreeD_Load全局模型.bind(target);
    
}

// 全局图拍照app
class ERPC_ThreeDApp_A extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);
        ERP_ThreeDAppBase(this,
            {
                drawingCode: 0,
                showingModelPath: null,
                showing图元代码: null,
                doneVisible: true,
                undoneVisible: true,
                otherParamVisible: false,
                loadComponentModel: false,
            });
        
        this.drawingDataDirted = true;
        this.图纸部位Btns_arr = [];
        this.paramBtns_arr = [];
        this.focus图纸部位Btn = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};

        this.ProjectChanged = ProjectChanged1.bind(this);
        this.initApp = InitApp1.bind(this);
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

    getNext图纸部位(base) {
        let index = this.图纸部位Btns_arr.indexOf(base) + 1;
        if (index >= this.图纸部位Btns_arr.length) {
            return null;
        }
        let rlt = this.图纸部位Btns_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return this.图纸部位Btns_arr[index];
    }

    getPre图纸部位(base) {
        let index = this.图纸部位Btns_arr.indexOf(base) - 1;
        if (index < 0) {
            return null;
        }
        let rlt = this.图纸部位Btns_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return this.图纸部位Btns_arr[index];
    }

    // checkNeedDownloadModel(){
    //     let now图纸部位 = this.focus图纸部位Btn;
    //     if(now图纸部位 == null){
    //         return {};
    //     }
    //     let 图纸代码 = this.state.drawing.code;
    //     let 部位位置信息 = this.focus图纸部位Btn.位置信息;
    //     let needDownloadItems = [];
    //     let focusItems_arr = [];
    //     let targetPos = now图纸部位.worldPos;
    //     for (let index = -1; index < 2; ++index) {
    //         let 探测位置信息 = new PositionInfo(部位位置信息.全局名称, 部位位置信息.全局代码, 部位位置信息.中文方位, 部位位置信息.英文方位, 部位位置信息.部位代码, 部位位置信息.一级序号 + index, 部位位置信息.二级序号);
    //         let 部位key = `${图纸代码}_${探测位置信息.英文名称}`;
    //         let 关联模型 = this.关联构件模型_dic[部位key];
    //         if (关联模型 != null) {
    //             for (var si in 关联模型.构件记录_arr) {
    //                 let item = 关联模型.构件记录_arr[si];
    //                 if (index == 0) {
    //                     focusItems_arr.push(item);
    //                 }
    //                 if (item.object3d != null) {
    //                     targetPos = item.center;
    //                     this.构件模型Parant.add(item.object3d);
    //                 }
    //                 else {
    //                     needDownloadItems.push(item);
    //                 }
    //             }

    //         }
    //     }
    //     this.focusItems_arr = focusItems_arr;
    //     this.needDownloadItems = needDownloadItems;
    //     if (this.state.loadComponentModel && needDownloadItems.length > 0) {
    //         setTimeout(() => {
    //             this.download构件模型();
    //         }, 10);
    //     }
    //     return {
    //         needDownloadItems:needDownloadItems,
    //         focusItems_arr:focusItems_arr,
    //         targetPos:targetPos
    //     };
    // }

    checkNeedDownloadModel(){
        let now图纸部位 = this.focus图纸部位Btn;
        if(now图纸部位 == null){
            return {};
        }
        let needDownloadItems = [];
        let focusItems_arr = [];
        let targetPos = now图纸部位.worldPos;
        let 图纸代码 = this.state.drawing.code;
        let 部位位置信息 = this.focus图纸部位Btn.位置信息;
        let 部位key = `${图纸代码}_${部位位置信息.英文名称}`;
        let 关联模型 = this.关联构件模型_dic[部位key];
        if (关联模型 != null) {
            for (var si in 关联模型.构件记录_arr) {
                let item = 关联模型.构件记录_arr[si];
                targetPos = item.worldPos;
                focusItems_arr.push(item);
                if (item.object3d != null) {
                    this.构件模型Parant.add(item.object3d);
                    SetObejectMaterail(item.object3d, focusComponentModelMat);
                }
                else {
                    needDownloadItems.push(item);
                }
            }
        }
        for(var si in this.关联构件模型_dic){
            let 关联模型_a = this.关联构件模型_dic[si];
            if(关联模型_a == 关联模型){
                continue;
            }
            for (var sj in 关联模型_a.构件记录_arr) {
                let item = 关联模型_a.构件记录_arr[sj];
                let dis = targetPos.distanceTo(item.worldPos);
                if(dis <= 2){
                    if (item.object3d != null) {
                        this.构件模型Parant.add(item.object3d);
                        SetObejectMaterail(item.object3d, componentModelMat);
                    }
                    else {
                        needDownloadItems.push(item);
                    }
                }
            }
        }

        this.focusItems_arr = focusItems_arr;
        this.needDownloadItems = needDownloadItems;
        if (this.state.loadComponentModel && needDownloadItems.length > 0) {
            setTimeout(() => {
                this.download构件模型();
            }, 10);
        }
        return {
            needDownloadItems:needDownloadItems,
            focusItems_arr:focusItems_arr,
            targetPos:targetPos
        };
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

        if (this.focus图纸部位Btn != null) {
            if(this.TargetToEye_vec == null){
                this.TargetToEye_vec = new THREE.Vector3(0,0,0);
            }
            this.TargetToEye_vec.subVectors(this.camera.position, this.controls.target);
            this.部位相机loc[this.focus图纸部位Btn.位置信息.英文名称] = [new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z), new THREE.Vector3(controls.target.x, controls.target.y, controls.target.z)];
        }
        this.构件模型Parant.clear();
        this.focus图纸部位Btn = want图纸部位;
        if (want图纸部位 == null) {
            // controls.target.copy(this.originControlsTarget);
            //this.loadCameraView();
            controls.enablePan = true;
        }
        else {
            let checkRlt = this.checkNeedDownloadModel();
            let targetPos = checkRlt.targetPos;

            let t_arr = this.部位相机loc[want图纸部位.位置信息.英文名称];
            let eyePos = null;
            if (t_arr == null) {
                let pos_center = new THREE.Vector3(0, 0, targetPos.z);
                let theVec = new THREE.Vector3();
                theVec.subVectors(targetPos, pos_center);
                theVec.normalize();
                eyePos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z + 1);
                eyePos.addScaledVector(theVec, 1);
            }
            else {
                eyePos = t_arr[0];
                targetPos = t_arr[1];
            }
            if(this.TargetToEye_vec){
                eyePos.copy(targetPos);
                eyePos.add(this.TargetToEye_vec);
            }
            this.camera.position.copy(eyePos);

            //console.log(want图纸部位);
            //this.saveCameraView();
            // this.originControlsTarget.copy(controls.target);
            controls.target.copy(targetPos);
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

    download构件模型() {
        if (this.focus图纸部位Btn == null) {
            return;
        }
        // let 图纸代码 = this.state.drawing.code;
        // let 部位key = `${图纸代码}_${this.focus图纸部位Btn.位置信息.英文名称}`;
        // let 关联模型 = this.关联构件模型_dic[部位key];
        let downLoadItem = null;
        for (var si in this.needDownloadItems) {
            var item = this.needDownloadItems[si];
            if (item.object3d == null) {
                downLoadItem = item;
                break;
            }
        }
        const self = this;
        if (downLoadItem == null) {
            if(this.state.fetching){
                self.setState({
                    fetching: false,
                    fetch_percent: 0,
                });
            }
            return;
        }

        this.load3dm(downLoadItem.文件路径,`加载${downLoadItem.构件全称}实体模型`,0,1,(object)=>{
            self.setState({
                fetch_title: '解析实体模型',
            });
            try {
                for (var si in object.children) {
                    TurnOffShadow(object.children[si]);
                }
                downLoadItem.object3d = object;
                const controls = self.controls;

                self.构件模型Parant.add(object);
                let box = new THREE.Box3();
                box.expandByObject(object);
                let size = new THREE.Vector3();
                let center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                downLoadItem.center = center;
                if (self.focusItems_arr.indexOf(downLoadItem) != -1) {
                    controls.target.copy(center);
                    SetObejectMaterail(object, focusComponentModelMat);
                }
                else{
                    SetObejectMaterail(object, 判断构件使用Mat(downLoadItem.生存状态代码));
                }

                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            } catch (eo) {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${eo.message}`),
                });
            }
        });
    }

    freshRenderParamLine(){
        if(this.focusParam == null){
            return;
        }
        let paramItem = this.focusParam;
        this.参数Parant.clear();
        this.focus图纸部位Btn.参数信息_arr.forEach(item => {
            if (item == paramItem) {
                item.geometry.visible = true;
                item.geometry.material = redLineMat;
                this.参数Parant.add(item.geometry);
            }
            else if(this.state.otherParamVisible){
                if(item.参数序号 == 0){
                    // 0号参数实体永远不必添加
                    return;
                }
                if(paramItem.参数序号 == 0 && paramItem.参数名称 == item.参数名称 && item.参数序号 == 1){
                    // 当前参数的0号在上面被添加了，那么1号实体就不必添加了
                    return;
                }
                item.geometry.visible = true;
                item.geometry.material = normalLineMat;
                // item.geometry.visible = false;
                // if(item.dashLine == null){
                //     item.dashLine = new THREE.Line(item.geometry.geometry, dashLineMat);
                //     item.dashLine.computeLineDistances();
                // }
                this.参数Parant.add(item.geometry);
            }
        });
    }

    setFocusParam(paramItem) {
        if (paramItem == this.focusParam) {
            this.freshRenderParamLine();
            return;
        }
        const controls = this.controls;
        this.focusParam = paramItem;
        this.sphereInter.visible = false;
        if (paramItem == null) {
            this.参数Parant.clear();
            if (this.focus图纸部位Btn) {
                this.focus图纸部位Btn.参数信息_arr.forEach(item => {
                    item.geometry.visible = true;
                    item.geometry.material = normalLineMat;
                    this.参数Parant.add(item.geometry);
                });
            }
        }
        else {
            this.freshRenderParamLine();
            //this.saveCameraView();
            controls.target.copy(paramItem.worldPos);
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

    clickPreButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus图纸部位Btn.getPreParam(this.focusParam));
            return;
        }
        let newItem = this.getPre图纸部位(this.focus图纸部位Btn);
        if (newItem) {
            this.setState({ watchPos: newItem.位置信息 });
        }
    }

    clickNextButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus图纸部位Btn.getNextParam(this.focusParam));
            return;
        }
        let newItem = this.getNext图纸部位(this.focus图纸部位Btn);
        if (newItem) {
            this.setState({ watchPos: newItem.位置信息 });
        }
    }

    clickExitButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(null);
            return;
        }
        let drawing = this.state.drawing;
        popLocationSelector(drawing.name, drawing.code, this.props.projectCode, drawing.关联模型代码, this.部位选择Callback);
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

    toggleOPVVisible(ev){
        let newVisible = !this.state.otherParamVisible;
        this.setState({
            otherParamVisible: newVisible,
        });
        let self = this;
        setTimeout(() => {
            self.freshRenderParamLine();
        }, 100);
    }

    toggleMetaModelVisible(ev) {
        let newVisible = !this.state.metaModelVisible;
        if (this.metaModelObject) {
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

    toggleComponentModelVisible(ev) {
        let newVisible = !this.state.comModelVisible;
        this.构件模型Parant.visible = newVisible;
        this.setState({
            comModelVisible: newVisible,
        });
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
                fetch_title: '加载关联构件模型数据',
                fetch_error: '',
            });
            const self = this;
            let 图纸代码 = this.state.drawing.code;
            let 参数信息文件路径 = this.state.drawing.参数信息文件路径;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_图纸关联构件模型' }).then(json => {
                if (json.err != null) {
                    self.setState({
                        fetch_error: `出错了:${JSON.stringify(json.err)}`,
                    });
                    return;
                }
                let 关联模型数据_arr = json.data;
                关联模型数据_arr.forEach(item => {
                    item.X *= 0.001;
                    item.Y *= 0.001;
                    item.Z *= 0.001;
                    let 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                    
                    let 上传记录 = null;
                    if(self.构件上传记录_map[item.构件上传记录代码] == null){
                        上传记录 = new C构件上传记录();
                        上传记录.set(item.构件上传记录代码,item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X,item.Y,item.Z), item.构件生存状态代码)
                        self.构件上传记录_arr.push(上传记录);
                    }
                    else{
                        上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                        上传记录.copy(item);
                    }
                    let 部位key = `${图纸代码}_${构件位置信息.英文名称}`;
                    if (self.关联构件模型_dic[部位key] == null) {
                        self.关联构件模型_dic[部位key] = new C关联构件模型(构件位置信息);
                    }
                    let 关联构件模型 = self.关联构件模型_dic[部位key];
                    关联构件模型.append(上传记录);
                });
                self.setState({
                    fetch_percent: 0.1,
                    fetch_title: '加载参数数据',
                });
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

                    self.load3dm(参数信息文件路径,'加载参数数据模型',0.2,0.8,(object)=>{
                        self.setState({
                            fetch_title: '解析参数数据模型',
                        });
                        try {
                            self.图纸部位Btns_arr.forEach(item => item.clearParam());

                            let 参数几何体_dic = {};
                            let layers_arr = object.userData['layers'];
                            object.children.forEach(obj => {
                                let layer = layers_arr[obj.userData.attributes.layerIndex];
                                let objName = obj.userData.attributes.name;
                                let t_arr = layer.name.split('_');
                                let paramCode = parseInt(t_arr[1]);
                                let paramName = 参数名称_dic[paramCode];
                                let centerPos = geoPointAtNormalizeLength(obj,0.5);
                                let startPos = geoPointAtNormalizeLength(obj,0);
                                let endPos = geoPointAtNormalizeLength(obj,1);
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
                                if (self.图纸部位_dic[参数位置信息.英文名称] == null) {
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
                                use图纸部位Item.addParam(参数item, 参数几何体.start);
                                btnElem.uiItem = 参数item;
                            });

                            self.图纸部位Btns_arr.forEach(meta => {
                                meta.paramChanged();
                                meta.calWordlPos();
                            });
                            self.setState({
                                fetching: false,
                                fetch_percent: 0,
                            });
                        } catch (eo) {
                            self.setState({
                                fetch_error: JSON.stringify(`出错了:${eo.message}`),
                            });
                        }
                    });
                });
            });
        }
    }

    

    clickDrawingBtnHandler(ev) {
        this.preDrawing = this.state.drawing;
        this.setState({ drawing: null });
    }

    clickCloseDSHandler(ev){
        let preDrawing = this.preDrawing;
        setTimeout(() => {
            this.setState({ drawing: preDrawing });
        }, 10);
    }

    clickToggleLoadComHandler(ev) {
        let newVal = !this.state.loadComponentModel;
        this.setState({ loadComponentModel: newVal });
        if(newVal){
            let self = this;
            setTimeout(() => {
                let checkRlt = self.checkNeedDownloadModel();
            }, 100);
        }
    }

    drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码) {

        console.log(`name:${drawingName},code:${drawingCode},参数上传记录代码:${参数上传记录代码},参数信息文件路径:${参数信息文件路径},关联模型代码:${关联模型代码}`);
        this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null } });
        let self = this;
        this.setFocusParam(null);
        setTimeout(() => {
            popLocationSelector(drawingName, drawingCode, self.props.projectCode, 关联模型代码, self.部位选择Callback);
        }, 100);
    }

    部位选择Callback(rlt) {
        if (rlt == null) {
            if (this.state.focus图纸部位 == null) {
                this.setState({ drawing: null });
            }
            return;
        }
        var posInfo = this.ProjectMeta.createPositionInfo(rlt.全局代码, rlt.方位名称, rlt.部位代码, rlt.一级序号, rlt.二级序号);
        var newdrawing = Object.assign(this.state.drawing, { 全局模型文件代码: rlt.全局模型文件代码, 全局模型文件路径: rlt.全局模型文件路径 });
        this.setState({ watchPos: posInfo, drawing: newdrawing });
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
            this.setState({
                magicObj:{} // 窗口尺寸有变化，UI也要重新渲染
            });
        }

        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);

        let tempV = new THREE.Vector3();

        
        let theVec = new THREE.Vector3();
        this.projLabelItem_arr.forEach(item => {
            theVec.subVectors(item.worldPos, camera.position);
            item.dot = theVec.dot(cameraDir);
            item.dis = item.worldPos.distanceTo(camera.position);
        });

        let sorted_arr = this.projLabelItem_arr.concat();
        sorted_arr = sorted_arr.sort((a,b)=>{return a.dis - b.dis});

        let visibleCount = 0;
        sorted_arr.forEach(item => {
            let visible = true;
            if (item.dot < 0 || visibleCount >3) {
                visible = false;
            }
            
            if(visible){
                visibleCount += 1;
                tempV.copy(item.worldPos);
                // item.target.getWorldPosition(tempV);
                tempV.project(camera);
                const x = (tempV.x * .5 + .5) * canvas.clientWidth;
                const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
                item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
                item.docElem.style.display = '';
            }
            else{
                item.docElem.style.display = 'none';
            }
        });

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
            SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
        });

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
                <VisibleCDrawingSelectorForm actionName='pulldata_可选全局图纸' 项目代码={this.props.projectCode} id='DrawingSelectorForm' parentPath={this.props.fullParentPath} title='选择图纸' pagebreak={false} selectMode='single' keyColumn='项目图纸定义代码' onSelectedChanged={this.drawingChangedHandler} closable={this.preDrawing != null} clickCloseHandler={this.clickCloseDSHandler} />
            </div>
            if (this.drawingDataDirted) {
                this.drawingDataDirted = false;
                setTimeout(() => {
                    pull_DrawingSelectorForm(null, self.props.fullParentPath, true, this.props.projectCode, 'pulldata_可选全局图纸');
                }, 10);
            }
        }
        else {
            let drawingBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDrawingBtnHandler}><i className="fa fa-map" />{this.state.drawing.name}</button>
            let iconElem1 = null;
            if(this.state.loadComponentModel){
                iconElem1 = <i className="fa fa-cube"></i>
            }
            else{
                iconElem1 = <span className="fa-stack fa-lg">
                    <i className="fa fa-cube fa-stack-1x"></i>
                    <i className="fa fa-ban fa-stack-2x text-danger"></i>
                </span>
            }
            topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '70px', top: '5px', left: '5px' }}>
                {drawingBtn}
                <button className="btn btn-light flex-grow-0 flex-shrink=0 mt-1" onClick={this.clickToggleLoadComHandler}>{iconElem1}加载构件模型</button>
            </div>
            if (this.state.drawing.全局模型文件代码 == 0) {
                // 等待选择全局模型文件
            }
            else if (this.state.fetching == false) {
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.全局模型changed();
                    }, 10);
                }
                else if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                    setTimeout(() => {
                        self.参数文件Changed();
                    }, 10);
                }
                else {
                    let wantfocus图纸部位 = this.图纸部位_dic[this.state.watchPos.英文名称];
                    if (this.state.focus图纸部位 != wantfocus图纸部位) {
                        setTimeout(() => {
                            self.图纸部位Changed(wantfocus图纸部位);
                        }, 10);
                    }
                    else if (this.state.focus图纸部位 != null) {
                        let btnName = this.state.focus图纸部位.位置信息.中文名称 + '  ';
                        let shotBtn = null;
                        if (this.state.focusParam != null) {
                            btnName += this.state.focusParam.record.参数名称 + this.state.focusParam.record.参数序号 + '=' + this.state.focusParam.record.参数值.toFixed(0);

                            shotBtn = <button onClick={this.clickShotHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 ml-2" ><i className="fa fa-camera" /></button>
                        }
                        extraUIs_arr.push(
                            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickPreButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-angle-left" /></button>
                                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{minWidth:'150px'}} >{btnName}</button>
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
                let opvBtn = null;
                if(this.focusParam != null){
                    opvBtn = <button onClick={this.toggleOPVVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.otherParamVisible == false ? '-slash text-danger' : '')}></i>其它参数线</button>
                }
                extraUIs_arr.push(
                    <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                        <button onClick={this.toggleProjModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '')}></i>场馆模型</button>
                        <button onClick={this.toggleComponentModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.comModelVisible == false ? '-slash text-danger' : '')}></i>构件模型</button>
                        {opvBtn}
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

function ERPC_ThreeDApp_A_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_A_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

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
function pull_DrawingSelectorForm(retState, fullParentPath, holdScroll, 项目代码, actionName) {
    var hadStateParam = retState != null;
    var rowKeyInfo_map = getRowKeyMapFromPath(fullParentPath);
    var state = hadStateParam ? retState : store.getState();
    var scrollerElem = document.getElementById(fullParentPath + '.DrawingSelectorFormscroller');
    if (scrollerElem) { gDataCache.set(fullParentPath + '.DrawingSelectorFormscrollsetting', holdScroll ? { left: scrollerElem.scrollLeft, top: scrollerElem.scrollTop } : null); }
    var bundle = {
        项目代码: 项目代码
    };
    setTimeout(() => {
        store.dispatch(fetchJsonPost(threeDServerUrl, { bundle: bundle, action: actionName, }, makeFTD_Prop(fullParentPath, 'DrawingSelectorForm', 'records_arr', false), EFetchKey.FetchPropValue));
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
        this.props.onSelectedChanged(selectedProfile.record['图纸名称'], selectedProfile.record['项目图纸定义代码'], selectedProfile.record['参数上传记录代码'], selectedProfile.record['参数信息路径'], selectedProfile.record['关联模型代码'], selectedProfile.record);
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
        let closeBtn = null;
        if(this.props.closable){
            closeBtn = <div className='d-flex justify-content-center flex-grow-0 flex-shrink-0'><button onClick={this.props.clickCloseHandler} className='btn btn-danger' style={{minWidth:'100px'}}><i className='fa fa close'/>关闭</button></div>
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
                {closeBtn}
            </div>);
    }
    clickFreshHandler(ev) {
        pull_DrawingSelectorForm(null, this.props.fullParentPath, true, this.props.项目代码, this.props.actionName);
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
    popPersistentPage('M_Page_FileViewer', ()=>{return <VisibleCM_Page_FileViewer key='M_Page_FileViewer' />});
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
    popPersistentPage('M_Page_ParamShoter', ()=>{return <VisibleCM_Page_ParamShoter key='M_Page_ParamShoter' id='M_Page_ParamShoter' parenPath='M_Page_ParamShoter' flowCode='285' />});
}

function shotComParam(构件代码,参数上传数据代码,图纸种类代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        if (popPage_1exportParam.拍照完成) {
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        构件代码: 构件代码,
        参数上传数据代码: 参数上传数据代码,
        图纸种类代码: 图纸种类代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ParamShoter_comentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter_Com();
    popPersistentPage('M_Page_ParamShoter_com', ()=>{return <VisibleCM_Page_ParamShoter key='M_Page_ParamShoter_com' id='M_Page_ParamShoter_com' parenPath='M_Page_ParamShoter_com' flowCode='285' />});
}

function shotMultiComParam(构件代码,参数上传数据代码,图纸种类代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        if (popPage_1exportParam.拍照完成) {
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        构件代码: 构件代码,
        参数上传数据代码: 参数上传数据代码,
        图纸种类代码: 图纸种类代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ParamShoter_comMulentryParam', popPage_1entryParam);
    init_M_Page_ParamShoter_ComMul();
    popPersistentPage('M_Page_ParamShoter_comMul', ()=>{return <VisibleCM_Page_ParamShoter key='M_Page_ParamShoter_comMul' id='M_Page_ParamShoter_comMul' parenPath='M_Page_ParamShoter_comMul' flowCode='289' />});
}

function popLocationSelector(图纸名称, 图纸代码, 项目代码, 关联模型代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(() => {
            completeCallBack(popPage_1exportParam.部位信息);
        }, 50);
    };
    var popPage_1entryParam = {
        图纸名称: 图纸名称,
        图纸代码: 图纸代码,
        项目代码: 项目代码,
        可视模型代码: 关联模型代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_LocSelentryParam', popPage_1entryParam);
    init_M_Page_LocSel();
    popPersistentPage('M_Page_LocSel', ()=>{return <VisibleCM_Page_LocSel key='M_Page_LocSel' />});
}

function popComponentSelector(图纸名称, 图纸代码, 项目代码, 关联模型代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(() => {
            completeCallBack(popPage_1exportParam.构件信息);
        }, 50);
    };
    var popPage_1entryParam = {
        图纸名称: 图纸名称,
        图纸代码: 图纸代码,
        项目代码: 项目代码,
        可视模型代码: 关联模型代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ComSelentryParam', popPage_1entryParam);
    init_M_Page_ComSel();
    popPersistentPage('M_Page_ComSel', ()=>{return <VisibleCM_Page_ComSel key='M_Page_ComSel' />});
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
    needSetState['M_Page_ParamShoter.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function init_M_Page_ParamShoter_Com(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ParamShoter_Com_onLoad(); }, 50);
    needSetState['M_Page_ParamShoter_com.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter_com._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function init_M_Page_ParamShoter_ComMul(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ParamShoter_ComMul_onLoad(); }, 50);
    needSetState['M_Page_ParamShoter_comMul.parentPageID'] = parentPageID;
    needSetState['M_Page_ParamShoter_comMul._magicobj'] = {};
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

function M_Page_ParamShoter_Com_onLoad() {
    var 构件代码 = getPageEntryParam('M_Page_ParamShoter_com', '构件代码', 0);
    var 参数上传数据代码 = getPageEntryParam('M_Page_ParamShoter_com', '参数上传数据代码', 0);
    var 图纸种类代码 = getPageEntryParam('M_Page_ParamShoter_com', '图纸种类代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '刷新构件参数', data: { 构件代码: 构件代码, 参数上传数据代码: 参数上传数据代码, 图纸种类代码: 图纸种类代码 } }, 'M_Page_ParamShoter_com.iframe_shot.msg'));
    }, 50);
}

function M_Page_ParamShoter_ComMul_onLoad() {
    var 构件代码 = getPageEntryParam('M_Page_ParamShoter_comMul', '构件代码', 0);
    var 参数上传数据代码 = getPageEntryParam('M_Page_ParamShoter_comMul', '参数上传数据代码', 0);
    var 图纸种类代码 = getPageEntryParam('M_Page_ParamShoter_comMul', '图纸种类代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '刷新构件参数', data: { 构件代码: 构件代码, 参数上传数据代码: 参数上传数据代码, 图纸种类代码: 图纸种类代码 } }, 'M_Page_ParamShoter_comMul.iframe_shot.msg'));
    }, 50);
}

function iframe_shot_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_shot_path = fullPath;
    let pageID = 'M_Page_ParamShoter';
    let autoClose = true;
    if(fullPath.indexOf('_comMul') > 0){
        pageID += '_comMul';
    }
    else if(fullPath.indexOf('_com') > 0){
        pageID += '_com';
    }
    if (msgtype == '拍照完成') {
        var closePage_0exportParam = {
            拍照完成: true,
        };

        if(autoClose){
            closePage2(pageID, state);
        }
        
        var closePage_0_callback = getPageEntryParam(pageID, 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_ParamShoter extends React.PureComponent {
    constructor(props) {
        super(props);
        ERPC_Page(this);
    }
    render() {
        if(this.id == null){
            this.id = this.props.id;
        }
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode={this.props.flowCode} pageType='mb' onMessageFun={iframe_shot_onReceiveMsg} id='iframe_shot' parentPath={this.props.parenPath} />
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
function init_M_Page_LocSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_LocSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_LocSel_onLoad(); }, 50);
    setTimeout(() => {
    }, 50);
    needSetState['M_Page_LocSel.parentPageID'] = parentPageID;
    needSetState['M_Page_LocSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_LocSel_onLoad() {
    var M_Page_LocSel_图纸名称 = getPageEntryParam('M_Page_LocSel', '图纸名称', 0);
    var M_Page_LocSel_项目代码 = getPageEntryParam('M_Page_LocSel', '项目代码', 0);
    var M_Page_LocSel_可视模型代码 = getPageEntryParam('M_Page_LocSel', '可视模型代码', 0);
    var M_Page_LocSel_图纸代码 = getPageEntryParam('M_Page_LocSel', '图纸代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '设置参数', data: { 图纸名称: M_Page_LocSel_图纸名称, 项目代码: M_Page_LocSel_项目代码, 可视模型代码: M_Page_LocSel_可视模型代码, 图纸代码: M_Page_LocSel_图纸代码 } }, 'M_Page_LocSel.iframe_locsel.msg'));
    }, 50);
}
function iframe_locsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_locsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            部位信息: data,
        };
        closePage2('M_Page_LocSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_LocSel', 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_LocSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_LocSel';
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
            <h3 className='flex-grow-1 flex-shrink-1'>图纸部位选取</h3>
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='287' pageType='auto' onMessageFun={iframe_locsel_onReceiveMsg} id='iframe_locsel' parentPath='M_Page_LocSel' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_LocSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_LocSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_LocSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_LocSel = ReactRedux.connect(CM_Page_LocSel_mapstatetoprops, CM_Page_LocSel_disptchtoprops)(CM_Page_LocSel);

// const E构件NavType = {
//     只看到货的:'只看到货的'
// }

class ERPC_ThreeDApp_B extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);
        ERP_ThreeDAppBase(this,
            {
                drawingCode: 0,
                showingModelPath: null,
                showing图元代码: null,
                doneVisible: true,
                undoneVisible: true,
                otherParamVisible: false,
            });

        this.drawingDataDirted = true;
        this.图纸部位Btns_arr = [];
        this.paramBtns_arr = [];
        this.focus构件记录 = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};

        this.ProjectChanged = ProjectChanged1.bind(this);
        this.initApp = InitApp1.bind(this);
    }

    clickViewDrawingHandler(ev) {
        if (this.focus构件记录Btn && this.focus构件记录Btn.参数信息_arr.length > 0) {
            const 参数信息 = this.focus构件记录Btn.参数信息_arr[0];
            view附件文件(this.focus构件记录Btn.位置信息.中文名称, 参数信息.record.发图记录代码, 27);
        }
    }

    clickShotHandler(ev) {
        if(this.focus构件记录Btn == null){
            return;
        }
        let elem = ev.target;
        let record_id = 0;
        while (elem != null) {
            let tid = elem.getAttribute('record_id');
            if(!isNaN(tid)){
                record_id = parseInt(tid);
                break;
            }
            elem = elem.parentElement;
        }
        let 参数记录 = this.focus构件记录Btn.复核参数_arr.find(x=>{return x.参数上传数据代码 == record_id;});
        if(参数记录 != null){
            const self = this;
            let callBack = () => {
                if(参数记录.拍照状态 == 0){
                    参数记录.拍照状态 = 1;
                    self.setState({magicObj:{}});
                }
            };
            if(参数记录.是多点拍照 == 1){
                shotMultiComParam(this.focus构件记录Btn.构件代码,参数记录.参数上传数据代码,4, callBack);
            }
            else{
                shotComParam(this.focus构件记录Btn.构件代码,参数记录.参数上传数据代码,4, callBack);
            }
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

    getNext构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) + 1;
        if (index >= this.构件上传记录_arr.length) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return rlt;
    }

    getPre构件记录(base) {
        let index = this.构件上传记录_arr.indexOf(base) - 1;
        if (index < 0) {
            return null;
        }
        let rlt = this.构件上传记录_arr[index];
        if (rlt.位置信息.全局代码 != base.位置信息.全局代码) {
            return null;
        }
        return rlt;
    }

    checkNeedDownloadModel() {
        let now构件记录 = this.focus构件记录Btn;
        if (now构件记录 == null) {
            return {};
        }
        let needDownloadItems = [];
        let focusItems_arr = [now构件记录];
        let targetPos = now构件记录.worldPos;
        if (now构件记录.object3d != null) {
            this.构件模型Parant.add(now构件记录.object3d);
            SetObejectMaterail(now构件记录.object3d, focusComponentModelMat);
        }
        else {
            needDownloadItems.push(now构件记录);
        }
        this.构件上传记录_arr.forEach(item => {
            if (now构件记录 == item) {
                return;
            }
            let dis = targetPos.distanceTo(item.worldPos);
            if (dis <= 1.5) {
                if (item.object3d != null) {
                    this.构件模型Parant.add(item.object3d);
                    SetObejectMaterail(item.object3d, 判断构件使用Mat(item.生存状态代码));
                }
                else {
                    needDownloadItems.push(item);
                }
            }
        });

        this.focusItems_arr = focusItems_arr;
        this.needDownloadItems = needDownloadItems;
        if (needDownloadItems.length > 0) {
            setTimeout(() => {
                this.download构件模型();
            }, 10);
        }
        return {
            needDownloadItems: needDownloadItems,
            focusItems_arr: focusItems_arr,
            targetPos: targetPos
        };
    }

    构件记录Changed(want构件记录) {
        if (want构件记录 == this.focus构件记录Btn) {
            return;
        }

        this.setFocusParam(null);
        const controls = this.controls;
        let self = this;
        self.参数Parant.clear();
        self.paramBtns_arr.forEach(tElem => {
            self.btnsRef.current.removeChild(tElem.docElem);
        });
        self.paramBtns_arr = [];

        if (this.focus构件记录Btn != null) {
            if (this.TargetToEye_vec == null) {
                this.TargetToEye_vec = new THREE.Vector3(0, 0, 0);
            }
            this.TargetToEye_vec.subVectors(this.camera.position, this.controls.target);
        }
        this.构件模型Parant.clear();
        this.focus构件记录Btn = want构件记录;
        if (want构件记录 == null) {
            controls.enablePan = true;
        }
        else {
            let checkRlt = this.checkNeedDownloadModel();
            let targetPos = checkRlt.targetPos;

            let eyePos = null;
            let pos_center = new THREE.Vector3(0, 0, targetPos.z);
            let theVec = new THREE.Vector3();
            theVec.subVectors(targetPos, pos_center);
            theVec.normalize();
            eyePos = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z + 1);
            eyePos.addScaledVector(theVec, 1);
            if (this.TargetToEye_vec) {
                eyePos.copy(targetPos);
                eyePos.add(this.TargetToEye_vec);
            }
            this.camera.position.copy(eyePos);

            controls.target.copy(targetPos);
            controls.enablePan = false;

            let 图纸代码 = this.state.drawing.code;
            let 部位位置信息 = this.focus构件记录Btn.位置信息;
            let 关联部位参数 = this.图纸部位_dic[部位位置信息.英文名称];
            if(关联部位参数 != null){
                关联部位参数.参数信息_arr.forEach(item => {
                    self.参数Parant.add(item.geometry);
                });
            }
        }
        this.setState({
            focus构件记录: this.focus构件记录Btn,
        });
        controls.update();
    }

    download构件模型() {
        if (this.focus构件记录Btn == null) {
            return;
        }
        let now构件记录 = this.focus构件记录Btn;
        let downLoadItem = null;
        for (var si in this.needDownloadItems) {
            var item = this.needDownloadItems[si];
            if (item.object3d == null) {
                downLoadItem = item;
                break;
            }
        }
        const self = this;
        if (downLoadItem == null) {
            if(this.state.fetching){
                self.setState({
                    fetching: false,
                    fetch_percent: 0,
                });
            }
            return;
        }

        this.load3dm(downLoadItem.文件路径,`加载${downLoadItem.构件全称}实体模型`,0,1,(object)=>{
            self.setState({
                fetch_title: '解析实体模型',
            });
            try {
                for (var si in object.children) {
                    TurnOffShadow(object.children[si]);
                }
                downLoadItem.object3d = object;
                const controls = self.controls;

                self.构件模型Parant.add(object);
                let box = new THREE.Box3();
                box.expandByObject(object);
                let size = new THREE.Vector3();
                let center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                downLoadItem.center = center;
                if (downLoadItem == now构件记录) {
                    controls.target.copy(center);
                    SetObejectMaterail(object, focusComponentModelMat);
                }
                else {
                    SetObejectMaterail(object, 判断构件使用Mat(downLoadItem.生存状态代码));
                }

                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            } catch (eo) {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${eo.message}`),
                });
            }
        });
    }

    freshRenderParamLine() {
        if (this.focusParam == null) {
            return;
        }
        let paramItem = this.focusParam;
        this.参数Parant.clear();
        this.focus构件记录Btn.参数信息_arr.forEach(item => {
            if (item == paramItem) {
                item.geometry.visible = true;
                item.geometry.material = redLineMat;
                this.参数Parant.add(item.geometry);
            }
            else if (this.state.otherParamVisible) {
                if (item.参数序号 == 0) {
                    // 0号参数实体永远不必添加
                    return;
                }
                if (paramItem.参数序号 == 0 && paramItem.参数名称 == item.参数名称 && item.参数序号 == 1) {
                    // 当前参数的0号在上面被添加了，那么1号实体就不必添加了
                    return;
                }
                item.geometry.visible = true;
                item.geometry.material = normalLineMat;
                // item.geometry.visible = false;
                // if(item.dashLine == null){
                //     item.dashLine = new THREE.Line(item.geometry.geometry, dashLineMat);
                //     item.dashLine.computeLineDistances();
                // }
                this.参数Parant.add(item.geometry);
            }
        });
    }

    setFocusParam(paramItem) {
        if (paramItem == this.focusParam) {
            this.freshRenderParamLine();
            return;
        }
        const controls = this.controls;
        this.focusParam = paramItem;
        this.sphereInter.visible = false;
        if (paramItem == null) {
            this.参数Parant.clear();
            if (this.focus构件记录Btn) {
                this.focus构件记录Btn.参数信息_arr.forEach(item => {
                    item.geometry.visible = true;
                    item.geometry.material = normalLineMat;
                    this.参数Parant.add(item.geometry);
                });
            }
        }
        else {
            this.freshRenderParamLine();
            //this.saveCameraView();
            controls.target.copy(paramItem.worldPos);
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

    clickPreButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus构件记录Btn.getPreParam(this.focusParam));
            return;
        }
        let newItem = this.getPre构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
        }
    }

    clickNextButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(this.focus构件记录Btn.getNextParam(this.focusParam));
            return;
        }
        let newItem = this.getNext构件记录(this.focus构件记录Btn);
        if (newItem) {
            this.setState({ coming: { 上传记录代码: newItem.上传记录代码 } });
        }
    }

    clickExitButtonHandler(ev) {
        if (this.focusParam != null) {
            this.setFocusParam(null);
            return;
        }
        let drawing = this.state.drawing;
        popComponentSelector(drawing.name, drawing.code, this.props.projectCode, drawing.关联模型代码, this.构件选择Callback);
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

    toggleOPVVisible(ev) {
        let newVisible = !this.state.otherParamVisible;
        this.setState({
            otherParamVisible: newVisible,
        });
        let self = this;
        setTimeout(() => {
            self.freshRenderParamLine();
        }, 100);
    }

    toggleMetaModelVisible(ev) {
        let newVisible = !this.state.metaModelVisible;
        if (this.metaModelObject) {
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

    toggleComponentModelVisible(ev) {
        let newVisible = !this.state.comModelVisible;
        this.构件模型Parant.visible = newVisible;
        this.setState({
            comModelVisible: newVisible,
        });
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
            let 图纸代码 = this.state.drawing.code;
            let 参数信息文件路径 = this.state.drawing.参数信息文件路径;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_全局参数数据' }).then(json => {
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

                self.load3dm(参数信息文件路径,'加载参数数据模型',0.2,0.8,(object)=>{
                    self.setState({
                        fetch_title: '解析参数数据模型',
                    });
                    try {
                        if(self.图纸部位Btns_arr != null){
                            self.图纸部位Btns_arr.forEach(item => item.clearParam());
                        }

                        let 参数几何体_dic = {};
                        let layers_arr = object.userData['layers'];
                        object.children.forEach(obj => {
                            let layer = layers_arr[obj.userData.attributes.layerIndex];
                            let objName = obj.userData.attributes.name;
                            let t_arr = layer.name.split('_');
                            let paramCode = parseInt(t_arr[1]);
                            let paramName = 参数名称_dic[paramCode];
                            let centerPos = geoPointAtNormalizeLength(obj,0.5);
                            let startPos = geoPointAtNormalizeLength(obj,0);
                            let endPos = geoPointAtNormalizeLength(obj,1);
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
                            if (self.图纸部位_dic[参数位置信息.英文名称] == null) {
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
                            use图纸部位Item.addParam(参数item, 参数几何体.start);
                            btnElem.uiItem = 参数item;
                        });

                        self.图纸部位Btns_arr.forEach(meta => {
                            meta.paramChanged();
                            meta.calWordlPos();
                        });

                        self.setState({
                            fetching: false,
                            fetch_percent: 0,
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify(`出错了:${eo.message}`),
                        });
                    }
                });
            });
        }
    }



    clickDrawingBtnHandler(ev) {
        this.preDrawing = this.state.drawing;
        this.setState({ drawing: null });
    }

    clickCloseDSHandler(ev) {
        let preDrawing = this.preDrawing;
        setTimeout(() => {
            this.setState({ drawing: preDrawing });
        }, 10);
    }

    download构件参数() {
        let 种类index = 0;
        let downloading构件种类 = null;
        let self = this;
        for (; 种类index < this.所有构件种类_arr.length; ++种类index) {
            let 构件种类 = this.所有构件种类_arr[种类index];
            if (!构件种类.downloaded) {
                downloading构件种类 = 构件种类;
                break;
            }
        }
        if (downloading构件种类 == null) {
            let newState = Object.assign(self.waitSetState, {
                fetching: false,
                fetch_percent: 0,
            });
            self.setState(newState);
            setTimeout(() => {
                popComponentSelector(newState.drawing.name, newState.drawing.code, self.props.projectCode, newState.drawing.关联模型代码, self.构件选择Callback);
            }, 10);
            return;
        }
        self.setState({
            fetching: true,
            fetch_percent: (种类index / this.所有构件种类_arr.length),
            fetch_title: '加载' + downloading构件种类.name + '参数数据',
            fetch_error: '',
        });
        nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸种类代码: 4, 构件代码: downloading构件种类.code }, action: 'pulldata_构件参数数据' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let 参数数据_arr = json.data;
            参数数据_arr.forEach(item => {
                let 上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                if (上传记录 == null) {
                    return;
                }
                if (item.是复核参数) {
                    上传记录.add复核参数(item);
                }
            });
            downloading构件种类.downloaded = true;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
    }

    drawingChangedHandler(drawingName, drawingCode, 参数上传记录代码, 参数信息文件路径, 关联模型代码, record) {
        const self = this;
        if(drawingCode == this.state){
            return;
        }
        this.waitSetState = {
            drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null },
            coming: {}
        };
        this.setState({
            fetching: true,
            fetch_percent: 0,
            fetch_title: '加载构件集数据',
            fetch_error: '',
        });
        let 图纸代码 = drawingCode;
        nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_图纸关联构件模型' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let 关联模型数据_arr = json.data;
            let 所有构件种类_arr = [];
            关联模型数据_arr.forEach(item => {
                item.X *= 0.001;
                item.Y *= 0.001;
                item.Z *= 0.001;
                let 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                let 部位key = `${图纸代码}_${构件位置信息.英文名称}`;

                let found构件种类 = 所有构件种类_arr.find(x => { return x.code == item.构件代码 });
                if (found构件种类 == null) {
                    let t_arr = item.构件全称.split('-');
                    所有构件种类_arr.push({ code: item.构件代码, name: t_arr[1] });
                }

                let 上传记录 = null;
                if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                    上传记录 = new C构件上传记录();
                    上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                    self.构件上传记录_arr.push(上传记录);
                    self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                    上传记录.位置信息 = 构件位置信息;
                }
                else {
                    上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                    上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.文件路径, item.上传时间, item.构件代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                }

                if (self.关联构件模型_dic[部位key] == null) {
                    self.关联构件模型_dic[部位key] = new C关联构件模型(构件位置信息);
                }
                let 关联构件模型 = self.关联构件模型_dic[部位key];
                关联构件模型.append(上传记录);
            });
            self.所有构件种类_arr = 所有构件种类_arr;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
        //console.log(`name:${drawingName},code:${drawingCode},参数上传记录代码:${参数上传记录代码},参数信息文件路径:${参数信息文件路径},关联模型代码:${关联模型代码}`);
        // this.setState({ drawing: { name: drawingName, code: drawingCode, 关联模型代码: 关联模型代码, 参数信息文件路径: 参数信息文件路径, 参数上传记录代码: 参数上传记录代码, 全局模型文件代码: 0, 全局模型文件路径: null }, component:{构件上传记录代码:record.构件上传记录代码} });
        // this.setFocusParam(null);
    }

    构件选择Callback(rlt) {
        if (rlt == null) {
            if (this.state.focus构件记录 == null) {
                this.setState({ drawing: null });
            }
            return;
        }
        var posInfo = this.ProjectMeta.createPositionInfo(rlt.全局代码, rlt.方位名称, rlt.部位代码, rlt.一级序号, rlt.二级序号);
        var newdrawing = Object.assign(this.state.drawing, { 全局模型文件代码: rlt.全局模型文件代码, 全局模型文件路径: rlt.全局模型文件路径 });
        var newComponent = Object.assign(this.state.coming, { 上传记录代码: rlt.构件上传记录代码 });
        this.setState({ watchPos: posInfo, drawing: newdrawing, coming: newComponent });
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
            this.setState({
                magicObj: {} // 窗口尺寸有变化，UI也要重新渲染
            });
        }

        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);

        let tempV = new THREE.Vector3();


        let theVec = new THREE.Vector3();
        this.projLabelItem_arr.forEach(item => {
            theVec.subVectors(item.worldPos, camera.position);
            item.dot = theVec.dot(cameraDir);
            item.dis = item.worldPos.distanceTo(camera.position);
        });

        let sorted_arr = this.projLabelItem_arr.concat();
        sorted_arr = sorted_arr.sort((a, b) => { return a.dis - b.dis });

        let visibleCount = 0;
        sorted_arr.forEach(item => {
            let visible = true;
            if (item.dot < 0 || visibleCount > 3) {
                visible = false;
            }

            if (visible) {
                visibleCount += 1;
                tempV.copy(item.worldPos);
                // item.target.getWorldPosition(tempV);
                tempV.project(camera);
                const x = (tempV.x * .5 + .5) * canvas.clientWidth;
                const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
                item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
                item.docElem.style.display = '';
            }
            else {
                item.docElem.style.display = 'none';
            }
        });

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
            SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
        });

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
                <VisibleCDrawingSelectorForm actionName='pulldata_可选构件安装图纸' 项目代码={this.props.projectCode} id='DrawingSelectorForm' parentPath={this.props.fullParentPath} title='选择定位图纸' pagebreak={false} selectMode='single' keyColumn='项目图纸定义代码' onSelectedChanged={this.drawingChangedHandler} closable={this.preDrawing != null} clickCloseHandler={this.clickCloseDSHandler} />
            </div>
            if (this.drawingDataDirted) {
                this.drawingDataDirted = false;
                setTimeout(() => {
                    pull_DrawingSelectorForm(null, self.props.fullParentPath, true, this.props.projectCode, 'pulldata_可选构件安装图纸');
                }, 10);
            }
        }
        else {
            let drawingBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDrawingBtnHandler}><i className="fa fa-map" />{this.state.drawing.name}</button>
            topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '70px', top: '5px', left: '5px' }}>
                {drawingBtn}
            </div>
            if (this.state.drawing.全局模型文件代码 == 0) {
                // 等待选择全局模型文件
            }
            else if (this.state.fetching == false) {
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.全局模型changed();
                    }, 10);
                }
                else if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                    setTimeout(() => {
                        self.参数文件Changed();
                    }, 10);
                }
                else {
                    let wantfocus构件记录 = this.构件上传记录_map[this.state.coming.上传记录代码];
                    if (this.state.focus构件记录 != wantfocus构件记录) {
                        setTimeout(() => {
                            self.构件记录Changed(wantfocus构件记录);
                        }, 10);
                    }
                    else if (this.state.focus构件记录 != null) {
                        let btnName = this.state.focus构件记录.构件全称 + '  ';
                        let shotBtn = null;
                        if (this.state.focusParam != null) {
                            btnName += this.state.focusParam.record.参数名称 + this.state.focusParam.record.参数序号 + '=' + this.state.focusParam.record.参数值.toFixed(0);

                            shotBtn = <button onClick={this.clickShotHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 ml-2" ><i className="fa fa-camera" /></button>
                        }
                        let 状态提示elem = null;
                        if(this.state.focus构件记录.生存状态代码 < 4){
                            状态提示elem = <span className='badge badge-danger'><i className='fa fa-warning'/>未到达现场</span>
                        }
                        else if(this.state.focus构件记录.生存状态代码 > 4){
                            状态提示elem = <span className='badge badge-success'><i className='fa fa-checke'/>已安装</span>
                        }
                        if(状态提示elem != null){
                            extraUIs_arr.push(
                                <div key='mag_statetip' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 90) + 'px', transform: 'translate(-50%,-100%)' }}>
                                    {状态提示elem}
                                </div>
                            );
                        }
                        extraUIs_arr.push(
                            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickPreButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '60px' }} ><i className="fa fa-angle-left" /></button>
                                <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '150px' }} >{btnName}</button>
                                <button onClick={this.clickNextButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{ minWidth: '60px' }} ><i className="fa fa-angle-right" /></button>
                            </div>
                        );
                        extraUIs_arr.push(
                            <div key='middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 10) + 'px', transform: 'translate(-50%,-100%)' }}>
                                <button onClick={this.clickViewDrawingHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-file-image-o" /></button>
                                {/* <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" ><i className="fa fa-undo" /></button> */}
                                {shotBtn}
                            </div>
                        );
                        if(this.state.focus构件记录.复核参数_arr.length > 0){
                            // 复核参数按钮
                            extraUIs_arr.push(
                                <div key='comParamBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left: '2px', top: (canvasHeight - 100) + 'px', transform: 'translate(0%,-100%)' }}>
                                {this.state.focus构件记录.复核参数_arr.map(item=>{
                                    return <button key={item.参数上传数据代码} record_id={item.参数上传数据代码} onClick={this.clickShotHandler} className={"btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (item.拍照状态 ? 'success' : 'light')} ><i className="fa fa-camera" />{item.参数名称}</button>
                                })}
                                </div>
                            );
                        }
                    }
                }
                let opvBtn = null;
                if (this.focusParam != null) {
                    opvBtn = <button onClick={this.toggleOPVVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.otherParamVisible == false ? '-slash text-danger' : '')}></i>其它参数线</button>
                }
                extraUIs_arr.push(
                    <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                        <button onClick={this.toggleProjModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '')}></i>场馆模型</button>
                        <button onClick={this.toggleComponentModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.comModelVisible == false ? '-slash text-danger' : '')}></i>构件模型</button>
                        {opvBtn}
                        {/* <button onClick={this.toggleMetaModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.metaModelVisible == false ? '-slash text-danger' : '')}></i>图元模型</button> */}
                        {/* <button onClick={this.toggleDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.doneVisible == false ? '-slash text-danger' : '')}></i>已完成</button>
                        <button onClick={this.toggleUnDoneVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.undoneVisible == false ? '-slash text-danger' : '')}></i>未完成</button> */}
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

function ERPC_ThreeDApp_B_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_B_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_ThreeDApp_A = null;
var VisibleERPC_ThreeDApp_B = null;
var VisibleERPC_ThreeDApp_C = null;

function InitThreedApp() {
    VisibleERPC_ThreeDApp_A = ReactRedux.connect(ERPC_ThreeDApp_A_mapstatetoprops, ERPC_ThreeDApp_A_dispatchtorprops)(ERPC_ThreeDApp_A);
    VisibleERPC_ThreeDApp_B = ReactRedux.connect(ERPC_ThreeDApp_B_mapstatetoprops, ERPC_ThreeDApp_B_dispatchtorprops)(ERPC_ThreeDApp_B);
    VisibleERPC_ThreeDApp_C = ReactRedux.connect(ERPC_ThreeDApp_C_mapstatetoprops, ERPC_ThreeDApp_C_dispatchtorprops)(ERPC_ThreeDApp_C);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp);

// M_Page_ComSel
function init_M_Page_ComSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ComSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ComSel_onLoad(); }, 50);
    setTimeout(() => {
    }, 50);
    needSetState['M_Page_ComSel.parentPageID'] = parentPageID;
    needSetState['M_Page_ComSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_ComSel_onLoad() {
    var M_Page_ComSel_图纸名称 = getPageEntryParam('M_Page_ComSel', '图纸名称', 0);
    var M_Page_ComSel_项目代码 = getPageEntryParam('M_Page_ComSel', '项目代码', 0);
    var M_Page_ComSel_可视模型代码 = getPageEntryParam('M_Page_ComSel', '可视模型代码', 0);
    var M_Page_ComSel_图纸代码 = getPageEntryParam('M_Page_ComSel', '图纸代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '设置参数', data: { 图纸名称: M_Page_ComSel_图纸名称, 项目代码: M_Page_ComSel_项目代码, 可视模型代码: M_Page_ComSel_可视模型代码, 图纸代码: M_Page_ComSel_图纸代码 } }, 'M_Page_ComSel.M_iframe_comsel.msg'));
    }, 50);
}
function M_iframe_comsel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var M_iframe_comsel_path = fullPath;
    if (msgtype == '选取完成') {
        var closePage_0exportParam = {
            构件信息: data,
        };
        closePage2('M_Page_ComSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_ComSel', 'callBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(closePage_0exportParam); }, 20); }
    }
}

class CM_Page_ComSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_ComSel';
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
            <h3 className='flex-grow-1 flex-shrink-1'>安装构件选取</h3>
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='GJYM' flowCode='288' pageType='auto' onMessageFun={M_iframe_comsel_onReceiveMsg} id='M_iframe_comsel' parentPath='M_Page_ComSel' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_ComSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ComSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ComSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_ComSel = ReactRedux.connect(CM_Page_ComSel_mapstatetoprops, CM_Page_ComSel_disptchtoprops)(CM_Page_ComSel);

class ERPC_ThreeDApp_C extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);
        ERP_ThreeDAppBase(this,
        {
            drawingCode: 0,
            showingModelPath: null,
            showing图元代码: null,
            doneVisible: true,
            undoneVisible: true,
            otherParamVisible: false,
            paramlineVisible: true,
            comLabelVisible: true,
        });

        this.drawingDataDirted = true;
        this.图纸部位Btns_arr = [];
        this.focus构件记录 = null;
        this.focusParam = null;
        this.cameraInfo_arr = [];
        this.部位相机loc = {};
        this.关联构件模型_dic = {};
        this.构件上传记录_arr = [];
        this.构件上传记录_map = {};
        this.comLabelItems_arr = [];

        this.ProjectChanged = ProjectChanged1.bind(this);
        this.initApp = InitApp1.bind(this);
    }

    download构件模型() {
        let now构件记录 = this.focus构件记录;
        let downLoadItem = null;
        for (var si in this.needDownloadItems) {
            var item = this.needDownloadItems[si];
            if (item.object3d == null) {
                downLoadItem = item;
                break;
            }
        }
        const self = this;
        if (downLoadItem == null) {
            if(this.state.fetching){
                self.setState({
                    fetching: false,
                    fetch_percent: 0,
                });
            }
            return;
        }

        this.load3dm(downLoadItem.文件路径,`加载${downLoadItem.构件全称}实体模型`,0,1,(object)=>{
            self.setState({
                fetch_title: '解析实体模型',
            });
            try {
                for (var si in object.children) {
                    TurnOffShadow(object.children[si]);
                }
                
                downLoadItem.object3d = object;
                const controls = self.controls;

                if(downLoadItem == now构件记录){
                    self.focus构件Parant.add(object);
                }
                else{
                    self.构件模型Parant.add(object);
                }
                let box = new THREE.Box3();
                box.expandByObject(object);
                let size = new THREE.Vector3();
                let center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                downLoadItem.center = center;
                if (downLoadItem == now构件记录) {
                    controls.target.copy(center);
                    SetObejectMaterail(object, focusComponentModelMat);
                }
                else {
                    SetObejectMaterail(object, 判断构件使用Mat(downLoadItem.生存状态代码));
                }

                setTimeout(() => {
                    self.download构件模型();
                }, 10);
            } catch (eo) {
                self.setState({
                    fetch_error: JSON.stringify(`出错了:${eo.message}`),
                });
            }
        });
    }

    freshRenderParamLine() {
        if (this.focus构件记录 == null) {
            return;
        }
        if(this.参数Parant.length > 0){
            return;
        }
        let self = this;
        let 部位位置信息 = this.focus构件记录.位置信息;
        let 关联部位参数 = this.图纸部位_dic[部位位置信息.英文名称];
        if(关联部位参数 != null){
            关联部位参数.参数信息_arr.forEach(item => {
                self.参数Parant.add(item.geometry);
            });
        }
    }

    toggleProjModelVisible(ev) {
        let newVisible = !this.state.projModelVisible;
        this.projModelObject.visible = newVisible;
        this.setState({
            projModelVisible: newVisible,
        });
    }

    toggleOPVVisible(ev) {
        let newVisible = !this.state.otherParamVisible;
        this.setState({
            otherParamVisible: newVisible,
        });
        let self = this;
        setTimeout(() => {
            self.freshRenderParamLine();
        }, 100);
    }

    toggleMetaModelVisible(ev) {
        let newVisible = !this.state.metaModelVisible;
        if (this.metaModelObject) {
            this.metaModelObject.visible = newVisible;
        }
        this.setState({
            metaModelVisible: newVisible,
        });
    }

    toggleComponentModelVisible(ev) {
        let newVisible = !this.state.comModelVisible;
        this.构件模型Parant.visible = newVisible;
        this.setState({
            comModelVisible: newVisible,
        });
    }

    toggleParamLineVisible(ev) {
        let newVisible = !this.state.paramlineVisible;
        this.参数Parant.visible = newVisible;
        this.setState({
            paramlineVisible: newVisible,
        });
    }

    toggleComLabelVisible(ev){
        let newVisible = !this.state.comLabelVisible;
        this.setState({
            comLabelVisible: newVisible,
        });
    }

    clickToggleLoadParamLineHandler(ev){
        let loadParamModel = (this.state.loadParamModel == null ? this.props.loadParamModel : this.state.loadParamModel) == true;
        if(loadParamModel){
            this.参数Parant.clear();
        }
        this.setState({
            loadParamModel: !loadParamModel,
        });
    }

    参数文件Changed() {
        if (this.state.drawing == null) {
            return;
        }
        if(this.图纸部位参数_cache == null){
            this.图纸部位参数_cache = {}
        }
        if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
            let 参数信息文件路径 = this.state.drawing.参数信息文件路径;
            let 参数上传记录代码 = this.state.drawing.参数上传记录代码;
            let 图纸代码 = this.state.drawing.code;
            if(this.state.drawing.参数信息文件代码 == 0){
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: false,
                    参数文件loaded: false,
                });
                return;
            }

            if(this.图纸部位参数_cache[参数上传记录代码] != null){
                let cache = this.图纸部位参数_cache[参数上传记录代码];
                this.图纸部位Btns_arr = cache.图纸部位Btns_arr;
                this.图纸部位_dic = cache.图纸部位_dic;
                this.setState({
                    showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                    fetching: false,
                    参数文件loaded: true,
                });
                return;
            }
            this.setState({
                showing参数信息文件路径: this.state.drawing.参数信息文件路径,
                fetching: true,
                fetch_percent: 0,
                fetch_title: '加载参数数据',
                fetch_error: '',
            });
            const self = this;
            nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸代码: 图纸代码 }, action: 'pulldata_全局参数数据' }).then(json => {
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

                self.load3dm(参数信息文件路径,'加载参数数据模型',0.2,0.8,(object)=>{
                    self.setState({
                        fetch_title: '解析参数数据模型',
                    });
                    try {
                        if(self.图纸部位Btns_arr != null){
                            self.图纸部位Btns_arr.forEach(item => item.clearParam());
                        }

                        let 参数几何体_dic = {};
                        let layers_arr = object.userData['layers'];
                        object.children.forEach(obj => {
                            let layer = layers_arr[obj.userData.attributes.layerIndex];
                            let objName = obj.userData.attributes.name;
                            let t_arr = layer.name.split('_');
                            let paramCode = parseInt(t_arr[1]);
                            let paramName = 参数名称_dic[paramCode];
                            let centerPos = geoPointAtNormalizeLength(obj,0.5);
                            let startPos = geoPointAtNormalizeLength(obj,0);
                            let endPos = geoPointAtNormalizeLength(obj,1);
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
                            if (self.图纸部位_dic[参数位置信息.英文名称] == null) {
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
                            use图纸部位Item.addParam(参数item, 参数几何体.start);
                            btnElem.uiItem = 参数item;
                        });

                        self.图纸部位Btns_arr.forEach(meta => {
                            meta.paramChanged();
                            meta.calWordlPos();
                        });

                        self.图纸部位参数_cache[参数上传记录代码] = {
                            图纸部位Btns_arr:self.图纸部位Btns_arr,
                            图纸部位_dic:self.图纸部位_dic
                        }

                        self.setState({
                            fetching: false,
                            fetch_percent: 0,
                            参数文件loaded: true,
                        });
                    } catch (eo) {
                        self.setState({
                            fetch_error: JSON.stringify(`出错了:${eo.message}`),
                        });
                    }
                });
            });
        }
    }

    download构件参数() {
        let 种类index = 0;
        let downloading构件种类 = null;
        let self = this;
        for (; 种类index < this.所有构件种类_arr.length; ++种类index) {
            let 构件种类 = this.所有构件种类_arr[种类index];
            if (!构件种类.downloaded) {
                downloading构件种类 = 构件种类;
                break;
            }
        }
        if (downloading构件种类 == null) {
            let newState = Object.assign(self.waitSetState, {
                fetching: false,
                fetch_percent: 0,
            });
            self.setState(newState);
            setTimeout(() => {
                popComponentSelector(newState.drawing.name, newState.drawing.code, self.props.projectCode, newState.drawing.关联模型代码, self.构件选择Callback);
            }, 10);
            return;
        }
        self.setState({
            fetching: true,
            fetch_percent: (种类index / this.所有构件种类_arr.length),
            fetch_title: '加载' + downloading构件种类.name + '参数数据',
            fetch_error: '',
        });
        nativeFetchJson(false, threeDServerUrl, { bundle: { 图纸种类代码: 4, 构件代码: downloading构件种类.code }, action: 'pulldata_构件参数数据' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            let 参数数据_arr = json.data;
            参数数据_arr.forEach(item => {
                let 上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                if (上传记录 == null) {
                    return;
                }
                if (item.是复核参数) {
                    上传记录.add复核参数(item);
                }
            });
            downloading构件种类.downloaded = true;
            setTimeout(() => {
                self.download构件参数()
            }, 10);
        });
    }

    targetRecordChanged(){
        if(this.camera == null || this.props.targetRecordID == this.state.targetRecordID){
            return;
        }
        if(this.focus构件Parant == null){
            this.focus构件Parant = new THREE.Object3D();
            this.scene.add(this.focus构件Parant);
        }
        else{
            this.focus构件Parant.clear();
        }
        let self = this;
        let 上传记录代码 = this.props.targetRecordID;

        this.setState({
            fetch_title:'获取构件数据中',
            fetch_percent:0,
            fetching: true,
            targetRecordID:this.props.targetRecordID
        });
        this.参数Parant.clear();
        this.构件模型Parant.clear();

        let labelsRefDiv = self.labelsRef.current;
        if(labelsRefDiv != null){
            self.comLabelItems_arr.forEach(item=>{
                labelsRefDiv.removeChild(item.docElem);
            });
            self.comLabelItems_arr = [];
        }

        nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: 上传记录代码 }, action: 'pulldata_查询构件记录图模' }).then(json => {
            if(self.props.targetRecordID != 上传记录代码){
                return; // 又切换了目录
            }
            let record = json.data[0];
            let newDrawing = { name: record.全局图纸名称, code: record.全局图纸定义代码, 关联模型代码: record.可视模型代码, 参数信息文件路径: record.参数信息文件路径, 参数上传记录代码: record.参数上传记录代码, 全局模型文件代码: record.模型文件代码, 全局模型文件路径: record.模型文件路径 };

            nativeFetchJson(false, threeDServerUrl, { bundle: { 上传记录代码: 上传记录代码,最大距离:self.props.maxDistance }, action: 'pulldata_查找相邻构件信息' }).then(json => {
                if(self.props.targetRecordID != 上传记录代码){
                    return; // 又切换了目录
                }
                if (json.err != null) {
                    self.setState({
                        fetch_error: `出错了:${JSON.stringify(json.err)}`,
                    });
                    return;
                }
                let record_arr = json.data;
                if(record_arr.length == 0){
                    self.setState({
                        fetch_error: `出错了:${上传记录代码}不是有效的构件记录`,
                    });
                    return;
                }
                let 显示记录_arr = [];
                let now构件记录 = null;
                record_arr.forEach(item => {
                    item.X *= 0.001;
                    item.Y *= 0.001;
                    item.Z *= 0.001;
                    let 构件位置信息 = self.ProjectMeta.createPositionInfo(item.全局代码, item.方位名称, item.部位代码, item.一级序号, item.二级序号);
                    let 上传记录 = null;
                    if (self.构件上传记录_map[item.构件上传记录代码] == null) {
                        上传记录 = new C构件上传记录();
                        上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                        self.构件上传记录_arr.push(上传记录);
                        self.构件上传记录_map[item.构件上传记录代码] = 上传记录;
                        上传记录.位置信息 = 构件位置信息;
                    }
                    else {
                        上传记录 = self.构件上传记录_map[item.构件上传记录代码];
                        上传记录.set(item.构件上传记录代码, item.构件编号, item.构件全称, item.模型文件路径, item.上传时间, item.项目构件定义代码, new THREE.Vector3(item.X, item.Y, item.Z),item.构件生存状态代码);
                    }
                    if(上传记录.上传记录代码 == 上传记录代码){
                        now构件记录 = 上传记录;
                    }
                    显示记录_arr.push(上传记录);
                    
                    let divElem = document.createElement('div');
                    divElem.innerText = 上传记录.构件全称;
                    divElem.className = now构件记录 == 上传记录 ? 'badge badge-primary' : 'badge badge-light';
                    let newLabelItem = new THREE_LabelItem(divElem, 上传记录.worldPos);

                    labelsRefDiv.appendChild(divElem);
                    self.comLabelItems_arr.push(newLabelItem);
                });

                let TargetToEye_vec = new THREE.Vector3(0, 0, 0);
                if(this.focus构件记录 == null){
                    let pos1 = new THREE.Vector3(0,0,0);
                    pos1.set(0,0,now构件记录.worldPos.Z);
                    TargetToEye_vec.subVectors(now构件记录.worldPos,pos1);
                    TargetToEye_vec.normalize();
                    TargetToEye_vec.Z += 1;
                }
                else{
                    TargetToEye_vec.subVectors(self.camera.position, self.controls.target);
                }

                self.focus构件记录 = now构件记录;
                let needDownloadItems = [];
                let focusItems_arr = [now构件记录];
                let targetPos = now构件记录.worldPos;
                显示记录_arr.forEach(item => {
                    if (item.object3d != null) {
                        if(item == now构件记录){
                            self.focus构件Parant.add(item.object3d);
                        }
                        else{
                            self.构件模型Parant.add(item.object3d);
                        }
                        SetObejectMaterail(item.object3d, item == now构件记录 ? focusComponentModelMat : 判断构件使用Mat(item.生存状态代码));
                    }
                    else {
                        needDownloadItems.push(item);
                    }
                });

                const controls = self.controls;
                let eyePos = new THREE.Vector3(0,0,0);
                eyePos.copy(targetPos);
                eyePos.add(TargetToEye_vec);
                self.camera.position.copy(eyePos);
                controls.target.copy(targetPos);
                controls.enablePan = false;

                self.显示记录_arr = 显示记录_arr;
                self.focusItems_arr = focusItems_arr;
                self.needDownloadItems = needDownloadItems;
                if (needDownloadItems.length > 0) {
                    setTimeout(() => {
                        self.download构件模型();
                    }, 10);
                }

                self.needFresh部位参数 = true;
                self.setState({
                    fetch_percent:0,
                    fetching: needDownloadItems.length > 0,
                    drawing: newDrawing,
                });
            });
        });
        return;
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
            this.setState({
                magicObj: {} // 窗口尺寸有变化，UI也要重新渲染
            });
        }

        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);

        let tempV = new THREE.Vector3();


        let theVec = new THREE.Vector3();
        this.projLabelItem_arr.forEach(item => {
            theVec.subVectors(item.worldPos, camera.position);
            item.dot = theVec.dot(cameraDir);
            item.dis = item.worldPos.distanceTo(camera.position);
        });

        let sorted_arr = this.projLabelItem_arr.concat();
        sorted_arr = sorted_arr.sort((a, b) => { return a.dis - b.dis });

        let visibleCount = 0;
        sorted_arr.forEach(item => {
            let visible = true;
            if (item.dot < 0 || visibleCount > 3) {
                visible = false;
            }

            if (visible) {
                visibleCount += 1;
                tempV.copy(item.worldPos);
                // item.target.getWorldPosition(tempV);
                tempV.project(camera);
                const x = (tempV.x * .5 + .5) * canvas.clientWidth;
                const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

                item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
                item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
                item.docElem.style.display = '';
            }
            else {
                item.docElem.style.display = 'none';
            }
        });

        this.comLabelItems_arr.forEach(btnItem => {
            if (this.state.comLabelVisible == false) {
                btnItem.docElem.style.display = 'none';
                return;
            }
            SmartUpdateButtonItem(btnItem, camera, canvas, 1000);
        });

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

        if(this.props.projectCode == null){
            nativeUIElem = <div className='btn btn-light position-absolute' style={{minWidth:'150px',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
                <i className='fa fa-warning text-danger' />未指定目标项目
            </div>
        }
        else if (this.state.showingProjectCode != this.props.projectCode) {
            if (this.state.fetching == false) {
                if (this.state.showingProjectCode != this.props.projectCode) {
                    setTimeout(() => {
                        self.ProjectChanged();
                    }, 10);
                }
            }
        }
        else if(this.props.targetRecordID == null){
            nativeUIElem = <div className='btn btn-light position-absolute' style={{minWidth:'150px',left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
                <i className='fa fa-warning text-danger' />未选择要显示的构件
            </div>
        }
        else if(this.props.targetRecordID != this.state.targetRecordID){
            setTimeout(() => {
                self.targetRecordChanged();
            }, 10);
        }
        else if(this.state.drawing == null){

        }
        else {
            let loadParamModel = (this.state.loadParamModel == null ? this.props.loadParamModel : this.state.loadParamModel) == true;
            topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '30px', top: '5px', left: '5px' }}>
                <button className={"btn flex-grow-0 flex-shrink=0 mt-1 btn-" + (!loadParamModel ? 'light' : 'danger')} onClick={this.clickToggleLoadParamLineHandler}>{!loadParamModel ? '加载参数线信息' : '禁用参数线信息'}</button>
            </div>

            if (this.state.fetching == false) {
                if (this.state.showingModelPath != this.state.drawing.全局模型文件路径) {
                    setTimeout(() => {
                        self.全局模型changed(null,false);
                    }, 10);
                }
                else if(loadParamModel){ 
                    if (this.state.showing参数信息文件路径 != this.state.drawing.参数信息文件路径) {
                        setTimeout(() => {
                            self.参数文件Changed();
                        }, 10);
                    }
                    else if(this.state.参数文件loaded){
                        this.freshRenderParamLine();
                    }
                }
                extraUIs_arr.push(
                    <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                        <button onClick={this.toggleProjModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.projModelVisible == false ? '-slash text-danger' : '')}></i>场馆模型</button>
                        <button onClick={this.toggleComponentModelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.comModelVisible == false ? '-slash text-danger' : '')}></i>其他构件</button>
                        <button onClick={this.toggleParamLineVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.paramlineVisible == false ? '-slash text-danger' : '')}></i>参数线</button>
                        <button onClick={this.toggleComLabelVisible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.comLabelVisible == false ? '-slash text-danger' : '')}></i>构件名称</button>
                    </div>
                );
            }
        }

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

function ERPC_ThreeDApp_C_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;
    var projectCode = ctlState.projectCode == null ? ownprops.projectCode : ctlState.projectCode;
    var targetRecordID = ctlState.targetRecordID != null ? ctlState.targetRecordID : ownprops.targetRecordID;
    var maxDistance = ctlState.maxDistance != null ? ctlState.maxDistance : ownprops.maxDistance;
    if(maxDistance == null || isNaN(maxDistance)){
        maxDistance = 0;
    }
    else{
        maxDistance = parseFloat(maxDistance);
    }

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: projectCode,
        targetRecordID: targetRecordID,
        maxDistance: maxDistance,
    };
}

function ERPC_ThreeDApp_C_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}