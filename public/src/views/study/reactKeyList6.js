var personData = [
    { 系统: '膜加工厂', 部门: '膜加工部', 姓名: '程王飞', 代码: '1353' }
    , { 系统: '钢结构厂', 部门: '钢加工部', 姓名: '程裕云', 代码: '1262' }
    , { 系统: '运营系统', 部门: '施工管理部', 姓名: '崔恒祥', 代码: '1347' }
    , { 系统: '钢结构厂', 部门: '钢加工部', 姓名: '戴金陵', 代码: '1164' }
    , { 系统: '钢结构厂', 部门: '钢厂务部', 姓名: '戴美贞', 代码: '1012' }
    , { 系统: '营销系统', 部门: '方案设计部', 姓名: '戴松林', 代码: '1711' }
    , { 系统: '运营系统', 部门: '施工管理部', 姓名: '樊程成', 代码: '1486' }
    , { 系统: '管理系统', 部门: '合约管理部', 姓名: '樊坤', 代码: '1300' }
    , { 系统: '运营系统', 部门: '施工管理部', 姓名: '范立长', 代码: '190' }
    , { 系统: '钢结构厂', 部门: '钢加工部', 姓名: '房爱忠', 代码: '189' }
    , { 系统: '运营系统', 部门: '施工管理部', 姓名: '房凤魁', 代码: '210' }
    , { 系统: '钢结构厂', 部门: '钢加工部', 姓名: '房文喜', 代码: '159' }
    , { 系统: '膜加工厂', 部门: '膜加工部', 姓名: '房永杰', 代码: '1098' }
];

function formatTreeData(orginData_arr, leafText, leafValue, groupNames_arr) {
    var rootNode_arr = [];
    var allLeaf_arr = [];
    orginData_arr.forEach(
        dataObj => {
            var parentGroup = null;
            groupNames_arr.forEach(groupName => {
                var groupVal = dataObj[groupName];
                if (parentGroup == null) {
                    parentGroup = rootNode_arr.find(
                        item => { return item.name == groupVal }
                    );
                    if (parentGroup == null) {
                        parentGroup = { name: groupVal, child: [] };
                        rootNode_arr.push(parentGroup);
                    }
                }
                else {
                    var thisGroup = parentGroup.child.find(item => {
                        return item.name == groupVal;
                    });
                    if (thisGroup == null) {
                        thisGroup = { name: groupVal, child: [], parent: parentGroup };
                        parentGroup.child.push(thisGroup);
                    }
                    parentGroup = thisGroup;
                }
            });

            var leafNode = {
                isleaf: true,
                parent: parentGroup,
                text: dataObj[leafText],
                value: dataObj[leafValue],
            };
            parentGroup.child.push(leafNode);
            allLeaf_arr.push(leafNode);
        }
    );
    return {
        rootNode_arr: rootNode_arr,
        allLeaf_arr: allLeaf_arr,
    };
}

function objectSort(value1, value2) {
    return function (a, b) {
        if (a[value1] === b[value1]) {
            if (a[value2] > b[value2]) {
                return 1;
            } else if (a[value2] < b[value2]) {
                return - 1;
            } else {
                return 0;
            }
        } else {
            if (a[value1] > b[value1]) {
                return 1;
            } else {
                return - 1;
            }
        }
    }
}

class TreeControl extends React.PureComponent {
    constructor(props) {
        super(props);
        var formatedData = formatTreeData(personData, '姓名', '代码', ['系统', '部门']);
        this.state = {
            data: formatedData.rootNode_arr,
            selected_arr: [],
            keyword: '',
            allLeaf_arr: formatedData.allLeaf_arr,
        }

        this.clickLeafNodeHandler = this.clickLeafNodeHandler.bind(this);
        this.keyPresshandler = this.keyPresshandler.bind(this);
        this.clickkeword = this.clickkeword.bind(this);
        this.keyIndex = -1;
    }

    keyPresshandler(ev) {
        //console.log(ev);
        if (ev.code == 'ArrowDown' || ev.code == 'ArrowUp') {
            ev.preventDefault();
            var selectedLeaf = this.state.selected_arr.length == 0 ? null : this.state.allLeaf_arr.find(leafData => {
                return leafData.value == this.state.selected_arr[0];
            });
            if (selectedLeaf == null) {
                selectedLeaf = ev.code == 'ArrowDown' ? this.firstLeafNode : this.lastLeafNode;
            }
            else {
                if (ev.code == 'ArrowDown') {
                    selectedLeaf = selectedLeaf.nextLeaf == null ? this.firstLeafNode : selectedLeaf.nextLeaf;
                }
                if (ev.code == 'ArrowUp') {
                    selectedLeaf = selectedLeaf.preLeaf == null ? this.lastLeafNode : selectedLeaf.preLeaf;
                }
            }
            if(selectedLeaf == null)
                return;
            console.log($(document.body));
            console.log($(selectedLeaf));
            this.showNodeAndChild(selectedLeaf);
            this.setState({
                selected_arr: [selectedLeaf.value],
                arrowControled: true,
            });
        }
    }

    componentWillMount() {
        window.addEventListener('keydown', this.keyPresshandler);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.keyPresshandler);
    }

    isNodeContain(nodeData, keywrod) {
        if (nodeData.isleaf) {
            return nodeData.text.indexOf(keywrod) != -1;
        }

        return nodeData.child.find(childData => {
            return this.isNodeContain(childData, keywrod);
        });
    }

    renderNode(nodeData, keyword, renderData) {
        /*
        var keyword = this.state.keyword.trim();
        if(keyword.length == 0){
            keyword = null;
        }
        if(keyword && !this.isNodeContain(nodeData, keyword)){
            return null;
        }
        */
        if (nodeData.visible != 1) {
            return null;
        }

        if (nodeData.isleaf) {
            nodeData.preLeaf = renderData.preLeafNode;
            if (renderData.preLeafNode) {
                renderData.preLeafNode.nextLeaf = nodeData;
            }
            else {
                this.firstLeafNode = nodeData;
            }
            renderData.preLeafNode = nodeData;
            nodeData.nextLeaf = null;
            this.lastLeafNode = nodeData;
            return (<div key={nodeData.value} onClick={this.clickLeafNodeHandler} className={'list-group-item list-group-item-action ' + (this.state.selected_arr.indexOf(nodeData.value) >= 0 ? 'active' : '')} value={nodeData.value}>{nodeData.text}</div>);
        }

        return (<div key={nodeData.name} className='list-group-item'>
            <div className={'list-group-item list-group-item-action' + (keyword ? '' : ' collapsed')} data-toggle="collapse" data-target={'#' + nodeData.name + '_group'} >{nodeData.name}</div>
            <div className={'collapse ' + (keyword || nodeData.unCollapsed || true ? ' show' : '')} id={nodeData.name + '_group'}>
                {
                    nodeData.child.map(childNode => {
                        return this.renderNode(childNode, keyword, renderData);
                    })
                }
            </div>
        </div>);
    }

    clickLeafNodeHandler(ev) {
        var target = ev.target;
        var value = target.getAttribute('value');
        var nowselected_arr = this.state.selected_arr.concat();
        var nowIndex = nowselected_arr.indexOf(value);
        if (nowIndex >= 0) {
            nowselected_arr.splice(nowIndex, 1); // 操作删除数组元素
        }
        else {
            if (this.props.multiselect == false) {
                nowselected_arr.splice(nowIndex, nowselected_arr.length);
            }
            nowselected_arr.push(value);
        }
        this.setState({ selected_arr: nowselected_arr });
    }

    clickkeword(ev) {
        var target = ev.target;
        this.setState({ keyword: target.value });
    }

    hideNodeAndChild(theNodeData) {
        theNodeData.visible = 0;
        if (theNodeData.child) {
            theNodeData.child.forEach(childData => {
                this.hideNodeAndChild(childData);
            });
        }
    }

    showNodeAndChild(theNodeData) {
        theNodeData.visible = 1;
        if (theNodeData.child) {
            theNodeData.child.forEach(childData => {
                this.showNodeAndChild(childData);
            });
        }
    }

    setNodeUnCollapse(theNodeData, value) {
        theNodeData.unCollapsed = value;
    }

    render() {
        var keyword = this.state.keyword.trim();
        if (keyword.length == 0) {
            keyword = null;
        }
        if (keyword) {
            // 进行过滤
            this.state.data.forEach(
                nodeData => {
                    this.hideNodeAndChild(nodeData);
                }
            );
            for (var si in this.state.allLeaf_arr) {
                var theLeaf = this.state.allLeaf_arr[si];
                if (theLeaf.text.indexOf(keyword) != -1) {
                    var tempNode = theLeaf;
                    do {
                        tempNode.visible = 1;
                        tempNode = tempNode.parent;
                    } while (tempNode);
                }
            }
        }
        else {
            this.state.data.forEach(
                nodeData => {
                    this.showNodeAndChild(nodeData);
                }
            );
            if (this.state.arrowControled) {
                var selectedLeaf = this.state.allLeaf_arr.find(leafData => { return leafData.value == this.state.selected_arr[0]; });
                if (selectedLeaf != null) {
                    var tempNode = selectedLeaf.parent;
                    do {
                        this.setNodeUnCollapse(tempNode, 1);
                        tempNode = tempNode.parent;
                    } while (tempNode);
                }
            }
        }

        var renderData = {
            preLeafNode: null,
        };
        this.firstLeafNode = null;
        this.lastLeafNode = null;

        return (
            <div id='treeRoot' className='list-group flex-grow-1 flex-shrink-1'>
                <div className='flex-grow-0 flex-shrink-0 d-flex' ><span>搜索:</span><input id='text' type='text' onChange={this.clickkeword} className='flex-grow-1 flex-shrink-1' value={this.state.keyword} /></div>
                {
                    this.state.data.map(
                        item => {
                            return this.renderNode(item, keyword, renderData);
                        }
                    )
                }
            </div>
        )
    }
}

// class DropDownControl extends React.PureComponent {
//     constructor(props) {
//         super(props);
//         this.state = {
//             keyword: '',
//             selectedCode: -1,
//             selectedText: '        ',
//             data_arr: [],
//             dataLoaded: false
//         };

//         this.keyChanged = this.keyChanged.bind(this);
//         this.litItemClick = this.litItemClick.bind(this);
//         this.dropDowmDivRef = this.dropDowmDivRef.bind(this);

//         this.dropDownOpened = this.dropDownOpened.bind(this);
//         this.dropDownClosed = this.dropDownClosed.bind(this);
//     }


//     dropDownOpened() {
//         console.log('菜单被打开了');

//         var timeout = Math.min(Math.max(30, timeout), 120) * 1000;
//         var self = this;
//         this.setState(
//             {
//                 dataLoaded: false,
//             }
//         );

//         fetch('helloProcess', {
//             method: "POST",
//             body: JSON.stringify({
//                 tableName: 'T903B物资仓库名称',
//                 action: 'getDataTable',
//             }),
//             headers: {
//                 "Content-Type": "application/json"
//             }
//         }).then(
//             function (response) {
//                 if (response.ok) {
//                     return response.json();
//                 } else {
//                     console.error(response.statusText);
//                     return null;
//                 }
//             }
//         ).then(
//             function (rltJson) {
//                 var data_arr = rltJson.data;
//                 self.setState(
//                     {
//                         data_arr: data_arr.map(item => {
//                             return { name: item.物资仓库名称, code: item.物资仓库名称代码 }
//                         }),
//                         dataLoaded: true,
//                     }
//                 );
//             }
//         );
//     }

//     dropDownClosed() {
//         console.log('菜单被关闭了');
//     }

//     dropDowmDivRef(elem) {
//         $(elem).on('shown.bs.dropdown', this.dropDownOpened);
//         $(elem).on('hidden.bs.dropdown', this.dropDownClosed);
//     }

//     keyChanged(ev) {
//         var target = ev.target;
//         var keyword = target.value;

//         this.setState({ keyword: keyword });
//     }

//     litItemClick(ev) {
//         var target = ev.target;
//         if (!target.hasAttribute('code')) {
//             target = target.parentElement;
//         }
//         var code = target.getAttribute('code');
//         this.setState({ selectedCode: code, selectedText: target.textContent, keyword: '' });
//     }

//     renderDropDown(filted_arr, selectedItem) {
//         if (!this.state.dataLoaded) {
//             return (<div>通讯中请等待</div>)
//         }
//         return (
//             <React.Fragment>
//                 <div className='d-flex'>
//                     <span htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >搜索:</span>
//                     <input className='ml-1 flex-grow-1 flex-shrink-1' type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.keyChanged} />
//                 </div>
//                 <div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{ overflow: 'auto', height: '300px' }} >
//                     {
//                         filted_arr.map((item, i) => {
//                             return (<div onClick={this.litItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' + (item.code == this.state.selectedCode ? ' active' : '')} key={i} code={item.code}>
//                                 <div>{item.name}</div>
//                             </div>)
//                         })
//                     }
//                 </div>
//             </React.Fragment>)
//     }

//     render() {
//         var filted_arr = this.state.data_arr.filter(item => {
//             return this.state.keyword == '' || this.state.keyword == ' ' || item.name.indexOf(this.state.keyword) >= 0;
//         });
//         var selectedItem = this.state.data_arr.find(item => {
//             return this.state.selectedCode == item.code;
//         });

//         return (
//             <div className="d-flex flex-column" style={{ width: this.props.width, height: this.props.height }}>
//                 <div className='d-flex flex-grow-0 flex-shrink-0'>
//                     {this.props.label}
//                 </div>
//                 <div className='d-flex flex-grow-1 flex-shrink-1 mt-1'>
//                     <div className='flex-grow-1 flex-shrink-1 d-flex btn-group' ref={this.dropDowmDivRef}>
//                         <button type='button' className='btn btn-dark flex-grow-1 flex-shrink-1 ' data-toggle="dropdown" >{this.state.selectedText}</button>
//                         <button type='button' className='btn btn-dark flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' data-toggle="dropdown" data-reference="parent" ></button>

//                         <div className="dropdown-menu" id='dropContentDiv'>
//                             {this.renderDropDown(filted_arr, selectedItem)}
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

/*
var t = (<div className='bg-primary p-1 text-light d-flex felx-grow-0 flex-shrink-0 align-items-center'> 
<span htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >关键字:</span>
<input className='ml-1 flex-grow-1 flex-shrink-1' type='text' id='keyword' name='keyword' onChange={this.keyChanged} />
<span >过滤出{filted_arr.length}条</span>
<span >{selectedItem ? '"' + selectedItem.name + '"' : ''}</span>
</div>
<div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{overflow:'auto'}} >
{
    filted_arr.map((item,i)=>{
        return(<div onClick={this.litItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action' + (item.code == this.state.selectedCode ? ' active' : '')} key={i} code={item.code}>
                <div className='col-6'>{item.name}</div>
                <div className='col-6'>{item.code}</div>
            </div>)
    })
}
</div>);
*/

class MyApp extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {

        return (<TreeControl multiselect={false} />);
        //        return (<DropDownControl label='物资仓库名称' width='100px' height='60px' />);
    }
}

var data = [
    { name: '叶媛媛', code: 1 }
    , { name: '潘佳伟', code: 2 }
    , { name: '陈怡', code: 3 }
    , { name: '沈珏茹', code: 4 }
    , { name: '顾熙', code: 5 }
    , { name: '沈晓霞', code: 6 }
    , { name: '赵智淼', code: 7 }
    , { name: '唐媛', code: 8 }
    , { name: '李烨', code: 9 }
    , { name: '王继红', code: 10 }
    , { name: '张琳', code: 11 }
    , { name: '周玲', code: 12 }
    , { name: '胡玲玲', code: 13 }
    , { name: '卢彩琴', code: 14 }
    , { name: '李悦', code: 15 }
    , { name: '陈晟', code: 16 }
    , { name: '金茂永', code: 17 }
    , { name: '肖康', code: 18 }
    , { name: '郭其宝', code: 19 }
    , { name: '李旭', code: 20 }
    , { name: '陈伟', code: 21 }
    , { name: '李晶晶', code: 22 }
    , { name: '吴溢华', code: 23 }
    , { name: '吕承梅', code: 24 }
    , { name: '陆敏', code: 25 }
    , { name: '吴安琴', code: 26 }
    , { name: '张霞', code: 27 }
    , { name: '谢颖清', code: 28 }
    , { name: '冯鑫', code: 29 }
    , { name: '张亚飞', code: 30 }
    , { name: '孙运姣', code: 31 }
    , { name: '杨振兴', code: 32 }
    , { name: '梁秀兰', code: 33 }
    , { name: '赵志良', code: 34 }
    , { name: '张贵', code: 35 }
    , { name: '金鑫华', code: 36 }
    , { name: '纪爱光', code: 37 }
    , { name: '谷德明', code: 38 }
    , { name: '李士娟', code: 39 }
    , { name: '石草林', code: 40 }
    , { name: '陈虎', code: 41 }
    , { name: '纪爱军', code: 42 }
    , { name: '张光运', code: 43 }
    , { name: '彭善文', code: 44 }
    , { name: '孙红闯', code: 45 }
    , { name: '陈光华', code: 46 }
    , { name: '龙腾云', code: 47 }
    , { name: '盛琴', code: 48 }
    , { name: '田石亚', code: 49 }
    , { name: '王敬', code: 50 }
];

ReactDOM.render(<MyApp name='Hello3React' />, document.getElementById('reactRoot'));
