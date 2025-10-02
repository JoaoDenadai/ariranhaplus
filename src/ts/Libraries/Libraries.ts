import * as Application from "electron";
import * as os from "os";
import * as path from 'path';
import * as fs from "fs";
import * as cheerio from "cheerio";
import mysql, { Pool } from "mysql2/promise";
import * as project from "../../../package.json";

export type Instance = Application.App;
export type BrowserWindow = typeof Application.BrowserWindow;
export type Preferences = Application.BrowserWindowConstructorOptions;
export type System = typeof os;
export type Filesystem = typeof fs;
export type Path = typeof path;
export type HtmlParser = typeof cheerio;

export const Project = project;
export const Instance: Instance = Application.app;
export const BrowserWindow: BrowserWindow = Application.BrowserWindow;
export const System: System = os;
export const Filesystem: Filesystem = fs;
export const Path: Path = path;
export const HtmlParser: HtmlParser = cheerio;

export var Prompt: Console = console;
