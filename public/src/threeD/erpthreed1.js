THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 );
var threeDServerUrl='/erppage/server/threeD/threeD_s1';

class THREE_UIItem{
    constructor(docElem, worldPosition){
        this.docElem = docElem;
        this.worldPos = worldPosition;
    }
}

class THREE_LabelItem extends THREE_UIItem{
    constructor(docElem, worldPosition){
        super(docElem, worldPosition);
    }
}

class THREE_ButtonItem extends THREE_UIItem{
    constructor(docElem, worldPosition){
        super(docElem, worldPosition);
    }
}

function makeInstance(geometry, color, coord){
    var mat = new THREE.MeshPhongMaterial({color: color,side:THREE.DoubleSide});
    var rlt = new THREE.Mesh(geometry, mat);
    rlt.position.copy(coord);
    return rlt;
}

class ERPC_ThreeDApp extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.initState = {
            fetching : false,
            fetch_title : "",
            fetch_percent : 0,
            fetch_error : "",
            drawingCode : 0,
            showingModelPath : null,
            showing图元代码 : null,
        }
        this.state = this.initState;
        this.canvasRef = React.createRef();
        this.rootRef = React.createRef();
        this.labelsRef = React.createRef();
        this.btnsRef = React.createRef();
        this.drawingDataDirted = true;

        this.cubes_arr = [];
        this.uiItem_arr = [];
        this.图元Btns_arr = [];
        this.focusUIElem = null;
        this.focus图元Btn = null;
        this.cameraInfo_arr = [];
    }

    saveCameraView(){
        let nowPos = new THREE.Vector3();
        let nowTarget = new THREE.Vector3();
        nowPos.copy(this.camera.position);
        nowTarget.copy(this.controls.target);
        this.cameraInfo_arr.push({pos:nowPos,target:nowTarget});
    }

    loadCameraView(){
        if(this.cameraInfo_arr.length > 0){
            let item = this.cameraInfo_arr.pop();
            this.camera.position.copy(item.pos);
            this.controls.target.copy(item.target);
        }
    }

    cusComponentWillmount() {
        this.startAPP();
        let drawingFormPath = this.props.fullParentPath + '.DrawingSelectorForm';
        
    }

    cusComponentWillUnmount(){
    }

    clickKeyPointButtonHandler(ev){
        let uiItem = null;
        let elem = ev.target;
        while(uiItem == null && elem != null){
            uiItem = elem.uiItem;
            elem = elem.parentElement;
        }
        const controls = this.controls;
        if(this.focus图元Btn == uiItem){
            this.focus图元Btn = null;
            // controls.target.copy(this.originControlsTarget);
            this.loadCameraView();
            controls.enablePan = true;
        }
        else{
            this.focus图元Btn = uiItem;
            console.log(uiItem);
            this.saveCameraView();
            // this.originControlsTarget.copy(controls.target);
            controls.target.copy(uiItem.worldPos);
            controls.enablePan = false;
        }
        controls.update();
    }

    initApp(){
        const canvas = this.canvasRef.current;
        const renderer = new THREE.WebGLRenderer({canvas});
        this.renderer = renderer;

        const fov = 75;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const near = 0.1;
        const far = 500;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera = camera;
    
        camera.position.set(0,0,100);
    
        const scene = new THREE.Scene();
        this.scene = scene;
        scene.background = new THREE.Color(0x9DA3AA);

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
        this.dirLight = light;
        light.position.set(-1,2,4);
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
    }

    图元Changed(){
        if(this.state.drawing == null){
            return;
        }
        if(this.state.showing图元代码 != this.state.drawing.图元代码){
            this.setState({
                showing图元代码:this.state.drawing.图元代码,
                fetching:true,
                fetch_percent:0,
                fetch_title:'加载图元数据',
                fetch_error:'',
            });
            const self = this;
            nativeFetchJson(false, threeDServerUrl, {bundle:{图元代码:this.state.drawing.图元代码},action:'pulldata_图元明细数据'}).then(json=>{
                if(json.err != null){
                    self.setState({
                        fetch_error:JSON.stringify(`出错了:${json.info}`),
                    });
                    return;
                }
                this.setState({
                    fetch_percent:0.5,
                    fetch_title:'分析图元数据',
                });
                if(self.图元Btns_arr != null) {
                    self.图元Btns_arr.forEach(tElem=>{
                        self.btnsRef.current.removeChild(tElem.docElem);
                    });
                }
                let 全局_arr = [];
                let 全局_dic = {};
                self.图元Btns_arr = [];
                for(let si in json.data){
                    let dr = json.data[si];
                    if(全局_dic[dr.全局名称] == null){
                        全局_dic[dr.全局名称] = 1;
                        全局_arr.push({name:dr.全局名称,code:dr.全局代码});
                    }
                    let worldPos = new THREE.Vector3();
                    let t_arr = dr.放置点.split(',');
                    let X = parseFloat(t_arr[0]) * 0.001;
                    let Y = parseFloat(t_arr[1]) * 0.001;
                    let Z = parseFloat(t_arr[2]) * 0.001;
                    worldPos.set(X,-Y,Z);
                    let btnElem = document.createElement('button');
                    btnElem.className = 'btn btn-primary';
                    btnElem.onclick = self.clickKeyPointButtonHandler;
                    btnElem.innerHTML = "<i class=\"fa fa-star\" />";
                    let newBtnItem = new THREE_ButtonItem(btnElem,worldPos);
                    btnElem.uiItem = newBtnItem;
                    self.btnsRef.current.appendChild(btnElem);
                    self.图元Btns_arr.push(newBtnItem);
                }
                console.log(全局_arr);
                this.setState({
                    fetching:false,
                    全局_arr:全局_arr,
                });
            });
        }
    }

    modelChanged(){
        if(this.state.drawing == null){
            return;
        }
        if(this.state.showingModelPath != this.state.drawing.modelPath){
            this.setState({
                showingModelPath:this.state.drawing.modelPath,
                fetching:true,
                fetch_percent:0,
                fetch_title:'加载图纸模型',
                fetch_error:'',
            });
            
            const loader = new Rhino3dmLoader();
            loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/' );
            const self = this;
            loader.load(window.location.origin + this.state.drawing.modelPath, function ( object ) {
                self.setState({
                    fetch_title:'解析图纸模型',
                });
                try{
                    const scene = self.scene;
                    const camera = self.camera;
                    const controls = self.controls;

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

                    self.keyMesh = object;

                    object.userData['texts'].forEach(textGeo=>{
                        let divElem = document.createElement('div');
                        divElem.innerText = textGeo.text;
                        divElem.className = 'badge badge-info';
                        let worldPos = new THREE.Vector3();
                        worldPos.fromArray(textGeo.point,0);
                        // let helper = new THREE.AxesHelper(5);
                        // helper.position.copy(worldPos);
                        // scene.add(helper);

                        let newLabelItem = new THREE_LabelItem(divElem, worldPos);
                        // self.labelsRef.current.appendChild(divElem);
                        // self.uiItem_arr.push(newLabelItem);

                        // let btnElem = document.createElement('button');
                        // btnElem.className = 'btn btn-primary';
                        // btnElem.onclick = self.clickKeyPointButtonHandler;
                        // btnElem.innerHTML = "<i class=\"fa fa-star\" />";
                        // let newBtnItem = new THREE_ButtonItem(btnElem,worldPos);
                        // btnElem.uiItem = newBtnItem;
                        // self.btnsRef.current.appendChild(btnElem);
                        // self.图元Btns_arr.push(newBtnItem);
                    });
                    self.setState({
                        fetching: false,
                    });
                }catch(eo){
                    self.setState({
                        fetch_error:JSON.stringify(`出错了:${eo.message}`),
                    });
                }
            },(ev)=>{
                self.setState({
                    fetch_percent:(ev.loaded / ev.total) * 0.8,
                });
            },(err)=>{
                self.setState({
                    fetch_error:JSON.stringify(`出错了:${err.target.statusText}`),
                });
                console.error(err);
            } );
        }
    }

    startAPP(){
        if(this.canvasRef.current == null){
            setTimeout(this.startAPP,100);
            return;
        }
        if(!this.state.inited){
            this.initApp();
            this.setState({
                inited:true,
            });
        }
        //console.log(this.canvasRef.current);
        requestAnimationFrame(this.renderFrame);
    }

    pauseAPP(){

    }

    clickDrawingBtnHandler(ev){
        this.setState({drawing:null});
    }

    drawingChangedHandler(drawingName, drawingCode, modelPath, 图元代码){
        console.log(`name:${drawingName},code:${drawingCode},modelPath:${modelPath},图元代码:${图元代码}`);
        this.setState({drawing:{name:drawingName,code:drawingCode,modelPath:modelPath,图元代码:图元代码}});
    }

    resizeRendererToDisplaySize(){
        const canvas = this.canvasRef.current;
        const canvasParent = this.rootRef.current;
        const pixelRatio = 1;
        const width = canvasParent.clientWidth * pixelRatio | 0;
        const height = canvasParent.clientHeight * pixelRatio | 0;
        const needResize = canvas.width != width || canvas.height != height
        if(needResize){
            this.renderer.setSize(width, height, false);
        }
        return needResize;
    }

    renderFrame(time){
        time *= 0.001;
        const camera = this.camera;
        const scene = this.scene;
        const canvas = this.canvasRef.current;
        const renderer = this.renderer;
        if(this.resizeRendererToDisplaySize()){
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        this.controls.update();
        this.dirLight.position.copy(camera.position);
        this.dirLight.target.position.copy(this.controls.target);
        let cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        // this.cubes_arr.forEach((cube,i)=>{
        //     var speed = 1 + i * 0.5;
        //     cube.rotation.x = time * speed;
        //     cube.rotation.y = time * speed;
        // });

        let tempV = new THREE.Vector3();
        this.uiItem_arr.forEach(item=>{
            tempV.copy(item.worldPos);
            // item.target.getWorldPosition(tempV);
            tempV.project(camera);
            const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            item.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
            item.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
        });

        this.图元Btns_arr.forEach(keyBtn=>{
            if(this.focus图元Btn != null){
                if(keyBtn != this.focus图元Btn){
                    keyBtn.docElem.style.display = 'none';
                    return;
                }
            }
            else{
                let theVec = new THREE.Vector3();
                theVec.subVectors(keyBtn.worldPos,camera.position);
                let dot = theVec.dot(cameraDir);
                let dis = keyBtn.worldPos.distanceTo(camera.position);
                if(dot < 0 || dis > 100){
                    keyBtn.docElem.style.display = 'none';
                    return;
                }
            }
            tempV.copy(keyBtn.worldPos);
            tempV.project(camera);
            const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
            const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

            keyBtn.docElem.style.display = '';
            keyBtn.docElem.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
            keyBtn.docElem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
        });

        renderer.render(scene,camera);
    
        requestAnimationFrame(this.renderFrame);
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        const self = this;
        let fetchBarElem = null;
        if(this.state.fetching){
            let percentValue = Math.fround(this.state.fetch_percent * 100);
            fetchBarElem = <div className='progressContainer' style={{zIndex:2000}}>
                <div className='mask'></div>
                <div className='progressDiv'>
                    <h5><span className="badge badge-light flex-grow-0 flex-shrink-0 p-2 shadow" >{this.state.fetch_title}</span></h5>
                    <div className="progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{width: percentValue + '%'}}>{percentValue}%</div>
                    </div>
                    {this.state.fetch_error && this.state.fetch_error.length > 0 ? <div className='flex-grow-0 flex-shrink-0 mt-2 text-danger bg-light'>{this.state.fetch_error}</div> : null}
                </div>
            </div>
        }
        var rootDivClassName = 'erpc_threeD d-block hidenOverflow position-relative ' + (this.props.className == null ? '' : this.props.className);

        let topBtnsDiv = null;
        let 全局BtnsDiv = null;
        let nativeUIElem = null;
        if(this.state.drawing == null){
            // 选择全局图
            nativeUIElem = <div className='w-100 h-100 position-absolute' style={{left:0,top:0,zIndex:500}}>
                <VisibleCDrawingSelectorForm 项目代码={this.props.projectCode} id='DrawingSelectorForm' parentPath={this.props.fullParentPath} title='选择图纸' pagebreak={false} selectMode='single' keyColumn='项目图纸定义代码' onSelectedChanged={this.drawingChangedHandler} />
            </div>
            if(this.drawingDataDirted){
                this.drawingDataDirted = false;
                setTimeout(()=>{
                    pull_DrawingSelectorForm(null, self.props.fullParentPath, true, this.props.projectCode);
                },10);
            }
        }
        else{
            let drawingBtn = <button className="btn btn-light flex-grow-0 flex-shrink=0" onClick={this.clickDrawingBtnHandler}><i className="fa fa-map" />{this.state.drawing.name}</button>
            topBtnsDiv = <div className="d-flex position-absolute" style={{height: '30px',top: '5px', left:'5px'}}>
                {drawingBtn}
            </div>
            if(this.state.showingModelPath != this.state.drawing.modelPath){
                setTimeout(()=>{
                    self.modelChanged();
                }, 10);
            }
            else if(this.state.fetching == false){
                if(this.state.showing图元代码 != this.state.drawing.图元代码){
                    setTimeout(()=>{
                        self.图元Changed();
                    }, 10);
                }
            }
            if(this.state.全局_arr != null){
                全局BtnsDiv = <div className="d-flex flex-column position-absolute" style={{width: '50px',left: '100%', right: '100%', transform: 'translate(-50%, -50%)'}}>
                    {this.state.全局_arr.map(全局item=>{
                        <button key={全局item.code} className="btn btn-light flex-grow-0 flex-shrink=0" >{全局item.name}</button>
                    })}
                </div>
            }
        }

        var needCtlPath = true;
        var useStyleClass = this.getUseStyleClass(this.props.style, rootDivClassName);
        return <div ref={this.rootRef} className={useStyleClass.class} style={useStyleClass.style} ctl-fullpath={needCtlPath ? this.props.fullPath : null}>
            <canvas ref={this.canvasRef} className='w-100 h-100 d-block' />
            <div ref={this.labelsRef} className='three-label-container' style={{left:0,top:0,zIndex:10}} />
            <div ref={this.btnsRef} className='three-ui-container' style={{left:0,top:0,zIndex:20}} />
            <div className='position-absolute' style={{left:0,top:0,zIndex:30}}>
                {topBtnsDiv}
                {全局BtnsDiv}
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

    return {
        visible: ctlState.visible != null ? ctlState.visible : (ownprops.definvisible ? false : true),
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        dynamicStyle: ctlState.style,
        dynamicClass: ctlState.class,
        projectCode: ownprops.projectCode
    };
}

function ERPC_ThreeDApp_dispatchtorprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_ThreeDApp = null;

function InitThreedApp(){
    VisibleERPC_ThreeDApp = ReactRedux.connect(ERPC_ThreeDApp_mapstatetoprops, ERPC_ThreeDApp_dispatchtorprops)(ERPC_ThreeDApp);
}

gNeedCallOnErpControlInit_arr.push(InitThreedApp);




// controls
// ui

const DrawingSelectorFormheadstyle0={"width":"33.3%","maxWidth":"33.3%","minWidth":"33.3%","whiteSpace":"nowrap","overflow":"hidden"};
const DrawingSelectorFormtdstyle0={"width":"33.3%","maxWidth":"33.3%","minWidth":"33.3%","verticalAlign":"middle"};
const DrawingSelectorFormheadstyle1={"width":"66.7%","maxWidth":"66.7%","minWidth":"66.7%","whiteSpace":"nowrap","overflow":"hidden"};
const DrawingSelectorFormtdstyle1={"width":"66.7%","maxWidth":"66.7%","minWidth":"66.7%","verticalAlign":"middle"};
const DrawingSelectorForm_tableStyle={"marginTop":"-50px"};
const DrawingSelectorForm_headtableStyle={"marginBottom":"0px"};

function fresh_DrawingSelectorForm(retState,records_arr,oldValue,statePath,visited,delayActs,rowKeyInfo_map){
	var DrawingSelectorForm_path=getParentPathByKey(statePath,'DrawingSelectorForm');
	var DrawingSelectorForm_state=getStateByPath(retState,DrawingSelectorForm_path,{});
	var needSetState={};
	if(oldValue != null){
		var newRowCount = records_arr.length;
		oldValue.forEach((x,i)=>{
			var rowkey=x.项目图纸定义代码;
			if(DrawingSelectorForm_state.hasOwnProperty('row_' + rowkey)){
				needSetState['row_' + rowkey + '._isdirty'] = true;
			}
		});
	}
	var newKey_map={};
	records_arr.forEach((rcd,index)=>{
		var rowkey=rcd.项目图纸定义代码;
		rcd._key = rowkey;
		newKey_map[rowkey]=rcd;
	});
	gDataCache.set(DrawingSelectorForm_path + ".KeyToRcd_map",newKey_map);
	needSetState.selectedValue = GetFormSelectedProfile(DrawingSelectorForm_state,'项目图纸定义代码').key;
	retState=setManyStateByPath(retState,DrawingSelectorForm_path,needSetState);
	bind_DrawingSelectorForm(retState,null,null,statePath);
	var scrollSetting = gDataCache.get(DrawingSelectorForm_path + 'scrollsetting');
	if(scrollSetting){setTimeout(() => {
	var scrollerElem=document.getElementById(DrawingSelectorForm_path+'scroller');
	if(scrollerElem){scrollerElem.scrollTop = scrollSetting.top;scrollerElem.scrollLeft = scrollSetting.left;}
	},200);}
}
function bind_DrawingSelectorForm(retState,newIndex,oldIndex,statePath){
	var DrawingSelectorForm_path=getParentPathByKey(statePath,'DrawingSelectorForm');
	var formState=getStateByPath(retState,DrawingSelectorForm_path,{});
	var records_arr=formState.records_arr;
	var needSetState={};
	var bundle={};
	var needActiveBindPage=true;
	needSetState['invalidbundle']=false;
	retState=setManyStateByPath(retState,DrawingSelectorForm_path,needSetState);
	return bind_DrawingSelectorFormPage(retState,DrawingSelectorForm_path);
}
function DrawingSelectorForm_records_arr_changed(state,newValue,oldValue,path,visited,delayActs,rowKeyInfo_map){
	var needSetState={};
	fresh_DrawingSelectorForm(state,newValue,oldValue,path,visited,delayActs,rowKeyInfo_map)
	return setManyStateByPath(state,'',needSetState);
}
function pull_DrawingSelectorForm(retState,fullParentPath,holdScroll, 项目代码){
	var hadStateParam=retState!=null;
	var rowKeyInfo_map=getRowKeyMapFromPath(fullParentPath);
    var state=hadStateParam ? retState : store.getState();
	var scrollerElem=document.getElementById(fullParentPath+'.DrawingSelectorFormscroller');
	if(scrollerElem){gDataCache.set(fullParentPath + '.DrawingSelectorFormscrollsetting',holdScroll ? {left:scrollerElem.scrollLeft,top:scrollerElem.scrollTop} : null);}
	var bundle = {
        项目代码:项目代码
    };
	setTimeout(() => {
		store.dispatch(fetchJsonPost(threeDServerUrl, {bundle:bundle,action:'pulldata_DrawingSelectorForm',}, makeFTD_Prop(fullParentPath,'DrawingSelectorForm','records_arr',false), EFetchKey.FetchPropValue));
	}, 50);
	return state;
}

function bind_DrawingSelectorFormPage(retState,DrawingSelectorForm_path){
	var formState=getStateByPath(retState,DrawingSelectorForm_path,{});
	var records_arr=formState.records_arr;
	var needSetState={};
	var startRowIndex=0;
	var endRowIndex=records_arr.length-1;
	var freshrows_arr = [];
	for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
		var nowRecord = records_arr[rowIndex];
		if(nowRecord == null){break;}
		var rowkey = GetFromatRowKey(nowRecord.项目图纸定义代码);
		var rowstate=getStateByPath(formState,"row_" + rowkey,{});
		if(rowstate._isdirty != false){
			freshrows_arr.push(rowkey);
			needSetState["row_" + rowkey + "._isdirty"] = false;
			needSetState['row_'+rowkey+'.M_Label_42.text']=nowRecord['加工图纸种类'];
			needSetState['row_'+rowkey+'.M_Label_53.text']=nowRecord['图纸名称'];
		}
	}
	needSetState.startRowIndex=startRowIndex;
	needSetState.endRowIndex=endRowIndex;
	return setManyStateByPath(retState,DrawingSelectorForm_path,needSetState);
}

function DrawingSelectorForm_selectedValue_changed(state,newValue,oldValue,path,visited,delayActs,rowKeyInfo_map){
	var formState = getStateByPath(state,this.props.fullPath)
    var selectedProfile = GetFormSelectedProfile(formState,'项目图纸定义代码');
    // console.log(selectedProfile.record);
    if(typeof this.props.onSelectedChanged == 'function'){
        this.props.onSelectedChanged(selectedProfile.record['图纸名称'],selectedProfile.record['项目图纸定义代码'],selectedProfile.record['模型文件路径'],selectedProfile.record['可视模型图元代码']);
    }
}

class CDrawingSelectorForm extends React.PureComponent{
	constructor(props){
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
        if(appStateChangedAct_map[fullPath + '.records_arr'] == null){
            appStateChangedAct_map[fullPath + '.records_arr'] = this.DrawingSelectorForm_records_arr_changed;
            appStateChangedAct_map[fullPath + '.pageIndex'] = this.bind_DrawingSelectorForm;
            appStateChangedAct_map[fullPath + '.selectedValue'] = this.DrawingSelectorForm_selectedValue_changed;
        }
    }

    componentWillUnmount() {
        let fullPath = this.props.fullPath;
        if(appStateChangedAct_map[fullPath + '.records_arr'] != null){
            appStateChangedAct_map[fullPath + '.records_arr'] = null;
            appStateChangedAct_map[fullPath + '.pageIndex'] = null;
            appStateChangedAct_map[fullPath + '.selectedValue'] = null;
            appStateChangedAct_map[fullPath + '.records_arr'] = null;
        }
    }

	render(){
		var retElem=null;
		if(this.props.visible == false){return null;}
		retElem = this.renderContent();
		return retElem;
	}
	renderContent(){
		var retElem=null;
		var navElem=null;
		var bHadBottom=false;
		if(this.props.fetching){
			retElem = renderFetcingTipDiv();
		}
		else{
			if(this.props.fetchingErr){
				retElem = renderFetcingErrDiv(this.props.fetchingErr.info);
			}
			else{
				if(this.props.invalidbundle){
					retElem = renderInvalidBundleDiv();
				}
				else{
					bHadBottom = true;
					if(!this.canInsert && (this.props.records_arr == null || this.props.records_arr.length == 0)){
						retElem = <div className='m-auto'>没有查询到数据</div>;
					}
					else{
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
			<div ref={this.rootRef} className='d-flex erp-form flexHelper flex-column centerelem w-100 position-absolute bg-light' style={{maxHeight:'80%'}} >
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
	clickFreshHandler(ev){
		pull_DrawingSelectorForm(null, this.props.fullParentPath, true, this.props.项目代码);
	}
	clickRowHandler(ev){
		var rowkey = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target,'DrawingSelectorForm_rowkey'));
		var rowIndex = !isNaN(ev) ? ev : GetFromatRowKey(getAttributeByNode(ev.target,'DrawingSelectorForm_rowindex'));
		var state = store.getState();
		var formState = getStateByPath(state, this.props.fullPath,{});
		var keyvalue = rowkey;
		var nowRowKey = formState.selectedValue;
		if(nowRowKey == rowkey){
			var selectedProfile = GetFormSelectedProfile(formState,'项目图纸定义代码');
                this.DrawingSelectorForm_selectedValue_changed(state,this.props.fullPath,selectedProfile.record,selectedProfile.index,selectedProfile.key);
				return;
			}
		var needSetState={
			selectedValue:keyvalue,
			selectedRowIndex:rowIndex,
		}
		store.dispatch(makeAction_setManyStateByPath(needSetState, this.props.fullPath));
	}

}

function CDrawingSelectorForm_mapstatetoprops(state,ownprops){
	var retProps={};
	var propProfile=getControlPropProfile(ownprops, state);
	var ctlState=propProfile.ctlState;
	retProps.visible=ctlState.visible == null ? true : ctlState.visible == true;
	retProps.fetching=ctlState.fetching;
	retProps.fetchingErr=ctlState.fetchingErr;
	retProps.records_arr=ctlState.records_arr;
	retProps.recordIndex=ctlState.recordIndex;
	retProps.nowRecord=ctlState.nowRecord;
	retProps.invalidbundle=ctlState.invalidbundle;
	retProps.loaded=ctlState.records_arr != null;
	retProps.startRowIndex=ctlState.startRowIndex;
	retProps.endRowIndex=ctlState.endRowIndex;
	retProps.pageCount=ctlState.pageCount;
	retProps.pageIndex=ctlState.pageIndex;
	retProps.rowPerPage=ctlState.rowPerPage;
	retProps.bindedRow=ctlState.bindedRow;
	retProps.selectedValue=ctlState.selectedValue == null ? null : ctlState.selectedValue;
	retProps.fullPath=propProfile.fullPath;
	retProps.fullParentPath=propProfile.fullParentPath;
	retProps.title=ctlState.title == null ? ownprops.title : ctlState.title;
    retProps.selectMode='single';
    retProps.项目代码 = ctlState.项目代码 == null ? ownprops.项目代码 : ctlState.项目代码;
	return retProps;
}
function CDrawingSelectorForm_disptchtoprops(dispatch,ownprops){
	var retDispath={};
	return retDispath;
}
const VisibleCDrawingSelectorForm = ReactRedux.connect(CDrawingSelectorForm_mapstatetoprops, CDrawingSelectorForm_disptchtoprops)(CDrawingSelectorForm);
class CDrawingSelectorForm_THead extends React.PureComponent{
	constructor(props){
		super(props);
	}
	render(){
		var retElem=null;
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
class CDrawingSelectorForm_TBody extends React.PureComponent{
	constructor(props){
		super(props);
	}
	render(){
		var retElem=null;
		var trElems_arr=[];
		var startRowIndex=this.props.startRowIndex;
		var endRowIndex=this.props.endRowIndex;
		var formProp=this.props.form.props;
		for (var rowIndex = startRowIndex; rowIndex <= endRowIndex; ++rowIndex) {
			var rowRecord = formProp.records_arr[rowIndex];
			if(rowRecord == null){break;}
			var rowkey = GetFromatRowKey(rowRecord.项目图纸定义代码);
			var selected = this.props.selectedValue == rowkey;
			trElems_arr.push(
				<VisibleERPC_GridSelectableRow key={rowkey}  onMouseDown={this.props.clickRowHandler} rowClickable={true} rowkey={rowkey} form={this.props.form} selected={selected} hideSelector={true} >
				<td className='indexTableHeader'>{rowIndex+1}</td>
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