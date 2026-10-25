const store = require('../data/store');
const pricingService = require('../services/pricing.service');
const mediaService = require('../services/media.service');
const serviceabilityService = require('../services/serviceability.service');

const PAYMENT_METHODS = ['UPI', 'CARD', 'COD'];
const CARD_BRANDS = ['VISA', 'MASTERCARD', 'RUPAY', 'AMEX', 'DINERS', 'CARD'];
const UPI_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z]{2,64}$/;

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const normalizePhone = (value) => {
  let digits = String(value || '').replace(/[\s()+-]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const parseDelivery = (raw = {}) => {
  const fullName = String(raw.fullName || '').trim().replace(/\s+/g, ' ');
  if (fullName.length < 2 || fullName.length > 80) {
    return { error: 'Enter the full name of the person receiving the order.' };
  }
  if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(fullName)) {
    return { error: "Delivery name can only contain letters, spaces, apostrophes, dots and hyphens." };
  }

  const phone = normalizePhone(raw.phone);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { error: 'Enter a valid 10-digit Indian mobile number.' };
  }

  const addressLine1 = String(raw.addressLine1 || '').trim();
  if (addressLine1.length < 8 || addressLine1.length > 120) {
    return { error: 'Enter the flat, building and street in address line 1 (8–120 characters).' };
  }

  const addressLine2 = String(raw.addressLine2 || '').trim();
  if (addressLine2.length > 120) {
    return { error: 'Address line 2 must be 120 characters or fewer.' };
  }

  const city = String(raw.city || '').trim();
  if (city.length < 2 || city.length > 60) {
    return { error: 'Enter a valid city.' };
  }

  const state = String(raw.state || '').trim();
  if (state.length < 2 || state.length > 60) {
    return { error: 'Enter a valid state.' };
  }

  const pincode = String(raw.pincode || '').replace(/\D/g, '').slice(0, 6);
  const serviceability = serviceabilityService.check(pincode);
  if (!serviceability.serviceable) {
    return { error: serviceability.message, serviceability };
  }

  return {
    serviceability,
    delivery: {
      fullName,
      phone: `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      area: serviceability.area,
      etaDays: serviceability.etaDays
    }
  };
};

const parsePayment = (raw = {}, serviceability) => {
  const method = String(raw.method || '').toUpperCase();
  if (!PAYMENT_METHODS.includes(method)) {
    return { error: 'Choose UPI, card or cash on delivery.' };
  }

  // The browser validates the card and sends only brand/last4/name. Raw PAN or CVV is rejected outright.
  if (raw.cardNumber || raw.cardCvv || raw.cvv || raw.cardNumberEncrypted) {
    return {
      error:
        'For your security, full card numbers and CVV are never accepted by Rentique. Only the card brand, last four digits and cardholder name are shared.'
    };
  }

  if (method === 'UPI') {
    const upiId = String(raw.upiId || '').trim();
    if (!UPI_REGEX.test(upiId)) {
      return { error: 'Enter a valid UPI ID, for example name@okhdfcbank.' };
    }
    const handle = upiId.split('@')[1];
    return {
      payment: {
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESS',
        paymentGateway: 'Rentique DemoPay · UPI',
        maskedInstrument: `${upiId.slice(0, 2)}***@${handle}`,
        upiHandle: `@${handle}`,
        gatewayReference: `DEMO-UPI-${Date.now()}`
      }
    };
  }

  if (method === 'CARD') {
    const cardLast4 = String(raw.cardLast4 || '').replace(/\D/g, '');
    if (!/^\d{4}$/.test(cardLast4)) {
      return { error: 'Card details are incomplete. Re-enter the card in the checkout form.' };
    }
    const cardBrand = String(raw.cardBrand || '').toUpperCase();
    if (!CARD_BRANDS.includes(cardBrand)) {
      return { error: 'Unsupported card network. Use Visa, Mastercard, RuPay, Amex or Diners.' };
    }
    const cardHolderName = String(raw.cardHolderName || '').trim().replace(/\s+/g, ' ');
    if (cardHolderName.length < 2 || cardHolderName.length > 80) {
      return { error: 'Enter the name printed on the card.' };
    }
    return {
      payment: {
        paymentMethod: 'CARD',
        paymentStatus: 'SUCCESS',
        paymentGateway: 'Rentique DemoPay · Card',
        maskedInstrument: `${cardBrand} •••• ${cardLast4}`,
        gatewayReference: `DEMO-CARD-${Date.now()}`
      }
    };
  }

  if (!serviceability.codAvailable) {
    return { error: 'Cash on delivery is not available for this pincode. Choose UPI or card.' };
  }

  return {
    payment: {
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      paymentGateway: 'Cash on Delivery',
      maskedInstrument: 'Cash on delivery',
      gatewayReference: `COD-${Date.now()}`
    }
  };
};

const getCustomer = (req) => store.findUserById(req.user._id) || req.user;

const buildPricing = (product, user, days) => {
  const trustScore = Number(user?.trustScore);
  const isTrustedRenter = (Number.isFinite(trustScore) ? trustScore : 95) >= 90;
  const loyalty = pricingService.determineLoyaltyTier(user?.successfulReturns || 0);
  const pricing = pricingService.calculateRentalPricing(
    product.actualPrice,
    loyalty.discountPercent,
    isTrustedRenter,
    days
  );
  return { pricing, loyalty, isTrustedRenter };
};

const parseDuration = (value) => {
  const days = Number.parseInt(value, 10);
  return Number.isInteger(days) && days >= 1 && days <= 30 ? days : null;
};

exports.getQuote = (req, res) => {
  try {
    const product = store.findProductById(req.query.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (!product.available) {
      return res.status(400).json({ success: false, message: 'This item is currently out on rent or under maintenance.' });
    }

    const days = parseDuration(req.query.rentalDurationDays || 3);
    if (!days) {
      return res.status(400).json({ success: false, message: 'Rental duration must be between 1 and 30 days.' });
    }

    const user = getCustomer(req);
    const { pricing, loyalty, isTrustedRenter } = buildPricing(product, user, days);

    res.json({
      success: true,
      quote: {
        productId: product._id,
        rentalDurationDays: days,
        pricing,
        loyalty,
        isTrustedRenter,
        dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const { productId, rentalDurationDays = 3, startDate = new Date(), refundPreference = 'APP_WALLET' } = req.body;

    const customerId = req.user._id;
    const user = getCustomer(req);
    const product = store.findProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (!product.available) {
      return res.status(400).json({ success: false, message: 'This item is currently out on rent or under maintenance.' });
    }

    const days = parseDuration(rentalDurationDays);
    if (!days) {
      return res.status(400).json({ success: false, message: 'Rental duration must be between 1 and 30 days.' });
    }

    const { delivery, serviceability, error: deliveryError } = parseDelivery(req.body.delivery);
    if (deliveryError) {
      return res.status(400).json({ success: false, message: deliveryError, serviceability });
    }

    const { payment, error: paymentError } = parsePayment(req.body.payment, serviceability);
    if (paymentError) {
      return res.status(400).json({ success: false, message: paymentError });
    }

    const productSizes = (Array.isArray(product.size) ? product.size : product.size ? [product.size] : [])
      .map((value) => String(value).trim())
      .filter(Boolean);
    let size = String(req.body.size || '').trim();
    if (!size) size = productSizes[0] || 'Free Size';
    if (productSizes.length) {
      const matchedSize = productSizes.find((option) => option.toLowerCase() === size.toLowerCase());
      if (!matchedSize) {
        return res.status(400).json({
          success: false,
          message: `Choose an available size: ${productSizes.join(', ')}.`
        });
      }
      size = matchedSize;
    }

    const isCod = payment.paymentMethod === 'COD';
    // COD means no card/UPI source to refund to, so the deposit always returns to the app wallet.
    const finalRefundPreference = isCod
      ? 'APP_WALLET'
      : ['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'].includes(refundPreference)
        ? refundPreference
        : 'APP_WALLET';

    const { pricing, loyalty } = buildPricing(product, user, days);

    const start = new Date(startDate);
    const due = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

    const rental = store.createRental(
      {
        productId: product._id,
        customerId: user._id,
        deliveryPartnerId: '65e000000000000000000002', // Auto-assign default test logistics partner
        rentalDurationDays: days,
        startDate: start,
        dueDate: due,
        size,
        delivery,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        loyaltyTier: loyalty.tier,
        pricing: {
          actualPrice: product.actualPrice,
          rentalPrice: pricing.rentalPrice,
          securityDeposit: pricing.securityDeposit,
          totalPaidInitial: pricing.customerInitialPayment,
          lateFee: 0,
          lateDays: 0,
          damageFee: 0,
          calculatedRefund: pricing.securityDeposit
        },
        refundPreference: finalRefundPreference
      },
      payment
    );

    store.updateUser(user._id, {
      totalRentals: (user.totalRentals || 0) + 1
    });

    const paymentSummary = isCod
      ? `Keep ${formatINR(pricing.customerInitialPayment)} ready in cash for delivery. Your security deposit will be refunded to your Rentique wallet after inspection.`
      : `Payment of ${formatINR(pricing.customerInitialPayment)} received via ${
          payment.paymentMethod === 'UPI' ? 'UPI' : 'card'
        }. Your security deposit will be refunded to ${
          finalRefundPreference === 'APP_WALLET' ? 'your Rentique wallet' : 'your original payment source'
        }.`;

    store.addNotification(
      user._id,
      `Rental ${rental.rentalNumber} Confirmed!`,
      `${product.title} (size ${size}) is reserved for ${days} days. ${paymentSummary}`
    );

    res.status(201).json({
      success: true,
      message: isCod ? 'Order confirmed — pay on delivery.' : 'Payment successful — rental booked!',
      rental: mediaService.applyToRental(rental)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyRentals = async (req, res) => {
  try {
    const rentals = store.getRentals({ customerId: req.user._id });
    res.json({
      success: true,
      count: rentals.length,
      rentals: rentals.map((rental) => mediaService.applyToRental(rental))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = store.getRentals();
    res.json({
      success: true,
      count: rentals.length,
      rentals: rentals.map((rental) => mediaService.applyToRental(rental))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRentalById = async (req, res) => {
  try {
    const rental = store.findRentalById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Role check: Only customer owner, delivery partner, or admin can access
    if (req.user.role === 'CUSTOMER' && String(rental.customerId?._id || rental.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this rental.' });
    }

    res.json({
      success: true,
      rental: mediaService.applyToRental(rental)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Refund Preference UI update:
 * Allow the customer to change their preference before the refund is processed
 */
exports.updateRefundPreference = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundPreference } = req.body;

    if (!['APP_WALLET', 'ORIGINAL_PAYMENT_METHOD'].includes(refundPreference)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preference. Must be APP_WALLET or ORIGINAL_PAYMENT_METHOD.'
      });
    }

    const rental = store.findRentalById(id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Refund has been processed. Preference cannot be altered.'
      });
    }

    if (rental.paymentMethod === 'COD') {
      return res.status(400).json({
        success: false,
        message: 'Cash-on-delivery orders always refund the deposit to the Rentique wallet.'
      });
    }

    const updated = store.updateRental(rental._id, { refundPreference });

    res.json({
      success: true,
      message: `Refund preference updated to ${refundPreference === 'APP_WALLET' ? 'App Wallet' : 'Original Payment Method'}.`,
      rental: mediaService.applyToRental(updated)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
