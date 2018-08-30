function M_ContainerBase_tryPlaceKernel(theKernel, mousePos) {
    if(this.childContainerRef == null || this.childContainerRef.current == null){
        return false;
    }
    var childContainer_cr = this.childContainerRef.current.getBoundingClientRect();
    if (MyMath.isPointInRect(childContainer_cr, mousePos)) {
        //console.log('命中');
        var placedInChildren = this.props.ctlKernel.children.find(childData=>{
            if(childData && childData != theKernel && childData.currentControl && childData.currentControl.tryPlaceKernel != null){
                return childData.currentControl.tryPlaceKernel(theKernel, mousePos);
            }
        }) != null;
        if(!placedInChildren){
            this.props.ctlKernel.appandChild(theKernel);
        }
        return true;
    }
    else {
        if (theKernel.parent) {
            theKernel.parent.removeChild(theKernel);
        }
    }
    return false;
}

function M_ContainerBase(target){
    target.childContainerRef = React.createRef();

    target.tryPlaceKernel = M_ContainerBase_tryPlaceKernel.bind(target);
}

