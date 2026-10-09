# WasteSignal — 3-Minute Demo Video Script (180 Seconds)

> **Hackathon:** WeMakeDevs × AWS Environmental Hackathon  
> **Track:** Track 03 — Waste and Energy  
> **Target Video Duration:** Exactly 3:00 (180 seconds)  
> **Format:** Screen recording with voiceover (No face required)  
> **AWS Region:** `ap-southeast-2` (Asia Pacific – Sydney)

---

### [0:00 – 0:25] Part 1: Problem and Target Users

**Screen to show:**
- Open `http://localhost:5173/` (Landing Page).
- Slowly scroll from Hero down to the **"Track 03 • Environmental Impact"** section.

**Voiceover Script:**
> *"Hi judges, welcome to WasteSignal. We built this for Track 03: Waste and Energy.*
> 
> *Municipal waste operations in modern cities are almost entirely reactive. Sanitation fleets only discover overflows and illegal dumping after heaps become visible, odor spreads, or residents complain.*
> 
> *When waste stagnates due to route delays, frustrated communities often torch the piles in open air, choking neighborhoods with toxic PM2.5 and dioxins. Meanwhile, informal recyclers lose valuable materials to decomposition, and reactive garbage trucks burn excess diesel making chaotic emergency runs.*
> 
> *WasteSignal changes this with a core directive: Don't clean the next hotspot. Predict it."*

---

### [0:25 – 0:45] Part 2: WasteSignal Landing Page & Architecture

**Screen to show:**
- Scroll down to the **"Architecture Pipeline"** section or show `/api/aws/status` tab.

**Voiceover Script:**
> *"WasteSignal is built on enterprise AWS primitives in our selected Region, ap-southeast-2.*
> 
> *Raw municipal telemetry flows into Amazon S3 buckets. AWS Glue automatically registers and manages the operational_telemetry schema in our Glue Data Catalog. Amazon Athena runs serverless interactive SQL queries over historical recurrence patterns.*
> 
> *Our statistical recurrence engine forecasts a 7-day forward risk window, and Amazon Bedrock generates grounded, zero-hallucination operational explanations—with zero AWS credentials exposed to the browser."*

---

### [0:45 – 1:10] Part 3: Dataset Ingestion and Validation

**Screen to show:**
- Scroll to top of Landing Page and click **"⚡ 1-Click Judge Demo"**.
- App logs in instantly and opens `http://localhost:5173/dashboard?demo=judge`.
- Highlight the top banner: **"SYNTHETIC DEMONSTRATION DATA — S3 BUCKET & GLUE CATALOG ACTIVE"**.
- Quickly click **"Data Sources"** in the sidebar to show the uploaded S3 key and Glue schema.

**Voiceover Script:**
> *"With our 1-Click Judge Demo, we enter the workspace with a pre-seeded benchmark dataset.*
> 
> *The top banner immediately confirms our live AWS connection: telemetry is stored in our S3 bucket and registered in the Glue Catalog under wastesignal_db.*
> 
> *Notice our transparent label: SYNTHETIC DEMONSTRATION DATA. We never confuse prototype evaluation benchmarks with uncalibrated field claims."*

---

### [1:10 – 1:40] Part 4: Hotspot Scoring and 7-Day Prioritization

**Screen to show:**
- Return to **Overview** (`/dashboard`).
- Hover over the 3D map halos: Zone Z-09 (Transit Hub South) and Zone Z-07.
- Point to the priority ranking list and dynamic KPI strip.

**Voiceover Script:**
> *"On our live map, municipal sectors are color-coded by an explainable 0 to 100 risk score.*
> 
> *This score is not a black box and not an uncalibrated probability—it is a deterministic multi-signal ranking combining recurrence frequency, recent volume surges, and collection delays.*
> 
> *Notice Transit Hub South in Zone Z-09 at risk score 72. Our engine detected 8 active hotspots and generated 42 forward predictions across a 7-day planning horizon, giving dispatchers days of advance notice before street overflows escalate."*

---

### [1:40 – 2:05] Part 5: Hotspot Explanation & Bedrock/Fallback Distinction

**Screen to show:**
- Click **Zone Z-09 (Transit Hub South)** on the map or in the table.
- The **Hotspot Drawer** slides out.
- Highlight:
  1. "Why is this a hotspot?"
  2. "What signals contributed?"
  3. "Bedrock AI Explanation" & the badge (`RULE-BASED FALLBACK` or `AMAZON_BEDROCK`).

**Voiceover Script:**
> *"Clicking Zone Z-09 opens the Hotspot Inspection Drawer. Everything here is grounded in real telemetry.*
> 
> *It breaks down the root causes: 3 recurring incidents, an average collection delay of 48 minutes, and commercial volume pressure.*
> 
> *Here, the explanation layer recommends advancing the route schedule by 45 minutes before evening peak hours.*
> 
> *Notice our transparent tag: because model activation is pending in our AWS Bedrock console, WasteSignal gracefully activates a rule-based fallback without ever faking an AI response."*

---

### [2:05 – 2:35] Part 6: Operational Intervention & Persistent State Change

**Screen to show:**
- Click **"Operations"** in the sidebar (`/operations`).
- Locate intervention `INT-Z09`.
- Change dropdown from `PENDING` to `IN PROGRESS`.
- Refresh the page to show persistence.
- Change dropdown from `IN PROGRESS` to `RESOLVED`.
- Return to **Overview** (`/dashboard`) to show updated KPI counts.

**Voiceover Script:**
> *"In the Operations module, WasteSignal closes the operational loop.*
> 
> *Interventions are staged automatically from risk predictions. Dispatchers follow a strict state machine: Pending, Assigned, In Progress, and Resolved.*
> 
> *Let's dispatch Crew C-4 to Zone Z-09 by moving status to In Progress. If we refresh, the state persists in our backend data store.*
> 
> *Once field crews clear the site before overflow occurs, we mark it Resolved. Returning to the overview shows our live KPIs updated immediately."*

---

### [2:35 – 3:00] Part 7: Environmental Measurement Plan & Closing

**Screen to show:**
- Click **"Platform Settings"** (`/settings`) or navigate to Landing Page **Impact Ribbon**.
- Show the 5-metric pilot framework and literature citations.

**Voiceover Script:**
> *"What is the real-world outcome? Clean school corridors, reduced illegal trash fires, and advance volume warnings for informal recyclers to salvage clean materials before wet contamination.*
> 
> *In our documented pilot measurement framework, predictive scheduling targets a 15 to 35% reduction in diesel transit miles and verifiable avoidance of open burning.*
> 
> *WasteSignal: Built on AWS, tested for real cities. Thank you!"*

---

### Recording Checklist for the Creator:
- [ ] Browser window sized to 1920x1080 (16:9).
- [ ] Local dev server running (`npm run dev`) with backend on `:3001` and client on `:5173`.
- [ ] Clear browser cache or use an Incognito window.
- [ ] Microphone tested with low background noise.
- [ ] Rehearse twice with a stopwatch to hit the exact 3-minute mark.
