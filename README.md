# Acca Games - AI 역량검사 전략게임 연습

**바로 플레이**: [https://fake-dev-log.github.io/acca-games/](https://fake-dev-log.github.io/acca-games/)

AI 역량검사에 나오는 전략게임을 연습하고 결과를 분석할 수 있는 웹 앱입니다. 설치 없이 브라우저에서 돌아가고, 플레이 기록은 그 브라우저에 저장됩니다.

## ✨ 개발 이유

AI 역량검사를 준비하면서, 특정 유형의 게임을 반복적으로 연습하고 약점을 파악할 수 있는 도구가 필요했습니다. 이 프로젝트는 사용자가 편하게 연습하고, 플레이 기록을 로컬에 저장하여 스스로의 성과를 추적하고 분석할 수 있도록 돕기 위해 시작되었습니다.

## 🎮 포함된 게임

- **가위바위보 (Rock-Paper-Scissors)**
- **도형 회전하기 (Shape Rotation)**
- **숫자 누르기 (Number Pressing)**
- **도형 순서 기억하기 (N-Back)**
- **개수 비교하기 (Count Comparison)**
- **고양이 술래잡기 (Cat Chaser)**
- **약속 정하기 (Appointment)**
- **길 만들기 (Path)**
- **마법약 만들기 (Potion)**

잡다 AI 역량검사 전략게임 9종을 모두 담았습니다. 각 게임의 상세한 기획 내용은 [GAME_PLAN.md](docs/GAME_PLAN.md) · [GAME_PLAN_2.md](docs/GAME_PLAN_2.md) · [GAME_PLAN_3.md](docs/GAME_PLAN_3.md) 문서에서 확인하실 수 있습니다. 새 3종(약속 정하기·길 만들기·마법약 만들기)은 공개 자료(잡다 전략게임 안내, 연습 사이트들의 규칙 설명)를 기준으로 실전 구성(문항 수·제한 시간)까지 맞췄고, 연습 모드에서는 설정을 바꿀 수 있습니다.

## 📊 기록

- 게임을 끝까지 마치면 세션 하나가 브라우저 IndexedDB 에 저장됩니다. 중간에 나간 판은 저장하지 않습니다.
- **기록** 화면에서 게임별 추이(정답률·반응 시간 등)와 세션별 상세(라운드·유형별 정답률, 문제별 결과)를 볼 수 있습니다.
- 기록은 그 브라우저에만 있습니다. 브라우저의 사이트 데이터를 지우거나 다른 기기·브라우저에서 열면 보이지 않습니다.

## 🛠️ 기술 스택

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand
- **저장소**: 브라우저 IndexedDB
- **배포**: GitHub Pages (`main` push 시 GitHub Actions 가 테스트·빌드 후 `gh-pages` 브랜치로 배포)

## 📂 프로젝트 구조

```
frontend/src/
├── games/        # 게임 레지스트리(registry.ts)와 공용 타입·집계 헬퍼
├── features/     # 게임별 폴더: logic/(엔진·타입) · stores/ · components/ · definition.ts
├── records/      # IndexedDB 기록 저장소
├── pages/        # 메인·게임 선택·기록 화면
└── components/   # 공용 UI·레이아웃
```

새 게임은 `features/<게임>/definition.ts` 에 정의를 만들고 `games/registry.ts` 에 한 줄 추가하면 라우트·게임 선택·결과·기록 화면에 모두 붙습니다.

## 🚀 개발

```bash
cd frontend
npm install
npm run dev     # 개발 서버
npm test        # 테스트 (vitest)
npm run build   # 타입 검사 + 프로덕션 빌드
```

## 🖥️ 데스크톱 버전 (구버전)

예전에는 Wails(Go + SQLite) 데스크톱 앱으로 배포했습니다. 지금은 웹 버전만 관리하고, 데스크톱 코드는 `desktop-v1` 태그에 남겨 두었습니다. 아래 파일은 게임 6종이 들어 있는 마지막 데스크톱 빌드입니다.

*   **macOS**: [acca-games-macos-universal.zip](https://docs.google.com/uc?export=download&id=1NYNRKoUo7PMHXLgq7vOtkHKCh_eL6f7Q)
*   **Windows**: [acca-games-windows-amd64.zip](https://docs.google.com/uc?export=download&id=1KQ-nS6LQm8nb1H8Iq1WpcBQeQDtzcUki)

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
