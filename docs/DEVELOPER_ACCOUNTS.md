# Developer Account Setup

You only need these when you're ready to ship to stores. Local development on simulators / web / desktop needs none of this.

## 1. GitHub — done ✅

You're already authenticated as `codebend3r` and the repo is live at
<https://github.com/codebend3r/anime-manga-guide>.

## 2. Apple Developer Program — required for iOS App Store

**Cost:** US$99 / year
**Time:** typically 24–48 hours for individual approval; longer for organizations

Steps:

1. Have an Apple ID with two-factor auth enabled. <https://appleid.apple.com>
2. Enroll at <https://developer.apple.com/programs/enroll/>
   - Choose **Individual** (simpler) or **Organization** (requires a D-U-N-S number, ~2 weeks).
3. After approval, sign in to App Store Connect: <https://appstoreconnect.apple.com>
4. Create the app entry:
   - **Bundle ID:** e.g. `com.codebend3r.kasane`
   - **SKU:** anything unique (e.g. `kasane-001`)
   - **Primary language:** English

Once enrolled, EAS Build can sign and submit:

```bash
bun add -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
eas submit --platform ios
```

**Notes:**

- You can test on a real iPhone via a free Apple ID + Xcode without paying, but apps expire after 7 days.
- The App Store has a 30% commission on paid apps / in-app purchases.

## 3. Google Play Console — required for Play Store

**Cost:** US$25 one-time
**Time:** instant after payment, but new accounts now require **20 internal testers** for a closed test running 14+ days before you can publish to production. Plan for ~3 weeks total.

Steps:

1. Sign in with a Google account: <https://play.google.com/console/signup>
2. Pay the $25 registration fee.
3. Verify identity (government ID for individual accounts).
4. Create the app entry:
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** your call
5. Provide the required metadata: privacy policy URL, content rating questionnaire, target audience, data safety section.

EAS submission:

```bash
eas build --platform android --profile production
eas submit --platform android
```

**Notes:**

- The 14-day / 20-tester rule was introduced in late 2023 for new Personal accounts. Organization accounts skip it.
- Privacy policy URL is required _before_ the first internal test. Host a minimal one on GitHub Pages (you already have `codebend3r.github.io`).

## 4. EAS (Expo Application Services) — optional but recommended

Free tier: 30 builds/month, plenty for one app.

```bash
bun add -g eas-cli
eas login        # uses your Expo account (free signup at expo.dev)
```

The free tier is enough to build, sign, and submit to both stores without owning a Mac for iOS builds.

## 5. Web hosting — none required

`bun run build:web` produces a static `dist/` folder. Drop it on any of:

- Cloudflare Pages (free, generous bandwidth)
- Netlify (free tier)
- Vercel (free tier)
- GitHub Pages (free; works since the export is static)

## 6. Desktop distribution — none required

Tauri builds produce native `.dmg` / `.msi` / `.AppImage` binaries. Distribute them via GitHub Releases.

Optional, only when you start signing:

- **Apple Developer ID** (for macOS notarization) — included in your $99 Apple Developer Program above.
- **Windows code-signing certificate** — ~$200–400/yr from a CA like SSL.com if you want to avoid SmartScreen warnings. Skippable for personal projects.

## Recommended order

1. Ship web first (today — push `dist/` to Cloudflare Pages).
2. Pay the Google Play $25 and start the 14-day closed test in parallel with development.
3. Pay the Apple $99 once the app is feature-complete and submit to TestFlight.
4. Add desktop builds via GitHub Releases when convenient.
