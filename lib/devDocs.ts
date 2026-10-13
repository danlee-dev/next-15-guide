import type { Doc } from "./docs";

// 개발 역량 자료 두 편: 에이전트 설치(채팅 앱과의 차이 포함), 방향을 주는 지시.
// 설치 명령과 요금제는 2026-10 공식 문서 기준. 자주 바뀌니 고칠 때 공식 문서를 다시 확인한다.

const L = (slug: string) => `/refs/logos/${slug}`;

export const install: Doc = {
  id: "install",
  label: "Claude Code·Codex 설치",
  chip: "설치",
  meta: "2026년 10월 공식 문서 기준",
  title: "채팅 앱 말고, 코딩 에이전트를 깔아요",
  lead: "Claude 앱이나 ChatGPT 앱을 깔고 채팅창에 코드를 붙여 넣는 건 코딩 에이전트를 쓰는 게 아니에요. 내 프로젝트 폴더를 직접 읽고 고치고 명령을 돌리는 Claude Code나 Codex가 있어야 해요.",
  desc: "채팅 앱과 에이전트의 차이, 요금제, OS별 설치 명령, 확인, 자주 막히는 것",
  sections: [
    {
      title: "채팅과 코딩 에이전트는 달라요",
      blocks: [
        {
          k: "table",
          cols: ["", "채팅 (Claude Chat, ChatGPT)", "코딩 에이전트 (Claude Code, Codex)"],
          rows: [
            ["내 파일", "못 봐요. 내가 복사해서 붙여야 해요", "프로젝트 폴더를 직접 읽고 고쳐요"],
            ["명령 실행", "못 해요", "npm run dev, git, 테스트를 직접 돌려요"],
            ["확인", "내가 돌려 보고 에러를 다시 붙여요", "스스로 돌려 보고 에러를 읽고 다시 고쳐요"],
            ["규칙 파일", "없어요", "CLAUDE.md나 AGENTS.md를 매번 읽어요"],
          ],
        },
        {
          k: "points",
          items: [
            { t: "Claude 데스크톱 앱", d: "위쪽 탭이 Chat, Cowork, Code예요. Code 탭에서 폴더를 골라야 Claude Code예요. Chat 탭은 claude.ai와 같은 채팅이라 내 파일을 못 봐요." },
            { t: "ChatGPT 데스크톱 앱", d: "2026년 7월에 Codex 앱이 ChatGPT 앱 안으로 합쳐졌어요. 위쪽 드롭다운에서 Codex를 골라야 코딩 에이전트예요." },
          ],
        },
        {
          k: "p",
          t: "세션 실습과 이 사이트의 명령어는 터미널(CLI) 기준이에요. 앱의 Code 탭이나 Codex 모드를 써도 되지만, 막혔을 때 설명은 터미널에 맞춰져 있어요.",
        },
      ],
    },
    {
      title: "요금제",
      note: "자주 바뀌어요. 결제 전에 공식 페이지 확인",
      blocks: [
        {
          k: "table",
          cols: ["도구", "쓸 수 있는 요금제"],
          rows: [
            ["Claude Code (터미널, 앱 Code 탭, 편집기 확장)", "Claude Pro, Max, Team, Enterprise 또는 API(Console) 계정. 무료 플랜에는 없어요"],
            ["Codex CLI, 편집기 확장", "ChatGPT Plus, Pro, Business, Edu, Enterprise 또는 API 키"],
            ["Codex (데스크톱 앱만)", "Free, Go도 가벼운 작업은 돼요. 단 순차 제공이고, CLI와 편집기 확장은 안 돼요"],
          ],
        },
      ],
    },
    {
      title: "Claude Code 설치",
      blocks: [
        {
          k: "code",
          label: "설치 (공식 권장, 자동 업데이트)",
          mac: `curl -fsSL https://claude.ai/install.sh | bash`,
          win: `irm https://claude.ai/install.ps1 | iex`,
          tip: "Windows는 PowerShell에서 쳐요. 줄 앞이 `PS C:\\`로 시작하면 PowerShell이에요. 관리자 권한은 필요 없어요. Git for Windows를 깔아 두면 Claude가 Git Bash로 명령을 돌리고, 없으면 PowerShell로 돌려요.",
        },
        {
          k: "code",
          label: "다른 방법 (위 방법이 안 될 때 하나만)",
          mac: `brew install --cask claude-code
# 업데이트는 직접: brew upgrade claude-code`,
          win: `winget install Anthropic.ClaudeCode
# 업데이트는 직접: winget upgrade Anthropic.ClaudeCode`,
          tip: "이 방법은 자동 업데이트가 안 돼요. npm(`npm install -g @anthropic-ai/claude-code`)도 되지만 sudo는 붙이지 마요(공식 문서 경고). 여러 방법으로 두 번 깔면 서로 꼬여요.",
        },
        {
          k: "code",
          label: "확인",
          both: `claude --version
claude doctor`,
          tip: "버전 숫자가 나오면 성공이에요. `claude doctor`는 설치 상태와 설정 오류를 보여 줘요. `command not found`가 뜨면 터미널을 새로 열고 다시 쳐 봐요.",
        },
        {
          k: "code",
          label: "처음 실행 (프로젝트 폴더에서)",
          both: `cd 내-프로젝트
claude
# 브라우저가 열리면 Claude 계정으로 로그인
# 켜진 다음 /init 을 치면 CLAUDE.md 를 만들어 줘요`,
        },
      ],
    },
    {
      title: "Codex 설치",
      blocks: [
        {
          k: "code",
          label: "설치 (공식 설치 스크립트)",
          mac: `curl -fsSL https://chatgpt.com/codex/install.sh | sh`,
          win: `powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"`,
          tip: "업데이트할 때도 같은 명령을 다시 실행해요.",
        },
        {
          k: "code",
          label: "다른 방법 (위 방법이 안 될 때 하나만)",
          mac: `brew install --cask codex
# 또는
npm install -g @openai/codex`,
          win: `npm install -g @openai/codex`,
        },
        {
          k: "code",
          label: "확인과 처음 실행",
          both: `codex --version
cd 내-프로젝트
codex
# Sign in with ChatGPT 를 고르고 로그인
# 켜진 다음 /init 으로 AGENTS.md 만들기, /status 로 지금 설정 보기`,
        },
        {
          k: "p",
          t: "Windows는 PowerShell에서 바로 써도 돼요. Codex가 Windows 샌드박스로 작업 폴더 밖 쓰기와 허락 없는 네트워크를 막아요. WSL2에서 쓴다면 프로젝트를 `/mnt/c` 아래가 아니라 리눅스 쪽 폴더에 둬야 빨라요.",
        },
      ],
    },
    {
      title: "편집기 안에서 쓰고 싶다면",
      blocks: [
        {
          k: "points",
          items: [
            { t: "Claude Code", d: "VS Code·Cursor 확장 'Claude Code', JetBrains 플러그인. Claude 데스크톱 앱의 Code 탭도 같은 Claude Code예요. 셋 다 같은 계정과 설정(~/.claude)을 써요." },
            { t: "Codex", d: "VS Code·Cursor·Windsurf는 Codex 확장(마켓 ID `openai.chatgpt`), Xcode와 JetBrains는 자체 AI 채팅에서 Codex를 골라요. 편집기 확장은 Plus 이상이에요." },
          ],
        },
      ],
    },
    {
      title: "자주 막히는 것",
      blocks: [
        {
          k: "warn",
          title: "이러면 이렇게",
          items: [
            "Claude 앱을 깔고 Chat 탭에 코드를 붙여 넣고 있다 → Code 탭에서 폴더를 고르거나 터미널에서 `claude`",
            "ChatGPT 앱에서 그냥 채팅하고 있다 → 위쪽 드롭다운에서 Codex",
            "Claude Code가 업그레이드하라고 한다 → 무료 플랜이라서예요. Pro 이상이 필요해요",
            "Codex CLI가 로그인 뒤 막힌다 → Free·Go는 데스크톱 앱만 돼요",
            "홈 폴더에서 `claude`나 `codex`를 켰다 → `cd` 로 프로젝트 폴더에 들어간 다음 켜요. 홈에서 켜면 컴퓨터 전체를 프로젝트로 봐요",
            "Windows에서 'irm'이 인식되지 않는다 → CMD예요. PowerShell을 열어요",
            "깔았는데 command not found → 터미널을 새로 열어요. 그래도 안 되면 `claude doctor`나 공식 문제 해결 문서",
          ],
        },
      ],
    },
    {
      title: "공식 문서",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Claude Code 설치", logo: L("claude.svg"), url: "https://code.claude.com/docs/en/setup", d: "OS별 설치, 확인, 업데이트, 삭제" },
            { name: "Claude 데스크톱 앱 Code 탭", logo: L("claude.svg"), url: "https://code.claude.com/docs/en/desktop-quickstart", d: "터미널 없이 Claude Code 쓰기" },
            { name: "Codex CLI", logo: L("codex-mark.png"), url: "https://github.com/openai/codex", d: "설치 스크립트, npm, Homebrew, 로그인" },
            { name: "Codex 요금제", logo: L("codex-mark.png"), url: "https://learn.chatgpt.com/docs/pricing", d: "플랜마다 되는 것과 사용량" },
          ],
        },
      ],
    },
  ],
};

export const direct: Doc = {
  id: "direct",
  label: "방향을 주는 지시",
  chip: "지시",
  meta: "읽는 데 10분",
  title: "'고쳐 줘' 말고, 구조를 알고 방향을 주는 지시",
  lead: "같은 AI에게 시켜도 결과가 다른 건 지시에 담긴 이해가 다르기 때문이에요. 왜 이렇게 돼 있는지, 어떤 경우에 깨지는지까지 넣어 주면 AI가 하는 일이 달라져요. 그 이해를 빨리 쌓는 방법을 공식 가이드와 연구에서 모았어요.",
  desc: "구조를 아는 지시와 모르는 지시, 지시의 여섯 칸, 엣지 케이스, AI를 써도 실력이 느는 사용법, 매일 하는 연습",
  sections: [
    {
      title: "같은 AI, 다른 결과",
      note: "오른쪽 아래 문의하기 버튼이 떠 있을 때",
      blocks: [
        {
          k: "p",
          t: "화면 오른쪽 아래 '문의하기' 버튼이 바닥에서 한참 위에 떠 있어요. 두 사람이 이렇게 시켰어요.",
        },
        {
          k: "table",
          cols: ["", "지시", "결과"],
          rows: [
            ["구조를 모를 때", "문의하기 버튼이 너무 위에 있어. 아래로 내려 줘.", "bottom 값만 줄어들어요. 아래에 다른 버튼(쿠폰 바, 하단 메뉴)이 뜨면 둘이 겹쳐요."],
            [
              "구조를 알 때",
              "이 버튼이 위에 고정된 건 아래에 뜨는 쿠폰 바와 겹치지 않으려고 그런 것 같아. 그런데 쿠폰 바가 없을 때도 같은 높이라 빈 공간이 생겨. 쿠폰 바가 있는지와 높이에 따라 위치를 정해 줘. 있으면 바 위로 16px, 없으면 화면 바닥(아이폰 홈 바 영역 포함)에서 16px. 바가 열리고 닫힐 때 같이 움직이고, 숫자를 하드코딩하지 말고 바 높이를 CSS 변수로 받아서 계산해. 고치기 전에 지금 위치가 왜 이렇게 정해졌는지 코드에서 확인하고 계획부터 보여 줘.",
              "조건마다 맞는 위치에 붙고, 바가 생기고 사라질 때도 겹치거나 빈 곳이 생기지 않아요.",
            ],
          ],
        },
        {
          k: "points",
          items: [
            { t: "의도를 추측하고 확인시켜요", d: "'왜 이렇게 돼 있는지'를 먼저 짚으면 AI가 그 의도를 지키면서 고쳐요. 틀렸으면 AI가 바로잡아 줘서 그것도 배움이 돼요." },
            { t: "조건별로 원하는 동작을 말해요", d: "'아래로'가 아니라 '바가 있으면 이렇게, 없으면 저렇게'. 조건이 빠지면 AI는 한 경우만 맞춰요." },
            { t: "깨질 경우를 미리 넣어요", d: "열고 닫힐 때, 아이폰 홈 바, 다른 버튼과 겹칠 때. 내가 안 넣은 경우는 AI도 대부분 안 챙겨요." },
            { t: "방법의 방향을 줘요", d: "'숫자 하드코딩 말고 변수로'처럼 어떻게 풀지의 방향. 다음에 바뀌어도 안 깨지는 코드가 나와요." },
          ],
        },
        {
          k: "p",
          t: "두 번째 지시를 쓰려면 화면이 어떻게 만들어졌는지(고정 위치, 겹침, 조건부로 뜨는 요소)를 알아야 해요. 아래는 그 이해를 빨리 쌓는 방법이에요.",
        },
      ],
    },
    {
      title: "지시의 여섯 칸",
      note: "공식 가이드를 합친 틀",
      blocks: [
        {
          k: "p",
          t: "Codex 공식 가이드는 프롬프트를 목표, 맥락, 제약, '끝났다는 기준' 네 칸으로 쓰라고 하고, Claude Code 공식 가이드는 버그를 시킬 때 증상, 의심 위치, '고쳐졌다는 모습'을 같이 주라고 해요. 둘을 합치면 이 여섯 칸이에요. 매번 다 쓸 필요는 없고, 한 문장으로 설명되는 작은 수정이면 바로 시켜도 돼요.",
        },
        {
          k: "table",
          cols: ["칸", "무엇을", "문의하기 버튼 예"],
          rows: [
            ["지금", "무엇이 어떻게 보이는지, 언제 그런지", "쿠폰 바가 없을 때 버튼이 바닥에서 80px 떠 있다"],
            ["구조", "왜 그런 것 같은지. 그리고 맞는지 확인해 달라고", "쿠폰 바를 피하려고 고정한 것 같다. 코드에서 확인해 줘"],
            ["원하는 동작", "조건마다 어떻게 돼야 하는지", "바가 있으면 바 위 16px, 없으면 바닥 16px"],
            ["엣지 케이스", "깨질 수 있는 경우", "바 열고 닫힘, 아이폰 홈 바, 모바일 키보드"],
            ["지키기", "바꾸면 안 되는 것, 쓰지 말 것, 방법의 방향", "숫자 하드코딩 금지, 바 높이는 CSS 변수로"],
            ["끝", "무엇으로 확인하면 끝인지", "바가 있을 때와 없을 때 모바일 화면 캡처 두 장"],
          ],
        },
        {
          k: "prompt",
          t: `지금: [___ 무엇이 어떻게 보이는지, 언제 그런지]
구조: [___ 왜 그렇게 된 것 같은지]. 맞는지 코드에서 먼저 확인해 줘.
원하는 동작: [___ 조건마다 어떻게 돼야 하는지]
엣지 케이스: [___ 비었을 때, 긴 글, 모바일, 열고 닫힐 때 등]
지키기: [___ 바꾸면 안 되는 것, 쓰지 말 것]
끝: [___ 무엇으로 확인하면 끝인지]
고치기 전에 계획부터 보여 줘.`,
        },
      ],
    },
    {
      title: "구조를 빨리 아는 법: 고치기 전에 묻기",
      blocks: [
        {
          k: "p",
          t: "Claude Code 공식 가이드는 '선배 개발자에게 물을 질문을 그대로 물어보라'고 해요. 예를 들면 'X는 어떤 엣지 케이스를 처리해?', '333번째 줄에서 왜 bar() 말고 foo()를 불러?' 같은 질문이에요. 고치라고 하기 전에 먼저 물으면, 코드를 읽는 속도가 빨라지고 지시가 달라져요.",
        },
        {
          k: "steps",
          items: [
            "고치기 전에 '왜 이렇게 돼 있어?'부터 물어요. 파일과 줄 번호를 같이 달라고 해요.",
            "AI 답을 코드에서 직접 열어 확인해요. AI도 추측으로 답할 때가 있어요.",
            "확인한 구조로 여섯 칸 지시를 써요.",
            "계획 모드에서 계획을 받고, 내가 이해한 구조와 다른 부분을 짚어요. Claude Code는 Shift+Tab, Codex는 `/plan`.",
            "실행하기 전에 결과를 한 줄로 예측해요. 틀렸다면 그 차이가 이번에 새로 배운 구조예요.",
          ],
        },
        {
          k: "prompt",
          t: `[___ 화면이나 기능 이름]이 어떻게 만들어졌는지 설명해 줘. 고치지는 마.
1. 관련 파일과 줄 번호
2. 데이터가 어디서 와서 어디로 가는지 (화면 → 서버 → DB 순서로)
3. 이 동작에 영향을 주는 다른 요소나 조건
4. 일부러 이렇게 만든 것 같은 부분과 그 이유`,
        },
        {
          k: "prompt",
          t: `[___ 바꾸려는 것]을 바꾸면 깨질 수 있는 경우를 먼저 목록으로 뽑아 줘. 고치지는 마.
데이터(비었을 때, 아주 많을 때), 상태(로딩, 실패, 두 번 클릭), 화면(모바일, 다크 모드), 조건부로 뜨는 요소, 로그인 여부로 나눠서.`,
        },
      ],
    },
    {
      title: "엣지 케이스 목록",
      note: "이번 변경과 관련된 것만 1~3개 골라 넣어요",
      blocks: [
        {
          k: "table",
          cols: ["종류", "떠올릴 것"],
          rows: [
            ["데이터", "비었을 때, 하나일 때, 아주 많을 때, 아주 긴 글이나 이름, 특수문자"],
            ["상태", "로딩 중, 실패, 느린 네트워크, 버튼 두 번 클릭, 새로고침과 뒤로 가기"],
            ["화면", "모바일 375px, 큰 화면, 다크 모드, 모바일 키보드, 아이폰 노치와 홈 바"],
            ["조건부 요소", "있을 때와 없을 때, 열고 닫힐 때, 다른 요소와 겹칠 때"],
            ["사람", "로그인 안 함, 권한 없음, 처음 온 사람, 이미 데이터가 있는 사람"],
            ["시간", "자정과 월말, 한국 시간과 UTC"],
          ],
        },
      ],
    },
    {
      title: "확인 방법까지 주기",
      note: "Claude Code 공식 가이드의 예",
      blocks: [
        {
          k: "p",
          t: "AI는 '다 된 것 같아 보일 때' 멈춰요. 돌려 볼 수 있는 확인 방법(테스트, 빌드, 캡처)을 주면 스스로 확인하고 고쳐요. 확인이 없으면 내가 확인하는 사람이 돼요.",
        },
        {
          k: "table",
          cols: ["이렇게 말고", "이렇게"],
          rows: [
            ["이메일 검사 함수 만들어 줘", "validateEmail 함수를 만들어 줘. user@example.com은 true, invalid는 false, user@.com은 false. 만든 다음 테스트를 돌려 줘"],
            ["대시보드 예쁘게 해 줘", "[캡처 붙이기] 이 디자인대로 만들고, 결과를 캡처해서 원본과 비교해. 다른 점을 적고 고쳐 줘"],
            ["빌드가 안 돼", "빌드가 이 에러로 실패해: [에러]. 고치고 빌드 성공까지 확인해. 에러를 숨기지 말고 원인을 고쳐"],
            ["로그인 버그 고쳐 줘", "세션이 만료된 뒤 로그인이 실패해. src/auth 의 토큰 갱신부터 봐. 재현하는 테스트를 먼저 쓰고 고쳐"],
          ],
        },
      ],
    },
    {
      title: "AI를 써도 실력이 느는 사용법",
      note: "Anthropic 2026년 연구",
      blocks: [
        {
          k: "p",
          t: "Anthropic이 주니어 개발자 52명에게 처음 보는 라이브러리로 과제를 시키고, 끝난 뒤 AI 없이 퀴즈를 봤어요. AI를 쓴 쪽이 평균 50%, 안 쓴 쪽이 67%였고, 속도 차이는 통계적으로 의미가 없었어요. 차이는 AI를 어떻게 썼는지에서 갈렸어요.",
        },
        {
          k: "table",
          cols: ["AI를 쓴 방식", "퀴즈 평균"],
          rows: [
            ["코드를 통째로 맡김", "40% 아래"],
            ["처음 몇 개만 묻다가 점점 다 맡김", "40% 아래"],
            ["디버깅과 확인을 계속 AI에게 맡김", "40% 아래"],
            ["코드를 받은 다음 이해될 때까지 질문", "65% 이상"],
            ["코드와 설명을 같이 요청", "65% 이상"],
            ["개념만 묻고 에러는 직접 해결", "65% 이상"],
          ],
        },
        {
          k: "p",
          t: "표본이 작아 단정할 수는 없다고 연구진도 말해요. 그래도 방향은 분명해요. 맡기기만 하면 빨라지지도 않으면서 덜 배워요. 막혀서 애쓰는 시간이 실력이 되는 시간이라는 게 연구진의 말이에요.",
        },
        {
          k: "points",
          items: [
            { t: "Claude Code: Explanatory, Learning 스타일", d: "`/output-style explanatory`는 바꾼 이유를 Insight 블록으로 같이 보여 줘요. `/output-style learning`은 설계 판단이 필요한 몇 줄을 `TODO(human)`으로 남겨서 직접 쓰게 해요." },
            { t: "Codex", d: "따로 학습 모드는 없어서 지시 끝에 '바꾼 줄마다 왜 그렇게 했는지 설명해 줘'를 붙여요. 개념 질문은 ChatGPT Study Mode가 연구에서 권한 방법이에요." },
          ],
        },
      ],
    },
    {
      title: "매일 하는 연습",
      note: "하루 30분",
      blocks: [
        {
          k: "steps",
          items: [
            "지시 일기: 오늘 보낸 지시 하나를 여섯 칸으로 다시 써요. 처음 지시와 다시 쓴 지시를 나란히 docs/prompts.md 에 쌓아요.",
            "diff 읽기: 커밋 전에 AI가 바꾼 줄을 읽고, 모르는 줄은 '이 줄은 왜 필요해?'로 물어요. AI 코드는 주니어 개발자 코드처럼 리뷰해요.",
            "예측하고 확인: 실행 전에 결과를 한 줄로 적고, 맞았는지 봐요.",
            "두 번 고쳐도 안 되면 새 대화: 같은 문제를 두 번 고쳐도 안 되면 새 대화(Claude Code `/clear`, Codex `/new`)에서, 배운 걸 넣어 처음부터 다시 지시해요.",
            "같은 실수는 규칙으로: AI가 같은 실수를 반복하면 CLAUDE.md나 AGENTS.md에 한 줄 추가해요.",
            "일주일에 한 번은 손으로: 작은 기능 하나를 AI에게 코드를 받지 말고, 개념만 물어 가며 직접 만들어요.",
          ],
        },
        {
          k: "warn",
          title: "이러면 지시가 약해요",
          items: [
            "'고쳐 줘', '예쁘게 해 줘', '안 돼'로 끝난다",
            "조건이 하나뿐이다 ('있을 때'만 있고 '없을 때'가 없다)",
            "끝났는지 확인할 방법이 없다",
            "AI가 바꾼 줄을 읽지 않고 커밋한다",
            "같은 대화에서 세 번째 고쳐 달라고 하고 있다",
          ],
        },
      ],
    },
    {
      title: "출처와 더 읽을거리",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Best practices for Claude Code", url: "https://code.claude.com/docs/en/best-practices", d: "Anthropic 공식. 확인 방법 주기, 탐색-계획-구현, 구체적인 맥락, 두 번 실패하면 새 대화" },
            { name: "Codex best practices", url: "https://learn.chatgpt.com/docs/learn/best-practices", d: "OpenAI 공식. 목표·맥락·제약·끝났다는 기준, 계획 먼저, AGENTS.md" },
            { name: "How AI assistance impacts the formation of coding skills", url: "https://www.anthropic.com/research/AI-assistance-coding-skills", d: "Anthropic 연구. AI 사용 방식에 따라 갈린 학습 효과" },
            { name: "My LLM coding workflow going into 2026", url: "https://addyosmani.com/blog/ai-coding-workflow/", d: "Addy Osmani. 스펙 먼저, 작게 나누기, 맥락 몰아넣기, 직접 리뷰" },
            { name: "Here's how I use LLMs to help me write code", url: "https://simonwillison.net/2025/Mar/11/using-llms-for-code/", d: "Simon Willison. 맥락이 전부, 정확히 시키기, 돌려 보기 전엔 안 된 것" },
            { name: "Output styles", url: "https://code.claude.com/docs/en/output-styles", d: "Claude Code의 Explanatory, Learning 스타일" },
          ],
        },
      ],
    },
  ],
};

export const figma: Doc = {
  id: "figma",
  label: "Figma MCP 연결",
  chip: "Figma",
  meta: "2026년 10월 Figma 공식 문서 기준",
  title: "AI가 Figma를 읽고, 그리게 연결해요",
  lead: "Figma MCP를 연결하면 AI가 Figma 화면을 읽어서 코드로 옮기고, 반대로 사용자 흐름도나 화면 초안을 Figma에 직접 그려요. 서버 주소는 하나(https://mcp.figma.com/mcp)고, 쓰는 도구마다 연결하는 방법만 달라요.",
  desc: "Claude Code, Claude 앱, Codex에서 연결하기, 요금제와 횟수, 할 수 있는 것, 자주 막히는 것",
  sections: [
    {
      title: "무엇을 할 수 있나",
      blocks: [
        {
          k: "table",
          cols: ["하고 싶은 것", "AI가 쓰는 Figma 도구", "이렇게 시켜요"],
          rows: [
            ["사용자 흐름을 흐름도로", "generate_diagram (FigJam)", "docs/FLOW.md 의 흐름을 FigJam 흐름도로 그려 줘"],
            ["화면 초안을 Figma에", "use_figma (Full 좌석 필요)", "새 Figma 파일에 화면 목록대로 모바일 와이어프레임을 그려 줘"],
            ["Figma 화면을 코드로", "get_design_context, get_screenshot", "이 프레임 링크를 Next.js + Tailwind 로 만들어 줘"],
            ["색, 간격 같은 디자인 값 가져오기", "get_variable_defs", "이 프레임에 쓰인 색과 간격 변수를 정리해 줘"],
            ["만든 웹 화면을 Figma로", "generate_figma_design", "지금 만든 첫 화면을 Figma 레이어로 보내 줘"],
          ],
        },
        {
          k: "p",
          t: "Figma 링크를 줄 때는 프레임을 선택하고 오른쪽 클릭 > Copy link to selection 으로 복사해요. 파일 링크만 주면 어느 화면인지 몰라요.",
        },
      ],
    },
    {
      title: "먼저 확인: 요금제와 횟수",
      note: "무료는 한 달 20번이라 금방 끝나요",
      blocks: [
        {
          k: "table",
          cols: ["Figma 플랜, 좌석", "Figma MCP 호출"],
          rows: [
            ["무료(Starter), 또는 View·Collab 좌석", "한 달 20번"],
            ["Education (학생 인증, 무료)", "하루 200번, 분당 10번"],
            ["Professional의 Dev·Full 좌석", "하루 200번"],
          ],
        },
        {
          k: "p",
          t: "Figma에 직접 그리는 기능(use_figma)은 Full 좌석이 있어야 해요. Dev 좌석은 읽기만 돼요. 대학생은 학교 이메일로 figma.com/education/apply 에서 Education을 신청하면 Professional 플랜을 무료로 1년 받아요. 실습 전에 미리 신청해 두세요.",
        },
      ],
    },
    {
      title: "Claude Code",
      note: "터미널, 데스크톱 앱 Code 탭",
      blocks: [
        {
          k: "code",
          label: "플러그인으로 (공식 권장, 연결 설정과 스킬이 같이 들어와요)",
          both: `claude plugin install figma@claude-plugins-official`,
        },
        {
          k: "code",
          label: "또는 직접 추가",
          both: `claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp`,
          tip: "`--scope user` 를 붙이면 모든 프로젝트에서 써요. 빼면 지금 폴더에서만이에요.",
        },
        {
          k: "steps",
          items: [
            "claude 를 새로 켜요. 연결은 새 세션부터 보여요.",
            "`/mcp` 를 치고 figma 를 골라 Authenticate.",
            "브라우저에서 Figma에 로그인하고 Allow Access. 터미널에 Authentication successful 이 뜨면 끝이에요.",
            "Claude 데스크톱 앱 Code 탭이라면 입력창 옆 + > Plugins 에서 Figma를 설치해도 돼요.",
          ],
        },
      ],
    },
    {
      title: "Claude 앱 (Chat 탭, claude.ai)",
      note: "Pro 이상",
      blocks: [
        {
          k: "steps",
          items: [
            "채팅 입력창 왼쪽 아래 도구 버튼(+)을 눌러 커넥터 추가를 골라요. 설정 > 커넥터에서도 찾을 수 있어요.",
            "목록에서 Figma를 찾아 연결해요.",
            "Figma 창이 열리면 로그인하고 Allow access.",
            "채팅에 Figma 프레임 링크를 붙여 넣고 질문해요.",
          ],
        },
        {
          k: "p",
          t: "채팅은 내 프로젝트 파일을 못 고쳐요. 화면을 읽고 설명을 듣거나 흐름을 정리하는 데 쓰고, 코드로 옮기는 건 Claude Code에서 해요. 메뉴 이름은 자주 바뀌어서 화면과 조금 다를 수 있어요.",
        },
      ],
    },
    {
      title: "Codex",
      note: "CLI, ChatGPT 앱의 Codex",
      blocks: [
        {
          k: "code",
          label: "CLI",
          both: `codex mcp add figma --url https://mcp.figma.com/mcp
codex mcp login figma
codex mcp list`,
          tip: "`codex mcp login figma` 를 치면 브라우저가 열려요. Figma에 로그인하고 Allow access. codex 안에서는 `/mcp` 로 연결된 서버를 볼 수 있어요.",
        },
        {
          k: "p",
          t: "ChatGPT 데스크톱 앱의 Codex에서는 왼쪽 위 Plugins를 열고 Figma 옆 + > Install Figma > Allow access 순서로 연결해요.",
        },
      ],
    },
    {
      title: "연결됐는지 확인",
      blocks: [
        {
          k: "prompt",
          t: `Figma MCP의 whoami 로 내 계정과 플랜을 알려 줘.`,
        },
        {
          k: "p",
          t: "이메일과 플랜이 나오면 연결된 거예요. 플랜이 Starter면 한 달 20번 제한이 걸려 있어요.",
        },
      ],
    },
    {
      title: "자주 막히는 것",
      blocks: [
        {
          k: "warn",
          title: "이러면 이렇게",
          items: [
            "AI가 Figma 도구를 모른다 → 새 세션을 열어요. 연결은 새 세션부터 보여요",
            "Claude Code에서 figma가 '인증 필요'로 남아 있다 → `/mcp` 에서 figma 고르고 Authenticate",
            "한 달 20번을 다 썼다 → Education 신청, 아니면 다음 달까지 기다리기",
            "Figma에 그려 달라는데 실패한다 → Full 좌석인지, 그 파일에 편집 권한이 있는지 확인",
            "엉뚱한 화면을 코드로 만든다 → 파일 링크 말고 프레임의 Copy link to selection 링크를 줘요",
          ],
        },
      ],
    },
    {
      title: "공식 문서",
      blocks: [
        {
          k: "tools",
          items: [
            { name: "Figma MCP 서버 연결", logo: L("figma-mcp.png"), url: "https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/", d: "Claude Code, Codex, Cursor, VS Code 연결 방법" },
            { name: "도구 목록", logo: L("figma-mcp.png"), url: "https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/", d: "읽기 도구, 쓰기 도구, 예시 프롬프트" },
            { name: "요금제와 호출 횟수", logo: L("figma-mcp.png"), url: "https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/", d: "플랜, 좌석마다 쓸 수 있는 횟수" },
            { name: "Figma Education 신청", logo: L("figma-mcp.png"), url: "https://help.figma.com/hc/en-us/articles/360041061214-Verify-your-eligibility-for-Figma-s-Education-plan", d: "학생 무료 Professional 플랜" },
            { name: "Claude 커넥터 연결", logo: L("claude.svg"), url: "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory", d: "Claude 앱에서 커넥터 찾고 연결하기" },
          ],
        },
      ],
    },
  ],
};
