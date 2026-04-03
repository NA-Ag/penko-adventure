export interface Room {
  id: string;
  name: string;
  biome: string;
  description: string;
  features: string[];
  entities: string[];
  connections: Record<string, string>; // e.g. { "north": "cave", "enter": "tavern" }
}

export interface GameMap {
  startRoom: string;
  rooms: Record<string, Room>;
}

export const fantasyMap: GameMap = {
  startRoom: 'forest_edge',
  rooms: {
    'forest_edge': {
      id: 'forest_edge',
      name: 'Forest Edge',
      biome: 'forest',
      description: 'You are standing at the edge of a dark, ancient forest. A worn dirt path leads deeper into the woods.',
      features: ['dirt_path', 'oak_tree', 'moss'],
      entities: [],
      connections: { 'north': 'deep_forest', 'follow path': 'deep_forest' }
    },
    'deep_forest': {
      id: 'deep_forest',
      name: 'Deep Forest',
      biome: 'forest',
      description: 'The trees are thick here, blocking out most of the sunlight. You see an old man sitting by a campfire.',
      features: ['campfire', 'fallen_log'],
      entities: ['merchant'],
      connections: { 'south': 'forest_edge', 'east': 'cave_entrance' }
    },
    'cave_entrance': {
      id: 'cave_entrance',
      name: 'Cave Entrance',
      biome: 'cave',
      description: 'A dark, damp cave mouth yawns before you. A rusty sword lies discarded near the entrance.',
      features: ['rocks', 'rusty_sword'],
      entities: [],
      connections: { 'west': 'deep_forest', 'enter': 'dungeon_hall' }
    },
    'dungeon_hall': {
      id: 'dungeon_hall',
      name: 'Dungeon Hallway',
      biome: 'dungeon',
      description: 'Cold stone walls surround you. Torches flicker weakly in the darkness.',
      features: ['stone_walls', 'torch'],
      entities: ['goblin'],
      connections: { 'leave': 'cave_entrance' }
    }
  }
};

export const cyberpunkMap: GameMap = {
    startRoom: 'neon_street',
    rooms: {
      'neon_street': {
        id: 'neon_street',
        name: 'Neon Street',
        biome: 'cyber_city',
        description: 'Rain slicks the pavement. Neon signs reflect in the puddles. A local noodle stand is open nearby.',
        features: ['neon_sign', 'puddle'],
        entities: [],
        connections: { 'enter stand': 'noodle_stand', 'north': 'alleyway' }
      },
      'noodle_stand': {
        id: 'noodle_stand',
        name: 'Noodle Stand',
        biome: 'interior',
        description: 'Steam rises from a boiling pot. The vendor looks at you expectantly.',
        features: ['counter', 'steam'],
        entities: ['vendor'],
        connections: { 'leave': 'neon_street' }
      },
      'alleyway': {
        id: 'alleyway',
        name: 'Dark Alley',
        biome: 'cyber_city',
        description: 'Trash litters the ground. A broken security drone sparks rhythmically.',
        features: ['trash', 'broken_drone'],
        entities: [],
        connections: { 'south': 'neon_street' }
      }
    }
  };

export const westernMap: GameMap = {
    startRoom: 'canyon_edge',
    rooms: {
      'canyon_edge': {
        id: 'canyon_edge',
        name: 'Canyon Edge',
        biome: 'canyon',
        description: 'You are standing at the edge of a dusty, sun-baked canyon. A narrow trail winds down into the valley.',
        features: ['dust', 'trail'],
        entities: [],
        connections: { 'go down': 'desert_valley' }
      },
      'desert_valley': {
        id: 'desert_valley',
        name: 'Desert Valley',
        biome: 'desert',
        description: 'The heat is oppressive. You see an abandoned gold mine in the distance.',
        features: ['mine_entrance'],
        entities: [],
        connections: { 'go up': 'canyon_edge' }
      }
    }
  };

export const horrorMap: GameMap = {
    startRoom: 'graveyard_gates',
    rooms: {
      'graveyard_gates': {
        id: 'graveyard_gates',
        name: 'Graveyard Gates',
        biome: 'graveyard',
        description: 'You are standing before the rusted iron gates of an ancient, fog-covered graveyard.',
        features: ['iron_gates', 'fog'],
        entities: [],
        connections: { 'enter': 'graves' }
      },
      'graves': {
        id: 'graves',
        name: 'Among the Graves',
        biome: 'graveyard',
        description: 'Crumbling tombstones surround you. You hear a faint scratching noise.',
        features: ['tombstones'],
        entities: ['shadow'],
        connections: { 'leave': 'graveyard_gates' }
      }
    }
  };

export const mysteryMap: GameMap = {
    startRoom: 'mansion_foyer',
    rooms: {
      'mansion_foyer': {
        id: 'mansion_foyer',
        name: 'Mansion Foyer',
        biome: 'interior',
        description: 'You are standing in the grand foyer of a dimly lit Victorian mansion. A grandfather clock ticks loudly.',
        features: ['grandfather_clock', 'staircase'],
        entities: [],
        connections: { 'go up': 'study' }
      },
      'study': {
        id: 'study',
        name: 'The Study',
        biome: 'interior',
        description: 'The study is ransacked. Papers are scattered everywhere.',
        features: ['scattered_papers', 'desk'],
        entities: [],
        connections: { 'go down': 'mansion_foyer' }
      }
    }
  };


export const postApocalypticMap: GameMap = {
    startRoom: 'wasteland_edge',
    rooms: {
      'wasteland_edge': {
        id: 'wasteland_edge',
        name: 'Wasteland Edge',
        biome: 'desert',
        description: 'You stand at the edge of a scorched wasteland. A ruined highway stretches into the distance.',
        features: ['ruin', 'scrap'],
        entities: [],
        connections: { 'north': 'ruined_city' }
      },
      'ruined_city': {
        id: 'ruined_city',
        name: 'Ruined City',
        biome: 'town',
        description: 'Crumbling buildings surround you. A mutated dog growls from the shadows.',
        features: ['ruin', 'rusty_car'],
        entities: ['mutant_dog'],
        connections: { 'south': 'wasteland_edge', 'enter building': 'abandoned_store' }
      },
      'abandoned_store': {
        id: 'abandoned_store',
        name: 'Abandoned Store',
        biome: 'interior',
        description: 'Shelves are bare and covered in dust. You spot a can of old food.',
        features: ['empty_shelves', 'canned_food'],
        entities: [],
        connections: { 'leave': 'ruined_city' }
      }
    }
};

export const pirateMap: GameMap = {
    startRoom: 'sandy_beach',
    rooms: {
      'sandy_beach': {
        id: 'sandy_beach',
        name: 'Sandy Beach',
        biome: 'beach',
        description: 'Waves crash against the white sand. A small wooden rowboat is tied to a palm tree.',
        features: ['palm_tree', 'rowboat', 'seashells'],
        entities: [],
        connections: { 'north': 'jungle_edge', 'sail': 'open_ocean' }
      },
      'jungle_edge': {
        id: 'jungle_edge',
        name: 'Jungle Edge',
        biome: 'forest',
        description: 'The dense jungle is loud with the sound of birds. A pirate is resting against a rock.',
        features: ['thick_vines', 'large_rock'],
        entities: ['pirate'],
        connections: { 'south': 'sandy_beach', 'east': 'hidden_cove' }
      },
      'hidden_cove': {
        id: 'hidden_cove',
        name: 'Hidden Cove',
        biome: 'cave',
        description: 'A dark, echoing sea cave. There is an old wooden chest half-buried in the sand.',
        features: ['wooden_chest', 'stalactites'],
        entities: [],
        connections: { 'west': 'jungle_edge' }
      },
      'open_ocean': {
        id: 'open_ocean',
        name: 'Open Ocean',
        biome: 'ocean',
        description: 'You are adrift on the endless blue sea. A large galleon approaches.',
        features: ['waves', 'galleon'],
        entities: [],
        connections: { 'return': 'sandy_beach' }
      }
    }
};

export const spyMap: GameMap = {
    startRoom: 'city_street',
    rooms: {
      'city_street': {
        id: 'city_street',
        name: 'City Street',
        biome: 'town',
        description: 'You stand in the rain outside a modern office building. A black car is parked nearby.',
        features: ['black_car', 'streetlight'],
        entities: [],
        connections: { 'enter building': 'lobby' }
      },
      'lobby': {
        id: 'lobby',
        name: 'Lobby',
        biome: 'interior',
        description: 'A pristine marble lobby. A security guard watches you from the desk.',
        features: ['marble_floor', 'front_desk'],
        entities: ['security_guard'],
        connections: { 'leave': 'city_street', 'take elevator': 'office_floor' }
      },
      'office_floor': {
        id: 'office_floor',
        name: 'Office Floor',
        biome: 'interior',
        description: 'A quiet hallway filled with cubicles. The target server room is at the end.',
        features: ['cubicle', 'locked_door'],
        entities: [],
        connections: { 'elevator': 'lobby', 'hack door': 'server_room' }
      },
      'server_room': {
        id: 'server_room',
        name: 'Server Room',
        biome: 'interior',
        description: 'Rows of blinking servers hum loudly. The secret files are on the terminal.',
        features: ['servers', 'terminal', 'secret_files'],
        entities: [],
        connections: { 'leave': 'office_floor' }
      }
    }
};

export const sliceOfLifeMap: GameMap = {
    startRoom: 'apartment',
    rooms: {
      'apartment': {
        id: 'apartment',
        name: 'Apartment',
        biome: 'interior',
        description: 'Your cozy apartment. Morning sunlight streams through the window.',
        features: ['bed', 'window', 'coffee_mug'],
        entities: [],
        connections: { 'leave': 'neighborhood_street' }
      },
      'neighborhood_street': {
        id: 'neighborhood_street',
        name: 'Neighborhood Street',
        biome: 'town',
        description: 'A quiet, pleasant street lined with trees. A stray cat is sitting on the sidewalk.',
        features: ['trees', 'sidewalk'],
        entities: ['cat'],
        connections: { 'enter apartment': 'apartment', 'walk to cafe': 'local_cafe' }
      },
      'local_cafe': {
        id: 'local_cafe',
        name: 'Local Cafe',
        biome: 'interior',
        description: 'The smell of fresh coffee fills the air. A barista smiles at you from behind the counter.',
        features: ['counter', 'tables', 'pastries'],
        entities: ['barista'],
        connections: { 'leave': 'neighborhood_street' }
      }
    }
};

export const survivalMap: GameMap = {
    startRoom: 'crash_site',
    rooms: {
      'crash_site': {
        id: 'crash_site',
        name: 'Crash Site',
        biome: 'beach',
        description: 'You wake up on a sandy shore next to the wreckage of your boat.',
        features: ['wreckage', 'sand', 'driftwood'],
        entities: [],
        connections: { 'inland': 'dense_jungle' }
      },
      'dense_jungle': {
        id: 'dense_jungle',
        name: 'Dense Jungle',
        biome: 'forest',
        description: 'Thick foliage blocks the sun. You hear a wild boar rustling in the bushes.',
        features: ['thick_foliage', 'bushes'],
        entities: ['wild_boar'],
        connections: { 'beach': 'crash_site', 'climb': 'mountain_base' }
      },
      'mountain_base': {
        id: 'mountain_base',
        name: 'Mountain Base',
        biome: 'cave',
        description: 'A rocky outcrop with a shallow cave. Perfect for a shelter.',
        features: ['rocks', 'shallow_cave', 'stones'],
        entities: [],
        connections: { 'down': 'dense_jungle' }
      }
    }
};

export const superheroMap: GameMap = {
    startRoom: 'rooftop',
    rooms: {
      'rooftop': {
        id: 'rooftop',
        name: 'Rooftop',
        biome: 'cyber_city',
        description: 'You stand on a high rooftop looking over the city. Sirens wail in the distance.',
        features: ['gargoyle', 'edge'],
        entities: [],
        connections: { 'jump down': 'alley', 'fly to bank': 'bank_entrance' }
      },
      'alley': {
        id: 'alley',
        name: 'Dark Alley',
        biome: 'cyber_city',
        description: 'A narrow, trash-filled alley. A thug is cornering a civilian.',
        features: ['dumpster', 'shadows'],
        entities: ['thug', 'civilian'],
        connections: { 'grapple up': 'rooftop', 'street': 'city_center' }
      },
      'city_center': {
        id: 'city_center',
        name: 'City Center',
        biome: 'town',
        description: 'The bustling center of town. People are running away from the bank.',
        features: ['fountain', 'cars'],
        entities: ['panicking_crowd'],
        connections: { 'enter alley': 'alley', 'bank': 'bank_entrance' }
      },
      'bank_entrance': {
        id: 'bank_entrance',
        name: 'Bank Entrance',
        biome: 'interior',
        description: 'The bank doors are blown open. The main villain stands inside, laughing.',
        features: ['broken_doors', 'vault'],
        entities: ['villain'],
        connections: { 'leave': 'city_center' }
      }
    }
};

export const fairyTaleMap: GameMap = {
    startRoom: 'cottage',
    rooms: {
      'cottage': {
        id: 'cottage',
        name: 'Little Cottage',
        biome: 'interior',
        description: 'Your small, warm cottage. A basket of bread sits on the table.',
        features: ['table', 'bread_basket', 'fireplace'],
        entities: [],
        connections: { 'outside': 'woods_path' }
      },
      'woods_path': {
        id: 'woods_path',
        name: 'Woods Path',
        biome: 'forest',
        description: 'A winding dirt path through the enchanted woods. A talking bird sits on a branch.',
        features: ['dirt_path', 'flowers'],
        entities: ['talking_bird'],
        connections: { 'cottage': 'cottage', 'deep woods': 'dark_thicket' }
      },
      'dark_thicket': {
        id: 'dark_thicket',
        name: 'Dark Thicket',
        biome: 'forest',
        description: 'The trees are twisted and thorny. A large, hungry wolf blocks the way.',
        features: ['thorns', 'twisted_trees'],
        entities: ['wolf'],
        connections: { 'back': 'woods_path' }
      }
    }
};

export const steampunkMap: GameMap = {
    startRoom: 'clockwork_station',
    rooms: {
      'clockwork_station': {
        id: 'clockwork_station',
        name: 'Clockwork Station',
        biome: 'town',
        description: 'A bustling train station filled with steam and brass gears. A conductor checks his pocket watch.',
        features: ['train', 'steam', 'brass_clock'],
        entities: ['conductor'],
        connections: { 'board train': 'train_car', 'exit': 'cobblestone_street' }
      },
      'train_car': {
        id: 'train_car',
        name: 'Train Car',
        biome: 'interior',
        description: 'A plush, velvet-lined train car. The engine chugs loudly.',
        features: ['velvet_seats', 'window'],
        entities: [],
        connections: { 'leave': 'clockwork_station' }
      },
      'cobblestone_street': {
        id: 'cobblestone_street',
        name: 'Cobblestone Street',
        biome: 'town',
        description: 'A foggy street lit by gaslamps. A mechanical dog patrols the area.',
        features: ['gaslamp', 'cobblestones'],
        entities: ['mechanical_dog'],
        connections: { 'station': 'clockwork_station', 'alley': 'inventor_shop' }
      },
      'inventor_shop': {
        id: 'inventor_shop',
        name: 'Inventor Shop',
        biome: 'interior',
        description: 'A messy workshop full of blueprints and strange devices.',
        features: ['workbench', 'blueprints', 'goggles'],
        entities: ['inventor'],
        connections: { 'leave': 'cobblestone_street' }
      }
    }
};

export const schoolMap: GameMap = {
    startRoom: 'school_gates',
    rooms: {
      'school_gates': {
        id: 'school_gates',
        name: 'School Gates',
        biome: 'town',
        description: 'You are standing at the entrance of a large high school. Students are chatting nearby.',
        features: ['iron_gates', 'notice_board'],
        entities: ['students'],
        connections: { 'enter': 'hallway' }
      },
      'hallway': {
        id: 'hallway',
        name: 'Main Hallway',
        biome: 'interior',
        description: 'A long corridor lined with blue lockers. The bell is about to ring.',
        features: ['lockers', 'posters'],
        entities: [],
        connections: { 'outside': 'school_gates', 'classroom': 'classroom', 'cafeteria': 'cafeteria' }
      },
      'classroom': {
        id: 'classroom',
        name: 'Classroom',
        biome: 'interior',
        description: 'Desks are arranged neatly. The teacher is writing an equation on the chalkboard.',
        features: ['desks', 'chalkboard', 'books'],
        entities: ['teacher'],
        connections: { 'leave': 'hallway' }
      },
      'cafeteria': {
        id: 'cafeteria',
        name: 'Cafeteria',
        biome: 'interior',
        description: 'A loud, crowded room smelling of pizza. A bully is blocking the vending machine.',
        features: ['tables', 'vending_machine', 'lunch_tray'],
        entities: ['bully'],
        connections: { 'hallway': 'hallway' }
      }
    }
};

export const timeTravelMap: GameMap = {
    startRoom: 'lab_portal',
    rooms: {
      'lab_portal': {
        id: 'lab_portal',
        name: 'Lab Portal',
        biome: 'interior',
        description: 'A futuristic laboratory. A glowing, swirling time portal hums with energy.',
        features: ['computers', 'portal', 'cables'],
        entities: ['scientist'],
        connections: { 'enter portal': 'ancient_rome' }
      },
      'ancient_rome': {
        id: 'ancient_rome',
        name: 'Ancient Rome',
        biome: 'town',
        description: 'You step out into a dusty forum. Marble columns rise around you, and a gladiator walks past.',
        features: ['marble_columns', 'statue'],
        entities: ['gladiator'],
        connections: { 'colosseum': 'colosseum_arena', 'portal': 'lab_portal' }
      },
      'colosseum_arena': {
        id: 'colosseum_arena',
        name: 'Colosseum Arena',
        biome: 'desert',
        description: 'The roar of the crowd is deafening. A hungry lion paces the sandy arena floor.',
        features: ['sand', 'gates'],
        entities: ['lion'],
        connections: { 'flee': 'ancient_rome' }
      }
    }
};
