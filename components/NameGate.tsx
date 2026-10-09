"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { ease } from "./ui";

// 처음 들어오면 본명부터 받는다. 이름을 적어야만 닫힌다 (제출 현황판에 그대로 쓰여서)
export default function NameGate({ onDone }: { onDone: (name: string) => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = v.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      setErr("본명을 두 글자 이상 적어 주세요");
      return;
    }
    onDone(name);
  };

  return (
    <motion.div className="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }}>
      <motion.form
        className="gate-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        onSubmit={submit}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.5, ease }}
      >
        <Image src="/next-logo-ink.png" alt="NEXT" width={407} height={96} className="gate-logo" priority />
        <h2 id="gate-title">이름부터 적어 주세요</h2>
        <p>꼭 본명으로 적어 주세요. 제출 현황판과 막힘 알림에 이 이름이 그대로 떠요.</p>
        <input
          autoFocus
          value={v}
          onChange={(e) => {
            setV(e.target.value);
            if (err) setErr("");
          }}
          placeholder="이름"
          maxLength={20}
          autoComplete="name"
          aria-label="본명"
          aria-invalid={!!err}
        />
        {err && <div className="gate-err">{err}</div>}
        <button type="submit" className="btn btn-ink">
          시작하기
        </button>
      </motion.form>
    </motion.div>
  );
}
