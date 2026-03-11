import * as CyberEnums from '@cybermp/client-types/enums';
import { procedure } from '@cybermp/rpc-router/server';

type RequestSitInVehicleOptions = {
  instant: boolean;
  slot: string;
};

export class VehiclesController {
  requestSitInVehicle(
    vehicleNetId: number,
    options?: Partial<RequestSitInVehicleOptions>,
  ) {
    const { instant = true, slot = 'seat_front_left' } = options ?? {};

    const onVehicleStreamIn = (netId: number, hash: number) => {
      if (netId !== vehicleNetId) {
        return;
      }

      const entityID = new mpClient.game.entEntityID();
      entityID.hash = hash;
      const entity = mpClient.game.ScriptGameInstance.FindEntityByID(entityID);
      if (!entity) {
        return;
      }

      const data = new mpClient.game.gameMountEventData();
      data.isInstant = instant;
      data.slotName = slot;
      data.mountParentEntityId = entity.GetEntityID();
      data.entryAnimName = 'forcedTransition';

      const slotID = new mpClient.game.gamemountingMountingSlotId();
      slotID.id = slot;

      const mountingInfo = new mpClient.game.gamemountingMountingInfo();
      mountingInfo.childId = mpClient.game.GetPlayer().GetEntityID();
      mountingInfo.parentId = entity.GetEntityID();
      mountingInfo.slotId = slotID;

      const mountEvent = new mpClient.game.gamemountingMountingRequest();
      mountEvent.lowLevelMountingInfo = mountingInfo;
      mountEvent.mountData = data;
      mpClient.game.ScriptGameInstance.GetMountingFacility().Mount(mountEvent);

      mpClient.events.off('onVehicleStreamIn', onVehicleStreamIn);
    };

    mpClient.events.on('onVehicleStreamIn', onVehicleStreamIn);
  }

  requestLeaveVehicle() {
    const vehicle = mpClient.game.GetMountedVehicle(
      mpClient.game.GetPlayerObject(),
    );
    if (!vehicle) {
      return;
    }

    const slot = vehicle.GetSlotIdForMountedObject(
      mpClient.game.GetPlayerObject(),
    );

    const data = new mpClient.game.gameMountEventData();
    data.isInstant = true;
    data.slotName = slot;
    data.mountParentEntityId = vehicle.GetEntityID();
    data.entryAnimName = 'forcedTransition';

    const slotID = new mpClient.game.gamemountingMountingSlotId();
    slotID.id = slot;

    const mountingInfo = new mpClient.game.gamemountingMountingInfo();
    mountingInfo.childId = mpClient.game.GetPlayer().GetEntityID();
    mountingInfo.parentId = vehicle.GetEntityID();
    mountingInfo.slotId = slotID;

    const mountEvent = new mpClient.game.gamemountingUnmountingRequest();
    mountEvent.lowLevelMountingInfo = mountingInfo;
    mountEvent.mountData = data;
    mpClient.game.ScriptGameInstance.GetMountingFacility().Unmount(mountEvent);
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
        mpClient.game.entAnimationControllerComponent.SetInputFloat(
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
    const vehicle = mpClient.game.GetMountedVehicle(
      mpClient.game.GetPlayerObject(),
    );

    this.fixVehicle(vehicle);
  }
}

export const vehiclesController = new VehiclesController();

export const vehiclesContract = {
  fixCurrentVehicle: procedure.handler(() => {
    vehiclesController.fixCurrentVehicle();
  }),
};
