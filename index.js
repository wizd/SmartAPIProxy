const fs = require("fs");
const path = require("path");
const https = require("https");
const dotenv = require("dotenv");

const velistAPI = require("./src/api/velist");

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

dotenv.config();

const app = express();
const pfxPath = process.env.PFX_PATH;
const normalizedCertFilePath = path.normalize(pfxPath);
const pfxPassphrase = process.env.PFX_PASSPHRASE;
const credentials = {
  pfx: fs.readFileSync(normalizedCertFilePath),
  passphrase: pfxPassphrase
};

let server;
if (process.env.NODE_ENV === "production") {
  server = https.createServer(credentials, app);
} else {
  server = require("http").createServer(app);
}

// 使用 express.json() 中间件解析 JSON 请求体
app.use(express.json());

const proxyMiddleware = createProxyMiddleware({
  target: process.env.TARGET_SERVER,
  changeOrigin: true,
  selfHandleResponse: true, // 用于处理响应的自定义处理程序
  onProxyReq: (proxyReq, req) => {
    // 获取并处理Authorization头
    const authHeader = req.headers.authorization;
    const newAuthHeader = processAuthHeader(authHeader);
    proxyReq.setHeader("Authorization", newAuthHeader);

    // 获取、修改并设置JSON请求体
    const body = req.body;
    const modifiedBody = processRequestBody(body);
    const modifiedBodyJson = JSON.stringify(modifiedBody);
    proxyReq.setHeader("Content-Length", Buffer.byteLength(modifiedBodyJson));
    proxyReq.write(modifiedBodyJson);
    proxyReq.end();
  },
  onProxyRes: (proxyRes, req, res) => {
    // 复制原始响应头
    res.set(proxyRes.headers);

    let buffer = "";

    const handleSSEData = () => {
      const newlineIndex = buffer.indexOf("\n\n");

      if (newlineIndex !== -1) {
        const sseMessage = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 2);

        const jsonString = sseMessage.replace(/^data: /, "");

        try {
          const parsedJson = JSON.parse(jsonString);

          // 在此处处理解析后的JSON对象
          const modifiedData = processResponseBody(parsedJson);

          // 将修改后的数据发送回客户端，保持"data: "前缀和换行符
          res.write(`data: ${JSON.stringify(modifiedData)}\n\n`);
        } catch (e) {
          // 如果解析出错，保持原始SSE消息
          res.write(sseMessage + "\n\n");
        }

        // 继续处理缓冲区中剩余的数据
        handleSSEData();
      }
    };

    if (
      proxyRes.headers["content-type"] &&
      proxyRes.headers["content-type"].startsWith("text/event-stream")
    ) {
      // 处理SSE消息
      proxyRes.on("data", (chunk) => {
        buffer += chunk.toString();
        handleSSEData();
      });

      proxyRes.on("end", () => {
        res.end();
      });
    } else {
      // 处理非SSE响应
      let data = "";

      proxyRes.on("data", (chunk) => {
        data += chunk;
      });

      proxyRes.on("end", () => {
        try {
          const modifiedData = processResponseBody(JSON.parse(data));
          res.setHeader("Content-Type", "application/json");
          res.send(JSON.stringify(modifiedData));
        } catch (e) {
          console.log("Error parsing JSON on end:", data);
          res.send(data);
        }
      });
    }
  }
});

function processAuthHeader(authHeader) {
  // 在这里处理认证头，并替换为新的值
  console.log("authHeader", authHeader);
  const newAuthHeader = `Bearer ${process.env.API_KEY}`;
  return newAuthHeader;
}

function processRequestBody(body) {
  // 在这里对传入的JSON请求体进行修改和统计
  console.log("body", body);
  // 示例：将一个名为"count"的属性增加1
  //body.count += 1;
  return body;
}

function processResponseBody(responseBody) {
  // 在这里处理API Server返回的JSON响应
  console.log("responseBody", responseBody);
  // 示例：将一个名为"responseCount"的属性增加1
  //responseBody.responseCount += 1;
  return responseBody;
}

app.use(proxyMiddleware);

app.use("/vc/v1/ve/list", velistAPI);

// 根目录中间件，返回特定网页或者重定向到其他页面
app.use("/", (req, res, next) => {
  // 重定向到其他页面
  res.redirect(process.env.REDIRECT_TO);

  // 返回特定网页
  //res.send("<html><body><h1>Welcome to my website!</h1></body></html>");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
