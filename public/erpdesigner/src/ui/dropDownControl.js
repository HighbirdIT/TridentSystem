class DropDownControl extends React.PureComponent {
    constructor(props) {
        super(props);
        autoBind(this);

        var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
        var selectedOption = formated_arr.find(item=>{
            return item.value == this.props.value;
        });

        this.state = {
            keyword:'',
            selectedValue:selectedOption ? selectedOption.value : null,
            selectedText:selectedOption ? selectedOption.text : '请选择',
            opened:false,
            options_arr:formated_arr,
        };
    }

    formatData(orginData_arr, textAttrName, valueAttrName){
        return orginData_arr.map(item=>{
            return typeof item == 'string' ? {text:item,value:item} : {text:item[textAttrName],value:item[valueAttrName],data:item};
        });
    }

    keyChanged(ev) {
        var target = ev.target;
        var keyword = target.value;

        this.setState({ keyword: keyword });
    }

    listItemClick(ev) {
        var target = ev.target;
        var value = getAttributeByNode(target, 'value', true, 3);
        if(value == null){
            console.warn('can not find value attr');
            return;
        }
        var theOptionItem = this.state.options_arr.find(item=>{
            return item.value == value;
        });
        this.props.itemChanged(theOptionItem.data ? theOptionItem.data : theOptionItem.value);
    }

    renderDropDown(filted_arr, selectedOption) {
        return (
            <React.Fragment>
                {
                    this.state.options_arr.length <= 10 ? null :
                    <div className='d-flex border'>
                        <span htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >搜索:</span>
                        <input className='ml-1 flex-grow-1 flex-shrink-1' type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.keyChanged} />
                    </div>
                }
                <div name='listDIV' className='list-group flex-grow-1 flex-shrink-1' style={{ overflow: 'auto', maxheight: '500px', padding:'5px' }} >
                    {
                        filted_arr.map((item, i) => {
                            return (<div onClick={this.listItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item-sm list-group-item-action' + (item == selectedOption ? ' active' : '')} key={i} value={item.value}>
                                <div>{item.text}</div>
                            </div>)
                        })
                    }
                </div>
            </React.Fragment>)
    }

    render() {
        var filted_arr = this.state.options_arr.filter(item => {
            return this.state.keyword.trim().length == 0 || item.text.indexOf(this.state.keyword) >= 0;
        });
        var selectedOption = this.state.options_arr.find(item => {
            return this.props.value == item.value;
        });

        return (
            <div className="d-flex flex-column">
                <div className='d-flex flex-grow-1 flex-shrink-1'>
                    <div className='flex-grow-1 flex-shrink-1 d-flex btn-group'>
                        <button type='button' className={'btn btn-dark flex-grow-1 flex-shrink-1' + (this.state.selectedValue == null ? ' text-danger' : '')} data-toggle="dropdown" >{selectedOption ? selectedOption.text : '请选择'}</button>
                        <button type='button' className='btn btn-dark flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split' data-toggle="dropdown" data-reference="parent" ></button>

                        <div className="dropdown-menu">
                            {this.renderDropDown(filted_arr, selectedOption)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
