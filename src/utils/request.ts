import axios from 'axios';
import { get } from 'lodash-es';

import { baseURL } from '@/constant';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  408: '请求超时。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

// create an axios instance
const service = axios.create({
  baseURL: baseURL,
  timeout: 20000, // request timeout
  // withCredentials: true,
  headers: { 'Content-Type': 'application/json', terminal: 'store' },
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    if (config.method === 'get' && config.data) {
      config.params = config.data;
      delete config.data;
    }

    // const token = getToken();
    // if (token) {
    //   config.headers.token = `${token}`;
    // }

    return config;
  },
  (error) => {
    console.log('request error', error.message);
    // message.error('Request Error');
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    const { config, data } = response;
    // console.log('config', config)

    console.log(response.data);

    if (config.responseType === 'blob') {
      return data;
    }

    const { code, message: msg, data: result } = data;

    if (code === 9002) {
      // message.error({
      //   content: '登陆已失效，请重新登陆',
      //   key: code,
      // });
      // 登录
    } else if (code === '9003') {
      // 403
      // 跳转
    } else if (code != '0') {
      // message.error({
      //   content: msg || 'Error',
      //   key: code || 'Error',
      // });

      return Promise.reject({ error: msg || 'Error', code, message: msg });
    }

    return { data: result };
  },
  (error) => {
    console.log('response error---', error); // for debug
    let code = get(error.response, 'status') || get(error, 'code');
    if (!error.response) {
      code = 408;
    }
    if (code === 401) {
      // 登录
      return Promise.reject({ error });
    }

    const msg = get(error, 'message', '请求失败');
    const errorText = get(codeMessage, code, msg);

    if (code === 403) {
      // message.error({
      //   content: errorText,
      //   key: code,
      // });

      return Promise.reject({ error: errorText, code });
    }

    // message.error({
    //   content: errorText,
    //   key: code,
    // });

    return Promise.reject({ error: errorText, code });
  },
);
export default service;
