---
layout: post
title: Same skill, different model
excerpt: A skill that works beautifully on Opus can quietly fall apart on Haiku, and the reverse happens too. What two 2026 skill studies and the earlier prompt-sensitivity papers say about why, with numbers, and how to find out where your own skill holds up.
date: 2026-10-10
updatedDate: 2026-10-10
featuredImage: /images/posts/same-skill-different-model-cover.svg
socialImage: /images/posts/same-skill-different-model-cover-og.png
draft: true
tags:
  - post
  - ai
  - research
  - llm
  - agents
  - agentic-ai
  - agent-skills
  - sutras
  - evals
  - claude-code
---

A few months ago, I wrote a few skills which was working flawlessly, until last couple of weeks when I realised they're not quite what I wrote earlier. It might be cause perhaps my taste has changed or perhaps I want to enhance it now that models are more capable and Opus 5.5 consumes less tokens than Fable 5.1 for similar output. So, I set out to check if other skills are also behaving similar.

It's actually crazy that the same skill don't work as good anymore. Ignores instructions, does things by itself, and so on... Tell me if you've faced similar situation before:

You write a skill. You test it on whatever model you happen to be using that week. It loads when it should, it does the thing, you're happy. You publish it.

Then someone runs it on a different model.

Maybe it never loads. Maybe it loads for every request, including "what's 2 + 2". Maybe it loads, reads your carefully written instructions, and then does its own thing anyway. You will never find out, because nobody opens an issue that says _"your skill is 30 points worse on my model."_ They just stop using it.

_"Works on my model" is the new "works on my machine."_

And it isn't some rare edge case. A skill is a prompt with a filename, and prompts have always been tuned, whether you meant it or not, to the model they were written against. What's changed is how many models a single skill now meets. Different vendors, different sizes, different effort settings, and a new generation every few months. The model you wrote it for is rarely the only model it runs on.

So let's look at why this happens and what has actually been measured: two 2026 studies that tested agent skills directly, and the prompt-sensitivity work that came before them. Then how you can find out where your own skill holds up instead of guessing.

![One SKILL.md flowing into Opus 5.5, Sonnet 5.5 and Haiku 4.5, with a question mark where each outcome should be](/images/posts/same-skill-different-model.svg)

## Two ways a skill breaks

Before reading a single paper, it helps to be precise about what "doesn't work on another model" even means. A skill can fail in two completely different places.

![A decision tree: a request arrives, the skill is relevant or not, it loads or not, and if it loads it is followed or ignored. Five outcomes, three of them failures](/images/posts/same-skill-failure-modes.svg)

**Triggering.** The model only sees your skill's name and description up front. From that alone, it decides whether to load the rest. Load it too rarely and your skill is dead weight. Load it too eagerly and it hijacks requests it has no business touching.

**Execution.** Once loaded, does the model actually follow what you wrote? Or does it skim, nod, and fall back to its own defaults?

Both of these depend on the model. And this isn't me speculating. Here's Anthropic, in their own prompting guide:

> If your prompts were designed to reduce undertriggering on tools or skills, these models may now overtrigger. The fix is to dial back any aggressive language. Where you might have said "CRITICAL: You MUST use this tool when...", you can use more normal prompting like "Use this tool when...".

Read that again. A skill description that was written to shout its way into triggering on one generation of models can trigger too eagerly on the next generation **from the same company**. Now spread that across vendors, sizes and harnesses.

## What's actually been measured

None of this is new. It's the oldest problem in prompting, wearing a new jacket. What's new is that this year, papers started measuring it on skills directly. Two of them are the backbone of this post.

So there are two kinds of evidence here, and it's worth keeping them apart:

- **Measured on skills directly.** [Shaposhnikov et al.](https://arxiv.org/abs/2606.17819) ran 500 real skills across 19 agent-model configurations. [SkillsBench](https://arxiv.org/abs/2602.12670) ran 87 tasks with and without curated skills across 18 model-harness setups.
- **Measured on prompts and agents in general.** [Sclar et al.](https://arxiv.org/abs/2310.11324), [Lu et al.](https://arxiv.org/abs/2104.08786), [Mizrahi et al.](https://aclanthology.org/2024.tacl-1.52/), [Wei et al.](https://arxiv.org/abs/2303.03846), [McKenzie et al.](https://arxiv.org/abs/2306.09479) and [Yao et al.](https://arxiv.org/abs/2406.12045) studied prompts, few-shot examples and tool-using agents, not skills.

The second group carries over for a simple reason: everything a model sees of your skill is prompt text. The description that decides whether it loads, and the instructions it follows once it does. When a finding below comes from that second group, I'll say so, because that link is my inference, not something those authors tested.

Across these eight papers, five patterns show up.

### 1. Prompts are tuned to a model, not to a task

_Evidence: Sclar et al. 2024, Lu et al. 2022, Mizrahi et al. 2024. Measured on prompts in general._

The cleanest result here is from [Sclar et al.](https://arxiv.org/abs/2310.11324) (ICLR 2024). They changed nothing about a prompt's meaning, only its formatting. Separators, casing, spacing. On LLaMA-2-13B, that alone moved accuracy by **up to 76 points**. Bigger models didn't fix it. More examples didn't fix it. Instruction tuning didn't fix it.

The line that matters for us is further down the abstract:

> We also show that format performance only weakly correlates between models.

So the best formatting for one model tells you very little about the best formatting for another.

[Lu et al.](https://arxiv.org/abs/2104.08786) (ACL 2022) found the same thing with the _order_ of few-shot examples, which could swing a model between "near state-of-the-art and random guess performance." And bluntly: _"a given good permutation for one model is not transferable to another."_

[Mizrahi et al.](https://aclanthology.org/2024.tacl-1.52/) (TACL 2024) scaled it up. 6.5 million instances, 20 models, 39 tasks. Their finding: _"different instruction templates lead to very different performance, both absolute and relative."_ Relative is the scary word there. Rewording a prompt doesn't just shift scores, it reshuffles which model looks best.

_The wording you polished on Opus is polished for Opus._

### 2. Models don't follow instructions equally

_Evidence: Shaposhnikov et al. 2026, measured on skills directly. Plus OpenAI's GPT-4.1 guide, which is vendor documentation rather than a study._

This is the first pattern measured on skills specifically. [Shaposhnikov et al.](https://arxiv.org/abs/2606.17819) (June 2026) built tasks out of **500 real-world skills**, generated **1,000 tasks** from their content, and ran them across **19 agent-model configurations**. Then they scored how closely each model actually followed the skill.

![Horizontal bar chart of instruction-following scores with a skill loaded: Opus 4.8 88.0, Opus 4.7 87.7, GLM 5.1 85.0, Kimi K2.6 60.1, Nemotron Super 120B 46.8, Nemotron Nano 30B 25.2](/images/posts/same-skill-instruction-following.svg)

| Model | Instruction-following score (skill loaded) |
| --- | --- |
| Opus 4.8 | 88.0 |
| Opus 4.7 | 87.7 |
| GLM 5.1 | 85.0 |
| Kimi K2.6 | 60.1 |
| Nemotron Super 120B | 46.8 |
| Nemotron Nano 30B | 25.2 |

That's a **62.8 point** gap between the top and the bottom, on the same skills. Access to a relevant skill improved every model they tested, with gains of 5.5 to 22 points depending on the model. But not evenly. Kimi K2.6, a recent and capable model, got only a 7.1 point boost. The paper's read is that it _"fails to capitalize on access to the skill."_

And one detail I didn't expect: _"the relative impact of skills is larger for smaller models than for bigger ones,"_ visible in Haiku and Sonnet versus Opus.

There's also the question of how literally a model reads you. OpenAI's [GPT-4.1 prompting guide](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide) says it plainly:

> GPT-4.1 is trained to follow instructions more closely and more literally than its predecessors, which tended to more liberally infer intent from user and system prompts.

So the same words land differently. Older and looser models infer what you meant. Newer and more literal ones do what you wrote. A skill that relied on the model "getting it" breaks on a literal reader. A skill that shouts breaks on a responsive one. You can't write one set of words that is perfectly tuned for both, at least not without checking.

### 3. Bigger models can be talked out of their habits

_Evidence: Wei et al. 2023, McKenzie et al. 2023. Measured on in-context examples and benchmark tasks, not skills. The connection to skills below is my inference._

[Wei et al.](https://arxiv.org/abs/2303.03846) showed something that maps closely onto what a lot of skills ask for. They gave models in-context examples that deliberately contradicted what the model already knew, like flipped labels. Small models _"ignore flipped labels presented in-context and thus rely primarily on semantic priors from pretraining."_ Large models _"can override semantic priors."_

A lot of good skills are exactly this. "Don't do it the usual way, do it our way." Our commit format. Our review checklist. Our weird deploy process. If your skill asks for non-default behaviour, there may be a model size below which it simply doesn't stick.

But bigger isn't automatically safer either. The [Inverse Scaling](https://arxiv.org/abs/2306.09479) work found tasks where larger models get _worse_, and two of their four causes read like skill failure modes: a _"preference to repeat memorized sequences over following in-context instructions,"_ and tasks with _"an easy distractor task which LMs could focus on, rather than the harder real task."_

### 4. Skills help on average, and hurt in specific places

_Evidence: SkillsBench v4 (Li et al., 2026). Measured on skills directly._

[SkillsBench](https://arxiv.org/abs/2602.12670) is the most direct measurement of skills I've found. The current version (v4, June 2026) has **87 tasks across 8 domains**, each with curated skills and deterministic verifiers, run with and without skills across **18 model-harness setups**.

On average, curated skills lifted the pass rate from **33.9% to 50.5%**. That's +16.6 points. Great headline. Now look at the spread.

![Diverging bar chart of change in pass rate versus no skill: curated best setup +25.7, curated average +16.6, curated weakest setup +4.1, self-generated with Claude Code and Opus 4.7 -8.1, self-generated with Codex and GPT-5.5 -11.3 percentage points](/images/posts/same-skill-skillsbench.svg)

- The best setup (OpenHands + GLM 5.1) gained **+25.7** points. The weakest gained **+4.1**. Same skills, same tasks.
- **13 of the 87 tasks got worse** with curated skills. The reasons they give are painfully familiar: _"the Skill prescribes an unnecessarily heavyweight pipeline, displaces a stronger default strategy, or points the agent at a solver it cannot debug."_
- Skills that the model wrote for itself landed **below the no-skill baseline** on all three setups they tried. −8.1 points on Claude Code + Opus 4.7, −11.3 on Codex + GPT-5.5.
- Focused skills with at most three modules beat larger, exhaustive bundles.
- And, from the abstract: _"smaller models with Skills can match larger models without them."_

The gains also depend heavily on the domain:

| Domain | Gain from curated skills |
| --- | --- |
| Natural Science | +28.8 pp |
| Media & Content Production | +24.1 pp |
| Cybersecurity | +18.9 pp |
| Software Engineering | +11.6 pp |
| Mathematics & OR | +9.7 pp |

_"Displaces a stronger default strategy"_ is the whole post in four words. A skill written to prop up a weaker model can actively get in the way of a stronger one.

The self-generated result deserves a moment too. Writing a skill with a model and calling it done is not a test. On the setups they measured, it was worse than no skill at all.

### 5. One run tells you nothing

_Evidence: τ-bench (Yao et al., 2024). Measured on tool-using agents rather than skills, but a skill run is exactly that kind of agent run._

Agents are stochastic. [τ-bench](https://arxiv.org/abs/2406.12045) made this concrete with `pass^k`, the chance an agent succeeds on _all_ of k tries at the same task. Their finding was that strong function-calling agents like gpt-4o _"succeed on <50% of the tasks, and are quite inconsistent (pass^8 <25% in retail)."_

So if you ran your skill once on Haiku and it worked, you know almost nothing. If it failed once, you also know almost nothing.

### All of it in one table

| Pattern | Source | Measured on | Headline number | What it means for your skill |
| --- | --- | --- | --- | --- |
| Formatting sensitivity doesn't transfer | Sclar et al., 2024 | prompts | up to 76 points from formatting alone | Wording tuned on one model is tuned for that model |
| Good orderings don't transfer | Lu et al., 2022 | few-shot prompts | near SOTA to random guess | Examples in your skill are model-specific too |
| Rankings reshuffle with wording | Mizrahi et al., 2024 | prompts | 6.5M instances, 20 models, 39 tasks | Test more than one phrasing of a request |
| Instruction following varies a lot | Shaposhnikov et al., 2026 | **skills** | 88.0 vs 25.2 on the same skills | Some models will read your skill and ignore it |
| Big models override priors, small ones don't | Wei et al., 2023 | in-context examples | qualitative, flipped labels | Non-default workflows may need a minimum model size |
| Skills can hurt | SkillsBench v4, 2026 | **skills** | 13 of 87 tasks worse, self-written skills −8 to −11 pp | Always compare against a baseline, never assume |
| Agents are inconsistent | Yao et al., 2024 | tool-using agents | pass^8 < 25% in retail | Run every case several times |

## Find out where your skill holds up

Reading all of that is one thing. Knowing how _your_ skill behaves on the models people will actually use is another. That's what [`sutras bench`](https://github.com/anistark/sutras) is for. It runs your skill against several models, the same way, several times, and shows you where it holds up, where it stops loading, and where it loads but gets ignored.

Its design follows from those five patterns. Run the same skill on several models, more than once, separate triggering from execution, grade it against something real, and compare everything to a baseline.

![The sutras bench pipeline: discover models, estimate cost, an approval gate, a round-robin run matrix of models by cases by runs, grading on trigger, assertions and a rubric judge, then reports, a recorded compatibility summary and the registry index](/images/posts/same-skill-bench-pipeline.svg)

You describe cases in your skill's `sutras.yaml`:

```yaml
bench:
  baseline: claude-opus-5-5
  models: [claude-opus-5-5, claude-sonnet-5-5, claude-haiku-4-5]
  runs: 5
  max_regression: 0.10      # flag models >10 points below the baseline
  max_cost: 10.00
  cases:
    - name: greet-alice
      prompt: "Please greet Alice"
      workspace: bench/hello
      assert:
        - type: file_contains
          path: greeting.txt
          text: "Hello, Alice!"
      rubric:
        - Does not modify README.md

    - name: unrelated
      prompt: "What is 2 + 2?"
      should_trigger: false   # the skill must stay quiet here
```

Then you ask it what it would do. This is a real `--dry-run` on that sample skill, nothing edited:

```sh
sutras bench greeter --dry-run
```

```text
Bench: greeter

Runtime:   Claude Code 2.1.289 (headless) · models from Claude Code aliases
Models:
  [x] claude-opus-5-5     $4 / $20 per MTok   (baseline)
  [x] claude-sonnet-5-5   $2 / $10 per MTok
  [x] claude-haiku-4-5    $1 / $5 per MTok
  [ ] claude-fable-5-1    $10 / $50 per MTok
Plan:      2 case(s) × 2 run(s) × 3 model(s) = 12 runs + 6 judge calls (claude-opus-5-5)
Estimate:  $1.19 – $10.37   (heuristic: approximate token counts; turns and output assumed)
Cap:       $3.00 — no run starts if it could exceed the cap
Commands:  run in the sandbox after each session:
             test -f greeting.txt
Note:      Install 'sutras[bench]' to list the models your API credentials can use
           Costs are API-equivalent estimates; on a Claude subscription, runs draw from your plan's usage limits.
```

Each design decision maps back to a specific source:

| Finding | Source | So `sutras bench`... |
| --- | --- | --- |
| Skills overtrigger or undertrigger depending on the model | Anthropic prompting guide | reports **trigger rate** separately, and supports `should_trigger: false` cases to catch overtriggering |
| Models follow the same skill very differently once loaded | Shaposhnikov et al. | reports **pass rate** separately from trigger rate |
| Curated skills made 13 of 87 tasks worse | SkillsBench | compares every model against a **baseline** and exits non-zero on a regression past `max_regression` |
| pass^8 under 25% for a strong agent | τ-bench | runs every case **several times** and reports rates, not verdicts |
| Gains ranged from +4.1 to +25.7 pp across model-harness setups | SkillsBench | holds the harness fixed (Claude Code) so the model is the only variable you change |
| The same text gets very different results from different models | Sclar et al., Mizrahi et al. | grades rubrics with one **fixed judge model**, since a grader is a model too |
| How literally a model reads instructions varies | OpenAI GPT-4.1 guide | accepts `model@effort`, so you can compare settings like `opus@low` and `opus@high`, not just models |

Each run gets a throwaway project with the skill installed at project level, and Claude Code is started with `--setting-sources project` and no MCP servers. Your personal skills, hooks and settings don't leak in. Otherwise you'd be measuring your laptop, not the skill.

Runs are also scheduled round-robin across models. If the budget runs out halfway, every model has the same coverage, so the partial results are still comparable. Small thing. Matters a lot when the alternative is "Opus got 20 runs and Haiku got 2."

### Sharing what you found

Results get saved per skill, and `--report md` writes a summary you can paste into a PR. When you're happy with a run, `sutras bench --record` writes a small compatibility block into `sutras.yaml`:

```yaml
compatibility:
  runtime: claude-code
  baseline: claude-opus-5-5
  results:
    claude-opus-5-5:   {pass_rate: ..., trigger_rate: ..., runs: 10}
    claude-haiku-4-5:  {pass_rate: ..., trigger_rate: ..., runs: 10, regression: ...}
```

That ships with the skill. `sutras info` shows it as "Tested on", the registry index picks it up, and `sutras validate` warns you the moment you edit `SKILL.md` and those results go stale. Because a compatibility claim about a file you've since changed is just a nice-looking lie.

All the numbers in this post come from the papers referenced below, each cited where it appears. None of them are from my own runs. `sutras bench` has only been through dry runs so far, and live cross-model results on real skills are next.

Right now, I don't have a way to make a skill properly portable across models. `sutras bench` can show you where yours breaks, but it can't fix it for you. I'm working on that part.

If you'd like to help figure it out, whether that's ideas, issues, or PRs, come say hi. 🫶

{% githubCard "anistark/sutras" %}

## References

1. Sclar, Choi, Tsvetkov, Suhr. _Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design or: How I learned to start worrying about prompt formatting._ ICLR 2024. [arXiv:2310.11324](https://arxiv.org/abs/2310.11324) · [FormatSpread code](https://github.com/msclar/formatspread)
2. Lu, Bartolo, Moore, Riedel, Stenetorp. _Fantastically Ordered Prompts and Where to Find Them: Overcoming Few-Shot Prompt Order Sensitivity._ ACL 2022. [arXiv:2104.08786](https://arxiv.org/abs/2104.08786)
3. Mizrahi, Kaplan, Malkin, Dror, Shahaf, Stanovsky. _State of What Art? A Call for Multi-Prompt LLM Evaluation._ TACL 2024. [ACL Anthology](https://aclanthology.org/2024.tacl-1.52/) · [arXiv:2401.00595](https://arxiv.org/abs/2401.00595)
4. Shaposhnikov, Fortuin, Stipcich, Gorinova, Heineike, Willoughby. _A Framework for Evaluating Agentic Skills at Scale._ 2026. [arXiv:2606.17819](https://arxiv.org/abs/2606.17819)
5. Wei et al. _Larger language models do in-context learning differently._ 2023. [arXiv:2303.03846](https://arxiv.org/abs/2303.03846)
6. McKenzie et al. _Inverse Scaling: When Bigger Isn't Better._ 2023. [arXiv:2306.09479](https://arxiv.org/abs/2306.09479)
7. Li et al. _SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks._ v4, 2026. [arXiv:2602.12670](https://arxiv.org/abs/2602.12670)
8. Yao, Shinn, Razavi, Narasimhan. _τ-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains._ 2024. [arXiv:2406.12045](https://arxiv.org/abs/2406.12045)
9. Anthropic. _Prompting best practices._ [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
10. OpenAI. _GPT-4.1 Prompting Guide._ [developers.openai.com](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide)
