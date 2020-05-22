import xlrd
import pandas as pd
import os.path
import json
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
argv = sys.argv
#argv=['',r'D:\work\TridentSystem\public\filehouse\2020_5\EB5D6D85-430D-404F-8836-9FF3D1FCE0EC.xlsx',r'D:\work\TridentSystem\filedata\longprocess\0a90161c-2af0-1935-5e96-af63888ff7b2_t.json']
filepath = argv[1]
jsonPath = argv[2]

data = xlrd.open_workbook(filepath, encoding_override='utf8')
rlt_json = {}
rows_arr=[]
headers_arr=[]

firtSheet = data.sheet_names()[0]
table = pd.read_excel(filepath, sheet_name=firtSheet)
#print(table)
list_column = []
for column in table:
    for rowi in range(len(table[column])):
        if len(rows_arr) <= rowi:
            rows_arr.append({})
        row=rows_arr[rowi]
        row[column]=str(table[column][rowi] if str(table[column][rowi]) != 'nan' else '')
    headers_arr.append(column)
rlt_json['headers'] = headers_arr
rlt_json['rows'] = rows_arr

#print(rlt_json)
with open(jsonPath, 'w', encoding='utf8') as file:
    file.write(json.dumps(rlt_json,ensure_ascii=False))
print('OK',end='')
