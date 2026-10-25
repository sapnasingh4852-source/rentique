const store = require('../data/store');
const mediaService = require('../services/media.service');
const pricingService = require('../services/pricing.service');

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      collection,
      search,
      gender,
      subCategory,
      occasion,
      maxPrice,
      minPrice,
      sort,
      brand,
      color,
      colorFamily
    } = req.query;

    let products = store.getProducts({
      category,
      collection,
      search,
      gender,
      subCategory,
      occasion,
      maxPrice,
      minPrice,
      brand,
      color,
      colorFamily
    });

    if (sort === 'price_asc') {
      products.sort((a, b) => a.rentalPrice - b.rentalPrice);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.rentalPrice - a.rentalPrice);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      products.sort((a, b) => {
        const ownMedia = Number(b.mediaStatus === 'OWN') - Number(a.mediaStatus === 'OWN');
        return ownMedia || (b.reviewCount || 0) - (a.reviewCount || 0);
      });
    }

    res.json({
      success: true,
      count: products.length,
      products: products.map(product => mediaService.applyToProduct(product))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFacets = async (req, res) => {
  try {
    const facets = store.getFacets();
    facets.collections = facets.collections.map(collection => ({
      ...collection,
      image: mediaService.resolveUrl(collection.image)
    }));
    res.json({ success: true, facets, media: mediaService.status() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = store.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      product: mediaService.applyToProduct(product)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductTimeline = async (req, res) => {
  try {
    const product = store.findProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      productId: product._id,
      title: product.title,
      brand: product.brand,
      currentCondition: product.currentCondition,
      conditionHistory: product.conditionHistory || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      collection,
      subCategory,
      gender = 'WOMEN',
      size,
      color,
      colorFamily,
      fabricOrMaterial,
      description,
      occasion,
      actualPrice,
      images = []
    } = req.body;

    if (!title || !brand || !category || !actualPrice) {
      return res.status(400).json({ success: false, message: 'Title, brand, category, and actualPrice are required.' });
    }

    const priceNum = Number(actualPrice);
    const pricing = pricingService.calculateRentalPricing(priceNum);

    // Process Cloudinary images
    // Admin uploads: Front, Back, Side, Close-up, Tag image
    let listingImages = [];
    if (Array.isArray(images) && images.length > 0) {
      listingImages = images.map(img => ({
        viewType: img.viewType || 'FRONT',
        publicId: img.publicId || `fashion_rental/products/${brand.toLowerCase()}_${Date.now()}`,
        cloudinaryPublicId: img.publicId || `fashion_rental/products/${brand.toLowerCase()}_${Date.now()}`,
        secureUrl: img.secureUrl || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        resourceType: 'image',
        format: img.format || 'webp',
        width: img.width || 1200,
        height: img.height || 1600
      }));
    } else {
      // Default sample multi-angle setup if images weren't passed
      const viewAngles = ['FRONT', 'BACK', 'SIDE', 'CLOSEUP', 'TAG'];
      listingImages = viewAngles.map(angle => ({
        viewType: angle,
        publicId: `fashion_rental/products/${brand.toLowerCase()}_${angle.toLowerCase()}_${Date.now()}`,
        cloudinaryPublicId: `fashion_rental/products/${brand.toLowerCase()}_${angle.toLowerCase()}_${Date.now()}`,
        secureUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        resourceType: 'image',
        format: 'webp',
        width: 1200,
        height: 1600
      }));
    }

    const newProduct = store.addProduct({
      title,
      brand,
      category,
      collection: collection || 'lehengas',
      subCategory: subCategory || category,
      gender,
      size: Array.isArray(size) ? size : (size ? [size] : ['Standard']),
      color: color || 'Classic',
      colorFamily: colorFamily || color || 'Gold',
      fabricOrMaterial: fabricOrMaterial || 'Luxury Blend',
      description,
      occasion: occasion || 'Festive / Formal',
      actualPrice: priceNum,
      rentalPrice: pricing.rentalPrice,
      securityDeposit: pricing.securityDeposit,
      listingImages,
      currentCondition: 'EXCELLENT',
      available: true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully with Cloudinary multi-angle assets',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
