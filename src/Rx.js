export class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }

    subscribe(obs) {
        const observer = new Observer(obs);
        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}

export class Observer {
    constructor(handlers) {
        if (Observer._isFunction(handlers)) {
            this.handlers = {};
            this.handlers.next = handlers;
            this.handlers.error = () => {};
            this.handlers.complete = () => {};
        }
        else
            this.handlers = handlers;
        this.isUnsubscribed = false;
    }

    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) this.handlers.next(value);
    }

    error(error) {
        if (!this.isUnsubscribed)
            if (this.handlers.error)
                this.handlers.error(error);

        this.unsubscribe();
    }

    complete() {
        if (!this.isUnsubscribed)
            if (this.handlers.complete)
                this.handlers.complete();

        this.unsubscribe();
    }

    dispose() {
        console.log("unsubscribing...");
        this.isUnsubscribed = true;
        if (this._unsubscribe)
            this._unsubscribe();
    }

    static _isFunction(value) {
        return typeof value == 'function' || false;

    }
}


Observable.interval = (interval) => {
    return new Observable((observer) => {
        let i = 0;
        const id = setInterval(() => {
            observer.next(i++);
        }, interval);

        return () => {
            clearInterval(id);
            console.log('Observable.interval: unsubscribed');
        }
    })
};

Observable.prototype.map = function (transformation) {
    const stream = this;

    return new Observable((observer) => {
        const subscription = stream.subscribe({
            next: (value) => observer.next(transformation(value)),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
        });

        return subscription.unsubscribe;
    });
};