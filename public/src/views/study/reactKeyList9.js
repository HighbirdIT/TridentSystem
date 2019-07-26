
class PersonList extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {

        var arr1=[300,800,800,800,900,300,900,900,1000,600,900,600,700,1000,900,700,900,300,1100,800,900,900,700,500,1000,700,1000,0,1000,800,900,900];
        var arr2=[600,700,300,500,800,400,900,1000,1100,100,1300,1400,1500,1600,0];
        var rlt_arr = arr2.map(item=>{
            return arr1.length - arr1.lastIndexOf(item);
        });

        return arr2.map((item,i)=>{
            return (<div>{rlt_arr[i] + 1}</div>)
        });

        if (this.props.data == null) {
            return (<div>正在通信</div>);
        }
        return (<div className='list-group'>
            {
                this.props.data.map(person_dr => {
                    return <div key={person_dr.员工登记姓名代码} className='list-group-item d-flex align-items-center'>
                        <div style={{ width: '4em' }} className=''>
                            {person_dr.员工登记姓名}
                        </div>
                        <div className='d-flex flex-column col-2'>
                            <div>
                                年龄:{person_dr.员工当前年龄}
                            </div>
                            <div>
                                性别:{person_dr.员工登记性别}
                            </div>
                        </div>
                        <div style={{ width: '6em' }} className='ml-1'>
                            {person_dr.所属公司名称}
                        </div>
                        <div className='d-flex flex-column ml-1 col-3'>
                            <div>
                                系统:{person_dr.所属系统名称}
                            </div>
                            <div>
                                部门:{person_dr.所属部门名称}
                            </div>
                        </div>
                        <div className='d-flex flex-column ml-1 col-3'>
                            <div>
                                类别:{person_dr.员工工时状态}
                            </div>
                            <div>
                                职级:{person_dr.享受职级名称}
                            </div>
                        </div>
                    </div>
                })
            }
        </div>);
    }
}

class MyApp extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        };

        var self = this;

        fetch('helloProcess', {
            method: "POST",
            body: JSON.stringify({
                tableName: 'V113A名册员工全部',
                action: 'getDataTable',
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(
            function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error(response.statusText);
                    return null;
                }
            }
        ).then(
            function (rltJson) {
                self.fetchComplete(rltJson.data);
            }
        );
    }

    fetchComplete(data) {
        this.setState(
            {
                personDr_arr: data,
            }
        );
    }

    render() {
        return (<PersonList data={this.state.personDr_arr} />);
    }
}

ReactDOM.render(<MyApp />, document.getElementById('reactRoot'));


