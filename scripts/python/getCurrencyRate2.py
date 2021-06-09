from selenium import webdriver
import traceback
import time
import re
import io
import sys
import json
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import json

class Spider:
    def __init__(self):
        self.url = 'https://www.xe.com/currencyconverter/'

    def findMidmarketLog(self, logs):
        for entry in logs:
            log = json.loads(entry["message"])["message"]
            if ("Network.responseReceived" == log["method"] and "midmarket-converter" in log["params"]["response"]["url"]):
                return log
                
    def get_rate(self):
 
        desired_capabilities = DesiredCapabilities.CHROME
        desired_capabilities["pageLoadStrategy"] = "none"
        desired_capabilities["goog:loggingPrefs"] = {"performance": "ALL"}

        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        prefs = {"profile.managed_default_content_settings.images": 2}
        options.add_experimental_option("prefs", prefs)

        browser = webdriver.Chrome(desired_capabilities=desired_capabilities, options=options)

        ret = {}
        try:
            browser.get(self.url)
            time.sleep(3)
            logs = browser.get_log("performance")
            midMarketEvent = self.findMidmarketLog(logs)
            if midMarketEvent:
                body = browser.execute_cdp_cmd('Network.getResponseBody', {'requestId': midMarketEvent["params"]["requestId"]})
                ret = body["body"]
        except BaseException as err:
            errinfo = traceback.format_exc()
            ret.err = errinfo
            print(errinfo) 
        browser.quit()
        return ret


if __name__ == '__main__':
    spider = Spider()
    midBody = spider.get_rate()
    print("rlt=" + json.dumps(midBody,ensure_ascii=False))
