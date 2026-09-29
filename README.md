# Free Wedding / Engagement Invitation

An original HTML/CSS/JavaScript invitation inspired by premium Indian wedding invitation websites.

It is not Aarambh Invites' source code and does not include their photos, artwork, logo, or proprietary assets.

## Run locally

No build step is required.

From this folder run:

    python3 -m http.server 8000

Then open:

    http://localhost:8000

## Customize

Edit `js/script.js` and change the `WEDDING` object:

- groom
- bride
- dateText
- message
- story
- countdownTarget
- venue
- address
- mapsUrl
- rsvpUrl
- events
- gallery

## Replace images

Put your own images in `images/` with these names:

    hero.jpg
    couple.jpg
    venue.jpg
    countdown.jpg
    photo-1.jpg
    photo-2.jpg
    photo-3.jpg
    photo-4.jpg

## Music

Put your own appropriately licensed MP3 at:

    music/wedding.mp3

Music starts after the visitor clicks Open Invitation because browsers commonly block autoplay with sound.

## RSVP for ₹0

Create a Google Form, copy its public URL, and put it in `rsvpUrl`.

Responses can be collected in Google Sheets. No backend or database is required.

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
    │   ├── hero.jpg
    │   ├── couple.jpg
    │   ├── venue.jpg
    │   ├── countdown.jpg
    │   ├── photo-1.jpg
    │   ├── photo-2.jpg
    │   ├── photo-3.jpg
    │   └── photo-4.jpg
    └── music/
        └── wedding.mp3

## Notes

- The site is static and needs no server.
- Google Maps is just an external link.
- Google Forms can handle RSVP without a backend.
- GitHub Pages provides HTTPS automatically.
- For ₹0, use the `github.io` URL instead of purchasing a custom domain.
