import numpy as np
import pandas as pd


class Calculate:
    coefficient_dict = {}

    def __init__(self, data, proportion_relationship, file='a'):
        self.data = data
        self.proportion_relationship = proportion_relationship  # 是比列
        self.file = file  # 文件名
        self.Nx = np.array(self.data['Nx'])
        self.Ny = np.array(self.data['Ny'])
        self.ex = np.array(self.data['ex'])
        self.ey = np.array(self.data['ey'])
        self.a11 = 0  # 残差方程E11二次项系数
        self.b11 = 0  # 残差方程E11一次项系数
        self.a22 = 0  # 残差方程E22二次项系数
        self.b22 = 0  # 残差方程E22一次项系数
        self.a12 = 0  # 残差方程E12二次项系数
        self.b12 = 0  # 残差方程E12的交叉乘积项系数
        self.a = 0  # 残差方程E11 * E12和E12 * E22乘积项系数
        self.c = 0  # 残差方程常数项

    def __process(self):
        if self.proportion_relationship == 0:  # 1:1,2:1,1:2
            # print(self.Nx)
            self.a11 = sum(map(lambda x: pow(x, 2), self.Nx))
            print(self.a11)

            self.b11 = sum(-2 * self.Nx * self.ex)
            print(self.b11, 'b11')

            self.a22 = sum(map(lambda y: pow(y, 2), self.Ny))
            print(self.a22)

            self.b22 = sum(-2 * self.Ny * self.ey)
            print(self.b22, 'b22')

            self.a12 = sum(self.Nx ** 2 + self.Ny ** 2)
            print(self.a12)

            self.b12 = sum(self.Nx * self.ey + self.Ny * self.ex) * -2
            print('b12', self.b12)
            self.a = 2 * sum(self.Nx * self.Ny)
            print(self.a)

            self.c = sum(self.ey ** 2 + self.ex ** 2)
            print(self.c)
        if self.proportion_relationship == 1:  # Using data of tensile direction on warp only, for 0:1
            self.a22 = sum(map(lambda y: pow(y, 2), self.Ny))
            self.b22 = sum(-2 * self.Ny * self.ey)

        if self.proportion_relationship == 2:  # Using data of tensile direction on fill only, for 1:0
            self.a11 = sum(map(lambda x: pow(x, 2), self.Nx))
            self.b11 = sum(-2 * self.Nx * self.ex)

    def temp_coefficient(self, file):
        self.__process()
        tem_list = {'a11': self.a11, 'b11': self.b11, 'a22': self.a22, 'b22': self.b22
            , 'a12': self.a12, 'b12': self.b12, 'a': self.a}
        # self.coefficient_dict[self.file] = tem_list
        df = pd.DataFrame(tem_list, index=[0])
        #df.to_excel(r'originalFiles/%s.xls' % file, index=True, encoding='utf_8_sig')


class GetResult:
    def __init__(self, a11, b11, a22, b22, a12, b12, a,file_name):
        self.a11 = a11  # 残差方程E11二次项系数
        self.b11 = b11  # 残差方程E11一次项系数
        self.a22 = a22  # 残差方程E22二次项系数
        self.b22 = b22  # 残差方程E22一次项系数
        self.a12 = a12  # 残差方程E12二次项系数
        self.b12 = b12  # 残差方程E12的交叉乘积项系数
        self.a = a  # 残差方程E11 * E12和E12 * E22乘积项系数
        self.c = 0  # 残差方程常数项
        self.file_name=file_name
    def solving_equations(self):
        if self.file_name =='(6)1:0' :
            re = self.b11/self.a11
            return [re,0,0]
        elif self.filename == '(8)0:1':
            re = self.b22/self.a22
            return [0,re,0]
        else:
            arry_A = np.array([[float(2 * self.a11), 0, float(self.a)],
                            [0, float(2 * self.a22), float(self.a)],
                            [float(self.a), float(self.a), float(2 * self.a12)]])
            print(arry_A)
            arry_b = np.array([
                float(-self.b11),
                float(-self.b22),
                float(-self.b12)
            ])
            print(arry_b)

            arr_x = np.linalg.solve(arry_A, arry_b)
            print(arr_x, '--')
            return arr_x
