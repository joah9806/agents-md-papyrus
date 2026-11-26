'use strict';
// 安装模块测试：在系统临时目录中验证新建、相同跳过、拒绝覆盖、备份更新和检查状态，不触碰真实项目文件。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { installRules, checkRules, resolveTarget } = require('../src/install.js');
const { readTemplate } = require('../src/template.js');

function withTempDir(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-md-papyrus-'));
  try {
    return run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('目标目录不存在时抛出错误', () => {
  const missing = path.join(os.tmpdir(), 'agents-md-papyrus-不存在');
  assert.throws(() => resolveTarget(missing), /目标目录不存在/);
});

test('首次安装写入规则模板', () => {
  withTempDir((dir) => {
    const result = installRules({ dest: dir });
    assert.equal(result.status, 'created');
    assert.equal(fs.readFileSync(result.target, 'utf8'), readTemplate());
  });
});

test('内容一致时重复安装不产生改动', () => {
  withTempDir((dir) => {
    installRules({ dest: dir });
    const result = installRules({ dest: dir });
    assert.equal(result.status, 'unchanged');
    assert.equal(fs.existsSync(path.join(dir, 'AGENTS.md.bak')), false);
  });
});

test('已有自定义规则时拒绝覆盖', () => {
  withTempDir((dir) => {
    const custom = '# 项目自己的规则\n';
    const target = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(target, custom, 'utf8');

    const result = installRules({ dest: dir });
    assert.equal(result.status, 'blocked');
    assert.equal(fs.readFileSync(target, 'utf8'), custom);
    assert.equal(fs.existsSync(path.join(dir, 'AGENTS.md.bak')), false);
  });
});

test('强制更新前把原文件备份', () => {
  withTempDir((dir) => {
    const target = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(target, '# 旧规则\n', 'utf8');

    const result = installRules({ dest: dir, force: true });
    assert.equal(result.status, 'updated');
    assert.equal(fs.readFileSync(result.backup, 'utf8'), '# 旧规则\n');
    assert.equal(fs.readFileSync(target, 'utf8'), readTemplate());
  });
});

test('check 区分未安装、最新与不一致', () => {
  withTempDir((dir) => {
    assert.equal(checkRules({ dest: dir }).status, 'missing');

    installRules({ dest: dir });
    assert.equal(checkRules({ dest: dir }).status, 'latest');

    fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# 改过\n', 'utf8');
    assert.equal(checkRules({ dest: dir }).status, 'outdated');
  });
});
