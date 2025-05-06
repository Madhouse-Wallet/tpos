import { imageURl } from "@/utils/config";
import React from "react";

const Loader = () => {
  return (
    <>
      <div className="fixed top-0 left-0 h-full-w-full z-[9999]">

        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src={imageURl + "loading.webm"} type="video/webm" />
        </video>
      </div>
    </>
  );
};

export default Loader;
