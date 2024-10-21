# Bluesky Bookmarker Chrome Extension

![Bluesky Bookmarker Icon](images/icon128.png)

## Overview

Bluesky Bookmarker is a Chrome extension that allows users to bookmark posts on the Bluesky social media platform. Users can easily save interesting posts, view their bookmarks, and manage them through a convenient interface.

## Features

- Bookmark Bluesky posts with a single click
- View bookmarked posts in a popup window
- Manage bookmarks on a dedicated bookmarks page
- Sort bookmarks by newest or oldest first
- Remove individual bookmarks or clear all bookmarks at once
- Supports both light and dark themes
- Adjusts the layout of Bluesky's feed tabs for better visibility

## Project Structure

- `manifest.json`: Configuration file for the Chrome extension
- `popup.html`: HTML for the extension's popup
- `popup.js`: JavaScript for the popup functionality
- `popup.css`: Styles for the popup
- `content.js`: Content script that runs on Bluesky pages
- `background.js`: Background script for handling extension events
- `bookmarks.html`: HTML for the full bookmarks page
- `bookmarks.js`: JavaScript for the full bookmarks page functionality
- `styles.css`: Shared styles for the extension

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Navigate to https://bsky.app.
2. Click the Bluesky Bookmarker extension icon to view your bookmarks in a popup.
3. On any Bluesky post, click the bookmark icon next to the share button to save or remove a bookmark.
4. Click "View All Bookmarks" in the popup to open the full bookmarks page.
5. On the bookmarks page, you can:
   - Sort bookmarks by newest or oldest first
   - Remove individual bookmarks
   - Clear all bookmarks at once

## New Features and Improvements

- Added sorting functionality to the bookmarks page
- Implemented a "Clear All" button to remove all bookmarks at once
- Improved the layout of the bookmarks page
- Added support for light theme in the Bluesky interface
- Adjusted the position of Bluesky's feed tabs for better visibility
- Improved error handling and user feedback
- Enhanced the bookmark button placement and styling

## Development

To modify the extension:

1. Make changes to the relevant files.
2. If you modify `manifest.json`, you may need to reload the extension in Chrome.
3. For changes to other files, you can usually just refresh the Bluesky page.

## Troubleshooting

- If bookmarks aren't appearing, check the console for any error messages.
- Ensure that the extension has the necessary permissions to access Bluesky pages.
- If changes aren't reflected, try hard refreshing the page or reloading the extension.
- Make sure you have enabled embedding for your posts to use the bookmarking feature.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)
