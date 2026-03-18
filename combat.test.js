const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateCombatExchange } = require('./combat');

function warrior(overrides = {}) {
  return {
    hp: 10,
    maxHp: 10,
    attack: 2,
    defense: 2,
    ...overrides,
  };
}

test('defense bonus 1.5 warrior keeps hp=1 after two warrior attacks', () => {
  let defender = warrior({ defenseBonus: 1.5 });

  const first = calculateCombatExchange(warrior(), defender);
  defender = { ...defender, hp: first.defenderHp };

  const second = calculateCombatExchange(warrior(), defender);

  assert.equal(second.defenderHp, 1);
});

test('no retaliation when defender is defeated', () => {
  const result = calculateCombatExchange(
    { hp: 10, maxHp: 10, attack: 8, defense: 1 },
    { hp: 1, maxHp: 10, attack: 2, defense: 2, defenseBonus: 1.5 },
  );

  assert.equal(result.defenderHp, 0);
  assert.equal(result.attackerHp, 10);
});

test('splash=true applies half damage with no retaliation', () => {
  const attacker = { hp: 10, maxHp: 10, attack: 2, defense: 2 };
  const defender = { hp: 10, maxHp: 10, attack: 2, defense: 2, defenseBonus: 1.5 };

  const normal = calculateCombatExchange(attacker, defender);
  const splash = calculateCombatExchange(attacker, defender, true);

  assert.equal(normal.defenderHp, 6);
  assert.equal(splash.defenderHp, 8);
  assert.equal(splash.attackerHp, 10);
});

test('splash damage rounds down when halving odd damage', () => {
  const attacker = { hp: 10, maxHp: 10, attack: 1, defense: 2 };
  const defender = { hp: 10, maxHp: 10, attack: 2, defense: 0 };

  const normal = calculateCombatExchange(attacker, defender);
  const splash = calculateCombatExchange(attacker, defender, true);

  assert.equal(normal.defenderHp, 5);
  assert.equal(splash.defenderHp, 8);
  assert.equal(splash.attackerHp, 10);
});

test('fire dragon splash against giant truncates 4.5 to 4 damage', () => {
  const attacker = { hp: 20, maxHp: 20, attack: 4, defense: 3 };
  const defender = { hp: 40, maxHp: 40, attack: 5, defense: 4 };

  const splash = calculateCombatExchange(attacker, defender, true);

  assert.equal(splash.defenderHp, 36);
  assert.equal(splash.attackerHp, 20);
});

test('calculateCombatExchange returns rounded and raw splash values', () => {
  const attacker = { hp: 20, maxHp: 20, attack: 4, defense: 3 };
  const defender = { hp: 40, maxHp: 40, attack: 5, defense: 4 };

  const splash = calculateCombatExchange(attacker, defender, true);

  assert.equal(splash.defenderHp, 36);
  assert.equal(splash.defenderHpRaw, 35.5);
  assert.equal(splash.attackDamageRaw, 9);
});
