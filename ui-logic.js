function createUiLogic(deps = {}) {
  const canWall = deps.canWall || (() => false);

  const DEFENSE_MODES = {
    na: 'na',
    def: 'def',
    wall: 'wall',
  };

  function calcDefenseBonus(defenseMode, pois) {
    const table = pois
      ? { na: 0.5, def: 0.7, wall: 2 }
      : { na: 1, def: 1.5, wall: 4 };
    return table[defenseMode] ?? table.na;
  }

  function normalizeDefenseModeForUnit(name, defenseMode) {
    const wallAllowed = canWall(name);
    if (!wallAllowed && defenseMode === DEFENSE_MODES.wall) {
      return DEFENSE_MODES.def;
    }
    if (
      defenseMode === DEFENSE_MODES.na ||
      defenseMode === DEFENSE_MODES.def ||
      defenseMode === DEFENSE_MODES.wall
    ) {
      return defenseMode;
    }
    return DEFENSE_MODES.na;
  }

  function parseGroup(raw, side) {
    if (!raw) return [];
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [encodedName, hpRaw, p3, p4, p5, p6] = item.split(':');
        const name = decodeURIComponent(encodedName || '');
        const hp = Number.parseFloat(hpRaw);

        if (side === 'attacker') {
          return {
            name,
            hp,
            splash: p3 === '1',
            vet: p4 === '1',
            hp10: p5 === '1',
            keepLastOnMaximize: p6 === '1',
          };
        }

        return {
          name,
          hp,
          defenseMode: p3 || DEFENSE_MODES.na,
          pois: p4 === '1',
          vet: p5 === '1',
          hp10: p6 === '1',
        };
      })
      .filter((u) => u.name);
  }

  function serializeGroup(group, side) {
    return group
      .map((unit) => {
        const encodedName = encodeURIComponent(unit.name);
        const hp = Math.max(0, unit.hp);
        if (side === 'attackers') {
          return `${encodedName}:${hp}:${unit.splash ? '1' : '0'}:${unit.vet ? '1' : '0'}:${unit.hp10 ? '1' : '0'}:${unit.keepLastOnMaximize ? '1' : '0'}`;
        }

        const defenseMode = normalizeDefenseModeForUnit(
          unit.name,
          unit.defenseMode || DEFENSE_MODES.na,
        );
        return `${encodedName}:${hp}:${defenseMode}:${unit.pois ? '1' : '0'}:${unit.vet ? '1' : '0'}:${unit.hp10 ? '1' : '0'}`;
      })
      .join(',');
  }

  function clampHp(hp, maxHp) {
    return Math.max(0, Math.min(maxHp, hp));
  }

  function applyHpOnMaxChange(unit, previousMaxHp, nextMaxHp) {
    if (unit.hp === previousMaxHp) {
      unit.hp = nextMaxHp;
      return;
    }
    unit.hp = clampHp(unit.hp, nextMaxHp);
  }

  return {
    DEFENSE_MODES,
    calcDefenseBonus,
    normalizeDefenseModeForUnit,
    parseGroup,
    serializeGroup,
    clampHp,
    applyHpOnMaxChange,
  };
}

const uiLogicApi = {
  createUiLogic,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = uiLogicApi;
}

if (typeof window !== 'undefined') {
  window.POLYTOPIA_UI_LOGIC = {
    ...(window.POLYTOPIA_UI_LOGIC || {}),
    ...uiLogicApi,
  };
}
