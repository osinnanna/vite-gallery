import React, { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  blurDataURL?: string;
  placeholder?: "blur" | "empty";
  objectFit?: "cover" | "contain";
}

/**
 * Custom Image Component
 * 
 * Replicates 'next/image' behavior in a standard React environment:
 * - Supports 'blur-up' loading using a low-res base64 placeholder.
 * - Maintains aspect ratio to prevent layout shifts.
 * - Uses native lazy loading.
 */
const Image = ({
  src,
  alt,
  width,
  height,
  blurDataURL,
  placeholder,
  className,
  style,
  onLoad,
  objectFit = "cover",
  ...props
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (onLoad) onLoad(event);
  };

  const isBlur = placeholder === "blur" && blurDataURL;

  return (
    <div
      className={`relative overflow-hidden ${className || ""}`}
      style={{
        ...style,
        aspectRatio: width && height ? `${width} / ${height}` : "auto",
      }}
    >
      {isBlur && !loaded && (
        <img
          src={blurDataURL}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        loading="lazy"
        className={`transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${isBlur ? "absolute inset-0" : ""} w-full h-full ${
          objectFit === "cover" ? "object-cover" : "object-contain"
        }`}
        {...props}
      />
    </div>
  );
};

export default Image;
