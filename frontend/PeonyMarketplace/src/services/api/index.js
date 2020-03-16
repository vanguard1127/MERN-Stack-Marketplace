import Config from './../../config/config';
import {getData} from './../../utils/AppUtils';
const apiVersion = 'v0';

const SERVER_URL = Config.REACT_APP_API_URL;

const API_URL = SERVER_URL + '/';

function getCookie(name) {
    let cookieValue = '';
    if (document.cookie && document.cookie != '') {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function getAccessToken(){
    const access = await getData('accessToken');
    return access;
    
}

function createRequestPath(path, param = null, useApiVersion = true) {
    let paramStr = '';
    if (param) {
        let i = 0;
        for (const key in param) {
            const keyValue = `${key}=${param[key]}`;
            paramStr += i === 0 ? keyValue : `&${keyValue}`;
            i++;
        }
    }
    const defaultPath = useApiVersion ? `${apiVersion}${path}` : path;        
    return paramStr ? `${defaultPath}?${paramStr}` : defaultPath;
}


async function request(method = 'GET', path, data = null, params = {}) {
    const requestPath = `${API_URL}${path}`;        
    let access_token =await getAccessToken();
    let param = {method:method,
        headers:{
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token':access_token,
        }};
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        param.body = JSON.stringify(data);
    } else if (method === 'GET') {
        param.params = JSON.stringify(params);
    }

    return new Promise((resolve, reject) => {
        fetch(requestPath, param).then((response) => {
            let status = response.status;
            const data = response.json();
            return Promise.all([status, data]);
        })
            .then(([status, data]) => {
                resolve({ data: data, status: status });
            }).catch((error) => {
                reject(error);
            });
    }); 
    
}

export function post(path = '', data = null, useVersion) {
    const url = createRequestPath(path, null, useVersion);
    return request('POST', url, data);
}

export function del(path = '', data = null , useVersion) {
    const url = createRequestPath(path, data , useVersion);
    return request('DELETE', url, null);
}

export function put(path = '', data = null , useVersion) {
    const url = createRequestPath(path , null , useVersion);
    return request('PUT', url, data);
}


export function get(path = '', data = null,useVersion) {
    const url = createRequestPath(path ,data,useVersion);    
    return request('GET', url, null, data);
}










