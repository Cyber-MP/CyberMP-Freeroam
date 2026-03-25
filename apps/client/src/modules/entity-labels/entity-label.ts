import type {
  entEntity,
  inkTextWidget,
  Vector3,
  Vector4,
} from '@cybermp/client-types/game';
import { throttle } from 'radash';
import { mp } from '../../mp';

const REFERENCE_WIDTH = 1920;

const throttleLog = throttle({ interval: 4000 }, (...ags: any) => {
  console.log(...ags);
});

export class EntityLabel {
  protected widget: inkTextWidget;
  public text: string;

  constructor(
    public entity: entEntity,
    initialText: string = '',
    protected fontSize = 17,
  ) {
    this.text = initialText;
    this.widget = new mp.game.inkTextWidget();
    this.setup();
  }

  private setup() {
    const [width] = mp.game.getDisplayResolution();
    const fontSize = this.fontSize * (width / REFERENCE_WIDTH);

    this.widget.SetName(`label_${this.entity.GetEntityID().hash}`);
    this.widget.SetFontFamily(
      'base\\gameplay\\gui\\fonts\\arial\\arial.inkfontfamily',
    );
    this.widget.SetFontSize(fontSize);
    this.widget.SetStyle(
      mp.game.redResourceReferenceScriptToken.FromName(
        'base\\gameplay\\gui\\common\\main_colors.inkstyle',
      ),
    );

    this.widget.BindProperty('tintColor', 'MainColors.ActiveWhite');
    this.widget.SetVisible(true);

    const inkSystem = mp.game.ScriptGameInstance.GetInkSystem();
    const hudRoot = inkSystem.GetLayer('inkHUDLayer').GetVirtualWindow();
    this.widget.Reparent(hudRoot);
  }

  public getText(): string {
    return this.text;
  }

  getMaxDistance() {
    return 15;
  }

  public getPosition(): Vector4 {
    return this.entity.GetWorldPosition();
  }

  public update(screenPos: Vector3, scale: number, alpha: number) {
    const content = this.getText();
    this.widget.SetText(content);

    const centeringX = (content.length * (this.fontSize / 2) * scale) / 2;

    this.widget.SetTranslation(screenPos.x - centeringX, screenPos.y);
    this.widget.SetScale({ x: scale, y: scale });
    this.widget.SetOpacity(alpha);
    this.widget.SetVisible(true);
    throttleLog('updated', content, alpha, scale, screenPos);
  }

  public hide() {
    this.widget.SetVisible(false);
  }

  public destroy() {
    this.hide();
  }
}
