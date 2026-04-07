"use client";

import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

export default function DocxViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    el.innerHTML = "";

    const load = async () => {
      try {
        const res = await fetch(url);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        await renderAsync(buffer, el, undefined, {
          className: "docx", // predictable root class
        });

        if (cancelled) return;

        // ✅ Force fullscreen-friendly layout
        const wrapper = el.querySelector(".docx-wrapper") as HTMLElement;
        if (wrapper) {
          wrapper.style.width = "100%";
          wrapper.style.maxWidth = "100%";
          wrapper.style.margin = "0";
          wrapper.style.padding = "24px";
          wrapper.style.display = "block";
          wrapper.style.background = "white";
          wrapper.style.boxShadow = "none";
        }

        // ✅ Make pages responsive
        el.querySelectorAll(".docx-page").forEach((page) => {
          const p = page as HTMLElement;
          p.style.width = "100%";
          p.style.maxWidth = "900px";
          p.style.margin = "0 auto 24px auto";
          p.style.boxShadow = "none";
        });

      } catch (err) {
        console.error("DOCX render error", err);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className="overflow-auto bg-black"
    />
  );
}
