import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/api.dart';
import '../core/auth_state.dart';
import '../core/config.dart';
import '../core/models.dart';
import '../core/ui.dart';
import 'chat_screens.dart';

class ListingDetailScreen extends StatefulWidget {
  const ListingDetailScreen({super.key, required this.listingId});
  final String listingId;

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  Listing? _listing;
  List<Review> _reviews = [];
  String? _error;
  int _imageIndex = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final l = await Api.instance.listing(widget.listingId);
      final r = await Api.instance.reviews(l.seller.id).catchError((_) => <Review>[]);
      if (!mounted) return;
      setState(() {
        _listing = l;
        _reviews = r;
      });
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  /// Pakistani numbers are stored as 03XXXXXXXXX; WhatsApp needs 923XXXXXXXXX.
  String _whatsappNumber(String phone) {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('0')) return '92${digits.substring(1)}';
    return digits;
  }

  Future<void> _open(Uri uri) async {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && mounted) showSnack(context, 'Could not open that app', error: true);
  }

  Future<void> _message(Listing l) async {
    if (!await requireLogin(context) || !mounted) return;
    final me = context.read<AuthState>().user!;
    if (me.id == l.seller.id) {
      showSnack(context, 'This is your own listing');
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ChatThreadScreen(
        otherUserId: l.seller.id,
        otherUserName: l.seller.name,
        listingId: l.id,
      ),
    ));
  }

  Future<void> _toggleSave(Listing l) async {
    if (!await requireLogin(context) || !mounted) return;
    await guarded(context, () => context.read<AuthState>().toggleWishlist(l.id));
  }

  Future<void> _writeReview(Listing l) async {
    if (!await requireLogin(context) || !mounted) return;
    final submitted = await showDialog<bool>(
      context: context,
      builder: (_) => _ReviewDialog(sellerId: l.seller.id),
    );
    if (submitted == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = _listing;
    if (l == null) {
      return Scaffold(
        appBar: AppBar(),
        body: _error != null
            ? ErrorRetry(message: _error!, onRetry: _load)
            : const Center(child: CircularProgressIndicator()),
      );
    }

    final saved = context.watch<AuthState>().wishlistIds.contains(l.id);
    final phone = l.seller.phone;
    final avg = _reviews.isEmpty ? null : _reviews.map((r) => r.rating).reduce((a, b) => a + b) / _reviews.length;

    return Scaffold(
      appBar: AppBar(
        title: Text(l.title, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            tooltip: saved ? 'Remove from saved' : 'Save',
            icon: Icon(saved ? Icons.favorite : Icons.favorite_border),
            onPressed: () => _toggleSave(l),
          ),
        ],
      ),
      body: ListView(children: [
        AspectRatio(
          aspectRatio: 1,
          child: Stack(children: [
            PageView.builder(
              itemCount: l.images.isEmpty ? 1 : l.images.length,
              onPageChanged: (i) => setState(() => _imageIndex = i),
              itemBuilder: (_, i) => NetImage(l.images.isEmpty ? null : l.images[i]),
            ),
            if (l.images.length > 1)
              Positioned(
                bottom: 10,
                left: 0,
                right: 0,
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  for (var i = 0; i < l.images.length; i++)
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: i == _imageIndex ? maroon : Colors.white70,
                      ),
                    ),
                ]),
              ),
          ]),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(l.title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(formatPrice(l.price),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: maroon)),
              if (l.originalPrice != null && l.originalPrice! > l.price) ...[
                const SizedBox(width: 10),
                Text(formatPrice(l.originalPrice!),
                    style: const TextStyle(decoration: TextDecoration.lineThrough, color: Colors.grey)),
                const SizedBox(width: 8),
                Text('-${l.discountPercent}%', style: const TextStyle(color: Colors.green)),
              ],
            ]),
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 8, children: [
              Chip(avatar: const Icon(Icons.place_outlined, size: 16), label: Text(l.city)),
              Chip(label: Text(labelOf(conditions, l.condition))),
              if (l.fabric.isNotEmpty) Chip(label: Text(l.fabric)),
              Chip(label: Text(labelOf(categories, l.category))),
            ]),
            const SizedBox(height: 16),
            Text('Description', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(l.description),
            if (l.defects != null && l.defects!.trim().isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(10)),
                child: Text('Disclosed defects: ${l.defects}'),
              ),
            ],
            const Divider(height: 32),
            Row(children: [
              CircleAvatar(
                backgroundColor: maroon,
                foregroundColor: Colors.white,
                child: Text(l.seller.name.isEmpty ? '?' : l.seller.name[0].toUpperCase()),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.seller.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  Text(
                    avg == null
                        ? 'No reviews yet'
                        : '${avg.toStringAsFixed(1)} ★  (${_reviews.length} reviews)',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ]),
              ),
              TextButton(onPressed: () => _writeReview(l), child: const Text('Write review')),
            ]),
            for (final r in _reviews.take(5))
              ListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: Text('${r.reviewerName}  ${'★' * r.rating}'),
                subtitle: Text(r.comment),
              ),
          ]),
        ),
      ]),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            if (phone != null && phone.isNotEmpty) ...[
              IconButton.outlined(
                tooltip: 'Call',
                onPressed: () => _open(Uri(scheme: 'tel', path: phone)),
                icon: const Icon(Icons.call_outlined),
              ),
              const SizedBox(width: 8),
              IconButton.outlined(
                tooltip: 'WhatsApp',
                onPressed: () => _open(Uri.parse(
                    'https://wa.me/${_whatsappNumber(phone)}?text=${Uri.encodeComponent('Hi, I am interested in "${l.title}" on Rukhsati')}')),
                icon: const Icon(Icons.chat_outlined),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: FilledButton.icon(
                onPressed: () => _message(l),
                icon: const Icon(Icons.message_outlined),
                label: const Text('Message seller'),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

class _ReviewDialog extends StatefulWidget {
  const _ReviewDialog({required this.sellerId});
  final String sellerId;

  @override
  State<_ReviewDialog> createState() => _ReviewDialogState();
}

class _ReviewDialogState extends State<_ReviewDialog> {
  int _rating = 5;
  final _comment = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_comment.text.trim().length < 10) {
      showSnack(context, 'Please write at least 10 characters', error: true);
      return;
    }
    setState(() => _busy = true);
    final ok = await guarded(context, () => Api.instance
        .createReview(sellerId: widget.sellerId, rating: _rating, comment: _comment.text.trim())
        .then((_) => true));
    if (!mounted) return;
    setState(() => _busy = false);
    if (ok == true) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
        title: const Text('Rate this seller'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            for (var i = 1; i <= 5; i++)
              IconButton(
                onPressed: () => setState(() => _rating = i),
                icon: Icon(i <= _rating ? Icons.star : Icons.star_border, color: gold),
              ),
          ]),
          TextField(
            controller: _comment,
            maxLines: 3,
            maxLength: 2000,
            decoration: const InputDecoration(hintText: 'Share your experience (min 10 characters)'),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(90, 40)),
            onPressed: _busy ? null : _submit,
            child: const Text('Submit'),
          ),
        ],
      );
}
