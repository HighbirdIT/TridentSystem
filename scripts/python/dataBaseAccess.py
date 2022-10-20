import pymssql
import pandas as pd


class SqlData(object):
    def __init__(self, sql):
        self.sql = sql
        self.__data = None
        self.__len = None
        self.connection()

    def connection(self):
        # 创建连接对象
        try:
            conn = pymssql.connect(host='erp.highbird.cn', server='erp.highbird.cn', port='9155',
                                   user='python_tinyreader',
                                   password='9THH2uJX3Mz3',
                                   database='base1', charset='utf8')

            cursor = conn.cursor(as_dict=True)

            cursor.execute(self.sql)
            columns = [name[0] for name in cursor.description]
            df = pd.DataFrame(cursor.fetchall(), columns=columns)
            self.__len = df.shape[0]
            self.__data = df

        except Exception as err:
            raise ValueError('err:', 'sql交互出现问题 ', str(err))

    @property
    def data(self):
        return self.__data

    @property
    def length(self):
        return self.__len
