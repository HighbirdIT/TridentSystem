import os, re
import pandas as pd
import decimal
import numpy as np
from matplotlib import pyplot as plt


class Step_two:
    """
    这个类就行第二步，进行4列数据的计算
    """

    def __init__(self, deviation_bool, area,force_range, original_data=None, width=160, gauge_length=40):
        self.original_data = original_data
        self.calculate_data = original_data
        self.area = area
        self.deviation_bool = deviation_bool  # 偏移原点
        self.width = width  # 试样宽度
        self.gauge_length = gauge_length  # 测试标距
        self.fx_series = None
        self.fy_series = None
        self.sx_series = None
        self.sy_series = None
        self.standard_item_nx = None  # x轴 基准项
        self.standard_item_ny = None  # y轴 基准项
        self.standard_item_sx = None  # x轴 基准项
        self.standard_item_sy = None  # y轴 基准项
        self.force_range = force_range
    

    def __carve_up(self):
        """
        将列表拆分成需要计算的四列
        :return:
        """
        if self.original_data is None:
            return
        else:
            self.fx_series = self.original_data['Fx']
            self.fy_series = self.original_data['Fy']
            self.sx_series = self.original_data['Sx']
            self.sy_series = self.original_data['Sy']

    def standard_item_identity(self):
        self.__carve_up()
        try:
            self.first_index = self.area[0][0]
        except Exception as err:
            print(err)
        if not self.deviation_bool:
            # 【基准项】=【初始项】数据的第0个
            self.standard_item_nx = self.fx_series[0]
            self.standard_item_ny = self.fy_series[0]
            self.standard_item_sx = self.sx_series[0]
            self.standard_item_sy = self.sy_series[0]
            print(self.standard_item_nx)
        elif self.deviation_bool:
            # 【基准项】=【起点项】数据筛选的第一个
            self.standard_item_nx = self.fx_series[self.first_index]
            self.standard_item_ny = self.fy_series[self.first_index]
            self.standard_item_sx = self.sx_series[self.first_index]
            self.standard_item_sy = self.sy_series[self.first_index]
            print('起点项' + str(self.standard_item_nx))

    def process(self):
        self.standard_item_identity()
        Nx = []
        Ny = []
        ex = []
        ey = []

        for index, value in self.fx_series.items():
            if self.check_area(index, self.area):
                nx = (value - self.standard_item_nx) / self.width
                Nx.append(nx)
                # print(index, value,self.standard_item_nx,'这',self.width)
        for index, value in self.fy_series.items():
            if self.check_area(index, self.area):
                ny = (value - self.standard_item_ny) / self.width
                Ny.append(ny)
        for index, value in self.sx_series.items():
            if self.check_area(index, self.area):
                sx = (value - self.standard_item_sx) / \
                     (self.gauge_length + self.sx_series[self.first_index] - self.sx_series[0])
                ex.append(sx)
        for index, value in self.sy_series.items():
            if self.check_area(index, self.area):
                sy = (value - self.standard_item_sy) / \
                     (self.gauge_length + self.sy_series[self.first_index] - self.sy_series[0])
                ey.append(sy)
        
        dfdata = pd.DataFrame({'Nx': Nx, 'Ny': Ny, 'ex': ex, 'ey': ey})
        dfdata = dfdata[(dfdata['Nx'] > self.force_range[0]) & (dfdata['Nx'] < self.force_range[1])]
        return dfdata

    def process_2(self):
        self.standard_item_identity()
        Nx = []
        Ny = []
        ex = []
        ey = []

        for index, value in self.fx_series.items():
            nx = (value - self.standard_item_nx) / self.width
            Nx.append(nx)
            # print(index, value,self.standard_item_nx,'这',self.width)
        for index, value in self.fy_series.items():
            ny = (value - self.standard_item_ny) / self.width
            Ny.append(ny)
        for index, value in self.sx_series.items():
            sx = (value - self.standard_item_sx) / \
                (self.gauge_length + self.sx_series[self.first_index] - self.sx_series[0])
            ex.append(sx)
        for index, value in self.sy_series.items():
            sy = (value - self.standard_item_sy) / \
                    (self.gauge_length + self.sy_series[self.first_index] - self.sy_series[0])
            ey.append(sy)
        return pd.DataFrame({'Nx': Nx, 'Ny': Ny, 'ex': ex, 'ey': ey})

    @staticmethod
    def check_area(index, area_list):
        for area in area_list:
            start_i = area[0]
            end_i = area[1]
            if start_i <= index <= end_i:
                return True

    @staticmethod
    def check_force(value,force_range):
        for force in force_range:
            min_force = force_range[0]
            max_force = force_range[1]
            if min_force <= value <= max_force:
                return True


    def write_text(self):
        data = self.process()
        #data.to_excel(r'originalFiles/result.xls', index=True, encoding='utf_8_sig')

    # def get_final(self):
    #     result = self.process()
    #     area_1 = self.area[0]
    #     area_2 = self.area[1]
    #     area_3 = self.area[2]
    #     Nx_arr = result['Nx'][area_1[0]:area_1[1]] + result['Nx'][area_2[0]:area_2[1]] + result['Nx'][
    #                                                                                      area_3[0]:area_3[1]]
    #     Ny_arr = result['Ny'][area_1[0]:area_1[1]] + result['Ny'][area_2[0]:area_2[1]] + result['Ny'][
    #                                                                                      area_3[0]:area_3[1]]
    #     ex_arr = result['ex'][area_1[0]:area_1[1]] + result['ex'][area_2[0]:area_2[1]] + result['ex'][
    #                                                                                      area_3[0]:area_3[1]]
    #     ey_arr = result['ey'][area_1[0]:area_1[1]] + result['ey'][area_2[0]:area_2[1]] + result['ey'][
    #                                                                                      area_3[0]:area_3[1]]
    #     return {'Nx': Nx_arr, 'Ny': Ny_arr, 'ex': ex_arr, 'ey': ey_arr}
