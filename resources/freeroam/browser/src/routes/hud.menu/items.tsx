import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { isHotkeyPressed } from 'react-hotkeys-hook';
import Boots_03_old_01 from '#/images/clothes/Boots_03_old_01.webp?w=300&h=300&imagetools';
import Boots_07_basic_01 from '#/images/clothes/Boots_07_basic_01.webp?w=300&h=300&imagetools';
import Boots_09_old_01 from '#/images/clothes/Boots_09_old_01.webp?w=300&h=300&imagetools';
import Boots_09_rich_03 from '#/images/clothes/Boots_09_rich_03.webp?w=300&h=300&imagetools';
import Cap_03_old_01 from '#/images/clothes/Cap_03_old_01.webp?w=300&h=300&imagetools';
import CasualShoes_04_basic_02 from '#/images/clothes/CasualShoes_04_basic_02.webp?w=300&h=300&imagetools';
import Cop_01_Set_Boots from '#/images/clothes/Cop_01_Set_Boots.webp?w=300&h=300&imagetools';
import Cop_01_Set_Jacket from '#/images/clothes/Cop_01_Set_Jacket.webp?w=300&h=300&imagetools';
import FormalPants_02_basic_01 from '#/images/clothes/FormalPants_02_basic_01.webp?w=300&h=300&imagetools';
import FormalShoes_02_rich_01 from '#/images/clothes/FormalShoes_02_rich_01.webp?w=300&h=300&imagetools';
import FormalShoes_03_rich_02 from '#/images/clothes/FormalShoes_03_rich_02.webp?w=300&h=300&imagetools';
import FormalSkirt_01_basic_02 from '#/images/clothes/FormalSkirt_01_basic_02.webp?w=300&h=300&imagetools';
import Hat_01_basic_01 from '#/images/clothes/Hat_01_basic_01.webp?w=300&h=300&imagetools';
import Hat_04_basic_02 from '#/images/clothes/Hat_04_basic_02.webp?w=300&h=300&imagetools';
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
import SQ030_Diving_Suit from '#/images/clothes/SQ030_Diving_Suit.webp?w=300&h=300&imagetools';
import SQ030_MaxTac_Chest from '#/images/clothes/SQ030_MaxTac_Chest.webp?w=300&h=300&imagetools';
import SQ031_Samurai_Jacket from '#/images/clothes/SQ031_Samurai_Jacket.webp?w=300&h=300&imagetools';
import Tech_01_rich_01 from '#/images/clothes/Tech_01_rich_01.webp?w=300&h=300&imagetools';
import Tech_02_basic_02 from '#/images/clothes/Tech_02_basic_02.webp?w=300&h=300&imagetools';
import TightJumpsuit_01_basic_01 from '#/images/clothes/TightJumpsuit_01_basic_01.webp?w=300&h=150&imagetools';
import TightJumpsuit_01_rich_02 from '#/images/clothes/TightJumpsuit_01_rich_02.webp?w=300&h=150&imagetools';
import Trauma_Team_Outfit from '#/images/clothes/Trauma_Team_Outfit.webp?w=300&h=300&imagetools';
import TShirt_03_basic_01 from '#/images/clothes/TShirt_03_basic_01.webp?w=300&h=300&imagetools';
import TShirt_04_old_01 from '#/images/clothes/TShirt_04_old_01.webp?w=300&h=300&imagetools';
import TShirt_05_old_05 from '#/images/clothes/TShirt_05_old_05.webp?w=300&h=300&imagetools';
import Undershirt_03_basic_02 from '#/images/clothes/Undershirt_03_basic_02.webp?w=300&h=300&imagetools';
import Vest_02_rich_02 from '#/images/clothes/Vest_02_rich_02.webp?w=300&h=300&imagetools';
import Vest_04_rich_02 from '#/images/clothes/Vest_04_rich_02.webp?w=300&h=300&imagetools';
import Vest_08_basic_01 from '#/images/clothes/Vest_08_basic_01.webp?w=300&h=300&imagetools';
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
import AdvancedBerserkC1MK4Plus from '#/images/implants/AdvancedBerserkC1MK4Plus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC2MK4Plus from '#/images/implants/AdvancedBerserkC2MK4Plus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC3MK5Plus from '#/images/implants/AdvancedBerserkC3MK5Plus.webp?w=300&h=300&imagetools';
import AdvancedBerserkC4MK5Plus from '#/images/implants/AdvancedBerserkC4MK5Plus.webp?w=300&h=300&imagetools';
import AdvancedBioConductorsLegendaryPlus from '#/images/implants/AdvancedBioConductorsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBiomonitorLegendaryPlus from '#/images/implants/AdvancedBiomonitorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBloodDepleterLegendaryPlus from '#/images/implants/AdvancedBloodDepleterLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBloodPumpLegendaryPlus from '#/images/implants/AdvancedBloodPumpLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBoneMarrowCellsLegendaryPlus from '#/images/implants/AdvancedBoneMarrowCellsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBoostedTendonsLegendaryPlus from '#/images/implants/AdvancedBoostedTendonsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedBoringPlatingLegendaryPlus from '#/images/implants/AdvancedBoringPlatingLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedCamilloRamManagerLegendaryPlus from '#/images/implants/AdvancedCamilloRamManagerLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedCatchMeIfYouCanLegendaryPlus from '#/images/implants/AdvancedCatchMeIfYouCanLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedCatPawsLegendaryPlus from '#/images/implants/AdvancedCatPawsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedChargeSystemLegendaryPlus from '#/images/implants/AdvancedChargeSystemLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedCyberRotorsLegendaryPlus from '#/images/implants/AdvancedCyberRotorsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedDischargeConnectorLegendaryPlus from '#/images/implants/AdvancedDischargeConnectorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedElectroshockMechanismLegendaryPlus from '#/images/implants/AdvancedElectroshockMechanismLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedEndoskeletonLegendaryPlus from '#/images/implants/AdvancedEndoskeletonLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedHealOnKillLegendaryPlus from '#/images/implants/AdvancedHealOnKillLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedJenkinsTendonsLegendaryPlus from '#/images/implants/AdvancedJenkinsTendonsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedJointLockLegendaryPlus from '#/images/implants/AdvancedJointLockLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedKiroshiOpticsBareLegendaryPlus from '#/images/implants/AdvancedKiroshiOpticsBareLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedKnifeSharpenerLegendaryPlus from '#/images/implants/AdvancedKnifeSharpenerLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedMantisBladesLegendaryPlus from '#/images/implants/AdvancedMantisBladesLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedMicroGeneratorLegendaryPlus from '#/images/implants/AdvancedMicroGeneratorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedNeoFiberLegendaryPlus from '#/images/implants/AdvancedNeoFiberLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedOilDispenserLegendaryPlus from '#/images/implants/AdvancedOilDispenserLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedPainDistributorLegendaryPlus from '#/images/implants/AdvancedPainDistributorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedPainReductorLegendaryPlus from '#/images/implants/AdvancedPainReductorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedPowerGripLegendaryPlus from '#/images/implants/AdvancedPowerGripLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedProximityReducerLegendaryPlus from '#/images/implants/AdvancedProximityReducerLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedRapidMuscleNurishLegendaryPlus from '#/images/implants/AdvancedRapidMuscleNurishLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedReinforcedMusclesLegendaryPlus from '#/images/implants/AdvancedReinforcedMusclesLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedSecondHeartLegendaryPlus from '#/images/implants/AdvancedSecondHeartLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedShockAbsorberLegendaryPlus from '#/images/implants/AdvancedShockAbsorberLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedSmartLinkLegendaryPlus from '#/images/implants/AdvancedSmartLinkLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedStaminaRegenBoosterLegendaryPlus from '#/images/implants/AdvancedStaminaRegenBoosterLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedStrongArmsLegendaryPlus from '#/images/implants/AdvancedStrongArmsLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedSubdermalCoProcessorLegendaryPlus from '#/images/implants/AdvancedSubdermalCoProcessorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedT1000LegendaryPlus from '#/images/implants/AdvancedT1000LegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedTitaniumInfusedBonesLegendaryPlus from '#/images/implants/AdvancedTitaniumInfusedBonesLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedTyrosineInjectorLegendaryPlus from '#/images/implants/AdvancedTyrosineInjectorLegendaryPlus.webp?w=300&h=300&imagetools';
import AdvancedWeirdTankyPlatingLegendaryPlus from '#/images/implants/AdvancedWeirdTankyPlatingLegendaryPlus.webp?w=300&h=300&imagetools';
import Legendary_Ajax_Moron from '#/images/weapons/Legendary_Ajax_Moron.webp?w=300&h=150&imagetools';
import Legendary_Zhuo_Eight_Star from '#/images/weapons/Legendary_Zhuo_Eight_Star.webp?w=300&h=150&imagetools';
import Preset_Carnage_Edgerunners from '#/images/weapons/Preset_Carnage_Edgerunners.webp?w=300&h=150&imagetools';
import Preset_Dian_Yinglong from '#/images/weapons/Preset_Dian_Yinglong.webp?w=300&h=150&imagetools';
import Preset_Dildo_Stout from '#/images/weapons/Preset_Dildo_Stout.webp?w=300&h=150&imagetools';
import Preset_Fanged_Axe_Default from '#/images/weapons/Preset_Fanged_Axe_Default.webp?w=300&h=150&imagetools';
import Preset_Grad_Buck from '#/images/weapons/Preset_Grad_Buck.webp?w=300&h=150&imagetools';
import Preset_Katana_Cocktail from '#/images/weapons/Preset_Katana_Cocktail.webp?w=300&h=150&imagetools';
import Preset_Katana_GoG from '#/images/weapons/Preset_Katana_GoG.webp?w=300&h=150&imagetools';
import Preset_Katana_Saburo from '#/images/weapons/Preset_Katana_Saburo.webp?w=300&h=150&imagetools';
import Preset_Kolac_Tiny_Mike from '#/images/weapons/Preset_Kolac_Tiny_Mike.webp?w=300&h=150&imagetools';
import Preset_Lexington_Toygun from '#/images/weapons/Preset_Lexington_Toygun.webp?w=300&h=150&imagetools';
import Preset_MA70_Default from '#/images/weapons/Preset_MA70_Default.webp?w=300&h=150&imagetools';
import Preset_Masamune_Rogue from '#/images/weapons/Preset_Masamune_Rogue.webp?w=300&h=150&imagetools';
import Preset_Nue_Maiko from '#/images/weapons/Preset_Nue_Maiko.webp?w=300&h=150&imagetools';
import Preset_Overture_Cassidy from '#/images/weapons/Preset_Overture_Cassidy.webp?w=300&h=150&imagetools';
import Preset_Saratoga_Raffen from '#/images/weapons/Preset_Saratoga_Raffen.webp?w=300&h=150&imagetools';
import Preset_Senkoh_Default from '#/images/weapons/Preset_Senkoh_Default.webp?w=300&h=150&imagetools';
import Preset_Silverhand_3516 from '#/images/weapons/Preset_Silverhand_3516.webp?w=300&h=150&imagetools';
import Preset_Tactician_Dino from '#/images/weapons/Preset_Tactician_Dino.webp?w=300&h=150&imagetools';
import Preset_Yukimura_Default from '#/images/weapons/Preset_Yukimura_Default.webp?w=300&h=150&imagetools';
import { AbilityOverlay } from '@/components/ability-overlay';
import { type ClientInputs, clientQuery } from '@/rpc';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

export const Route = createFileRoute('/hud/menu/items')({
  component: RouteComponent,
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
      key: 'Preset_Silverhand_3516',
      name: '3516',
      image: Preset_Silverhand_3516,
    },
    {
      key: 'Preset_Nue_Maiko',
      name: 'Death and Taxes',
      image: Preset_Nue_Maiko,
    },
    {
      key: 'Preset_Yukimura_Default',
      name: 'HJKE-11 Yukimura',
      image: Preset_Yukimura_Default,
    },
    {
      key: 'Preset_Senkoh_Default',
      name: 'Senkoh LX',
      image: Preset_Senkoh_Default,
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
      key: 'Preset_Saratoga_Raffen',
      name: 'Problem Solver',
      image: Preset_Saratoga_Raffen,
    },
    {
      key: 'Preset_Overture_Cassidy',
      name: 'Amnesty',
      image: Preset_Overture_Cassidy,
    },
    {
      key: 'Legendary_Zhuo_Eight_Star',
      name: 'Ba Xing Chong',
      image: Legendary_Zhuo_Eight_Star,
    },
    {
      key: 'Preset_Tactician_Dino',
      name: 'Bloody Maria',
      image: Preset_Tactician_Dino,
    },
    // {
    //   key: 'Preset_Neurotoxin_Knife_Iconic',
    //   name: 'Blue Fang',
    //   image: Preset_Neurotoxin_Knife_Iconic,
    // },
    {
      key: 'Preset_Katana_GoG',
      name: 'Black Unicorn',
      image: Preset_Katana_GoG,
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
      key: 'Preset_Masamune_Rogue',
      name: 'Prejudice',
      image: Preset_Masamune_Rogue,
    },
    {
      key: 'Legendary_Ajax_Moron',
      name: 'Moron Labe',
      image: Legendary_Ajax_Moron,
    },
    {
      key: 'Preset_Dian_Yinglong',
      name: 'Yinglong',
      image: Preset_Dian_Yinglong,
    },
    // {
    //   key: 'w_melee_boss_hammer',
    //   name: "Sasquatch's Hammer",
    //   image: w_melee_boss_hammer,
    // },
    {
      key: 'Preset_Dildo_Stout',
      name: 'Sir John Phallustiff',
      image: Preset_Dildo_Stout,
    },
    {
      key: 'Preset_MA70_Default',
      name: 'MA70 HB',
      image: Preset_MA70_Default,
    },
    {
      key: 'Preset_Kolac_Tiny_Mike',
      name: 'Hypercritical',
      image: Preset_Kolac_Tiny_Mike,
    },
    {
      key: 'Preset_Grad_Buck',
      name: "O'Five",
      image: Preset_Grad_Buck,
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
      key: 'AdvancedCamilloRamManagerLegendaryPlus',
      name: 'Camillo RAM Manager',
      image: AdvancedCamilloRamManagerLegendaryPlus,
    },
    {
      key: 'AdvancedBioConductorsLegendaryPlus',
      name: 'Bioconductor',
      image: AdvancedBioConductorsLegendaryPlus,
    },
    {
      key: 'AdvancedSubdermalCoProcessorLegendaryPlus',
      name: 'Newton Module',
      image: AdvancedSubdermalCoProcessorLegendaryPlus,
    },
    {
      key: 'AdvancedStrongArmsLegendaryPlus',
      name: 'Gorilla Arms',
      image: AdvancedStrongArmsLegendaryPlus,
    },
    {
      key: 'AdvancedMantisBladesLegendaryPlus',
      name: 'Mantis Blades',
      image: AdvancedMantisBladesLegendaryPlus,
    },
    // {
    //   key: 'AdvancedNanoWiresLegendaryPlus',
    //   name: 'Monowire',
    //   image: AdvancedNanoWiresLegendaryPlus,
    // },
    // {
    //   key: 'AdvancedProjectileLauncherLegendaryPlus',
    //   name: 'Projectile Launch System',
    //   image: AdvancedProjectileLauncherLegendaryPlus,
    // },
    {
      key: 'AdvancedKiroshiOpticsBareLegendaryPlus',
      name: 'Basic Kiroshi Optics',
      image: AdvancedKiroshiOpticsBareLegendaryPlus,
    },
    {
      key: 'AdvancedT1000LegendaryPlus',
      name: 'Para Bellum',
      image: AdvancedT1000LegendaryPlus,
    },
    {
      key: 'AdvancedEndoskeletonLegendaryPlus',
      name: 'Epimorphic Skeleton',
      image: AdvancedEndoskeletonLegendaryPlus,
    },
    {
      key: 'AdvancedBoneMarrowCellsLegendaryPlus',
      name: 'Kinetic Frame',
      image: AdvancedBoneMarrowCellsLegendaryPlus,
    },
    {
      key: 'AdvancedRapidMuscleNurishLegendaryPlus',
      name: 'Scarab',
      image: AdvancedRapidMuscleNurishLegendaryPlus,
    },
    {
      key: 'AdvancedTitaniumInfusedBonesLegendaryPlus',
      name: 'Titanium Bones',
      image: AdvancedTitaniumInfusedBonesLegendaryPlus,
    },
    {
      key: 'AdvancedPainDistributorLegendaryPlus',
      name: 'Universal Booster',
      image: AdvancedPainDistributorLegendaryPlus,
    },
    {
      key: 'AdvancedSmartLinkLegendaryPlus',
      name: 'Smart Link',
      image: AdvancedSmartLinkLegendaryPlus,
    },
    {
      key: 'AdvancedPowerGripLegendaryPlus',
      name: 'Ballistic Coprocessor',
      image: AdvancedPowerGripLegendaryPlus,
    },
    {
      key: 'AdvancedKnifeSharpenerLegendaryPlus',
      name: 'Handle Wrap',
      image: AdvancedKnifeSharpenerLegendaryPlus,
    },
    {
      key: 'AdvancedMicroGeneratorLegendaryPlus',
      name: 'Microgenerator',
      image: AdvancedMicroGeneratorLegendaryPlus,
    },
    {
      key: 'AdvancedJointLockLegendaryPlus',
      name: 'Shock Absorber',
      image: AdvancedJointLockLegendaryPlus,
    },
    {
      key: 'AdvancedNeoFiberLegendaryPlus',
      name: 'NeoFiber',
      image: AdvancedNeoFiberLegendaryPlus,
    },
    {
      key: 'AdvancedTyrosineInjectorLegendaryPlus',
      name: 'Tyrosine Injector',
      image: AdvancedTyrosineInjectorLegendaryPlus,
    },
    {
      key: 'AdvancedOilDispenserLegendaryPlus',
      name: 'Stabber',
      image: AdvancedOilDispenserLegendaryPlus,
    },
    {
      key: 'AdvancedCatchMeIfYouCanLegendaryPlus',
      name: 'ThreatEvac',
      image: AdvancedCatchMeIfYouCanLegendaryPlus,
    },
    {
      key: 'AdvancedSecondHeartLegendaryPlus',
      name: 'Second Heart',
      image: AdvancedSecondHeartLegendaryPlus,
    },
    {
      key: 'AdvancedCyberRotorsLegendaryPlus',
      name: 'Microrotors',
      image: AdvancedCyberRotorsLegendaryPlus,
    },
    {
      key: 'AdvancedHealOnKillLegendaryPlus',
      name: 'Heal-On-Kill',
      image: AdvancedHealOnKillLegendaryPlus,
    },
    {
      key: 'AdvancedDischargeConnectorLegendaryPlus',
      name: 'Feedback Circuit',
      image: AdvancedDischargeConnectorLegendaryPlus,
    },
    {
      key: 'AdvancedShockAbsorberLegendaryPlus',
      name: 'Clutch Padding',
      image: AdvancedShockAbsorberLegendaryPlus,
    },
    {
      key: 'AdvancedBloodPumpLegendaryPlus',
      name: 'Blood Pump',
      image: AdvancedBloodPumpLegendaryPlus,
    },
    {
      key: 'AdvancedBiomonitorLegendaryPlus',
      name: 'Biomonitor',
      image: AdvancedBiomonitorLegendaryPlus,
    },
    {
      key: 'AdvancedStaminaRegenBoosterLegendaryPlus',
      name: 'Adrenaline Booster',
      image: AdvancedStaminaRegenBoosterLegendaryPlus,
    },
    {
      key: 'AdvancedBoringPlatingLegendaryPlus',
      name: 'Subdermal Armor',
      image: AdvancedBoringPlatingLegendaryPlus,
    },
    {
      key: 'AdvancedElectroshockMechanismLegendaryPlus',
      name: 'Shock-n-Awe',
      image: AdvancedElectroshockMechanismLegendaryPlus,
    },
    {
      key: 'AdvancedChargeSystemLegendaryPlus',
      name: 'RangeGuard',
      image: AdvancedChargeSystemLegendaryPlus,
    },
    {
      key: 'AdvancedProximityReducerLegendaryPlus',
      name: 'ProxiShield',
      image: AdvancedProximityReducerLegendaryPlus,
    },
    {
      key: 'AdvancedBloodDepleterLegendaryPlus',
      name: 'Painducer',
      image: AdvancedBloodDepleterLegendaryPlus,
    },
    {
      key: 'AdvancedPainReductorLegendaryPlus',
      name: 'Pain Editor',
      image: AdvancedPainReductorLegendaryPlus,
    },
    {
      key: 'AdvancedWeirdTankyPlatingLegendaryPlus',
      name: 'Carapace',
      image: AdvancedWeirdTankyPlatingLegendaryPlus,
    },
    {
      key: 'AdvancedBoostedTendonsLegendaryPlus',
      name: 'Reinforced Tendons',
      image: AdvancedBoostedTendonsLegendaryPlus,
    },
    {
      key: 'AdvancedCatPawsLegendaryPlus',
      name: 'Lynx Paws',
      image: AdvancedCatPawsLegendaryPlus,
    },
    {
      key: 'AdvancedJenkinsTendonsLegendaryPlus',
      name: "Jenkins' Tendons",
      image: AdvancedJenkinsTendonsLegendaryPlus,
    },
    {
      key: 'AdvancedReinforcedMusclesLegendaryPlus',
      name: 'Fortified Ankles',
      image: AdvancedReinforcedMusclesLegendaryPlus,
    },
    {
      key: 'AdvancedBerserkC3MK5Plus',
      name: 'Zetatech Berserk',
      image: AdvancedBerserkC3MK5Plus,
    },
    {
      key: 'AdvancedBerserkC1MK4Plus',
      name: 'Moore Tech Berserk',
      image: AdvancedBerserkC1MK4Plus,
    },
    {
      key: 'AdvancedBerserkC4MK5Plus',
      name: 'Militech Berserk',
      image: AdvancedBerserkC4MK5Plus,
    },
    {
      key: 'AdvancedBerserkC2MK4Plus',
      name: 'BioDyne Berserk',
      image: AdvancedBerserkC2MK4Plus,
    },
  ],
  [ItemCategory.CLOTHES]: [
    {
      key: 'Cap_03_old_01',
      name: 'Worn beanie',
      image: Cap_03_old_01,
    },
    {
      key: 'Hat_04_basic_02',
      name: 'Carbon-fiber conical hat',
      image: Hat_04_basic_02,
    },
    {
      key: 'Hat_01_basic_01',
      name: 'Classic trilby with composite band',
      image: Hat_01_basic_01,
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
      key: 'TShirt_03_basic_01',
      name: 'Extra-sturdy Deadly Lagoon tank top',
      image: TShirt_03_basic_01,
    },
    {
      key: 'TShirt_04_old_01',
      name: 'High-tensile cutout tank',
      image: TShirt_04_old_01,
    },
    {
      key: 'TShirt_05_old_05',
      name: 'Torn sturdimesh T-shirt',
      image: TShirt_05_old_05,
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
    <AbilityOverlay action="use" subject="ItemsSpawner">
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
    </AbilityOverlay>
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
