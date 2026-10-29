import React, { useMemo, useRef, useState } from "react";
// @ts-ignore CSS side-effect imports are resolved by the app's bundler.
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

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

// Prevent jump when dragging across -180/180 boundary
function shortestDeltaDeg(next: number, prev: number) {
  let d = next - prev;
  d = ((d + 180) % 360) - 180;
  return d;
}

export function RoadmapCircle({
  milestones,
}: {
  milestones: RoadmapMilestone[];
}) {
  const safe = milestones.length ? milestones : [];
  const [activeId, setActiveId] = useState(safe[0]?.id ?? "");
  const [rot, setRot] = useState(0);

  const dragging = useRef(false);
  const start = useRef<{ a: number; rot: number } | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(
    () => safe.find((m) => m.id === activeId) ?? safe[0],
    [activeId, safe],
  );

  const radius = 225;

  const angleForIndex = (i: number) => (360 / Math.max(1, safe.length)) * i;

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
    // If user is clicking a milestone button, do NOT start a drag.
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    dragging.current = true;
    const a = centerAngleFromPointer(e.clientX, e.clientY);
    start.current = { a, rot };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !start.current) return;
    const a = centerAngleFromPointer(e.clientX, e.clientY);
    const d = shortestDeltaDeg(a, start.current.a);
    setRot(start.current.rot + d);
  };

  const onPointerUp = () => {
    dragging.current = false;
    start.current = null;
  };

  const focusMilestone = (id: string, index: number) => {
    setActiveId(id);
    // Rotate so clicked node moves to a pleasant “reading” area (top-right-ish).
    const targetAngle = angleForIndex(index);
    setRot((prev) => prev + (-targetAngle + 320));
  };

  // Active node popover positioning (math, no DOM measuring)
  const activeIndex = Math.max(
    0,
    safe.findIndex((m) => m.id === activeId),
  );
  const activeAngle = angleForIndex(activeIndex);
  const theta = deg2rad(activeAngle + rot);
  const x = Math.cos(theta) * radius;
  const y = Math.sin(theta) * radius;

  // If node is in lower half (y > 0), popover goes ABOVE it; else BELOW it.
  const popY = y > 0 ? "calc(-100% - 14px)" : "14px";
  const arrowTop = y > 0 ? "100%" : "-6px";

  if (!safe.length) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-6 text-sm text-[color:var(--muted)]">
        No milestones configured.
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className="zekit-roadmap"
      style={{ ["--rot" as any]: `${rot}deg` }}>
      <div className="zekit-roadmap-ring" />

      {/* Ring layer: drag anywhere EXCEPT buttons */}
      <div
        className="zekit-roadmap-rotate"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
        aria-label="Roadmap ring (drag to rotate)">
        {safe.map((m, i) => {
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
                aria-label={`Roadmap milestone: ${m.title}`}
                title={m.title}>
                <div className="grid place-items-center">
                  <span className="zekit-roadmap-dot" />
                  <div className="zekit-roadmap-index">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* REVEAL: milestone popover anchored to the ACTIVE NODE */}
      <div
        className="zekit-roadmap-pop"
        style={
          {
            ["--popLeft" as any]: `calc(50% + ${x}px)`,
            ["--popTop" as any]: `calc(50% + ${y}px)`,
            ["--popY" as any]: popY,
            ["--arrowTop" as any]: arrowTop,
          } as React.CSSProperties
        }>
        <div className="zekit-roadmap-pill">
          <span>{active?.eyebrow}</span>
          <span>·</span>
          <span>{statusLabel(active?.status ?? "later")}</span>
        </div>
        <div className="zekit-roadmap-pop-title">{active?.title}</div>
        <div className="zekit-roadmap-pop-body">{active?.body}</div>
      </div>

      {/* Center “zoomed” milestone */}
      <div className="zekit-roadmap-center">
        <div className="zekit-roadmap-pill">
          <span>{active?.eyebrow}</span>
          <span>·</span>
          <span>{statusLabel(active?.status ?? "later")}</span>
        </div>

        <div className="zekit-roadmap-title">{active?.title}</div>
        <div className="zekit-roadmap-body">{active?.body}</div>

        <div className="zekit-roadmap-hint">
          Drag the ring to rotate · click a node to reveal it (popover) and
          focus it (center).
        </div>
      </div>
    </div>
  );
}
