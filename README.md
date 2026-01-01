Here is the complete `README.md` content in a code block for you to copy:

```markdown
# 🛠️ GameNative Config Converter

> **The missing link between community data and your GameNative emulator.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Platform: Web](https://img.shields.io/badge/Platform-Web-blue.svg)]()

## 🚨 The Problem
The GameNative/Winlator community is amazing. Users rigorously test games and upload configuration data (FPS, drivers, environment variables) to community databases. 

**But there is a disconnect:**
1.  **The Database** contains the perfect settings in raw text format.
2.  **The App** requires you to manually type these settings one by one.
3.  **The Result:** Typos, frustration, and 10 minutes wasted just to crash on launch.

## ✅ The Solution
**GameNative Config Converter** is a single-page web tool that bridges this gap. It takes the "messy" raw text dump from community reports and instantly compiles it into a clean, structured `.json` file that the GameNative app can import directly.

**Stop typing. Start playing.**

---

## ✨ Features

* **Intelligent Parsing:** Handles "dense" raw text where keys and values are packed without spacing.
* **Smart Type Inference:** Automatically detects and converts `true`/`false` to booleans and numeric strings to integers/floats.
* **Junk Filtration:** Automatically strips out useless metadata (e.g., `avg fps`, `session length`, `sessionMetadata`) that clogs up config files.
* **Edge Case Handling:** specifically fixes the "Controller Bindings" bug where the parser would mistake section headers for driver versions.
* **Android-Ready Structure:** Outputs the exact nested JSON structure (`containerName`, `config` wrapper) required by the GameNative Import/Export source code.

---

## 🚀 How to Use

### 1. Get the Raw Data
Go to your preferred GameNative/Winlator config database or spreadsheet. Click "View" on a config report and copy **all** the text.

> **The text usually looks like this mess:**
> ```text
> wineVersion
> 8.0
> graphicsDriverAdreno
> turnip
> showFPS
> true
> envVars
> WINE_DEBUG=warn
> avg fps
> 60
> ```

### 2. Paste & Convert
1.  Open the [GameNative Config Converter](https://yourname.github.io/repo-name). *(Replace with your actual GitHub Pages link)*
2.  Paste the raw text into the input box.
3.  Click **"Download Clean Config"**.

### 3. Import to App
1.  Transfer the downloaded `config.json` to your Android device.
2.  Open **GameNative**.
3.  Go to the **Containers** tab.
4.  Select **Import Config** and choose your file.
5.  Launch your game!

---

## 🧩 Technical Details

This tool was built to support the **Import/Export JSON Schema** defined in the GameNative Android source code.

### The Conversion Logic
The tool performs a "Lookahead" parse:
1.  It iterates through the raw text line by line.
2.  It checks a strictly defined `KNOWN_KEYS` set to differentiate between a Key and a Value.
3.  It handles empty values (where a Key is immediately followed by another Key) without shifting the data alignment.
4.  It gathers individual controller buttons (`A`, `B`, `DPAD UP`) and nests them into a `controllerEmulationBindings` object.

### Comparison

| Raw Input (Messy) | Output JSON (Clean) |
| :--- | :--- |
| `graphicsDriver`<br>`vortek-2.1`<br>`avg fps`<br>`60`<br>`A`<br>`KEY_SPACE` | <pre lang="json">{<br>  "version": 1,<br>  "containerName": "Imported Config",<br>  "config": {<br>    "graphicsDriver": "vortek-2.1",<br>    "controllerEmulationBindings": {<br>      "A": "KEY_SPACE"<br>    }<br>  }<br>}</pre> |

---

## ⚠️ Compatibility Note
This tool generates JSON files compatible with GameNative builds that include the **Import/Export PR (#232)**. If you are using an older version of the app, you may need to update or build from source to see the "Import" button.

---

## 🤝 Contributing
Found a new configuration key that the parser misses?
1.  Fork the repo.
2.  Add the key to the `KNOWN_KEYS` set in `index.html`.
3.  Submit a Pull Request.

## 📄 License
This project is licensed under the [MIT License](LICENSE) - free to use, modify, and host.

---

*Not affiliated with the official GameNative/Winlator development team. Built by the community, for the community.*

```
