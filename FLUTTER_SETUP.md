# 📱 Shaadi Bazaar Flutter App Setup

## Prerequisites

1. **Flutter SDK Installed**
   ```bash
   # Check if Flutter is installed
   flutter --version
   
   # If not, download from https://flutter.dev/docs/get-started/install
   ```

2. **Android SDK Configured**
   ```bash
   flutter config --android-sdk=/path/to/android/sdk
   ```

3. **Emulator or Device**
   ```bash
   flutter emulators
   flutter emulators --launch Pixel_5_API_30
   ```

## Step 1: Create Flutter Project

```bash
cd ~/Desktop
flutter create shaadi_bazaar_app
cd shaadi_bazaar_app
```

## Step 2: Add Dependencies

Update `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP & API
  http: ^1.2.0
  dio: ^5.3.0
  
  # Storage
  shared_preferences: ^2.2.2
  
  # Images & Caching
  cached_network_image: ^3.3.1
  image_picker: ^1.0.7
  
  # URL Launcher (WhatsApp/Call)
  url_launcher: ^6.2.5
  
  # State Management
  provider: ^6.1.2
  
  # Navigation
  go_router: ^13.2.0
  
  # UI Components
  carousel_slider: ^4.2.1
  shimmer: ^3.0.0
  flutter_rating_bar: ^4.0.1
  
  # SVG Support
  flutter_svg: ^2.0.9
  
  # Icons
  heroicons: ^0.7.0
  
  # Utilities
  intl: ^0.19.0
  timeago: ^3.6.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_linter: ^4.0.0

flutter:
  uses-material-design: true
```

## Step 3: Run Command

```bash
flutter pub get
flutter run
```

## Step 4: Project Structure

```
shaadi_bazaar_app/
├── lib/
│   ├── main.dart                 ← Entry point
│   ├── config/
│   │   ├── api_config.dart      ← API base URL
│   │   └── routes.dart          ← Navigation routes
│   ├── models/
│   │   ├── user.dart
│   │   ├── listing.dart
│   │   ├── chat.dart
│   │   └── review.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── api_service.dart
│   │   └── storage_service.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── listings_provider.dart
│   │   └── chat_provider.dart
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── onboarding_screen.dart
│   │   ├── home_screen.dart
│   │   ├── search_screen.dart
│   │   ├── listing_detail_screen.dart
│   │   ├── sell_screen.dart
│   │   ├── chat_screen.dart
│   │   ├── my_listings_screen.dart
│   │   ├── profile_screen.dart
│   │   └── login_screen.dart
│   └── widgets/
│       ├── listing_card.dart
│       ├── navbar.dart
│       └── custom_widgets.dart
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── android/
    └── app/
        └── build.gradle
```

## Step 5: Key Implementation Files

### lib/main.dart

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        title: 'Shaadi Bazaar',
        theme: ThemeData(
          primaryColor: const Color(0xFF800020),
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF800020),
          ),
          useMaterial3: true,
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
```

### lib/config/api_config.dart

```dart
class ApiConfig {
  // Change to your deployed backend URL
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  // For device: 'http://YOUR_SERVER_IP:3000/api'
  
  // Auth endpoints
  static const String signUp = '/auth/signup';
  static const String login = '/auth/login';
  static const String getMe = '/auth/me';
  static const String logout = '/auth/logout';
  
  // Listing endpoints
  static const String listings = '/listings';
  static const String myListings = '/listings/my';
  
  // Chat endpoints
  static const String conversations = '/chat/conversations';
  static const String messages = '/chat/messages';
  
  // Review endpoints
  static const String reviews = '/reviews';
}
```

## Step 6: Build APK for Play Store

```bash
# Build APK (for testing)
flutter build apk

# Build App Bundle (for Play Store release)
flutter build appbundle

# Output location
# Android: build/app/outputs/flutter-apk/app-release.apk
# Bundle: build/app/outputs/bundle/release/app-release.aab
```

## Step 7: Play Store Submission

1. Create Google Play Developer account ($25 one-time fee)
2. Create app on Play Console
3. Fill in:
   - App name, description, screenshots
   - Content rating questionnaire
   - Privacy policy URL
   - App signing certificate
4. Upload app-release.aab
5. Submit for review (takes 2-4 hours)

## Step 8: CI/CD Setup (Optional)

Create `.github/workflows/flutter.yml` for GitHub Actions:

```yaml
name: Flutter CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
      
      - run: flutter pub get
      - run: flutter analyze
      - run: flutter test
      - run: flutter build apk --release
```

## Troubleshooting

### API Connection Issues
- Android emulator: Use `10.0.2.2:3000` (not localhost)
- Physical device: Use actual server IP address
- Check firewall/network settings

### Image Loading
- Ensure URLs are valid HTTP/HTTPS
- Use cached_network_image for performance

### JWT Token Management
- Store token in SharedPreferences
- Add token to request headers
- Refresh token on 401 Unauthorized

## Next Steps

1. Implement auth flows (login/signup)
2. Build listing screens
3. Implement chat functionality
4. Add image upload
5. Test thoroughly
6. Beta test with real users
7. Submit to Play Store

---

**Estimated Timeline**: 3-4 weeks of active development (40+ hours)

**Resources**:
- [Flutter Documentation](https://flutter.dev/docs)
- [Provider Pattern](https://pub.dev/packages/provider)
- [Flutter REST API](https://flutter.dev/docs/cookbook/networking/fetch-data)
