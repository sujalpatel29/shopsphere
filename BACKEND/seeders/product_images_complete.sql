-- Complete Seeder: product_images (Cloudinary images only)
-- Generated: 2026-03-13
-- This file adds missing columns AND inserts data

-- Step 1: Add missing columns (ignore errors if columns already exist)
SET @dbname = DATABASE();
SET @tablename = 'product_images';

-- Add alt_text column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'alt_text');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `product_images` ADD COLUMN `alt_text` varchar(255) DEFAULT NULL AFTER `public_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add sort_order column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'sort_order');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `product_images` ADD COLUMN `sort_order` int DEFAULT 0 AFTER `is_primary`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_active column
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'is_active');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `product_images` ADD COLUMN `is_active` tinyint(1) DEFAULT 1 AFTER `is_deleted`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Clear existing data
TRUNCATE TABLE `product_images`;

-- Step 3: Insert product images (Cloudinary URLs only)
INSERT INTO `product_images` (`image_url`, `public_id`, `alt_text`, `is_primary`, `sort_order`, `is_deleted`, `product_id`, `is_active`, `image_level`, `created_at`, `updated_at`) VALUES
-- Product 1 (iPhone 15 Pro Max)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771539993/ecommerce/products/product_1/w9hfj9o9cvhmbxxyfpwn.jpg','ecommerce/products/product_1/w9hfj9o9cvhmbxxyfpwn',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771539995/ecommerce/products/product_1/r5udzfwpnvsvdjj5ybeb.jpg','ecommerce/products/product_1/r5udzfwpnvsvdjj5ybeb',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771539997/ecommerce/products/product_1/h237zauvlqqjmxcx6tg5.jpg','ecommerce/products/product_1/h237zauvlqqjmxcx6tg5',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771539998/ecommerce/products/product_1/y2omxpsndwcbpflh1mbk.jpg','ecommerce/products/product_1/y2omxpsndwcbpflh1mbk',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771539999/ecommerce/products/product_1/lsxad7r9sfc05rnpchug.jpg','ecommerce/products/product_1/lsxad7r9sfc05rnpchug',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540044/ecommerce/products/product_1/b0gzjaccvm6ngeqemusn.jpg','ecommerce/products/product_1/b0gzjaccvm6ngeqemusn',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540049/ecommerce/products/product_1/fahfwq3uvtcytzvc5uhk.jpg','ecommerce/products/product_1/fahfwq3uvtcytzvc5uhk',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540052/ecommerce/products/product_1/ua85taxksfwvlobapjbt.jpg','ecommerce/products/product_1/ua85taxksfwvlobapjbt',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540054/ecommerce/products/product_1/uljlik3wi2vrqku965hk.jpg','ecommerce/products/product_1/uljlik3wi2vrqku965hk',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540056/ecommerce/products/product_1/otsllqeewut8w98x8eff.jpg','ecommerce/products/product_1/otsllqeewut8w98x8eff',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540380/ecommerce/products/product_1/ukhmu71ef3ynbubpnel6.jpg','ecommerce/products/product_1/ukhmu71ef3ynbubpnel6',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540382/ecommerce/products/product_1/aj4nkxjelqscwndnt6ye.jpg','ecommerce/products/product_1/aj4nkxjelqscwndnt6ye',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540383/ecommerce/products/product_1/safmoa1u3s4ttc4ppigf.jpg','ecommerce/products/product_1/safmoa1u3s4ttc4ppigf',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540385/ecommerce/products/product_1/pzfnkcej21adiyw8az90.jpg','ecommerce/products/product_1/pzfnkcej21adiyw8az90',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540386/ecommerce/products/product_1/uvj2cnyschg3eygz3fnw.jpg','ecommerce/products/product_1/uvj2cnyschg3eygz3fnw',NULL,0,0,0,1,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
-- Product 2 (iPhone 14)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540001/ecommerce/products/product_2/v1zjni9ep4qtwd0rvky3.jpg','ecommerce/products/product_2/v1zjni9ep4qtwd0rvky3',NULL,0,0,0,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540002/ecommerce/products/product_2/lnpiqsojrlm7wuqw5agg.jpg','ecommerce/products/product_2/lnpiqsojrlm7wuqw5agg',NULL,0,0,0,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540003/ecommerce/products/product_2/arhbcbzbpuwwdwdvt8ut.jpg','ecommerce/products/product_2/arhbcbzbpuwwdwdvt8ut',NULL,0,0,0,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540005/ecommerce/products/product_2/fk51jpcyigq3pheqzqil.jpg','ecommerce/products/product_2/fk51jpcyigq3pheqzqil',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:25'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540006/ecommerce/products/product_2/bnyzylrm6iurxtkure7h.png','ecommerce/products/product_2/bnyzylrm6iurxtkure7h',NULL,0,0,0,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540057/ecommerce/products/product_2/dttz5dhfhpjrdlgzj8fv.jpg','ecommerce/products/product_2/dttz5dhfhpjrdlgzj8fv',NULL,0,0,0,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540058/ecommerce/products/product_2/s20zbstkgp5fzds8dup3.jpg','ecommerce/products/product_2/s20zbstkgp5fzds8dup3',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540059/ecommerce/products/product_2/rbdr5kofcgynfubmzqbg.jpg','ecommerce/products/product_2/rbdr5kofcgynfubmzqbg',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540060/ecommerce/products/product_2/zlj9wlw1ehz3b90hr9q6.jpg','ecommerce/products/product_2/zlj9wlw1ehz3b90hr9q6',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540061/ecommerce/products/product_2/x7ydk16ovjx3rkmkinic.png','ecommerce/products/product_2/x7ydk16ovjx3rkmkinic',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540387/ecommerce/products/product_2/gdrhq0xj6oj0avaqalyz.jpg','ecommerce/products/product_2/gdrhq0xj6oj0avaqalyz',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540388/ecommerce/products/product_2/wy1v9cvh1pcgnnoufqcs.jpg','ecommerce/products/product_2/wy1v9cvh1pcgnnoufqcs',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540389/ecommerce/products/product_2/ydha5ik4belkkfdgzf1i.png','ecommerce/products/product_2/ydha5ik4belkkfdgzf1i',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540391/ecommerce/products/product_2/koakofybe2kmbfwt2pky.jpg','ecommerce/products/product_2/koakofybe2kmbfwt2pky',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540392/ecommerce/products/product_2/c48asbg8w1ryu1v4mc3j.jpg','ecommerce/products/product_2/c48asbg8w1ryu1v4mc3j',NULL,0,0,1,2,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:22:26'),
-- Product 3 (Galaxy S24 Ultra)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540008/ecommerce/products/product_3/eaj0p0mero72wabkhkq0.jpg','ecommerce/products/product_3/eaj0p0mero72wabkhkq0',NULL,0,0,0,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540009/ecommerce/products/product_3/resk5n6jvmpvdobqhaai.jpg','ecommerce/products/product_3/resk5n6jvmpvdobqhaai',NULL,0,0,0,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540010/ecommerce/products/product_3/o54oi5k0lnfrq7tty48c.jpg','ecommerce/products/product_3/o54oi5k0lnfrq7tty48c',NULL,0,0,0,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540012/ecommerce/products/product_3/uqard391hv3uoyfuix2z.jpg','ecommerce/products/product_3/uqard391hv3uoyfuix2z',NULL,0,0,0,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540063/ecommerce/products/product_3/vxtfjquamgjzolsbdjay.jpg','ecommerce/products/product_3/vxtfjquamgjzolsbdjay',NULL,0,0,0,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540064/ecommerce/products/product_3/ido04pbalbtyy1ub7pou.jpg','ecommerce/products/product_3/ido04pbalbtyy1ub7pou',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540065/ecommerce/products/product_3/vjvcjlpmjsvebwcb5ubz.jpg','ecommerce/products/product_3/vjvcjlpmjsvebwcb5ubz',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540067/ecommerce/products/product_3/nnbu33rzeeftppiompm6.jpg','ecommerce/products/product_3/nnbu33rzeeftppiompm6',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540068/ecommerce/products/product_3/xgx70korvjh79cgzfdwo.jpg','ecommerce/products/product_3/xgx70korvjh79cgzfdwo',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540393/ecommerce/products/product_3/gkzwjgi6hfhemopypdxv.jpg','ecommerce/products/product_3/gkzwjgi6hfhemopypdxv',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540394/ecommerce/products/product_3/e5yujqezrudng2ggwras.jpg','ecommerce/products/product_3/e5yujqezrudng2ggwras',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540395/ecommerce/products/product_3/py0mgwwyf4ixfbukhpjc.jpg','ecommerce/products/product_3/py0mgwwyf4ixfbukhpjc',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540396/ecommerce/products/product_3/ev6nvazg3pzcu5zxpsu2.jpg','ecommerce/products/product_3/ev6nvazg3pzcu5zxpsu2',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540397/ecommerce/products/product_3/pof0lrjjwgauuetegyv9.jpg','ecommerce/products/product_3/pof0lrjjwgauuetegyv9',NULL,0,0,1,3,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:25:17'),
-- Product 4 (Galaxy A55)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540070/ecommerce/products/product_4/y7022expphyu0jnewog1.png','ecommerce/products/product_4/y7022expphyu0jnewog1',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540072/ecommerce/products/product_4/mesidin0fjpbqlxfyuzn.jpg','ecommerce/products/product_4/mesidin0fjpbqlxfyuzn',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540073/ecommerce/products/product_4/v7k9lqsqwre4xwrowl0x.jpg','ecommerce/products/product_4/v7k9lqsqwre4xwrowl0x',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540074/ecommerce/products/product_4/sce1atn6hvmtiba0yth5.jpg','ecommerce/products/product_4/sce1atn6hvmtiba0yth5',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540075/ecommerce/products/product_4/xxwvf0rg3dwqtxjcn8r0.jpg','ecommerce/products/product_4/xxwvf0rg3dwqtxjcn8r0',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540399/ecommerce/products/product_4/aswe6qod7ojfqxkbl3ti.png','ecommerce/products/product_4/aswe6qod7ojfqxkbl3ti',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540400/ecommerce/products/product_4/hhesw5yqwv2iprgklgaq.jpg','ecommerce/products/product_4/hhesw5yqwv2iprgklgaq',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540402/ecommerce/products/product_4/ooyzwo3x7fj7g3ufn8z3.jpg','ecommerce/products/product_4/ooyzwo3x7fj7g3ufn8z3',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540403/ecommerce/products/product_4/av62hqycobjotrl3wrgq.jpg','ecommerce/products/product_4/av62hqycobjotrl3wrgq',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540404/ecommerce/products/product_4/zbmwmwitdm6iid8d5fga.jpg','ecommerce/products/product_4/zbmwmwitdm6iid8d5fga',NULL,0,0,0,4,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
-- Product 5 (Redmi Note 13 Pro)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540077/ecommerce/products/product_5/zdronrqjssncsvftengt.jpg','ecommerce/products/product_5/zdronrqjssncsvftengt',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540079/ecommerce/products/product_5/dtope2qbdyr2mzpamnyd.webp','ecommerce/products/product_5/dtope2qbdyr2mzpamnyd',NULL,0,0,0,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540080/ecommerce/products/product_5/x3w3x4jngalstjatbifr.jpg','ecommerce/products/product_5/x3w3x4jngalstjatbifr',NULL,0,0,0,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540081/ecommerce/products/product_5/p4kc5egfrxpcao2n2r2q.jpg','ecommerce/products/product_5/c4kc5egfrxpcao2n2r2q',NULL,0,0,0,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540082/ecommerce/products/product_5/vinbmaptftsqi3b6b90i.jpg','ecommerce/products/product_5/vinbmaptftsqi3b6b90i',NULL,0,0,0,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540406/ecommerce/products/product_5/lpv0kih02urnelljlehv.jpg','ecommerce/products/product_5/lpv0kih02urnelljlehv',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540407/ecommerce/products/product_5/t0c6spzrzryxl3tgcims.webp','ecommerce/products/product_5/t0c6spzrzryxl3tgcims',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540408/ecommerce/products/product_5/vcdmoan9cl0s3pbgrebm.jpg','ecommerce/products/product_5/vcdmoan9cl0s3pbgrebm',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540409/ecommerce/products/product_5/hlodw5hddpaydxinwjty.jpg','ecommerce/products/product_5/hlodw5hddpaydxinwjty',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540410/ecommerce/products/product_5/ghahpocfmqhrlqznuntk.jpg','ecommerce/products/product_5/ghahpocfmqhrlqznuntk',NULL,0,0,1,5,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:26:18'),
-- Product 6 (POCO X6)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540083/ecommerce/products/product_6/x8czjc8hrccgt5rzgu7y.jpg','ecommerce/products/product_6/x8czjc8hrccgt5rzgu7y',NULL,0,0,0,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540085/ecommerce/products/product_6/eyhqrvnrrmqwpjstswqi.jpg','ecommerce/products/product_6/eyhqrvnrrmqwpjstswqi',NULL,0,0,1,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:27:04'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540086/ecommerce/products/product_6/e92wtfcrw9pppk0xxxgm.jpg','ecommerce/products/product_6/e92wtfcrw9pppk0xxxgm',NULL,0,0,0,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540087/ecommerce/products/product_6/x4v1frvqianv4jv80dpd.jpg','ecommerce/products/product_6/x4v1frvqianv4jv80dpd',NULL,0,0,0,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540088/ecommerce/products/product_6/b4m317ftjoa3z5dqcd1z.jpg','ecommerce/products/product_6/b4m317ftjoa3z5dqcd1z',NULL,0,0,0,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540413/ecommerce/products/product_6/bpzkl0ntvpayvmoqrke8.jpg','ecommerce/products/product_6/bpzkl0ntvpayvmoqrke8',NULL,0,0,1,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:27:04'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540414/ecommerce/products/product_6/dcqtf7sesztzom2luzgc.jpg','ecommerce/products/product_6/dcqtf7sesztzom2luzgc',NULL,0,0,0,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540416/ecommerce/products/product_6/juruz02vaci8lxupgmnj.jpg','ecommerce/products/product_6/juruz02vaci8lxupgmnj',NULL,0,0,1,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:27:04'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540417/ecommerce/products/product_6/smo2nljekmvw17bgrcqa.jpg','ecommerce/products/product_6/smo2nljekmvw17bgrcqa',NULL,0,0,1,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:27:04'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540418/ecommerce/products/product_6/r5wlb50zmlhbgzslzlrw.jpg','ecommerce/products/product_6/r5wlb50zmlhbgzslzlrw',NULL,0,0,1,6,1,'PRODUCT','2026-02-25 19:15:28','2026-02-26 03:27:04'),
-- Product 7-33 (placeholder images)
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540090/ecommerce/products/product_7/fvqzj0s9qkqzvjxqzqzq.jpg','ecommerce/products/product_7/fvqzj0s9qkqzvjxqzqzq',NULL,0,0,0,7,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540092/ecommerce/products/product_8/abc123realme.jpg','ecommerce/products/product_8/abc123realme',NULL,0,0,0,8,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540094/ecommerce/products/product_9/vivov30img.jpg','ecommerce/products/product_9/vivov30img',NULL,0,0,0,9,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540096/ecommerce/products/product_10/opporreno11.jpg','ecommerce/products/product_10/opporreno11',NULL,0,0,0,10,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540098/ecommerce/products/product_11/macbookairm3.jpg','ecommerce/products/product_11/macbookairm3',NULL,0,0,0,11,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540100/ecommerce/products/product_12/macbookprom3.jpg','ecommerce/products/product_12/macbookprom3',NULL,0,0,0,12,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540102/ecommerce/products/product_13/dellxps15.jpg','ecommerce/products/product_13/dellxps15',NULL,0,0,0,13,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540104/ecommerce/products/product_14/hpspectre.jpg','ecommerce/products/product_14/hpspectre',NULL,0,0,0,14,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540106/ecommerce/products/product_15/asusrog.jpg','ecommerce/products/product_15/asusrog',NULL,0,0,0,15,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540108/ecommerce/products/product_16/thinkpadx1.jpg','ecommerce/products/product_16/thinkpadx1',NULL,0,0,0,16,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540110/ecommerce/products/product_17/acerswift.jpg','ecommerce/products/product_17/acerswift',NULL,0,0,0,17,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540112/ecommerce/products/product_18/galaxytabs9.jpg','ecommerce/products/product_18/galaxytabs9',NULL,0,0,0,18,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540114/ecommerce/products/product_19/ipadprom4.jpg','ecommerce/products/product_19/ipadprom4',NULL,0,0,0,19,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540116/ecommerce/products/product_20/ipadairm2.jpg','ecommerce/products/product_20/ipadairm2',NULL,0,0,0,20,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540118/ecommerce/products/product_21/xiaomipad6.jpg','ecommerce/products/product_21/xiaomipad6',NULL,0,0,0,21,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540120/ecommerce/products/product_22/watchultra2.jpg','ecommerce/products/product_22/watchultra2',NULL,0,0,0,22,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540122/ecommerce/products/product_23/galaxywatch6.jpg','ecommerce/products/product_23/galaxywatch6',NULL,0,0,0,23,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540124/ecommerce/products/product_24/sonywh1000xm5.jpg','ecommerce/products/product_24/sonywh1000xm5',NULL,0,0,0,24,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540126/ecommerce/products/product_25/airpodsmax.jpg','ecommerce/products/product_25/airpodsmax',NULL,0,0,0,25,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540128/ecommerce/products/product_26/sonywh1000xm4.jpg','ecommerce/products/product_26/sonywh1000xm4',NULL,0,0,0,26,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540130/ecommerce/products/product_27/bosesoundlink.jpg','ecommerce/products/product_27/bosesoundlink',NULL,0,0,0,27,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540132/ecommerce/products/product_28/airpodspro2.jpg','ecommerce/products/product_28/airpodspro2',NULL,0,0,0,28,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540134/ecommerce/products/product_29/ps5digital.jpg','ecommerce/products/product_29/ps5digital',NULL,0,0,0,29,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540136/ecommerce/products/product_30/xboxseriesx.jpg','ecommerce/products/product_30/xboxseriesx',NULL,0,0,0,30,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540138/ecommerce/products/product_31/lgfridge.jpg','ecommerce/products/product_31/lgfridge',NULL,0,0,0,31,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540140/ecommerce/products/product_32/samsungwashing.jpg','ecommerce/products/product_32/samsungwashing',NULL,0,0,0,32,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28'),
('https://res.cloudinary.com/dwwof3lty/image/upload/v1771540142/ecommerce/products/product_33/daikinac.jpg','ecommerce/products/product_33/daikinac',NULL,0,0,0,33,1,'PRODUCT','2026-02-25 19:15:28','2026-02-25 19:15:28');
