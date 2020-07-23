import os, re
import pandas as pd
import decimal
import numpy as np
from matplotlib import pyplot as plt


class Step_two:
    """
    这个类就行第二步，进行4列数据的计算
    """

    def __init__(self, deviation_bool, area, force_range, original_data=None, file_index=1, width=160,
                 gauge_length=40):
        self.original_data = original_data
        self.calculate_data = original_data
        self.area = area
        self.file_index = file_index
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
        self.force_range = force_range  # 应力范围
        self.line_first_index = min(area)[0]
        self.line_point = {'nx': 0, 'ny': 0, 'ex': 0, 'ey': 0, 'ex1': 0, 'ey1': 0}

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
            self.first_index = min(self.area)[0]
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
        ex1 = []
        ey1 = []

        for index, value in self.fx_series.items():
            if self.check_area(index, self.area):
                nx = (value - self.standard_item_nx) / self.width
                Nx.append(nx)
                # print(index, value,self.standard_item_nx,'这',self.width,nx)
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

        if self.file_index == 4 or self.file_index == 8:
            ex1 = ex
            for i in range(len(Ny)):
                if len(Nx) != len(ex) or not len(ex) or not len(Nx):
                    print('新算法数组内为空 ，数值不对')
                else:
                    sy1 = ey[i] + (Ny[i] - 2) / 1300
                    ey1.append(sy1)
        else:
            ey1 = ey
            for i in range(len(Nx)):
                if len(Nx) != len(ex) or not len(ex) or not len(Nx):
                    print('新算法数组内为空 ，数值不对')
                else:
                    sx1 = ex[i] + (Nx[i] - 2) / 1800
                    ex1.append(sx1)

        dfdata = pd.DataFrame({'Nx': Nx, 'Ny': Ny, 'ex': ex, 'ey': ey})
        if self.file_index == 4 or self.file_index == 8:
            fdir = 'Ny'
        else:
            fdir = 'Nx'
        dfdata = dfdata[(dfdata[fdir] >= self.force_range[0]) & (dfdata[fdir] <= self.force_range[1])]
        return dfdata

    def process_2(self):
        self.standard_item_identity()
        Nx = []
        Ny = []
        ex = []
        ey = []
        ex1 = []
        ey1 = []

        for index, value in self.fx_series.items():
            nx = (value - self.nx_series[0]) / self.width
            Nx.append(nx)
            if index == self.line_first_index:
                self.line_point['nx'] = nx
                print(index, nx, '这个是起始点的坐标nx')
        for index, value in self.fy_series.items():
            ny = (value - self.ny_series[0]) / self.width
            Ny.append(ny)
            if index == self.line_first_index:
                self.line_point['ny'] = ny
        for index, value in self.sx_series.items():
            sx = (value - self.sx_series[0]) / \
                 (self.gauge_length + self.sx_series[self.first_index] - self.sx_series[0])
            ex.append(sx)
            if index == self.line_first_index:
                self.line_point['ex'] = sx
        for index, value in self.sy_series.items():
            sy = (value - self.sy_series[0]) / \
                 (self.gauge_length + self.sy_series[self.first_index] - self.sy_series[0])
            ey.append(sy)
            if index == self.line_first_index:
                self.line_point['ey'] = sy

        if self.file_index == 4 or self.file_index == 8:
            ex1 = ex
            self.line_point['ex1'] = self.line_point['ex']
            for i in range(len(Ny)):
                if len(Nx) != len(ex) or not len(ex) or not len(Nx):
                    print('新算法数组内为空 ，数值不对')
                else:
                    sy1 = ey[i] + (Ny[i] - 2) / 1300
                    ey1.append(sy1)
                    self.line_point['ey1'] = self.line_point['ey'] + (self.line_point['ny'] - 2) / 1300
        else:
            ey1 = ey
            self.line_point['ey1'] = self.line_point['ey']
            for i in range(len(Nx)):
                if len(Nx) != len(ex) or not len(ex) or not len(Nx):
                    print('新算法数组内为空 ，数值不对')
                else:
                    sx1 = ex[i] + (Nx[i] - 2) / 1800
                    ex1.append(sx1)
                    self.line_point['ex1'] = self.line_point['ex'] + (self.line_point['nx'] - 2) / 1800

        dfdata = pd.DataFrame({'Nx': Nx, 'Ny': Ny, 'ex': ex, 'ey': ey})
        if self.file_index == 4 or self.file_index == 8:
            fdir = 'Ny'
        else:
            fdir = 'Nx'
        dfdata = dfdata[(dfdata[fdir] >= self.force_range[0]) & (dfdata[fdir] <= self.force_range[1])]

        return dfdata

    # def process_3(self):
    #     self.standard_item_identity()
    #     Nx = []
    #     Ny = []
    #     ex = []
    #     ey = []
    #     ex1 = []
    #     ey1 = []
    #     for index, value in self.fx_series.items():
    #         nx = value / 160
    #         Nx.append(nx)
    #         if index == self.line_first_index:
    #             self.line_point['nx'] = nx
    #     for index, value in self.fy_series.items():
    #         ny = value / 160
    #         Ny.append(ny)
    #         if index == self.line_first_index:
    #             self.line_point['ny'] = ny
    #     for index, value in self.sx_series.items():
    #         sx = (value - self.sx_series[0]) / 40
    #         ex.append(sx)
    #         if index == self.line_first_index:
    #             self.line_point['ex'] = sx
    #     for index, value in self.sy_series.items():
    #         sy = (value - self.sy_series[0]) / 40
    #         ey.append(sy)
    #         if index == self.line_first_index:
    #             self.line_point['ey'] = sy
    # 
    #     #     1;2,0;1
    #     if self.file_index == 4 or self.file_index == 8:
    #         ex1 = ex
    #         self.line_point['ex1'] = self.line_point['ex']
    #         for i in range(len(Ny)):
    #             if len(Nx) != len(ex) or not len(ex) or not len(Nx):
    #                 print('新算法数组内为空 ，数值不对')
    #             else:
    #                 sy1 = ey[i] + (Ny[i] - 2) / 1300
    #                 ey1.append(sy1)
    #     else:
    #         ey1 = ey
    #         self.line_point['ey1'] = self.line_point['ey']
    #         for i in range(len(Nx)):
    #             if len(Nx) != len(ex) or not len(ex) or not len(Nx):
    #                 print('新算法数组内为空 ，数值不对')
    #             else:
    #                 sx1 = ex[i] + (Nx[i] - 2) / 1800
    #                 ex1.append(sx1)
    # 
    #     dfdata = pd.DataFrame({'Nx': Nx, 'Ny': Ny, 'ex': ex1, 'ey': ey1})
    #     if self.file_index == 4 or self.file_index == 8:
    #         fdir = 'Ny'
    #     else:
    #         fdir = 'Nx'
    #     dfdata = dfdata[(dfdata[fdir] >= self.force_range[0]) & (dfdata[fdir] <= self.force_range[1])]
    # 
    #     return dfdata

    @staticmethod
    def check_area(index, area_list):
        for area in area_list:
            start_i = area[0]
            end_i = area[1]
            if start_i <= index <= end_i:
                return True

    @staticmethod
    def write_text(data):
        pass
        # ,Nx,Ny,ex,ey
        # data.to_csv(r'originalFiles/test2.csv', mode='a', encoding='utf_8_sig', header=False, index=False)

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
