import 'dart:async';

import 'package:flutter/material.dart';

import '../core/api.dart';
import '../core/config.dart';
import '../core/models.dart';
import '../core/ui.dart';
import 'listing_detail_screen.dart';

class Filters {
  const Filters({this.category, this.city, this.condition, this.minPrice, this.maxPrice, this.sort = 'newest'});
  final String? category;
  final String? city;
  final String? condition;
  final int? minPrice;
  final int? maxPrice;
  final String sort;

  Filters copyWith({
    String? Function()? category,
    String? Function()? city,
    String? Function()? condition,
    int? Function()? minPrice,
    int? Function()? maxPrice,
    String? sort,
  }) =>
      Filters(
        category: category != null ? category() : this.category,
        city: city != null ? city() : this.city,
        condition: condition != null ? condition() : this.condition,
        minPrice: minPrice != null ? minPrice() : this.minPrice,
        maxPrice: maxPrice != null ? maxPrice() : this.maxPrice,
        sort: sort ?? this.sort,
      );

  int get activeCount =>
      [city, condition, minPrice, maxPrice].where((e) => e != null).length + (sort != 'newest' ? 1 : 0);
}

class BrowseScreen extends StatefulWidget {
  const BrowseScreen({super.key});

  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  final _scroll = ScrollController();
  final _search = TextEditingController();
  Timer? _debounce;

  Filters _filters = const Filters();
  final List<Listing> _items = [];
  int _page = 1;
  bool _hasMore = true;
  bool _loading = false;
  String? _error;
  int _requestId = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(() {
      if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 400) _load();
    });
    _reload();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _scroll.dispose();
    _search.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    _requestId++;
    setState(() {
      _items.clear();
      _page = 1;
      _hasMore = true;
      _error = null;
      _loading = false;
    });
    await _load();
  }

  Future<void> _load() async {
    if (_loading || !_hasMore) return;
    final id = _requestId;
    setState(() => _loading = true);
    try {
      final result = await Api.instance.listings(
        page: _page,
        search: _search.text.trim(),
        category: _filters.category,
        city: _filters.city,
        condition: _filters.condition,
        minPrice: _filters.minPrice,
        maxPrice: _filters.maxPrice,
        sort: _filters.sort,
      );
      if (!mounted || id != _requestId) return; // a newer search superseded this one
      setState(() {
        _items.addAll(result.items);
        _hasMore = result.hasMore;
        _page++;
      });
    } on ApiException catch (e) {
      if (mounted && id == _requestId) setState(() => _error = e.message);
    } finally {
      if (mounted && id == _requestId) setState(() => _loading = false);
    }
  }

  void _onSearchChanged(String _) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 450), _reload);
  }

  Future<void> _openFilters() async {
    final result = await showModalBottomSheet<Filters>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _FilterSheet(initial: _filters),
    );
    if (result != null) {
      _filters = result;
      _reload();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rukhsati', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _search,
                  onChanged: _onSearchChanged,
                  textInputAction: TextInputAction.search,
                  decoration: InputDecoration(
                    hintText: 'Search lehenga, sherwani, jewelry...',
                    prefixIcon: const Icon(Icons.search),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Badge(
                isLabelVisible: _filters.activeCount > 0,
                label: Text('${_filters.activeCount}'),
                child: IconButton.filled(
                  style: IconButton.styleFrom(backgroundColor: Colors.white24),
                  onPressed: _openFilters,
                  icon: const Icon(Icons.tune, color: Colors.white),
                ),
              ),
            ]),
          ),
        ),
      ),
      body: Column(children: [
        SizedBox(
          height: 52,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: const Text('All'),
                  selected: _filters.category == null,
                  onSelected: (_) {
                    _filters = _filters.copyWith(category: () => null);
                    _reload();
                  },
                ),
              ),
              for (final c in categories)
                Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(c.label),
                    selected: _filters.category == c.id,
                    onSelected: (_) {
                      _filters = _filters.copyWith(category: () => c.id);
                      _reload();
                    },
                  ),
                ),
            ],
          ),
        ),
        Expanded(child: _body()),
      ]),
    );
  }

  Widget _body() {
    if (_items.isEmpty && _loading) return const Center(child: CircularProgressIndicator());
    if (_items.isEmpty && _error != null) return ErrorRetry(message: _error!, onRetry: _reload);
    if (_items.isEmpty) {
      return const EmptyState(
        icon: Icons.search_off,
        title: 'No listings found',
        subtitle: 'Try a different search or clear the filters.',
      );
    }
    return RefreshIndicator(
      onRefresh: _reload,
      child: GridView.builder(
        controller: _scroll,
        padding: const EdgeInsets.all(10),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.68,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        itemCount: _items.length + (_hasMore ? 1 : 0),
        itemBuilder: (_, i) {
          if (i >= _items.length) {
            return _error != null
                ? Center(child: TextButton(onPressed: () { setState(() => _error = null); _load(); }, child: const Text('Retry')))
                : const Center(child: CircularProgressIndicator());
          }
          final l = _items[i];
          return ListingCard(
            listing: l,
            onTap: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => ListingDetailScreen(listingId: l.id))),
          );
        },
      ),
    );
  }
}

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({required this.initial});
  final Filters initial;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late Filters f = widget.initial;
  late final _min = TextEditingController(text: f.minPrice?.toString() ?? '');
  late final _max = TextEditingController(text: f.maxPrice?.toString() ?? '');

  @override
  void dispose() {
    _min.dispose();
    _max.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 0, 16, MediaQuery.of(context).viewInsets.bottom + 16),
      child: SingleChildScrollView(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          DropdownButtonFormField<String>(
            initialValue: f.sort,
            decoration: const InputDecoration(labelText: 'Sort by'),
            items: [for (final s in sortOptions) DropdownMenuItem(value: s.id, child: Text(s.label))],
            onChanged: (v) => setState(() => f = f.copyWith(sort: v)),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String?>(
            initialValue: f.city,
            decoration: const InputDecoration(labelText: 'City'),
            items: [
              const DropdownMenuItem<String?>(value: null, child: Text('Any city')),
              for (final c in cities) DropdownMenuItem<String?>(value: c, child: Text(c)),
            ],
            onChanged: (v) => setState(() => f = f.copyWith(city: () => v)),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String?>(
            initialValue: f.condition,
            decoration: const InputDecoration(labelText: 'Condition'),
            items: [
              const DropdownMenuItem<String?>(value: null, child: Text('Any condition')),
              for (final c in conditions) DropdownMenuItem<String?>(value: c.id, child: Text(c.label)),
            ],
            onChanged: (v) => setState(() => f = f.copyWith(condition: () => v)),
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: TextField(
                controller: _min,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Min price'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _max,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Max price'),
              ),
            ),
          ]),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context, Filters(category: f.category)),
                child: const Text('Reset'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton(
                onPressed: () => Navigator.pop(
                  context,
                  f.copyWith(
                    minPrice: () => int.tryParse(_min.text.trim()),
                    maxPrice: () => int.tryParse(_max.text.trim()),
                  ),
                ),
                child: const Text('Apply'),
              ),
            ),
          ]),
        ]),
      ),
    );
  }
}
