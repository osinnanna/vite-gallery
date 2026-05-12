import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Image from "../components/Image";
import Camera from "../components/Icons/Camera";
import images from "../data/images.json";
import content from "../data/content.json";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

const Home = () => {
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();
  const location = useLocation();

  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (lastViewedPhoto) {
      lastViewedPhotoRef.current?.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [lastViewedPhoto, setLastViewedPhoto]);

  return (
    <>
      <main className="mx-auto max-w-[1960px] p-4">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          <div className="after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="flex max-h-full max-w-full items-center justify-center">
                <Camera className="h-48 w-48" />
              </span>
              <span className="absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </div>
            <Camera className="h-24 w-24 mb-4" />
            <h1 className="mt-8 mb-4 text-base font-bold uppercase tracking-widest">
              {content.heroTitle}
            </h1>
            <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
              {content.heroDescription}
            </p>
            <a
              className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
              href={content.sourceCodeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code
            </a>
          </div>
          {images.map(({ id, url, blurDataUrl, width, height }) => (
            <Link
              key={id}
              to={`/p/${id}`}
              state={{ backgroundLocation: location }}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt={content.title}
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={url}
                width={width}
                height={height}
              />
            </Link>
          ))}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        <a
          href={content.footerLink}
          target="_blank"
          className="font-semibold hover:text-white"
          rel="noopener noreferrer"
        >
          {content.footerCredit}
        </a>
      </footer>
    </>
  );
};

export default Home;
