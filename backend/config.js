module.exports = {
  port: 3000,
  jwtSecret: "!!CryptoCat@!!",
  jwtExpirationInSeconds: 60 * 60, // 1 hour
  roles: {
    USER: "user",
    ADMIN: "admin",
  },
  productPriceUnits: {
    DOLLAR: "dollar",
    EURO: "euro",
    INR: "inr",
  },
  orderStatuses: {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },
  paymentMethods: {
    CREDIT_CARD: "credit_card",
    DEBIT_CARD: "debit_card",
    PAYPAL: "paypal",
    CASH_ON_DELIVERY: "cash_on_delivery",
  },
};
