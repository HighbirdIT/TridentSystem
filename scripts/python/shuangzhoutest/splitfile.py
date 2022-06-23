import loadfile
import random
import json
import os
import io
import sys


class CarveUp:
    def __init__(self, obj):
        self.obj = obj
        self.series_fx = self.obj['Fx']
        self.series_fy = self.obj['Fy']
        self.data_dict = {'1': [], '2': [], '3': [], '4': [], '5': [], '6': [], '7': [], '8': []}
        self.data_list_1 = []
        self.data_list_2 = []
        self.data_list_3 = []
        self.data_list_4 = []
        self.data_list_5 = []
        self.data_list_6 = []
        self.data_list_7 = []
        self.data_list_8 = []

    def carve(self, series, start_i=0, num=48):
        end_i = self.obj.iloc[-1].name
        len = (end_i - start_i) // num
        print(len, 'len')
        area = 0
        area_list = [(start_i, 0)]
        while start_i < end_i:
            # loc 前闭后闭
            if area % 2 == 0:
                tamp = series.loc[start_i:start_i + len]
                max_ = max(tamp)
                # 对最大值进行检测
                
                # 根据最大值获取索引 这里需要加上索引的限制
                max_i = tamp.index[tamp == max_][0]
                area_list.append((max_i, max_))
                start_i += len + 1
            else:
                tamp = series.loc[start_i:start_i + len]
                min_ = min(tamp)
                min_i = tamp.index[tamp == min_][0]
                area_list.append((min_i, min_))
                start_i += len + 1
            area += 1
        list_ = self.organize_area(area_list)
        print(list_)
        # list_r = self.confirm_point(list_)
        return list_

    def get_result_list(self):
        final_dict = {}
        # 第一份文件
        print('---1')
        area_fx = self.carve(self.series_fx)
        # print(area_fx.__len__())
        final_dict['1'] = area_fx[0:3]
        _fx_point = self.confirm_point(area_fx)
        # print(_fx_point)
        # 第二文件
        print('---2')
        area_fy = self.carve(self.series_fy, start_i=_fx_point[0], num=42)
        # print(area_fy.__len__())
        final_dict['2'] = area_fy[0:3]
        _fy_point = self.confirm_point(area_fy)
        # 第三份文件往后
        area_fx = self.carve(self.series_fx, start_i=_fy_point[0], num=36)
        # print(area_fx.__len__())
        final_dict['3'] = area_fx[0:3]
        final_dict['4'] = area_fx[3:6]
        final_dict['5'] = area_fx[6:9]
        final_dict['6'] = area_fx[9:12]
        final_dict['7'] = area_fx[12:15]

        _fx_point = self.confirm_point(area_fx)
        # print(_fx_point)
        # 第八份文件
        area_fy = self.carve(self.series_fy, start_i=_fx_point[-1], num=6)
        final_dict['8'] = area_fy[0:3]
        # print(final_dict)
        return final_dict

    def check_peak(self, tup_peak, target_obj, area=400):
        """
        判断在一个数在数组内是否是最大值
        :param tup_peak:
        :param area:
        :param target_obj:
        :return: True False
        """
        area_start = tup_peak[0] - area
        area_end = tup_peak[0] + area
        # if tup_peak[0] in [149, 451, 750, 1051, 1350, 1650]:
        #     print(tup_peak)
        max_num = max(target_obj.loc[area_start:area_end])

        min_num = min(target_obj.loc[area_start:area_end])
        if tup_peak[1] == max_num:
            return True
        elif tup_peak[1] == min_num:
            return True
        return False

    @staticmethod
    def organize_area(list_):
        list_area = []
        for i in range(len(list_)):
            if i == len(list_) - 1:
                continue
            elif i % 2 == 0:
                list_area.append((list_[i][0], list_[i + 1][0]))
        return list_area

    @staticmethod
    def confirm_point(area):
        list_point = []
        for i in range(len(area)):
            if i % 3 == 0 and i != 0:
                list_point.append(area[i][0])
        return list_point

    def prepare_file(self, path):
        result_dict = self.get_result_list()
        area = result_dict['1'] + result_dict['2'] + result_dict['3'] + result_dict['4'] + result_dict['5'] + \
               result_dict['6'] + result_dict['7'] + result_dict['8']
        print(area)
        area = self.confirm_point(area)
        with open(path, 'r', encoding='utf8') as f:
            count = 0
            for line in f.readlines():
                if count == 0:
                    self.data_list_2.append(line)
                    self.data_list_3.append(line)
                    self.data_list_4.append(line)
                    self.data_list_5.append(line)
                    self.data_list_6.append(line)
                    self.data_list_7.append(line)
                    self.data_list_8.append(line)
                if count < area[0] + 1:
                    self.data_list_1.append(line)
                elif area[0] + 1 <= count < area[1] + 1:
                    self.data_list_2.append(line)
                elif area[1] + 1 <= count < area[2] + 1:
                    self.data_list_3.append(line)
                elif area[2] + 1 <= count < area[3] + 1:
                    self.data_list_4.append(line)
                elif area[3] + 1 <= count < area[4] + 1:
                    self.data_list_5.append(line)
                elif area[4] + 1 <= count < area[5] + 1:
                    self.data_list_6.append(line)
                elif area[5] + 1 <= count < area[6] + 1:
                    self.data_list_7.append(line)
                elif area[6] + 1 <= count:
                    self.data_list_8.append(line)

                count += 1

        return list

    def create_file(self):
        rootdir = os.path.dirname(__file__)
        print ("rootdir:" + rootdir)
        if not os.path.exists(rootdir + '/output'):
            os.mkdir(rootdir + '/output')
        os.chdir(rootdir)
        rndIndex = random.randint(1000,9000)
        filesinfo = {}
        self.save_file(str(rndIndex) + '@(1)1_1', self.data_list_1, 1, filesinfo);
        self.save_file(str(rndIndex) + '@(2)2_1', self.data_list_2, 2, filesinfo);
        self.save_file(str(rndIndex) + '@(3)1_1', self.data_list_3, 3, filesinfo);
        self.save_file(str(rndIndex) + '@(4)1_2', self.data_list_4, 4, filesinfo);
        self.save_file(str(rndIndex) + '@(5)1_1', self.data_list_5, 5, filesinfo);
        self.save_file(str(rndIndex) + '@(6)1_0', self.data_list_6, 6, filesinfo);
        self.save_file(str(rndIndex) + '@(7)1_1', self.data_list_7, 7, filesinfo);
        self.save_file(str(rndIndex) + '@(8)0_1', self.data_list_8, 8, filesinfo);
        print('files:' + json.dumps(filesinfo, ensure_ascii=False))
        return
                
    def save_file(self, name, data_list, index, filesinfo):
        filesinfo[str(index)] = 'output/' + name + '.txt'
        with open('output/' + name + '.txt', 'w') as fw:
            for data in data_list:
                fw.write(data)
        return
        


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    filepath = argv[1]
    
    #filepath = 'C:/Users/Administrator/Documents/nnn/20200703202854 法拉利1100.txt'
    obj_text = loadfile.Load_file(filepath).read_file()
    deal_file = CarveUp(obj_text)
    deal_file.prepare_file(filepath)
    deal_file.create_file()
    # deal_file.prepare_file(filepath, list_target, 1)

    # deal_file.create_file(filepath, list_point)
