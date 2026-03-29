const { orderStatuses } = require("../../config");

module.exports = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: Object.values(orderStatuses),
    },
  },
  required: ["status"],
  additionalProperties: false,
};
