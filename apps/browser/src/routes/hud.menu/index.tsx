import { createFileRoute, useNavigate } from '@tanstack/react-router';
import aeroImg from '#/images/vehicles/aero.webp?w=300&h=150&imagetools';
import alvaradoImg from '#/images/vehicles/alvarado.webp?w=300&h=150&imagetools';
import archerImg from '#/images/vehicles/archer.webp?w=300&h=150&imagetools';
import avengerImg from '#/images/vehicles/avenger.png?w=300&h=150&imagetools';
import beastImg from '#/images/vehicles/beast.webp?w=300&h=150&imagetools';
import bikeImg from '#/images/vehicles/bike.webp?w=300&h=150&imagetools';
import butteImg from '#/images/vehicles/butte.webp?w=300&h=150&imagetools';
import caliburnImg from '#/images/vehicles/caliburn.webp?w=300&h=150&imagetools';
import chevalierImg from '#/images/vehicles/chevalier.webp?w=300&h=150&imagetools';
import colbyImg from '#/images/vehicles/colby.webp?w=300&h=150&imagetools';
import delamainImg from '#/images/vehicles/delamain.jpg?w=300&h=150&imagetools';
import herreraImg from '#/images/vehicles/herrera.webp?w=300&h=150&imagetools';
import mahirImg from '#/images/vehicles/mahir.webp?w=300&h=150&imagetools';
import mordredImg from '#/images/vehicles/mordred.webp?w=300&h=150&imagetools';
import nazareImg from '#/images/vehicles/nazare.jpg?w=300&h=150&imagetools';
import policeImg from '#/images/vehicles/police.jpg?w=300&h=150&imagetools';
import porscheImg from '#/images/vehicles/porsche.webp?w=300&h=150&imagetools';
import porsche911Img from '#/images/vehicles/porsche911.webp?w=300&h=150&imagetools';
import quadraImg from '#/images/vehicles/quadra.webp?w=300&h=150&imagetools';
import shionImg from '#/images/vehicles/shion.webp?w=300&h=150&imagetools';
import type66Img from '#/images/vehicles/type66.webp?w=300&h=150&imagetools';
import yaibaImg from '#/images/vehicles/yaiba.webp?w=300&h=150&imagetools';
import { withDisabledDuringMatch } from '@/hocs/with-disabled-during-match';
import { type ServerInputs, server } from '@/rpc';

//import hellhoundImg from "#/images/vehicles/hellhound.png?w=300&h=150&imagetools";

type VehicleInfo = {
  key: ServerInputs['vehiclesSpawner']['spawnVehicle'];
  name: string;
  image?: any;
};

type VehicleKey = ServerInputs['vehiclesSpawner']['spawnVehicle'];

const VehiclesInfo: VehicleInfo[] = [
  {
    key: 'herrera',
    name: 'Herrera Outlaw “Weiler”',
    image: herreraImg,
  },
  {
    key: 'archer',
    name: 'Archer Quartz Ec-L R275',
    image: archerImg,
  },
  {
    key: 'mahir',
    name: 'Mahir Supron “Trailbruiser”',
    image: mahirImg,
  },
  {
    key: 'beast',
    name: 'Thorton Mackinaw "Beast"',
    image: beastImg,
  },
  {
    key: 'chevalier',
    name: 'Chevillion Emperor 620 Ragnar',
    image: chevalierImg,
  },
  {
    key: 'aero',
    name: 'Rayfield Aerondight "Guinevere"',
    image: aeroImg,
  },
  {
    key: 'quadra',
    name: 'Quadra Type-66',
    image: quadraImg,
  },
  {
    key: 'bike',
    name: 'Yaiba Kusanagi Ct-3x',
    image: bikeImg,
  },
  {
    key: 'type66',
    name: 'Quadra Type-66 "Javelina"',
    image: type66Img,
  },
  // {
  //   key: "sidewinter",
  //   name: "Archer Quartz “Sidewinder”",
  //   image: sidewinderImg,
  // },
  // {
  //   key: "locust",
  //   name: 'Thorton Galena "Locust"',
  //   image: locustImg,
  // },
  {
    key: 'colby',
    name: 'Thorton Colby "Little Mule"',
    image: colbyImg,
  },
  {
    key: 'shion',
    name: 'Mizutani Shion "Bonewrecker"',
    image: shionImg,
  },
  {
    key: 'mordred',
    name: 'Rayfield Caliburn "Mordred"',
    image: mordredImg,
  },
  {
    key: 'caliburn',
    name: 'Rayfield Caliburn',
    image: caliburnImg,
  },
  {
    key: 'porsche',
    name: 'Porsche 911 Turbo Cabriolet',
    image: porscheImg,
  },

  {
    key: 'porsche911',
    name: 'Porsche 911 Turbo',
    image: porsche911Img,
  },
  {
    key: 'yaiba',
    name: 'Yaiba ARV-Q340 Semimaru',
    image: yaibaImg,
  },
  {
    key: 'alvarado',
    name: 'Villefort Alvarado "Vato"',
    image: alvaradoImg,
  },
  // {
  //   key: "thorton",
  //   name: 'Thorton Mackinaw "Demiurge"',
  //   image: thortonImg,
  // },
  {
    key: 'butte',
    name: 'Thorton Colby CX410 Butte',
    image: butteImg,
  },
  {
    key: 'nazare',
    name: 'Arch Nazare "Itsumade"',
    image: nazareImg,
  },
  // {
  //   key: "terrier",
  //   name: "Shion Mz2",
  //   image: terrierImg,
  // },
  {
    key: 'avenger',
    name: 'Type-66 Avenger',
    image: avengerImg,
  },
  {
    key: 'delamain',
    name: 'Villefort Cortes Delamain No.21',
    image: delamainImg,
  },
  // {
  //   key: "kamaz",
  //   name: 'Kaukaz Bratsk',
  //   image: kamazImg,
  // },
  // {
  //   key: "begemot",
  //   name: 'Militech behemoth',
  //   image: begemotImg,
  // },
  {
    key: 'police',
    name: 'Police Vehicle',
    image: policeImg,
  },
  // {
  //   key: "hellhound",
  //   name: 'Militech Hellhounde',
  //   image: hellhoundImg,
  // },
  // {
  //   key: "av_maxtac",
  //   name: "Maxtac AV",
  //   image: avMaxtacImg,
  // },
  // {
  //   key: "av_rayfield",
  //   name: "Rayfield AV",
  //   image: avRayfieldImg,
  // },
  // {
  //   key: "av_trauma",
  //   name: "Trauma team AV",
  //   image: avTraumaImg,
  // },
  // {
  //   key: "av_militech",
  //   name: "Militech AV",
  //   image: avMilitechImg,
  // },
  // {
  //   key: "heli_1",
  //   name: "Helicopter 1",
  //   image: heli1Img,
  // },
  // {
  //   key: "heli_2",
  //   name: "Helicopter 2",
  //   image: heli2Img,
  // },
];

export const Route = createFileRoute('/hud/menu/')({
  component: withDisabledDuringMatch(RouteComponent),
});

function RouteComponent() {
  const navigate = useNavigate();

  const close = () => {
    navigate({ to: '/hud' });
  };

  const spawnVehicle = (key: VehicleKey) => {
    server.vehiclesSpawner.spawnVehicle.trigger(key);
    close();
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-12 gap-x-24 h-full w-full">
      {VehiclesInfo.map((vehicle, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: vehicles data is static
          key={index}
          onClick={() => spawnVehicle(vehicle.key)}
          className="group flex cursor-pointer flex-col items-center gap-y-2.5"
        >
          <img
            src={vehicle.image}
            alt="Vehicle"
            className="h-40 w-80 border-2 border-transparent object-cover transition-colors duration-300 group-hover:border-primary"
          />

          <span className="text-sm font-semibold text-muted-foreground transition-colors group-hover:text-primary">
            {vehicle.name}
          </span>
        </div>
      ))}
    </div>
  );
}
