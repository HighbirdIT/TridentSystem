class SocketLink{
    constructor(outSocket, inSocket, pool){
        this.outID = outSocket.id;
        this.inID = inSocket.id;
        this.pool = pool;
        this.outSocket = outSocket;
        this.inSocket = inSocket;

        this.id = this.outID + '|L|' + this.inID;
        //this.revid = inID + '|L|' + outID;
    }

    fireChanged(){
        this.inSocket.fireLinkChanged();
        this.outSocket.fireLinkChanged();
    }

    straightOut(offsetX){
        var inSocket = this.inSocket;
        var outSocket = this.outSocket;
        if(outSocket.node.currentFrameCom == null || inSocket.node.currentFrameCom == null)
        {
            return;
        }
        if(isNaN(offsetX)){
            offsetX = 100;
        }
        var inSocketCenter = inSocket.currentComponent.getCenterPos();
        var outSocketCenter = outSocket.currentComponent.getCenterPos();
        var offset = {x:inSocketCenter.x - outSocketCenter.x, y:inSocketCenter.y - outSocketCenter.y};
        offset.x += offsetX;
        outSocket.node.setPos(outSocket.node.left + offset.x, outSocket.node.top + offset.y);
        outSocket.node.currentFrameCom.reDraw();
    }
}

class ScoketLinkPool{
    constructor(bluePrint){
        this.bluePrint = bluePrint;
        this.link_map = {};
    }

    _deleteLink(linkObj){
        if(this.link_map[linkObj.id] == null){
            return false; 
        }
        if(linkObj){
            this.link_map[linkObj.id] = null;
            delete this.link_map[linkObj.id];
            linkObj.fireChanged();

            linkObj.inSocket.node.linkRemoved(linkObj);
            linkObj.outSocket.node.linkRemoved(linkObj);
        }
        return true;
    }
    
    addLink(outSocket, inSocket){
        if(outSocket.isIn == inSocket.isIn){
            throw new Error("两个socket流方向不能一样");
        }
        if(outSocket.isIn){
            var t = outSocket;
            outSocket = inSocket;
            inSocket = t;
        }
        var id = outSocket.id + '|L|' + inSocket.id;
        if(this.link_map[id] == null){
            // 把已有的inSocket删除掉
            for(var si in this.link_map){
                var theLink = this.link_map[si];
                if(theLink == null)
                    continue;
                if(theLink.inSocket == inSocket){
                    this._deleteLink(this.link_map[si]);
                    break;
                }
            }
            var newLink = new SocketLink(outSocket, inSocket, this);
            this.link_map[id] = newLink;
            newLink.fireChanged();
            this.cacheData = null;
            this.bluePrint.fireChanged(10);
            
            inSocket.node.linkAdded(newLink);
            outSocket.node.linkAdded(newLink);
        }
        return this.link_map[id];
    }

    removeLink(link){
        if(this._deleteLink(link)){
            this.cacheData = null;
            this.bluePrint.fireChanged();
        }
    }

    clearNodeLink(theNode){
        var needClearids_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket.node == theNode || theLink.outSocket.node == theNode){
                needClearids_arr.push(si);
            }
        }
        if(needClearids_arr.length > 0){
            for(var si in needClearids_arr){
                var id = needClearids_arr[si];
                this._deleteLink(this.link_map[id])
            }
            this.cacheData = null
        }
        return needClearids_arr.length > 0;
    }

    clearSocketLink(theSocket){
        var needClearids_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket == theSocket || theLink.outSocket == theSocket){
                needClearids_arr.push(si);
            }
        }
        if(needClearids_arr.length > 0){
            for(var si in needClearids_arr){
                var id = needClearids_arr[si];
                this._deleteLink(this.link_map[id])
            }
            this.cacheData = null
        }
        return needClearids_arr.length > 0;
    }

    getLinksByNode(theNode, type){
        if(type == null){
            type = '*';
        }
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket.node == theNode){
                if(type == '*' || type == 'i'){
                    rlt_arr.push(theLink);
                }
            }
            else if(theLink.outSocket.node == theNode){
                if(type == '*' || type == 'o'){
                    rlt_arr.push(theLink);
                }
            }
        }
        return rlt_arr;
    }

    getLinksBySocket(theSocket){
        var rlt_arr = [];
        for(var si in this.link_map){
            var theLink = this.link_map[si];
            if(theLink == null)
                continue;
            if(theLink.inSocket == theSocket){
                rlt_arr.push(theLink);
            }
            else if(theLink.outSocket == theSocket){
                rlt_arr.push(theLink);
            }
        }
        return rlt_arr;
    }

    getAllLink(){
        if(this.cacheData == null){
            this.cacheData = [];
            for(var si in this.link_map){
                if(this.link_map[si]){
                    this.cacheData.push(this.link_map[si]);
                }
            }
        }
        return this.cacheData;
    }
}