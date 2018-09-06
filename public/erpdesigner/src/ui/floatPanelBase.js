class FloatPanelbase extends React.PureComponent{
    constructor(props){
        super(props);

        this.state={
            show:this.props.initShow == true,
            maximum:false,
        };
        this.rootDivRef = React.createRef();
        this.rootSize = {
            x:0,
            y:0,
            width:300,
            height:300,
            first:true,
        }
        autoBind(this);
    }

    mousemoveWidthMoveHandler(ev){
        var newX = this.moveBase.x + ev.x;
        var newY = this.moveBase.y + ev.y;
        if(newX<0){
            newX = 0;
        }else{
            //var rootWidth = $(this.rootDivRef.current).width();
            //var newRight = newX + rootWidth;
            var newLeft = newX - this.moveBase.x;
            var windWidth =  $(window).width();
            if(newLeft > windWidth - 100){
                newX = windWidth - 100;
            }
        }
        if(newY<0){
            newY = 0;
        }
        else{
            //var rootHeight = $(this.rootDivRef.current).height();
            //var newBottom = newY + rootHeight;
            var newTop = newY - this.moveBase.y;
            var windheight =  $(window).height();
            if(newTop > windheight - 100){
                newY = windheight - 100 - rootHeight;
            }
        }
        this.rootDivRef.current.style.left = newX + 'px';
        this.rootDivRef.current.style.top = newY + 'px';

        this.rootSize.x = newX;
        this.rootSize.y = newY;
    }

    mouseupWidthMoveHandler(ev){
        window.removeEventListener('mousemove',this.mousemoveWidthMoveHandler);
        window.removeEventListener('mouseup',this.mouseupWidthMoveHandler);
    }

    moveBarMouseDownHandler(ev){
        if(this.state.maximum)
            return;
        var rootPosition = $(this.rootDivRef.current).position();
        this.moveBase={x:(rootPosition.left - WindowMouse.x),y:rootPosition.top - WindowMouse.y};
        window.addEventListener('mousemove',this.mousemoveWidthMoveHandler);
        window.addEventListener('mouseup',this.mouseupWidthMoveHandler);
    }

    sizeBtnMouseDownHandler(ev){
        var $rootDivRef = $(this.rootDivRef.current);
        this.sizeBase={x:WindowMouse.x,y: WindowMouse.y, width:$rootDivRef.width(), height:$rootDivRef.height(), pos:$rootDivRef.position()};
        window.addEventListener('mousemove',this.mousemoveWidthSizeHandler);
        window.addEventListener('mouseup',this.mouseupWidthSizeHandler);
    }

    mouseupWidthSizeHandler(ev){
        window.removeEventListener('mousemove',this.mousemoveWidthSizeHandler);
        window.removeEventListener('mouseup',this.mouseupWidthSizeHandler);
    }

    mousemoveWidthSizeHandler(ev){
        var newWidth = this.sizeBase.width + (ev.x - this.sizeBase.x);
        var newHeight = this.sizeBase.height + (ev.y - this.sizeBase.y);

        var $window = $(window);

        if(newWidth < 200){
            newWidth = 200;
        }
        else{
            var newRight = this.sizeBase.pos.left + newWidth;
            if(newRight > $window.width()){
                newWidth = $window.width() - this.sizeBase.pos.left;
            }
        }
        if(newHeight < 200){
            newHeight = 200;
        }
        else{
            var newBottom = this.sizeBase.pos.top + newHeight;
            if(newBottom > $window.height()){
                newHeight = $window.height() - this.sizeBase.pos.top;
            }
        }

        this.rootDivRef.current.style.width = newWidth + 'px';
        this.rootDivRef.current.style.height = newHeight + 'px';

        this.rootSize.width = newWidth;
        this.rootSize.height = newHeight;
    }

    close(){
        this.setState({show:false});
    }

    show(){
        this.setState({show:true});
    }

    toggle(){
        this.setState({show:!this.state.show});
    }

    toggleMaximum(){
        this.setState({maximum:!this.state.maximum});
    }

    render() {
        if(!this.state.show){
            return null;
        }
        
        var windWidth = $(window).width();
        var windHeight = $(window).height();
        var rootStyle;
        if(this.state.maximum)
        {
            rootStyle = {
                left:'0px',
                top:'0px',
                width:windWidth + 'px',
                height:windHeight + 'px',
            };
        }
        else{
            if(this.rootSize.first){
                this.rootSize.width = Math.round(windWidth * 0.5);
                this.rootSize.height = Math.round(windHeight * 0.5);
                this.rootSize.x = Math.round((windWidth - this.rootSize.width) * 0.5);
                this.rootSize.y = Math.round((windHeight - this.rootSize.height) * 0.5);
                this.rootSize.first = false;
            }
            else{
                if(this.rootSize.x > windWidth){
                    this.rootSize.x = windWidth - 100;
                }
                if(this.rootSize.y > windHeight){
                    this.rootSize.y = windHeight - 100;
                }
            }
            rootStyle = {
                left:this.rootSize.x + 'px',
                top:this.rootSize.y + 'px',
                width:this.rootSize.width + 'px',
                height:this.rootSize.height + 'px',
            };
        }
        return(
            <div className='floatPanel' ref={this.rootDivRef} style={rootStyle}>
                <div className='d-flex w-100 h-100 flex-column bg-secondary'>
                    <div className='d-flex flex-grow-0 flex-shrink-0 paneltitle align-items-baseline'>
                        <span className='icon icon-bars' />
                        <div className='flex-grow-1 flex-shrink-1 panelMoveBar' onMouseDown={this.moveBarMouseDownHandler}>
                        {this.props.title}
                        </div>
                        <span className={'icon icon-' + (this.state.maximum ? 'pages' : 'stop')} style={{cursor:'pointer'}} onClick={this.toggleMaximum}  />
                        <span className='icon icon-close' style={{cursor:'pointer'}} onClick={this.close} />
                    </div>
                    <div className='flex-grow-1 flex-shrink-1 d-flex flex-column'>
                        {
                            this.props.children
                        }
                    </div>
                    {
                        !this.state.maximum && <button type='button' className='panelSizeBtn' onMouseDown={this.sizeBtnMouseDownHandler} />
                    }
                </div>
            </div>
        );
    }
}
