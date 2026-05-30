
# Project Prompt History

## [v0.x.x] PROMPT.md 생성 (프로젝트 프롬프트 이력 관리)
- **요청 목적**: 버전별 변경 이력과 AI 프롬프트를 기록하기 위한 `PROMPT.md` 파일을 루트에 생성하고, 이후 모든 기능 구현·수정 요청 시 이 파일도 함께 업데이트하도록 규칙을 확립한다.
- **사용된 프롬프트 원본**: 
  ```text
  우리는 지금부터 새로운 프로젝트를 시작할 거야. 
  이 프로젝트의 버전별 변경 이력과 AI 프롬프트를 기록하기 위해 루트 디렉토리에 PROMPT.md 파일을 생성해줘.

  앞으로 내가 요구하는 모든 기능 구현이나 수정 요청에 대해, 코드를 수정하기 전이나 후에 반드시 이 PROMPT.md 파일도 함께 업데이트해줬으면 좋겠어. 버전(Version) 정보는 내가 나중에 직접 수정할 수 있도록 형식을 비워두고 아래 양식을 엄격하게 지켜서 작성해줘.

  PROMPT.md 파일의 양식:

  ---
  # Project Prompt History

  ## [v0.x.x] 작업 제목 (예: 프로젝트 초기화)
  - **요청 목적**: 이 작업을 왜 하는지 간략한 설명
  - **사용된 프롬프트 원본**: 
    ```text
    [내가 입력한 프롬프트 그대로 복사]
    ```
  ```

## [v0.1.0] 스프레드시트 UI Skeleton (기본 구조)
- **요청 목적**: Pure HTML/CSS/Vanilla JS만으로 9×9 스프레드시트의 시맨틱 마크업, 레이아웃, 그리드 UI 뼈대 및 `app.js` 연결을 구성한다. 데이터 입력·기능 로직은 다음 단계로 미룬다.
- **사용된 프롬프트 원본**: 
  ```text
  너는 시니어 프론트엔드 엔지니어다.

  다음 조건으로 초경량 웹 스프레드시트 프로젝트의 기본 구조를 생성해라.

  # 기술 스택

  * Pure HTML5
  * Pure CSS3
  * Vanilla JavaScript (ES6+)
  * 외부 라이브러리 절대 사용 금지
  * React/Vue/jQuery 금지
  * npm 패키지 금지

  # 파일 구조

  반드시 아래 3개 파일만 생성:

  1. index.html
  2. style.css
  3. app.js

  # 구현 목표

  * 9x9 고정 스프레드시트 UI
  * A~I 열 헤더
  * 1~9 행 헤더
  * 상단 Name Box(현재 좌표 표시)
  * Export SpreadSheet 버튼

  # 현재 단계 목표

  지금은 기능 구현하지 말고 아래만 완성:

  * semantic HTML 구조
  * 전체 레이아웃
  * grid/table 기반 스프레드시트 UI 뼈대
  * CSS 기본 스타일
  * app.js 연결

  # UI 요구사항

  * 깔끔한 Google Spreadsheet 느낌
  * 중앙 정렬 금지
  * 실제 업무용 툴 느낌
  * 헤더는 연한 회색
  * 셀은 흰색
  * 테두리는 연회색
  * Name Box는 좌상단
  * Export 버튼은 우상단

  # 중요

  아직 데이터 입력 기능 구현 금지.
  현재는 UI Skeleton만 만든다.
  ```

## [v0.2.0] 스프레드시트 그리드 JS 동적 생성
- **요청 목적**: HTML 하드코딩 셀을 제거하고 `app.js` 루프로 9×9 그리드(헤더 A~I, 행 1~9, 81개 `contenteditable` 셀)를 동적 렌더링한다. `data-row`/`data-col`은 0-based 인덱스로 부여한다.
- **사용된 프롬프트 원본**: 
  ```text
  이제 app.js를 수정해라.

  # 목표

  9x9 셀을 JavaScript로 동적 생성한다.

  # 요구사항

  * HTML에 셀 하드코딩 금지
  * JS 루프로 생성
  * 열 헤더: A~I
  * 행 헤더: 1~9
  * 총 81개 입력 셀
  * 각 셀은 data-row, data-col 속성 보유

  예:
  data-row="0"
  data-col="0"

  # 구현 조건

  * Spreadsheet grid를 JS에서 렌더링
  * DOM 생성 함수 분리
  * 유지보수 가능한 구조
  * 함수 단위 분리

  # 추가 조건

  셀은 contenteditable=true 사용.
  각 셀은 keyboard 입력 가능 상태여야 한다.

  # 절대 하지 말 것

  * inline style 금지
  * 중복 코드 금지
  * querySelector 남발 금지
  ```

## [v0.3.0] sheetState 실시간 동기화
- **요청 목적**: 2차원 배열 `sheetState`와 UI(`contenteditable` 셀)를 `input`/`blur` 이벤트로 실시간 동기화하고, 상태·렌더·이벤트 로직을 함수 단위로 분리한다.
- **사용된 프롬프트 원본**: 
  ```text
  이제 실제 데이터 상태 관리를 구현해주세요.

  # 목표

  UI와 내부 2차원 배열 상태(sheetState)를 실시간 동기화합니다.

  # 요구사항

  아래 구조를 사용:
  const sheetState = Array.from({ length: 9 }, () =>
  Array(9).fill("")
  );

  # 동작 방식

  * 셀 입력 시 sheetState 즉시 업데이트
  * blur/input 이벤트 활용
  * row/col 기반으로 상태 반영

  예:
  sheetState[2][1] = "Hello"

  # 디버깅 요구사항

  값 입력 시 console.log(sheetState) 출력.

  # 구조 요구사항

  아래 함수들로 분리:

  * initializeSheet()
  * renderGrid()
  * bindCellEvents()
  * updateCellState()

  # 중요

  렌더링과 상태 로직 분리.
  전역 오염 최소화.
  ```

## [v0.4.0] Spreadsheet UX (포커스·Name Box·헤더 하이라이트)
- **요청 목적**: 셀 포커스 시 Name Box 좌표 표시(A1~I9), 해당 행·열 헤더 하이라이트, 활성 셀 포커스 스타일을 class 기반으로 적용하고 단일 활성 셀만 유지한다.
- **사용된 프롬프트 원본**: 
  ```text
  이제 Spreadsheet UX를 구현해주세요.

  # 목표

  셀 포커스 시:

  1. Name Box에 현재 좌표 표시
  2. 행/열 헤더 하이라이트
  3. 셀 포커스 스타일 적용

  # Name Box 규칙

  * A1 ~ I9 형식
  * row=0,col=0 => A1

  # 하이라이트 규칙

  예: C3 선택 시

  * 상단 C 헤더 강조
  * 좌측 3 헤더 강조

  # 스타일

  선택 셀:

  * border: 2px solid #2563EB

  헤더 강조:

  * background: #E3F2FD

  # 구현 요구사항

  * 이전 선택 상태 제거
  * 단일 활성 셀 유지
  * class 기반 스타일링
  * active/focused 상태 명확히 관리

  # 금지사항

  * 스타일 직접 JS로 남발 금지
  * 매 클릭마다 전체 DOM 재생성 금지
  ```

## [v0.5.0] Spreadsheet UX 개선 (단일 클릭·키보드 이동)
- **요청 목적**: 단일 클릭 즉시 caret 표시·입력 가능, Tab/Shift+Tab/Enter/화살표 키보드 이동, 포커스 전환 시 `sheetState` 커밋으로 값 유실 방지, 접근성(`aria-activedescendant`, roving `tabindex`) 강화.
- **사용된 프롬프트 원본**: 
  ```text
  현재 UX를 실제 Spreadsheet처럼 개선해주세요.

  # 목표

  셀을 single click 하면 즉시 입력 가능한 상태가 되어야 합니다.

  # 요구사항

  * 클릭 즉시 caret 표시
  * 바로 타이핑 가능
  * 추가 더블클릭 불필요

  # 추가 UX

  * Tab 이동 지원
  * Arrow Key 이동 지원
  * Enter 입력 시 아래 셀 이동
  * Shift+Tab 역방향 이동

  # 구현 요구사항

  * keyboard navigation 함수 분리
  * 현재 active cell 추적
  * accessibility 고려

  # 중요

  브라우저 기본 contenteditable 버그를 최소화하라.
  포커스 이동 중 입력값 유실 금지.
  ```

## [v0.6.0] CSV Export (sheetState → spreadsheet.csv)
- **요청 목적**: `sheetState`를 RFC 4180 스타일 CSV로 변환해 UTF-8 BOM 포함 `spreadsheet.csv`를 Blob·`createObjectURL`로 자동 다운로드하고, Google Spreadsheet Import 호환을 우선한다.
- **사용된 프롬프트 원본**: 
  ```text
  이제 CSV Export 기능을 구현해라.

  # 목표

  sheetState 데이터를 CSV로 다운로드한다.

  # 파일명

  spreadsheet.csv

  # 요구사항

  * UTF-8 BOM 포함
  * 한글 깨짐 방지
  * Blob 사용
  * URL.createObjectURL 사용
  * 자동 다운로드 트리거

  # CSV 규칙

  * 쉼표 구분
  * 줄바꿈 유지
  * 특수문자 대응
  * 큰따옴표 escape 처리

  # 함수 분리

  * convertToCSV()
  * downloadCSV()
  * escapeCSVValue()

  # Export 버튼 클릭 시 다운로드 실행.

  # 중요

  Google Spreadsheet Import 호환성 최우선.
  ```

## [v0.7.0] 전체 리팩토링 (모듈 분리·유지보수성)
- **요청 목적**: 기능 변경 없이 함수 책임 분리, 상수·이벤트 위임·DOM 접근 최소화, BEM 상태 class·CSS 변수 정리, `js/` 모듈 구조로 유지보수성을 강화한다.
- **사용된 프롬프트 원본**: 
  ```text
  이제 전체 프로젝트를 시니어 엔지니어 수준으로 리팩토링해주세요.

  # 목표

  코드 품질 향상 및 유지보수성 강화.

  # 개선 항목

  1. 함수 책임 분리
  2. 중복 제거
  3. 변수명 개선
  4. 이벤트 위임 적용 가능 여부 검토
  5. 성능 최적화
  6. DOM 접근 최소화
  7. 상수 분리
  8. magic number 제거
  9. CSS class naming 정리
  10. 파일 구조 정리

  # 추가 요구사항

  * 주석은 필요한 곳만
  * 과도한 주석 금지
  * 실제 프로덕션 수준 코드 스타일 유지

  # 중요

  기능 변경 없이 내부 구조만 개선.
  ```

## [v0.7.1] 9×9 그리드 미표시 버그 수정 (ES 모듈 전환)
- **요청 목적**: 리팩토링 후 브라우저에 9×9 셀이 보이지 않는 문제를 해결한다. 다중 `<script>` 태그에서 `const GRID_SIZE` 등이 전역 lexical 환경에 중복 선언되어 `SyntaxError`가 발생하고 `SpreadsheetState` 초기화가 실패한 것이 원인이었다. ES 모듈(`import`/`export`)로 전환하고 `index.html` 진입점을 `js/main.js` 단일 모듈로 정리한다.
- **사용된 프롬프트 원본**: 
  ```text
  현재 브라우저 화면에 9*9 셀이 보이지 않습니다.
  아래는 콘솔 창에 뜬 에러 메시지입니다

  <개발자 도구의 콘솔 창에서 복사해 온 에러 메시지>
  ```

## [v0.8.0] Selection / Edit 모드 분리 UX
- **요청 목적**: Google Spreadsheet·Excel처럼 single click은 셀 선택만, double click은 편집 모드 진입으로 동작을 분리한다. `contenteditable`은 편집 중에만 활성화하고 `selectionState`로 선택·편집 상태를 관리한다.
- **사용된 프롬프트 원본**: 
  ```text
  현재 Spreadsheet의 셀 편집 UX를 실제 Google Spreadsheet/Excel 방식으로 수정해라.

  # 기존 문제

  현재는 single click만으로 즉시 입력 모드가 활성화된다.

  이 방식은:

  * 셀 선택
  * 셀 편집

  상태가 분리되지 않아
  navigation UX와 충돌 가능성이 높다.

  # 목표

  동작을 아래처럼 변경:

  ## Single Click

  * 셀 선택만 수행
  * active 상태 표시
  * Name Box 업데이트
  * 헤더 하이라이트
  * keyboard navigation 가능

  ## Double Click

  * 실제 편집 모드 진입
  * caret 표시
  * contenteditable 활성화
  * 텍스트 수정 가능

  # 중요 UX 규칙

  Google Spreadsheet와 유사하게 구현:

  * 클릭 1회 → 선택
  * 더블 클릭 → 수정

  # 구현 요구사항

  ## 상태 분리

  아래 상태를 분리 관리:

  const selectionState = {
  activeCell: null,
  activeRow: null,
  activeCol: null,
  isEditing: false
  };

  # 이벤트 요구사항

  * click → selectCell()
  * dblclick → enterEditMode()
  * blur → exitEditMode()
  * Enter → edit 종료 후 아래 셀 이동
  * Escape → edit 취소 가능 여부 검토

  # contenteditable 규칙

  편집 중일 때만:
  contenteditable="true"

  평소에는:
  contenteditable="false"

  # 중요

  항상 editable 상태 유지 금지.

  # 버그 방지 요구사항

  * 더블클릭 시 focus 충돌 방지
  * 빠른 클릭 시 active 상태 꼬임 방지
  * 편집 중 navigation 제한
  * blur 시 데이터 저장 보장
  * input 이벤트 중복 등록 금지

  # 구현 함수 구조

  * selectCell()
  * enterEditMode()
  * exitEditMode()
  * saveCellValue()

  # CSS 요구사항

  편집 모드:
  .editing-cell

  선택 모드:
  .active-cell

  # 최종 목표

  Google Spreadsheet 수준의:

  * selection mode
  * edit mode

  분리 UX 구현.
  ```

## [v0.8.1] Keyboard-first Selection/Edit UX
- **요청 목적**: 선택 모드 유지한 채 키보드 입력(문자·숫자·한글·Backspace) 시 자동 edit mode 진입, F2/더블클릭은 기존 텍스트 유지 편집, IME composition 처리 및 navigation/edit 충돌 방지.
- **사용된 프롬프트 원본**: 
  ```text
  현재 Spreadsheet의 selection/edit mode UX를 실제 Google Spreadsheet 방식으로 개선해라.

  # 현재 문제

  현재 구현은:

  * single click → 선택
  * double click → 편집

  만 지원한다.

  하지만 실제 Spreadsheet처럼:
  "선택된 셀에서 바로 키보드 입력 시작"

  동작이 지원되지 않는다.

  (... 사용자 프롬프트 전문 — keyboard typing, F2, IME, handleCellKeydown 등 ...)
  ```

## [v0.8.2] 편집 중 Arrow Key 셀 이동
- **요청 목적**: edit mode에서 방향키 입력 시 현재 값 저장·edit 종료 후 해당 방향 인접 셀로 selection 이동(Name Box·헤더 동기화), blur/input 충돌 방지.
- **사용된 프롬프트 원본**: 
  ```text
  편집 중 방향키(Arrow Keys)를 누르면 해당 방향의 셀로 selection이 이동하도록 수정해라.

  # 요구사항

  * ArrowUp → 위 셀 이동
  * ArrowDown → 아래 셀 이동
  * ArrowLeft → 왼쪽 셀 이동
  * ArrowRight → 오른쪽 셀 이동

  # 동작 규칙

  1. 현재 편집 내용 저장
  2. edit mode 종료
  3. 해당 방향 셀 선택 이동
  4. Name Box 및 header highlight 동기화

  # 중요

  * selection 상태 꼬임 금지
  * blur/input 충돌 방지
  * grid boundary 초과 이동 방지
  * active-cell 항상 1개만 유지

  # 구현 함수

  * handleArrowNavigation()
  * moveSelection()

  # UX 목표

  Google Spreadsheet처럼 자연스럽게 동작하도록 구현.
  ```

## [v0.9.0] 셀 overflow UX (고정 크기 + 선택 시 overlay)
- **요청 목적**: 비선택 셀은 `overflow:hidden`으로 셀 경계 내 clip, 선택/편집 셀만 absolute overlay layer로 전체 텍스트 표시. column/row 크기·grid layout 고정 유지.
- **사용된 프롬프트 원본**: 
  ```text
  Spreadsheet 셀 overflow 표시 UX를 실제 Spreadsheet 방식처럼 수정해라.

  # 목표

  셀의 너비와 높이는 항상 고정 유지한다.
  긴 텍스트 입력 시에도 grid layout이 절대 변형되면 안 된다.

  # 핵심 요구사항

  ## 1. 셀 크기 고정

  * column width 고정
  * row height 고정
  * 텍스트 길이와 무관하게 셀 크기 유지
  * grid 밀림 현상 금지
  * auto resize 금지

  # 중요

  긴 문자열 입력 시에도:

  * table width 유지
  * table height 유지
  * neighboring cell 이동 금지

  # 기본 표시 규칙

  ## 선택되지 않은 셀

  셀 크기를 넘어가는 텍스트는:

  * 셀 영역 밖이 보이면 안 된다
  * overflow hidden 처리
  * 한 줄 유지
  * 줄바꿈 금지

  즉:

  * 셀 내부 영역만 표시
  * 셀 테두리를 벗어난 텍스트는 숨김 처리

  # CSS 요구사항

  아래 속성 기반으로 구현:

  * overflow: hidden
  * white-space: nowrap
  * text-overflow 검토 가능

  # 선택된 셀 UX

  ## 셀 선택 시

  선택된 셀은:

  * 전체 텍스트 확인 가능해야 함
  * edit mode 진입 가능
  * caret 정상 표시
  * 텍스트 잘림 없이 확인 가능

  # 구현 방향

  선택된 셀에 대해서만:

  * overlay editing
  * z-index 상승
  * absolute editor
  * floating input layer

  등의 방식 검토.

  # 중요

  선택되지 않은 셀은 항상:

  * 고정 크기 유지
  * hidden clipping 유지

  # 금지사항

  * 셀 width 증가 금지
  * 셀 height 증가 금지
  * word-wrap 금지
  * textarea auto-expand 금지
  * grid reflow 발생 금지

  # 성능 요구사항

  * repaint 최소화
  * layout thrashing 방지
  * active cell만 업데이트

  # 구현 함수 예시

  * updateCellDisplay()
  * enterEditMode()
  * exitEditMode()
  * syncOverflowState()

  # 최종 목표

  Google Spreadsheet처럼:

  * 평소에는 셀 영역만 표시
  * 선택/편집 시 전체 내용 확인 가능
  * 셀 크기는 항상 고정

  되는 UX 구현.
  ```

## [v0.9.1] 셀 텍스트 입력 불가 버그 수정
- **요청 목적**: v0.9.0 overflow overlay 도입 후 편집 모드 진입 시 `td` → display span focus 이동으로 `blur`가 발생해 `exitEditMode()`가 즉시 호출되며 글자 입력이 되지 않던 문제를 수정한다. `enterEditMode()` focus 시 `suppressEditBlur` 적용, blur 핸들러에서 셀 내부 focus 이동(`relatedTarget`) 무시, 편집 중 `commitCellValue()`는 `sheetState`만 갱신하고 DOM `textContent`는 건드리지 않도록 변경.
- **사용된 프롬프트 원본**: 
  ```text
  현재 셀에 글자가 제대로 입력되지 않은 문제가 발생했습니다.
  ```

## [v1.0.0] localStorage 자동 저장
- **요청 목적**: 셀 입력 시 `sheetState` 전체를 localStorage에 debounce 자동 저장하고, 새로고침 후 데이터를 복원한다. 저장 실패 예외 처리 및 기존 selection/edit UX 유지.
- **사용된 프롬프트 원본**: 
  ```text
  Spreadsheet 프로젝트에 localStorage 자동 저장 기능을 추가해라.

  # 요구사항

  * 셀 입력 시 자동 저장
  * 새로고침 후 데이터 복원
  * sheetState 전체 저장
  * localStorage 사용
  * debounce 적용 검토

  # 구현 함수

  * saveToLocalStorage()
  * loadFromLocalStorage()

  # 중요

  * 저장 실패 예외 처리
  * 기존 UX 깨지지 않도록 구현.
  ```

## [v1.1.0] active cell 선택 스타일 개선
- **요청 목적**: Google Spreadsheet 느낌의 professional selection UX. `#2563EB` 계열 사면 border·shadow 강화, hover·header highlight 개선. border 겹침·layout shift 없이 grid layout 유지.
- **사용된 프롬프트 원본**: 
  ```text
  Spreadsheet 프로젝트의 선택 셀(active cell) 스타일을 개선해라.

  # 요구사항

  * active-cell border 강화
  * 선택된 셀의 상/하/좌/우 모든 border를 파란색 계열로 표시
  * border color: #2563EB 계열 사용
  * border 두께 강화
  * subtle shadow 추가
  * hover 상태 개선
  * header highlight 개선
  * selection visibility 강화

  # 디자인 목표

  Google Spreadsheet 느낌의
  깔끔하고 professional한 Spreadsheet UX 구현.

  # 중요

  * 선택된 셀은 사면 border 모두 명확하게 보여야 함
  * border 겹침 현상 방지
  * 과한 animation 금지
  * 성능 저하 금지
  * 기존 grid layout 유지.
  ```

## [v1.1.1] active cell 테두리 미표시 버그 수정
- **요청 목적**: v1.1.0 적용 후 `border-collapse: collapse` 환경에서 `border-color`·`inset box-shadow`만으로는 선택 셀 상·좌 테두리가 인접 셀과 겹쳐 보이지 않던 문제를 수정한다. `::after` pseudo-element로 `#2563eb` 2px 사면 테두리를 균일하게 렌더링하고, `z-index`로 인접 border 위에 표시한다.
- **사용된 프롬프트 원본**: 
  ```text
  현재 선택된 셀에 대해 테두리가 제대로 보이지 않는 문제가 있습니다.
  ```

## [v1.2.0] 화면 구성 UX 재설계 (Workspace + Formula Bar)
- **요청 목적**: Toolbar와 Grid를 `sheet-workspace` 단일 패널로 통합하고, Name Box · fx · 선택 셀 preview · Export CSV를 formula bar 한 줄에 배치해 Google Spreadsheet 느낌의 작업 영역 연결감을 강화한다.
- **사용된 프롬프트 원본**: 
  ```text
  현재 Spreadsheet 프로젝트의 화면 구성을 UX 관점에서 재설계해주세요.

  # 현재 문제

  * Export 버튼이 표와 동떨어져 있음
  * UI 요소 간 연결감 부족
  * Spreadsheet 툴 느낌이 약함
  * 상단 toolbar 구조가 어색함

  # 목표

  Google Spreadsheet처럼:

  * 상단 Toolbar
  * Name Box
  * Export 버튼
  * Spreadsheet Grid

  가 하나의 작업 영역처럼 자연스럽게 연결되도록 개선.

  # 중요

  코드 수정 전에,
  먼저 text 기반 wireframe 형태로
  새로운 화면 구성을 보여줘.

  # 요구사항

  * Toolbar와 Grid 연결감 강화
  * Export 버튼 위치 개선
  * spacing 재설계
  * alignment 개선
  * modern SaaS 느낌 유지
  * 너무 화려하지 않게 구성
  ```

## [v1.2.1] Formula Bar 직접 편집 및 양방향 동기화
- **요청 목적**: formula-bar에서 선택 셀 값을 직접 수정하고, formula-bar ↔ sheetState ↔ active cell 간 실시간 양방향 동기화. Enter 입력 시 셀 값 즉시 반영.
- **사용된 프롬프트 원본**: 
  ```text
  상단 formula-bar에서도 현재 선택된 셀 값을 직접 수정할 수 있도록 구현해주세요.
  formula-bar 입력값과 sheetState 및 active cell 값을 실시간 양방향 동기화하고, Enter 입력 시 셀 값이 즉시 반영되도록 수정해주세요
  ```

## [v1.2.2] Formula Bar 입력 즉시 셀 반영 버그 수정
- **요청 목적**: formula-bar 입력 시 셀 display에 값이 바로 반영되지 않던 문제 수정. `input` 이벤트마다 `applyToCell()` 즉시 호출, focus 시 input·sheetState 동기화, `writeCellToDOM` 경로 통일, display `textContent` 강제 갱신.
- **사용된 프롬프트 원본**: 
  ```text
  formula-bar 내 셀 값을 입력하면 바로 셀에 적용되지 않습니다.
  ```

## [v1.2.3] 선택 셀 텍스트 클릭 시 caret 즉시 배치
- **요청 목적**: 이미 선택된 셀 내부 문자열을 한 번 클릭하면 더블클릭 없이 편집 모드 진입 및 클릭 위치에 caret 배치. `caretRangeFromPoint` 기반 hit test.
- **사용된 프롬프트 원본**: 
  ```text
  현재 선택된 셀 내부 문자열을 클릭했을 때, 한 번 클릭만으로 해당 위치에 caret(커서)가 바로 생성되도록 수정해주세요.
  ```

## [v1.3.0] 셀 한글 IME 입력 시 영문 혼합 버그 수정 (Chrome)
- **요청 목적**: 셀 선택 후 한글 입력 시 첫 1~2글자에 `g`, `r` 등 영문이 섞이고 조합이 깨지던 문제 해결. formula bar는 정상인데 셀 직접 입력만 실패. Google Spreadsheet 수준의 안정적인 한글 IME 입력 구현.
- **사용된 프롬프트 원본**:
  ```text
  스프레드 시트에 한글로 입력하는데 초반 1~2 글자가 영어로 나옵니다.
  ```
  ```text
  현재 Spreadsheet 셀 편집 기능에서 한글 입력 시 IME(Input Method Editor) 조합 버그를 수정해라.
  (compositionstart/update/end, inputState.isComposing, keydown·input·beforeinput 충돌 방지 등)
  ```
  ```text
  formula bar에서 한글 입력이 제대로 되는데, 여전히 스프레드 시트 내의 셀에서 한글을 작성할 때는 첫 글자에 영어가 섞여 나옵니다. (Chrome)
  ```
- **원인 요약**:
  - selection mode에서 `keydown` → `enterEditMode({ seedText: event.key })`가 IME `compositionstart`보다 먼저 실행되어 로마자 키(`ㄱ`→`g`)가 DOM에 삽입됨.
  - Chrome에서 셀 선택 시 포커스가 편집 불가 `td`에 있어, `keydown` 후 `contenteditable` span으로 focus를 옮겨도 해당 키 이벤트는 IME에 전달되지 않음.
  - formula bar는 네이티브 `<input>`이라 IME가 정상 동작.
- **변경 요약**:
  - `index.html` — 숨김 `#cell-input` 추가 (셀 선택 시 IME 수신용 네이티브 input)
  - `js/cellInput.js` — proxy edit: `cell-input` 입력 → display span mirror → `sheetState` 반영
  - `js/ime.js` — `inputState.isComposing`, composition 핸들러, 조합 중 navigation/commit 차단
  - `js/selection.js` — 선택 시 `cell-input` focus; 더블클릭/F2/텍스트 클릭은 `isDirectEdit` contenteditable 직접 편집
  - `js/events.js`, `js/navigation.js`, `js/main.js`, `js/config.js` — cell input·IME 상태 연동
- **편집 모드 분기**:
  - **Proxy edit** (셀 선택 후 타이핑): `#cell-input` → IME 처리 → 셀 display 동기화
  - **Direct edit** (더블클릭·F2·텍스트 클릭): `contenteditable` span 직접 편집 + tbody composition 이벤트
- **결과**: Chrome에서 셀·formula bar 모두 한글/영문 혼합 입력 버그 해소 확인.
