# Free Wedding / Engagement Invitation

An original HTML/CSS/JavaScript invitation inspired by premium Indian wedding
invitation websites — sealed-envelope opening, photo polaroids, a
scratch-to-reveal save the date, live countdown, ceremony details and an
interactive RSVP.


## Run locally

No build step is required.

From this folder run:

    python3 -m http.server 8000

Then open:

    http://localhost:8000

## How it works

1. Guests first see a **sealed envelope filling the whole screen** — tapping
   it plays a cinematic sequence: the camera zooms into the wax seal, gold
   sparks fly, a cream flash passes through the paper, and the scene reveals
   an illuminated palace with the couple's names, while the music starts.
   Returning visitors in the same browser session skip straight to the scene.
2. Sections flow like a printed card: the palace hero, photo polaroids,
   a **scratch card** hiding the save-the-date, a **countdown**, the formal
   invitation, ceremony details, and an **RSVP** where guests pick a response
   and continue to your form.

## Customize

Edit `js/script.js` and change the `CONFIG` object:

- `groom`, `bride`, `dateText`
- `countdownTarget` — e.g. `"2026-12-15T19:00:00"`
- `memories` — photo polaroids (`src`, `caption`, optional `wide: true`)
- `events` — one card per ceremony (mehndi, sangeet, wedding, …), each with
  date, time, venue, address and a Google Maps link
- `rsvpUrl` — your Google Form link (guests who accept)
- `rsvpSheetUrl` — Apps Script web-app URL that records declines
- `countdownBg` — optional photo behind the countdown, e.g.
  `"images/countdown.jpg"`; leave empty for the plain dark band

## Replace images

Put your own images in `images/` with these names:

    hero.png        sealed envelope — shown full-screen on the cover;
                   hero.webp is its optimised copy (regenerate with:
                   convert hero.png -quality 82 hero.webp)
    palace.jpg      the scene revealed after opening (full-screen hero).
                   Currently the illuminated Mysore Palace — swap in your
                   own venue photo if you prefer
    eng.jpeg        the couple's photo — used for the framed portrait in
                   the invitation section and the polaroids
    venue.jpg       photo in the ceremony-details section
    og.jpg          1200×630 preview shown when the link is shared on
                   WhatsApp / Instagram / Twitter

`palace.jpg` and `venue.jpg` are free stock images from
[Unsplash](https://unsplash.com/license) chosen to match the cream-and-gold
aesthetic — replace them with your own whenever you're ready.

## Music

Put your own appropriately licensed MP3 at:

    music/wedding.mp3

Music starts after the guest taps the envelope (browsers only allow sound
after a tap). The floating button in the corner pauses and resumes it.

## RSVP for ₹0

Guests pick "Joyfully accept" or "Regretfully decline". Accepting opens your
Google Form; declining asks only for a name on the page. Both end up in one
"RSVPs" tab of a Google Sheet with a Status column — no backend required.

1. Create a Google Form. In Settings → Responses set **Collect email
   addresses** to *Responder input*, then add four questions, in this order:
   Name, Phone, Dietary preference, Members. Put its link in `rsvpUrl`.
2. In the form's Responses tab, click **Link to Sheets** → new spreadsheet.
3. In that sheet: **Extensions → Apps Script**, replace the code with
   `google-apps-script/rsvp.gs`, save, pick `setup` and click **Run**
   (allow the permissions it asks for).
4. **Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*.
   Put the web-app URL in `rsvpSheetUrl`.

Set `NOTIFY` in the script to get an email for every RSVP.

## Free hosting: GitHub Pages

1. Create a free GitHub account.
2. Create a repository, e.g. `wedding-invitation`.
3. Upload all files in this project.
4. Go to Settings -> Pages.
5. Select `Deploy from a branch`.
6. Select branch `main` and folder `/ (root)`.
7. Save.


Your free URL will look like:

    https://YOUR_USERNAME.github.io/wedding-invitation/

No custom domain is required, so the total hosting cost can be ₹0.

## Project structure

    wedding-invitation/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── script.js
    ├── images/
    │   ├── hero.png / hero.webp   (envelope)
    │   ├── eng.jpeg               (couple's photo)
    │   ├── palace.jpg             (hero scene)
    │   ├── venue.jpg
    │   └── og.jpg                 (share preview)
    └── music/
        └── wedding.mp3

## Notes

- The site is static and needs no server.
- Fully responsive — designed mobile-first, comfortable on phones, tablets
  and desktops; honours `prefers-reduced-motion`.
- Google Maps is just an external link.
- Google Forms can handle RSVP without a backend.
- GitHub Pages provides HTTPS automatically.
- For ₹0, use the `github.io` URL instead of purchasing a custom domain.
