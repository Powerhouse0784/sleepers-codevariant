"use client";
import { Sun } from "lucide-react";
import { City } from "../ideas/IdeasHero";

/** Heading on a code-drawn night city; the bee scene on the right is the supplied artwork. */
export default function PeopleHero() {
  return (
    <section aria-labelledby="people-hero" className="relative isolate min-h-[170px] overflow-hidden rounded-[20px] border border-[#2a4fb8]/50 text-white sm:min-h-[190px]"
      style={{ background: "radial-gradient(520px 240px at 40% 110%, rgba(255,140,90,.45), transparent 70%), radial-gradient(420px 260px at 10% -10%, rgba(130,80,255,.55), transparent 70%), linear-gradient(100deg,#0b1245 0%,#241a7a 50%,#3d2a8f 100%)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/people/hero-bee.webp" alt="" width={471} height={156} className="absolute inset-y-0 right-0 h-full w-auto max-w-none select-none opacity-60 sm:opacity-100" draggable={false}
        style={{ maskImage: "linear-gradient(90deg,transparent,#000 30%)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 30%)" }} />
      <City />
      <div className="relative z-10 flex min-h-[170px] max-w-[66%] flex-col justify-center p-6 sm:min-h-[190px] sm:max-w-[58%] md:px-8">
        <h1 id="people-hero" className="script flex flex-wrap items-center gap-x-3 text-[32px] leading-[1.05] sm:text-[42px] xl:text-[50px]">Meet Amazing People
          <Sun size={30} className="hidden text-[#FFC629] drop-shadow-[0_0_12px_rgba(255,198,41,.9)] sm:block" aria-hidden /></h1>
        <p className="mt-2.5 max-w-[420px] text-[13px] leading-relaxed text-white/90 sm:text-[15px]">Connect, collaborate, and grow with a community of dreamers, creators, and doers!</p>
      </div>
    </section>
  );
}
