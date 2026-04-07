import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { isHotkeyPressed } from 'react-hotkeys-hook';
import Boots_03_old_01 from '#/images/clothes/Boots_03_old_01.webp?w=300&h=300&imagetools';
import Boots_07_basic_01 from '#/images/clothes/Boots_07_basic_01.webp?w=300&h=300&imagetools';
import Boots_09_old_01 from '#/images/clothes/Boots_09_old_01.webp?w=300&h=300&imagetools';
import Boots_09_rich_03 from '#/images/clothes/Boots_09_rich_03.webp?w=300&h=300&imagetools';
import CasualShoes_04_basic_02 from '#/images/clothes/CasualShoes_04_basic_02.webp?w=300&h=300&imagetools';
import Cop_01_Set_Boots from '#/images/clothes/Cop_01_Set_Boots.webp?w=300&h=300&imagetools';
import Cop_01_Set_Jacket from '#/images/clothes/Cop_01_Set_Jacket.webp?w=300&h=300&imagetools';
import FormalPants_02_basic_01 from '#/images/clothes/FormalPants_02_basic_01.webp?w=300&h=300&imagetools';
import FormalShoes_02_rich_01 from '#/images/clothes/FormalShoes_02_rich_01.webp?w=300&h=300&imagetools';
import FormalShoes_03_rich_02 from '#/images/clothes/FormalShoes_03_rich_02.webp?w=300&h=300&imagetools';
import FormalSkirt_01_basic_02 from '#/images/clothes/FormalSkirt_01_basic_02.webp?w=300&h=300&imagetools';
import Media_01_Set_Pants from '#/images/clothes/Media_01_Set_Pants.webp?w=300&h=300&imagetools';
import Pants_03_basic_03 from '#/images/clothes/Pants_03_basic_03.webp?w=300&h=300&imagetools';
import Pants_03_rich_03 from '#/images/clothes/Pants_03_rich_03.webp?w=300&h=300&imagetools';
import Pants_07_old_02 from '#/images/clothes/Pants_07_old_02.webp?w=300&h=300&imagetools';
import Pants_11_old_02 from '#/images/clothes/Pants_11_old_02.webp?w=300&h=300&imagetools';
import Q005_Johnny_Glasses from '#/images/clothes/Q005_Johnny_Glasses.webp?w=300&h=300&imagetools';
import Q005_Johnny_Pants from '#/images/clothes/Q005_Johnny_Pants.webp?w=300&h=300&imagetools';
import Q005_Johnny_Shirt from '#/images/clothes/Q005_Johnny_Shirt.webp?w=300&h=300&imagetools';
import Q005_Johnny_Shoes from '#/images/clothes/Q005_Johnny_Shoes.webp?w=300&h=300&imagetools';
import Q115_Custom_Predator_Armor from '#/images/clothes/Q115_Custom_Predator_Armor.webp?w=300&h=300&imagetools';
import Q303_mask_h1 from '#/images/clothes/Q303_mask_h1.webp?w=300&h=300&imagetools';
import SQ030_Diving_Suit from '#/images/clothes/SQ030_Diving_Suit.webp?w=300&h=300&imagetools';
import SQ030_MaxTac_Chest from '#/images/clothes/SQ030_MaxTac_Chest.webp?w=300&h=300&imagetools';
import SQ031_Samurai_Jacket from '#/images/clothes/SQ031_Samurai_Jacket.webp?w=300&h=300&imagetools';
import Tech_01_rich_01 from '#/images/clothes/Tech_01_rich_01.webp?w=300&h=300&imagetools';
import Tech_02_basic_02 from '#/images/clothes/Tech_02_basic_02.webp?w=300&h=300&imagetools';
import TightJumpsuit_01_basic_01 from '#/images/clothes/TightJumpsuit_01_basic_01.webp?w=300&h=150&imagetools';
import TightJumpsuit_01_rich_02 from '#/images/clothes/TightJumpsuit_01_rich_02.webp?w=300&h=150&imagetools';
import Trauma_Team_Outfit from '#/images/clothes/Trauma_Team_Outfit.webp?w=300&h=300&imagetools';
import Tshirt_12_basic_01 from '#/images/clothes/Tshirt_12_basic_01.webp?w=300&h=300&imagetools';
import Tshirt_12_old_04 from '#/images/clothes/Tshirt_12_old_04.webp?w=300&h=300&imagetools';
import Twitch_Drop_Specs from '#/images/clothes/Twitch_Drop_Specs.webp?w=300&h=300&imagetools';
import Undershirt_03_basic_02 from '#/images/clothes/Undershirt_03_basic_02.webp?w=300&h=300&imagetools';
import Vest_02_rich_02 from '#/images/clothes/Vest_02_rich_02.webp?w=300&h=300&imagetools';
import Vest_04_rich_02 from '#/images/clothes/Vest_04_rich_02.webp?w=300&h=300&imagetools';
import Vest_08_basic_01 from '#/images/clothes/Vest_08_basic_01.webp?w=300&h=300&imagetools';
import Vest_21_rich_03 from '#/images/clothes/Vest_21_rich_03.webp?w=300&h=300&imagetools';
import Vest_24_basic_01 from '#/images/clothes/Vest_24_basic_01.webp?w=300&h=300&imagetools';
import Visor_01_basic_02 from '#/images/clothes/Visor_01_basic_02.webp?w=300&h=300&imagetools';
import Visor_02_basic_01 from '#/images/clothes/Visor_02_basic_01.webp?w=300&h=300&imagetools';
import BlackLaceV1 from '#/images/consumables/BlackLaceV1.webp?w=300&h=300&imagetools';
import Blackmarket_MemoryBooster from '#/images/consumables/Blackmarket_MemoryBooster.webp?w=300&h=300&imagetools';
import Blackmarket_StaminaBooster from '#/images/consumables/Blackmarket_StaminaBooster.webp?w=300&h=150&imagetools';
import BonesMcCoy70VLegendaryPlus from '#/images/consumables/BonesMcCoy70VLegendaryPlus.webp?w=300&h=300&imagetools';
import FirstAidWhiffVLegendaryPlus from '#/images/consumables/FirstAidWhiffVLegendaryPlus.webp?w=300&h=300&imagetools';
import GrenadeEMPLegendaryPlus from '#/images/consumables/GrenadeEMPLegendaryPlus.webp?w=300&h=300&imagetools';
import GrenadeFragLegendaryPlus from '#/images/consumables/GrenadeFragLegendaryPlus.webp?w=300&h=300&imagetools';
import GrenadeOzobsNose from '#/images/consumables/GrenadeOzobsNose.webp?w=300&h=300&fit=contain&imagetools';
import HealthBooster from '#/images/consumables/HealthBooster.webp?w=300&h=300&imagetools';
import OxyBooster from '#/images/consumables/OxyBooster.webp?w=300&h=300&imagetools';
import AdvancedBerserkC1MK4PlusPlus from '#/images/implants/AdvancedBerserkC1MK4PlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC2MK4PlusPlus from '#/images/implants/AdvancedBerserkC2MK4PlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC3MK5PlusPlus from '#/images/implants/AdvancedBerserkC3MK5PlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC4MK5PlusPlus from '#/images/implants/AdvancedBerserkC4MK5PlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBioConductorsLegendary_Plus from '#/images/implants/AdvancedBioConductorsLegendary_Plus.webp?w=300&h=300&imagetools';
import AdvancedBiomonitorLegendaryPlusPlus from '#/images/implants/AdvancedBiomonitorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBloodDepleterLegendaryPlusPlus from '#/images/implants/AdvancedBloodDepleterLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBloodPumpLegendaryPlusPlus from '#/images/implants/AdvancedBloodPumpLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBoneMarrowCellsLegendaryPlusPlus from '#/images/implants/AdvancedBoneMarrowCellsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBoostedTendonsLegendaryPlusPlus from '#/images/implants/AdvancedBoostedTendonsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedBoringPlatingLegendaryPlusPlus from '#/images/implants/AdvancedBoringPlatingLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedCamilloRamManagerLegendaryPlusPlus from '#/images/implants/AdvancedCamilloRamManagerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedCatchMeIfYouCanLegendaryPlusPlus from '#/images/implants/AdvancedCatchMeIfYouCanLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedCatPawsLegendaryPlusPlus from '#/images/implants/AdvancedCatPawsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedChargeSystemLegendaryPlusPlus from '#/images/implants/AdvancedChargeSystemLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedCyberRotorsLegendaryPlusPlus from '#/images/implants/AdvancedCyberRotorsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedDischargeConnectorLegendaryPlusPlus from '#/images/implants/AdvancedDischargeConnectorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedElectroshockMechanismLegendaryPlusPlus from '#/images/implants/AdvancedElectroshockMechanismLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedEndoskeletonLegendaryPlusPlus from '#/images/implants/AdvancedEndoskeletonLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedHealOnKillLegendaryPlusPlus from '#/images/implants/AdvancedHealOnKillLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedJenkinsTendonsLegendaryPlusPlus from '#/images/implants/AdvancedJenkinsTendonsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedJointLockLegendaryPlusPlus from '#/images/implants/AdvancedJointLockLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedKiroshiOpticsBareLegendaryPlusPlus from '#/images/implants/AdvancedKiroshiOpticsBareLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedKnifeSharpenerLegendaryPlusPlus from '#/images/implants/AdvancedKnifeSharpenerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedMantisBladesLegendaryPlusPlus from '#/images/implants/AdvancedMantisBladesLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedMicroGeneratorLegendaryPlusPlus from '#/images/implants/AdvancedMicroGeneratorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedNanoWiresLegendaryPlusPlus from '#/images/implants/AdvancedNanoWiresLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedNeoFiberLegendaryPlusPlus from '#/images/implants/AdvancedNeoFiberLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedOilDispenserLegendaryPlusPlus from '#/images/implants/AdvancedOilDispenserLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedPainDistributorLegendaryPlusPlus from '#/images/implants/AdvancedPainDistributorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedPainReductorLegendaryPlusPlus from '#/images/implants/AdvancedPainReductorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedPowerGripLegendaryPlusPlus from '#/images/implants/AdvancedPowerGripLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedProjectileLauncherLegendaryPlusPlus from '#/images/implants/AdvancedProjectileLauncherLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedProximityReducerLegendaryPlusPlus from '#/images/implants/AdvancedProximityReducerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedRapidMuscleNurishLegendaryPlusPlus from '#/images/implants/AdvancedRapidMuscleNurishLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedReinforcedMusclesLegendaryPlusPlus from '#/images/implants/AdvancedReinforcedMusclesLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedSecondHeartLegendaryPlusPlus from '#/images/implants/AdvancedSecondHeartLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedShockAbsorberLegendaryPlusPlus from '#/images/implants/AdvancedShockAbsorberLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedSmartLinkLegendaryPlusPlus from '#/images/implants/AdvancedSmartLinkLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedStaminaRegenBoosterLegendaryPlusPlus from '#/images/implants/AdvancedStaminaRegenBoosterLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedStrongArmsLegendaryPlusPlus from '#/images/implants/AdvancedStrongArmsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedSubdermalCoProcessorLegendaryPlusPlus from '#/images/implants/AdvancedSubdermalCoProcessorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedT1000LegendaryPlusPlus from '#/images/implants/AdvancedT1000LegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedTitaniumInfusedBonesLegendaryPlusPlus from '#/images/implants/AdvancedTitaniumInfusedBonesLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedTyrosineInjectorLegendaryPlusPlus from '#/images/implants/AdvancedTyrosineInjectorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedWeirdTankyPlatingLegendaryPlusPlus from '#/images/implants/AdvancedWeirdTankyPlatingLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import Legendary_Zhuo_Eight_Star from '#/images/weapons/Legendary_Zhuo_Eight_Star.webp?w=300&h=150&imagetools';
import Preset_Achilles_Collectible from '#/images/weapons/Preset_Achilles_Collectible.webp?w=300&h=150&imagetools';
import Preset_Ajax_Amazon from '#/images/weapons/Preset_Ajax_Amazon.webp?w=300&h=150&imagetools';
import Preset_Baseball_Bat_Malina from '#/images/weapons/Preset_Baseball_Bat_Malina.webp?w=300&h=150&imagetools';
import Preset_Baton_Murphy from '#/images/weapons/Preset_Baton_Murphy.webp?w=300&h=150&imagetools';
import Preset_Carnage_Edgerunners from '#/images/weapons/Preset_Carnage_Edgerunners.webp?w=300&h=150&imagetools';
import Preset_Crusher_Amazon from '#/images/weapons/Preset_Crusher_Amazon.webp?w=300&h=150&imagetools';
import Preset_Dian_Yinglong from '#/images/weapons/Preset_Dian_Yinglong.webp?w=300&h=150&imagetools';
import Preset_Dildo_Stout from '#/images/weapons/Preset_Dildo_Stout.webp?w=300&h=150&imagetools';
import Preset_Fanged_Axe_Default from '#/images/weapons/Preset_Fanged_Axe_Default.webp?w=300&h=150&imagetools';
import Preset_Grad_AirDrop from '#/images/weapons/Preset_Grad_AirDrop.webp?w=300&h=150&imagetools';
import Preset_Katana_Cocktail from '#/images/weapons/Preset_Katana_Cocktail.webp?w=300&h=150&imagetools';
import Preset_Katana_Saburo from '#/images/weapons/Preset_Katana_Saburo.webp?w=300&h=150&imagetools';
import Preset_Kenshin_Spy from '#/images/weapons/Preset_Kenshin_Spy.webp?w=300&h=150&imagetools';
import Preset_Lexington_Toygun from '#/images/weapons/Preset_Lexington_Toygun.webp?w=300&h=150&imagetools';
import Preset_Neurotoxin_Knife_Iconic from '#/images/weapons/Preset_Neurotoxin_Knife_Iconic.webp?w=300&h=150&imagetools';
import Preset_Overture_Cassidy from '#/images/weapons/Preset_Overture_Cassidy.webp?w=300&h=150&imagetools';
import Preset_Pozhar_AirDrop from '#/images/weapons/Preset_Pozhar_AirDrop.webp?w=300&h=150&imagetools';
import Preset_Sword_Witcher from '#/images/weapons/Preset_Sword_Witcher.webp?w=300&h=150&imagetools';
import Preset_Umbra_Bebe from '#/images/weapons/Preset_Umbra_Bebe.webp?w=300&h=150&imagetools';
import Preset_VB_Axe from '#/images/weapons/Preset_VB_Axe.webp?w=300&h=150&imagetools';
import w_melee_boss_hammer from '#/images/weapons/w_melee_boss_hammer.webp?w=300&h=150&imagetools';

import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';
import { type ClientInputs, clientQuery } from '@/rpc';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

export const Route = createFileRoute('/hud/menu/items')({
  component: withDisabledDuringMatch(RouteComponent),
});

enum ItemCategory {
  WEAPONS = 'weapons',
  CLOTHES = 'clothes',
  CONSUMABLES = 'consumables',
  IMPLANTS = 'implants',
}

type Item = {
  key: ClientInputs['itemSpawner']['spawnItem'];
  name: string;
  image: string;
};

const DATA: Record<ItemCategory, Item[]> = {
  [ItemCategory.WEAPONS]: [
    {
      key: 'Preset_Lexington_Toygun',
      name: 'AR Raygun Supreme 9000',
      image: Preset_Lexington_Toygun,
    },
    {
      key: 'Preset_Fanged_Axe_Default',
      name: 'Claw',
      image: Preset_Fanged_Axe_Default,
    },
    {
      key: 'Preset_Katana_Saburo',
      name: 'Satori',
      image: Preset_Katana_Saburo,
    },
    {
      key: 'Preset_Achilles_Collectible',
      name: 'Achilles x-MOD2',
      image: Preset_Achilles_Collectible,
    },
    {
      key: 'Preset_VB_Axe',
      name: 'Agaou',
      image: Preset_VB_Axe,
    },
    {
      key: 'Preset_Pozhar_AirDrop',
      name: 'Alabai',
      image: Preset_Pozhar_AirDrop,
    },
    {
      key: 'Preset_Kenshin_Spy',
      name: 'Ambition',
      image: Preset_Kenshin_Spy,
    },
    {
      key: 'Preset_Overture_Cassidy',
      name: 'Amnesty',
      image: Preset_Overture_Cassidy,
    },
    {
      key: 'Preset_Crusher_Amazon',
      name: 'Amstaff',
      image: Preset_Crusher_Amazon,
    },
    {
      key: 'Legendary_Zhuo_Eight_Star',
      name: 'Ba Xing Chong',
      image: Legendary_Zhuo_Eight_Star,
    },
    {
      key: 'Preset_Baseball_Bat_Malina',
      name: 'Baby Boomer',
      image: Preset_Baseball_Bat_Malina,
    },
    {
      key: 'Preset_Neurotoxin_Knife_Iconic',
      name: 'Blue Fang',
      image: Preset_Neurotoxin_Knife_Iconic,
    },
    {
      key: 'Preset_Grad_AirDrop',
      name: 'Borzaya',
      image: Preset_Grad_AirDrop,
    },
    {
      key: 'Preset_Umbra_Bebe',
      name: 'Carmen',
      image: Preset_Umbra_Bebe,
    },
    {
      key: 'Preset_Katana_Cocktail',
      name: 'Cocktail Stick',
      image: Preset_Katana_Cocktail,
    },
    {
      key: 'Preset_Carnage_Edgerunners',
      name: 'Guts',
      image: Preset_Carnage_Edgerunners,
    },
    {
      key: 'Preset_Sword_Witcher',
      name: 'Gwynbleidd',
      image: Preset_Sword_Witcher,
    },
    {
      key: 'Preset_Baton_Murphy',
      name: "Murphy's Law",
      image: Preset_Baton_Murphy,
    },
    {
      key: 'Preset_Dian_Yinglong',
      name: 'Yinglong',
      image: Preset_Dian_Yinglong,
    },
    {
      key: 'w_melee_boss_hammer',
      name: "Sasquatch's Hammer",
      image: w_melee_boss_hammer,
    },
    {
      key: 'Preset_Ajax_Amazon',
      name: 'Pit Bull',
      image: Preset_Ajax_Amazon,
    },
    {
      key: 'Preset_Dildo_Stout',
      name: 'Sir John Phallustiff',
      image: Preset_Dildo_Stout,
    },
  ],
  [ItemCategory.CONSUMABLES]: [
    {
      key: 'GrenadeOzobsNose',
      name: "Ozob's Nose",
      image: GrenadeOzobsNose,
    },
    {
      key: 'GrenadeFragLegendaryPlus',
      name: 'F-GX Frag Grenade',
      image: GrenadeFragLegendaryPlus,
    },
    {
      key: 'GrenadeEMPLegendaryPlus',
      name: 'EMP Grenade',
      image: GrenadeEMPLegendaryPlus,
    },
    {
      key: 'BlackLaceV1',
      name: 'Black Lace',
      image: BlackLaceV1,
    },
    {
      key: 'Blackmarket_MemoryBooster',
      name: 'RAM Nugs',
      image: Blackmarket_MemoryBooster,
    },
    {
      key: 'Blackmarket_StaminaBooster',
      name: 'Jellytricity',
      image: Blackmarket_StaminaBooster,
    },
    {
      key: 'BonesMcCoy70VLegendaryPlus',
      name: 'Bounce Back',
      image: BonesMcCoy70VLegendaryPlus,
    },
    {
      key: 'FirstAidWhiffVLegendaryPlus',
      name: 'MaxDoc',
      image: FirstAidWhiffVLegendaryPlus,
    },
    {
      key: 'OxyBooster',
      name: 'Oxy Booster',
      image: OxyBooster,
    },
    {
      key: 'HealthBooster',
      name: 'Health Booster',
      image: HealthBooster,
    },
  ],
  [ItemCategory.IMPLANTS]: [
    {
      key: 'AdvancedCamilloRamManagerLegendaryPlusPlus',
      name: 'Camillo RAM Manager',
      image: AdvancedCamilloRamManagerLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBioConductorsLegendary_Plus',
      name: 'Bioconductor',
      image: AdvancedBioConductorsLegendary_Plus,
    },
    {
      key: 'AdvancedSubdermalCoProcessorLegendaryPlusPlus',
      name: 'Newton Module',
      image: AdvancedSubdermalCoProcessorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedStrongArmsLegendaryPlusPlus',
      name: 'Gorilla Arms',
      image: AdvancedStrongArmsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedMantisBladesLegendaryPlusPlus',
      name: 'Mantis Blades',
      image: AdvancedMantisBladesLegendaryPlusPlus,
    },
    {
      key: 'AdvancedNanoWiresLegendaryPlusPlus',
      name: 'Monowire',
      image: AdvancedNanoWiresLegendaryPlusPlus,
    },
    {
      key: 'AdvancedProjectileLauncherLegendaryPlusPlus',
      name: 'Projectile Launch System',
      image: AdvancedProjectileLauncherLegendaryPlusPlus,
    },
    {
      key: 'AdvancedKiroshiOpticsBareLegendaryPlusPlus',
      name: 'Basic Kiroshi Optics',
      image: AdvancedKiroshiOpticsBareLegendaryPlusPlus,
    },
    {
      key: 'AdvancedT1000LegendaryPlusPlus',
      name: 'Para Bellum',
      image: AdvancedT1000LegendaryPlusPlus,
    },
    {
      key: 'AdvancedEndoskeletonLegendaryPlusPlus',
      name: 'Epimorphic Skeleton',
      image: AdvancedEndoskeletonLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBoneMarrowCellsLegendaryPlusPlus',
      name: 'Kinetic Frame',
      image: AdvancedBoneMarrowCellsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedRapidMuscleNurishLegendaryPlusPlus',
      name: 'Scarab',
      image: AdvancedRapidMuscleNurishLegendaryPlusPlus,
    },
    {
      key: 'AdvancedTitaniumInfusedBonesLegendaryPlusPlus',
      name: 'Titanium Bones',
      image: AdvancedTitaniumInfusedBonesLegendaryPlusPlus,
    },
    {
      key: 'AdvancedPainDistributorLegendaryPlusPlus',
      name: 'Universal Booster',
      image: AdvancedPainDistributorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedSmartLinkLegendaryPlusPlus',
      name: 'Smart Link',
      image: AdvancedSmartLinkLegendaryPlusPlus,
    },
    {
      key: 'AdvancedPowerGripLegendaryPlusPlus',
      name: 'Ballistic Coprocessor',
      image: AdvancedPowerGripLegendaryPlusPlus,
    },
    {
      key: 'AdvancedKnifeSharpenerLegendaryPlusPlus',
      name: 'Handle Wrap',
      image: AdvancedKnifeSharpenerLegendaryPlusPlus,
    },
    {
      key: 'AdvancedMicroGeneratorLegendaryPlusPlus',
      name: 'Microgenerator',
      image: AdvancedMicroGeneratorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedJointLockLegendaryPlusPlus',
      name: 'Shock Absorber',
      image: AdvancedJointLockLegendaryPlusPlus,
    },
    {
      key: 'AdvancedNeoFiberLegendaryPlusPlus',
      name: 'NeoFiber',
      image: AdvancedNeoFiberLegendaryPlusPlus,
    },
    {
      key: 'AdvancedTyrosineInjectorLegendaryPlusPlus',
      name: 'Tyrosine Injector',
      image: AdvancedTyrosineInjectorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedOilDispenserLegendaryPlusPlus',
      name: 'Stabber',
      image: AdvancedOilDispenserLegendaryPlusPlus,
    },
    {
      key: 'AdvancedCatchMeIfYouCanLegendaryPlusPlus',
      name: 'ThreatEvac',
      image: AdvancedCatchMeIfYouCanLegendaryPlusPlus,
    },
    {
      key: 'AdvancedSecondHeartLegendaryPlusPlus',
      name: 'Second Heart',
      image: AdvancedSecondHeartLegendaryPlusPlus,
    },
    {
      key: 'AdvancedCyberRotorsLegendaryPlusPlus',
      name: 'Microrotors',
      image: AdvancedCyberRotorsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedHealOnKillLegendaryPlusPlus',
      name: 'Heal-On-Kill',
      image: AdvancedHealOnKillLegendaryPlusPlus,
    },
    {
      key: 'AdvancedDischargeConnectorLegendaryPlusPlus',
      name: 'Feedback Circuit',
      image: AdvancedDischargeConnectorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedShockAbsorberLegendaryPlusPlus',
      name: 'Clutch Padding',
      image: AdvancedShockAbsorberLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBloodPumpLegendaryPlusPlus',
      name: 'Blood Pump',
      image: AdvancedBloodPumpLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBiomonitorLegendaryPlusPlus',
      name: 'Biomonitor',
      image: AdvancedBiomonitorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedStaminaRegenBoosterLegendaryPlusPlus',
      name: 'Adrenaline Booster',
      image: AdvancedStaminaRegenBoosterLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBoringPlatingLegendaryPlusPlus',
      name: 'Subdermal Armor',
      image: AdvancedBoringPlatingLegendaryPlusPlus,
    },
    {
      key: 'AdvancedElectroshockMechanismLegendaryPlusPlus',
      name: 'Shock-n-Awe',
      image: AdvancedElectroshockMechanismLegendaryPlusPlus,
    },
    {
      key: 'AdvancedChargeSystemLegendaryPlusPlus',
      name: 'RangeGuard',
      image: AdvancedChargeSystemLegendaryPlusPlus,
    },
    {
      key: 'AdvancedProximityReducerLegendaryPlusPlus',
      name: 'ProxiShield',
      image: AdvancedProximityReducerLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBloodDepleterLegendaryPlusPlus',
      name: 'Painducer',
      image: AdvancedBloodDepleterLegendaryPlusPlus,
    },
    {
      key: 'AdvancedPainReductorLegendaryPlusPlus',
      name: 'Pain Editor',
      image: AdvancedPainReductorLegendaryPlusPlus,
    },
    {
      key: 'AdvancedWeirdTankyPlatingLegendaryPlusPlus',
      name: 'Carapace',
      image: AdvancedWeirdTankyPlatingLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBoostedTendonsLegendaryPlusPlus',
      name: 'Reinforced Tendons',
      image: AdvancedBoostedTendonsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedCatPawsLegendaryPlusPlus',
      name: 'Lynx Paws',
      image: AdvancedCatPawsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedJenkinsTendonsLegendaryPlusPlus',
      name: "Jenkins' Tendons",
      image: AdvancedJenkinsTendonsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedReinforcedMusclesLegendaryPlusPlus',
      name: 'Fortified Ankles',
      image: AdvancedReinforcedMusclesLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBerserkC3MK5PlusPlus',
      name: 'Zetatech Berserk',
      image: AdvancedBerserkC3MK5PlusPlus,
    },
    {
      key: 'AdvancedBerserkC1MK4PlusPlus',
      name: 'Moore Tech Berserk',
      image: AdvancedBerserkC1MK4PlusPlus,
    },
    {
      key: 'AdvancedBerserkC4MK5PlusPlus',
      name: 'Militech Berserk',
      image: AdvancedBerserkC4MK5PlusPlus,
    },
    {
      key: 'AdvancedBerserkC2MK4PlusPlus',
      name: 'BioDyne Berserk',
      image: AdvancedBerserkC2MK4PlusPlus,
    },
  ],
  [ItemCategory.CLOTHES]: [
    {
      key: 'Q303_mask_h1',
      name: 'Amikiri Sound Cutter',
      image: Q303_mask_h1,
    },
    {
      key: 'Q005_Johnny_Glasses',
      name: "Johnny's aviators",
      image: Q005_Johnny_Glasses,
    },
    {
      key: 'SQ031_Samurai_Jacket',
      name: "Replica of Johnny's Samurai jacket",
      image: SQ031_Samurai_Jacket,
    },
    {
      key: 'Q005_Johnny_Shirt',
      name: "Johnny's tank top",
      image: Q005_Johnny_Shirt,
    },
    {
      key: 'Q005_Johnny_Pants',
      name: "Johnny's pants",
      image: Q005_Johnny_Pants,
    },
    {
      key: 'Q005_Johnny_Shoes',
      name: "Johnny's shoes",
      image: Q005_Johnny_Shoes,
    },
    {
      key: 'Visor_01_basic_02',
      name: 'Illegally modified military infovisor',
      image: Visor_01_basic_02,
    },
    {
      key: 'Visor_02_basic_01',
      name: 'Boostknit-polymer military techgogs',
      image: Visor_02_basic_01,
    },
    {
      key: 'Tech_01_rich_01',
      name: 'Kang Tao manganese combat ocuset',
      image: Tech_01_rich_01,
    },
    {
      key: 'Tech_02_basic_02',
      name: 'Lightweight tungsten-steel BD wreath',
      image: Tech_02_basic_02,
    },
    {
      key: 'Vest_04_rich_02',
      name: 'Daemon Hunter titanium-weave ballistic vest',
      image: Vest_04_rich_02,
    },
    {
      key: 'Vest_02_rich_02',
      name: 'Militech armor-quilted aramid vest',
      image: Vest_02_rich_02,
    },
    {
      key: 'SQ030_MaxTac_Chest',
      name: 'MaxTac multilayered armor-weave Jacket',
      image: SQ030_MaxTac_Chest,
    },
    {
      key: 'Q115_Custom_Predator_Armor',
      name: 'Predator Aramid Armor (from Rogue)',
      image: Q115_Custom_Predator_Armor,
    },
    {
      key: 'Cop_01_Set_Jacket',
      name: 'Heavy-duty aramid-reinforced badge coat',
      image: Cop_01_Set_Jacket,
    },
    {
      key: 'Twitch_Drop_Specs',
      name: 'NUS infiltrator headgear',
      image: Twitch_Drop_Specs,
    },
    {
      key: 'Vest_08_basic_01',
      name: 'Militech heavy tactical vest',
      image: Vest_08_basic_01,
    },
    {
      key: 'TightJumpsuit_01_rich_02',
      name: 'Red Alert anti-surge netrunning suit',
      image: TightJumpsuit_01_rich_02,
    },
    {
      key: 'TightJumpsuit_01_basic_01',
      name: 'Military-grade aramid netrunning suit',
      image: TightJumpsuit_01_basic_01,
    },
    {
      key: 'Vest_24_basic_01',
      name: 'Militech tactical chest holster',
      image: Vest_24_basic_01,
    },
    {
      key: 'Vest_21_rich_03',
      name: 'Breathable tac vest with elastic synth-silk',
      image: Vest_21_rich_03,
    },
    {
      key: 'FormalPants_02_basic_01',
      name: 'Classic immuno-cotton corporate pants',
      image: FormalPants_02_basic_01,
    },
    {
      key: 'Undershirt_03_basic_02',
      name: 'Bara Kaika syn-leather bustier',
      image: Undershirt_03_basic_02,
    },
    {
      key: 'Tshirt_12_old_04',
      name: 'Quick-dry composite t-shirt',
      image: Tshirt_12_old_04,
    },
    {
      key: 'Tshirt_12_basic_01',
      name: 'Thermodynamic t-shirt with nanotube lining',
      image: Tshirt_12_basic_01,
    },
    {
      key: 'FormalSkirt_01_basic_02',
      name: 'Classy aramid-weave skirt',
      image: FormalSkirt_01_basic_02,
    },
    {
      key: 'Media_01_Set_Pants',
      name: 'Anti-piercing tactical media cargo pants',
      image: Media_01_Set_Pants,
    },
    {
      key: 'Pants_03_basic_03',
      name: 'BITCH V.13 syn-resistant pants',
      image: Pants_03_basic_03,
    },
    {
      key: 'Pants_03_rich_03',
      name: 'PSYCHO tac-fiber biker pants',
      image: Pants_03_rich_03,
    },
    {
      key: 'Pants_07_old_02',
      name: 'Worn Kang Tao tactical pants',
      image: Pants_07_old_02,
    },
    {
      key: 'Pants_11_old_02',
      name: 'Nomad eazy-breathe cargo pants',
      image: Pants_11_old_02,
    },
    {
      key: 'Boots_03_old_01',
      name: 'Weathered combat boots',
      image: Boots_03_old_01,
    },
    {
      key: 'Boots_07_basic_01',
      name: 'GLITTER laceless sturdy-stitched steel-toes',
      image: Boots_07_basic_01,
    },
    {
      key: 'Boots_09_old_01',
      name: 'Composite punk exo-jacks',
      image: Boots_09_old_01,
    },
    {
      key: 'Boots_09_rich_03',
      name: 'Reinforced Rouge Absurde exo-jacks with defensive nanotubing',
      image: Boots_09_rich_03,
    },
    {
      key: 'CasualShoes_04_basic_02',
      name: 'Darra Polytechnic suede sneakers',
      image: CasualShoes_04_basic_02,
    },
    {
      key: 'Cop_01_Set_Boots',
      name: 'Waterpoof badge combat boots',
      image: Cop_01_Set_Boots,
    },
    {
      key: 'FormalShoes_02_rich_01',
      name: 'Silver Blood evening pumps with protective insoles',
      image: FormalShoes_02_rich_01,
    },
    {
      key: 'FormalShoes_03_rich_02',
      name: 'Creamy Rhubarb dress wedges with sole support',
      image: FormalShoes_03_rich_02,
    },
    {
      key: 'SQ030_Diving_Suit',
      name: 'Neoprene diving suit with flippers (from Judy)',
      image: SQ030_Diving_Suit,
    },
    {
      key: 'Trauma_Team_Outfit',
      name: 'Trauma Team uniform',
      image: Trauma_Team_Outfit,
    },
  ],
};

function RouteComponent() {
  return (
    <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      <Tabs defaultValue={ItemCategory.WEAPONS} className="w-full pb-4">
        <div className="sticky top-0 flex gap-6 items-center z-50">
          <TabsList>
            <TabsTrigger value={ItemCategory.WEAPONS}>Weapons</TabsTrigger>
            <TabsTrigger value={ItemCategory.CLOTHES}>Clothes</TabsTrigger>
            <TabsTrigger value={ItemCategory.CONSUMABLES}>
              Consumables
            </TabsTrigger>
            <TabsTrigger value={ItemCategory.IMPLANTS}>Implants</TabsTrigger>
          </TabsList>
          <span className="text-yellow-400 text-xss bg-[#424242aa] px-2 py-1 rounded-xs backdrop-blur-xs">
            Hold "shift" to spawn without menu close
          </span>
        </div>
        <TabsContent value={ItemCategory.WEAPONS}>
          <ItemsContent value={ItemCategory.WEAPONS} />
        </TabsContent>
        <TabsContent value={ItemCategory.CLOTHES}>
          <ItemsContent value={ItemCategory.CLOTHES} />
        </TabsContent>
        <TabsContent value={ItemCategory.CONSUMABLES}>
          <ItemsContent value={ItemCategory.CONSUMABLES} />
        </TabsContent>
        <TabsContent value={ItemCategory.IMPLANTS}>
          <ItemsContent value={ItemCategory.IMPLANTS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ItemsContent<T extends ItemCategory>({ value }: { value: T }) {
  const navigate = useNavigate();

  const spawnItemMutation = useMutation(
    clientQuery.itemSpawner.spawnItem.triggerMutationOptions(),
  );

  const spawnItem = (key: Item['key']) => {
    spawnItemMutation.mutate([key]);

    if (!isHotkeyPressed('shift')) {
      navigate({ to: '/hud' });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {DATA[value].map((item) => (
        <div
          key={item.key}
          className="flex flex-col justify-between items-center w-full bg-[#85858520] hover:bg-[#85858540] transition-colors duration-150 group cursor-pointer border-2 border-transparent hover:border-primary"
          onClick={() => spawnItem(item.key)}
        >
          <img
            src={item.image}
            alt="Item"
            className="h-40 w-80 object-contain group-hover:drop-shadow-[0_0_25px_#FFFB4580]"
            draggable={false}
          />

          <span className="text-[#aaa] group-hover:text-white bg-muted w-full text-center text-xs p-1 truncate">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
