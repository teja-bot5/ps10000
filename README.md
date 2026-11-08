# PS10,000 — private TV game console

One Android TV app: PS5-style home screen, 15 built-in games, a retro emulator for homebrew ROMs,
and any phone becomes a controller (up to 4 players). Works fully offline on your home Wi-Fi.

Works on Android TV, Google TV and Android TV boxes (Android 5.0+). Tested target: Xiaomi Mi TV (MITV-AXSO0, Android TV 9).

---

## 1. Build the APK (Android Studio, ~5 minutes)

1. Install **Android Studio** (any 2024+ version). It brings the Android SDK and JDK 17.
2. **File → Open** → choose the `android` folder.
3. Wait for Gradle sync (first time downloads Android Gradle Plugin 8.5 + Gradle 8.7, needs internet once).
4. **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
5. APK is at `android/app/build/outputs/apk/debug/app-debug.apk`
   (or **Build → Generate Signed…** / `gradlew assembleRelease` → `app/build/outputs/apk/release/app-release.apk`).

Command line instead: `cd android` → `gradlew.bat assembleRelease` (Windows) or `./gradlew assembleRelease`.

No PC setup? Push the `android` folder to a GitHub repo — the included workflow
(`.github/workflows/build-apk.yml` at the repo root) builds the APK in the cloud. Download it from the Actions tab → *PS10000-apk*.

## 2. Install on the TV

Pick one:

- **Send Files to TV** app (Play Store, on both phone and TV) → send the APK → open it on the TV.
- **USB drive** → copy the APK → open it with the TV's file manager.
- **ADB over Wi-Fi**: TV *Settings → Device Preferences → About* → click *Build* 7 times → *Developer options → USB/Network debugging ON* →
  `adb connect <tv-ip>:5555` → `adb install -r app-release.apk`.

When asked, allow **Install unknown apps** for the app you used. PS10,000 then appears in the TV's apps row with its banner.

## 3. Play

- Open **PS10,000** → press **OK** → pick a player.
- **Phones:** home screen → *Players* card (or Control Center → *Controllers*) → scan the QR with the phone camera
  → type a name → **Join game** → turn the phone sideways. Phone and TV must be on the same Wi-Fi. No app install needed.
- **Bluetooth controllers:** pair once in TV *Settings → Remotes & Accessories*, then press any button.
- **TV remote:** arrows + OK to browse, **Back** = back / pause menu, **Menu (≡)** = Control Center.
- During a game: **Back** on the remote or **≡ / Home** on a phone/controller opens the pause menu
  (Resume, Save state, Load state, Restart, Quit).

The phone layout changes per game: D-pad + A/B for retro games, stick + ABXY for modern games,
two sticks for twin-stick shooters, one giant button for Jet Rush.

## 4. Built-in games (15)

| Game | Players | Type | Licence |
|---|---|---|---|
| Ember & Tide | 1–2 co-op | PS10,000 original | MIT |
| Jet Rush | 1–4 versus | PS10,000 original | MIT |
| Night Shift | 1 | PS10,000 original (stealth) | MIT |
| Brawl Box | 2–4 (+CPU) | PS10,000 original (party brawler) | MIT |
| Player Versus Player | 1–4 split-screen | kesiev/pvp | GPL-3.0 |
| Space Huggers | 1–4 co-op | KilledByAPixel | GPL-3.0 |
| Onslaught! Arena (full game) | 1 | Lost Decade Games | GPL code, free-to-share assets |
| Radius Raid | 1 | Jack Rugile | MIT |
| Underrun | 1 | phoboslab | MIT |
| Starship Sorades | 1 | Thiemo Mättig | CC BY-SA 3.0 DE |
| Outrun Racer | 1 | Jake Gordon | MIT |
| Pong | 1–2 | Jake Gordon | MIT |
| Blocks | 1 | Jake Gordon | MIT |
| Hextris | 1 | Hextris team | GPL-3.0 |
| 2048 | 1 | Gabriele Cirulli | MIT |

Ads, analytics and "buy the full version" links were removed from the open-source games (allowed by their licences).

## 5. Add retro games (NES, SNES, GB/GBC, GBA, Mega Drive, Master System, Game Gear)

**From a phone:** Control Center → *Add games* → scan the QR → *Choose files* → pick `.nes .sfc .smc .gb .gbc .gba .md .gen .sms .gg .zip`.
They appear on the TV instantly. **Or** copy files to `Android/data/com.ps10000.tv/files/roms/` with a file manager / USB.

These 16 licence-cleared homebrew games already have covers and info in the console — download them and send them over.
The file name just needs to contain the game's title (e.g. `Nova the Squirrel v1.2.nes` is fine).

| Game | System | Where to download | Licence |
|---|---|---|---|
| Nova the Squirrel | NES | github.com/NovaSquirrel/NovaTheSquirrel → Releases | GPLv3 / CC BY-NC-SA |
| Super Tilt Bro. | NES | github.com/sgadrat/super-tilt-bro → Releases, or sgadrat.itch.io | WTFPL |
| Thwaite | NES | pineight.com/nes | GPL |
| Concentration Room | NES | pineight.com/nes | GPL |
| RHDE: Furniture Fight | NES | pineight.com/nes | All-Permissive |
| Russian Roulette | NES | pineight.com/nes | All-Permissive |
| Lan Master | NES | shiru.untergrund.net | CC0 |
| Lawn Mower | NES | shiru.untergrund.net | CC0 |
| Zooming Secretary | NES | shiru.untergrund.net | CC-BY |
| Double Action Blaster Guys | NES | NovaSquirrel / NESdev forum | author OK for compilations |
| NES15, Escape from Pong, BrickBreaker, The 1007 Bolts | NES | NESdev forums (open-source compo entries) | BSD / MIT / CC0 |
| Tobu Tobu Girl | Game Boy | github.com/SimonLarsen/tobutobugirl → Releases, or tangramgames.itch.io | MIT / CC BY 4.0 |
| µCity | Game Boy Color | github.com/AntonioND/ucity → Releases | GPLv3 / CC BY-SA |

Only add games you're allowed to share (open-licence homebrew or your own backups). Commercial ROMs are not included and shouldn't be shared with friends.

Saves: retro games autosave every 2 minutes and on quit; *Save state / Load state* in the pause menu; *Continue from save* on the game page.

## 6. Settings worth knowing

- **Visual effects → Auto** switches to *Lite* on TVs with under 1.6 GB RAM (like the Mi TV 4A/4C Pro): no moving backgrounds or shadows, so menus stay smooth.
- **Show FPS counter** to check smoothness on a new TV.
- **Licences & credits** lists every game, library and licence.

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| Phone can't open the QR link | Phone and TV must be on the same Wi-Fi (not mobile data). Turn off "Wi-Fi assistant" / VPN on the phone. Some routers block device-to-device traffic ("AP isolation") — turn it off or use a phone hotspot for both. |
| "Scan the TV QR again" on phone | The TV restarted and made a new PIN. Rescan the QR. |
| Games stutter on the Mi TV | Settings → Visual effects → Lite. Close other apps. SNES/GBA games are the heaviest on 1 GB TVs. |
| White/blank screen on an old box | Update **Android System WebView** from the Play Store (needs Chrome/WebView 60+). |
| App not in the TV's app row | Open it from Settings → Apps, or install a launcher that shows sideloaded apps. |

## 8. Project layout

```
android/                         Android Studio project (Java, no extra libraries)
  app/src/main/java/.../MainActivity.java      WebView shell, Bluetooth pad bridge, remote keys, crash recovery
  app/src/main/java/.../server/WebServer.java  tiny HTTP + WebSocket server (phones, ROM upload, files)
  app/src/main/assets/web/       the whole console UI and games
    index.html, css/, js/        launcher (home, game hub, library, controllers, add games, settings, control center)
    pad/                         phone controller page
    shim/shim.js                 runs inside every game: virtual gamepads, pad→keyboard, aim ring, pause
    emu/                         EmulatorJS 4.2.3 + cores (fceumm, snes9x, gambatte, mgba, genesis_plus_gx, smsplus), patched to stay offline
    originals/                   Ember & Tide, Jet Rush, Night Shift, Brawl Box
    games/                       open-source HTML5 games
    art/                         covers and hero images
tools/DesktopServer.java         run the console on a PC for testing (see below)
```

Preview on a PC (no TV needed):
```
javac -d build android/app/src/main/java/com/ps10000/tv/server/WebServer.java tools/DesktopServer.java
java -cp build DesktopServer android/app/src/main/assets/web roms 8080
```
Open `http://localhost:8080` (keyboard: arrows, Enter, Esc, M = Control Center) and scan the QR with your phone.

Launcher look follows WPS5 (angelvc25), used with the author's permission: same layout, sizes, navy info cards, white focus ring and rotating light on the focused tile. Type is Source Sans 3 (open licence, close to a console system font); icons, button glyphs and UI sounds are original and synthesised — no Sony fonts, symbols or sound files.
