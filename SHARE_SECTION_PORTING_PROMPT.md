# Share Section Porting Prompt

Use this prompt to duplicate the exact share UI/behavior from this project into another page.

## Reusable Prompt

You are migrating the full “Share this tool” component from the source project into a target page.

The screenshot/reference layout is authoritative. If the current target page code differs from the screenshot, match the screenshot.

Source of truth:
- Primary source of truth: the screenshot/reference layout
- HTML markup: the share block rendered inside the preview/canvas area
- CSS styles: the share overlay container, trigger, panel, chips, and feedback styles
- JS behavior: the share constants, URL helpers, panel state helpers, share-link builders, copy handlers, and event wiring
- Visual/layout reference: the intended UI is a blue outlined share overlay at the top of the preview canvas, directly below the Preview/Chat tabs, with the trigger on the left and the share chips inside the same panel

Requirements:
1. Copy the share section markup exactly (same ids, classes, links/buttons, aria attributes, order).
2. Keep placement the same relative to the preview/canvas container:
   - inside the preview panel/canvas region
   - directly below the Preview/Chat tabs
   - anchored as a top overlay spanning the visible preview width
   - above the rendered canvas and above the affiliate strip/disclosure content
   - not in the left form/settings column
   - not inline with the form title or measurement inputs
3. Copy all required CSS classes exactly:
   - `.share-section`
   - `.share-section-canvas`
   - `.share-trigger`
   - `.share-panel`
   - `.share-chip`
   - `.share-feedback`
4. Copy the visual structure exactly:
   - one outer rounded rectangle with a blue border
   - the trigger button lives inside that bordered container at the top-left
   - the social chips appear in the same bordered container, to the right of and/or below the trigger depending on available width
   - the chips wrap horizontally in a single compact row group
   - the panel is visually integrated into the container, not rendered as a separate floating card detached from the border
   - the trigger label must read `Share this tool`
   - the social chip labels/order must be: `Facebook`, `Pinterest`, `X / Twitter`, `LinkedIn`, `Reddit`, `Instagram (copy link)`, `Copy Link`
5. Copy all required JS logic exactly:
   - DOM references for all share elements
   - `normalizePublicUrl()`
   - `getPublicSiteUrl()`
   - `ensurePublicSiteUrlForLocal()`
   - `isLocalHostname()`
   - `getSharePayload()`
   - `setShareFeedback()`
   - `buildShareLinks()`
   - `prepareSocialShareOrBlock()`
   - `copyShareUrl()`
   - `shareNativelyIfAvailable()`
   - `setSharePanelOpen()`
   - initialization/wiring block: `if (shareTrigger && sharePanel) { ... }`
6. Preserve behavior exactly:
   - Native share on supported devices (`navigator.share`) before opening the fallback panel
   - Fallback panel with Facebook, Pinterest, X / Twitter, LinkedIn, Reddit, Instagram (copy link), and Copy Link
   - Instagram button copies the share URL with the custom Instagram guidance message instead of opening a URL
   - Copy Link button copies the canonical share URL
   - Click outside closes the open panel
   - Uses `meta[name="public-site-url"]` for canonical share URL resolution during local development
   - Appends `share_preview=v4` query param to the shared URL
   - Uses `/preview.png` for Pinterest media
   - Keeps the share UI visible in the overlay position shown in the reference, not in the left-side form column
7. Do not rename ids/classes/functions unless absolutely required by the target architecture.
8. If IDs must be namespaced, update all selectors and handlers consistently.
9. Keep accessibility attributes and `aria-live` feedback.
10. Match the intended visual presentation:
   - rounded rectangular blue outline around the entire share area
   - trigger button styled as a blue pill with icon/text treatment
   - social actions rendered as compact rounded chips in a horizontal wrapping row
   - panel background integrated into the same overlay block rather than a detached modal
   - spacing should be tight and shallow like a toolbar, not tall like a form section
   - the container should visually read as part of the preview column header area

Validation checklist:
- Share overlay appears at the top of the preview/canvas area in the same position as the reference.
- Share overlay does not appear in the left form/settings column.
- Trigger button toggles the panel on desktop.
- On mobile, native share opens when available before falling back to the panel.
- Each social chip opens the correct endpoint with encoded URL/text.
- Instagram and Copy Link both copy successfully on secure context and fallback path.
- Clicking outside the panel closes it.
- Localhost still gives usable feedback and does not break.
- Styles match the intended outline, spacing, chip layout, and placement.

Deliverables:
- List of files changed.
- Short summary of what was copied.
- Any deviations from exact parity.

## Placement Notes

- The share block belongs in the preview/canvas column, not in the form column.
- It should sit immediately under the Preview / Chat tabs and above the 3D preview canvas.
- It should visually span the top width of the preview area as a persistent overlay container.
- The trigger and social chips should appear inside that single overlay block, matching the reference layout.
- If there is any ambiguity between current page markup and the screenshot, follow the screenshot.
