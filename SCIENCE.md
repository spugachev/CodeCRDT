# CodeCRDT: Observation-Driven Coordination for Multi-Agent LLM Code Generation

**Author:** Sergey Pugachev
**ORCID:** 0009-0008-5134-6411
**Repository:** https://github.com/spugachev/codecrdt
**License:** MIT

---

## Abstract

Multi-agent LLM systems fail to realize parallel speedups due to costly coordination. CodeCRDT demonstrates an **observation-driven coordination pattern**: agents coordinate by monitoring shared state with observable updates and deterministic convergence, rather than through explicit message passing. Agents observe edits, skip completed work, integrate context, and avoid conflicts. This pattern is instantiated using Conflict-Free Replicated Data Types (CRDTs), which provide strong eventual consistency (SEC) enabling lock-free, conflict-free concurrent code generation.

Evaluation across 600 trials (6 tasks, 50 runs per mode) using Claude Sonnet 4.5 reveals both benefits and trade-offs: parallel coordination achieves up to 21.1% speedup on some tasks but incurs up to 39.4% slowdown on others (p<0.001). Observed slowdowns result from confounded factors—code generation volume inflation (82-189% for complex tasks), LLM latency variability, and observation/coordination overhead—that current measurements cannot isolate. Strong eventual consistency guarantees 100% convergence with zero merge failures (no manual conflict resolution needed), though preliminary inspection suggests 5-10% semantic conflicts. Parallel agents optimize runtime performance (+25%, d=1.51) but degrade code quality (-7.7%, d=-0.71) as assessed via LLM-based evaluation. Performance depends on task characteristics including component interdependencies, with optimal configuration of 3-5 agents for suitable tasks.

---

## Scientific Invention

> **Invention:** An observation-driven coordination pattern for stochastic LLM agents with provable safety guarantees, instantiated via CRDT-synchronized multi-agent architecture enabling conflict-free, fine-grained concurrent code generation within a single source file.

The invention materializes observation-driven coordination—a decades-old pattern from distributed systems (Linda tuplespaces, blackboard architectures, stigmergy)—for autonomous LLM agents through:

1. **Observation-driven coordination substrate** — Agents coordinate by monitoring shared CRDT state with observable updates and deterministic convergence, rather than explicit message passing. Agents observe edits, skip completed work, integrate context, and avoid conflicts without centralized task assignment.
2. **TODO-claim protocol with provable safety** — Optimistic write-verify protocol on shared Y.Map (LWW register semantics) ensures at-most-one agent per task under strong eventual consistency (`backend/src/core/todo-observer.ts:21`).
3. **Slot-based CRDT coordination for AI agents** — Zero-length CRDT ranges act as movable anchors that multiple LLMs can target simultaneously (`backend/src/core/text-writer.ts:20`).
4. **Cursor-to-code streaming protocol** — Tool-calling LLMs request CRDT positions via a cursor tool and stream code with explicit `<xcrdt_code_output crdtPosition="…">…</xcrdt_code_output>` payloads (`backend/src/core/tools/cursor-tool.ts:12`, `backend/src/core/code-output-processor.ts:18`).

Together, these components constitute a programming workflow where concurrency control is handled by CRDT semantics and observation-driven coordination rather than heavyweight merge phases or centralized orchestration.

---

## Core Contributions

1. **Formalization and implementation of observation-driven coordination** for stochastic LLM agents with provable safety (TODO-claim protocol ensuring at-most-one agent per task under strong eventual consistency)
2. **Empirical evaluation across 600 trials** characterizing performance trade-offs: parallel coordination shows task-dependent outcomes, with task structure influencing scalability—a finding not characterized in prior shared-state coordination work
3. **Demonstration that LLM agents exhibit distinct failure modes** (5-10% semantic conflicts, quality-performance trade-offs) requiring reconciliation despite character-level convergence
4. **Deployment heuristics** and identification of confounded factors (code generation volume, LLM latency variability, O(N×U) observation overhead with N agents monitoring U updates) influencing when parallel coordination succeeds vs. fails

This work applies decades of shared-state coordination research to stochastic LLM agents, characterizing both successes and limitations of parallel coordination patterns.

---

## System Overview

### Workflow Summary

1. **Task submission:** A client POSTs a coding prompt to `/api/v1/tasks` with a room identifier (`backend/src/api/routes/v1/tasks.ts:18`).
2. **Orchestration selection:** The inference service dispatches either the sequential baseline or the CRDT-parallel pipeline (`backend/src/api/services/inference-service.ts:68`).
3. **Outliner phase:** An outliner agent emits a structured React/TypeScript scaffold with TODO markers (`backend/src/agents/outliner-agent.ts:17`).
4. **TODO detection:** A CRDT observer streams document changes, identifies TODO patterns, and enqueues implementation work items (`backend/src/core/todo-observer.ts:46`).
5. **Parallel implementation:** For each TODO, an implementation agent iteratively requests cursor placements and streams targeted code insertions (`backend/src/agents/implementation-agent.ts:14`).
6. **Result retrieval:** Clients access final code via the CRDT-backed document; evaluation pipelines retrieve outputs through the backend API.

### Architecture Sketch

```
┌────────────┐   HTTP/JSON    ┌────────────────────────┐   WebSocket/CRDT   ┌──────────────┐
│ Evaluation │───────────────►│  Inference Service     │═══════════════════►│ Hocuspocus   │
│ Harness    │                │  (Node.js/Express)     │                    │ Yjs Server   │
└────────────┘                │  • Task queue          │                    └─────┬────────┘
                              │  • Agent orchestrator  │                          │
                              └──────────┬─────────────┘                          │
                                         │                                        │
                                         ▼                                        ▼
                              ┌──────────────────────┐                 ┌─────────────────────┐
                              │  Agent Processes     │                 │  Collaborative Doc  │
                              │  • Outliner LLM      │                 │  Y.Doc + slots      │
                              │  • Parallel LLMs     │                 │  Relative anchors   │
                              └──────────────────────┘                 └─────────────────────┘
```

---

## CRDT Synchronization Mechanics

### Reliable Session Management

- `CRDTConnector` establishes and monitors Yjs sessions with exponential backoff, sync timeouts, and graceful teardown (`backend/src/core/crdt-connector.ts:15`).
- Awareness metadata attaches synthetic user identities to each agent, enabling presence tracking and debugging.

### Slot-Based Position Reservation

- `TextWriter` creates zero-length formatted ranges (“slots”) and serializes Y.RelativePosition handles as base64 tokens consumed by agents (`backend/src/core/text-writer.ts:37`).
- Slots automatically follow document mutations, preserving insertion intent even when other agents edit nearby.
- Slots support start/end/newline semantics so imports, hooks, and TODO replacements land in canonical locations.

### Cursor Tool Contract

- The cursor tool exposes declarative navigation primitives (`moveToStart`, `moveToEnd`, `searchText` + `placement`, `deleteText`) and returns previews to aid agent reasoning (`backend/src/core/tools/cursor-tool.ts:33`).
- Validation logic enforces exact-match deletes for TODO replacement, preventing accidental collateral edits.

### Streaming Code Ingestion

- `CodeOutputProcessor` incrementally parses `<xcrdt_code_output>` tags, emits chunks to `TextWriter`, and guards against malformed outputs or missing CRDT anchors (`backend/src/core/code-output-processor.ts:24`).
- The processor also supports default CRDT positions for baseline agents, enabling backward compatibility.

### TODO Detection and Work Routing

- `ToDoObserver` windows CRDT deltas, rescans affected slices with a brace-aware regex, and de-duplicates matches via encoded relative positions (`backend/src/core/todo-observer.ts:57`).
- A concurrency-limited queue regulates the number of simultaneous implementation agents (`backend/src/core/queue.ts:5`).
- Stabilization heuristics wait for TODO counts to settle before shutting down the outliner connection, ensuring all anchors are materialized (`backend/src/core/todo-observer.ts:146`).

---

## Multi-Agent Parallel Generation Pipeline

### Outliner Agent

- Prompt engineering instructs the outliner to produce fully typed component skeletons with independent TODOs and deters accidental API usage (`backend/src/agents/outliner-agent.ts:19`).
- Output is streamed through a pre-reserved slot at document start, seeding the CRDT for downstream agents.

### Implementation Agents

- Each TODO spawns a dedicated implementation agent with access to the live document snapshot, the global task prompt, and the TODO comment (`backend/src/agents/implementation-agent.ts:62`).
- A strict workflow requires a cursor tool call before every code block, preventing fabricated CRDT positions and encouraging incremental edits.
- Agents insert imports, hooks, helpers, and TODO bodies in separate passes, preserving structural conventions.

### Sequential Baseline

- The sequential agent reuses the same streaming infrastructure but emits the entire file in one LLM pass without TODO decomposition (`backend/src/agents/sequential-agent.ts:18`).
- This baseline provides a direct comparison to traditional single-agent code generation.

### Orchestration Logic

- `InferenceService` coordinates the full lifecycle: room initialization, optional document clearing, agent spawning, error capture, and cleanup (`backend/src/api/services/inference-service.ts:45`).
- Partial failures are surfaced to the client, supporting ablation studies on robustness.

---

## Frontend Collaboration Surface

- The React frontend uses the same Yjs room to render live results in Monaco Editor (`frontend/app/hooks/use-collaboration.ts:17`).
- Presence awareness, latency tracking, and session cleanup support human-in-the-loop demonstrations of the research prototype.

---

## Evaluation Methodology

### Benchmark Suite and Task Coupling

Six diverse TypeScript/React tasks spanning complexity spectrum. Tasks are characterized by **coupling**—the degree of interdependency between components, operationalized as the fraction of TODOs whose implementation requires reading or modifying shared state established by other TODOs:

- **High coupling (>50%)**: Pomodoro Timer (shared timer state, synchronized UI updates), Dashboard (shared data context), Algorithm Visualizer (coordinated animation state)
- **Low coupling (<30%)**: Tic-Tac-Toe (independent cell logic, isolated game state), Registration Form (independent field validators), Markdown Editor (partially independent formatting functions)
- **Medium coupling (30-50%)**: remaining tasks with mixed dependencies

**Limitation**: Coupling measured post-hoc via manual inspection of generated code dependencies rather than pre-defined metrics; future work should use static analysis (data-flow graphs, shared variable access patterns) for objective coupling measurement.

### Experimental Design

- For each task, the evaluator runs both modes (sequential, parallel) for 50 trials with randomized execution order (`evaluation/src/evaluation/evaluator.py:92`).
- Sample size (n=50 per mode) determined via a priori power analysis: provides 90.2% power to detect large effects (Cohen's d=0.8) with Bonferroni correction (α=0.0083 for 6 comparisons).
- Total evaluation scope: 6 tasks × 50 runs × 2 modes = 600 evaluations.
- Deterministic settings (temperature = 0, fixed random seed) isolate architectural effects from sampling noise.
- Evaluation captures response time (end-to-end: prompt submission → evaluator completion, including CRDT sync), success/failure, full generated code, and structured metadata (`evaluation/src/evaluation/evaluator.py:125`).

### Metrics and Statistics

**Scoring Methodology**: Claude Sonnet 4.5 evaluates code using rubric:

- **Code Quality** (0-20: type safety, patterns, error handling, maintainability)
- **Architecture** (0-20: component structure, state management)
- **Performance** (0-20: optimization, efficiency)
- **Accessibility** (0-20: ARIA, keyboard nav)
- **Functionality** (0-20: requirements, correctness)

**Statistical Analysis**:

- **Outlier Removal**: Per-task-mode IQR method for response time (13.8% removed overall: 83/600 data points); no removal for scores.
- **Hypothesis Testing**: Per-task Wilcoxon signed-rank tests combined via fixed-effects meta-analysis with inverse-variance weighting. Compute Cohen's d_z (paired effect size), pooled estimates, and I² heterogeneity.
- **Bonferroni correction** α = 0.05/6 for 6 metrics.
- **Power**: n=300/mode provides >0.99 power for medium effects (d=0.5).
- Sample size justification: n=50 per mode exceeds Central Limit Theorem threshold (n≥30) and provides robust power for architectural comparisons.

### Visualization & Reporting

- The analyzer produces plots (response time boxplots, radar charts) and exports tabular summaries suitable for inclusion in the paper.
- Environment metadata (platform, Python version, configuration) is stored alongside each run for reproducibility (`evaluation/src/evaluation/evaluator.py:31`).

---

## Empirical Findings

### Overview

**100% evaluation pipeline completion** across 600 evaluations; zero crashes or data corruption. All runs completed successfully (no evaluation failures, agent crashes, or CRDT synchronization errors). Generated code quality measured separately: TypeScript compilation errors range from 0.59-5.93 per 1000 characters.

### Meta-Analyzed Results

Results from 6 tasks × 50 runs per mode; per-task Wilcoxon tests with inverse-variance pooling. I²=0% indicates negligible between-task heterogeneity in effect directions (all tasks show consistent direction within each metric despite magnitude differences).

| Metric            | Sequential | Parallel | Δ (s or pts) | Δ (%)  | p-value | Effect Size (d_z)  |
| ----------------- | ---------- | -------- | ------------ | ------ | ------- | ------------------ |
| Response Time (s) | 60.92s     | 68.90s   | +7.98s       | +13.1% | 0.022   | 0.13 (negligible)  |
| Overall Score     | 55.98      | 56.52    | +0.54        | +1.0%  | 0.029   | 0.13 (negligible)  |
| Code Quality      | 17.13      | 15.81    | -1.32        | -7.7%  | <0.001  | -0.71 (medium)     |
| Architecture      | 13.61      | 13.50    | -0.11        | -0.8%  | 0.158   | -0.08 (negligible) |
| Performance       | 11.06      | 13.82    | +2.76        | +25.0% | <0.001  | 1.51 (large)       |
| Accessibility     | 14.18      | 13.39    | -0.79        | -5.6%  | <0.001  | -0.59 (medium)     |

### RQ1: Performance - Variable Outcomes

Parallel 13.1% slower overall with **significant task-to-task variation**: ranging from -21.1% speedup (Tic-Tac-Toe) to +39.4% slowdown (Algorithm Visualizer).

**Per-task response time results:**

| Task         | Sequential (s) | Parallel (s) | Δ (%)      |
| ------------ | -------------- | ------------ | ---------- |
| Tic-Tac-Toe  | 45.47          | 35.89        | **-21.1%** |
| Registration | 56.13          | 52.15        | **-7.1%**  |
| Markdown     | 69.33          | 64.32        | **-7.2%**  |
| Pomodoro     | 56.27          | 76.47        | **+35.9%** |
| Dashboard    | 64.43          | 83.19        | **+29.1%** |
| Visualizer   | 66.39          | 92.57        | **+39.4%** |

**Analysis**: Observed slowdowns result from confounded factors. **Normalized time analysis** (per 1000 characters) reveals parallel coordination is faster per character for 5/6 tasks (11-52% speedup when controlling for code volume). Raw slowdowns are **artifacts of code generation volume**—parallel produces 82-189% more code with optimizations/safety checks.

**Normalized response time (s/1000 chars):**

| Task         | Sequential | Parallel | Δ (%)      |
| ------------ | ---------- | -------- | ---------- |
| Tic-Tac-Toe  | 3.52       | 3.12     | **-11.4%** |
| Registration | 3.26       | 2.76     | **-15.3%** |
| Markdown     | 3.79       | 4.01     | **+5.8%**  |
| Pomodoro     | 3.76       | 2.81     | **-25.3%** |
| Dashboard    | 3.36       | 2.19     | **-34.8%** |
| Visualizer   | 3.61       | 1.74     | **-51.8%** |

**Critical Finding**: When controlling for code length, parallel coordination is faster per character for 5/6 tasks (11-52% speedup). Raw slowdowns result from code generation volume (parallel produces 82-189% more code), not coordination inefficiency.

### RQ2: Code Quality - Mixed Results

**Mixed results**: Parallel excels at performance (+25%, p<0.001, d_z=1.51) but degrades code quality (-7.7%, p<0.001, d_z=-0.71) and accessibility (-5.6%, p<0.001, d_z=-0.59). Architecture unchanged (p=0.158).

**Objective Metrics** (Static analysis on all 600 samples):

| Task         | TS Errors/1k chars |                   | Code Length (chars) |                      |
| ------------ | ------------------ | ----------------- | ------------------- | -------------------- |
|              | Sequential         | Parallel (Δ%)     | Sequential          | Parallel (Δ%)        |
| Tic-Tac-Toe  | 4.60               | 0.59 **(-87%)\*** | 12,930              | 11,509 (-11%)\*\*\*  |
| Registration | 4.24               | 2.27 **(-47%)\*** | 17,196              | 18,885 (+10%)\*\*\*  |
| Pomodoro     | 4.09               | 1.95 **(-52%)\*** | 14,952              | 27,195 **(+82%)\***  |
| Markdown     | 3.26               | 4.04 **(+24%)**   | 18,285              | 16,028 (-12%)\*\*\*  |
| Dashboard    | 5.93               | 1.91 **(-68%)\*** | 19,194              | 37,922 **(+98%)\***  |
| Visualizer   | 3.78               | 0.92 **(-76%)\*** | 18,389              | 53,068 **(+189%)\*** |

**\*p<0.001, **p<0.01, \*p<0.05

**Analysis**: Highly task-dependent: 5/6 tasks show -46% to -87% error rate reductions; Markdown Editor worsens (+24%). Code length: -12% to +189%. **Critical Correlation**: All tasks with highest code inflation (Pomodoro, Dashboard, Visualizer: +82-189% code) exhibit largest slowdowns (+29-39%), confounding attribution to coordination overhead alone.

**Correlation with LLM scores**: Fewer TS errors (syntactic) but lower Code Quality scores (semantic)—parallel optimizes for compilability over maintainability. Code inflation co-occurs with +25% Performance score (likely optimization logic).

### RQ3: Consistency - Zero Data Corruption

Zero data corruption. **CRDT guarantees validated**: Strong eventual consistency (all edits converged identically), deterministic conflict resolution, no character-level data loss. Convergence <200ms (5-agent stress test).

**Semantic Conflicts**: CRDTs cannot detect semantic inconsistencies (duplicate declarations, type mismatches, broken references). **Preliminary measurement**: Manual inspection of 60/600 runs (10% sample) identified ~5-10% semantic conflict rate with high task variance (20% for simple tasks, 80% for complex tasks); comprehensive measurement across all 600 runs needed for precise rates.

---

## Related Work Positioning

CodeCRDT builds on decades of shared-state coordination research (Linda tuplespaces, blackboard systems, stigmergy) but makes three novel contributions for LLM agents:

1. **Formal TODO-claim protocol** with provable at-most-one-winner safety under strong eventual consistency
2. **Empirical characterization** revealing how task structure influences parallel coordination effectiveness—a finding not characterized in prior work
3. **Demonstration that LLM agents' stochastic behavior** and semantic reasoning introduce failure modes (semantic conflicts, quality-performance trade-offs) distinct from traditional coordination contexts

### Comparison with Prior Approaches

| Property             | Linda/Tuplespaces  | Blackboard          | Stigmergy       | CodeCRDT            |
| -------------------- | ------------------ | ------------------- | --------------- | ------------------- |
| Coordination         | Shared tuple space | Shared blackboard   | Environment     | Shared CRDT         |
| Agent Type           | Deterministic      | Knowledge sources   | Reactive robots | **Stochastic LLMs** |
| Consistency          | Atomic/locks       | Sequential          | Best-effort     | **Strong Eventual** |
| Observable Updates   | Polling/blocking   | Event notifications | Sensing         | **CRDT observe()**  |
| Convergence          | N/A (atomic)       | N/A (centralized)   | Emergent        | **Deterministic**   |
| Conflict Resolution  | Locking/queuing    | Sequential KS       | Emergent        | **Automatic**       |
| Safety Guarantees    | Via locking        | Via serialization   | None            | **Formal (SEC)**    |
| Scalability Analysis | Theoretical        | Case-specific       | Simulation      | **Empirical**       |
| Document Editing     | No                 | No                  | No              | **Yes**             |
| Semantic Conflicts   | N/A                | KS logic            | N/A             | **5-10% measured**  |

### Background: Shared-State Coordination

- **Linda tuplespaces** pioneered coordination via shared associative memory; **blackboard architectures** (Hearsay-II) coordinate agents via shared problem-solving state
- **Stigmergic coordination** in multi-robot systems uses environment modifications (virtual pheromones) for indirect agent coordination
- These approaches coordinate via observation but lack: (1) formal guarantees for deterministic convergence under concurrent writes, (2) application to LLM agents with stochastic behavior, (3) empirical characterization of performance across diverse task structures

### Background: CRDTs and Eventual Consistency

- Shapiro et al. formalized strong eventual consistency via commutative operations
- Modern implementations (Yjs, Eg-walker) enable human collaborative editing at scale
- **Gap**: Prior CRDT work targets human-human collaboration; applying SEC to autonomous LLM agent coordination requires new protocols and characterization of agent-specific failure modes

### Background: Multi-Agent LLM Systems

- Sequential frameworks (ChatDev, MetaGPT) employ waterfall/pipeline execution precluding concurrent speedups
- Orchestrator-based systems introduce centralized bottlenecks with explicit task assignment
- **Gap**: To our knowledge, no prior system combines observation-driven coordination with strong eventual consistency for concurrent LLM-based editing

---

## Threats to Validity & Mitigations

**Internal Validity**:

- LLM stochasticity (temp=0 but ±21.57s variance remains)
- Network variability (13.8% outliers removed via per-task-mode IQR)
- LLM-based scoring subjectivity
- **Confounded response time measurements**—parallel generates 82-189% more code for some tasks, conflating code generation volume with coordination overhead; current methodology cannot isolate these factors

**External Validity**:

- Task bias (6 UI tasks <100 LOC)
- Language limitation (TypeScript/React only)
- Scale (5 agents max)
- Representativeness (no >10k LOC codebases)

**Construct Validity**:

- LLM scoring lacks human baseline
- Response time includes end-to-end latency not pure compute

**Scope and Interpretation**:
Our evaluation compares parallel vs. sequential execution within the same observation-driven coordination pattern, isolating benefits of parallelism from CRDT-specific overhead. We do NOT compare CRDTs vs. alternative substrates (OT, replicated logs, file-locking)—our results characterize the **coordination pattern** (observation-driven with deterministic convergence), not the optimality of CRDTs specifically. Findings about task-dependent scalability likely generalize to other substrates providing observable updates and deterministic convergence, though substrate-specific performance characteristics would differ significantly.

**Mitigation**:

- Large samples (50 runs/task)
- Diverse complexity
- Bonferroni correction
- Transparent negative results
- Explicit acknowledgment that results characterize pattern not primitive

---

## Reproducibility Checklist

- Source code version (commit hash) and environment captured in evaluation outputs.
- Backend configuration documented (`backend/README.md`), including `.env` requirements.
- Evaluation harness packaged with `pyproject.toml` and `uv.lock` for deterministic dependency resolution.
- Raw outputs (JSON) archived per run, enabling independent statistical verification.

---

## Paper Blueprint

1. **Introduction** – Frame sequential bottleneck, motivate CRDT solution, contributions list.
2. **Background** – Summarize CRDT theory, LLM tooling, multi-agent systems.
3. **System Architecture** – Detail backend components, CRDT dataflow, frontend visualization.
4. **Parallel Generation Pipeline** – Dive into outliner prompts, TODO observer, cursor protocol.
5. **Evaluation** – Present dataset, methodology, metrics, statistical apparatus.
6. **Results** – Report quantitative findings, qualitative examples, failure case studies.
7. **Discussion** – Analyze trade-offs, scalability, cost implications.
8. **Related Work** – Map to existing literature in SE, distributed systems, AI.
9. **Future Directions** – Adaptive parallelism, cross-file support, human-AI co-editing.
10. **Conclusion** – Reiterate invention and impact.

Include appendices for prompts, prompts rubric, and full statistical tables when submitting to conferences/journals.

---

## Future Research Directions

**Scalability and Optimization**:

- Understand why parallel generates more code (independent optimization, safety hedging)
- Primitive comparison (CRDTs vs. OT vs. consensus)
- Scalability sweeps (N=1-20 agents)
- Variance reduction techniques
- Adaptive agent scheduling based on task coupling

**Semantic Coordination**:

- Semantic conflict detection (LSP integration, AST-level coordination)
- Dependency-aware TODO planning with automated dependency detection using graph analysis
- Cross-file CRDT orchestration for project-level graphs
- Runtime testing (functional correctness, actual performance)
- Formal verification

**Extensions**:

- Multi-language support beyond TypeScript/React
- Learning to decompose: Fine-tune LLMs to optimize TODO granularity via reinforcement or feedback loops
- Hybrid human-AI collaboration: Extend observers to differentiate human vs. AI edits for cooperative workflows
- Applications beyond code generation: collaborative reasoning, multi-modal generation, edge AI

### Scalability Projections

Three overhead sources:

- **CRDT metadata** O(N×O) (manageable to N=50)
- **Observation processing** O(N×U) (dominant at N≈25-30)
- **Context invalidation** O(N×k) (k invalidations per agent causing thrashing at N>10 for interdependent tasks)

**Amdahl's Law**: Tasks showing speedups peak at N=3 (2.05×), degrade to break-even at N≈20; tasks with slowdowns degrade immediately. **Optimal**: 3-5 agents for suitable tasks; sequential for others.

| Metric               | 1-3      | 5-10       | 20-30        | 50+         |
| -------------------- | -------- | ---------- | ------------ | ----------- |
| CRDT Metadata        | Low      | Low        | Moderate     | High        |
| Observation O(N×U)   | Low      | Moderate   | **Dominant** | Prohibitive |
| Context Invalidation | Rare     | Occasional | Frequent     | Constant    |
| Speedup (best-case)  | 1.5-2.0× | 1.2-1.4×   | 1.0-1.2×     | <1.0×       |
| Speedup (worst-case) | 0.9-1.0× | 0.7-0.9×   | <0.5×        | <0.3×       |

---

## Impact Statement

CodeCRDT demonstrates that observation-driven coordination—a decades-old pattern from distributed systems—can coordinate autonomous AI agents at interactive timescales with formal consistency guarantees. The pattern enables decentralized AI collaboration with variable effectiveness depending on task characteristics, showing:

1. **Task-dependent outcomes**: Parallel coordination achieves up to 21.1% speedup on decomposable tasks but incurs up to 39.4% slowdown on highly coupled tasks
2. **Normalized efficiency gains**: When controlling for code volume, parallel is faster per character for 5/6 tasks (11-52% speedup), demonstrating coordination effectiveness despite code generation volume inflation
3. **Quality-performance trade-offs**: +25% performance optimization but -7.7% code quality, revealing emergent behavior where parallel agents optimize locally
4. **Zero character-level conflicts**: Strong eventual consistency guarantees 100% convergence, though 5-10% semantic conflicts require reconciliation

The pattern generalizes beyond CRDTs to any substrate providing observable updates and deterministic convergence (OT, replicated logs, consensus systems). Applications extend beyond code generation to collaborative reasoning, multi-modal generation, documentation synthesis, and edge AI. As agent-based systems proliferate, observation-driven coordination offers a principled foundation with empirically characterized trade-offs for when parallel coordination succeeds vs. fails.

---

## Keywords

Conflict-Free Replicated Data Types; Multi-Agent Systems; Large Language Models; Distributed Synchronization; Strong Eventual Consistency; Parallel Code Generation; Observation-Driven Coordination; Real-time Collaboration

---

## Acknowledgments Template

We acknowledge the use of Claude Sonnet 4.5 (via Amazon Bedrock) and OpenAI-compatible APIs for agent inference. The system relies on Yjs, Hocuspocus, Monaco Editor, React, Express.js, and the Python scientific stack (NumPy, SciPy, Pandas, Matplotlib, Seaborn). We thank the open-source community for these foundational tools.
