-- Create the account table
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'User'
);
-- Insert a new record for Tony Stark
INSERT INTO account (first_name, last_name, email, password)
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Update Tony Stark's account type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE email = 'tony@starkent.com';
-- Delete the record for Tony Stark
DELETE FROM account
WHERE email = 'tony@starkent.com';
-- Modify the description of the "GM Hummer" using REPLACE function
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_model = 'GM Hummer';
-- Select make, model, and classification for items in the 'Sport' category
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';
-- Update image and thumbnail paths in the inventory table
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');