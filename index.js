const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 18080;

// 获取所有网络接口
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          name: name,
          address: iface.address,
          netmask: iface.netmask
        });
      }
    }
  }

  return ips;
}

// 检查两个 IP 是否在同一网段
function isSameSubnet(ip1, ip2, mask) {
  const ip1Num = ipToNumber(ip1);
  const ip2Num = ipToNumber(ip2);
  const maskNum = ipToNumber(mask);
  return (ip1Num & maskNum) === (ip2Num & maskNum);
}

// IP 地址转数字
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

// 预生成测试文件
const PREGEN_FILE_SIZE_MB = 200; // 200MB
const PREGEN_FILE_PATH = path.join(__dirname, 'public', 'pre-gen-test-file.bin');

function generatePreGenFile() {
  console.log('🔄 正在预生成测试文件...');
  const chunkSizeKB = 100;
  const chunkSize = chunkSizeKB * 1024;
  const totalChunks = Math.ceil((PREGEN_FILE_SIZE_MB * 1024 * 1024) / chunkSize);

  // 生成随机缓冲区
  const chunkBuffer = Buffer.alloc(chunkSize);
  for (let i = 0; i < chunkSize; i += 4) {
    chunkBuffer.writeUInt32LE(Math.random() * 0xFFFFFFFF, i);
  }

  const writeStream = fs.createWriteStream(PREGEN_FILE_PATH);

  let chunksWritten = 0;

  const writeChunk = () => {
    if (chunksWritten >= totalChunks) {
      writeStream.end();
      console.log(`✅ 预生成文件完成: ${PREGEN_FILE_PATH} (${PREGEN_FILE_SIZE_MB}MB)`);
      return;
    }

    writeStream.write(chunkBuffer);
    chunksWritten++;

    // 每 100 个块显示进度
    if (chunksWritten % 100 === 0) {
      const progress = Math.floor((chunksWritten / totalChunks) * 100);
      console.log(`  生成进度: ${progress}%`);
    }

    setImmediate(writeChunk);
  };

  writeChunk();
}

// 静态文件
app.use(express.static('public'));

// 延迟测试接口
app.get('/api/ping', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  // 如果是 ::ffff: 格式的 IPv6 映射 IPv4，提取 IPv4 部分
  const clientIPv4 = clientIP.includes(':') ? clientIP.split(':').pop() : clientIP;

  // 获取服务器所有网络接口
  const serverInterfaces = getNetworkInterfaces();

  // 找到与客户端同一网段的服务器 IP
  let matchedServerIP = null;
  for (const iface of serverInterfaces) {
    if (isSameSubnet(iface.address, clientIPv4, iface.netmask)) {
      matchedServerIP = iface.address;
      break;
    }
  }

  // 如果没有匹配的，返回第一个非内部 IP
  if (!matchedServerIP && serverInterfaces.length > 0) {
    matchedServerIP = serverInterfaces[0].address;
  }

  res.json({
    serverTime: Date.now(),
    serverIP: matchedServerIP || clientIPv4,
    clientIP: clientIPv4
  });
});

// 预生成文件下载接口
app.get('/api/stream/pre', (req, res) => {
  if (!fs.existsSync(PREGEN_FILE_PATH)) {
    return res.status(500).json({ error: '预生成文件不存在' });
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="speedtest-pre-${Date.now()}.bin"`);
  res.setHeader('Cache-Control', 'no-cache');

  const fileStream = fs.createReadStream(PREGEN_FILE_PATH);
  fileStream.pipe(res);

  fileStream.on('error', (err) => {
    console.error('文件读取错误:', err);
    res.status(500).json({ error: '文件读取失败' });
  });
});

// 动态生成文件下载接口
app.get('/api/stream/dynamic', async (req, res) => {
  const sizeMB = parseInt(req.query.size) || 200; // 默认 200MB
  const chunkSizeKB = parseInt(req.query.chunk) || 100; // 默认每块 100KB

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="speedtest-dynamic-${Date.now()}.bin"`);
  res.setHeader('Cache-Control', 'no-cache');

  const totalBytes = sizeMB * 1024 * 1024;
  const chunkSize = chunkSizeKB * 1024;
  const totalChunks = Math.ceil(totalBytes / chunkSize);

  // 生成一个随机的 100KB 缓冲区，避免客户端缓存压缩
  const chunkBuffer = Buffer.alloc(chunkSize);
  for (let i = 0; i < chunkSize; i += 4) {
    chunkBuffer.writeUInt32LE(Math.random() * 0xFFFFFFFF, i);
  }

  let chunksSent = 0;

  const sendChunk = () => {
    if (chunksSent >= totalChunks) {
      res.end();
      return;
    }

    // 写入数据
    const writeSuccess = res.write(chunkBuffer);

    chunksSent++;

    // 如果缓冲区满了，等待 drain 事件
    if (!writeSuccess) {
      res.once('drain', sendChunk);
    } else {
      // 使用 setImmediate 让出控制权，避免阻塞
      setImmediate(sendChunk);
    }
  };

  sendChunk();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 网络测速服务已启动`);
  console.log(`📡 本地访问: http://localhost:${PORT}`);
  console.log(`📡 局域网访问: http://192.168.1.80:${PORT}`);
  console.log(`📡 Tailscale: http://100.91.95.82:${PORT}`);
  console.log(`📡 ZeroTier: http://192.168.193.194:${PORT}`);
  console.log(`\n💡 在 iPad 浏览器打开任意上述地址即可开始测试`);

  // 启动时生成预生成文件
  generatePreGenFile();
});
