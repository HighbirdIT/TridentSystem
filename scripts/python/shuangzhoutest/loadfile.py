import os, re
import pandas as pd
import decimal
import numpy as np
from matplotlib import pyplot as plt


class Load_file:
    def __init__(self, path):
        self.path = path
        self.read_file()

    def read_file(self):
        """
        阅读文件
        :return: 一个包含所有数据 dataframe 对象
        """
        dict_text = {'Fx': [], 'Sx': [], 'Fy': [], 'Sy': []}
        size = os.path.getsize(self.path)
        fr = open(self.path, 'r')
        n = 0
        for i in fr.readlines():
            self.split_data(i, n, dict_text)
            n += 1
        df = pd.DataFrame(dict_text)
        # df.index += 1
        fr.close()
        return df

    @staticmethod
    def split_data(str_data, n, obj):
        """
        分割每行文本, 取出四列有用的数据加入对象
        :param n:
        :param obj:
        :param str_data:
        :return: dict
        """
        pattern = r'\s+'
        line = re.split(pattern, str_data)
        if n != 0:
            obj['Fx'].append(float(line[1:2][0]))
            obj['Sx'].append(float(line[4:5][0]))
            obj['Fy'].append(float(line[6:7][0]))
            obj['Sy'].append(float(line[9:10][0]))
        return obj

if __name__ == '__main__':
    filepath = 'C:/Users/Administrator/Documents/sourcefile/1-20202511092311.txt'
    obj_text = Load_file(filepath)
    print(obj_text.read_file())
