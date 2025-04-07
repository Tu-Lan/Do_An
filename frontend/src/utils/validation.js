export const validateCurrencyFormat = (value) => {
    const regex = /^\d{1,3}(?:\.\d{3})*$/; 
    return regex.test(value);
};
