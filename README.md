# Delete AI Chat

A Chrome extension that lets you delete many Google Gemini conversations at once instead of one by one.

## Features

- **Batch mode:** adds a checkbox to each chat in Gemini's history sidebar
- **Bulk delete:** a floating button deletes every selected chat in one go
- **Remembers your selection:** stays in place if the page reloads during the session
- **Light and dark popup** built with React and Tailwind

## Install

### From a release

1. Download `delete-ai-chat-vX.Y.Z.zip` from the [latest release](https://github.com/aman879/delete-ai-chat/releases/latest) and unzip it
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the unzipped folder

### From source

1. `pnpm install && pnpm build`
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the `dist` folder

## Usage

1. Open [gemini.google.com](https://gemini.google.com)
2. Click the extension icon, then **Enable Batch Delete**
3. Select the chats you want to remove and click the floating delete button

> **Note:** Deletion works by clicking through Gemini's own menus, so it may break if Google changes the page.

## Development

```bash
pnpm install
pnpm dev     # rebuilds into dist/ on every change
pnpm lint
pnpm build
```

## Releasing

Pushing a tag that starts with `v` (for example `v1.0.0`) builds the extension and publishes a GitHub Release with the zipped build attached.

```bash
git tag v1.0.0
git push origin v1.0.0
```
