import 'package:intl/intl.dart';

/// Backend origin. Override per build:
/// `flutter run --dart-define=API_BASE=http://10.0.2.2:3000`
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'https://ruksati.com',
);

class Choice {
  const Choice(this.id, this.label);
  final String id;
  final String label;
}

const categories = <Choice>[
  Choice('bridal', 'Bridal Wear'),
  Choice('groom', 'Groom Wear'),
  Choice('guest-women', 'Guest - Women'),
  Choice('guest-men', 'Guest - Men'),
  Choice('kids', 'Kids Wear'),
  Choice('jewelry', 'Jewelry'),
  Choice('footwear', 'Footwear'),
  Choice('accessories', 'Accessories'),
];

const conditions = <Choice>[
  Choice('new_with_tags', 'New with Tags'),
  Choice('unworn_no_tags', 'Unworn, no tags'),
  Choice('worn_once', 'Worn once'),
  Choice('worn_few_times', 'Worn few times'),
  Choice('minor_alterations', 'Minor alterations'),
];

const fabrics = <String>[
  'Silk', 'Pure Silk', 'Raw Silk', 'Chiffon', 'Banarsi', 'Banarsi Jamawar',
  'Organza', 'Velvet', 'Crushed Velvet', 'Georgette', 'Net', 'Tissue',
];

const cities = <String>[
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Sargodha',
  'Bahawalpur', 'Sukkur', 'Mardan', 'Jhang', 'Rahim Yar Khan', 'Okara',
  'Attock', 'Chakwal', 'Sahiwal', 'Mirpur', 'Abbottabad', 'Murree', 'Other',
];

const sortOptions = <Choice>[
  Choice('newest', 'Newest'),
  Choice('price-low', 'Price: low to high'),
  Choice('price-high', 'Price: high to low'),
  Choice('popular', 'Most viewed'),
];

String labelOf(List<Choice> list, String id) {
  for (final c in list) {
    if (c.id == id) return c.label;
  }
  return id;
}

final _price = NumberFormat.decimalPattern();
String formatPrice(num value) => 'Rs. ${_price.format(value)}';

/// Image URLs from the API may be relative (`/api/uploads/x.webp`).
String imageUrl(String path) {
  if (path.startsWith('http')) return path;
  return '$kApiBase$path';
}
