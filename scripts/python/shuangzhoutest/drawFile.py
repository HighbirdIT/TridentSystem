import loadfile
import draw
import os
import io
import sys
import random

if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    #argv=['',r'D:\work\TridentSystem\public\filehouse\2020_5\1A63D269-455B-4EA5-9006-59413E512405.txt']
    filePath = argv[1]

    lf = loadfile.Load_file(filePath)
    filedata = lf.read_file()
    step = step2.Step_two(deviation_bool, area, force_range,original_data, width, gauge_length)
    step.standard_item_identity()
    drawdata = step.process_2()
    drawpic = draw.Draw_img(filedata)
    rnd=int(random.random() * 1000)
    drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + '.png'
    drawpic.draw2()
    print ('picname:{' + str(rnd) + '.png}')


        

