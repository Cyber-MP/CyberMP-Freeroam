import { injectable } from 'inversify';
import { mp } from '../../mp';

export const ITEM_SPAWNER_KEYS = [
  'Preset_Lexington_Toygun',
  'Preset_Fanged_Axe_Default',
  'Preset_Katana_Saburo',
  'Preset_Achilles_Collectible',
  'Preset_VB_Axe',
  'Preset_Pozhar_AirDrop',
  'Preset_Kenshin_Spy',
  'Preset_Overture_Cassidy',
  'Preset_Crusher_Amazon',
  'Legendary_Zhuo_Eight_Star',
  'Preset_Baseball_Bat_Malina',
  'Preset_Neurotoxin_Knife_Iconic',
  'Preset_Grad_AirDrop',
  'Preset_Umbra_Bebe',
  'Preset_Katana_Cocktail',
  'Preset_Carnage_Edgerunners',
  'Preset_Sword_Witcher',
  'Preset_Baton_Murphy',
  'Preset_Dian_Yinglong',
  'w_melee_boss_hammer',
  'Preset_Ajax_Amazon',
  'GrenadeOzobsNose',
] as const;

type ItemSpawnerKey = (typeof ITEM_SPAWNER_KEYS)[number];

@injectable()
export class ItemSpawnerService {
  spawnItem(key: ItemSpawnerKey) {
    mp.game.AddToInventory(`Items.${key}`, 1);
  }
}
