export default class Errno {
    public static onError(error: unknown): string {
        if (error instanceof Error) {
            return error.stack as string;
        } else {
            return error as string;
        }
    };
}