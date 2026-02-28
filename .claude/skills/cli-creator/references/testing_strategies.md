# CLI 测试策略

本文档提供 Node.js CLI 工具的完整测试策略,包括框架选择、测试模式和最佳实践。

## 测试框架选择

### Vitest ⭐ 推荐

**优点**:
- 极速测试执行
- Vite 生态集成
- 开箱即用的 TypeScript 支持
- 内置覆盖率工具
- HMR 支持

**适用**: 所有现代 CLI 项目

```bash
npm install -D vitest @vitest/coverage-v8
```

**配置文件** `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/'],
    },
  },
});
```

---

### Jest

**优点**:
- 成熟稳定
- 生态丰富
- 大型项目支持好

**适用**: 大型项目或从 Jest 迁移

```bash
npm install -D jest @types/jest ts-jest
```

---

### Node Test Runner

**优点**:
- 内置,零依赖
- 官方支持

**适用**: 简单项目

```typescript
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('CLI', () => {
  test('should work', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

---

## 测试模式

### 1. CLI 输出测试

使用 `execa` 执行 CLI 并测试输出:

```typescript
import { describe, it, expect } from 'vitest';
import { execaCommand } from 'vitest/execa';

describe('CLI', () => {
  it('should display version', async () => {
    const { stdout } = await execaCommand('node ./bin/run.js --version');
    expect(stdout).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should show help', async () => {
    const { stdout } = await execaCommand('node ./bin/run.js --help');
    expect(stdout).toContain('USAGE');
    expect(stdout).toContain('OPTIONS');
    expect(stdout).toContain('COMMANDS');
  });

  it('should handle errors gracefully', async () => {
    const { stderr, exitCode } = await execaCommand(
      'node ./bin/run.js --non-existent-option'
    );
    expect(exitCode).toBeGreaterThan(0);
    expect(stderr).toBeTruthy();
  });
});
```

### 2. 单元测试

测试独立函数和模块:

```typescript
import { describe, it, expect } from 'vitest';
import { formatOutput, validateConfig } from '../src/lib/utils.js';

describe('utils', () => {
  describe('formatOutput', () => {
    it('should format JSON output', () => {
      const input = { foo: 'bar' };
      const output = formatOutput(input, 'json');
      expect(output).toBe(JSON.stringify(input, null, 2));
    });

    it('should format text output', () => {
      const input = { foo: 'bar' };
      const output = formatOutput(input, 'text');
      expect(output).toContain('foo: bar');
    });
  });

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const config = { apiKey: 'test-key' };
      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should reject invalid config', () => {
      const config = { apiKey: '' };
      expect(() => validateConfig(config)).toThrow();
    });
  });
});
```

### 3. 集成测试

测试完整的工作流:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execaCommand } from 'vitest/execa';
import { rm } from 'fs/promises';
import { tmpdir } from 'os';

describe('CLI integration tests', () => {
  const testDir = `${tmpdir()}/my-cli-test-${Date.now()}`;

  beforeAll(async () => {
    await execaCommand(`mkdir -p ${testDir}`);
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should initialize a project', async () => {
    const { stdout } = await execaCommand(
      `node ./bin/run.js init ${testDir}`
    );
    expect(stdout).toContain('Project initialized');
  });

  it('should build the project', async () => {
    const { stdout } = await execaCommand(
      `node ./bin/run.js build`,
      { cwd: testDir }
    );
    expect(stdout).toContain('Build complete');
  });
});
```

### 4. Mock 文件系统

使用 `memfs` 或 `temp-dir`:

```typescript
import { describe, it, expect } from 'vitest';
import { vol } from 'memfs';
import { readConfig } from '../src/lib/config.js';

describe('config', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should read config file', () => {
    vol.fromJSON({
      '/project/mycli.config.js': 'export default { apiKey: "test" }',
    });

    const config = readConfig('/project');
    expect(config.apiKey).toBe('test');
  });
});
```

### 5. Mock 外部 API

使用 `vi.mock()`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchUserData } from '../src/lib/api.js';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';

describe('api', () => {
  it('should fetch user data', async () => {
    vi.mocked(execa).mockResolvedValue({
      stdout: JSON.stringify({ name: 'John' }),
    } as any);

    const data = await fetchUserData('john');
    expect(data.name).toBe('John');
  });
});
```

## 测试 Ink 组件

使用 `ink-testing-library`:

```bash
npm install -D @testing-library/react @testing-library/jest-dom ink-testing-library
```

```typescript
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import App from '../src/App.js';

describe('App', () => {
  it('should render correctly', () => {
    const { lastFrame } = render(<App name="World" />);
    expect(lastFrame()).toContain('Hello, World!');
  });
});
```

## 覆盖率配置

### Vitest 覆盖率

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/',
      ],
    },
  },
});
```

### 运行覆盖率

```bash
# 运行测试并生成覆盖率
pnpm test:coverage

# 在浏览器中查看
open coverage/index.html
```

## 测试最佳实践

### 1. 测试文件组织

```
test/
├── commands/
│   ├── init.test.ts
│   ├── build.test.ts
│   └── deploy.test.ts
├── lib/
│   ├── config.test.ts
│   ├── logger.test.ts
│   └── api.test.ts
├── utils/
│   └── format.test.ts
└── integration/
    └── workflow.test.ts
```

### 2. AAA 模式

```typescript
it('should create a file', async () => {
  // Arrange (准备)
  const filename = 'test.txt';
  const content = 'Hello, World!';

  // Act (执行)
  await createFile(filename, content);

  // Assert (断言)
  expect(fs.existsSync(filename)).toBe(true);
  expect(fs.readFileSync(filename, 'utf-8')).toBe(content);
});
```

### 3. 测试异步代码

```typescript
it('should handle async operations', async () => {
  const result = await asyncOperation();
  expect(result).toBeDefined();
});

it('should timeout after 5 seconds', async () => {
  const result = await slowOperation({ timeout: 5000 });
  expect(result).toBe('timeout');
}, 6000);  // 设置测试超时
```

### 4. 测试错误处理

```typescript
it('should throw on invalid input', () => {
  expect(() => validateInput('')).toThrow();
});

it('should handle API errors', async () => {
  vi.mocked(execa).mockRejectedValue(new Error('API Error'));

  await expect(fetchData()).rejects.toThrow('API Error');
});
```

### 5. 使用快照测试

```typescript
it('should match help output snapshot', async () => {
  const { stdout } = await execaCommand('node ./bin/run.js --help');
  expect(stdout).toMatchSnapshot();
});
```

## CI/CD 集成

### GitHub Actions

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm test
    - pnpm test:coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## 性能测试

```typescript
import { describe, it, expect } from 'vitest';
import { bench, describe as benchDescribe } from 'vitest';

describe('performance', () => {
  bench('formatOutput', () => {
    formatOutput({ foo: 'bar' }, 'json');
  });

  it('should complete within 1 second', async () => {
    const start = Date.now();
    await slowOperation();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

## TDD 工作流

```bash
# 1. 写测试
# test/commands/init.test.ts

# 2. 运行测试 (失败)
pnpm test

# 3. 实现功能
# src/commands/init.ts

# 4. 运行测试 (通过)
pnpm test

# 5. 重构
pnpm test
```

## 常见问题

### Q: 如何测试彩色输出?

使用 `strip-ansi`:

```typescript
import stripAnsi from 'strip-ansi';

it('should show colored output', async () => {
  const { stdout } = await execaCommand('node ./bin/run.js');
  const plainText = stripAnsi(stdout);
  expect(plainText).toContain('Success');
});
```

### Q: 如何测试用户输入?

使用 `enquirer` 的 mock:

```typescript
import { prompt } from 'enquirer';
import { vi } from 'vitest';

vi.spyOn(require('enquirer'), 'prompt').mockResolvedValue({
  name: 'my-project',
});

it('should prompt for project name', async () => {
  await initCommand();
  expect(prompt).toHaveBeenCalledWith([
    expect.objectContaining({ name: 'name' })
  ]);
});
```

### Q: 如何测试文件生成?

使用临时目录:

```typescript
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('file operations', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'test-'));

  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create files', () => {
    const filePath = join(tempDir, 'test.txt');
    createFile(filePath, 'content');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
```

## 测试检查清单

在发布前,确保:

- [ ] 所有命令都有测试
- [ ] 核心功能有单元测试
- [ ] 主要工作流有集成测试
- [ ] 错误处理有测试
- [ ] 覆盖率 > 80%
- [ ] CI 中运行测试
- [ ] 无 flaky 测试
- [ ] 测试执行时间 < 30 秒
