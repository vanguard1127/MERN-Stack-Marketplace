import axios from 'axios';
require('dotenv').config();
//axios.defaults.headers.common['X-CSRFToken'] = getCookie('csrftoken');

const apiVersion = 'v0';

const SERVER_URL = process.env.REACT_APP_API_URL;

const API_URL =  `${SERVER_URL}/`;


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

function getAccessToken(name){
    var accessToken = localStorage.getItem('accessToken');    
    return accessToken;
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

function request(method = 'get', path, data = null, params = {}) {
    const requestPath = `${API_URL}${path}`;    
    let accesstoken = getAccessToken();
    axios.defaults.headers.common['x-access-token'] = getAccessToken(); 
    return new Promise((resolve, reject) => {
        axios({
            method: method,
            url: requestPath,
            data: data,
            params: params,
        })
        .then((response) => {
            resolve({data: response.data});
        })
        .catch((error) => {
            reject(error);
        });
    });
}

export function post(path = '', data = null, useVersion) {
    const url = createRequestPath(path, null, useVersion);
    // const formData = new FormData();
    // for (const key in data) {
    //     formData.append(key, data[key]);
    // }
    //return request('post', url, formData);
    return request('post', url, data);
}

export function del(path = '', data = null , useVersion) {
    const url = createRequestPath(path, data , useVersion);
    return request('delete', url, null);
}

export function put(path = '', data = null , useVersion) {
    const url = createRequestPath(path , null , useVersion);
    
    // const formData = new FormData();
    // for (const key in data) {
    //     formData.append(key, data[key]);
    // }
    //return request('put', url, formData);
    return request('put', url, data);
}


export function get(path = '', data = null,useVersion) {
    const url = createRequestPath(path ,null,useVersion);
    return request('get', url, null, data);
}
