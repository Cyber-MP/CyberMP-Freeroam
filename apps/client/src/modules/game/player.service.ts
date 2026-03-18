import { injectable } from 'inversify';

@injectable()
export class GPlayerService {
  invisible(value: boolean) {
    // TODO: uncomment this function and redo since if we do invisible(false) it would turn on components light flashlight and etc which we dont want player to see
    // for (const component of mp.game.GetPlayer().GetComponents()) {
    //   if (!component.IsA('entIVisualComponent')) {
    //     continue;
    //   }
    //   component.Toggle(!value);
    // }
  }
}
