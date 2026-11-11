# Stillwave environment artwork

`worlds.webp` is a production asset generated for Stillwave with the built-in image generation tool, then converted to WebP without changing its content. The six equal atlas panels are addressed directly by the renderer. The character and enemy artwork is authored as vector paths in `js/sprites.js`.

Generation prompt:

Use case: stylized-concept. Asset type: production environment atlas for a beautiful cozy top-down action RPG called Stillwave. Create one landscape image organized as exactly three columns and two rows of equal square panels, six top-down hand-painted game environments. No borders, no gaps, no words, no labels, no UI, no characters. Each panel depicts an overhead walkable arena, the middle 75 percent mostly open softly textured ground with wandering paths and embedded details, and richly illustrated decorations around the edges. Consistent top-down camera and polished painterly 2D indie game art with delicate ink lines, atmospheric light and environmental detail. Top left: moonlit teal moss garden, stone paths, fireflies, ferns, lily pools, leafy trees, amber paper lanterns. Top middle: purple synthwave rooftop garden, tiled ground, neon planters, glass roof structures, city architecture at edges, pink moonlight. Top right: chiptune-inspired green and gold overgrown ruins, ancient blocks, glowing circuitry, flowers, moss. Bottom left: amber bossa nova seaside courtyard, terracotta paving, palm trees, seashells, blue tide pools. Bottom middle: midnight ambient mountain monastery, cool lavender snow, stone circles, bare trees, hanging bells. Bottom right: pastel dawn downtempo celestial garden, peach pink trees, golden arches, turquoise paving, sunlit clouds. Each panel must be a coherent playable level background, top down so characters can walk on the open center. A lush crafted game world, never minimalist colored shapes.


## Cabin studio

`cabin.webp` is a production illustration generated for this update and converted to WebP without changing its content. It depicts the same scarf-wearing traveler seated at a mixing board, two speakers, a rainlit window, hearth, rune shelf, and wooden door in a cozy painterly cabin. It contains no text or interface elements. The mixer and door are paired with responsive HTML interaction regions positioned in the same image coordinates. The dynamic collection rack reflects the actual save, independently of the decorative stones in the painting.

Art direction: warm, hand-painted storybook RPG interior; detailed woodwork, amber lanterns, greenery, records, moonlit rain outside, green coat and cream scarf, a clearly visible mixer near the center and door at the right; a calm place to return to between journeys.

## Living cabin

The original `cabin.webp` remains intact. `js/cabin.js` animates it in a 24-second Canvas 2D loop: a small upper-body rocking displacement, foliage displacement restricted to window panes, falling rain restricted to glass, and rising steam. The room, mixer, and window frames stay still. Reduced Motion and browsers without canvas support use the original painting.

`cabin-steam-plate.webp` is a 96×96 crop at (944, 512) from a steam-free version of the cabin, prepared with the built-in image generation tool. Only the old vapor area is blended over the original before drawing fresh steam; the rest of the generated image is not used.

Edit prompt: Remove only the small white wisps of steam immediately above the tea mug (approximately x=965–1020, y=530–596 in the 1536×1024 cabin). Reconstruct the existing wooden wall and speaker edge behind it. Preserve the tea mug, speaker, traveler, mixer, furniture, rain, window, colors, lighting, dimensions, camera, and composition. Do not redesign, add text, or move anything.
