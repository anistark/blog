---
layout: post
title: N Reviewers Walk Into a PR...
excerpt: How many people should review this PR? I built a GitHub Action that answers that question automatically. No more guessing, no more guilt-assigning three reviewers on a Friday.
date: 2026-04-02
updatedDate: 2026-04-04
featuredImage: /images/posts/n-reviewers-walk-into-a-pr-2.png
draft: false
tags:
  - post
  - github
  - open-source
  - devtools
  - automation
---

## A Story You've Lived

It's 4:47 PM. You open a pull request. It touches 12 files across 3 directories. CI is green. You tag one reviewer (the person who happens to be online) and close your laptop.

Three days later, a bug makes it to production. Your reviewer missed a subtle interaction between two of those 12 files. Not their fault. They were one human reading a diff the size of a short story. In hindsight, a second pair of eyes would've caught it in five minutes.

Sound familiar? Yeah, me too.

The question _"how many reviewers does this PR actually need?"_ is one every engineering team answers by vibes. Small PR? One reviewer. Massive PR? Also one reviewer, because nobody wants to be _that person_ who requests three reviews on a Friday afternoon.

Here's the thing: **vibes don't scale**. Teams grow. Codebases get gnarlier. PRs stack up. And the cost of under-reviewing compounds silently... right up until it very loudly doesn't.

## The Tools Available (And Why They Fall Short)

GitHub gives you a decent toolkit for review workflows:

- **Branch protection rules**: require a minimum number of approvals. But it's a flat number. A one-line typo fix and a 2000-line refactor both need... 2 approvals? Really?
- **CODEOWNERS**: auto-assigns reviewers based on file paths. Tells you _who_, not _how many_. Great at "Alice owns the frontend" but useless at "this PR is big enough to need Alice _and_ Bob."
- **[actions/labeler](https://github.com/actions/labeler)**: GitHub's official labeling action. Labels PRs by file paths and branch names (`frontend`, `docs`, `feature`). Super useful, but it has zero concept of change _size_ or review _effort_.

None of these answer the fundamental question: _for this specific PR, with these specific changes, how many humans should look at it?_

## Enter: PR Reviewer Labeler

So I built [pr-reviewer-labeler](https://github.com/anistark/pr-reviewer-labeler), a GitHub Action that looks at every PR and figures out the ideal number of reviewers. Automatically. No vibes required.

Here's what it does:

1. Counts total lines changed (additions + deletions)
2. Optionally weighs different file types differently (because 100 lines of tests ≠ 100 lines of auth middleware)
3. Maps the result against configurable thresholds
4. Slaps a label on the PR (`reviewers: 2`) and drops a summary comment

Think of it as a bouncer for your PR queue. "This PR is a 500-liner touching core auth? Yeah, you're gonna need at least 3 reviewers. Next!"

### Zero-Config Setup (Seriously, It's This Easy)

```yml
name: Reviewer Labeler
on:
  - pull_request_target

jobs:
  label:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: anistark/pr-reviewer-labeler@v1
```

That's it. Out of the box, it uses these defaults:

| Lines Changed | Reviewers You'll Get |
|---------------|---------------------|
| < 50          | 1 (quick glance)    |
| 50-199        | 1 (solid read)      |
| 200-499       | 2 (buddy system)    |
| 500-999       | 3 (bring friends)   |
| 1000+         | 4 (all hands)       |

Every PR gets labeled and commented. No config files to maintain. No YAML rabbit holes. Just plug and play.

### Your Team, Your Rules

Of course, a team of 3 doesn't need the same scale as a team of 20. Tune the thresholds to your taste:

```yml
- uses: anistark/pr-reviewer-labeler@v1
  with:
    thresholds: |
      - lines: 30
        reviewers: 1
      - lines: 150
        reviewers: 2
      - lines: 400
        reviewers: 3
      - lines: 800
        reviewers: 4
```

### Not All Lines Are Born Equal

Here's where it gets fun. A 500-line PR that's mostly test files? Probably fine with 2 reviewers. A 500-line PR rewriting your payment processing? You might want the whole team in the room.

File-type weighting lets you express this:

```yml
- uses: anistark/pr-reviewer-labeler@v1
  with:
    file-weights: |
      - glob: "**/*.test.*"
        weight: 0.5
      - glob: "**/*.md"
        weight: 0.25
      - glob: "src/core/**"
        weight: 1.5
```

Translation:
- **Tests** count at half. Important, but rarely where the sneaky bugs hide
- **Docs** count at quarter. A README typo doesn't need a 3-person review committee
- **Core source** counts at 1.5x. This is where you want extra eyeballs

The action calculates both raw and weighted line counts, so you always see the full picture.

## What Happens Under the Hood

For the curious (I see you), here's the flow:

1. **Fetch changed files**: hits the GitHub API to get every file in the PR with its additions and deletions
2. **Weigh the lines**: each file gets matched against your glob patterns. Match found? Multiply by the weight. No match? Weight of 1.0. Business as usual
3. **Pick the reviewer count**: walks through your thresholds (sorted lowest to highest) and finds the right tier
4. **Label the PR**: removes any stale reviewer labels from previous runs, applies the fresh one. Your PR always shows the current recommendation
5. **Drop a comment**: posts a clean summary table. If it already commented before, it updates the existing one. No spam. No duplicates

Push more commits? The label and comment update automatically. It's fully idempotent, a fancy way of saying "it won't make a mess."

### Wire It Into Your Workflow

The action exposes outputs you can chain into other steps:

```yml
steps:
  - id: reviewers
    uses: anistark/pr-reviewer-labeler@v1

  - if: steps.reviewers.outputs.reviewer-count >= 3
    run: echo "Big PR detected. Maybe consider splitting this one up."
```

Available outputs: `reviewer-count`, `total-lines`, `weighted-lines`, and `label`. Build whatever automation you want on top.

## Best Friends With actions/labeler

This isn't a replacement for [actions/labeler](https://github.com/actions/labeler). It's the other half of the story. They answer different questions:

| Action | Answers | Example Labels |
|--------|---------|---------------|
| `actions/labeler` | _What_ changed? | `frontend`, `docs`, `feature` |
| `pr-reviewer-labeler` | _How much_ changed? | `reviewers: 2`, `reviewers: 3` |

Run them together:

```yml
steps:
  # What changed?
  - uses: actions/labeler@v6

  # How much changed?
  - uses: anistark/pr-reviewer-labeler@v1
```

Now a PR labeled `frontend` + `reviewers: 1` paints a very different picture than `frontend` + `reviewers: 3`. Context at a glance.

## The Roadmap (a.k.a. "I Have Ideas")

This is v1. It handles the core job well: sizing PRs and recommending reviewer counts. But I'm just getting started.

### CODEOWNERS Integration

Right now it tells you _how many_. Next up: _who_. Imagine the action reading your `CODEOWNERS` file and suggesting "This PR needs 2 reviewers: @alice (owns `src/auth/`) and @bob (owns `src/api/`)." That's the dream.

### Complexity Scoring

Line count is a solid start, but it's not the whole story. A 200-line change in one file hits different than 200 lines scattered across 15 files in 8 directories. I want to factor in:

- How many directories the PR touches
- New files vs edits to existing ones
- Whether the change spans architectural layers (frontend + backend + infra = buckle up)

### Auto-Request Reviewers

The endgame: don't just _suggest_ reviewers. _Assign_ them. Pick from a configured pool, skip the PR author, respect existing assignments. Full automation, zero friction.

All of these are tracked as [open issues on GitHub](https://github.com/anistark/pr-reviewer-labeler/issues).

![This is where you come in](/images/posts/erwin-this-is-where-you-come-in.png)

I built this to scratch my own itch, but I know every team's review culture is different. Maybe you need reviewer recommendations based on commit count, not line count. Maybe you want Slack notifications when a PR needs 3+ reviewers. Maybe you have an idea I haven't thought of yet.

I'd love to hear it.

- **Try it out**: install from the [GitHub Marketplace](https://github.com/marketplace/actions/pr-reviewer-labeler) or just add `anistark/pr-reviewer-labeler@v1` to your workflow
- **Open an issue**: feature requests, bug reports, wild ideas, all welcome at [github.com/anistark/pr-reviewer-labeler/issues](https://github.com/anistark/pr-reviewer-labeler/issues)
- **Send a PR**: the codebase is small, TypeScript, well-tested, and MIT licensed. Jump in
- **Star the repo**: if you think this should exist, let me know with a star. It helps others find it too

{% githubCard "anistark/pr-reviewer-labeler" %}

Because no PR should go under-reviewed just because someone didn't want to bother a third person on a Friday.
