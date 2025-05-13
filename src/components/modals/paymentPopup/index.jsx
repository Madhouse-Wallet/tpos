import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

const PaymentPopup = ({
  paymentPop,
  setPaymentPop,
  qrCodeImage,
  tpoId,
  invoiceData,
  amount,
  memo,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!invoiceData?.payment_hash) return;
    socketRef.current = new WebSocket(
      `https://lnbits.madhousewallet.com/api/v1/ws/${invoiceData.payment_hash}`
    );

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "paid") {
        setPaymentSuccess(true);

        setTimeout(() => {
          setPaymentPop(false);
        }, 2000);
      }
    };

    socketRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }, [invoiceData?.payment_hash]);

  const handlePaymentPop = () => {
    setPaymentPop(!paymentPop);
  };

  const formatCurrency = (value) => {
    const cents = value.padStart(3, "0"); // ensure at least 3 digits
    const dollars = cents.slice(0, -2);
    const decimal = cents.slice(-2);
    return `$${parseInt(dollars, 10)}.${decimal}`;
  };

  const handleCopyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoiceData?.payment_request || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy invoice:", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center px-3 cstmModal z-[9999] pb-[100px]">
        <button
          onClick={() => setPaymentPop(!paymentPop)}
          className="bg-black/50 h-10 w-10 items-center rounded-full p-0 absolute mx-auto left-0 right-0 bottom-10 z-[99999] inline-flex justify-center border border-[#5f5f5f59]"
        >
          {crossIcn}
        </button>
        <div
          onClick={handlePaymentPop}
          className="absolute inset-0 backdrop-blur-xl"
        />
        <div className="modalDialog relative p-3 lg:p-6 mx-auto w-full rounded-[20px] z-10 overflow-scroll border border-[#dddddd21] bg-[#00000099] no-scrollbar max-w-[500px]">
          {paymentSuccess ? (
            <>
              {" "}
              <div className="text-center text-green-500 text-4xl font-bold py-10">
                {" "}
                ✅ Payment Received{" "}
              </div>
            </>
          ) : (
            <>
              <div className="py-2">
                <div className="flex items-center justify-center max-w-[max-content] mx-auto border bg-white p-1 text-black">
                  <Image
                    alt=""
                    src={qrCodeImage}
                    height={10000}
                    width={10000}
                    className="max-w-full mx-auto h-auto w-auto"
                    style={{ height: 150 }}
                  />
                </div>
              </div>
              <div className="py-2">
                <div className="text-center">
                  <h4 className="m-0 font-bold text-3xl ">
                    {formatCurrency(amount)}
                  </h4>
                  <h4 className="m-0 font-medium text-xl">
                    {formatCurrency(amount)}
                    <span className="text-xs">(+ 1 tip)</span>
                  </h4>
                  <p className="m-0 text-[#838383] text-xs">
                    {memo ? memo : "TPOS Madhouse Wallet"}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={handleCopyInvoice}
                      className="flex items-center justify-center rounded-xl bg-[#ea611d] text-[14px] w-full p-3"
                    >
                      {copied ? "Copied!" : "Copy Invoice"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentPopup;

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
