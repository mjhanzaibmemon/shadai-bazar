import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../core/api.dart';
import '../core/config.dart';
import '../core/ui.dart';

class SellScreen extends StatefulWidget {
  const SellScreen({super.key});

  @override
  State<SellScreen> createState() => _SellScreenState();
}

class _SellScreenState extends State<SellScreen> {
  static const _maxImages = 10;

  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _originalPrice = TextEditingController();
  final _defects = TextEditingController();
  final List<XFile> _images = [];
  String? _category;
  String? _condition;
  String? _fabric;
  String? _city;
  bool _disclosed = false;
  bool _busy = false;

  @override
  void dispose() {
    for (final c in [_title, _description, _price, _originalPrice, _defects]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickImages() async {
    final remaining = _maxImages - _images.length;
    if (remaining <= 0) return;
    final picked = await ImagePicker().pickMultiImage(limit: remaining, imageQuality: 85, maxWidth: 1600);
    if (picked.isEmpty) return;
    setState(() => _images.addAll(picked.take(remaining)));
  }

  Future<void> _submit() async {
    if (_images.isEmpty) {
      showSnack(context, 'Add at least one photo', error: true);
      return;
    }
    if (!_form.currentState!.validate()) return;
    if (!_disclosed) {
      showSnack(context, 'Please confirm you have disclosed any damage', error: true);
      return;
    }

    setState(() => _busy = true);
    final ok = await guarded(context, () async {
      final urls = await Api.instance.uploadImages([for (final i in _images) i.path]);
      final original = int.tryParse(_originalPrice.text.trim());
      await Api.instance.createListing({
        'title': _title.text.trim(),
        'description': _description.text.trim(),
        'category': _category,
        'price': int.parse(_price.text.trim()),
        'originalPrice': ?original,
        'condition': _condition,
        'fabric': _fabric,
        'city': _city,
        'images': urls,
        if (_defects.text.trim().isNotEmpty) 'defects': _defects.text.trim(),
        'damageDisclosed': true,
      });
      return true;
    });
    if (!mounted) return;
    setState(() => _busy = false);
    if (ok == true) {
      showSnack(context, 'Listing posted!');
      _form.currentState!.reset();
      for (final c in [_title, _description, _price, _originalPrice, _defects]) {
        c.clear();
      }
      setState(() {
        _images.clear();
        _category = _condition = _fabric = _city = null;
        _disclosed = false;
      });
    }
  }

  Widget _dropdown(String label, String? value, List<DropdownMenuItem<String>> items, ValueChanged<String?> onChanged) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: DropdownButtonFormField<String>(
          initialValue: value,
          isExpanded: true,
          decoration: InputDecoration(labelText: label),
          items: items,
          onChanged: onChanged,
          validator: (v) => v == null ? 'Required' : null,
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sell an item')),
      body: Form(
        key: _form,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Text('Photos (${_images.length}/$_maxImages)', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          SizedBox(
            height: 90,
            child: ListView(scrollDirection: Axis.horizontal, children: [
              if (_images.length < _maxImages)
                InkWell(
                  onTap: _pickImages,
                  child: Container(
                    width: 90,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      border: Border.all(color: maroon),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.add_a_photo_outlined, color: maroon),
                  ),
                ),
              for (var i = 0; i < _images.length; i++)
                Stack(children: [
                  Container(
                    width: 90,
                    margin: const EdgeInsets.only(right: 8),
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(10)),
                    child: Image.file(File(_images[i].path), fit: BoxFit.cover, height: 90),
                  ),
                  Positioned(
                    top: 0,
                    right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _images.removeAt(i)),
                      child: const CircleAvatar(radius: 11, backgroundColor: Colors.black54, child: Icon(Icons.close, size: 14, color: Colors.white)),
                    ),
                  ),
                ]),
            ]),
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _title,
            maxLength: 100,
            decoration: const InputDecoration(labelText: 'Title'),
            validator: (v) => (v ?? '').trim().length >= 5 ? null : 'At least 5 characters',
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: _description,
            maxLines: 4,
            maxLength: 2000,
            decoration: const InputDecoration(labelText: 'Description'),
            validator: (v) => (v ?? '').trim().length >= 20 ? null : 'At least 20 characters',
          ),
          const SizedBox(height: 6),
          _dropdown('Category', _category,
              [for (final c in categories) DropdownMenuItem(value: c.id, child: Text(c.label))],
              (v) => setState(() => _category = v)),
          _dropdown('Condition', _condition,
              [for (final c in conditions) DropdownMenuItem(value: c.id, child: Text(c.label))],
              (v) => setState(() => _condition = v)),
          _dropdown('Fabric', _fabric,
              [for (final f in fabrics) DropdownMenuItem(value: f, child: Text(f))],
              (v) => setState(() => _fabric = v)),
          _dropdown('City', _city,
              [for (final c in cities) DropdownMenuItem(value: c, child: Text(c))],
              (v) => setState(() => _city = v)),
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(
              child: TextFormField(
                controller: _price,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Price (Rs.)'),
                validator: (v) => (int.tryParse((v ?? '').trim()) ?? 0) >= 100 ? null : 'Min Rs. 100',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _originalPrice,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Original price'),
              ),
            ),
          ]),
          const SizedBox(height: 14),
          TextFormField(
            controller: _defects,
            maxLines: 2,
            decoration: const InputDecoration(labelText: 'Defects (if any)'),
          ),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            value: _disclosed,
            onChanged: (v) => setState(() => _disclosed = v ?? false),
            title: const Text('I have disclosed all damage and defects honestly'),
          ),
          const SizedBox(height: 8),
          FilledButton(
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Post listing'),
          ),
        ]),
      ),
    );
  }
}
