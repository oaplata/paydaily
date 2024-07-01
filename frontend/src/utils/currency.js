export const formatedCurrency = (value) => {
  return value || value === 0 ?  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value).replace(/COP/g, '') : '--';
};
