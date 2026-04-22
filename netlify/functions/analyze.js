exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: '后端环境变量 GEMINI_API_KEY 未配置，请在 Netlify 后台设置后重新触发部署。' }) 
      };
    }

    // 将这里的模型名称改为了对公众 API Key 开放的 gemini-1.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body 
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch(e) {
        return { 
          statusCode: response.status, 
          body: JSON.stringify({ error: `Google API 返回了异常内容: ${rawText}` }) 
        };
    }
    
    if (!response.ok) {
      // 透传 Google 官方给出的所有报错内容
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: data.error || data }) 
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Backend Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: `后端函数崩溃: ${error.message}` }) 
    };
  }
};
