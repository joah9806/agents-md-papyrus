'use strict';
// CLI 端到端测试：以子进程运行 bin/cli.js，验证版本输出、安装结果、拒绝覆盖的退出码和错误处理。
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');
const { version } = require('../package.json');

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { cwd, encoding: 'utf8' });
}

function withTempDir(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-md-papyrus-cli-'));
  try {
    return run(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('--version 输出与 package.json 相同的版本', () => {
  const result = runCli(['--version']);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), version);
});

test('install 写入文件并返回退出码 0', () => {
  withTempDir((dir) => {
    const result = runCli(['install', '--dest', dir]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /已写入/);
    assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')));
  });
});

test('已有自定义规则时返回退出码 2 且不改文件', () => {
  withTempDir((dir) => {
    const target = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(target, '# 项目自己的规则\n', 'utf8');

    const result = runCli(['install', '--dest', dir]);
    assert.equal(result.status, 2);
    assert.equal(fs.readFileSync(target, 'utf8'), '# 项目自己的规则\n');
  });
});

test('check 在未安装目录返回退出码 2', () => {
  withTempDir((dir) => {
    const result = runCli(['check', '--dest', dir]);
    assert.equal(result.status, 2);
    assert.match(result.stdout, /尚未安装/);
  });
});

test('未知命令报错并返回退出码 1', () => {
  const result = runCli(['deploy']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /未知命令：deploy/);
});
