/*
document.getElementById('pageTabsContainer').innerHTML="<div class='navbar-brand'>PageOne</div>";

document.getElementById('pageContentContainer').innerHTML="<div class='d-flex h-100'>\
<div class='flex-grow-0' style='width:100px'>Toolbar</div>\
<div class='flex-grow-1 bg-info'>Page</div>\
<div class='flex-grow-0' style='width:200px'>Props</div>\
</div>";
*/

/*
    <div class="w-100 h-100 d-flex flex-column">
        <div id="mainMenuContainer" class="flex-grow-0 bg-primary">
            <div>主菜单</div>
        </div>
        <div class="flex-grow-1 h-100" style="overflow:auto">
            <div class="d-flex flex-column h-100">
                <div class="flex-grow-0 bg-" id="pageTabsContainer">

                </div>
                <div class="flex-grow-1 h-100" style="overflow:auto" id="pageContentContainer">
                    
                </div>
            </div>
        </div>
        <div class="flex-grow-0 bg-info">页脚</div>
    </div>
*/

window.addEventListener('mousemove',(ev)=>{
    WindowMouse.x = ev.x;
    WindowMouse.y = ev.y;
});

class ErpDesigner extends React.PureComponent{
    constructor(props){
        super(props);
        this.state={
            configDataIsLoaded:false,
        };

        //fetchJsonPost('onlineinterview_process', { action: 'pageinit' }, 'pageiniting')
    }
    render(){
        return(
            <div id="designerroot" {...this.props}>
                <TipWindow />
                <MainMenu />
                <div className="flex-grow-1 flex-shrink-1 d-flex flex-column minh-0" style={{overflow:"hidden"}}>
                    <ProjectContainer />
                </div>
                <StatusBar />
            </div>
        );
    }
}

ReactDOM.render(<ErpDesigner className="w-100 h-100 d-flex flex-column minh-0"/>, document.getElementById('reactRoot'));