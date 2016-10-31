--Table grasp_all_users
/*CREATE TABLE grasp_all_users (
  pkey bigserial NOT NULL,
  fkey bigint NOT NULL,
  network varchar NOT NULL,
  CONSTRAINT pkey_grasp_all_users PRIMARY KEY (pkey)
);

--Table grasp_twitter_users
CREATE TABLE grasp_twitter_users (
  pkey bigserial NOT NULL,
  username varchar NOT NULL,
  CONSTRAINT grasp_twitter_users PRIMARY KEY (pkey)
);

--Table grasp_whatsapp_users
CREATE TABLE grasp_whatsapp_users (
  pkey bigserial NOT NULL,
  phone integer NOT NULL,
  CONSTRAINT grasp_whatsapp_users PRIMARY KEY (pkey)
);*/

-- Spatial extensions
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

--Table grasp_card_id (card_id, received[true/false])
CREATE TABLE grasp_cards (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL UNIQUE,
  username varchar NOT NULL,
  network varchar NOT NULL,
  language varchar NOT NULL,
  received boolean,
  report_id bigint UNIQUE,
  CONSTRAINT pkey_grasp_cards PRIMARY KEY (pkey)
);

--Table grasp_reports
CREATE TABLE grasp_reports (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL UNIQUE,
  database_time timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone,
  text varchar,
  water_depth integer,
  image_id bigint,
  status varchar,
  location geometry(Point, 4326),
  CONSTRAINT pkey_grasp_reports PRIMARY KEY (pkey)
);

--Table grasp_report_images
CREATE TABLE grasp_report_images (
  pkey bigserial NOT NULL,
  card_id varchar NOT NULL,
  image_id bigint,
  filename varchar,
  url_path varchar,
  CONSTRAINT pkey_grasp_report_images PRIMARY KEY (pkey)
);

--Table grasp_log
CREATE TABLE grasp_log (
  pkey bigserial NOT NULL,
  database_time timestamp with time zone DEFAULT now(),
  card_id varchar,
  --user_id,
  event_type varchar,
  CONSTRAINT pkey_grasp_log PRIMARY KEY (pkey)
);

--Notifications on  grasp cards table updates
CREATE FUNCTION notify_grasp_cards_trigger() RETURNS trigger AS $$
DECLARE
BEGIN
  PERFORM pg_notify('watchers', '{"' || TG_TABLE_NAME || '":{"pkey":"' || NEW.pkey || '", "username": "'|| NEW.username ||'", "network": "' || NEW.network || '", "language": "'|| NEW.language ||'", "report_id": "' || NEW.report_id || '"}}' );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_grasp_cards_trigger
  AFTER UPDATE ON grasp_cards
  FOR EACH ROW
  WHEN (NEW.received = TRUE)
  EXECUTE PROCEDURE notify_grasp_cards_trigger();
