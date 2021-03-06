import { OperationFailedError } from '@/renderer/app/model/errors';
import { withRetry } from '@/renderer/app/util/common-utils';
import { Fsx } from '@/renderer/app/util/fsx';
import { assertReplace } from '@/renderer/app/util/string-utils';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import { EOL } from 'ts-loader/dist/constants';

export const writeFile = async (path: string, content: string): Promise<void> => {
    return Fsx.writeFile(path, content);
};

export const readFile = async (path: string): Promise<string> => {
    return (await Fsx.readFile(path)).toString();
};

async function addFilePermissions(filePath: string, mode: number) {
    await Fsx.chmod(filePath, (await Fsx.stat(filePath)).mode | mode);
}

export const createDirIfNotExists = async (dirPath: string): Promise<void> => {
    if (!(await Fsx.exists(dirPath))) {
        await Fsx.mkdir(dirPath);
    }
};

export const downloadFile = (url: string, target: string) => {
    return new Promise(function (resolve, reject) {
        request
            .get(url)
            .pipe(fs.createWriteStream(target))
            .on('finish', resolve)
            .on('error', reject);
    });
};

export const unzipFile = async (zipFilePath: string, targetDir: string) => {
    return new Promise((resolve, reject) => {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllToAsync(targetDir, true, (err: Error) => (err ? reject(err) : resolve()));
    });
};

export const deleteDirectory = async (dirPath: string) => {
    if (await Fsx.exists(dirPath)) {
        const dirContents = await Fsx.readdir(dirPath);
        for (const file of dirContents) {
            const curPath = path.join(dirPath, file);
            // We need this for files that have been created with write protection.
            await addFilePermissions(curPath, 0o666);
            if ((await Fsx.lstat(curPath)).isDirectory()) {
                // recurse
                await deleteDirectory(curPath);
            } else {
                // delete file
                await Fsx.unlink(curPath);
            }
        }
        await Fsx.rmdir(dirPath);
    }
};

export const deleteFileIfExists = async (filePath: string) => {
    if (await Fsx.exists(filePath)) {
        await Fsx.unlink(filePath);

        return true;
    }

    return false;
};

export const moveDirContents = async (fromDir: string, toDir: string) => {
    const files = await Fsx.readdir(fromDir);
    await createDirIfNotExists(toDir);

    for (const fileName of files) {
        const fromFile = path.join(fromDir, fileName);
        const toFile = path.join(toDir, fileName);
        await Fsx.move(fromFile, toFile);
    }
};

export const copyDir = async (fromDir: string, toDir: string) => {
    return Fsx.copyDir(fromDir, toDir, {
        overwrite: true,
        errorOnExist: false,
        recursive: true,
    });
};

export const moveDir = async (fromPath: string, toPath: string) => {
    await Fsx.move(fromPath, toPath);
};

export const ensureDirExists = async (dirPath: string): Promise<string> => {
    if (!(await Fsx.exists(dirPath))) {
        await Fsx.mkdir(dirPath, { recursive: true });
    }

    return dirPath;
};

export const recreateDir = async (dirPath: string): Promise<string> => {
    if (await Fsx.exists(dirPath)) {
        await deleteDirectory(dirPath);
    }

    // When deleting large directories, the node API occasionally already
    // returns before the contents on the disk are actually deleted, despite
    // "await"ing a promise from a deleting operation. Recreating a file on
    // the same path will therefore fail with an error. The following call
    // will give it time to delete the contents.
    await withRetry(() => Fsx.mkdir(dirPath), 250, 100);
    return dirPath;
};

export const directoryIsEmpty = async (
    dirPath: string,
    fileNamesToIgnore?: string[],
): Promise<boolean> => {
    const files = await Fsx.readdir(dirPath);

    if (files.length == 0) {
        return true;
    }

    if (!fileNamesToIgnore) {
        return false;
    }

    if (files.length > fileNamesToIgnore.length) {
        return false;
    }

    for (const file of files) {
        if (!fileNamesToIgnore.includes(file)) {
            return false;
        }
    }

    return true;
};

export const directoryDoesNotExistOrIsEmpty = async (
    dirPath: string,
    fileNamesToIgnore?: string[],
): Promise<boolean> => {
    return !(await Fsx.exists(dirPath)) || directoryIsEmpty(dirPath, fileNamesToIgnore);
};

export const copyFile = async (sourceFile: string, targetPath: string) => {
    await Fsx.copyFile(sourceFile, targetPath);
};

export const createHardLink = async (sourceFile: string, targetPath: string) => {
    await Fsx.link(sourceFile, targetPath);
};

export const createSoftLink = async (sourceFile: string, targetPath: string) => {
    await Fsx.symlink(sourceFile, targetPath);
};

export const assertReplaceContentInFile = async (filePath: string, from: string, to: string) => {
    const fileContent = await readFile(filePath);
    if (!fileContent) {
        throw new OperationFailedError(`Could not open '${filePath}'.`);
    }

    const replacedFileContent = assertReplace(fileContent, from, to);

    await writeFile(filePath, replacedFileContent);
};

export const addLineToFile = async (path: string, line: string): Promise<void> => {
    let content = await readFile(path);
    content += `${line}${EOL}`;
    await writeFile(path, content);
};
