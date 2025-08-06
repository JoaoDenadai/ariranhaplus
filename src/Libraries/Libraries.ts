import * as Application from "electron";
import * as os from "os";
import * as path from 'path';

export type Instance = Application.App;
export type BrowserWindow = typeof Application.BrowserWindow;
export type Tray = Application.Tray;
export type Menu = Application.Menu;
export type Preferences = Application.BrowserWindowConstructorOptions;
export type System = typeof os;
export type Path = typeof path;


export const Instance: Instance = Application.app;
export const BrowserWindow: BrowserWindow = Application.BrowserWindow;
export const Tray = Application.Tray;
export const Menu = Application.Menu;
export const System: System = os;
export const Path: Path = path;

export var Prompt: Console = console;
