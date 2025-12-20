# AI Capabilities Analysis: What Works Now vs. What We Need
## Based on Karpathy's 2025 LLM Year in Review

**Source:** [Andrej Karpathy - 2025 LLM Year in Review](https://karpathy.bearblog.dev/year-in-review-2025/)

---

## Executive Summary

Karpathy's review reveals a critical pattern: **what works in AI is fundamentally different from what we assumed**. The AI Manhattan Project must learn from these lessons or risk building infrastructure for the wrong capabilities.

**Key Insight:** Current LLMs are "ghosts, not animals" - they have jagged intelligence (genius in some areas, confused in others) and work best when:
1. They have **verifiable rewards** (clear success metrics)
2. They run **locally with context** (not just cloud APIs)
3. They're **orchestrated by domain-specific apps** (not raw models)
4. They output **visual formats** (not just text)

---

## What We're Good At Now (Can Use Immediately)

### 1. **RLVR for Verifiable Domains** ✅
**What it is:** Reinforcement Learning from Verifiable Rewards - LLMs trained on math/code puzzles develop reasoning strategies.

**What works:**
- Clear success metrics (code compiles, math answer is correct)
- Objective, non-gameable rewards
- LLMs learn intermediate reasoning steps

**AI Manhattan Applications:**
- ✅ **Drug Discovery:** Molecular structures have verifiable properties (binding affinity, toxicity). Can train on "does this molecule bind to target X?"
- ✅ **Energy Optimization:** Grid load balancing has clear metrics (stability, cost). Can train on "does this schedule minimize cost while maintaining stability?"
- ✅ **Manufacturing Quality:** Defect detection has binary outcomes (pass/fail). Can train on "does this pattern predict failure?"

**Infrastructure Need:** High compute for RLVR training (weeks on thousands of GPUs) - **this is what our data centers are for.**

### 2. **Local Deployment (Claude Code Model)** ✅
**What it is:** AI running on your computer with your context, data, secrets, configuration.

**What works:**
- Low-latency interaction
- Access to existing tools and data
- Privacy (sensitive data stays local)
- Integration with existing workflows

**AI Manhattan Applications:**
- ✅ **Medical Imaging:** Doctors' workstations need AI that sees their PACS system, patient history, local protocols
- ✅ **Education:** Schools need AI tutors that know their curriculum, student records, district policies
- ✅ **Manufacturing:** Factory floors need AI that connects to their MES, SCADA, quality systems

**Infrastructure Need:** Edge compute + secure local deployment. Not just cloud - **we need distributed AI infrastructure.**

### 3. **LLM Apps Layer (Cursor Model)** ✅
**What it is:** Domain-specific apps that orchestrate multiple LLM calls, do context engineering, provide GUIs, offer autonomy sliders.

**What works:**
- Context engineering (knowing what data to feed the model)
- Orchestrating complex DAGs of LLM calls
- Application-specific GUIs
- Balancing performance vs. cost

**AI Manhattan Applications:**
- ✅ **Cancer Detection App:** Orchestrates image analysis → pattern matching → risk scoring → doctor review workflow
- ✅ **Education App:** Orchestrates student assessment → learning style detection → personalized lesson generation → progress tracking
- ✅ **Energy Grid App:** Orchestrates demand forecasting → generation scheduling → grid stability checks → optimization

**Infrastructure Need:** This is the **"Heart" layer** - domain-specific AI apps that solve real problems, not just raw models.

### 4. **Visual Outputs (Nano Banana Model)** ✅
**What it is:** LLMs generating images, infographics, slides, animations - not just text.

**What works:**
- People consume information visually, not text
- Joint capability: text + image + world knowledge in one model

**AI Manhattan Applications:**
- ✅ **Medical Imaging:** AI explains findings with annotated images, not just text reports
- ✅ **Education:** AI tutors show visual explanations, diagrams, interactive demos
- ✅ **Energy:** AI shows grid visualizations, demand curves, optimization results

**Infrastructure Need:** Multimodal models (text + vision) require more compute - **another reason we need the infrastructure.**

---

## What We're NOT Good At (Need to Build)

### 1. **Jagged Intelligence Problem** ❌
**What it is:** LLMs are simultaneously genius polymaths and confused grade schoolers. They spike in verifiable domains but fail on simple things.

**The Problem:**
- Cancer detection AI might catch subtle patterns but miss obvious tumors
- Education AI might explain calculus perfectly but fail on basic reading comprehension
- Energy AI might optimize complex grids but break on simple arithmetic

**What We Need:**
- **Robustness testing** across the full capability spectrum
- **Human-in-the-loop** systems (doctors, teachers, engineers) to catch failures
- **Specialized models** for each domain (not one general model)
- **Continuous monitoring** and feedback loops

**Infrastructure Need:** 
- Testing infrastructure (can't just train and deploy)
- Monitoring systems (real-time capability assessment)
- Human feedback loops (doctors, teachers, engineers)

### 2. **Non-Verifiable Domains** ❌
**What it is:** Many real-world problems don't have clear success metrics. How do you know if a cancer detection AI is "right" if the cancer won't appear for 3 years?

**The Problem:**
- **Cancer Detection:** "Did we catch it early?" - answer comes 2-3 years later
- **Education:** "Did the student learn?" - answer comes months/years later
- **Drug Discovery:** "Does this cure the disease?" - answer comes after clinical trials (years)

**What We Need:**
- **Long-term outcome tracking** (follow patients, students, drugs for years)
- **Proxy metrics** that correlate with long-term success
- **Human expert validation** (doctors, teachers, researchers)
- **Incremental deployment** (start small, validate, expand)

**Infrastructure Need:**
- **Data infrastructure** for long-term tracking (not just training data)
- **Validation systems** (how do we know it's working?)
- **Feedback loops** that span years, not just training runs

### 3. **Benchmark Gaming** ❌
**What it is:** Benchmarks are verifiable, so teams train on them. Models crush benchmarks but fail in real deployment.

**The Problem:**
- Medical AI might ace test datasets but fail on real patient images
- Education AI might pass standardized tests but fail to actually teach
- Energy AI might optimize test scenarios but break on real grid conditions

**What We Need:**
- **Real-world validation** (not just benchmarks)
- **Adversarial testing** (try to break the system)
- **Continuous monitoring** (how does it perform in production?)
- **Domain-specific evaluation** (what matters for cancer detection vs. education?)

**Infrastructure Need:**
- **Production monitoring** (not just training infrastructure)
- **A/B testing frameworks** (compare AI vs. human performance)
- **Failure analysis systems** (why did it fail?)

### 4. **Context Engineering** ❌
**What it is:** Knowing what data to feed the model, how to structure it, what context matters.

**The Problem:**
- Medical AI needs: patient history, imaging protocols, lab results, genomic data, treatment history
- Education AI needs: student learning style, curriculum, assessment history, family context
- Energy AI needs: grid topology, demand forecasts, generation capacity, weather, market prices

**What We Need:**
- **Domain-specific data pipelines** (not just "feed it text")
- **Context assembly systems** (gather all relevant data)
- **Data quality assurance** (garbage in, garbage out)
- **Privacy-preserving data access** (HIPAA, FERPA, etc.)

**Infrastructure Need:**
- **Data infrastructure** (not just compute)
- **Data integration** (connect to existing systems)
- **Privacy/security** (HIPAA, FERPA compliance)

---

## Critical Insights for AI Manhattan Project

### 1. **We're Building Infrastructure for the Wrong Thing If...**
- We only build cloud data centers (need local/edge deployment)
- We only train general models (need domain-specific apps)
- We only optimize for benchmarks (need real-world validation)
- We only focus on compute (need data infrastructure)

### 2. **What Actually Works (Based on Karpathy's Lessons)**
- ✅ **Verifiable domains** → Drug discovery, energy optimization, manufacturing quality
- ✅ **Local deployment** → Medical imaging, education, factory floors
- ✅ **Domain-specific apps** → Cancer detection app, education app, energy app
- ✅ **Visual outputs** → Medical imaging explanations, educational visuals, energy dashboards

### 3. **What Doesn't Work (But We Might Assume It Does)**
- ❌ **General models** → Need specialized models for each domain
- ❌ **Cloud-only** → Need local deployment for privacy/context
- ❌ **Benchmark optimization** → Need real-world validation
- ❌ **Text-only outputs** → Need visual/multimodal outputs

---

## Recommendations for AI Manhattan Project

### Infrastructure Priorities

1. **Edge Compute** (not just cloud)
   - Local deployment for medical, education, manufacturing
   - Low-latency inference
   - Privacy-preserving (data stays local)

2. **Domain-Specific AI Apps** (not just raw models)
   - Cancer detection app
   - Education app
   - Energy optimization app
   - Manufacturing quality app

3. **Data Infrastructure** (not just compute)
   - Long-term outcome tracking
   - Context assembly systems
   - Privacy-preserving data access

4. **Validation Systems** (not just training)
   - Real-world testing
   - Human-in-the-loop systems
   - Continuous monitoring

### Research Priorities

1. **Non-Verifiable Reward Functions**
   - How to train AI when success metrics are years away?
   - Proxy metrics that correlate with long-term outcomes
   - Incremental validation strategies

2. **Jagged Intelligence Mitigation**
   - Robustness testing across capability spectrum
   - Failure mode analysis
   - Human-AI collaboration patterns

3. **Context Engineering**
   - Domain-specific data pipelines
   - Privacy-preserving context assembly
   - Multi-modal context integration

---

## The "Heart" of the Matter

The AI Manhattan Project isn't just about building infrastructure for AI. It's about building infrastructure for **AI that actually solves problems**.

**What works:**
- Domain-specific apps (not general models)
- Local deployment (not just cloud)
- Verifiable rewards (where possible)
- Visual outputs (not just text)

**What we need:**
- Long-term outcome tracking (for non-verifiable domains)
- Human-in-the-loop systems (for jagged intelligence)
- Real-world validation (not just benchmarks)
- Context engineering (domain-specific data pipelines)

**The infrastructure we build must support this reality, not our assumptions.**

---

## References

- [Karpathy 2025 LLM Year in Review](https://karpathy.bearblog.dev/year-in-review-2025/)
- [Animals vs. Ghosts](https://karpathy.bearblog.dev/animals-vs-ghosts/)
- [Verifiability](https://karpathy.bearblog.dev/verifiability/)
- [The Space of Minds](https://karpathy.bearblog.dev/the-space-of-minds/)

