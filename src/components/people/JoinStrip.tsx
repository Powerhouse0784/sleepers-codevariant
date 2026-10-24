"use client";
import { ArrowRight } from "lucide-react";
import { PersonAvatar } from "./PersonBits";
import { byPoints, type Person } from "@/features/people/people";

export default function JoinStrip({ all, joined, onJoin }: { all: Person[]; joined: boolean; onJoin: () => void }) {
  const faces = byPoints(all.filter((p) => p.avatar)).slice(0, 6);
  return (
    <section className="relative isolate flex items-center gap-4 overflow-hidden rounded-2xl border border-line px-4 py-3 text-white md:pr-36" aria-labelledby="join-strip"
      style={{ background: "radial-gradient(420px 120px at 90% 100%, rgba(255,150,60,.25), transparent 70%), linear-gradient(100deg,#0a1440,#14206a 60%,#201a6f)" }}>
      <ul className="flex shrink-0 -space-x-2.5" aria-hidden>{faces.map((p, i) => <li key={p.id} style={{ zIndex: faces.length - i }}><PersonAvatar p={p} size={36} /></li>)}</ul>
      <div className="min-w-0 flex-1"><h2 id="join-strip" className="text-[16px] font-semibold leading-tight sm:text-[18px]">{joined ? "You're part of the community" : "Join our growing community"}</h2>
        <p className="mt-0.5 text-[11.5px] text-white/80 sm:text-[12.5px]">{joined ? "Keep your profile fresh so the right people find you." : "Be a part of 10,000+ creators, learners and innovators."}</p></div>
      <button onClick={onJoin} className="btn-gold relative z-10 inline-flex shrink-0 items-center gap-2 px-4 py-2 text-[13px]">{joined ? "Edit profile" : "Join Now"} <ArrowRight size={14} aria-hidden /></button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/people/join-bee.webp" alt="" width={119} height={55} className="absolute inset-y-0 right-0 -z-10 hidden h-full w-auto max-w-none opacity-90 md:block" draggable={false} style={{ maskImage: "linear-gradient(90deg,transparent,#000 40%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)" }} />
    </section>
  );
}
