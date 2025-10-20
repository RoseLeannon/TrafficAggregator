# 🚀 快速参考 - PrivateTrafficAggregator

## 📋 合约信息卡片

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        PrivateTrafficAggregator
        Ethereum Sepolia Testnet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 合约地址
   0x21496fae1cB670873ED228Ebb30265D42AD78538

🌐 网络信息
   Network:  Ethereum Sepolia
   Chain ID: 11155111
   RPC URL:  https://sepolia.infura.io/v3/YOUR_KEY

🔍 区块浏览器
   https://sepolia.etherscan.io/address/
   0x21496fae1cB670873ED228Ebb30265D42AD78538

📅 部署时间
   2025-10-23 20:08:23 (UTC+8)

👤 部署者
   0x6031f7908AfcD95bfB98C363af058CD05f93169F

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚡ 快速命令

### 编译和测试
```bash
npm run compile         # 编译合约
npm run test            # 运行测试
npm run test:gas        # Gas 报告
npm run clean           # 清理构建
```

### 部署和验证
```bash
npm run deploy:sepolia  # 部署到 Sepolia
npm run verify:sepolia  # 验证合约
npm run interact        # 与合约交互
npm run simulate        # 运行模拟
```

### 本地开发
```bash
npm run node            # 启动本地节点
npm run deploy:local    # 部署到本地
npm start               # 启动前端
```

---

## 🔑 环境变量

在 `.env` 文件中配置：

```bash
# 部署账户私钥
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Etherscan API Key (用于验证)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas 报告 (可选)
REPORT_GAS=true
```

---

## 📝 合约接口速查

### 管理员功能 (仅管理员)
```solidity
function registerRegion(string memory regionName) external
function authorizeReporter(address reporter) external
function updateReportCycleDuration(uint256 newDuration) external
function advanceCycle() external
```

### 报告者功能 (授权用户)
```solidity
function submitTrafficReport(
    uint256 regionId,
    euint8 congestionLevel,    // 0-100 加密
    euint32 vehicleCount,      // 车辆数加密
    euint8 averageSpeed        // 速度加密
) external
```

### 公共查询
```solidity
function admin() external view returns (address)
function currentReportCycle() external view returns (uint256)
function reportCycleDuration() external view returns (uint256)
function regionCount() external view returns (uint256)
function regions(uint256 regionId) external view returns (Region memory)
function authorizedReporters(address) external view returns (bool)
```

---

## 🔗 重要链接

### 区块浏览器
- **合约**: https://sepolia.etherscan.io/address/0x21496fae1cB670873ED228Ebb30265D42AD78538
- **部署交易**: https://sepolia.etherscan.io/tx/0x64f283f750a8f99029e06bec353a721a49e0b7ce959087d4a83f970bdcc2984c

### 文档
- **README**: `README.md`
- **部署指南**: `DEPLOYMENT_GUIDE.md`
- **Hardhat 总结**: `HARDHAT_SETUP_SUMMARY.md`
- **部署成功**: `DEPLOYMENT_SUCCESS.md`

### 在线资源
- **Hardhat**: https://hardhat.org/docs
- **Ethers.js**: https://docs.ethers.org/v6/
- **Zama FHE**: https://docs.zama.ai/
- **Sepolia Faucet**: https://sepoliafaucet.com/

---

## 💻 代码示例

### JavaScript/TypeScript

```javascript
const { ethers } = require('ethers');

// 1. 连接到合约
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const CONTRACT_ADDRESS = "0x21496fae1cB670873ED228Ebb30265D42AD78538";
const abi = require('./public/abi/PrivateTrafficAggregator.json');

const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// 2. 读取状态
const admin = await contract.admin();
const cycle = await contract.currentReportCycle();
const regionCount = await contract.regionCount();

console.log('Admin:', admin);
console.log('Current Cycle:', cycle.toString());
console.log('Regions:', regionCount.toString());

// 3. 注册区域 (仅管理员)
const tx = await contract.registerRegion("Downtown Area");
await tx.wait();
console.log('Region registered!');

// 4. 授权报告者 (仅管理员)
const reporterTx = await contract.authorizeReporter("0x...");
await reporterTx.wait();
console.log('Reporter authorized!');
```

### Hardhat 脚本

```javascript
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const contract = await hre.ethers.getContractAt(
    "PrivateTrafficAggregator",
    "0x21496fae1cB670873ED228Ebb30265D42AD78538"
  );

  // 读取数据
  const admin = await contract.admin();
  console.log("Admin:", admin);

  // 执行操作
  if (signer.address === admin) {
    const tx = await contract.registerRegion("Test Region");
    await tx.wait();
    console.log("Region registered!");
  }
}

main().catch(console.error);
```

---

## 📊 项目结构

```

├── contracts/
│   └── PrivateTrafficAggregator.sol   ✅ 已部署
│
├── scripts/
│   ├── deploy.js                      ✅ 部署脚本
│   ├── verify.js                      ✅ 验证脚本
│   ├── interact.js                    ✅ 交互脚本
│   └── simulate.js                    ✅ 模拟脚本
│
├── deployments/
│   └── sepolia-deployment.json        ✅ 部署记录
│
├── public/
│   ├── abi/
│   │   └── PrivateTrafficAggregator.json  ✅ 合约 ABI
│   └── config/
│       └── contracts.js               ✅ 前端配置
│
├── hardhat.config.ts                  ✅ Hardhat 配置
├── package.json                       ✅ 依赖配置
├── .env                               ⚠️  环境变量 (勿提交)
│
└── 文档/
    ├── README.md                      📖 项目说明
    ├── DEPLOYMENT_GUIDE.md            📖 部署指南
    ├── HARDHAT_SETUP_SUMMARY.md       📖 设置总结
    ├── DEPLOYMENT_SUCCESS.md          📖 部署成功
    └── QUICK_REFERENCE.md             📖 本文件
```

---

## 🎯 常见任务

### 任务 1: 查看合约状态
```bash
npm run interact
```

### 任务 2: 注册新区域
```javascript
await contract.registerRegion("New Region Name");
```

### 任务 3: 授权新报告者
```javascript
await contract.authorizeReporter("0x...");
```

### 任务 4: 提交交通报告
```javascript
// 需要 FHE 加密
await contract.submitTrafficReport(
  regionId,
  encryptedCongestion,
  encryptedVehicleCount,
  encryptedSpeed
);
```

### 任务 5: 查询区域信息
```javascript
const region = await contract.regions(regionId);
console.log(region);
```

---

## 🔐 安全提示

### ⚠️ 警告
- **永不泄露私钥**: 不要将 `.env` 文件提交到 Git
- **测试网专用**: 当前部署在测试网，不要用于生产
- **Gas 费用**: 确保账户有足够的 ETH 支付 gas
- **管理员权限**: 妥善保管管理员私钥

### ✅ 最佳实践
- 使用硬件钱包管理主网资金
- 在测试网充分测试后再部署主网
- 定期备份重要文件和密钥
- 监控合约活动和异常交易

---

## 📞 获取帮助

### 问题排查
1. 检查环境变量是否正确配置
2. 确认网络连接和 RPC URL
3. 验证账户余额充足
4. 查看完整错误信息

### 支持资源
- 📖 阅读项目文档
- 🔍 搜索 Hardhat 文档
- 💬 查看 GitHub Issues
- 🌐 访问 Etherscan 浏览器

---

## ✅ 检查清单

部署后的验证步骤：

- [x] 合约成功部署
- [x] 部署文件已生成
- [x] ABI 文件可用
- [x] 前端配置更新
- [ ] 合约在 Etherscan 验证
- [ ] 测试基本功能
- [ ] 前端集成完成
- [ ] 文档已更新

---

**快速参考版本**: 1.0
**最后更新**: 2025-10-23
**维护者**: Private Traffic Analytics Team

---

*保存此文件以便快速查阅合约信息和常用命令！* 🚀
