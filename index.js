var http = require('http'),
    https = require('https'),
    urlLib = require('url'),
    iconv = require('iconv-lite'),
    zlib = require('zlib');

var httpObject = {
    'http:' : http,
    'https:' : https
},
    charsetReg = /Charset=(.*)$/;

/**
 * 判断指定对象是否为简单对象（对象字面量）
 * @param obj
 * @returns {boolean}
 */
function isPlainObject(obj) {
    return obj && typeof obj === 'object' && obj.toString() === '[object Object]'
}

/**
 * 扩展指定的对象
 * @param {object} target 被扩展的对象
 * @returns {object} 扩展后的对象
 */
function extend(target) {
    var p,
        args = Array.prototype.slice.call(arguments, 1);
    target = target || {};
    args.forEach(function (obj) {
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                if (isPlainObject(obj[p])) {
                    !isPlainObject(target[p]) && (target[p] = {});
                    extend(target[p], obj[p]);
                } else {
                    target[p] = obj[p];
                }
            }
        }
    });
    return target;
}

/**
 * 返回默认设置
 * @returns {{hostname: string, port: number, path: string, method: string, headers: object}}
 */
function getDefaultOptions() {
    return {
        hostname : '',
        port : 80,
        path : '/',
        method : 'GET',
        headers : getDefaultHeaders()
    };
}

/**
 * 将对象序列化为参数字符串
 * @param {object} obj 待序列化对象
 * @param {string} [joiner='&'] 参数连接符
 * @returns {string}
 */
function serialize(obj, joiner) {
    var p, arr = [];
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            arr.push(p + '=' + obj[p]);
        }
    }
    return arr.join(joiner || '&');
}

/**
 * 返回默认请求头
 * @returns {{Accept: string, Accept-Encoding: string, Accept-Language: string, Cache-Control: string, Connection: string, Cookie: string, Pragma: string, User-Agent: string}}
 */
function getDefaultHeaders() {
    return {
        'Accept' : 'text/html,application/xhtml+xml',
        'Accept-Encoding' : 'gzip,default',
        'Accept-Language' : 'zh-CN,zh;q=0.8,en;q=0.6',
        'Cache-Control' : 'no-cache',
        'Connection' : 'keep-alive',
        'Cookie' : '',
        'Pragma' : 'no-cache',
        'User-Agent' : 'http-fetch'
    };
}

/**
 * Web内容拉取类
 * @constructor
 */
function HttpFetch() {
    this._opts = getDefaultOptions();
    this._charCode = 'utf8';
}

HttpFetch.prototype = {
    constructor : HttpFetch,
    /**
     * 设置参数
     * @param {object} opts 参数
     * @return {HttpFetch}
     */
    setOptions : function (opts) {
        extend(this._opts, opts);
        return this;
    },

    /**
     * 设置请求方法
     * @param {string} [method='GET'] 请求方法，'GET'、'POST'、'HEAD'....
     * @returns {HttpFetch}
     */
    setMethod : function (method) {
        return this.setOptions({
            'method' : method || 'GET'
        });
    },

    /**
     * 设置Cookie
     * @param {object} cookieObj Cookie对象
     * @returns {HttpFetch}
     */
    setCookie : function (cookieObj) {
        return this.setOptions({
            'headers' : {
                'Cookie' : serialize(cookieObj) || ''
            }
        });
    },

    /**
     * 设置请求头信息
     * @param {object} headers 请求头信息对象
     * @returns {HttpFetch}
     */
    setHeaders : function (headers) {
        return this.setOptions({
            'headers' : headers
        });
    },


    /**
     * 设置用户代理信息
     * @param {string} userAgent
     * @returns {HttpFetch}
     */
    setUserAgent : function (userAgent) {
        return this.setOptions({
            'headers' : {
                'User-Agent' : userAgent || 'http-fetch'
            }
        });
    },

    /**
     *
     * @param charcode
     */
    setCharCode : function (charcode) {
        this._charCode = charcode || 'utf8';
    },

    /**
     * 拉取指定的Web内容
     * @param {string} url 需要拉取数据URL
     * @param {object} [opts] 设置
     * @param {function} fn 数据拉取完成后的回调方法
     */
    fetch : function (url, opts, fn, data) {
        var urlObj = urlLib.parse(url),
            protocol = urlObj.protocol;
        if (!isPlainObject(opts)) {
            data = fn;
            fn = opts;
            opts = {};
        }
        opts['hostname'] = urlObj['hostname'];
        opts['port'] = parseInt(urlObj['port']) || opts['port'];
        opts['path'] = urlObj['path'];
        this.setOptions(opts);
        this._request(protocol, fn, data);
    },

    _request : function (protocol, fn, data) {
        this._content = '';
        var req = httpObject[protocol].request(this._opts, function (res) {
            this._getCharset(res.headers['content-type']);
            var convertStream = this._getConvertStream();
            if (res.headers['content-encoding'] === 'gzip') {
                res.pipe(zlib.createGunzip()).pipe(convertStream);
            } else {
                res.pipe(convertStream);
            }
            convertStream.on('data', this._onData.bind(this));
            convertStream.on('end', this._onEnd.bind(this, fn));
            convertStream.on('error', this._onError.bind(this, fn));
        }.bind(this));
        if (data) {
            req.write(serialize(data));
        }
        req.end();
    },

    _getConvertStream : function () {
        return iconv.decodeStream(this._charCode === 'gb2312' ? 'gbk' : this._charCode);
    },

    _getCharset : function(contentType) {
        var match;
        console.log(contentType);
        console.log(contentType.match(charsetReg));
        if (match = contentType.match(charsetReg)) {
            this._charCode = match[1];
        }
    },



    _onData : function (str) {
        this._content += str;
    },

    _onEnd : function (fn) {
        fn(null, this._content);
    },

    _onError : function (fn, err) {
        fn(err);
    }
};

module.exports = HttpFetch;