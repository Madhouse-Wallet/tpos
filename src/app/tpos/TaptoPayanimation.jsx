// import Lottie from "lottie-react";

// const LottieComponent = ({ animation }) => {
//   return (
//     <div className="" style={{ height: 600, width: 600 }}>
//       <Lottie animationData={animation} loop={true} />
//     </div>
//   );
// };

// export default LottieComponent;

import React, { useEffect, useRef } from "react";
import Lottie from "lottie-react";

const LottieComponent = ({ animation, onInputReceived, onClose }) => {
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const inputTimeoutRef = useRef(null); // NEW: for 5-second inactivity timeout
  const lastInputValueRef = useRef(""); // Track the latest value

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    timeoutRef.current = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 20000); // 20s modal timeout

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(inputTimeoutRef.current); // Clear input timeout on unmount
    };
  }, [onClose]);

  const triggerInputReceived = () => {
    const value = lastInputValueRef.current.trim();
    if (value.length > 0 && onInputReceived) {
      onInputReceived(value);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    lastInputValueRef.current = value;

    // Clear and reset the 5-second inactivity timer
    clearTimeout(inputTimeoutRef.current);
    inputTimeoutRef.current = setTimeout(triggerInputReceived, 5000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      clearTimeout(inputTimeoutRef.current);
      triggerInputReceived();
    }
  };

  return (
    <div className="relative" style={{ height: 600, width: 600 }}>
      <Lottie animationData={animation} loop={true} />

      <input
        ref={inputRef}
        type="text"
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Scan or type Ethereum address"
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer bg-transparent border-none outline-none text-transparent"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          zIndex: 10,
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          color: "transparent",
        }}
        autoFocus
      />

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
        Listening for input... (20s timeout)
      </div>
    </div>
  );
};

export default LottieComponent;
