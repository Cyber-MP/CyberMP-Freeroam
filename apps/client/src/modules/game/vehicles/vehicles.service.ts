import * as CyberEnums from '@cybermp/client-types/enums';
import type { vehicleBaseObject } from '@cybermp/client-types/game';
import { injectable } from 'inversify';
import { mp } from '../../../mp';

type RequestSitInVehicleOptions = {
  instant?: boolean;
  slot?: string;
};

@injectable()
export class GVehiclesService {
  requestSitInVehicle(
    vehicleNetId: number,
    options?: RequestSitInVehicleOptions,
  ) {
    const { instant = true, slot = 'seat_front_left' } = options ?? {};

    const onVehicleStreamIn = (netId: number, hash: number) => {
      if (netId !== vehicleNetId) {
        return;
      }

      const entityID = new mp.game.entEntityID();
      entityID.hash = hash;
      const entity = mp.game.ScriptGameInstance.FindEntityByID(entityID);
      if (!entity) {
        return;
      }

      const data = new mp.game.gameMountEventData();
      data.isInstant = instant;
      data.slotName = slot;
      data.mountParentEntityId = entity.GetEntityID();
      data.entryAnimName = 'forcedTransition';

      const slotID = new mp.game.gamemountingMountingSlotId();
      slotID.id = slot;

      const mountingInfo = new mp.game.gamemountingMountingInfo();
      mountingInfo.childId = mp.game.GetPlayer().GetEntityID();
      mountingInfo.parentId = entity.GetEntityID();
      mountingInfo.slotId = slotID;

      const mountEvent = new mp.game.gamemountingMountingRequest();
      mountEvent.lowLevelMountingInfo = mountingInfo;
      mountEvent.mountData = data;
      mp.game.ScriptGameInstance.GetMountingFacility().Mount(mountEvent);

      mp.events.off('onVehicleStreamIn', onVehicleStreamIn);
    };

    mp.events.on('onVehicleStreamIn', onVehicleStreamIn);
  }

  requestLeaveVehicle() {
    const vehicle = mp.game.GetMountedVehicle(mp.game.GetPlayerObject());
    if (!vehicle) {
      return;
    }

    const slot = vehicle.GetSlotIdForMountedObject(mp.game.GetPlayerObject());

    const data = new mp.game.gameMountEventData();
    data.isInstant = true;
    data.slotName = slot;
    data.mountParentEntityId = vehicle.GetEntityID();
    data.entryAnimName = 'forcedTransition';

    const slotID = new mp.game.gamemountingMountingSlotId();
    slotID.id = slot;

    const mountingInfo = new mp.game.gamemountingMountingInfo();
    mountingInfo.childId = mp.game.GetPlayer().GetEntityID();
    mountingInfo.parentId = vehicle.GetEntityID();
    mountingInfo.slotId = slotID;

    const mountEvent = new mp.game.gamemountingUnmountingRequest();
    mountEvent.lowLevelMountingInfo = mountingInfo;
    mountEvent.mountData = data;
    mp.game.ScriptGameInstance.GetMountingFacility().Unmount(mountEvent);
  }

  private fixVehicle(vehicle: vehicleBaseObject) {
    if (!vehicle) {
      return;
    }
    const ps = vehicle.GetVehiclePS();
    const comp = vehicle.GetVehicleComponent();
    const vehType = vehicle.GetVehicleType();

    if (vehType !== CyberEnums.gamedataVehicleType.Bike) {
      comp.bumperFrontState = 0;
      comp.bumperBackState = 0;

      const parts = [
        'hood_destruction',
        'wheel_f_l_destruction',
        'wheel_f_r_destruction',
        'bumper_b_destruction',
        'bumper_f_destruction',
        'door_f_l_destruction',
        'door_f_r_destruction',
        'trunk_destruction',
        'bumper_b_destruction_side_2',
        'bumper_f_destruction_side_2',
      ];

      for (const part of parts) {
        mp.game.entAnimationControllerComponent.SetInputFloat(
          vehicle,
          part,
          0.0,
        );
      }
    }

    comp.damageLevel = 0;

    const flatTires = (vehicle as any).GetFlatTireIndex();
    if (flatTires >= 0) {
      for (let i = 0; i < 4; i++) {
        (vehicle as any).ToggleBrokenTire(i, false);
      }
    }

    vehicle.DestructionResetGrid();
    vehicle.DestructionResetGlass();
    comp.UpdateDamageEngineEffects();
    comp.RepairVehicle();
    comp.VehicleVisualDestructionSetup();
    ps.CloseAllVehDoors(true);
    ps.CloseAllVehWindows();
    ps.ForcePersistentStateChanged();
  }

  fixCurrentVehicle() {
    const vehicle = mp.game.GetMountedVehicle(mp.game.GetPlayerObject());

    this.fixVehicle(vehicle);
  }
}
