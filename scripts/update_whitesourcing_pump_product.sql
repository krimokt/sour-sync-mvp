-- Run this in Supabase Studio → SQL Editor for project tlvwyobhndrtidetltcp.
-- It (1) adds an `attributes` jsonb column to products if missing,
-- (2) rewrites the RS15-9 pump product row with Alibaba-style content,
-- (3) updates the homepage Featured-Products list inside
--     website_settings.published_builder_data → generatedContent.products.items
--     so the same product appears on the storefront landing page.

-- 1. Schema additions (safe to re-run)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS attributes jsonb DEFAULT '{}'::jsonb;

-- 2. Update the product row
UPDATE public.products
SET
  name        = 'Home High Pressure Bathroom Automatic Circulation RS15-9 Booster Electric Bathroom Water Pump',
  description = E'Whisper-quiet RS15-9 hot/cold water booster pump for bathrooms, showers, water heaters, floor heating, and boilers. Cast-iron pump body with corrosion-resistant impeller and automatic flow-sensing control — starts when you open a tap and stops when you close it. Designed for household pressure boosting in apartments, villas, and small commercial installations.\n\n• Automatic flow switch — turns on/off with water demand\n• 100 W single-phase motor, low noise (<48 dB)\n• Cast-iron casing with brass connections, 1" (DN25) inlet/outlet\n• Works with hot water up to 110 °C\n• Compact in-line design, easy retrofit on existing pipes',
  images      = ARRAY[
    'https://s.alicdn.com/@sc04/kf/H21f99921dff8458988878b5c167f6c4co.jpg',
    'https://s.alicdn.com/@sc04/kf/H1f107bf9046348eb8886e5fbbe9e0241o.jpg',
    'https://s.alicdn.com/@sc04/kf/H5501171cb42849e1acc46557875efeb2C.jpg',
    'https://s.alicdn.com/@sc04/kf/H6c262f05662446e8b964d4e74dcbf4382.jpg',
    'https://s.alicdn.com/@sc04/kf/He41cb70c54eb478486abf5955c7ed832a.jpg',
    'https://s.alicdn.com/@sc04/kf/Hbd429c07ef464c7aa25c6ce1609d60225.jpg'
  ],
  category    = COALESCE(category, 'Water Pumps'),
  attributes  = jsonb_build_object(
    'Model Number',     'RS15-9',
    'Brand Name',       'OEM / ODM',
    'Place of Origin',  'Zhejiang, China',
    'Power',            '100 W',
    'Voltage',          '220–240 V / 50 Hz',
    'Max Flow',         '30 L/min',
    'Max Head',         '9 m',
    'Inlet / Outlet',   '1 inch (DN25)',
    'Max Water Temp',   '110 °C',
    'Material',         'Cast iron body, brass connections',
    'Application',      'Bathroom, shower, water heater, floor heating, boiler',
    'Type',             'Centrifugal automatic booster pump',
    'Control',          'Automatic flow switch',
    'Noise Level',      '< 48 dB',
    'Certification',    'CE, RoHS',
    'Warranty',         '12 months',
    'MOQ',              '8 pieces',
    'Packaging',        'Carton box, 4 pcs/carton',
    'Lead Time',        '15–25 days',
    'Payment Terms',    'T/T, L/C, Western Union'
  )
WHERE id = '97fbcaf1-5152-4452-a23c-3e82e573627f';

-- 3. Update homepage Featured-Products entry inside the published builder JSON.
-- This rewrites the matching item in website_settings.published_builder_data
-- → generatedContent.products.items[*] where id matches.
UPDATE public.website_settings ws
SET published_builder_data = jsonb_set(
  ws.published_builder_data::jsonb,
  '{generatedContent,products,items}',
  COALESCE(
    (
      SELECT jsonb_agg(
        CASE
          WHEN item->>'id' = '97fbcaf1-5152-4452-a23c-3e82e573627f'
          THEN item
               || jsonb_build_object(
                    'name',  'Home High Pressure Bathroom Automatic Circulation RS15-9 Booster Electric Bathroom Water Pump',
                    'image', 'https://s.alicdn.com/@sc04/kf/H21f99921dff8458988878b5c167f6c4co.jpg'
                  )
          ELSE item
        END
      )
      FROM jsonb_array_elements(ws.published_builder_data->'generatedContent'->'products'->'items') AS item
    ),
    '[]'::jsonb
  )
)
WHERE company_id = (SELECT id FROM public.companies WHERE slug = 'whitesourcing')
  AND ws.published_builder_data IS NOT NULL
  AND ws.published_builder_data->'generatedContent'->'products'->'items' IS NOT NULL;

-- Sanity check
SELECT id, name, jsonb_pretty(attributes) AS attributes, images
FROM public.products
WHERE id = '97fbcaf1-5152-4452-a23c-3e82e573627f';
