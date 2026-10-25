const { defineCollection } = require('./helper');

const u = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const jewellery = defineCollection('jewellery', [
  {
    title: 'Sabyasachi Heritage Kundan & Pearl Choker Set',
    brand: 'Sabyasachi Jewelry',
    subCategory: 'Kundan Set',
    actualPrice: 24999,
    color: 'Gold',
    colorName: '22K Gold, Uncut Kundan & Sea Pearls',
    fabric: 'Gold-plated brass with uncut kundan and hand-strung pearls',
    occasion: 'Wedding',
    image: u('photo-1599643478518-a784e5dc4c8f'),
    rating: 4.98,
    reviews: 94,
    description:
      'The bridal set our stylists reach for first. A pearl-fringed kundan choker with matching chandelier earrings and a maang tikka, packed in a velvet box.'
  },
  {
    title: 'Emerald Kundan Bridal Set',
    brand: 'Jaipur Gems',
    subCategory: 'Kundan Set',
    actualPrice: 21999,
    color: 'Green',
    colorName: 'Emerald Green & Uncut Kundan',
    fabric: 'Gold-plated silver with emerald drops and kundan stones',
    occasion: 'Wedding',
    image: u('photo-1535632066927-ab7c9ab60908'),
    rating: 4.96,
    reviews: 61,
    description:
      'Deep emerald drops suspended from an uncut kundan necklace, with matching earrings. A rich jewel tone that lifts ivory and red bridal outfits.'
  },
  {
    title: 'Ruby Kundan Choker Set',
    brand: 'Amrapali',
    subCategory: 'Kundan Set',
    actualPrice: 18999,
    color: 'Red',
    colorName: 'Ruby Red & Antique Gold',
    fabric: 'Gold-plated brass with ruby-coloured kundan and pearls',
    occasion: 'Reception',
    image: u('photo-1515562141207-7a88fb7ce338'),
    rating: 4.94,
    reviews: 48,
    description:
      'A ruby kundan choker with a soft antique finish and pearl drops. Comes with matching jhumkas, ideal for reception and cocktail looks.'
  },
  {
    title: 'Temple Gold Pendant Set',
    brand: 'Kishandas & Co',
    subCategory: 'Temple Jewellery',
    actualPrice: 22999,
    color: 'Gold',
    colorName: '22K Gold & Ruby',
    fabric: 'Gold-plated brass with a temple pendant and ruby accents',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 39,
    description:
      'A gold temple pendant set with ruby accents and matching jhumkas. The classic choice for a traditional south-Indian bridal look.'
  },
  {
    title: 'Kundan Rani Haar Set',
    brand: 'Tanishq',
    subCategory: 'Kundan Set',
    actualPrice: 29999,
    color: 'Gold',
    colorName: 'Antique Gold & Polki',
    fabric: 'Gold-plated brass with uncut polki and layered pearls',
    occasion: 'Wedding',
    rating: 4.97,
    reviews: 52,
    description:
      'A long rani haar layered over a kundan choker, finished with pearl tassels. The full bridal set, without the full bridal price.'
  },
  {
    title: 'Polki Choker Set with Pearls',
    brand: 'Amrapali',
    subCategory: 'Polki Set',
    actualPrice: 26999,
    color: 'Gold',
    colorName: 'Uncut Polki & Basra Pearls',
    fabric: 'Gold-plated silver with uncut polki and freshwater pearls',
    occasion: 'Wedding',
    rating: 4.97,
    reviews: 57,
    description:
      'A classic polki choker with a pearl drop border and matching earrings. Subtle sparkle that photographs beautifully under warm wedding lights.'
  },
  {
    title: 'Uncut Polki Necklace Set',
    brand: 'Jaipur Gems',
    subCategory: 'Polki Set',
    actualPrice: 31999,
    color: 'Gold',
    colorName: 'Champagne Polki & Gold',
    fabric: 'Gold-plated brass with uncut polki and emerald accents',
    occasion: 'Reception',
    rating: 4.96,
    reviews: 34,
    description:
      'A statement uncut polki necklace with a broad gold frame and emerald accents. Comes with chandelier earrings and a passa.'
  },
  {
    title: 'Polki & Emerald Set',
    brand: 'Sunita Shekhawat',
    subCategory: 'Polki Set',
    actualPrice: 28999,
    color: 'Green',
    colorName: 'Polki & Emerald Green',
    fabric: 'Gold-plated silver with polki stones and carved emeralds',
    occasion: 'Wedding',
    rating: 4.98,
    reviews: 41,
    description:
      'Jaipur-style polki with carved emerald drops and a fine pearl fringe. An heirloom look for the main ceremony.'
  },
  {
    title: 'Polki Necklace & Passa Set',
    brand: 'Kishandas & Co',
    subCategory: 'Polki Set',
    actualPrice: 25999,
    color: 'Gold',
    colorName: 'Polki & Antique Gold',
    fabric: 'Gold-plated brass with uncut polki and pearl detailing',
    occasion: 'Sangeet',
    rating: 4.93,
    reviews: 27,
    description:
      'A lighter polki necklace paired with a side passa. Designed for sangeet looks that need movement and sparkle.'
  },
  {
    title: 'Temple Gold Lakshmi Haram Set',
    brand: 'Tanishq',
    subCategory: 'Temple Jewellery',
    actualPrice: 18999,
    color: 'Gold',
    colorName: 'Antique Temple Gold & Kemp Ruby',
    fabric: 'Matte gold-plated brass with kemp stones and pearl cords',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 63,
    description:
      'A South Indian temple haram with a Lakshmi motif, layered pearl cords and matching jhumkas. Pairs perfectly with Kanjeevaram silk.'
  },
  {
    title: 'Temple Jhumka & Necklace Set',
    brand: 'Amrapali',
    subCategory: 'Temple Jewellery',
    actualPrice: 14999,
    color: 'Gold',
    colorName: 'Matte Gold & Ruby Red',
    fabric: 'Antique gold-plated brass with kemp stones',
    occasion: 'Festive',
    rating: 4.92,
    reviews: 47,
    description:
      'A compact temple necklace with matching jhumkas. Festive enough for Diwali, easy enough to wear all evening.'
  },
  {
    title: 'Antique Temple Choker',
    brand: 'Marwar Heritage',
    subCategory: 'Temple Jewellery',
    actualPrice: 12999,
    color: 'Gold',
    colorName: 'Antique Gold & Pearl',
    fabric: 'Antique gold-plated brass with pearl drops',
    occasion: 'Wedding',
    rating: 4.94,
    reviews: 38,
    description:
      'A broad antique temple choker with a pearl fringe. The quickest way to make a simple silk saree feel ceremonial.'
  },
  {
    title: 'Kemp Stone Temple Set',
    brand: 'South Heritage Gems',
    subCategory: 'Temple Jewellery',
    actualPrice: 11999,
    color: 'Red',
    colorName: 'Kemp Red & Matte Gold',
    fabric: 'Matte gold-plated brass with kemp rubies and green beads',
    occasion: 'Wedding',
    rating: 4.91,
    reviews: 44,
    description:
      'Traditional kemp stone necklace with matching earrings. A Bharatnatyam and muhurtham favourite.'
  },
  {
    title: 'Bridal Polki Necklace with Green Beads',
    brand: 'Jaipur Gems',
    subCategory: 'Polki Set',
    actualPrice: 13999,
    color: 'Green',
    colorName: 'Emerald Beads & Gold',
    fabric: 'Gold-plated brass with carved green beads and pearls',
    occasion: 'Reception',
    rating: 4.9,
    reviews: 36,
    description:
      'A layered bridal polki necklace with carved green beads and a pearl edge. A beautiful contrast against red and ivory bridal outfits.'
  },
  {
    title: 'Crystal Hoop & Pendant Set',
    brand: 'Zaveri Pearls',
    subCategory: 'Earrings',
    actualPrice: 9999,
    color: 'Silver',
    colorName: 'Silver & Champagne Crystal',
    fabric: 'Silver-plated brass with champagne crystals',
    occasion: 'Cocktail',
    rating: 4.89,
    reviews: 58,
    description:
      'A pair of crystal hoop earrings with a matching pendant necklace. Understated enough for a cocktail dress, modern enough for a saree.'
  },
  {
    title: 'Oxidised Silver Choker Set',
    brand: 'Jaipur Meena Art',
    subCategory: 'Choker Set',
    actualPrice: 11999,
    color: 'Silver',
    colorName: 'Silver & Turquoise Enamel',
    fabric: 'Oxidised silver-plated brass with turquoise enamel',
    occasion: 'Sangeet',
    rating: 4.92,
    reviews: 43,
    description:
      'An oxidised silver choker with turquoise enamel and ruby accents. A colourful pick for mehendi and sangeet.'
  },
  {
    title: 'Diamond Polki Choker',
    brand: 'CaratLane Luxe',
    subCategory: 'Choker Set',
    actualPrice: 27999,
    color: 'Gold',
    colorName: 'Rhodium & Champagne Polki',
    fabric: 'Rhodium-plated silver with polki and cubic zirconia',
    occasion: 'Cocktail',
    rating: 4.96,
    reviews: 31,
    description:
      'A modern polki choker with a rhodium finish and brilliant CZ accents. A clean, contemporary take on bridal jewellery.'
  },
  {
    title: 'Kundan Jhumkas',
    brand: 'Amrapali',
    subCategory: 'Earrings',
    actualPrice: 6999,
    color: 'Gold',
    colorName: 'Gold & Pearl Drop',
    fabric: 'Gold-plated brass with kundan and pearls',
    occasion: 'Wedding',
    rating: 4.95,
    reviews: 76,
    description:
      'Classic dome jhumkas with kundan detailing and a pearl drop. Heavy enough to feel special, light enough for a full evening.'
  },
  {
    title: 'Antique Gold Jhumkas',
    brand: 'Jaipur Gems',
    subCategory: 'Earrings',
    actualPrice: 8499,
    color: 'Gold',
    colorName: 'Polki & Antique Gold',
    fabric: 'Gold-plated silver with uncut polki',
    occasion: 'Reception',
    rating: 4.93,
    reviews: 42,
    description:
      'Dome jhumkas with uncut polki and tiny pearl drops. The earring equivalent of a statement necklace.'
  },
  {
    title: 'Polki & Pearl Drop Earrings',
    brand: 'Zaveri Pearls',
    subCategory: 'Earrings',
    actualPrice: 4999,
    color: 'Gold',
    colorName: 'Polki, Emerald & Pearl',
    fabric: 'Gold-plated brass with polki, emerald beads and pearls',
    occasion: 'Cocktail',
    rating: 4.88,
    reviews: 65,
    description:
      'Long polki drop earrings with emerald beads and pearl fringe. The easiest finishing touch for a gown or a pastel saree.'
  },
  {
    title: 'Kundan Maang Tikka',
    brand: 'Tanishq',
    subCategory: 'Maang Tikka',
    actualPrice: 4499,
    color: 'Gold',
    colorName: 'Kundan & Pearl',
    fabric: 'Gold-plated brass with kundan and a pearl drop',
    occasion: 'Wedding',
    rating: 4.94,
    reviews: 49,
    description:
      'A single-tier kundan maang tikka with a pearl drop. Understated bridal finishing that suits both lehengas and sarees.'
  },
  {
    title: 'Polki Passa / Maang Tikka',
    brand: 'Sunita Shekhawat',
    subCategory: 'Maang Tikka',
    actualPrice: 6499,
    color: 'Gold',
    colorName: 'Polki & Emerald',
    fabric: 'Gold-plated silver with polki and emerald beads',
    occasion: 'Sangeet',
    rating: 4.96,
    reviews: 33,
    description:
      'A side passa in polki and emerald, with a delicate chain. Adds a Mughal touch to a sleek bun or a side-parted look.'
  },
  {
    title: 'Kundan Bangles Set of 2',
    brand: 'Amrapali',
    subCategory: 'Bangles',
    actualPrice: 8999,
    color: 'Gold',
    colorName: 'Kundan & Gold',
    fabric: 'Gold-plated brass with kundan stones',
    occasion: 'Wedding',
    rating: 4.91,
    reviews: 55,
    description:
      'A pair of broad kundan bangles with a pearl edge. Rented as a set of two, in a standard 2.6 inch size.'
  },
  {
    title: 'Temple Gold Bangles Set of 4',
    brand: 'South Heritage Gems',
    subCategory: 'Bangles',
    actualPrice: 10999,
    color: 'Gold',
    colorName: 'Antique Gold & Kemp',
    fabric: 'Matte gold-plated brass with kemp stone accents',
    occasion: 'Festive',
    rating: 4.93,
    reviews: 47,
    description:
      'Four slim temple bangles with kemp accents. Stack them together or mix with plain gold for a festive wrist.'
  }
]);

module.exports = { jewellery };
