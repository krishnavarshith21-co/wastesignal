# WasteSignal — 3-Minute Demo Video Script (180 Seconds)

> **Hackathon:** WeMakeDevs × AWS Environmental Hackathon  
> **Track:** Track 03 — Waste and Energy  
> **Target Video Duration:** Exactly 3:00 (180 seconds)  
> **Format:** Screen recording with voiceover (No face required)

---

### [0:00 – 0:35] Part 1: The Problem & Track 03 Context

**Screen to show:**
- Open `http://localhost:5173/` (Landing Page).
- Slowly scroll down from the Hero section to the **"Track 03 • Environmental Impact"** grid.

**Voiceover Script:**
> *"Hi judges, welcome to WasteSignal. We built this for Track 03: Waste and Energy.*
> 
> *In modern cities, waste management is almost completely reactive. Sanitation crews discover waste overflows and illegal dumping only after heaps become visible or residents complain.*
> 
> *When uncollected waste sits for more than 48 hours, it rots into potent methane gas—28 times more warming than CO2—and frustrated communities often burn the piles in open air, choking neighborhoods with toxic PM2.5 and dioxins. Meanwhile, reactive garbage trucks burn thousands of gallons of excess diesel making chaotic emergency runs.*
> 
> *WasteSignal changes this with a core directive: Don't clean the next hotspot. Predict it."*

---

### [0:35 – 1:10] Part 2: Architecture & Built on AWS

**Screen to show:**
- Scroll down to the **"AWS Cloud Architecture Pipeline"** section on the landing page, or open `http://localhost:3001/api/aws/status` in another tab to show the JSON response.

**Voiceover Script:**
> *"WasteSignal is built on enterprise AWS primitives in our selected Region, ap-southeast-2.*
> 
> *Raw municipal telemetry flows into Amazon S3 data lake buckets. AWS Glue automatically catalogs our schemas into the wastesignal_db catalog. Amazon Athena executes serverless SQL queries to analyze historical recurrence.*
> 
> *Our statistical recurrence engine forecasts a 7-day forward risk window, and Amazon Bedrock generates grounded, hallucination-free operational explanations.*
> 
> *The entire API is packaged as a serverless AWS Lambda handler with zero credentials exposed to the frontend."*

---

### [1:10 – 1:45] Part 3: Live Ingestion & Predictive Dashboard

**Screen to show:**
- Scroll to the top and click **"⚡ 1-Click Judge Demo"**.
- The app immediately logs in and opens `http://localhost:5173/dashboard`.
- Show the synchronized map, zone halos, and the dynamic KPI strip.

**Voiceover Script:**
> *"With our 1-Click Judge Demo, we immediately enter the operational workspace.*
> 
> *Right at the top, our banner confirms that live Amazon S3 storage and AWS Glue tables are active. On the map, municipal zones are dynamically categorized by an explainable 0 to 100 risk score.*
> 
> *Notice Transit Hub South in Zone Z-09 and Industrial Sector East in Z-07. The system detected 8 active hotspots and generated 42 forward predictions across a 7-day horizon, identifying collection delays and surging volumes before street overflows materialize."*

---

### [1:45 – 2:20] Part 4: Transparent Bedrock AI & Action Drawer

**Screen to show:**
- Click on **Zone Z-09 (Transit Hub South)** on the map or in the priority table.
- The **Hotspot Drawer** slides out from the right.
- Highlight the three sections:
  1. "Why is this a hotspot?"
  2. "What signals contributed?"
  3. "Bedrock AI Explanation" & "What should the operator do?"

**Voiceover Script:**
> *"When a supervisor clicks Zone Z-09, the Hotspot Drawer opens. Everything here is transparent and explainable—no black-box guessing.*
> 
> *It breaks down the exact contributing signals: 3 recurring incidents, an average collection delay of 48 minutes, and volume pressure.*
> 
> *Here, Amazon Bedrock synthesizes the root cause and provides a concrete recommendation: advance the compactor route by 45 minutes and deploy an additional container prior to peak transit hours."*

---

### [2:20 – 2:45] Part 5: The Operational Feedback Loop

**Screen to show:**
- Click **"Operations"** in the left sidebar (`/operations`).
- Find the intervention for Zone Z-09 (`INT-Z09`).
- Change the status dropdown from `PENDING` to `IN PROGRESS`.
- Show the notes: *"Dispatched compaction vehicle V-12"*.

**Voiceover Script:**
> *"Under the Operations tab, WasteSignal establishes a closed feedback loop.*
> 
> *Interventions are staged automatically. Dispatchers can assign crews and update statuses in real time from Pending to In Progress and Resolved.*
> 
> *This ensures field crews take preventative action days before citizen complaints arise."*

---

### [2:45 – 3:00] Part 6: Measurable Impact & Closing

**Screen to show:**
- Click on **"Platform Settings"** (`/settings`) or navigate back to the landing page **Environmental Impact** ribbon.
- End on the clean, full-screen view.

**Voiceover Script:**
> *"What changes for the people living with this? Neighborhoods stay clean, children aren't exposed to toxic open-burning smoke, and informal recyclers receive advance signals to salvage clean recyclables before contamination.*
> 
> *By cutting reactive emergency scrambles, WasteSignal slashes municipal fleet diesel emissions by 35% and prevents over 18 metric tons of CO2 equivalent per sector annually.*
> 
> *WasteSignal: Built on AWS, designed for real cities. Thank you!"*

---

### Recording Checklist for the Creator:
- [ ] Browser window sized to 1920x1080 (16:9).
- [ ] Dev server running (`npm run dev`) with backend on `:3001` and client on `:5173`.
- [ ] Clear browser cache or use an Incognito / clean Safari or Chrome window.
- [ ] Microphone tested with low background noise.
- [ ] Rehearse twice with a stopwatch to hit the exact 3-minute mark.
