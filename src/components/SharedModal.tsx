import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "./Image";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { variants } from "../utils/animationVariants";
import downloadPhoto from "../utils/downloadPhoto";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";
import Twitter from "./Icons/Twitter";

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false);

  let filteredImages = images?.filter((img: ImageProps) =>
    range(index - 15, index + 15).includes(img.id),
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (index < (images?.length || 0) - 1) {
        changePhotoId(index + 1);
      }
    },
    onSwipedRight: () => {
      if (index > 0) {
        changePhotoId(index - 1);
      }
    },
    trackMouse: true,
  });

  let currentImage = images ? images[index] : currentPhoto;

  return (
    <MotionConfig
      transition={{
        x: { type: "spring", stiffness: 400, damping: 40 },
        opacity: { duration: 0.15 },
      }}
    >
      <div
        className="relative z-50 flex h-full w-full max-w-7xl flex-col items-center justify-center"
        {...handlers}
      >
        {/* Main image area */}
        <div className="relative flex w-full flex-1 items-center justify-center">
          {/* Navigation and Actions - Positioned at the edges of the 7xl container */}
          <div className="absolute inset-0 z-50 pointer-events-none">
            {loaded && (
              <div className="relative h-full w-full">
                {navigation && (
                  <>
                    {index > 0 && (
                      <button
                        className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                        onClick={() => changePhotoId(index - 1)}
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                    )}
                    {images && index + 1 < images.length && (
                      <button
                        className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                        onClick={() => changePhotoId(index + 1)}
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    )}
                  </>
                )}
                <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-3 text-white">
                  {navigation ? (
                    <a
                      href={currentImage.url}
                      className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                      target="_blank"
                      title="Open fullsize version"
                      rel="noreferrer"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    </a>
                  ) : (
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20pic%20from%20Next.js%20Conf!%0A%0Ahttps://nextjsconf-pics.vercel.app/p/${index}`}
                      className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                      target="_blank"
                      title="Open fullsize version"
                      rel="noreferrer"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  <button
                    onClick={() =>
                      downloadPhoto(currentImage.url, `${index}.jpg`)
                    }
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    title="Download fullsize version"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-3 text-white">
                  <button
                    onClick={() => closeModal()}
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                  >
                    {navigation ? (
                      <XMarkIcon className="h-5 w-5" />
                    ) : (
                      <ArrowUturnLeftIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="flex h-[75vh] w-full items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute flex h-full w-full items-center justify-center"
              >
                <Image
                  src={currentImage.url}
                  width={currentImage.width}
                  height={currentImage.height}
                  alt={currentImage.name || "Gallery image"}
                  onLoad={() => setLoaded(true)}
                  objectFit="contain"
                  className="max-h-full w-auto"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-28 w-full" />

        {/* Bottom Nav bar */}
        {navigation && images && (
          <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
            <div className="mx-auto mt-6 mb-6 flex h-14 justify-center">
              <div className="flex gap-2">
                <AnimatePresence initial={false}>
                  {filteredImages.map(({ url, id }) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: id === index ? 1.2 : 1,
                        zIndex: id === index ? 20 : 10,
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => changePhotoId(id)}
                      key={id}
                      className={`${
                        id === index
                          ? "rounded-md shadow-lg shadow-black/50 ring-2 ring-white/50"
                          : "rounded-sm brightness-50 contrast-125 hover:brightness-75"
                      } relative h-full w-20 shrink-0 transform-gpu overflow-hidden transition focus:outline-none`}
                    >
                      <Image
                        alt="small photos on the bottom"
                        width={180}
                        height={120}
                        className="h-full w-full object-cover"
                        src={url}
                      />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
