const { defineCollection } = require('./helper');

const lehengas = defineCollection('lehengas', [
  {
    id: '65e100000000000000000101',
    title: 'Sabyasachi Heritage Royal Crimson Bridal Lehenga',
    brand: 'Sabyasachi',
    subCategory: 'Bridal Lehenga',
    actualPrice: 19999,
    color: 'Red',
    colorName: 'Crimson Red & Antique Gold',
    fabric: 'Handwoven Matka silk with zardozi, tilla and sequin borders',
    occasion: 'Wedding',
    image: '/media/catalog/lehengas-bridal-red.webp',
    rating: 4.98,
    reviews: 94,
    description:
      'Our most-rented bridal piece. A crimson kalidar lehenga with dense zardozi vines, hand-cut sequin borders and a sheer embroidered dupatta \u2014 the full Sabyasachi heritage silhouette, without the five-figure purchase.'
  },
  {
    title: 'Banarasi Silk Brocade Traditional Red Bridal Lehenga',
    brand: 'Raw Mango',
    subCategory: 'Bridal Lehenga',
    actualPrice: 14999,
    color: 'Red',
    colorName: 'Sindoor Red & Pure Zari',
    fabric: 'Pure Banarasi silk brocade with kadhwa zari',
    occasion: 'Wedding',
    rating: 4.96,
    reviews: 71,
    description:
      'A traditional red bridal lehenga woven in Varanasi with pure zari butis and a broad brocade border. Comes with a matching blouse and silk organza dupatta.'
  },
  {
    title: 'Emerald Green Velvet Royal Bridal Zardozi Lehenga',
    brand: 'Tarun Tahiliani',
    subCategory: 'Bridal Lehenga',
    actualPrice: 16999,
    color: 'Green',
    colorName: 'Deep Emerald & Antique Gold',
    fabric: 'Micro velvet with marodi, dabka and zardozi jaal',
    occasion: 'Wedding',
    image: '/media/catalog/lehengas-emerald-velvet.webp',
    rating: 4.97,
    reviews: 63,
    description:
      'Jewel-toned velvet with antique marodi embroidery and a dramatic double dupatta. Built for winter weddings and grand reception entries.'
  },
  {
    title: 'Ivory Pearl & Zardozi Mughal Bridal Lehenga',
    brand: 'Rimple & Harpreet',
    subCategory: 'Bridal Lehenga',
    actualPrice: 21999,
    color: 'Ivory',
    colorName: 'Ivory Pearl & Champagne Zari',
    fabric: 'Raw silk with pearl, dabka and zardozi handwork',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 48,
    description:
      'A soft ivory bridal lehenga layered with pearl droplets and Mughal-inspired zardozi. Ideal for a daytime nikah or an intimate palace wedding.'
  },
  {
    title: 'Rani Pink Raw Silk Gota Patti Bridal Lehenga',
    brand: 'Sabyasachi',
    subCategory: 'Bridal Lehenga',
    actualPrice: 17999,
    color: 'Pink',
    colorName: 'Rani Pink & Rose Gold',
    fabric: 'Raw silk with hand-cut gota patti and dori work',
    occasion: 'Wedding',
    rating: 4.94,
    reviews: 57,
    description:
      'A rani pink bridal lehenga with Jaipuri gota patti flowers, a scalloped hem and a featherlight tulle dupatta for that classic Rajputana bridal glow.'
  },
  {
    title: 'Deep Maroon Velvet Kalidar Bridal Lehenga',
    brand: 'JJ Valaya',
    subCategory: 'Bridal Lehenga',
    actualPrice: 18999,
    color: 'Wine',
    colorName: 'Deep Maroon & Burnished Gold',
    fabric: 'Silk velvet with antique dabka and kundan work',
    occasion: 'Wedding',
    rating: 4.93,
    reviews: 42,
    description:
      'A regal maroon velvet kalidar with a structured blouse and hand-embroidered kundan buttons. Understated, heavy and unmistakably JJ Valaya.'
  },
  {
    title: 'Gold Tissue Hand-Embroidered Bridal Lehenga',
    brand: 'Gaurav Gupta',
    subCategory: 'Bridal Lehenga',
    actualPrice: 24999,
    color: 'Gold',
    colorName: 'Champagne Gold & Crystal',
    fabric: 'Tissue silk with crystal, sequin and zardozi vines',
    occasion: 'Wedding',
    rating: 4.99,
    reviews: 36,
    description:
      'A sculpted gold tissue lehenga that catches every light. The most premium piece in our bridal vault, reserved for the grandest pheras.'
  },
  {
    title: 'Pastel Blue Meenakari Bridal Lehenga',
    brand: 'Anita Dongre',
    subCategory: 'Bridal Lehenga',
    actualPrice: 15999,
    color: 'Blue',
    colorName: 'Powder Blue & Meenakari',
    fabric: 'Silk organza with meenakari enamel and gota work',
    occasion: 'Wedding',
    rating: 4.92,
    reviews: 39,
    description:
      'Powder blue organza with hand-painted meenakari florals and a delicate gota border. A modern heirloom for the bride who wants colour without weight.'
  },
  {
    title: 'Floral Pastel Mint Organza Sangeet Lehenga Choli',
    brand: 'Anita Dongre',
    subCategory: 'Sangeet Lehenga',
    actualPrice: 8499,
    color: 'Green',
    colorName: 'Mint Green & Soft Rose',
    fabric: 'Silk organza with resham flowers and mirror tassels',
    occasion: 'Sangeet',
    image: '/media/catalog/lehengas-sangeet-mint.webp',
    rating: 4.89,
    reviews: 47,
    description:
      'Breezy mint organza with hand-embroidered botanical flowers, a ruffled dupatta and mirror tassels. Made for sangeet rehearsals and daytime mehendi.'
  },
  {
    title: 'Silver Mirror Work Georgette Sangeet Lehenga',
    brand: 'Seema Gujral',
    subCategory: 'Sangeet Lehenga',
    actualPrice: 11999,
    color: 'Ivory',
    colorName: 'Silver Mist & Champagne',
    fabric: 'Viscose georgette with hand-cut glass mirrors',
    occasion: 'Sangeet',
    rating: 4.91,
    reviews: 55,
    description:
      'A shimmering mirror-work lehenga with a plunging blouse and ruffled border dupatta. The light catches every mirror as you dance.'
  },
  {
    title: 'Hot Pink Sequinned Cocktail Reception Lehenga',
    brand: 'Manish Malhotra',
    subCategory: 'Reception Lehenga',
    actualPrice: 13499,
    color: 'Pink',
    colorName: 'Rani Pink & Metallic',
    fabric: 'Tulle net with micro-sequins and sheeted beadwork',
    occasion: 'Cocktail',
    image: '/media/catalog/lehengas-blush-sequin.webp',
    rating: 4.92,
    reviews: 68,
    description:
      'A Bollywood-grade hot pink sequin lehenga with a fitted blouse and sheer dupatta. Designed for the reception after-party.'
  },
  {
    title: 'Aqua Blue Embellished Sangeet Lehenga',
    brand: 'Faabiiana',
    subCategory: 'Sangeet Lehenga',
    actualPrice: 9999,
    color: 'Blue',
    colorName: 'Aqua Blue & Silver',
    fabric: 'Georgette with sequin and mirror work',
    occasion: 'Sangeet',
    rating: 4.88,
    reviews: 33,
    description:
      'Aqua blue georgette with silver sequin detailing, a mirror-work blouse and a twirl-friendly hem. Photographs beautifully under lights.'
  },
  {
    title: 'Emerald Velvet Cocktail Lehenga',
    brand: 'Amit Aggarwal',
    subCategory: 'Reception Lehenga',
    actualPrice: 12499,
    color: 'Green',
    colorName: 'Emerald & Antique Gold',
    fabric: 'Silk velvet with gold zari and bird motifs',
    occasion: 'Cocktail',
    rating: 4.9,
    reviews: 44,
    description:
      'Sculptural emerald velvet with antique gold zari and bird motifs. A modern cocktail lehenga with a structured blouse.'
  },
  {
    title: 'Mustard Yellow Gota Patti Haldi Festive Lehenga Set',
    brand: 'Torani',
    subCategory: 'Mehendi Lehenga',
    actualPrice: 7499,
    color: 'Yellow',
    colorName: 'Marigold Yellow & Zari',
    fabric: 'Cotton silk with gota patti and mirror work',
    occasion: 'Mehendi',
    image: '/media/catalog/lehengas-haldi-yellow.webp',
    rating: 4.91,
    reviews: 38,
    description:
      'Marigold yellow with gota flowers, mirror accents and a tie-up blouse. A haldi-morning classic that works equally well for a festive puja.'
  },
  {
    title: 'Lavender Lilac Handcrafted Chikankari Silk Lehenga',
    brand: 'Faabiiana',
    subCategory: 'Mehendi Lehenga',
    actualPrice: 10999,
    color: 'Pink',
    colorName: 'Pastel Lilac & Pearl',
    fabric: 'Silk with Lucknowi chikankari and pearl edging',
    occasion: 'Mehendi',
    image: '/media/catalog/lehengas-lavender-chikankari.webp',
    rating: 4.95,
    reviews: 41,
    description:
      'Hand-embroidered Lucknowi chikankari on lilac silk, finished with a pearl-edged dupatta. Delicate, breathable and made for daytime celebrations.'
  },
  {
    title: 'Forest Green Organza Mehendi Lehenga',
    brand: 'Anita Dongre',
    subCategory: 'Mehendi Lehenga',
    actualPrice: 7999,
    color: 'Green',
    colorName: 'Forest Green & Gold',
    fabric: 'Silk organza with gold resham motifs and pearl work',
    occasion: 'Mehendi',
    rating: 4.87,
    reviews: 29,
    description:
      'Forest green organza with gold resham bird motifs and a soft dupatta. A rich, elegant mehendi look for the bride who prefers deeper tones.'
  },
  {
    title: 'Pastel Beaded Mehendi Lehenga',
    brand: "Papa Don't Preach",
    subCategory: 'Mehendi Lehenga',
    actualPrice: 8999,
    color: 'Multi',
    colorName: 'Pastel Multi & Crystal Beadwork',
    fabric: 'Tulle with crystal and sequin beadwork',
    occasion: 'Mehendi',
    rating: 4.84,
    reviews: 26,
    description:
      'A pastel beaded lehenga with a sheer dupatta and crystal detailing. A fresh, garden-party alternative to heavy embroidery.'
  },
  {
    title: 'Ivory Chikankari Mehendi Lehenga',
    brand: 'Raw Mango',
    subCategory: 'Mehendi Lehenga',
    actualPrice: 6999,
    color: 'Ivory',
    colorName: 'Ivory & Silver Mukaish',
    fabric: 'Cotton silk with chikankari and mukaish dots',
    occasion: 'Mehendi',
    rating: 4.86,
    reviews: 31,
    description:
      'Ivory chikankari with delicate mukaish dots and a soft mul dupatta. Understated, breathable and perfect for a day wedding.'
  },
  {
    title: 'Wine Velvet Off-Shoulder Reception Lehenga',
    brand: 'Varun Bahl',
    subCategory: 'Reception Lehenga',
    actualPrice: 14999,
    color: 'Wine',
    colorName: 'Wine & Antique Gold',
    fabric: 'Silk velvet with tonal thread and sequin work',
    occasion: 'Cocktail',
    rating: 4.94,
    reviews: 46,
    description:
      'An off-shoulder velvet reception lehenga in deep wine with tone-on-tone embroidery. Built to make an entrance at the after-party.'
  },
  {
    title: 'Silver Grey Sequin Reception Lehenga',
    brand: 'Manish Malhotra',
    subCategory: 'Reception Lehenga',
    actualPrice: 15999,
    color: 'Silver',
    colorName: 'Silver Grey & Crystal',
    fabric: 'Tulle with all-over sequins and crystal fringing',
    occasion: 'Cocktail',
    rating: 4.97,
    reviews: 52,
    description:
      'A silver-grey sequin lehenga with crystal detailing and a fitted blouse. The most photographed reception look in our collection.'
  },
  {
    title: 'Black & Gold Cape Cocktail Lehenga',
    brand: 'Amit Aggarwal',
    subCategory: 'Reception Lehenga',
    actualPrice: 12999,
    color: 'Black',
    colorName: 'Onyx Black & Antique Gold',
    fabric: 'Silk with gold zardozi and an embroidered cape',
    occasion: 'Cocktail',
    rating: 4.89,
    reviews: 34,
    description:
      'Onyx black with an antique gold embroidered cape and a dramatic floor-sweeping hem. A modern black-tie take on the reception lehenga.'
  },
  {
    title: 'Ice Blue Zardozi Reception Lehenga',
    brand: 'Sabyasachi',
    subCategory: 'Reception Lehenga',
    actualPrice: 17499,
    color: 'Blue',
    colorName: 'Ice Blue & Silver Zardozi',
    fabric: 'Raw silk with zardozi and sequin jaal',
    occasion: 'Cocktail',
    rating: 4.96,
    reviews: 49,
    description:
      'Ice blue raw silk with delicate zardozi and a structured blouse. A regal reception look that photographs beautifully in warm light.'
  }
]);

module.exports = { lehengas };
