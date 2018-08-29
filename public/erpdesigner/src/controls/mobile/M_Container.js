const M_ContainerDataAttrsSetting={
    groups_arr:[
        new CAttributeGroup('基本设置',[
            new CAttribute('补助方向','orientation',ValueType.String,true),
        ]),
    ],
};

class M_ContainerData extends ControlDataBase{
    constructor(initData, project) {
        super(
            extractPropsFromObj(initData, 
                [{name:'orientation',default:Orientation_H},
                ]), project);

        var self = this;
        autoBind(self);
        this.attrbuteGroups = M_ContainerDataAttrsSetting.groups_arr;
    }
}

class M_Container extends React.PureComponent {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className={'bg-info d-flex flex-grow-1 flex-shrink-1'}
            ></div>
        );
    }
}

DesignerConfig.registerControl(
    {
        forPC : false,
        label : 'Flex容器',
        type : 'M_Container',
        namePrefix : 'M_CT',
        dataclass:M_ContainerData,
    }, '布局');