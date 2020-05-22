from matplotlib import pyplot as plt
import numpy as np


class Draw_img:
    """
    画峰值图的类

    """
    figsize = 7, 4

    def __init__(self, data_frame):
        self.data_frame = data_frame
        self.picName = 'unname'


    def draw(self, Ext, Eyt, Vx, Vy, E):
        self.figure, self.ax = plt.subplots(figsize=self.figsize, ncols=2, nrows=1)
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
        ax1.set_xlim(-0.01, 0.04, 0.01)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax1.set_ylim(-4, 14, 2)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        ax1.grid()
        plot1 = ax1.plot(ex, fx, linestyle='-', color='g', label='legend1')  # 点图：marker图标
        plot2 = ax1.plot(ex, (ex + fy / Eyt * Vy)*Ext, linestyle='-', alpha=0.5, color='r',
                         label='legend2')  # 线图：linestyle线性，alpha透明度，color颜色，label图例文本
        ax1.legend(loc='upper left')

        ax2 = self.ax[1]
        ax2.set_title('WX')  # 设置图体，plt.title
        ax2.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
        ax2.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
        ax2.set_xlim(-0.01, 0.04, 0.01)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
        ax2.set_ylim(-4, 14, 2)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
        ax2.grid()
        plot1 = ax2.plot(ey, fy, linestyle='-', color='g', label='legend1')  # 点图：marker图标
        plot2 = ax2.plot(ey, (ey + fx / Ext * Vx) * Eyt, linestyle='-', alpha=0.5, color='r',
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
            self.figure, self.ax = plt.subplots(figsize=self.figsize, ncols=1, nrows=1)
            # 刻画fx，fy
            ex = np.array(self.data_frame['Sx'])
            fx = np.array(self.data_frame['Fx'])
            ey = np.array(self.data_frame['Sy'])
            fy = np.array(self.data_frame['Fy'])

            # 设置子图的基本元素
            #plt.set_title('JX')  # 设置图体，plt.title
            #plt.set_xlabel("strain(%)")  # 设置x轴名称,plt.xlabel
            #plt.set_ylabel("stress kN/m")  # 设置y轴名称,plt.ylabel
            #plt.set_xlim(-0.01, 0.04, 0.01)  # 设置横轴范围，会覆盖上面的横坐标,plt.xlim
            #plt.set_ylim(-4, 14, 2)  # 设置纵轴范围，会覆盖上面的纵坐标,plt.ylim
            plt.grid()
            plot1 = plt.plot(ex, fx, linestyle='-', color='b', label='Warp')  # 点图：marker图标
            plot1 = plt.plot(ey, fy, linestyle='-', color='y', label='Fill')  # 点图：marker图标
            plt.legend(loc='upper left')

            plt.savefig(self.picName)