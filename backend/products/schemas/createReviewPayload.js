module.exports = {
  type: "object",
  properties: {
    rating: {
      type: "integer",
      minimum: 1,
      maximum: 5,
    },
    message: {
      type: "string",
    },
  },
  required: ["rating", "message"],
  additionalProperties: false,
};
