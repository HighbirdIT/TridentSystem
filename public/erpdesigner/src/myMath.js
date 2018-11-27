const MyMath={
    isPointInRect:(targetRect, pt)=>{
        return pt.x >= targetRect.left && pt.x <= targetRect.right && pt.y >= targetRect.top && pt.y <= targetRect.bottom;
    },

    disBetweenPoint:(pt1,pt2)=>{
        if(pt1 == null || pt2 == null)
            return 0;
        return Math.sqrt(Math.pow(pt1.x - pt2.x,2) + Math.pow(pt1.y - pt2.y,2));
    },

    intersectRect:(r1, r2)=>{
        if(r1 == null || r2 == null)
            return false;
        return !(r2.left > r1.right || 
                 r2.right < r1.left || 
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top);
     },
}