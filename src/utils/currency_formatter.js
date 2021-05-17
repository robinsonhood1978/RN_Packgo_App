import currencyFormatter from 'currency-formatter';
const currencies = currencyFormatter.currencies;

export default (value, currency, options = {}) => {
  if (value) {
    return currencyFormatter.format(value, {
      code: currency,
    });
  }
  return 0;
};

export const getSymbol = (currency = 'USD') => {
  const currencyFormatter = currencies.find((curr) => curr.code === currency);
  return currencyFormatter?.symbol ?? '$';
};
