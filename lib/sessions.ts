import { ASSIGNMENT, STEPS, type Step } from "./content";

// 개발 세션 목록. 새 세션을 열 때는 여기에 하나 추가한다.
// 단계 id 는 세션끼리 겹치면 안 된다 (진행 기록이 단계 id 로 저장된다). Session 8 은 예전 주소(#setup, #board)를 그대로 쓴다.
export type Session = {
  id: string; // 현황판 테이블의 session 값
  no: number;
  title: string;
  date: string; // YYYY-MM-DD
  dateLabel: string;
  length: string;
  lead: string;
  page: string; // 세션 개요 페이지 id
  boardPage: string; // 제출 현황 페이지 id
  steps: Step[];
  assignment?: typeof ASSIGNMENT;
};

export const SESSIONS: Session[] = [
  {
    id: "s8",
    no: 8,
    title: "바이브 코딩으로 끝까지 만들기",
    date: "2026-10-10",
    dateLabel: "10/10(토)",
    length: "1시간",
    lead: "빈 폴더에서 Claude Code나 Codex로 PRD 메이커를 끝까지 만들어요. 버튼 하나를 누르면 어떤 코드가 어떤 순서로 도는지 말로 설명할 수 있게 되는 게 오늘 목표예요.",
    page: "session8",
    boardPage: "board",
    steps: STEPS,
    assignment: ASSIGNMENT,
  },
];

export const SESSION_IDS = SESSIONS.map((x) => x.id);

// 지금 열려 있는(가장 최근) 세션. 상단 "제출 현황"과 첫 화면 강조에 쓴다
export const CURRENT = SESSIONS[SESSIONS.length - 1];

// 이 페이지가 어느 세션 안에 있나 (개요, 단계, 제출 현황). 자료·홈이면 null
export function sessionOf(page: string): Session | null {
  return SESSIONS.find((x) => x.page === page || x.boardPage === page || x.steps.some((st) => st.id === page)) || null;
}

export const sessionById = (id: string) => SESSIONS.find((x) => x.id === id) || null;
