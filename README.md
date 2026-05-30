# LightSheet

> **초경량 웹 스프레드시트** — Pure Vanilla JS 기반 Spreadsheet MVP

Google Spreadsheet의 핵심 UX를 브라우저만으로 재현한 9×9 스프레드시트 프로젝트입니다.  
단순 기능 데모가 아니라, **AI 프롬프트 기반 개발 → QA 검증 → 수정 반복**의 전 과정을 기록한 학습형 포트폴리오입니다.

## 1. 프로젝트 소개

**LightSheet**는 외부 라이브러리 없이 HTML, CSS, Vanilla JavaScript만으로 구현한 웹 스프레드시트 MVP입니다.

| 항목 | 내용 |
|------|------|
| 프로젝트명 (영문) | LightSheet |
| 프로젝트명 (한글) | 초경량 웹 스프레드시트 |
| 그리드 크기 | 9×9 (열 A~I, 행 1~9) |
| 개발 방식 | AI(Cursor) 프롬프트 기반 + 개발자 QA 검증 |
| 현재 버전 | v1.3.0 |

셀 선택·편집, 키보드 내비게이션, Formula Bar, CSV Export, localStorage 자동 저장까지 실제 스프레드시트 도구의 핵심 경험을 담았습니다. 특히 Chrome 환경에서 한글 IME 입력, overflow overlay, selection/edit 모드 분리 등 **브라우저 네이티브 UX의 함정**을 직접 다루며 학습했습니다.

## 2. 프로젝트 목적

이 프로젝트의 목적은 "스프레드시트 하나 만들기"가 아닙니다.

1. **요구사항을 프롬프트로 구조화**하고 AI에게 단계별로 위임하는 개발 흐름을 익힌다.
2. AI가 생성한 코드를 **QA 체크리스트로 검증**하고, 실패 케이스를 재프롬프트로 수정한다.
3. MVP 완성 후 **리팩토링·모듈 분리·버그 수정**까지 이어지는 실무형 사이클을 경험한다.
4. 최종적으로 GitHub 포트폴리오에 올릴 수 있는 **설명 가능한(deliverable) 프로젝트**를 만든다.

즉, CRUD 앱 README가 아니라 **"AI 협업 개발 프로세스"를 보여주는 학습 기록**이 이 README의 핵심입니다.

## 3. 기술 스택

| 구분 | 선택 |
|------|------|
| 마크업 | HTML5 (semantic, ARIA) |
| 스타일 | CSS3 (BEM, CSS 변수, `::after` pseudo-element) |
| 로직 | Vanilla JavaScript (ES6+, ES Modules) |
| 저장소 | localStorage (debounce 300ms) |
| 빌드 도구 | **없음** (npm, bundler 미사용) |
| 외부 라이브러리 | **없음** (React/Vue/jQuery 금지) |

**의도적으로 제약을 둔 이유:** 프레임워크 없이 DOM·이벤트·상태의 근본 동작을 이해하고, AI가 생성한 코드의 품질을 직접 판단하기 위함입니다.

## 4. 실행 방법

ES Module은 `file://` 프로토콜에서 CORS 제한이 있을 수 있으므로 **로컬 서버 실행을 권장**합니다.

### VS Code Live Server

1. `index.html` 우클릭
2. **Open with Live Server** 선택

## 5. 주요 기능

| 기능 | 설명 |
|------|------|
| 동적 그리드 | JS 루프로 9×9 셀·헤더 생성 (`data-row`, `data-col` 0-based) |
| Name Box | 선택 셀 좌표 표시 (예: `C3`) |
| Formula Bar | 선택 셀 값 미리보기 및 직접 편집, 실시간 양방향 동기화 |
| Selection / Edit 모드 | Single click → 선택, Double click/F2 → 편집 |
| Keyboard-first 입력 | 선택 상태에서 바로 타이핑 시 자동 edit 진입 |
| 키보드 내비게이션 | Tab, Shift+Tab, Enter, Arrow Keys |
| 헤더 하이라이트 | 선택 셀의 행·열 헤더 동시 강조 |
| Overflow UX | 비선택 셀 clip, 선택 셀 overlay로 전체 텍스트 표시 |
| CSV Export | UTF-8 BOM 포함, Google Sheets Import 호환 |
| localStorage | 입력 debounce 후 자동 저장, 새로고침 시 복원 |
| IME (한글) | Chrome 한글 입력 시 영문 혼합 버그 해결 (proxy input) |
| 접근성 | `role="grid"`, `aria-activedescendant`, roving tabindex |

## 6. QA 테스트 테이블

모든 기능은 아래 체크리스트로 **수동 QA**했습니다. AI가 "완료"라고 해도, 실제 브라우저에서 PASS/FAIL을 직접 확인한 뒤 다음 단계로 진행했습니다.

| 테스트 항목 | 기대 결과 | 결과 |
| ----------- | --------- | ---- |
| 그리드 렌더링 | 9×9 UI 정상 출력 | ✅ PASS |
| 좌표 표시 | 클릭한 셀 좌표 표시 | ✅ PASS |
| 헤더 하이라이트 | 행/열 동시 강조 | ✅ PASS |
| 입력 상태 유지 | sheetState 동기화 | ✅ PASS |
| 키보드 이동 | 방향키 이동 정상 | ✅ PASS |
| 더블 클릭 편집 | edit mode 정상 진입 | ✅ PASS |
| CSV Export | spreadsheet.csv 다운로드 | ✅ PASS |
| Google Sheet 호환 | Import 시 구조 유지 | ✅ PASS |

### 추가 QA (v1.x 확장)

| 테스트 항목 | 기대 결과 | 결과 |
| ----------- | --------- | ---- |
| localStorage | 새로고침 후 데이터 복원 | ✅ PASS |
| 한글 IME (Chrome) | 영문 혼합 없이 입력 | ✅ PASS |
| Overflow UX | 긴 텍스트 선택 시 overlay 표시 | ✅ PASS |
| active cell 테두리 | 4면 파란 테두리 표시 | ✅ PASS |

## 7. 배운 점

- "System Prompt: SDD 명세 작성 도우미" Gem을 통해 얻은 산출물로 프롬프트를 도출해내니 편리했다. 
- 셀에 글자 입력하는 것에도 많은 상황이 펼쳐졌다. 한글에 영어가 섞이기는 등 오류 수정에 많은 시간을 소요하였다. 
- 에러 발생 시 개발자 도구의 콘솔 창에서 에러 메시지, 현재 브라우저 화면 캡처 등을 프롬프트에 입력하여 빠르게 오류 수정이 가능했다.  

## 8. 3줄 보고서

1. Gem을 통해 얻은 srs, trd 등 산출물을 기반으로 GPT에 프롬프트를 요구하였다. 반복 작업을 줄여주었다. 
2. Cursor AI에게 단계별로 요청하고, QA 체크리스트로 직접 확인하면서 v0.1.0부터 v1.3.0까지 여러 번 수정했다.
3. ES Module 오류, 포커스 충돌, Chrome 한글 입력 문제 등을 겪었고, AI 도움을 받되 최종 판단은 직접 했다.

## 9. 향후 개선 사항

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 높음 | Undo / Redo | `sheetState` 스냅샷 스택 |
| 높음 | 셀 범위 선택 | Shift+Arrow, drag selection |
| 중간 | 수식 엔진 | `=SUM(A1:A3)` 등 기본 formula parser |
| 중간 | 행/열 크기 조절 | drag resize (grid layout 유지) |


## 관련 문서

- [`PROMPT.md`](./PROMPT.md) — 버전별 AI 프롬프트 전체 이력
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) — 버그 원인 분석 및 해결 과정

## License

MIT (또는 프로젝트 목적에 맞게 자유롭게 사용 가능)
