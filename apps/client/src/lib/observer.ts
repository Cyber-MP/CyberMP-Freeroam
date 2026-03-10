export class Observer<TSubscriber extends (...args: any[]) => void> {
  private observers: Set<TSubscriber> = new Set();

  subscribe(observer: TSubscriber): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: TSubscriber): void {
    this.observers.delete(observer);
  }

  notify(...args: Parameters<TSubscriber>): void {
    for (const observer of this.observers) {
      observer(...args);
    }
  }
}
