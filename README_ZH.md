# CineGen AI Director — AI 漫剧、动态漫与短剧制作工作台

[English](./README.md) · [简体中文](./README_ZH.md) · [日本語](./README_JA.md) · [한국어](./README_KO.md)

**CineGen AI Director** 是一款在浏览器中运行的 **AI 漫剧、动态漫画、解说漫、影视分镜与短剧制作工具**。它把 **剧本 → 角色与场景资产 → 镜头关键帧 → 视频片段** 串成一条制作流程，用 Google Gemini 辅助剧本与图像生成，用 Veo 生成视频片段。

## 产品截图

![CineGen AI Director AI 漫剧制作界面](https://github.com/user-attachments/assets/4d224a09-5752-4ab5-b4ff-a7ba2cc7a666)

![CineGen AI Director 动态漫画制作流程界面](https://github.com/user-attachments/assets/f21eb8ca-913d-4485-8be7-d70911505c79)

![CineGen AI Director 镜头网格与首尾关键帧编辑界面](./UI.png)

## AI 漫剧与短剧制作流程

### 1. 剧本与分镜

输入故事大纲或剧本，选择输出语言和目标时长，再用 Gemini 整理场景、角色、镜头、画面提示词与运镜信息。

### 2. 角色与场景

为角色和场景生成参考图；为同一角色创建不同服装造型，并保留基础形象供后续镜头参考。

### 3. 导演工作台

在网格中管理镜头，为每个镜头生成起始帧，并按需生成结束帧。生成镜头画面时可参考场景图和角色图，再用 Veo 根据起始帧或首尾帧生成视频片段。

### 4. 预览与制作进度

预览已生成的视频片段，在制作工作台中查看镜头序列和完成情况。

**为什么使用关键帧？** 先确定镜头的起始画面及可选的结束画面，比只输入文字提示词更便于控制构图与画面过渡。生成结果仍需人工检查和迭代。

## 本地运行 CineGen

需要 Node.js、npm，以及可访问项目所用 Gemini 和 Veo 模型的 Google Gemini API Key。模型可用性和计费取决于 Google 账号及所在地区。

```bash
git clone https://github.com/UllrAI/CineGen-ShortDrama.git
cd CineGen-ShortDrama
npm install
npm run dev
```

打开 Vite 输出的本地地址（开发端口配置为 `3000`），在应用中输入 Gemini API Key，然后从 **Phase 01** 创建项目。应用界面目前以中文为主；生成剧本的输出语言可在项目配置中选择。

API Key 保存在浏览器 `localStorage`，项目保存在浏览器 `IndexedDB`。清除站点数据会删除本地保存的项目。

## 许可证、AniKuku 与联系

本项目源码采用 [AniKuku Community License (ACL) v1.0](./license.md)。该自定义许可证包含署名要求和商业使用条件；使用、修改、分发或部署前请阅读完整条款。

[AniKuku AI 漫剧制作平台](https://anikuku.com/?github-cn) 提供在线制作，以及商业化部署、私有化部署等合作方案。首次购买时可在结账页使用 `CINEGEN50OFF` 获得 50% 折扣，具体以平台当前规则为准。

合作、部署或授权咨询：[visoar@ullrai.com](mailto:visoar@ullrai.com)。

## Star History

<a href="https://www.star-history.com/?repos=ullrai%2Fcinegen-shortdrama&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
    <img alt="CineGen-ShortDrama GitHub Star 增长趋势图" src="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
  </picture>
</a>
