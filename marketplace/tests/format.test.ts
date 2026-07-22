import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatPrice, formatKm, carTitle, slugify } from "../lib/format";

describe("formatPrice", () => {
  test("formats whole AUD amounts with no decimals", () => {
    assert.equal(formatPrice(24990), "$24,990");
  });

  test("formats zero", () => {
    assert.equal(formatPrice(0), "$0");
  });

  test("returns an em dash for null/undefined", () => {
    assert.equal(formatPrice(null), "—");
    assert.equal(formatPrice(undefined), "—");
  });

  test("rounds/truncates to no decimal places even with cents", () => {
    // maximumFractionDigits: 0 means Intl rounds to the nearest whole dollar
    assert.equal(formatPrice(24990.6), "$24,991");
  });
});

describe("formatKm", () => {
  test("formats km with thousands separators and suffix", () => {
    assert.equal(formatKm(84000), "84,000 km");
  });

  test("formats small distances", () => {
    assert.equal(formatKm(0), "0 km");
  });

  test("returns an em dash for null/undefined", () => {
    assert.equal(formatKm(null), "—");
    assert.equal(formatKm(undefined), "—");
  });
});

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    assert.equal(slugify("Toyota Corolla Ascent Sport"), "toyota-corolla-ascent-sport");
  });

  test("collapses non-alphanumeric runs into a single hyphen", () => {
    assert.equal(slugify("2019 Mazda CX-5 (Maxx Sport)"), "2019-mazda-cx-5-maxx-sport");
  });

  test("trims leading/trailing hyphens", () => {
    assert.equal(slugify("--Hello World--"), "hello-world");
  });
});

describe("carTitle", () => {
  test("composes year, make, model, badge", () => {
    assert.equal(
      carTitle({ year: 2019, make: "Toyota", model: "Corolla", badge: "Ascent Sport" }),
      "2019 Toyota Corolla Ascent Sport",
    );
  });

  test("omits a missing badge without leaving a stray gap", () => {
    assert.equal(
      carTitle({ year: 2019, make: "Toyota", model: "Corolla", badge: null }),
      "2019 Toyota Corolla",
    );
  });

  test("omits falsy fields entirely (e.g. missing year)", () => {
    assert.equal(
      carTitle({ year: null, make: "Toyota", model: "Corolla" }),
      "Toyota Corolla",
    );
  });
});
