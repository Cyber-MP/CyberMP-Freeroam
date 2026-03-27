import type {
  entEntity,
  inkTextWidget,
  Vector3,
  Vector4,
} from '@cybermp/client-types/game';
import { mp } from '../../mp';

const REFERENCE_WIDTH = 1920;

export type EntityLabelFactory = () => EntityLabel;

export const EntityLabelFactorySymbol = Symbol.for('EntityLabelFactorySymbol');

export class EntityLabel {
  protected widget!: inkTextWidget;
  protected fontSize!: number;
  public text!: string;
  entity!: entEntity;

  create(entity: entEntity, initialText: string, fontSize = 17) {
    this.entity = entity;
    this.text = initialText;
    this.fontSize = fontSize;
    this.widget = new mp.game.inkTextWidget();
    this.setup();
  }

  private setup() {
    const [width] = mp.game.getDisplayResolution();
    const fontSize = this.fontSize * (width / REFERENCE_WIDTH);

    const inkSystem = mp.game.ScriptGameInstance.GetInkSystem();
    const hudRoot = inkSystem.GetLayer('inkHUDLayer').GetVirtualWindow();

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
    this.widget.Reparent(hudRoot);
  }

  public getText(): string {
    return this.text;
  }

  getMaxDistance() {
    return 10;
  }

  public getPosition(): Vector4 {
    return this.entity.GetWorldPosition();
  }

  public update(screenPos: Vector3, scale: number, alpha: number) {
    const content = this.getText();
    this.widget.SetText(content);

    const centeringX = (content.length * (this.fontSize / 2) * scale) / 2;

    this.widget.SetTranslation({ x: screenPos.x - centeringX, y: screenPos.y });
    this.widget.SetScale({ x: scale, y: scale });
    this.widget.SetOpacity(alpha);
    this.widget.SetVisible(true);
  }

  public hide() {
    this.widget.SetVisible(false);
  }

  public destroy() {
    this.hide();
  }
}
