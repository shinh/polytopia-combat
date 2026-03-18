const test = require('node:test');
const assert = require('node:assert/strict');
const { simulateCombat } = require('./combat');

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

  const first = simulateCombat(warrior(), defender);
  defender = { ...defender, hp: first.defenderHp };

  const second = simulateCombat(warrior(), defender);

  assert.equal(second.defenderHp, 1);
});

test('no retaliation when defender is defeated', () => {
  const result = simulateCombat(
    { hp: 10, maxHp: 10, attack: 8, defense: 1 },
    { hp: 1, maxHp: 10, attack: 2, defense: 2, defenseBonus: 1.5 },
  );

  assert.equal(result.defenderHp, 0);
  assert.equal(result.attackerHp, 10);
});

test('splash=true applies half damage with no retaliation', () => {
  const attacker = { hp: 10, maxHp: 10, attack: 2, defense: 2 };
  const defender = { hp: 10, maxHp: 10, attack: 2, defense: 2, defenseBonus: 1.5 };

  const normal = simulateCombat(attacker, defender);
  const splash = simulateCombat(attacker, defender, true);

  assert.equal(normal.defenderHp, 6);
  assert.equal(splash.defenderHp, 8);
  assert.equal(splash.attackerHp, 10);
});

test('splash damage rounds down when halving odd damage', () => {
  const attacker = { hp: 10, maxHp: 10, attack: 1, defense: 2 };
  const defender = { hp: 10, maxHp: 10, attack: 2, defense: 0 };

  const normal = simulateCombat(attacker, defender);
  const splash = simulateCombat(attacker, defender, true);

  assert.equal(normal.defenderHp, 5);
  assert.equal(splash.defenderHp, 8);
  assert.equal(splash.attackerHp, 10);
});
