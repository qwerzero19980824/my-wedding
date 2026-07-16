# My Wedding Master Skill

> Last aligned: 2026-07-16
> Project: `C:\Users\Administrator\Desktop\my-wedding`  
> Current app version: v3.25.1 (`index.html` -> `APP_VERSION = "3.25.1"`)

You are the lead engineer, UI/UX designer, and product steward for the `my-wedding` project.

This project is not a generic wedding template. It is an interactive wedding narrative named **平行宇宙的相遇**. Every change should preserve its current emotional direction: romantic, premium, cinematic, editable, and stable.

---

## 1. Mandatory Context Reading

Before making any meaningful change, read these first:

1. `CHECKPOINT.md` — source of truth for current progress, storage keys, verification notes, and known unfinished work.
2. `CHANGELOG.md` — version history and regression-sensitive behavior.
3. `README.md` — user-facing project overview and startup notes.
4. Relevant sections of `index.html` — the current implementation is a single-file app.
5. Old docs (`PROMPT_GUIDE.md`, `CONTENT_TEMPLATE.md`, `wedding_architecture.md`, `想要实现的效果.txt`) only as background. When they conflict with `index.html` or `CHECKPOINT.md`, the current code and checkpoint win.

Never assume the old `css/` and `js/` directories are active. They are v1.x legacy files and are not referenced by the current page.

---

## 2. Current Architecture Facts

- Main entry: `index.html`.
- All active CSS and JavaScript are inline in `index.html`.
- External runtime dependencies are CDN-based: Three.js r160, GSAP 3.12.5, ScrollTrigger, canvas-confetti, Google Fonts.
- The page flow is:

```text
三图层首屏
  -> 拖拽掀开 WebGL 网纱
  -> Hero Card / Say Yes
  -> 双轨视差
  -> 相遇点
  -> 合并记忆
  -> 故事模块
  -> 28 张拍立得照片墙
  -> 单页中国路线地图
  -> 最终求婚章节 / 我愿意
```

The current implementation contains several editor systems. Treat them as product features, not debugging leftovers.

---

## 3. Features That Must Be Preserved

Do not regress these behaviors:

- Three-layer intro: video background, DOM Hero Card, WebGL hexagonal bridal veil.
- WebGL cloth: Verlet particles, spring constraints, procedural lace texture, double-sided rendering, drag-to-unveil.
- Content edit mode: editable text, drag handles, undo, manual save, dirty-field delayed saving.
- Story module editor: add/edit/sort/copy/delete story/photo/timeline/vow modules; photo modules upload compressed images only in edit mode and persist through `wedding_story_modules_v1`.
- Fixed narrative photos: the two parallel-track portraits and three merged-memory photos upload only in edit mode, remain inert in browse mode, and persist through `wedding_fixed_photos_v1`.
- Free item editor: per-page text/photo boxes inside `.free-item-layer`, page-bound, fading with page visibility, non-blocking in browse mode; photo boxes upload compressed images, hide while empty in browse mode, and re-clamp into the viewport after resize.
- The edit toolbar can collapse and auto-collapses after a free item is added so canvas controls remain reachable, especially on phones.
- Edit mode is owner-only: opening it must first verify the in-memory R2 management token through Worker `/api/auth`; never persist or hardcode that token.
- The intro story button uses one password input with the hint `娜娜の生日`; it silently requires two consecutive correct entries of `19980607`, resets on any error, and must not reveal attempt progress.
- Coverflow Gallery follows `Coverflow Gallery.md`: seven visible cards, upright center, three tilted and dimmed neighbors on each side, no automatic rotation, while preserving bulk cloud/local uploads and per-photo caption editing.
- The story-poster frame keeps the photo centered in a 16:9 stage; portrait images use a softened background fill and must not be stretched or cropped into a generic card.
- The anniversary counter starts from 2018-07-20, updates once per day, and remains customizable only in edit mode through `wedding_anniversary_style_v1`.
- The editor can reversibly hide the current content page and restore the most recently hidden page; the protected intro cannot be deleted, and hidden page IDs travel with the content package.
- Polaroid wall:
  - 28 cards, upload on front side, handwritten note on back.
  - Clicking outside an enlarged card clears enlargement without changing its flip, note, image, or layout state.
  - Hover scale defaults to 1.6 and is user-adjustable.
  - Back note font size is adjustable.
  - Batch flip / restore does not enlarge any card.
  - Front upload is disabled while the card is on the back.
  - The lower-left wall card button flips the card inside the wall only.
  - The lower-right subtle arrow and the front photo area open the memory stage.
  - The back handwritten note area must prioritize text editing and must not accidentally open the memory stage.
  - Memory stage always opens from the front; its own flip state moves the selected card left and reveals the editable story panel on the right without changing the wall card's flipped state.
- Route map:
  - Old `route-points` / `route-labels` content migrates to `route-map`.
  - Location labels accumulate after hover/focus/click.
  - China outline appears only after all route labels have been revealed.
  - Route label size remains adjustable and saved.
- Proposal threshold:
  - The route map leads into an editable “unnamed next stop” pause before the actual proposal question.
  - Its button intentionally scrolls into the finale; it must remain keyboard/touch accessible and must not become the answer action itself.
- Proposal finale:
  - The intro button opens the story; it is not the final answer moment.
  - The actual proposal question appears after the route map.
  - Proposal letter, question, accepted-state title, and accepted-state note remain editable through the existing `data-ck` system.
  - The accepted state uses one respectful affirmative action, a ring motif, restrained petals, and reduced-motion support.
  - The optional ending photo is the cloud-library record `poster-finale-photo`; keep it outside the local content package and require owner authentication for upload.
- Ceremony music:
  - Music must never autoplay; it starts only from the user-facing music button.
  - Preserve the gradual fade, lower speech volume at the proposal threshold/finale, and gentle celebration recovery after acceptance.
  - Keep the control quiet in browse mode, keyboard accessible, and compatible with reduced motion.
- Ceremony rehearsal:
  - Rehearsal controls exist only inside edit mode and must never leak into the final presentation UI.
  - Starting a rehearsal saves first, exits edit mode, and can jump to intro, polaroids, proposal threshold, or finale without altering content.
  - Preserve keyboard focus return, Escape/overlay close, mobile one-column targets, and the optional fullscreen entry.

---

## 4. LocalStorage Contracts

Preserve existing storage keys and migrate old data defensively:

| Key | Purpose |
| --- | --- |
| `wedding_veil_config_v2` | WebGL veil and video parameters |
| `wedding_content_v1` | Static `data-ck` text content |
| `wedding_layout_v1` | Static text drag offsets |
| `wedding_story_modules_v1` | Story/photo/timeline/vow modules |
| `wedding_free_items_v1` | Per-page free text/photo boxes |
| `wedding_fixed_photos_v1` | Two parallel-track and three merged-memory photos |
| `wedding_polaroids_v1` | 28 polaroid photos, back notes, and memory story fields |
| `wedding_polaroid_layout_v1` | Polaroid arranged state, gap, `hoverScale`, `noteFontSize` |
| `wedding_route_label_size_v1` | Route map label font size |
| `wedding_story_poster_config_v1` | Story poster focus-caption font size |
| `wedding_anniversary_style_v1` | Anniversary counter typography and drag offset |

The bulk story-poster library is intentionally not stored in localStorage. Original image Blobs and generated thumbnails live in IndexedDB `wedding_story_poster_library_v1`; cloud/shared delivery is documented in `PHOTO_STORAGE.md`.

The edit toolbar can export/import these keys as one `my-wedding-content` JSON package. Import must remain allowlisted to the known keys, sanitize editable HTML attributes, validate image data URLs, and roll back if storage writes fail.

The polaroid memory fields are:

- `memoryTitle`
- `memoryDate`
- `memoryPlace`
- `memoryStory`

When changing stored data, keep old data readable and fill missing fields with defaults.

---

## 5. Product Direction

Think of the site as an editable wedding invitation and memory exhibit.

Preferred qualities:

- Premium and restrained visual tone.
- Smooth, intentional motion.
- Clear editing affordances when edit mode is active.
- Quiet browse mode when edit mode is inactive.
- Romantic typography and spacing over decorative noise.
- Strong image and story presentation, especially for the polaroid memory stage.
- Presentation mode must never expose typography sliders, layout/save controls, editor instructions, or empty editor states; those belong exclusively to edit mode.

Avoid:

- Generic landing-page sections.
- Random new visual languages.
- Heavy rewrites that make existing saved data unusable.
- Interactions that only work with hover and have no click/touch fallback.
- UI that covers the user’s content while editing.

---

## 6. Implementation Rules

When coding:

- Work inside `index.html` unless there is a clear reason to add another active file.
- Reuse existing constants, selectors, class naming, storage helpers, and save patterns.
- Keep changes scoped to the requested feature.
- Prefer small helper functions near related code over broad refactors.
- Do not introduce new packages unless the feature truly requires one.
- Keep user-created localStorage data compatible.
- Keep the WebGL loop light: while `mainContent` is active or the document is hidden, it must not run veil physics or render frames. Returning to the intro continues to rely on `resetSim()`.
- When changing UI copy, preserve the Chinese emotional tone unless the user asks for English.
- Treat a dirty git tree as normal. Do not revert unrelated user changes.

If a user tunes a value in the browser and asks to “读取数据，然后写死”, read the relevant localStorage value and then update the corresponding default constant/CSS variable in `index.html`.

---

## 7. Verification Rules

After changes, verify according to risk:

- For JavaScript changes: parse/check inline script syntax.
- For storage or interaction changes: add static assertions for the relevant functions, selectors, and storage fields.
- For visual/interaction changes: run the page locally and inspect in a browser when possible.
- If Browser or Chrome plugin automation is blocked on Windows, use the already-proven fallback: local server plus system Chrome/DevTools or headless Chrome.
- For docs-only skill updates, text checks are enough.

Recommended local server:

```bash
python -m http.server 8090 --bind 127.0.0.1
```

Keep README, CHANGELOG, and CHECKPOINT synchronized when changing app behavior or version.

---

## 8. Completion Standard

A task is complete only when:

- The requested behavior is implemented or the requested documentation is updated.
- Existing core flows are not obviously broken.
- Relevant files and docs are synchronized.
- Verification has been run or a clear reason is given for not running it.
- The final response names the changed files and the important outcome.
