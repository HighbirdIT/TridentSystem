import loadfile


class Data_processed:
    """
    原始文件筛选类
    """

    def __init__(self, original_data, start_index, force_dir):
        self.original_data = original_data.read_file()
        self.start_index = start_index
        # self.force_range = force_range
        self.force_dir = force_dir
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
        if self.force_dir == 'Fx':
            self.series_arr = self.original_data.loc[self.start_index:, 'Fx']
        elif self.force_dir == 'Fy':
            self.series_arr = self.original_data.loc[self.start_index:, 'Fy']
        # print(self.series_arr)
        return self.series_arr

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
        value = data_list[i][1]
        if index == data_series.index[0]:
            # 对起始数值是否为 低谷判断
            next = data_list[i + 1][1]
            if value < next:
                if check_peak((index, value), data_series):
                    peak_region.append(index)
                else:
                    continue
        elif index == data_series.index[-1]:
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
    max_num = max(target_obj.loc[area_start:area_end])
    min_num = min(target_obj.loc[area_start:area_end])
    if tup_peak[1] == max_num:
        return True
    elif tup_peak[1] == min_num:
        return True
    return False


if __name__ == '__main__':
    filepath = '/Users/mac/Desktop/膜材弹性常数计算说明/originalFiles/20200106145149 01447605A08-第一步.txt'
    obj_text = loadfile.Load_file(filepath)
    process_data = Data_processed(obj_text, 150, (0, 5000), 'Fx')
    print(process_data.draw_data())
