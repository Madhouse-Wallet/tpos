export function filterHexInput(value, allowedCharsRegex, maxLength) {
  if (!value || typeof value !== "string") return "";

  // Filter invalid characters
  let filtered = value.replace(allowedCharsRegex, "");

  // Trim to max length
  if (filtered.length > maxLength) {
    filtered = filtered.slice(0, maxLength);
  }

  return filtered;
}


export async function calcLnToChainFeeWithReceivedAmount(amountReceived = 0) {
  try {
    const boltzFeePercent = 0.5; // e.g. 0.5% Boltz fee (replace with actual)
    const lockupFee = 500;       // On-chain lockup fee in sats
    const claimFee = 1000;       // Fixed on-chain claim fee in sats

    const feeFactor = 1 - boltzFeePercent / 100;
    const swapAmount = Math.ceil((amountReceived + lockupFee + claimFee) / feeFactor);

    const boltzFee = Math.floor((swapAmount * boltzFeePercent) / 100);
    const totalFees = boltzFee + lockupFee + claimFee;
    const platformFee = lockupFee + claimFee;

    // Convert to Uint8Array
    return {
      boltzFee,
      platformFee,
      lockupFee,
      claimFee,
      totalFees,
      amountReceived,
      swapAmount
    }
  } catch (e) {
    console.error('error with calcLnToChainFeeWithReceivedAmount', e);
    return null; // Handle error as needed (e.g., return an empty buffer or throw an error)
  }
};
