const { defineCollection } = require('./helper');

const suits = defineCollection('suits', [
  {
    title: 'Chikankari Anarkali in Ivory',
    brand: 'House of Chikankari',
    subCategory: 'Anarkali Suit',
    actualPrice: 8999,
    color: 'Ivory',
    colorName: 'Ivory & Pearl White',
    fabric: 'Pure georgette with hand chikankari and mukaish',
    occasion: 'Mehendi',
    image: '/media/catalog/lehengas-sangeet-mint.webp',
    rating: 4.95,
    reviews: 74,
    description:
      'An ivory 12-kali chikankari anarkali with a pearl-edged neckline and a featherlight net dupatta. Our go-to recommendation for daytime mehendi functions.'
  },
  {
    title: 'Gota Patti Anarkali in Haldi Yellow',
    brand: 'Torani',
    subCategory: 'Anarkali Suit',
    actualPrice: 10999,
    color: 'Yellow',
    colorName: 'Marigold & Antique Gota',
    fabric: 'Chanderi silk with hand gota patti and mirror accents',
    occasion: 'Haldi',
    image: '/media/catalog/lehengas-haldi-yellow.webp',
    rating: 4.97,
    reviews: 58,
    description:
      'Sunshine yellow chanderi with dense gota work on the yoke and a scalloped dupatta. Made for haldi mornings and festive pujas.'
  },
  {
    title: 'Velvet Anarkali in Deep Wine',
    brand: 'Rimple & Harpreet',
    subCategory: 'Anarkali Suit',
    actualPrice: 14999,
    color: 'Wine',
    colorName: 'Old Wine & Antique Zardozi',
    fabric: 'Micro velvet with zardozi, dabka and sequin work',
    occasion: 'Wedding',
    rating: 4.96,
    reviews: 41,
    description:
      'A winter-wedding favourite. Deep wine velvet, a floor-sweeping flare and antique zardozi on the bodice and sleeves.'
  },
  {
    title: 'Embroidered Anarkali with Dupatta',
    brand: 'Anita Dongre',
    subCategory: 'Anarkali Suit',
    actualPrice: 12499,
    color: 'Red',
    colorName: 'Rose Red & Gold Resham',
    fabric: 'Silk chanderi with resham embroidery',
    occasion: 'Wedding',
    rating: 4.92,
    reviews: 36,
    description:
      'Classic red anarkali with tonal resham embroidery and a sheer organza dupatta. Elegant without being heavy.'
  },
  {
    title: 'Angrakha Anarkali in Ivory',
    brand: 'Torani',
    subCategory: 'Anarkali Suit',
    actualPrice: 11999,
    color: 'Ivory',
    colorName: 'Ivory & Gold Dori',
    fabric: 'Cotton silk with dori embroidery and tassel ties',
    occasion: 'Sangeet',
    rating: 4.9,
    reviews: 33,
    description:
      'An angrakha-style anarkali with side tassels and fine gold dori work. Understated enough for a day function, special enough for photos.'
  },
  {
    title: 'Sequin Anarkali in Blush Pink',
    brand: 'Seema Gujral',
    subCategory: 'Anarkali Suit',
    actualPrice: 13499,
    color: 'Pink',
    colorName: 'Blush Pink & Crystal Sequin',
    fabric: 'Tulle with all-over sequin and crystal embroidery',
    occasion: 'Reception',
    rating: 4.94,
    reviews: 47,
    description:
      'A high-shine blush anarkali with a fitted bodice and layered tulle flare. Rented with a matching sequin dupatta.'
  },
  {
    title: 'Mirror Work Sharara Set',
    brand: 'Ritu Kumar',
    subCategory: 'Sharara Set',
    actualPrice: 9499,
    color: 'Blue',
    colorName: 'Teal Blue & Gold Mirror',
    fabric: 'Georgette with hand-cut mirror work',
    occasion: 'Sangeet',
    rating: 4.91,
    reviews: 52,
    description:
      'Flared teal sharara pants with a mirror-work kurta and a matching dupatta. Light enough for a full sangeet performance.'
  },
  {
    title: 'Midnight Chikankari Sharara Set',
    brand: 'Faabiiana',
    subCategory: 'Sharara Set',
    actualPrice: 8499,
    color: 'Black',
    colorName: 'Onyx Black & Antique Gold',
    fabric: 'Viscose georgette with shadow-work chikankari and gold accents',
    occasion: 'Mehendi',
    image: '/media/catalog/lehengas-lavender-chikankari.webp',
    rating: 4.93,
    reviews: 38,
    description:
      'A black sharara set with delicate Lucknowi shadow work and a gold-dusted dupatta. A dramatic pick for mehendi evenings.'
  },
  {
    title: 'Zari Sharara Set in Mint',
    brand: 'Marwar Heritage',
    subCategory: 'Sharara Set',
    actualPrice: 11999,
    color: 'Green',
    colorName: 'Mint Green & Pearl Zari',
    fabric: 'Raw silk with pearl zari jaal and gota edging',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 29,
    description:
      'A soft mint sharara set with a structured kurta and pearl zari detailing. Pairs beautifully with polki and a maang tikka.'
  },
  {
    title: 'Printed Sharara Set in Fuchsia',
    brand: 'Masaba',
    subCategory: 'Sharara Set',
    actualPrice: 7499,
    color: 'Pink',
    colorName: 'Fuchsia & Ivory Print',
    fabric: 'Crepe with bold digital print and mirror trim',
    occasion: 'Sangeet',
    rating: 4.87,
    reviews: 44,
    description:
      'A playful fuchsia sharara set with an oversized print and mirror-finished edges. The easiest way to stand out at a daytime party.'
  },
  {
    title: 'Floral Chanderi Kurta Set in Red',
    brand: 'Raw Mango',
    subCategory: 'Kurta Set',
    actualPrice: 6499,
    color: 'Red',
    colorName: 'Ruby Red & Ivory Floral',
    fabric: 'Handwoven Chanderi with a floral print',
    occasion: 'Festive',
    rating: 4.94,
    reviews: 61,
    description:
      'A red Chanderi kurta covered in ivory florals, finished with a scalloped neckline and matching pants. Minimal, breathable and beautifully photographed.'
  },
  {
    title: 'Floral Cotton Kurta Set',
    brand: 'Suta',
    subCategory: 'Kurta Set',
    actualPrice: 4999,
    color: 'Red',
    colorName: 'Crimson & Ivory Floral',
    fabric: 'Cotton with a hand block floral print',
    occasion: 'Festive',
    rating: 4.88,
    reviews: 73,
    description:
      'An easy red floral kurta with a mandarin neckline and matching bottoms. Festive enough for puja, comfortable enough for a full day of family functions.'
  },
  {
    title: 'Mukaish Kurta Set in Powder Blue',
    brand: 'Faabiiana',
    subCategory: 'Kurta Set',
    actualPrice: 6999,
    color: 'Blue',
    colorName: 'Powder Blue & Mukaish Silver',
    fabric: 'Georgette with hand mukaish detailing',
    occasion: 'Mehendi',
    rating: 4.9,
    reviews: 34,
    description:
      'Powder blue georgette with mukaish scatter and delicate pearl edging. A quiet, pretty pick for day weddings.'
  },
  {
    title: 'Gota Kurta Set in Lemon Yellow',
    brand: 'Torani',
    subCategory: 'Kurta Set',
    actualPrice: 5999,
    color: 'Yellow',
    colorName: 'Lemon Yellow & Gota Gold',
    fabric: 'Cotton silk with hand gota patti',
    occasion: 'Haldi',
    rating: 4.92,
    reviews: 56,
    description:
      'Lemon yellow cotton silk with gota flowers along the placket and hem. Cheerful, light and made for haldi photographs.'
  },
  {
    title: 'Wine Silk Anarkali Set',
    brand: 'Jaypore',
    subCategory: 'Anarkali Suit',
    actualPrice: 7999,
    color: 'Wine',
    colorName: 'Wine & Antique Gold',
    fabric: 'Silk blend with fine gold motifs',
    occasion: 'Festive',
    rating: 4.89,
    reviews: 39,
    description:
      'A wine silk anarkali with fine gold motifs and a flattering flared hem. Dresses up beautifully with a statement necklace.'
  },
  {
    title: 'Blush Pink Anarkali Set',
    brand: 'Anita Dongre',
    subCategory: 'Anarkali Suit',
    actualPrice: 5999,
    color: 'Pink',
    colorName: 'Blush Pink & Pearl',
    fabric: 'Georgette with pearl and sequin embroidery',
    occasion: 'Mehendi',
    rating: 4.9,
    reviews: 43,
    description:
      'A floor-length blush anarkali with pearl-edged sleeves and a sheer dupatta. Comfort-first festive dressing.'
  },
  {
    title: 'Turquoise Embroidered Palazzo Set',
    brand: 'Anokhi',
    subCategory: 'Palazzo Set',
    actualPrice: 4499,
    color: 'Blue',
    colorName: 'Turquoise & Ivory Embroidery',
    fabric: 'Georgette with thread and sequin embroidery',
    occasion: 'Festive',
    rating: 4.85,
    reviews: 68,
    description:
      'A turquoise palazzo set with ivory thread and sequin embroidery, finished with a matching dupatta. A breathable, budget-friendly set for daytime functions and poojas.'
  },
  {
    title: 'Ivory Chikankari Palazzo Set',
    brand: 'Ritu Kumar',
    subCategory: 'Palazzo Set',
    actualPrice: 6999,
    color: 'Ivory',
    colorName: 'Ivory & White Chikankari',
    fabric: 'Cotton with hand chikankari',
    occasion: 'Sangeet',
    rating: 4.91,
    reviews: 31,
    description:
      'An ivory chikankari kurta with matching palazzos and a sheer dupatta. Understated festive dressing that works for multiple functions.'
  }
]);

const gowns = defineCollection('gowns', [
  {
    title: 'Draped Evening Gown in Red',
    brand: 'Gaurav Gupta',
    subCategory: 'Evening Gown',
    actualPrice: 18999,
    color: 'Red',
    colorName: 'Crimson Red & Sculpted Gold',
    fabric: 'Satin crepe with sculpted metallic drape',
    occasion: 'Cocktail',
    rating: 4.97,
    reviews: 52,
    description:
      'A sculpted crimson gown with a fluid waist drape and a subtle train. Rent it for the one night it deserves.'
  },
  {
    title: 'Off-shoulder Tulle Ball Gown in Silver Grey',
    brand: 'Falguni Shane Peacock',
    subCategory: 'Evening Gown',
    actualPrice: 16999,
    color: 'Silver',
    colorName: 'Silver Grey & Crystal Beads',
    fabric: 'Layered tulle with a hand-beaded bodice',
    occasion: 'Cocktail',
    rating: 4.95,
    reviews: 38,
    description:
      'An off-shoulder silver-grey ball gown with a hand-beaded bodice and a soft tulle skirt. Elegant, dramatic and remarkably comfortable.'
  },
  {
    title: 'Ruby Red Evening Gown',
    brand: 'Amit Aggarwal',
    subCategory: 'Evening Gown',
    actualPrice: 15999,
    color: 'Red',
    colorName: 'Ruby Red & Crystal Neckline',
    fabric: 'Structured crepe with a fitted bodice',
    occasion: 'Reception',
    rating: 4.94,
    reviews: 33,
    description:
      'A ruby red gown with a crystal-trimmed neckline and a fluid floor-sweeping skirt. A modern alternative to the traditional reception lehenga.'
  },
  {
    title: 'Satin Evening Gown in Lime Green',
    brand: 'Tarun Tahiliani',
    subCategory: 'Evening Gown',
    actualPrice: 14999,
    color: 'Green',
    colorName: 'Lime Green & Crystal',
    fabric: 'Duchess satin with a sheer embellished drape',
    occasion: 'Reception',
    rating: 4.93,
    reviews: 41,
    description:
      'A liquid lime green satin gown with a jewel-embellished neckline and a sheer drape. Glamorous with minimal jewellery.'
  },
  {
    title: 'Beaded Kaftan Gown in Black & Gold',
    brand: 'Manish Malhotra',
    subCategory: 'Evening Gown',
    actualPrice: 19999,
    color: 'Black',
    colorName: 'Black & Antique Gold Beads',
    fabric: 'Georgette with hand-beaded gold work',
    occasion: 'Reception',
    rating: 4.96,
    reviews: 47,
    description:
      'A floor-length black kaftan gown covered in antique gold beadwork. Needs nothing more than earrings and a clutch.'
  },
  {
    title: 'Gold Sequin Evening Gown',
    brand: 'Seema Gujral',
    subCategory: 'Evening Gown',
    actualPrice: 11999,
    color: 'Gold',
    colorName: 'Champagne Gold & Crystal',
    fabric: 'Stretch mesh with all-over sequin work',
    occasion: 'Cocktail',
    rating: 4.92,
    reviews: 58,
    description:
      'A shimmering gold sequin gown with a One-shoulder neckline and a fluid column skirt. Made for after-parties and receptions.'
  },
  {
    title: 'Red Sequin Cocktail Dress',
    brand: 'Rohit Bal',
    subCategory: 'Cocktail Dress',
    actualPrice: 12999,
    color: 'Red',
    colorName: 'Ruby Red & Crystal Sequin',
    fabric: 'Stretch mesh with all-over sequin work',
    occasion: 'Cocktail',
    rating: 4.94,
    reviews: 36,
    description:
      'A body-skimming ruby sequin dress with a sweetheart neckline and a dramatic back. Winter cocktail dressing, sorted.'
  },
  {
    title: 'Silver Sequin Mini Dress',
    brand: 'Namrata Joshipura',
    subCategory: 'Cocktail Dress',
    actualPrice: 9999,
    color: 'Silver',
    colorName: 'Silver Champagne Sequins',
    fabric: 'Stretch mesh with all-over sequin work',
    occasion: 'Cocktail',
    rating: 4.88,
    reviews: 44,
    description:
      'A short silver sequin dress with a scoop neckline, a bow-back sash and a swishy hem. The easiest party dress to rent.'
  },
  {
    title: 'Blush Sequin Cocktail Dress',
    brand: 'Falguni Shane Peacock',
    subCategory: 'Cocktail Dress',
    actualPrice: 13999,
    color: 'Pink',
    colorName: 'Blush Pink & Crystal Sequin',
    fabric: 'Sequin mesh with a fitted bodice',
    occasion: 'Sangeet',
    rating: 4.95,
    reviews: 31,
    description:
      'A blush sequin slip dress with a fitted bodice, delicate straps and an asymmetric hem. A fun, flirty pick for sangeet after-parties.'
  },
  {
    title: 'Sequin Evening Gown in Midnight Navy',
    brand: 'Falguni Shane Peacock',
    subCategory: 'Evening Gown',
    actualPrice: 14999,
    color: 'Blue',
    colorName: 'Midnight Navy & Liquid Silver',
    fabric: 'Stretch mesh with all-over sequin work',
    occasion: 'Cocktail',
    rating: 4.93,
    reviews: 27,
    description:
      'Midnight navy sequins with a plunging neckline and a body-skimming skirt. Dramatic in photographs, light on the body.'
  },
  {
    title: 'Silver Beaded Evening Gown',
    brand: 'Amit Aggarwal',
    subCategory: 'Evening Gown',
    actualPrice: 16999,
    color: 'Silver',
    colorName: 'Silver Champagne & Crystal Beads',
    fabric: 'Net with hand-beaded crystal work',
    occasion: 'Reception',
    rating: 4.96,
    reviews: 42,
    description:
      'A silver beaded gown with delicate straps and a fluid column silhouette. For the bride who wants something different.'
  },
  {
    title: 'Draped Sari Gown with Statement Belt',
    brand: 'Tarun Tahiliani',
    subCategory: 'Indo-Western Gown',
    actualPrice: 13999,
    color: 'Red',
    colorName: 'Crimson Wine & Antique Gold',
    fabric: 'Pre-draped jersey sari gown with zari belt',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 49,
    description:
      'The five-minute sari. A pre-draped crimson jersey gown with a hand-embroidered belt and a fluid pallu.'
  },
  {
    title: 'Strapless Evening Gown in Ivory',
    brand: 'Gaurav Gupta',
    subCategory: 'Evening Gown',
    actualPrice: 15999,
    color: 'Ivory',
    colorName: 'Ivory & Pearl',
    fabric: 'Structured satin with a draped bodice',
    occasion: 'Cocktail',
    rating: 4.92,
    reviews: 28,
    description:
      'An ivory strapless gown with a draped bodice and a column skirt. Sharp, modern and very photo-ready.'
  },
  {
    title: 'Powder Blue Embellished Gown',
    brand: 'Manish Malhotra',
    subCategory: 'Evening Gown',
    actualPrice: 17999,
    color: 'Blue',
    colorName: 'Powder Blue & Metallic Silver',
    fabric: 'Embellished tulle with a detachable fur stole',
    occasion: 'Reception',
    rating: 4.94,
    reviews: 35,
    description:
      'Powder blue embellished tulle with a metallic sheen, styled here with a detachable fur stole. Catches every light on the dance floor.'
  }
]);

module.exports = { suits, gowns };
