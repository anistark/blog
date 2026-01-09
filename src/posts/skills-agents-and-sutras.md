---
layout: post
title: Skills, Agents, and the Missing Middle
excerpt: If you’ve been building with LLMs for a while, you’ve probably built an agent at some point.
date: 2026-01-09
updatedDate: 2026-01-09
featuredImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1767020247826/152bc5f6-6d2f-4d4d-8ac7-52666c09b559.png
tags:
  - post
  - ai
  - skills
  - llm
  - agentic-ai
  - agent-skills
  - sutras
---

If you’ve been building with LLMs for a while, you’ve probably built an agent at some point.

You give the model a role. You add a few tools. You maybe throw in memory, some planning logic, and a carefully tuned system prompt. It works. Until it doesn’t. And when it doesn’t, it’s usually hard to explain why.

At first, it’s tempting to blame the model. Or the prompt. Or the framework. But after building a few of these systems, a pattern starts to emerge: the problem isn’t reasoning, it’s structure.

## What We Actually Mean by “Skills”

When we talk about agent skills, we usually mean something very intuitive. A skill is something an agent can do. Search, summarize, classify, judge, decide, extract. These are the building blocks agents rely on to interact with the world.

In practice, though, most skills today don’t really exist as things of their own. They’re embedded inside prompts, scattered across tool wrappers, or tightly coupled to a specific agent loop. They’re hard to see, harder to test in isolation, and almost impossible to reuse cleanly.

We call them skills, but they behave more like side effects of prompt engineering.

Agents get most of the attention, but agents are mostly coordination. They decide what to do next and which capability to invoke. The actual behavior. The thing that produces correct or incorrect outcomes, lives inside the skills themselves.

If a skill is unreliable, the agent will be unreliable. If a skill improves, the entire system improves. Skills are the smallest unit of intelligence that actually moves the needle.

That suggests something important. If we want better agent systems, we need to take skills seriously as first-class artifacts. We need to be able to define them clearly, run them independently, measure how they behave, improve them over time, and reuse them across agents.

That’s still surprisingly rare.

%[https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills] 

One of the more promising directions here is the work around **Agent Skills**, particularly the way Anthropic has framed them. Treating skills as explicit, discoverable units instead of implicit prompt logic is a big step forward. It gives us a shared vocabulary and a starting point for interoperability.

But a specification alone isn’t enough. Knowing what a skill is doesn’t automatically tell you how to build one well, how to test it, or how to evolve it without breaking everything downstream.

This is where most real-world systems start to struggle. Most issues with agent systems aren’t caused by missing tools or clever reasoning tricks. They come from unmanaged skill lifecycle.

A skill gets tweaked. Something improves somewhere else. A regression sneaks in. No one knows which change caused it or why. Over time, skills accumulate complexity, but there’s no clear boundary where you can stop, inspect, and say: “This thing works, and here’s how we know.”

Without that boundary, iteration becomes guesswork.

## Introducing Sutras

%[https://github.com/anistark/sutras] 

This is the gap **Sutras** is trying to fill.

Sutras help build skills which are a concise, structured, executable unit of capability. It has a clear interface. It can be run on its own. Its behavior can be measured. And it has a lifecycle that doesn’t depend on a specific agent or framework.

Sutras builds on the emerging agent skill model, but shifts the focus to everything that happens around invocation: authoring, validation, evaluation, iteration, versioning, and distribution. The goal isn’t to replace agent frameworks or invent a new abstraction. It’s to give skills a proper car to drive to your agent home.

Once skills become explicit artifacts, a few things get easier. Agents become simpler because they don’t need to carry so much hidden logic. Failures become easier to reason about because you can isolate behavior. Reuse stops being an afterthought.

Agents decide what to do. Sutras define what can be done. More about how Sutras work and it’s capabilities in the next article. 🫶

That separation doesn’t solve every problem, but it turns a messy prompt-driven system into something closer to software you can reason about.

## What’s Next

Skills are still early. The current focus is on getting the foundations right: aligning with emerging skill standards, keeping the model small, and making lifecycle discipline the default instead of an afterthought. Anthropic suggests to segregate skills in 3 main categories, but I guess we’ll see how it evolves.

There’s a lot more to explore, from richer evaluation loops to better ways of sharing and composing skills. None of that should be designed in isolation.

If you’ve ever felt that skills deserve more structure than they get today, you’re already thinking along the same lines. Sutras is an attempt to turn that instinct into something concrete, and it’s very much a work in progress.

More to come, and if this resonates, the best way to shape it is together with the community. Let me what you think about it. Open an issue to request a feature or maybe just leave us a star. 🙌
