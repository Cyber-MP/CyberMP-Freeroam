import { server } from './rpc/server';

console.log('Hello world from client');

mp.events.addCommand('ping-server', async () => {
  const result = await server.ping.call('TEST CLIENT DATA');

  console.log('server result:', result);
});
