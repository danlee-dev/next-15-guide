"use client";

import { useState } from "react";
import { boardPayload, postBoard } from "./board";
import { useToast } from "./ui";
import { repoOf, type Patch, type Store } from "./store";

// 회고 단계: GitHub 레포(필수), 배포 링크, 과제로 추가한 기능을 제출 현황판에 올린다.
// 배포 링크와 기능은 과제(10/26)라 나중에 다시 와서 넣고 한 번 더 제출하면 된다

// "이런 걸 만들면 된다" 감을 잡게 보여 주는 예시. 그대로 베끼라는 게 아니라 크기와 쓰는 방식을 보여 준다
const FEATURE_EXAMPLES = [
  "생성된 PRD로 실제 화면 미리보기를 그려 주고, 화면을 보면서 기능을 빼거나 더하면 PRD가 다시 정리되는 기능",
  "만든 PRD를 깐깐한 CTO가 리뷰하는 버튼. 빠진 예외 상황과 위험한 부분을 짚고 점수를 매겨 줘요",
  "P0 기능마다 기획·디자인·개발 할 일을 나눠서 팀원별 체크리스트로 보여 주는 탭",
  "/specs/[id] 상세 페이지 + 노션에 바로 붙는 마크다운 복사 버튼",
];
export default function SubmitBox({ s, patch, go }: { s: Store; patch: Patch; go: (id: string) => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const repo = repoOf(s);

  // 처음 고칠 때 지금 보이는 레포 주소를 저장해 두고, 레포 칸을 고쳤다는 표시를 남긴다
  const setLink = (k: "repo" | "deploy" | "feature", v: string) =>
    patch((st) => ({ ...st, links: { ...st.links, repo: repoOf(st), repoEdited: st.links.repoEdited || k === "repo", [k]: v } }));

  const submit = async () => {
    if (!repo.trim()) {
      setErr("GitHub 레포 주소를 적어 주세요. 오늘 push한 레포예요");
      return;
    }
    if (!/github\.com\/[^/\s]+\/[^/\s]+/i.test(repo)) {
      setErr("https://github.com/아이디/prd-maker 처럼 레포 주소 전체를 붙여 주세요");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await postBoard(JSON.stringify(boardPayload(s, true)));
      patch((st) => ({ ...st, submittedAt: Date.now() }));
      toast("제출했어요. 제출 현황에 떴어요");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="submit">
      <div className="q">
        <label htmlFor="sub-repo">GitHub 레포 주소 (필수)</label>
        <div className="hint">오늘 push한 레포 페이지 주소예요. 준비 단계에서 적었다면 채워져 있어요. Private 레포면 다른 사람이 못 열어요</div>
        <input id="sub-repo" className="field mono" value={repo} onChange={(e) => setLink("repo", e.target.value)} placeholder="https://github.com/아이디/prd-maker" autoComplete="off" />
      </div>
      <div className="q">
        <label htmlFor="sub-feature">과제로 추가한 기능 (과제)</label>
        <div className="hint">Step 4 내 버전이나 P1으로 무엇을 넣었는지 한두 줄. 왜 넣었는지도 같이 쓰면 좋아요</div>
        <textarea
          id="sub-feature"
          className="field"
          rows={3}
          maxLength={400}
          value={s.links.feature || ""}
          onChange={(e) => setLink("feature", e.target.value)}
          placeholder="무엇을 만들었고, 쓰는 사람이 뭘 할 수 있게 됐는지"
        />
        <div className="feat-ex">
          <span>이런 식으로 적어요</span>
          <ul>
            {FEATURE_EXAMPLES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="q">
        <label htmlFor="sub-deploy">Vercel 배포 주소 (과제)</label>
        <div className="hint">과제예요 (10/26 월요일 세션 전까지). 배포하고 나서 다시 와서 넣고 한 번 더 제출하면 돼요</div>
        <input id="sub-deploy" className="field mono" value={s.links.deploy} onChange={(e) => setLink("deploy", e.target.value)} placeholder="https://prd-maker-아이디.vercel.app" autoComplete="off" />
      </div>
      {err && <p className="submit-err">{err}</p>}
      <div className="submit-row">
        <button type="button" className="btn btn-ink" disabled={busy} onClick={submit}>
          {busy ? "올리는 중..." : s.submittedAt ? "다시 제출하기" : "제출하기"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => go("board")}>
          제출 현황 보기
        </button>
      </div>
    </div>
  );
}
