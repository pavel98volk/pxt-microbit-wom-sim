# Agent Guide: pxt-microbit (WoM Sim Extension)

This repository is a customized target for [Microsoft MakeCode for micro:bit (PXT)](https://github.com/microsoft/pxt-microbit) with custom extensions (such as World of Modules / YahBoom Module-World and TM1650). It enables extending both MakeCode blocks and the web-based micro:bit simulator with custom interactive parts.

---

## 1. How to Run the Code

MakeCode targets use the `pxt` command-line tool (installed globally or via npm).

### Prerequisites
- Node.js (v8.9.4+ / recommended v16+)
- PXT CLI installed globally:
  ```bash
  npm install -g pxt
  ```

### Running the Local Dev Server
From the repository root (`/home/tresspass/Projects/pxt-microbit-wom-sim`):
```bash
pxt serve
```

### Useful Options & Flags
- `pxt serve --no-browser` (or `--nb`): Starts the local server without auto-opening the browser.
- `pxt serve --rebundle` (or `--rb`): Skips full rebuilds and refreshes target information quickly when updating scripts/extensions.
- `pxt serve --port 3232 --wsport 3233`: Runs on custom HTTP / WebSocket ports (defaults: 3232 / 3233).

> **Authentication Note**: When `pxt serve` starts, always open the URL containing the local token (printed in the terminal output, e.g., `http://localhost:3232/?ws=...#local_token=...`). Opening the bare URL directly will prevent the editor from loading projects.

---

## 2. How to Build the Code

Refer to [README.md](file:///home/tresspass/Projects/pxt-microbit-wom-sim/README.md) for full developer prerequisites and toolchain options.

### Building the Target
To build the target, simulator, and bundled packages:
```bash
pxt buildtarget
```
- **Clean builds**: Run `pxt buildtarget --clean` or `pxt clean` to clear `built/` cache if unexpected compilation or bundling errors occur.

### Verification After Changes
Validate the full target builds cleanly:
```bash
pxt buildtarget
```
For scoped checks on a single extension:
```bash
cd libs/<package> && pxt build
```

### Linking Subdirectories & Dependencies Manually
If required sibling subdirectories (`pxt`, `pxt-common-packages`) are not prepared or linked, stop execution and ask the user to performa the following:
> **Manual Action Required**: You must build and link external and dependent packages manually before serving:
> ```bash
> # 1. Build base pxt (in sibling directory)
> cd ../pxt
> npm install && npm run build
>
> # 2. Link pxt-common-packages to pxt
> cd ../pxt-common-packages
> npm install && npm link ../pxt
>
> # 3. Link this repository to both
> cd ../pxt-microbit-wom-sim
> npm link ../pxt ../pxt-common-packages
> ```

---

## 3. Codebase Structure & Semantic Breakdown

The codebase is organized into distinct layers separating editor configuration, extension block definitions, simulator runtime, and visual components:

```
pxt-microbit-wom-sim/
├── pxtarget.json          # Target manifest: bundled packages (`bundleddirs`), simulator config, board visuals
├── targetconfig.json      # Gallery entries, release configs
├── sim/                   # Simulator runtime
│   ├── dalboard.ts        # DalBoard (extends CoreBoard): registers builtinParts, builtinVisuals, builtinPartVisuals
│   ├── tsconfig.json      # Sim build config. Globs `*.ts`, `state/*.ts`, `visuals/*.ts` auto-include new files. External deps from pxt-common-packages must be added explicitly.
│   ├── visuals/           # SVG/DOM views implementing `visuals.IBoardPart<T>` (board, LED matrix, servos)
│   ├── state/             # State classes under `namespace pxsim` (pins, sensors, I2C devices)
│   └── public/            # simulator.html shell, SVG part assets, sounds
├── libs/                  # Extension packages (each has pxt.json, block TS, locales)
│   ├── core/              # Core runtime, pins, basic blocks
│   ├── Module-World/      # YahBoom Module-World sensors/actuators
│   ├── tm1650/            # TM1650 4-digit 7-segment display
│   └── ...                # radio, servo, microphone, datalogger, etc.
├── editor/                # Editor UI overrides
├── fieldeditors/          # Custom Blockly field editors (LED grid, sound picker)
├── docs/                  # MakeCode documentation and tutorials
└── theme/                 # Semantic UI theme customizations
```

### Key Integration Points
- **Block ↔ Sim binding**: Extension blocks in `libs/<pkg>/*.ts` use `//% parts="<name>"` to declare which simulator part they need. The part name must match a key in `DalBoard.builtinParts`.
- **`sim/dalboard.ts`**: Central registry. Three maps: `builtinParts["name"]` → state instance, `builtinVisuals["name"]` → view factory, `builtinPartVisuals["name"]` → SVG thumbnail factory.
- **`sim/tsconfig.json`**: Uses globs (`*.ts`, `state/*.ts`, `visuals/*.ts`) so new files in `sim/`, `sim/state/`, `sim/visuals/` are auto-included. But if you need types from `pxt-common-packages`, you must add explicit paths here.
- **`pxtarget.json` → `bundleddirs`**: Extension dirs in `libs/` must be listed here to be bundled with the target.

---

## 4. Extending the Simulator with Custom Interactive Elements

You can read `agents/ARCH.md` to obtain necessary rules and information when extending simulator functionality.
Additionaly, you should read `agents/NOTES.md` and extend it with IMPORTANT information that should be later used by other agents modifying this codebase.
You can read and extend `agents/NOTES.md` should contain important architectural decisions or correct information that was successfully obtained after a long research or
several prior unsuccessful attempts, you can extend this file.

You can extend `./agents/FEEDBACK.md` with warnings regarding untruthful or misleading information in `AGENTS.md`, `./agents/ARCH.md` and `./agents/NOTES.md`.
Do not use `./agents/FEEDBACK.md` as source of truth, this file is for human developer to analyze flaws and take action.
