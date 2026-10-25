/**
 * Single source of truth for Rentique's catalog taxonomy.
 * Collection = top-level storefront shelf. Sub-category = the filter pill
 * customers actually shop by. Both are mirrored by GET /api/products/facets.
 */

const COLLECTIONS = [
  {
    id: 'lehengas',
    label: 'Lehengas',
    hindi: 'लहंगा',
    category: 'CLOTHES',
    tagline: 'Bridal, festive & sangeet edits',
    description:
      'Hand-embroidered lehenga cholis from India\u2019s most loved ateliers \u2014 bridal reds, festive jewel tones and sangeet pastels, steam-pressed and delivered in a sealed garment bag.',
    image: '/media/catalog/lehengas-bridal-red.webp',
    accent: '#8B1E3F',
    subCategories: ['Bridal Lehenga', 'Sangeet Lehenga', 'Mehendi Lehenga', 'Reception Lehenga']
  },
  {
    id: 'sarees',
    label: 'Sarees',
    hindi: 'साड़ी',
    category: 'CLOTHES',
    tagline: 'Banarasi, Kanjeevaram & organza',
    description:
      'Pure silk heirlooms and featherlight organza drapes, sourced directly from weaving clusters across Varanasi, Kanchipuram and Chanderi.',
    image: '/media/catalog/sarees-kanjeevaram-gold.webp',
    accent: '#B45309',
    subCategories: ['Banarasi Saree', 'Kanjeevaram Saree', 'Organza Saree', 'Georgette Saree', 'Silk Saree']
  },
  {
    id: 'suits',
    label: 'Suits & Anarkalis',
    hindi: 'अनारकली',
    category: 'CLOTHES',
    tagline: 'Anarkali, sharara & kurta sets',
    description:
      'Easy celebration tailoring \u2014 chikankari anarkalis, mirror-work shararas and weekday-to-festive kurta sets.',
    image: '/media/catalog/suits-anarkali-mint.jpg',
    accent: '#A16207',
    subCategories: ['Anarkali Suit', 'Sharara Set', 'Kurta Set', 'Palazzo Set']
  },
  {
    id: 'gowns',
    label: 'Gowns & Dresses',
    hindi: 'गाउन',
    category: 'CLOTHES',
    tagline: 'Cocktail, evening & indo-western',
    description:
      'Red-carpet gowns, sculpted corsets and indo-western drapes for receptions, cocktails and after-parties.',
    image: '/media/catalog/gowns-draped-ivory.jpg',
    accent: '#4A044E',
    subCategories: ['Evening Gown', 'Cocktail Dress', 'Indo-Western Gown']
  },
  {
    id: 'menswear',
    label: "Men's Ethnic",
    hindi: 'शेरवानी',
    category: 'CLOTHES',
    tagline: 'Sherwani, bandhgala & kurta',
    description:
      'Groom sherwanis, jodhpuri bandhgalas and festive kurtas \u2014 tailored, steamed and ready for the baraat.',
    image: '/media/catalog/menswear-ivory-sherwani.webp',
    accent: '#1F3A5F',
    subCategories: ['Sherwani', 'Bandhgala', 'Kurta Set', 'Indo-Western']
  },
  {
    id: 'jewellery',
    label: 'Jewellery',
    hindi: 'गहने',
    category: 'ACCESSORIES',
    tagline: 'Kundan, polki & temple gold',
    description:
      'Bridal chokers, polki sets and temple jewellery, sanitised and packed in velvet boxes with authenticity cards.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    accent: '#B8860B',
    subCategories: ['Kundan Set', 'Polki Set', 'Temple Jewellery', 'Choker Set', 'Earrings', 'Maang Tikka', 'Bangles']
  },
  {
    id: 'bags',
    label: 'Bags & Accessories',
    hindi: 'पोटली',
    category: 'ACCESSORIES',
    tagline: 'Potlis, clutches & dupattas',
    description:
      'Zardozi potlis, crystal clutches and handloom dupattas that finish the outfit without buying them outright.',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80',
    accent: '#7C2D12',
    subCategories: ['Potli Bag', 'Clutch', 'Dupatta', 'Handbag']
  },
  {
    id: 'footwear',
    label: 'Footwear',
    hindi: 'जूती',
    category: 'SHOES',
    tagline: 'Mojari, jutti & heels',
    description:
      'Hand-embroidered mojaris and juttis plus party heels, sanitised after every single rental.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
    accent: '#9D174D',
    subCategories: ['Mojari', 'Jutti', 'Heels', 'Loafers']
  }
];

const COLOR_FAMILIES = [
  { name: 'Red', hex: '#B4232F' },
  { name: 'Green', hex: '#1F6F54' },
  { name: 'Yellow', hex: '#D9A514' },
  { name: 'Pink', hex: '#D8708E' },
  { name: 'Blue', hex: '#274C77' },
  { name: 'Ivory', hex: '#EFE6D6' },
  { name: 'Gold', hex: '#C79A3B' },
  { name: 'Wine', hex: '#6D1F3A' },
  { name: 'Black', hex: '#211A17' }
];

const collectionMap = Object.fromEntries(COLLECTIONS.map(c => [c.id, c]));

module.exports = { COLLECTIONS, COLOR_FAMILIES, collectionMap };
