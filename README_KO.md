# CineGen AI Director — AI 만화 영상·모션 코믹·숏드라마 제작

[English](./README.md) · [简体中文](./README_ZH.md) · [日本語](./README_JA.md) · [한국어](./README_KO.md)

**CineGen AI Director**는 브라우저에서 사용하는 **AI 만화 영상, 모션 코믹, 애니매틱, 숏드라마 제작 워크벤치**입니다. **시나리오 → 캐릭터·배경 에셋 → 샷 키프레임 → 영상 클립** 순서로 작업을 연결합니다. Google Gemini로 시나리오를 정리하고 이미지를 생성하며, Veo로 영상 클립을 생성합니다.

## 제품 화면

![CineGen AI Director AI 만화 영상 제작 화면](https://github.com/user-attachments/assets/4d224a09-5752-4ab5-b4ff-a7ba2cc7a666)

![CineGen AI Director 모션 코믹 제작 워크플로 화면](https://github.com/user-attachments/assets/f21eb8ca-913d-4485-8be7-d70911505c79)

![CineGen AI Director 샷 그리드와 시작·종료 키프레임 편집 화면](./UI.png)

## AI 만화 영상·숏드라마 제작 과정

### 1. 시나리오와 스토리보드

스토리 개요나 시나리오를 입력하고 출력 언어와 목표 길이를 선택합니다. Gemini가 장면, 캐릭터, 샷을 정리하고 이미지 프롬프트와 카메라 움직임 정보를 생성합니다.

### 2. 캐릭터와 배경

캐릭터와 장소의 레퍼런스 이미지를 생성합니다. 기본 캐릭터 이미지를 참고하면서 여러 의상 스타일을 만들 수 있습니다.

### 3. 디렉터 워크벤치

그리드에서 샷을 관리하고 각 샷의 시작 프레임과 필요한 경우 종료 프레임을 생성합니다. 장면·캐릭터 이미지를 샷 이미지의 참고 자료로 사용하며, Veo로 시작 프레임 또는 시작·종료 프레임에서 영상 클립을 생성합니다.

### 4. 미리보기와 제작 현황

생성된 클립을 미리 보고 제작 화면에서 샷 순서와 완료 상태를 확인합니다.

**키프레임을 사용하는 이유:** 샷의 시작 이미지와 선택적인 종료 이미지를 지정하면 텍스트 프롬프트만 사용할 때보다 구도와 화면 전환을 직접 조절할 수 있습니다. 생성 결과는 검토하고 수정해야 합니다.

## 로컬에서 실행

Node.js, npm, 아래 모델에 접근할 수 있는 Google Gemini API 키가 필요합니다. 모델 이용 가능 여부와 요금은 Google 계정 및 지역에 따라 다릅니다.

```bash
git clone https://github.com/UllrAI/CineGen-ShortDrama.git
cd CineGen-ShortDrama
npm install
npm run dev
```

Vite가 출력한 로컬 URL(설정된 개발 포트는 `3000`)을 열고 Gemini API 키를 입력한 다음 **Phase 01**에서 프로젝트를 만드세요. 앱 UI는 현재 주로 중국어로 제공됩니다. 생성할 시나리오의 출력 언어는 프로젝트 설정에서 선택할 수 있습니다.

API 키는 브라우저 `localStorage`에, 프로젝트는 `IndexedDB`에 저장됩니다. 사이트 데이터를 삭제하면 로컬에 저장된 프로젝트도 삭제됩니다.

## 기술 구성

| 영역 | 구현 |
| --- | --- |
| 프런트엔드 | React 19, TypeScript, Vite 6, CDN으로 불러오는 Tailwind CSS |
| 시나리오·샷 기획 | `gemini-2.5-flash` |
| 이미지 생성 | `gemini-2.5-flash-image` |
| 영상 생성 | `veo-3.1-fast-generate-preview` |
| 브라우저 저장 | API 키는 `localStorage`, 프로젝트는 `IndexedDB` |

## 라이선스·AniKuku·문의

이 프로젝트의 소스 코드에는 [AniKuku Community License (ACL) v1.0](./license.md)이 적용됩니다. 이 별도 라이선스에는 출처 표시와 상업적 이용 조건이 포함되어 있습니다. 사용, 수정, 배포 또는 배포 환경 구축 전에 전문을 확인하세요.

[AniKuku](https://anikuku.com/?github-ko)는 온라인 AI 만화 영상 제작 플랫폼과 상업용·프라이빗 구축 옵션을 제공합니다. 첫 구매 시 결제 단계에서 `CINEGEN50OFF`를 입력하면 50% 할인을 받을 수 있습니다. 적용 조건은 플랫폼의 최신 안내를 확인하세요.

협업, 구축 또는 라이선스 문의: [visoar@ullrai.com](mailto:visoar@ullrai.com).

## Star History

<a href="https://www.star-history.com/?repos=ullrai%2Fcinegen-shortdrama&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
    <img alt="CineGen-ShortDrama GitHub 스타 증가 추이 차트" src="https://api.star-history.com/chart?repos=ullrai/cinegen-shortdrama&type=date&legend=top-left" />
  </picture>
</a>
