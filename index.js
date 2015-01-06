var http = require('http'),
    https = require('https'),
    urlLib = require('url');

function isPlainObject(obj) {

}

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
}

function getDefaultOptions() {
    return {
        hostname : '',
        port : 80,
        path : '/',
        method : 'GET',
        headers : getDefaultHeaders()
    };
}

function serialize(obj, joiner) {
    var p, arr = [];
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            arr.push(p + '=' + obj[p]);
        }
    }
    return arr.join(joiner || '&');
}

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

    fetch : function (url, opts, fn) {
        var urlObj = urlLib.parse(url),
            protocol = urlObj.protocol;
        opts['hostname'] = urlObj['hostname'];
        opts['port'] = parseInt(urlObj['port']) || opts['port'];
        opts['path'] = urlObj['path'];
        this.setOptions(opts);

    },



    _onData : function () {},

    _onEnd : function () {}
};

module.exports = HttpFetch;