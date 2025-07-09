"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PaymentPopup from "@/components/modals/paymentPopup";
import HistoryPopup from "@/components/modals/HistoryPopup";
import animationData from "./taptoPay.json";
import LottieComponent from "./TaptoPayanimation";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  createTposInvoice,
  getUserByEmail,
  getUserByTposID,
  walletBal,
  getUserByWallet,
  payInvoice,
} from "../../services/apiService";
import { filterHexInput } from "../../utils/helper";
import styled from "styled-components";

import { fundTrnsfer } from "../../services/apiService";
const Tpos = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [tab, setTab] = useState(0);
  const [paymentPop, setPaymentPop] = useState(false);
  const [historyPop, setHistoryPop] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [walletId, setWalletId] = useState("");
  const [walBal, setWalBal] = useState(0);
  const [tpoId, setTpoId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // States for Ethereum tap to pay
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [showTapModal, setShowTapModal] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Get URL parameters
  const params = useParams();
  const router = useRouter();

  const [sats, setSats] = useState(null);

  useEffect(() => {
    if (paymentSuccess) {
      console.log("api hit-->");
      fundTrnsfer("", tpoId);
    }
  }, [paymentSuccess]);
  useEffect(() => {
    async function fetchSats() {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BITCOIN_PRICE_URL);
        const data = await res.json();
        const btcPriceUsd = data?.bitcoin?.usd;
        if (!btcPriceUsd) throw new Error("BTC price not found");
        const usdAmount = formatCurrencyWithoutSign(amount);
        const calculatedSats = Math.ceil(
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
    const url = new URL(window.location.href);

    const id = params.tpoId || params.id || url.searchParams.get("id");
    console.log("line-69", id);

    const userData = async () => {
      const apiResponse = await getUserByTposID(id);

      console.log("line-74", apiResponse);
      if (!apiResponse) {
        return;
      }
      const walletBalStats = await walletBal(
        apiResponse?.lnbitLinkId_2,
        apiResponse?.lnbitLinkId,
        apiResponse?.lnbitWalletId,
        apiResponse?.lnbitWalletId_2,
        id
      );
      const email = apiResponse?.email;
      const wallet = apiResponse?.lnbitWalletId;
      if (id) setTpoId(id);
      if (email) setEmail(email);
      if (wallet) setWalletId(wallet);
      if (walletBalStats) setWalBal(walletBalStats);
      if (!email) {
        return;
      }
      const existingUser = await getUserByEmail(email);

      if (!existingUser) {
        throw new Error("User not found for this wallet address");
      }
      setUser(existingUser);
    };

    userData();
  }, [params]);

  // const fundTransfer = async () => {
  //   try {
  //     console.log("tpoId-->", tpoId)
  //     const responseDt = await fundTrnsfer("", tpoId);
  //     console.log("responseDt-->", responseDt)
  //   } catch (error) {
  //     console.log("fundTransfer error-->", error)
  //   }
  // }

  // useEffect(() => {
  //   try {
  //     // reverseSwap()
  //     fundTransfer()
  //   } catch (error) {
  //     console.log("error-->", error)
  //   }
  // }, [tpoId])

  // Ethereum address validation
  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Function to handle input received from LottieComponent
  const handleInputReceived = (input) => {
    console.log("Input received:", input);
    setUserInput(input);

    // Close the tap modal
    closeTapModal();

    // Validate if it's a valid Ethereum address
    if (isValidEthereumAddress(input.trim())) {
      setEthereumAddress(input.trim());
      console.log("✅ Valid Ethereum address detected:", input.trim());
      // Process the Ethereum payment
      processEthereumPayment(input);
    } else {
      console.log("⚠️ Invalid Ethereum address format:", input.trim());
      setError("Invalid Ethereum address format");
      // showToastMessage("Invalid Ethereum address format");
    }
  };

  // Function to show toast message
  const showToastMessage = (message) => {
    alert(message);
  };

  // Function to start tap to pay process
  const startTapToPay = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    } else if (!amount || parseInt(amount) > 24000000) {
      setError("Amount cannot be more than 24000000.");
      return;
    }

    setError("");
    setEthereumAddress("");
    setUserInput("");
    setShowTapModal(true);
  };

  // Function to close tap modal
  const closeTapModal = () => {
    setShowTapModal(false);
  };

  const processEthereumPayment = async (address) => {
    console.log("Processing Ethereum payment for address:", address);
    console.log("Amount:", formatCurrencyWithoutSign(amount));
    console.log("Memo:", memo);

    try {
      // Show loader while processing
      setShowLoader(true);

      // 1. Fetch user details by wallet address using API
      const existingUser = await getUserByWallet(address);

      if (!existingUser) {
        throw new Error("User not found for this wallet address");
      }

      // 2. Generate invoice with user's lnUrlAddress
      const response = await createTposInvoice(
        tpoId,
        sats,
        getInternalMemo() || process.env.NEXT_PUBLIC_TPOS_DEFAULT_MEMO,
        existingUser?.lnaddress,
        {}
      );

      // 3. Pay the invoice
      const result = await payInvoice(
        response?.payment_request, // Pass the invoice response
        address // Pass the wallet address
      );

      console.log("Payment result:", result);

      if (result.status === "failure") {
        setError(`Payment failed: ${result.message}`);
        setShowLoader(false);
      } else {
        setPaymentSuccess(true);
        setShowLoader(false);
      }

      // Hide success popup after 8 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 8000);
    } catch (error) {
      console.error("Error processing Ethereum payment:", error);
      setError(`Payment failed: ${error.message}`);
      setShowLoader(false);
    }
  };

  const generateQRCode = async (paymentRequest) => {
    try {
      const qr = await QRCode.toDataURL(paymentRequest, {
        margin: 0.5,
      });
      setQrCodeImage(qr);
      setPaymentPop(true);
    } catch (err) {
      console.error("QR Code generation failed:", err);
      setError("Failed to generate QR code");
    }
  };

  const handleClick = (digit, index) => {
    if (amount.length >= 9) return;

    const newAmount = amount + digit;
    setAmount(newAmount);

    // Set active index for black background flash
    setActiveIndex(digit);
    setTimeout(() => {
      setActiveIndex(null);
    }, 150); // flash for 150ms
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
    setActiveIndex("clear");
    setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
    setActiveIndex("backspace");
    setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  };

  // const handleMemoChange = (e) => {
  //   setMemo(e.target.value);
  // };

  const handleMemoChange = (e) => {
    const value = e.target.value;

    // const filteredValue = value.replace(/[^0-9a-fA-Fx]/g, "");
    // Filter out invalid characters instead of blocking the entire input
    const filteredValue = filterHexInput(value, /[^a-zA-Z0-9 ]/g, 100);
    console.log("line-127", filteredValue.length);

    // Update the address value with filtered input
    setMemo(filteredValue);
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
    } else if (!amount || parseInt(amount) > 24000000) {
      setError("Amount cannot be more than 24000000.");
      return;
    }
    if (!tpoId) {
      setError("TPOS ID is missing");
      setPaymentPop(true);
      return;
    }

    setError("");

    try {
      const response = await createTposInvoice(
        tpoId,
        sats,
        getInternalMemo() || process.env.NEXT_PUBLIC_TPOS_DEFAULT_MEMO,
        process.env.NEXT_PUBLIC_TPOS_LNURL,
        {}
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
      // Tap to Pay tab - start Ethereum tap to pay
      startTapToPay();
    }

    setActiveIndex("ok");
    setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  };

  const getInternalMemo = () => {
    const merchantInfo = `Merchant: ${email}`;
    if (memo.trim()) {
      return `${memo} - ${merchantInfo}`;
    }
    return merchantInfo;
  };

  console.log(activeIndex, "activehover");

  return (
    <>
      {paymentPop &&
        createPortal(
          <PaymentPopup
            setAmount={setAmount}
            paymentPop={paymentPop}
            setPaymentPop={setPaymentPop}
            tpoId={tpoId}
            qrCodeImage={qrCodeImage}
            invoiceData={invoiceData}
            amount={amount}
            memo={memo}
            walletId={walletId}
            email={email}
            sats={sats}
          />,
          document.body
        )}
      {historyPop &&
        createPortal(
          <HistoryPopup
            historyPop={historyPop}
            setHistoryPop={setHistoryPop}
            tpoId={tpoId}
            user={user}
          />,
          document.body
        )}

      {showTapModal && (
        <div
          className="fixed bg-black/80 flex items-center justify-center top-0 left-0 h-full w-full z-[9999]"
          onClick={closeTapModal}
        >
          <LottieComponent
            animation={animationData}
            onInputReceived={handleInputReceived}
            onClose={closeTapModal}
          />
        </div>
      )}
      <SectionWrpper className="h-[100svh] pt-12 pb-5 text-center relative">
        {paymentSuccess && (
          <>
            <div className="fixed w-full h-full z-[9999]  top-0 left-0 flex items-center justify-center">
              <div className="bg-black/50 h-full w-full absolute top-0 left-0 z-[-1]"></div>
              <div className=" mx-auto left-0 right-0   max-w-[500px] w-full   rounded-xl bg-[#00000099]">
                <div className="p-[30px]">
                  <div className="flex items-center justify-center">
                    {tickIcn}
                  </div>
                  <div className="text-center text-3xl font-medium py-3">
                    Payment Received{" "}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setHistoryPop(!historyPop)}
          className="transactionBtn  absolute top-2 right-2 flex items-center justify-center h-[45px] w-[45px] bg-[#ea611d] transition duration-[400ms] hover:bg-[#000] rounded-full shadow"
        >
          {historyIcn}
        </button>
        <div className="absolute top-2 left-2 text-xs inline-flex mb-4 items-center gap-2 rounded px-3 py-1 bg-black/50 text-left">
          <ul className="list-none pl-0 mb-0">
            <li className="py-1 flex items-center gap-1">
              <span className="font-bold themeClr">{calculatorIcn}</span>{" "}
              {tpoId || "not found"}
            </li>
            <li className="py-1 flex items-center gap-1">
              <span className="font-bold themeClr">{emailIcn}</span>{" "}
              {email || "not found"}
            </li>
            <li className="py-1 flex items-center gap-1">
              <span className="font-bold themeClr">{walletIcn}</span>{" "}
              {walBal || "not found"}
            </li>
          </ul>
        </div>
        <div className="container px-3 h-full">
          <div className="grid gap-3 grid-cols-12 h-full pt-[60px] sm:pt-0">
            <div className="col-span-12 h-full">
              <div className="h-full flex flex-col justify-between wrpperMain">
                <div className="text-center top">
                  <h4 className="m-0 font-semibold text-4xl">
                    {formatCurrency(amount)}
                  </h4>
                  <p className="mb-0 mt-4 font-medium text-[20px]">
                    {sats} sat
                  </p>
                  {error && (
                    <p className="text-red-500 mt-2 errorMessage">{error}</p>
                  )}
                </div>
                <div className="center w-full max-w-[450px] mx-auto">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {tabData.map((item, key) => (
                      <button
                        key={key}
                        onClick={() => handleTab(key)}
                        className={`${tab == key
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
                      className="border-[#8c8c8c] bg-[#fff] text-black flex text-[14px] font-semibold w-full border-px md:border-hpx px-5 py-2 h-12 rounded-full outline-0"
                    />
                  </div>
                </div>
                <div className="keyPad w-full grid gap-2 grid-cols-4 grid-rows-4 min-h-[40vh] p-3 max-w-[600px] mx-auto">
                  {["1", "2", "3", "4", "5", "6"].map((val, index) => (
                    <button
                      key={val}
                      onClick={() => handleClick(val, index)}
                      className={`flex text-xl text-whute font-semibold items-center justify-center rounded-[40px] transition-colors duration-300 min-h-[55px] h-full px-6 ${activeIndex === val ? "bg-[#000]" : "bg-[#ea611d]"
                        }`}
                    >
                      {val}
                    </button>
                  ))}

                  {/* OK Button */}
                  <button
                    onClick={handleOkClick}
                    className={`row-start-1 row-end-5 col-start-4 col-end-5 flex text-xl text-white font-semibold items-center justify-center rounded-xl transition duration-[400ms] ${activeIndex === "ok" ? "bg-[#000]" : "bg-green-500 "
                      }`}
                  >
                    OK
                  </button>

                  {["7", "8", "9"].map((val, index) => (
                    <button
                      key={val}
                      onClick={() => handleClick(val, index)}
                      className={`flex text-xl text-whute font-semibold items-center justify-center rounded-[40px] transition-colors duration-300 min-h-[55px] h-full px-6 ${activeIndex === val ? "bg-[#000]" : "bg-[#ea611d]"
                        }`}
                    >
                      {val}
                    </button>
                  ))}

                  {/* Clear Button */}
                  <button
                    onClick={handleClear}
                    className={`flex text-xl text-whute font-semibold items-center justify-center rounded-[40px] transition-colors duration-300 min-h-[55px] h-full px-6 ${activeIndex === "clear" ? "bg-[#000]" : "bg-[#ea611d]"
                      }`}
                  >
                    C
                  </button>

                  {/* 0 Button */}
                  <button
                    onClick={() => handleClick("0")}
                    className={`flex text-xl text-whute font-semibold items-center justify-center rounded-[40px] transition-colors duration-300 min-h-[55px] h-full px-6 ${activeIndex === "0" ? "bg-[#000]" : "bg-[#ea611d]"
                      }`}
                  >
                    0
                  </button>

                  {/* Backspace Button */}
                  <button
                    onClick={handleBackspace}
                    className={`flex text-xl text-whute font-semibold items-center justify-center rounded-[40px] transition-colors duration-300 min-h-[55px] h-full px-6 ${activeIndex === "backspace" ? "bg-[#000]" : "bg-[#ea611d]"
                      }`}
                  >
                    {backIcn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrpper>
    </>
  );
};
const SectionWrpper = styled.section`
  @media (max-height: 450px) {
    .errorMessage {
      font-size: 8px !important;
      margin-top: 0 !important;
    }
    .transactionBtn {
      height: 30px;
      width: 30px;
      svg {
        height: 14px;
        width: 14px;
      }
    }
    .top {
      h4 {
        font-size: 20px;
        line-height: 24px;
      }
      p {
        font-size: 10px;
        margin-top: 5px;
        line-height: 12px;
      }
    }
    .center {
      max-width: 200px;
      button {
        padding: 5px;
        height: 28px;
        font-size: 8px;
        min-width: 80px;
        border-radius: 6px;
      }
      input {
        height: 30px;
        font-size: 10px;
      }
    }
    .keyPad {
      max-width: 300px;
      gap: 5px;
      button {
        min-height: 30px;
        font-size: 10px;
      }
    }
  }
`;

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

const calculatorIcn = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V11C0 11.2652 0.105357 11.5196 0.292893 11.7071C0.48043 11.8946 0.734784 12 1 12H9C9.26522 12 9.51957 11.8946 9.70711 11.7071C9.89464 11.5196 10 11.2652 10 11V1C10 0.734784 9.89464 0.48043 9.70711 0.292893C9.51957 0.105357 9.26522 0 9 0H1ZM2 2V4H8V2H2ZM3 5V6H2V5H3ZM5.5 5V6H4.5V5H5.5ZM8 6V5H7V6H8ZM3 7V8H2V7H3ZM5.5 8V7H4.5V8H5.5ZM8 7V10H7V7H8ZM3 10V9H2V10H3ZM4.5 10V9H5.5V10H4.5Z"
      fill="currentColor"
    />
  </svg>
);

const emailIcn = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 17 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.165 -1.25454e-05C16.0969 -0.00703521 16.0282 -0.00703521 15.96 -1.25454e-05H1.96001C1.87028 0.00137002 1.78115 0.0148241 1.69501 0.0399874L8.92001 7.23499L16.165 -1.25454e-05Z"
      fill="currentColor"
    />
    <path
      d="M16.905 0.695007L9.625 7.94501C9.43763 8.13126 9.18418 8.2358 8.92 8.2358C8.65581 8.2358 8.40236 8.13126 8.215 7.94501L0.999996 0.750007C0.977816 0.831528 0.966056 0.91553 0.964996 1.00001V11C0.964996 11.2652 1.07035 11.5196 1.25789 11.7071C1.44543 11.8947 1.69978 12 1.965 12H15.965C16.2302 12 16.4846 11.8947 16.6721 11.7071C16.8596 11.5196 16.965 11.2652 16.965 11V1.00001C16.961 0.895835 16.9408 0.792925 16.905 0.695007ZM2.65 11H1.955V10.285L5.59 6.68001L6.295 7.38501L2.65 11ZM15.955 11H15.255L11.61 7.38501L12.315 6.68001L15.95 10.285L15.955 11Z"
      fill="currentColor"
    />
  </svg>
);

const walletIcn = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 23 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 8C18 7.73478 18.1054 7.48043 18.2929 7.29289C18.4804 7.10536 18.7348 7 19 7H19.01C19.2752 7 19.5296 7.10536 19.7171 7.29289C19.9046 7.48043 20.01 7.73478 20.01 8C20.01 8.26522 19.9046 8.51957 19.7171 8.70711C19.5296 8.89464 19.2752 9 19.01 9H19C18.7348 9 18.4804 8.89464 18.2929 8.70711C18.1054 8.51957 18 8.26522 18 8Z"
      fill="black"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.6 0H2.4C1.76348 0 1.15303 0.252856 0.702944 0.702944C0.252856 1.15303 0 1.76348 0 2.4V13.6C0 14.2365 0.252856 14.847 0.702944 15.2971C1.15303 15.7471 1.76348 16 2.4 16H17.6C18.2365 16 18.847 15.7471 19.2971 15.2971C19.7471 14.847 20 14.2365 20 13.6V12H20.4C21.0896 12 21.7509 11.7261 22.2385 11.2385C22.7261 10.7509 23 10.0896 23 9.4V6.6C23 6.25856 22.9327 5.92047 22.8021 5.60502C22.6714 5.28958 22.4799 5.00295 22.2385 4.76152C21.997 4.52009 21.7104 4.32858 21.395 4.19791C21.0795 4.06725 20.7414 4 20.4 4H20V2.4C20 1.76348 19.7471 1.15303 19.2971 0.702944C18.847 0.252856 18.2365 0 17.6 0ZM15.6 6C15.4409 6 15.2883 6.06321 15.1757 6.17574C15.0632 6.28826 15 6.44087 15 6.6V9.4C15 9.55913 15.0632 9.71174 15.1757 9.82426C15.2883 9.93679 15.4409 10 15.6 10H20.4C20.5591 10 20.7117 9.93679 20.8243 9.82426C20.9368 9.71174 21 9.55913 21 9.4V6.6C21 6.44087 20.9368 6.28826 20.8243 6.17574C20.7117 6.06321 20.5591 6 20.4 6H15.6Z"
      fill="currentColor"
    />
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
