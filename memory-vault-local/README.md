# Memory Vault
Yeh jo hai naa *local offline version* hai Memory Vault ka, thik hai.

## kaise kaam krega wohh isme dekh lena 
- Stores memory *metadata* in `localStorage`.
- Converts small files (<= 5 MB) to data URLs to allow inline preview.
- Large files keep metadata only — you should keep the original file locally.

## Usage
1. Open `index.html` .
2. Add memories (title, description, optional file).
3. Preview or delete memories from the list.

## Notes
- This version does not upload files to any server.
- localStorage has size limits.