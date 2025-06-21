UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

    
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/vehicles/vehicles/', '/vehicles/')
WHERE inv_image LIKE '%/vehicles/vehicles/%';

UPDATE inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '/vehicles/vehicles/', '/vehicles/')
WHERE inv_thumbnail LIKE '%/vehicles/vehicles/%';


UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/')
WHERE inv_image LIKE '/images/%'
  AND inv_image NOT LIKE '/images/vehicles/%';

UPDATE inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_thumbnail LIKE '/images/%'
  AND inv_thumbnail NOT LIKE '/images/vehicles/%';

