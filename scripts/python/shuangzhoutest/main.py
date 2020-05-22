import calculate
import loadfile
import dataprocess
import draw
import step2
import os
import io
import sys
import random
import json


def walkFile(config, drawdata_li):
    final_dict = {'a11': 0, 'b11': 0, 'a22': 0, 'b22': 0, 'a12': 0, 'b12': 0, 'a': 0}
    
    path_li = config['files']
    name_li = config['names']
    datafile_li = config['calfiles']

    start_index = int(config['起始数据项'])
    force_range = (int(config['最小应力']), int(config['最大应力']))
    force_dir = config['参考方向']
    deviation_bool = config['偏移原点'] == 1
    width = int(config['试样宽度'])  # 试样宽度
    gauge_length = int(config['测试标距'])  # 测试标距
    
    for fi in range(0, len(path_li)):
        # root 表示当前正在访问的文件夹路径
        # dirs 表示该文件夹下的子目录名list
        # files 表示该文件夹下的文件list

        # 遍历文件
        filePath = path_li[fi]
        fileName = name_li[fi]
        proportion_relationship = 0
        index = int(fileName[1])
        if index == 6:
            proportion_relationship = 2
        elif index == 8:
            proportion_relationship = 1
        obj_text = loadfile.Load_file(filePath)
        #print('obj_text')
        #print(obj_text.read_file())
        process_data = dataprocess.Data_processed(obj_text, start_index, force_range, force_dir)
        calculate_data = process_data.calculate_data()
        list_area = dataprocess.identify_peak(calculate_data)
        area = list_area
        original_data = obj_text.read_file()
        step = step2.Step_two(deviation_bool, area, original_data, width, gauge_length)
        step.standard_item_identity()
        result = step.process()
        drawdata = step.process_2()
        drawdata_li.append({'frame':drawdata, 'i':index})        
        if fileName not in datafile_li:
            print('pass ' + fileName)
            continue
        coefficient = calculate.Calculate(result, proportion_relationship, 'text1')
        coefficient.load_coefficient('result1')
        final_dict['a11'] += coefficient.a11
        final_dict['b11'] += coefficient.b11  # 残差方程E11一次项系数
        final_dict['a22'] += coefficient.a22  # 残差方程E22二次项系数
        final_dict['b22'] += coefficient.b22  # 残差方程E22一次项系数
        final_dict['a12'] += coefficient.a12  # 残差方程E12二次项系数
        final_dict['b12'] += coefficient.b12  # 残差方程E12的交叉乘积项系数
        final_dict['a'] += coefficient.a  # 残差方程E11 * E12和E12 * E22乘积项系数
    return final_dict


def get_result(final_dict):
    a11 = final_dict['a11']
    b11 = final_dict['b11']
    a22 = final_dict['a22']
    b22 = final_dict['b22']
    a12 = final_dict['a12']
    b12 = final_dict['b12']
    a = final_dict['a']
    final = calculate.GetResult(a11, b11, a22, b22, a12, b12, a)
    e_tup = final.solving_equations()
    e_tup.tolist()
    E11 = e_tup[0]
    E22 = e_tup[1]
    E12 = e_tup[2]
    Ext = 1 / E11
    Eyt = 1 / E22
    Vx = -E12 / E11
    Vy = -E12 / E22
    E = Vy - Vx / Ext * Eyt
    return {'E11':E11,'E22':E22,'E12':E12,'Ext':Ext,'Eyt':Eyt,'Vx':Vx,'Vy':Vy,'E':E}


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    #argv=['',r'{"files":["d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\16D24B14-9039-4CA0-8D1B-7570D772FE2C.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\3FB417D9-C076-4393-9EEE-563971B787E7.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\62850C94-E0D1-4C92-AE86-44D21797B603.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\43BF1844-426E-41CE-A755-DB32A9F02038.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\A0944416-ED45-4CBC-86DF-ADC167D0C3E9.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\FA8C826E-2DD8-4181-B36E-311D4E398219.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\77AE1DE9-54AB-4DD1-855F-DD6F994D1DC4.txt","d:\\work\\TridentSystem\\public\\filehouse\\2020_5\\55AF9449-07AA-452A-A07E-73E6CC803C74.txt"],"names":["(1)1:1","(2)2:1","(3)1:1","(4)1:2","(5)1:1","(6)1:0","(7)1:1","(8)0:1"],"calfiles":["(3)1:1","(5)1:1"],"起始数据项":"149","试样宽度":"160","测试标距":"40","最小应力":"0","最大应力":"6000","参考方向":"Fx","偏移原点":"1"}']
    constr = argv[1]
    constr = constr.replace("'",'"')
    #print(constr)
    config = json.loads(constr)
    #print(config)
    drawData_li = []
    midResult = walkFile(config,drawData_li)
    print('middata:' + str(midResult))
    result = get_result(midResult)
    print('result:'+str(result))
    print(result)
    rnd=int(random.random() * 1000)
    picresult={}
    for drawData in drawData_li:
        drawpic = draw.Draw_img(drawData['frame'])
        drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + '_' + str(drawData['i']) + '.png'
        picresult['pic' + str(drawData['i'])] = str(rnd) + '_' + str(drawData['i']) + '.png'
        drawpic.draw(result['Ext'], result['Eyt'], result['Vx'], result['Vy'], result['E'])
    print ('picresult:' + json.dumps(picresult,ensure_ascii=False))


        

