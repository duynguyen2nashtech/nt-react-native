const swaggerJsdoc = require("swagger-jsdoc");
const { port } = require("./config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce Service API",
      version: "1.0.0",
      description:
        "REST API for an e-commerce platform with user management and product management.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            age: { type: "integer", example: 30 },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            description: {
              type: "string",
              example: "High-quality noise-cancelling headphones",
            },
            image: { type: "string", example: "https://example.com/image.jpg" },
            price: { type: "number", example: 99.99 },
            priceUnit: {
              type: "string",
              enum: ["dollar", "euro", "inr"],
              example: "dollar",
            },
          },
        },
        RegisterPayload: {
          type: "object",
          required: [
            "username",
            "email",
            "password",
            "age",
            "firstName",
            "lastName",
          ],
          properties: {
            username: { type: "string", example: "johndoe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: { type: "string", example: "secret123" },
            age: { type: "number", example: 30 },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
          },
        },
        LoginPayload: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string", example: "johndoe" },
            password: { type: "string", example: "secret123" },
          },
        },
        CreateProductPayload: {
          type: "object",
          required: ["name", "description", "price"],
          properties: {
            name: { type: "string", example: "Wireless Headphones" },
            description: {
              type: "string",
              example: "High-quality noise-cancelling headphones",
            },
            price: { type: "number", example: 99.99 },
            image: { type: "string", example: "https://example.com/image.jpg" },
            priceUnit: {
              type: "string",
              enum: ["dollar", "euro", "inr"],
              example: "dollar",
            },
          },
        },
        UpdateProductPayload: {
          type: "object",
          properties: {
            name: { type: "string", example: "Wireless Headphones Pro" },
            description: { type: "string", example: "Updated description" },
            image: {
              type: "string",
              example: "https://example.com/new-image.jpg",
            },
            price: { type: "number", example: 129.99 },
            priceUnit: {
              type: "string",
              enum: ["dollar", "euro", "inr"],
              example: "dollar",
            },
          },
        },
        UpdateUserPayload: {
          type: "object",
          properties: {
            age: { type: "number", example: 31 },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Smith" },
          },
        },
        ChangeRolePayload: {
          type: "object",
          required: ["role"],
          properties: {
            role: { type: "string", enum: ["user", "admin"], example: "admin" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "boolean", example: false },
            error: { type: "object" },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            status: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        OrderItem: {
          type: "object",
          required: ["productId", "quantity", "price"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            price: { type: "number", example: 99.99 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 3 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", example: 199.98 },
            shippingAddress: {
              type: "string",
              example: "123 Main St, New York, NY 10001",
            },
            paymentMethod: {
              type: "string",
              enum: ["credit_card", "debit_card", "paypal", "cash_on_delivery"],
              example: "credit_card",
            },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              example: "pending",
            },
          },
        },
        CreateOrderPayload: {
          type: "object",
          required: [
            "items",
            "totalAmount",
            "shippingAddress",
            "paymentMethod",
          ],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            totalAmount: { type: "number", example: 199.98 },
            shippingAddress: {
              type: "string",
              example: "123 Main St, New York, NY 10001",
            },
            paymentMethod: {
              type: "string",
              enum: ["credit_card", "debit_card", "paypal", "cash_on_delivery"],
              example: "credit_card",
            },
          },
        },
        UpdateOrderStatusPayload: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              example: "processing",
            },
          },
        },
        ProductReview: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            productId: { type: "integer", example: 3 },
            userId: { type: "integer", example: 7 },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            message: { type: "string", example: "Great product!" },
          },
        },
        CreateReviewPayload: {
          type: "object",
          required: ["rating", "message"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            message: { type: "string", example: "Great product!" },
          },
        },
      },
    },
  },
  apis: [
    "./authorization/routes.js",
    "./products/routes.js",
    "./users/routes.js",
    "./orders/routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
