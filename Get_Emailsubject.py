import poplib,datetime,os,zipfile,shutil,imapclient,imaplib,base64,pyzmail,json
from email.parser import Parser # 解码邮件信息
from email.header import decode_header, Header # 解析邮件主题
from email.utils import parseaddr # 解析发件人详情，名称及地址
import fitz
import time
import  pprint
def get_email_content():
    # userinfo = ms.ExecQuery("select * from MyEmail")
    imaplib._MAXLINE = 10000000
    imapObj = imapclient.IMAPClient("imap.mxhichina.com",ssl=True)
    #imapObj.login(userinfo[0][1],userinfo[0][2])
    imapObj.login('monitor@highbird.com.cn','Highbird321')
    imapObj.select_folder('邮件监控',readonly=False)
    UIDs = imapObj.search(['UNSEEN'])
    return UIDs,imapObj

def get_email_UNSEEN(UIDs,imapObj,fileJosnPath):
        All_Email_json = {}
        for UID in UIDs:
            email_json = {}
            rawMessages = imapObj.fetch(UID,['BODY[]'])
            message = pyzmail.PyzMessage.factory(rawMessages[UID][b'BODY[]'])
            subject = message.get_subject()
            addresser_date = time.strftime("%Y-%m-%d %H:%M:%S",time.strptime(message.get("Date")[0:24],'%a, %d %b %Y %H:%M:%S'))
            email_json['subject'] = subject
            email_json['Sent'] = addresser_date
            email_json['from'] = message.get_addresses('from')
            email_json['to'] = message.get_addresses('to')
            email_json['cc'] = message.get_addresses('cc')
            email_json['bcc'] = message.get_addresses('bcc')
            All_Email_json[UID] = email_json
        f = open(fileJosnPath + '\\eeee.json','w',encoding='utf-8')
        json.dump(All_Email_json,f, sort_keys=True, indent=4, separators=(',', ': '),ensure_ascii=False)
        return All_Email_json

if __name__ == '__main__':
        UIDs,imapObj = get_email_content()
        #pprint.pprint(imapObj.list_folders())
        ret_json = get_email_UNSEEN(UIDs,imapObj,'D:\\')
        imapObj.logout()
        print(ret_json)