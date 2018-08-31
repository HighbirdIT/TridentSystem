function M_ContainerBase_tryPlaceKernel(theKernel, mousePos) {
    if(this.rootElemRef == null || this.rootElemRef.current == null){
        return false;
    }
    var selfKernel = this.props.ctlKernel;
    var childContainer_cr = this.rootElemRef.current.getBoundingClientRect();
    if (MyMath.isPointInRect(childContainer_cr, mousePos)) {
        //console.log('命中');
        var placedInChildren = selfKernel.children.find(childData=>{
            if(childData && childData != theKernel && childData.currentControl && childData.currentControl.tryPlaceKernel != null){
                return childData.currentControl.tryPlaceKernel(theKernel, mousePos);
            }
        }) != null;

        if(!placedInChildren){
            var parentIsHor = (selfKernel.parent == null ? selfKernel.orientation : selfKernel.parent.orientation) == '水平';
            var appandIndex = selfKernel.children.length;
            var hitplacing = false;
            //if(horContainer){
                for(var ci = 0; ci < selfKernel.children.length; ++ci){
                    var childKernel = selfKernel.children[ci];
                    var childControl = childKernel.currentControl;
                    if(childControl == null)
                        continue;
                    var childRootElem = childControl.rootElemRef.current;
                    if(childRootElem == null)
                        continue;
                    var childRect = childRootElem.getBoundingClientRect();
                    if (MyMath.isPointInRect(childRect, mousePos)){
                        // hit the child
                        
                        if(childKernel == theKernel)
                        {
                            hitplacing = true;
                        }
                        
                        appandIndex = ci;
                        break;
                    }
                }
            //}
            /*
            if(theKernel.children && selfKernel.children && selfKernel.children.parent.children.length == 0 && selfKernel.parent && (appandIndex == selfKernel.children.length || hitplacing)){
                var percent = parentIsHor ? (mousePos.x - childContainer_cr.left) / childContainer_cr.width : (mousePos.y - childContainer_cr.top) / childContainer_cr.height;
                console.log(percent);
                if(percent > 0.9){
                    selfKernel.parent.appandChild(theKernel);
                    return true;
                }
            }
            */
            this.props.ctlKernel.appandChild(theKernel,appandIndex);
        }
        return true;
    }
    else {
        if (selfKernel.parent == null && theKernel.parent) {
            theKernel.parent.removeChild(theKernel);
        }
    }
    return false;
}

function M_ContainerBase(target){
    target.tryPlaceKernel = M_ContainerBase_tryPlaceKernel.bind(target);
}

