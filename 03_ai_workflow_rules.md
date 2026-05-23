# AI Workflow Rules: BooQoo Development

Dokumen ini mendefinisikan aturan ketat untuk eksekusi AI-driven development.

---

## 1. Core Principles

### 1.1 Spec-Driven Development
- **TIDAK boleh** menulis kode tanpa membaca context terlebih dahulu
- **HARUS** memahami requirement dari 6-file context system
- **HARUS** mereferensi architecture.md, code standards, dan UI context

### 1.2 Unit-by-Unit Execution
- **Setiap task dipecah menjadi unit kecil** (~2-4 jam work per unit)
- **TIDAK boleh** membuat multiple feature sekaligus
- **SETIAP unit HARUS selesai dengan:** code teruji, dokumentasi lengkap, siap review

### 1.3 Human-in-the-Loop
- **AI TIDAK boleh** commit code tanpa explicit approval
- **AI HARUS** request review sebelum push
- **Conflict detection HARUS** escalate ke human untuk decision

---

## 2. Pre-Development Checklist

Sebelum menulis satu baris kode:

```
□ READ context files:
  - 00_project_overview.md (requirements, user flows)
  - 01_architecture.md (tech stack, database schema)
  - 02_code_standards.md (naming, structure, patterns)
  - 04_ui_context.md (design tokens, accessibility)
  - 05_progress_tracker.md (current phase, decisions)

□ CLARIFY requirements
  - Apakah requirement sudah jelas?
  - Ada dependency dengan unit lain?
  - Perlu architectural decision?
  - Ini breaking change?

□ PLAN design
  - File mana yang perlu dibuat/modified?
  - Type definitions mana?
  - Component signatures?
  - Testing strategy?
```

---

## 3. Development Workflow

### 3.1 The "Read-Plan-Code-Test" Loop

```
1. READ
   ├─ Baca file-file yang akan di-modify
   ├─ Pahami context dan existing patterns
   └─ Identify affected code paths

2. PLAN
   ├─ Buat mental model change
   ├─ Identify edge cases
   ├─ Plan test cases
   └─ Document approach

3. CODE
   ├─ Follow code standards strictly
   ├─ Use Edit tool for modify existing files
   ├─ Commit atomic, meaningful changes
   └─ Add JSDoc comments

4. TEST
   ├─ Write tests alongside code
   ├─ Run tests locally
   ├─ Verify no regressions
   └─ Document coverage
```

### 3.2 Reading Before Modifying

```typescript
// ✅ GOOD: Read file first
const fileContent = await Read({ file_path: '/path/to/file.ts' });
// ... study the code ...
// Baru kemudian Edit

// ❌ BAD: Modify without reading
// Tidak tahu konteks, bisa breaking!
```

### 3.3 Atomic Commits
- Represent one logical change
- Have clear, descriptive message
- Not break existing functionality
- Include related tests

---

## 4. Multi-File Changes

### 4.1 Planning Multi-File Changes
If affecting > 3 files:
1. CREATE summary document (list files, describe changes)
2. REQUEST approval dari human
3. EXECUTE in dependency order (code → test → commit)
4. CREATE PR dengan full context

### 4.2 Detecting Breaking Changes
RED FLAGS: function signature change, API endpoint delete, schema change, type rename, file/folder rename

**Handling:** STOP, notify human, propose migration path, wait for approval

---

## 5. Testing Requirements

### 5.1 Test Coverage Targets
- Utility functions: 90%
- Custom hooks: 80%
- Components: 70%
- API routes: 85%

### 5.2 Testing Checklist
- [ ] Unit tests untuk functions/hooks
- [ ] Component tests untuk UI
- [ ] Integration tests untuk feature workflow
- [ ] Tests pass locally
- [ ] No test regression

---

## 6. Self-Review Before Submission

```
□ Code quality
  → Mengikuti code standards?
  → No hardcoded values?
  → Error handling lengkap?
  → Comments untuk complex logic?

□ Tests
  → Tests pass locally?
  → Coverage sufficient?

□ Documentation
  → JSDoc untuk functions?
  → README updated?

□ No breaking changes
  → Backward compatible?

□ Performance & Security
  → No N+1 queries?
  → No hardcoded secrets?
  → Input validated?
```

---

## 7. Critical Rules (Never Violate)

```
❌ NEVER commit code tanpa tests
❌ NEVER use 'any' without strong justification
❌ NEVER modify code without reading first
❌ NEVER push to main without approval
❌ NEVER hardcode secrets
❌ NEVER skip error handling
❌ NEVER break existing tests
❌ NEVER implement without reading context system
❌ NEVER ignore architectural mismatch
```

---

## Document Version
- **Version:** 1.0
- **Created:** 2026-05-22
- **Maintained By:** Lead Developer / AI Coordinator
