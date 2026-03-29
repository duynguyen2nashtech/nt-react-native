const { DataTypes } = require("sequelize");

const ProductReviewModel = {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

module.exports = {
  initialise: (sequelize) => {
    this.model = sequelize.define("productreview", ProductReviewModel, {
      indexes: [
        {
          unique: true,
          fields: ["userId", "productId"],
        },
      ],
    });
  },

  createReview: (data) => {
    return this.model.create(data);
  },

  findReview: (query) => {
    return this.model.findOne({
      where: query,
    });
  },

  findAllReviews: (query) => {
    return this.model.findAll({
      where: query,
    });
  },
};
