import { eagerRegistry } from '@freeroam/inversify';
import { container } from './container';
import { ChatModule } from './modules/chat/chat.module';
import { ChatService } from './modules/chat/chat.service';
import { LoggerMiddleware } from './modules/logger/logger.middleware';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerService } from './modules/logger/logger.service';
import { mp } from './mp';
import { client, r, rpc } from './rpc';
import { router } from './rpc/router';

const modules = [LoggerModule, ChatModule];

const coopWhen = async () => {
  try {
    r.apply(router);

    await container.load(...modules);

    const loggerMiddleware = container.get(LoggerMiddleware).middleware;
    rpc.use(loggerMiddleware);

    const loggerService = container.get(LoggerService);

    for (const constructorValue of eagerRegistry.values()) {
      const classId = constructorValue.name.replace('$1', '');

      const start = Date.now();

      await container.getAsync(constructorValue);

      loggerService.ready(`${classId} - ${Date.now() - start}ms`);
    }

    mp.events.on('resourceStop', () => {
      console.log('Destroying server');
      container.unloadSync(...modules);
    });

    loggerService.success('Server initialized');
  } catch (e) {
    console.log('Failed to initialize server: ', e);
  }

  const chatService = container.get(ChatService);
  chatService.addCommand({
    name: 'test-vehicle',
    handler(player) {
      const newVehicle = mp.vehicles.create({
        position: player.position,
        model: mp.hashes.tweakdbid(
          'Vehicle.v_sport1_rayfield_caliburn_mordred_player',
        ),
        appearance: mp.hashes.cname('rayfield_caliburn__basic_mordred'),
      });

      client.game.vehicles.requestSitInVehicle.trigger(player, newVehicle.id);
    },
  });

  // mp.commands.add('test-vehicle', (player) => {

  // });

  // mp.events.on('playerDisconnected', (p) => {
  //   const player = mp.players.at(p);

  //   console.log(player.position);
  // });

  // mp.commands.add('fix-current-veh', (player) => {
  //   client.game.vehicles.fixCurrentVehicle.trigger(player);
  // });
};

void coopWhen();
