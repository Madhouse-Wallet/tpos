"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PaymentPopup from "@/components/modals/paymentPopup";
import HistoryPopup from "@/components/modals/HistoryPopup";
import animationData from "./taptoPay.json";
import LottieComponent from "./TaptoPayanimation";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import { createTposInvoice } from "../../services/apiService";

const Tpos = () => {
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [tab, setTab] = useState(0);
  const [paymentPop, setPaymentPop] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [tpoId, setTpoId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [error, setError] = useState("");

  // Get URL parameters
  const params = useParams();
  const router = useRouter();

  const [sats, setSats] = useState(null);

  useEffect(() => {
    async function fetchSats() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        const btcPriceUsd = data?.bitcoin?.usd;
        if (!btcPriceUsd) throw new Error("BTC price not found");
        const usdAmount = formatCurrencyWithoutSign(amount);
        const calculatedSats = Math.floor(
          (usdAmount / btcPriceUsd) * 100_000_000
        );
        setSats(calculatedSats);
      } catch (err) {
        console.error("Error:", err);
      }
    }

    fetchSats();
  }, [amount]);

  useEffect(() => {
    if (params.tpoId) {
      setTpoId(params.tpoId);
    } else if (params.id) {
      setTpoId(params.id);
    } else {
      const url = new URL(window.location.href);
      const idFromQuery = url.searchParams.get("id");
      if (idFromQuery) {
        setTpoId(idFromQuery);
      }
    }
  }, [params]);

  const generateQRCode = async (paymentRequest) => {
    try {
      const qr = await QRCode.toDataURL(paymentRequest);
      setQrCodeImage(qr);
      setPaymentPop(true);
    } catch (err) {
      console.error("QR Code generation failed:", err);
      setError("Failed to generate QR code");
    }
  };

  const handleClick = (digit) => {
    // Prevent more than 9 digits
    if (amount.length >= 9) return;
    const newAmount = amount + digit;
    setAmount(newAmount);
  };

  const formatCurrency = (value) => {
    const cents = value.padStart(3, "0"); // ensure at least 3 digits
    const dollars = cents.slice(0, -2);
    const decimal = cents.slice(-2);
    return `$${parseInt(dollars, 10)}.${decimal}`;
  };

  const formatCurrencyWithoutSign = (value) => {
    const cents = value.padStart(3, "0"); // ensure at least 3 digits
    const dollars = cents.slice(0, -2);
    const decimal = cents.slice(-2);
    return `${parseInt(dollars, 10)}.${decimal}`;
  };

  const handleClear = () => {
    setAmount("");
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleMemoChange = (e) => {
    setMemo(e.target.value);
  };

  const tabData = [
    { title: "Qr Code to Pay", component: "" },
    { title: "Tap to Pay", component: "" },
  ];

  const handleTab = (key) => {
    setTab(key);
  };

  // Function to create invoice and show QR code
  const createInvoiceAndShowQR = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!tpoId) {
      setError("TPOS ID is missing");
      return;
    }

    setError("");

    try {
      const amountValue = parseInt(amount);

      const response = await createTposInvoice(
        tpoId,
        amountValue,
        memo || "TPOS Madhouse Wallet", // Use memo if provided, otherwise use default text
        1, // No tip
        "", // No lightning address
        {} // No additional details
      );
      generateQRCode(response.payment_request);
      setInvoiceData(response);
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setError(`Failed to create invoice: ${err.message}`);
    }
  };

  // Handler for OK button click
  const handleOkClick = () => {
    if (tab === 0) {
      // Qr Code to Pay tab
      createInvoiceAndShowQR();
    } else {
      // Tap to Pay tab - use original functionality
      setShowLoader(true);
      setTimeout(() => {
        setShowLoader(false);
      }, 5000);
    }
  };

  return (
    <>
      {paymentPop &&
        createPortal(
          <PaymentPopup
            paymentPop={paymentPop}
            setPaymentPop={setPaymentPop}
            tpoId={tpoId}
            qrCodeImage={qrCodeImage} // Pass QR code image to popup
            invoiceData={invoiceData} // Pass invoice data to popup
            amount={amount} // Pass amount to popup
            memo={memo} // Pass memo to popup
          />,
          document.body
        )}
      {historyPop &&
        createPortal(
          <HistoryPopup
            historyPop={historyPop}
            setHistoryPop={setHistoryPop}
            tpoId={tpoId}
          />,
          document.body
        )}
      {showLoader && (
        <div className="fixed bg-black/80 flex items-center justify-center top-0 left-0 h-full w-full z-[9999]">
          <LottieComponent animation={animationData} />
        </div>
      )}
      <section className="h-screen pt-12 pb-5 text-center relative">
        <button
          onClick={() => setHistoryPop(!historyPop)}
          className="absolute top-2 right-2 flex items-center justify-center h-[45px] w-[45px] bg-[#ea611d] transition duration-[400ms] hover:bg-[#000] rounded-full shadow"
        >
          {historyIcn}
        </button>
        <div className="container px-3 h-full">
          <div className="grid gap-3 grid-cols-12 h-full">
            <div className="col-span-12 h-full">
              <div className="h-full flex flex-col justify-between">
                <div className="text-center top">
                  <h4 className="m-0 font-semibold text-4xl">
                    {formatCurrency(amount)}
                  </h4>
                  <p className="mb-0 mt-4 font-medium text-[20px]">
                    {sats} sat
                  </p>
                  {/* {tpoId && (
                    <p className="text-sm text-gray-500">TPO ID: {tpoId}</p>
                  )} */}
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <div className="center w-full max-w-[450px] mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {tabData.map((item, key) => (
                      <button
                        key={key}
                        onClick={() => handleTab(key)}
                        className={`${
                          tab == key
                            ? "opacity-100 bg-[#ea611d] text-white"
                            : "text-black bg-[#ddd]"
                        } flex items-center w-full rounded-full justify-center font-semibold min-w-[130px] rounded-xl text-[14px] p-3`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                  <div className="">
                    <input
                      placeholder="Memo"
                      type="text"
                      value={memo}
                      onChange={handleMemoChange}
                      className="border-[#8c8c8c] bg-[#fff] hover:bg-white/6 text-black flex text-[14px] font-semibold w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full outline-0"
                    />
                  </div>
                </div>
                <div className="keyPad w-full grid gap-2 grid-cols-4 grid-rows-4 min-h-[40vh] p-3 max-w-[600px] mx-auto">
                  {["1", "2", "3", "4", "5", "6"].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleClick(val)}
                      className="flex text-xl text-white font-semibold bg-[#ea611d] items-center justify-center rounded-[40px] transition duration-[400ms] hover:bg-[#000] min-h-[55px] h-full"
                    >
                      {val}
                    </button>
                  ))}

                  {/* OK Button */}
                  <button
                    onClick={handleOkClick}
                    className="row-start-1 row-end-5 col-start-4 col-end-5 flex text-xl text-white font-semibold bg-green-500 items-center justify-center rounded-xl transition duration-[400ms] hover:bg-[#000]"
                  >
                    OK
                  </button>

                  {["7", "8", "9"].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleClick(val)}
                      className="flex text-xl text-white font-semibold bg-[#ea611d] items-center justify-center rounded-[40px] transition duration-[400ms] hover:bg-[#000]"
                    >
                      {val}
                    </button>
                  ))}

                  {/* Clear Button */}
                  <button
                    onClick={handleClear}
                    className="flex text-xl text-white font-semibold bg-red-500 items-center justify-center rounded-[40px] transition duration-[400ms] hover:bg-[#000]"
                  >
                    C
                  </button>

                  {/* 0 Button */}
                  <button
                    onClick={() => handleClick("0")}
                    className="flex text-xl text-white font-semibold bg-[#ea611d] items-center justify-center rounded-[40px] transition duration-[400ms] hover:bg-[#000]"
                  >
                    0
                  </button>

                  {/* Backspace Button */}
                  <button
                    onClick={handleBackspace}
                    className="flex text-xl text-white font-semibold bg-[#ea611d] items-center justify-center rounded-[40px] transition duration-[400ms] hover:bg-[#000]"
                  >
                    {backIcn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Tpos;

const backIcn = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const historyIcn = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 10H16M8 18H16M8 14H12M4 21.4V2.6C4 2.44087 4.06321 2.28826 4.17574 2.17574C4.28826 2.06321 4.44087 2 4.6 2H16.252C16.4111 2.00014 16.5636 2.06345 16.676 2.176L19.824 5.324C19.88 5.3799 19.9243 5.44632 19.9545 5.51943C19.9847 5.59254 20.0002 5.6709 20 5.75V21.4C20 21.4788 19.9845 21.5568 19.9543 21.6296C19.9242 21.7024 19.88 21.7685 19.8243 21.8243C19.7685 21.88 19.7024 21.9242 19.6296 21.9543C19.5568 21.9845 19.4788 22 19.4 22H4.6C4.52121 22 4.44319 21.9845 4.37039 21.9543C4.29759 21.9242 4.23145 21.88 4.17574 21.8243C4.12002 21.7685 4.07583 21.7024 4.04567 21.6296C4.01552 21.5568 4 21.4788 4 21.4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 2V5.4C16 5.55913 16.0632 5.71174 16.1757 5.82426C16.2883 5.93679 16.4409 6 16.6 6H20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
