const forge = require('node-forge');
const co = require('co');

const AES_ENCODE_KEY_LENGTH = 43;
const RANDOM_LENGTH = 16;

const DingTalkCryptErrorCode = {
    SUCCESS: 0,
    /**加密明文文本非法**/
    ENCRYPTION_PLAINTEXT_ILLEGAL: 900001,
    /**加密时间戳参数非法**/
    ENCRYPTION_TIMESTAMP_ILLEGAL: 900002,
    /**加密随机字符串参数非法**/
    ENCRYPTION_NONCE_ILLEGAL: 900003,
    /**不合法的aeskey**/
    AES_KEY_ILLEGAL: 900004,
    /**签名不匹配**/
    SIGNATURE_NOT_MATCH: 900005,
    /**计算签名错误**/
    COMPUTE_SIGNATURE_ERROR: 900006,
    /**计算加密文字错误**/
    COMPUTE_ENCRYPT_TEXT_ERROR: 900007,
    /**计算解密文字错误**/
    COMPUTE_DECRYPT_TEXT_ERROR: 900008,
    /**计算解密文字长度不匹配**/
    COMPUTE_DECRYPT_TEXT_LENGTH_ERROR: 900009,
    /**计算解密文字suiteKey不匹配**/
    COMPUTE_DECRYPT_TEXT_SuiteKey_ERROR: 900010,
};

function DictionarySort(oLeft, oRight) {
    sLeft = oLeft;
    sRight = oRight;
    var iLeftLength = sLeft.length;
    var iRightLength = sRight.length;
    var index = 0;
    while (index < iLeftLength && index < iRightLength) {
        if (sLeft[index] < sRight[index])
            return -1;
        else if (sLeft[index] > sRight[index])
            return 1;
        else
            index++;
    }
    return iLeftLength - iRightLength;

}

function GenerateSignature(sToken, sTimeStamp, sNonce, sMsgEncrypt) {
    var AL = [sTimeStamp, sToken, sNonce, sMsgEncrypt];
    AL.sort(DictionarySort);
    var raw = AL.join('');

    var sha = forge.md.sha1.create();
    sha.update(raw);
    var sMsgSignature = sha.digest().toHex();
    return sMsgSignature;
}

function DT_VerifyURL(sMsgSignature, sTimeStamp, sNonce, sEchoStr) {
    var ret = 0;
    var m_sEncodingAESKey = this.m_sEncodingAESKey;
    if (m_sEncodingAESKey.length != 43) {
        return DingTalkCryptErrorCode.AES_KEY_ILLEGAL;
    }
    ret = this.VerifySignature(sTimeStamp, sNonce, sEchoStr, sMsgSignature);
    return ret;
}

function DT_VerifySignature(sTimeStamp, sNonce, sMsgEncrypt, sSigture) {
    var hash = "";
    hash = GenerateSignature(this.m_sToken, sTimeStamp, sNonce, sMsgEncrypt);
    if (hash == sSigture)
        return 0;
    else {
        return DingTalkCryptErrorCode.SIGNATURE_NOT_MATCH;
    }
}

function DT_Init() {
    if(this.key == null){
        var base64_buf = new Buffer(this.m_sEncodingAESKey, 'base64');
        var key_buf = forge.util.createBuffer();
        var iv_buf = forge.util.createBuffer();
        var i;
        for (i = 0; i < base64_buf.length; ++i) {
            key_buf.putByte(base64_buf[i]);
            if (i < 16) {
                iv_buf.putByte(base64_buf[i]);
            }
        }
        var iv = iv_buf.getBytes(16);
        var key = key_buf.getBytes(32);
        this.key = key;
        this.iv = iv;
    }
    return;
}

function DT_DecryptMsg(sMsgSignature, sTimeStamp, sNonce, sPostData) {
    if (this.m_sEncodingAESKey.length != AES_ENCODE_KEY_LENGTH)
        return DingTalkCryptErrorCode.AES_KEY_ILLEGAL;

    this.Init();
    var sEncryptMsg = sPostData;

    if (this.VerifySignature(sTimeStamp, sNonce, sEncryptMsg, sMsgSignature) != 0) {
        return '';
    }

    var decipher = forge.cipher.createDecipher('AES-CBC', this.key);
    decipher.start({ iv: this.iv });
    var data_base64 = new Buffer(sPostData, 'base64');
    var data_buf = forge.util.createBuffer();
    for (i = 0; i < data_base64.length; ++i) {
        data_buf.putByte(data_base64[i]);
    }
    //data_buf.putString(sPostData);
    decipher.update(data_buf);
    var result = decipher.finish();
    if (result) {
        var rndStr = decipher.output.getBytes(16);
        var msgLen = decipher.output.getInt32();
        var msg = decipher.output.getBytes(msgLen);
        return msg;
    }
    return false;
}

function DT_EncryptMsg(sReplyMsg, sTimeStamp, sNonce) {
    if (sReplyMsg == null || sReplyMsg.length == 0)
        return DingTalkCryptErrorCode.ENCRYPTION_PLAINTEXT_ILLEGAL;
    if (sTimeStamp == null || sTimeStamp.length == 0)
        return DingTalkCryptErrorCode.ENCRYPTION_TIMESTAMP_ILLEGAL;
    if (sNonce == null || sNonce.length == 0)
        return DingTalkCryptErrorCode.ENCRYPTION_NONCE_ILLEGAL;

    if (this.m_sEncodingAESKey.length != AES_ENCODE_KEY_LENGTH)
        return DingTalkCryptErrorCode.AES_KEY_ILLEGAL;

    this.Init();

    var i=0;
    var send_buf = Buffer.alloc(20 + sReplyMsg.length + this.m_sSuiteKey.length);
    while(i < 16){
        send_buf[i++] = 65 + Math.floor(Math.random() * 26);
    }
    send_buf.writeInt32BE(sReplyMsg.length, 16);
    send_buf.write(sReplyMsg, 20, 'utf-8');
    send_buf.write(this.m_sSuiteKey, 20 + sReplyMsg.length, 'utf-8');

    var encrypt_buf = forge.util.createBuffer();
    for(i=0;i<send_buf.length;++i){
        encrypt_buf.putByte(send_buf[i]);
    }
    var tt = send_buf.toString('utf-8');

    var cipher = forge.cipher.createCipher('AES-CBC', this.key);
    cipher.start({ iv: this.iv });
    cipher.update(encrypt_buf);
    if(cipher.finish() == false){
        return false;
    }
    var output = cipher.output;
    var t_buf = Buffer.alloc(output.length());
    i = 0;
    while(output.length()){
        t_buf[i++] = output.getByte();
    }
    var sEncryptMsg = t_buf.toString('base64');
    var signature = GenerateSignature(this.m_sToken, sTimeStamp, sNonce, sEncryptMsg);

    return {
        sEncryptMsg: sEncryptMsg,
        signature: signature,
    };
}

function CreateDingTalkCrypt(token, encodingAesKey, suiteKey) {
    var dingTalkCrypt = {
        m_sToken: token,
        m_sSuiteKey: suiteKey,
        m_sEncodingAESKey: encodingAesKey,
    };

    dingTalkCrypt.VerifySignature = DT_VerifySignature.bind(dingTalkCrypt);
    dingTalkCrypt.DecryptMsg = DT_DecryptMsg.bind(dingTalkCrypt);
    dingTalkCrypt.EncryptMsg = DT_EncryptMsg.bind(dingTalkCrypt);
    dingTalkCrypt.Init = DT_Init.bind(dingTalkCrypt);
    
    return dingTalkCrypt;
}

module.exports = {
    CreateDingTalkCrypt: CreateDingTalkCrypt,
};