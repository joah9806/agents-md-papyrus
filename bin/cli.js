#!/usr/bin/env node
// CLI 入口：解析命令与选项、调用安装模块、把结果打印到终端；规则内容与写盘策略由 src/install.js 决定。
'use strict';

const { version } = require('../package.json');
const { installRules, checkRules, TARGET_NAME } = require('../src/install.js');

const NPX_COMMAND = 'npx github:joah9806/agents-md-papyrus';
const COMMANDS = new Set(['install', 'update', 'check']);

const USAGE = `agents-md-papyrus v${version} —— 安装与更新 AGENTS.md 协作规则

用法：
  ${NPX_COMMAND}         在当前目录安装 ${TARGET_NAME}
  ${NPX_COMMAND}#v${version}  钉住某个版本安装
  ${NPX_COMMAND} update  覆盖更新，原文件备份为 ${TARGET_NAME}.bak
  ${NPX_COMMAND} check   只检查差异，不写入文件

选项：
  --dest <目录>   指定目标目录，默认为当前目录
  -h, --help      显示本帮助
  -v, --version   显示版本

退出码：0 成功或已是最新 · 2 需要进一步动作 · 1 出错`;

function parseArgs(argv) {
  const options = { command: 'install', dest: process.cwd(), help: false, showVersion: false };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else if (argument === '--version' || argument === '-v') {
      options.showVersion = true;
    } else if (argument === '--dest') {
      const value = argv[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('--dest 需要一个目录参数');
      }
      options.dest = value;
      index += 1;
    } else if (argument.startsWith('--dest=')) {
      options.dest = argument.slice('--dest='.length);
    } else if (argument.startsWith('-')) {
      throw new Error(`未知选项：${argument}`);
    } else {
      positional.push(argument);
    }
  }

  if (positional.length > 1) {
    throw new Error(`只接受一个命令，收到：${positional.join(' ')}`);
  }

  const command = positional[0] || 'install';
  if (!COMMANDS.has(command)) {
    throw new Error(`未知命令：${command}`);
  }

  return { ...options, command };
}

function reportInstall(result) {
  if (result.status === 'created') {
    console.log(`已写入 ${result.target}（规则版本 v${version}）`);
    return 0;
  }
  if (result.status === 'unchanged') {
    console.log(`${result.target} 已与 v${version} 一致，无需更新。`);
    return 0;
  }
  if (result.status === 'updated') {
    console.log(`已更新 ${result.target} 至 v${version}，原文件备份为 ${result.backup}`);
    return 0;
  }
  console.log(`检测到已有 ${result.target}，内容与 v${version} 不同，已保留原文件。`);
  console.log(`  确认替换为规则模板：${NPX_COMMAND} update`);
  return 2;
}

function reportCheck(result) {
  if (result.status === 'latest') {
    console.log(`${result.target} 与 v${version} 一致。`);
    return 0;
  }
  if (result.status === 'outdated') {
    console.log(`${result.target} 与 v${version} 不一致，可能是项目自定义规则。`);
    return 2;
  }
  console.log(`尚未安装：${result.target} 不存在。`);
  return 2;
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`错误：${error.message}\n\n${USAGE}`);
    return 1;
  }

  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  if (options.showVersion) {
    console.log(version);
    return 0;
  }

  try {
    if (options.command === 'check') {
      return reportCheck(checkRules({ dest: options.dest }));
    }
    return reportInstall(installRules({ dest: options.dest, force: options.command === 'update' }));
  } catch (error) {
    console.error(`错误：${error.message}`);
    return 1;
  }
}

process.exit(main());
