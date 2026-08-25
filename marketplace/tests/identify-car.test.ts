import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  identifyInstruction,
  identifySystemPrompt,
  parseIdentification,
} from "../lib/identify-car";

describe("identifySystemPrompt", () => {
  const prompt = identifySystemPrompt();

  test("forbids the fields a photo cannot show", () => {
    assert.match(prompt, /Never guess odometer, price/);
  });

  test("permits body type from the silhouette, which is the ask", () => {
    assert.match(prompt, /safe to judge from the silhouette/);
  });

  test("asks for bare JSON and an empty object when unsure", () => {
    assert.match(prompt, /JSON object only/);
    assert.match(prompt, /return \{\}/);
  });
});

describe("identifyInstruction", () => {
  test("counts the photos", () => {
    assert.match(identifyInstruction(1), /the photograph above/);
    assert.match(identifyInstruction(4), /The 4 photographs above/);
  });
});

describe("parseIdentification", () => {
  test("accepts a clean answer", () => {
    const id = parseIdentification(
      '{"make":"Toyota","model":"Hilux","body_type":"Ute","colour":"White","year_min":2020,"year_max":2023}',
    );
    assert.equal(id?.make, "Toyota");
    assert.equal(id?.body_type, "Ute");
    assert.equal(id?.year_min, 2020);
  });

  test("survives markdown fences and prose around the JSON", () => {
    const id = parseIdentification(
      'Here you go:\n```json\n{"make":"Mazda","model":"CX-5"}\n```\nHope that helps.',
    );
    assert.equal(id?.model, "CX-5");
  });

  test("an empty object is a valid I-can't-tell answer", () => {
    assert.deepEqual(parseIdentification("{}"), {});
  });

  test("rejects fields outside the schema rather than passing them through", () => {
    assert.equal(
      parseIdentification('{"make":"Toyota","odometer_km":68000}'),
      null,
    );
    assert.equal(parseIdentification('{"price":52990}'), null);
  });

  test("rejects non-JSON and half-JSON", () => {
    assert.equal(parseIdentification("A white Toyota Hilux ute."), null);
    assert.equal(parseIdentification('{"make":'), null);
    assert.equal(parseIdentification(""), null);
  });

  test("drops a year range that runs backwards", () => {
    const id = parseIdentification(
      '{"make":"Ford","year_min":2023,"year_max":2019}',
    );
    assert.equal(id?.make, "Ford");
    assert.equal(id?.year_min, undefined);
    assert.equal(id?.year_max, undefined);
  });

  test("rejects an implausible seat count", () => {
    assert.equal(parseIdentification('{"seats":40}'), null);
  });
});
