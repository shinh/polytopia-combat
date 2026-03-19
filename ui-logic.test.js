const test = require('node:test');
const assert = require('node:assert/strict');
const { createUiLogic } = require('./ui-logic');

test('parseGroup parses attacker flags and hp', () => {
  const logic = createUiLogic();
  const parsed = logic.parseGroup('Warrior:10:1:0:1:1', 'attacker');

  assert.equal(parsed.length, 1);
  assert.deepEqual(parsed[0], {
    name: 'Warrior',
    hp: 10,
    splash: true,
    vet: false,
    hp10: true,
    keepLastOnMaximize: true,
  });
});

test('serializeGroup normalizes invalid defense mode and wall mode', () => {
  const logic = createUiLogic({ canWall: (name) => name === 'Defender' });

  const defenders = [
    { name: 'Warrior', hp: 10, defenseMode: 'wall', pois: false, vet: false, hp10: false },
    { name: 'Defender', hp: 10, defenseMode: 'wall', pois: true, vet: true, hp10: false },
  ];

  const serialized = logic.serializeGroup(defenders, 'defenders');
  assert.equal(serialized, 'Warrior:10:def:0:0:0,Defender:10:wall:1:1:0');
});

test('calcDefenseBonus uses poison and mode table', () => {
  const logic = createUiLogic();

  assert.equal(logic.calcDefenseBonus('na', false), 1);
  assert.equal(logic.calcDefenseBonus('def', false), 1.5);
  assert.equal(logic.calcDefenseBonus('wall', true), 2);
});

test('applyHpOnMaxChange keeps full health units full after max hp changes', () => {
  const logic = createUiLogic();
  const unit = { hp: 10 };

  logic.applyHpOnMaxChange(unit, 10, 15);
  assert.equal(unit.hp, 15);

  logic.applyHpOnMaxChange(unit, 15, 8);
  assert.equal(unit.hp, 8);
});
