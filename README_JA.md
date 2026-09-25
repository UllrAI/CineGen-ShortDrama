# CineGen AI Director — AIマンガ動画・モーションコミック・ショートドラマ制作

[English](./README.md) · [简体中文](./README_ZH.md) · [日本語](./README_JA.md) · [한국어](./README_KO.md)

**CineGen AI Director** は、ブラウザーで使える **AIマンガ動画、モーションコミック、アニマティクス、ショートドラマの制作ワークベンチ**です。**脚本 → キャラクター・背景素材 → ショットのキーフレーム → 動画クリップ**という流れで制作を進めます。Google Gemini を脚本整理と画像生成に、Veo を動画クリップ生成に使用します。

## 画面イメージ

![CineGen AI Director のAIマンガ動画制作画面](https://github.com/user-attachments/assets/4d224a09-5752-4ab5-b4ff-a7ba2cc7a666)

![CineGen AI Director のモーションコミック制作フロー画面](https://github.com/user-attachments/assets/f21eb8ca-913d-4485-8be7-d70911505c79)

![CineGen AI Director のショット一覧と開始・終了キーフレーム編集画面](./UI.png)

## AIマンガ動画・ショートドラマの制作フロー

### 1. 脚本と絵コンテ

物語のあらすじや脚本を入力し、出力言語と目標尺を選択します。Gemini がシーン、キャラクター、ショットを整理し、画像生成用プロンプトやカメラワークの情報を作成します。

### 2. キャラクターと背景

キャラクターとロケーションの参照画像を生成します。キャラクターの基本デザインを参照しながら、衣装違いのビジュアルも作成できます。

### 3. ディレクターワークベンチ

ショットをグリッドで管理し、各ショットの開始フレームと、必要に応じて終了フレームを生成します。シーン画像とキャラクター画像をショット生成の参照に使用し、Veo で開始フレームまたは開始・終了フレームから動画クリップを生成します。

### 4. プレビューと進捗確認

生成済みクリップをプレビューし、制作画面でショットの並びと完了状況を確認します。

**キーフレームを使う理由：** ショットの開始画像と任意の終了画像を決めることで、テキストプロンプトだけの場合より構図や画面のつながりを直接指定できます。生成結果の確認と調整は必要です。

## ローカルで実行

Node.js、npm、および本プロジェクトで使用する Gemini と Veo のモデルにアクセスできる Google Gemini API キーが必要です。モデルの利用可否と料金は Google アカウントや地域によって異なります。

```bash
git clone https://github.com/UllrAI/CineGen-ShortDrama.git
cd CineGen-ShortDrama
npm install
npm run dev
```

Vite が表示するローカル URL（開発ポートの設定は `3000`）を開き、Gemini API キーを入力して **Phase 01** からプロジェクトを作成します。アプリの UI は現在主に中国語です。生成する脚本の言語はプロジェクト設定で選択できます。

API キーはブラウザーの `localStorage`、プロジェクトは `IndexedDB` に保存されます。サイトデータを消去すると、ローカルのプロジェクトも削除されます。

## ライセンス・AniKuku・お問い合わせ

本プロジェクトのソースコードには [AniKuku Community License (ACL) v1.0](./license.md) が適用されます。この独自ライセンスにはクレジット表記と商用利用に関する条件があります。使用、変更、再配布、デプロイの前に全文をご確認ください。

[AniKuku](https://anikuku.com/?github-ja) は、オンラインのAIマンガ動画制作プラットフォームと、商用・プライベート環境への導入プランを提供しています。初回購入時には、決済画面で `CINEGEN50OFF` を入力すると 50% 割引になります。適用条件はプラットフォームの最新情報をご確認ください。

提携、導入、ライセンスに関するお問い合わせ：[visoar@ullrai.com](mailto:visoar@ullrai.com)。

## Star History

<a href="https://www.star-history.com/?repos=ullrai%2Fcinegen-shortdrama&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
    <img alt="CineGen-ShortDrama のGitHubスター推移グラフ" src="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
  </picture>
</a>
