class ERPC_Chart extends React.PureComponent {
    constructor(props) {
        super();
        autoBind(this);

        ERPControlBase(this);
        this.state = this.initState;
        this.canvasRef = null;
        this.myChart = null;
    }

    cusComponentWillUnmount() {
        this.canvasRef = null;
        if(this.myChart){
            this.myChart.destroy();
        }
    }

    canvasCreated(canvasRef) {
        this.canvasRef = canvasRef;

        var myCtx = canvasRef.getContext('2d');
        //ctx.fillText('Hello World',100,100);
        //return;
        var myChart = new Chart(myCtx, {
            type: this.props.type,
            data: {
                labels: ['人力成本'],
                datasets: [{
                    label: '上海海勃',
                    steppedLine:true,
                    data: [980563],
                    backgroundColor: 'green',
                    borderColor: 'green',
                    borderWidth: 1,
                },
                {
                    label: '江苏海勃',
                    data:[351267],
                    backgroundColor: 'red',
                    borderColor: 'red',
                    borderWidth: 1,
                }]
            },
            options: {
                maintainAspectRatio:false,
                responsive: true,
				title: {
					display: true,
					text: '哈哈'
                },
                tooltips: {
					mode: 'index',
					intersect: false,
				},
                hover: {
					mode: 'nearest',
					intersect: true
                },
            }
        });
        /*
                        animation: {
                    duration: 1,
                    onComplete: function () {
                        var chartInstance = this.chart;
                        var ctx = chartInstance.ctx;
                        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        ctx.fillStyle="#000000";
            
                        var datasets = this.data.datasets;
                        //setTimeout(() => {
                            datasets.forEach(function (dataset, i) {
                                var meta = chartInstance.controller.getDatasetMeta(i);
                                meta.data.forEach(function (bar, index) {
                                    var data = dataset.data[index];                            
                                    ctx.fillText(data,Math.floor(bar._model.x), Math.floor(bar._model.y) - 5);
                                });
                            });
                        //}, 1000);
                        
                    }
                }
        */
    }

    render() {
        if (this.props.visible == false) {
            return null;
        }
        return <div className={this.props.className} style={this.props.style}>
            <canvas ref={this.canvasCreated} ></canvas>
        </div>
    }
}

function ERPC_Chart_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }
    var selectorid = propProfile.fullPath + 'optionsData';
    var optionsDataSelector = ERPC_selector_map[selectorid];
    if (optionsDataSelector == null) {
        optionsDataSelector = Reselect.createSelector(selectERPC_DropDown_options, selectERPC_TaskSelector_textName, selectERPC_TaskSelector_valueName, selectERPC_TaskSelector_groupAttrName, selectERPC_DropDown_textType, formatERPC_DropDown_options);
        ERPC_selector_map[selectorid] = optionsDataSelector;
    }

    var useValue = ctlState.value;
    var selectOpt = ctlState.selectOpt;
    if (!useValue) {
        selectOpt = null;
    }

    return {
        value: useValue,
        text: ctlState.text,
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        optionsData: optionsDataSelector(state, ownprops),
        visible: ctlState.visible,
        invalidInfo: invalidInfo,
        selectOpt: selectOpt,
        plainTextMode: rowState != null && rowState.editing != true && propProfile.rowkey != 'new',
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
    };
}

function ERPC_Chart_dispatchtoprops(dispatch, ownprops) {
    return {
    };
}

var VisibleERPC_TaskSelector = null;
gNeedCallOnErpControlInit_arr.push(()=>{
    VisibleERPC_TaskSelector = ReactRedux.connect(ERPC_TaskSelector_mapstatetoprops, ERPC_TaskSelector_dispatchtoprops)(ERPC_TaskSelector);
});

/*
{
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
        label: '# of Votes',
        steppedLine:true,
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        fill: false,
    },
    {
        label: 'b',
        data: [5,6,8,9],
        backgroundColor: 'red',
        borderColor: 'red',
        borderWidth: 1,
        fill: false,
    }]
}
*/