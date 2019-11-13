import {log, logWarm, logErr} from './logs';
import {getToken} from './user';
import md5 from 'md5';
import {overallDomainurl} from '../utils/Global';
import {overallBaseurl} from '../utils/Global';

let headers = {};

const domain = overallDomainurl;
const baseUrl = overallBaseurl;

exports.setHeader = function(name, value) {
  if(!name) return;
  headers[name] = value;
}

exports.getHeader = function(name, value) {
  if(!name) return '';
  return headers[name] || '';
}

exports.getDomain = domain;



class Request {

  /**
    * 检测返回状态码
    * @param {*} status 
    * @param {*} res 
    */
  async _checkStatus(status, res, url) {
    if (status !== 200) {
      throw new Error('请求失败，请检查网络');
    }
  }

  /**
     * 内部实现网络请求
     * @param {*} url 
     * @param {*} options 
     */
    async _request(url, options, type) {
     
      url = url.indexOf('http') == 0 ? url : url.indexOf('/ifs') == 0 ? domain + url : baseUrl + url;
      let res = await fetch(url, options);
     
      this._checkStatus(res.status, res, url)
      if (type === 'json') return await this._jsonFactory(res, url, options)
      return await this._jsonFactory(res, url, options)
  }

  /**
    * 处理json数据
    * @param {*} res 
    * @param {*} url 
    */

  async _jsonFactory(res, url, options) {
    let json;
    let txt = '';
    try {
        txt = await res.text();
    } catch (e) {
        log('未拿到返回字符串', { url: url, txt: txt });
       //  throw new Error('数据格式错误');
    }
    try {
        json = JSON.parse(txt);
    } catch (e) {
        logErr('返回数据格式错误', { url: url, txt: txt });
        // throw new Error('数据格式错误');
    }
    log("请求返回", json, url, options);
    return json;
  }


  async get(url, data) {
    const tokenInfo = this._getToken();
    if (data) data = encodeURI(data);
    if (url.indexOf('?') < 0 && data) url += '?' + data;
    return this._request(url, {
        method: 'GET',
        headers: Object.assign(headers, tokenInfo),
        timeout: 10000
    }, 'json')
  }

  async post2(url, data) {
    log('参数',data)
    const tokenInfo = this._getToken();
    let headers = {}
    return this._request(url, {
        method: 'POST',
        headers: Object.assign(headers,tokenInfo,{ 'Content-Type': 'application/json' }),
        timeout: 10000,
        body: JSON.stringify(data)
    }, 'json')
  }
  

  async post(url,data) {
    const tokenInfo = this._getToken();
    const body = this._getFormData(data);
    return this._request(url, {
      method: 'POST',
      headers: Object.assign(headers, tokenInfo),
      timeout: 10000,
      body: body
    }, 'json')
  }

  async post3(url,data,type) {
    const tokenInfo = this._getToken();
    const body = this._getFormData(data);
    url = url.indexOf('http') == 0 ? url : url.indexOf('/ifs') == 0 ? domain + url : baseUrl + url;
    let res = await fetch(url, {
      method: 'POST',
      headers: Object.assign(headers, tokenInfo),
      timeout: 10000,
      body: body
    });
    let txt = '';
    try {
        txt = await res.text();
        console.log(res)
    } catch (e) {
        log('未拿到返回字符串', { url: url, txt: txt });
       //  throw new Error('数据格式错误');
    }
    log("请求返回", url, body);
    return txt;
  }

  _getFormData(data) {
    let params = new FormData();
    for (let key in data) {
      params.append(key, data[key])
    }
    return params
  }

  _getToken() {
    const ts = new Date().getTime();
    const token = md5(ts + 'salt');
    return {ts, token}
  }
}

exports.Request = new Request();