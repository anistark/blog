---
layout: post
title: World-building with WASM
excerpt: A walkable browser world needs something to generate it, something to draw it, and something to make it solid. The third one runs on WebAssembly. Here's why, and what it unlocks.
date: 2026-06-08
updatedDate: 2026-06-18
featuredImage: /images/posts/world-building-with-wasm.png
draft: false
tags:
  - post
  - webassembly
  - wasm
  - rapier
  - threejs
  - procedural-generation
  - runek
---

> *How a Rust physics engine compiled to WebAssembly quietly carries an entire walkable world, and how Runek builds those worlds on top of it.*

I've been building [Runek](https://github.com/nullorder/runek), a source
registry of procedural 3D components for React Three Fiber. Think "shadcn
for 3D worlds": you pull a component's source into your project
(`npx @runek/cli add bookshelf`) while the small runtime it imports ships
as the [`@runek/core`](https://www.npmjs.com/package/@runek/core) npm
package, and each component generates its own geometry from props and a
seed. No models, no textures, no CDN. Its showcase,
[Helicon](https://github.com/nullorder/helicon), is a walkable island
whose entire scene is one JSON file.

A walkable browser world needs three things: something to **generate** the
world, something to **draw** it, and something to make it **solid**.
Generation is plain TypeScript. Drawing is three.js on WebGL. But the third
one, the part where you collide with a wall instead of ghosting through
it, where you climb a staircase and jump off a roof, is the part that runs
on WebAssembly.

## Physics is the worst possible workload for JavaScript

Rendering gets all the attention, but the GPU does that heavy lifting.
Physics runs on the CPU, on the main thread budget, every single frame:

1. **Broad-phase**: which of the N bodies *might* be touching?
2. **Narrow-phase**: exact contact points between candidate pairs.
3. **Constraint solving**: iterate until contacts, joints, and friction
   agree with each other.
4. **Integration**: advance every body by the timestep.

At 60fps you have ~16ms per frame for *everything* (React, the scene
graph, draw-call submission), so physics realistically gets a few
milliseconds. And the workload itself is exactly what JavaScript engines
struggle to make fast *consistently*:

- **It's allocation-hungry by nature.** Naïve engines create contact
  manifolds, vectors, and solver scratch data every step. In JS that means
  garbage, and garbage means GC pauses. A 10ms collection in the middle of
  a walk cycle is a visible hitch. Physics stutter is uniquely jarring
  because your brain expects motion to be continuous.
- **It's cache-sensitive.** Solvers want bodies packed in flat, contiguous
  arrays (structure-of-arrays), marched through in order. JS objects are
  pointer-chasing machines; even well-optimized JIT code can't fully
  control memory layout.
- **It's numerically picky.** A JIT can deopt a hot function mid-frame and
  change your performance profile; the same code can run at different
  speeds minute to minute.

![Two frame timelines: JavaScript physics with one frame blown past the 16.6ms budget by a GC pause, versus flat WASM frame times](/images/posts/world-building-wasm-frame-budget.svg)
*The budget is 16.6ms, every frame, forever. One GC pause is a visible stutter.*

The browser ecosystem's history tells the same story. The classic options
were [ammo.js](https://github.com/kripken/ammo.js), the Bullet engine
(C++) machine-translated to JS/WASM via Emscripten (powerful, but with an
API that feels like manually managing C++ from JavaScript), and
[cannon-es](https://github.com/pmndrs/cannon-es), a hand-written JS engine
that's pleasant but simply can't compete on solver robustness or scale.

## Enter Rapier

[Rapier](https://rapier.rs) (by Dimforge) takes the other path: it's a
physics engine written in **Rust**, designed from day one to compile to
WebAssembly rather than being a port of something else. That buys exactly
the things JS couldn't guarantee:

- **No GC, no pauses.** Rapier manages its own memory inside WASM linear
  memory. Frame times are flat.
- **Layout control.** Rust structs compile to the packed, cache-friendly
  data the solver wants. WASM executes it at near-native speed.
- **Reproducibility.** WASM's float semantics are pinned to IEEE 754: the
  same build of the engine performs the same arithmetic everywhere. Rapier
  even offers an enhanced cross-platform determinism mode. For a project
  whose core promise is *same seed, same world*, this matters more than
  raw speed: a world should not just look identical on every machine, it
  should **feel** identical.

The JS↔WASM boundary is the tax you pay, and Rapier's design minimizes it:
you don't call into WASM per object per frame. You describe the world once
(bodies, colliders, joints), then call `world.step()`, a single boundary
crossing, and the entire broad-phase/narrow-phase/solver pipeline runs
inside WASM. JavaScript only reads back the transforms it needs to render.

In React land, [`@react-three/rapier`](https://github.com/pmndrs/react-three-rapier)
wraps this declaratively. A physical object is just JSX:

```tsx
<RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
  {/* one collider for the whole footprint; books stay visual-only */}
  <CuboidCollider args={[w / 2, h / 2, d / 2]} />
  {/* …meshes… */}
</RigidBody>
```

Even the player is WASM all the way down:
[ecctrl](https://github.com/pmndrs/ecctrl), the character controller, is
built on Rapier's kinematic character controller, so every step, slope,
and jump in Helicon is resolved by Rust-compiled collision code.

<figure>
  <video src="/images/posts/world-building-wasm-walk.mp4" autoplay loop muted playsinline preload="metadata"></video>
  <figcaption>Walking Helicon. Every step, slope, and contact is resolved by Rapier's kinematic character controller inside WASM, flat at 60fps.</figcaption>
</figure>

## World-building on top: Runek

With solidity handled, the interesting design space opens up one level
higher: *what is a world made of?*

Runek's answer is a **component contract**. Every component (a bookshelf,
a lake, a whole house) is a pure, deterministic function of its props:

```tsx
<World>
  <Terrain size={[40, 40]} relief={2} seed={9} />
  <Bookshelf position={[0, 1, 0]} seed={42} fill={0.8} />
  <Player />
</World>
```

The contract has a few load-bearing rules:

- **All randomness flows from `seed`**, through a tiny deterministic RNG.
  `seed: 42` builds the identical bookshelf on every machine, forever:
  same books, same spines, same lean.

![Four generated bookshelves: three at seed 42 are pixel-identical, one at seed 7 is different](/images/posts/world-building-wasm-seed-determinism.svg)
*seed 42, seed 42, seed 42, seed 7. The seed isn't a randomizer; it's an
address: it names one specific world in the space of possible worlds, and
the generator can find it again on any machine. (This figure is itself
generated by the same RNG.)*

- **No assets.** Geometry, materials, and palette come from code. There is
  no `.glb` to download, no texture CDN, nothing to host but static files.
- **Every component owns its colliders**, and collider count is
  proportional to *gameplay surface*, not visual detail. A bookshelf is one
  WASM-side cuboid, not forty book-shaped bodies; terrain with procedural
  relief registers a trimesh so the collision matches the visuals exactly.
  This rule is what keeps the WASM side fast: the renderer can afford
  thousands of instanced meshes, but the physics world stays lean.

![Side-by-side: a rendered bookshelf full of dozens of colorful books, and the same bookshelf with Rapier's debug wireframe showing a single collider box around the whole unit](/images/posts/world-building-wasm-colliders.png)
*Left: what WebGL draws. Right: what WASM knows about: one cuboid for a
whole bookshelf.*

And because every component is a deterministic function of plain props, a
whole world collapses into **data**:

```json
{
  "version": 1,
  "palette": { "wood": "#75563c", "foliage": "#557d3c" },
  "fog": { "color": "#dfe9f5", "near": 35, "far": 110 },
  "nodes": [
    { "type": "Terrain", "props": { "size": [120, 120], "relief": 3, "seed": 9 } },
    { "type": "House", "props": { "position": [0, 0.02, 0] } },
    { "type": "Trees", "props": { "position": [-12, 0.02, -7], "seed": 4 } },
    { "type": "Player", "props": { "position": [-1, 3, 13] } }
  ]
}
```

![The world JSON on the left, the rendered world on the right, with lines connecting each node to its object in the scene](/images/posts/world-building-wasm-world-data.svg)
*The JSON isn't a description of the world. It is the world.*

That JSON *is* Helicon. Diff it, fork it, review it in a pull request. The
runtime editor reads and writes the same structure: walk the world, flip
to edit mode, move a house, download the world, commit.

There's no autosave and no backend, by design. Edits live in memory as you
drag; the source of truth stays the JSON file in the repo. When a change is
worth keeping, you download the world and commit it. The world grows by pull
request, not by a database write.

<figure>
  <video src="/images/posts/world-building-wasm-editing.mp4" autoplay loop muted playsinline preload="metadata"></video>
  <figcaption>Every gizmo drag is a JSON diff: select an object, move it, tweak its props, and the world updates live. (Editing session, sped up 3×.)</figcaption>
</figure>

Here's where the two halves of this post meet. The pipeline is:

> **JSON → deterministic JS generation → meshes for WebGL + colliders for
> WASM**

JavaScript decides *what exists*. WebGL decides *what you see*. WASM
decides *what is real*: what stops you, holds you up, pushes back. Each
layer does the thing it's actually good at, and the seams are invisible
when you're walking around inside the result.

## The quiet takeaway

Nobody playing with Helicon knows WASM is involved, which is exactly the
point. WebAssembly's win here isn't a flashy port of a game engine; it's
that a hard, latency-sensitive, allocation-hostile workload runs flat at
60fps inside a static website, leaving JavaScript free to do the expressive
part: describing worlds as data and growing them one component at a time.

A walkable, editable, physically solid world: built from seeds, shipped as
static files, with a Rust solver humming inside it. Worlds, one rune at a
time.

---

#### Links: 

- Runek Repo: [github.com/nullorder/runek](https://github.com/nullorder/runek)
- Runek Docs: [runek.nullorder.org](https://runek.nullorder.org)
- Helicon: [github.com/nullorder/helicon](https://github.com/nullorder/helicon)
