# 打包与分发指南

本文档详细介绍 Node.js CLI 工具的打包和分发方式,包括 npm 发布、单文件打包和容器化部署。

## 分发方式对比

| 方式 | 优点 | 缺点 | 推荐度 |
|----|------|------|--------|
| **npm + npx** | 标准、简单、自动更新 | 需要 Node.js | ⭐⭐⭐⭐⭐ |
| **Node.js SEA** | 单文件、官方支持 | 需要 Node.js 20+ | ⭐⭐⭐⭐ |
| **nexe** | 单文件、无 Node.js 依赖 | 体积大、构建慢 | ⭐⭐⭐ |
| **Docker** | 环境隔离 | 体积大 | ⭐⭐⭐ |
| **Homebrew** | macOS 便利 | 平台限制 | ⭐⭐ |

---

## 方案 1: npm + npx ⭐ 推荐

### 优势

- ✅ 生态系统标准
- ✅ 自动更新支持
- ✅ 跨平台
- ✅ 简单分发

### package.json 配置

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "description": "My awesome CLI tool",
  "type": "module",
  "bin": {
    "mycli": "./bin/run.js"
  },
  "files": [
    "bin",
    "dist",
    "src"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "prepublishOnly": "pnpm run build"
  }
}
```

### 可执行文件

`bin/run.js`:
```javascript
#!/usr/bin/env node
import './index.js';
```

确保文件可执行:
```bash
chmod +x bin/run.js
```

### 发布到 npm

```bash
# 登录
npm login

# 检查包名是否可用
npm view my-cli

# 发布
npm publish

# 发布特定 tag
npm publish --tag beta

# 干运行 (检查但不发布)
npm publish --dry-run
```

### 用户安装

```bash
# 全局安装
npm install -g my-cli

# 使用 npx (无需安装)
npx mycli

# 特定版本
npx mycli@1.0.0

# 最新 beta 版本
npx mycli@beta
```

### 自动更新

使用 `update-notifier`:

```typescript
import updateNotifier from 'update-notifier';
import packageJson from '../package.json' assert { type: 'json' };

export function checkUpdate(): void {
  const notifier = updateNotifier({ pkg: packageJson });

  if (notifier.update) {
    notifier.notify();
  }
}
```

---

## 方案 2: Node.js SEA (Single Executable Application)

### 优势

- ✅ 官方支持
- ✅ 单文件分发
- ✅ 相对较小 (~30MB)
- ✅ 无需暴露源代码

### 要求

- Node.js 20+
- 支持平台: Linux, macOS, Windows

### 构建步骤

#### 1. 创建配置文件 `sea-config.json`

```json
{
  "main": "dist/index.js",
  "output": "sea-prep.blob"
}
```

#### 2. 构建项目

```bash
pnpm run build
```

#### 3. 生成 blob

```bash
node --experimental-sea-config sea-config.json
```

#### 4. 复制 Node.js 可执行文件

```bash
# macOS
cp $(command -v node) mycli

# Linux
cp $(readlink -f $(command -v node)) mycli

# Windows
copy "%USERPROFILE%\\AppData\\Roaming\\npm\\node.exe" mycli.exe
```

#### 5. 注入 blob

```bash
# macOS
npx postject mycli SEA_BLOB sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Linux
npx postject mycli SEA_BLOB sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Windows
npx postject mycli.exe NODE_SEA_BLOB sea-prep.blob ^
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
```

#### 6. 签名 (macOS)

```bash
codesign --sign -- mycli
```

### 脚本化构建

`package.json`:
```json
{
  "scripts": {
    "build:sea": "pnpm run build && node --experimental-sea-config sea-config.json",
    "package:sea": "pnpm run build:sea && node scripts/package-sea.js"
  }
}
```

`scripts/package-sea.js`:
```javascript
import { execSync } from 'child_process';
import { copyFile } from 'fs/promises';

const platform = process.platform;
const nodePath = execSync('command -v node').toString().trim();
const outputPath = 'dist/mycli' + (platform === 'win32' ? '.exe' : '');

await copyFile(nodePath, outputPath);

// 注入 blob
const blobPath = 'sea-prep.blob';
const fuse = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';

execSync(`postject ${outputPath} SEA_BLOB ${blobPath} --sentinel-fuse ${fuse}`);

console.log(`Single executable created: ${outputPath}`);
```

---

## 方案 3: nexe

### 优势

- ✅ 单文件
- ✅ 无需 Node.js
- ✅ 兼容性好 (Node.js 8-24)

### 安装

```bash
npm install -D nexe
```

### 打包

```bash
# 使用本地 Node.js
nexe bin/run.js -o mycli

# 指定目标
nexe bin/run.js -o mycli --target linux-x64-20.0.0

# 构建所有平台
nexe bin/run.js -o dist/mycli --build
```

### package.json

```json
{
  "scripts": {
    "package:nexe": "nexe bin/run.js -o dist/mycli --target macos-x64-20.0.0"
  }
}
```

---

## 方案 4: Docker

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

ENTRYPOINT ["node", "dist/index.js"]
```

### 构建和运行

```bash
# 构建
docker build -t mycli:latest .

# 运行
docker run -it --rm mycli:latest --help

# 挂载卷
docker run -it --rm -v $(pwd):/workspace mycli:latest build /workspace
```

### Docker Compose

```yaml
version: '3.8'
services:
  mycli:
    build: .
    volumes:
      - .:/workspace
    working_dir: /workspace
```

---

## 方案 5: Homebrew (macOS)

### 创建 Formula

`mycli.rb`:
```ruby
class Mycli < Formula
  desc "My awesome CLI tool"
  homepage "https://github.com/user/mycli"
  url "https://github.com/user/mycli/archive/v1.0.0.tar.gz"
  sha256 "..."  # 使用 sha256sum 生成

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    system "npm", "run", "build"
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/mycli", "--version"
  end
end
```

### 发布

```bash
# 创建 tap
brew tap user/mycli

# 安装
brew install user/mycli/mycli

# 更新
brew upgrade user/mycli/mycli
```

---

## 构建优化

### Tree-shaking

使用 ES 模块启用 tree-shaking:

```json
{
  "type": "module"
}
```

### 代码分割

```typescript
// 动态导入大型依赖
async function heavyOperation() {
  const { heavyLib } = await import('heavy-lib');
  return heavyLib.process();
}
```

### 压缩

使用 `esbuild` 或 `tsdown`:

```bash
# esbuild
esbuild src/index.ts --minify --bundle --outfile=dist/index.js

# tsdown
tsdown src/index.ts --format cjs --minify
```

---

## 版本管理

### 语义化版本

```
MAJOR.MINOR.PATCH

1.0.0 → 2.0.0  (破坏性变更)
1.0.0 → 1.1.0  (新功能)
1.0.0 → 1.0.1  (bug 修复)
```

### 使用 standard-version

```bash
npm install -D standard-version
```

`package.json`:
```json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:patch": "standard-version --release-as patch",
    "release:major": "standard-version --release-as major"
  }
}
```

### 自动化发布

`.github/workflows/release.yml`:
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install
      - run: pnpm run build
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 发布检查清单

在发布前,确保:

- [ ] 版本号已更新
- [ ] CHANGELOG.md 已更新
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] `bin/run.js` 可执行
- [ ] README.md 包含:
  - 安装说明
  - 使用示例
  - 贡献指南
- [ ] LICENSE 文件存在
- [ ] package.json 包含:
  - 正确的 `bin` 字段
  - `files` 字段 (限制发布文件)
  - `engines.node` (最低 Node.js 版本)
  - `repository` 链接
  - `bugs` 链接
  - `homepage` 链接
- [ ] 运行 `npm publish --dry-run` 检查

---

## 推荐方案总结

### 大多数项目

**推荐**: npm + npx

- 理由: 标准方式,简单,社区支持好

### 企业分发

**推荐**: Node.js SEA 或 nexe

- 理由: 单文件,无需安装 Node.js

### 开发团队

**推荐**: Docker

- 理由: 环境一致,易于集成

### macOS 用户

**推荐**: Homebrew

- 理由: 用户体验好,易于更新
