-- Seed themes (from existing themes.ts)
insert into themes (slug, name, rarity, from_color, to_color) values
  ('ocean-blue', 'Ocean Blue', 'Common', '#0f3460', '#16213e'),
  ('forest-green', 'Forest Green', 'Common', '#2d6a4f', '#1b4332'),
  ('midnight-black', 'Midnight Black', 'Common', '#2d3436', '#000000'),
  ('arctic-frost', 'Arctic Frost', 'Common', '#74b9ff', '#0984e3'),
  ('crimson-fire', 'Crimson Fire', 'Rare', '#e94560', '#c23152'),
  ('sunset-gold', 'Sunset Gold', 'Rare', '#f77f00', '#e36414'),
  ('neon-pink', 'Neon Pink', 'Rare', '#fd79a8', '#e84393'),
  ('royal-purple', 'Royal Purple', 'Epic', '#7b2cbf', '#5a189a'),
  ('aurora', 'Aurora', 'Epic', '#00b4d8', '#0077b6'),
  ('deep-ocean', 'Deep Ocean', 'Epic', '#023e8a', '#03045e'),
  ('solar-flare', 'Solar Flare', 'Legendary', '#ff6b35', '#f7c59f'),
  ('void-walker', 'Void Walker', 'Legendary', '#6c63ff', '#3d348b'),
  ('abyssal-tide', 'Abyssal Tide', 'Legendary', '#2ec4b6', '#011627');

-- Seed specialties (from existing presets.ts)
insert into specialties (name) values
  ('Frontend'), ('Backend'), ('Design'), ('DevOps'),
  ('Mobile'), ('Data'), ('Security'), ('AI/ML'),
  ('Product'), ('Leadership'), ('QA'), ('Fullstack');

-- Seed descriptions (from existing presets.ts)
insert into descriptions (text) values
  ('Breekt prod op vrijdagmiddag'),
  ('Merged zonder review'),
  ('Het werkt op mijn machine'),
  ('Schrijft tests na deployment'),
  ('Refactort alles behalve eigen code'),
  ('LGTM zonder te lezen'),
  ('Commitbericht: fix'),
  ('Vergeet altijd de .env'),
  ('Stack Overflow copy-paste kampioen'),
  ('Deployt met YOLO-energie'),
  ('Noemt alles temp maar het blijft'),
  ('Documentatie is voor losers');
