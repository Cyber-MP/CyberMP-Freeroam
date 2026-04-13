import { RpcApplyType } from '@cybermp/rpc-browser';
import ms from 'ms';
import { toast } from 'sonner';
import z from 'zod';
import { r } from './rpc';

const TOAST_MAP = {
  default: toast,
  warning: toast.warning,
  success: toast.success,
  error: toast.error,
  info: toast.info,
};

export const toastContract = r.procedure
  .method(RpcApplyType.REGISTER)
  .input(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z
        .literal(['default', 'success', 'error', 'warning', 'info'])
        .default('default'),
      duration: z.number().default(ms('7s')),
      position: z
        .literal([
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
          'top-center',
          'bottom-center',
        ])
        .default('top-center'),
    }),
  )
  .output(z.any())
  .handler((c) => {
    TOAST_MAP[c.data.type](c.data.title, {
      duration: c.data.duration,
      description: c.data.description,
      position: c.data.position,
    });
  });
