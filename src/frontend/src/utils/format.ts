export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

export function timestampToDate(createdAt: bigint): Date {
  return new Date(Number(createdAt / BigInt(1_000_000)));
}

export function formatDate(createdAt: bigint): string {
  const date = timestampToDate(createdAt);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(createdAt: bigint): string {
  const date = timestampToDate(createdAt);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateInvoiceNumber(index: number): string {
  return `INV-${String(index).padStart(4, "0")}`;
}

export function todayAsString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
