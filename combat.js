/**
 * Simulate one Polytopia combat exchange.
 * Formula reference: https://polytopia.fandom.com/wiki/Combat
 */
function simulateCombat(attacker, defender, splash = false) {
  validateUnit(attacker, 'attacker');
  validateUnit(defender, 'defender');
  if (typeof splash !== 'boolean') {
    throw new TypeError('splash must be a boolean');
  }

  const attackerHpBefore = attacker.hp;
  const defenderHpBefore = defender.hp;
  const defenseBonus = defender.defenseBonus ?? 1;

  const attackForce = attacker.attack * (attackerHpBefore / attacker.maxHp);
  const defenseForce =
    defender.defense * (defenderHpBefore / defender.maxHp) * defenseBonus;
  const totalDamage = attackForce + defenseForce;

  const attackResult = Math.round(
    (attackForce / totalDamage) * attacker.attack * 4.5,
  );

  // Splash damage is half of attackResult and does not trigger retaliation.
  if (splash) {
    const defenderHpAfter = clampHp(defenderHpBefore - attackResult / 2, defender.maxHp);
    return {
      attackerHp: attackerHpBefore,
      defenderHp: defenderHpAfter,
    };
  }

  let attackerHpAfter = attackerHpBefore;
  let defenderHpAfter = clampHp(defenderHpBefore - attackResult, defender.maxHp);

  // No retaliation if defender is defeated.
  if (defenderHpAfter > 0) {
    const defenseResult = Math.round(
      (defenseForce / totalDamage) * defender.defense * 4.5,
    );
    attackerHpAfter = clampHp(attackerHpBefore - defenseResult, attacker.maxHp);
  }

  return {
    attackerHp: attackerHpAfter,
    defenderHp: defenderHpAfter,
  };
}

function clampHp(hp, maxHp) {
  return Math.max(0, Math.min(maxHp, hp));
}

function validateUnit(unit, label) {
  const required = ['hp', 'maxHp', 'attack', 'defense'];
  for (const key of required) {
    if (typeof unit[key] !== 'number' || Number.isNaN(unit[key])) {
      throw new TypeError(`${label}.${key} must be a valid number`);
    }
  }
  if (unit.maxHp <= 0) {
    throw new RangeError(`${label}.maxHp must be > 0`);
  }
  if (unit.hp < 0 || unit.hp > unit.maxHp) {
    throw new RangeError(`${label}.hp must be between 0 and maxHp`);
  }
  if (unit.attack < 0 || unit.defense < 0) {
    throw new RangeError(`${label}.attack and ${label}.defense must be >= 0`);
  }
  if (
    unit.defenseBonus !== undefined &&
    (typeof unit.defenseBonus !== 'number' || Number.isNaN(unit.defenseBonus))
  ) {
    throw new TypeError(`${label}.defenseBonus must be a valid number when provided`);
  }
}

module.exports = {
  simulateCombat,
};
