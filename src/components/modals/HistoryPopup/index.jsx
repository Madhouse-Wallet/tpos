import Image from "next/image";
import React, { useState } from "react";

const HistoryPopup = ({ historyPop, setHistoryPop }) => {
  const handleHistoryPop = () => {
    setHistoryPop(!historyPop);
  };
  return (
    <>
      <div
        className={` fixed inset-0 flex items-center justify-center px-3 cstmModal z-[9999] pb-[100px]`}
      >
        <button
          onClick={() => setHistoryPop(!historyPop)}
          className="bg-black/50 h-10 w-10 items-center rounded-full p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center border border-[#5f5f5f59]"
        >
          {crossIcn}
        </button>
        <div
          onClick={handleHistoryPop}
          className="absolute inset-0 backdrop-blur-xl"
        ></div>
        <div
          className={`modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-[20px] z-10 overflow-scroll border border-[#dddddd21] bg-[#00000099] no-scrollbar max-w-[700px]`}
        >
          <div className="top pb-4">
            <h4 className="m-0 font-bold text-2xl">Transaction History</h4>
          </div>
          {/* <div className="text-center">No paid invoices</div> */}
          <div className="grid gap-3 grid-cols-12">
            {" "}
            <div className="md:col-span-6 col-span-12">
              <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60">
                <div className="left flex items-start gap-2">
                  <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                    {sendSvg}
                  </div>

                  <div className="content">
                    <h4 className="m-0 font-medium ">Send to wallet 23**55</h4>

                    <p className={`m-0 font-medium text-xs text-green-500`}>
                      Confirmed
                    </p>
                  </div>
                </div>

                <div className="right">
                  <p className="m-0 text-xs font-medium">-1.33</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 col-span-12">
              <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60">
                <div className="left flex items-start gap-2">
                  <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                    {sendSvg}
                  </div>

                  <div className="content">
                    <h4 className="m-0 font-medium ">Send to wallet 23**55</h4>

                    <p className={`m-0 font-medium text-xs text-yellow-500`}>
                      Pending
                    </p>
                  </div>
                </div>

                <div className="right">
                  <p className="m-0 text-xs font-medium">-1.33</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 col-span-12">
              <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60">
                <div className="left flex items-start gap-2">
                  <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                    {sendSvg}
                  </div>

                  <div className="content">
                    <h4 className="m-0 font-medium ">Send to wallet 23**55</h4>

                    <p className={`m-0 font-medium text-xs text-green-500`}>
                      Confirmed
                    </p>
                  </div>
                </div>

                <div className="right">
                  <p className="m-0 text-xs font-medium">-1.33</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 col-span-12">
              <div className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60">
                <div className="left flex items-start gap-2">
                  <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                    {sendSvg}
                  </div>

                  <div className="content">
                    <h4 className="m-0 font-medium ">Send to wallet 23**55</h4>

                    <p className={`m-0 font-medium text-xs text-yellow-500`}>
                      Pending
                    </p>
                  </div>
                </div>

                <div className="right">
                  <p className="m-0 text-xs font-medium">-1.33</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPopup;

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
    <g clip-path="url(#clip0_23_10)">
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

const sendSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="icon-arrow-2-up-right"
    viewBox="0 0 512 512"
    height={20}
    width={20}
  >
    <path d="m137 107c0-12 10-22 22-22l225 0c12 0 21 10 21 22l0 225c0 12-9 21-21 21-12 0-21-9-21-21l0-174-241 241c-9 8-22 8-30 0-9-8-9-22 0-30l240-241-173 0c-12 0-22-10-22-21z" />
  </svg>
);
const receiveSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="icon-arrow-2-down-left"
    viewBox="0 0 512 512"
    height={20}
    width={20}
  >
    <path d="m375 405c0 12-10 22-22 22l-225 0c-12 0-21-10-21-22l0-225c0-12 9-21 21-21 12 0 21 9 21 21l0 174 241-241c9-8 22-8 30 0 9 8 9 22 0 30l-240 241 173 0c12 0 22 10 22 21z" />
  </svg>
);
