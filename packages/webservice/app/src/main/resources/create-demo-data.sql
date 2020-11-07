-- PILOTS --

CREATE TABLE IF NOT EXISTS pilots
    (
      id INT,
      name VARCHAR(255),
    );
TRUNCATE TABLE pilots;

INSERT INTO pilots VALUES (1, 'Luke S');
INSERT INTO pilots VALUES (2, 'Wedge');
INSERT INTO pilots VALUES (3, 'Jek');
INSERT INTO pilots VALUES (4, 'Biggs');
INSERT INTO pilots VALUES (5, 'Dutch');
INSERT INTO pilots VALUES (6, 'Arvel');
INSERT INTO pilots VALUES (7, 'Gial');
INSERT INTO pilots VALUES (8, 'Antoc');
INSERT INTO pilots VALUES (9, 'Laren');
INSERT INTO pilots VALUES (10, 'Merrick');

-- CRAFTS --

CREATE TABLE IF NOT EXISTS crafts
    (
      id INT,
      name VARCHAR(255),
    );
TRUNCATE TABLE crafts;

INSERT INTO crafts VALUES (1, 'a-wing');
INSERT INTO crafts VALUES (2, 'b-wing');
INSERT INTO crafts VALUES (3, 'x-wing');
INSERT INTO crafts VALUES (4, 'y-wing');
INSERT INTO crafts VALUES (5, 'snowspeeder');
INSERT INTO crafts VALUES (6, 'speeder bike');
INSERT INTO crafts VALUES (7, 'u-wing');

CREATE TABLE IF NOT EXISTS pilot_stats
    (
      battle_name VARCHAR(255),
      pilot_id INT,
      craft_id INT,
      parsecs DOUBLE,
      battle_date DATETIME,
      victory BOOLEAN
    );
TRUNCATE TABLE pilot_stats;

INSERT INTO pilot_stats VALUES ('Battle of Scarif', 9, 7, 5, '2016-12-16 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Scarif', 5, 4, 5, '2016-12-16 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Scarif', 10, 3, 5, '2016-12-16 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Yavin', 1, 3, 12, '1977-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Yavin', 2, 3, 12, '1977-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Yavin', 3, 3, 12, '1977-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Yavin', 4, 3, 12, '1977-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Yavin', 5, 4, 12, '1977-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Hoth', 1, 5, 0.1, '1980-05-21 00:00:00', false);
INSERT INTO pilot_stats VALUES ('Battle of Hoth', 2, 5, 0.1, '1980-05-21 00:00:00', false);
INSERT INTO pilot_stats VALUES ('Battle of Endor', 1, 6, 24, '1983-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Endor', 2, 3, 24, '1983-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Endor', 6, 1, 24, '1983-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Endor', 7, 2, 24, '1983-05-25 00:00:00', true);
INSERT INTO pilot_stats VALUES ('Battle of Endor', 7, 2, 24, '1983-05-25 00:00:00', true);
