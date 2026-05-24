# UI/UX Design Context: BooQoo

Dokumen ini mendefinisikan design tokens, accessibility guidelines untuk pengguna lanjut usia, dan UI patterns.

---

## 1. Design Principles

### 1.1 Simplicity First
- **1 action per screen** (jangan overload dengan banyak pilihan)
- **Clear hierarchy** (apa yang paling penting, apa yang sekunder)
- **Whitespace is good** (jangan cramped, berikan ruang untuk bernafas)
- **Progressive disclosure** (advanced options disembunyikan tapi accessible)

### 1.2 Empathy & Accessibility
- **Design for oldest user** (usia 50+, minimal tech literacy)
- **Large, legible text** (tidak peduli pixel-perfect, readability paramount)
- **High contrast** (untuk pengguna dengan vision limitations)
- **Generous touch targets** (button min 48x48dp)
- **Clear, unambiguous language** (Bahasa Indonesia, no jargon)

### 1.3 Trust & Familiarity
- **Use real-world metaphors** (kasir = checkout, bon = receipt)
- **Provide confirmation** (always tell user apa yang terjadi)
- **Undo/recovery options** (if possible, let user undo)
- **Consistent patterns** (button placement, color usage, interaction)

---

## 2. Design Tokens

### 2.1 Color Palette

```css
/* Primary: Warm, welcoming */
--primary-500: #e85c1e;    /* MAIN PRIMARY (buttons, accent) */
--primary-600: #d54110;    /* Darker on hover */
--primary-700: #b8340d;    /* Even darker on active */

/* Accent: Fresh, healthy (good stock) */
--accent-500: #22c55e;     /* Bright green */
--accent-600: #16a34a;

/* Danger: Attention-seeking but not aggressive */
--danger-500: #ef4444;     /* Red for errors */

/* Warning: Caution (near expiry, low stock) */
--warning-500: #f59e0b;    /* Amber/orange */

/* Neutral: Grays for text, borders */
--neutral-700: #404040;    /* Primary text (headers) */
--neutral-800: #262626;    /* Dark text */
--neutral-900: #171717;    /* Very dark text */
```

### 2.2 Typography

```css
/* Font sizes - Generous for older users */
--text-base: 1rem;         /* 16px - body text minimum */
--text-lg: 1.125rem;       /* 18px - larger body */
--text-xl: 1.25rem;        /* 20px - section subheadings */
--text-2xl: 1.5rem;        /* 24px - main headings */
--text-3xl: 1.875rem;      /* 30px - page titles */

/* Line height - Generous spacing */
--leading-normal: 1.5;     /* Default, very readable */

/* NEVER go below 16px untuk body text di mobile */
```

### 2.3 Spacing Scale

```css
--space-4: 16px;           /* Default spacing */
--space-6: 24px;           /* Larger spacing */
--space-8: 32px;           /* Between major sections */
```

### 2.4 Touch Targets

**Minimum 48x48 CSS pixels** untuk semua interactive elements.

---

## 3. Component Guidelines

### 3.1 Buttons

```css
/* Default button */
.btn {
  padding: 12px 16px;      /* Min 48px height */
  font-size: 16px;         /* Never smaller */
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Primary button (main action) */
.btn-primary {
  background-color: #e85c1e;
  color: white;
}

.btn-primary:hover {
  background-color: #d54110;
}

/* Disabled state */
.btn:disabled {
  background-color: #d4d4d4;
  color: #737373;
  cursor: not-allowed;
}
```

### 3.2 Form Inputs

```css
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;         /* >= 16px to prevent mobile zoom */
  border: 2px solid #d4d4d4;
  border-radius: 8px;
  line-height: 1.5;
}

.input:focus {
  outline: none;
  border-color: #e85c1e;
  box-shadow: 0 0 0 3px rgba(232, 92, 30, 0.1);
}
```

**Always pair input dengan label:**
```html
<label for="qty">Berapa banyak?</label>
<input id="qty" type="number" class="input" />
```

### 3.3 Cards

```css
.card {
  background-color: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### 3.4 Notifications

```html
<!-- Success -->
<div class="notification success">
  <span>✓</span>
  <div>Transaksi berhasil!</div>
</div>

<!-- Error -->
<div class="notification error">
  <span>✕</span>
  <div>Stok tidak cukup untuk "Pempek Sapi"</div>
</div>

<!-- Warning -->
<div class="notification warning">
  <span>⚠</span>
  <div>Pempek tinggal 3 PCS</div>
</div>
```

---

## 4. Accessibility Guidelines

### 4.1 Text Sizing & Readability

**Mobile (< 640px):**
```css
body { font-size: 16px; line-height: 1.5; }
h1 { font-size: 24px; }
h2 { font-size: 20px; }
h3 { font-size: 18px; }
button { font-size: 16px; }
input { font-size: 16px; }  /* >= 16px to prevent zoom */
```

**JANGAN gunakan font-size < 16px untuk body text!**

### 4.2 Color Contrast

**WCAG AA Compliance:** 4.5:1 minimum untuk normal text

```css
/* Good: #171717 on white = 15:1 */
body { color: #171717; background: white; }

/* Bad: #999 on white = ~4.3:1 (insufficient) */
/* JANGAN gunakan kombinasi rendah kontras */
```

### 4.3 Touch Targets

Minimum 48x48px untuk semua buttons dan clickable elements.

### 4.4 Keyboard Navigation

**All interactive elements harus accessible via keyboard:**
- Buttons, links, inputs dapat di-focus
- Focus indicator HARUS visible (outline: 3px solid)
- Tab order logical

### 4.5 Screen Reader Support

**Use semantic HTML:**
```html
<header>, <nav>, <main>, <section>, <h1>, <h2>, <label>, <fieldset>
```

**ARIA labels untuk icons:**
```html
<button aria-label="Tutup dialog">&times;</button>
```

---

## 5. Mobile-Specific Patterns

### 5.1 Bottom Navigation
```html
<nav class="bottom-nav">
  <a href="/dashboard" class="nav-item active">🏠</a>
  <a href="/products" class="nav-item">📦</a>
  <a href="/checkout" class="nav-item">💰</a>
  <a href="/reports" class="nav-item">📊</a>
  <a href="/settings" class="nav-item">⚙️</a>
</nav>
```

### 5.2 Safe Areas (Notch Support)
```css
header {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-left: max(16px, env(safe-area-inset-left));
}

.bottom-nav {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
```

### 5.3 Input Keyboard Types
```html
<input type="number" inputmode="numeric" />        <!-- Numeric -->
<input type="tel" inputmode="tel" />              <!-- Phone -->
<input type="email" inputmode="email" />          <!-- Email -->
```

---

## 6. Language & Tone

### 6.1 Vocabulary (Indonesian)

Use simple, everyday language:
```
JANGAN: "Autentikasi", "Sinkronisasi", "Validasi", "Duplikat"
GUNAKAN: "Masuk", "Simpan online", "Cek", "Ganda"
```

### 6.2 Tone & Voice

**Hangat, supportive, jangan formal:**
```
JANGAN: "Proses autentikasi gagal. Silakan validasi kredensial."
GUNAKAN: "Login gagal. Cek email dan password Anda, ya."
```

### 6.3 Confirmation & Reassurance

Always confirm actions, especially destructive:
```html
<div class="confirmation">
  <p>Yakin mau hapus "Pempek Ayam"? Nanti tidak bisa dibatalkan.</p>
  <button class="btn-secondary">Batal</button>
  <button class="btn-danger">Ya, Hapus</button>
</div>
```

---

## 7. Icons & Visual Language

```
🏠 Beranda / Ringkasan
📦 Produk / Restock
💰 Kasir / Checkout
📊 Laporan
⚙️ Pengaturan
👤 Akun / Profile
✓ Sukses / Selesai
✕ Hapus / Batal
⚠️ Perhatian / Warning
🔄 Sinkronisasi
```

**Always pair icons dengan text (jangan icon-only):**
```html
<!-- BAD: Icon only -->
<button>🗑️</button>

<!-- GOOD -->
<button>🗑️ Hapus</button>
```

---

## Document Version
- **Version:** 1.0
- **Created:** 2026-05-22
- **Maintained By:** UX/UI Lead
