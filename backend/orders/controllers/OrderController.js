const OrderModel = require("../../common/models/Order");
const UserModel = require("../../common/models/User");
const { roles, orderStatuses } = require("../../config");

module.exports = {
  createOrder: (req, res) => {
    const {
      body: { items, totalAmount, shippingAddress, paymentMethod },
      user: { userId },
    } = req;

    OrderModel.createOrder({
      userId,
      items: JSON.stringify(items),
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: orderStatuses.PENDING,
    })
      .then((order) => {
        const orderJson = order.toJSON();
        return res.status(201).json({
          status: true,
          data: {
            ...orderJson,
            items: JSON.parse(orderJson.items),
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  getOrders: (req, res) => {
    const { userId } = req.user;

    UserModel.findUser({ id: userId })
      .then((user) => {
        const query = user.role === roles.ADMIN ? {} : { userId };
        return OrderModel.findAllOrders(query);
      })
      .then((orders) => {
        return res.status(200).json({
          status: true,
          data: orders.map((order) => {
            const orderJson = order.toJSON();
            return {
              ...orderJson,
              items: JSON.parse(orderJson.items),
            };
          }),
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  updateOrderStatus: (req, res) => {
    const {
      params: { orderId },
      body: { status },
    } = req;

    OrderModel.updateOrder({ id: orderId }, { status })
      .then(() => {
        return OrderModel.findOrder({ id: orderId });
      })
      .then((order) => {
        if (!order) {
          return res.status(404).json({
            status: false,
            error: { message: "Order not found." },
          });
        }
        const orderJson = order.toJSON();
        return res.status(200).json({
          status: true,
          data: {
            ...orderJson,
            items: JSON.parse(orderJson.items),
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },
};
