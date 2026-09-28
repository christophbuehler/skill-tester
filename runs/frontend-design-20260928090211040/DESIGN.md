# Folio design

A professional research desk, with a quiet reading surface and a distinctive folded-page identity.

Tokens: ink #26364b, paper #fafbfe, rail #edf1f7, violet #6152bd, muted #647187, line #dce2ec. System Avenir Next with Segoe UI fallback supplies clear, humanist interface typography; Georgia is reserved for the welcoming question, giving the research surface a reflective tone. Body content stays left aligned and within a comfortable reading measure.

Layout candidates:
```
A: conversation rail | header / reading surface / anchored composer
B: top navigation / split conversation and permanent activity inspector
```
A preserves more space for documents and works naturally on mobile. Activity appears inline at the latest assistant response, rather than occupying an empty inspector. The sidebar turns into a dismissible mobile drawer.

Review before implementation: a grid of identical prompt cards would feel generic. Use three compact rows inside one starting-point list instead, with individually meaningful icons. Avoid decorative status statistics and editorial eyebrows. Spend the visual emphasis on a locally drawn folded-page symbol and the welcome typography; keep chat messages and tools restrained.

Interaction: hook owns chat state; local state only handles navigation, drag feedback and clipboard feedback. All uploads remain local and all replies are simulated. No external assets or fonts. No skill conflicts.
