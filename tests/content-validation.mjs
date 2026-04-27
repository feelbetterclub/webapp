/**
 * Basic content validation tests for Feel Better Club
 * Run: node tests/content-validation.mjs
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e.message}`);
  }
}

function readSrc(path) {
  return readFileSync(resolve(root, "src", path), "utf-8");
}

console.log("\n=== Content Validation Tests ===\n");

// --- en.ts ---
const enContent = readSrc("lib/i18n/en.ts");

console.log("-- Class Names (FBC-74) --");
test("EN: Open-Air Kite Mobility Flow exists", () => {
  assert.ok(enContent.includes("Open-Air Kite Mobility Flow"));
});
test("EN: Open-Air Sculpt Flow exists", () => {
  assert.ok(enContent.includes("Open-Air Sculpt Flow"));
});
test("EN: Open-Air Pilates Flow exists", () => {
  assert.ok(enContent.includes("Open-Air Pilates Flow"));
});
test("EN: Open-Air Dance Burn exists", () => {
  assert.ok(enContent.includes("Open-Air Dance Burn"));
});

console.log("\n-- Hero Headline (FBC-77) --");
test("EN: Hero h1a matches doc", () => {
  assert.ok(enContent.includes("Outdoor Training Community."));
});
test("EN: Hero h1b matches doc", () => {
  assert.ok(enContent.includes("Each of You Matters."));
});
test("EN: Hero sub has Endorphins", () => {
  assert.ok(enContent.includes("Fueled by Endorphins and Sea Vitamins"));
});

console.log("\n-- Nav Items (FBC-82) --");
test("EN: Nav has Class Program", () => {
  assert.ok(enContent.includes('"Class Program"'));
});
test("EN: Nav has Rituals & Events", () => {
  assert.ok(enContent.includes("Rituals & Events"));
});
test("EN: Nav has Book the Class", () => {
  assert.ok(enContent.includes("Book the Class"));
});

console.log("\n-- Moni Bio (FBC-78) --");
test("EN: Bio mentions basketball", () => {
  assert.ok(enContent.includes("basketball player"));
});
test("EN: Bio mentions kitesurfing 2016", () => {
  assert.ok(enContent.includes("2016"));
});
test("EN: Bio mentions Tarifa 2021", () => {
  assert.ok(enContent.includes("Tarifa in 2021"));
});
test("EN: Bio mentions 25 years", () => {
  assert.ok(enContent.includes("25 years"));
});

console.log("\n-- Popup (FBC-76) --");
test("EN: Popup has UNLOCK title", () => {
  assert.ok(enContent.includes("UNLOCK A FREE OUTDOOR CLASS"));
});
test("EN: Popup CTA is 'I am in. Sign Up'", () => {
  assert.ok(enContent.includes("I am in. Sign Up"));
});

// --- es.ts ---
const esContent = readSrc("lib/i18n/es.ts");

console.log("\n-- Spanish (ES) --");
test("ES: Open-Air class names exist", () => {
  assert.ok(esContent.includes("Open-Air Kite Mobility Flow"));
  assert.ok(esContent.includes("Open-Air Sculpt Flow"));
});
test("ES: Hero has Comunidad de Entrenamiento", () => {
  assert.ok(esContent.includes("Comunidad de Entrenamiento Outdoor"));
});
test("ES: Nav has Rituales y Eventos", () => {
  assert.ok(esContent.includes("Rituales y Eventos"));
});
test("ES: Bio mentions baloncesto", () => {
  assert.ok(esContent.includes("baloncesto"));
});

// --- email.ts ---
const emailContent = readSrc("lib/email.ts");

console.log("\n-- Emails (FBC-80/81) --");
test("Welcome email: Feel Better Community", () => {
  assert.ok(emailContent.includes("Feel Better Community"));
});
test("Welcome email: signature is Moni (not Monika)", () => {
  assert.ok(emailContent.includes("<strong>Moni</strong>"));
  assert.ok(!emailContent.includes("<strong>Monika</strong>"));
});
test("Booking email: Feel Better Club", () => {
  assert.ok(emailContent.includes("choosing Feel Better Club"));
});
test("Booking email: inner Power", () => {
  assert.ok(emailContent.includes("inner Power"));
});

// --- Header.tsx ---
const headerContent = readSrc("components/Header.tsx");

console.log("\n-- Header (FBC-82) --");
test("Header: About link", () => {
  assert.ok(headerContent.includes("/#about"));
});
test("Header: Book the Class fallback", () => {
  assert.ok(headerContent.includes("Book the Class"));
});

// --- About.tsx ---
const aboutContent = readSrc("components/About.tsx");

console.log("\n-- About (FBC-79) --");
test("About: Our Story section with id=about", () => {
  assert.ok(aboutContent.includes('id="about"'));
});
test("About: story.p1 rendered", () => {
  assert.ok(aboutContent.includes("story.p1"));
});
test("About: Multi-paragraph bio (split)", () => {
  assert.ok(aboutContent.includes('split("\\n\\n")'));
});

// --- Typography (FBC-90) ---
const layoutContent = readSrc("app/layout.tsx");

console.log("\n-- Typography (FBC-90) --");
test("Layout: Plus Jakarta Sans imported", () => {
  assert.ok(layoutContent.includes("Plus_Jakarta_Sans"));
});
test("Layout: Chewy imported", () => {
  assert.ok(layoutContent.includes("Chewy"));
});
test("Layout: font-brand variable", () => {
  assert.ok(layoutContent.includes("--font-brand"));
});

// --- Contact page (FBC-58) ---
import { existsSync } from "node:fs";

console.log("\n-- Contact Page (FBC-58) --");
test("Contact page exists", () => {
  assert.ok(existsSync(resolve(root, "src/app/contact/page.tsx")));
});
test("Contact API route exists", () => {
  assert.ok(existsSync(resolve(root, "src/app/api/contact/route.ts")));
});

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
