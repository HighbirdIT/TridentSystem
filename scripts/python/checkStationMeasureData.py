import math
import sys
import io
import functools
import os
import json
import HBGeometry

class Anchor:
    def __init__(self,code,name,X,Y,Z):
        self.loc = HBGeometry.Point3d(X,Y,Z)
        self.name = name
        self.code = code

class MeasureData:
    def __init__(self,inLoc,inStation,inIndex):
        self.loc = inLoc
        self.station = inStation
        self.index = inIndex
        self.后序号 = None
        self.前序号 = None
        self.anchor = None
    @staticmethod
    def SortData(a,b):
        return a.index - b.index
    @property
    def 标记序号(self):
        if self.后序号 != None:
            return '后%d'%self.后序号
        if self.前序号 != None:
            return '前%d'%self.前序号
        return '测点%d'%self.index

class MeasureDataLinkNode:
    def __init__(self,md,dis):
        self.md = md
        self.dis = dis

class MeasureDataLink:
    def __init__(self):
        self.node_arr = []
        self.baseMD = None

    def append(self,md):
        if self.baseMD == None:
            self.baseMD = md
        else:
            self.node_arr.append(MeasureDataLinkNode(md,self.baseMD.loc.DistanceTo(md.loc)))

    def compare(self, other):
        rlt = 0
        dif_arr = []
        if len(self.node_arr) != len(other.node_arr):
            rlt = -1
        else:
            for i in range(len(self.node_arr)):
                dif = self.node_arr[i].dis - other.node_arr[i].dis
                rlt += abs(dif)
                dif_arr.append(dif)
        return (rlt,dif_arr)

    @staticmethod
    def Sort(a,b):
        return a.dis - b.dis
    
    @staticmethod
    def Create(md_arr):
        rlt_arr = []
        for i in range(0,len(md_arr)):
            md_i = md_arr[i]
            link = MeasureDataLink()
            rlt_arr.append(link)
            link.append(md_i)
            for j in range(0,len(md_arr)):
                md_j = md_arr[j]
                if md_i == md_j:
                    continue
                link.append(md_j)
            link.node_arr.sort(key=functools.cmp_to_key(MeasureDataLink.Sort))
        return rlt_arr


class StationData:
    def __init__(self):
        self.name = None
        self.loc = None
        self.measures_arr = []

    def IsValid(self):
        return self.loc != None and len(self.measures_arr) > 0
    
    def Get前测点_arr(self):
        return self.measures_arr[:4]
    
    def Get后测点_arr(self):
        return self.measures_arr[-4:]

    @staticmethod
    def CreateFromFile(filePath, factor, anchor_arr, anchor_dic):
        newData = StationData()
        newData.name = os.path.basename(os.path.splitext(filePath)[0])
        ms_dic = {}
        with open(filePath, 'r', encoding='utf-8') as f:
            while True:
                line = f.readline()
                if line == None or len(line) == 0:
                    break
                # print(line)
                if line[0] == 'A':
                    t_arr = line.split(',')
                    newData.loc = HBGeometry.Point3d(float(t_arr[3]) * factor,float(t_arr[2]) * factor,float(t_arr[4]) * factor)
                elif line[0] == 'F':
                    t_arr = line.split(',')
                    temPt = HBGeometry.Point3d(float(t_arr[9]) * factor,float(t_arr[8]) * factor,float(t_arr[10]) * factor)
                    md = MeasureData(temPt,newData,int(t_arr[1]))
                    newData.measures_arr.append(md)
                    ms_dic[md.index] = md
        newData.measures_arr.sort(key=functools.cmp_to_key(MeasureData.SortData))
        msCount = len(newData.measures_arr)
        for i in range(4):
            newData.measures_arr[i].前序号 = i + 1
            newData.measures_arr[msCount - (4-i)].后序号 = i + 1
        if len(anchor_arr) > 0 and len(newData.measures_arr) >= 8:
            for a in anchor_arr:
                # print(a)
                aIndex = a['index']
                aCode = a['anchorCode']
                if aIndex < 0:
                    aKey = a['key']
                    if aKey[0] == '前':
                        aIndex = newData.measures_arr[int(aKey[1])-1].index
                    else:
                        aIndex = newData.measures_arr[msCount - 5 + int(aKey[1])].index
                anchor = anchor_dic[int(aCode)]
                ms = ms_dic[aIndex]
                ms.anchor = anchor
                # print('pre:%d,%d,%d'%(ms.loc.X,ms.loc.Y,ms.loc.Z))
                ms.loc.Z -= int(a['offsetZ'])
                # print('aft:%d,%d,%d'%(ms.loc.X,ms.loc.Y,ms.loc.Z))
                # print('%s->%s:%s'%(ms_dic[aIndex].index,anchor.name,anchor.code))
        return newData
    @staticmethod
    def CheckDataValid(doSelfCheck, checkData, data_pre, maxDif, minDistance, minVDistance,specTip):
        errList = []
        if doSelfCheck:
            if checkData.loc == None:
                errList.append('%s没有A坐标'%(checkData.name))
                return errList
            if len(checkData.measures_arr) < 8:
                errList.append('%s的测量数据只有%d个，至少需要8个'%(checkData.name,len(checkData.measures_arr)))
                return errList
            if data_pre != None and len(data_pre.measures_arr) < 8:
                errList.append('%s的测量数据只有%d个，至少需要8个'%(data_pre.name,len(data_pre.measures_arr)))
                return errList
            preIndex = checkData.measures_arr[0].index
            for mi in range(1,len(checkData.measures_arr)):
                ms = checkData.measures_arr[mi]
                if ms.index - preIndex != 1:
                    errList.append('测点%s之后是测点%s,测量点序号必须是连续的'%(preIndex,ms.index))
                preIndex = ms.index

            for step in range(2):
                if step == 0:
                    if data_pre == None:
                        #没有前置站点，不检测前控点
                        continue
                    ms_arr = checkData.measures_arr[:4]
                else:
                    ms_arr = checkData.measures_arr[-4:]
                for mi in range(len(ms_arr)-1):
                    ms_i = ms_arr[mi]
                    for mj in range(mi+1,len(ms_arr)):
                        ms_j = ms_arr[mj]
                        dis = ms_i.loc.DistanceTo(ms_j.loc)
                        #print('点%s和点%s的间距是%d'%(ms_i.index,ms_j.index,dis))
                        if dis < minDistance:
                            errList.append('%s和%s的间距 = %d'%(ms_i.标记序号,ms_j.标记序号,dis))
            for step in range(2):
                tested_dic = {}
                if step == 0:
                    if data_pre == None:
                        #没有前置站点，不检测前控点
                        continue
                    ms_arr = checkData.measures_arr[:4]
                else:
                    ms_arr = checkData.measures_arr[-4:]
                for mi in range(len(ms_arr)-1):
                    ms_i = ms_arr[mi]
                    for mj in range(mi+1,len(ms_arr)):
                        ms_j = ms_arr[mj]
                        连线 = HBGeometry.Line3.create(Start=ms_i.loc,End=ms_j.loc)
                        for ms in ms_arr:
                            if ms in [ms_i,ms_j]:
                                continue
                            t_arr = [ms_i.index,ms_j.index,ms.index]
                            t_arr.sort()
                            for i in range(len(t_arr)):
                                t_arr[i] = str(t_arr[i])
                            testKey = '-'.join(t_arr)
                            if testKey in tested_dic:
                                # print('jump:%s'%testKey)
                                continue
                            dis = 连线.distanceTo(ms.loc)
                            if dis < minVDistance:
                                errList.append('%s到%s和%s的连线垂距 = %d'%(ms.标记序号,ms_i.标记序号,ms_j.标记序号,dis))
                            # print('test:%s  dis:%d'%(testKey, dis))
                            tested_dic[testKey] = 1
            withAnchorMs_arr = []
            for ms in checkData.measures_arr:
                if ms.anchor != None:
                    withAnchorMs_arr.append(ms)
            for i in range(len(withAnchorMs_arr) - 1):
                ms_i = withAnchorMs_arr[i]
                for j in range(i+1,len(withAnchorMs_arr)):
                    ms_j = withAnchorMs_arr[j]
                    dis = ms_i.loc.DistanceTo(ms_j.loc)
                    standDis = ms_i.anchor.loc.DistanceTo(ms_j.anchor.loc)
                    # print('dis:%d,standDis:%d'%(dis,standDis))
                    if abs(dis - standDis) > maxDif:
                        errList.append('"锚%s"(%s)到"锚%s"(%s)的间距是%d,和设计值%d相比偏差%d'%(ms_i.anchor.name,ms_i.标记序号,ms_j.anchor.name,ms_j.标记序号,dis,standDis,dis - standDis))

            if len(errList) > 0:
                return errList
        #print('data_pre:%s'%(data_pre))
        if data_pre == None:
            return errList
        links_pre = MeasureDataLink.Create(data_pre.measures_arr[-4:])
        links_this = MeasureDataLink.Create(checkData.measures_arr[:4])
        
        minScore = 9999999999
        useThisLink = None
        usePreLink = None
        linkDif_arr = None
        for thisLink in links_this:
            for preLink in links_pre:
                compare_rlt = thisLink.compare(preLink)
                if compare_rlt[0] >= 0 and compare_rlt[0] < minScore:
                    minScore = compare_rlt[0]
                    useThisLink = thisLink
                    usePreLink = preLink
                    linkDif_arr = compare_rlt[1]
        isValid = True
        for v in linkDif_arr:
            if abs(v) > maxDif:
                isValid = False
                break
        print(linkDif_arr)
        if not isValid:
            errInfo = '%s的测量数据和%s相比，存在以下偏差:\n'%(checkData.name, data_pre.name)
            for i in range(len(useThisLink.node_arr)):
                node_this = useThisLink.node_arr[i]
                node_pre = usePreLink.node_arr[i]
                errInfo += '%s和%s的间距是%d,相较%s的%s和%s的间距%d,偏差%d\n'%(useThisLink.baseMD.标记序号,node_this.md.标记序号,node_this.dis,specTip,usePreLink.baseMD.标记序号,node_pre.md.标记序号,node_pre.dis,linkDif_arr[i])
            errList.append(errInfo)
        return errList

if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    # argv = ['',
    #         '{"fileName":"1-2-1",'
    #         '"filePath":"C:/Users/Administrator/Downloads/121.MES",'
    #         '"preFileName":"1-1-1",'
    #         '"preFilePath":"C:/Users/Administrator/Downloads/111.MES",'
    #         '"aftFileName":"",'
    #         '"aftFilePath":"",'
    #         '"maxDif":"10",'
    #         '"minVDistance":"2000",'
    #         '"anchor_arr":[{"code":3,"name":"1","X":-50588,"Y":127153,"Z":10693},{"code":4,"name":"2","X":-81868,"Y":107382,"Z":10692},{"code":5,"name":"3","X":18219,"Y":-137871,"Z":10661},{"code":6,"name":"4","X":68969,"Y":-119474,"Z":10739},{"code":1,"name":"5","X":36863,"Y":132806,"Z":10673},{"code":2,"name":"6","X":-103435,"Y":-81558,"Z":10688},{"code":7,"name":"7","X":124377,"Y":-36693,"Z":10700},{"code":8,"name":"8","X":116036,"Y":60383,"Z":10689},{"code":9,"name":"9","X":84225,"Y":104782,"Z":10706},{"code":10,"name":"10","X":-31440,"Y":-135247,"Z":10679},{"code":11,"name":"11","X":-127629,"Y":-18481,"Z":10701},{"code":12,"name":"12","X":-126598,"Y":28816,"Z":10693}],'
    #         '"preAnchor_arr":[{"index":50,"anchorCode":9,"offsetZ":1300},{"index":51,"anchorCode":1,"offsetZ":2150}],'
    #         '"nxtAnchor_arr":[],'
    #         '"thisAnchor_arr":[{"index":-1,"key":"前4","anchorCode":"1","offsetZ":"2150"},{"index":-1,"key":"后3","anchorCode":"1","offsetZ":"2150"},{"index":-1,"key":"后4","anchorCode":"9","offsetZ":"1300"},{"index":-1,"key":"前3","anchorCode":"9","offsetZ":"1300"}],'
    #         '"minDistance":"2000"'
    #         '}']

    constr = argv[1]
    # print(constr)
    constr = constr.replace("'", '"')
    config = json.loads(constr)

    fileName = config['fileName']
    filePath = config['filePath']
    preFileName = config['preFileName']
    preFilePath = config['preFilePath']
    aftFileName = config['aftFileName']
    aftFilePath = config['aftFilePath']
    maxDif = int(config['maxDif'])
    minDistance = int(config['minDistance'])
    minVDistance = int(config['minVDistance'])
    thisAnchor_arr = config['thisAnchor_arr']
    preAnchor_arr = config['preAnchor_arr']
    nxtAnchor_arr = config['nxtAnchor_arr']
    anchor_arr = config['anchor_arr']
    anchor_dic = {}
    for a in anchor_arr:
        anchor_dic[a['code']] = Anchor(a['code'],a['name'],a['X'],a['Y'],a['Z'])
    #print(anchor_dic[1])

    result = {}
    if not os.path.exists(filePath):
        result['err'] = '"%s"的数据文件"%s"未在服务器找到'%(fileName,os.path.basename(filePath))
    else:
        sd_this = StationData.CreateFromFile(filePath, 1000, thisAnchor_arr, anchor_dic)
        sd_this.name = fileName
        sd_pre = None
        if len(preFilePath) > 0:
            print()
            if not os.path.exists(preFilePath):
                result['err'] = '"%s"的数据文件"%s"未在服务器找到'%(preFileName,os.path.basename(preFilePath))
            else:
                sd_pre = StationData.CreateFromFile(preFilePath, 1000, preAnchor_arr, anchor_dic)
                sd_pre.name = preFileName
        #print(sd_pre)
        if 'err' not in result:
            checkRlt = StationData.CheckDataValid(True,sd_this,sd_pre,maxDif,minDistance,minVDistance,'前个站点')
            if len(checkRlt) > 0:
                result['errList'] = checkRlt
        
        if 'err' not in result:
            sd_aft = None
            if len(aftFilePath) > 0:
                if not os.path.exists(aftFilePath):
                    result['err'] = '"%s"的数据文件"%s"未在服务器找到'%(aftFileName,os.path.basename(aftFilePath))
                else:
                    sd_aft = StationData.CreateFromFile(aftFilePath, 1000, nxtAnchor_arr, anchor_dic)
                    sd_aft.name = preFileName
            if 'err' not in result and sd_aft != None:
                checkRlt = StationData.CheckDataValid(False,sd_aft,sd_this,maxDif,minDistance,minVDistance,'后个站点')
                if len(checkRlt) > 0:
                    result['errList'] = checkRlt

        if 'err' not in result and 'errList' not in result:
            result['baseX'] = sd_this.loc.X
            result['baseY'] = sd_this.loc.Y
            result['baseZ'] = sd_this.loc.Z
            rcd_arr = []
            result['rcd_arr'] = rcd_arr
            for m in sd_this.measures_arr:
                m_obj = {}
                rcd_arr.append(m_obj)
                m_obj['index'] = m.index
                m_obj['X'] = m.loc.X
                m_obj['Y'] = m.loc.Y
                m_obj['Z'] = m.loc.Z
    print('<result>' + json.dumps(result, ensure_ascii=False) + "</result>")
