const { defineCollection } = require('./helper');

const u = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const bags = defineCollection('bags', [
  {
    title: 'Zardozi Bridal Clutch in Red',
    brand: 'Sabyasachi',
    subCategory: 'Clutch',
    actualPrice: 4999,
    color: 'Red',
    colorName: 'Maroon Red & Antique Gold',
    fabric: 'Silk velvet with hand-stitched dabka and zardozi',
    occasion: 'Wedding',
    image: u('photo-1566150905458-1bf1fc113f0d'),
    rating: 4.95,
    reviews: 77,
    description:
      'A bridal clutch in deep maroon velvet with dabka florals and a top handle. Fits a phone, lipstick and compact.'
  },
  {
    title: 'Gold Mirror-Work Clutch',
    brand: 'Torani',
    subCategory: 'Clutch',
    actualPrice: 2999,
    color: 'Gold',
    colorName: 'Antique Gold & Mirror Work',
    fabric: 'Chanderi silk with hand mirror-work',
    occasion: 'Sangeet',
    image: u('photo-1584917865442-de89df76afd3'),
    rating: 4.9,
    reviews: 52,
    description:
      'A gold mirror-work clutch with a chain strap and a roomy frame. Made to match everything from haldi yellow to bridal red.'
  },
  {
    title: 'Embroidered Pearl Potli',
    brand: 'Ritu Kumar',
    subCategory: 'Potli Bag',
    actualPrice: 3499,
    color: 'Ivory',
    colorName: 'Ivory & Pearl',
    fabric: 'Raw silk with pearl and sequin embroidery',
    occasion: 'Wedding',
    rating: 4.88,
    reviews: 43,
    description:
      'An ivory pearl-embroidered potli with a gold chain wristlet. The pastel bride\u2019s finishing accessory.'
  },
  {
    title: 'Embellished Mini Bag',
    brand: 'Suta',
    subCategory: 'Handbag',
    actualPrice: 1999,
    color: 'Black',
    colorName: 'Onyx Black & Rose Pink',
    fabric: 'Embellished mesh with a chain strap',
    occasion: 'Festive',
    rating: 4.85,
    reviews: 61,
    description:
      'A compact black evening bag with crystal embellishment and a rose pink strap. An easy festive pick at an easy rental price.'
  },
  {
    title: 'Crystal Beaded Clutch',
    brand: 'Manish Malhotra',
    subCategory: 'Clutch',
    actualPrice: 7999,
    color: 'Gold',
    colorName: 'Champagne Crystals & Gold',
    fabric: 'Hard case with hand-applied crystals',
    occasion: 'Cocktail',
    image: u('photo-1548036328-c9fa89d128fa'),
    rating: 4.94,
    reviews: 36,
    description:
      'A fully crystallised box clutch with a detachable chain. The one accessory that finishes a sequin gown.'
  },
  {
    title: 'Envelope Clutch in Red',
    brand: 'Rohit Bal',
    subCategory: 'Clutch',
    actualPrice: 5999,
    color: 'Red',
    colorName: 'Ruby Red & Gold',
    fabric: 'Structured faux leather with a gold clasp',
    occasion: 'Reception',
    rating: 4.91,
    reviews: 29,
    description:
      'A structured red envelope clutch with a slim gold clasp and a detachable chain. Understated luxury.'
  },
  {
    title: 'Silver Sequin Clutch',
    brand: 'Seema Gujral',
    subCategory: 'Clutch',
    actualPrice: 4499,
    color: 'Gold',
    colorName: 'Silver Champagne Sequins',
    fabric: 'Sequinned mesh over a structured frame',
    occasion: 'Cocktail',
    rating: 4.88,
    reviews: 33,
    description:
      'A shimmering sequin clutch in silver champagne. Light enough to hold all evening, bright enough to photograph.'
  },
  {
    title: 'Banarasi Silk Dupatta in Red',
    brand: 'Ekaya',
    subCategory: 'Dupatta',
    actualPrice: 3999,
    color: 'Red',
    colorName: 'Sindoor Red & Gold Zari',
    fabric: 'Pure Banarasi silk with kadhwa zari border',
    occasion: 'Wedding',
    rating: 4.93,
    reviews: 47,
    description:
      'A pure Banarasi dupatta with a broad kadhwa border. Rent it to finish a plain kurta or to add a second drape to a lehenga.'
  },
  {
    title: 'Organza Embroidered Dupatta',
    brand: 'Torani',
    subCategory: 'Dupatta',
    actualPrice: 3499,
    color: 'Green',
    colorName: 'Mint Green & Gold Gota',
    fabric: 'Silk organza with hand gota and pearl edging',
    occasion: 'Sangeet',
    rating: 4.92,
    reviews: 38,
    description:
      'A featherlight organza dupatta with a scalloped gota border. Adds softness and colour to any plain festive outfit.'
  },
  {
    title: 'Embellished Evening Handbag',
    brand: 'Sabyasachi',
    subCategory: 'Handbag',
    actualPrice: 8999,
    color: 'Black',
    colorName: 'Black & Antique Gold',
    fabric: 'Leather with hand-embroidered zardozi panel',
    occasion: 'Reception',
    rating: 4.96,
    reviews: 31,
    description:
      'A structured evening bag with a hand-embroidered gold panel and a chain strap. Works with both a saree and a gown.'
  }
]);

const footwear = defineCollection('footwear', [
  {
    title: 'Gold Zari Mojari',
    brand: 'Fizzy Goblet',
    subCategory: 'Mojari',
    actualPrice: 3999,
    color: 'Gold',
    colorName: 'Champagne Gold & Zari',
    fabric: 'Raw silk upper with a leather sole',
    occasion: 'Wedding',
    image: u('photo-1543163521-1bf539c55dd2'),
    rating: 4.9,
    reviews: 72,
    description:
      'A gold zari mojari with a padded footbed and a soft leather sole. Traditional enough for a lehenga, comfortable enough to dance in.'
  },
  {
    title: 'Embroidered Velvet Mojari',
    brand: 'Fizzy Goblet',
    subCategory: 'Mojari',
    actualPrice: 4499,
    color: 'Wine',
    colorName: 'Wine Velvet & Gold Resham',
    fabric: 'Velvet upper with hand resham embroidery',
    occasion: 'Sangeet',
    rating: 4.92,
    reviews: 48,
    description:
      'Wine velvet with gold resham florals and a cushioned insole. A rich pick for winter weddings.'
  },
  {
    title: 'Pearl Bridal Heels',
    brand: 'Sabyasachi',
    subCategory: 'Heels',
    actualPrice: 8999,
    color: 'Ivory',
    colorName: 'Ivory & Pearl',
    fabric: 'Satin with pearl embellishment',
    occasion: 'Wedding',
    image: u('photo-1560343090-f0409e92791a'),
    rating: 4.96,
    reviews: 34,
    description:
      'An ivory bridal heel with a pointed toe and pearl detailing. Designed to be seen under a lehenga, not hidden by it.'
  },
  {
    title: 'Silver Embellished Mules',
    brand: 'Needledust',
    subCategory: 'Heels',
    actualPrice: 3499,
    color: 'Silver',
    colorName: 'Silver Glitter & Crystal',
    fabric: 'Glitter mesh upper with crystal embellishment',
    occasion: 'Wedding',
    rating: 4.87,
    reviews: 56,
    description:
      'Silver glitter mules with a pointed toe and crystal detailing. Made for long pheras and late receptions.'
  },
  {
    title: 'Multicolour Embroidered Mojari',
    brand: 'Needledust',
    subCategory: 'Mojari',
    actualPrice: 2999,
    color: 'Multi',
    colorName: 'Rani Pink, Emerald & Marigold',
    fabric: 'Leather with hand embroidery',
    occasion: 'Festive',
    rating: 4.88,
    reviews: 64,
    description:
      'A Punjabi mojari in multicolour thread embroidery with fine gold detailing. Gets softer with every wear and pairs with everything.'
  },
  {
    title: 'Phulkari Jutti',
    brand: 'Fizzy Goblet',
    subCategory: 'Jutti',
    actualPrice: 3299,
    color: 'Pink',
    colorName: 'Fuchsia Phulkari & Gold',
    fabric: 'Cotton silk with hand phulkari embroidery',
    occasion: 'Sangeet',
    rating: 4.89,
    reviews: 51,
    description:
      'Hand-embroidered phulkari in fuchsia and gold. A cheerful, lightweight jutti for day functions.'
  },
  {
    title: 'Rose Pink Satin Ballerinas',
    brand: 'Needledust',
    subCategory: 'Flats',
    actualPrice: 3799,
    color: 'Pink',
    colorName: 'Rose Pink & Crystal Bow',
    fabric: 'Satin upper with a crystal bow',
    occasion: 'Festive',
    rating: 4.86,
    reviews: 39,
    description:
      'Rose pink satin ballerinas with a crystal-trimmed bow. A comfortable, pretty finish for mehendi and haldi.'
  },
  {
    title: 'Block Heel Sandals in Gold',
    brand: 'Aldo',
    subCategory: 'Heels',
    actualPrice: 6999,
    color: 'Gold',
    colorName: 'Antique Gold',
    fabric: 'Metallic leather with a block heel',
    occasion: 'Cocktail',
    image: u('photo-1560343090-f0409e92791a'),
    rating: 4.9,
    reviews: 58,
    description:
      'A comfortable block heel in antique gold. Stable enough for a full wedding day and smart enough for a cocktail.'
  },
  {
    title: 'Black Suede Stiletto Pumps',
    brand: 'Jimmy Choo',
    subCategory: 'Heels',
    actualPrice: 14999,
    color: 'Black',
    colorName: 'Jet Black Suede',
    fabric: 'Suede with a pointed toe',
    occasion: 'Reception',
    rating: 4.95,
    reviews: 41,
    description:
      'A black suede stiletto pump with a pointed toe and a slim heel. The finishing note for a gown or a pre-draped sari.'
  },
  {
    title: 'Woven Gold Heels',
    brand: 'Steve Madden',
    subCategory: 'Heels',
    actualPrice: 5999,
    color: 'Gold',
    colorName: 'Antique Gold & Woven Detail',
    fabric: 'Woven metallic upper with a block heel',
    occasion: 'Cocktail',
    rating: 4.87,
    reviews: 35,
    description:
      'Woven gold heels with an ankle strap and a sturdy block heel. Easy to walk in, elegant enough for a reception.'
  },
  {
    title: 'Leather Moccasins in Cognac',
    brand: 'Bata',
    subCategory: 'Loafers',
    actualPrice: 3999,
    color: 'Brown',
    colorName: 'Cognac Brown Leather',
    fabric: 'Leather upper with a leather sole',
    occasion: 'Festive',
    gender: 'MEN',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    rating: 4.84,
    reviews: 44,
    description:
      'Cognac leather moccasins with hand-stitched detailing and a cushioned insole. Smart-casual festive footwear for men.'
  },
  {
    title: 'Woven Leather Loafers',
    brand: 'Fizzy Goblet',
    subCategory: 'Loafers',
    actualPrice: 4999,
    color: 'Black',
    colorName: 'Jet Black',
    fabric: 'Woven leather with a leather sole',
    occasion: 'Wedding',
    gender: 'MEN',
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    image: u('photo-1533867617858-e7b97e060509'),
    rating: 4.9,
    reviews: 37,
    description:
      'Black woven leather loafers with a hand-finished sole. A comfortable, modern alternative to mojaris for the groom\u2019s side.'
  }
]);

module.exports = { bags, footwear };
