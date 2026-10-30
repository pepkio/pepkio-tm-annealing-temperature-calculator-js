# Pepkio Tm / Annealing Temperature Calculator

Node.js ESM library for computing PCR primer Tm, suggested annealing temperatures, and pair QC by calling the Pepkio Tools REST API from scripts, CI jobs, or browser bundles.

# What It Does

Primer melting temperature (Tm) and annealing temperature (Ta) guide PCR setup, multiplex panel design, and oligo order review. This package calls the hosted Pepkio Tm / Annealing Temperature Calculator over REST so you can run single pairs or batch lists programmatically—without reimplementing thermodynamic models locally.

Use it from Node.js (≥18), bundlers, or CI to fetch the tool manifest, run named examples, or submit custom input JSON. Each completed run returns per-primer Tm, ΔTm, polymerase-specific suggested Ta, GC%, hairpin and dimer QC flags, Go/Flag/Fail status, optional method comparison values, and a shareable permalink. Sequences are transmitted to the Pepkio API for programmatic runs.

# Features

- Single primer pair or batch mode (up to 200 pairs via `batch_csv`, `batch_rows`, or CSV/TSV text)
- Polymerase presets: Q5, Phusion, Taq, KAPA HiFi, or custom Na⁺ and Mg²⁺ (mM)
- DMSO (%) and betaine (M) corrections applied to Tm
- Configurable oligo concentration for Tm (default 250 nM)
- Output: `tm_fwd`, `tm_rev`, `delta_tm`, `ta_suggested`, GC%, hairpin/dimer ΔG, Go/Flag/Fail status
- Method comparison fields (Wallace, GC%, raw SantaLucia, Breslauer) alongside corrected Tm
- Sequence validation: A/C/G/T only; invalid batch rows return row-level errors
- Manifest helpers: `getManifest`, `listExamples`, `getExampleInput`
- `run`, `getRun`, and `waitForRun` for sync and async tools
- CLI: `pepkio-tm-annealing-temperature-calculator manifest` and `run`
- Configurable via `PEPKIO_API_KEY` and `PEPKIO_API_BASE_URL`

# Installation

```bash
npm install pepkio-tm-annealing-temperature-calculator
```

Requires Node.js 18 or newer.

# Configuration

Set an API key with **tools:run** scope before calling `run()`:

```bash
export PEPKIO_API_KEY="your-key"
```

Create a key at [Pepkio API keys](https://www.pepkio.com/account/api-keys).

Optional overrides:

| Variable | Purpose |
|----------|---------|
| `PEPKIO_API_KEY` | Production API key (required for `run`) |
| `LOCAL_PEPKIO_API_KEY` | Local dev key when `PEPKIO_API_BASE_URL` points to `tools.localtest.me` |
| `PEPKIO_API_BASE_URL` | API host (default `https://tools.pepkio.com`) |
| `PEPKIO_SSL_VERIFY` | Set to `0` or `false` to disable TLS verify (local dev disables verify for `localtest.me` by default) |

# Quick Example

```typescript
import { PepkioClient } from "pepkio-tm-annealing-temperature-calculator";

const client = new PepkioClient({ apiKey: process.env.PEPKIO_API_KEY });

const input = await client.getExampleInput("single_q5_pair");
const result = await client.run(input);

const single = result.result?.single as Record<string, unknown>;
console.log("Tm fwd:", single.tm_fwd, "Suggested Ta:", single.ta_suggested);
console.log(result.permalink);
```

# CLI

```bash
npx pepkio-tm-annealing-temperature-calculator manifest --examples
npx pepkio-tm-annealing-temperature-calculator run --example single_q5_pair
```

Pass `--base-url` and `--api-key` to override environment defaults.

# Typical Use Cases

- **Q5 primer pair review** (`single_q5_pair`) — check Tm, ΔTm, and suggested Ta before oligo order
- **Multiplex panel QC** (`batch_multiplex`) — screen many primer pairs from CSV in one run
- **GC-rich PCR with DMSO** — include `dmso_percent` in custom JSON to match master-mix additives
- **Core facility or NGS amplicon review** — batch QC on submitted primer lists with shareable permalinks
- **Gradient PCR planning** — use suggested Ta and ΔTm to set thermal cycler temperature ranges

# Scientific Background

Tm estimates duplex stability under stated salt, magnesium, oligo concentration, and additive conditions. The engine uses SantaLucia 1998 nearest-neighbor thermodynamics with monovalent salt correction (Na⁺ and Mg²⁺ via equivalent sodium), DMSO (−0.675 °C per 1%), and betaine (−0.75 °C per 1 M) adjustments. Suggested Ta is computed from the lower primer Tm minus a polymerase-specific offset—not a generic Tm − 5 °C rule. Hairpin and dimer ΔG values are heuristic QC flags for screening, not full folding simulations.

# Web Application

For researchers who prefer a graphical interface, an interactive web version is available.

Web Application: https://www.pepkio.com/tools/tm-annealing-temperature-calculator

The web UI runs calculations in the browser (sequences are not uploaded during interactive use), supports batch CSV paste or upload, DMSO and betaine adjustments, method comparison panels, sortable results, CSV export, printable worksheets, and shareable links.

# Documentation and Resources

GitHub Repository: https://github.com/pepkio/pepkio-tm-annealing-temperature-calculator-js

Web Application: https://www.pepkio.com/tools/tm-annealing-temperature-calculator

Python client (PyPI): https://pypi.org/project/pepkio-tm-annealing-temperature-calculator/

# About Pepkio

Pepkio (https://www.pepkio.com/) develops software tools and bioinformatics solutions for life science researchers, including laboratory calculators and analysis services.
