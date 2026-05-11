import 'dart:convert';

class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String city;
  final String? avatar;
  final String role;
  final bool isVerified;
  final bool isSuspended;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.city,
    this.avatar,
    this.role = 'user',
    this.isVerified = false,
    this.isSuspended = false,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      city: json['city'] ?? '',
      avatar: json['avatar'],
      role: json['role'] ?? 'user',
      isVerified: json['isVerified'] ?? false,
      isSuspended: json['isSuspended'] ?? false,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'city': city,
      'avatar': avatar,
      'role': role,
      'isVerified': isVerified,
      'isSuspended': isSuspended,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? city,
    String? avatar,
    String? role,
    bool? isVerified,
    bool? isSuspended,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      isVerified: isVerified ?? this.isVerified,
      isSuspended: isSuspended ?? this.isSuspended,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
