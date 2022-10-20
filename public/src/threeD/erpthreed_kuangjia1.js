const E施工步骤 = {
    组装:'框架组装',
    运输:'场内运输',
    安装:'现场安装'
}

class C并网步骤_连接调节端 extends C组网步骤{
    constructor(app){
        super(app, '组装调节端');
        autoBind(this);

        let divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.netA_label = new THREE_LabelItem(divElem, new THREE.Vector3());

        divElem = document.createElement('div');
        divElem.className = 'badge badge-info';
        this.netB_label = new THREE_LabelItem(divElem, new THREE.Vector3());

        this.调节端btn_pool = [];
        this.调节端btn_arr = [];
        this.focus调节端 = null;
    }

    getOneBtn(){
        if(this.调节端btn_pool.length == 0){
            let buttonElem = document.createElement('button');
            buttonElem.className = 'btn btn-sm btn-light';
            buttonElem.onclick = this.click调节端btnHandler;
            return new THREE_LabelItem(buttonElem, new THREE.Vector3());
        }
        return this.调节端btn_pool.pop();
    }

    rebackBtn(item){
        return this.调节端btn_pool.push(item);
    }

    click调节端btnHandler(ev){
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
        let 调节端 = this.调节端_arr[index];
        // console.log(调节端.meshObj.position);
        this.setFocus调节端(索夹);
    }


    enter(){
        const app = this.app;
        const controls = app.controls;
        // controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
        // controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        const 目标网片A = app.目标网片A;
        const 目标网片B = app.目标网片B;
        const labelsContainer = app.labelsRef.current;

        let ptCount = 0;
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        let maxZ = -99999999;
        let minZ = 99999999;

        labelsContainer.appendChild(this.netA_label.docElem);
        labelsContainer.appendChild(this.netB_label.docElem);

        let 竖索A中点 =  geoPointAtNormalizeLength(目标网片A.竖索.索线geo,0.5);
        let 竖索B中点 =  geoPointAtNormalizeLength(目标网片B.竖索.索线geo,0.5);

        this.netA_label.docElem.innerText = 目标网片A.name;
        this.netB_label.docElem.innerText = 目标网片B.name;
        this.netA_label.worldPos.copy(竖索A中点);
        this.netB_label.worldPos.copy(竖索B中点);

        目标网片A.索_arr.forEach(拉索=>{
            拉索.object3d.visible = true;
            拉索.平B_label.docElem.style.display = 'none';
            拉索.平T_label.docElem.style.display = 'none';

            if(拉索.类型 == E索类型.竖索){
                return;
            }

            let use节点 = null;
            if(拉索.类型 == E索类型.主索){
                use节点 = 拉索.T节点;
            }
            else{
                use节点 = 拉索.B节点;
            }

            ptCount += 1;
            sumX += use节点.X;
            sumY += use节点.Y;
            sumZ += use节点.Z;
            maxZ = Math.max(maxZ,use节点.Z);
            minZ = Math.min(minZ,use节点.Z);
        });

        let 中点vec = new THREE.Vector3();
        中点vec.subVectors(竖索A中点, 竖索B中点);
        let midPoint = new THREE.Vector3(竖索B中点.x,竖索B中点.y,竖索B中点.z);
        midPoint.addScaledVector(中点vec,0.5);

        if(中点vec.length() > 50){
            中点vec.normalize();
            this.netA_label.worldPos.copy(midPoint).addScaledVector(中点vec, 25);
            this.netB_label.worldPos.copy(midPoint).addScaledVector(中点vec, -25);
        }
        let offVec = new THREE.Vector3();
        offVec.copy(竖索A中点).sub(midPoint);

        // let avgPoint = new THREE.Vector3(sumX/ptCount,sumY/ptCount,sumZ/ptCount);
        let centPoint = new THREE.Vector3(0,0,midPoint.z);
        let moveVec = new THREE.Vector3();
        moveVec.subVectors(midPoint,centPoint);
        moveVec.normalize();
        let eyePoc = new THREE.Vector3(midPoint.x,midPoint.y,midPoint.z);
        eyePoc.addScaledVector(moveVec,100);
        eyePoc.z = eyePoc.z - 1;

        目标网片B.索_arr.forEach(拉索=>{
            拉索.object3d.visible = true;
            拉索.平B_label.docElem.style.display = 'none';
            拉索.平T_label.docElem.style.display = 'none';
        });

        // 目标网片.索夹_arr.forEach(索夹=>{
        //     索夹.meshObj.visible = true;
        // });

        let targetMat = new THREE.Matrix4();
        targetMat.lookAt(eyePoc,midPoint,new THREE.Vector3(0,0,1));
        let quaternion = new THREE.Quaternion();
        quaternion.setFromRotationMatrix(targetMat);

        app.showLine(-20,20,maxZ,minZ,eyePoc,midPoint,quaternion, true);
        app.cameraLerp.setDefaultState();

        const geometry = new THREE.SphereGeometry(0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        let sphereInter = new THREE.Mesh(geometry, material);
        app.scene.add(sphereInter);
        sphereInter.position.copy(midPoint);
    }
    exit(){
        const app = this.app;
        const 目标网片A = app.目标网片A;
        const 目标网片B = app.目标网片B;
        const labelsContainer = app.labelsRef.current;
        if(目标网片A){
            目标网片A.索_arr.forEach(拉索=>{
                拉索.object3d.visible = true;
                拉索.平B_label.docElem.style.display = 'none';
                拉索.平T_label.docElem.style.display = 'none';
            });
            目标网片B.索_arr.forEach(拉索=>{
                拉索.object3d.visible = true;
                拉索.平B_label.docElem.style.display = 'none';
                拉索.平T_label.docElem.style.display = 'none';
            });
        }

        labelsContainer.removeChild(this.netA_label.docElem);
        labelsContainer.removeChild(this.netB_label.docElem);
    }
    renderFrame(passedTime){
        const app = this.app;
        const appState = app.state;
        const 目标网片A = app.目标网片A;
        const 目标网片B = app.目标网片B;
        const camera = app.camera;
        const scene = app.scene;
        const canvas = app.canvasRef.current;

        SmartUpdateButtonItem(this.netA_label, camera, canvas, 1000);
        SmartUpdateButtonItem(this.netB_label, camera, canvas, 1000);

        const 网片_arr = [目标网片A,目标网片B];
        网片_arr.forEach(目标网片=>{
            if(目标网片){
                // 目标网片.索_arr.forEach(拉索=>{
                //     拉索.平B_label.docElem.style.display = 'none';
                //     拉索.平T_label.docElem.style.display = 'none';
                // });
                // if(appState.show编号){
                //     目标网片.索_arr.forEach(拉索=>{
                //         SmartUpdateButtonItem(拉索.平B_label, camera, canvas, 1000);
                //         SmartUpdateButtonItem(拉索.平T_label, camera, canvas, 1000);
                //     });
                // }
            }
        });
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

class ERPC_ThreeDApp_KuangJia extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);
        ERPControlBase(this);

        let 步骤_无步骤 = new C并网步骤_连接调节端(this);

        ERP_ThreeDAppBase(this,{
            processTypeSelected:false,
            processType:null,
            targetKG:null,
            rangeSelected:false,
            range:null,
            now步骤:步骤_无步骤,
        });
        
        this.步骤_无步骤 = 步骤_无步骤;
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

        // const fov = 75;
        // const aspect = canvas.clientWidth / canvas.clientHeight;
        // const near = 0.1;
        // const far = 500;
        // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        // this.camera = camera;

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
        controls.screenSpacePanning = true;
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

        this.cameraLerp = new CCameraLerp(camera, controls);
    }

    clickProcessTypeHandler(ev){
        let elem = ev.target;
        let type = -1;
        while (elem != null) {
            let ptype = elem.getAttribute('ptype');
            if(ptype){
                type = ptype;
                break;
            }
        }
        if(type){
            this.setState({
                processTypeSelected:true,
                processType:type
            });
        }
    }

    clickReSelectProcessTypeHandler(ev){
        this.setState({
            processTypeSelected:false
        });
    }

    clickCancleReSelectProcessTypeHandler(ev){
        this.setState({
            processTypeSelected:true
        });
    }

    clickReSelectRangeHandler(ev){
        popRangeSelector(this.范围选择Callback);
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

    showLine(left,right,top,dowm,eyeLoc,targetLoc,targetQua,bForceFocus){
        if(left > right){
            let t = left;
            left = right;
            right = t;
        }
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

        this.cameraLerp.setPosition(eyeLoc, targetLoc, zoom, targetQua);
    }

    生成网片模型(){
        let self = this;
        for(let stepI=0;stepI<2;++stepI){
            let targetNet = this.state.targetNetA;
            let 网data = this.网Adata;
            if(stepI == 1){
                targetNet = this.state.targetNetB;
                网data = this.网Bdata;
            }
            let 目标网片 = null;
            if(this.网片_map[targetNet.code] == null){
                目标网片 = new C网片(targetNet.name, targetNet.code);
                this.网片_map[targetNet.code] = 目标网片;
            }
            else{
                目标网片 = this.网片_map[targetNet.code];
            }
            if(stepI == 0){
                this.目标网片A = 目标网片;
            }
            else{
                this.目标网片B = 目标网片;
            }
            
            目标网片.组网参数_arr = 网data.组网参数_arr;
            let self = this;
            let 拉索明细_arr = 网data.拉索_arr;
            let 拉索节点_map = {};
            // let 索夹_arr = 网data.索夹_arr;
            let 节点_arr = 网data.节点_arr;
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
                    points.push( 节点rcd.X, 节点rcd.Y, 节点rcd.Z );
                    vector_arr.push(new THREE.Vector3( 节点rcd.X, 节点rcd.Y, 节点rcd.Z ));
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
                let B端rotMat = CreateMatrixFromAxisString(拉索rcd.朝向B);
                
                B端索头mesh.setRotationFromMatrix (B端rotMat);
                B端索头mesh.position.set(B节点.X,B节点.Y,B节点.Z);
                B端索头mesh.scale.set(10,10,10);
                张拉索.object3d.add(B端索头mesh);

                let T端索头mesh = 张拉索.T索头构件.getone();
                张拉索.T端索头mesh = T端索头mesh;
                let T端rotMat = CreateMatrixFromAxisString(拉索rcd.朝向T);
                T端索头mesh.setRotationFromMatrix(T端rotMat);
                T端索头mesh.position.set(T节点.X,T节点.Y,T节点.Z);
                T端索头mesh.scale.set(10,10,10);
                张拉索.object3d.add(T端索头mesh);

                张拉索.B节点 = B节点;
                张拉索.T节点 = T节点;
                
                张拉索.平B_label.worldPos.set(B节点.X,B节点.Y,B节点.Z);
                张拉索.平T_label.worldPos.set(T节点.X,T节点.Y,T节点.Z);

                self.labelsRef.current.appendChild(张拉索.平B_label.docElem);
                self.labelsRef.current.appendChild(张拉索.平T_label.docElem);

                张拉索.设置编号(编号类型);
            });

            // let 索夹翻转mat = new THREE.Matrix4();
            // 索夹翻转mat.makeRotationAxis(new THREE.Vector3(1,0,0),Math.PI);
            // 索夹_arr.forEach(索夹rcd=>{
            //     let 关联主索 = 当前索网拉索_map[索夹rcd.主索记录代码];
            //     let 关联次索 = 当前索网拉索_map[索夹rcd.次索记录代码];
            //     let 关联竖索 = 当前索网拉索_map[索夹rcd.竖索记录代码];
            //     let basePos = null;
            //     if(关联竖索 != null) {
            //         basePos = geoPointAtNormalizeLength(关联竖索.索线geo,索夹rcd.竖索位置比);
            //     }
            //     else if(关联主索 != null){
            //         basePos = geoPointAtNormalizeLength(关联主索.索线geo,索夹rcd.主索位置比);
            //     }
            //     else if(关联次索 != null) {
            //         basePos = geoPointAtNormalizeLength(关联次索.索线geo,索夹rcd.次索位置比);
            //         basePos.Z += 30;
            //     }
            //     else{
            //         console.log("!!!!组网索夹代码:" + 索夹rcd.组网索夹代码 + "没有主次索!");
            //         return;
            //     }

            //     let 索夹构件 = all构件模型_map[索夹rcd.索夹构件代码];
            //     let 索夹mesh = 索夹构件.getone();
            //     索夹mesh.setRotationFromMatrix(索夹翻转mat);
            //     索夹mesh.position.copy(basePos);
            //     索夹mesh.scale.set(10,10,10);
            //     索夹rcd.mesh = 索夹mesh;
            //     self.索夹模型Parant.add(索夹mesh);
            //     let 索夹 = new C索夹(索夹rcd,索夹构件,索夹mesh,关联主索,关联次索,关联竖索);
            //     目标网片.add索夹(索夹);
            // });
        }


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

    范围选择Callback(data){
        console.log(data);
        this.setState({
            range:data,
            rangeSelected:true,
        });
        return;
        let target网片A = {
            code:data.网片A代码,
            name:data.网片A轴号,
            部位代码:data.网片A部位代码,
        }
        let target网片B = {
            code:data.网片B代码,
            name:data.网片B轴号,
            部位代码:data.网片B部位代码,
        }
        if(target网片A.部位代码 > target网片B.部位代码){
            var t = target网片A;
            target网片A = target网片B;
            target网片B = t;
        }
        if(target网片A.code == this.state.targetNetA.code && target网片B.code == this.state.targetNetB.code){
            return;
        }
        if(this.目标网片_arr.length > 0){
            this.state.now步骤.exit();
            this.state.now步骤 = this.步骤_无步骤;
            this.拉索模型Parant.clear();
            this.索夹模型Parant.clear();
            this.标注线Parant.clear();
            let labelsRef = this.labelsRef;
            this.目标网片_arr.forEach(当前网片=>{
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
            });
            this.目标网片_arr = [];
        }
        console.log('网片选择Callback');

        let self = this;

        self.setState({
            fetching: true,
            fetch_percent: 0,
            fetch_title: '加载网片信息',
            fetch_error: '',
            targetNetA:target网片A,
            targetNetB:target网片B,
        });

        nativeFetchJson(false, threeDServerUrl, { bundle: { 索网A代码: target网片A.code,索网B代码: target网片B.code }, action: 'pulldata_并网数据查询' }).then(json => {
            if (json.err != null) {
                self.setState({
                    fetch_error: `出错了:${JSON.stringify(json.err)}`,
                });
                return;
            }
            console.log(json.data);

            let 网Adata = json.data.网A;
            let 网Bdata = json.data.网B;

            this.网Adata = 网Adata;
            this.网Bdata = 网Bdata;

            let 构件_arr = json.data.构件_arr;
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
            // let checked_map = {};
            // 索夹_arr.forEach(索夹rcd=>{
            //     if(!checked_map[索夹rcd.索夹构件代码]){
            //         let 索夹构件 = all构件模型_map[索夹rcd.索夹构件代码];
            //         if(!索夹构件.isLoaded()){
            //             needLoad构件_arr.push(索夹构件);
            //             checked_map[索夹rcd.索夹构件代码] = 1;
            //         }
            //     }
            // });
            self.needLoad构件_arr = needLoad构件_arr;
            self.tryLoad构件模型();
        });
    }

    clickNetBtnHandler(ev){
        popBingWangSelector(this.网片选择Callback);
    }

    clickDebugBtnHandler(ev){
        console.log(this.camera.position);
        console.log(this.controls.target);
        console.log(this.camera.zoom);
    }

    clickResetBtnHandler(ev){
        // this.camera.setRotationFromEuler(new THREE.Euler( 0, 0, 0, 'XYZ' ));
        // this.camera.updateProjectionMatrix();
        let controls = this.controls;
        if(this.cameraLerp.defaultState){
            let lerState = this.cameraLerp.defaultState;
            this.cameraLerp.setPosition(lerState.eyepos, lerState.target, lerState.zoom, lerState.quaternion);
        }
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

        if(this.目标网片A){
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
        let typeSelectElem = null;
        let extraUIs_arr = [];

        let canvasWidth = 0;
        let canvasHeight = 0;
        if (this.rootRef.current != null) {
            canvasWidth = this.rootRef.current.clientWidth;
            canvasHeight = this.rootRef.current.clientHeight;
        }
        let canvasWidth_half = parseInt(canvasWidth * 0.5);
        let canvasHeight_half = parseInt(canvasHeight * 0.5);
        
        if(!this.state.processTypeSelected){
            let cancelBtn = null;
            if(this.state.processType){
                cancelBtn = <button onClick={this.clickCancleReSelectProcessTypeHandler} className='btn btn-warning'>取消变更</button>
            }
            typeSelectElem = 
            <div className='w-100 h-100 position-absolute' style={{left:'0px',top:'0px'}}>
                <div className=' d-flex flex-column position-absolute border shadow card' style={{left:'50%',top:'50%',transform:'translate(-50%,-50%)'}}>
                    <div className='card-body'>
                        <h5 className='card-title'>请选择施工步骤</h5>
                        <div className='d-flex flex-column'>
                            <button ptype={E施工步骤.组装} onClick={this.clickProcessTypeHandler} className='btn btn-primary mb-3'>1、框架组装</button>
                            <button ptype={E施工步骤.运输} onClick={this.clickProcessTypeHandler} className='btn btn-primary mb-3'>2、场内运输</button>
                            <button ptype={E施工步骤.安装} onClick={this.clickProcessTypeHandler} className='btn btn-primary mb-3'>3、现场安装</button>
                            {cancelBtn}
                        </div>
                    </div>
                </div>
            </div>
        }
        else{
            let typeName = this.state.processType;
            let netName = '请选择索网';
            let typeBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickReSelectProcessTypeHandler}>{typeName}</button>
            let rangeBtn = null;
            if(typeName == E施工步骤.组装){
                if(!this.state.rangeSelected){
                    setTimeout(() => {
                        popRangeSelector(this.范围选择Callback);
                    }, 100);
                }
                let rangeInfo = '请选范围';
                let rangeData = this.state.range;
                if(rangeData){
                    rangeInfo = `${rangeData.全局名称}:列${rangeData.起始列号}->列${rangeData.结束列号}`;
                }
                rangeBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickReSelectRangeHandler}>{rangeInfo}</button>
            }
            topBtnsDiv = <div className="d-flex flex-column position-absolute" style={{ height: '70px', top: '5px', left: '5px' }}>
                {typeBtn}
                {rangeBtn}
                {/* <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickResetBtnHandler}>重置视角</button> */}
            </div>

            // extraUIs_arr.push(
            //     <div key='nag_middleBtns' className="d-flex flex-nowrap position-absolute " style={{ left: canvasWidth_half + 'px', top: (canvasHeight - 50) + 'px', transform: 'translate(-50%,-100%)' }}>
            //         {/* <button onClick={this.clickExitButtonHandler} className="btn btn-primary flex-grow-0 flex-shrink=0 mr-2" style={{minWidth:'150px'}} >{btnName}</button> */}
            //     </div>
            // );

            if(this.目标网片){
                this.state.now步骤.render(extraUIs_arr,canvasWidth,canvasHeight);
            }
        }

        var needCtlPath = true;
        var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
        return <div ref={this.rootRef} className={useStyleClass.class} style={useStyleClass.style} ctl-fullpath={needCtlPath ? this.props.fullPath : null}>
            <canvas ref={this.canvasRef} className='w-100 h-100 d-block' />
            <div ref={this.labelsRef} className='three-label-container' style={{ left: 0, top: 0, zIndex: 10 }} />
            <div ref={this.btnsRef} className='three-ui-container' style={{ left: 0, top: 0, zIndex: 20 }} />
            {typeSelectElem}
            <div className='position-absolute' style={{ left: 0, top: 0, zIndex: 30 }}>
                {topBtnsDiv}
                {extraUIs_arr}
            </div>
            {nativeUIElem}
            {fetchBarElem}
        </div>
    }
}

function ERPC_ThreeDApp_KuangJia_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
    };
}

function ERPC_ThreeDApp_KuangJia_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}
var VisibleERPC_ThreeDApp_KuangJia = null;

function InitThreeDApp_KuangJia() {
    VisibleERPC_ThreeDApp_KuangJia = ReactRedux.connect(ERPC_ThreeDApp_KuangJia_mapstatetoprops, ERPC_ThreeDApp_KuangJia_dispatchtorprops)(ERPC_ThreeDApp_KuangJia);
}

gNeedCallOnErpControlInit_arr.push(InitThreeDApp_KuangJia);

function popRangeSelector(completeCallBack) {
    var popPage_1_callback = (popPage_1exportParam) => {
        setTimeout(() => {
            completeCallBack(popPage_1exportParam);
        }, 50);
    };
    var popPage_1entryParam = {
        completeCallBack: popPage_1_callback
    };
    gDataCache.set('M_Page_RangeSelentryParam', popPage_1entryParam);
    init_M_Page_ComSel();
    popPersistentPage('M_Page_RangeSel', ()=>{return <VisibleCM_Page_RangeSel key='M_Page_RangeSel' />});
}

// M_Page_RangeSel
function init_M_Page_RangeSel(state, parentPageID) {
    var needSetState = { parentPageID: parentPageID };
    var fullParentPath = 'M_Page_RangeSel';
    var hadState = state != null;
    if (!hadState) { state = store.getState(); }
    setTimeout(() => { M_Page_RangeSel_onLoad(); }, 50);
    needSetState['M_Page_RangeSel.parentPageID'] = parentPageID;
    needSetState['M_Page_RangeSel._magicobj'] = {};
    if (hadState) {
        state = setManyStateByPath(state, '', needSetState);
    } else {
        store.dispatch(makeAction_setManyStateByPath(needSetState, ''));
    }
    return state;
}
function M_Page_RangeSel_onLoad() {
}
function M_iframe_RangeSel_onReceiveMsg(msgtype, data, fullPath) {
    var state = store.getState();
    if (msgtype == '列范围选择') {
        closePage2('M_Page_RangeSel', state);
        var closePage_0_callback = getPageEntryParam('M_Page_RangeSel', 'completeCallBack');
        if (closePage_0_callback) { setTimeout(() => { closePage_0_callback(data); }, 20); }
    }
}

class CM_Page_RangeSel extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 'M_Page_RangeSel';
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
            <h3 className='flex-grow-1 flex-shrink-1'>选择目标框架范围</h3>
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
                <VisibleERPC_IFrame className='flex-grow-1 flex-shrink-1 d-flex flex-column ' proj='zwgjy' flowCode='306' pageType='auto' onMessageFun={M_iframe_RangeSel_onReceiveMsg} id='M_iframe_RangeSel' parentPath='M_Page_RangeSel' />
            </div>);
        return retElem;
    }

}
function CM_Page_RangeSel_mapstatetoprops(state, ownprops) {
    var retProps = {};
    var pageState = getStateByPath(state, 'M_Page_RangeSel', {});
    retProps['parentPageID'] = pageState.parentPageID;
    return retProps;
}
function CM_Page_RangeSel_disptchtoprops(dispatch, ownprops) {
    var retDispath = {};
    return retDispath;
}
const VisibleCM_Page_RangeSel = ReactRedux.connect(CM_Page_RangeSel_mapstatetoprops, CM_Page_RangeSel_disptchtoprops)(CM_Page_RangeSel);
