
const 标注lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
const X轴lineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
const Y轴lineMaterial = new THREE.LineBasicMaterial( { color: 0x00FF00 } );
const Z轴lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000FF } );
const 拉索lineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
const 拉索Meshmaterial = new THREE.MeshPhongMaterial( { color: 0xAAAAAA } );
const focus拉索Meshmaterial = new THREE.MeshPhongMaterial({ color: 0xFF9933, side: THREE.DoubleSide });
const 索头Meshmaterial = new THREE.MeshPhongMaterial( { color: 0x888888, side: THREE.DoubleSide } );
const 索夹Meshmaterial = new THREE.MeshPhongMaterial( { color: 0x0000AA } );

function Vector3DFromString(str,sep=','){
    let arr = str.split(sep);
    return new THREE.Vector3(parseFloat(arr[0]),parseFloat(arr[1]),parseFloat(arr[2]));
}

function CreateMatrixFromAxisString(str,sep=';'){
    let ta_arr = str.split(sep);
    let xAxis = Vector3DFromString(ta_arr[0]);
    let yAxis = Vector3DFromString(ta_arr[1]);
    let zAxis = Vector3DFromString(ta_arr[2]);
    let rltMat = new THREE.Matrix4();
    rltMat.makeBasis (xAxis,yAxis,zAxis);
    return rltMat;

    // B端mat.set( xAxis.x, yAxis.x, zAxis.x, B节点.平X,
            //             xAxis.y, yAxis.y, zAxis.y, B节点.平Y,
            //             xAxis.z, yAxis.z, zAxis.z, B节点.平Z,
            //             0, 0, 0, 1 );
}

const E索类型={
    主索:'主索',
    次索:'次索',
    竖索:'竖索',
}

class C网片{
    constructor(name,code){
        this.name = name;
        this.code = code;
        this.竖索 = null;
        this.主索_arr = [];
        this.次索_arr = [];
        this.索_arr = [];
        this.索夹_arr = [];
    }
    add索(target){
        this.索_arr.push(target);
        if(target.类型 == E索类型.竖索){
            this.竖索 = target;
        }
        else if(target.类型 == E索类型.主索){
            this.主索_arr.push(target);
        }
        else{
            this.次索_arr.push(target);
        }
    }
    
    add索夹(target){
        this.索夹_arr.push(target);
    }

    add索FromRecord(拉索rcd){
        let rlt = this.索_arr.filter(x=>{return x.构件上传记录代码 == 拉索rcd.构件上传记录代码})[0];
        if(rlt != null){
            rlt.设置rcd(拉索rcd);
        }
        else{
            rlt = new C张拉索(拉索rcd);
            this.add索(rlt);
        }
        return rlt;
    }
}

class CCameraLerp{
    constructor(camera,controls){
        this.camera = camera;
        this.controls = controls;
        this.animTime = 0.6;
        this.minSpeed = 20;
        this.useAnimTime = 0;
        this.animating = false;
        this.startAnimTime = 0;
        this.startPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.startQua = new THREE.Quaternion();
        this.targetQua = new THREE.Quaternion();

        this.update = this.update.bind(this);

        this.savedState_arr = [];
    }

    getState(){
        let target = new THREE.Vector3();
        let eyepos = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let zoom = 1;
        if(this.animating){
            target.copy(this.controls.target);
            eyepos.copy(this.targetPosition);
            quaternion.copy(this.targetQua);
            zoom = this.targetZoom;
        }
        else{
            target.copy(this.controls.target);
            eyepos.copy(this.camera.position);
            quaternion.copy(this.camera.quaternion);
            zoom = this.camera.zoom;
        }
        return {
            target:target,
            eyepos:eyepos,
            zoom:zoom,
            quaternion:quaternion
        };
    }

    pushState(){
        this.savedState_arr.push(this.getState());
    }

    popState(){
        return this.savedState_arr.length > 0 ? this.savedState_arr.pop() : null;
    }

    setDefaultState(targetState = null){
        if(targetState == null){
            targetState = this.getState();
        }
        this.defaultState = targetState;
    }

    setPosition(eyepos, taregtpos, targetZoom = null, targetQua = null){
        if(targetZoom == null){
            targetZoom = this.camera.zoom;
        }
        if(targetQua == null){
            targetQua = new THREE.Quaternion();
            targetQua.set(0,0,0,1);
        }
        this.targetZoom = targetZoom;
        this.startZoom = this.camera.zoom;
        let disVec = new THREE.Vector3(0,0,0);
        disVec.subVectors(eyepos,this.camera.position);
        let dis = disVec.length();
        // if( dis < 2 ){
        //     this.camera.position.set(targetPos);
        //     this.controls.update();
        //     return;
        // }
        let useAnimTime = this.animTime;
        // let speed = dis / useAnimTime;
        // if(speed<this.minSpeed){
        //     speed = this.minSpeed;
        //     useAnimTime = dis / speed;
        // }
        // let targetMat = new THREE.Matrix4();
        // targetMat.lookAt(eyepos,taregtpos,upvec);
        // this.targetQua.setFromRotationMatrix(targetMat);
        this.controls.target.copy(taregtpos);
        // this.targetQua.set(0,0,0,1);
        this.targetQua.copy(targetQua);
        // let toVec = new THREE.Vector3(0,0,0);
        // let fromVec = new THREE.Vector3(0,0,0);
        // fromVec.subVectors(this.controls.target,this.camera.position);
        // toVec.subVectors(taregtpos,eyepos);
        // this.targetQua.setFromUnitVectors(fromVec,toVec);
        this.startQua.copy(this.camera.quaternion);

        this.startPosition.copy(this.camera.position);
        this.targetPosition.copy(eyepos)
        this.useAnimTime = useAnimTime;
        this.passedTime = 0;
        if(!this.animating){
            this.controls.enabled = false;
            this.animating = true;
            this.startAnimTime = (new Date()).getTime();
            setTimeout(this.update, 50);
        }
    }

    update(){
        let nowTime = (new Date()).getTime();
        let passedTime = (nowTime - this.startAnimTime) / 1000.0;
        let percent = passedTime / this.useAnimTime;
        // console.log("nowTime:" + nowTime);
        // console.log("useAnimTime:" + this.useAnimTime);
        // console.log("passedTime:" + passedTime);
        // console.log("percent:" + percent);

        if(percent > 1){
            percent = 1;
        }
        
        this.camera.position.lerpVectors(this.startPosition,this.targetPosition,percent);
        this.camera.quaternion.slerpQuaternions(this.startQua,this.targetQua,percent);
        if(Math.abs(this.startZoom - this.targetZoom) > 0.01){
            this.camera.zoom = this.startZoom + (this.targetZoom - this.startZoom) * percent;
            this.camera.updateProjectionMatrix();
            this.controls.cameraZoomChanged();
        }
        // print(this.camera.quaternion)
        // this.camera.setRotationFromAxisAngle(new THREE.Vector3(1,0,0),Math.sin(percent));
        // this.camera.rotateX(Math.PI * percent);
        // this.camera.updateMatrix();
        // this.camera.updateProjectionMatrix();

        // this.camera.position.set(this.camera.position.x + 10,this.camera.position.y,this.camera.position.z);
        // this.camera.lookAt( new THREE.Vector3(percent * 100,0,0) );
        // this.camera.updateMatrix();
        // this.camera.updateProjectionMatrix();
        if(percent < 1){
            setTimeout(this.update, 50);
        }
        else{
            this.controls.clearspherical();
            this.controls.update();
            // this.camera.quaternion.set(0,0,0,1);
            this.animating = false;
            this.controls.enabled = true;
        }
    }
}

class C张拉索{
    constructor(rcd){
        this.设置rcd(rcd);
        this.object3d = new THREE.Object3D();

        let divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.平B_label = new THREE_LabelItem(divElem, new THREE.Vector3());
        

        divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.平T_label = new THREE_LabelItem(divElem, new THREE.Vector3());
    }

    设置rcd(rcd){
        this.rcd = rcd;
        this.构件上传记录代码 = rcd.构件上传记录代码;
        this.坚朗编号 = rcd.坚朗编号;
        this.新的编号 = rcd.新的编号;

        if(rcd.新的编号.indexOf('SZ') != -1){
            this.类型 = E索类型.主索;
            this.索径 = 30;
            
            this.B索头构件 = rcd.B端类型.indexOf('牙') == -1 ? 标准构件_30固定端 : 标准构件_30调节端;
            this.T索头构件 = rcd.T端类型.indexOf('牙') == -1 ? 标准构件_30固定端 : 标准构件_30调节端;
        }
        else if(rcd.新的编号.indexOf('SC') != -1){
            this.类型 = E索类型.次索;
            this.索径 = 30;
            this.B索头构件 = rcd.B端类型.indexOf('牙') == -1 ? 标准构件_30固定端 : 标准构件_30调节端;
            this.T索头构件 = rcd.T端类型.indexOf('牙') == -1 ? 标准构件_30固定端 : 标准构件_30调节端;
        }
        else{
            this.类型 = E索类型.竖索;
            if(rcd.新的编号.indexOf('SS50') != -1){
                this.索径 = 55;
                this.B索头构件 = 标准构件_55固定端;
                this.T索头构件 = 标准构件_55固定端;
            }
            else{
                this.索径 = 40;
                this.B索头构件 = 标准构件_40固定端;
                this.T索头构件 = 标准构件_40固定端;
            }
        }
    }

    设置编号(编号类型){
        this.平B_label.docElem.innerText = 编号类型 == '坚朗' ? this.坚朗编号 : this.新的编号;
        this.平T_label.docElem.innerText = 编号类型 == '坚朗' ? this.坚朗编号 : this.新的编号;
    }

    setMat(索线mat, 索头mat){
        // this.object3d.children.forEach(obj=>{
        //     if(obj.material){
        //         obj.material = newMat;
        //     }
        // });
        this.索线mesh.material = 索线mat;
        this.B端索头mesh.material = 索头mat;
        this.T端索头mesh.material = 索头mat;
    }
}

class C索夹{
    constructor(rcd,构件,meshObj,关联主索,关联次索,关联竖索){
        this.rcd = rcd;
        this.组网索夹代码 = rcd.组网索夹代码;
        this.构件 = 构件;
        this.meshObj = meshObj;
        this.关联主索 = 关联主索;
        this.关联次索 = 关联次索;
        this.关联竖索 = 关联竖索;
    }
}

const all构件模型_map = {};
class C构件模型{
    constructor(name,code,defualtMat = 索夹Meshmaterial){
        this.code = code;
        this.name = name;
        this.meshGeometry = null;
        this.fileurl = null;
        this.mesh_pool = [];
        this.defualtMat = defualtMat;

        all构件模型_map[name] = this;
        all构件模型_map[code] = this;
    }

    isLoaded(){
        return this.meshGeometry != null;
    }

    reback(mesh){
        mesh.removeFromParent();
        mesh.material = this.defualtMat;
        this.mesh_pool.push(mesh);
    }

    getone(){
        if(this.mesh_pool.length > 0){
            return this.mesh_pool.pop();
        }
        return new THREE.Mesh(this.meshGeometry, this.defualtMat );
    }
}

const 标准构件_30固定端 = new C构件模型('XA',257,索头Meshmaterial);
const 标准构件_40固定端 = new C构件模型('XB',258,索头Meshmaterial);
const 标准构件_55固定端 = new C构件模型('XC',259,索头Meshmaterial);
const 标准构件_30调节端 = new C构件模型('XD',260,索头Meshmaterial);
const 标准构件_JFA = new C构件模型('JFA',26);
const 标准构件_JFB = new C构件模型('JFB',27);
const 标准构件_JGA = new C构件模型('JGA',29);
const 标准构件_JGB = new C构件模型('JGB',30);
const 标准构件_JGC = new C构件模型('JGC',31);
const 标准构件_JHA = new C构件模型('JHA',33);
const 标准构件_JHB = new C构件模型('JHB',34);
const 标准构件_JHC = new C构件模型('JHC',35);
const 标准构件_JAA = new C构件模型('JAA',3);
const 标准构件_JAB = new C构件模型('JAB',8);
const 标准构件_JBB = new C构件模型('JBB',15);
const 标准构件_JBA = new C构件模型('JBA',14);
const 标准构件_JCA = new C构件模型('JCA',17);
const 标准构件_JCB = new C构件模型('JCB',18);
const 标准构件_JDA = new C构件模型('JDA',20);
const 标准构件_JDB = new C构件模型('JDB',21);
const 标准构件_JEA = new C构件模型('JEA',23);
const 标准构件_JEB = new C构件模型('JEB',24);

let pts_30 = [];
let pts_40 = [];
let pts_55 = [];
const segCount = 18;
for ( let i = 0; i < segCount; i ++ ) {
    const a = 2 * i / segCount * Math.PI;
    pts_30.push( new THREE.Vector2( Math.cos( a ) * 0.15, Math.sin( a ) * 0.15 ) );
    pts_40.push( new THREE.Vector2( Math.cos( a ) * 0.2, Math.sin( a ) * 0.2 ) );
    pts_55.push( new THREE.Vector2( Math.cos( a ) * 0.275, Math.sin( a ) * 0.275 ) );
}
const cicle_30 = new THREE.Shape( pts_30 );
const cicle_40 = new THREE.Shape( pts_40 );
const cicle_55 = new THREE.Shape( pts_55 );


class C组网步骤{
    constructor(app, label){
        this.app = app;
        this.label = label;
        // this.pre步骤 = pre步骤;
        // this.next步骤 = next步骤;
        this.clickParamShotBtnHandler = this.clickParamShotBtnHandler.bind(this);
        this.paramShotCompleteHandler = this.paramShotCompleteHandler.bind(this);
        this.clickPreStepHandler = this.clickPreStepHandler.bind(this);
        this.clickNextStepHandler = this.clickNextStepHandler.bind(this);
        this.params_arr = [];
    }

    render(extraUIs_arr,canvasWidth,canvasHeight){
        this.extraUIs_arr = extraUIs_arr;
        this.canvasWidth_half = parseInt(canvasWidth * 0.5);
        this.canvasHeight_half = parseInt(canvasHeight * 0.5);
    }

    set后续步骤(target步骤){
        this.next步骤 = target步骤;
        target步骤.pre步骤 = this;
    }

    clickParamShotBtnHandler(ev){
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
        if(record_id == 0){
            return;
        }
        this.record_id = record_id;
        popZWParamShoter(record_id,this.paramShotCompleteHandler);
    }

    paramShotCompleteHandler(ev){
        let paramRcd = this.params_arr.filter(x=>{return x.组网参数数据代码 = this.record_id})[0];
        if(paramRcd != null){
            paramRcd.拍照状态 = 1;
            this.app.setState({
                magicObj: {}
            });
        }
    }

    genParamButtons(){
        return <React.Fragment>
            {this.params_arr.map(rcd=>{
                return <button key={rcd.组网图纸参数代码} record_id={rcd.组网参数数据代码} onClick={this.clickParamShotBtnHandler} className={"btn flex-grow-0 flex-shrink=0 btn-" + (rcd.拍照状态 == 0 ? 'light' : 'success')} ><i className="fa fa-camera" />{rcd.参数名称}</button>;
            })}
        </React.Fragment>;
    }

    clickPreStepHandler(ev){
        if(this.pre步骤){
            this.app.switch步骤(this.pre步骤);
        }
    }

    clickNextStepHandler(ev){
        if(this.next步骤){
            this.app.switch步骤(this.next步骤);
        }
    }

    renderStepHeader(label){
        if(label == null){
            label = this.label;
        }
        const canvasWidth_half = this.canvasWidth_half;
        const canvasHeight_half = this.canvasHeight_half;
        let stepIndex = 1;
        let tem = this.pre步骤;
        while(tem){
            stepIndex += 1;
            tem = tem.pre步骤;
            if(stepIndex > 99){
                break;
            }
        }
        let hadPre = this.pre步骤 != null;
        let hadNext = this.next步骤 != null;
        this.extraUIs_arr.push(
            <div key='nag_topMiddleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top:'10px', transform: 'translate(-50%,0%)' }}>
                <button onClick={this.clickPreStepHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-1" style={{minWidth:'50px',visibility:(hadPre ? '' : 'hidden')}}><i className='fa fa-chevron-left' /></button>
                <button className="btn btn-light flex-grow-0 flex-shrink=0" style={{minWidth:'100px'}} >{stepIndex}.{label}</button>
                <button onClick={this.clickNextStepHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 ml-1" style={{minWidth:'40px',visibility:(hadNext ? '' : 'hidden')}}><i className='fa fa-chevron-right' /></button>
            </div>
        );
    }
}

class C组网步骤_无步骤 extends C组网步骤{
    constructor(app){
        super(app, '无步骤');
        autoBind(this);
    }

    enter(){
        const app = this.app;
        const controls = app.controls;
        controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        const 目标网片 = app.目标网片;

        目标网片.索_arr.forEach(拉索=>{
            拉索.object3d.visible = true;
            拉索.平B_label.docElem.style.display = '';
            拉索.平T_label.docElem.style.display = '';
        });

        目标网片.索夹_arr.forEach(索夹=>{
            索夹.meshObj.visible = true;
        });

        app.show张拉索(目标网片.竖索, true);
        app.cameraLerp.setDefaultState();
    }
    exit(){
        const app = this.app;
        const 目标网片 = app.目标网片;
        if(目标网片){
            目标网片.索_arr.forEach(拉索=>{
                拉索.object3d.visible = true;
                拉索.平B_label.docElem.style.display = 'none';
                拉索.平T_label.docElem.style.display = 'none';
            });
        }
    }
    renderFrame(passedTime){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;

        if(目标网片){
            目标网片.索_arr.forEach(拉索=>{
                拉索.平B_label.docElem.style.display = 'none';
                拉索.平T_label.docElem.style.display = 'none';
            });
            if(appState.show编号){
                目标网片.索_arr.forEach(拉索=>{
                    SmartUpdateButtonItem(拉索.平B_label, camera, canvas, 1000);
                    SmartUpdateButtonItem(拉索.平T_label, camera, canvas, 1000);
                });
            }
        }
    }

    clickStartBtnHandler(ev){
        const app = this.app;
        app.switch步骤(app.步骤_铺设竖索);
    }

    render(extraUIs_arr,canvasWidth,canvasHeight){
        super.render(extraUIs_arr,canvasWidth,canvasHeight);
        const canvasWidth_half = this.canvasWidth_half;
        const canvasHeight_half = this.canvasHeight_half;
        const app = this.app;
        const 目标网片 = app.目标网片;
        if(目标网片 == null){
            return;
        }
        extraUIs_arr.push(
            <div key='toprightBtns' className="d-flex flex-column position-absolute " style={{ left: (canvasWidth - 5) + 'px', top: '5px', transform: 'translate(-100%,0%)' }}>
                <button onClick={app.toggle编号Visible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (app.state.show编号 == false ? '-slash text-danger' : '')}></i>显示编号</button>
                {!app.state.show编号 ? null : <button onClick={app.toggle编号类型} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" >{'显示' + app.state.编号类型 + '编号'}</button>}
            </div>
        );
        extraUIs_arr.push(
            <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
                <button onClick={this.clickStartBtnHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{minWidth:'150px'}} >开始组装{目标网片.name}</button>
            </div>
        );
    }
}

class C组网步骤_铺设竖索 extends C组网步骤{
    constructor(app){
        super(app, '铺设竖索');
        autoBind(this);

        let divElem = document.createElement('div');
        divElem.className = 'badge badge-secondary';
        this.seg1_label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-secondary';
        this.seg2_label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-secondary';
        this.segAll_label = new THREE_LabelItem(divElem, new THREE.Vector3());
    }
    enter(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;
        const labelsContainer = app.labelsRef.current;
        const controls = app.controls;
        controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

        目标网片.索_arr.forEach(拉索=>{
            if(拉索.类型 != E索类型.竖索){
                拉索.object3d.visible = false;
                拉索.平B_label.docElem.style.display = 'none';
                拉索.平T_label.docElem.style.display = 'none';
            }
            else{
                拉索.object3d.visible = true;
                拉索.平B_label.docElem.style.display = '';
                拉索.平T_label.docElem.style.display = '';
            }
        });
        目标网片.索夹_arr.forEach(索夹=>{
            索夹.meshObj.visible = 索夹.关联竖索 != null;
        });
        app.show张拉索(目标网片.竖索,true);
        app.cameraLerp.setDefaultState();

        let 竖索 = 目标网片.竖索;
        let 节点0 = 竖索.节点_arr[0];
        let 节点1 = 竖索.节点_arr[1];
        let 节点2 = 竖索.节点_arr[2];

        labelsContainer.appendChild(this.seg1_label.docElem);
        labelsContainer.appendChild(this.seg2_label.docElem);
        labelsContainer.appendChild(this.segAll_label.docElem);
        this.seg1_label.docElem.innerText = 目标网片.原竖索节点_arr[0].参数值;
        this.seg2_label.docElem.innerText = (目标网片.原竖索节点_arr[1].参数值 - 目标网片.原竖索节点_arr[0].参数值);
        this.segAll_label.docElem.innerText = 目标网片.原竖索节点_arr[1].参数值;

        this.seg1_label.worldPos.set(节点0.平X + 5, 节点0.平Y + (节点1.平Y - 节点0.平Y) * 0.5, 节点0.平Z);
        this.seg2_label.worldPos.set(节点0.平X + 5, 节点1.平Y + (节点2.平Y - 节点1.平Y) * 0.5, 节点0.平Z);
        this.segAll_label.worldPos.set(节点0.平X + 10, 节点0.平Y + (节点2.平Y - 节点0.平Y) * 0.5, 节点0.平Z);

        if(目标网片.竖索B端线obj == null) {
            let B端线obj = new THREE.Object3D();
            let points = [节点0.平X,节点0.平Y,节点0.平Z];
            points.push(节点0.平X + 10,节点0.平Y,节点0.平Z);
            points.push(节点0.平X + 10,节点2.平Y,节点2.平Z);
            points.push(节点2.平X,节点2.平Y,节点2.平Z);

            let lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
            let 整体标注line = new THREE.Line( lineGeometry, 标注lineMaterial );
            B端线obj.add(整体标注line);

            points = [节点0.平X,节点0.平Y,节点0.平Z];
            points.push(节点0.平X + 5,节点0.平Y,节点0.平Z);
            points.push(节点1.平X + 5,节点1.平Y,节点1.平Z);
            points.push(节点1.平X,节点1.平Y,节点1.平Z);
            lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
            let 段1标注line = new THREE.Line( lineGeometry, 标注lineMaterial );
            B端线obj.add(段1标注line);

            points = [节点1.平X + 5,节点1.平Y,节点1.平Z];
            points.push(节点2.平X + 5,节点2.平Y,节点2.平Z);
            points.push(节点2.平X,节点2.平Y,节点2.平Z);
            lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
            let 段2标注line = new THREE.Line( lineGeometry, 标注lineMaterial );
            B端线obj.add(段2标注line);

            目标网片.竖索B端线obj = B端线obj;
        }
        app.标注线Parant.add(目标网片.竖索B端线obj);

        this.params_arr = 目标网片.组网参数_arr.filter(rcd=>{
            return rcd.组网图纸参数代码 == 1 || rcd.组网图纸参数代码 == 2;
        });
    }
    
    exit(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const labelsContainer = app.labelsRef.current;
        目标网片.竖索B端线obj.removeFromParent();
        
        labelsContainer.removeChild(this.seg1_label.docElem);
        labelsContainer.removeChild(this.seg2_label.docElem);
        labelsContainer.removeChild(this.segAll_label.docElem);
    }

    renderFrame(passedTime){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;

        if(目标网片){
            SmartUpdateButtonItem(目标网片.竖索.平B_label, camera, canvas, 1000);
            SmartUpdateButtonItem(目标网片.竖索.平T_label, camera, canvas, 1000);
        }

        SmartUpdateButtonItem(this.seg1_label, camera, canvas, 1000);
        SmartUpdateButtonItem(this.seg2_label, camera, canvas, 1000);
        SmartUpdateButtonItem(this.segAll_label, camera, canvas, 1000);
    }

    render(extraUIs_arr,canvasWidth,canvasHeight){
        super.render(extraUIs_arr,canvasWidth,canvasHeight);
        const canvasWidth_half = this.canvasWidth_half;
        const canvasHeight_half = this.canvasHeight_half;
        const app = this.app;
        const 目标网片 = app.目标网片;
        if(目标网片 == null){
            return;
        }
        this.renderStepHeader();
        extraUIs_arr.push(
            <div key='nag_leftBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:'5px', top: (canvasHeight - 5) + 'px', width:'150px', transform: 'translate(0%,-100%)' }}>
                {this.genParamButtons()}
            </div>
        );
    }
}

const E聚焦拉索部位={
    无 : '无',
    B端 : '下端',
    T端 : '上端',
}

class C组网步骤_铺设索 extends C组网步骤{
    constructor(app,索类型){
        super(app, '铺设' + 索类型);
        this.索类型 = 索类型;
        autoBind(this);
        this.索index = -1;

        let divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.B端label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.T端label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.角度label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-warning';
        this.退让label = new THREE_LabelItem(divElem, new THREE.Vector3());
        
        const length = 2;
        this.轴length = length;
        const Y轴line = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ), length, 0xff0000 );
        const Z轴line = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), length, 0x0000ff );

        this.轴helper = new THREE.Object3D();
        this.轴helper.add(Y轴line);
        this.轴helper.add(Z轴line);

        // this.轴helper = new THREE.AxesHelper( 5 );
    }

    enter(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;
        const controls = app.controls;

        controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

        const labelsContainer = app.labelsRef.current;
        labelsContainer.appendChild(this.B端label.docElem);
        labelsContainer.appendChild(this.T端label.docElem);
        labelsContainer.appendChild(this.角度label.docElem);
        labelsContainer.appendChild(this.退让label.docElem);
        
        this.关联索_arr = this.索类型 == E索类型.次索 ? 目标网片.次索_arr : 目标网片.主索_arr;
        目标网片.索_arr.forEach(拉索=>{
            if(拉索.类型 == E索类型.竖索){
                拉索.object3d.visible = true;
            }
            else if(this.索类型 == E索类型.主索){
                拉索.object3d.visible = 拉索.类型 == E索类型.次索;
            }
            else{
                拉索.object3d.visible = false;
            }
            拉索.平B_label.docElem.style.display = 'none';
            拉索.平T_label.docElem.style.display = 'none';
        });
        目标网片.索夹_arr.forEach(索夹=>{
            索夹.meshObj.visible = 索夹.关联竖索 != null;
        });
        let newIndex = this.索index;
        if(newIndex < 0){
            newIndex = 0;
        }
        else if(newIndex >= this.关联索_arr.length){
            newIndex = this.关联索_arr.length - 1;
        }
        this.focus部位 = E聚焦拉索部位.无;
        this.set索Index(newIndex);

        app.scene.add(this.轴helper);
        this.轴helper.visible = false;
    }

    set索Index(newIndex){
        const app = this.app;
        const 目标网片 = app.目标网片;
        this.索index = newIndex;
        let focus拉索 = null;
        let 关联索_arr = this.关联索_arr;
        关联索_arr.forEach((拉索,拉索i)=>{
            if(拉索i < newIndex){
                拉索.object3d.visible = true;
                拉索.setMat(拉索Meshmaterial,索头Meshmaterial);
            }
            else if(拉索i == newIndex){
                拉索.object3d.visible = true;
                拉索.setMat(focus拉索Meshmaterial,focus拉索Meshmaterial);
                focus拉索 = 拉索;
            }
            else{
                拉索.object3d.visible = false;
            }
        });

        目标网片.索夹_arr.forEach(索夹=>{
            if(索夹.关联竖索 == null){
                索夹.meshObj.visible = (索夹.关联次索 != null && 索夹.关联次索.object3d.visible) || (索夹.关联主索 != null && 索夹.关联主索.object3d.visible);
            }
        });
        // B端类型	T端类型
        // SD02	SD02反牙
        this.focus拉索 = focus拉索;
        this.params_arr = [];
        this.上端params_arr = [];
        this.下端params_arr = [];
        this.退让label.docElem.innerText = "";
        if(focus拉索 != null){
            this.B端label.docElem.innerText = '下端' + (focus拉索.rcd.B端类型 == 'SD02' ? '' : `(${focus拉索.rcd.B端类型.replace('SD02','')})`);
            this.T端label.docElem.innerText = '上端' + (focus拉索.rcd.T端类型 == 'SD02' ? '' : `(${focus拉索.rcd.T端类型.replace('SD02','')})`);
            if(focus拉索.rcd.B调节器长度 != 0){
                this.B端label.docElem.innerText += ' [#' + focus拉索.rcd.B调节器序号 + '_' + focus拉索.rcd.B调节器长度 + ']'
            }
            if(focus拉索.rcd.T调节器长度 != 0){
                this.T端label.docElem.innerText += ' [#' + focus拉索.rcd.T调节器序号 + '_' + focus拉索.rcd.T调节器长度 + ']'
            }

            this.B端label.worldPos.set(focus拉索.B节点.平X,focus拉索.B节点.平Y,focus拉索.B节点.平Z);
            this.T端label.worldPos.set(focus拉索.T节点.平X,focus拉索.T节点.平Y,focus拉索.T节点.平Z);
            // this.params_arr = 目标网片.组网参数_arr.filter(rcd=>{
            //     return rcd.关联记录代码 == focus拉索.构件上传记录代码 && (rcd.组网图纸参数代码 == 2 || rcd.组网图纸参数代码 == 3 || rcd.组网图纸参数代码 == 4);
            // });
            if(Math.abs(focus拉索.rcd.退让设置) > 0.5){
                this.退让label.docElem.innerText = `向${focus拉索.rcd.退让设置 > 0 ? '前进' : '后退'}${Math.abs(focus拉索.rcd.退让设置)}`;

                let move_vec = new THREE.Vector3();
                move_vec.subVectors(this.B端label.worldPos,this.T端label.worldPos);
                move_vec.normalize();
                this.退让label.worldPos.copy(this.B端label.worldPos);
                this.退让label.worldPos.addScaledVector(move_vec,5);
            }
            this.setFocus部位(E聚焦拉索部位.无);
            app.show张拉索(focus拉索);
            app.cameraLerp.setDefaultState();

            目标网片.组网参数_arr.forEach(rcd=>{
                if(rcd.关联记录代码 == focus拉索.构件上传记录代码){
                    if(rcd.组网图纸参数代码 == 2 || rcd.组网图纸参数代码 == 3){
                        this.下端params_arr.push(rcd);
                    }
                    else if(rcd.组网图纸参数代码 == 4){
                        this.上端params_arr.push(rcd);
                    }
                }
                return false;
            });
        }else{
            this.app.setState({
                magicObj:{}
            });
        }
    }
    
    exit(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const labelsContainer = app.labelsRef.current;

        目标网片.索_arr.forEach((拉索,拉索i)=>{
            拉索.setMat(拉索Meshmaterial,索头Meshmaterial);
        });

        labelsContainer.removeChild(this.角度label.docElem);
        labelsContainer.removeChild(this.B端label.docElem);
        labelsContainer.removeChild(this.T端label.docElem);
        labelsContainer.removeChild(this.退让label.docElem);
        

        this.轴helper.removeFromParent();

        app.索夹模型Parant.visible = true;
        app.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        app.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        app.controls.touches.ONE = THREE.TOUCH.PAN;
        app.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    }

    renderFrame(passedTime){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;

        if(this.focus部位 == E聚焦拉索部位.无){
            SmartUpdateButtonItem(this.B端label, camera, canvas, 1000);
            SmartUpdateButtonItem(this.T端label, camera, canvas, 1000);
            SmartUpdateButtonItem(this.退让label, camera, canvas, 1000);
            this.角度label.docElem.style.display = 'none';
        }
        else if(this.focus部位 == E聚焦拉索部位.B端){
            this.T端label.docElem.style.display = 'none';
            SmartUpdateButtonItem(this.B端label, camera, canvas, 1000);
            SmartUpdateButtonItem(this.角度label, camera, canvas, 1000);
            SmartUpdateButtonItem(this.退让label, camera, canvas, 1000);
        }
        else{
            this.B端label.docElem.style.display = 'none';
            this.退让label.docElem.style.display = 'none';
            SmartUpdateButtonItem(this.T端label, camera, canvas, 1000);
            SmartUpdateButtonItem(this.角度label, camera, canvas, 1000);
        }
    }

    clickPre索Handler(ev){
        this.set索Index(this.索index - 1);
    }

    clickNext索Handler(ev){
        this.set索Index(this.索index + 1);
    }

    clickFocusB端Handler(ev){
        this.setFocus部位(E聚焦拉索部位.B端);
    }

    clickFocusT端Handler(ev){
        this.setFocus部位(E聚焦拉索部位.T端);
    }

    clickFocus无Handler(ev){
        this.setFocus部位(E聚焦拉索部位.无);
    }

    setFocus部位(new部位){
        const app = this.app;
        const preFocus部位 = this.focus部位;
        this.focus部位 = new部位;
        let focus拉索 = this.focus拉索;
        const 目标网片 = app.目标网片;

        this.params_arr = [];
        if(focus拉索 != null && new部位 != E聚焦拉索部位.无){
            // this.params_arr = 目标网片.组网参数_arr.filter(rcd=>{
            //     if(rcd.关联记录代码 == focus拉索.构件上传记录代码){
            //         if(new部位 == E聚焦拉索部位.B端){
            //             return rcd.组网图纸参数代码 == 2 || rcd.组网图纸参数代码 == 3;
            //         }
            //         return rcd.组网图纸参数代码 == 4;
            //     }
            //     return false;
            // });
            if(new部位 == E聚焦拉索部位.B端){
                this.params_arr = this.下端params_arr.concat();
            }
            else{
                this.params_arr = this.上端params_arr.concat();
            }

            if(preFocus部位 == E聚焦拉索部位.无){
                app.cameraLerp.pushState();
            }
            let 索头节点 = null;
            let 索夹节点 = null;
            let 转角 = 0;
            let 转角方向 = '右';
            if(new部位 == E聚焦拉索部位.B端){
                索头节点 = focus拉索.节点_arr[0];
                索夹节点 = focus拉索.节点_arr[1];
                转角 = focus拉索.rcd.转角B;
                转角方向 = focus拉索.rcd.转角方向B;
            }
            else{
                索头节点 = focus拉索.节点_arr[focus拉索.节点_arr.length - 1];
                索夹节点 = focus拉索.节点_arr[focus拉索.节点_arr.length - 2];
                转角 = focus拉索.rcd.转角T;
                转角方向 = focus拉索.rcd.转角方向T;
            }
            if(转角 < 5){
                this.角度label.docElem.innerText = "";
            }
            else{
                this.角度label.docElem.innerText = `向${转角方向}转${转角}°`;
            }
            // this.角度label.docElem.innerText = `向${转角方向}转${转角}°`;

            let 索头loc = new THREE.Vector3(索头节点.平X,索头节点.平Y,索头节点.平Z);
            let 索夹loc = new THREE.Vector3(索夹节点.平X,索夹节点.平Y,索夹节点.平Z);
            let move_vec = new THREE.Vector3();
            move_vec.subVectors(索头loc,索夹loc);
            move_vec.normalize();
        
            let eyePos = new THREE.Vector3(索头loc.x,索头loc.y,索头loc.z);
            eyePos.addScaledVector(move_vec, 20);
            eyePos.z += 2;
            // let lookMat = new THREE.Matrix4();
            // lookMat.lookAt(eyePos, 索头loc, new THREE.Vector3(0,1,0));
            // let targetQua = new THREE.Quaternion();
            // targetQua.setFromRotationMatrix(lookMat);

            const camera = app.camera;
            let camera_height = camera.top - camera.bottom;
            camera.zoom = camera_height / 10.0;
            camera.position.copy(eyePos);
            app.controls.target.copy(索头loc);
            camera.updateProjectionMatrix();
            app.controls.cameraZoomChanged();
            app.controls.update();
            
            let defState = app.cameraLerp.getState();
            defState.target.copy(索头loc);
            defState.eyepos.copy(eyePos);
            defState.zoom = camera.zoom;
            defState.quaternion.copy(camera.quaternion);
            app.cameraLerp.setDefaultState(defState);

            app.索夹模型Parant.visible = false;
            app.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
            app.controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
            app.controls.touches.ONE = THREE.TOUCH.ROTATE;
            app.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

            let xAxis = new THREE.Vector3(move_vec.x * -1,move_vec.y * -1, move_vec.z * -1);
            let yAxis = new THREE.Vector3();
            let zAxis = new THREE.Vector3(0,0,1);
            yAxis.crossVectors(zAxis,xAxis);
            if(转角方向 == '右'){
                yAxis.negate();
                xAxis.crossVectors(yAxis,zAxis);
            }
            let rltMat = new THREE.Matrix4();
            rltMat.makeBasis (xAxis,yAxis,zAxis);
            this.轴helper.visible = true;
            this.轴helper.setRotationFromMatrix (rltMat);
            this.轴helper.position.copy(索头loc);

            let pos = new THREE.Vector3(索头loc.x,索头loc.y,索头loc.z);
            pos.addScaledVector(yAxis,this.轴length + 0.5);
            this.角度label.worldPos.copy(pos);
        }
        else{
            let lerState = app.cameraLerp.popState();
            if(lerState != null){
                app.cameraLerp.setPosition(lerState.eyepos, lerState.target, lerState.zoom, lerState.quaternion);

                app.cameraLerp.setDefaultState(lerState);
            }
            app.索夹模型Parant.visible = true;
            app.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
            app.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
            app.controls.touches.ONE = THREE.TOUCH.PAN;
            app.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

            this.轴helper.visible = false;
        }

        app.setState({
            magicObj:{}
        });
    }

    render(extraUIs_arr,canvasWidth,canvasHeight){
        super.render(extraUIs_arr,canvasWidth,canvasHeight);
        const canvasWidth_half = this.canvasWidth_half;
        const canvasHeight_half = this.canvasHeight_half;
        const app = this.app;
        const 目标网片 = app.目标网片;
        const 关联索_arr = this.关联索_arr;
        if(目标网片 == null){
            return;
        }
        extraUIs_arr.push(
            this.renderStepHeader(`${this.label}[${this.索index+1}/${关联索_arr.length}]`)
        );

        let focus拉索 = this.focus拉索;
        if(focus拉索 == null){
            return;
        }
        extraUIs_arr.push(
            <div key='nag_suoinfo' className="d-flex flex-nowrap position-absolute bg-light rounded border" style={{ left: canvasWidth_half + 'px', top:'50px', transform: 'translate(-50%,0%)' }}>
                <div className='d-flex flex-column flex-grow-0 flex-shrink=0'>
                    <span className='h-50 text-nowrap border-bottom p-2'>
                        系统:{focus拉索.新的编号}
                    </span>
                    <span className='h-50 text-nowrap  p-2'>
                        坚朗:{focus拉索.坚朗编号}
                    </span>
                </div>
            </div>
        );

        let 下端params_arr = this.下端params_arr;
        let 上端params_arr = this.上端params_arr;
        let 下端拍照完成 = 下端params_arr.filter(x=>{return x.拍照状态 == 0}).length == 0;
        let 上端拍照完成 = 上端params_arr.filter(x=>{return x.拍照状态 == 0}).length == 0;
        
        let 查看下端btn = <button onClick={this.clickFocusB端Handler} className={"btn flex-grow-0 flex-shrink=0 btn-" + (下端拍照完成 ? 'success' : 'light')} ><i className='fa fa-eye' />查看下端</button>;
        let 查看上端btn = <button onClick={this.clickFocusT端Handler} className={"btn flex-grow-0 flex-shrink=0 btn-" + (上端拍照完成 ? 'success' : 'light')} ><i className='fa fa-eye' />查看上端</button>;
        let cancelBtn = <button onClick={this.clickFocus无Handler} className="btn btn-primary flex-grow-0 flex-shrink=0" >取消查看</button>;

        let hadPre = this.索index > 0;
        let hadNex = this.索index < 关联索_arr.length - 1;
        // if(this.focus部位 == E聚焦拉索部位.无){
        //     extraUIs_arr.push(
        //         <div key='nag_leftBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:'5px', top: (canvasHeight - 5) + 'px', width:'130px', transform: 'translate(0%,-100%)' }}>
        //             {查看下端btn}
        //             {查看上端btn}
        //         </div>
        //     );
        //     extraUIs_arr.push(
        //         <div key='nag_rightBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:canvasWidth + 'px', top: (canvasHeight - 5) + 'px', width:'80px', transform: 'translate(-100%,-100%)' }}>
        //             <button onClick={this.clickPre索Handler} className="btn btn-primary flex-grow-0 flex-shrink=0 mb-1" style={{visibility:(hadPre ? '' : 'hidden')}} >上个{this.索类型}</button>
        //             <button onClick={this.clickNext索Handler} className="btn btn-primary flex-grow-0 flex-shrink=0" style={{visibility:(hadNex ? '' : 'hidden')}} >下个{this.索类型}</button>
        //         </div>
        //     );
        // }
        // else{
            extraUIs_arr.push(
                <div key='nag_leftBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:'5px', top: (canvasHeight - 5) + 'px', width:'130px', transform: 'translate(0%,-100%)' }}>
                    {this.genParamButtons()}
                    <span className='mt-2'></span>
                    {this.focus部位 == E聚焦拉索部位.T端 ? null : 查看上端btn}
                    {this.focus部位 == E聚焦拉索部位.B端 ? null : 查看下端btn}
                    {this.focus部位 == E聚焦拉索部位.无 ? null : cancelBtn}
                </div>
            );
            extraUIs_arr.push(
                <div key='nag_rightBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:canvasWidth + 'px', top: (canvasHeight - 5) + 'px', width:'80px', transform: 'translate(-100%,-100%)' }}>
                    <button onClick={this.clickPre索Handler} className="btn btn-primary flex-grow-0 flex-shrink=0" style={{visibility:(hadPre ? '' : 'hidden')}} >上个{this.索类型}</button>
                    <button onClick={this.clickNext索Handler} className="btn btn-primary flex-grow-0 flex-shrink=0" style={{visibility:(hadNex ? '' : 'hidden')}} >下个{this.索类型}</button>
                </div>
            );
        // }
    }
}

class C组网步骤_铺索夹 extends C组网步骤{
    constructor(app,索类型){
        super(app, '安装' + 索类型 + "索夹");
        this.索类型 = 索类型;
        autoBind(this);
        this.索夹index = -1;

        let divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.角度label = new THREE_LabelItem(divElem, new THREE.Vector3());

        this.索夹btn_pool = [];
        this.索夹btn_arr = [];
        this.focus索夹 = null;
    }

    click索夹btnHandler(ev){
        let elem = ev.target;
        let index = -1;
        while (elem != null) {
            let tid = elem.getAttribute('index');
            if(!isNaN(tid)){
                index = parseInt(tid);
                break;
            }
            elem = elem.parentElement;
        }
        if(index == -1){
            return;
        }
        let 索夹 = this.关联索夹_arr[index];
        console.log(索夹.meshObj.position);
        this.setFocus索夹(索夹);
    }

    getOne索夹Btn(){
        if(this.索夹btn_pool.length == 0){
            let buttonElem = document.createElement('button');
            buttonElem.className = 'btn btn-sm btn-light';
            buttonElem.onclick = this.click索夹btnHandler;
            return new THREE_LabelItem(buttonElem, new THREE.Vector3());
        }
        return this.索夹btn_pool.pop();
    }

    reback索夹Btn(item){
        return this.索夹btn_pool.push(item);
    }

    enter(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;
        const controls = app.controls;

        controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

        const labelsContainer = app.labelsRef.current;
        const buttonsContainer = app.btnsRef.current;
        labelsContainer.appendChild(this.角度label.docElem);

        目标网片.索_arr.forEach(拉索=>{
            if(this.索类型 == E索类型.竖索){
                拉索.object3d.visible = 拉索.类型 == E索类型.竖索;
            }
            else{
                拉索.object3d.visible = true;
            }
            拉索.平B_label.docElem.style.display = 'none';
            拉索.平T_label.docElem.style.display = 'none';
        });

        let 关联索夹_dic = {};
        let 关联索夹_arr = [];
        目标网片.索夹_arr.forEach(索夹=>{
            let needed = false;
            if(this.索类型 == E索类型.竖索){
                needed = 索夹.关联竖索 != null;
                索夹.meshObj.visible = needed;
            }
            else{
                needed = 索夹.关联竖索 == null;
                索夹.meshObj.visible = true;
            }
            if(needed){
                索夹.params_arr = [];
                关联索夹_arr.push(索夹);
                关联索夹_dic[索夹.组网索夹代码] = 索夹;
            }
        });
        if(this.索类型 == E索类型.竖索){
            关联索夹_arr.sort((a,b)=>{
                return b.meshObj.position.y - a.meshObj.position.y;
            });
        }
        else{
            关联索夹_arr.sort((a,b)=>{
                let difY = b.meshObj.position.y - a.meshObj.position.y;
                if(Math.abs(difY) < 5){
                    return a.meshObj.position.x - b.meshObj.position.x;
                }
                return difY;
            });
        }
        this.关联索夹_arr = 关联索夹_arr;
        let 索夹btn_arr = this.索夹btn_arr;
        while(索夹btn_arr.length > 关联索夹_arr.length){
            let 索夹btn = 索夹btn_arr.pop();
            this.reback索夹Btn(索夹btn);
            buttonsContainer.removeChild(索夹btn.docElem);
        }
        while(索夹btn_arr.length < 关联索夹_arr.length){
            索夹btn_arr.push(this.getOne索夹Btn());
        }
        索夹btn_arr.forEach((索夹btn,索夹i)=>{
            let 索夹 = 关联索夹_arr[索夹i];
            索夹btn.docElem.innerText = `${索夹i+1}.${索夹.构件.name}`;
            // 索夹btn.docElem.index = 索夹i;
            索夹btn.docElem.setAttribute('index',索夹i);
            索夹btn.worldPos.copy(索夹.meshObj.position);
            buttonsContainer.appendChild(索夹btn.docElem);
        });
        app.show张拉索(目标网片.竖索,true);
        app.cameraLerp.setDefaultState();

        目标网片.组网参数_arr.filter(rcd=>{
            if(rcd.组网图纸参数代码 == 6){
                let 索夹 = 关联索夹_dic[rcd.关联记录代码];
                if(索夹){
                    索夹.params_arr.push(rcd);
                }
            }
        });
    }

    exit(){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const labelsContainer = app.labelsRef.current;
        const buttonsContainer = app.btnsRef.current;
        const 关联索夹_arr = this.关联索夹_arr;
        const 索夹btn_arr = this.索夹btn_arr;
        this.focus索夹 = null;

        关联索夹_arr.forEach((索夹,索夹i)=>{
            索夹.meshObj.material = 索夹Meshmaterial;
            索夹.meshObj.visible = true;
        });

        目标网片.索_arr.forEach(拉索=>{
            拉索.object3d.visible = true;
        });

        labelsContainer.removeChild(this.角度label.docElem);
        
        while(索夹btn_arr.length > 0){
            let 索夹btn = 索夹btn_arr.pop();
            索夹btn.docElem.removeAttribute('disabled');
            this.reback索夹Btn(索夹btn);
            buttonsContainer.removeChild(索夹btn.docElem);
        }

        app.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
        app.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        app.controls.touches.ONE = THREE.TOUCH.PAN;
        app.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    }

    renderFrame(passedTime){
        const app = this.app;
        const appState = app.state;
        const 目标网片 = app.目标网片;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;

        let 索夹btn_arr = this.索夹btn_arr;
        let 关联索夹_arr = this.关联索夹_arr;

        索夹btn_arr.forEach((索夹btn,索夹i)=>{
            let 索夹 = 关联索夹_arr[索夹i];
            let 拍照完成 = 索夹.params_arr.filter(x=>{return x.拍照状态 == 0}).length == 0;
            索夹btn.docElem.className = 'btn btn-sm btn-' + (拍照完成 ? 'success' : 'light');

            SmartUpdateButtonItem(索夹btn, camera, canvas, 1000);
        });

        if(this.focus索夹 == null || this.focus索夹.rcd.主次夹角 < 10){
            this.角度label.docElem.style.display = 'none';
        }
        else{
            SmartUpdateButtonItem(this.角度label, camera, canvas, 1000);
        }
    }

    setFocus索夹(focus索夹){
        const app = this.app;
        const preFocus索夹 = this.focus索夹;
        this.focus索夹 = focus索夹;
        const 目标网片 = app.目标网片;

        if(preFocus索夹 != null){
            preFocus索夹.meshObj.material = 索夹Meshmaterial;
        }

        this.params_arr = [];
        if(focus索夹 != null){
            this.索夹btn_arr.forEach(索夹btn=>{
                索夹btn.docElem.setAttribute('disabled','disabled');
            });
            this.params_arr = 目标网片.组网参数_arr.filter(rcd=>{
                return rcd.关联记录代码 == focus索夹.组网索夹代码 && rcd.组网图纸参数代码 == 6;
            });
            focus索夹.meshObj.material = focus拉索Meshmaterial;

            app.cameraLerp.pushState();

            // this.角度label.docElem.innerText = `向${转角方向}转${转角}°`;

            let 索夹loc = focus索夹.meshObj.position;
        
            let eyePos = new THREE.Vector3(索夹loc.x - 2,索夹loc.y - 2, 3);

            const camera = app.camera;
            let camera_height = camera.top - camera.bottom;
            camera.zoom = camera_height / 6.0;
            camera.position.copy(eyePos);
            app.controls.target.copy(索夹loc);
            camera.updateProjectionMatrix();
            app.controls.cameraZoomChanged();
            app.controls.update();

            let defState = app.cameraLerp.getState();
            defState.target.copy(索夹loc);
            defState.eyepos.copy(eyePos);
            defState.zoom = camera.zoom;
            defState.quaternion.copy(camera.quaternion);
            app.cameraLerp.setDefaultState(defState);

            app.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
            app.controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
            app.controls.touches.ONE = THREE.TOUCH.ROTATE;
            app.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

            if(focus索夹.rcd.主次夹角 > 10){
                let 关联主索 = focus索夹.关联主索;
                let 关联次索 = focus索夹.关联次索;
                let 主索vec = null;
                let 次索vec = null;
                let basePos = focus索夹.meshObj.position;
                if(关联主索 != null){
                    let nextPos = geoPointAtNormalizeLength(关联主索.索线geo,focus索夹.rcd.主索位置比 + 0.05);
                    主索vec = new THREE.Vector3();
                    主索vec.subVectors(nextPos,basePos);
                    主索vec.normalize();

                    basePos = geoPointAtNormalizeLength(关联主索.索线geo,focus索夹.rcd.主索位置比);
                }
                if(关联次索 != null){
                    let nextPos = geoPointAtNormalizeLength(关联次索.索线geo,focus索夹.rcd.次索位置比 - 0.05);
                    次索vec = new THREE.Vector3();
                    次索vec.subVectors(nextPos,basePos);
                    次索vec.normalize();
                    if(basePos == null){
                        basePos = geoPointAtNormalizeLength(关联次索.索线geo,focus索夹.rcd.次索位置比);
                    }
                }

                let zAxis = new THREE.Vector3(0,0,1);
                if(主索vec == null){
                    主索vec = new THREE.Vector3();
                    主索vec.crossVectors(zAxis,次索vec);
                    if(主索vec.x < 0){
                        主索vec.negate();
                    }
                }
                if(次索vec == null){
                    次索vec = new THREE.Vector3();
                    次索vec.crossVectors(zAxis,主索vec);
                    if(次索vec.x < 0){
                        次索vec.negate();
                    }
                }

                let move_vec = new THREE.Vector3();
                move_vec.addVectors(主索vec,次索vec);
                move_vec.normalize();
                let anglePos = new THREE.Vector3(basePos.x,basePos.y,basePos.z);
                anglePos.addScaledVector(move_vec,1);
                this.角度label.worldPos.copy(anglePos);
                this.角度label.docElem.innerText = `${focus索夹.rcd.主次夹角}°(${360 - focus索夹.rcd.主次夹角}°)`;
            }
        }
        else{
            this.索夹btn_arr.forEach(索夹btn=>{
                索夹btn.docElem.removeAttribute('disabled');
            });
            let lerState = app.cameraLerp.popState();
            if(lerState != null){
                const camera = app.camera;
                camera.zoom = lerState.zoom;
                camera.position.copy(lerState.eyepos);
                app.controls.target.copy(lerState.target);
                camera.updateProjectionMatrix();
                app.controls.cameraZoomChanged();
                app.controls.update();

                app.cameraLerp.setDefaultState(lerState);
            }
            app.controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
            app.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
            app.controls.touches.ONE = THREE.TOUCH.PAN;
            app.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        }

        app.setState({
            magicObj:{}
        });
    }

    clickCancelFocusHandler(ev){
        this.setFocus索夹(null);
    }

    clickPreHandler(ev){
        let focus索夹 = this.focus索夹;
        const 关联索夹_arr = this.关联索夹_arr;
        let 索夹index = 关联索夹_arr.indexOf(focus索夹);
        if(索夹index > 0){
            this.setFocus索夹(关联索夹_arr[索夹index-1]);
        }
    }

    clickNextHandler(ev){
        let focus索夹 = this.focus索夹;
        const 关联索夹_arr = this.关联索夹_arr;
        let 索夹index = 关联索夹_arr.indexOf(focus索夹);
        if(索夹index < 关联索夹_arr.length - 1){
            this.setFocus索夹(关联索夹_arr[索夹index+1]);
        }
    }

    render(extraUIs_arr,canvasWidth,canvasHeight){
        super.render(extraUIs_arr,canvasWidth,canvasHeight);
        const canvasWidth_half = this.canvasWidth_half;
        const canvasHeight_half = this.canvasHeight_half;
        const app = this.app;
        const 目标网片 = app.目标网片;
        const 关联索夹_arr = this.关联索夹_arr;
        if(目标网片 == null){
            return;
        }
        extraUIs_arr.push(
            this.renderStepHeader()
        );

        let focus索夹 = this.focus索夹;
        if(focus索夹 == null){
            return;
        }
        extraUIs_arr.push(
            <div key='nag_suoinfo' className="d-flex flex-nowrap position-absolute bg-light rounded border" style={{ left: canvasWidth_half + 'px', top:'50px', transform: 'translate(-50%,0%)' }}>
                {focus索夹.构件.name}
            </div>
        );
        
        extraUIs_arr.push(
            <div key='nag_leftBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:'5px', top: (canvasHeight - 5) + 'px', width:'130px', transform: 'translate(0%,-100%)' }}>
                {this.genParamButtons()}
                <span className='mt-2'></span>
                <button onClick={this.clickCancelFocusHandler} className="btn btn-primary flex-grow-0 flex-shrink=0" >取消查看</button>
            </div>
        );
        
        if(this.索类型 == E索类型.竖索){
            let 索夹index = 关联索夹_arr.indexOf(focus索夹);
            let hadPre = 索夹index > 0;
            let hadNex = 索夹index < 关联索夹_arr.length - 1;
            extraUIs_arr.push(
                <div key='nag_rightBottomBtns' className="d-flex flex-column flex-nowrap position-absolute " style={{ left:canvasWidth + 'px', top: (canvasHeight - 5) + 'px', width:'80px', transform: 'translate(-100%,-100%)' }}>
                    <button onClick={this.clickPreHandler} className="btn btn-primary flex-grow-0 flex-shrink=0" style={{visibility:(hadPre ? '' : 'hidden')}} >上个索夹</button>
                    <button onClick={this.clickNextHandler} className="btn btn-primary flex-grow-0 flex-shrink=0" style={{visibility:(hadNex ? '' : 'hidden')}} >下个索夹</button>
                </div>
            );
        }
    }
}

class ERPC_ThreeDApp_ZuWang extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);

        let 步骤_无步骤 = new C组网步骤_无步骤(this);
        let 步骤_铺设竖索 = new C组网步骤_铺设竖索(this);
        let 步骤_铺设次索 = new C组网步骤_铺设索(this, E索类型.次索);
        let 步骤_铺设主索 = new C组网步骤_铺设索(this, E索类型.主索);
        let 步骤_安装竖索索夹 = new C组网步骤_铺索夹(this, E索类型.竖索);
        let 步骤_安装主次索夹 = new C组网步骤_铺索夹(this, '主次');

        ERP_ThreeDAppBase(this,{
            targetNet:{
                code:0, 
                name:'',
                拉索明细_arr:null,
            },
            show编号:true,
            编号类型:'系统',
            now步骤:步骤_无步骤,
        });
        this.网片_map = {};

        步骤_无步骤.set后续步骤(步骤_铺设竖索);
        步骤_铺设竖索.set后续步骤(步骤_安装竖索索夹);
        步骤_安装竖索索夹.set后续步骤(步骤_铺设次索);
        步骤_铺设次索.set后续步骤(步骤_铺设主索);
        步骤_铺设主索.set后续步骤(步骤_安装主次索夹);
        
        this.步骤_无步骤 = 步骤_无步骤;
        this.步骤_铺设竖索 = 步骤_铺设竖索;
        this.步骤_铺设次索 = 步骤_铺设次索;
        this.步骤_铺设主索 = 步骤_铺设主索;
        this.步骤_安装竖索索夹 = 步骤_安装竖索索夹;
        this.步骤_安装主次索夹 = 步骤_安装主次索夹;
    }

    toggle编号Visible(ev){
        let newshow编号 = !this.state.show编号;
        this.setState({
            show编号:newshow编号
        });
    }

    toggle编号类型(ev){
        let new编号类型 = this.state.编号类型 == '坚朗' ? '系统' : '坚朗';
        this.setState({
            编号类型:new编号类型
        });
        if(this.目标网片){
            this.目标网片.索_arr.forEach(索=>{
                索.设置编号(new编号类型);
            });
        }
    }

    initApp() {
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
    
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const frustumSize = 100;
        const camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
        camera.frustumSize = frustumSize;
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
        this.拉索模型Parant = new THREE.Object3D();
        this.拉索模型Parant.position.set(0, 0, 0);
        scene.add(this.拉索模型Parant);

        this.索夹模型Parant = new THREE.Object3D();
        this.索夹模型Parant.position.set(0, 0, 0);
        scene.add(this.索夹模型Parant);

        this.标注线Parant = new THREE.Object3D();
        this.标注线Parant.position.set(0, 0, 0);
        scene.add(this.标注线Parant);
    
        const lightColor = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(lightColor, intensity);
        light.castShadow = false;
        this.dirLight = light;
        light.position.set(-1, 2, 4);
        scene.add(light);
        scene.add(light.target)
    
        const controls = new MapControls(camera, canvas);
        // controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        // controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        this.controls = controls;
        controls.target.set(0, 0, 0);
        controls.update();
        controls.enableDamping = false;
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 0.3;
        controls.panSpeed = 0.5;
        controls.dampingFactor = 0.08;

        // const lineGeometry = new THREE.BufferGeometry();
        // lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [0,-frustumSize/2,0,0,frustumSize/2,0], 3 ) );
        // let line = new THREE.Line( lineGeometry, 拉索lineMaterial );
        // scene.add( line );

        this.cameraLerp = new CCameraLerp(camera, controls);
    }

    tryLoad构件模型(){
        let loading构件 = null;
        for(var si in this.needLoad构件_arr){
            if(!this.needLoad构件_arr[si].isLoaded()){
                loading构件 = this.needLoad构件_arr[si];
                break;
            }
        }
        if(loading构件 == null){
            this.生成网片模型();
            return;
        }
        let self = this;
        this.load3dm(loading构件.fileurl,`加载${loading构件.name}模型`,0,1,(object)=>{
            let theMesh = object.children[0];
            loading构件.meshGeometry = theMesh.geometry;
            self.tryLoad构件模型();
        });
    }

    show张拉索(张拉索, bForceFocus = false){
        let left = 张拉索.B节点.平X;
        let right = 张拉索.T节点.平X;
        if(left > right){
            let t = left;
            left = right;
            right = t;
        }

        let top = 张拉索.B节点.平Y;
        let dowm = 张拉索.T节点.平Y;
        if(dowm > top){
            let t = top;
            top = dowm;
            dowm = t;
        }
        left -= 5;
        right += 5;
        top += 5;
        dowm -= 5;

        let dif_x = right - left;
        let dif_y = top - dowm;
        let dis_x = Math.abs(dif_x);
        let dis_y = Math.abs(dif_y);

        let mid_x = left + dif_x * 0.5;
        let mid_y = dowm + dif_y * 0.5;

        let camera = this.camera;
        let camera_width = camera.right - camera.left;
        let camera_height = camera.top - camera.bottom;

        let zoom = 1;
        if(dis_x > dis_y){
            zoom = camera_width / dis_x;
        }
        else{
            zoom = camera_height / dis_y;
        }
        if(!bForceFocus && zoom > camera.zoom){
            zoom = camera.zoom;
        }
        // camera.zoom = zoom;
        // camera.position.set(mid_x,mid_y,100);
        // camera.updateProjectionMatrix();
        // this.controls.target.set(mid_x,mid_y,0);
        // this.controls.cameraZoomChanged();
        // this.controls.update();

        this.cameraLerp.setPosition(new THREE.Vector3(mid_x,mid_y,100), new THREE.Vector3(mid_x,mid_y + 1,0), zoom);
    }

    生成网片模型(){
        const targetNet = this.state.targetNet;
        let 目标网片 = null;
        if(this.网片_map[targetNet.code] == null){
            目标网片 = new C网片(targetNet.name, targetNet.code);
            this.网片_map[targetNet.code] = 目标网片;
        }
        else{
            目标网片 = this.网片_map[targetNet.code];
        }
        this.目标网片 = 目标网片;
        目标网片.原竖索节点_arr = this.原竖索节点_arr;
        目标网片.组网参数_arr = this.组网参数_arr;
        let self = this;
        let 拉索明细_arr = targetNet.拉索明细_arr;
        let 拉索节点_map = {};
        let 索夹_arr = this.索夹_arr;
        let 节点_arr = this.节点_arr;
        节点_arr.forEach(节点rcd=>{
            if(拉索节点_map[节点rcd.构件上传记录代码] == null) {
                拉索节点_map[节点rcd.构件上传记录代码] = [];
            }
            节点rcd.X /= 100.0
            节点rcd.Y /= 100.0
            节点rcd.Z /= 100.0
            节点rcd.平X /= 100.0
            节点rcd.平Y /= 100.0
            节点rcd.平Z /= 100.0
            拉索节点_map[节点rcd.构件上传记录代码].push(节点rcd);
        });

        let 编号类型 = self.state.编号类型;
        let 当前索网拉索_map = {};
        let 张拉索_map = {};
        拉索明细_arr.forEach(拉索rcd=>{
            let 张拉索 = 目标网片.add索FromRecord(拉索rcd);
            self.拉索模型Parant.add( 张拉索.object3d );

            张拉索_map[拉索rcd.构件上传记录代码] = 张拉索;
            当前索网拉索_map[拉索rcd.构件上传记录代码] = 张拉索;

            let 拉索节点_arr = 拉索节点_map[张拉索.构件上传记录代码];
            张拉索.节点_arr = 拉索节点_arr;
            const points = [];
            const vector_arr = [];
            拉索节点_arr.forEach(节点rcd=>{
                points.push( 节点rcd.平X, 节点rcd.平Y, 节点rcd.平Z );
                vector_arr.push(new THREE.Vector3( 节点rcd.平X, 节点rcd.平Y, 节点rcd.平Z ));
            });
            
            const lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
            张拉索.索线geo = new THREE.Line( lineGeometry, 拉索lineMaterial );

            const theSpline = new THREE.CatmullRomCurve3(vector_arr);
            const extrudeSettings1 = {
                steps: 100,
                bevelEnabled: false,
                extrudePath: theSpline
            };
            let useShape = null;
            if(张拉索.类型 == E索类型.竖索){
                if(张拉索.索径 == 55){
                    useShape = cicle_55;
                }
                else{
                    useShape = cicle_40;
                }
            }
            else{
                useShape = cicle_30;
            }
            const lineMeshGeometry = new THREE.ExtrudeGeometry( useShape, extrudeSettings1 );
            const lineMesh = new THREE.Mesh( lineMeshGeometry, 拉索Meshmaterial );
            张拉索.索线mesh = lineMesh;
            张拉索.object3d.add(lineMesh);
            

            let B节点 = 拉索节点_arr[0];
            let T节点 = 拉索节点_arr[拉索节点_arr.length - 1];
            let B端索头mesh = 张拉索.B索头构件.getone();
            张拉索.B端索头mesh = B端索头mesh;
            let B端rotMat = CreateMatrixFromAxisString(拉索rcd.放平朝向B);
            
            B端索头mesh.setRotationFromMatrix (B端rotMat);
            B端索头mesh.position.set(B节点.平X,B节点.平Y,B节点.平Z);
            B端索头mesh.scale.set(10,10,10);
            张拉索.object3d.add(B端索头mesh);

            let T端索头mesh = 张拉索.T索头构件.getone();
            张拉索.T端索头mesh = T端索头mesh;
            let T端rotMat = CreateMatrixFromAxisString(拉索rcd.放平朝向T);
            T端索头mesh.setRotationFromMatrix(T端rotMat);
            T端索头mesh.position.set(T节点.平X,T节点.平Y,T节点.平Z);
            T端索头mesh.scale.set(10,10,10);
            张拉索.object3d.add(T端索头mesh);

            张拉索.B节点 = B节点;
            张拉索.T节点 = T节点;
            
            张拉索.平B_label.worldPos.set(B节点.平X,B节点.平Y,B节点.平Z);
            张拉索.平T_label.worldPos.set(T节点.平X,T节点.平Y,T节点.平Z);

            self.labelsRef.current.appendChild(张拉索.平B_label.docElem);
            self.labelsRef.current.appendChild(张拉索.平T_label.docElem);

            张拉索.设置编号(编号类型);
        });

        let 索夹翻转mat = new THREE.Matrix4();
        索夹翻转mat.makeRotationAxis(new THREE.Vector3(1,0,0),Math.PI);
        索夹_arr.forEach(索夹rcd=>{
            let 关联主索 = 当前索网拉索_map[索夹rcd.主索记录代码];
            let 关联次索 = 当前索网拉索_map[索夹rcd.次索记录代码];
            let 关联竖索 = 当前索网拉索_map[索夹rcd.竖索记录代码];
            let basePos = null;
            if(关联竖索 != null) {
                basePos = geoPointAtNormalizeLength(关联竖索.索线geo,索夹rcd.竖索位置比);
            }
            else if(关联主索 != null){
                basePos = geoPointAtNormalizeLength(关联主索.索线geo,索夹rcd.主索位置比);
            }
            else if(关联次索 != null) {
                basePos = geoPointAtNormalizeLength(关联次索.索线geo,索夹rcd.次索位置比);
                basePos.Z += 30;
            }
            else{
                console.log("!!!!组网索夹代码:" + 索夹rcd.组网索夹代码 + "没有主次索!");
                return;
            }

            let 索夹构件 = all构件模型_map[索夹rcd.索夹构件代码];
            let 索夹mesh = 索夹构件.getone();
            索夹mesh.setRotationFromMatrix(索夹翻转mat);
            索夹mesh.position.copy(basePos);
            索夹mesh.scale.set(10,10,10);
            索夹rcd.mesh = 索夹mesh;
            self.索夹模型Parant.add(索夹mesh);
            let 索夹 = new C索夹(索夹rcd,索夹构件,索夹mesh,关联主索,关联次索,关联竖索);
            目标网片.add索夹(索夹);
        });

        // this.show张拉索(目标网片.竖索, true);
        // this.switch步骤(self.步骤_安装竖索索夹,{
        //     fetching: false,
        // });
        this.switch步骤(self.步骤_无步骤,{
            fetching: false,
        });
    }

    switch步骤(target步骤, appendState){
        let now步骤 = this.state.now步骤;
        if(target步骤 == now步骤){
            target步骤.enter();
            if(appendState != null){
                this.setState(appendState);
            }
            return;
        }
        now步骤.exit();
        target步骤.enter();
        let newState = Object.assign({
            now步骤:target步骤
        }, appendState);
        this.setState(newState);
    }

    网片选择Callback(data){
        if(data.组网代码 == this.state.targetNet.code){
            return;
        }
        if(this.目标网片 != null){
            let 当前网片 = this.目标网片;
            this.state.now步骤.exit();
            this.state.now步骤 = this.步骤_无步骤;
            this.目标网片 = null;

            this.拉索模型Parant.clear();
            this.索夹模型Parant.clear();
            this.标注线Parant.clear();

            let labelsRef = this.labelsRef;
            当前网片.索_arr.forEach(张拉索=>{
                labelsRef.current.removeChild(张拉索.平B_label.docElem);
                labelsRef.current.removeChild(张拉索.平T_label.docElem);
                张拉索.索线geo.geometry.dispose();
                张拉索.索线geo = null;

                张拉索.object3d.clear();
                张拉索.索线mesh.geometry.dispose();
                张拉索.索线mesh = null;
                张拉索.B索头构件.reback(张拉索.B端索头mesh);
                张拉索.T索头构件.reback(张拉索.T端索头mesh);
                张拉索.B端索头mesh = null;
                张拉索.T端索头mesh = null;
            });
            当前网片.索夹_arr.forEach(索夹=>{
                索夹.构件.reback(索夹.meshObj);
                索夹.meshObj = null;
            });
            当前网片.索夹_arr = [];
        }
        this.步骤_铺设主索.索index = 0;
        this.步骤_铺设次索.索index = 0;
        console.log('网片选择Callback');
        let 拉索明细_arr = data.拉索明细_arr;
        let self = this;
        let newNet = Object.assign({}, this.state.targetNet, {
            code:data.组网代码, 
            name:data.网片名称,
            拉索明细_arr:拉索明细_arr,
        });

        self.setState({
            fetching: true,
            fetch_percent: 0,
            fetch_title: '加载网片信息',
            fetch_error: '',
            targetNet:newNet,
        });

        nativeFetchJson(false, threeDServerUrl, { bundle: { 大连索网代码: data.组网代码 }, action: 'pulldata_组网数据查询' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            console.log(json.data);
            
            let 节点_arr = json.data.节点_arr;
            let 索夹_arr = json.data.索夹_arr;
            let 构件_arr = json.data.构件_arr;
            let 原竖索节点_arr = json.data.原竖索节点_arr;
            let 组网参数_arr = json.data.组网参数_arr;

            this.节点_arr = 节点_arr;
            this.索夹_arr = 索夹_arr;
            this.原竖索节点_arr = 原竖索节点_arr;
            this.组网参数_arr = 组网参数_arr;

            构件_arr.forEach(构件rcd=>{
                all构件模型_map[构件rcd.构件代码].fileurl = 构件rcd.文件路径;
            });
            
            let needLoad构件_arr = [标准构件_30固定端,标准构件_40固定端,标准构件_55固定端,标准构件_30调节端];
            if(!标准构件_30固定端.isLoaded()){
                needLoad构件_arr.push(标准构件_30固定端);
            }
            if(!标准构件_40固定端.isLoaded()){
                needLoad构件_arr.push(标准构件_40固定端);
            }
            if(!标准构件_55固定端.isLoaded()){
                needLoad构件_arr.push(标准构件_55固定端);
            }
            if(!标准构件_30调节端.isLoaded()){
                needLoad构件_arr.push(标准构件_30调节端);
            }
            let checked_map = {};
            索夹_arr.forEach(索夹rcd=>{
                if(!checked_map[索夹rcd.索夹构件代码]){
                    let 索夹构件 = all构件模型_map[索夹rcd.索夹构件代码];
                    if(!索夹构件.isLoaded()){
                        needLoad构件_arr.push(索夹构件);
                        checked_map[索夹rcd.索夹构件代码] = 1;
                    }
                }
            });
            self.needLoad构件_arr = needLoad构件_arr;
            self.tryLoad构件模型();
        });
    }

    clickNetBtnHandler(ev){
        popZuWangSelector(this.网片选择Callback);
    }

    clickDebugBtnHandler(ev){
        console.log(this.camera.position);
        console.log(this.controls.target);
        console.log(this.camera.zoom);
        if(this.debugI == null){
            this.debugI = 0;
        }
        else{
            this.debugI = (this.debugI + 1) % this.目标网片.主索_arr.length;
        }
        this.show张拉索(this.目标网片.主索_arr[this.debugI]);
    }

    clickResetBtnHandler(ev){
        // this.camera.setRotationFromEuler(new THREE.Euler( 0, 0, 0, 'XYZ' ));
        // this.camera.updateProjectionMatrix();
        let controls = this.controls;
        if(this.cameraLerp.defaultState){
            let lerState = this.cameraLerp.defaultState;
            this.cameraLerp.setPosition(lerState.eyepos, lerState.target, lerState.zoom, lerState.quaternion);
        }
        // this.cameraLerp.setPosition(new THREE.Vector3(controls.target.x,controls.target.y-1,100), controls.target);
        // let camera = this.camera;
        // let controls = this.controls;

        // camera.position.set(controls.target.x,controls.target.y,100);
        // controls.update();
    }


    renderFrame(gameTime) {
        const time = gameTime - this.preGameTime;
        this.preGameTime = gameTime;
        const camera = this.camera;
        const scene = this.scene;
        const canvas = this.canvasRef.current;
        const renderer = this.renderer;
        if (this.resizeRendererToDisplaySize()) {
            // camera.aspect = canvas.clientWidth / canvas.clientHeight;
            let aspect = canvas.clientWidth / canvas.clientHeight;
            let frustumSize = camera.frustumSize;
            camera.left = frustumSize * aspect / - 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / - 2;
            camera.updateProjectionMatrix();
            this.setState({
                magicObj: {} // 窗口尺寸有变化，UI也要重新渲染
            });
        }

        // this.controls.update();
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

        if(this.目标网片){
            this.state.now步骤.renderFrame(time);
        }

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
        
        let netName = '请选择索网';
        if(this.state.targetNet.code == 0){
            setTimeout(() =>{
                popZuWangSelector(self.网片选择Callback);
            },10);
        }
        else{
            netName = "网片:" + this.state.targetNet.name;
            // toprightBtns_arr.push(<button key='toggle编号Visible' onClick={this.toggle编号Visible} className="btn btn-sm btn-light flex-grow-0 flex-shrink=0 mt-1" ><i className={"fa fa-eye" + (this.state.show编号 == false ? '-slash text-danger' : '')}></i>显示编号</button>);
            // if(this.state.show编号){
            //     toprightBtns_arr.push();
            // }
        }


        let netBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickNetBtnHandler}>{netName}</button>
        topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '70px', top: '5px', left: '5px' }}>
            {netBtn}
            {/* <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDebugBtnHandler}>DEBUG</button> */}
            <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickResetBtnHandler}>重置视角</button>
        </div>

        // extraUIs_arr.push(
        //     <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
        //         {/* <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{minWidth:'150px'}} >{btnName}</button> */}
        //     </div>
        // );

        if(this.目标网片){
            this.state.now步骤.render(extraUIs_arr,canvasWidth,canvasHeight);
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

function ERPC_ThreeDApp_ZuWang_mapstatetoprops(state, ownprops) {
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

function ERPC_ThreeDApp_ZuWang_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}
var VisibleERPC_ThreeDApp_ZuWang = null;

function InitThreedApp_ZuWang() {
    VisibleERPC_ThreeDApp_ZuWang = ReactRedux.connect(ERPC_ThreeDApp_ZuWang_mapstatetoprops, ERPC_ThreeDApp_ZuWang_dispatchtorprops)(ERPC_ThreeDApp_ZuWang);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp_ZuWang);

function popZuWangSelector(completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(() => {
            completeCallBack(popPage_1exportParam);
        }, 50);
    };
    var popPage_1entryParam = {
        completeCallBack: popPage_1_callback
    };
    gDataCache.set('M_Page_ZuWangSelentryParam', popPage_1entryParam);
    init_M_Page_ComSel();
    popPersistentPage('M_Page_ZuWangSel', ()=>{return <VisibleCM_Page_ZuWangSel key='M_Page_ZuWangSel' />});
}

// M_Page_ZuWangSel
function init_M_Page_ZuWangSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ZuWangSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ZuWangSel_onLoad(); }, 50);
    needSetState['M_Page_ZuWangSel.parentPageID'] = parentPageID;
    needSetState['M_Page_ZuWangSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_ZuWangSel_onLoad() {
}
function M_iframe_ZuWangSel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    if (msgtype == '网片已选择') {
        closePage2('M_Page_ZuWangSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_ZuWangSel', 'completeCallBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(data); }, 20); }
    }
}

class CM_Page_ZuWangSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_ZuWangSel';
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
            <h3 className='flex-grow-1 flex-shrink-1'>选择目标索网</h3>
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='ZWGJY' flowCode='293' pageType='auto' onMessageFun={M_iframe_ZuWangSel_onReceiveMsg} id='M_iframe_ZuWangSel' parentPath='M_Page_ZuWangSel' />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_ZuWangSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ZuWangSel', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ZuWangSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_ZuWangSel = ReactRedux.connect(CM_Page_ZuWangSel_mapstatetoprops, CM_Page_ZuWangSel_disptchtoprops)(CM_Page_ZuWangSel);

// 参数拍照
function popZWParamShoter(组网参数数据代码, completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        if(gDataCache.get('M_Page_ZWParamShoter_shoted')){
            setTimeout(completeCallBack, 50);
        }
    };
    var popPage_1entryParam = {
        组网参数数据代码: 组网参数数据代码,
        callBack: popPage_1_callback,
    };
    gDataCache.set('M_Page_ZWParamShoter_shoted', false);
    gDataCache.set('M_Page_ZWParamShoterentryParam', popPage_1entryParam);
    init_M_Page_ZWParamShoter();
    popPersistentPage('M_Page_ZWParamShoter', ()=>{return <VisibleCM_Page_ZWParamShoter key='M_Page_ZWParamShoter' id='M_Page_ZWParamShoter' flowCode='294' parentPath='M_Page_ZWParamShoter' />});
}

function init_M_Page_ZWParamShoter(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_ZWParamShoter';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_ZWParamShoter_onLoad(); }, 50);
    needSetState['M_Page_ZWParamShoter.parentPageID'] = parentPageID;
    needSetState['M_Page_ZWParamShoter._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}

function M_Page_ZWParamShoter_onLoad() {
    var M_Page_ZWParamShoter_组网参数数据代码 = getPageEntryParam('M_Page_ZWParamShoter', '组网参数数据代码', 0);
    var state = store.getState();
    setTimeout(() => {
        store.dispatch(makeAction_setStateByPath({ type: '刷新参数', data: { 组网参数代码: M_Page_ZWParamShoter_组网参数数据代码 } }, 'M_Page_ZWParamShoter.iframe_shot.msg'));
    }, 50);
}

function iframeZW_shot_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    var iframe_shot_path = fullPath;
    let pageID = 'M_Page_ZWParamShoter';
    let autoClose = data;
    if (msgtype == '拍照完成') {
        gDataCache.set('M_Page_ZWParamShoter_shoted', true);
        if(autoClose){
            closePage2(pageID, state);
            var callBackFun = getPageEntryParam('M_Page_ZWParamShoter', 'callBack', null);
            if(callBackFun){
                callBackFun();
            }
        }
    }
}

class CM_Page_ZWParamShoter extends React.PureComponent {
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='ZWGJY' flowCode={this.props.flowCode} pageType='mb' onMessageFun={iframeZW_shot_onReceiveMsg} id='iframe_shot' parentPath={this.props.parentPath} />
                {this.renderSidePage()}
            </div>);
        return retElem;
    }

}
function CM_Page_ZWParamShoter_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_ZWParamShoter', {});
    retProps['sidepages_arr'] = pageState.sidepages_arr;
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_ZWParamShoter_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_ZWParamShoter = ReactRedux.connect(CM_Page_ZWParamShoter_mapstatetoprops, CM_Page_ZWParamShoter_disptchtoprops)(CM_Page_ZWParamShoter);
