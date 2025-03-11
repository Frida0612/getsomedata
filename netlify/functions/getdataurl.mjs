
const https = require('https'); // 若目标为 HTTPS 站点需使用该模块
const querystring = require('querystring');
const url = require('url');
function getQueryString(search, name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = search.substr(1).match(reg);
     if(r!=null)return  r[2]; return null;
}

function getRedirectedUrlWithTimeout(shortUrl, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(shortUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: 'GET',
    };

    const req = protocol.request(options, (res) => {
      const statusCode = res.statusCode;

      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        resolve(getRedirectedUrlWithTimeout(res.headers.location, timeout));
      } else if (statusCode >= 200 && statusCode < 300) {
        resolve(shortUrl);
      } else {
        reject(new Error(`Unexpected status code: ${statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    // 设置超时
    req.setTimeout(timeout, () => {
      req.destroy(); // 中断请求
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}


async function postRequest(url, body, headers = {}) {


  const options = {
     hostname: 'www.eeo.cn', // 目标服务器地址
      path: '/lms/app/share/report/activity/recordClassInfo', // 请求路径
      method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers // 允许自定义扩展头部
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        data
      }));
    });
    
    // 添加错误处理
    req.on('error', (err) => reject(err));
    req.write(body);
    req.end();
  });
}

// 使用示例（发送 JSON 数据）
async function run(req, context) {
  try {
    const shortUrl = getQueryString(url.parse(req.url).search, 'shortUrl');
    console.log(111, shortUrl);
    const fullUrl = await getRedirectedUrlWithTimeout(shortUrl);
    const shareParam = getQueryString(url.parse(fullUrl).search, 'shareParam');
    console.log(222, shareParam);
    const response = await postRequest('', querystring.stringify({
      shareParam: querystring.unescape('cZpxtFI1qCJFgY9zHyftXzCTC2i%2BunvCeRRC1nTzFRnz7vPYUiJPuIlbmYGJJUThGnhI5oO4iNsARlosVYp6NwmTRp5lpIWYY8y%2Bvs6UA7PPEH%2B8FV6q9Wx1kDZ83W9KtkptNzn8H20BxlEV%2B%2FE68b9lQew1Rp3yKrIJVE4dleE%3D')
    }));
    
    console.log('响应状态:', response.statusCode);
    console.log('响应内容:', response.data);
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}


export default async (req, context) => {
  const rst = await run(req, context);
  return new Response(rst);
};
