import 'package:flutter/material.dart';

class AppRoutes {
  // Route names
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String home = '/home';
  static const String search = '/search';
  static const String category = '/category';
  static const String listingDetail = '/listing-detail';
  static const String sell = '/sell';
  static const String myListings = '/my-listings';
  static const String chat = '/chat';
  static const String chatDetail = '/chat-detail';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String reviews = '/reviews';
  static const String editListing = '/edit-listing';
  static const String paymentGateway = '/payment';

  static Map<String, WidgetBuilder> routes = {
    // Add route mappings here
  };

  static Route<dynamic> generateRoute(RouteSettings settings) {
    // This can be used for dynamic route generation
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const Placeholder());
      case login:
        return MaterialPageRoute(builder: (_) => const Placeholder());
      case signup:
        return MaterialPageRoute(builder: (_) => const Placeholder());
      case home:
        return MaterialPageRoute(builder: (_) => const Placeholder());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }
}
