from matplotlib import pyplot as plt
import numpy as np


class Draw_img:
    """
    画峰值图的类

    """
    figsize = 10, 6

    def __init__(self, data_frame, force_range=(2,30), file_name='(1)1:1'):
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
        ax1 = self.ax[0]


        # 设置子图的基本元素
        ax1.set_title('JX')  # 设置图体，plt.title
        ax1.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        ax1.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        ax1.set_xlim(-0.01, 0.06, 0.01)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax1.set_ylim(-4, 32, 2)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        ax1.grid()
        plot1 = ax1.plot(ex, fx, linestyle='-', color='g', label='legend1')  # 点图：marker图标
        plot2 = ax1.plot(Nx / Ext - Ny / Eyt * Vy, Nx, linestyle='-', alpha=0.5, color='r',
                         label='legend2')  # 线图：linestyle线性，alpha透明度，color颜色，label图例文本
        ax1.legend(loc='upper left')

        ax2 = self.ax[1]
        ax2.set_title('WX')  # 设置图体，plt.title
        ax2.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        ax2.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        ax2.set_xlim(-0.01, 0.06, 0.01)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax2.set_ylim(-4, 32, 2)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        ax2.grid()
        plot1 = ax2.plot(ey, fy, linestyle='-', color='g', label='legend1')  # 点图：marker图标
        plot2 = ax2.plot(Ny / Eyt - Nx / Ext * Vx, Ny, linestyle='-', alpha=0.5, color='r',
                         label='legend2')  # 线图：linestyle线性，alpha透明度，color颜色，label图例文本
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
        
        plt.xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        plt.ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        plot1 = plt.plot(ex, fx, linestyle='-', color='b', label='Warp')  # 点图：marker图标
        plot1 = plt.plot(ey, fy, linestyle='-', color='y', label='Fill')  # 点图：marker图标
        plt.yticks(range(-4, 32, 2))
        plt.xticks(np.arange(-0.01, 0.06, 0.01))
        plt.grid()
        plt.legend(loc='upper left')

        plt.savefig(self.picName)
