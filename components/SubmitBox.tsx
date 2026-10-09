"use client";

import { useState } from "react";
import { boardPayload, postBoard } from "./board";
import { useToast } from "./ui";
import type { Patch, Store } from "./store";

// 회고 단계: GitHub 레포와 배포 링크를 제출 현황판에 올린다. 배포 링크는 과제(10/26)라 나중에 다시 와서 넣어도 된다
export default function SubmitBox({ s, patch, go }: { s: Store; patch: Patch; go: (id: string) => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const repo = s.links.repo || s.ans.setup?.repo || "";

  const setLink = (k: "repo" | "deploy", v: string) => patch((st) => ({ ...st, links: { ...st.links, repo: st.links.repo || st.ans.setup?.repo || "", [k]: v } }));

  const submit = async () => {
    if (!repo.trim() && !s.links.deploy.trim()) {
      setErr("레포나 배포 링크 중 하나는 적어 주세요");
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
        <label htmlFor="sub-repo">GitHub 레포</label>
        <div className="hint">준비 단계에서 적었다면 이미 채워져 있어요</div>
        <input id="sub-repo" className="field mono" value={repo} onChange={(e) => setLink("repo", e.target.value)} placeholder="https://github.com/아이디/prd-maker" autoComplete="off" />
      </div>
      <div className="q">
        <label htmlFor="sub-deploy">Vercel 배포 링크</label>
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
