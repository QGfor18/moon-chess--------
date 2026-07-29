# 🌙 Moon Chess — 消失井字棋

基于 **React 19 + TypeScript + Vite** 构建的井字棋变体小游戏。

## 玩法介绍

- 棋盘为 N×N（默认 3×3），双方轮流落子
- 每方最多同时存在 **3 颗棋子**，落第 4 颗时最早的那颗会消失
- 先达成三连一线者获胜

## 如何运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | 前端 UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| CSS | 原生样式 |

## 项目结构

```
src/
├── components/   # UI 组件
├── hooks/        # 自定义 Hooks
├── logic/        # 游戏逻辑 & AI
├── styles/       # 样式文件
└── types/        # TypeScript 类型定义
```

## 🤖 AI 辅助声明

本项目大量使用 AI 辅助开发，绝大部分代码由 AI Agent 构建完成。同时感谢 [DeepSeek](https://www.deepseek.com/) 提供的高质量代码生成能力。

## 🗺️ 后续规划

- 🎨 美术优化：棋子与棋盘视觉升级、动画效果、UI 美化
- 📱 移动端适配：响应式布局优化
- 🏆 排行榜与成就系统
- 其他功能性完善
