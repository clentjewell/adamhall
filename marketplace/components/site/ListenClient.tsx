"use client";

import { useState } from "react";
import GreenHero from "./GreenHero";
import AudioPlayer from "./AudioPlayer";
import FaqSection from "./FaqSection";
import PurpleCta from "./PurpleCta";
import { useReveal } from "./useReveal";
import { episodes } from "@/lib/site-data/episodes";

const PAGE_SIZE = 10;

export default function ListenClient() {
  const [shown, setShown] = useState(PAGE_SIZE);
  useReveal([shown]);
  const visible = episodes.slice(0, shown);

  return (
    <div className="ah-site">
      <GreenHero
        title={
          <>
            What&rsquo;s You <span className="wavy">Car Worth</span>
          </>
        }
        subtitle="Adam Hall has been serving the community for almost three decades."
      />

      <section className="section bg-cream">
        <div className="container container--wide listen">
          <div className="listen__side">
            <h3 className="listen__title reveal-left">
              Latest <span className="wavy">Programs</span>
            </h3>
          </div>
          <div className="listen__main">
            <div className="listen__list">
              {visible.map((ep) => (
                <AudioPlayer key={ep.id} episode={ep} />
              ))}
            </div>
            {shown < episodes.length && (
              <div className="listen__more">
                <button
                  type="button"
                  className="btn btn--green"
                  onClick={() =>
                    setShown((s) => Math.min(s + PAGE_SIZE, episodes.length))
                  }
                >
                  Load more programs
                </button>
                <p className="listen__count">
                  Showing {visible.length} of {episodes.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <FaqSection />
      <PurpleCta />
    </div>
  );
}
