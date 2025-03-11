
const https = require('https'); // 若目标为 HTTPS 站点需使用该模块
const querystring = require('querystring');

async function postRequest(url, body, headers = {}) {


  // 提取主机和路径
  const parsedUrl = new URL(url);
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
async function run() {
  try {
    const response = await postRequest('', querystring.stringify({
      shareParam: 'cZpxtFI1qCJFgY9zHyftXzCTC2i%2BunvCeRRC1nTzFRnz7vPYUiJPuIlbmYGJJUThGnhI5oO4iNsARlosVYp6NwmTRp5lpIWYY8y%2Bvs6UA7PPEH%2B8FV6q9Wx1kDZ83W9KtkptNzn8H20BxlEV%2B%2FE68b9lQew1Rp3yKrIJVE4dleE%3'
    }));
    
    console.log('响应状态:', response.statusCode);
    console.log('响应内容:', response.data);
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}


export default async (req, context) => {
  const rst = await run();
  return rst;
};
