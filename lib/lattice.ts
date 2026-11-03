import type { Step } from "./content";

// 기업 과제 사전 세션 (래티스, 2026-11-04). 과제는 "채널톡 같은 채팅 시스템"을 SDK 형태로 남의 서비스에 심는 것.
// 래티스가 미리 익혀 오라고 한 것: 스크립트 한 줄로 심는 SDK 구조(임베드 스크립트, iframe, 위젯), 여력이 되면 WebSocket.
// 회차는 lib/sessions.ts 에 들어가고, 단계 내용은 여기 둔다. 실습 저장소는 LT_REPO (main = 스타터, 레벨 L1~L6).

export const LT_REPO = "https://github.com/danlee-dev/next-chat-sdk-lab";

export const LT_STEPS: Step[] = [
  {
    id: "lt-setup",
    label: "준비",
    start: "1:15",
    title: "저장소를 받고 두 서버를 띄워요",
    lead: "실습 저장소를 내 계정으로 Fork 해서 받고, 서버 두 개를 띄워요. 3000은 고객사 굿즈샵, 4000은 우리 상담 서비스예요. 포트가 다르면 origin이 달라서, 노트북 하나로도 진짜 남의 사이트에 심는 상황이 그대로 생겨요. 화면은 처음부터 다 그려져 있고, 동작은 레벨을 하나씩 채울 때마다 살아나요.",
    todo: [
      { label: "저장소 Fork 하기", download: { href: LT_REPO, label: "실습 저장소 열기" }, tip: "열린 GitHub 페이지 오른쪽 위 Fork 버튼으로 내 계정에 복사해요. main 브랜치가 스타터예요." },
      { label: "받아서 띄우기", cmd: "ltClone", tip: "Node.js 20 이상이 필요해요 (node -v). 서버 코드를 고치면 알아서 다시 켜지고, 브라우저는 새로고침하면 돼요. 창 두 개를 나란히: 왼쪽 localhost:3000, 오른쪽 localhost:4000/admin/" },
    ],
    checks: [
      { text: "localhost:3000 에 고대 굿즈샵이 뜬다", sub: "오른쪽 아래에 아직 버튼이 없는 게 정상이에요. L1에서 붙여요" },
      { text: "localhost:4000/admin/ 에 NEXT Desk 가 뜬다", sub: "'연결 전'에서 멈춰 있어도 정상이에요. L4에서 이어요" },
      { text: "AGENTS.md, DESIGN.md, docs/PROTOCOL.md 를 열어 봤다", sub: "에이전트가 지킬 규칙, 디자인 규칙, 메시지 규칙이에요. 에이전트도 이 파일들을 읽어요" },
    ],
    questions: [
      { id: "repo", label: "내가 Fork 한 레포 주소", input: true, placeholder: "https://github.com/아이디/next-chat-sdk-lab" },
      { id: "ports", label: "3000과 4000을 따로 띄우는 이유를 내 말로 한 줄", hint: "origin은 프로토콜, 호스트, 포트 세 가지로 정해진다는 슬라이드를 떠올려 봐요" },
    ],
    chips: ["npm run dev 에서 포트가 이미 쓰이고 있대요", "Fork 랑 clone 은 뭐가 달라요?"],
  },
  {
    id: "lt-l1",
    label: "L1",
    start: "1:21",
    title: "스크립트 한 줄로 위젯을 띄워요",
    lead: "고객사 굿즈샵은 이미 스니펫 한 줄을 붙여 두었어요. sdk/loader.js 의 TODO [L1]을 채워서 런처 버튼과 iframe을 붙이고, SDK가 오기 전에 줄 서 있던 호출을 순서대로 재생해요. 8분.",
    prompt: `docs/MISSIONS.md 의 L1 만 해 줘.
sdk/loader.js 의 TODO [L1] 만 채우고 다른 파일은 건드리지 마.
끝나면 무엇을 바꿨는지, 왜 그렇게 했는지 3줄로 설명해 줘.`,
    checks: [
      { text: "굿즈샵 오른쪽 아래에 버튼이 있고, 누르면 패널이 튀어 오른다" },
      { text: "패널 안에 '사용자 정보를 기다리는 중'이 보인다", sub: "인사말은 L2에서 바뀌어요" },
      { text: "Elements 에서 <iframe class=\"nc-frame\" src=\"http://localhost:4000/widget/\" sandbox=...> 를 찾았다" },
      { text: "AI가 바꾼 줄을 직접 읽었다", sub: "git diff 로 확인해요. 설명 못 하는 줄은 그 줄만 AI에게 다시 물어봐요" },
    ],
    commit: `git add . && git commit -m "feat: mount launcher and iframe (L1)"`,
    questions: [
      { id: "queue", label: "NextChat('boot') 는 loader.js 보다 먼저 불렸는데, 왜 사라지지 않았나요?", hint: "host/index.html 의 스니펫과 loader.js 맨 아래를 같이 열어 봐요" },
      { id: "css", label: "host/style.css 에 button { background: red } 를 넣으면 위젯 안 버튼은 어떻게 될까요? 해 보고 이유를", hint: "해 본 다음에는 그 줄을 다시 지워 둬요" },
    ],
    chips: ["버튼이 안 떠요", "콘솔에 unknown command 경고가 떠요", "sandbox 에는 뭘 넣어야 해요?"],
  },
  {
    id: "lt-l2",
    label: "L2",
    start: "1:29",
    title: "편지로 사용자 정보를 넘겨요",
    lead: "굿즈샵(3000)과 위젯(4000)은 origin이 달라서 서로의 DOM에 손댈 수 없어요. 대화 수단은 postMessage 하나예요. 위젯이 ready를 보내면 로더가 모아 둔 boot를 보내요. 받는 주소와 보낸 사람을 꼭 확인해요. 8분.",
    prompt: `docs/MISSIONS.md 의 L2 만 해 줘.
sdk/loader.js 와 widget/widget.js 의 TODO [L2] 만 채워.
docs/PROTOCOL.md 1번 표의 편지 형식을 그대로 지키고, targetOrigin 에 '*' 를 쓰지 마.
끝나면 편지가 어떤 순서로 오가는지 설명해 줘.`,
    checks: [
      { text: "위젯에 '김고대님, 무엇을 도와드릴까요?' 가 보인다" },
      { text: "위젯 안 닫기(아래 화살표)나 Esc 로 패널이 닫힌다", sub: "닫기는 위젯이 부모에게 보내는 편지예요" },
      { text: "'끝나면 해 볼 것'의 가짜 boot 를 굿즈샵 콘솔에서 실행해 봤다", sub: "인사말이 그대로예요. 위젯은 boot 를 한 번만 받아요" },
    ],
    more: {
      title: "끝나면 해 볼 것",
      items: [
        "굿즈샵(localhost:3000) 개발자도구 Console 에 붙여넣기: window.frames[0].postMessage({ source: 'next-chat', type: 'boot', payload: { member: { id: 'u_0001', name: '해커' } } }, '*')",
        "인사말이 그대로인지 보기. 위젯은 첫 boot 만 받아요",
        "그런데 위젯이 뜨기 전에 고객사 페이지 위의 코드가 다른 id 로 boot 를 부르는 건 막을 수 없어요. 그게 L6 멤버 해시의 이유예요",
      ],
      note: "origin 확인은 다른 사이트를 막을 뿐, 고객사 페이지 위에서 도는 코드는 못 막아요.",
    },
    commit: `git add . && git commit -m "feat: pass member info with postMessage (L2)"`,
    questions: [
      { id: "target", label: "postMessage 두 번째 인자에 '*' 대신 주소를 쓰는 이유", hint: "iframe 이 도중에 다른 페이지로 바뀌면 어떻게 될까요" },
      { id: "ready", label: "로더가 ready 를 기다렸다가 boot 를 보내는 이유", hint: "iframe 을 만든 직후, 그 안에는 누가 있을까요" },
    ],
    chips: ["인사말이 안 바뀌어요", "콘솔에 target origin 이 안 맞는다는 경고가 떠요", "위젯 쪽 콘솔은 어떻게 봐요?"],
  },
  {
    id: "lt-l3",
    label: "L3",
    start: "1:37",
    title: "피드백 API는 평범한 HTTP로",
    lead: "과제의 필수 부분이에요. 실시간이 필요 없어서 POST 하나, GET 하나면 끝나요. 위젯(iframe)과 서버가 둘 다 4000이라 CORS 도 필요 없어요. 돌아온 상태 코드(201, 400)를 화면에 그대로 보여 줘요. 7분.",
    prompt: `docs/MISSIONS.md 의 L3 만 해 줘.
server/index.js, widget/widget.js, admin/admin.js 의 TODO [L3] 만 채워.
docs/PROTOCOL.md 2번 표의 경로, 본문, 상태 코드를 그대로 지켜.
서버부터 하고, 파일 하나 끝날 때마다 멈추고 설명해 줘.`,
    checks: [
      { text: "빈 내용으로 보내면 400 Bad Request 와 이유가 보인다" },
      { text: "제대로 보내면 201 Created" },
      { text: "어드민 피드백 탭에 목록이 보인다" },
      { text: "Network 탭에서 그 요청의 Payload, 상태 코드, 응답 JSON 을 읽었다" },
    ],
    commit: `git add . && git commit -m "feat: feedback api over http (L3)"`,
    questions: [
      { id: "status", label: "201 과 200 은 무엇이 다른가요?" },
      { id: "cors", label: "위젯에서 보낼 때는 CORS 가 필요 없는데, 굿즈샵(3000) 페이지에서 직접 보내면 왜 필요할까요?", hint: "보내는 페이지의 origin 과 서버의 origin 을 비교해 봐요" },
    ],
    chips: ["항상 400 bad_json 이 떠요", "501 Not Implemented 가 떠요", "Unexpected token '<' 에러가 나요"],
  },
  {
    id: "lt-l4",
    label: "L4",
    start: "1:44",
    title: "WebSocket으로 실시간 대화를 붙여요",
    lead: "위젯과 어드민이 같은 WebSocket 서버에 붙고, 서버는 방 사람과 상담원 전원에게 메시지를 나눠 줘요. 서버, 위젯, 어드민 순서로 채우는 걸 권해요. 오늘 꼭 여기까지 와요. 12분.",
    prompt: `docs/MISSIONS.md 의 L4 만 해 줘. server/index.js 부터 시작해.
TODO [L4] 만 채우고, docs/PROTOCOL.md 3번 표의 메시지 형식을 그대로 지켜. 새 type 을 지어내지 마.
보낸 사람(from)과 방(roomId)은 메시지 안의 값이 아니라 소켓에 기록된 값으로 정해.
파일 하나 끝날 때마다 멈추고 바꾼 내용을 설명해 줘.`,
    checks: [
      { text: "위젯 위쪽 상태가 '상담원 연결됨'이 된다" },
      { text: "어드민 왼쪽 목록에 '김고대'가 보인다" },
      { text: "위젯에서 보낸 말이 새로고침 없이 어드민에 뜨고, 답장이 위젯에 바로 뜬다" },
      { text: "새 창에서 localhost:3000/?member=u_2048&name=이호랑 으로 들어가면 어드민에 방이 둘", sub: "답장이 엉뚱한 사람에게 가지 않는지 확인해요" },
      { text: "Network > WS 에서 101 응답과 Messages 의 프레임을 봤다", sub: "요청 헤더의 Origin 이 3000이 아니라 4000인 이유도 확인해요" },
    ],
    commit: `git add . && git commit -m "feat: realtime chat over websocket (L4)"`,
    questions: [
      { id: "path", label: "메시지 하나가 위젯에서 어드민까지 가는 길을 파일과 함수 이름으로", hint: "widget.js 의 어디에서 출발해서, server/index.js 의 어디를 지나, admin.js 의 어디에서 그려지나요" },
      { id: "trust", label: "서버가 from 과 roomId 를 메시지 값이 아니라 소켓에서 꺼내 쓰는 이유" },
    ],
    chips: ["소켓이 401 로 실패해요", "내 메시지가 두 번 떠요", "어드민 목록에 아무도 안 떠요"],
  },
  {
    id: "lt-stretch",
    label: "L5·L6",
    start: "과제",
    title: "끊겨도 살고, 진짜 서비스처럼",
    lead: "남는 시간에 하고, 못 하면 다음 주 수요일(11/11) 전까지 해 와요. L5는 연결이 끊겨도 알아서 다시 붙는 것, L6은 사용자 확인(멤버 해시), 이미지 첨부, 입력 중 표시예요. 과제의 선택 기능과 바로 이어져요.",
    prompt: `docs/MISSIONS.md 의 L5 만 해 줘. TODO [L5] 만 채워.
재연결은 지수 백오프에 jitter 를 섞고, 상한은 10초로 해.
끝나면 서버를 껐다 켰을 때 무슨 일이 일어나는지 순서대로 설명해 줘.`,
    more: {
      title: "할 일",
      items: [
        "L5 서버: 30초마다 ping, pong 이 없던 소켓은 정리 (heartbeat)",
        "L5 위젯, 어드민: 끊기면 0.5초, 1초, 2초 ... 최대 10초로 늘려 가며 다시 붙기 + jitter. 다시 붙으면 history, snapshot 으로 복구",
        "L5 위젯: 닫혀 있을 때 상담원 답장이 오면 런처에 안 읽은 수 배지",
        "L6 멤버 해시: 고객사 서버 /member-hash 가 HMAC-SHA256(비밀키, memberId) 를 만들고, boot 와 hello 로 넘기고, 채팅 서버가 같은 키로 다시 계산해 비교",
        "L6 이미지: POST /api/upload 로 올리고 소켓에는 /uploads/... 주소만",
        "L6 입력 중 표시: typing 을 1.5초에 한 번만, 서버는 상대편에게만 전달",
      ],
      note: "비밀키는 .env 에만 둬요. host/, sdk/, widget/, admin/ 처럼 브라우저로 내려가는 파일에는 절대 쓰지 않아요.",
    },
    checks: [
      { text: "터미널에서 Ctrl+C 로 서버를 끄면 '다시 연결 중 n초', 다시 켜면 알아서 붙는다" },
      { text: "위젯을 닫아 둔 채 어드민에서 답장하면 런처에 숫자 배지가 튀어 오른다" },
      { text: "어드민 대화 머리에 '멤버 해시 검증됨'이 보인다" },
      { text: "localhost:3000/?hash=bad 로 들어가면 '사용자 확인 실패', 다시 붙지도 않는다" },
      { text: "사진을 보내면 양쪽에 보이고, 한쪽이 입력하면 다른 쪽에 점 세 개가 뜬다" },
    ],
    commit: `git add . && git commit -m "feat: reconnect, member hash, uploads, typing (L5-L6)"`,
    questions: [
      { id: "jitter", label: "재연결에 jitter 가 없으면 무슨 일이 생기나요?", hint: "서버가 다시 켜지는 순간, 학회원 100명의 위젯이 동시에" },
      { id: "origin", label: "서버가 Origin 을 확인하는데도 멤버 해시가 또 필요한 이유" },
    ],
    chips: ["정상인데도 계속 사용자 확인 실패가 떠요", "서버가 RangeError 로 죽어요", "업로드가 계속 415 예요"],
  },
  {
    id: "lt-wrap",
    label: "회고",
    start: "1:56",
    title: "다음 주 과제로 가져갈 것",
    lead: "두 줄만 쓰고, 아래에서 레포 주소와 어디까지 했는지 제출해 주세요. 다음 주 수요일에 래티스와 과제를 시작할 때 오늘 만든 게 출발점이 돼요.",
    todo: [{ label: "끝난 데까지 올리기", cmd: "ltPush" }],
    checks: [],
    questions: [
      { id: "close", label: "연결이 끊기면 내 위젯에서 무슨 일이 일어나나요?", hint: "npm run dev 를 Ctrl+C 로 껐다가 다시 켜 보고 위젯 상태를 봐요" },
      { id: "task", label: "다음 주 과제에서 팀이 코드보다 먼저 정해야 할 것 하나", hint: "어드민 파트와 SDK 파트로 나눈다면 둘 사이에 무엇을 먼저 합의해야 할까요" },
    ],
    chips: [],
    summary: true,
  },
];

export const LT_ASSIGNMENT = {
  due: "11/11(수) 과제 시작 전까지",
  items: [
    { t: "L4까지 끝내기", d: "위젯에서 보낸 말이 어드민에, 답장이 위젯에 바로 뜨는 데까지. 막히면 튜터나 개발팀에게 물어봐요" },
    { t: "L5 끊겨도 산다", d: "서버를 껐다 켜도 알아서 다시 붙고, 닫힌 위젯에 안 읽은 배지가 뜨게" },
    { t: "L6 하나 이상", d: "멤버 해시, 이미지 첨부, 입력 중 표시 중 하나. 과제의 선택 기능과 그대로 이어져요" },
  ],
  submit: "회고 단계에서 레포 주소와 어디까지 했는지를 제출하면 현황판에 떠요.",
};

// 튜터가 이 세션 화면(lt-*, lattice*)에서 쓰는 맥락. 캐시 블록 뒤(extra)에만 붙는다
export const LT_CONTEXT = `[이 화면은 Session 8이 아니라 "기업 과제 사전 세션"(2026-11-04, 2시간)이다]
래티스(Enterprise AI 회사)가 NEXT에 낸 기업 과제는 "웹 서비스 채팅 시스템(채널톡과 같은 형태)"이다. 필수: SDK 형태로 운영 중인 서비스에 심어 채팅 화면을 띄우고 사용자 정보를 설정, 사용자는 피드백을 보내고 관리자는 목록을 본다. 선택: 실시간 채팅(이미지 첨부 포함), 관리자 답변이 사용자에게 바로 나타남. 일정 11/11(수) 시작, 11/18(수) 발표. 여러 팀이면 어드민 파트와 SDK 채팅 파트로 나눠도 된다.
래티스가 미리 익히라고 한 것: 스크립트 한 줄로 심는 SDK 구조(임베드 스크립트, iframe 또는 위젯), 여력이 되면 WebSocket.
위 Session 8 자료(PRD 메이커, OpenAI, Supabase specs)는 이 화면 질문의 정답으로 쓰지 않는다.

실습 저장소 next-chat-sdk-lab (Node 20+, 빌드 없음, 의존성 ws 하나, vanilla JS). main 이 스타터: 화면과 디자인은 완성, 동작은 TODO [L1]~[L6]. npm run dev 하나로 두 서버:
- :3000 host/ 고객사 굿즈샵. head 의 스니펫이 NextChat 대기열 함수(q 에 arguments 를 쌓음)를 만들고 http://localhost:4000/sdk/loader.js 를 async 로 부른 뒤 NextChat('boot', { pluginKey, member: { id: 'u_1024', name: '김고대' } }). ?member=u_2048&name=이호랑 으로 다른 사용자, ?hash=bad 로 위조 해시 시험. :3000 서버에는 L6 의 GET /member-hash?id= 가 있다.
- :4000 sdk/loader.js(고객사 DOM 에서 실행, 런처와 iframe), widget/(iframe 안 상담 화면, 대화 탭 + 피드백 탭), admin/(NEXT Desk 상담원 화면, 대화 목록 + 피드백 탭), shared/tokens.css(디자인 토큰), server/index.js(HTTP API + ws://localhost:4000/ws). /widget/ 응답에 Content-Security-Policy: frame-ancestors http://localhost:3000.
- 규칙 파일: AGENTS.md(CLAUDE.md 가 불러옴), DESIGN.md, docs/PROTOCOL.md(메시지 계약서), docs/MISSIONS.md(레벨별 할 일과 확인).
레벨: L1(8분) loader.js mount(런처 버튼 .nc-launcher + iframe.nc-frame, sandbox 'allow-scripts allow-same-origin allow-forms allow-popups') + 맨 아래 queued 재생 NextChat.apply(null, queued[i]). L2(8분) loader post()(ready 전에는 outbox), message 리스너(e.origin === WIDGET_ORIGIN, e.source === iframe.contentWindow, data.source === 'next-chat'; ready/close/unread), boot 에서 post('boot', ...). 위젯 toParent(parentOrigin 으로), message 리스너(ALLOWED_PARENTS, e.source === window.parent; boot -> onBoot, visibility -> onVisibility). L3(7분) 서버 POST /api/feedback(readBody, JSON.parse, 깨지면 400 bad_json, text 1~1000자 아니면 400 text_length, 201 { feedback }), GET /api/feedback(200 { items }). 위젯 fetch POST + showResult(status). 어드민 loadFeedbacks(GET). 위젯과 서버가 같은 origin(:4000)이라 CORS 불필요. L4(12분) 서버 hello(user: 방 찾기, sockets 추가, ws.role/ws.roomId 기록, history 전송, 어드민에 room) / hello(admin: snapshot) / message(사용자는 ws.roomId, 어드민은 msg.roomId, from 은 ws.role, broadcast) / close 정리. 위젯 connect(open 에서 hello), onServer(history 는 replaceChildren 후 render, message 는 clientId 로 pending 확인), 낙관적 렌더링. 어드민 connect, onServer(snapshot, room, message, typing, feedback), 답장. L5 서버 heartbeat(ws.isAlive, pong, 30초 ping/terminate), 위젯·어드민 onClose 지수 백오프 + jitter(min(10초, 0.5초*2^retry), delay = base/2 + random*base/2), 위젯 countUnread/resetUnread -> unread 편지 -> 런처 배지, online 이벤트 즉시 재연결. L6 /member-hash(HMAC-SHA256 hex), host 가 fetch 후 boot 에 memberHash, 위젯 hello 에 memberHash, 서버가 crypto.timingSafeEqual 로 비교(길이 먼저), 틀리면 { type: 'error', code: 'bad_member_hash' } + close(4001), 위젯은 4001 이면 재연결 안 함. 이미지 POST /api/upload(image/* 아니면 415, 2MB 넘으면 413, 201 { url: '/uploads/<id>' }) 후 소켓에 image 로 URL 만, 서버는 '/uploads/' 로 시작하는 것만 받음. typing 은 1.5초에 한 번, 서버는 상대편에게만.
자주 막히는 곳 (크롬 실제 문구): iframe 이 하얗고 콘솔에 "Framing 'http://localhost:4000/' violates the following Content Security Policy directive: "frame-ancestors http://localhost:3000". The request has been blocked." = localhost:3000 이 아닌 주소(127.0.0.1 등)로 열었다. 노란 경고 "Failed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://localhost:4000') does not match the recipient window's origin ('http://localhost:3000')." = iframe 이 아직 로딩 중일 때 보냈다(ready/outbox 누락). "[NextChat] unknown command" = arguments 를 apply 없이 넘겼다. 소켓 401("WebSocket connection to 'ws://localhost:4000/ws' failed") = Origin 이 4000 이 아니다(sandbox 에서 allow-same-origin 을 빼면 Origin 이 null 로 간다, 127.0.0.1 접속). "net::ERR_CONNECTION_REFUSED" = 서버가 꺼졌다. 항상 400 bad_json = JSON.stringify 나 Content-Type 누락. "Unexpected token '<'" = JSON 대신 HTML 이 왔다(경로 오타). 메시지 두 번 = clientId 로 pending 을 안 걸렀다. 30초마다 모두 끊김 = heartbeat 에서 ws.isAlive 초기화 누락. "RangeError [ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH]" = 길이 비교 없이 timingSafeEqual. 업로드 415 = FormData 로 보냈다(파일을 body 로 그대로). 위젯 쪽 콘솔은 Console 상단 top 드롭다운에서 iframe 선택. WS 프레임은 Network > WS > Messages.
개념 요약: origin = 프로토콜+호스트+포트. 다른 origin 이면 부모와 iframe 이 서로의 DOM 에 못 닿는다(contentWindow.document 는 SecurityError, contentDocument 는 null). 열린 창구는 postMessage 하나, 데이터는 structured clone 이라 함수와 DOM 노드는 못 보낸다(DataCloneError). sandbox 에서 allow-same-origin 을 빼면 불투명 origin 이 되고 쿠키·저장소가 막힐 수 있다. 써드파티 쿠키는 사파리가 기본 차단, 크롬은 기본 허용(2025년에 폐지 계획을 거둠). WebSocket 은 HTTP GET + Upgrade 로 시작해 101 Switching Protocols 이후 같은 TCP 연결에서 프레임을 주고받는다. 브라우저만 Origin 헤더를 정직하게 보낸다. 브라우저가 아닌 프로그램은 아무 Origin 이나 보낼 수 있어서 Origin 확인은 인증이 아니다. 그래서 멤버 해시. 연결은 끊긴다는 전제로 재연결과 heartbeat 를 둔다. 피드백(필수)은 HTTP 로 충분, 실시간(선택)이 WebSocket.
튜터 태도: TODO 를 통째로 채운 정답 코드는 주지 않는다. 어느 파일의 어느 TODO, PROTOCOL.md 의 어떤 type 을 보라고 짚는다. 에러는 위 실제 문구부터 맞춰 본다. 에이전트에게는 레벨 하나, 파일 범위, 설명 요구를 같이 시키라고 안내한다. 에이전트가 틀렸다는 신호(지어낸 type, '*' targetOrigin, 클라이언트 roomId 신뢰, 에러 삼키기, 비밀키를 브라우저 파일에 씀)를 알려 준다.`;

export const LT_FOCUS: Record<string, string> = {
  "lt-setup": "확인 포인트: 포트가 다르면 origin 이 다르다는 걸 자기 말로 말하는지. 3000 은 고객사, 4000 은 우리 서비스라는 역할 구분이 되는지.",
  "lt-l1": "정답 방향: 스니펫이 만든 가짜 NextChat 이 호출을 q 에 쌓아 두고, loader.js 가 도착하면 진짜 함수로 바꾼 뒤 쌓인 호출을 순서대로 재생한다(택배 보관함). CSS 질문은 iframe 안은 다른 문서라 고객사 CSS 가 안 들어간다가 정답. 자기 코드의 실제 줄과 연결했는지 본다.",
  "lt-l2": "정답 방향: '*' 면 iframe 이 다른 페이지로 이동해도 사용자 정보가 그대로 배달된다. ready 를 기다리는 이유는 iframe 이 아직 about:blank(부모와 같은 origin)일 때 보낸 편지는 targetOrigin 이 안 맞아 버려지기 때문. 가짜 boot 는 위젯이 첫 boot 만 받아서 무시되지만, 고객사 페이지 위의 코드가 먼저 다른 id 로 boot 하는 건 못 막는다(L6 멤버 해시).",
  "lt-l3": "정답 방향: 201 은 새로 만들어졌다, 200 은 그냥 성공. 위젯은 서버와 같은 origin(:4000)이라 CORS 가 필요 없고, 굿즈샵(:3000)에서 :4000 으로 fetch 하면 다른 origin 이라 서버가 Access-Control-Allow-Origin 을 줘야 한다.",
  "lt-l4": "정답 방향: widget.js 폼 submit -> ws.send(message) -> server/index.js message 처리(방 찾기, 메시지 만들기, room.messages 저장) -> broadcast -> admin.js onServer message -> appendBubble. from/roomId 를 소켓에서 꺼내는 이유는 클라이언트가 보낸 값을 믿으면 남의 방에 쓰거나 상담원인 척할 수 있어서.",
  "lt-stretch": "정답 방향: jitter 가 없으면 서버가 다시 켜지는 순간 모든 클라이언트가 같은 박자로 몰려 서버가 또 쓰러진다. Origin 은 브라우저만 지키는 헤더라 인증이 아니고, 고객사 페이지 위의 코드는 origin 이 같아서 막을 수 없다. 비밀키 없이는 맞는 해시를 못 만드는 멤버 해시가 사용자 확인을 한다.",
  "lt-wrap": "회고. 끊김 질문은 close 이벤트, 입력창 비활성화, 백오프 재연결, 다시 붙으면 history 로 대화 복구까지 말하면 충분. 과제 질문은 메시지 규칙 표(PROTOCOL.md)와 API 모양을 먼저 정한다는 방향이면 좋다.",
};
