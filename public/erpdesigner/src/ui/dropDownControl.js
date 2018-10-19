class DropDownControl extends React.PureComponent {
    constructor(props) {
        super(props);

        var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
        var selectedOption = formated_arr.find(item=>{
            return item.value == this.props.value;
        });
        autoBind(this);

        this.state = {
            keyword:'',
            opened:false,
            options_arr:selectedOption ? [selectedOption] : [],
            selectedOption:selectedOption,
        };

        this.dropdownbtnRef = React.createRef();
        this.editableInputRef = React.createRef();
        this.dropmenudivRef = React.createRef();
    }

    setValue(val){
        var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
        var selectedOption = formated_arr.find(item=>{
            return item.value == val;
        });
        this.setState({
            options_arr:formated_arr,
            selectedOption:selectedOption,
        });
    }

    getSelectedData(){
        return this.state.selectedOption ? (this.state.selectedOption.data ? this.state.selectedOption.data : this.state.selectedOption.value) : null;
    }

    dropDowmDivRefFun(elem){
        this.$dropDowmDiv = $(elem);
        /*
        this.$dropDowmDiv.on('shown.bs.dropdown', this.dropDownOpened);
        this.$dropDowmDiv.on('hidden.bs.dropdown', this.dropDownClosed);
        */
    }

    componentWillUnmount(){
        /*
        var $current = this.$dropDowmDiv;
        $current.off('shown.bs.dropdown', this.dropDownOpened);
        $current.off('hidden.bs.dropdown', this.dropDownClosed);
        */
    }

    dropDownOpened() {
        console.log('菜单被打开了');
        var srcOptions_arr = this.props.options_arr;
        if(typeof srcOptions_arr === 'function'){
            srcOptions_arr = srcOptions_arr();
        }
        var formated_arr = this.formatData(srcOptions_arr, this.props.textAttrName, this.props.valueAttrName);
        this.setState({
            keyword:'',
            opened:true,
            options_arr:formated_arr,
        });
        
        this.popMenuHeight = 0;
        //this.freshPopUpPos();

        window.addEventListener('mouseup', this.windowMouseUpWidthPopintg);
    }

    componentDidUpdate(){
        if(this.state.opened){
            var popMenu = this.$dropDowmDiv.find('.dropdown-menu');
            if(this.popMenuHeight == popMenu.height()){
                return;
            }
            this.freshPopUpPos();
        }
    }

    freshPopUpPos(){
        var popMenu = this.$dropDowmDiv.find('.dropdown-menu');
        var $current = this.$dropDowmDiv;
        var divTop = $current.offset().top;
        var divBottom = divTop + $current.outerHeight(true);
        var windowTop = document.body.scrollTop;
        var windowBottom = windowTop + $(window).height();
        var popToUp =  (divBottom - windowTop) > (windowBottom - divBottom);
        var popMenuHeight = popMenu.outerHeight();
        this.popMenuHeight = popMenuHeight;
        var popUpCss = {
            "top":(popToUp ? (divTop - popMenuHeight) : divBottom) + 'px',
            "left": $current.offset().left + "px",
            "min-width":$current.width() + 'px',
        }
        popMenu.css(popUpCss);
        popMenu.find('#listDIV').css({
            "max-height":(popToUp ? divBottom - windowTop : windowBottom - divBottom) + 'px',
        });
    }

    windowMouseUpWidthPopintg(ev){
        if(isNodeHasParent(ev.target,this.$dropDowmDiv[0])){
            return;
        }
        this.dropDownClosed();
    }

    keyChanged(ev) {
        var target = ev.target;
        var keyword = target.value;

        this.setState({ keyword: keyword });
    }

    dropDownClosed() {
        console.log('菜单被关闭了');
        window.removeEventListener('mouseup', this.windowMouseUpWidthPopintg);

        this.setState({opened:false});
    }

    /*
    dropDowmDivRef(elem) {
        $(elem).on('shown.bs.dropdown', this.dropDownOpened);
        $(elem).on('hidden.bs.dropdown', this.dropDownClosed);
    }
    */

    formatData(orginData_arr, textAttrName, valueAttrName){
        return orginData_arr.map(item=>{
            return typeof item == 'string' ? {text:item,value:item} : {text:item[textAttrName],value:item[valueAttrName],data:item};
        });
    }

    keyChanged(ev) {
        var target = ev.target;
        var keyword = target.value;
        var selectedOpt = this.state.options_arr.find(item=>{return item.text == keyword});

        if(this.props.editable){
            this.setState({ keyword: keyword,
                selectedOption:selectedOpt,});
        }
        else{
            if(selectedOpt){
                this.setState({ keyword: keyword,
                    selectedOption:selectedOpt, });
            }
            else{
                this.setState({ keyword: keyword });
            }
        }
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
        this.setState({ selectedOption:theOptionItem,
                        keyword:'',
                        opened:false });
        if(this.props.itemChanged){
            this.props.itemChanged(theOptionItem.data ? theOptionItem.data : theOptionItem.value);
        }
    }

    renderDropDown(filted_arr, selectedOption) {
        return (
            <React.Fragment>
                {
                    this.state.options_arr.length <= 5 || this.props.editable ? null :
                    <div className='d-flex border'>
                        <div htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >搜索:</div>
                        <input className='flex-grow-1 flex-shrink-1 flexinput' type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.keyChanged} />
                    </div>
                }
                <div id='listDIV' className='list-group flex-grow-1 flex-shrink-1 autoScroll' style={{ overflow: 'auto', maxHeight: '500px', padding:'5px' }} >
                    {
                        filted_arr.map((item, i) => {
                            return (<div onClick={this.listItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedOption && item.value == selectedOption.value ? ' active' : '')} menuitem={1} miniitem={1} key={item.value} value={item.value}>
                                <div>{item.text}</div>
                            </div>)
                        })
                    }
                </div>
            </React.Fragment>)
    }

    editableInputFocushandler(ev){
        if(!this.state.opened){
            this.dropDownOpened();
            var inputElem = this.editableInputRef.current;
            setTimeout(() => {
                inputElem.focus();
            }, 50);
        }
    }

    clickOpenHandler(){
        if(!this.state.opened){
            this.dropDownOpened();
        }else{
            this.dropDownClosed();
        }
    }

    render() {
        var filted_arr = this.state.options_arr.filter(item => {
            return this.state.keyword.trim().length == 0 || item.text.indexOf(this.state.keyword) >= 0;
        });
        var selectedOption = this.state.selectedOption;

        return (
            <div className={"d-flex flex-column " + (this.props.rootclass ? this.props.rootclass : '')} style={this.props.style}>
                <div className='d-flex flex-grow-1 flex-shrink-1'>
                    <div className=' d-flex btn-group w-100 h-100' ref={this.dropDowmDivRefFun}>
                        {
                            this.props.editable ? <input onFocus={this.editableInputFocushandler} ref={this.editableInputRef} type='text' className='flex-grow-1 flex-shrink-1 flexinput' onChange={this.keyChanged} value={selectedOption ? selectedOption.text : this.state.keyword} />
                            :
                            <button onClick={this.clickOpenHandler} style={{width:'calc(100% - 30px)'}} type='button' className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1' + (selectedOption == null ? ' text-danger' : '')} ><div style={{overflow:'hidden'}}>{selectedOption ? selectedOption.text : '请选择'}</div></button>
                        }
                        <button ref={this.dropdownbtnRef} style={{width:'30px'}} type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split'} ></button>

                        <div className={"dropdown-menu " + (this.state.opened ? 'show' : '')} ref={this.dropmenudivRef}>
                            {(this.state.opened || this.state.options_arr.length > 0) && this.renderDropDown(filted_arr, selectedOption)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
