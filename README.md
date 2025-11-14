# Acca Games - AI 역량검사 전략게임 연습

AI 역량검사에 나오는 전략게임을 연습하고 결과를 분석할 수 있는 데스크톱 애플리케이션입니다.

## ✨ 개발 이유

AI 역량검사를 준비하면서, 특정 유형의 게임을 반복적으로 연습하고 약점을 파악할 수 있는 도구가 필요했습니다. 이 프로젝트는 사용자가 자신의 컴퓨터에서 편하게 연습하고, 플레이 기록을 로컬에 저장하여 스스로의 성과를 추적하고 분석할 수 있도록 돕기 위해 시작되었습니다.

## 🎮 포함된 게임

- **가위바위보 (Rock-Paper-Scissors)**
- **도형 회전하기 (Shape Rotation)**
- **숫자 누르기 (Number Pressing)**
- **도형 순서 기억하기 (N-Back)**

각 게임의 상세한 기획 내용은 [GAME_PLAN.md](GAME_PLAN.md) 문서에서 확인하실 수 있습니다.

## 🛠️ 기술 스택

- **Application Framework**: [Wails](https://wails.io/) (Go + Web Technologies)
- **Backend**: Go
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: SQLite

## 📂 프로젝트 구조

```
/
├── build/              # Wails 빌드 결과물 (실행 파일)
├── database/           # 데이터베이스 스키마 및 쿼리
├── frontend/           # React 프론트엔드 소스 코드
├── games/              # 각 게임의 Go 로직
├── types/              # Go 와 프론트엔드에서 공유하는 타입 정의
├── app.go              # Wails 애플리케이션 기본 로직
├── main.go             # 애플리케이션 진입점
└── wails.json          # Wails 프로젝트 설정
```

## 🚀 시작하기

### 사전 요구사항

- [Go](https://golang.org/doc/install) (v1.18 이상)
- [Node.js](https://nodejs.org/en/download/) (v16 이상)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### 개발 모드 실행

1.  **의존성 설치**
    ```bash
    # frontend/ 디렉토리에서 npm 패키지 설치
    cd frontend
    npm install
    cd ..
    ```

2.  **개발 서버 실행**
    ```bash
    wails dev
    ```
    애플리케이션이 개발 모드로 실행되며, 코드 변경 시 자동으로 리로드됩니다.

## 📦 빌드하기

플랫폼에 맞는 실행 파일을 빌드하려면 다음 명령어를 사용하세요.

```bash
# macOS 용으로 빌드
wails build

# Windows 용으로 빌드
wails build -platform windows
```

빌드가 완료되면 `build/bin` 디렉토리에서 실행 파일을 찾을 수 있습니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.