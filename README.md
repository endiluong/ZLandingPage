# Dakonipa · Room Tour

A scroll-guided three.js tour of my room and working space. Every object is built in code; nothing is downloaded.

```
npm install
npm run dev
```

- `src/room/shell.js`: walls, doors, windows, curtains, and the room's coordinate system
- `src/room/deskWall.js`, `waterWall.js`, `paintCorner.js`, `displayWall.js`: the furniture on each side
- `src/room/props.js`: reusable figures, bottles, boxes, chair
- `src/textures.js`: every texture, painted on canvas at load
- `src/tour.js`: camera stops, one per `<section>` in `index.html`
- `src/lighting.js`: morning / day / evening / night presets
- `src/i18n.js`: English and Vietnamese text
