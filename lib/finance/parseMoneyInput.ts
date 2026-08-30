export function parseMoneyInput(rawValue: FormDataEntryValue | null) {
  const raw = String(rawValue ?? "").trim().replace(/\s/g, "");

  if (!raw) {
    return null;
  }

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw;

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    normalized = raw
      .split(thousandsSeparator)
      .join("")
      .replace(decimalSeparator, ".");
  } else if (hasComma) {
    normalized = raw.replace(",", ".");
  }

  const firstDecimalIndex = normalized.indexOf(".");

  if (firstDecimalIndex !== -1) {
    normalized =
      normalized.slice(0, firstDecimalIndex + 1) +
      normalized.slice(firstDecimalIndex + 1).replace(/\./g, "");
  }

  const amount = Number(normalized);

  if (Number.isNaN(amount)) {
    return null;
  }

  return amount;
}
