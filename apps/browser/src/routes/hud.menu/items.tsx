import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { isHotkeyPressed } from 'react-hotkeys-hook';
import GrenadeOzobsNose from '#/images/consumables/GrenadeOzobsNose.webp?w=300&h=300&fit=contain&imagetools';
import Legendary_Zhuo_Eight_Star from '#/images/weapons/Legendary_Zhuo_Eight_Star.webp?w=300&h=150&imagetools';
import Preset_Achilles_Collectible from '#/images/weapons/Preset_Achilles_Collectible.webp?w=300&h=150&imagetools';
import Preset_Ajax_Amazon from '#/images/weapons/Preset_Ajax_Amazon.webp?w=300&h=150&imagetools';
import Preset_Baseball_Bat_Malina from '#/images/weapons/Preset_Baseball_Bat_Malina.webp?w=300&h=150&imagetools';
import Preset_Baton_Murphy from '#/images/weapons/Preset_Baton_Murphy.webp?w=300&h=150&imagetools';
import Preset_Carnage_Edgerunners from '#/images/weapons/Preset_Carnage_Edgerunners.webp?w=300&h=150&imagetools';
import Preset_Crusher_Amazon from '#/images/weapons/Preset_Crusher_Amazon.webp?w=300&h=150&imagetools';
import Preset_Dian_Yinglong from '#/images/weapons/Preset_Dian_Yinglong.webp?w=300&h=150&imagetools';
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
  ],
  [ItemCategory.CONSUMABLES]: [
    {
      key: 'GrenadeOzobsNose',
      name: "Ozob's Nose",
      image: GrenadeOzobsNose,
    },
  ],
  [ItemCategory.IMPLANTS]: [],
  [ItemCategory.CLOTHES]: [],
};

function RouteComponent() {
  return (
    <div className="flex justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      <Tabs defaultValue={ItemCategory.WEAPONS} className="w-full pb-4">
        <TabsList className="sticky top-0">
          <TabsTrigger value={ItemCategory.WEAPONS}>Weapons</TabsTrigger>
          <TabsTrigger value={ItemCategory.CLOTHES}>Clothes</TabsTrigger>
          <TabsTrigger value={ItemCategory.CONSUMABLES}>
            Consumables
          </TabsTrigger>
          <TabsTrigger value={ItemCategory.IMPLANTS}>Implants</TabsTrigger>
        </TabsList>
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
            alt="Vehicle"
            className="h-40 w-80"
            draggable={false}
          />
          <span className="text-[#aaa] group-hover:text-white">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
