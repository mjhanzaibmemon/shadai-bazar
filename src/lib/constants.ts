/**
 * SHAADI BAZAAR — Master constants for the entire app.
 * Categories cover BOTH bride/groom AND guest (mehmaan) wear, plus accessories.
 * Sub-categories follow Pakistani wedding terminology.
 */

// ─────────────────────────────────────────────────────────────
// CATEGORIES — Top-level navigation (homepage + filter)
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'bridal',      label: 'Bridal Wear',       icon: '👰', tagline: 'Dulhan ke liye' },
  { id: 'groom',       label: 'Groom Wear',        icon: '🤵', tagline: 'Dulha ke liye' },
  { id: 'guest-women', label: 'Guest — Women',     icon: '👗', tagline: 'Mehmaan auratein' },
  { id: 'guest-men',   label: 'Guest — Men',       icon: '🕴️', tagline: 'Mehmaan mard' },
  { id: 'kids',        label: 'Kids Wear',         icon: '👧', tagline: 'Bachon ke liye' },
  { id: 'jewelry',     label: 'Jewelry',           icon: '💍', tagline: 'Zewar' },
  { id: 'footwear',    label: 'Footwear',          icon: '👠', tagline: 'Khussa, heels' },
  { id: 'accessories', label: 'Accessories',       icon: '👜', tagline: 'Bags, dupattas' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// ─────────────────────────────────────────────────────────────
// SUB-CATEGORIES — every Pakistani wedding dress type
// ─────────────────────────────────────────────────────────────
export const SUB_CATEGORIES: Record<CategoryId, { id: string; label: string }[]> = {
  bridal: [
    { id: 'bridal-lehenga',     label: 'Bridal Lehenga' },
    { id: 'bridal-gharara',     label: 'Bridal Gharara' },
    { id: 'bridal-sharara',     label: 'Bridal Sharara' },
    { id: 'bridal-maxi',        label: 'Bridal Maxi' },
    { id: 'bridal-saree',       label: 'Bridal Saree' },
    { id: 'bridal-anarkali',    label: 'Bridal Anarkali' },
    { id: 'bridal-pishwas',     label: 'Bridal Pishwas' },
    { id: 'bridal-angrakha',    label: 'Bridal Angrakha' },
    { id: 'barat-dress',        label: 'Barat Dress' },
    { id: 'walima-dress',       label: 'Walima Dress' },
    { id: 'mehndi-dress',       label: 'Mehndi Dress' },
    { id: 'mayun-dress',        label: 'Mayun / Ubtan Dress' },
    { id: 'nikah-dress',        label: 'Nikah Dress' },
    { id: 'engagement-dress',   label: 'Engagement Dress' },
    { id: 'qawwali-dress',      label: 'Qawwali Night Dress' },
  ],
  groom: [
    { id: 'sherwani',           label: 'Sherwani' },
    { id: 'prince-coat',        label: 'Prince Coat' },
    { id: 'wedding-kurta',      label: 'Wedding Kurta' },
    { id: 'kurta-pajama',       label: 'Kurta Pajama' },
    { id: 'waistcoat-set',      label: 'Waistcoat Set' },
    { id: 'shalwar-kameez-groom', label: 'Shalwar Kameez (Groom)' },
    { id: 'turla-kulla',        label: 'Turla / Kulla' },
    { id: 'groom-shoes',        label: 'Khussa / Mojari' },
  ],
  'guest-women': [
    { id: 'lehenga-choli',      label: 'Lehenga Choli' },
    { id: 'gharara',            label: 'Gharara' },
    { id: 'sharara',            label: 'Sharara' },
    { id: 'maxi',               label: 'Maxi / Long Frock' },
    { id: 'saree',              label: 'Saree' },
    { id: 'anarkali',           label: 'Anarkali Suit' },
    { id: 'pishwas',            label: 'Pishwas' },
    { id: 'angrakha',           label: 'Angrakha' },
    { id: 'frock',              label: 'Frock' },
    { id: 'long-shirt',         label: 'Long Shirt Suit' },
    { id: 'short-shirt',        label: 'Short Shirt Suit' },
    { id: 'palazzo-suit',       label: 'Palazzo Suit' },
    { id: 'trouser-suit',       label: 'Trouser Suit' },
    { id: 'kaftan',             label: 'Kaftan' },
    { id: 'gown',               label: 'Evening Gown' },
    { id: 'cape-set',           label: 'Cape / Jacket Set' },
  ],
  'guest-men': [
    { id: 'kurta-shalwar',      label: 'Kurta Shalwar' },
    { id: 'mens-kurta-pajama',  label: 'Kurta Pajama' },
    { id: 'mens-waistcoat',     label: 'Waistcoat with Kurta' },
    { id: 'guest-sherwani',     label: 'Light Sherwani' },
    { id: 'western-suit',       label: 'Western 2/3-Piece Suit' },
    { id: 'tuxedo',             label: 'Tuxedo' },
    { id: 'mens-shoes',         label: 'Formal Shoes / Khussa' },
  ],
  kids: [
    { id: 'boys-sherwani',      label: 'Boys Sherwani' },
    { id: 'boys-kurta',         label: 'Boys Kurta' },
    { id: 'boys-suit',          label: 'Boys Western Suit' },
    { id: 'girls-frock',        label: 'Girls Frock' },
    { id: 'girls-lehenga',      label: 'Girls Lehenga' },
    { id: 'girls-gharara',      label: 'Girls Gharara' },
    { id: 'kids-accessories',   label: 'Kids Accessories' },
  ],
  jewelry: [
    { id: 'necklace-set',       label: 'Necklace Set' },
    { id: 'choker',             label: 'Choker' },
    { id: 'earrings',           label: 'Earrings (Jhumka, Bali)' },
    { id: 'tikka',              label: 'Tikka / Maatha Patti' },
    { id: 'jhoomar',            label: 'Jhoomar / Passa' },
    { id: 'nath',               label: 'Nath' },
    { id: 'bangles',            label: 'Bangles / Choorian' },
    { id: 'kara',               label: 'Kara / Kangan' },
    { id: 'haath-phool',        label: 'Haath Phool / Panja' },
    { id: 'ring',               label: 'Ring' },
    { id: 'anklet',             label: 'Payal / Anklet' },
    { id: 'jewelry-set',        label: 'Full Bridal Set' },
  ],
  footwear: [
    { id: 'bridal-khussa',      label: 'Bridal Khussa' },
    { id: 'heels',              label: 'Heels' },
    { id: 'pumps',              label: 'Pumps / Flats' },
    { id: 'mens-khussa',        label: "Men's Khussa" },
    { id: 'mojari',             label: 'Mojari' },
    { id: 'kolhapuri',          label: 'Kolhapuri' },
    { id: 'wedges',             label: 'Wedges' },
  ],
  accessories: [
    { id: 'dupatta',            label: 'Dupatta / Chadar' },
    { id: 'shawl',              label: 'Shawl' },
    { id: 'clutch',             label: 'Clutch / Potli' },
    { id: 'handbag',            label: 'Handbag' },
    { id: 'hair-accessories',   label: 'Hair Accessories' },
    { id: 'bridal-veil',        label: 'Bridal Veil' },
    { id: 'belts',              label: 'Waist Belts' },
    { id: 'stoles',             label: 'Stoles' },
  ],
};

// ─────────────────────────────────────────────────────────────
// OCCASIONS — Wedding event the dress is meant for
// ─────────────────────────────────────────────────────────────
export const OCCASIONS = [
  { id: 'mayun',       label: 'Mayun / Ubtan',     icon: '🌼' },
  { id: 'mehndi',      label: 'Mehndi',            icon: '🌿' },
  { id: 'qawwali',     label: 'Qawwali Night',     icon: '🎵' },
  { id: 'barat',       label: 'Barat',             icon: '💒' },
  { id: 'nikah',       label: 'Nikah',             icon: '📜' },
  { id: 'walima',      label: 'Walima',            icon: '🥂' },
  { id: 'engagement',  label: 'Engagement',        icon: '💍' },
  { id: 'eid',         label: 'Eid Wear',          icon: '🌙' },
  { id: 'party',       label: 'Party / Reception', icon: '🎉' },
  { id: 'formal',      label: 'Formal Function',   icon: '✨' },
] as const;

// ─────────────────────────────────────────────────────────────
// SIZES — Standard label + custom measurements
// ─────────────────────────────────────────────────────────────
export const SIZE_LABELS = [
  { id: 'XS',     label: 'XS  (32-34")' },
  { id: 'S',      label: 'S   (34-36")' },
  { id: 'M',      label: 'M   (36-38")' },
  { id: 'L',      label: 'L   (38-40")' },
  { id: 'XL',     label: 'XL  (40-42")' },
  { id: 'XXL',   label: 'XXL (42-44")' },
  { id: 'XXXL',  label: 'XXXL (44-46")' },
  { id: 'CUSTOM', label: 'Custom / Free Size' },
] as const;

// Standard women's size chart (inches) — shown to seller as reference
export const WOMENS_SIZE_CHART = [
  { label: 'XS',   chest: '32-33', waist: '24-25', hip: '34-35', shoulder: '14' },
  { label: 'S',    chest: '34-35', waist: '26-27', hip: '36-37', shoulder: '14.5' },
  { label: 'M',    chest: '36-37', waist: '28-29', hip: '38-39', shoulder: '15' },
  { label: 'L',    chest: '38-39', waist: '30-31', hip: '40-41', shoulder: '15.5' },
  { label: 'XL',   chest: '40-41', waist: '32-33', hip: '42-43', shoulder: '16' },
  { label: 'XXL',  chest: '42-43', waist: '34-35', hip: '44-45', shoulder: '16.5' },
  { label: 'XXXL', chest: '44-45', waist: '36-37', hip: '46-47', shoulder: '17' },
];

// Standard men's size chart (inches)
export const MENS_SIZE_CHART = [
  { label: 'S',    chest: '36-38', waist: '30-32', shoulder: '17',   length: '28' },
  { label: 'M',    chest: '38-40', waist: '32-34', shoulder: '17.5', length: '29' },
  { label: 'L',    chest: '40-42', waist: '34-36', shoulder: '18',   length: '30' },
  { label: 'XL',   chest: '42-44', waist: '36-38', shoulder: '18.5', length: '31' },
  { label: 'XXL',  chest: '44-46', waist: '38-40', shoulder: '19',   length: '32' },
  { label: 'XXXL', chest: '46-48', waist: '40-42', shoulder: '19.5', length: '33' },
];

// ─────────────────────────────────────────────────────────────
// COLORS — Wedding palette (with hex for swatches)
// ─────────────────────────────────────────────────────────────
export const COLORS = [
  { id: 'red',          label: 'Red',            hex: '#dc2626' },
  { id: 'maroon',       label: 'Maroon',         hex: '#800020' },
  { id: 'rose-pink',    label: 'Rose Pink',      hex: '#fb7185' },
  { id: 'fuchsia',      label: 'Fuchsia',        hex: '#c026d3' },
  { id: 'gold',         label: 'Gold',           hex: '#d4a853' },
  { id: 'champagne',    label: 'Champagne',      hex: '#f7e7ce' },
  { id: 'ivory',        label: 'Ivory / Off-White', hex: '#fffff0' },
  { id: 'white',        label: 'White',          hex: '#ffffff' },
  { id: 'silver',       label: 'Silver',         hex: '#c0c0c0' },
  { id: 'rose-gold',    label: 'Rose Gold',      hex: '#b76e79' },
  { id: 'royal-blue',   label: 'Royal Blue',     hex: '#1e3a8a' },
  { id: 'navy',         label: 'Navy',           hex: '#0c1e3e' },
  { id: 'teal',         label: 'Teal',           hex: '#0d9488' },
  { id: 'emerald',      label: 'Emerald Green',  hex: '#059669' },
  { id: 'mehndi-green', label: 'Mehndi Green',   hex: '#84cc16' },
  { id: 'mustard',      label: 'Mustard',        hex: '#eab308' },
  { id: 'orange',       label: 'Orange',         hex: '#ea580c' },
  { id: 'peach',        label: 'Peach',          hex: '#fdba74' },
  { id: 'purple',       label: 'Purple',         hex: '#7c3aed' },
  { id: 'lavender',     label: 'Lavender',       hex: '#c4b5fd' },
  { id: 'black',        label: 'Black',          hex: '#000000' },
  { id: 'grey',         label: 'Grey',           hex: '#6b7280' },
  { id: 'multi-color',  label: 'Multi-Color',    hex: 'linear-gradient(135deg,#dc2626,#d4a853,#1e3a8a)' },
] as const;

// ─────────────────────────────────────────────────────────────
// FABRICS — Used in Pakistani wedding wear
// ─────────────────────────────────────────────────────────────
export const FABRICS = [
  'Silk',
  'Pure Silk',
  'Raw Silk',
  'Chiffon',
  'Banarsi',
  'Banarsi Jamawar',
  'Organza',
  'Velvet',
  'Crushed Velvet',
  'Georgette',
  'Net',
  'Tissue',
  'Tissue Net',
  'Masuri',
  'Cotton',
  'Lawn',
  'Khaddar',
  'Karandi',
  'Jamawar',
  'Brocade',
  'Crepe',
  'Linen',
  'Suede',
  'Zari Work',
  'Jacquard',
] as const;

// ─────────────────────────────────────────────────────────────
// EMBROIDERY / WORK TYPE
// ─────────────────────────────────────────────────────────────
export const WORK_TYPES = [
  'Plain',
  'Light Embroidery',
  'Heavy Embroidery',
  'Zardozi Work',
  'Dabka Work',
  'Resham Work',
  'Mirror / Sheesha Work',
  'Pearl Work',
  'Stone / Crystal Work',
  'Sequins',
  'Threadwork',
  'Mukaish',
  'Gota Patti',
  'Aari Work',
  'Block Print',
  'Digital Print',
] as const;

// ─────────────────────────────────────────────────────────────
// DESIGNERS / BRANDS — Pakistani wedding wear
// ─────────────────────────────────────────────────────────────
export const BRANDS = [
  'HSY',
  'Maria B',
  'Sana Safinaz',
  'Élan',
  'Asim Jofa',
  'Faraz Manan',
  'Mohsin Naveed Ranjha',
  'Nomi Ansari',
  'Zara Shahjahan',
  'Bunto Kazmi',
  'Tena Durrani',
  'Republic by Omar Farooq',
  'Sapphire',
  'Khaadi',
  'Gul Ahmed',
  'Junaid Jamshed',
  'Ittehad',
  'Generation',
  'Beechtree',
  'Sania Maskatiya',
  'Misha Lakhani',
  'Annus Abrar',
  'Hussain Rehar',
  'Other Designer',
  'Custom Tailored',
  'Unbranded',
] as const;

// ─────────────────────────────────────────────────────────────
// CITIES — Pakistan
// ─────────────────────────────────────────────────────────────
export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot',
  'Gujranwala', 'Sargodha', 'Bahawalpur', 'Sukkur', 'Mardan',
  'Jhang', 'Rahim Yar Khan', 'Okara', 'Attock', 'Chakwal',
  'Sahiwal', 'Mirpur', 'Abbottabad', 'Murree', 'Other',
] as const;

// ─────────────────────────────────────────────────────────────
// CONDITION
// ─────────────────────────────────────────────────────────────
export const CONDITIONS = [
  { id: 'new_with_tags',     label: 'New with Tags',     description: 'Never worn, tags attached' },
  { id: 'unworn_no_tags',    label: 'Unworn, No Tags',   description: 'Never worn, tags removed' },
  { id: 'worn_once',         label: 'Worn Once',         description: 'Only wore on one event' },
  { id: 'worn_few_times',    label: 'Worn Few Times',    description: 'Used 2-3 times, well kept' },
  { id: 'minor_alterations', label: 'Minor Alterations', description: 'Small repairs/adjustments done' },
];

// ─────────────────────────────────────────────────────────────
// LISTING TYPE — buy / rent / both
// ─────────────────────────────────────────────────────────────
export const LISTING_TYPES = [
  { id: 'sell',  label: 'For Sale' },
  { id: 'rent',  label: 'For Rent' },
  { id: 'both',  label: 'Sale or Rent' },
] as const;

// ─────────────────────────────────────────────────────────────
// DELIVERY OPTIONS
// ─────────────────────────────────────────────────────────────
export const DELIVERY_OPTIONS = [
  { id: 'pickup',       label: 'Buyer Pickup Only' },
  { id: 'cod',          label: 'Cash on Delivery (TCS/Leopards)' },
  { id: 'tcs',          label: 'TCS Delivery' },
  { id: 'leopards',     label: 'Leopards Courier' },
  { id: 'mnp',          label: 'M&P Courier' },
  { id: 'meetup',       label: 'In-Person Meetup' },
];

// ─────────────────────────────────────────────────────────────
// PRICE RANGES
// ─────────────────────────────────────────────────────────────
export const PRICE_RANGES = [
  { label: 'Under Rs. 5,000',         min: 0,      max: 5000 },
  { label: 'Rs. 5,000 - 10,000',      min: 5000,   max: 10000 },
  { label: 'Rs. 10,000 - 25,000',     min: 10000,  max: 25000 },
  { label: 'Rs. 25,000 - 50,000',     min: 25000,  max: 50000 },
  { label: 'Rs. 50,000 - 100,000',    min: 50000,  max: 100000 },
  { label: 'Rs. 100,000 - 250,000',   min: 100000, max: 250000 },
  { label: 'Above Rs. 250,000',       min: 250000, max: 999999999 },
];

// ─────────────────────────────────────────────────────────────
// MEASUREMENT GUIDE — what each measurement means, how to take it
// ─────────────────────────────────────────────────────────────
export interface MeasurementInfo {
  key: string;
  label: string;
  /** Urdu / Roman Urdu name to help less-English-fluent users */
  urdu: string;
  howTo: string;
  required: boolean;
}

export const WOMEN_MEASUREMENTS: MeasurementInfo[] = [
  { key: 'bust',     label: 'Bust',     urdu: 'Seenah',          howTo: 'Fullest part of the bust — measuring tape horizontal, not too tight.', required: true },
  { key: 'waist',    label: 'Waist',    urdu: 'Kamar',           howTo: 'Narrowest part of waist, where your body bends side-to-side.', required: true },
  { key: 'hip',      label: 'Hip',      urdu: 'Kohlay',          howTo: 'Fullest part of hips — usually 8 inches below waist.', required: true },
  { key: 'shoulder', label: 'Shoulder', urdu: 'Kandha',          howTo: 'From edge of one shoulder bone to the other, across the back.', required: false },
  { key: 'sleeve',   label: 'Sleeve Length', urdu: 'Aasteen ki lambai', howTo: 'From shoulder edge down to wrist with arm relaxed.', required: false },
  { key: 'length',   label: 'Kameez/Shirt Length', urdu: 'Qameez ki lambai', howTo: 'From shoulder top straight down to desired hem.', required: false },
  { key: 'bottomLength', label: 'Bottom Length (Lehenga/Gharara/Trouser)', urdu: 'Pajama / Lehenga ki lambai', howTo: 'From waist down to ankle (or floor if you want trail).', required: false },
  { key: 'armhole',  label: 'Armhole', urdu: 'Mohri',          howTo: 'Around the armpit where sleeve meets shoulder.', required: false },
  { key: 'neckDepth', label: 'Neck Depth', urdu: 'Galay ki gehrai', howTo: 'From base of neck down to where neckline ends.', required: false },
];

export const MEN_MEASUREMENTS: MeasurementInfo[] = [
  { key: 'chest',    label: 'Chest',    urdu: 'Seenah',  howTo: 'Around the fullest part of the chest, under armpits.', required: true },
  { key: 'waist',    label: 'Waist',    urdu: 'Kamar',   howTo: 'Around natural waist (where pants sit).', required: true },
  { key: 'shoulder', label: 'Shoulder', urdu: 'Kandha',  howTo: 'Edge to edge across the back.', required: true },
  { key: 'sleeve',   label: 'Sleeve Length', urdu: 'Aasteen',  howTo: 'Shoulder to wrist with arm straight.', required: false },
  { key: 'length',   label: 'Kurta/Sherwani Length', urdu: 'Kurta ki lambai', howTo: 'Top of shoulder down to desired hem (knee/below knee).', required: false },
  { key: 'inseam',   label: 'Inseam (Shalwar/Trouser)', urdu: 'Pajama ki andar lambai', howTo: 'From crotch down to ankle.', required: false },
  { key: 'neck',     label: 'Neck',     urdu: 'Galla',   howTo: 'Around the base of the neck (collar size).', required: false },
];

// ─────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────
export const THEME = {
  colors: {
    maroon: '#800020',
    gold: '#d4a853',
    rose: '#e11d48',
  },
  animations: {
    float: 'float 3s ease-in-out infinite',
    shimmer: 'shimmer 2s infinite',
    sparkle: 'sparkle 1.5s infinite',
    fadeInUp: 'fadeInUp 0.6s ease-out',
    marquee: 'marquee 20s linear infinite',
    pulseGold: 'pulse-gold 2s infinite',
    countUp: 'count-up 2s ease-out',
  },
};

// Helper: get all valid sub-category IDs for schema enum
export const ALL_SUB_CATEGORY_IDS = Object.values(SUB_CATEGORIES)
  .flat()
  .map((s) => s.id);

// Helper: get all valid category IDs
export const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);
