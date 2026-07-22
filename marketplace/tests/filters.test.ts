import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { applyFilters } from "../lib/filters";
import type { Car } from "../lib/types";

let seq = 0;
function makeCar(overrides: Partial<Car> = {}): Car {
  seq += 1;
  return {
    id: `car-${seq}`,
    slug: `car-${seq}`,
    make: "Toyota",
    model: "Corolla",
    badge: null,
    year: 2019,
    price: 20000,
    odometer_km: 60000,
    body_type: "Sedan",
    transmission: "Automatic",
    fuel: "Petrol",
    drivetrain: null,
    colour: null,
    seats: 5,
    description: null,
    adams_take: null,
    video_url: null,
    ppsr_clear: true,
    service_history: "full",
    inspection_summary: null,
    photos: [],
    status: "published",
    published_at: new Date().toISOString(),
    sold_at: null,
    source_submission_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const fleet: Car[] = [
  makeCar({ make: "Toyota", model: "Corolla", price: 18000, odometer_km: 80000, year: 2017 }),
  makeCar({ make: "Toyota", model: "Camry", price: 32000, odometer_km: 40000, year: 2021 }),
  makeCar({ make: "Mazda", model: "CX-5", price: 27000, odometer_km: 55000, year: 2020 }),
  makeCar({ make: "Mazda", model: "3", price: 21000, odometer_km: 120000, year: 2016 }),
];

describe("applyFilters", () => {
  test("empty filter returns all cars unchanged", () => {
    const result = applyFilters(fleet, {});
    assert.equal(result.length, fleet.length);
    assert.deepEqual(result, fleet);
  });

  test("filters by make", () => {
    const result = applyFilters(fleet, { make: "Mazda" });
    assert.equal(result.length, 2);
    assert.ok(result.every((c) => c.make === "Mazda"));
  });

  test("filters by make and model together", () => {
    const result = applyFilters(fleet, { make: "Toyota", model: "Camry" });
    assert.equal(result.length, 1);
    assert.equal(result[0].model, "Camry");
  });

  test("filters by price range (min and max)", () => {
    const result = applyFilters(fleet, { priceMin: 20000, priceMax: 28000 });
    assert.equal(result.length, 2);
    assert.ok(result.every((c) => c.price >= 20000 && c.price <= 28000));
  });

  test("filters by kmMax", () => {
    const result = applyFilters(fleet, { kmMax: 60000 });
    assert.equal(result.length, 2);
    assert.ok(result.every((c) => c.odometer_km <= 60000));
  });

  test("sorts price ascending", () => {
    const result = applyFilters(fleet, { sort: "price-asc" });
    const prices = result.map((c) => c.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  test("sorts price descending", () => {
    const result = applyFilters(fleet, { sort: "price-desc" });
    const prices = result.map((c) => c.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => b - a));
  });

  test("combines filtering and sorting", () => {
    const result = applyFilters(fleet, { make: "Mazda", sort: "price-desc" });
    assert.deepEqual(
      result.map((c) => c.model),
      ["CX-5", "3"],
    );
  });

  test("returns empty array when nothing matches", () => {
    const result = applyFilters(fleet, { make: "Ford" });
    assert.equal(result.length, 0);
  });
});
