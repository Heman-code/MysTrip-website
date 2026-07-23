import QRCode from "qrcode";

export const UPI_ID = "hemantkr10-icloud.com@okhdfcbank";
export const UPI_PAYEE_NAME = "MysTrip";

export function buildUpiUri(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

export function generateUpiQrDataUrl(amount: number, note: string) {
  return QRCode.toDataURL(buildUpiUri(amount, note), { margin: 1, width: 320 });
}
