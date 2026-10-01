import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/api.dart';
import '../core/auth_state.dart';
import '../core/models.dart';
import '../core/ui.dart';

class ConversationsScreen extends StatefulWidget {
  const ConversationsScreen({super.key});

  @override
  State<ConversationsScreen> createState() => _ConversationsScreenState();
}

class _ConversationsScreenState extends State<ConversationsScreen> {
  List<Conversation>? _items;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final items = await Api.instance.conversations();
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
      appBar: AppBar(title: const Text('Messages')),
      body: items == null
          ? (_error != null
              ? ErrorRetry(message: _error!, onRetry: _load)
              : const Center(child: CircularProgressIndicator()))
          : items.isEmpty
              ? const EmptyState(
                  icon: Icons.chat_bubble_outline,
                  title: 'No conversations yet',
                  subtitle: 'Message a seller from any listing to start chatting.',
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    itemCount: items.length,
                    separatorBuilder: (_, _) => const Divider(height: 1),
                    itemBuilder: (_, i) {
                      final c = items[i];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: maroon,
                          foregroundColor: Colors.white,
                          child: Text(c.userName.isEmpty ? '?' : c.userName[0].toUpperCase()),
                        ),
                        title: Text(c.userName, style: TextStyle(fontWeight: c.unreadCount > 0 ? FontWeight.bold : null)),
                        subtitle: Text(
                          c.listingTitle != null ? '${c.listingTitle}\n${c.lastMessage}' : c.lastMessage,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: c.unreadCount > 0
                            ? CircleAvatar(
                                radius: 11,
                                backgroundColor: maroon,
                                child: Text('${c.unreadCount}', style: const TextStyle(fontSize: 11, color: Colors.white)),
                              )
                            : null,
                        onTap: () async {
                          await Navigator.of(context).push(MaterialPageRoute(
                            builder: (_) => ChatThreadScreen(otherUserId: c.userId, otherUserName: c.userName),
                          ));
                          _load();
                        },
                      );
                    },
                  ),
                ),
    );
  }
}

class ChatThreadScreen extends StatefulWidget {
  const ChatThreadScreen({
    super.key,
    required this.otherUserId,
    required this.otherUserName,
    this.listingId,
  });

  final String otherUserId;
  final String otherUserName;
  final String? listingId;

  @override
  State<ChatThreadScreen> createState() => _ChatThreadScreenState();
}

class _ChatThreadScreenState extends State<ChatThreadScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  List<ChatMessage> _messages = [];
  Timer? _poll;
  bool _sending = false;
  bool _loaded = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 6), (_) => _load(silent: true));
  }

  @override
  void dispose() {
    _poll?.cancel();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _load({bool silent = false}) async {
    try {
      final m = await Api.instance.messages(widget.otherUserId);
      if (!mounted) return;
      final grew = m.length != _messages.length;
      setState(() {
        _messages = m;
        _loaded = true;
        _error = null;
      });
      if (grew) _jumpToEnd();
    } on ApiException catch (e) {
      if (mounted && !silent) setState(() => _error = e.message);
    }
  }

  void _jumpToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
    });
  }

  Future<void> _send() async {
    final text = _input.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    final ok = await guarded(context, () => Api.instance
        .sendMessage(to: widget.otherUserId, text: text, listingId: widget.listingId)
        .then((_) => true));
    if (!mounted) return;
    setState(() => _sending = false);
    if (ok == true) {
      _input.clear();
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final myId = context.read<AuthState>().user?.id;
    return Scaffold(
      appBar: AppBar(title: Text(widget.otherUserName)),
      body: Column(children: [
        Expanded(
          child: !_loaded
              ? (_error != null
                  ? ErrorRetry(message: _error!, onRetry: _load)
                  : const Center(child: CircularProgressIndicator()))
              : _messages.isEmpty
                  ? const EmptyState(icon: Icons.waving_hand_outlined, title: 'Say salaam!')
                  : ListView.builder(
                      controller: _scroll,
                      padding: const EdgeInsets.all(12),
                      itemCount: _messages.length,
                      itemBuilder: (_, i) {
                        final m = _messages[i];
                        final mine = m.senderId == myId;
                        return Align(
                          alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                            margin: const EdgeInsets.symmetric(vertical: 3),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: mine ? maroon : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: mine ? null : Border.all(color: Colors.grey.shade300),
                            ),
                            child: Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                              Text(m.text, style: TextStyle(color: mine ? Colors.white : Colors.black87)),
                              const SizedBox(height: 2),
                              Text(DateFormat('h:mm a').format(m.createdAt.toLocal()),
                                  style: TextStyle(fontSize: 10, color: mine ? Colors.white70 : Colors.grey)),
                            ]),
                          ),
                        );
                      },
                    ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(10, 6, 10, 8),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: _input,
                  minLines: 1,
                  maxLines: 4,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(hintText: 'Type a message', isDense: true),
                  onSubmitted: (_) => _send(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filled(
                style: IconButton.styleFrom(backgroundColor: maroon),
                onPressed: _sending ? null : _send,
                icon: const Icon(Icons.send, color: Colors.white),
              ),
            ]),
          ),
        ),
      ]),
    );
  }
}
