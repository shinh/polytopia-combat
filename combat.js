/**
 * Simulate one Polytopia combat exchange.
 * Formula reference: https://polytopia.fandom.com/wiki/Combat
 */
function calculateCombatExchange(attacker, defender, splash = false) {
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

  const attackDamageRaw = (attackForce / totalDamage) * attacker.attack * 4.5;
  const attackResult = Math.round(
    attackDamageRaw,
  );

  // Splash damage is half of attackResult rounded down and does not trigger retaliation.
  if (splash) {
    const splashRaw = attackDamageRaw / 2;
    const splashDamage = Math.floor(attackResult / 2);
    const defenderHpAfterRounded = clampHp(
      defenderHpBefore - splashDamage,
      defender.maxHp,
    );
    const defenderHpAfterRaw = clampHp(defenderHpBefore - splashRaw, defender.maxHp);
    return {
      attackerHp: attackerHpBefore,
      attackerHpRaw: attackerHpBefore,
      defenderHp: defenderHpAfterRounded,
      defenderHpRaw: defenderHpAfterRaw,
      attackDamageRaw,
      defenseDamageRaw: 0,
    };
  }

  let attackerHpAfter = attackerHpBefore;
  let attackerHpRaw = attackerHpBefore;
  let defenderHpAfter = clampHp(defenderHpBefore - attackResult, defender.maxHp);
  let defenseDamageRaw = 0;
  const defenderHpRaw = clampHp(defenderHpBefore - attackDamageRaw, defender.maxHp);

  // No retaliation if defender is defeated.
  if (defenderHpAfter > 0) {
    defenseDamageRaw = (defenseForce / totalDamage) * defender.defense * 4.5;
    const defenseResult = Math.round(defenseDamageRaw);
    attackerHpAfter = clampHp(attackerHpBefore - defenseResult, attacker.maxHp);
    attackerHpRaw = clampHp(attackerHpBefore - defenseDamageRaw, attacker.maxHp);
  }

  return {
    attackerHp: attackerHpAfter,
    attackerHpRaw,
    defenderHp: defenderHpAfter,
    defenderHpRaw,
    attackDamageRaw,
    defenseDamageRaw,
  };
}

function simulateCombat(attacker, defender, splash = false) {
  const result = calculateCombatExchange(attacker, defender, splash);
  return {
    attackerHp: result.attackerHp,
    defenderHp: result.defenderHp,
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

const combatApi = {
  calculateCombatExchange,
  simulateCombat,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = combatApi;
}

if (typeof window !== 'undefined') {
  window.POLYTOPIA_COMBAT = {
    ...(window.POLYTOPIA_COMBAT || {}),
    ...combatApi,
  };
}
