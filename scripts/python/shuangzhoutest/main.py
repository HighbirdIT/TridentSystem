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
    area = config['Area']
    #area = '012'

    start_index = int(config['起始数据项'])
    force_range = (int(config['最小应力']), int(config['最大应力']))
    deviation_bool = config['偏移原点'] == '1'
    width = int(config['试样宽度'])  # 试样宽度
    gauge_length = int(config['测试标距'])  # 测试标距
    errorInfo = ''
    independent_list = []
    
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
        process_data = dataprocess.Data_processed(obj_text, start_index, fileName)
        calculate_data = process_data.calculate_data()
        err_standard = process_data.check_standard()
        if not err_standard:
            errorInfo += fileName + '文件比例错误;'
        list_area = dataprocess.identify_peak(calculate_data)
        print('list_area:', list_area)
        temp =[]
        for i in area:
            area_value = list_area[int(i)]
            temp.append(area_value)
        original_data = obj_text.read_file()
        step = step2.Step_two(deviation_bool, temp, force_range,original_data,index, width, gauge_length)
        step.standard_item_identity()
        result = step.process()
        drawdata = step.process_2()
        drawdata_li.append({'frame':drawdata, 'i':index,'force_range': force_range})        
        if fileName not in datafile_li:
            print('pass ' + fileName)
            continue
        coefficient = calculate.Calculate(result, proportion_relationship, index)
        coefficient.temp_coefficient('result1')
        final_dict['a11'] += coefficient.a11
        final_dict['b11'] += coefficient.b11  # 残差方程E11一次项系数
        final_dict['a22'] += coefficient.a22  # 残差方程E22二次项系数
        final_dict['b22'] += coefficient.b22  # 残差方程E22一次项系数
        final_dict['a12'] += coefficient.a12  # 残差方程E12二次项系数
        final_dict['b12'] += coefficient.b12  # 残差方程E12的交叉乘积项系数
        final_dict['a'] += coefficient.a  # 残差方程E11 * E12和E12 * E22乘积项系数

        independent_dict = {'a11': coefficient.a11, 'b11': coefficient.b11
            , 'a22': coefficient.a22, 'b22': coefficient.b22
            , 'a12': coefficient.a12, 'b12': coefficient.b12, 'a': coefficient.a,'filename':fileName}
        independent_list.append(independent_dict)
    return {
        'final_dict':final_dict,
        'errinfo':errorInfo,
        'independent_coefficient': independent_list
    }


def get_result(final_dict, fileName):
    a11 = final_dict['a11']
    b11 = final_dict['b11']
    a22 = final_dict['a22']
    b22 = final_dict['b22']
    a12 = final_dict['a12']
    b12 = final_dict['b12']
    a = final_dict['a']
    final = calculate.GetResult(a11, b11, a22, b22, a12, b12, a)
    e_tup = final.solving_equations(fileName)
    E11 = e_tup[0]
    E22 = e_tup[1]
    E12 = e_tup[2]
    Ext = 1 / E11 if E11!=0 else 0
    Eyt = 1 / E22 if E22!=0 else 0
    Vx = -E12 / E11 if E11!=0 else 0
    Vy = -E12 / E22 if E22!=0 else 0
    E = Vy - Vx / Ext * Eyt if Ext * Eyt!=0 else 0
    return {'E11':E11,'E22':E22,'E12':E12,'Ext':Ext,'Eyt':Eyt,'Vx':Vx,'Vy':Vy,'E':E}


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    #argv=['',r'{"files":["d:/work/TridentSystem/public/filehouse/2020_6/7EEBE5AC-3DCF-4F9F-8F42-A2512FCAACE4.txt","d:/work/TridentSystem/public/filehouse/2020_6/50100CB7-28D5-42D0-B235-237C1C80B746.txt","d:/work/TridentSystem/public/filehouse/2020_6/CAD62C08-E78E-4CFB-B5AC-D63CA462F1A9.txt","d:/work/TridentSystem/public/filehouse/2020_6/1CFA59C6-8C52-4A22-AF86-60DD11B30056.txt","d:/work/TridentSystem/public/filehouse/2020_6/BE42A7DB-3A47-4332-8C6E-371744052AF5.txt","d:/work/TridentSystem/public/filehouse/2020_6/1A867FD8-04E0-4A6C-AA52-07CD05EBD5A7.txt","d:/work/TridentSystem/public/filehouse/2020_6/415BE556-3EAA-4D46-B083-2037CEB9D742.txt","d:/work/TridentSystem/public/filehouse/2020_6/2A8985B6-AC43-4EAC-B184-F0A9FF1CA535.txt"],"names":["(1)1:1","(2)2:1","(3)1:1","(4)1:2","(5)1:1","(6)1:0","(7)1:1","(8)0:1"],"calfiles":["(1)1:1","(2)2:1","(3)1:1","(4)1:2","(5)1:1","(6)1:0","(7)1:1","(8)0:1"],"起始数据项":"149","试样宽度":"160","测试标距":"40","最小应力":"2","最大应力":"30","偏移原点":"1","Area":"0"}']
    constr = argv[1]
    constr = constr.replace("'",'"')
    #print(constr)
    config = json.loads(constr)
    #print(config)
    drawData_li = []
    midResult = walkFile(config,drawData_li)
    final_dict = midResult['final_dict']
    print('errinfo:{' + midResult['errinfo'] + '}')
    print('middata:' + str(final_dict))
    result = get_result(final_dict, '(1)1:1')
    print('result:'+str(result))
    independentResult_li = []
    for coefficient_dict in midResult['independent_coefficient']:
        independent_result = get_result(coefficient_dict, coefficient_dict['filename'])
        independent_result['file'] = coefficient_dict['filename']
        independentResult_li.append(independent_result)
        #print('每次单独的',independent_result,coefficient_dict['filename'])
    print('independentResult_li:' + json.dumps(independentResult_li, ensure_ascii=False))
    rnd=int(random.random() * 1000)
    picresult={}
    for drawData in drawData_li:
        drawpic = draw.Draw_img(drawData['frame'],drawData['force_range'],drawData['i'])
        drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + '_' + str(drawData['i']) + '.png'
        picresult['pic' + str(drawData['i'])] = str(rnd) + '_' + str(drawData['i']) + '.png'
        drawpic.draw(result['Ext'], result['Eyt'], result['Vx'], result['Vy'], result['E'])
    print ('picresult:' + json.dumps(picresult,ensure_ascii=False))


        

