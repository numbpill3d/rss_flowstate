# MURMUR RSS

A nostalgic RSS feed reader built with Electron, featuring authentic Windows 98 styling and modern functionality.

![Windows 98 Screenshot](screenshot.png)

## Features

- **Authentic Windows 98 UI** - Complete with retro styling, borders, and color schemes
- **Multiple Themes** - Windows 98, Windows 95, Classic Green, and Amber Terminal
- **RSS Feed Management** - Add, organize, and refresh RSS and Atom feeds
- **Group Organization** - Create custom groups to organize your feeds
- **Article Reading** - Built-in article viewer with save and mark-read functionality
- **Search & Filtering** - Find articles quickly with search and unread filters
- **Keyboard Shortcuts** - Navigate efficiently with hotkeys
- **Data Persistence** - Your feeds and settings are automatically saved
- **Auto-refresh** - Automatically update feeds on a schedule
- **OPML Support** - Import and export your feed lists (planned)

## Installation

1. **Prerequisites:**
   - Node.js 16 or higher
   - npm or yarn

2. **Clone or download the project files**

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

5. **Build for distribution:**
   ```bash
   npm run build
   ```

## Usage

### Adding Feeds
1. Click "New Feed" in the toolbar or press `Ctrl+N`
2. Enter the RSS feed URL
3. Optionally customize the name and assign to a group
4. Click "Add Feed"

### Keyboard Shortcuts
- `Ctrl+N` - Add new feed
- `Ctrl+R` or `F5` - Refresh all feeds
- `Ctrl+B` - Toggle sidebar
- `Ctrl+G` - Create new group
- `Escape` - Close modals/menus

### Themes
Switch between vintage themes using the dropdown in the toolbar:
- **Windows 98** - Classic gray with blue accents
- **Windows 95** - Slightly different gray variant  
- **Classic Green** - Terminal-style green on black
- **Amber Terminal** - Retro amber on dark background

### Organization
- Create custom groups to organize your feeds
- Expand/collapse groups by clicking the arrow
- Drag to resize the sidebar and article list panels
- Use search to find specific articles

## Technical Details

### Built With
- **Electron** - Desktop app framework
- **Node.js** - RSS parsing and file operations
- **HTML/CSS/JavaScript** - UI and application logic
- **xml2js** - RSS/Atom feed parsing
- **node-fetch** - HTTP requests for feeds

### File Structure
```
retro-rss-aggregator/
├── package.json          # App configuration and dependencies
├── main.js              # Electron main process
├── renderer/
│   ├── index.html       # Main UI layout
│   ├── styles.css       # Windows 98 styling
│   └── app.js          # Application logic
└── assets/
    └── icon.png        # App icon (optional)
```

### Data Storage
- Settings and feeds are stored in localStorage
- Data persists between app sessions
- No external database required

## Development

### Running in Development Mode
```bash
npm run dev
```

This opens the app with developer tools enabled.

### Building for Distribution
```bash
npm run build
```

Creates distributable packages in the `dist/` folder.

### Adding New Themes
1. Add theme variables to `styles.css`
2. Add theme option to the select dropdown in `index.html`
3. Theme will be automatically available

## Troubleshooting

### Feed Won't Load
- Check that the URL is a valid RSS or Atom feed
- Some feeds may have CORS restrictions
- Try the "Test Feed" button to verify the URL

### App Won't Start
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again
- Check console for error messages

### Data Loss
- Data is stored in browser localStorage
- Clearing browser data will reset the app
- Use OPML export (when available) to backup feeds

## Contributing

This is a demonstration project showcasing Windows 98 UI design in modern web technologies. Feel free to:

- Report bugs and issues
- Suggest new features
- Submit pull requests
- Create additional themes

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by classic Windows 98 interface design
- RSS feed parsing powered by xml2js
- Built with love for retro computing aesthetics
