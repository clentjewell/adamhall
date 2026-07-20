-- Applied 20 Jul 2026: swap seed picsum placeholders for generated
-- dealership photography hosted in the public car-photos bucket
-- (cars/<slug>/{front,rear,interior}.jpg + heroes/{home,cars,sell}.jpg).
with base as (select 'https://ocyxhfyphqyirjbyvhnw.supabase.co/storage/v1/object/public/car-photos/cars/' as u)
update cars c set photos = jsonb_build_array(
  jsonb_build_object('url', b.u || c.slug || '/front.jpg', 'alt', c.year || ' ' || c.make || ' ' || c.model || ' front three-quarter'),
  jsonb_build_object('url', b.u || c.slug || '/rear.jpg', 'alt', c.year || ' ' || c.make || ' ' || c.model || ' rear three-quarter'),
  jsonb_build_object('url', b.u || c.slug || '/interior.jpg', 'alt', c.year || ' ' || c.make || ' ' || c.model || ' interior')
)
from base b
where c.slug in (
  '2021-toyota-hilux-sr5-4x4','2019-ford-ranger-xlt-32','2022-toyota-rav4-cruiser-hybrid',
  '2020-mazda-cx5-touring','2018-toyota-landcruiser-prado-gxl','2021-hyundai-i30-active',
  '2020-isuzu-dmax-lsu','2019-kia-cerato-sport'
);
