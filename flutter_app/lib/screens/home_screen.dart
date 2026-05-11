import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/listing_provider.dart';
import '../config/api_config.dart';
import '../config/theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ListingProvider>(context, listen: false).getListings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shaadi Bazaar'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => Navigator.of(context).pushNamed('/search'),
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {},
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          _handleNavigation(index);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle), label: 'Sell'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeFeed();
      case 1:
        return _buildSellScreen();
      case 2:
        return _buildChatScreen();
      case 3:
        return _buildProfileScreen();
      default:
        return _buildHomeFeed();
    }
  }

  Widget _buildHomeFeed() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Categories carousel
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Browse Categories',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: ApiConfig.categories.length,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () => Navigator.of(context).pushNamed(
                          '/category',
                          arguments: ApiConfig.categories[index],
                        ),
                        child: Container(
                          width: 80,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: AppTheme.maroon),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _getCategoryEmoji(ApiConfig.categories[index]),
                                style: const TextStyle(fontSize: 32),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                ApiConfig.categories[index],
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodySmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          // Latest listings
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Latest Listings',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
          Consumer<ListingProvider>(
            builder: (context, listingProvider, _) {
              if (listingProvider.isLoading) {
                return const Center(child: CircularProgressIndicator());
              }

              if (listingProvider.listings.isEmpty) {
                return Center(
                  child: Text(
                    'No listings found',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                );
              }

              return ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: listingProvider.listings.length,
                itemBuilder: (context, index) {
                  final listing = listingProvider.listings[index];
                  return GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed(
                      '/listing-detail',
                      arguments: listing.id,
                    ),
                    child: Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            // Image
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: listing.images.isNotEmpty
                                  ? Image.network(
                                      listing.images[0],
                                      fit: BoxFit.cover,
                                    )
                                  : const Icon(Icons.image),
                            ),
                            const SizedBox(width: 12),
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    listing.title,
                                    style: Theme.of(context).textTheme.titleLarge,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Rs. ${listing.price}',
                                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                          color: AppTheme.maroon,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    listing.city,
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSellScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_circle, size: 64, color: AppTheme.maroon),
          const SizedBox(height: 16),
          Text(
            'Post Your Item',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pushNamed('/sell'),
            child: const Text('Create New Listing'),
          ),
        ],
      ),
    );
  }

  Widget _buildChatScreen() {
    return Center(
      child: Text(
        'Chat Screen',
        style: Theme.of(context).textTheme.headlineSmall,
      ),
    );
  }

  Widget _buildProfileScreen() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        if (authProvider.user == null) {
          return Center(
            child: ElevatedButton(
              onPressed: () => Navigator.of(context).pushNamed('/login'),
              child: const Text('Login'),
            ),
          );
        }

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppTheme.maroon,
                    child: Text(
                      authProvider.user!.name[0].toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    authProvider.user!.name,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  Text(
                    authProvider.user!.email,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('My Listings'),
              onTap: () => Navigator.of(context).pushNamed('/my-listings'),
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Settings'),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () => _handleLogout(),
            ),
          ],
        );
      },
    );
  }

  void _handleNavigation(int index) {
    // Handle navigation if needed
  }

  void _handleLogout() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  String _getCategoryEmoji(String category) {
    switch (category.toLowerCase()) {
      case 'bridal':
        return '👰';
      case 'groom':
        return '🤵';
      case 'formal':
        return '👔';
      case 'casual':
        return '👗';
      case 'kids':
        return '👧';
      case 'accessories':
        return '👜';
      default:
        return '✨';
    }
  }
}
