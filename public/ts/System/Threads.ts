
type Generic_function<T> = () => T;

type Thread_<T> = {
    id: number;
    function: Generic_function<T>,
    interval: number;
    timer: NodeJS.Timeout;
}

class Thread {
    public static threads: Thread_<unknown>[] = [];
    private static queue: number = 0;

    public static New<T>(fn: Generic_function<T>, delay: number): number {
        const id = ++this.queue;

        const task: Thread_<T> = {
            id: id,
            function: fn,
            interval: delay,
            timer: setInterval(() => {
                try {
                    fn();
                } catch (err) {
                    console.error(`Erro ao executar thread ${id}: `, err);
                }
            }, delay),
        };

        this.threads.push(task);
        return id;
    }

    public static Destroy(id: number) {
        const index = this.threads.findIndex(t => t.id === id);
        if (index !== -1) {
            const task = this.threads[index];
            if (task.timer) clearInterval(task.timer);
            this.threads.splice(index, 1);
        }
    }

    public static DestroyAll() {
        for (const t of this.threads) {
            if (t.timer) clearInterval(t.timer);
        }
        this.threads = [];
    }
}