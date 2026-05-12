import React from "react";
import { useParams } from "react-router-dom";
import Carousel from "../components/Carousel";
import images from "../data/images.json";
import type { ImageProps } from "../utils/types";

const Photo = () => {
  const { photoId } = useParams();
  const index = Number(photoId);
  const currentPhoto = (images as ImageProps[]).find((img) => img.id === index);

  if (!currentPhoto) {
    return <div>Photo not found</div>;
  }

  return (
    <main className="mx-auto max-w-[1960px] p-4">
      <Carousel currentPhoto={currentPhoto} index={index} />
    </main>
  );
};

export default Photo;
