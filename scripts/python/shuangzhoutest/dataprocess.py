import loadfile
from matplotlib import pyplot as plt
import numpy as np


class Data_processed:
    """
    原始文件筛选类
    """

    def __init__(self, original_data, start_index, filename):
        self.original_data = original_data.read_file()
        self.start_index = start_index
        self.filename = filename
        self.series_arr = []
        # self.__process()

    # def __process(self):
    #     # 传入应力的最大最小范围进行过滤
    #     self.original_data = self.original_data[(self.original_data[self.force_dir] > self.force_range[0]) & (
    #             self.original_data[self.force_dir] < self.force_range[1])]
    #     # 先找 应力x，y 然后从起始值开始
    #     # if self.force_dir == 'Fx':
    #     #     self.series_arr = self.original_data.loc[self.start_index:, 'Fx']
    #     # elif self.force_dir == 'Fy':
    #     #     self.series_arr = self.original_data.loc[self.start_index:, 'Fy']
    #     # print(self.series_arr)
    #     return self.original_data

    def calculate_data(self):
        # 先找 应力x，y 然后从起始值开始
        if self.filename == '(4)1:2' or self.filename == '(8)0:1':
            self.series_arr = self.original_data.loc[self.start_index:, 'Fy']
        else:
            self.series_arr = self.original_data.loc[self.start_index:, 'Fx']
        print(self.series_arr)
        # plt.plot(self.series_arr)
        # plt.show()
        return self.series_arr

    def check_standard(self):
        fx_arr = self.original_data.loc[self.start_index:, 'Fx']
        fy_arr = self.original_data.loc[self.start_index:, 'Fy']
        fx_max = max(fx_arr)
        fy_max = max(fy_arr)
        print('max:', fx_max, fy_max)
        difference = 0
        if self.filename == '(2)2:1':
            difference = fx_max - 2 * fy_max if (fx_max - 2 * fy_max) > 0 else 2 * fy_max - fx_max
        elif self.filename == '(4)1:2':
            difference = 2 * fx_max - fy_max if (2 * fx_max - fy_max) > 0 else fy_max - 2 * fx_max
        elif self.filename != '(6)1:0' and self.filename != '(8)0:1':
            difference = (fx_max - fy_max) if (fx_max - fy_max) > 0 else fy_max - fx_max
        print('计算的结果：', float(difference) / fx_max)
        if float(difference) / fx_max <= 0.3:
            return True

    def draw_data(self):
        return self.original_data[['Fx', 'Fy']].loc[self.start_index:]

    def original_data(self):
        return self.original_data


def identify_peak(data_series):
    """
    寻找峰值 根据 x，y方向寻找峰值
    :param data_series:
    :return: 一个包含三个元组的数组
    """
    peak_region = []
    # print(data_series.index[-1], '----')
    data_list = list(data_series.items())
    for i in range(len(data_list)):
        # for index, value in list(data_series.items()):
        index = data_list[i][0]
        # print(index,'index')
        value = data_list[i][1]
        # print(index, value)
        if index == data_series.index[0]:
            # 对起始数值是否为 低谷判断
            next = data_list[i + 1][1]
            if value < next:
                if check_peak((index, value), data_series):
                    peak_region.append(index)
                else:
                    continue
        elif index == data_series.index[-1]:
            up = data_list[i - 1][1]
            if value > up:
                #     对最后一个值的判断
                if check_peak((index, value), data_series):
                    peak_region.append(index)
                else:
                    continue
        else:
            up = data_list[i - 1][1]
            next = data_list[i + 1][1]
            if (value > up and value > next) or (value < up and value < next):
                # 判断前后是否他就是最大
                if check_peak((index, value), data_series):
                    peak_region.append(index)
                else:
                    continue
    # print(peak_region)
    list_area = []
    for i in range(len(peak_region)):
        # python 字典在3.6之前无序
        if i == len(peak_region) - 1:
            continue
        if i % 2 == 0:
            list_area.append((peak_region[i], peak_region[i + 1]))
    return list_area


def check_peak(tup_peak, target_obj, area=150):
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
    # global list_
    # if tup_peak[0] == 1054:
    #     list_ = target_obj.loc[900:1200]
    #     print(list_)
    min_num = min(target_obj.loc[area_start:area_end])
    if tup_peak[1] == max_num:
        return True
    elif tup_peak[1] == min_num:
        return True
    return False


if __name__ == '__main__':
    filepath = 'originalFiles/sourcefile/20200703202854 法拉利1100.txt'
    obj_text = loadfile.Load_file(filepath)
    process = Data_processed(obj_text, 149, '(7)1:1')
    data = process.calculate_data()
    print(identify_peak(data))
