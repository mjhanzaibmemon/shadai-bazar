import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api.dart';
import '../core/auth_state.dart';
import '../core/config.dart';
import '../core/models.dart';
import '../core/ui.dart';
import 'auth_screens.dart';
import 'listing_detail_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final user = auth.user;

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profile')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.person_outline, size: 72, color: maroon),
            const SizedBox(height: 12),
            const Text('Log in to sell, chat and save favourites', textAlign: TextAlign.center),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen())),
              child: const Text('Log in'),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SignupScreen())),
              style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
              child: const Text('Create an account'),
            ),
          ]),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(children: [
        ListTile(
          leading: CircleAvatar(
            radius: 26,
            backgroundColor: maroon,
            foregroundColor: Colors.white,
            child: Text(user.name.isEmpty ? '?' : user.name[0].toUpperCase()),
          ),
          title: Text(user.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text('${user.email}\n${user.city}'),
          isThreeLine: true,
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.storefront_outlined),
          title: const Text('My listings'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const MyListingsScreen())),
        ),
        ListTile(
          leading: const Icon(Icons.favorite_border),
          title: const Text('Saved items'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const WishlistScreen())),
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout),
          title: const Text('Log out'),
          onTap: () async {
            final ok = await showDialog<bool>(
              context: context,
              builder: (c) => AlertDialog(
                title: const Text('Log out?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancel')),
                  TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Log out')),
                ],
              ),
            );
            if (ok == true && context.mounted) await context.read<AuthState>().logout();
          },
        ),
      ]),
    );
  }
}

class MyListingsScreen extends StatefulWidget {
  const MyListingsScreen({super.key});

  @override
  State<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends State<MyListingsScreen> {
  List<Listing>? _items;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final page = await Api.instance.myListings();
      if (mounted) {
        setState(() {
        _items = page.items;
        _error = null;
      });
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  Future<void> _setStatus(Listing l, String status) async {
    final ok = await guarded(context, () => Api.instance.setListingStatus(l.id, status).then((_) => true));
    if (ok == true) _load();
  }

  Future<void> _delete(Listing l) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Delete listing?'),
        content: Text('"${l.title}" will be removed permanently.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    final ok = await guarded(context, () => Api.instance.deleteListing(l.id).then((_) => true));
    if (ok == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return Scaffold(
      appBar: AppBar(title: const Text('My listings')),
      body: items == null
          ? (_error != null
              ? ErrorRetry(message: _error!, onRetry: _load)
              : const Center(child: CircularProgressIndicator()))
          : items.isEmpty
              ? const EmptyState(icon: Icons.storefront_outlined, title: 'You have no listings yet')
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final l = items[i];
                      return ListTile(
                        leading: SizedBox(
                          width: 56,
                          height: 56,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: NetImage(l.images.isEmpty ? null : l.images.first),
                          ),
                        ),
                        title: Text(l.title, maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text('${formatPrice(l.price)}  •  ${l.status}  •  ${l.views} views'),
                        onTap: () => Navigator.of(context)
                            .push(MaterialPageRoute(builder: (_) => ListingDetailScreen(listingId: l.id))),
                        trailing: PopupMenuButton<String>(
                          onSelected: (v) => v == 'delete' ? _delete(l) : _setStatus(l, v),
                          itemBuilder: (_) => [
                            if (l.status != 'active') const PopupMenuItem(value: 'active', child: Text('Mark active')),
                            if (l.status == 'active') const PopupMenuItem(value: 'paused', child: Text('Pause')),
                            if (l.status != 'sold') const PopupMenuItem(value: 'sold', child: Text('Mark sold')),
                            const PopupMenuItem(value: 'delete', child: Text('Delete')),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  List<Listing>? _items;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final items = await Api.instance.wishlist();
      if (mounted) {
        setState(() {
        _items = items;
        _error = null;
      });
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return Scaffold(
      appBar: AppBar(title: const Text('Saved items')),
      body: items == null
          ? (_error != null
              ? ErrorRetry(message: _error!, onRetry: _load)
              : const Center(child: CircularProgressIndicator()))
          : items.isEmpty
              ? const EmptyState(icon: Icons.favorite_border, title: 'Nothing saved yet')
              : GridView.builder(
                  padding: const EdgeInsets.all(10),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.68,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: items.length,
                  itemBuilder: (_, i) => ListingCard(
                    listing: items[i],
                    onTap: () async {
                      await Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => ListingDetailScreen(listingId: items[i].id)));
                      _load();
                    },
                  ),
                ),
    );
  }
}
