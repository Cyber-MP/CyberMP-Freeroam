import { eager } from '@freeroam/inversify';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { ChatService } from '../chat/chat.service';
import {
  type Mapping,
  type MappingFactory,
  MappingFactorySymbol,
  type MappingProject,
} from './mapping';
import roof404 from './roof404.json';

@eager()
@injectable()
export class MappingService {
  private registry = new Map<string, Mapping>();

  constructor(
    @inject(ChatService) private chatService: ChatService,
    @inject(MappingFactorySymbol) private mappingFactory: MappingFactory,
  ) {}

  create(mapping: MappingProject) {
    if (!mapping.name || this.registry.has(mapping.name)) {
      return;
    }

    const instance = this.mappingFactory();
    instance.create(mapping);

    this.registry.set(mapping.name, instance);
  }

  destroy(mapping: MappingProject | string) {
    const name = typeof mapping === 'string' ? mapping : mapping.name;

    const instance = this.registry.get(name);
    if (!instance) {
      return;
    }

    instance.destroy();

    this.registry.delete(name);
  }

  @preDestroy()
  private destroyAll() {
    for (const name of this.registry.keys()) {
      this.destroy(name);
    }
  }

  @postConstruct()
  private init() {
    this.chatService.addCommand({
      name: 'create-mapping',
      handler: () => {
        this.create(roof404 as any);
        console.log('created');
      },
    });

    this.chatService.addCommand({
      name: 'destroy-mapping',
      handler: () => {
        this.destroy(roof404 as any);
        console.log('destroyed');
      },
    });
  }
}
