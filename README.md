# agents-md-papyrus

一份简体中文的 AI 编程协作规则（`AGENTS.md`），附带一个命令行工具，用 `npx` 一条命令把它安装或更新到任意项目根目录。

规则本身是这个仓库的主产物，工具只负责把它安全地放进你的项目：不会覆盖你自己写过的规则，覆盖前一定留下备份。

## 规则包含什么

| 小节 | 管的范围 |
| --- | --- |
| 沟通 | 语言、回答结构、信息取舍、事实与推断的区分 |
| 想法梳理 | 需求模糊时如何补齐关键缺口并收敛为可执行方案 |
| 自主执行 | 何时直接动手、改动范围的最小化、保留用户既有修改 |
| 澄清与授权 | 提问门槛、授权持续范围、外部操作的确认边界 |
| 信息与证据 | 验证要求、来源优先级、冲突证据的取舍 |
| 工具、验证与完成 | 工具选择、验证力度、完成标准与阻塞上报 |

## 安装

前提：本机有 Node.js 18 以上和 `git`（`npx` 需要从 GitHub 拉取源码）。在项目根目录执行：

```bash
npx github:joah9806/agents-md-papyrus
```

```text
已写入 /path/to/project/AGENTS.md（规则版本 v0.1.0）
```

## 更新与检查

```bash
npx github:joah9806/agents-md-papyrus check     # 只对比，不写文件
npx github:joah9806/agents-md-papyrus update    # 用最新规则覆盖，原文件备份为 AGENTS.md.bak
npx github:joah9806/agents-md-papyrus#v0.1.0    # 钉住指定版本
```

`update` 会先把现有文件复制成同目录下的 `AGENTS.md.bak`，再写入规则模板；重复执行时内容一致则不产生任何写入。

## 命令

| 命令 | 行为 |
| --- | --- |
| `install`（默认） | 目标目录没有 `AGENTS.md` 时写入；内容一致时跳过；内容不同时保留原文件 |
| `update` | 覆盖写入规则模板，覆盖前备份为 `AGENTS.md.bak` |
| `check` | 报告未安装、已最新或内容不一致，不修改文件 |

| 选项 | 说明 |
| --- | --- |
| `--dest <目录>` | 指定目标目录，默认为当前目录 |
| `-h`, `--help` | 显示帮助 |
| `-v`, `--version` | 显示版本 |

退出码：`0` 成功或已是最新；`2` 需要进一步动作（文件已存在且内容不同、尚未安装、内容不一致）；`1` 出错。

## 装好之后

`AGENTS.md` 是编码代理的通用约定文件。Qoder 官方文档说明其规则功能兼容 `AGENTS.md`：把文件放进项目目录，Agent 会自动识别并利用其中定义的规则，无需额外配置。

## 开发

```bash
npm test              # node --test，覆盖安装、跳过、拒绝覆盖、备份更新和退出码
npm run pack:release  # 生成带版本号的 agents-md-papyrus-<version>.tgz
```

目录结构：

```text
AGENTS.md        规则正文（本仓库同样使用自己的规则）
bin/cli.js       命令与参数解析、终端输出
src/install.js   写入、跳过、备份与状态判断
src/template.js  读取随包分发的规则模板
test/            单元测试与 CLI 端到端测试
```

版本号只有一个来源：`package.json` 的 `version`，CLI 的 `--version`、安装提示和 Git 标签 `v<版本号>` 都使用它。

## 许可

MIT
