/* Test-only: this sandbox has no emoji font, so inject one so screenshots look like a real phone. Not shipped to users. */
async function withEmoji(page) {
  for (const f of page.frames()) {
    await f.addStyleTag({ url: '/__emoji/index.css' }).catch(() => {});
    await f.addStyleTag({ content: 'body,.mv,button,input,textarea,select{font-family:"Cairo","Noto Color Emoji",sans-serif !important}' }).catch(() => {});
    await f.evaluate(() => Promise.all(['☕', '🧊', '🍰', '🥐', '🥛', '🍵', '🍋', '🍓', '🍮', '🍫', '🥪', '🌶️', '🍽️', '🥗', '🗑', '📍', '🎨', '👁'].map(e => document.fonts.load('16px "Noto Color Emoji"', e)))).catch(() => {});
  }
  await page.waitForTimeout(500);
}
module.exports = { withEmoji };
