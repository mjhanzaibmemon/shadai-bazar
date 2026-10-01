import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api.dart';
import '../core/auth_state.dart';
import '../core/config.dart';
import '../core/ui.dart';

final _emailRe = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _hide = true;
  bool _needsVerify = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _needsVerify = false;
    });
    final auth = context.read<AuthState>();
    final nav = Navigator.of(context);
    try {
      await auth.login(_email.text, _password.text);
      if (mounted) nav.pop();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _needsVerify = e.emailNotVerified);
      showSnack(context, e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resend() async {
    final ok = await guarded(
        context, () => Api.instance.resendVerification(_email.text.trim()).then((_) => true));
    if (ok == true && mounted) showSnack(context, 'Verification email sent. Check your inbox.');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Log in')),
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(20), children: [
          const SizedBox(height: 12),
          const Text('Welcome back', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: maroon)),
          const SizedBox(height: 4),
          const Text('Log in to chat, sell and save favourites.', style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          Form(
            key: _form,
            child: Column(children: [
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (v) => _emailRe.hasMatch((v ?? '').trim()) ? null : 'Enter a valid email',
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _password,
                obscureText: _hide,
                autofillHints: const [AutofillHints.password],
                decoration: InputDecoration(
                  labelText: 'Password',
                  suffixIcon: IconButton(
                    icon: Icon(_hide ? Icons.visibility_off : Icons.visibility),
                    onPressed: () => setState(() => _hide = !_hide),
                  ),
                ),
                validator: (v) => (v ?? '').length >= 6 ? null : 'At least 6 characters',
                onFieldSubmitted: (_) => _submit(),
              ),
            ]),
          ),
          if (_needsVerify)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(10)),
                child: Row(children: [
                  const Expanded(child: Text('Please verify your email first.')),
                  TextButton(onPressed: _resend, child: const Text('Resend')),
                ]),
              ),
            ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('Log in'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context)
                .push(MaterialPageRoute(builder: (_) => const ForgotPasswordScreen())),
            child: const Text('Forgot password?'),
          ),
          const Divider(height: 32),
          OutlinedButton(
            onPressed: () => Navigator.of(context)
                .pushReplacement(MaterialPageRoute(builder: (_) => const SignupScreen())),
            child: const Text('Create an account'),
          ),
        ]),
      ),
    );
  }
}

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  String? _city;
  bool _busy = false;
  bool _done = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _busy = true);
    final ok = await guarded(context, () => Api.instance.signup(
          name: _name.text.trim(),
          email: _email.text.trim(),
          phone: _phone.text.trim(),
          city: _city!,
          password: _password.text,
        ).then((_) => true));
    if (!mounted) return;
    setState(() {
      _busy = false;
      _done = ok == true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_done) {
      return Scaffold(
        appBar: AppBar(title: const Text('Check your email')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.mark_email_read_outlined, size: 72, color: maroon),
            const SizedBox(height: 16),
            Text('We sent a verification link to ${_email.text.trim()}.',
                textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            const Text('Open it, then come back and log in.', textAlign: TextAlign.center),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => Navigator.of(context)
                  .pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen())),
              child: const Text('Go to log in'),
            ),
          ]),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: Form(
          key: _form,
          child: ListView(padding: const EdgeInsets.all(20), children: [
            TextFormField(
              controller: _name,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Full name'),
              validator: (v) => (v ?? '').trim().length >= 2 ? null : 'Enter your name',
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
              validator: (v) => _emailRe.hasMatch((v ?? '').trim()) ? null : 'Enter a valid email',
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone', hintText: '03001234567'),
              validator: (v) => RegExp(r'^03\d{9}$').hasMatch((v ?? '').trim())
                  ? null
                  : 'Use format 03001234567',
            ),
            const SizedBox(height: 14),
            DropdownButtonFormField<String>(
              initialValue: _city,
              decoration: const InputDecoration(labelText: 'City'),
              items: [for (final c in cities) DropdownMenuItem(value: c, child: Text(c))],
              onChanged: (v) => setState(() => _city = v),
              validator: (v) => v == null ? 'Select your city' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password (min 6 characters)'),
              validator: (v) => (v ?? '').length >= 6 ? null : 'At least 6 characters',
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: _busy
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Sign up'),
            ),
          ]),
        ),
      ),
    );
  }
}

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_emailRe.hasMatch(_email.text.trim())) {
      showSnack(context, 'Enter a valid email', error: true);
      return;
    }
    setState(() => _busy = true);
    final ok = await guarded(context, () => Api.instance.forgotPassword(_email.text.trim()).then((_) => true));
    if (!mounted) return;
    setState(() => _busy = false);
    if (ok == true) {
      showSnack(context, 'If that account exists, a reset link is on its way.');
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Reset password')),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(children: [
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 20),
            FilledButton(onPressed: _busy ? null : _submit, child: const Text('Send reset link')),
          ]),
        ),
      );
}
