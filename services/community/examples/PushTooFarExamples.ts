/**
 * Examples demonstrating FACADE 6.8: Push-Too-Far Detection
 *
 * Shows how to track repeated negative actions and trigger reactions
 * when NPCs' tolerance thresholds are crossed.
 */

import { WorkingMemory } from '../../WorkingMemory';
import {
  PushTooFarDetector,
  OffenseType,
  ToleranceBuilder,
  ThresholdReactions,
  ToleranceThreshold
} from '../PushTooFarDetector';

// Example 1: Basic insult tracking - 3 insults makes merchant refuse to talk
console.log('\n=== Example 1: Three Strikes (Insults) ===');
const wm1 = new WorkingMemory();
const detector1 = new PushTooFarDetector();
detector1.setWorkingMemory(wm1);

const merchantTolerance1 = new ToleranceBuilder()
  .forNPC('merchant')
  .withPatience(0.3) // Not very patient
  .weighOffense(OffenseType.INSULT, 1.5) // Insults hurt more
  .addThreshold({
    name: 'three_strikes',
    minOffenseCount: 3,
    offenseTypes: [OffenseType.INSULT],
    reaction: ThresholdReactions.refuseToTalk(),
    priority: 100
  })
  .build();

detector1.setTolerance(merchantTolerance1);

console.log('Player insults merchant...');
detector1.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'merchant',
  severity: 0.6,
  timestamp: Date.now()
});

console.log('Player insults again...');
detector1.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'merchant',
  severity: 0.7,
  timestamp: Date.now()
});

const warning1 = detector1.checkForWarnings('merchant', 'player');
console.log(`Warning: ${warning1?.message}`);

console.log('Player insults a third time...');
detector1.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'merchant',
  severity: 0.8,
  timestamp: Date.now()
});

// Example 2: Theft tracking - 5 thefts calls guards
console.log('\n=== Example 2: Repeated Theft ===');
const wm2 = new WorkingMemory();
const detector2 = new PushTooFarDetector();
detector2.setWorkingMemory(wm2);

const shopkeeperTolerance = new ToleranceBuilder()
  .forNPC('shopkeeper')
  .withPatience(0.5)
  .weighOffense(OffenseType.THEFT, 2.0) // Theft is very serious
  .addThreshold({
    name: 'serial_thief',
    minOffenseCount: 5,
    offenseTypes: [OffenseType.THEFT],
    reaction: ThresholdReactions.callGuards(),
    priority: 200
  })
  .build();

detector2.setTolerance(shopkeeperTolerance);

console.log('Recording 5 thefts...');
for (let i = 1; i <= 5; i++) {
  detector2.recordOffense({
    type: OffenseType.THEFT,
    offender: 'player',
    victim: 'shopkeeper',
    severity: 0.8,
    timestamp: Date.now(),
    description: `Stole item #${i}`
  });
  console.log(`Theft ${i} recorded`);

  if (i === 4) {
    const warning = detector2.checkForWarnings('shopkeeper', 'player');
    console.log(`Warning at theft ${i}: ${warning?.message}`);
  }
}

// Example 3: Multiple threshold levels
console.log('\n=== Example 3: Escalating Reactions ===');
const wm3 = new WorkingMemory();
const detector3 = new PushTooFarDetector();
detector3.setWorkingMemory(wm3);

const guardTolerance = new ToleranceBuilder()
  .forNPC('guard')
  .withPatience(0.7) // Guards are patient
  .addThreshold({
    name: 'warning_level',
    minOffenseCount: 2,
    reaction: ThresholdReactions.custom(
      'verbal_warning',
      'Issues verbal warning',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "Watch yourself, ${offender}!"`);
      }
    ),
    priority: 50
  })
  .addThreshold({
    name: 'serious_level',
    minOffenseCount: 4,
    reaction: ThresholdReactions.custom(
      'threat',
      'Threatens offender',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "One more incident and you're done, ${offender}!"`);
      }
    ),
    priority: 100
  })
  .addThreshold({
    name: 'final_level',
    minOffenseCount: 5,
    reaction: ThresholdReactions.becomeHostile(),
    priority: 200
  })
  .build();

detector3.setTolerance(guardTolerance);

console.log('Recording offenses to trigger escalation...');
for (let i = 1; i <= 6; i++) {
  console.log(`\nOffense ${i}:`);
  detector3.recordOffense({
    type: OffenseType.RUDENESS,
    offender: 'player',
    victim: 'guard',
    severity: 0.5,
    timestamp: Date.now()
  });
}

// Example 4: Severity-based threshold (not just count)
console.log('\n=== Example 4: Severity-Based Threshold ===');
const wm4 = new WorkingMemory();
const detector4 = new PushTooFarDetector();
detector4.setWorkingMemory(wm4);

const nobleTolerance = new ToleranceBuilder()
  .forNPC('noble')
  .withPatience(0.8)
  .weighOffense(OffenseType.INSULT, 2.0)
  .weighOffense(OffenseType.RUDENESS, 1.0)
  .addThreshold({
    name: 'reputation_damage',
    minTotalSeverity: 3.0, // Total severity, not count
    reaction: ThresholdReactions.spreadRumors(),
    priority: 100
  })
  .build();

detector4.setTolerance(nobleTolerance);

console.log('Player commits minor offense (severity 0.5)...');
detector4.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'noble',
  severity: 0.5,
  timestamp: Date.now()
});

console.log('Player commits moderate offense (severity 0.8)...');
detector4.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'noble',
  severity: 0.8,
  timestamp: Date.now()
});

console.log('Player commits major offense (severity 1.0)...');
detector4.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'noble',
  severity: 1.0,
  timestamp: Date.now(),
  description: 'Public humiliation'
});

const status4 = detector4.getRelationshipStatus('noble', 'player');
console.log(`Total severity: ${status4.totalSeverity.toFixed(2)}`);
console.log(`Status: ${status4.status}`);

// Example 5: Time window - only recent offenses count
console.log('\n=== Example 5: Time Window (Only Recent Offenses) ===');
const wm5 = new WorkingMemory();
let currentTime = 0;
const detector5 = new PushTooFarDetector(() => currentTime);
detector5.setWorkingMemory(wm5);

const ONE_HOUR = 3600000;

const bartenderTolerance = new ToleranceBuilder()
  .forNPC('bartender')
  .withPatience(0.5)
  .addThreshold({
    name: 'troublemaker',
    minOffenseCount: 3,
    withinTimeWindow: ONE_HOUR, // Only count offenses within 1 hour
    reaction: ThresholdReactions.custom(
      'kick_out',
      'Kicks out of tavern',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "Get out of my tavern, ${offender}!"`);
      }
    ),
    priority: 100
  })
  .build();

detector5.setTolerance(bartenderTolerance);

console.log('First offense at time 0...');
detector5.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'bartender',
  severity: 0.5,
  timestamp: currentTime
});

console.log('Second offense at time +30 min...');
currentTime += 1800000; // +30 minutes
detector5.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'bartender',
  severity: 0.5,
  timestamp: currentTime
});

console.log('Third offense at time +2 hours (too late)...');
currentTime += 7200000; // +2 hours
detector5.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'bartender',
  severity: 0.5,
  timestamp: currentTime
});

const recent5 = detector5.getRecentOffenses('bartender', 'player', ONE_HOUR);
console.log(`Offenses in last hour: ${recent5.length} (threshold not met)`);

// Example 6: Forgiveness system
console.log('\n=== Example 6: Forgiveness ===');
const wm6 = new WorkingMemory();
const detector6 = new PushTooFarDetector();
detector6.setWorkingMemory(wm6);

const priestTolerance = new ToleranceBuilder()
  .forNPC('priest')
  .withPatience(0.6)
  .withForgiveness(0.9) // Very forgiving
  .addThreshold({
    name: 'loses_patience',
    minOffenseCount: 4,
    reaction: ThresholdReactions.refuseToTalk(3600000), // 1 hour
    priority: 100
  })
  .build();

detector6.setTolerance(priestTolerance);

console.log('Recording 3 offenses...');
for (let i = 1; i <= 3; i++) {
  detector6.recordOffense({
    type: OffenseType.INSULT,
    offender: 'player',
    victim: 'priest',
    severity: 0.7,
    timestamp: Date.now()
  });
}

let status6a = detector6.getRelationshipStatus('priest', 'player');
console.log(`Before forgiveness - Status: ${status6a.status}, Offenses: ${status6a.offenseCount}`);

console.log('Player apologizes, priest forgives...');
detector6.forgive('priest', 'player', 0.5); // 50% forgiveness

let status6b = detector6.getRelationshipStatus('priest', 'player');
console.log(`After forgiveness - Status: ${status6b.status}, Severity: ${status6b.totalSeverity.toFixed(2)}`);

// Example 7: Never forgets (grudge holder)
console.log('\n=== Example 7: Never Forgets ===');
const wm7 = new WorkingMemory();
const detector7 = new PushTooFarDetector();
detector7.setWorkingMemory(wm7);

const rivalTolerance = new ToleranceBuilder()
  .forNPC('rival')
  .withPatience(0.3)
  .neverForgets() // Remembers every offense forever
  .addThreshold({
    name: 'eternal_enemy',
    minOffenseCount: 2,
    reaction: ThresholdReactions.becomeHostile(),
    priority: 100
  })
  .build();

detector7.setTolerance(rivalTolerance);

console.log('Player offends rival...');
detector7.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'rival',
  severity: 0.8,
  timestamp: Date.now()
});

console.log('Second offense (becomes hostile forever)...');
detector7.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'rival',
  severity: 0.9,
  timestamp: Date.now()
});

const status7 = detector7.getRelationshipStatus('rival', 'player');
console.log(`Status: ${status7.status}`);

// Example 8: Different offense types weighted differently
console.log('\n=== Example 8: Weighted Offense Types ===');
const wm8 = new WorkingMemory();
const detector8 = new PushTooFarDetector();
detector8.setWorkingMemory(wm8);

const captainTolerance = new ToleranceBuilder()
  .forNPC('captain')
  .withPatience(0.5)
  .weighOffense(OffenseType.INSULT, 1.0)
  .weighOffense(OffenseType.RUDENESS, 0.5)
  .weighOffense(OffenseType.ATTACK, 5.0) // Attack is VERY serious
  .addThreshold({
    name: 'disciplinary_action',
    minTotalSeverity: 2.0,
    reaction: ThresholdReactions.custom(
      'punishment',
      'Assigns punishment duty',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "${offender}, you're on latrine duty for a month!"`);
      }
    ),
    priority: 100
  })
  .build();

detector8.setTolerance(captainTolerance);

console.log('Player is rude (weight 0.5, severity 0.6) = 0.3 effective...');
detector8.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'captain',
  severity: 0.6,
  timestamp: Date.now()
});

console.log('Player attacks (weight 5.0, severity 0.4) = 2.0 effective...');
detector8.recordOffense({
  type: OffenseType.ATTACK,
  offender: 'player',
  victim: 'captain',
  severity: 0.4,
  timestamp: Date.now()
});

const status8 = detector8.getRelationshipStatus('captain', 'player');
console.log(`Total severity: ${status8.totalSeverity.toFixed(2)} - Threshold crossed!`);

// Example 9: Warning system before threshold
console.log('\n=== Example 9: Warning System ===');
const wm9 = new WorkingMemory();
const detector9 = new PushTooFarDetector();
detector9.setWorkingMemory(wm9);

const teacherTolerance = new ToleranceBuilder()
  .forNPC('teacher')
  .withPatience(0.6)
  .addThreshold({
    name: 'detention',
    minOffenseCount: 5,
    reaction: ThresholdReactions.custom(
      'detention',
      'Assigns detention',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "${offender}, you have detention!"`);
      }
    ),
    priority: 100
  })
  .build();

detector9.setTolerance(teacherTolerance);

console.log('Recording offenses and checking for warnings...');
for (let i = 1; i <= 5; i++) {
  detector9.recordOffense({
    type: OffenseType.RUDENESS,
    offender: 'student',
    victim: 'teacher',
    severity: 0.5,
    timestamp: Date.now()
  });

  const warning = detector9.checkForWarnings('teacher', 'student');
  const status = detector9.getRelationshipStatus('teacher', 'student');

  console.log(`Offense ${i}: Progress ${(status.progress * 100).toFixed(0)}%`);
  if (warning) {
    console.log(`  Warning: ${warning.message}`);
  }
}

// Example 10: Multiple offenders - tracking separately
console.log('\n=== Example 10: Multiple Offenders ===');
const wm10 = new WorkingMemory();
const detector10 = new PushTooFarDetector();
detector10.setWorkingMemory(wm10);

const innkeeperTolerance = new ToleranceBuilder()
  .forNPC('innkeeper')
  .withPatience(0.5)
  .addThreshold({
    name: 'banned',
    minOffenseCount: 3,
    reaction: ThresholdReactions.banFromLocation('inn'),
    priority: 100
  })
  .build();

detector10.setTolerance(innkeeperTolerance);

console.log('Player1 offends 2 times...');
detector10.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player1',
  victim: 'innkeeper',
  severity: 0.5,
  timestamp: Date.now()
});
detector10.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player1',
  victim: 'innkeeper',
  severity: 0.5,
  timestamp: Date.now()
});

console.log('Player2 offends 3 times...');
detector10.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player2',
  victim: 'innkeeper',
  severity: 0.5,
  timestamp: Date.now()
});
detector10.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player2',
  victim: 'innkeeper',
  severity: 0.5,
  timestamp: Date.now()
});
detector10.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player2',
  victim: 'innkeeper',
  severity: 0.5,
  timestamp: Date.now()
});

const status10a = detector10.getRelationshipStatus('innkeeper', 'player1');
const status10b = detector10.getRelationshipStatus('innkeeper', 'player2');

console.log(`Player1 status: ${status10a.status} (${status10a.offenseCount} offenses)`);
console.log(`Player2 status: ${status10b.status} (${status10b.offenseCount} offenses)`);

// Example 11: Relationship summary
console.log('\n=== Example 11: All Relationships Summary ===');
const wm11 = new WorkingMemory();
const detector11 = new PushTooFarDetector();
detector11.setWorkingMemory(wm11);

const mayorTolerance = new ToleranceBuilder()
  .forNPC('mayor')
  .withPatience(0.7)
  .addThreshold({
    name: 'concern',
    minOffenseCount: 2,
    reaction: ThresholdReactions.custom('note', 'Notes concern', () => {}),
    priority: 100
  })
  .build();

detector11.setTolerance(mayorTolerance);

// Multiple people offend the mayor
['alice', 'bob', 'charlie'].forEach(offender => {
  const count = offender === 'charlie' ? 3 : 1;
  for (let i = 0; i < count; i++) {
    detector11.recordOffense({
      type: OffenseType.RUDENESS,
      offender,
      victim: 'mayor',
      severity: 0.5,
      timestamp: Date.now()
    });
  }
});

console.log('Mayor\'s relationships:');
const relationships = detector11.getAllRelationships('mayor');
for (const [offender, status] of relationships) {
  console.log(`  ${offender}: ${status.status} (${status.offenseCount} offenses, ${(status.progress * 100).toFixed(0)}% to threshold)`);
}

// Example 12: Decay over time
console.log('\n=== Example 12: Offense Decay ===');
const wm12 = new WorkingMemory();
let time12 = 0;
const detector12 = new PushTooFarDetector(() => time12);
detector12.setWorkingMemory(wm12);

const friendTolerance = new ToleranceBuilder()
  .forNPC('friend')
  .withPatience(0.8)
  .withDecayRate(0.0000001) // Slow decay
  .addThreshold({
    name: 'annoyed',
    minTotalSeverity: 2.0,
    reaction: ThresholdReactions.custom('annoyed', 'Gets annoyed', () => {
      console.log('>>> Friend is annoyed!');
    }),
    priority: 100
  })
  .build();

detector12.setTolerance(friendTolerance);

console.log('Initial offense...');
detector12.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'friend',
  severity: 1.0,
  timestamp: time12
});

let status12a = detector12.getRelationshipStatus('friend', 'player');
console.log(`Severity now: ${status12a.totalSeverity.toFixed(2)}`);

console.log('Advancing time and applying decay...');
time12 += 10000000; // Advance time significantly
detector12.applyDecay();

let status12b = detector12.getRelationshipStatus('friend', 'player');
console.log(`Severity after decay: ${status12b.totalSeverity.toFixed(2)}`);

// Example 13: Specific offense type threshold
console.log('\n=== Example 13: Specific Offense Type Threshold ===');
const wm13 = new WorkingMemory();
const detector13 = new PushTooFarDetector();
detector13.setWorkingMemory(wm13);

const wizardTolerance = new ToleranceBuilder()
  .forNPC('wizard')
  .withPatience(0.5)
  .addThreshold({
    name: 'only_lies',
    minOffenseCount: 3,
    offenseTypes: [OffenseType.LYING], // ONLY lying triggers this
    reaction: ThresholdReactions.custom(
      'trust_broken',
      'Refuses to trust offender',
      (victim, offender, offenses, wm) => {
        console.log(`>>> ${victim}: "I can never trust ${offender} again after all these lies!"`);
      }
    ),
    priority: 100
  })
  .build();

detector13.setTolerance(wizardTolerance);

console.log('Player insults wizard...');
detector13.recordOffense({
  type: OffenseType.INSULT,
  offender: 'player',
  victim: 'wizard',
  severity: 0.8,
  timestamp: Date.now()
});

console.log('Player is rude to wizard...');
detector13.recordOffense({
  type: OffenseType.RUDENESS,
  offender: 'player',
  victim: 'wizard',
  severity: 0.6,
  timestamp: Date.now()
});

console.log('Player lies to wizard 3 times...');
for (let i = 1; i <= 3; i++) {
  detector13.recordOffense({
    type: OffenseType.LYING,
    offender: 'player',
    victim: 'wizard',
    severity: 0.7,
    timestamp: Date.now()
  });
}

const status13 = detector13.getRelationshipStatus('wizard', 'player');
console.log(`Total offenses: ${status13.offenseCount}, but only lies counted for threshold`);

console.log('\n=== All Examples Complete ===');
