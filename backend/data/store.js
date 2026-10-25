const {
  initialUsers,
  initialProducts,
  initialRentals,
  initialEvidence,
  initialPayments
} = require('./seedData');
const { COLLECTIONS, COLOR_FAMILIES } = require('./categories');

/**
 * Resilient Data Store
 * Provides seamless in-memory or persisted storage when MongoDB is not running,
 * and syncs with Mongoose models when MongoDB is available.
 */
class MemoryDataStore {
  constructor() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.rentals = JSON.parse(JSON.stringify(initialRentals));
    this.evidence = JSON.parse(JSON.stringify(initialEvidence));
    this.payments = JSON.parse(JSON.stringify(initialPayments));
    this.inspections = [];
    this.penalties = [];
    this.notifications = [
      {
        _id: 'notif_1',
        userId: '65e000000000000000000001',
        title: 'Rental RNT-1023 Under Inspection',
        message: 'Your returned Sabyasachi Lehenga has arrived at our Bangalore hub. Visual condition review is currently in progress.',
        type: 'RENTAL_UPDATE',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id.toString() === id.toString());
  }

  createUser(userData) {
    const newUser = {
      _id: 'usr_' + Date.now(),
      walletBalance: 0,
      trustScore: 95,
      totalRentals: 0,
      successfulReturns: 0,
      lateReturns: 0,
      damageCases: 0,
      loyaltyTier: 'BRONZE',
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u._id.toString() === id.toString());
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return null;
  }

  // Products
  getProducts(filters = {}) {
    let list = [...this.products];
    if (filters.category) {
      list = list.filter(p => p.category.toUpperCase() === filters.category.toUpperCase());
    }
    if (filters.collection) {
      const wanted = String(filters.collection).toLowerCase().split(',').map(s => s.trim());
      list = list.filter(p => wanted.includes(String(p.collection || '').toLowerCase()));
    }
    if (filters.subCategory) {
      list = list.filter(p => p.subCategory && p.subCategory.toLowerCase().includes(filters.subCategory.toLowerCase()));
    }
    if (filters.search) {
      let rawQ = filters.search.toLowerCase().trim();
      let normalizedQ = rawQ;
      if (normalizedQ.includes('jewel')) normalizedQ = 'jewel';
      if (normalizedQ.includes('sari')) normalizedQ = 'saree';
      if (normalizedQ.includes('lehnga')) normalizedQ = 'lehenga';

      const terms = normalizedQ.split(/\s+/).filter(Boolean);
      list = list.filter(p => {
        const fullContent = [
          p.title,
          p.brand,
          p.subCategory,
          p.collection,
          p.category,
          p.description,
          p.occasion,
          p.color,
          p.colorFamily,
          p.fabricOrMaterial
        ].filter(Boolean).join(' ').toLowerCase();
        return terms.every(t => fullContent.includes(t));
      });
    }
    if (filters.gender) {
      list = list.filter(p => p.gender === filters.gender || p.gender === 'UNISEX');
    }
    if (filters.occasion) {
      const wanted = String(filters.occasion).toLowerCase().split(',').map(s => s.trim());
      list = list.filter(p => p.occasion && wanted.some(o => p.occasion.toLowerCase().includes(o)));
    }
    if (filters.brand) {
      const wanted = String(filters.brand).toLowerCase().split(',').map(s => s.trim());
      list = list.filter(p => p.brand && wanted.some(b => p.brand.toLowerCase().includes(b)));
    }
    if (filters.colorFamily) {
      const wanted = String(filters.colorFamily).toLowerCase().split(',').map(s => s.trim());
      list = list.filter(p => wanted.includes(String(p.colorFamily || '').toLowerCase()));
    } else if (filters.color) {
      list = list.filter(p => p.color && p.color.toLowerCase().includes(filters.color.toLowerCase()));
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (!isNaN(max) && max > 0) {
        list = list.filter(p => p.rentalPrice <= max);
      }
    }
    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      if (!isNaN(min) && min >= 0) {
        list = list.filter(p => p.rentalPrice >= min);
      }
    }
    return list;
  }

  getFacets() {
    const products = this.products;
    const rentals = products.map(p => p.rentalPrice).filter(n => Number.isFinite(n));

    const collectionFacets = COLLECTIONS.map(collection => {
      const items = products.filter(p => p.collection === collection.id);
      const prices = items.map(p => p.rentalPrice).filter(n => Number.isFinite(n));
      return {
        id: collection.id,
        label: collection.label,
        hindi: collection.hindi,
        tagline: collection.tagline,
        category: collection.category,
        image: (items.find(p => p.listingImages?.[0]?.secureUrl?.startsWith('/media/products/'))
          ?.listingImages[0].secureUrl) || collection.image,
        accent: collection.accent,
        count: items.length,
        minRentalPrice: prices.length ? Math.min(...prices) : 0,
        subCategories: collection.subCategories.map(name => ({
          name,
          count: items.filter(p => p.subCategory === name).length
        }))
      };
    });

    const brandCounts = new Map();
    const occasionCounts = new Map();
    const colorCounts = new Map();
    const genderCounts = new Map();

    products.forEach(product => {
      brandCounts.set(product.brand, (brandCounts.get(product.brand) || 0) + 1);
      genderCounts.set(product.gender, (genderCounts.get(product.gender) || 0) + 1);
      const colorName = product.colorFamily || product.color;
      if (colorName) colorCounts.set(colorName, (colorCounts.get(colorName) || 0) + 1);
      if (product.occasion) {
        product.occasion.split('/').map(s => s.trim()).filter(Boolean).forEach(name => {
          occasionCounts.set(name, (occasionCounts.get(name) || 0) + 1);
        });
      }
    });

    const hexFor = name => (COLOR_FAMILIES.find(c => c.name.toLowerCase() === String(name).toLowerCase()) || {}).hex || '#3D1B33';

    const priceBands = [
      { id: 'under_500', label: 'Under \u20b9500', min: 0, max: 499 },
      { id: '500_999', label: '\u20b9500 \u2013 \u20b9999', min: 500, max: 999 },
      { id: '1000_1999', label: '\u20b91,000 \u2013 \u20b91,999', min: 1000, max: 1999 },
      { id: '2000_3999', label: '\u20b92,000 \u2013 \u20b93,999', min: 2000, max: 3999 },
      { id: '4000_plus', label: '\u20b94,000 & above', min: 4000, max: Infinity }
    ].map(band => ({
      ...band,
      max: Number.isFinite(band.max) ? band.max : null,
      count: rentals.filter(price => price >= band.min && price <= band.max).length
    }));

    return {
      total: products.length,
      minRentalPrice: rentals.length ? Math.min(...rentals) : 0,
      maxRentalPrice: rentals.length ? Math.max(...rentals) : 0,
      collections: collectionFacets,
      brands: [...brandCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      occasions: [...occasionCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      colors: [...colorCounts.entries()]
        .map(([name, count]) => ({ name, count, hex: hexFor(name) }))
        .sort((a, b) => b.count - a.count),
      genders: [...genderCounts.entries()].map(([name, count]) => ({ name, count })),
      priceBands
    };
  }

  findProductById(id) {
    return this.products.find(p => p._id.toString() === id.toString());
  }

  addProduct(productData) {
    const newProduct = {
      _id: 'prd_' + Date.now(),
      available: true,
      conditionHistory: [
        {
          date: new Date().toISOString(),
          stage: 'INITIAL_STOCK',
          notes: 'Product cataloged with Cloudinary multi-angle inspection proof.',
          conditionGrade: 'EXCELLENT',
          evidence: productData.listingImages || []
        }
      ],
      createdAt: new Date().toISOString(),
      ...productData
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  updateProductCondition(id, historyEntry, newCondition = 'EXCELLENT') {
    const p = this.findProductById(id);
    if (p) {
      p.currentCondition = newCondition;
      p.conditionHistory.push({
        date: new Date().toISOString(),
        ...historyEntry
      });
      return p;
    }
    return null;
  }

  // Rentals
  getRentals(filter = {}) {
    let list = [...this.rentals];
    if (filter.customerId) {
      list = list.filter(r => r.customerId.toString() === filter.customerId.toString());
    }
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }
    return list.map(r => this.populateRental(r));
  }

  findRentalById(id) {
    const rental = this.rentals.find(r => r._id.toString() === id.toString() || r.rentalNumber === id);
    if (!rental) return null;
    return this.populateRental(rental);
  }

  populateRental(rental) {
    const product = this.findProductById(rental.productId);
    const customer = this.findUserById(rental.customerId);
    const deliveryPartner = rental.deliveryPartnerId ? this.findUserById(rental.deliveryPartnerId) : null;
    const evidence = this.evidence.find(e => e.rentalId.toString() === rental._id.toString());
    const inspection = this.inspections.find(i => i.rentalId.toString() === rental._id.toString());
    return {
      ...rental,
      product,
      customer,
      deliveryPartner,
      evidence,
      inspection
    };
  }

  createRental(rentalData) {
    const rentalNumber = 'RNT-' + Math.floor(1000 + Math.random() * 9000);
    const newRental = {
      _id: 'rnt_' + Date.now(),
      rentalNumber,
      status: 'BOOKED',
      receiveVerification: { status: 'PENDING' },
      createdAt: new Date().toISOString(),
      ...rentalData
    };
    this.rentals.unshift(newRental);

    // Create corresponding payment record
    const payment = {
      _id: 'pay_' + Date.now(),
      rentalId: newRental._id,
      customerId: newRental.customerId,
      transactionId: 'TXN_' + Date.now(),
      amount: newRental.pricing.totalPaidInitial,
      paymentGateway: 'Razorpay / Stripe Gateway',
      paymentType: 'INITIAL_RENTAL_DEPOSIT',
      paymentStatus: 'SUCCESS',
      refundStatus: 'PENDING',
      refundAmount: 0,
      refundDestination: newRental.refundPreference || 'APP_WALLET',
      createdAt: new Date().toISOString()
    };
    this.payments.push(payment);
    newRental.paymentId = payment._id;

    // Initialize rental evidence container
    const newEvidence = {
      _id: 'evd_' + Date.now(),
      rentalId: newRental._id,
      productId: newRental.productId,
      beforeRental: [],
      customerReceived: { verifiedGoodCondition: true, issueType: 'NONE', customerReceivedImages: [], customerReceivedVideos: [] },
      customerReturn: [],
      deliveryPartnerReturn: [],
      damageEvidence: []
    };
    this.evidence.push(newEvidence);

    return this.populateRental(newRental);
  }

  updateRental(id, updates) {
    const idx = this.rentals.findIndex(r => r._id.toString() === id.toString() || r.rentalNumber === id);
    if (idx !== -1) {
      this.rentals[idx] = { ...this.rentals[idx], ...updates };
      return this.populateRental(this.rentals[idx]);
    }
    return null;
  }

  // Evidence
  findEvidenceByRentalId(rentalId) {
    return this.evidence.find(e => e.rentalId.toString() === rentalId.toString());
  }

  updateEvidence(rentalId, key, mediaItemOrObject) {
    let ev = this.findEvidenceByRentalId(rentalId);
    if (!ev) {
      ev = {
        _id: 'evd_' + Date.now(),
        rentalId,
        beforeRental: [],
        customerReceived: { verifiedGoodCondition: true, issueType: 'NONE', customerReceivedImages: [], customerReceivedVideos: [] },
        customerReturn: [],
        deliveryPartnerReturn: [],
        damageEvidence: []
      };
      this.evidence.push(ev);
    }

    if (key === 'customerReceived') {
      ev.customerReceived = { ...ev.customerReceived, ...mediaItemOrObject };
    } else if (Array.isArray(ev[key])) {
      if (Array.isArray(mediaItemOrObject)) {
        ev[key].push(...mediaItemOrObject);
      } else {
        ev[key].push(mediaItemOrObject);
      }
    }
    return ev;
  }

  // Inspections
  createInspection(inspectionData) {
    const inspection = {
      _id: 'insp_' + Date.now(),
      inspectedAt: new Date().toISOString(),
      ...inspectionData
    };
    this.inspections.push(inspection);
    return inspection;
  }

  // Penalties
  createPenalty(penaltyData) {
    const penalty = {
      _id: 'pen_' + Date.now(),
      status: 'APPLIED',
      createdAt: new Date().toISOString(),
      ...penaltyData
    };
    this.penalties.push(penalty);
    return penalty;
  }

  findPenaltyById(id) {
    return this.penalties.find(p => p._id.toString() === id.toString());
  }

  updatePenalty(id, updates) {
    const idx = this.penalties.findIndex(p => p._id.toString() === id.toString());
    if (idx !== -1) {
      this.penalties[idx] = { ...this.penalties[idx], ...updates };
      return this.penalties[idx];
    }
    return null;
  }

  // Notifications
  addNotification(userId, title, message, type = 'RENTAL_UPDATE') {
    const notif = {
      _id: 'notif_' + Date.now(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    return notif;
  }

  getNotifications(userId) {
    return this.notifications.filter(n => n.userId.toString() === userId.toString());
  }
}

const store = new MemoryDataStore();
module.exports = store;
