import { CLUB2_ASSIGNMENT, CLUB2_STEPS, CLUB_ASSIGNMENT, CLUB_STEPS } from "./club";
import { ASSIGNMENT, STEPS, type Step } from "./content";

// 개발 세션과 소모임 회차 목록. 새로 열 때는 여기에 하나 추가한다.
// 단계 id 는 서로 겹치면 안 된다 (진행 기록이 단계 id 로 저장된다). Session 8 은 예전 주소(#setup, #board)를 그대로 쓴다.

// 회고 단계의 제출 칸. 세션마다 무엇을 받는지가 달라서 여기서 정한다
export type SubmitConfig = {
  repo: { label: string; hint: string; required: boolean; placeholder: string };
  link: { label: string; hint: string; placeholder: string; board: string }; // 두 번째 링크 (배포 주소 / PRD 링크)
  note: { label: string; hint: string; placeholder: string; required: boolean; examples: string[] }; // 한두 줄 설명
  repoAnswer?: { step: string; q: string }; // 레포 칸을 미리 채울 단계 답
  boardLead: string;
  stats: [string, string]; // 현황판 숫자 칸 이름 (레포, 두 번째 링크)
};

export type Session = {
  id: string; // 현황판 테이블의 session 값
  kind: "session" | "club";
  no: number;
  label: string; // 화면에 보이는 이름 (Session 8, NE:부자들 1회차)
  title: string;
  date: string; // YYYY-MM-DD
  dateLabel: string;
  length?: string;
  lead: string;
  page: string; // 개요 페이지 id
  boardPage: string; // 제출 현황 페이지 id
  prdPage?: string; // PRD 올리기·피드백 페이지 id (소모임 회차)
  steps: Step[];
  assignment?: typeof ASSIGNMENT;
  submit: SubmitConfig;
};

export const SESSIONS: Session[] = [
  {
    id: "s8",
    kind: "session",
    no: 8,
    label: "Session 8",
    title: "바이브 코딩으로 끝까지 만들기",
    date: "2026-10-10",
    dateLabel: "10/10(토)",
    length: "1시간",
    lead: "빈 폴더에서 Claude Code나 Codex로 PRD 메이커를 끝까지 만들어요. 버튼 하나를 누르면 어떤 코드가 어떤 순서로 도는지 말로 설명할 수 있게 되는 게 오늘 목표예요.",
    page: "session8",
    boardPage: "board",
    steps: STEPS,
    assignment: ASSIGNMENT,
    submit: {
      repo: { label: "GitHub 레포 주소 (필수)", hint: "오늘 push한 레포 페이지 주소예요. 준비 단계에서 적었다면 채워져 있어요. Private 레포면 다른 사람이 못 열어요", required: true, placeholder: "https://github.com/아이디/prd-maker" },
      link: { label: "Vercel 배포 주소 (과제)", hint: "과제예요 (10/26 월요일 세션 전까지). 배포하고 나서 다시 와서 넣고 한 번 더 제출하면 돼요", placeholder: "https://prd-maker-아이디.vercel.app", board: "배포" },
      note: {
        label: "과제로 추가한 기능 (과제)",
        hint: "Step 4 내 버전이나 P1으로 무엇을 넣었는지 한두 줄. 왜 넣었는지도 같이 쓰면 좋아요",
        placeholder: "무엇을 만들었고, 쓰는 사람이 뭘 할 수 있게 됐는지",
        required: false,
        examples: [
          "생성된 PRD로 실제 화면 미리보기를 그려 주고, 화면을 보면서 기능을 빼거나 더하면 PRD가 다시 정리되는 기능",
          "만든 PRD를 깐깐한 CTO가 리뷰하는 버튼. 빠진 예외 상황과 위험한 부분을 짚고 점수를 매겨 줘요",
          "P0 기능마다 기획·디자인·개발 할 일을 나눠서 팀원별 체크리스트로 보여 주는 탭",
          "/specs/[id] 상세 페이지 + 노션에 바로 붙는 마크다운 복사 버튼",
        ],
      },
      repoAnswer: { step: "setup", q: "repo" },
      boardLead: "이름을 적은 사람은 모두 여기에 떠요. 회고 단계에서 GitHub 레포, 배포 링크, 추가한 기능을 제출하면 바로 여기에 걸려요.",
      stats: ["레포 제출", "배포 링크"],
    },
  },
  {
    id: "nb1",
    kind: "club",
    no: 1,
    label: "NE:부자들 1회차",
    title: "아이템 고르고, 기획서 제출까지",
    date: "2026-10-13",
    dateLabel: "10/13(화)",
    lead: "만들 것을 하나 고르고, 레포와 규칙을 세팅하고, PRD와 사용자 흐름을 짠 다음 Figma MCP로 화면 초안을 그려 보고, 기획서(PRD.md)를 올려요. 오늘의 목표는 기획서 제출이에요. 운영진이 칸마다 피드백을 달아요. 대부분 혼자, 원하면 팀으로 해요.",
    page: "club1",
    boardPage: "club1-board",
    prdPage: "club1-prd",
    steps: CLUB_STEPS,
    assignment: CLUB_ASSIGNMENT,
    submit: {
      repo: { label: "레포 주소", hint: "오늘 만든 레포. Private이면 초대받은 사람만 열 수 있어요", required: false, placeholder: "https://github.com/아이디/프로젝트" },
      link: { label: "PRD 링크 (선택)", hint: "PRD 파일은 PRD 단계에서 올려요. 여기는 GitHub의 docs/PRD.md 주소나 노션 링크를 따로 걸고 싶을 때만", placeholder: "https://github.com/아이디/프로젝트/blob/main/docs/PRD.md", board: "PRD" },
      note: {
        label: "아이템 한 줄 (필수)",
        hint: "누가, 어떤 문제에, 얼마를 내나",
        placeholder: "예: 학생회 총무가 회비 정산 시간을 줄이려고 월 9,900원",
        required: true,
        examples: [
          "학생회 총무가 회비 미납자 확인과 정산 시간을 줄이려고 월 9,900원",
          "졸업 사진 촬영 동아리가 예약·입금 확인을 자동으로 하려고 건당 2,000원",
          "자취생 커뮤니티가 공동구매 인원 모집과 송금 확인을 하려고 건당 수수료 3%",
        ],
      },
      repoAnswer: { step: "nb-setup", q: "repo" },
      boardLead: "각자 고른 아이템과 PRD가 여기 모여요. 다음 모임에서는 기능 수가 아니라 내가 설명할 수 있게 된 것과 분석으로 바뀐 결정부터 이야기해요.",
      stats: ["레포", "PRD"],
    },
  },
  {
    id: "nb2",
    kind: "club",
    no: 2,
    label: "NE:부자들 2회차",
    title: "구조를 설명하고, 첫 기능까지",
    date: "",
    dateLabel: "다음 모임",
    lead: "기획서의 P0 하나가 버튼부터 DB까지 어떤 파일을 지나는지 내 말로 설명하고, 그 기능의 첫 조각을 여섯 칸 지시로 만들어요. AI가 만든 코드를 설명할 수 있게 되는 게 목표예요.",
    page: "club2",
    boardPage: "club2-board",
    steps: CLUB2_STEPS,
    assignment: CLUB2_ASSIGNMENT,
    submit: {
      repo: { label: "레포 주소", hint: "오늘 커밋한 레포. Private이면 초대받은 사람만 열 수 있어요", required: false, placeholder: "https://github.com/아이디/프로젝트" },
      link: { label: "배포 주소 (선택)", hint: "Vercel에 올렸으면", placeholder: "https://프로젝트.vercel.app", board: "배포" },
      note: {
        label: "오늘 만든 기능 한 줄 (필수)",
        hint: "무엇을 만들었고, 쓰는 사람이 무엇을 할 수 있게 됐나",
        placeholder: "예: 총무가 회원 목록을 올리면 미납자만 따로 보인다",
        required: true,
        examples: ["총무가 엑셀을 올리면 미납자만 골라 보여 주는 첫 화면", "예약 폼을 내면 Supabase에 저장되고 목록에 바로 뜨는 것까지"],
      },
      repoAnswer: { step: "nb-setup", q: "repo" },
      boardLead: "각자 만든 첫 기능이 여기 모여요. 다음 모임에서는 기능 수가 아니라 그 기능의 흐름을 설명할 수 있는지부터 봐요.",
      stats: ["레포", "배포"],
    },
  },
];

export const SESSION_IDS = SESSIONS.map((x) => x.id);

// 지금 열려 있는(가장 최근) 개발 세션. 소모임 회차는 따로 센다
export const CURRENT = [...SESSIONS].reverse().find((x) => x.kind === "session")!;
export const CLUB_SESSIONS = SESSIONS.filter((x) => x.kind === "club");

// 이 페이지가 어느 세션(회차) 안에 있나 (개요, 단계, 제출 현황). 자료·홈이면 null
export function sessionOf(page: string): Session | null {
  return SESSIONS.find((x) => x.page === page || x.boardPage === page || x.prdPage === page || x.steps.some((st) => st.id === page)) || null;
}

export const sessionById = (id: string) => SESSIONS.find((x) => x.id === id) || null;
