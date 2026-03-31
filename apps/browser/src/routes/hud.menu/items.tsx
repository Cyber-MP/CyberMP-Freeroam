import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { isHotkeyPressed } from 'react-hotkeys-hook';
import Q005_Johnny_Glasses from '#/images/clothes/Q005_Johnny_Glasses.webp?w=300&h=300&imagetools';
import Q005_Johnny_Pants from '#/images/clothes/Q005_Johnny_Pants.webp?w=300&h=300&imagetools';
import Q005_Johnny_Shirt from '#/images/clothes/Q005_Johnny_Shirt.webp?w=300&h=300&imagetools';
import Q005_Johnny_Shoes from '#/images/clothes/Q005_Johnny_Shoes.webp?w=300&h=300&imagetools';
import Q303_mask_h1 from '#/images/clothes/Q303_mask_h1.webp?w=300&h=300&imagetools';
import SQ031_Samurai_Jacket from '#/images/clothes/SQ031_Samurai_Jacket.webp?w=300&h=300&imagetools';
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
import AdvancedBoringPlatingLegendaryPlusPlus from '#/images/implants/AdvancedBoringPlatingLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedNetwatchNetdriverMKLegendaryPlusPlus from '#/images/implants/AdvancedNetwatchNetdriverMKLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import AdvancedTimeBankLegendaryPlusPlus from '#/images/implants/AdvancedTimeBankLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import CapacityBoosterLegendaryPlusPlus from '#/images/implants/CapacityBoosterLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import HauntedCyberdeck_LegendaryPlusPlus from '#/images/implants/HauntedCyberdeck_LegendaryPlusPlus.webp?w=300&h=300&imagetools';
import Iconic_AdvancedKiroshiOpticsBareLegendaryPlusPlus from '#/images/implants/Iconic_AdvancedKiroshiOpticsBareLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedDetectorRushLegendaryPlusPlus from '#/images/implants/IconicAdvancedDetectorRushLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedProximityReducerLegendaryPlusPlus from '#/images/implants/IconicAdvancedProximityReducerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedReflexRecorderLegendaryPlusPlus from '#/images/implants/IconicAdvancedReflexRecorderLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedSubdermalCoProcessorLegendaryPlusPlus from '#/images/implants/IconicAdvancedSubdermalCoProcessorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedT1000LegendaryPlusPlus from '#/images/implants/IconicAdvancedT1000LegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicAdvancedVisualCortexSupportLegendaryPlusPlus from '#/images/implants/IconicAdvancedVisualCortexSupportLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicBioConductorsLegendaryPlusPlus from '#/images/implants/IconicBioConductorsLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicCamilloRamManagerLegendaryPlusPlus from '#/images/implants/IconicCamilloRamManagerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicDischargeConnectorLegendaryPlusPlus from '#/images/implants/IconicDischargeConnectorLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicGunStabilizerLegendaryPlusPlus from '#/images/implants/IconicGunStabilizerLegendaryPlusPlus.webp?w=300&h=300&imagetools';
import IconicJenkinsTendonsPlusPlus from '#/images/implants/IconicJenkinsTendonsPlusPlus.webp?w=300&h=300&imagetools';
import IconicShockAbsorberLegendaryPlusPlus from '#/images/implants/IconicShockAbsorberLegendaryPlusPlus.webp?w=300&h=300&imagetools';
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
import { type ClientInputs, client } from '@/rpc';
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

interface Item {
  key: ClientInputs['itemSpawner']['spawnItem'];
  name: string;
  image: string;
}

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
      key: 'IconicAdvancedSubdermalCoProcessorLegendaryPlusPlus',
      name: 'Axolotl',
      image: IconicAdvancedSubdermalCoProcessorLegendaryPlusPlus,
    },
    {
      key: 'IconicBioConductorsLegendaryPlusPlus',
      name: 'COX-2 Cybersomatic Optimizer',
      image: IconicBioConductorsLegendaryPlusPlus,
    },
    {
      key: 'AdvancedTimeBankLegendaryPlusPlus',
      name: 'Quantum Tuner',
      image: AdvancedTimeBankLegendaryPlusPlus,
    },
    {
      key: 'IconicCamilloRamManagerLegendaryPlusPlus',
      name: 'RAM Reallocator',
      image: IconicCamilloRamManagerLegendaryPlusPlus,
    },
    {
      key: 'CapacityBoosterLegendaryPlusPlus',
      name: 'Chrome Compressor',
      image: CapacityBoosterLegendaryPlusPlus,
    },
    {
      key: 'HauntedCyberdeck_LegendaryPlusPlus',
      name: 'Militech Canto',
      image: HauntedCyberdeck_LegendaryPlusPlus,
    },
    {
      key: 'AdvancedNetwatchNetdriverMKLegendaryPlusPlus',
      name: 'NetWatch Netdriver',
      image: AdvancedNetwatchNetdriverMKLegendaryPlusPlus,
    },
    {
      key: 'Iconic_AdvancedKiroshiOpticsBareLegendaryPlusPlus',
      name: 'Kiroshi "Cockatrice" Optics',
      image: Iconic_AdvancedKiroshiOpticsBareLegendaryPlusPlus,
    },
    {
      key: 'IconicAdvancedT1000LegendaryPlusPlus',
      name: 'Rara Avis',
      image: IconicAdvancedT1000LegendaryPlusPlus,
    },
    {
      key: 'IconicGunStabilizerLegendaryPlusPlus',
      name: 'Immovable Force',
      image: IconicGunStabilizerLegendaryPlusPlus,
    },
    {
      key: 'IconicAdvancedDetectorRushLegendaryPlusPlus',
      name: 'Adreno-trigger',
      image: IconicAdvancedDetectorRushLegendaryPlusPlus,
    },
    {
      key: 'IconicAdvancedVisualCortexSupportLegendaryPlusPlus',
      name: 'Deep-field Visual Interface',
      image: IconicAdvancedVisualCortexSupportLegendaryPlusPlus,
    },
    {
      key: 'IconicAdvancedReflexRecorderLegendaryPlusPlus',
      name: 'Revulsor',
      image: IconicAdvancedReflexRecorderLegendaryPlusPlus,
    },
    {
      key: 'IconicDischargeConnectorLegendaryPlusPlus',
      name: 'Electromag Recycler',
      image: IconicDischargeConnectorLegendaryPlusPlus,
    },
    {
      key: 'IconicShockAbsorberLegendaryPlusPlus',
      name: 'Isometric Stabilizer',
      image: IconicShockAbsorberLegendaryPlusPlus,
    },
    {
      key: 'AdvancedBoringPlatingLegendaryPlusPlus',
      name: 'Chitin',
      image: AdvancedBoringPlatingLegendaryPlusPlus,
    },
    {
      key: 'IconicAdvancedProximityReducerLegendaryPlusPlus',
      name: 'Peripheral Inverse',
      image: IconicAdvancedProximityReducerLegendaryPlusPlus,
    },
    {
      key: 'IconicJenkinsTendonsPlusPlus',
      name: 'Leeroy Ligament System',
      image: IconicJenkinsTendonsPlusPlus,
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

function ItemsContent<const T extends ItemCategory>({ value }: { value: T }) {
  const navigate = useNavigate();

  const spawnItem = (key: Item['key']) => {
    client.itemSpawner.spawnItem.trigger(key);

    if (!isHotkeyPressed('shift')) {
      navigate({ to: '/hud' });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {DATA[value].map((item) => (
        <div
          key={item.key}
          className="flex flex-col justify-center items-center w-full bg-[#85858520] hover:bg-[#85858540] transition-colors duration-150 group cursor-pointer border-2 border-transparent hover:border-primary"
          onClick={() => spawnItem(item.key)}
        >
          <img
            src={item.image}
            alt="Item"
            className="h-40 w-80 object-contain group-hover:drop-shadow-[0_0_25px_#FFFB4580]"
            draggable={false}
          />

          <span className="text-[#aaa] group-hover:text-white bg-muted w-full text-center">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
