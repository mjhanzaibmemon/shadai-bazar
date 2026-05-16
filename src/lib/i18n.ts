/**
 * Rukhsati i18n — Urdu / English dictionary.
 *
 * Add a key here, then use `t('key')` from useI18n() in any client component.
 * Missing keys fall back to the English value or the key itself.
 */

export type Locale = 'en' | 'ur';

export const STRINGS: Record<string, { en: string; ur: string }> = {
  // ── Navigation ───────────────────────────────────
  'nav.home':         { en: 'Home',          ur: 'صفحہ اول' },
  'nav.browse':       { en: 'Browse',        ur: 'دیکھیں' },
  'nav.sell':         { en: 'Sell',          ur: 'بیچیں' },
  'nav.search':       { en: 'Search',        ur: 'تلاش' },
  'nav.chat':         { en: 'Chat',          ur: 'گفتگو' },
  'nav.my-listings':  { en: 'My Listings',   ur: 'میرے اشتہار' },
  'nav.my-wedding':   { en: 'My Wedding',    ur: 'میری شادی' },
  'nav.orders':       { en: 'Orders',        ur: 'آرڈرز' },
  'nav.verify':       { en: 'Get Verified',  ur: 'تصدیق کریں' },
  'nav.sahara':       { en: 'Shaadi Sahara', ur: 'شادی سہارا' },
  'nav.size-guide':   { en: 'Size Guide',    ur: 'سائز گائیڈ' },
  'nav.login':        { en: 'Login',         ur: 'لاگ ان' },
  'nav.signup':       { en: 'Sign Up',       ur: 'رجسٹر کریں' },
  'nav.logout':       { en: 'Logout',        ur: 'لاگ آؤٹ' },
  'nav.profile':      { en: 'Profile',       ur: 'پروفائل' },

  // ── Common buttons ───────────────────────────────
  'common.save':        { en: 'Save',           ur: 'محفوظ کریں' },
  'common.cancel':      { en: 'Cancel',         ur: 'منسوخ کریں' },
  'common.delete':      { en: 'Delete',         ur: 'حذف کریں' },
  'common.edit':        { en: 'Edit',           ur: 'ترمیم' },
  'common.submit':      { en: 'Submit',         ur: 'جمع کریں' },
  'common.confirm':     { en: 'Confirm',        ur: 'تصدیق کریں' },
  'common.loading':     { en: 'Loading...',     ur: 'لوڈ ہو رہا ہے...' },
  'common.search':      { en: 'Search',         ur: 'تلاش کریں' },
  'common.viewAll':     { en: 'View All',       ur: 'سب دیکھیں' },
  'common.next':        { en: 'Next',           ur: 'آگے' },
  'common.back':        { en: 'Back',           ur: 'واپس' },
  'common.add':         { en: 'Add',            ur: 'شامل کریں' },
  'common.remove':      { en: 'Remove',         ur: 'ہٹائیں' },
  'common.required':    { en: 'Required',      ur: 'ضروری' },
  'common.optional':    { en: 'Optional',      ur: 'اختیاری' },

  // ── Homepage ─────────────────────────────────────
  'home.hero.title':       { en: 'Pakistan\'s Wedding Marketplace', ur: 'پاکستان کا شادی بازار' },
  'home.hero.subtitle':    { en: 'Buy and sell wedding wear at 40-70% off',
                             ur: 'شادی کے کپڑے 40-70% کم قیمت پر خریدیں اور بیچیں' },
  'home.hero.cta-buy':     { en: 'Browse Listings',  ur: 'اشتہار دیکھیں' },
  'home.hero.cta-sell':    { en: 'Start Selling',    ur: 'بیچنا شروع کریں' },
  'home.categories.title': { en: 'Shop by Category', ur: 'کیٹیگری سے خریدیں' },
  'home.featured.title':   { en: 'Featured Listings',ur: 'نمایاں اشتہار' },

  // ── Listing card ─────────────────────────────────
  'listing.price':        { en: 'Price',        ur: 'قیمت' },
  'listing.condition':    { en: 'Condition',    ur: 'حالت' },
  'listing.size':         { en: 'Size',         ur: 'سائز' },
  'listing.fabric':       { en: 'Fabric',       ur: 'کپڑا' },
  'listing.contact':      { en: 'Contact Seller', ur: 'بیچنے والے سے رابطہ' },
  'listing.chat':         { en: 'Chat',         ur: 'گفتگو' },
  'listing.whatsapp':     { en: 'WhatsApp',     ur: 'واٹس ایپ' },
  'listing.call':         { en: 'Call',         ur: 'کال' },
  'listing.buy-now':      { en: 'Buy Now',      ur: 'ابھی خریدیں' },
  'listing.add-wishlist': { en: 'Add to Wishlist', ur: 'پسندیدہ میں شامل کریں' },

  // ── Verification ─────────────────────────────────
  'verify.title':       { en: 'Become a Verified Seller', ur: 'تصدیق شدہ بیچنے والے بنیں' },
  'verify.benefit-1':   { en: '3x more buyer trust',      ur: '3 گنا زیادہ خریدار کا بھروسہ' },
  'verify.benefit-2':   { en: 'Higher prices',            ur: 'اونچی قیمتیں' },
  'verify.benefit-3':   { en: 'Priority in search',       ur: 'تلاش میں ترجیح' },
  'verify.cnic':        { en: 'CNIC Number',              ur: 'شناختی کارڈ نمبر' },
  'verify.front':       { en: 'CNIC Front',               ur: 'شناختی کارڈ سامنے' },
  'verify.back':        { en: 'CNIC Back',                ur: 'شناختی کارڈ پیچھے' },
  'verify.selfie':      { en: 'Selfie with CNIC',         ur: 'شناختی کارڈ کے ساتھ سیلفی' },

  // ── Shaadi Sahara ────────────────────────────────
  'sahara.hero':        { en: 'Donate or Apply for Help', ur: 'عطیہ دیں یا مدد کے لیے درخواست دیں' },
  'sahara.donate':      { en: 'Donate a Dress',           ur: 'ڈریس عطیہ کریں' },
  'sahara.apply':       { en: 'Apply for Help',           ur: 'مدد کی درخواست' },

  // ── Wedding profile ──────────────────────────────
  'wedding.countdown':  { en: 'days until your wedding',  ur: 'دن آپ کی شادی تک' },
  'wedding.budget':     { en: 'Budget Tracker',           ur: 'بجٹ ٹریکر' },
  'wedding.wishlist':   { en: 'My Wishlist',              ur: 'میری پسند' },
  'wedding.share':      { en: 'Share with family',        ur: 'گھر والوں کے ساتھ شیئر کریں' },
};

export function translate(key: string, locale: Locale): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[locale] || entry.en || key;
}
