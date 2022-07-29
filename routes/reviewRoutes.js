const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// enabling router access to the parameters by passing mergeParams to be true
const router = express.Router({ mergeParams: true });

// POST /tour/2334ddrgr/reviews
// GET /tour/2334ddrgr/reviews
// GET /tour/2334ddrgr/reviews/9889src

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  )
  .get(reviewController.getAllReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
