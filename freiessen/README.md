# Hackathon Prototype: Intelligent Product Assistant (Langdock)

## Overview
This project delivers a hackathon prototype for an **intelligent assistant** that empowers **Product Managers** by transforming **scattered public market signals** into **clear, actionable product decisions**.

## Mission
Develop a prototype for an intelligent assistant that:
- aggregates dispersed market data,
- turns it into actionable insights,
- supports product decision-making across **Design / Develop / Explore / Re-think**.

**Prototype promise:** *“transform scattered market data into clear, actionable product decisions.”*

---

## Core Requirements

### 1) Automated Signal Detection
The solution must automatically aggregate data from **public sources** and identify relevant signals such as:
- feature launches
- technology trends
- patent activity
- forum/discussion activity
- other observable market events

**Data rule:** Use publicly available data; **simulated data is permitted** if needed.

---

### 2) Actionable Dashboard (Clickable Demo)
Provide a **clickable demo** of a dashboard that presents:
- insights
- summaries
- trends

The dashboard should be understandable for Product Managers and present outputs in an actionable format (e.g., decision labels like **Build / Invest / Ignore**).

---

### 3) User-Centric / Product Manager Design
Design the solution specifically from the perspective of a **Product Manager**.

Teams are required to create and use **5 distinct user personas** to guide design choices and demo outputs.

#### Required Personas (must be represented)
- **Josef, the Loyal Traditionalist**
- **Steffen, the Demanding Doer**
- **David, the Digital Innovator**
- **Volkmar, the Cautious Follower**
- **Nick, the Sustainable Companion**

---

## Optional Goals (Nice-to-Have)
If time allows, implement one or more:

1. **AI Persona Debate**
   - Simulate a debate between selected AI-powered personas.
   - Show how the debate leads to a final recommendation.
   - Highlight agreements/conflicts and refined suggestions.

2. **Human-in-the-Loop**
   - Add a feedback mechanism (e.g., rating slider) so a human user can evaluate and refine AI-generated recommendations.
   - Enable an iterative “learning loop.”

3. **Focus Area / Deep Dive**
   - Apply the solution to a specific business area (examples shown in the prompt):
     - Serial Construction
     - Drinking Water Management

4. **Downstream Process Integration**
   - Conceptually show how insights flow into the next phase of the product lifecycle, e.g.:
     - Text-to-brief
     - Text-to-CAD
     - or initiating a business case

---

## Testing Examples (Must Be Supported)
Your solution will be evaluated by running it against scenarios like these.

### Use Case 1: Reacting to a Competitor Move
**Scenario:**  
A fictional competitor issues a press release for a new product/solution.

**Task:**  
- Use your tool to analyze the event.
- Aggregate key information from public sources (news, patents, etc.).
- Assess:
  - relevance
  - potential impact
- Recommend an action: **Build / Invest / Ignore**
- Provide reasoning behind the recommendation.

---

### Use Case 2: Analyzing a Market Problem Signal
**Scenario:**  
Industry news/discussion indicates inefficiencies and high costs related to installing cooling systems in modular data centers.

**Task:**
- Investigate the problem signal.
- Validate/quantify the trend (e.g., via rise in mentions, sentiment shift, or other measurable indicators).
- Provide evidence for or against the trend.
- Recommend a new product direction based on analysis:
  - what it addresses
  - why it matters
  - what differentiates it

---

### Use Case 3: Scouting a New Technology
**Scenario:**  
A Netherlands university publishes a research paper about a novel technology (e.g., lead-free soldering for copper pipes) and claims suitability for drinking water installations.

**Task:**
- Evaluate the technology’s potential.
- Determine whether it is isolated or part of a broader trend (e.g., “green/healthy building materials”).
- Identify competitors/startups active in the field.
- Provide strategic next steps:
  - potential partnership
  - further internal research
  - or another strategic action

---

## Data & Constraints (Must Follow)
- **In scope**
  - **Public data only**
  - Simulated/synthetic data is allowed if needed (but still clearly labeled)

- **Confidentiality**
  - No internal company systems or confidential/sensitive information.

- **Technical constraints**
  - The solution should be a **working prototype** or **clickable demo**.
  - Do **not** build as a production-ready application.
  - Use of `n8n.io` or an integration layer is strongly encouraged.
  - Avoid requiring machine-readable local file storage; prefer integration-based loading.

- **Geography**
  - **European Union** context (where relevant)

---

## Deliverables
By the end of the hackathon, the deliverables must include:

- [ ] A working **prototype / clickable demo**
- [ ] Automated signal detection from public/simulated sources
- [ ] Dashboard with actionable insights/summaries/trends
- [ ] Persona-driven outputs using all **5 required personas**
- [ ] Capability demonstrated for **Use Case 1**, **Use Case 2**, and **Use Case 3**
- [ ] Optional: implemented features from the optional goals section (if time permits)

---

## Architecture (Fill in)
Describe your system at a high level.

### Components
1. **Data ingestion**
   - Public sources (and/or simulated datasets)
2. **Signal extraction**
   - entity extraction, event detection, classification
3. **Signal scoring & relevance**
   - how you decide what is “important”
4. **Trend quantification**
   - metrics used for UC2
5. **Knowledge/insight generation**
  
