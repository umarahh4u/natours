/* eslint-disable */
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    const stripe = await loadStripe(
      'pk_test_51LQLRZD5viAyeGiykTSXdOvJPVdwxv1fzxZBI68SxhpMfrAhcPqbDTAzbJUADSP6UvXiVxXgGWPSkyYWVz8so3ah00ZO5FdwGV'
    );

    stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
