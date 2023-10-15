export function formatCurrency(number) {
  if (number == null) {
    return "$0.00";
  }
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(number);
}
