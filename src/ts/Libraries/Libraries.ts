import * as Application from "electron";
import * as os from "os";
import * as path from 'path';
import * as fs from "fs";
import * as project from "../../../package.json";

export type Instance = Application.App;
export type BrowserWindow = typeof Application.BrowserWindow;
export type Preferences = Application.BrowserWindowConstructorOptions;
export type System = typeof os;
export type Filesystem = typeof fs;
export type Path = typeof path;

export const Project = project;
export const Instance: Instance = Application.app;
export const BrowserWindow: BrowserWindow = Application.BrowserWindow;
export const System: System = os;
export const Filesystem: Filesystem = fs;
export const Path: Path = path;

export var Prompt: Console = console;
