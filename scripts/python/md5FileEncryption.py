import hashlib
import threading
import pymssql
import pandas as pd
import sys,io

class FileMd5(object):
    def __init__(self, **kwargs):
        self.path = kwargs.get('path')
        
        self.threadLock = threading.Lock()
        self.result = []
        self.salt = b''
    
    
    def transform(self,content):
        obj = hashlib.md5(self.salt)
        obj.update(content)
        ret = obj.hexdigest()
        return ret

    def work(self, paths):
        for path in paths:
            with open(path, 'rb') as f:
                content = f.read()
                ret = self.transform(content)
                self.threadLock.acquire()
                self.result.append({'path': path, 'md5': ret})
                self.threadLock.release()

    def start(self):
        if self.path:
            if isinstance(self.path, str):
                self.path = [self.path]
        else:
            self.path = []
        if len(self.path) > 3:
            offset = len(self.path) // 3
            arg1 = self.path[:offset]
            arg2 = self.path[offset:offset * 2]
            arg3 = self.path[offset * 2:]
            thread_1 = threading.Thread(target=self.work, args=(arg1,))
            thread_2 = threading.Thread(target=self.work, args=(arg2,))
            thread_3 = threading.Thread(target=self.work, args=(arg3,))
            threads = [thread_1, thread_2, thread_3]
            # 启动
            for t in threads:
                t.start()
            # 等待所有线程完成
            for t in threads:
                t.join()
        else:
            self.work(self.path)
        return self.result


def update(conn,cur, args: list):
    if not args:
        return
    print('update')
    arr = [(_dict['md5'], _dict['path']) for _dict in args]
    sql = 'update TB00C文件上传记录 set 电子指纹=%s where 电子令牌=%s'
    cur.executemany(sql, arr)
    conn.commit()


def connection():
    # 创建连接对象
    conn = pymssql.connect(host='erp.highbird.cn', server='erp.highbird.cn', port='9155', user='nizihua',
                           password='13o84x',
                           database='base1')

    cursor = conn.cursor(as_dict=True)

    sql = 'select * from TB00C文件上传记录 where len(电子指纹) = 0'

    cursor.execute(sql)
    # 列名
    columns = [name[0] for name in cursor.description]
    df = pd.DataFrame(cursor.fetchall(), columns=columns)
    length = df.shape[0]
    print(length)
    n = 1
    s = 0
    e = 100
    while True:
        dataframe = df.iloc[s:e, 9]
        paths = list(dataframe)
        print(paths)
        if not len(paths):
            break
        f = FileMd5(paths=paths)
        r = f.start()
        update(conn,cursor, r)
        n += 1
        s, e = e, 100 * n


    cursor.close()
    conn.close()


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    if len(argv) >2:
        filepath = argv[1]
        filestring = argv[2]
        autoBoolen = argv[3]
        if filepath:
            f= FileMd5(path=filepath)
            result = f.start()
            print('result:',result)
        elif filestring:
            f = FileMd5()
            result = f.transform(filestring)
            print('result:',result)
        else autoBoolen or str(autoBoolen) == 'True':
            # 自动
            connection()
            
