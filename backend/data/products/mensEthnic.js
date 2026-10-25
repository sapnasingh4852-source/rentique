const { defineCollection } = require('./helper');

const mensEthnic = defineCollection('menswear', [
  {
    id: '65e100000000000000000102',
    title: 'Manyavar Royal Raw Silk Wedding Sherwani Set',
    brand: 'Manyavar',
    subCategory: 'Sherwani',
    actualPrice: 14999,
    color: 'Ivory',
    colorName: 'Ivory Cream & Antique Gold',
    fabric: 'Banarasi raw silk with handcrafted resham buttons',
    occasion: 'Wedding',
    image: '/media/catalog/menswear-ivory-sherwani.webp',
    rating: 4.94,
    reviews: 64,
    description:
      'A regal groom sherwani in ivory raw silk with antique gold buttons, a matching churidar and an embroidered organza stole. Safa included on request.'
  },
  {
    title: 'Crimson Zardozi Groom Sherwani',
    brand: 'Sabyasachi',
    subCategory: 'Sherwani',
    actualPrice: 24999,
    color: 'Red',
    colorName: 'Crimson & Antique Zardozi',
    fabric: 'Raw silk with dense zardozi and dabka embroidery',
    occasion: 'Wedding',
    rating: 4.98,
    reviews: 47,
    description:
      'Our most premium groom rental. Deep crimson with all-over zardozi vines, a structured silhouette and a hand-embroidered stole.'
  },
  {
    title: 'Emerald Velvet Sherwani',
    brand: 'Tarun Tahiliani',
    subCategory: 'Sherwani',
    actualPrice: 19999,
    color: 'Green',
    colorName: 'Emerald Velvet & Antique Gold',
    fabric: 'Micro velvet with marodi and zardozi jaal',
    occasion: 'Wedding',
    rating: 4.96,
    reviews: 38,
    description:
      'A jewel-toned velvet sherwani with antique gold embroidery and a mandarin collar. Built for winter weddings and grand baraat entries.'
  },
  {
    title: 'Gold Tissue Sherwani',
    brand: 'Manyavar',
    subCategory: 'Sherwani',
    actualPrice: 16999,
    color: 'Gold',
    colorName: 'Champagne Gold & Ivory',
    fabric: 'Tissue silk with tonal zari embroidery',
    occasion: 'Reception',
    rating: 4.92,
    reviews: 52,
    description:
      'A light-catching tissue sherwani with a slim fit and tonal embroidery. A natural fit for reception and engagement nights.'
  },
  {
    title: 'Deep Green Silk Sherwani',
    brand: 'Raghavendra Rathore',
    subCategory: 'Sherwani',
    actualPrice: 17999,
    color: 'Green',
    colorName: 'Deep Green & Antique Gold',
    fabric: 'Silk with tonal gold embroidery',
    occasion: 'Reception',
    rating: 4.95,
    reviews: 41,
    description:
      'A deep green silk sherwani with a mandarin collar and tonal gold embroidery, paired with an ivory churidar. Understated royalty for the modern groom.'
  },
  {
    title: 'Ivory & Rani Pink Groom Sherwani',
    brand: 'Manish Malhotra',
    subCategory: 'Sherwani',
    actualPrice: 21999,
    color: 'Ivory',
    colorName: 'Ivory & Rani Pink Dupatta',
    fabric: 'Raw silk with tonal zari embroidery',
    occasion: 'Wedding',
    rating: 4.97,
    reviews: 33,
    description:
      'An ivory raw-silk sherwani paired with a rani pink dupatta and matching safa. Made for daytime weddings and pheras.'
  },
  {
    title: 'Jodhpuri Bandhgala in Black',
    brand: 'Raghavendra Rathore',
    subCategory: 'Bandhgala',
    actualPrice: 12999,
    color: 'Black',
    colorName: 'Jet Black & Brass Buttons',
    fabric: 'Wool-silk blend with handcrafted brass buttons',
    occasion: 'Cocktail',
    rating: 4.96,
    reviews: 44,
    description:
      'The definitive Jodhpuri bandhgala. Sharp tailoring, brass buttons and a slim trouser. Equally at home at a wedding or a black-tie dinner.'
  },
  {
    title: 'Wine Velvet Sherwani',
    brand: 'Rohit Bal',
    subCategory: 'Sherwani',
    actualPrice: 14999,
    color: 'Wine',
    colorName: 'Deep Wine & Antique Gold',
    fabric: 'Silk velvet with gold front buttons',
    occasion: 'Wedding',
    rating: 4.94,
    reviews: 29,
    description:
      'A wine velvet sherwani with gold buttons and a clean front, paired with an ivory churidar. Winter wedding royalty.'
  },
  {
    title: 'Ivory Bandhgala with Zari',
    brand: 'Manyavar',
    subCategory: 'Bandhgala',
    actualPrice: 10999,
    color: 'Ivory',
    colorName: 'Ivory & Gold Zari',
    fabric: 'Cotton silk with fine zari edging',
    occasion: 'Reception',
    rating: 4.9,
    reviews: 36,
    description:
      'A clean ivory bandhgala with a fine zari edge. An easy choice for engagement and daytime reception looks.'
  },
  {
    title: 'Blue Bandhgala Suit Set',
    brand: 'Raymond',
    subCategory: 'Bandhgala',
    actualPrice: 8999,
    color: 'Blue',
    colorName: 'Steel Blue & Navy Trim',
    fabric: 'Premium wool blend with satin trim',
    occasion: 'Cocktail',
    rating: 4.87,
    reviews: 51,
    description:
      'A tailored blue bandhgala suit with navy satin trim and a matching trouser. Smart, simple and endlessly re-wearable.'
  },
  {
    title: 'Silk Kurta Set in Mustard',
    brand: 'FabIndia',
    subCategory: 'Kurta Set',
    actualPrice: 4999,
    color: 'Yellow',
    colorName: 'Mustard & Ivory Pajama',
    fabric: 'Silk blend with a mandarin collar',
    occasion: 'Haldi',
    rating: 4.88,
    reviews: 62,
    description:
      'A mustard silk kurta with an ivory pajama and tonal thread work. Cheerful enough for haldi, refined enough for puja.'
  },
  {
    title: 'Chikankari Kurta Set',
    brand: 'House of Chikankari',
    subCategory: 'Kurta Set',
    actualPrice: 6999,
    color: 'Ivory',
    colorName: 'Ivory & White Chikankari',
    fabric: 'Viscose silk with hand chikankari',
    occasion: 'Mehendi',
    rating: 4.93,
    reviews: 48,
    description:
      'A breathable ivory kurta with fine Lucknowi chikankari and a matching churidar. Perfect for mehendi and day functions.'
  },
  {
    title: 'Red Block Print Short Kurta',
    brand: 'Suta',
    subCategory: 'Kurta Set',
    actualPrice: 4499,
    color: 'Red',
    colorName: 'Crimson & Ivory Block Print',
    fabric: 'Cotton with a hand block print',
    occasion: 'Festive',
    rating: 4.85,
    reviews: 57,
    description:
      'A short red block-print kurta with a mandarin placket, styled here with dark denim for a relaxed festive look.'
  },
  {
    title: 'Onyx Bandhgala Suit Set',
    brand: 'Tarun Tahiliani',
    subCategory: 'Bandhgala',
    actualPrice: 15999,
    color: 'Black',
    colorName: 'Onyx Black & Champagne Buttons',
    fabric: 'Wool-silk blend with champagne buttons',
    occasion: 'Cocktail',
    rating: 4.95,
    reviews: 31,
    description:
      'A black bandhgala suit with champagne buttons and a layered necklace, cut for a sharp evening silhouette. Made for receptions and after-parties.'
  },
  {
    title: 'Gold Zardozi Groom Sherwani',
    brand: 'Amit Aggarwal',
    subCategory: 'Sherwani',
    actualPrice: 13999,
    color: 'Ivory',
    colorName: 'Ivory & Antique Gold Zardozi',
    fabric: 'Raw silk with dense gold zardozi',
    occasion: 'Wedding',
    rating: 4.93,
    reviews: 26,
    description:
      'An ivory groom sherwani with dense gold zardozi on the sleeves and chest, worn with a red ceremonial stole. The modern groom\u2019s wedding look.'
  },
  {
    title: 'Midnight Blue Sherwani with Dupatta',
    brand: 'Chola',
    subCategory: 'Sherwani',
    actualPrice: 9999,
    color: 'Blue',
    colorName: 'Midnight Blue & Silver Zari',
    fabric: 'Silk blend with silver zari and velvet trim',
    occasion: 'Reception',
    rating: 4.86,
    reviews: 39,
    description:
      'Deep midnight blue with silver zari accents and a velvet-trimmed dupatta. Understated royalty for the modern groom.'
  }
]);

module.exports = { mensEthnic };
