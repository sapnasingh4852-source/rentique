const store = require('../data/store');
const cloudinaryService = require('../services/cloudinary.service');

/**
 * 1. Generate Cloudinary Signature for direct browser upload
 */
exports.getSignUploadParams = async (req, res) => {
  try {
    const { folder = 'fashion_rental/evidence', resourceType = 'image' } = req.body;
    const signParams = cloudinaryService.generateUploadSignature({
      folder,
      resource_type: resourceType
    });

    res.json({
      success: true,
      ...signParams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Before-Rental Condition Proof (Admin/Staff captures before dispatch)
 * Official condition proof before customer receives (Front, Back, Left, Right, Close-up)
 */
exports.uploadBeforeRentalEvidence = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { media = [] } = req.body;

    const rental = store.findRentalById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (!Array.isArray(media) || media.length === 0) {
      return res.status(400).json({ success: false, message: 'Condition photos (Front, Back, Left, Right, Close-up) are required.' });
    }

    const beforeRentalItems = media.map(item => ({
      angle: item.angle || 'FRONT',
      publicId: item.publicId || `fashion_rental/evidence/before_${rental.rentalNumber}_${item.angle || 'angle'}_${Date.now()}`,
      cloudinaryPublicId: item.publicId || `fashion_rental/evidence/before_${rental.rentalNumber}_${item.angle || 'angle'}_${Date.now()}`,
      secureUrl: item.secureUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      resourceType: item.resourceType || 'image',
      caption: item.caption || `Condition verified before dispatch. Angle: ${item.angle || 'FRONT'}`,
      uploadedByRole: 'ADMIN',
      uploadedAt: new Date()
    }));

    store.updateEvidence(rental._id, 'beforeRental', beforeRentalItems);
    const updatedRental = store.updateRental(rental._id, { status: 'DISPATCH_PREPARED' });

    // Also update product condition history
    store.updateProductCondition(rental.productId._id || rental.productId, {
      stage: 'BEFORE_RENTAL',
      rentalId: rental._id,
      customerName: rental.customer?.name || 'Customer',
      notes: `Pre-dispatch inspection passed (${beforeRentalItems.length} photos logged to Cloudinary).`,
      conditionGrade: 'EXCELLENT',
      evidence: beforeRentalItems
    }, 'EXCELLENT');

    res.json({
      success: true,
      message: 'Before-rental condition proof successfully recorded to Cloudinary.',
      rental: updatedRental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Customer Receive Verification (Did you receive in good condition?)
 * Options:
 * - RECEIVED_CORRECTLY
 * - DAMAGED
 * - DEFECTIVE
 * - WRONG_PRODUCT
 * - MISSING_ACCESSORY
 */
exports.submitCustomerReceiveVerification = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const {
      conditionStatus = 'RECEIVED_CORRECTLY',
      issueDescription = '',
      images = [],
      videos = []
    } = req.body;

    const rental = store.findRentalById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const isGood = conditionStatus === 'RECEIVED_CORRECTLY';

    // Format Cloudinary evidence items
    const customerImages = (images || []).map(img => ({
      angle: 'DEFECT',
      publicId: img.publicId || `fashion_rental/evidence/cust_recv_${rental.rentalNumber}_${Date.now()}`,
      cloudinaryPublicId: img.publicId || `fashion_rental/evidence/cust_recv_${rental.rentalNumber}_${Date.now()}`,
      secureUrl: img.secureUrl || 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
      resourceType: 'image',
      caption: issueDescription || 'Reported on delivery receive'
    }));

    const customerVideos = (videos || []).map(vid => ({
      angle: 'DEFECT',
      publicId: vid.publicId || `fashion_rental/evidence/cust_recv_vid_${rental.rentalNumber}_${Date.now()}`,
      cloudinaryPublicId: vid.publicId || `fashion_rental/evidence/cust_recv_vid_${rental.rentalNumber}_${Date.now()}`,
      secureUrl: vid.secureUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-seamstress-threading-a-needle-43187-large.mp4',
      resourceType: 'video',
      caption: issueDescription || 'Video evidence of defect'
    }));

    store.updateEvidence(rental._id, 'customerReceived', {
      verifiedGoodCondition: isGood,
      issueType: isGood ? 'NONE' : conditionStatus,
      issueDescription,
      reportedAt: new Date(),
      customerReceivedImages: customerImages,
      customerReceivedVideos: customerVideos
    });

    const updatedRental = store.updateRental(rental._id, {
      receiveVerification: {
        status: isGood ? 'RECEIVED_CORRECTLY' : 'ISSUE_REPORTED',
        verifiedAt: new Date()
      }
    });

    if (!isGood) {
      // 7-day Defective Product Policy trigger
      store.addNotification(
        '65e000000000000000000003', // Admin ID
        `⚠️ Defective Product Claim: ${rental.rentalNumber}`,
        `Customer reported ${conditionStatus}: "${issueDescription}". Review Cloudinary media evidence.`,
        'DEFECT_CLAIM'
      );
    }

    res.json({
      success: true,
      message: isGood
        ? 'Thank you! Enjoy your luxury rental.'
        : 'Your defect report and Cloudinary evidence have been escalated under the 7-Day Defective Product Policy.',
      rental: updatedRental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Customer Return Process (Upload return photos before pickup)
 * Front, Back, Side, Close-up, Damage (if any)
 */
exports.submitCustomerReturnEvidence = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { returnPhotos = [], notes = '' } = req.body;

    const rental = store.findRentalById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // A return only makes sense once the piece is with the customer; requesting
    // earlier would create a pickup job that conflicts with the outbound delivery.
    if (rental.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: `Return can only be requested after delivery. This rental is currently ${rental.status}.`
      });
    }

    const returnMedia = returnPhotos.map(p => ({
      angle: p.angle || 'FRONT',
      publicId: p.publicId || `fashion_rental/evidence/return_${rental.rentalNumber}_${p.angle || 'angle'}_${Date.now()}`,
      cloudinaryPublicId: p.publicId || `fashion_rental/evidence/return_${rental.rentalNumber}_${p.angle || 'angle'}_${Date.now()}`,
      secureUrl: p.secureUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      resourceType: 'image',
      caption: p.caption || notes || 'Customer return proof before pickup',
      uploadedAt: new Date(),
      uploadedByRole: 'CUSTOMER'
    }));

    store.updateEvidence(rental._id, 'customerReturn', returnMedia);
    const updatedRental = store.updateRental(rental._id, {
      status: 'RETURN_REQUESTED',
      returnedDate: new Date()
    });

    // Notify delivery partner
    store.addNotification(
      '65e000000000000000000002', // Vikram delivery partner
      `New Return Pickup: ${rental.rentalNumber}`,
      `Customer has uploaded return proof. Ready for collection.`,
      'RENTAL_UPDATE'
    );

    res.json({
      success: true,
      message: 'Return pickup requested! Your Cloudinary return proof has been uploaded.',
      rental: updatedRental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Delivery Partner Pickup Evidence
 * Delivery partner collects product, takes pickup/return photos/videos.
 * Cannot charge penalties directly - only submits visual proof.
 */
exports.submitDeliveryPickupEvidence = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { media = [], notes = 'Collected from customer in intact condition.' } = req.body;

    const rental = store.findRentalById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Pickup proof is only valid for a requested return — it hands the piece to
    // the boutique's inspection queue, so it must not fire on any other status.
    if (rental.status !== 'RETURN_REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Pickup proof can only be recorded for a requested return. This rental is currently ${rental.status}.`
      });
    }

    const deliveryMedia = media.map(m => ({
      angle: m.angle || 'FRONT',
      notes: notes,
      publicId: m.publicId || `fashion_rental/evidence/delivery_pickup_${rental.rentalNumber}_${Date.now()}`,
      cloudinaryPublicId: m.publicId || `fashion_rental/evidence/delivery_pickup_${rental.rentalNumber}_${Date.now()}`,
      secureUrl: m.secureUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      resourceType: m.resourceType || 'image',
      capturedAt: new Date()
    }));

    store.updateEvidence(rental._id, 'deliveryPartnerReturn', deliveryMedia);
    const updatedRental = store.updateRental(rental._id, {
      status: 'UNDER_INSPECTION',
      returnedDate: rental.returnedDate || new Date()
    });

    // Notify admin
    store.addNotification(
      '65e000000000000000000003', // Admin
      `Item Inbound for Visual Inspection: ${rental.rentalNumber}`,
      `Delivery partner completed pickup. Item ready in Before vs After inspection queue.`,
      'RENTAL_UPDATE'
    );

    res.json({
      success: true,
      message: 'Pickup evidence submitted to Cloudinary. Rental placed in admin visual inspection queue.',
      rental: updatedRental
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get Full Rental Evidence
 */
exports.getRentalEvidence = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const evidence = store.findEvidenceByRentalId(rentalId);

    if (!evidence) {
      return res.status(404).json({ success: false, message: 'No evidence found for this rental.' });
    }

    res.json({
      success: true,
      evidence
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Private Damage Evidence signed token URL
 */
exports.getPrivateEvidenceUrl = async (req, res) => {
  try {
    const { publicId } = req.query;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId is required' });
    }

    const signedUrl = cloudinaryService.generatePrivateEvidenceUrl(publicId, 3600);
    res.json({
      success: true,
      signedUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
