# Original Diego Genuino engine

Upstream: https://github.com/DiegoGenuino/Sheila-Schefer-Advocacia
Pinned upstream commit/tree: 4b967ad1838cb3aa6b06419b1f600c68d8387126.
The user states Diego authorized reuse.

This directory contains the original repository, including its Astro components,
layout, styles, pages, GSAP scripts, and fonts. PROVENANCE.json records Git blob
hashes. The integration build and tests verify those hashes and fail on changes.

scripts/build-diego.mjs copies upstream to an ignored workspace and replaces only
src/config/site.ts with scripts/template-config.ts. Astro compiles the original
motor. The CRM serves the compiled standalone HTML at /preview/[slug], substituting
escaped data slots, content from Gemini and images from Apify. There is no iframe
containing the original Sheila site, no redesign in React, and no link to upstream
in a prospect preview. Existing preview URLs remain stable.

Generic image and SVG wordmark are used only when real assets are unavailable.
The original Sheila photos, name, OAB registration, quotes and contacts never enter
the personalized preview. The LocalBusiness JSON-LD is generated from lead data.
Review quotes and video sections remain disabled without source data. Public rating
and review count use the exact lead data. Gemini does not write executable code.

The website is a demonstration, not a claim of client approval. The preview is
noindex. Importing an Apify dataset does not grant image reuse rights; confirm
photos with the establishment before a final customer publication.
