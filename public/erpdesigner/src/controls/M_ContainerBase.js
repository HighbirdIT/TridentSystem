function M_ContainerBase_tryPlaceKernel(theKernel, mousePos) {
    if(this.rootElemRef == null || this.rootElemRef.current == null){
        return false;
    }
    var selfKernel = this.props.ctlKernel;
    if(theKernel == selfKernel){
        return false;
    }
    if(theKernel.type == UserControlKernel_Type && selfKernel.type == UserControlKernel_Type){
        // 都是自订控件 要小心嵌套使用
        if(!selfKernel.isTemplate() || theKernel.isTemplate()){
            return false;
        }
        if(theKernel.refID == selfKernel.id){
            return false;
        }
    }
    var childContainer_cr = this.rootElemRef.current.getBoundingClientRect();
    if (MyMath.isPointInRect(childContainer_cr, mousePos)) {
        //console.log('命中');
        var placedInChildren = selfKernel.children.find(childData=>{
            if(childData && childData != theKernel && childData.currentControl && childData.currentControl.tryPlaceKernel != null){
                return childData.currentControl.tryPlaceKernel(theKernel, mousePos);
            }
        }) != null;

        if(!placedInChildren){
            if(theKernel.parent == selfKernel){

            }
            else if(theKernel.banReParent || selfKernel.staticChild || !selfKernel.canAppand(theKernel)){
                return false;
            }
            var selfIsHor = selfKernel.getAttribute(AttrNames.Orientation) == Orientation_H;
            var appandIndex = selfKernel.children.length;
            var theKernelNowIndex = -1;
            if(theKernel.parent == selfKernel){
                theKernelNowIndex = selfKernel.getChildIndex(theKernel);
            }
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
                            appandIndex = ci;
                        }
                        else{
                            var hitPercent = 0;
                            if(selfIsHor){
                                hitPercent = (mousePos.x - childRect.left) / (childRect.width);
                            }
                            else{
                                hitPercent = (mousePos.y - childRect.top) / (childRect.height);
                            }
                            appandIndex = hitPercent < 0.5 ? ci : ci + 1;
                            if(theKernelNowIndex != -1){
                                if(hitPercent < 0.5){
                                    if(theKernelNowIndex == appandIndex - 1){
                                        appandIndex = theKernelNowIndex;
                                    }
                                }
                            }
                            //console.log(Math.round(hitPercent * 100) + ',' + appandIndex);
                        }
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
            setTimeout(() => {
                theKernel.attrChanged('placeChanged');
            }, 10);
        }
        return true;
    }
    else {
        if (!theKernel.banReParent && selfKernel.parent == null && theKernel.parent) {
            theKernel.parent.removeChild(theKernel);
        }
    }
    return false;
}

function M_ContainerBase(target){
    target.tryPlaceKernel = M_ContainerBase_tryPlaceKernel.bind(target);
}

