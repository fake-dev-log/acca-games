# Acca Games - AI 역량검사 전략게임 연습

## ⬇️ 다운로드

*   **macOS**: [acca-games-macos-universal.zip](https://drive.google.com/file/d/1NYNRKoUo7PMHXLgq7vOtkHKCh_eL6f7Q/view?usp=drive_link)
*   **Windows**: [acca-games-windows-amd64.zip](https://drive.google.com/file/d/1KQ-nS6LQm8nb1H8Iq1WpcBQeQDtzcUki/view?usp=drive_link)

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

Wails는 크로스 컴파일을 지원하지만, 호스트 OS와 타겟 OS에 따라 추가 설정이 필요할 수 있습니다.

### ✅ macOS에서 빌드

#### 네이티브 macOS 앱 빌드
```bash
wails build
```

#### Windows용 앱 크로스 컴파일 (Apple Silicon Mac 기준)
Apple Silicon (arm64) Mac에서 Windows (amd64)용으로 빌드할 때는 몇 가지 추가 단계가 필요합니다.

1.  **MinGW-w64 설치**: Windows용 C 크로스 컴파일러를 설치합니다.
    ```bash
    brew install mingw-w64
    ```

2.  **빌드 명령어 실행**: `CGO_ENABLED=1`과 `CC` 환경 변수를 설정하여 CGO를 활성화하고, Windows용 C 컴파일러를 지정해줘야 합니다. 또한, 이 프로젝트는 `time.LoadLocation`을 사용하므로 `main.go`에 `import _ "time/tzdata"`가 포함되어 있어야 합니다.

    ```bash
    CC=/opt/homebrew/bin/x86_64-w64-mingw32-gcc CGO_ENABLED=1 \
    wails build -platform windows/amd64
    ```
    *참고: Homebrew 설치 경로가 다른 경우 `CC` 변수의 경로를 실제 `x86_64-w64-mingw32-gcc` 위치에 맞게 수정해야 합니다.*

### ✅ Windows에서 빌드

#### 네이티브 Windows 앱 빌드
```bash
wails build
```

#### macOS용 앱 크로스 컴파일
Windows에서 macOS용으로 크로스 컴파일하는 것은 매우 복잡하며, 일반적으로 권장되지 않습니다. Apple의 라이선스 및 기술적 제약으로 인해 macOS 가상 머신 또는 실제 Mac 장비에서 빌드하는 것이 가장 안정적인 방법입니다.

---
빌드가 완료되면 `build/bin` 디렉토리에서 실행 파일을 찾을 수 있습니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.