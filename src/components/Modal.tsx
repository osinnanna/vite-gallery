import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import SharedModal from "./SharedModal";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

export default function Modal({
  images,
}: {
  images: ImageProps[];
}) {
  let overlayRef = useRef();
  const navigate = useNavigate();
  const { photoId } = useParams();
  const [, setLastViewedPhoto] = useLastViewedPhoto();
  
  let index = Number(photoId);

  const [direction, setDirection] = useState(0);
  const [curIndex, setCurIndex] = useState(index);

  function handleClose() {
    setLastViewedPhoto(curIndex);
    navigate("/");
  }

  function changePhotoId(newVal: number) {
    if (newVal > curIndex) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
    setCurIndex(newVal);
    // Use { replace: true } so back button goes to Gallery, not previous Modal image
    navigate(`/p/${newVal}`, { replace: true, state: { backgroundLocation: { pathname: "/" } } });
  }

  useKeypress("ArrowRight", () => {
    if (curIndex + 1 < images.length) {
      changePhotoId(curIndex + 1);
    }
  });

  useKeypress("ArrowLeft", () => {
    if (curIndex > 0) {
      changePhotoId(curIndex - 1);
    }
  });

  return (
    <Dialog
      static
      open={true}
      onClose={handleClose}
      initialFocus={overlayRef}
      className="fixed inset-0 z-10 flex items-center justify-center"
    >
      <Dialog.Overlay
        ref={overlayRef}
        as={motion.div}
        key="backdrop"
        className="fixed inset-0 z-30 bg-black/70 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <SharedModal
        index={curIndex}
        direction={direction}
        images={images}
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        navigation={true}
      />
    </Dialog>
  );
}
