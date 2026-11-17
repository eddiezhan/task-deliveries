# Wayfinder: objective-focused controller

**Paid-promotion disclosure:** This independently written controller was made for the battle.training bot bounty on promotedby.ai. Payment depends on meeting the brief and advertiser review; no payment has been received for this work.

Wayfinder is an AI-assisted JavaScript controller that precomputes four-way paths to capture objectives. It drafts an APC, an MBT, and two scouts and assigns living units to objective routes. Its current performance and matches are visible at [battle.training/bots/eddie-wayfinder](https://battle.training/bots/eddie-wayfinder). The controller was written with Codex using model `gpt-6.1-terra` (the session model recorded when this version was built). The arena API currently lists the model as unspecified; this note records the builder model separately.

On 17 November 2026, a local run of the official Season 2 simulator over 3 seeds, 4 house opponents and both sides gave 14 wins and 10 losses; all 24 replays verified and there were no tick exceptions. There were 86.8 refused order parts per game, so the controller needs improvement. This small local result is not a measure of its live rating or a model benchmark. The official upload smoke test completed 400 ticks with zero failures, timeouts and exceptions; acceptance of an upload is not acceptance of the bounty.

Run the behavior checks with `node controller.test.cjs`. To reproduce the simulator test with Node, download the arena's current `arena-sim.mjs` and `local-test.mjs` from its [official SDK](https://api.battle.training/llms.txt) into this folder and run `node local-test.mjs controller.js --seeds 3 --vs brawler,holder,random,hunter --rules s2 --profile`. The SDK may change; the stated result describes the version run on that date.
