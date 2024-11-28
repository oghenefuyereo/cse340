-- Drop existing tables if they exist to ensure a clean rebuild
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
-- Create the classification table
CREATE TABLE classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) NOT NULL UNIQUE
);
-- Create the inventory table
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT NOT NULL,
    inv_image VARCHAR(255) NOT NULL,
    inv_thumbnail VARCHAR(255) NOT NULL,
    classification_id INT NOT NULL REFERENCES classification(classification_id)
);
-- Create the account table
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'User'
);
-- Populate the classification table with initial data
INSERT INTO classification (classification_name)
VALUES ('Sport'),
    ('Luxury'),
    ('SUV');
-- Populate the inventory table with initial data
INSERT INTO inventory (
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id
    )
VALUES (
        'GM',
        'Hummer',
        'small interiors, great power',
        '/images/hummer.jpg',
        '/images/hummer_thumb.jpg',
        3
    ),
    (
        'Ford',
        'Mustang',
        'sporty design and powerful engine',
        '/images/mustang.jpg',
        '/images/mustang_thumb.jpg',
        1
    ),
    (
        'Chevrolet',
        'Corvette',
        'luxury and performance',
        '/images/corvette.jpg',
        '/images/corvette_thumb.jpg',
        1
    );
-- 7. Populate the account table with initial data
INSERT INTO account (
        first_name,
        last_name,
        email,
        password,
        account_type
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n',
        'User'
    );
-- 8. Update: Modify the description of the "GM Hummer" using the REPLACE function
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_model = 'GM Hummer';
-- 9. Update: Modify the image and thumbnail paths for all inventory records
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');