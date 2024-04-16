class TimeoutManager {
    private timeouts: { [id: string]: NodeJS.Timeout } = {};

    get(id: string) {
        return this.timeouts[id];
    }

    getAll() {
        return this.timeouts;
    }

    set(id: string, func: () => any, duration: number) {
        if (this.timeouts[id]) {
            clearTimeout(this.timeouts[id]);
            delete this.timeouts[id];
        }

        const timeout = setTimeout(() => {
            delete this.timeouts[id];
            func();
        }, duration);

        this.timeouts[id] = timeout;
        return timeout;
    }

    delete(id: string) {
        if (!this.timeouts[id]) return;
        clearTimeout(this.timeouts[id]);
        delete this.timeouts[id];
    }
}

const timeouts = new TimeoutManager();
export default timeouts;
