import React, { useMemo, useRef, useState } from "react";
import "../styles/roadmap-circle.css";

export type RoadmapMilestone = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  status: "now" | "next" | "later";
};

function statusLabel(s: RoadmapMilestone["status"]) {
  if (s === "now") return "Now";
  if (s === "next") return "Next";
  return "Later";
}

export function RoadmapCircle({
  milestones,
}: {
  milestones: RoadmapMilestone[];
}) {
  const [activeId, setActiveId] = useState(milestones[0]?.id ?? "");
  const [rot, setRot] = useState(0);
  const dragging = useRef(false);
  const start = useRef<{ a: number; rot: number } | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(
    () => milestones.find((m) => m.id === activeId) ?? milestones[0],
    [activeId, milestones],
  );

  const radius = 210;

  const angleForIndex = (i: number) => (360 / milestones.length) * i;

  function centerAngleFromPointer(clientX: number, clientY: number) {
    const el = hostRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    const a = centerAngleFromPointer(e.clientX, e.clientY);
    start.current = { a, rot };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !start.current) return;
    const a = centerAngleFromPointer(e.clientX, e.clientY);
    const delta = a - start.current.a;
    setRot(start.current.rot + delta);
  };

  const onPointerUp = () => {
    dragging.current = false;
    start.current = null;
  };

  const focusMilestone = (id: string, index: number) => {
    setActiveId(id);
    // rotate so clicked node moves closer to top-right-ish (pleasant reading position)
    const targetAngle = angleForIndex(index);
    setRot((prev) => prev + (-targetAngle + 320));
  };

  return (
    <div
      ref={hostRef}
      className="zekit-roadmap"
      style={{ ["--rot" as any]: `${rot}deg` }}>
      <div className="zekit-roadmap-ring" />

      <div
        className="zekit-roadmap-rotate"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
        aria-label="Roadmap ring">
        {milestones.map((m, i) => {
          const angle = angleForIndex(i);
          const isActive = m.id === activeId;
          return (
            <div
              key={m.id}
              className="zekit-roadmap-node"
              style={
                {
                  ["--angle" as any]: `${angle}deg`,
                  ["--radius" as any]: `${radius}px`,
                  ["--rot" as any]: `${rot}deg`,
                } as React.CSSProperties
              }>
              <button
                type="button"
                className={`zekit-roadmap-dotbtn ${isActive ? "active" : ""}`}
                onClick={() => focusMilestone(m.id, i)}
                aria-label={`Roadmap milestone: ${m.title}`}>
                <span className="zekit-roadmap-dot" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Center details (zoom/focus target) */}
      <div className="zekit-roadmap-center">
        <div className="zekit-roadmap-pill">
          <span>{active?.eyebrow}</span>
          <span>·</span>
          <span>{statusLabel(active?.status ?? "later")}</span>
        </div>

        <div className="zekit-roadmap-title">{active?.title}</div>
        <div className="zekit-roadmap-body">{active?.body}</div>

        <div className="zekit-roadmap-hint">
          Drag to rotate · click a node to focus ·{" "}
          <span className="zekit-roadmap-kbd">active</span> expands in the
          center.
        </div>
      </div>
    </div>
  );
}
