import { mp } from './mp';
import { client, r } from './rpc';
import { router } from './rpc/router';

const bootstrap = () => {
  r.apply(router);

  mp.commands.add('test-vehicle', (player) => {
    const newVehicle = mp.vehicles.create({
      position: player.position,
      model: mp.hashes.tweakdbid(
        'Vehicle.v_sport1_rayfield_caliburn_mordred_player',
      ),
      appearance: mp.hashes.cname('rayfield_caliburn__basic_mordred'),
    });

    client.game.vehicles.requestSitInVehicle.trigger(player, newVehicle.id);
  });

  mp.events.on('playerDisconnected', (p) => {
    const player = mp.players.at(p);

    console.log(player.position);
  });

  mp.commands.add('fix-current-veh', (player) => {
    client.game.vehicles.fixCurrentVehicle.trigger(player);
  });
};

void bootstrap();
