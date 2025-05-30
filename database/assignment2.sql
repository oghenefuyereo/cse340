INSERT INTO account (
  account_firstname,
  account_lastname,
  account_email,
  account_password
) VALUES (
  'Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n'
);

UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

DELETE FROM account
WHERE account_email = 'tony@starkent.com';

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

SELECT inv.inv_make, inv.inv_model, cls.classification_name
FROM inventory AS inv
INNER JOIN classification AS cls
  ON inv.classification_id = cls.classification_id
WHERE cls.classification_name = 'Sport';

UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
