import { Container } from 'inversify';

export const container = new Container({ autobind: true });

export const TYPES = {
  SESSION_ID: Symbol.for('SESSION_ID'),
};
