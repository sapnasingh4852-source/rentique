const { defineCollection } = require('./helper');

const sarees = defineCollection('sarees', [
  {
    title: 'Katan Silk Banarasi Saree in Sindoor Red',
    brand: 'Raw Mango',
    subCategory: 'Banarasi Saree',
    actualPrice: 12499,
    color: 'Red',
    colorName: 'Sindoor Red & Antique Zari',
    fabric: 'Pure katan silk with kadhwa boota and a broad zari border',
    occasion: 'Wedding',
    image: '/media/catalog/sarees-banarasi-red.webp',
    rating: 4.97,
    reviews: 86,
    description:
      'The quintessential Banarasi bridal drape. Handwoven in Varanasi with antique zari bootas, a statement pallu and enough weight to hold a perfect pleat all day.'
  },
  {
    title: 'Shikargah Jaal Banarasi Silk Saree',
    brand: 'Ekaya',
    subCategory: 'Banarasi Saree',
    actualPrice: 15999,
    color: 'Black',
    colorName: 'Midnight Black & Antique Gold',
    fabric: 'Pure silk with handwoven shikargah jaal and antique gold zari',
    occasion: 'Reception',
    rating: 4.95,
    reviews: 54,
    description:
      'A collector-grade Banarasi with hunt-scene motifs woven across the body. Understated from a distance, extraordinary up close.'
  },
  {
    title: 'Antique Zari Kadhwa Banarasi Saree',
    brand: 'Sabyasachi',
    subCategory: 'Banarasi Saree',
    actualPrice: 18999,
    color: 'Wine',
    colorName: 'Old Wine & Antique Gold',
    fabric: 'Katan silk with kadhwa zari and hand-finished fall',
    occasion: 'Wedding',
    rating: 4.98,
    reviews: 39,
    description:
      'Deep wine silk with a dense antique gold border and traditional buti scatter. Rented with a matching blouse piece and pre-stitched fall.'
  },
  {
    title: 'Tissue Banarasi Saree in Rani Pink',
    brand: 'Tilfi',
    subCategory: 'Banarasi Saree',
    actualPrice: 13999,
    color: 'Pink',
    colorName: 'Rani Pink & Gold Zari',
    fabric: 'Tissue silk with fine gold zari stripes',
    occasion: 'Wedding',
    rating: 4.92,
    reviews: 47,
    description:
      'Featherlight tissue Banarasi for daytime weddings and civil ceremonies. Catches the light beautifully in outdoor pheras.'
  },
  {
    title: 'Rangkat Banarasi Silk Saree in Aqua Teal',
    brand: 'Ekaya',
    subCategory: 'Banarasi Saree',
    actualPrice: 14499,
    color: 'Blue',
    colorName: 'Aqua Teal & Gold Zari',
    fabric: 'Rangkat silk with kadhwa border and palla',
    occasion: 'Reception',
    rating: 4.94,
    reviews: 32,
    description:
      'A soft aqua teal rangkat weave with a contrasting gold pallu. Pairs beautifully with polki and a sleek bun.'
  },
  {
    title: 'Pure Kanjeevaram Silk Saree in Temple Gold',
    brand: 'Nalli',
    subCategory: 'Kanjeevaram Saree',
    actualPrice: 16999,
    color: 'Gold',
    colorName: 'Temple Gold & Vermillion Border',
    fabric: 'Pure mulberry silk with 3-ply korvai zari border',
    occasion: 'Wedding',
    image: '/media/catalog/sarees-kanjeevaram-gold.webp',
    rating: 4.99,
    reviews: 102,
    description:
      'Our most requested Kanjeevaram. Woven in Kanchipuram with a contrast vermillion korvai border and traditional temple motifs on the pallu.'
  },
  {
    title: 'Korvai Border Kanjeevaram in Deep Purple',
    brand: 'Pothys',
    subCategory: 'Kanjeevaram Saree',
    actualPrice: 15499,
    color: 'Purple',
    colorName: 'Deep Purple & Gold Tissue',
    fabric: 'Pure Kanjeevaram silk with handwoven korvai border',
    occasion: 'Wedding',
    rating: 4.96,
    reviews: 61,
    description:
      'Classic deep purple Kanjeevaram with a wide gold border and rich contrast pallu. A no-fail choice for muhurtham and family weddings.'
  },
  {
    title: 'Rettaipet Kanjeevaram in Emerald Green',
    brand: 'Nalli',
    subCategory: 'Kanjeevaram Saree',
    actualPrice: 17999,
    color: 'Green',
    colorName: 'Emerald Green & Ruby Border',
    fabric: 'Pure silk with rettaipet double-border zari work',
    occasion: 'Wedding',
    rating: 4.97,
    reviews: 44,
    description:
      'Emerald body with a broad ruby-and-gold rettaipet border. The kind of saree that photographs like an heirloom.'
  },
  {
    title: 'Pastel Kanjeevaram Silk Saree',
    brand: 'Sundari Silks',
    subCategory: 'Kanjeevaram Saree',
    actualPrice: 12999,
    color: 'Pink',
    colorName: 'Rose Pink & Soft Gold',
    fabric: 'Pure Kanjeevaram silk in a pastel palette',
    occasion: 'Reception',
    rating: 4.9,
    reviews: 36,
    description:
      'A modern, lighter Kanjeevaram in rose pink with fine gold checks. Ideal for engagements and daytime receptions.'
  },
  {
    title: 'Sunset Ombr\u00e9 Organza Saree',
    brand: 'Torani',
    subCategory: 'Organza Saree',
    actualPrice: 7499,
    color: 'Pink',
    colorName: 'Marigold, Blush & Ivory Ombr\u00e9',
    fabric: 'Silk organza with hand-appliqu\u00e9d gota patti',
    occasion: 'Sangeet',
    image: '/media/catalog/sarees-organza-pastel.webp',
    rating: 4.93,
    reviews: 58,
    description:
      'An ombr\u00e9 organza that moves from marigold to blush pink, finished with gota details and a scalloped border. Comes with a stitched blouse and is light enough to dance in.'
  },
  {
    title: 'Hand-painted Floral Organza Saree',
    brand: 'Masaba',
    subCategory: 'Organza Saree',
    actualPrice: 8499,
    color: 'Peach',
    colorName: 'Peach & Botanical Multi',
    fabric: 'Pure organza with hand-painted botanical motifs',
    occasion: 'Mehendi',
    rating: 4.88,
    reviews: 41,
    description:
      'A painterly peach organza drape with subtle florals and a hand-finished edge. Perfect for mehendi lunches and day weddings.'
  },
  {
    title: 'Sequin Organza Saree in Champagne',
    brand: 'Manish Malhotra',
    subCategory: 'Organza Saree',
    actualPrice: 11499,
    color: 'Gold',
    colorName: 'Champagne & Micro Sequins',
    fabric: 'Organza with all-over micro sequin work',
    occasion: 'Cocktail',
    rating: 4.95,
    reviews: 63,
    description:
      'A shimmering sequin organza that needs no accessories. Rented with a matching sequin blouse and pre-draped option on request.'
  },
  {
    title: 'Ruffle Edge Organza Saree in Sage',
    brand: 'Anita Dongre',
    subCategory: 'Organza Saree',
    actualPrice: 8999,
    color: 'Green',
    colorName: 'Sage Green & Peach Border',
    fabric: 'Silk organza with ruffled edge and pearl detailing',
    occasion: 'Sangeet',
    rating: 4.89,
    reviews: 29,
    description:
      'Soft sage organza with a peach border and a ruffle pallu. A fresh pick for outdoor sangeet and haldi functions.'
  },
  {
    title: 'Floral Georgette Saree in Black & Red',
    brand: 'Ritu Kumar',
    subCategory: 'Georgette Saree',
    actualPrice: 5999,
    color: 'Black',
    colorName: 'Onyx Black & Crimson Floral',
    fabric: 'Pure georgette with a floral print',
    occasion: 'Festive',
    rating: 4.86,
    reviews: 71,
    description:
      'A black georgette saree scattered with crimson florals and finished with a fine border. A festive staple that drapes effortlessly.'
  },
  {
    title: 'Mukaish Georgette Saree in Purple',
    brand: 'Faabiiana',
    subCategory: 'Georgette Saree',
    actualPrice: 7499,
    color: 'Purple',
    colorName: 'Royal Purple & Mukaish Silver',
    fabric: 'Viscose georgette with hand mukaish work',
    occasion: 'Sangeet',
    rating: 4.91,
    reviews: 34,
    description:
      'A vivid purple georgette scattered with mukaish stars and a delicate sequin border. Rented with a stitched blouse.'
  },
  {
    title: 'Sequin Georgette Saree in Aqua Teal',
    brand: 'Seema Gujral',
    subCategory: 'Georgette Saree',
    actualPrice: 9499,
    color: 'Blue',
    colorName: 'Aqua Teal & Silver Sequin',
    fabric: 'Georgette with hand-embroidered sequin jaal',
    occasion: 'Cocktail',
    rating: 4.94,
    reviews: 45,
    description:
      'Luminous aqua teal georgette with an all-over silver sequin jaal. A cocktail-ready saree that reads modern and festive at once.'
  },
  {
    title: 'Printed Georgette Saree in Mustard',
    brand: 'Masaba',
    subCategory: 'Georgette Saree',
    actualPrice: 5499,
    color: 'Yellow',
    colorName: 'Mustard & Ivory Print',
    fabric: 'Georgette with digital floral print',
    occasion: 'Festive',
    rating: 4.84,
    reviews: 52,
    description:
      'Easy mustard georgette with an ivory floral print and piping border. A budget-friendly pick for haldi and festive pujas.'
  },
  {
    title: 'Chanderi Silk Saree in Ivory Gold',
    brand: 'Raw Mango',
    subCategory: 'Silk Saree',
    actualPrice: 9999,
    color: 'Ivory',
    colorName: 'Ivory & Gold Zari',
    fabric: 'Handwoven Chanderi silk with zari buti',
    occasion: 'Festive',
    rating: 4.93,
    reviews: 48,
    description:
      'A translucent Chanderi with gold butis and a fine zari border. Light, breathable and endlessly elegant.'
  },
  {
    title: 'Tussar Silk Saree in Royal Blue',
    brand: 'Anavila',
    subCategory: 'Silk Saree',
    actualPrice: 8499,
    color: 'Blue',
    colorName: 'Royal Blue & Purple Border',
    fabric: 'Pure tussar silk with a contrast purple border',
    occasion: 'Festive',
    rating: 4.9,
    reviews: 33,
    description:
      'A deep royal blue tussar with a purple sheen and a fine gold border. For the woman who prefers texture and craft over sparkle.'
  },
  {
    title: 'Mysore Silk Saree in Royal Purple',
    brand: 'Suta',
    subCategory: 'Silk Saree',
    actualPrice: 6999,
    color: 'Wine',
    colorName: 'Royal Purple & Gold Line',
    fabric: 'Mysore silk with a fine gold line border',
    occasion: 'Festive',
    rating: 4.87,
    reviews: 57,
    description:
      'Soft Mysore silk in a rich royal purple with a minimal gold border. The easiest drape to carry from puja to dinner.'
  }
]);

module.exports = { sarees };
