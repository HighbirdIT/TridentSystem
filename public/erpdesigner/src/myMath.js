const MyMath={
    isPointInRect:(targetRect, pt)=>{
        return pt.x >= targetRect.left && pt.x <= targetRect.right && pt.y >= targetRect.top && pt.y <= targetRect.bottom;
    }
}