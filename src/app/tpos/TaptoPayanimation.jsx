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

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Set timeout for 20 seconds
    timeoutRef.current = setTimeout(() => {
      console.log("Timeout reached, closing modal");
      if (onClose) {
        onClose();
      }
    }, 20000); // 20 seconds

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onClose]);

  const handleInputChange = (e) => {
    const value = e.target.value;

    // If input has value and Enter is pressed or after certain length
    if (value.trim().length > 0) {
      // Clear the timeout since we got input
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Call the callback with the input value
      if (onInputReceived) {
        onInputReceived(value);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value;
      if (value.trim().length > 0) {
        // Clear the timeout since we got input
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Call the callback with the input value
        if (onInputReceived) {
          onInputReceived(value);
        }
      }
    }
  };

  return (
    <div className="relative" style={{ height: 600, width: 600 }}>
      <Lottie animationData={animation} loop={true} />

      {/* Hidden input field that remains active */}
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

      {/* Optional: Add a subtle indicator that input is being listened for */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70">
        Listening for input... (20s timeout)
      </div>
    </div>
  );
};

export default LottieComponent;
