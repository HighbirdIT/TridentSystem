import loadfile
import draw
import os
import io
import sys
import random
import step2

if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    argv = sys.argv
    #argv=['',r'd:\work\TridentSystem\public\filehouse\2020_5\6BFDB8E1-AB7E-49A6-8274-287B74BDDD78.txt']
    filePath = argv[1]

    lf = loadfile.Load_file(filePath)
    filedata = lf.read_file()
    step = step2.Step_two(1, [[149,600]], (0,6000), filedata, 160, 40)
    step.standard_item_identity()
    drawdata = step.process_2()
    drawpic = draw.Draw_img(drawdata)
    rnd=int(random.random() * 1000)
    drawpic.picName = os.path.dirname(__file__) + '/output/' + str(rnd) + '.png'
    drawpic.draw2()
    print ('picname:{' + str(rnd) + '.png}')


        

