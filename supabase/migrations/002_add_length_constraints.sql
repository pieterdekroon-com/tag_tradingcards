ALTER TABLE themes ADD CONSTRAINT theme_name_length CHECK (char_length(name) <= 100);
ALTER TABLE specialties ADD CONSTRAINT specialty_name_length CHECK (char_length(name) <= 50);
ALTER TABLE descriptions ADD CONSTRAINT description_text_length CHECK (char_length(text) <= 500);
