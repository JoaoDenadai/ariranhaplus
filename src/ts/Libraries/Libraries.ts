import * as Application from "electron";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as cheerio from "cheerio";
import mysql from "mysql2/promise";
import * as project from "../../../package.json";
import AdmZip from "adm-zip";

export type Instance = Application.App;
export type BrowserWindow = typeof Application.BrowserWindow;
export type Preferences = Application.BrowserWindowConstructorOptions;
export type System = typeof os;
export type Filesystem = typeof fs;
export type Path = typeof path;
export type HtmlParser = typeof cheerio;
export type Zip = typeof AdmZip;

export const Project = project;
export const Instance: Instance = Application.app;
export const BrowserWindow: BrowserWindow = Application.BrowserWindow;
export const System: System = os;
export const Filesystem: Filesystem = fs;
export const Path: Path = path;
export const HtmlParser: HtmlParser = cheerio;
export const Zip: Zip = AdmZip;

export var Prompt: Console = console;

// Paths
export var __root = Instance.getAppPath();
export var __home = System.homedir();
export var path_Dependencies = Path.join(__root, "src", "dependencies");
export var path_Frontend = Path.join(__root, "public");
export var out_path_Ariranha = Path.join(__home, "Ariranha");
export var out_path_Ariranha_plugins = Path.join(__home, "Ariranha", "Plugins");
export var out_path_Ariranha_settings = Path.join(
  __home,
  "Ariranha",
  "Settings"
);

// SQL
export type SQL = typeof mysql;
export const SQL: SQL = mysql;
export type Pool = mysql.Pool;
export type PoolOptions = mysql.PoolOptions;
