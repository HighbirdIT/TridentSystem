
/////日期函数dateadd
class C_SqlNode_Dateadd extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            datepartValue: this.props.nodedata.datepartValue
        }
    }

    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartValue = newdatepart;
        this.setState({
            datepartValue: newdatepart
        });
    }
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        //<DropDownControl options_arr={['DateAdd', 'Datediff']} value={nodeData.operator} itemChanged={this.LikeChangedHandler} style={this.ddcStyle} />
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <div f-canmove={1}>DATEADD</div>
                    <DropDownControl options_arr={Datepart_arr} value={nodeData.datepartValue} itemChanged={this.datepartChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType = 'tiny';
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

/////日期函数datediff
class C_SqlNode_Datediff extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            datepartValue: this.props.nodedata.datepartValue
        }
    }

    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartValue = newdatepart;
        this.setState({
            datepartValue: newdatepart
        });
    }
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <div f-canmove={1}>DATEDIFF</div>
                    <DropDownControl options_arr={Datepart_arr} value={nodeData.datepartValue} itemChanged={this.datepartChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType = 'tiny';
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

/////日期函数datename
class C_SqlNode_Datename extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            datepartValue: this.props.nodedata.datepartValue
        }
    }

    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartValue = newdatepart;
        this.setState({
            datepartValue: newdatepart
        });
    }
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <div f-canmove={1}>DATENAME</div>
                    <DropDownControl options_arr={Datepart_arr} value={nodeData.datepartValue} itemChanged={this.datepartChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType ='tiny' ;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

/////日期函数datepart
class C_SqlNode_Datepart extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            datepartValue: this.props.nodedata.datepartValue
        }
    }

    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartValue = newdatepart;
        this.setState({
            datepartValue: newdatepart
        });
    }
    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <div f-canmove={1}>DATEPART</div>
                    <DropDownControl options_arr={Datepart_arr} value={nodeData.datepartValue} itemChanged={this.datepartChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }
    render() {
        var nodeData = this.props.nodedata;
        var headType ='tiny' ;
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}
/////数学函数
class C_SqlNode_Mathfun extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
    }

    mathChangedHandler(mathType) {
        var nodeData = this.props.nodedata;
        nodeData.setMathType(mathType);
    }

    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <DropDownControl options_arr={Math_arr} value={nodeData.mathType} itemChanged={this.mathChangedHandler} style={this.ddcStyle} />
                </div> 
           
        );
    }

    render() {
        var nodeData = this.props.nodedata;
        var headType = 'tiny';
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}

/////日期函数整合
class C_SqlNode_DateCon extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        C_SqlNode_Base(this);
        this.state = {
            datepartType: this.props.nodedata.datepartType
        }
    }
    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartType = newdatepart;
        this.setState({
            datepartType: newdatepart
        });
    }
    datepartChangedHandler(newdatepart) {
        var nodeData = this.props.nodedata;
        nodeData.datepartType = newdatepart;
        this.setState({
            datepartType: newdatepart
        });
    }
    dateChangedHandler(mathType) {
        var nodeData = this.props.nodedata;
        nodeData.setDateType(dateType);
    }

    cusHeaderFuc() {
        if (this.ddcStyle == null) {
            this.ddcStyle = {
                width: '100px',
                margin: 'auto',
            }
            this.outDivStyle = {
                minWidth: '150px'
            };
        }
        
        var nodeData = this.props.nodedata;
        return (<div style={this.outDivStyle} f-canmove={1}>
                    <DropDownControl options_arr={['DateAdd','DateDiff','DateName','DatePart']} value={nodeData.mathType} itemChanged={this.dateChangedHandler} style={this.ddcStyle} />
                    <DropDownControl options_arr={Datepart_arr} itemChanged={this.datepartChangedHandler} value={nodeData.datepartValue} style={this.ddcStyle} />
                </div> 
           
        );
    }

    render() {
        var nodeData = this.props.nodedata;
        var headType = 'tiny';
        return <C_SqlNode_Frame ref={this.frameRef} nodedata={nodeData} editor={this.props.editor} headType={headType} headText={nodeData.label} cusHeaderFuc={this.cusHeaderFuc}>
            <div className='d-flex'>
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.inputScokets_arr} align='start' editor={this.props.editor} processFun={nodeData.isInScoketDynamic() ? nodeData.processInputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
                <C_SqlNode_ScoketsPanel nodedata={nodeData} data={nodeData.outputScokets_arr} align='end' editor={this.props.editor} processFun={nodeData.isOutScoketDynamic() ? nodeData.processOutputSockets : null} nameMoveable={nodeData.scoketNameMoveable} />
            </div>

        </C_SqlNode_Frame>
    }
}