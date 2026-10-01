import 'package:flutter_test/flutter_test.dart';
import 'package:rukhsati_app/core/config.dart';
import 'package:rukhsati_app/core/models.dart';

void main() {
  test('Listing parses populated seller and computes discount', () {
    final l = Listing.fromJson({
      '_id': 'abc',
      'title': 'Red Lehenga',
      'description': 'Beautiful bridal lehenga',
      'category': 'bridal',
      'price': 30000,
      'originalPrice': 60000,
      'condition': 'worn_once',
      'fabric': 'Silk',
      'images': ['/api/uploads/a.webp'],
      'city': 'Lahore',
      'seller': {'_id': 's1', 'name': 'Ayesha', 'phone': '03001234567'},
    });
    expect(l.id, 'abc');
    expect(l.seller.name, 'Ayesha');
    expect(l.seller.phone, '03001234567');
    expect(l.discountPercent, 50);
  });

  test('Listing tolerates an unpopulated seller id and missing fields', () {
    final l = Listing.fromJson({'_id': 'x', 'seller': 's9'});
    expect(l.seller.id, 's9');
    expect(l.price, 0);
    expect(l.discountPercent, isNull);
  });

  test('Conversation and ChatMessage match the API shapes', () {
    final c = Conversation.fromJson({
      'userId': 'u1',
      'userName': 'Sara',
      'lastMessage': 'Hi',
      'unreadCount': 2,
      'listing': {'title': 'Sherwani'},
    });
    expect(c.unreadCount, 2);
    expect(c.listingTitle, 'Sherwani');

    final m = ChatMessage.fromJson({
      '_id': 'm1',
      'sender': {'_id': 'u1', 'name': 'Sara'},
      'message': 'Hello',
      'createdAt': '2026-01-01T10:00:00.000Z',
    });
    expect(m.senderId, 'u1');
  });

  test('imageUrl resolves relative upload paths', () {
    expect(imageUrl('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
    expect(imageUrl('/api/uploads/a.webp'), '$kApiBase/api/uploads/a.webp');
  });

  test('formatPrice groups thousands', () {
    expect(formatPrice(125000), 'Rs. 125,000');
  });
}
