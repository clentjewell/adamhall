-- Demo data: 8 cars (7 live, 1 recently sold) + 3 submissions in-pipeline.
-- Photos use picsum placeholders until real photography lands.

insert into cars (slug, make, model, badge, year, price, odometer_km, body_type, transmission, fuel, drivetrain, colour, seats, description, adams_take, ppsr_clear, service_history, inspection_summary, photos, status, published_at, sold_at, video_url) values
('2021-toyota-hilux-sr5-4x4', 'Toyota', 'Hilux', 'SR5 4x4', 2021, 52990, 68400, 'Ute', 'Automatic', 'Diesel', '4x4', 'Glacier White', 5,
 'One-owner SR5 dual cab with the 2.8 turbo diesel. Towbar, tub liner and side steps already fitted. Serviced on the dot at Toyota since new, and the books prove it.',
 'This is the ute everyone asks me for and I can rarely find this clean. First one to drive it will buy it.',
 true, 'full', 'Fresh service done. Tyres at 80%. No accident history, interior barely touched.',
 '[{"url":"https://picsum.photos/seed/hilux-sr5-front/1200/800","alt":"2021 Toyota Hilux SR5 front three-quarter"},{"url":"https://picsum.photos/seed/hilux-sr5-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/hilux-sr5-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/hilux-sr5-dash/1200/800","alt":"Dash and odometer"}]',
 'published', now() - interval '2 days', null, null),

('2019-ford-ranger-xlt-32', 'Ford', 'Ranger', 'XLT 3.2', 2019, 39990, 98200, 'Ute', 'Automatic', 'Diesel', '4x4', 'Meteor Grey', 5,
 'The 3.2 five-cylinder XLT — the one tradies hunt for. Full leather retrofit, canopy included. Two owners, both fastidious.',
 'Higher kays than some, priced accordingly. Mechanically this is one of the best 3.2s I''ve had through.',
 true, 'full', 'Timing done. New front tyres. Small scuff on rear bumper photographed honestly.',
 '[{"url":"https://picsum.photos/seed/ranger-xlt-front/1200/800","alt":"2019 Ford Ranger XLT front three-quarter"},{"url":"https://picsum.photos/seed/ranger-xlt-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/ranger-xlt-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/ranger-xlt-tray/1200/800","alt":"Tray with canopy"}]',
 'published', now() - interval '5 days', null, null),

('2022-toyota-rav4-cruiser-hybrid', 'Toyota', 'RAV4', 'Cruiser Hybrid AWD', 2022, 46500, 41900, 'SUV', 'Automatic', 'Hybrid', 'AWD', 'Saturn Blue', 5,
 'Cruiser-spec hybrid AWD, still under factory warranty. JBL audio, sunroof, power tailgate. The wait list for these new is still long — this one is here now.',
 'Sips fuel, drives like new, warranty until 2027. If you need a family SUV this is the safest money on the lot.',
 true, 'full', 'As-new condition. Serviced at Toyota, all electronic checks passed.',
 '[{"url":"https://picsum.photos/seed/rav4-cruiser-front/1200/800","alt":"2022 Toyota RAV4 Cruiser front three-quarter"},{"url":"https://picsum.photos/seed/rav4-cruiser-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/rav4-cruiser-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/rav4-cruiser-boot/1200/800","alt":"Boot space"}]',
 'published', now() - interval '1 day', null, null),

('2020-mazda-cx5-touring', 'Mazda', 'CX-5', 'Touring', 2020, 31990, 62300, 'SUV', 'Automatic', 'Petrol', 'AWD', 'Soul Red', 5,
 'Touring AWD in the red everyone wants. Leather, heads-up display, radar cruise. Full Mazda service history.',
 'CX-5s are the easiest car I sell — this one''s tidy, priced right, and it won''t sit here long.',
 true, 'full', 'Serviced and detailed. Tyres 70%. One touched-up stone chip on bonnet, noted in photos.',
 '[{"url":"https://picsum.photos/seed/cx5-touring-front/1200/800","alt":"2020 Mazda CX-5 Touring front three-quarter"},{"url":"https://picsum.photos/seed/cx5-touring-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/cx5-touring-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/cx5-touring-dash/1200/800","alt":"Dash"}]',
 'published', now() - interval '3 days', null, null),

('2018-toyota-landcruiser-prado-gxl', 'Toyota', 'LandCruiser Prado', 'GXL', 2018, 48990, 112000, 'SUV', 'Automatic', 'Diesel', '4x4', 'Graphite', 7,
 'Seven-seat GXL diesel with the full towing kit and a set of all-terrains. Country car, highway kays, always garaged.',
 'Prados hold money better than the bank. 112 on the clock is nothing for these — it''s barely warmed up.',
 true, 'partial', 'Books to 100k at Toyota, then a local mechanic — receipts supplied. Drives exactly as a Prado should.',
 '[{"url":"https://picsum.photos/seed/prado-gxl-front/1200/800","alt":"2018 Toyota LandCruiser Prado GXL front three-quarter"},{"url":"https://picsum.photos/seed/prado-gxl-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/prado-gxl-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/prado-gxl-thirdrow/1200/800","alt":"Third row seats"}]',
 'published', now() - interval '8 days', null, null),

('2021-hyundai-i30-active', 'Hyundai', 'i30', 'Active', 2021, 23490, 38750, 'Hatch', 'Automatic', 'Petrol', 'FWD', 'Polar White', 5,
 'Low-kay i30 auto with balance of 5-year factory warranty. Apple CarPlay, rear camera, one lady owner.',
 'Perfect first car or runabout. Nothing to spend, nothing to worry about — just get in and drive.',
 true, 'full', 'Warranty until late 2026. Near-new tyres. Spotless inside.',
 '[{"url":"https://picsum.photos/seed/i30-active-front/1200/800","alt":"2021 Hyundai i30 Active front three-quarter"},{"url":"https://picsum.photos/seed/i30-active-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/i30-active-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/i30-active-dash/1200/800","alt":"Dash and odometer"}]',
 'published', now() - interval '4 days', null, null),

('2020-isuzu-dmax-lsu', 'Isuzu', 'D-MAX', 'LS-U', 2020, 42990, 74600, 'Ute', 'Automatic', 'Diesel', '4x4', 'Cobalt Blue', 5,
 'LS-U dual cab with the bulletproof 3.0 diesel. Alloy tray bars, tonneau, tow kit. Ex-farm but city-kept condition.',
 'The D-MAX is the ute I''d put my own father in. This one''s honest, straight, and ready to work.',
 true, 'full', 'Serviced on schedule. Underbody inspected — clean. Tyres 75%.',
 '[{"url":"https://picsum.photos/seed/dmax-lsu-front/1200/800","alt":"2020 Isuzu D-MAX LS-U front three-quarter"},{"url":"https://picsum.photos/seed/dmax-lsu-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/dmax-lsu-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/dmax-lsu-tray/1200/800","alt":"Tray"}]',
 'published', now() - interval '6 days', null, null),

('2019-kia-cerato-sport', 'Kia', 'Cerato', 'Sport', 2019, 21990, 55100, 'Sedan', 'Automatic', 'Petrol', 'FWD', 'Snow White', 5,
 'Cerato Sport sedan, balance of Kia''s 7-year warranty. CarPlay, alloys, tinted. Sold to a young couple from Kingscliff.',
 'Priced it Monday, sold it Thursday. That''s what happens when the car and the number are both honest.',
 true, 'full', 'Sold with fresh service and safety check.',
 '[{"url":"https://picsum.photos/seed/cerato-sport-front/1200/800","alt":"2019 Kia Cerato Sport front three-quarter"},{"url":"https://picsum.photos/seed/cerato-sport-rear/1200/800","alt":"Rear three-quarter"},{"url":"https://picsum.photos/seed/cerato-sport-interior/1200/800","alt":"Interior"},{"url":"https://picsum.photos/seed/cerato-sport-dash/1200/800","alt":"Dash"}]',
 'sold', now() - interval '12 days', now() - interval '5 days', null);

-- Submissions: one fresh, one under review, one with a live offer.
insert into submissions (rego, rego_state, make, model, year, odometer_km, service_history, had_accidents, accident_notes, tyres_condition, interior_condition, mechanical_issues, condition_notes, seller_name, phone, email, suburb, asking_price, sell_timeframe, status, created_at) values
('ABC12D', 'NSW', 'Mazda', '3', 2017, 89000, 'partial', false, null, 'Good — replaced last year', 'Tidy, small mark on rear seat', 'None that I know of', 'Garaged, mostly highway driving to work', 'Sarah Mitchell', '0412 345 678', 'sarah.mitchell@example.com', 'Tweed Heads', 16500, 'Within 2 weeks', 'new', now() - interval '3 hours');

insert into submissions (rego, rego_state, make, model, year, odometer_km, service_history, had_accidents, accident_notes, tyres_condition, interior_condition, mechanical_issues, condition_notes, seller_name, phone, email, suburb, asking_price, sell_timeframe, status, created_at) values
('XYZ98K', 'QLD', 'Toyota', 'Corolla', 2016, 124000, 'full', true, 'Minor rear-ender in 2019, repaired at an approved shop', 'Fair — will need two soon', 'Good for age', 'Aircon a bit weak', 'Books in the glovebox, receipts for everything', 'Dave Nguyen', '0433 987 654', 'dave.nguyen@example.com', 'Coolangatta', null, 'No rush', 'reviewing', now() - interval '1 day');

insert into submissions (rego, rego_state, make, model, year, odometer_km, service_history, had_accidents, accident_notes, tyres_condition, interior_condition, mechanical_issues, condition_notes, seller_name, phone, email, suburb, asking_price, sell_timeframe, status, offer_amount, offer_sent_at, created_at) values
('TRI19G', 'NSW', 'Mitsubishi', 'Triton', 2019, 76400, 'full', false, null, 'Very good', 'Clean, ute-liner kept the tray straight', 'None', 'One owner, dealer serviced, selling because of a company car', 'Mick Torrens', '0401 222 333', 'mick.torrens@example.com', 'Murwillumbah', 26000, 'This week', 'offer_made', 24500, now() - interval '4 hours', now() - interval '2 days');

-- Valuation worksheet for the Triton (Adam's judgement, captured).
insert into valuations (submission_id, offer_amount, expected_retail, expected_recon, notes, updated_by)
select id, 24500, 29990, 1100, 'Straight ute, good colour, GLS spec sells itself. Recon is tyres + full detail + minor tray tidy. Firm at 24.5 — retail moves inside 3 weeks.', 'Adam'
from submissions where rego = 'TRI19G';

-- Audit trail mirroring how the pipeline actually moved.
insert into status_events (entity_type, entity_id, from_status, to_status, actor, note, created_at)
select 'submission', id, null, 'new', 'system', 'Submission received', created_at from submissions;

insert into status_events (entity_type, entity_id, from_status, to_status, actor, note, created_at)
select 'submission', id, 'new', 'reviewing', 'Adam', null, created_at + interval '5 hours'
from submissions where rego in ('XYZ98K', 'TRI19G');

insert into status_events (entity_type, entity_id, from_status, to_status, actor, note, created_at)
select 'submission', id, 'reviewing', 'offer_made', 'Adam', 'Offer $24,500 sent', offer_sent_at
from submissions where rego = 'TRI19G';
