import type { Mapping } from './mapping';

export type MappingFactory = () => Mapping;

export const MappingFactorySymbol = Symbol.for('MappingFactorySymbol');
