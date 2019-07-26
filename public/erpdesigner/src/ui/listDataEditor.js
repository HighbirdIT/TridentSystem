class ListDataView extends EventEmitter {
    constructor(source_arr, textName, valueName) {
        super();
        this.source_arr = source_arr;
        this.textName = textName;
        this.valueName = valueName;
    }

    fireChanged() {
        this.emit('changed');
    }

    deleteItem(item){
        var index = this.source_arr.indexOf(item);
        if(index >= 0){
            this.source_arr.splice(index,1);
            this.fireChanged();
        }
    }
}


class ListDataEditor extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            items_arr: this.props.dataView.source_arr,
            selected_arr: []
        };

        autoBind(this);
    }

    dataviewChangedHandler() {
        var newSelected_arr = [];
        this.state.selected_arr.forEach(v=>{
            if(this.state.items_arr.find(e=>{
                return e[this.props.dataView.valueName].toString() == v;
            })){
                newSelected_arr.push(v);
            }
        })
        this.setState({ selected_arr:newSelected_arr });
    }

    componentWillMount() {
        this.props.dataView.on('changed', this.dataviewChangedHandler);
    }

    componentWillUnmount() {
        this.props.dataView.off('changed', this.dataviewChangedHandler);
    }

    itemClickHandler(ev) {
        var itemvalue = getAttributeByNode(ev.target, 'itemvalue');
        if (itemvalue == null) {
            return;
        }
        var nowArr = this.state.selected_arr;
        var nowIndex = nowArr.indexOf(itemvalue);
        if (nowIndex >= 0) {
            nowArr = nowArr.concat();
            nowArr.splice(nowIndex, 1);
        }
        else {
            nowArr = nowArr.concat(itemvalue);
        }
        this.setState({
            selected_arr: nowArr
        });
    }

    clickDeleteHandler(ev){
        var itemvalue = getAttributeByNode(ev.target, 'itemvalue');
        if (itemvalue == null) {
            return;
        }
        var item = this.state.items_arr.find(e=>{
            return e[this.props.dataView.valueName].toString() == itemvalue;
        });
        this.props.dataView.deleteItem(item);
    }

    render() {
        return (
            <div className='d-flex flex-column flex-grow-1 flex-shrink-1 list-group'>
                {
                    this.state.items_arr.map(item => {
                        var text = item[this.props.dataView.textName];
                        var value = item[this.props.dataView.valueName].toString();
                        var selected = this.state.selected_arr.indexOf(value) != -1;
                        return <div key={value} className={'d-flex flex-grow-0 flex-shrink-0'} itemvalue={value}>
                            <div key={value} onClick={this.itemClickHandler} className={'list-group-item list-group-item-action flex-grow-1 flex-shrink-1 align-items-baseline' + (selected ? ' active' : '')} miniitem='1'>
                                {text}
                            </div>
                            {selected ? <button onClick={this.clickDeleteHandler} type='button' className='ml-1 btn btn-danger icon icon-trash' /> : null}
                        </div>
                    })
                }
            </div>
        );
    }
}
