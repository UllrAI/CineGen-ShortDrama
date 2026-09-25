# CineGen AI Director — AI Manga, Motion Comics & Short Drama Production

[English](./README.md) · [简体中文](./README_ZH.md) · [日本語](./README_JA.md) · [한국어](./README_KO.md)

**CineGen AI Director** is a browser-based production workbench for **AI manga videos, motion comics, animated comics, animatics, and short dramas**. Its **script → assets → keyframes → video** workflow connects story planning, character and scene references, shot design, and video generation in one place. It uses Google Gemini for script and image generation and Veo for video clips.

## Screenshots

![CineGen AI Director AI manga production interface](https://github.com/user-attachments/assets/4d224a09-5752-4ab5-b4ff-a7ba2cc7a666)

![CineGen AI Director motion comic workflow interface](https://github.com/user-attachments/assets/f21eb8ca-913d-4485-8be7-d70911505c79)

![CineGen AI Director shot grid and start/end keyframe editor](./UI.png)

## AI manga and short drama workflow

### 1. Script and storyboard

Enter a story outline or script. Choose the output language and target duration, then use Gemini to structure scenes, characters, and shots with visual prompts and camera directions.

### 2. Characters and scenes

Generate reference images for characters and locations. Create multiple character looks while retaining a base reference for later shots.

### 3. Director workbench

Manage shots in a visual grid. Generate a start frame and, when needed, an end frame for each shot. Scene and character images provide visual context for image generation. Use Veo to generate a video clip from the start frame or from both keyframes.

### 4. Preview and production status

Preview generated clips and review the sequence and shot completion status in the production workspace.

**Why keyframes?** Defining the beginning and optional ending image of a shot gives creators more direct control over composition and transitions than a text prompt alone. Generated results still require review and iteration.

## Run CineGen locally

You need Node.js, npm, and a Google Gemini API key with access to the Gemini and Veo models used by the project. Model availability and billing depend on your Google account and region.

```bash
git clone https://github.com/UllrAI/CineGen-ShortDrama.git
cd CineGen-ShortDrama
npm install
npm run dev
```

Open the local URL printed by Vite (the configured development port is `3000`), enter your Gemini API key, and create a project in **Phase 01**. The application interface is primarily in Chinese; you can choose the generated script's output language in the project settings.

The API key is stored in browser `localStorage`, and projects are stored in browser `IndexedDB`. Clearing site data removes locally saved projects.

## License, AniKuku, and contact

The source is available under the [AniKuku Community License (ACL) v1.0](./license.md). This custom license includes attribution requirements and commercial-use conditions. Read it before using, modifying, distributing, or deploying the project.

[AniKuku](https://anikuku.com/?github) offers a hosted AI manga and motion comic production platform, as well as commercial and private deployment options. For a first purchase, use `CINEGEN50OFF` at checkout for 50% off, subject to AniKuku's current terms.

For collaboration, deployment, or licensing inquiries, contact [visoar@ullrai.com](mailto:visoar@ullrai.com).

## Star History

<a href="https://www.star-history.com/?repos=ullrai%2Fcinegen-shortdrama&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
    <img alt="CineGen-ShortDrama GitHub star history chart" src="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
  </picture>
</a>
