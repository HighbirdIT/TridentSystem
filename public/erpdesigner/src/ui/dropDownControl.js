class DropDownControl extends React.PureComponent {
    constructor(props) {
        super(props);
        var valueAttrName = this.props.valueAttrName == null ? this.props.textAttrName : this.props.valueAttrName;
        if(this.props.editable && this.props.valueAttrName != null && this.props.valueAttrName != this.props.textAttrName){
            //console.error('下拉框设置为editable 但同时设置了text和value属性明');
            this.editIsKeyword = true;
        }

        var selectedOption = null;
        if(!this.props.editable || this.editIsKeyword){
            var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
            selectedOption = formated_arr.find(item=>{
                if(typeof this.props.value === 'object'){
                    return item == this.props.value || item.value == this.props.value[valueAttrName];
                }
                return item.value == this.props.value;
            });
        }
        
        autoBind(this);
        

        this.state = {
            keyword:'',
            value:this.props.value,
            prePropsValue:this.props.value,
            opened:false,
            options_arr:selectedOption ? [selectedOption] : [],
            selectedOption:selectedOption,
        };

        this.dropdownbtnRef = React.createRef();
        this.editableInputRef = React.createRef();
        this.dropmenudivRef = React.createRef();
        this.rootDivRef = React.createRef();
    }

    setValue(val){
        if(this.props.editable && !this.editIsKeyword){
            this.setState({
                value:val,
            });
        }
        else
        {
            var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
            var selectedOption = formated_arr.find(item=>{
                return item.value == val;
            });
            this.setState({
                options_arr:formated_arr,
                selectedOption:selectedOption,
            });
        }
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
        /*
        var srcOptions_arr = this.props.options_arr;
        if(typeof srcOptions_arr === 'function'){
            srcOptions_arr = srcOptions_arr();
        }
        */
        var formated_arr = this.formatData(this.props.options_arr, this.props.textAttrName, this.props.valueAttrName);
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
            var $dropDowmDiv = $(this.rootDivRef.current);
            var popMenu = $dropDowmDiv.find('.dropdown-menu');
            if(this.popMenuHeight == popMenu.height()){
                return;
            }
            this.freshPopUpPos();
        }
    }

    freshPopUpPos(){
        var $dropDowmDiv = $(this.rootDivRef.current);
        var popMenu = $dropDowmDiv.find('.dropdown-menu');
        var $current = $dropDowmDiv;
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
            "max-height":(popToUp ? divTop - windowTop - 50 : windowBottom - divBottom - 50) + 'px',
        });
    }

    windowMouseUpWidthPopintg(ev){
        var $dropDowmDiv = $(this.rootDivRef.current);
        if(isNodeHasParent(ev.target,$dropDowmDiv[0])){
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
        if(orginData_arr == null){
            console.warn('orginData_arr == null');
            return[];
        }
        if(typeof orginData_arr === 'function'){
            orginData_arr = orginData_arr(this.props.funparamobj);
        }
        if(valueAttrName == null){
            valueAttrName = textAttrName;
        }
        return orginData_arr.map(item=>{
            return typeof item == 'string' ? {text:item,value:item} : {text:item[textAttrName],value:item[valueAttrName],data:item};
        });
    }

    keyChanged(ev) {
        var target = ev.target;
        var keyword = target.value;
        var selectedOpt = this.state.options_arr.find(item=>{return item.text == keyword});


        if(selectedOpt){
            this.setState({ keyword: keyword,
                selectedOption:selectedOpt, });
        }
        else{
            this.setState({ keyword: keyword });
        }
    }

    inputChangedHandler(ev){
        if(this.editIsKeyword){
            this.keyChanged(ev);
            return;
        }
        this.setState({
            value:ev.target.value.trim(),
        });
    }

    inputBlurHandler(ev){
        if(this.state.value != this.props.value){
            if(this.props.itemChanged){
                //theOptionItem.data ? theOptionItem.data : theOptionItem.value
                this.props.itemChanged(this.state.value, this);
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
                        opened:false,
                        value:theOptionItem.text });
        if(this.props.itemChanged){
            //theOptionItem.data ? theOptionItem.data : theOptionItem.value
            this.props.itemChanged(value, this, theOptionItem.data);
        }
    }

    renderDropDown(filted_arr, selectedOption) {
        return (
            <React.Fragment>
                {
                    this.state.options_arr.length <= 5 || this.editIsKeyword == true ? null :
                    <div className='d-flex border'>
                        <div htmlFor='keyword' className='flex-grow-0 flex-shrink-0 ' >搜索:</div>
                        <input className='flex-grow-1 flex-shrink-1 flexinput' type='text' id='keyword' name='keyword' value={this.state.keyword} onChange={this.keyChanged} />
                    </div>
                }
                <div id='listDIV' className='list-group flex-grow-1 flex-shrink-1 autoScroll' style={{ overflow: 'auto', maxHeight: '500px', padding:'5px' }} >
                    {
                        filted_arr.map((item, i) => {
                            if(item.text == null){
                                console.warn('item text 不能为null');
                            }
                            return (<div onClick={this.listItemClick} className={'d-flex flex-grow-0 flex-shrink-0 list-group-item list-group-item-action ' + (selectedOption && item.value == selectedOption.value ? ' active' : '')} menuitem={1} miniitem={1} key={item.value} value={item.value}>
                                <div>{item.text == null || item.text.length == 0 ? '(空值)' : item.text}</div>
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
        if(this.state.prePropsValue != this.props.value){
            var self = this;
            setTimeout(() => {
                self.setState({
                    value:self.props.value,
                    prePropsValue:self.props.value,
                });
            }, 50);
        }
        var inputValue = this.editIsKeyword ? (this.state.keyword == '' ? (selectedOption == null ? '' : selectedOption.text) : this.state.keyword) : this.state.value;

        var useClassName = this.props.rootclass ? this.props.rootclass : '';
        if(useClassName.indexOf('flex-grow-') == -1){
            useClassName += ' flex-grow-1';
        }
        if(useClassName.indexOf('flex-shrink-') == -1){
            useClassName += ' flex-shrink-0';
        }
        return (
            <div className={"d-flex btn-group " + useClassName}  style={this.props.style} ref={this.rootDivRef}>
                        {
                            this.props.editable ? <input onFocus={this.editableInputFocushandler} ref={this.editableInputRef} type='text' className='flex-grow-1 flex-shrink-1 flexinput' onChange={this.inputChangedHandler} onBlur={this.inputBlurHandler} value={inputValue} />
                            :
                            <button onClick={this.clickOpenHandler} style={{maxWidth:this.props.miniBtn ? 'calc(100% - 30px)' : '100%',minHeight:'38px'}} type='button' className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' d-flex btn flex-grow-1 flex-shrink-1' + (selectedOption == null ? ' text-danger' : '')} >
                                <div style={{overflow:'hidden'}} className='flex-grow-1 flex-shrink-1'>
                                    <div>{selectedOption ? selectedOption.text : '请选择'}</div>
                                </div>
                                </button>
                        }
                        {
                            this.props.miniBtn && <button ref={this.dropdownbtnRef} style={{width:'30px'}} type='button' onClick={this.clickOpenHandler} className={(this.props.btnclass ? this.props.btnclass : 'btn-dark') + ' btn flex-grow-0 flex-shrink-0 dropdown-toggle dropdown-toggle-split'} ></button>
                        }

                        <div className={"dropdown-menu " + (this.state.opened ? 'show' : '')} ref={this.dropmenudivRef}>
                            {(this.state.opened || this.state.options_arr.length > 0) && this.renderDropDown(filted_arr, selectedOption)}
                        </div>
            </div>
        );
    }
}
