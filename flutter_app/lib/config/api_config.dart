class ApiConfig {
  // Change to your deployed backend URL
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // For iOS simulator: 'http://localhost:3000/api'
  // For physical device: 'http://YOUR_SERVER_IP:3000/api'
  // For production: 'https://yourdomain.com/api'

  // Auth endpoints
  static const String signUp = '/auth/signup';
  static const String login = '/auth/login';
  static const String getMe = '/auth/me';
  static const String logout = '/auth/logout';

  // Listing endpoints
  static const String listings = '/listings';
  static const String myListings = '/listings/my';
  static const String listingDetail = '/listings';

  // Chat endpoints
  static const String conversations = '/chat/conversations';
  static const String messages = '/chat/messages';
  static const String conversationDetail = '/chat/conversations';

  // Review endpoints
  static const String reviews = '/reviews';
  static const String createReview = '/reviews';

  // Upload endpoints
  static const String uploadImage = '/upload';

  // Payment endpoints
  static const String createPayment = '/payments';
  static const String getPayments = '/payments';

  // Constants
  static const int connectionTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000; // 30 seconds
  static const int pageSize = 20; // Items per page

  // Categories
  static const List<String> categories = [
    'Bridal',
    'Groom',
    'Formal',
    'Casual',
    'Kids',
    'Accessories',
  ];

  // Pakistani Cities
  static const List<String> cities = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Gujranwala',
    'Hyderabad',
    'Sukkur',
    'Sialkot',
    'Sargodha',
    'Bahawalpur',
    'Rahim Yar Khan',
    'Jhang',
    'Kasur',
    'Okara',
    'Sahiwal',
    'Attock',
  ];

  // Conditions
  static const List<String> conditions = [
    'New with Tags',
    'Worn Once',
    'Worn Few Times',
    'Minor Alterations',
  ];

  // Fabrics
  static const List<String> fabrics = [
    'Silk',
    'Chiffon',
    'Banarasi',
    'Organza',
    'Velvet',
    'Georgette',
    'Net',
    'Cotton',
    'Lawn',
    'Khaddar',
    'Jamawar',
  ];

  // Price ranges
  static const List<Map<String, dynamic>> priceRanges = [
    {'label': 'Under Rs. 5,000', 'min': 0, 'max': 5000},
    {'label': 'Rs. 5,000 - 10,000', 'min': 5000, 'max': 10000},
    {'label': 'Rs. 10,000 - 20,000', 'min': 10000, 'max': 20000},
    {'label': 'Rs. 20,000 - 50,000', 'min': 20000, 'max': 50000},
    {'label': 'Above Rs. 50,000', 'min': 50000, 'max': 999999},
  ];

  // Theme colors
  static const int maroonColor = 0xFF800020;
  static const int goldColor = 0xFFd4a853;
  static const int roseColor = 0xFFe11d48;
  static const int lightGrayColor = 0xFFF3F4F6;
  static const int darkGrayColor = 0xFF1F2937;
}
