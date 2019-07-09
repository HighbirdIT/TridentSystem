class SelectItemManager{
    constructor(addCallBack,removeCallBack){
        this.items_arr = [];
        this.removeCallBack = removeCallBack;
        this.addCallBack = addCallBack;

        autoBind(this);
    }

    getIndex(item){
        return this.items_arr.indexOf(item);
    }

    isSelected(item){
        return this.getIndex(item) != -1;
    }

    add(item){
        if(item == null)
            return false;
        var index = this.getIndex(item);
        if(index == -1){
            this.items_arr.push(item);
            if(this.addCallBack != null){
                this.addCallBack(item);
            }
        }
        return true;
    }

    remove(item){
        var index = this.getIndex(item);
        if(index == -1){
            return false;
        }
        if(this.removeCallBack != null){
            this.removeCallBack(item);
        }
        this.items_arr.splice(index, 1);
        return true;
    }

    clear(bBrigerCallBack){
        if(this.items_arr.length == 0)
            return;
        if(this.removeCallBack != null && bBrigerCallBack != false){
            this.forEach(this.removeCallBack);
        }
        this.items_arr = [];
    }

    forEach(act){
        this.items_arr.forEach(act);
    }

    isEmpty(){
        return this.count() == 0;
    }

    count(){
        return this.items_arr.length;
    }
}



class C_SelectRect extends React.PureComponent{
    constructor(props){
        super(props);
        autoBind(this);

        this.state = {
            left:0,
            top:0,
            width:0,
            height:0
        }
    }

    setSize(size){
        this.setState(size);
    }

    getRect(){
        var nowSize = this.state;
        var rlt = {
            left:this.state.left + (nowSize.width < 0 ? nowSize.width : 0),
            top:this.state.top + (nowSize.height < 0 ? nowSize.height : 0),
            width:Math.abs(this.state.width),
            height:Math.abs(this.state.height)
        }
        rlt.right = rlt.left + rlt.width;
        rlt.bottom = rlt.top + rlt.height;
        return rlt;
    }

    render(){
        if(this.state.width == 0 || this.state.height == 0)
            return null;
        
        var nowSize = this.state;
        var style = {
            left:this.state.left + (nowSize.width < 0 ? nowSize.width : 0) + 'px',
            top:this.state.top + (nowSize.height < 0 ? nowSize.height : 0) +'px',
            width:Math.abs(this.state.width) + 'px',
            height:Math.abs(this.state.height) + 'px',
        }
        return <div className='selectRect' style={style} />
    }
}