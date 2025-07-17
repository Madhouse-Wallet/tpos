import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Inter } from "next/font/google";
import moment from "moment";
import LnbitsTransactionDetail from "../../../pages/TransactionDetail/LnbitsTransactionDetail";

const oxanium = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // pick what you need
  variable: "--font-oxanium", // optional if using as a CSS variable
});

const HistoryPopup = ({ historyPop, setHistoryPop, tpoId, user }) => {
  // console.log("line-5", user);

  const [btcTransactions, setBtcTransactions] = useState([]);
  const [detail, setDetail] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatBitcoinTransactionData = (txs) => {
    return txs.map((tx) => {
      const amount = tx.amount;
      const isSend = amount < 0;

      return {
        id: tx.checking_id,
        transactionHash: tx.checking_id,
        from: isSend ? user?.wallet : "External",
        to: isSend ? "External" : user?.wallet,
        date: moment(tx.time).format("MMMM D, YYYY h:mm A"),
        status: tx.status,
        amount: `${amount.toFixed(2)} sats`,
        type: isSend ? "send" : "receive",
        summary:
          tx.memo ||
          (isSend
            ? `Sent ${amount.toFixed(2)} sats`
            : `Received ${amount.toFixed(2)} sats`),
        category: "payment",
        rawData: tx,
        day: moment(tx.time).format("MMMM D, YYYY h:mm A"),
      };
    });
  };

  const fetchBitcoinTransactions = async () => {
    setLoading(true);
    try {
      const checkUser = user;

      // Check if tpoId matches lnbitLinkId to determine which API to call
      const isLnbitLink = user?.lnbitLinkId === tpoId;

      if (isLnbitLink) {
        // Call /api/lnbits-transaction with lnbitAdminKey
        const response = await fetch("/api/lnbits-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId: tpoId,
            tag: "tpos",
            apiKey: checkUser?.lnbitAdminKey,
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
        }
      } else {
        // Call /api/lnbits-transaction-bitcoin with lnbitAdminKey_2
        const response = await fetch("/api/lnbits-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletId: tpoId,
            tag: "tpos",
            apiKey: checkUser?.lnbitAdminKey_2,
          }),
        });

        const { status, data } = await response.json();

        if (status === "success" && data) {
          const formattedTransactions = formatBitcoinTransactionData(data);
          setBtcTransactions(formattedTransactions);
        }
      }
    } catch (error) {
      console.error("Error fetching Bitcoin transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyPop && tpoId && user) {
      fetchBitcoinTransactions();
    }
  }, [historyPop, tpoId, user]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Confirmed";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  const groupTransactionsByDate = (txs) => {
    const groups = {};

    txs.forEach((tx) => {
      if (tx?.date && typeof tx.date === "string") {
        const txDate = moment(tx.date, "MMMM D, YYYY h:mm A");

        if (txDate.isValid()) {
          const dateKey = txDate.format("YYYY-MM-DD");

          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }

          groups[dateKey].push(tx);
        } else {
          console.error("Invalid date format:", tx.date);
        }
      } else if (tx?.date && moment.isMoment(tx.date)) {
        const dateKey = tx.date.format("YYYY-MM-DD");

        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(tx);
      } else {
        console.error("Missing or invalid date:", tx?.date);
      }
    });

    const sortedGroups = {};
    Object.keys(groups)
      .sort(
        (a, b) =>
          moment(b, "YYYY-MM-DD").valueOf() - moment(a, "YYYY-MM-DD").valueOf()
      )
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  };

  const handleTransactionClick = (tx) => {
    setDetail(!detail);
    setTransactionData(tx);
  };

  const handleHistoryPop = () => {
    setHistoryPop(!historyPop);
  };

  const transactionsByDate = groupTransactionsByDate(btcTransactions);

  return (
    <>
      {detail &&
        createPortal(
          <LnbitsTransactionDetail
            detail={detail}
            setDetail={setDetail}
            transactionData={transactionData}
          />,
          document.body
        )}
      <div
        className={`${oxanium.className} fixed inset-0 flex items-center justify-center px-3 cstmModal z-[9999] pb-`}
      >
        <div
          onClick={handleHistoryPop}
          className="absolute inset-0 backdrop-blur-xl"
        ></div>
        <div
          className={`modalDialog relative p-3 pt-[25px] lg:p-6 mx-auto w-full rounded-[20px] z-10 overflow-scroll border border-[#dddddd21] bg-[#00000099] no-scrollbar max-w-[1000px]`}
        >
          <button
            onClick={() => setHistoryPop(!historyPop)}
            className=" h-10 w-10 items-center rounded-20 p-0 absolute mx-auto right-0 top-0 z-[99999] inline-flex justify-center"
            // style={{ border: "1px solid #5f5f5f59" }}
          >
            {crossIcn}
          </button>
          <div className="top pb-4">
            <h4 className="m-0 font-bold text-2xl">Transaction History</h4>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : btcTransactions.length > 0 ? (
            <div className="bg-black/5 lg:p-4 rounded-lg p-3">
              {Object.entries(transactionsByDate).map(([date, txs]) => {
                return (
                  <div key={date} className="py-3">
                    <p className="m-0 text-white text-xs font-semibold pb-2">
                      {date}
                    </p>
                    <div className="grid gap-3 grid-cols-12">
                      {txs.map((tx, key) => (
                        <div key={key} className="md:col-span-6 col-span-12">
                          <div
                            onClick={() => handleTransactionClick(tx)}
                            className="bg-white/5 p-3 rounded-lg flex items-start gap-2 justify-between cursor-pointer hover:bg-black/60"
                          >
                            <div className="left flex items-start gap-2">
                              <div className="flex-shrink-0 h-[40px] w-[40px] rounded-full flex items-center justify-center bg-white/50">
                                {tx.type === "send" ? sendSvg : receiveSvg}
                              </div>
                              <div className="content">
                                <h4 className="m-0 font-bold md:text-base">
                                  {tx.type === "send" ? "Send" : "Receive"} SATS
                                </h4>
                                <p
                                  className={`m-0 ${getStatusColor(
                                    tx.status
                                  )} font-medium text-xs errorMessage`}
                                >
                                  {getStatusText(tx.status)}
                                </p>
                              </div>
                            </div>
                            <div className="right text-right">
                              <p className="m-0 text-xs font-medium py-1">
                                {parseFloat(tx.amount) / 1000}
                              </p>
                              <p className="m-0 text-xs font-medium py-1">
                                {tx.day}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // <div className="text-center">No paid invoices</div>
            <Image
              src={process.env.NEXT_PUBLIC_IMAGE_URL + "noData.png"}
              alt=""
              height={10000}
              width={10000}
              style={{ maxHeight: 400 }}
              className="max-w-full h-auto w-auto mx-auto"
            />
          )}
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
