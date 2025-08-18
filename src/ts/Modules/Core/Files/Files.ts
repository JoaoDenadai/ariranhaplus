import { Filesystem, Path, System } from "../../../Libraries/Libraries";
import Errno from "../Errno/Errno";
import { Log } from "../Logs/Logs";


export class File<T> {
    //
    private Path: string;
    private Encoding: BufferEncoding;
    private Default: T;

    constructor(filePath: string, encode: BufferEncoding, Default: T) {
        this.Path = filePath;
        this.Encoding = encode;
        this.Default = Default;
    }

    private encode(Content: T): string {
        return Buffer.from(JSON.stringify(Content), "utf8").toString(this.Encoding);
    }
    private decode(buffer: Buffer): T {
        const base = buffer.toString("utf8");
        return JSON.parse(Buffer.from(base, this.Encoding).toString("utf8")) as T;
    }
    public verifyIfFileExists(): boolean {
        return Filesystem.existsSync(this.Path);
    }
    public createFile(Content: T = this.Default) {
        try {
            if (this.verifyIfFileExists()) {
                Log.New().Message(`Settings.createFile`, `O arquivo já existe no diretório especificado.`);
                return;
            }
            Filesystem.mkdirSync(Path.dirname(this.Path), { recursive: true });
            Filesystem.writeFileSync(this.Path, this.encode(Content), "utf8");
        } catch (err: unknown) {
            Log.New().Critical(`File.createFile`, `Não foi possível criar o arquivo de configurações: ${Errno.onError(err)}`);
        }
    }
    public readFile(): T | null {
        try {
            if (!this.verifyIfFileExists()) {
                throw new Error("File does not exist on directory: " + this.Path);
            }
            const buffer = Filesystem.readFileSync(this.Path);
            return this.decode(buffer);
        } catch (err: unknown) {
            Log.New().Critical(`File.readFile`, `Não foi possível ler o arquivo: ${Errno.onError(err)}`);
            return null;
        }
    }
    public updateFile(Content: T): void {
        try {
            Filesystem.mkdirSync(Path.dirname(this.Path), { recursive: true });
            Filesystem.writeFileSync(this.Path, this.encode(Content), "utf8");
        } catch (err: unknown) {
            Log.New().Error(`File.updateFile`, `Não foi possível atualizar o arquivo: ${Errno.onError(this.updateFile)}`);
        }
    }
};