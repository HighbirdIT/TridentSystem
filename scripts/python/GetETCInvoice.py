import poplib,datetime,os,zipfile,shutil,imapclient,imaplib,base64,pyzmail,json
from email.parser import Parser # 解码邮件信息
from email.header import decode_header, Header # 解析邮件主题
from email.utils import parseaddr # 解析发件人详情，名称及地址
from pdfocr import *
import fitz
import sys
import io

def get_email_content(Email_host,Email_user,Email_password):
    imaplib._MAXLINE = 10000000
    imapObj = imapclient.IMAPClient(Email_host,ssl=True)
    imapObj.login(Email_user,Email_password)
    imapObj.select_folder('INBOX',readonly=False)
    UIDs = imapObj.search(['UNSEEN'])
    return UIDs,imapObj

def get_email_UNSEEN(UIDs,imapObj,Email_Sender, path):
    readUIDs_li = []
    
    for UID in UIDs:
        try:
            uidDir = path + 'UID' + str(UID) + '\\'
            rawMessages = imapObj.fetch(UID,['BODY[]'])
            message = pyzmail.PyzMessage.factory(rawMessages[UID][b'BODY[]'])
            EmailFrom = message.get_address('from')[1]
            if EmailFrom == Email_Sender:
                fileList, errmsg = get_attachment_lists(message,path,UID)
                file_JOSN = {}
                invoice_li = []
                file_JOSN['invoices'] = invoice_li
                if errmsg != None and len(fileList)>0:
                    for filepath in fileList:
                        filesname = file_name(filepath)
                        for theFile in filesname:
                            data = Extractor(theFile).extract()
                            invoiceNum = data['发票号码']
                            invoice_li.append(data)
                            pdf_image(theFile,uidDir,2,2,0,invoiceNum)
        except IOError as eo:
            errmsg = str(eo)
        file_JOSN['errmsg'] = errmsg if errmsg != None else '无'
        f = open(uidDir + 'invoice_info.json','w',encoding='utf-8')
        #print(file_JOSN)
        json.dump(file_JOSN,f, sort_keys=True, indent=4, separators=(',', ': '),ensure_ascii=False)
        imapObj.set_flags(rawMessages,b'\\Seen',silent=False)# 邮件标记为已读
        readUIDs_li.append(UID)
    return readUIDs_li

def decode_str(s):
    value, charset = decode_header(s)[0]
    if charset:
        value = value.decode(charset)
    return value

def list_file(folder):
    folder_count = 0
    houzhui_num = 0
    all_houzhui_num = [] # 对应后缀名的文件数量
    all_files = os.listdir(folder)
    for each in all_files:
        if '.zip' in each: # 如果此项是文件s
            houzhui_num = houzhui_num +1
   # print(houzhui_num)
    return houzhui_num 

def get_attachment_lists(msg, getpath, UID):
    attachment_files = []
    attachment_dirs = []
    today = datetime.date.today()
    num = 0
    filenum = 0
    errMsg = ''
    try:
        for part in msg.walk():
            # 获取附件名称类型
            file_name = part.get_filename()
            # 获取数据类型
            contentType = part.get_content_type()
            # 获取编码格式
            mycode = part.get_content_charset()
            #print(file_name)
            if file_name:
                h = Header(file_name)
                # 对附件名称进行解码
                dh = decode_header(h)
                filename = dh[0][0]
                if dh[0][1]:
                    # 将附件名称可读化
                    filename = decode_str(str(filename, dh[0][1]))
                attachment_files.append(filename)
                if filename.endswith('.zip'):
                    # 下载附件
                    data = part.get_payload(decode=True)
                    #创建文件夹
                    path = getpath+'UID'+str(UID) +'\\'
                    if not os.path.exists(path):
                        os.makedirs(path)
                    filenum = list_file(path)
                    # 在当前目录下创建文件
                    with open(path +  filename, 'wb') as f:
                        # 保存附件
                        f.write(data)
                    newpath = path+'ETC电子发票'+str(filenum)
                    os.rename(path +  filename,newpath+'.zip')
                    os.chdir(path)
                    exmpleZip = zipfile.ZipFile(newpath+'.zip')
                    exmpleZip.extractall(newpath)
                    exmpleZip.close()
                    attachment_dirs.append(newpath)
        #print('附件名列表：', attachment_files)
    except Exception as eo:
        errMsg = str(eo)
    return attachment_dirs,errMsg

'''
# 将PDF转化为图片
pdfPath pdf文件的路径
imgPath 图像要保存的文件夹
zoom_x x方向的缩放系数
zoom_y y方向的缩放系数
rotation_angle 旋转角度
png_Name 图片的名字
'''
def pdf_image(pdfPath,imgPath,zoom_x,zoom_y,rotation_angle,png_Name):
    # 打开PDF文件
    pdf = fitz.open(pdfPath)
    # 逐页读取PDF
    for pg in range(0, pdf.pageCount):
        page = pdf[pg]
        # 设置缩放和旋转系数
        trans = fitz.Matrix(zoom_x, zoom_y).preRotate(rotation_angle)
        pm = page.getPixmap(matrix=trans, alpha=False)
        # 开始写图像
        pm.writePNG(imgPath+png_Name+".png")
    pdf.close()

if __name__ == '__main__':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        argv = sys.argv
        #argv=['',r'D:\\ETC电子发票\\']

        sender = 'qwe3328015@foxmail.com'
        exportDir_path = argv[1]
        Emailhost = "imap.mxhichina.com"
        emailuser = 'etc@highbird.com.cn'
        emailpassword = 'Highbird123'
        try:
            UIDs,imapObj = get_email_content(Emailhost,emailuser,emailpassword)
            readedUISs = get_email_UNSEEN(UIDs,imapObj,sender,exportDir_path)
            imapObj.logout()
            print("OK:" + str(readedUISs), end='')
        except  Exception as e:
            print("ERROR:" + e, end='')
