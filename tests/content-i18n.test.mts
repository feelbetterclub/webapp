/**
 * Content validation tests for i18n translations.
 *
 * Checks:
 * 1. All 3 languages (en, es, pt) have the same keys
 * 2. No empty string values in any language
 * 3. Critical content matches Monika's latest copy
 */
import { describe, it, expect } from "vitest";
import en from "@/lib/i18n/en";
import es from "@/lib/i18n/es";
import pt from "@/lib/i18n/pt";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect all leaf key paths from an object.
 * Arrays are traversed by index, objects by key.
 */
function getKeyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || obj === undefined) return [prefix];
  if (typeof obj === "string" || typeof obj === "number") return [prefix];
  if (Array.isArray(obj)) {
    const paths: string[] = [];
    obj.forEach((item, i) => {
      paths.push(...getKeyPaths(item, `${prefix}[${i}]`));
    });
    return paths;
  }
  if (typeof obj === "object") {
    const paths: string[] = [];
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      paths.push(...getKeyPaths((obj as Record<string, unknown>)[key], newPrefix));
    }
    return paths;
  }
  return [prefix];
}

/**
 * Recursively collect all string values from an object, with their paths.
 */
function getStringValues(
  obj: unknown,
  prefix = "",
): Array<{ path: string; value: string }> {
  if (typeof obj === "string") return [{ path: prefix, value: obj }];
  if (typeof obj === "number") return [];
  if (Array.isArray(obj)) {
    const results: Array<{ path: string; value: string }> = [];
    obj.forEach((item, i) => {
      results.push(...getStringValues(item, `${prefix}[${i}]`));
    });
    return results;
  }
  if (obj !== null && typeof obj === "object") {
    const results: Array<{ path: string; value: string }> = [];
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      results.push(
        ...getStringValues((obj as Record<string, unknown>)[key], newPrefix),
      );
    }
    return results;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("i18n key parity", () => {
  const enKeys = getKeyPaths(en).sort();
  const esKeys = getKeyPaths(es).sort();
  const ptKeys = getKeyPaths(pt).sort();

  it("EN and ES have the same key paths", () => {
    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
    const extraInEs = esKeys.filter((k) => !enKeys.includes(k));
    expect(missingInEs, `Keys missing in ES: ${missingInEs.join(", ")}`).toEqual([]);
    expect(extraInEs, `Extra keys in ES: ${extraInEs.join(", ")}`).toEqual([]);
  });

  it("EN and PT have the same key paths", () => {
    const missingInPt = enKeys.filter((k) => !ptKeys.includes(k));
    const extraInPt = ptKeys.filter((k) => !enKeys.includes(k));
    expect(missingInPt, `Keys missing in PT: ${missingInPt.join(", ")}`).toEqual([]);
    expect(extraInPt, `Extra keys in PT: ${extraInPt.join(", ")}`).toEqual([]);
  });
});

describe("no empty string values", () => {
  const langs = { en, es, pt } as Record<string, unknown>;

  for (const [lang, data] of Object.entries(langs)) {
    it(`${lang.toUpperCase()} has no empty string values`, () => {
      const strings = getStringValues(data);
      const empties = strings.filter((s) => s.value.trim() === "");
      // Allow tag: "" in disciplines (intentionally empty)
      const meaningful = empties.filter((e) => !e.path.endsWith(".tag"));
      expect(
        meaningful.map((e) => e.path),
        `Empty values in ${lang.toUpperCase()}: ${meaningful.map((e) => e.path).join(", ")}`,
      ).toEqual([]);
    });
  }
});

describe("critical EN content — hero", () => {
  it("h1a is 'Outdoor Training Community.'", () => {
    expect(en.hero.h1a).toBe("Outdoor Training Community.");
  });

  it("h1b is 'Where Each of You Matters.'", () => {
    expect(en.hero.h1b).toBe("Where Each of You Matters.");
  });

  it("sub contains 'Strong Body, Calm Mind, Happy Soul'", () => {
    expect(en.hero.sub).toContain("Strong Body, Calm Mind, Happy Soul");
  });
});

describe("critical EN content — moni bio", () => {
  it("opening line mentions sport at center of life", () => {
    expect(en.moni.body).toMatch(/^Sport has been at the center of my life/);
  });

  it("mentions professional basketball player", () => {
    expect(en.moni.body).toContain("professional basketball player");
  });

  it("mentions kitesurfing in 2016", () => {
    expect(en.moni.body).toContain("2016");
    expect(en.moni.body).toContain("kitesurfing");
  });

  it("mentions 25+ years of experience", () => {
    expect(en.moni.body).toContain("25+ years");
  });

  it("mentions European-certified trainer", () => {
    expect(en.moni.body).toContain("European-certified trainer");
  });
});

describe("critical EN content — rituals", () => {
  it("rituals subtitle mentions Breath Workshops, Sauna and Ice Bath", () => {
    expect(en.rituals.subtitle).toContain("Breath Workshops");
    expect(en.rituals.subtitle).toContain("Sauna and Ice Bath");
  });
});

describe("critical EN content — class names", () => {
  it("mobility is Open-Air Mobility Flow", () => {
    expect(en.classInfo.mobility.name).toBe("Open-Air Mobility Flow");
  });

  it("strength is Open-Air Strength Flow", () => {
    expect(en.classInfo.strength.name).toBe("Open-Air Strength Flow");
  });

  it("pilates is Open-Air Pilates Flow", () => {
    expect(en.classInfo.pilates.name).toBe("Open-Air Pilates Flow");
  });

  it("funBurn is Open-Air Dance Burn", () => {
    expect(en.classInfo.funBurn.name).toBe("Open-Air Dance Burn");
  });
});

describe("critical content — popup", () => {
  it("EN popup title includes UNLOCK A FREE OUTDOOR CLASS", () => {
    expect(en.popup.title).toContain("UNLOCK A FREE OUTDOOR CLASS");
  });

  it("EN popup CTA is 'I am in. Sign Up'", () => {
    expect(en.popup.cta).toBe("I am in. Sign Up");
  });
});
