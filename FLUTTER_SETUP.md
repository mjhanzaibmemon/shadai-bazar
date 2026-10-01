# Flutter app (`mobile/`)

```bash
cd mobile
flutter pub get
flutter analyze && flutter test

# Run against production
flutter run

# Run against a local backend (Android emulator reaches the host at 10.0.2.2)
flutter run --dart-define=API_BASE=http://10.0.2.2:3000
```

Local HTTP backends work on the iOS simulator; for a physical device use your machine's LAN IP.
Android release builds need HTTPS (the default `https://ruksati.com` is fine).

## Release

```bash
flutter build appbundle   # Play Store
flutter build ipa         # App Store (macOS)
```

Set the app icon/signing config under `mobile/android` and `mobile/ios` before publishing.

## How it authenticates

The app sends `X-Client: mobile` on every request. `POST /api/auth/login` then returns a `token`
in the JSON body (browsers never receive it), which the app stores and sends as
`Authorization: Bearer <token>`. Users must verify their email before they can log in.

## Layout

- `lib/core/` — config, API client, models, auth state, shared widgets
- `lib/screens/` — browse, listing detail, auth, sell, chat, profile
- `test/` — model parsing tests against the real API shapes
