const { DataTypes } = require("sequelize");
const { orderStatuses } = require("../../config");

const OrderModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: orderStatuses.PENDING,
  },
};

module.exports = {
  initialise: (sequelize) => {
    this.model = sequelize.define("order", OrderModel);
  },

  createOrder: (order) => {
    return this.model.create(order);
  },

  findOrder: (query) => {
    return this.model.findOne({
      where: query,
    });
  },

  updateOrder: (query, updatedValue) => {
    return this.model.update(updatedValue, {
      where: query,
    });
  },

  findAllOrders: (query) => {
    return this.model.findAll({
      where: query,
    });
  },
};
