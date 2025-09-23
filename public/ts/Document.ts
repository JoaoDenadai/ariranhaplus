type EventListenerFunction<EventListener extends keyof DocumentEventMap> = ((e: DocumentEventMap[EventListener]) => any);
type GlobalEventListenerList<EventListener extends keyof DocumentEventMap> = {
    event: EventListener,
    functions: EventListenerFunction<EventListener>[]
}

class GlobalEvents {
    private static eventsLoaded: GlobalEventListenerList<keyof DocumentEventMap>[] = [];

    public static add<Events extends keyof DocumentEventMap>(e: Events, fn: EventListenerFunction<Events>) {
        const isEventAlreadyLoaded = this.eventsLoaded.find(ls => ls.event === e);
        if (!isEventAlreadyLoaded) {
            document.addEventListener(e, fn);
            this.eventsLoaded.push({ event: e, functions: [fn as EventListenerFunction<keyof DocumentEventMap>] });
        } else {
            const isFunctionAlreadyLoaded = isEventAlreadyLoaded.functions.some(f => f === fn);
            if (!isFunctionAlreadyLoaded) {
                document.addEventListener(e, fn);
                isEventAlreadyLoaded.functions.push(fn as EventListenerFunction<keyof DocumentEventMap>);
            }
        }
    }

    public static removeEvent<Events extends keyof DocumentEventMap>(e: Events) {
        const getEventIndex = this.eventsLoaded.findIndex(ev => ev.event === e);
        if (getEventIndex !== -1) {
            this.eventsLoaded[getEventIndex].functions.forEach((fn) => {
                document.removeEventListener(e, fn);
            });
            this.eventsLoaded.splice(getEventIndex, 1);
        }
    };

    public static removeFunction<Events extends keyof DocumentEventMap>(e: Events, fn: EventListenerFunction<Events>) {
        const getEvent = this.eventsLoaded.find(ev => ev.event === e);
        if (getEvent) {
            const getFunctionIndex = getEvent.functions.findIndex(f => f === fn);
            if (getFunctionIndex !== -1) {
                document.removeEventListener(getEvent.event, getEvent.functions[getFunctionIndex]);
                getEvent.functions.splice(getFunctionIndex, 1);
            }
        }
    }

    public static clear() {
        this.eventsLoaded.forEach((ls, index) => {
            ls.functions.forEach((fn) => {
                document.removeEventListener(ls.event, fn);
            });
        });
        this.eventsLoaded = [];
    }

    public static getEventsLoaded(): [] {
        return this.eventsLoaded as [];
    }
}