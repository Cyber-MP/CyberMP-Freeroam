export class StatusEffectsController {
  private effectsSystem!: gameStatusEffectSystem;

  constructor() {
    mpClient.game.onGameLoaded(() => {
      this.effectsSystem = mpClient.game.ScriptGameInstance.GetStatusEffectSystem();
    });
  }

  addStatusEffect(effect: string) {
    const player = mpClient.game.GetPlayer();

    this.effectsSystem.ApplyStatusEffect(
      player.GetEntityID(),
      effect,
      player.GetRecordID(),
      player.GetEntityID(),
    );
  }

  hasStatusEffect(effect: string) {
    const player = mpClient.game.GetPlayer();

    return this.effectsSystem.HasStatusEffect(player.GetEntityID(), effect);
  }

  removeStatusEffect(effect: string) {
    const player = mpClient.game.GetPlayerObject();

    if (this.hasStatusEffect(effect)) {
      mpClient.game.StatusEffectHelper.RemoveStatusEffect(player, effect, undefined);
    }
  }
}
