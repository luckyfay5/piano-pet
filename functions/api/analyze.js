export async function onRequestPost(context) {
  const request = context.request;
  const env = context.env;

  try {
    // 读取我们在 Cloudflare 后台新配置的通义千问 API Key
    const apiKey = env.DASHSCOPE_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '后端环境变量 DASHSCOPE_API_KEY 未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取前端发来的兼容 OpenAI 格式的请求体
    const bodyText = await request.text();
    
    // 调用通义千问的视觉大模型接口 (兼容 OpenAI 模式)
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: bodyText 
    });

    const rawText = await response.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch(e) {
        return new Response(JSON.stringify({ error: `通义千问 API 返回异常内容: ${rawText}` }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error || data }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: `后端函数崩溃: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
