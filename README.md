# Stillwave

**[Play Stillwave](https://jh124.github.io/Don-t-play-This-Game/)**

![Stillwave in Mosslight Gardens](assets/preview.webp)

A gentle musical action roguelike. Wander through six illustrated worlds, collect a palette of sounds, and compose a little record of your own. This replaces the original tower-defense game; its source remains in Git history.

## The journey

| Movement | World | Musical palette | Guardian |
| --- | --- | --- | --- |
| 1 | Mosslight Gardens | Lofi | The Lantern Keeper |
| 2 | Afterglow City | Synthwave | The Midnight Rider |
| 3 | Littlebit Ruins | Chiptune | The Forgotten Cartridge |
| 4 | Sundrift Coast | Bossa | The Pearl Leviathan |
| 5 | Cloudrest Monastery | Ambient | The Keeper of Silence |
| 6 | The First Light | Downtempo | The Sun in Bloom |

Each world contains eight passages and a distinct, two-phase guardian. Each passage unfolds through six encounters over at least 75 seconds. Collect the three echo shrines and clear the creatures to open the north gateway. Shrine positions, encounters, scenery details, and musical arrangements vary with the journey seed. Some passages have a gentle movement boost or a bonus healing bloom.

The 48 passages alone take at least 60 minutes of active simulation, before boss fights and exploration. A first clear is designed for about 70–90 minutes, although actual player pacing has not been established through an hour-long human playtest. The game pauses in the background. Save & return to title lets you take longer breaks.

Pick one companion for a run:

- **Moonblade:** 36 damage per hit, 0.62-second base recovery, broad cleave, 120-unit reach, and 1 health restored every third successful swing. Better damage, more exposure.
- **Willowbow:** 24 damage per hit, 0.48-second base recovery, 620-unit reach, arrows that can hit two enemies. More room to dodge, lower damage.

Attack recovery and travel time create measured base single-target rates 55.8 and 48 damage per second respectively in the 20-second stationary-target regression scenario. Both weapons receive the same run upgrade opportunities. **Gentle** mode reduces enemy movement and incoming damage; **Steady** provides modest resistance. All enemy attacks have a wind-up. Drifting briefly grants invincibility.

Echo shrines heal for 8, dropped hearts heal for 10, completed passages heal for 16, and mending herbs heal for 45. A guardian heals for 40, and entering a new world restores health. Every few passages, choose a temporary upgrade to attack damage, maximum health, movement, or attack speed.

## Your musical collection

There are 36 collection entries, including the starting Lofi palette. Echo bearers appear in passages 2, 4, 6, and 8 of every world. Chordkeepers summon companions, Tempo Wanderers charge, Echo Weavers scatter notes, and Meter Wardens release circular patterns. Defeat them to unlock one of the 24 track/control discoveries. Each guardian unlocks its instrument and genre palette.

Unlocks include bass, melody, atmosphere, and arpeggio tracks; instruments; six keys; minor, major, Dorian, and pentatonic scales; 4/4, 3/4, 6/8, and 5/4; tempo from 60–96 BPM; swing; reverb; tape delay; warmth; and arrangement density. Notes share a diatonic harmonic progression. Music is composed locally with seeded motifs, changing phrases, synthesized instruments, and genre-specific rhythms. There is no prerecorded music loop and no timing requirement for combat.

Your collection survives death. A new run starts from the first world with your chosen weapon. Run-only combat upgrades reset. Your current run, musical settings, completed guardians, and collection save automatically in browser localStorage. Save & return to title resumes at the **start of the current passage**, with saved health, herbs, weapon, upgrades, and elapsed run time. This is a device-local save; clearing browser storage removes it.

## The completion studio

Complete the six guardians and enter the final gateway to open the completion screen. Choose your genre, instruments, active tracks, track levels, key, scale, meter, BPM, effects, and master volume. Request a new arrangement seed for another composition. The studio remains accessible from the title after your first clear.

**Create & download** renders a new, exactly 60-second stereo, 44.1 kHz, 16-bit PCM WAV using the same synthesis and composition engine as live music. The arrangement fades in and out and includes its effects. A preview player and reusable download link appear after rendering. Audio is generated on the device; no recording permission, account, or upload is required.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Left stick |
| Aim and attack | Hold left click, aim with mouse | Hold Attack, automatic nearby aim |
| Attack with assisted aim | Hold Space | Hold Attack |
| Drift | Shift / right click | Drift |
| Heal | Q / Mend button | Mend button |
| Gather echo / use gateway | E / on-screen button | Gather / Continue |
| Music panel | M / music dock | Music dock |
| Pause | Escape / pause button | Pause button |

Assisted aim for Space and reduced motion are configurable in Pause. Music continues while a visible pause or music panel is open, and suspends when the tab is hidden. Browsers require an initial interaction before playing sound. If your OS suspends audio, resume through the visible music controls.

## Development

No runtime packages, build dependencies, or backend are required. Node 22+ is used for the small build script and tests.

```sh
npm test
npm run build
```

Serve `dist/` with a static web server. ES modules require HTTP; opening `index.html` directly as a file is not supported. The only optional external resource is the Google Fonts stylesheet; system serif and sans-serif fallbacks are provided.

Source layout:

- `index.html`, `styles.css`: responsive title, game HUD, dialogs, studio, and touch controls.
- `js/engine.js`: seeded world simulation, encounters, weapons, enemies, guardians, and progression.
- `js/music.js`: composition, Web Audio synthesis, effects, offline rendering, and PCM encoding.
- `js/data.js`: worlds, musical palettes, unlocks, weapon data, and deterministic helpers.
- `js/save.js`: validated browser archive and run persistence.
- `js/render.js`, `js/sprites.js`: illustrated-world rendering and original vector characters.
- `js/app.js`: input, interface, audio integration, and lifecycle.
- `assets/worlds.webp`: original generated environment atlas.
- `tests/game.test.mjs`: behavioral checks for progression, persistence, harmony, weapons, damage, and WAV structure.
- `tests/browser.html`: local-only Web Audio verification and archive fixtures; not included in `dist/`. For local QA, copy it to `dist/qa.html`, serve `dist/`, and open `/qa.html`. Rebuild before publication to remove it.

GitHub Actions runs the tests, builds `dist/`, and publishes it to the repository’s existing GitHub Pages site on pushes to `main`. The repository name and public address are unchanged.
