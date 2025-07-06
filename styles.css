/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'MS Sans Serif', 'Tahoma', sans-serif;
    font-size: 11px;
    overflow: hidden;
    user-select: none;
    -webkit-font-smoothing: none;
    font-smoothing: none;
}

/* Windows 98 Theme Variables */
.theme-win98 {
    --bg-primary: #c0c0c0;
    --bg-secondary: #808080;
    --bg-tertiary: #ffffff;
    --bg-quaternary: #f0f0f0;
    --border-light: #ffffff;
    --border-dark: #808080;
    --border-darker: #404040;
    --text-primary: #000000;
    --text-secondary: #808080;
    --text-link: #0000ff;
    --accent-color: #000080;
    --selected-bg: #000080;
    --selected-text: #ffffff;
    --button-face: #c0c0c0;
    --window-bg: #c0c0c0;
    --highlight-color: #316ac5;
    --error-color: #ff0000;
    --success-color: #008000;
}

/* Windows 95 Theme */
.theme-win95 {
    --bg-primary: #c0c0c0;
    --bg-secondary: #808080;
    --bg-tertiary: #ffffff;
    --bg-quaternary: #f0f0f0;
    --border-light: #dfdfdf;
    --border-dark: #7f7f7f;
    --border-darker: #000000;
    --text-primary: #000000;
    --text-secondary: #808080;
    --text-link: #0000ff;
    --accent-color: #000080;
    --selected-bg: #000080;
    --selected-text: #ffffff;
    --button-face: #c0c0c0;
    --window-bg: #c0c0c0;
    --highlight-color: #316ac5;
    --error-color: #ff0000;
    --success-color: #008000;
}

/* Classic Green Theme */
.theme-green {
    --bg-primary: #004000;
    --bg-secondary: #002000;
    --bg-tertiary: #001000;
    --bg-quaternary: #003000;
    --border-light: #008000;
    --border-dark: #002000;
    --border-darker: #000000;
    --text-primary: #00ff00;
    --text-secondary: #008000;
    --text-link: #00ff80;
    --accent-color: #004000;
    --selected-bg: #008000;
    --selected-text: #000000;
    --button-face: #004000;
    --window-bg: #001000;
    --highlight-color: #00ff00;
    --error-color: #ff4040;
    --success-color: #00ff00;
}

/* Amber Terminal Theme */
.theme-amber {
    --bg-primary: #2f1500;
    --bg-secondary: #1f0f00;
    --bg-tertiary: #0f0500;
    --bg-quaternary: #4f2500;
    --border-light: #ff8000;
    --border-dark: #803000;
    --border-darker: #401800;
    --text-primary: #ffb000;
    --text-secondary: #ff8000;
    --text-link: #ffc000;
    --accent-color: #2f1500;
    --selected-bg: #ff8000;
    --selected-text: #000000;
    --button-face: #2f1500;
    --window-bg: #0f0500;
    --highlight-color: #ffb000;
    --error-color: #ff6040;
    --success-color: #ffb000;
}

/* Main Layout */
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--window-bg);
    color: var(--text-primary);
}

/* Toolbar */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-dark);
    box-shadow: inset 1px 1px 0 var(--border-light), inset -1px -1px 0 var(--border-darker);
    min-height: 32px;
}

.toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--button-face);
    border: 2px outset var(--button-face);
    color: var(--text-primary);
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    min-height: 23px;
    white-space: nowrap;
}

.toolbar-btn:hover {
    background: #d4d0c8;
}

.toolbar-btn:active {
    border-style: inset;
    background: #a8a8a8;
}

.toolbar-btn:disabled {
    color: var(--text-secondary);
    background: var(--bg-secondary);
    cursor: default;
}

.toolbar-separator {
    width: 1px;
    height: 20px;
    background: var(--border-dark);
    margin: 0 4px;
}

.theme-selector {
    padding: 2px 4px;
    font-family: inherit;
    font-size: 11px;
    background: var(--bg-tertiary);
    border: 2px inset var(--button-face);
    color: var(--text-primary);
    min-width: 100px;
}

/* Main Layout */
.main-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
}

/* Sidebar */
.sidebar {
    width: 280px;
    min-width: 200px;
    max-width: 400px;
    background: var(--bg-primary);
    border-right: 1px solid var(--border-dark);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    resize: horizontal;
    transition: width 0.2s ease;
}

.sidebar.collapsed {
    width: 0;
    min-width: 0;
    border-right: none;
    opacity: 0;
}

.sidebar-header {
    padding: 8px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-dark);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: inset 1px 1px 0 var(--border-light);
}

.sidebar-header h3 {
    font-size: 12px;
    font-weight: bold;
}

.sidebar-toggle {
    background: var(--button-face);
    border: 1px outset var(--button-face);
    padding: 2px 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 10px;
}

.sidebar-toggle:hover {
    background: #d4d0c8;
}

.sidebar-toggle:active {
    border-style: inset;
}

/* Feed Tree */
.feed-tree {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    background: var(--bg-primary);
}

.feed-group {
    margin-bottom: 4px;
}

.group-header {
    display: flex;
    align-items: center;
    padding: 4px;
    cursor: pointer;
    background: var(--bg-primary);
    border: 1px solid transparent;
    border-radius: 0;
}

.group-header:hover {
    background: #d4d0c8;
    border: 1px solid var(--border-dark);
}

.group-header.selected {
    background: var(--selected-bg);
    color: var(--selected-text);
}

.group-expand {
    width: 12px;
    font-size: 10px;
    margin-right: 4px;
    text-align: center;
}

.group-icon {
    margin-right: 4px;
    font-size: 12px;
}

.group-name {
    flex: 1;
    font-weight: bold;
    font-size: 11px;
}

.unread-count, .feed-unread {
    background: var(--accent-color);
    color: var(--selected-text);
    padding: 1px 4px;
    border-radius: 2px;
    font-size: 9px;
    min-width: 16px;
    text-align: center;
    font-weight: bold;
}

.group-feeds {
    margin-left: 16px;
    transition: max-height 0.2s ease;
}

.feed-item {
    display: flex;
    align-items: center;
    padding: 3px 4px;
    cursor: pointer;
    border: 1px solid transparent;
    margin-bottom: 1px;
}

.feed-item:hover {
    background: #d4d0c8;
    border: 1px solid var(--border-dark);
}

.feed-item.selected {
    background: var(--selected-bg);
    color: var(--selected-text);
}

.feed-item.error {
    background: #ffe0e0;
    color: var(--error-color);
}

.feed-icon {
    margin-right: 6px;
    font-size: 10px;
}

.feed-name {
    flex: 1;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.feed-status {
    font-size: 9px;
    margin-left: 4px;
}

/* Sidebar Status */
.sidebar-status {
    border-top: 1px solid var(--border-dark);
    padding: 8px;
    background: var(--bg-primary);
    font-size: 10px;
    box-shadow: inset 0 1px 0 var(--border-light);
}

.status-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
    line-height: 1.2;
}

.status-label {
    color: var(--text-secondary);
}

.status-value {
    font-weight: bold;
}

/* Content Area */
.content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--window-bg);
}

/* Tab Bar */
.tab-bar {
    display: flex;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-dark);
    padding-left: 4px;
    min-height: 28px;
    align-items: flex-end;
}

.tab {
    display: flex;
    align-items: center;
    padding: 4px 12px 4px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-dark);
    border-bottom: none;
    cursor: pointer;
    margin-right: 2px;
    position: relative;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}

.tab.active {
    background: var(--window-bg);
    border-bottom: 1px solid var(--window-bg);
    z-index: 1;
    border-top: 2px solid var(--highlight-color);
}

.tab-text {
    font-size: 11px;
    margin-right: 8px;
    white-space: nowrap;
}

.tab-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: var(--text-primary);
    border-radius: 2px;
}

.tab-close:hover {
    background: var(--error-color);
    color: #ffffff;
}

.new-tab-btn {
    background: var(--button-face);
    border: 1px outset var(--button-face);
    cursor: pointer;
    padding: 4px 8px;
    font-size: 11px;
    margin-left: 4px;
    margin-bottom: 2px;
}

.new-tab-btn:hover {
    background: #d4d0c8;
}

.new-tab-btn:active {
    border-style: inset;
}

/* Tab Panels */
.tab-panels {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.tab-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    overflow: hidden;
}

.tab-panel.active {
    display: block;
}

/* Articles Layout */
.articles-layout {
    display: flex;
    height: 100%;
}

.article-list {
    width: 400px;
    min-width: 300px;
    max-width: 600px;
    border-right: 1px solid var(--border-dark);
    display: flex;
    flex-direction: column;
    resize: horizontal;
    overflow: hidden;
}

.list-header {
    padding: 8px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-dark);
    box-shadow: inset 1px 1px 0 var(--border-light);
}

.list-controls {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
}

.list-btn {
    padding: 2px 8px;
    background: var(--button-face);
    border: 1px outset var(--button-face);
    cursor: pointer;
    font-family: inherit;
    font-size: 10px;
    white-space: nowrap;
}

.list-btn:hover {
    background: #d4d0c8;
}

.list-btn:active {
    border-style: inset;
}

.list-btn.active {
    background: var(--selected-bg);
    color: var(--selected-text);
    border-style: inset;
}

.search-box {
    flex: 1;
    padding: 2px 4px;
    border: 2px inset var(--button-face);
    background: var(--bg-tertiary);
    font-family: inherit;
    font-size: 11px;
    min-width: 120px;
}

.search-box:focus {
    outline: none;
    border-color: var(--highlight-color);
}

.articles-container {
    flex: 1;
    overflow-y: auto;
    background: var(--bg-tertiary);
}

/* No Articles State */
.no-articles {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-secondary);
    padding: 20px;
}

.no-articles-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

/* Article Items */
.article-item {
    padding: 8px;
    border-bottom: 1px solid var(--border-dark);
    cursor: pointer;
    background: var(--bg-tertiary);
    transition: background-color 0.1s ease;
}

.article-item:hover {
    background: var(--bg-quaternary);
}

.article-item.selected {
    background: var(--selected-bg);
    color: var(--selected-text);
}

.article-item.unread {
    background: #fffcf0;
    border-left: 3px solid var(--highlight-color);
}

.article-item.saved {
    border-right: 3px solid var(--success-color);
}

.article-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}

.article-status {
    margin-right: 6px;
    font-size: 8px;
    color: var(--accent-color);
    font-weight: bold;
}

.article-title {
    flex: 1;
    font-weight: bold;
    font-size: 11px;
    line-height: 1.3;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.article-date {
    font-size: 10px;
    color: var(--text-secondary);
    margin-left: 8px;
    white-space: nowrap;
}

.article-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 10px;
    color: var(--text-secondary);
}

.article-source {
    font-weight: bold;
}

.article-preview {
    font-size: 10px;
    line-height: 1.4;
    color: var(--text-primary);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

/* Article Reader */
.article-reader {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg-tertiary);
    overflow: hidden;
}

.reader-header {
    padding: 8px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-dark);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: inset 1px 1px 0 var(--border-light);
}

.reader-title {
    font-size: 14px;
    font-weight: bold;
    flex: 1;
    margin-right: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.reader-controls {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

.reader-btn {
    padding: 3px 8px;
    background: var(--button-face);
    border: 1px outset var(--button-face);
    cursor: pointer;
    font-family: inherit;
    font-size: 10px;
    white-space: nowrap;
}

.reader-btn:hover {
    background: #d4d0c8;
}

.reader-btn:active {
    border-style: inset;
}

.reader-btn:disabled {
    color: var(--text-secondary);
    cursor: default;
}

.reader-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: var(--bg-tertiary);
    line-height: 1.6;
}

.reader-placeholder {
    text-align: center;
    color: var(--text-secondary);
    padding: 40px 20px;
}

.placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.7;
}

.placeholder-help {
    margin-top: 24px;
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.placeholder-help h4 {
    margin-bottom: 8px;
    color: var(--text-primary);
    font-size: 12px;
}

.placeholder-help ul {
    list-style: none;
    line-height: 1.8;
}

.placeholder-features {
    margin-top: 24px;
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 8px;
}

.feature-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.feature-item strong {
    color: var(--text-primary);
    font-size: 11px;
}

.feature-item span {
    font-size: 10px;
    color: var(--text-secondary);
}

/* Settings Panel */
.settings-container {
    padding: 16px;
    overflow-y: auto;
    background: var(--bg-tertiary);
    height: 100%;
}

.settings-container h2 {
    margin-bottom: 16px;
    color: var(--text-primary);
    font-size: 16px;
    border-bottom: 2px solid var(--border-dark);
    padding-bottom: 8px;
}

.settings-section {
    margin-bottom: 24px;
    padding: 12px;
    background: var(--bg-primary);
    border: 2px inset var(--button-face);
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-dark);
    padding-bottom: 4px;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: bold;
    color: var(--text-primary);
}

.form-help {
    display: block;
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 2px;
    font-style: italic;
}

.text-input, .select-input {
    width: 100%;
    padding: 3px 6px;
    border: 2px inset var(--button-face);
    background: var(--bg-tertiary);
    font-family: inherit;
    font-size: 11px;
    color: var(--text-primary);
}

.text-input:focus, .select-input:focus {
    outline: none;
    border-color: var(--highlight-color);
}

.form-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.settings-btn {
    padding: 4px 12px;
    background: var(--button-face);
    border: 2px outset var(--button-face);
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    margin-right: 8px;
    margin-bottom: 4px;
    white-space: nowrap;
}

.settings-btn:hover {
    background: #d4d0c8;
}

.settings-btn:active {
    border-style: inset;
}

.settings-btn.primary {
    background: var(--highlight-color);
    color: var(--selected-text);
    border-color: var(--highlight-color);
}

.settings-btn.primary:hover {
    background: #4a7bc8;
}

.import-export {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.import-export-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.import-export-item small {
    color: var(--text-secondary);
    font-size: 10px;
}

/* Feed Management */
.feed-mgmt-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border: 1px solid var(--border-dark);
    margin-bottom: 4px;
    background: var(--bg-tertiary);
}

.feed-mgmt-info {
    flex: 1;
    font-size: 11px;
}

.feed-mgmt-info strong {
    display: block;
    margin-bottom: 2px;
}

.feed-mgmt-info small {
    color: var(--text-secondary);
    font-size: 10px;
    word-break: break-all;
}

.feed-mgmt-controls {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

.mgmt-btn {
    padding: 2px 8px;
    background: var(--button-face);
    border: 1px outset var(--button-face);
    cursor: pointer;
    font-family: inherit;
    font-size: 10px;
}

.mgmt-btn:hover {
    background: #d4d0c8;
}

.mgmt-btn:active {
    border-style: inset;
}

.mgmt-btn.danger {
    background: #ff6666;
    border-color: #ff6666;
    color: #ffffff;
}

.mgmt-btn.danger:hover {
    background: #ff4444;
}

.no-feeds {
    text-align: center;
    color: var(--text-secondary);
    padding: 20px;
    font-style: italic;
}

/* Status Bar */
.status-bar {
    display: flex;
    justify-content: space-between;
    padding: 2px 8px;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-dark);
    font-size: 10px;
    height: 20px;
    align-items: center;
    box-shadow: inset 0 1px 0 var(--border-light);
}

.status-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.status-section span {
    white-space: nowrap;
}

/* Modal Dialogs */
.modal-overlay, .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-dialog, .loading-dialog {
    background: var(--window-bg);
    border: 2px outset var(--button-face);
    min-width: 300px;
    max-width: 500px;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--accent-color);
    color: var(--selected-text);
    font-weight: bold;
    font-size: 12px;
}

.modal-close {
    background: var(--button-face);
    border: 1px outset var(--button-face);
    cursor: pointer;
    padding: 2px 6px;
    color: var(--text-primary);
    font-size: 12px;
    line-height: 1;
}

.modal-close:hover {
    background: #d4d0c8;
}

.modal-close:active {
    border-style: inset;
}

.modal-body {
    padding: 16px;
    background: var(--bg-tertiary);
    font-size: 12px;
    line-height: 1.4;
}

.modal-footer {
    padding: 8px 12px;
    background: var(--bg-primary);
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    box-shadow: inset 0 1px 0 var(--border-light);
}

.modal-btn {
    padding: 4px 16px;
    background: var(--button-face);
    border: 2px outset var(--button-face);
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
}

.modal-btn:hover {
    background: #d4d0c8;
}

.modal-btn:active {
    border-style: inset;
}

.modal-btn.primary {
    background: var(--highlight-color);
    color: var(--selected-text);
    border-color: var(--highlight-color);
}

.modal-btn.primary:hover {
    background: #4a7bc8;
}

/* Loading Dialog */
.loading-content {
    padding: 24px;
    text-align: center;
    background: var(--bg-tertiary);
}

.loading-spinner {
    font-size: 24px;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-progress {
    margin-top: 16px;
}

.progress-bar {
    width: 200px;
    height: 16px;
    border: 2px inset var(--button-face);
    background: var(--bg-tertiary);
    margin: 0 auto;
}

.progress-fill {
    height: 100%;
    background: var(--highlight-color);
    width: 0%;
    transition: width 0.3s ease;
}

/* Context Menu */
.context-menu {
    position: absolute;
    background: var(--bg-primary);
    border: 2px outset var(--button-face);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 1001;
    min-width: 150px;
}

.context-menu-item {
    padding: 4px 12px;
    font-size: 11px;
    cursor: pointer;
    color: var(--text-primary);
}

.context-menu-item:hover {
    background: var(--selected-bg);
    color: var(--selected-text);
}

.context-menu-separator {
    height: 1px;
    background: var(--border-dark);
    margin: 2px 0;
}

/* Scrollbars for Windows 98 */
::-webkit-scrollbar {
    width: 16px;
    height: 16px;
}

::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border: 1px inset var(--button-face);
}

::-webkit-scrollbar-thumb {
    background: var(--button-face);
    border: 1px outset var(--button-face);
}

::-webkit-scrollbar-thumb:hover {
    background: #d4d0c8;
}

::-webkit-scrollbar-corner {
    background: var(--bg-primary);
}

::-webkit-scrollbar-button {
    background: var(--button-face);
    border: 1px outset var(--button-face);
}

::-webkit-scrollbar-button:hover {
    background: #d4d0c8;
}

::-webkit-scrollbar-button:active {
    border-style: inset;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.article-item {
    animation: slideIn 0.2s ease-out;
}

.modal-dialog, .loading-dialog {
    animation: fadeIn 0.2s ease-out;
}

.loading-spinner {
    animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .sidebar {
        width: 240px;
    }
    
    .article-list {
        width: 300px;
    }
    
    .toolbar-btn .btn-text {
        display: none;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .main-layout {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid var(--border-dark);
        resize: vertical;
    }
    
    .articles-layout {
        flex-direction: column;
    }
    
    .article-list {
        width: 100%;
        height: 200px;
        border-right: none;
        border-bottom: 1px solid var(--border-dark);
        resize: vertical;
    }
    
    .toolbar-group {
        flex-wrap: wrap;
    }
    
    .reader-controls {
        flex-wrap: wrap;
    }
}

/* High DPI / Retina adjustments */
@media (-webkit-min-device-pixel-ratio: 2) {
    body {
        -webkit-font-smoothing: antialiased;
        font-smoothing: antialiased;
    }
}

/* Print styles */
@media print {
    .toolbar, .sidebar, .tab-bar, .status-bar {
        display: none;
    }
    
    .main-layout {
        flex-direction: column;
    }
    
    .content-area {
        height: auto;
    }
    
    .reader-content {
        height: auto;
        overflow: visible;
    }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Focus styles for keyboard navigation */
button:focus, input:focus, select:focus, .tab:focus, .feed-item:focus, .article-item:focus {
    outline: 2px solid var(--highlight-color);
    outline-offset: 1px;
}

/* Selection styles */
::selection {
    background: var(--selected-bg);
    color: var(--selected-text);
}

::-moz-selection {
    background: var(--selected-bg);
    color: var(--selected-text);
}
