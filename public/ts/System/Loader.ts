const LoaderElement = document.getElementById("loader") as HTMLElement;

class Loader {
    public static enable() {
        void LoaderElement.offsetWidth;
        LoaderElement.style.animation = "slide 1s ease-in-out infinite";
    }

    public static disable() {
        LoaderElement.style.animation = "none";
    }

    public static async loadFunction<T>(Fn: (...args: T[]) => T) {
        Loader.enable();

        try {
            return await Fn();
        } finally {
            Loader.disable();
        }
    }
}