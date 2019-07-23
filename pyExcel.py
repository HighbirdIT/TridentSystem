from xlutils.copy import copy
import xlrd
import xlwt
import json
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

infor_arr = sys.argv
line_index = int(sys.argv[1])
downloadurl=str(sys.argv[2])
try:
    oldexcel = xlrd.open_workbook(downloadurl)
except:
    workbook = xlwt.Workbook(encoding='utf-8')       #新建工作簿
    sheet = workbook.add_sheet("数据表格",cell_overwrite_ok=True)
else:
    workbook = copy(oldexcel)
    sheet = workbook.get_sheet(0)  # 取sheet表
    sheet1 = oldexcel.sheet_by_index(0)  # sheet索引从0开始
    print(sheet1.name, sheet1.nrows, sheet1.ncols)
  

for index in range(0, len(infor_arr)):
    print(index, infor_arr[index])
    if index > 2:
        cells_arr = infor_arr[index].split(":")
        column_name = cells_arr[0]
        column_value = cells_arr[1]
        r = int(line_index+1)
        d = int(index-3)
        sheet.write(r, d, label=column_value)
        if line_index == 0:
            sheet.write(0,d,column_name)
workbook.save(downloadurl)
print('sucess')