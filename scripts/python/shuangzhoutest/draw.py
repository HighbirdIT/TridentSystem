from matplotlib import pyplot as plt
import numpy as np


class Draw_img:
    """
    画峰值图的类

    """
    figsize = 10, 7

    def __init__(self, data_frame, force_range=(2, 30), file_name='(1)1:1'):
        self.force_range = force_range
        self.data_frame = data_frame
        self.picName = 'unname'
        self.file_name = file_name

    def draw(self, Ext, Eyt, Vx, Vy, E):
        print('draw')
        self.figure, self.ax = plt.subplots(figsize=self.figsize, ncols=2, nrows=1)
        if self.force_range is not None:
            y_arr1 = np.array(np.arange(float(self.force_range[0]), float(self.force_range[1]), 1))
            y_arr2 = np.array(np.arange(float(self.force_range[0]) / 2, float(self.force_range[1]), 1) / 2)
            if self.file_name == '(2)2:1':
                Nx = y_arr1
                Ny = y_arr2
            elif self.file_name == '(4)1:2':
                Nx = y_arr2
                Ny = y_arr1
            elif self.file_name != '(6)1:0' and self.file_name != '(8)0:1':
                Nx = y_arr1
                Ny = y_arr1
        # 刻画fx，fy
        ex = np.array(self.data_frame['ex'])
        fx = np.array(self.data_frame['Nx'])
        ey = np.array(self.data_frame['ey'])
        fy = np.array(self.data_frame['Ny'])
        ex_max = 0.06 if len(ex) == 0 else (int(max(ex) * 100) + 1) / 100
        ex_min = -0.01 if len(ex) == 0 else (int(min(ex) * 100) - 1) / 100
        ey_max = 0.06 if len(ey) == 0 else (int(max(ey) * 100) + 1) / 100
        ey_min = -0.01 if len(ey) == 0 else (int(min(ey) * 100) - 1) / 100
        if ex_max <= 0.05:
            ex_max = 0.05
        if ex_min >= -0.01:
            ex_min = -0.01
        if ey_max <= 0.05:
            ey_max = 0.05
        if ey_min >= -0.01:
            ey_min =0.01

        ax1 = self.ax[0]

        # 设置子图的基本元素
        ax1.set_title('JX')  # 设置图体，plt.title
        ax1.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        ax1.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        plot1 = ax1.plot(ex, fx, linestyle='-', color='g', label='original')  # 点图：marker图标
        plot2 = ax1.plot(Nx / Ext - Ny / Eyt * Vy, Nx, linestyle='-', alpha=0.5, color='r',
                         label='experiment')  # 线图：linestyle线性，alpha透明度，color颜色，label图例文本
        ax1.set_xlim(ex_min, ex_max)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax1.set_ylim(0, 31)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        
        xmaloc = plt.MultipleLocator(0.01)
        xmiloc = plt.MultipleLocator(0.005)
        
        ymaloc = plt.MultipleLocator(2)
        ymiloc = plt.MultipleLocator(1)
        ax1.xaxis.set_major_locator(xmaloc)
        ax1.xaxis.set_minor_locator(xmiloc)
        ax1.yaxis.set_major_locator(ymaloc)
        ax1.yaxis.set_minor_locator(ymiloc)
        ax1.grid(which='both', axis='both', color='darkgray', linestyle='--', linewidth=0.75)
        ax1.legend(loc='upper left')

        ax2 = self.ax[1]
        ax2.set_title('WX')  # 设置图体，plt.title
        ax2.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        ax2.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        plot1 = ax2.plot(ey, fy, linestyle='-', color='g', label='original')  # 点图：marker图标
        plot2 = ax2.plot(Ny / Eyt - Nx / Ext * Vx, Ny, linestyle='-', alpha=0.5, color='r',
                         label='experiment')  # 线图：linestyle线性，alpha透明度，color颜色，label图例文本
        ax2.set_xlim(ey_min,ey_max)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax2.set_ylim(0, 31)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        xmaloc = plt.MultipleLocator(0.01)
        xmiloc = plt.MultipleLocator(0.005)

        ymaloc = plt.MultipleLocator(2)
        ymiloc = plt.MultipleLocator(1)
        ax2.xaxis.set_major_locator(xmaloc)
        ax2.xaxis.set_minor_locator(xmiloc)
        ax2.yaxis.set_major_locator(ymaloc)
        ax2.yaxis.set_minor_locator(ymiloc)
        ax2.grid(which='both', axis='both', color='darkgray', linestyle='--', linewidth=0.75)

        ax2.legend(loc='upper left')

        # plt.plot(ey, fy)
        #
        # plt.xlabel("strain(%)")
        # plt.ylabel("stress kN/m")
        # plt.legend()
        # plt.grid()
        # plt.yticks(range(-4, 14, 2))
        # plt.xticks(np.arange(-0.01, 0.04, 0.01))
        # print(self.start_index, '这是起始')
        plt.savefig(self.picName)

    def draw2(self):
        print('draw2')
        # 刻画fx，fy
        ex = np.array(self.data_frame['ex'])
        fx = np.array(self.data_frame['Nx'])
        ey = np.array(self.data_frame['ey'])
        fy = np.array(self.data_frame['Ny'])
        ex_max = (int(max(ex) * 100) + 1) / 100
        ex_min = (int(min(ex) * 100) - 1) / 100
        ey_max = (int(max(ey) * 100) + 1) / 100
        ey_min = (int(min(ey) * 100) - 1) / 100
        max_x = ex_max
        min_x = ex_min
        if ex_max < ey_max:
            max_x = ey_max
        if ex_min > ey_min:
            min_x = ey_min

        # print('min', min_x, 'max', max_x)

        plt.xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        plt.ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        plot1 = plt.plot(ex, fx, linestyle='-', color='b', label='Warp')  # 点图：marker图标
        plot1 = plt.plot(ey, fy, linestyle='-', color='y', label='Fill')  # 点图：marker图标
        plt.yticks(range(-4, 32, 2))
        plt.xticks(np.arange(min_x, max_x, 0.01))
        plt.grid(linestyle='--')
        plt.legend(loc='upper left')

        plt.savefig(self.picName)
