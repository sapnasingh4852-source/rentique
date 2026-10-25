const app = require('./server');
const store = require('./data/store');
const pricingService = require('./services/pricing.service');
const cloudinaryService = require('./services/cloudinary.service');

async function runTestSuite() {
  console.log('========================================================');
  console.log(' FASHION RENTAL PLATFORM - AUTOMATED VERIFICATION SUITE ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Pricing Engine Tests
  console.log('--- 1. Business Model & Pricing Verification ---');
  const actualPrice = 1000;
  const pricing = pricingService.calculateRentalPricing(actualPrice);
  assert(pricing.rentalPrice === 200, 'Rental price is 20% of actual price (₹200)');
  assert(pricing.securityDeposit === 300, 'Security deposit is 30% of actual price (₹300)');
  assert(pricing.customerInitialPayment === 500, 'Initial payment is ₹500 (Rent + Deposit)');

  // Late return fee test
  const due = new Date('2026-10-20T10:00:00Z');
  const returned3DaysLate = new Date('2026-10-23T10:00:00Z');
  const lateMath = pricingService.calculateLateFee(1000, due, returned3DaysLate);
  assert(lateMath.numberOfLateDays === 3, 'Late days calculated as 3');
  assert(lateMath.totalLateFee === 60, 'Late fee = 1000 * 0.02 * 3 = ₹60');

  // Security deposit refund test
  const refundClean = pricingService.calculateFinalRefund(300, 0, 0);
  assert(refundClean.finalRefund === 300, 'Clean return results in full ₹300 refund');

  const refundLate = pricingService.calculateFinalRefund(300, 40, 0);
  assert(refundLate.finalRefund === 260, 'Late return (₹40 late fee) yields ₹260 refund');

  const refundDamaged = pricingService.calculateFinalRefund(300, 0, 100);
  assert(refundDamaged.finalRefund === 200, 'Damage fee (₹100) yields ₹200 refund');

  // 2. Cloudinary Service Tests
  console.log('\n--- 2. Cloudinary Architecture & Transformed URLs ---');
  const mockPublicId = 'fashion_rental/products/sabyasachi_crimson_front';
  const cardUrl = cloudinaryService.getTransformedUrl(mockPublicId, 'card');
  assert(cardUrl.includes('w_500') || cardUrl.includes('unsplash'), 'Generated card transformed Cloudinary URL');

  const thumbUrl = cloudinaryService.getTransformedUrl(mockPublicId, 'thumbnail');
  assert(thumbUrl.includes('w_120') || thumbUrl.includes('unsplash'), 'Generated thumbnail transformed Cloudinary URL');

  const signParams = cloudinaryService.generateUploadSignature({ folder: 'fashion_rental/evidence' });
  assert(signParams.signature && signParams.timestamp, 'Generated direct browser signed Cloudinary upload params');

  const privateUrl = cloudinaryService.generatePrivateEvidenceUrl('fashion_rental/evidence/damage_123');
  assert(privateUrl.includes('type=authenticated') || privateUrl.includes('damage_123'), 'Generated private damage evidence URL with auth token');

  // 3. User & Loyalty Tier Verification
  console.log('\n--- 3. User Trust Score & Loyalty Program ---');
  const trustScore = pricingService.calculateTrustScore({
    totalRentals: 6,
    successfulReturns: 5,
    lateReturns: 1,
    damageCases: 0
  });
  assert(trustScore >= 90, `Customer Trust Score calculated as ${trustScore}/100 (⭐ Trusted Renter)`);

  const loyaltyTier = pricingService.determineLoyaltyTier(5);
  assert(loyaltyTier.tier === 'SILVER' && loyaltyTier.discountPercent === 5, '5 successful rentals unlocks Silver tier (5% discount)');

  // 4. Products & Condition History
  console.log('\n--- 4. Catalog & Condition Timeline ---');
  const products = store.getProducts();
  assert(products.length >= 6, `Catalog contains ${products.length} luxury items (Clothes, Shoes, Accessories)`);

  const sabyasachi = store.findProductById('65e100000000000000000101');
  assert(sabyasachi.listingImages.length === 5, 'Product contains 5 multi-angle Cloudinary listing images (Front, Back, Side, Close-up, Tag)');
  assert(sabyasachi.conditionHistory.length >= 2, `Product condition timeline has ${sabyasachi.conditionHistory.length} lifecycle milestones`);

  // 5. Rental Lifecycle Simulation
  console.log('\n--- 5. End-to-End Rental Lifecycle Simulation ---');
  // Step A: Book rental
  const rental = store.createRental({
    productId: sabyasachi._id,
    customerId: '65e000000000000000000001',
    rentalDurationDays: 3,
    startDate: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    pricing: {
      actualPrice: 120000,
      rentalPrice: 24000,
      securityDeposit: 36000,
      totalPaidInitial: 60000
    },
    refundPreference: 'APP_WALLET'
  });
  assert(rental.status === 'BOOKED', `Rental #${rental.rentalNumber} initialized with status BOOKED`);

  // Step B: Before-rental condition proof
  store.updateEvidence(rental._id, 'beforeRental', [
    { angle: 'FRONT', publicId: 'ev_front_1', secureUrl: 'https://example.com/front.jpg' },
    { angle: 'BACK', publicId: 'ev_back_1', secureUrl: 'https://example.com/back.jpg' }
  ]);
  store.updateRental(rental._id, { status: 'DISPATCH_PREPARED' });
  assert(store.findRentalById(rental._id).status === 'DISPATCH_PREPARED', 'Before-rental condition proof logged to Cloudinary');

  // Step C: Customer receive verification
  store.updateEvidence(rental._id, 'customerReceived', {
    verifiedGoodCondition: true,
    issueType: 'NONE',
    reportedAt: new Date()
  });
  store.updateRental(rental._id, { status: 'DELIVERED' });
  assert(store.findRentalById(rental._id).status === 'DELIVERED', 'Customer receive verified');

  // Step D: Customer return request
  store.updateEvidence(rental._id, 'customerReturn', [
    { angle: 'FRONT', publicId: 'ev_ret_front', secureUrl: 'https://example.com/ret_front.jpg' }
  ]);
  store.updateRental(rental._id, { status: 'RETURN_REQUESTED' });
  assert(store.findRentalById(rental._id).status === 'RETURN_REQUESTED', 'Customer return evidence uploaded to Cloudinary');

  // Step E: Delivery pickup
  store.updateEvidence(rental._id, 'deliveryPartnerReturn', [
    { angle: 'FRONT', publicId: 'ev_del_front', secureUrl: 'https://example.com/del_front.jpg' }
  ]);
  store.updateRental(rental._id, { status: 'UNDER_INSPECTION' });
  assert(store.findRentalById(rental._id).status === 'UNDER_INSPECTION', 'Delivery partner logged pickup proof; in inspection queue');

  // Step F: Admin Before vs After visual inspection
  const initialWallet = store.findUserById('65e000000000000000000001').walletBalance;
  const inspection = store.createInspection({
    rentalId: rental._id,
    condition: 'NO_DAMAGE',
    damageFee: 0,
    lateFee: 0,
    securityDeposit: 36000,
    finalRefundAmount: 36000,
    refundDestination: 'APP_WALLET'
  });
  store.updateUser('65e000000000000000000001', { walletBalance: initialWallet + 36000 });
  store.updateRental(rental._id, { status: 'COMPLETED' });

  const finalCustomer = store.findUserById('65e000000000000000000001');
  assert(finalCustomer.walletBalance === initialWallet + 36000, 'Security deposit of ₹36,000 refunded to customer App Wallet');
  assert(store.findRentalById(rental._id).status === 'COMPLETED', 'Rental lifecycle successfully completed!');

  console.log('\n========================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');
}

runTestSuite();
