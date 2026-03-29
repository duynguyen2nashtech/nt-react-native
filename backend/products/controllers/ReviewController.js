const ProductReviewModel = require("../../common/models/ProductReview");

module.exports = {
  getReviews: (req, res) => {
    const {
      params: { productId },
    } = req;

    ProductReviewModel.findAllReviews({ productId })
      .then((reviews) => {
        return res.status(200).json({
          status: true,
          data: reviews,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          error: err,
        });
      });
  },

  addReview: (req, res) => {
    const {
      params: { productId },
      body: payload,
      user: { userId },
    } = req;

    ProductReviewModel.findReview({ userId, productId })
      .then((existing) => {
        if (existing) {
          return res.status(409).json({
            status: false,
            error: {
              message: "You have already submitted a review for this product.",
            },
          });
        }

        return ProductReviewModel.createReview({
          ...payload,
          productId,
          userId,
        }).then((review) => {
          return res.status(200).json({
            status: true,
            data: review.toJSON(),
          });
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
