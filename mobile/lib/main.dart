import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/auth_state.dart';
import 'core/ui.dart';
import 'screens/browse_screen.dart';
import 'screens/chat_screens.dart';
import 'screens/profile_screens.dart';
import 'screens/sell_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RukhsatiApp());
}

class RukhsatiApp extends StatelessWidget {
  const RukhsatiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthState(),
      child: MaterialApp(
        title: 'Rukhsati',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        home: const AppShell(),
      ),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    if (auth.loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // Tabs that need an account show a login prompt instead of failing requests.
    Widget gated(Widget child, String title) => auth.isLoggedIn
        ? child
        : Scaffold(
            appBar: AppBar(title: Text(title)),
            body: EmptyState(
              icon: Icons.lock_outline,
              title: 'Log in to continue',
              subtitle: 'Open the Profile tab to log in or sign up.',
            ),
          );

    final pages = <Widget>[
      const BrowseScreen(),
      gated(const SellScreen(), 'Sell an item'),
      gated(ConversationsScreen(key: ValueKey(auth.user?.id)), 'Messages'),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Browse'),
          NavigationDestination(icon: Icon(Icons.add_circle_outline), selectedIcon: Icon(Icons.add_circle), label: 'Sell'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), selectedIcon: Icon(Icons.chat_bubble), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
