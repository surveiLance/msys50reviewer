# Learn by doing — implementation plan

The owner wants creative, concrete explanations across Modules 1–5 and has already asked to implement directly rather than pause for mockups. Their latest screenshot shows the dense full-notes analysis table.

Use the existing Next/React/CSS stack. Add original interactive teaching examples grounded in the existing checked notes; keep the exhaustive source notes and quiz banks intact. No new dependencies or backend changes.

1. Add a catalog of visual experiences with exact full-notes destinations, plus tested section lookup and operating-model/analysis state derivation. Every supplied part gets an experience; dense topics get additional ones.
2. Build native-button, keyboard-accessible visual scenes: campus connections, alignment links, live city changes, management tools, branch simulator, initiative requests, dependency failures, stakeholder lenses, MDA transformation, ADM orbit, CSVLOD artifact desk, analysis experiment, zoom, viewpoint scope, and service tracing. Prefer objects/relationships and actions over tables or paragraph cards.
3. Add one shared experience reader as the default for all five modules. Preserve source hash navigation; add contextual Explore buttons within the memoized full-notes body. Retain the earlier Module 5 step explanations as an optional secondary path.
4. Verify real state transitions in the browser, deep links and full-notes return, phone overflow, keyboard focus, light/dark. Run the complete test suite and production build. Obtain an independent read-only review, fix material findings, commit and push, and verify Vercel live.

Source limits: teaching analogies are labeled. Illustrative effects are not empirical claims. CSVLOD draws its 24 subtypes directly from the existing checked catalog; no popularity is invented for Analytical Reports. Analysis result (functional/quantitative) and approach (analytical/simulation) stay independent. Requirements management stays central throughout ADM. Existing scores, test settings, and stored attempts remain unchanged.

## Implementation and checks

- 18 experiences cover all 14 supplied parts. These are explanatory entry points, not a replacement for complete assigned coverage. The full source HTML and all question banks are unchanged.
- Full notes now provide a contextual Explore action in each section. The nearest experience in that same part is selected; not every individual section has its own scene. Module 5's earlier step-by-step explanations remain an optional path.
- Branch rules/data are independent switches. The analysis toy has fixed invented waits and an eligibility branch, so functional reasoning/run behavior can be distinguished from deriving/observing a numerical result. It is explicitly not a real performance model.
- Independent read-only review found stale global return navigation and destination-focus loss. Both corrected. Later-part pending source anchors now wait for the correct part to mount. Regression tests cover source destination selection, keyboard-focusable note headings, and real direct-link scroll targets.
- Browser checks: all four branch models; analysis question/approach changes; source section Explore; later-part notes focus and Back; current-part return; CSVLOD subtype switching and unlabeled popularity; ADM phase C; campus change/alignment; dependency outage; stakeholder lens; MDA platform change; SOA cutaway; refinement; service relations. Checked 390px page bounds, phone ADM/spotlight/campus layouts, and light/amber as well as default dark. Temporary viewport override reset.
