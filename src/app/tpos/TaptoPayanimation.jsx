import Lottie from "lottie-react";

const LottieComponent = ({ animation }) => {
  return (
    <div className="" style={{ height: 600, width: 600 }}>
      <Lottie animationData={animation} loop={true} />
    </div>
  );
};

export default LottieComponent;
