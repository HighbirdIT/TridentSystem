import pandas as pd
import numpy as np
import io, sys,os
import step2
from loadfile import Load_file
from dataprocess import Data_processed, identify_peak
import json
from step2 import Step_two
from draw import Draw_img
import random



class DataProcess(Data_processed):
    def __init__(self, original_data, start_index, filename):
        super().__init__(original_data, start_index, filename)

    def calculate_data(self, dir):
        # 先找 应力x，y 然后从起始值开始
        if dir == 'x':
            self.series_arr = self.original_data.loc[self.start_index:, 'Fx']
        elif dir == 'y':
            self.series_arr = self.original_data.loc[self.start_index:, 'Fy']
        return self.series_arr


class Switch(Step_two):
    def __init__(self, deviation_bool, area, force_range, original_data):
        super().__init__(deviation_bool, area, force_range, original_data)

    def process_2(self):
        self.standard_item_identity()

        min_i, max_i = self.area[0]

        # 选取第一区间所有值
        nx_series = self.fx_series.loc[min_i:max_i]
        ny_series = self.fy_series.loc[min_i:max_i]
        ex_series = self.sx_series.loc[min_i:max_i]
        ey_series = self.sy_series.loc[min_i:max_i]

        nx = (nx_series - self.fx_series[0]) / self.width
        ny = (ny_series - self.fy_series[0]) / self.width
        ex = (ex_series - self.sx_series[0]) / \
             (self.gauge_length + self.sx_series[self.first_index] - self.sx_series[0])
        ey = (ey_series - self.sy_series[0]) / \
             (self.gauge_length + self.sy_series[self.first_index] - self.sy_series[0])

        df_data = pd.DataFrame({'Nx': nx, 'Ny': ny, 'ex': ex, 'ey': ey})

        df_data = df_data[df_data['Nx'] <= 30]

        return df_data

def draw_pic(drawdata):
    try:
        drawpic = Draw_img(drawdata)
        rnd=int(random.random() * 1000)
        drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + 'tensile.png'
        drawpic.draw2()
    except Exception as err:
        
        return str(err)
    return str(rnd) + 'tensile.png'

def deal(config):
    errorInfo = ''
    force_max = float(config.get('force_max')) if config.get('force_max') else 100

    warp_tensile = float(config.get('warp_tensile'))
    mebrane_len = float(config.get('mebrane_len'))
    mebrane_width = float(config.get('mebrane_wid'))

    path = config.get('filepath')
    if path:
        try:
            data = Load_file(path)
        except Exception as err:
            return {'err': '读取文件错误'}

        process_data = DataProcess(data, 149, '(1)1:1')

        nx = process_data.calculate_data('x')
        ny = process_data.calculate_data('y')

        err_standard = process_data.check_standard()

        try:
            if not err_standard:
                errorInfo = '(1)1:1' + '文件比例错误;'
                raise ValueError('文件传入错误')
        except Exception as err:
            return {'err': repr(err)}

        area = identify_peak(nx)[0]
        # nx_mI = area[1]
        # ny_mI = identify_peak(ny)[0][1]

        # if nx_mI != ny_mI:
        #     # 没有在同一时刻取到最大值，取一个范围值
        #     if nx_mI < ny_mI:
        #         # 范围
        #         start_i = nx_mI - 1
        #         end_i = ny_mI + 1
        #     else:
        #         start_i = ny_mI - 1
        #         end_i = nx_mI + 1

        #     interval = (start_i, end_i)
        # else:
        #     interval = (nx_mI, ny_mI)

        step = Switch(True, [area], (-100, force_max), data.read_file())

        df = step.process_2()



        

        ex = df.iloc[-1, 2]
        ey = df.iloc[-1, 3]
        area_ratio = (1 + ex) * (1 + ey)

        warp_stretched_len = (warp_tensile - 1) * mebrane_len

        fill__tensile = area_ratio / warp_tensile

        fill_stretched_len = (fill__tensile - 1) * mebrane_width

        # 顺带画个图片
        draw = Step_two(True, [area], (-100, force_max), data.read_file())
        drawdf = draw.process_2()
        pic_path = draw_pic(drawdf)

        return {'ex': ex, 'ey': ey, 'area_ratio': area_ratio, 'fill_tensile': fill__tensile,
                'warp_stretched_len': warp_stretched_len, 'fill_stretched_len': fill_stretched_len,
                'pic_path':pic_path,'err': errorInfo}


if __name__ == '__main__':
    # argv = ['', "{'file_code': 156553, 'force_max': 30,'warp_tensile': 1.005, 'mebrane_len': 39979,'mebrane_wid': 3890,'filepath': '/Users/mac/Downloads/TridentSystem/public/filehouse/2022_7/3785D2FA-E4D7-46C2-9AEE-32EDB05FDC05.txt'}"
    #         ]
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv

    if len(argv) > 1:
        constr = argv[1]
        constr = constr.replace("'", '"')
        try:
            config = json.loads(constr)
            result = deal(config)
            print("result:", result)
        except Exception as err:
            # print(argv,'参数')
            print('err', err)

