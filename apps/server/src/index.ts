import { mp } from './mp';
import { router } from './router';
import { client, r } from './rpc';

const bootstrap = () => {
  r.apply(router);

  mp.commands.add('test-vehicle', (player) => {
    mp.vehicles.create({
      dimension: player.dimension,
      position: player.position,
      model: mp.hashes.tweakdbid(
        'Vehicle.v_sport1_rayfield_caliburn_mordred_player',
      ),
      appearance: mp.hashes.cname('rayfield_caliburn__basic_mordred'),
    });
  });

  mp.commands.add('fix-current-veh', (player) => {
    client.game.vehicles.fixCurrentVehicle.trigger(player);
  });
};

void bootstrap();
