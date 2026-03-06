# 🚀 Network Speed Test

一个基于 Node.js + Express 的网络测速工具，支持 Docker 部署，可以测试不同网络环境（局域网、VPN、组网）的带宽和延迟。

## ✨ 特性

- 📡 **多网络模式支持**：局域网、Tailscale、ZeroTier 等多种连接方式
- 📊 **实时速度监控**：实时显示下载速度和进度
- 📈 **速度趋势图**：使用 ECharts 绘制速度变化折线图
- 🔄 **A/B 测试模式**：对比预生成文件和动态生成文件的性能
- ⏹️ **随时停止**：支持中断测试，查看部分结果
- 🎯 **智能单位切换**：自动在 KB/s 和 MB/s 之间切换
- 🐳 **Docker 部署**：一键部署，开箱即用
- 📱 **响应式设计**：完美支持 PC、平板、手机

## 🎯 功能对比

### 预生成文件模式 📁
- **原理**：从磁盘读取预先生成的测试文件
- **优势**：不消耗 CPU 生成数据，测试纯网络传输速度
- **适用场景**：测试网络带宽上限

### 动态生成模式 ⚡
- **原理**：实时生成随机数据并传输
- **优势**：测试网络 + CPU 生成的综合性能
- **适用场景**：模拟实际业务场景（实时数据处理）

## 📦 安装部署

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/NNNNzs/network-speedtest.git
cd network-speedtest

# 2. 构建镜像
docker build -t network-speedtest .

# 3. 运行容器
docker run -d \
  --name network-speedtest \
  --restart unless-stopped \
  -p 18080:18080 \
  network-speedtest
```

### 方式二：本地部署

```bash
# 1. 克隆项目
git clone https://github.com/NNNNzs/network-speedtest.git
cd network-speedtest

# 2. 安装依赖
npm install

# 3. 启动服务
npm start
```

## 🌐 访问地址

启动后，在浏览器中打开以下任一地址：

- **本地访问**：http://localhost:18080
- **局域网访问**：http://192.168.1.80:18080
- **Tailscale**：http://100.91.95.82:18080
- **ZeroTier**：http://192.168.193.194:18080

## 🎮 使用方法

### 基本测试流程

1. **选择测试模式**
   - 📁 预生成文件（测试纯网络速度）
   - ⚡ 动态生成（测试网络+CPU）

2. **点击"📡 测试延迟"**
   - 测试到服务器的往返时间
   - 查看服务器 IP 和客户端 IP

3. **点击"🚀 开始测速"**
   - 下载 200MB 测试数据
   - 实时显示速度和进度

4. **查看测试结果**
   - 平均速度、峰值速度
   - 传输数据量、测试用时
   - 速度趋势折线图

5. **对比不同模式**
   - 分别测试预生成和动态生成
   - 对比速度差异，分析瓶颈

## 📊 测试结果分析

### 速度评级标准
- 🚀 **飞快**：> 80 MB/s
- ⚡ **很快**：50-80 MB/s
- ✅ **不错**：30-50 MB/s
- 📶 **一般**：10-30 MB/s
- 🐢 **很慢**：< 10 MB/s

### 延迟评级标准
- ⚡ **超快**：< 50 ms
- ✅ **正常**：50-100 ms
- ⚠️ **较慢**：100-200 ms
- 🐌 **很慢**：> 200 ms

## 🔧 配置说明

### 修改端口

编辑 `index.js` 中的 `PORT` 常量：

```javascript
const PORT = 18080; // 修改为你想要的端口
```

### 修改测试文件大小

在 `index.js` 中修改：

```javascript
const PREGEN_FILE_SIZE_MB = 200; // 预生成文件大小（MB）
const sizeMB = parseInt(req.query.size) || 200; // 动态生成文件大小（MB）
```

### 修改分块大小

在 `index.js` 中修改：

```javascript
const chunkSizeKB = 100; // 分块大小（KB）
```

## 🛠️ Docker 管理

### 查看容器状态
```bash
docker ps | grep network-speedtest
```

### 查看日志
```bash
docker logs network-speedtest
```

### 停止容器
```bash
docker stop network-speedtest
```

### 启动容器
```bash
docker start network-speedtest
```

### 重启容器
```bash
docker restart network-speedtest
```

### 删除容器
```bash
docker stop network-speedtest && docker rm network-speedtest
```

### 进入容器（调试用）
```bash
docker exec -it network-speedtest sh
```

## 📁 项目结构

```
network-speedtest/
├── Dockerfile              # Docker 镜像构建文件
├── .dockerignore           # Docker 忽略文件
├── package.json            # Node.js 依赖配置
├── index.js                # 后端服务主文件
├── public/                 # 静态文件目录
│   └── index.html          # 前端页面
└── README.md               # 项目说明文档
```

## 🎨 技术栈

### 后端
- **Node.js**：JavaScript 运行时
- **Express**：Web 框架
- **Stream API**：流式数据传输

### 前端
- **原生 JavaScript**：无框架依赖
- **Fetch API**：HTTP 请求
- **ECharts**：数据可视化（CDN）

### 容器化
- **Docker**：容器化部署
- **Alpine Linux**：轻量级基础镜像

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

[Jarvis](https://github.com/NNNNzs)

## 🙏 致谢

- [Express](https://expressjs.com/) - Web 框架
- [ECharts](https://echarts.apache.org/) - 数据可视化库
- [Docker](https://www.docker.com/) - 容器化平台

## 📮 联系方式

如有问题或建议，欢迎：
- 提交 [Issue](https://github.com/NNNNzs/network-speedtest/issues)
- 发送邮件：nnnnzs@vip.qq.com

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
