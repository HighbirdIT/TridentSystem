const Orientation_H = '水平';
const Orientation_V = '垂直';
const Orientation_Options_arr = [Orientation_H,Orientation_V];

const DesignerConfig={
    controlConfig:{
        groups:[],
        configs_obj:{}
    }
}

DesignerConfig.registerControl=(function(ctlConfig,groupName){
    var ctlGroup = this.controlConfig.groups.find(item=>{
        return item.name == groupName;
    });
    if(ctlGroup == null){
        ctlGroup = {
            name:groupName,
            controlsForPC:[],
            controlsForMobile:[],
        };
        this.controlConfig.groups.push(ctlGroup);
    }

    if(ctlConfig.forPC){
        ctlGroup.controlsForPC.push(ctlConfig);
    }
    else{
        ctlGroup.controlsForMobile.push(ctlConfig);
    }
    this.controlConfig.configs_obj[ctlConfig.type] = ctlConfig;
}).bind(DesignerConfig);

DesignerConfig.findConfigByType=(function(ctlType){
    return this.controlConfig.configs_obj[ctlType];
}).bind(DesignerConfig);

const ValueType={
    String:'String',
    Int:'Int',
};

