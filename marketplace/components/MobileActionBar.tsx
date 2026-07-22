"use client";

import Link from "next/link";
import { Phone, ChatCircleText, CalendarCheck } from "@phosphor-icons/react";

export default function MobileActionBar({
  phoneHref,
  carId,
  sold,
}: {
  phoneHref: string;
  carId: string;
  sold: boolean;
}) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 pb-[env(safe-area-inset-bottom)]">
      {sold ? (
        <div className="p-3">
          <Link href="/cars" className="btn-primary w-full text-sm py-2.5">
            See what&apos;s still available
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 p-3">
          <a href={phoneHref} className="btn-secondary text-sm py-2.5">
            <Phone size={16} weight="bold" />
            Call
          </a>
          <a href="#enquire" className="btn-primary text-sm py-2.5" data-car-id={carId}>
            <ChatCircleText size={16} weight="bold" />
            Enquire
          </a>
          <a href="#testdrive" className="btn-secondary text-sm py-2.5">
            <CalendarCheck size={16} weight="bold" />
            Test drive
          </a>
        </div>
      )}
    </div>
  );
}
