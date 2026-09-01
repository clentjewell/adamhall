import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_DRAFT_PHOTOS,
  draftInstruction,
  draftSystemPrompt,
  factSheet,
  pickPhotos,
  type DraftSpec,
} from "../lib/listing-draft";

const base: DraftSpec = { make: "Toyota", model: "Hilux" };

describe("factSheet", () => {
  test("names the car from the parts that are filled in", () => {
    const sheet = factSheet({ ...base, year: 2021, badge: "SR5 4x4" });
    assert.match(sheet, /Car: 2021 Toyota Hilux SR5 4x4/);
  });

  test("leaves out fields the dealer hasn't filled in", () => {
    const sheet = factSheet(base);
    assert.ok(!sheet.includes("Colour"));
    assert.ok(!sheet.includes("Odometer"));
    assert.ok(!sheet.includes("Transmission"));
  });

  test("keeps a zero odometer, which is a real reading", () => {
    assert.match(factSheet({ ...base, odometer_km: 0 }), /Odometer: 0 km/);
  });

  test("says PPSR is not confirmed unless it is", () => {
    assert.match(factSheet(base), /PPSR: not confirmed clear yet/);
    assert.match(
      factSheet({ ...base, ppsr_clear: true }),
      /PPSR: checked and clear/,
    );
  });

  test("spells out what each service history setting means", () => {
    assert.match(factSheet({ ...base, service_history: "none" }), /no service records/);
    assert.match(
      factSheet({ ...base, service_history: "unknown" }),
      /still being confirmed/,
    );
  });

  test("passes the dealer's own take through but marks it as already used", () => {
    const sheet = factSheet({ ...base, adams_take: "Cleanest one I've had." });
    assert.match(sheet, /don't repeat it/);
    assert.match(sheet, /Cleanest one I've had\./);
  });
});

describe("draftInstruction", () => {
  test("tells the model how many photos it is looking at", () => {
    assert.match(draftInstruction(base, 3), /The 3 photographs above/);
    assert.match(draftInstruction(base, 1), /The photograph above/);
  });

  test("says to work from the specs when there are no photos", () => {
    assert.match(draftInstruction(base, 0), /no photographs on this car yet/);
  });

  test("carries the facts", () => {
    assert.match(draftInstruction({ ...base, colour: "Glacier White" }, 2), /Glacier White/);
  });
});

describe("draftSystemPrompt", () => {
  const prompt = draftSystemPrompt();

  test("forbids inventing the things the site's promise rests on", () => {
    assert.match(prompt, /Never invent a service history/);
    assert.match(prompt, /No em dashes/);
  });

  test("asks for the description alone", () => {
    assert.match(prompt, /Return the description text only/);
  });
});

describe("pickPhotos", () => {
  const hosts = ["files.example.com"];
  const url = (n: number) => `https://files.example.com/car-${n}.jpg`;

  test("keeps the order it is given, so the hero shot stays first", () => {
    const picked = pickPhotos([url(1), url(2), url(3)], hosts);
    assert.deepEqual(picked, [url(1), url(2), url(3)]);
  });

  test("caps the number sent", () => {
    const many = Array.from({ length: 12 }, (_, i) => url(i));
    assert.equal(pickPhotos(many, hosts).length, MAX_DRAFT_PHOTOS);
  });

  test("drops anything off the allowed hosts", () => {
    assert.deepEqual(
      pickPhotos(["https://elsewhere.test/a.jpg", url(1)], hosts),
      [url(1)],
    );
  });

  test("drops plain http and unparseable urls", () => {
    assert.deepEqual(
      pickPhotos(["http://files.example.com/a.jpg", "not a url", url(1)], hosts),
      [url(1)],
    );
  });

  test("drops duplicates", () => {
    assert.deepEqual(pickPhotos([url(1), url(1)], hosts), [url(1)]);
  });
});
