import { injectable } from 'inversify';
import { mp } from '../../mp';

@injectable()
export class GPlayerService {
  invisible(value: boolean) {
    for (const component of mp.game.GetPlayer().GetComponents()) {
      if (!component.IsA('entIVisualComponent')) {
        continue;
      }

      component.Toggle(!value);
    }
  }
}
