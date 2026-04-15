import fs from "fs";
import os from "os";
import path from "path";

export interface Config {
    dbUrl: string;
    currentUserName?: string;
}

export function setUser(userName: string) {
    let config: Config;
    try {
        config = readConfig() as Config;
    } catch (err) {
        console.error('Error reading config, creating new config:', err);
        config = {
            dbUrl: '',
            currentUserName: ''
        };
    }
    config.currentUserName = userName;
    writeConfig(config);
}

function getConfigFilePath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.gatorconfig.json');
}

function validateConfig(rawConfig: any) { //used by readConfig to validate the result of JSON.parse
    if (typeof rawConfig !== 'object' || rawConfig === null) {
        throw new Error('Invalid config format: expected an object');
    }
    return true;

}

function writeConfig(config: Config): void {
    const jsonContent = {
        db_url: config.dbUrl,
        current_user_name: config.currentUserName
    };
    try {
        fs.writeFileSync(getConfigFilePath(), JSON.stringify(jsonContent), 'utf-8');
        console.log('File written successfully!');
    } catch (err) {
        console.error('Error writing to file:', err);
    }

}

export function readConfig(): Config | undefined {
    try {
        const data = fs.readFileSync(getConfigFilePath(), 'utf-8');
        if (validateConfig(JSON.parse(data))) {
            const json = JSON.parse(data);
            return {
                dbUrl: json.db_url,
                currentUserName: json.current_user_name,
            }
        }
        else {
            throw new Error('Invalid config format');
        }
    } catch (err) {
        console.error('Error reading from file:', err);
        throw err;
    }
}
