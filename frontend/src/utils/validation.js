export const validateCurrencyFormat = (value) => {
    const regex = /^\d{1,3}(?:\.\d{3})*$/; // Matches format like 123.123.123
    return regex.test(value);
};
