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
import numpy as np



def walkFile(config, drawdata_li):
    final_dict = {'a11': 0, 'b11': 0, 'a22': 0, 'b22': 0, 'a12': 0, 'b12': 0, 'a': 0, 'c': 0}

    path_li = config['files']
    name_li = config['names']
    datafile_li = config['calfiles']
    area = config['Area']
    # area = '2'

    start_index = int(config['起始数据项'])
    force_range = (int(config['最小应力']), int(config['最大应力']))
    deviation_bool = config['偏移原点'] == '1'
    width = int(config['试样宽度'])  # 试样宽度
    gauge_length = int(config['测试标距'])  # 测试标距
    errorInfo = ''
    independent_list = []

    # x 轴范围
    xlabel_list = []

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
        # print('obj_text')
        # print(obj_text.read_file())
        process_data = dataprocess.Data_processed(obj_text, start_index, fileName)
        calculate_data = process_data.calculate_data()
        err_standard = process_data.check_standard()
        if not err_standard:
            errorInfo += fileName + '文件比例错误;'
        list_area = dataprocess.identify_peak(calculate_data)
        # print('上升区间', list_area)
        temp = []
        for i in area:
            area_value = list_area[int(i)]
            temp.append(area_value)
        # print(temp)
        original_data = obj_text.read_file()
        step = step2.Step_two(deviation_bool, temp, force_range, original_data, index, width, gauge_length)
        step.standard_item_identity()
        result = step.process()
        # 绘制图形的原始数据
        drawdata = step.process_2()

        # 刻画fx，fy
        ex = np.array(drawdata['ex'])
        ey = np.array(drawdata['ey'])
        if len(ex) == 0:
            ex = np.array([-0.01, 0.06])
        if len(ey) == 0:
            ey = np.array([-0.01, 0.06])

        xMax = np.max(ex) if np.max(ex) > np.max(ey) else np.max(ey)
        xMin = np.min(ex) if np.min(ex) < np.min(ey) else np.min(ey)
        xlabel_list.append(int(xMin * 100 - 1) / 100)
        xlabel_list.append(int(xMax * 100 + 1) / 100)
        print('--', )

        # 绘制图形数据写入文本
        # write_data = step.process_3()
        # drawdata = write_data
        # step.write_text(write_data)

        # 直线需要的起点
        line_point = step.line_point
        drawdata_li.append(
            {'frame': drawdata, 'i': index, 'force_range': force_range, 'area': temp, 'line_point': line_point})
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
        final_dict['c'] += coefficient.c
        independent_dict = {'a11': coefficient.a11, 'b11': coefficient.b11
            , 'a22': coefficient.a22, 'b22': coefficient.b22
            , 'a12': coefficient.a12, 'b12': coefficient.b12, 'a': coefficient.a, 'filename': fileName}
        independent_list.append(independent_dict)
    # 算出x轴最大最小值
    xlabelMinMax = (np.min(xlabel_list),np.max(xlabel_list))

    return {
        'final_dict': final_dict,
        'errinfo': errorInfo,
        'independent_coefficient': independent_list,
        'xlabelMinMax':xlabelMinMax
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
    Ext = 1 / E11 if E11 != 0 else 0
    Eyt = 1 / E22 if E22 != 0 else 0
    Vx = -E12 / E11 if E11 != 0 else 0
    Vy = -E12 / E22 if E22 != 0 else 0
    E = Vy - Vx / Ext * Eyt if Ext * Eyt != 0 else 0
    return {'E11': E11, 'E22': E22, 'E12': E12, 'Ext': Ext, 'Eyt': Eyt, 'Vx': Vx, 'Vy': Vy, 'E': E}


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    """
    argv = ['',
            r'{"files":["output/(1)1:1.text",'
            r'"output/(2)2:1.text","output/(3)1:1.text",'
            r'"output/(4)1:2.text","output/(5)1:1.text",'
            r'"output/(6)1:0.text","output/(7)1:1.text",'
            r'"output/(8)0:1.text"],'
            r'"names":["(1)1:1","(2)2:1","(3)1:1","(4)1:2","(5)1:1","(6)1:0","(7)1:1","(8)0:1"],'
            r'"calfiles":["(1)1:1","(2)2:1","(3)1:1","(4)1:2","(5)1:1","(6)1:0","(7)1:1","(8)0:1"],'
            r'"起始数据项":"149","试样宽度":"160","测试标距":"40","最小应力":"2","最大应力":"30","偏移原点":"1","Area":"21"}']
    """
    constr = argv[1]
    constr = constr.replace("'", '"')
    # print(constr)
    config = json.loads(constr)
    # print(config)
    drawData_li = []
    midResult = walkFile(config, drawData_li)
    final_dict = midResult['final_dict']
    print('errinfo:{' + midResult['errinfo'] + '}')
    print('middata:' + str(final_dict))
    result = get_result(final_dict, '(1)1:1')
    print('result:' + str(result))
    independentResult_li = []
    for coefficient_dict in midResult['independent_coefficient']:
        independent_result = get_result(coefficient_dict, coefficient_dict['filename'])
        independent_result['file'] = coefficient_dict['filename']
        independentResult_li.append(independent_result)
        # print('每次单独的',independent_result,coefficient_dict['filename'])
    print('independentResult_li:' + json.dumps(independentResult_li, ensure_ascii=False))
    rnd = int(random.random() * 1000)
    picresult = {}
    for drawData in drawData_li:
        drawpic = draw.Draw_img(drawData['frame'], drawData['force_range'], drawData['i'], drawData['line_point'])
        drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + '_' + str(drawData['i']) + '.png'
        picresult['pic' + str(drawData['i'])] = str(rnd) + '_' + str(drawData['i']) + '.png'
        drawpic.draw(result['Ext'], result['Eyt'], result['Vx'], result['Vy'], result['E'],midResult['xlabelMinMax'])

    print('picresult:' + json.dumps(picresult, ensure_ascii=False))
