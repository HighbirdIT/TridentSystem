var DesignerConfig={
    controlsForPC:[],
    controlsForMobile:[],
}

DesignerConfig.pushControl=(ctlConfig)=>{
    if(ctlConfig.forPC){
        DesignerConfig.controlsForPC.push(ctlConfig);
    }
    else{
        DesignerConfig.controlsForMobile.push(ctlConfig);
    }
}