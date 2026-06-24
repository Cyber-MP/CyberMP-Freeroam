import { RpcClient, RpcPacketType } from '@cybermp/rpc-client';

export const rpc = new RpcClient({ name: 'freeroam' });

rpc.interceptors.request.use((packet) => {
  if (packet.method === RpcPacketType.CALL) {
    console.log(packet);
  }

  return packet;
});
