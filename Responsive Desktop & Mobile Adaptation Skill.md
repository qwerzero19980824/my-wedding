# Responsive Desktop & Mobile Adaptation Skill

> Last aligned: 2026-07-16
> Project: `my-wedding`  
> Current app version: v3.26.0

You are responsible for making **平行宇宙的相遇** feel intentionally designed on phones, tablets, laptops, desktops, and large screens.

Do not merely shrink the desktop layout. Adapt each interaction so it remains beautiful, readable, editable, and usable.

---

## 1. Mandatory Project Context

Before responsive work, read:

1. `CHECKPOINT.md`
2. `README.md`
3. `CHANGELOG.md`
4. The relevant CSS/HTML/JS sections inside `index.html`

Current active code is a single-file `index.html`. The old `css/` and `js/` folders are legacy and should not drive new responsive decisions.

---

## 2. Device Targets

Check at least these widths when responsive behavior is affected:

- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

The most important practical checks for this project are 390px mobile, 430px large phone, 768px tablet, 1024px laptop/tablet landscape, and 1440px desktop.

---

## 3. Global Responsive Rules

- No unintended horizontal scrolling on mobile.
- Text must not overflow, overlap, or become unreadable.
- Buttons and editable controls must be tappable on touch screens.
- Do not rely on hover as the only way to reveal important content.
- Use existing breakpoints first. Current code already has important behavior around `768px` and `480px`.
- Keep large-screen content centered with max widths instead of stretching endlessly.
- Use stable dimensions for fixed-format UI: maps, polaroid cards, toolbars, control buttons, and story panels.
- Do not scale font size directly with viewport width. Use intentional fixed/clamped ranges already present in the code.
- Maintain the premium wedding tone: enough air on desktop, compact but not crowded on mobile.

---

## 4. Section-Specific Rules

### 4.1 Three-Layer Intro / WebGL Veil

- The video background must stay full-screen with `object-fit: cover`.
- The WebGL canvas must remain full viewport and interactive.
- Mobile performance matters more than maximum cloth detail.
- Controls must not cover the Hero Card or block the drag-to-unveil path.
- When editing or adding responsive styles, avoid changing the physics initialization order.

### 4.2 Hero Card

- Keep text readable over the video and veil.
- On mobile, the card should remain centered and tappable without hiding the Say Yes button below the fold.
- Contenteditable text must remain easy to select and edit.
- The parallel-world section has 20 text slots across both tracks. On small screens, blank slots and their delete controls appear only in edit mode; controls must remain inside the corresponding half-track.
- The anniversary-day counter below the Hero copy must remain centered in browse mode; its typography controls and drag affordance appear only in edit mode and cannot create horizontal overflow.

### 4.3 Edit Toolbar and Free Items

- In edit mode, the toolbar must remain reachable without covering the active editable item.
- Free item controls, color palette, copy/delete buttons, and drag handles must fit inside small screens.
- Browse mode free items must not intercept page clicks.
- `.free-item-layer` items should stay visually attached to their section, not float globally across unrelated pages.
- Content-package export/import controls and the storage meter must remain inside the edit toolbar, scroll within short viewports, and never appear in browse mode.

### 4.4 Polaroid Wall

- Desktop can use a scattered or arranged board with stronger hover enlargement.
- Mobile must not depend on hover. Click/tap paths must remain complete.
- The hover scale slider controls `wedding_polaroid_layout_v1.hoverScale`; do not remove this user-tunable behavior.
- Back note font size is controlled by `wedding_polaroid_layout_v1.noteFontSize`.
- Batch flip/restore must not cause accidental focus enlargement.
- Upload controls should remain visible only where intended, and must not be triggered from the back side.
- The lower-left flip action and lower-right subtle memory arrow must remain visually and behaviorally distinct.
- The front photo-area memory entry must remain usable on touch screens without making the lower-left flip button hard to tap.
- The back handwritten note area must remain editable on touch screens without accidental memory-stage entry.
- Card hit areas must stay stable so hover/focus does not flicker.

### 4.5 Polaroid Memory Stage

- Desktop target: every entry begins with the selected card centered on its front; after the stage's own flip, the card moves left and the story panel appears on the right. Wall-card flip state must not skip this opening beat.
- Mobile target: use a single-column or stacked layout. The card should appear first, the story panel below it, with overlay scrolling if needed.
- Background blur/dim must not make the active card or story fields hard to read.
- Story inputs (`memoryTitle`, `memoryDate`, `memoryPlace`, `memoryStory`) must be editable on mobile keyboards.
- Close and flip buttons must be reachable with touch.
- No horizontal overflow inside the overlay.

### 4.6 Route Map

- Desktop target: map area should feel large enough to inspect, with copy beside it.
- Tablet/mobile target: copy and map should stack cleanly.
- Route points must remain tappable.
- Labels should remain readable and not collide too badly at common widths.
- The China outline background appears only after all labels have been revealed; responsive changes must preserve `.is-map-complete`.
- Route label size remains user-adjustable through `wedding_route_label_size_v1`.

### 4.7 Story Modules and Merged Memories

- Coverflow Gallery must keep one upright center card and three tilted, dimmed neighbors per side (7 visible total). Mobile uses a separately calculated compact gap and must not re-enable automatic rotation.
- The story-password and owner-auth dialogs must fit within `100svh`, keep at least 48px input/actions, trap keyboard focus, and avoid horizontal overflow at 320–430px.
- Mobile editing/upload controls appear only after Worker-backed owner verification; the selected files input must continue supporting `image/*` and `multiple`.

- Image placeholders or uploaded images must keep intentional aspect ratios.
- Fixed narrative photos remain uploadable only in edit mode; on phones the parallel portraits stay within 150×216px and merged-memory photos use a 4:3 ratio without horizontal clipping.
- Dynamic photo modules remain inert in browse mode and become explicit upload targets in edit mode; on phones they stack to one column with a photo area around 170px tall.
- Free photo boxes must re-clamp both their center and width after viewport changes, hide empty placeholders in browse mode, and remain operable after the edit toolbar auto-collapses.
- The ceremony-rehearsal dialog must fit inside `100svh`, stack chapter buttons on narrow phones, preserve Escape/focus behavior, and never cause horizontal overflow.
- Browse mode hides route typography controls and polaroid layout/size/save controls at every breakpoint; only the two memory-facing batch actions may remain visible.
- Cards/modules should stack on mobile and avoid card-inside-card clutter.
- Editing controls must not overlap body text.

### 4.8 Proposal Finale

- The actual proposal question belongs after the route map; the intro button only opens the story.
- The editable proposal threshold between the route map and finale must keep its title, copy, and “next stop” button fully visible without horizontal overflow; the button remains a clear touch target.
- Desktop may use large concentric ring composition and a centered glass question panel.
- Mobile must keep the complete title, letter, question, and affirmative button in one readable vertical flow with no horizontal overflow.
- Proposal copy and accepted-state copy remain editable through `data-ck`; edit mode must reveal the normally hidden accepted-state text.
- The optional ending photo must preserve its aspect ratio and remain a quiet supporting reveal, rather than covering the answer state or the affirmative action.
- The affirmative action must remain respectful and explicit. Do not add a fake rejection button or evasive dark pattern.
- Ring glow, petals, and celebration particles must yield to `prefers-reduced-motion` while preserving the accepted-state message.
- The manual ceremony-music control stays clear of the bottom-right return control, remains at least 38px tall on mobile, and disables decorative spinning/wave animations under reduced motion.

---

## 5. Breakpoint Strategy

Prefer existing natural responsiveness first, then add targeted rules.

Use this mental model:

- `<= 480px`: compact phone. Stack layouts, reduce fixed card widths, increase touch room, avoid side-by-side panels.
- `481px - 768px`: large phone / small tablet. Mostly stacked, with wider visual breathing room.
- `769px - 1024px`: tablet / small laptop. Two-column layouts are allowed only when content remains readable.
- `>= 1025px`: desktop. Use richer spatial interactions such as the polaroid memory card-left/story-right layout.

Add media queries near the related CSS section in `index.html`, not as scattered global overrides.

---

## 6. Verification Checklist

After responsive changes, check:

1. Mobile has no unintended horizontal scroll.
2. Text does not overlap images, buttons, or neighboring sections.
3. Polaroid wall still opens the memory stage.
4. Polaroid memory story fields are editable.
5. Route labels are revealable and remain visible cumulatively.
6. The route map outline still appears after all labels are shown.
7. Edit toolbar and free item controls are usable at 390px.
8. Desktop still feels premium and not oversized or sparse.
9. Large screens do not stretch readable text too wide.
10. Browser console has no new runtime errors from the responsive change.

When browser automation is blocked, perform static checks and use the local Chrome/DevTools fallback if interaction risk is high.

---

## 7. Final Response Requirements

When finishing responsive work, summarize:

- Which screen sizes or breakpoints were considered.
- What sections were changed.
- What verification was run.
- Any remaining device-specific risk, especially if real mobile Safari/Android Chrome was not tested.
