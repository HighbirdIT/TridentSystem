'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//const gColorNames_arr = ['aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque','black','blanchedalmond','blue','blueviolet','brown','burlywood','cadetblue','chartreuse','chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue','darkcyan','darkgoldenrod','darkgray','darkgreen','darkgrey','darkkhaki','darkmagenta','darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen','darkslateblue','darkslategray','darkslategrey','darkturquoise','darkviolet','deeppink','deepskyblue','dimgray','dimgrey','dodgerblue','firebrick','floralwhite','forestgreen','fuchsia','gainsboro','ghostwhite','gold','goldenrod','gray','green','greenyellow','grey','honeydew','hotpink','indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen','lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray','lightgreen','lightgrey','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray','lightslategrey','lightsteelblue','lightyellow','lime','limegreen','linen','magenta','maroon','mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen','mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue','mintcream','mistyrose','moccasin','navajowhite','navy','oldlace','olive','olivedrab','orange','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred','papayawhip','peachpuff','peru','pink','plum','powderblue','purple','rebeccapurple','red','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell','sienna','silver','skyblue','slateblue','slategray','slategrey','snow','springgreen','steelblue','tan','teal','thistle','tomato','turquoise','violet','wheat','whitesmoke','yellow','yellowgreen'];
var gColorNames_arr = ['blue', 'red', 'yellow', 'cyan', 'green', 'gray', 'purple', 'pink', 'orange', 'deeppink', 'violet', 'indigo', 'blueviolet', 'midnightblue', 'royalblue', 'dodgerblue', 'deepskyblue', 'darkcyan', 'mediumspringgreen', 'lime', 'yellowgreen', 'darkkhaki', 'gold', 'darkgoldenrod', 'tan', 'chocolate', 'saddlebrown', 'orangered', 'darkred', 'black'];

function GenColor(cacheName, value, useRand) {
    var cacheData = gDataCache.get(cacheName);
    if (cacheData == null) {
        cacheData = {
            colorIndex: -1
        };
        gDataCache.set(cacheName, cacheData);
    }
    if (cacheData[value]) {
        return cacheData[value];
    }
    var colorValue;
    if (!useRand) {
        cacheData.colorIndex = (cacheData.colorIndex + 1) % gColorNames_arr.length;
        colorValue = gColorNames_arr[cacheData.colorIndex];
    } else {
        var randIndex = Math.floor(Math.random() * gColorNames_arr.length);
        var testCount = 0;
        colorValue = gColorNames_arr[randIndex];

        while (gDataCache[colorValue] && testCount < gColorNames_arr.length) {
            randIndex = (randIndex + 1) % gColorNames_arr.length;
            colorValue = gColorNames_arr[randIndex];
            ++testCount;
        }
        gDataCache[colorValue] = 1;
    }

    cacheData[value] = colorValue;
    return colorValue;
}

var ERPC_Chart = function (_React$PureComponent) {
    _inherits(ERPC_Chart, _React$PureComponent);

    function ERPC_Chart(props) {
        _classCallCheck(this, ERPC_Chart);

        var _this = _possibleConstructorReturn(this, (ERPC_Chart.__proto__ || Object.getPrototypeOf(ERPC_Chart)).call(this));

        autoBind(_this);

        ERPControlBase(_this);
        _this.state = _this.initState;
        _this.canvasRef = null;
        _this.myChart = null;
        _this.chartConfig = null;
        return _this;
    }

    _createClass(ERPC_Chart, [{
        key: 'cusComponentWillUnmount',
        value: function cusComponentWillUnmount() {
            this.canvasRef = null;
            if (this.myChart) {
                this.myChart.destroy();
                this.myChart = null;
            }
        }
    }, {
        key: 'canvasCreated',
        value: function canvasCreated(canvasRef) {
            this.canvasRef = canvasRef;

            if (canvasRef == null) {
                if (this.myChart) {
                    this.myChart.destroy();
                    this.myChart = null;
                }
                return;
            }
            var myCtx = canvasRef.getContext('2d');
            this.chartConfig = {
                type: this.props.type,
                data: this.props.data,
                options: {
                    maintainAspectRatio: false,
                    responsive: true,
                    title: {
                        display: this.props.title != null,
                        text: this.props.title
                    },
                    hover: {
                        mode: this.props.hovermode == null ? 'point' : this.props.hovermode,
                        intersect: this.props.intersect == null ? true : this.props.intersect
                    }
                },
                useData: this.props.data
            };
            //ctx.fillText('Hello World',100,100);
            //return;
            var myChart = new Chart(myCtx, this.chartConfig);
            this.myChart = myChart;
            /*
            legend: {
            onHover: function(event, legendItem) {
            console.log('onHover: ' + legendItem.text);
            },
            onLeave: function(event, legendItem) {
            console.log('onLeave: ' + legendItem.text);
            },
            onClick: function(event, legendItem) {
            console.log('onClick:' + legendItem.text);
            }
                    },
                    
            data: {
                    labels: ['上海海勃','江苏海勃'],
                    datasets: [{
                        steppedLine:true,
                        data: [100,300],
                        backgroundColor: ['green','Red'],
                    }]
                },
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
    }, {
        key: 'render',
        value: function render() {
            if (this.props.visible == false) {
                return null;
            }
            var charVisible = false;
            var contentElem = null;
            if (this.props.fetchingErr) {
                contentElem = renderFetcingErrDiv(this.props.fetchingErr.info);
            } else if (this.props.fetching) {
                contentElem = renderFetcingTipDiv();
            } else if (this.props.invalidInfo) {
                contentElem = renderInvalidBundleDiv();
            } else {
                charVisible = true;
                if (this.myChart) {
                    var chartConfig = this.chartConfig;
                    var isChanged = false;
                    if (chartConfig) {
                        if (chartConfig.options.title.text != this.props.title) {
                            isChanged = true;
                            chartConfig.options.title.text = this.props.title;
                            chartConfig.options.title.display = this.props.title != null;
                        }
                        if (chartConfig.useData != this.props.data) {
                            isChanged = true;
                            chartConfig.data = this.props.data;
                            chartConfig.useData = this.props.data;
                        }
                        if (isChanged) {
                            this.myChart.update();
                        }
                    }
                }
            }

            return React.createElement(
                'div',
                { className: this.props.className, style: this.props.style },
                contentElem,
                React.createElement('canvas', { ref: this.canvasCreated, className: charVisible ? 'visible' : 'invisible' })
            );
        }
    }]);

    return ERPC_Chart;
}(React.PureComponent);

var selectERPC_Chart_Records = function selectERPC_Chart_Records(state, ownprops) {
    if (ownprops.records_arr != null) {
        return ownprops.records_arr;
    }
    var propProfile = getControlPropProfile(ownprops, state);
    return propProfile.ctlState.records_arr;
};

function ERPC_Chart_mapstatetoprops(state, ownprops) {
    var propProfile = getControlPropProfile(ownprops, state);
    var ctlState = propProfile.ctlState;
    var rowState = propProfile.rowState;

    var invalidInfo = null;
    if (ctlState.invalidInfo != gPreconditionInvalidInfo && ctlState.invalidInfo != gCantNullInfo) {
        invalidInfo = ctlState.invalidInfo;
    }

    return {
        fetching: ctlState.fetching,
        fetchingErr: ctlState.fetchingErr,
        data: ctlState.data,
        visible: ctlState.visible == null ? ownprops.defVisible : ctlState.visible,
        invalidInfo: invalidInfo,
        fullParentPath: propProfile.fullParentPath,
        fullPath: propProfile.fullPath,
        title: ctlState.title == null ? ownprops.title : ctlState.title
    };
}

function ERPC_Chart_dispatchtoprops(dispatch, ownprops) {
    return {};
}

var VisibleERPC_Chart = null;
gNeedCallOnErpControlInit_arr.push(function () {
    VisibleERPC_Chart = ReactRedux.connect(ERPC_Chart_mapstatetoprops, ERPC_Chart_dispatchtoprops)(ERPC_Chart);
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