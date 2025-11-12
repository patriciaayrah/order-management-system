// utils/formatCurrency.js
export const formatCurrency = (value) =>
  Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
