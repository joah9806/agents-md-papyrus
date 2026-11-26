// 规则安装模块：把模板写入目标目录，处理新建、内容相同、已存在和覆盖备份四种情况；不解析命令行参数，也不打印输出。
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { readTemplate } = require('./template.js');

const TARGET_NAME = 'AGENTS.md';
const BACKUP_NAME = 'AGENTS.md.bak';

function resolveTarget(dest) {
  const directory = path.resolve(dest || process.cwd());
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`目标目录不存在：${directory}`);
  }
  return path.join(directory, TARGET_NAME);
}

function installRules({ dest = process.cwd(), force = false } = {}) {
  const template = readTemplate();
  const target = resolveTarget(dest);

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, template, 'utf8');
    return { status: 'created', target };
  }

  const current = fs.readFileSync(target, 'utf8');
  if (current === template) {
    return { status: 'unchanged', target };
  }
  if (!force) {
    return { status: 'blocked', target };
  }

  const backup = path.join(path.dirname(target), BACKUP_NAME);
  fs.copyFileSync(target, backup);
  fs.writeFileSync(target, template, 'utf8');
  return { status: 'updated', target, backup };
}

function checkRules({ dest = process.cwd() } = {}) {
  const template = readTemplate();
  const target = resolveTarget(dest);

  if (!fs.existsSync(target)) {
    return { status: 'missing', target };
  }
  return {
    status: fs.readFileSync(target, 'utf8') === template ? 'latest' : 'outdated',
    target,
  };
}

module.exports = { TARGET_NAME, BACKUP_NAME, resolveTarget, installRules, checkRules };
