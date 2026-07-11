## 🎨 UI Design System & Global Styles

To ensure a consistent user interface across the entire application, all developers must strictly follow this design system. 

**⚠️ Team Rule:** Never use hardcoded hex colors (e.g., `#D32F2F`) or random fonts in your local component CSS. Always use the global CSS variables defined below.

### 1. Color Palette Reference

| Color Role | CSS Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Red** | `var(--primary-red)` | `#D32F2F` | Main buttons, active links, primary icons |
| **Primary Hover** | `var(--primary-hover)`| `#B71C1C` | Button hover states |
| **Deep Crimson**| `var(--deep-crimson)`| `#8E1616` | Footers, bold emphasis text, hero overlays |
| **Main Bg** | `var(--bg-main)` | `#FCFCFC` | Main body background |
| **Surface Bg** | `var(--bg-surface)` | `#FFFFFF` | Card, modal, and dropdown backgrounds |
| **Neutral Bg** | `var(--bg-neutral)` | `#F0F4F8` | Secondary backgrounds, table headers |
| **Main Text** | `var(--text-main)` | `#1C1E21` | Primary headings and body text |
| **Muted Text** | `var(--text-muted)` | `#636D76` | Subtitles, placeholders, secondary info |
| **Border** | `var(--border-color)` | `#E1E4E8` | Dividers, input borders, card borders |

### 2. Typography

*   **Global Font Family:** Poppins, sans-serif 
*   **CSS Variable:** `var(--font-main)`

### 3. Usage Example

When styling your individual React components, always reference the variables from the `index.css` file. 

```css
/* ✅ Correct Way */
.my-custom-card {
  background-color: var(--bg-surface);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  font-family: var(--font-main);
}

.my-custom-card h2 {
  color: var(--primary-red);
}
/* ❌ Wrong Way (Do Not Do This) */
.my-custom-card {
  background-color: #FFFFFF;
  color: #1C1E21;
  border: 1px solid #E1E4E8;
  font-family: 'Poppins', sans-serif;
}

.my-custom-card h2 {
  color: #D32F2F;
}
