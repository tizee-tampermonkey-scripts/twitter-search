# Twitter/X Advanced Search Builder

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0-green.svg)]()
[![Userscript](https://img.shields.io/badge/Userscript-Tampermonkey-orange.svg)]()

A Tampermonkey userscript that provides a polished, draggable UI for building complex Twitter/X search queries with native search integration and clipboard support.

## 📋 Table of Contents

- [Features](#-features)
- [UI Overview](#-ui-overview)
- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

- **Polished UI**: Modern glass-morphism design matching Twitter/X's aesthetic
- **Draggable Window**: Click and drag the header to reposition the panel
- **Edge Snapping**: Automatically snaps to screen edges when dragged near borders
- **Minimize/Expand**: Collapse to compact header or expand to full form
- **Real-time Validation**: Input validation with helpful error messages
- **Search Integration**: Build and execute searches directly in Twitter/X
- **Clipboard Support**: Copy generated search queries to clipboard
- **Form Persistence**: Window position and minimization state saved between sessions
- **Toast Notifications**: Visual feedback for actions and errors

## 📸 UI Overview

The search builder appears as a floating panel in the top-left corner of Twitter/X with the following controls:

- **Exact phrase**: Match exact phrases (wrapped in quotes)
- **Any of these words**: Use `OR` operators for multiple keywords
- **Exclude words**: Filter out tweets containing specific terms
- **From account**: Search tweets from specific users (without @ symbol)
- **Date range**: Specify "since" and "until" dates
- **Media filters**: Limit results to tweets with links or media
- **Build & search**: Execute search directly on Twitter/X
- **Copy query**: Copy generated search string to clipboard
- **Clear**: Reset all form inputs
- **Minimize/Expand**: Toggle between compact and full view

## 🚀 Installation

1. **Install a userscript manager** (if not already installed):
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome/Edge/Safari/Firefox)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. **Install the userscript**:
   - Click the raw link for `user.js` in this repository
   - Your userscript manager will detect the script and prompt for installation
   - Review the script details and click "Install"

3. **Navigate to Twitter/X**:
   - Visit https://twitter.com or https://x.com
   - The search builder panel should appear in the top-left corner

## 🎮 Usage

### Basic Workflow

1. **Expand the panel** (if minimized) by clicking the `+` button
2. **Fill in search criteria** using the various input fields
3. **Click "Build & search"** to execute the search directly on Twitter/X
   - The script will attempt to use Twitter's native search box
   - If not found, it will navigate to the search results page
4. **Alternatively, click "Copy query"** to copy the search string to clipboard
5. **Use "Clear"** to reset all form inputs

### Search Query Examples

- **Exact phrase**: `"artificial intelligence"` → `"artificial intelligence"`
- **Multiple keywords**: `apple OR google OR microsoft` → `(apple OR google OR microsoft)`
- **Exclude words**: `fruit` → `-fruit`
- **From user**: `x` → `from:x`
- **Date range**: `2024-01-01` to `2024-12-31` → `since:2024-01-01 until:2024-12-31`
- **Media filters**: Check "Has links" → `filter:links`

### Advanced Features

- **Drag & Drop**: Click and hold the header to reposition the panel
- **Edge Snapping**: Drag near screen edges to snap the panel into place
- **Minimize**: Click the `−` button to collapse the panel to a compact header
- **Position Persistence**: Panel position and state are saved between page reloads

## ⚙️ Configuration

The script stores the following values using `GM_setValue`/`GM_getValue`:

- `searchBuilderLeft`: Horizontal position (in pixels)
- `searchBuilderTop`: Vertical position (in pixels)
- Window minimization state (implicit via CSS classes)

To reset position or clear stored values, use your userscript manager's storage viewer or reinstall the script.

## 🛠️ Development

### Project Structure

```
twitter-search/
├── user.js          # Main userscript file
└── README.md        # This documentation
```

### Key Implementation Details

- **Pure JavaScript**: No external dependencies
- **CSS-in-JS**: Styles injected via `GM_addStyle`
- **Modern DOM APIs**: Uses `requestAnimationFrame` for smooth dragging
- **Clipboard API**: Falls back to `document.execCommand` for compatibility
- **Twitter Integration**: Attempts to use native search elements first

### Building/Modifying

1. **Edit `user.js`** directly with your preferred code editor
2. **Test changes** by reloading the script in Tampermonkey and visiting Twitter/X
3. **Debug**: Use browser developer tools (console logs are minimal)

### Code Architecture

- **UI Creation**: Dynamically creates DOM elements with proper styling
- **Event Handling**: Separate listeners for drag, input validation, and button clicks
- **Validation System**: Real-time validation with visual error indicators
- **Search Logic**: Builds Twitter search syntax from form inputs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is an unofficial userscript and is not affiliated with or endorsed by Twitter, Inc. or X Corp. Use at your own risk. The script may break if Twitter/X changes its website structure.

## 🙏 Acknowledgments

- **Tampermonkey** for providing an excellent userscript platform
- **Twitter/X** for their search syntax documentation
- Contributors and testers who help improve the script

---

**Note**: The script is designed to work with Twitter/X's current (2026) website structure. If you encounter issues, please check for updates or report them in the repository issues.