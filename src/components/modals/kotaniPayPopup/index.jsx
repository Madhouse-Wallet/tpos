import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { fundTrnsfer } from "../../../services/apiService";

const oxanium = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // pick what you need
  variable: "--font-oxanium", // optional if using as a CSS variable
});

const KotanipayPayPopup = ({
  katoniPaymentPop,
  setKatoniPaymentPop,
  referenceId,
}) => {
  console.log("referenceId", referenceId);
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const socketRef = useRef(null);


 
  const handlePaymentPop = () => {
    setKatoniPaymentPop(!katoniPaymentPop);
  };

  const formatCurrency = (value) => {
    const cents = value.padStart(3, "0"); // ensure at least 3 digits
    const dollars = cents.slice(0, -2);
    const decimal = cents.slice(-2);
    return `$${parseInt(dollars, 10)}.${decimal}`;
  };

  // const handleCopyInvoice = async () => {
  //   try {
  //     console.log("applePayLink", applePayLink);
  //     await navigator.clipboard.writeText(applePayLink || "");
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000); // reset after 2s
  //   } catch (err) {
  //     console.error("Failed to copy invoice:", err);
  //   }
  // };

  return (
    <>
      <div
        className={`${oxanium.className} fixed inset-0 flex items-center justify-center px-3 cstmModal z-[9999]`}
      >
        <div
          onClick={handlePaymentPop}
          className="absolute inset-0 backdrop-blur-xl"
        />
        <div className="modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-[20px] z-10 overflow-scroll border border-[#dddddd21] bg-[#00000099] no-scrollbar max-w-[500px]">
          <button
            onClick={() => setKatoniPaymentPop(!katoniPaymentPop)}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
          // style={{ border: "1px solid #5f5f5f59" }}
          >
            {crossIcn}
          </button>
          <button
            onClick={() => setKatoniPaymentPop(!katoniPaymentPop)}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
          // style={{ border: "1px solid #5f5f5f59" }}
          >
            {crossIcn}
          </button>
          { (
            <>
              <div className="p-[30px]  rounded-xl bg-[#90ad9429]">
                <div className="flex items-center justify-center">
                  {tickIcn}
                </div>
                <div className="text-center text-3xl font-medium py-3">
                  {"Done"}
                </div>
              </div>
            </>
          ) }
        </div>
      </div>
    </>
  );
};

export default KotanipayPayPopup;

const crossIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 15"
    fill="none"
  >
    <g clipPath="url(#clip0_0_6282)">
      <path
        d="M1.98638 14.906C1.61862 14.9274 1.25695 14.8052 0.97762 14.565C0.426731 14.0109 0.426731 13.1159 0.97762 12.5617L13.0403 0.498994C13.6133 -0.0371562 14.5123 -0.00735193 15.0485 0.565621C15.5333 1.08376 15.5616 1.88015 15.1147 2.43132L2.98092 14.565C2.70519 14.8017 2.34932 14.9237 1.98638 14.906Z"
        fill="var(--textColor)"
      ></path>
      <path
        d="M14.0347 14.9061C13.662 14.9045 13.3047 14.7565 13.0401 14.4941L0.977383 2.4313C0.467013 1.83531 0.536401 0.938371 1.13239 0.427954C1.66433 -0.0275797 2.44884 -0.0275797 2.98073 0.427954L15.1145 12.4907C15.6873 13.027 15.7169 13.9261 15.1806 14.4989C15.1593 14.5217 15.1372 14.5437 15.1145 14.5651C14.8174 14.8234 14.4263 14.9469 14.0347 14.9061Z"
        fill="var(--textColor)"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0_0_6282">
        <rect
          width="15"
          height="15"
          fill="var(--textColor)"
          transform="translate(0.564453)"
        ></rect>
      </clipPath>
    </defs>
  </svg>
);

const qrIcn = (
  <svg
    width="150"
    height="150"
    viewBox="0 0 96 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_23_10)">
      <path d="M12 12H24V24H12V12Z" fill="black" />
      <path
        d="M36 0V36H0V0H36ZM30 6H6V30H30V6ZM24 72H12V84H24V72Z"
        fill="black"
      />
      <path
        d="M36 60V96H0V60H36ZM6 66V90H30V66H6ZM72 12H84V24H72V12Z"
        fill="black"
      />
      <path
        d="M60 0V36H96V0H60ZM90 6V30H66V6H90ZM48 6V0H54V12H48V24H42V6H48ZM48 36V24H54V36H48ZM36 48V42H42V36H48V48H54V42H84V48H60V54H42V48H36ZM36 48V54H12V48H6V54H0V42H18V48H36ZM96 54H90V42H96V54ZM90 54H84V66H96V60H90V54ZM66 54H78V60H72V66H66V54ZM78 72V66H72V72H66V78H54V84H72V72H78ZM78 72H96V78H84V84H78V72ZM54 66V72H60V60H42V66H54Z"
        fill="black"
      />
      <path
        d="M42 72H48V90H72V96H42V72ZM96 84V96H78V90H90V84H96Z"
        fill="black"
      />
    </g>
    <defs>
      <clipPath id="clip0_23_10">
        <rect width="96" height="96" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const tickIcn = (
  <svg
    width="100"
    height="100"
    viewBox="0 0 146 146"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M73 9.125C89.9407 9.125 106.188 15.8547 118.166 27.8336C130.145 39.8124 136.875 56.0593 136.875 73C136.875 89.9407 130.145 106.188 118.166 118.166C106.188 130.145 89.9407 136.875 73 136.875C56.0593 136.875 39.8124 130.145 27.8336 118.166C15.8547 106.188 9.125 89.9407 9.125 73C9.125 56.0593 15.8547 39.8124 27.8336 27.8336C39.8124 15.8547 56.0593 9.125 73 9.125ZM65.043 85.6016L50.8536 71.4031C50.3449 70.8944 49.741 70.4909 49.0764 70.2156C48.4118 69.9403 47.6994 69.7986 46.9801 69.7986C46.2607 69.7986 45.5483 69.9403 44.8837 70.2156C44.2191 70.4909 43.6152 70.8944 43.1065 71.4031C42.0792 72.4305 41.502 73.8238 41.502 75.2767C41.502 76.7296 42.0792 78.1229 43.1065 79.1502L61.174 97.2178C61.6812 97.729 62.2847 98.1348 62.9495 98.4117C63.6143 98.6887 64.3274 98.8312 65.0476 98.8312C65.7678 98.8312 66.4808 98.6887 67.1456 98.4117C67.8105 98.1348 68.4139 97.729 68.9211 97.2178L106.334 59.7961C106.849 59.2895 107.259 58.6859 107.54 58.0201C107.821 57.3542 107.968 56.6393 107.971 55.9166C107.974 55.1939 107.835 54.4776 107.56 53.8092C107.285 53.1408 106.881 52.5334 106.37 52.022C105.859 51.5107 105.252 51.1055 104.584 50.8299C103.916 50.5543 103.2 50.4137 102.477 50.4162C101.754 50.4187 101.039 50.5643 100.373 50.8445C99.7069 51.1247 99.1028 51.5341 98.5956 52.049L65.043 85.6016Z"
      fill="#14C32E"
    />
  </svg>
);
