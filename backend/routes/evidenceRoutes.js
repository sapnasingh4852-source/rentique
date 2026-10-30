const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const cloudinaryService = require('../services/cloudinary.service');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Cloudinary signature generation for direct browser upload
router.post('/sign-upload', authenticate, evidenceController.getSignUploadParams);

// Direct buffer upload route through backend to Cloudinary
router.post('/upload-file', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const isVideo = req.file.mimetype.startsWith('video');
    const folder = req.body.folder || 'fashion_rental/evidence';

    // Contextual metadata turns Cloudinary into a queryable evidence ledger:
    // every asset is tagged with rentalId / stage / angle and can later be
    // listed back via the Admin API (resources_by_context).
    const rawContext = String(req.body.context || '');
    const context = rawContext.replace(/[^A-Za-z0-9_=@.\-|: ]/g, '').slice(0, 200);

    const uploadOptions = { folder };
    if (context) uploadOptions.context = context;

    let result;
    if (isVideo) {
      result = await cloudinaryService.uploadVideo(req.file.buffer, uploadOptions);
    } else {
      result = await cloudinaryService.uploadImage(req.file.buffer, uploadOptions);
    }

    res.json({
      success: true,
      asset: result,
      context: context || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1. Before Rental Condition Proof (Admin captures Front, Back, Left, Right, Close-up)
router.post('/:rentalId/before-rental', authenticate, authorize('ADMIN'), evidenceController.uploadBeforeRentalEvidence);

// 2. Customer Receive Verification (Did you receive in good condition? + Defect photos/videos)
router.post('/:rentalId/customer-receive', authenticate, authorize('CUSTOMER'), evidenceController.submitCustomerReceiveVerification);

// 3. Customer Return Process (Return photos before pickup)
router.post('/:rentalId/customer-return', authenticate, authorize('CUSTOMER'), evidenceController.submitCustomerReturnEvidence);

// 4. Delivery Partner Pickup Evidence (Photos/videos of collection)
router.post('/:rentalId/delivery-pickup', authenticate, authorize('DELIVERY_PARTNER', 'ADMIN'), evidenceController.submitDeliveryPickupEvidence);

// 5. Get evidence for a rental
router.get('/:rentalId', authenticate, evidenceController.getRentalEvidence);

// 5b. Cloudinary audit trail: every asset tagged with this rentalId's context metadata
router.get('/:rentalId/cloudinary-assets', authenticate, evidenceController.getRentalCloudinaryAssets);

// 6. Private/authenticated signed URL for damage evidence
router.get('/private-url', authenticate, evidenceController.getPrivateEvidenceUrl);

module.exports = router;
