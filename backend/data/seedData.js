const bcrypt = require('bcryptjs');

/**
 * Seed data for Rentique — India's Premier Wardrobe Rental Platform
 * Indian ethnic wear, bridal lehengas, festive sarees, royal sherwanis,
 * heritage jewellery, and luxury accessories with multi-angle Cloudinary imagery
 * and verified visual condition proofs.
 * 
 * Rental pricing follows the Rentique model: 20% of MRP per 3-day tenure,
 * plus a 30% security deposit held in the customer wallet and refunded on return.
 */

const salt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync('Password@123', salt);

const initialUsers = [
  {
    _id: '65e000000000000000000001',
    name: 'Ananya Sharma',
    email: 'ananya@customer.com',
    password: defaultPasswordHash,
    role: 'CUSTOMER',
    phone: '+91 98765 43210',
    address: {
      street: 'Flat 402, Prestige Palms, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    walletBalance: 2450,
    trustScore: 96,
    totalRentals: 6,
    successfulReturns: 5,
    lateReturns: 1,
    damageCases: 0,
    loyaltyTier: 'SILVER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: '65e000000000000000000002',
    name: 'Vikram Singh (Express Logistics)',
    email: 'vikram@delivery.com',
    password: defaultPasswordHash,
    role: 'DELIVERY_PARTNER',
    phone: '+91 91234 56789',
    address: {
      street: 'Hub #4, Koramangala Logistics Zone',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034'
    },
    walletBalance: 0,
    trustScore: 99,
    totalRentals: 42,
    successfulReturns: 42,
    lateReturns: 0,
    damageCases: 0,
    loyaltyTier: 'GOLD',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: '65e000000000000000000003',
    name: 'Pooja Mehta (Rentique Boutique Partner)',
    email: 'admin@fashionrental.com',
    password: defaultPasswordHash,
    role: 'ADMIN',
    phone: '+91 99887 76655',
    address: {
      street: 'Royal Wardrobe Boutique Hub, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    walletBalance: 28500,
    trustScore: 100,
    totalRentals: 120,
    successfulReturns: 120,
    lateReturns: 0,
    damageCases: 0,
    loyaltyTier: 'PLATINUM',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  }
];


// Load the modular, categorized 136-SKU Indian luxury & ethnic catalogue
const { allProducts } = require('./products');

const initialProducts = allProducts;

const initialRentals = [
  {
    _id: '65e200000000000000000201',
    rentalNumber: 'RNT-1023',
    productId: '65e100000000000000000101', // Sabyasachi Lehenga
    customerId: '65e000000000000000000001', // Ananya
    deliveryPartnerId: '65e000000000000000000002', // Vikram
    rentalDurationDays: 3,
    startDate: new Date('2026-10-20T10:00:00Z'),
    dueDate: new Date('2026-10-23T18:00:00Z'),
    returnedDate: new Date('2026-10-24T12:00:00Z'), // 1 day late
    status: 'UNDER_INSPECTION', // In inspection queue ready for Before vs After review!
    pricing: {
      actualPrice: 19999,
      rentalPrice: 4000,
      securityDeposit: 6000,
      totalPaidInitial: 10000,
      lateFee: 400,
      lateDays: 1,
      damageFee: 0,
      calculatedRefund: 5600
    },
    refundPreference: 'APP_WALLET',
    receiveVerification: {
      status: 'RECEIVED_CORRECTLY',
      verifiedAt: new Date('2026-10-20T14:30:00Z')
    }
  },
  {
    _id: '65e200000000000000000202',
    rentalNumber: 'RNT-1024',
    productId: '65e100000000000000000102', // Manyavar Sherwani
    customerId: '65e000000000000000000001',
    deliveryPartnerId: '65e000000000000000000002',
    rentalDurationDays: 4,
    startDate: new Date('2026-10-22T09:00:00Z'),
    dueDate: new Date('2026-10-26T18:00:00Z'),
    status: 'DELIVERED', // Customer currently enjoying the outfit
    pricing: {
      actualPrice: 14999,
      rentalPrice: 3000,
      securityDeposit: 4500,
      totalPaidInitial: 7500,
      lateFee: 0,
      lateDays: 0,
      damageFee: 0,
      calculatedRefund: 4500
    },
    refundPreference: 'ORIGINAL_PAYMENT_METHOD',
    receiveVerification: {
      status: 'PENDING'
    }
  }
];

const initialEvidence = [
  {
    _id: '65e300000000000000000301',
    rentalId: '65e200000000000000000201',
    productId: '65e100000000000000000101',
    beforeRental: [
      {
        angle: 'FRONT',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        secureUrl: '/media/products/65e100000000000000000101-front.jpg',
        resourceType: 'image',
        uploadedByRole: 'ADMIN',
        caption: 'Pristine front embroidery. Verified by Boutique Admin Pooja before dispatch.'
      },
      {
        angle: 'BACK',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_back',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_back',
        secureUrl: '/media/products/65e100000000000000000101-back.jpg',
        resourceType: 'image',
        uploadedByRole: 'ADMIN',
        caption: 'Back hooks, dori and tassels verified 100% intact.'
      },
      {
        angle: 'SIDE',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_side',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_side',
        secureUrl: '/media/products/65e100000000000000000101-side.jpg',
        resourceType: 'image',
        uploadedByRole: 'ADMIN',
        caption: 'Side silhouette and flare panels clean, no frays.'
      },
      {
        angle: 'CLOSEUP',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_closeup',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_closeup',
        secureUrl: '/media/products/65e100000000000000000101-closeup.jpg',
        resourceType: 'image',
        uploadedByRole: 'ADMIN',
        caption: 'High resolution zardozi border macro shot.'
      },
      {
        angle: 'TAG',
        publicId: 'rentique/brand/authenticity-card',
        cloudinaryPublicId: 'rentique/brand/authenticity-card',
        secureUrl: '/media/brand/authenticity-tag.jpg',
        resourceType: 'image',
        uploadedByRole: 'ADMIN',
        caption: 'Rentique authenticity tag sealed to the garment bag.'
      }
    ],
    customerReceived: {
      verifiedGoodCondition: true,
      issueType: 'NONE',
      issueDescription: 'Received in luxury vacuum-sealed garment bag. Looks breathtaking!',
      reportedAt: new Date('2026-10-20T14:30:00Z'),
      customerReceivedImages: [
        {
          angle: 'FRONT',
          publicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
          cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
          secureUrl: '/media/products/65e100000000000000000101-front.jpg',
          resourceType: 'image',
          uploadedByRole: 'CUSTOMER'
        }
      ],
      customerReceivedVideos: []
    },
    customerReturn: [
      {
        angle: 'FRONT',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        secureUrl: '/media/products/65e100000000000000000101-front.jpg',
        resourceType: 'image',
        uploadedByRole: 'CUSTOMER',
        caption: 'Customer packed the lehenga into the protective garment bag.'
      },
      {
        angle: 'BACK',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_back',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_back',
        secureUrl: '/media/products/65e100000000000000000101-back.jpg',
        resourceType: 'image',
        uploadedByRole: 'CUSTOMER',
        caption: 'Back dori and hooks returned intact.'
      },
      {
        angle: 'CLOSEUP',
        publicId: 'rentique/evidence/rnt1023_return_closeup',
        cloudinaryPublicId: 'rentique/evidence/rnt1023_return_closeup',
        secureUrl: '/media/evidence/rnt1023-return-stain.jpg',
        resourceType: 'image',
        uploadedByRole: 'CUSTOMER',
        caption: 'Small mark noticed on the left dupatta fall during return packing.'
      }
    ],
    deliveryPartnerReturn: [
      {
        angle: 'FRONT',
        notes: 'Collected from customer Ananya at Indiranagar. Handover bag sealed.',
        publicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        cloudinaryPublicId: 'rentique/catalog/lehengas/65e100000000000000000101_front',
        secureUrl: '/media/products/65e100000000000000000101-front.jpg',
        resourceType: 'image',
        uploadedByRole: 'DELIVERY_PARTNER'
      }
    ],
    damageEvidence: [
      {
        description: 'Light oil spot on lower dupatta fall (approx 2 cm)',
        publicId: 'rentique/evidence/rnt1023_return_closeup',
        cloudinaryPublicId: 'rentique/evidence/rnt1023_return_closeup',
        secureUrl: '/media/evidence/rnt1023-return-stain.jpg',
        resourceType: 'image',
        isPrivate: true
      }
    ]
  }
];

const initialPayments = [
  {
    _id: '65e400000000000000000401',
    rentalId: '65e200000000000000000201',
    customerId: '65e000000000000000000001',
    transactionId: 'TXN_RENT_1023_INIT_78942',
    amount: 10000,
    paymentGateway: 'Razorpay Enterprise / UPI',
    paymentType: 'INITIAL_RENTAL_DEPOSIT',
    paymentStatus: 'SUCCESS',
    refundStatus: 'PENDING',
    refundAmount: 0,
    refundDestination: 'APP_WALLET'
  }
];

module.exports = {
  initialUsers,
  initialProducts,
  initialRentals,
  initialEvidence,
  initialPayments
};
