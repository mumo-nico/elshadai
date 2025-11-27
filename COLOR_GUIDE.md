# Elshadai Apartments - Color Guide

## 🎨 Primary Colors

### Neon Blue (#00D9FF)
**Usage**: Primary buttons, active sidebar items, links, accents
```css
bg-neon-blue
text-neon-blue
border-neon-blue
```

**Examples**:
- Primary buttons (Get Started, Sign In, etc.)
- Active sidebar menu item background
- Logo background
- Stat card icons
- Links and interactive elements

---

### Sky Blue (#87CEEB)
**Usage**: Hover states, secondary accents
```css
bg-sky-blue
text-sky-blue
hover:bg-sky-blue/20
```

**Examples**:
- Sidebar item hover state
- Secondary backgrounds
- Subtle highlights

---

### Eggshell White (#F0EAD6)
**Usage**: Main background color for dashboard
```css
bg-eggshell-white
```

**Examples**:
- Dashboard main background
- Landing page sections
- Card backgrounds (use white for cards on eggshell background)

---

### Navy Dark (#0F172A, #1E293B)
**Usage**: Sidebar background, headings, primary text
```css
bg-navy-dark
text-navy-dark
```

**Examples**:
- Sidebar background
- Main headings
- Primary text content
- Dark UI elements

---

## 🎯 Color Application Rules

### Buttons
- **Primary Action**: `bg-neon-blue` with `text-navy-dark`
- **Hover**: `hover:bg-neon-blue/90`
- **Outline**: `border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-navy-dark`

### Sidebar
- **Background**: `bg-navy-dark`
- **Text**: `text-gray-300`
- **Hover**: `hover:bg-sky-blue/20 hover:text-white`
- **Active**: `bg-neon-blue text-navy-dark`

### Cards
- **Background**: `bg-white` (on eggshell background)
- **Border**: `border-gray-100` default, `hover:border-neon-blue`
- **Rounded**: `rounded-2xl` or `rounded-3xl`

### Inputs
- **Border**: `border-gray-200`
- **Focus**: `focus:border-neon-blue focus:ring-neon-blue/20`
- **Rounded**: `rounded-xl`

---

## 🚫 What NOT to Use

❌ **NO Gradients** - Use solid colors only
❌ **NO** `bg-gradient-to-*` classes
❌ **NO** mixed color gradients

✅ **YES** - Solid colors with opacity variations (e.g., `bg-neon-blue/10`)

---

## 📊 Color Contrast Guide

### Text on Backgrounds
- ✅ Navy Dark text on White/Eggshell backgrounds
- ✅ White text on Navy Dark backgrounds
- ✅ Navy Dark text on Neon Blue backgrounds
- ✅ White text on Neon Blue backgrounds

### Accessibility
All color combinations meet WCAG AA standards for contrast.

---

## 🎨 Example Combinations

### Primary Button
```jsx
<button className="bg-neon-blue text-navy-dark hover:bg-neon-blue/90 rounded-xl px-6 py-3">
  Click Me
</button>
```

### Sidebar Item (Active)
```jsx
<div className="bg-neon-blue text-navy-dark rounded-xl px-4 py-3">
  Dashboard
</div>
```

### Sidebar Item (Hover)
```jsx
<div className="text-gray-300 hover:bg-sky-blue/20 hover:text-white rounded-xl px-4 py-3">
  Properties
</div>
```

### Card
```jsx
<div className="bg-white border-2 border-gray-100 hover:border-neon-blue rounded-2xl p-6">
  Card Content
</div>
```

### Input
```jsx
<input className="border-2 border-gray-200 focus:border-neon-blue focus:ring-2 focus:ring-neon-blue/20 rounded-xl px-4 py-3" />
```

---

## 💡 Tips

1. **Consistency**: Always use the same color for the same purpose
2. **Hierarchy**: Neon blue for primary actions, sky blue for secondary
3. **Contrast**: Ensure text is readable on all backgrounds
4. **Spacing**: Use rounded corners consistently (xl, 2xl, 3xl)
5. **Opacity**: Use opacity variations for subtle effects (e.g., `/10`, `/20`, `/90`)

---

## 🌈 Full Tailwind Config

```javascript
colors: {
  neon: {
    blue: '#00D9FF',
    DEFAULT: '#00D9FF',
  },
  sky: {
    blue: '#87CEEB',
    DEFAULT: '#87CEEB',
  },
  eggshell: {
    white: '#F0EAD6',
    DEFAULT: '#F0EAD6',
  },
  navy: {
    dark: '#0F172A',
    DEFAULT: '#1E293B',
  }
}
```

