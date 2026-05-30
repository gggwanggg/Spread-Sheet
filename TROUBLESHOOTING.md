# 프로젝트 트러블슈팅 (Troubleshooting)

이 문서는 프로젝트 진행 중 발생한 에러, 문제 상황, 원인 분석 및 해결 과정을 기록합니다.

## 📋 목차
- [9×9 그리드 미표시 — ES 모듈 전환 (v0.7.1)](#이슈-제목-9x9-그리드-미표시--전역-const-중복-선언-syntaxerror)
- [셀 텍스트 입력 불가 — overflow UX blur 충돌 (v0.9.1)](#이슈-제목-셀-텍스트-입력-불가--overflow-ux-blur-충돌-v091)
- [Formula Bar 입력 즉시 셀 미반영 (v1.2.2)](#이슈-제목-formula-bar-입력-즉시-셀-미반영-v122)
- [선택 셀 텍스트 클릭 시 caret 즉시 배치 (v1.2.3)](#이슈-제목-선택-셀-텍스트-클릭-시-caret-즉시-배치-v123)

---

### [이슈 제목: 9×9 그리드 미표시 — 전역 `const` 중복 선언 SyntaxError]
- **발생 일자:** 2026-05-31
- **발생 환경:** Frontend / Vanilla JavaScript (ES6+) / 브라우저 (Chrome 개발자 도구)

#### 🚨 1. 문제 상황 (Problem)
- v0.7.0 리팩토링으로 `js/` 폴더에 모듈 파일(`config.js`, `state.js`, `grid.js` 등)을 분리한 뒤, 브라우저에서 9×9 스프레드시트 셀이 전혀 렌더링되지 않음.
- 페이지 로드 시 JavaScript 파싱 단계에서 오류가 발생하여 `SpreadsheetState` 초기화 및 `SpreadsheetGrid.render()` 호출이 실행되지 않음.
- 화면에는 HTML 뼈대(툴바, 빈 `<table>`)만 보이고 thead/tbody 내부 셀이 생성되지 않음.

에러 메시지 (개발자 도구 콘솔):

```text
Uncaught SyntaxError: Identifier 'GRID_SIZE' has already been declared
    at state.js:4
```

(동일한 패턴으로 `utils.js`, `grid.js`, `navigation.js` 등에서도 `const GRID_SIZE` 중복 선언 오류가 연쇄 발생할 수 있음)

#### 🔍 2. 원인 분석 (Cause)
- v0.7.0 리팩토링 후 `index.html`에 여러 개의 일반 `<script>` 태그로 JS 파일을 순서대로 로드하는 방식을 사용함.

```html
<!-- 수정 전 (문제 발생 구조) -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<script src="js/state.js"></script>
<script src="js/grid.js"></script>
<!-- ... 기타 파일 ... -->
<script src="js/main.js"></script>
```

- 일반 `<script>` 태그로 로드된 파일들은 **하나의 전역 lexical 스코프**를 공유함.
- 각 파일 상단에서 `const GRID_SIZE = ...` 또는 `const { GRID_SIZE } = SpreadsheetConfig` 형태로 동일한 식별자를 선언하면, 두 번째 파일부터 `Identifier 'GRID_SIZE' has already been declared` **SyntaxError**가 발생함.
- 이 오류는 **런타임 이전(파싱 단계)** 에 발생하므로 이후 스크립트 실행이 중단되고, 그리드 렌더링 로직 전체가 동작하지 않음.

#### 🛠️ 3. 시도한 방법들 (Attempts)
- **시도 1:** 개별 `<script>` 태그 로드 순서 변경 (`config.js`를 최상단으로) ➔ `config.js`는 먼저 로드되지만, `state.js`·`utils.js`·`grid.js` 등 **여러 파일이 각각 `GRID_SIZE`를 `const`로 선언**하므로 근본 원인 해결 불가.
- **시도 2:** 중복 선언을 `var` 또는 전역 객체(`window.GRID_SIZE`)로 통일 ➔ SyntaxError는 사라질 수 있으나, 모듈 간 결합도 증가·네임스페이스 오염·리팩토링 목적(캡슐화)에 반함. 채택하지 않음.
- **시도 3:** ES 모듈(`import`/`export`)로 전환하고 진입점을 단일 파일로 통합 ➔ **각 파일이 독립 모듈 스코프**를 갖게 되어 동일 식별자 중복 선언 문제 해결. **최종 채택.**

#### ✅ 4. 해결 방법 (Solution)
- 모든 JS 파일에 `export` / `import` 구문을 적용하고, `index.html`의 다중 `<script>` 태그를 **단일 ES 모듈 진입점**으로 교체함.

**수정 후 `index.html`:**

```html
<script type="module" src="js/main.js"></script>
```

**수정 후 모듈 구조 예시 (`config.js` — 상수 단일 정의):**

```javascript
export const SpreadsheetConfig = Object.freeze({
  GRID_SIZE: 9,
  // ...
});
```

**수정 후 모듈 구조 예시 (`state.js` — 모듈 스코프 내에서 import):**

```javascript
import { SpreadsheetConfig } from './config.js';

const { GRID_SIZE } = SpreadsheetConfig;

export const SpreadsheetState = {
  createEmptyGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  },
  // ...
};
```

**수정 후 `main.js` — 앱 부트스트랩:**

```javascript
import { SpreadsheetConfig } from './config.js';
import { SpreadsheetState } from './state.js';
import { SpreadsheetGrid } from './grid.js';
import { SpreadsheetSelection } from './selection.js';
import { SpreadsheetEvents } from './events.js';

function bootstrap() {
  // ...
  ctx.sheetState = SpreadsheetState.createEmptyGrid();
  SpreadsheetGrid.render(ctx);
  // ...
}

document.addEventListener('DOMContentLoaded', bootstrap);
```

- ES 모듈은 `file://` 프로토콜에서 CORS 제한이 있을 수 있으므로, 로컬 개발 시 **로컬 서버**(`npx serve`, Live Server 등) 사용을 권장함. (`README.md` 참고)

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- **일반 `<script>` vs ES 모듈:** 일반 스크립트는 전역 스코프를 공유하므로 파일 분리 시 `const`/`let`/`class` **중복 선언에 주의**해야 함. ES 모듈은 파일마다 독립 스코프를 가져 파일 분리·리팩토링에 적합함.
- **파일 분리 ≠ 모듈화:** JS 파일을 나누기만 하면 모듈화가 완성되지 않음. `import`/`export` 또는 IIFE/네임스페이스 등 **스코프 격리 수단**이 함께 필요함.
- **SyntaxError는 조용히 UI만 깨질 수 있음:** 파싱 오류는 후속 DOM 조작 코드까지 실행을 막으므로, "기능만 안 됨" 현상의 첫 확인 지점은 **브라우저 콘솔**이어야 함.
- 참고:
  - [MDN — JavaScript modules](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Modules)
  - [MDN — `<script type="module">`](https://developer.mozilla.org/ko/docs/Web/HTML/Element/script/type/module)
  - [MDN — Lexical grammar (중복 선언)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar)

---

### [이슈 제목: 셀 텍스트 입력 불가 — overflow UX blur 충돌 (v0.9.1)]
- **발생 일자:** 2026-05-31
- **발생 환경:** Frontend / Vanilla JavaScript (ES6+) / 브라우저 (Chrome 등)

#### 🚨 1. 문제 상황 (Problem)
- v0.9.0 셀 overflow UX(고정 크기 + 선택 시 overlay) 적용 이후, 셀에 글자가 제대로 입력되지 않음.
- 셀 선택 후 키보드 타이핑, F2, 더블클릭으로 편집 모드에 진입해도 입력이 즉시 끊기거나, 첫 글자만 반영되고 연속 입력이 되지 않는 증상.
- 콘솔에 명시적인 JavaScript 에러는 없으며, 편집 모드가 곧바로 종료되는 UX 문제로 나타남.

#### 🔍 2. 원인 분석 (Cause)
- v0.9.0에서 편집 대상이 `td`가 아닌 내부 `span.sheet-grid__cell-display`(contenteditable)로 변경됨.
- `enterEditMode()` 호출 시 focus가 **`td` → 내부 `span`(display)** 으로 이동하면서 `td`에서 **`blur` 이벤트**가 발생함.
- `events.js`의 capture 단계 `blur` 핸들러가 편집 중 blur를 감지하면 **즉시 `exitEditMode()`** 를 호출하도록 되어 있어, 편집 진입 직후 편집이 종료됨.
- 부가적으로, 편집 중 `input` 이벤트마다 `commitCellValue()` → `writeCellToDOM()`이 DOM `textContent`를 다시 쓰면 caret(커서) 위치가 깨질 수 있어, 입력 UX를 더 악화시킬 여지가 있음.

#### 🛠️ 3. 시도한 방법들 (Attempts)
- **시도 1:** overflow overlay·display span 구조만 점검 (CSS `pointer-events`, `contenteditable` 속성) ➔ 구조 자체는 의도대로 동작하나, blur로 인한 즉시 `exitEditMode()` 호출이 근본 원인으로 확인됨.
- **시도 2:** `enterEditMode()` focus 이동 시 `suppressEditBlur` 플래그로 blur 무시 ➔ **td → span focus 이동 시 발생하는 blur 문제 해결. 채택.**
- **시도 3:** blur 핸들러에서 `relatedTarget`이 같은 셀 내부인 경우 편집 종료 생략 ➔ **셀 내부 focus 이동을 blur로 오인하지 않도록 보완. 채택.**
- **시도 4:** 편집 중 `commitCellValue()`는 `sheetState`만 갱신하고 DOM은 건드리지 않음 ➔ **caret 유지 및 입력 안정성 개선. 채택.**

#### ✅ 4. 해결 방법 (Solution)

**1. `events.js` — 셀 내부 focus 이동 시 blur 무시**

```javascript
tbody.addEventListener(
  'blur',
  (event) => {
    const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);

    if (!cell || !ctx.selectionState.isEditing || ctx.selectionState.activeCell !== cell) {
      return;
    }

    if (ctx.compositionActive || ctx.suppressEditBlur) {
      return;
    }

    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && cell.contains(nextTarget)) {
      return;
    }

    SpreadsheetSelection.exitEditMode(ctx, { save: true });
  },
  true
);
```

**2. `selection.js` — `enterEditMode()` focus 시 `suppressEditBlur` 적용**

```javascript
const editTarget = SpreadsheetDisplay.getEditTarget(activeCell);
ctx.suppressEditBlur = true;
editTarget.focus();
ctx.suppressEditBlur = false;
```

**3. `state.js` — 편집 중 DOM 재기록 생략**

```javascript
commitCellValue(ctx) {
  // ...
  this.setCellValue(ctx.sheetState, rowIndex, colIndex, value);

  if (!ctx.selectionState.isEditing) {
    this.writeCellToDOM(activeCell, value);
  }
},
```

- 수정 후 셀 선택 → 타이핑, F2, 더블클릭 편집 모두 정상 입력 가능.

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- **`focus()` 이동은 blur를 동기적으로 발생시킬 수 있음:** 부모(`td`)에 focus가 있던 상태에서 자식(contenteditable `span`)으로 focus를 옮기면, blur 핸들러가 “편집 종료”로 해석하지 않도록 **`relatedTarget` 검사** 또는 **일시적 suppress 플래그**가 필요함.
- **display layer와 edit target 분리 시:** overflow clip용 span과 편집 대상이 같을 경우, focus/blur·input·DOM 동기화 경로를 한곳(`events.js`, `selection.js`, `state.js`)에서 일관되게 설계해야 함.
- **편집 중 DOM rewrite 금지:** contenteditable 요소에 `textContent`를 반복 설정하면 caret/selection이 초기화될 수 있음. 편집 중에는 상태(`sheetState`)만 갱신하고, DOM 반영은 `exitEditMode()` 시점에 수행하는 것이 안전함.
- 참고:
  - [MDN — Element: blur event](https://developer.mozilla.org/ko/docs/Web/API/Element/blur_event)
  - [MDN — FocusEvent.relatedTarget](https://developer.mozilla.org/ko/docs/Web/API/FocusEvent/relatedTarget)
  - [MDN — contenteditable](https://developer.mozilla.org/ko/docs/Web/HTML/Global_attributes/contenteditable)

---

### [이슈 제목: Formula Bar 입력 즉시 셀 미반영 (v1.2.2)]
- **발생 일자:** 2026-05-31
- **발생 환경:** Frontend / Vanilla JavaScript (ES6+) / 브라우저 (Chrome 등)

#### 🚨 1. 문제 상황 (Problem)
- v1.2.1 Formula Bar 직접 편집 기능 적용 이후, formula-bar(`#formula-input`)에 값을 입력해도 **active cell display에 즉시 반영되지 않음**.
- formula-bar input에는 텍스트가 보이지만, 그리드 셀은 빈 상태로 남거나 Enter 입력 후에야 값이 보이는 증상.
- 한글 IME 입력 시 실시간 반영이 특히 더 불안정하게 나타날 수 있음.
- 콘솔 JavaScript 에러는 없으며, `sheetState`·DOM·formula-bar 간 동기화 경로 문제로 나타남.

#### 🔍 2. 원인 분석 (Cause)
- **IME composition 처리:** `formulaCompositionActive` 플래그가 `true`인 동안 `input` 이벤트에서 `applyToCell()` 호출을 건너뛰어, 한글 등 조합형 입력이 셀에 바로 반영되지 않음.
- **focus 시 동기화 누락:** formula-bar focus 직후 input 값과 `sheetState`·active cell display가 어긋난 상태에서 편집이 시작될 수 있음.
- **DOM 갱신 경로 불일치:** formula-bar → 셀 반영 시 `SpreadsheetDisplay.updateCellDisplay()`만 직접 호출하고, `SpreadsheetState.writeCellToDOM()` 경로와 달라 상태·화면 불일치 가능.
- **display 갱신 생략:** `updateCellDisplay()`가 `display.textContent !== value`일 때만 DOM을 수정해, 일부 상황에서 화면 갱신이 누락될 수 있음.
- **bootstrap 가드 미흡:** `#formula-input`이 없어도 앱이 기동되어 formula-bar 이벤트가 등록되지 않을 여지가 있었음.

#### 🛠️ 3. 시도한 방법들 (Attempts)
- **시도 1:** formula-bar `input` 이벤트에서 `compositionActive` 중 호출 차단 유지 ➔ 한글 입력 시 셀 미반영 지속. **실패.**
- **시도 2:** `input`/`compositionend`마다 `applyToCell()` 즉시 호출 ➔ 실시간 반영 개선. **채택.**
- **시도 3:** focus 시 `syncOnFocus()`로 input ↔ `sheetState` 동기화 ➔ 편집 시작 상태 일치. **채택.**
- **시도 4:** `applyToCell()`에서 `writeCellToDOM()` 경로 사용 및 `textContent` 강제 갱신 ➔ 셀 display 즉시 반영. **채택.**

#### ✅ 4. 해결 방법 (Solution)

**1. `formulaBar.js` — `input`/`compositionend`마다 즉시 셀 반영**

```javascript
input.addEventListener('input', () => {
  SpreadsheetFormulaBar.applyToCell(ctx, input.value);
});

input.addEventListener('compositionend', () => {
  ctx.formulaCompositionActive = false;
  SpreadsheetFormulaBar.applyToCell(ctx, input.value);
});
```

**2. `formulaBar.js` — focus/blur 시 동기화·commit**

```javascript
input.addEventListener('focus', () => {
  ctx.isFormulaBarFocused = true;
  onFocus?.(ctx);
  SpreadsheetFormulaBar.syncOnFocus(ctx);
});

input.addEventListener('blur', () => {
  ctx.isFormulaBarFocused = false;
  SpreadsheetFormulaBar.commit(ctx);
  ctx.formulaBarSnapshot = null;
});
```

**3. `formulaBar.js` — `writeCellToDOM` 경로로 display 갱신 통일**

```javascript
applyToCell(ctx, value) {
  // ...
  SpreadsheetState.setCellValue(ctx.sheetState, activeRow, activeCol, value, ctx);
  SpreadsheetState.writeCellToDOM(activeCell, value);
  SpreadsheetDisplay.syncOverflowState(ctx);
},
```

**4. `display.js` — display `textContent` 항상 갱신**

```javascript
updateCellDisplay(cell, value) {
  const display = this.getDisplayElement(cell);

  if (display) {
    display.textContent = value;
    return;
  }
  // ...
},
```

**5. `main.js` — formula input 필수 DOM 가드**

```javascript
if (!ctx.dom.grid || !ctx.dom.nameBox || !ctx.dom.formulaInput) {
  return;
}
```

- 수정 후 formula-bar 입력 시 active cell·`sheetState`가 실시간 동기화되고, Enter 입력 시에도 값이 즉시 반영됨.

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- **formula-bar ↔ cell 양방향 동기화:** formula-bar가 focus를 가진 동안에는 `syncFromCell()`이 input을 덮어쓰지 않도록 `isFocused()`/`isFormulaBarFocused` 검사가 필요함.
- **IME 입력은 compositionend만으로는 부족할 수 있음:** 조합 중에도 `input.value`를 셀에 반영해야 Google Spreadsheet처럼 “바로 적용” UX를 구현할 수 있음.
- **상태·DOM 갱신 경로는 하나로 통일:** formula-bar·셀 편집·commit 모두 `setCellValue()` + `writeCellToDOM()`을 거치면 `sheetState`와 display 불일치를 줄일 수 있음.
- **양방향 sync에서 DOM equality skip 주의:** `textContent !== value` 최적화는 편집 UX에서 오히려 화면 미갱신을 유발할 수 있음.
- 참고:
  - [MDN — Element: input event](https://developer.mozilla.org/ko/docs/Web/API/Element/input_event)
  - [MDN — Element: compositionend event](https://developer.mozilla.org/ko/docs/Web/API/Element/compositionend_event)
  - [MDN — `<input type="text">`](https://developer.mozilla.org/ko/docs/Web/HTML/Element/input/text)

---

### [이슈 제목: 선택 셀 텍스트 클릭 시 caret 즉시 배치 (v1.2.3)]
- **발생 일자:** 2026-05-31
- **발생 환경:** Frontend / Vanilla JavaScript (ES6+) / 브라우저 (Chrome 등)

#### 🚨 1. 문제 상황 (Problem)
- v1.8.0 selection/edit 모드 분리 이후, **이미 선택된(active) 셀** 내부 문자열을 클릭해도 편집 모드에 진입하지 않고 caret(커서)가 생성되지 않음.
- 텍스트 위치를 지정해 수정하려면 **더블클릭**이 필요해 Google Spreadsheet·Excel과 다른 UX.
- single click은 `selectCell()`만 호출되고, 동일 셀 재클릭 시 `td` focus만 유지되는 동작.

#### 🔍 2. 원인 분석 (Cause)
- `events.js`의 `click` 핸들러가 모든 클릭에 `selectCell()`만 호출하고, **편집 진입은 `dblclick`에만** 위임되어 있었음.
- `selectCell()`의 동일 셀 early return 경로는 `cell.focus()`만 수행하고 `enterEditMode()`를 호출하지 않음.
- display span에 `pointer-events: none`이 기본 적용되어 있어, 클릭 좌표 기반 caret 배치를 위해 **`caretRangeFromPoint` / `caretPositionFromPoint` hit test**가 별도로 필요함.
- 클릭 대상(`event.target`)이 `td`인 경우와 `span.sheet-grid__cell-display`인 경우를 좌표 기반으로 통일 처리해야 함.

#### 🛠️ 3. 시도한 방법들 (Attempts)
- **시도 1:** single click을 전역 편집 진입으로 변경 ➔ selection/edit 분리 UX와 충돌, 빈 셀 클릭 시에도 편집 진입. **채택하지 않음.**
- **시도 2:** `dblclick`만 유지하고 CSS `pointer-events`만 조정 ➔ caret 위치 지정 불가, 근본 해결 아님. **실패.**
- **시도 3:** active cell + 텍스트 hit test + `enterEditMode({ caretPoint })` 조합 ➔ **선택된 셀 텍스트 클릭 시에만** 편집·caret 배치. **최종 채택.**

#### ✅ 4. 해결 방법 (Solution)

**1. `caret.js` — 클릭 좌표 hit test 및 caret range 계산**

```javascript
getRangeFromPoint(clientX, clientY, cell) {
  let range = null;

  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(clientX, clientY);
  } else if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(clientX, clientY);
    if (position) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }

  if (range && cell.contains(range.startContainer)) {
    return range;
  }
  return null;
},

hitTestInCell(clientX, clientY, cell) {
  const display = SpreadsheetDisplay.getDisplayElement(cell);
  if (!display?.textContent) return false;
  return this.getRangeFromPoint(clientX, clientY, cell) !== null;
},
```

**2. `events.js` — active cell 텍스트 클릭 시 즉시 편집 진입**

```javascript
tbody.addEventListener('click', (event) => {
  const cell = SpreadsheetUtils.getDataCellFromTarget(event.target);
  if (!cell) return;

  const { rowIndex, colIndex } = SpreadsheetUtils.parseCellCoordinates(cell);
  const isActiveCell = ctx.selectionState.activeCell === cell;
  const cellValue = ctx.sheetState[rowIndex]?.[colIndex] ?? '';

  if (
    isActiveCell &&
    !ctx.selectionState.isEditing &&
    cellValue &&
    SpreadsheetCaret.hitTestInCell(event.clientX, event.clientY, cell)
  ) {
    SpreadsheetSelection.enterEditMode(ctx, {
      preserveContent: true,
      caretPoint: { x: event.clientX, y: event.clientY },
    });
    return;
  }

  SpreadsheetSelection.selectCell(ctx, rowIndex, colIndex);
});
```

**3. `selection.js` — `enterEditMode()`에서 `caretPoint` 전달 시 `placeFromPoint()` 호출 (기존 dblclick과 동일 경로 재사용)**

- 수정 후: 선택된 셀의 **텍스트 영역**을 한 번 클릭하면 클릭 위치에 caret가 생성되고 즉시 편집 가능.
- 빈 셀·다른 셀 클릭·텍스트 밖 클릭은 기존 selection UX 유지.

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- **selection/edit 분리 UX에서도 “재클릭 편집”은 별도 분기 필요:** 동일 셀 early return 경로에 편집 진입을 넣지 않고, click 핸들러에서 **active + hit test** 조건으로 처리하는 것이 의도가 명확함.
- **caret 배치는 `event.target`보다 좌표 기반이 안정적:** `pointer-events: none` display span 구조에서도 `caretRangeFromPoint(clientX, clientY)`로 텍스트 위 클릭을 판별할 수 있음.
- **더블클릭 핸들러와 역할 분담:** single click = active cell 텍스트 편집, dblclick = 비선택·일반 편집 진입으로 공존 가능.
- 참고:
  - [MDN — Document.caretRangeFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/caretRangeFromPoint)
  - [MDN — Document.caretPositionFromPoint()](https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint)
  - [MDN — Selection API](https://developer.mozilla.org/ko/docs/Web/API/Selection)

---

### [셀 한글 IME 입력 시 첫 글자에 영문 혼합 (Chrome)]
- **발생 일자:** 2026-05-30
- **발생 환경:** Frontend / Vanilla JS 스프레드시트 / Chrome / 셀 selection mode → 타이핑

#### 🚨 1. 문제 상황 (Problem)
- 셀 선택 후 한글 입력 시 첫 1~2글자가 `g`, `r`, `d` 등 **영문**으로 표시됨.
- 이후 글자부터는 한글 조합이 되거나, 자음/모음 조합·문자열 중복·caret 꼬임 등 부수 증상 발생.
- **formula bar**에서는 동일 IME로 한글 입력이 **정상** 동작.
- Chrome에서 재현. single click → 바로 입력, selection → edit mode 전환 경로에서 특히 두드러짐.

#### 🔍 2. 원인 분석 (Cause)
**1차 원인 — keydown과 IME 순서 충돌**
- selection mode `keydown` → `startTypingEdit()` → `enterEditMode({ seedText: event.key })`가 **`compositionstart`보다 먼저** 실행.
- 한글 조합 전 첫 `keydown`의 `event.key`는 조합 결과가 아니라 **물리 키(로마자)** (`ㄱ` → `g`).

**2차 원인 — Chrome 포커스·입력 대상 불일치 (formula bar와의 차이)**
- formula bar: 네이티브 `<input>` → IME 조합 정상.
- 셀: 선택 시 포커스가 **편집 불가 `td`** → `keydown` 처리 중 `contenteditable` span으로 focus를 옮겨도 **이미 `td`에서 소비된 키**는 IME에 전달되지 않음.
- `preventDefault()` + `insertText(event.key)` fallback이 영문 `'g'`를 강제 삽입.

#### 🛠️ 3. 시도한 방법들 (Attempts)
- **시도 1:** `event.isComposing`만 검사 ➔ 첫 keydown에서 `false`인 경우가 많아 실패.
- **시도 2:** `seedText` 제거 + `setTimeout(0)`/`queueMicrotask` 지연 삽입 ➔ `preventDefault`가 IME 시작을 막아 Chrome에서 여전히 영문 fallback 발생.
- **시도 3:** `beforeinput`(`insertCompositionText`) 조기 감지 ➔ 포커스가 `td`에 있으면 조합 이벤트 자체가 span에 도달하지 않아 근본 해결 불가.
- **시도 4 (성공):** formula bar와 동일하게 **숨김 네이티브 `<input>`(`#cell-input`)** 에 selection mode 입력 위임 ➔ Chrome IME 정상.

#### ✅ 4. 해결 방법 (Solution)

**1. `index.html` — 숨김 cell input 추가**

```html
<input
  id="cell-input"
  class="sheet-cell-input visually-hidden"
  type="text"
  spellcheck="false"
  autocomplete="off"
  aria-hidden="true"
  tabindex="-1"
/>
```

**2. `js/cellInput.js` — Proxy edit (선택 후 타이핑)**

- 셀 선택 시 `#cell-input` focus.
- `input` / `compositionstart` / `compositionend` → `syncToCell()`로 display span·`sheetState`·formula bar 동기화.
- 조합 중에는 DOM 강제 overwrite 없이 mirror만 수행.

**3. `js/ime.js` — IME 상태 관리**

```javascript
inputState: {
  isComposing: false,
  isDirectEdit: false,
}
```

- `compositionstart` / `update` / `end` 핸들러.
- 조합 중: keydown navigation·Enter·commit·selection reset 차단.

**4. `js/selection.js` — 편집 모드 분기**

| 모드 | 진입 | 입력 수신 |
|------|------|-----------|
| Proxy edit | 셀 선택 후 타이핑 | `#cell-input` |
| Direct edit | 더블클릭·F2·텍스트 클릭 | `contenteditable` span |

- `keydown` 기반 `seedText: event.key` 삽입 **완전 제거**.

**5. 기타 연동**

- `navigation.js` — `handleCellInputKeydown()` (Tab/Enter/Arrow/F2)
- `events.js` — tbody composition은 direct edit 전용; grid `focusin` 시 cell input refocus
- `formulaBar.js` — Enter/Escape 후 `cell-input` focus

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- **formula bar가 되고 셀이 안 되면 입력 요소 타입을 먼저 의심:** contenteditable + selection focus(`td`) 조합은 Chrome IME와 잘 맞지 않을 수 있음.
- **네이티브 `<input>`/`<textarea>`는 IME 처리를 브라우저에 맡기는 것이 가장 안정적.** Google Sheets류 구현도 hidden input 패턴을 자주 사용.
- **`keydown`의 `event.key`는 IME 조합 결과가 아님.** `compositionstart` 이전 로마자 값을 DOM에 넣으면 안 됨.
- **Proxy edit / Direct edit 분리**로 “선택 후 바로 입력”과 “셀 내부 caret 편집” 요구를 동시에 충족 가능.
- 참고:
  - [MDN — Element: compositionstart event](https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionstart_event)
  - [MDN — KeyboardEvent.isComposing](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing)
  - [MDN — HTMLElement: beforeinput event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event)

---

## 📝 템플릿 (새로운 이슈 작성 시 아래 형식을 복사하여 사용)

### [이슈 제목: 에러 메시지나 문제 상황 요약]
- **발생 일자:** YYYY-MM-DD
- **발생 환경:** (예: Frontend / Backend / 특정 라이브러리 버전 등)

#### 🚨 1. 문제 상황 (Problem)
- 어떤 상황에서 발생했는지 구체적인 증상 설명
- 에러 메시지 또는 콘솔 로그 (코드 블록 사용)

#### 🔍 2. 원인 분석 (Cause)
- 문제가 발생한 근본적인 원인
- 왜 이런 에러가 발생했는지에 대한 가설 및 분석

#### 🛠️ 3. 시도한 방법들 (Attempts)
- 해결을 위해 시도했던 방법들과 그 결과 (실패한 방법도 기록)
- **시도 1:** [내용] ➔ [결과/실패 이유]
- **시도 2:** [내용] ➔ [결과/실패 이유]

#### ✅ 4. 해결 방법 (Solution)
- 최종적으로 문제를 해결한 방법
- 수정 전/후 코드 비교 또는 구체적인 설정 변경 내역

#### 💡 5. 배운 점 및 참고 자료 (Learnings & References)
- 이 문제를 통해 알게 된 점이나 주의할 점
- 참고한 공식 문서, Stack Overflow, 블로그 링크 등

---
