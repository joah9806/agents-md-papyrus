// 规则模板模块：定位并读取随包分发的 AGENTS.md 文本，只负责提供内容，不负责写盘和参数解析。
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'AGENTS.md');

function readTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

module.exports = { TEMPLATE_PATH, readTemplate };
