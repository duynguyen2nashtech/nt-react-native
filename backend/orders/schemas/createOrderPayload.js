module.exports = {
  type: "object",
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          productId: { type: "integer" },
          quantity: { type: "integer", minimum: 1 },
          price: { type: "number", minimum: 0 },
        },
        required: ["productId", "quantity", "price"],
        additionalProperties: false,
      },
    },
    totalAmount: {
      type: "number",
      minimum: 0,
    },
    shippingAddress: {
      type: "string",
      minLength: 1,
    },
    paymentMethod: {
      type: "string",
      enum: ["credit_card", "debit_card", "paypal", "cash_on_delivery"],
    },
  },
  required: ["items", "totalAmount", "shippingAddress", "paymentMethod"],
  additionalProperties: false,
};
