-- Fügt eine optionale deutsche PLZ zum Nutzerprofil hinzu (für standortbasiertes Wetter).
alter table profiles add column postal_code text;
