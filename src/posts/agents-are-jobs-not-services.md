---
layout: post
title: Agents are jobs, not services
excerpt: A resident agent idling at 2GB of RAM is nothing, expensively. Most of the agent work people actually want, research, triage, monitoring, reports, is background work, and background work is a job, not a service. Here is what changes when you put agents on a queue instead of leaving them parked.
date: 2026-07-26
updatedDate: 2026-07-26
featuredImage: /images/posts/agents-are-jobs.svg
draft: false
tags:
  - post
  - ai
  - llm
  - agents
  - agentic-ai
  - architecture
  - system-design
  - local-llm
  - automation
  - economics
---

This is the year everyone got a resident AI agent. Install one of the viral self-hosted assistants, give it a name, and it sits in your messaging apps around the clock, waiting for you to talk to it. The setup guides are refreshingly honest about what that costs: [budget roughly 2GB of RAM per agent](https://lumadock.com/tutorials/openclaw-multi-agent-setup). One user running four of them on a 16GB VPS reported each agent idling around 1.5GB, spiking to 2.5GB under load, with the verdict that "memory is the bottleneck, not CPU."

![A 16GB RAM bar with the OS taking 2.5GB, four idle agents taking 2GB each, and 5.5GB free](/images/posts/ram-residents.svg)

*Four resident agents on a 16GB box, the setup the public guides describe.*

Sit with that for a second. An agent is a loop around an LLM call. Between calls it is not thinking, not learning, not watching. It is a parked process holding a runtime, some libraries, and a conversation buffer in RAM. It is nothing, expensively.

Why does nothing cost 2GB?

### The service model

The resident-agent design is inherited from chat products, where it makes sense. A chat session wants sub-second continuity. Keeping the process warm, the history in memory, and the connections open is the right trade when a human is on the other end waiting for the next token.

The problem is that we copied that shape onto everything else. The agent work people actually want done, research that runs overnight, inbox triage, monitoring a source for changes, weekly reports, code chores, is background work. Nobody is watching the cursor blink. Latency does not matter. Yet each of these gets a named, always-on process, and your box fills up at four to six agents while doing, most of the day, absolutely nothing.

Scaling makes it worse. The tenth resident agent costs the same RAM as the first. Want a specialist for each thing you care about? That is a rack, not a homelab.

### The job model

Infrastructure solved this decades ago, and the solution is boring: queues and workers. Cron jobs. CI runners. Nobody keeps a CI runner warm per repository, holding that repo's build state in RAM forever. A job arrives, a worker picks it up, does the work, records the result, and moves on.

Agents fit this shape almost perfectly, because everything that makes an agent *that agent* is data, not process. A role is a prompt, a set of tools it may touch, a choice of model, and a budget. That is a few kilobytes. Write it in a file. At rest it costs disk bytes, which round to free. You can define a hundred roles, one for every recurring chore in your life, and the hundredth costs exactly what the first did: nothing.

Execution then looks like any work queue. A task lands in a durable queue. A worker claims it, constructs the agent fresh from its role definition, runs the loop to completion, records the result and what it cost, and throws the agent away. The model weights stay warm in your inference server, which is the one thing that genuinely benefits from residency. The agents themselves never idle, because they never exist while idle.

<!-- FIGURE 2: four-stage pipeline left to right: role file (a few KB of data), the task queue (one claimed, three waiting), the worker (builds the agent fresh, runs to completion), then record result+tokens+cost and a dashed "agent discarded" ghost. -->
![Pipeline from a role file through a task queue to a worker, ending in a recorded result and a discarded agent](/images/posts/queue-pipeline.svg)

*A task's life as a job. The agent exists only for the span of stage three.*

### The economics

Once agents are jobs, the cost model collapses to one line: cost equals tokens times tier. The only things you pay for are the tokens you generate and where you generate them. Cheap local models for the mechanical volume, a frontier API for the calls that actually need judgment. Residency was a third cost that bought nothing for background work, and it is gone.

<!-- FIGURE 3: the one-line cost model as a hero ("cost = tokens × tier") over two tier cards, local (aqua accent, volume work, priced at electricity) and frontier (blue accent, judgment, priced per token). -->
![The formula cost equals tokens times tier, above two cards comparing the local tier and the frontier tier](/images/posts/cost-tiers.svg)

The queue also buys you things the resident model quietly lacks:

- **Durability.** A parked process dies with a crash or a reboot, taking its in-RAM state along. A queued task is a row in a database. Kill the worker mid-run and the task gets picked up again on restart. Nothing is lost because nothing lived in RAM.
- **Reproducibility.** A stateless agent built fresh per task behaves the same way every time. An agent that has been accumulating context in memory for three weeks is an agent whose behavior you cannot reproduce, which means you cannot debug it.
- **Accounting.** When every unit of work is a discrete job, every unit of work can leave a record: what ran, on which model, how many tokens, at what cost. Ask a resident agent what it cost you last Tuesday and see how far you get.

### What you give up

Honesty requires the other column. Jobs give up instant conversational continuity and warm session state. If you want a chat companion that answers in milliseconds and remembers the last thing you said, run one resident agent for that, it is the correct tool for exactly that job. Then let everything else, the background work that is most of what you wanted agents for in the first place, run as jobs on a queue that costs you nothing between tasks.

The scarce resources on a small box were never CPU cycles. They are memory and your attention, and a fleet of parked processes consumes both.
