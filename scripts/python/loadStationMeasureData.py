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
    def __init__(self,inLoc,inStation,inIndex,flatDis):
        self.loc = inLoc
        self.station = inStation
        self.index = inIndex
        self.后序号 = None
        self.前序号 = None
        self.anchor = None
        self.flatDis = flatDis
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
    def CreateFromFile(filePath, factor):
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
                    newData.measures_arr = []
                elif line[0] == 'F':
                    t_arr = line.split(',')
                    temPt = HBGeometry.Point3d(float(t_arr[9]) * factor,float(t_arr[8]) * factor,float(t_arr[10]) * factor)
                    md = MeasureData(temPt,newData,int(t_arr[1]),float(t_arr[4]) * factor)
                    newData.measures_arr.append(md)
                    ms_dic[md.index] = md
        newData.measures_arr.sort(key=functools.cmp_to_key(MeasureData.SortData))
        return newData

if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    # argv = ['',
    #         '{'
    #         '"filePath":"C:/Users/Administrator/Downloads/20.MES"'
    #         '}']

    constr = argv[1]
    # print(constr)
    constr = constr.replace("'", '"')
    config = json.loads(constr)

    filePath = config['filePath']
    result = {}
    if not os.path.exists(filePath):
        result['err'] = '"%s"的数据文件"%s"未在服务器找到'%(fileName,os.path.basename(filePath))
    else:
        sd_this = StationData.CreateFromFile(filePath, 1000)
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
            m_obj['flatDis'] = m.flatDis
    print('<result>' + json.dumps(result, ensure_ascii=False) + "</result>")
