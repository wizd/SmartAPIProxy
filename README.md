# SmartAPIProxy

SmartAPIProxy 是一个基于 Node.js 的反向代理服务器，用于处理和转发 API 请求。它支持 Server-Sent Events (SSE) 以实现实时通信。SmartAPIProxy 可以在客户端和目标 API 服务器之间起到中间人的作用，对请求和响应数据进行处理和修改。

# 功能

* 获取并替换请求头中的 Authorization 值。
* 修改客户端发送的 JSON 请求体并进行统计。
* 在将响应返回给客户端之前，处理目标 API 服务器返回的 JSON 响应体。

# 开发过程

1. 使用 http-proxy-middleware 创建反向代理服务器。
2. 在代理设置中添加自定义处理程序，以便在请求和响应阶段处理数据。
3. 实现 SSE 支持，以便客户端可以接收实时数据流。

# 安装

1. 使用 npm install 或 yarn 安装项目依赖。
2. 创建 .env 文件，将所需的 API 密钥添加到其中。

# 调试

1. 在项目根目录中创建 launch.json 文件，配置 VSCode 调试器。
2. 使用 VSCode 调试功能运行 SmartAPIProxy。

# 部署

部署 SmartAPIProxy 时，请确保目标环境具有正确的 API 密钥和环境变量设置。您可以使用 PM2 或其他 Node.js 进程管理工具在生产环境中运行 SmartAPIProxy。

# 相关问题

* 在开发过程中，实现 SSE 支持以确保客户端可以正确接收实时数据流。
* 处理各种 JSON 解析问题，确保在处理 SSE 数据时不会出现错误。

# 最后

SmartAPIProxy 是一个功能强大的反向代理服务器，可以轻松地在客户端和 API 服务器之间进行数据处理。它具有良好的扩展性，可以根据项目需求进行进一步开发和优化。
