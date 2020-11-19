
-- dataset derived from https://www.kaggle.com/shivamb/netflix-shows

CREATE TABLE IF NOT EXISTS netflix_titles(
    title_id INTEGER,
    type VARCHAR(255),
    title VARCHAR(255),
    director VARCHAR(255),
    cast_list TEXT,
    country VARCHAR(255),
    date_added DATETIME,
    release_year DATETIME,
    rating VARCHAR(255),
    duration VARCHAR(255),
    listed_in VARCHAR(255),
    description VARCHAR(255)
)
AS SELECT
    title_id,
    type,
    title,
    director,
    cast_list,
    country,
    PARSEDATETIME(date_added, 'MMMMM d, yyyy'),
    PARSEDATETIME(release_year, 'yyyy'),
    rating,
    duration,
    listed_in,
    description
FROM CSVREAD('classpath:netflix_titles.csv');