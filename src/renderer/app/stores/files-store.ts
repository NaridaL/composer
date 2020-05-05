import {action, observable, runInAction} from "mobx";
import {ElectronContext} from "@/renderer/app/model/electron-context";
import {FilesService} from "@/renderer/app/services/domain/files-service";
import * as path from "path";
import {FileWatcher} from "@/renderer/app/util/file-watcher";
import {ProjectPaths} from "@/renderer/app/services/domain/common/paths";

export enum FilesTab {
    SOURCE_FILES_TAB,
    FONTS_TAB,
    IMAGES_TAB
}

export class FilesStore {
    private sourceFilesWatcher: FileWatcher | undefined;
    private fontFilesWatcher: FileWatcher | undefined;
    private imageFilesWatcher: FileWatcher | undefined;
    @observable activeTab: FilesTab = FilesTab.SOURCE_FILES_TAB;
    @observable sourceFileNamesList: string[] = [];
    @observable fontFileNamesList: string[] = [];
    @observable imageFileNamesList: string[] = [];
    @observable selectedSourceFile: string | undefined;
    @observable selectedFontFile: string | undefined;
    @observable selectedImageFile: string | undefined;
    @observable selectedSourceFileContent: string | undefined;
    @observable selectedFontFileContent: Buffer | undefined;
    @observable selectedImageFileContent: string | undefined;
    @observable fontViewerFontSize = 18;
    @observable imageViewerStretchImage = false;
    @observable createNewSourceFileDialogOpened = false;
    @observable sourceFileToDelete: string | undefined;
    @observable fontFileToDelete: string | undefined;
    @observable imageFileToDelete: string | undefined;
    @observable imageInfoPanelOpened = false;

    constructor(private readonly filesService: FilesService) {
    }

    @action.bound
    async refreshSourceFilesList(projectPaths: ProjectPaths): Promise<void> {
        const paths = await this.filesService.loadSourceFilesList(projectPaths);
        const names = paths.map((filePath) => path.basename(filePath));

        runInAction(() => {
            this.sourceFileNamesList = names;
            if (this.selectedSourceFile && !this.sourceFileNamesList.includes(this.selectedSourceFile)) {
                this.selectedSourceFile = undefined;
            }
            if (!this.selectedSourceFile && this.sourceFileNamesList.length > 0) {
                this.selectedSourceFile = this.sourceFileNamesList[0];
            }
        });

       return this.setSelectedSourceFile(projectPaths, this.selectedSourceFile!);
    }

    @action.bound
    async refreshFontFilesList(projectPaths: ProjectPaths): Promise<void> {
        const paths = await this.filesService.loadFontFileList(projectPaths);
        const names = paths.map((filePath) => path.basename(filePath));

        runInAction(() => {
            this.fontFileNamesList = names;
            if (this.selectedFontFile && !this.fontFileNamesList.includes(this.selectedFontFile)) {
                this.selectedFontFile = undefined;
            }
            if (!this.selectedFontFile && this.fontFileNamesList.length > 0) {
                this.selectedFontFile = this.fontFileNamesList[0];
            }
        });

        return this.setSelectedFontFile(projectPaths, this.selectedFontFile);
    }

    @action.bound
    async refreshImageFilesList(projectPaths: ProjectPaths): Promise<void> {
        const paths = await this.filesService.loadImageFilesList(projectPaths);
        const names = paths.map((filePath) => path.basename(filePath));

        runInAction(() => {
            this.imageFileNamesList = names;
            if (this.selectedImageFile && !this.imageFileNamesList.includes(this.selectedImageFile)) {
                this.selectedImageFile = undefined;
            }
            if (!this.selectedImageFile && this.imageFileNamesList.length > 0) {
                this.selectedImageFile = this.imageFileNamesList[0];
            }
        });

        return this.setSelectedImageFile(projectPaths, this.selectedImageFile);
    }

    @action.bound
    async setSelectedFontFile(projectPaths: ProjectPaths, file: string | undefined): Promise<void> {
        if (file) {
            const content = await this.filesService.loadFontContent(projectPaths, file);
            runInAction(() => {
                this.selectedFontFile = file;
                this.selectedFontFileContent = content
            });
        }
    }

    @action.bound
    async setSelectedSourceFile(projectPaths: ProjectPaths, file: string | undefined): Promise<void> {
        if (file) {
            const content = await this.filesService.loadSourceFileContent(projectPaths, file);
            runInAction(() => {
                this.selectedSourceFile = file;
                this.selectedSourceFileContent = content
            });
        }
    }

    @action.bound
    async setSelectedImageFile(projectPaths: ProjectPaths, file: string | undefined): Promise<void> {
        if (file) {
            const content = await this.filesService.loadImageFileContent(projectPaths, file);
            runInAction(() => {
                this.selectedImageFile = file;
                this.selectedImageFileContent = content
            });
        }
    }

    @action.bound
    async createNewSourceFile(projectPaths: ProjectPaths, fileName: string): Promise<void> {
        await this.filesService.addNewSourceFile(projectPaths, fileName);
        return this.refreshSourceFilesList(projectPaths);
    }

    @action.bound
    async startDeletingSourceFile(fileName: string): Promise<void> {
        this.sourceFileToDelete = fileName;
    }

    @action.bound
    async cancelDeletingSourceFile(): Promise<void> {
        this.sourceFileToDelete = undefined;
    }

    @action.bound
    async completeDeletingSourceFile(projectPaths: ProjectPaths): Promise<void> {
        await this.filesService.deleteSourceFile(projectPaths, this.sourceFileToDelete!);
        await this.refreshSourceFilesList(projectPaths);
        runInAction(() => {
            this.sourceFileToDelete = undefined;
        });
    }

    @action.bound
    async startDeletingFontFile(fileName: string): Promise<void> {
        this.fontFileToDelete = fileName;
    }

    @action.bound
    async cancelDeletingFontFile(): Promise<void> {
        this.fontFileToDelete = undefined;
    }

    @action.bound
    async completeDeletingFontFile(projectPaths: ProjectPaths): Promise<void> {
        await this.filesService.deleteFontFile(projectPaths, this.fontFileToDelete!);
        await this.refreshSourceFilesList(projectPaths);
        runInAction(() => {
            this.fontFileToDelete = undefined;
        });
    }

    @action.bound
    async startDeletingImageFile(fileName: string): Promise<void> {
        this.imageFileToDelete = fileName;
    }

    @action.bound
    async cancelDeletingImageFile(): Promise<void> {
        this.imageFileToDelete = undefined;
    }

    @action.bound
    async completeDeletingImageFile(projectPaths: ProjectPaths): Promise<void> {
        await this.filesService.deleteImageFile(projectPaths, this.imageFileToDelete!);
        await this.refreshSourceFilesList(projectPaths);
        runInAction(() => {
            this.imageFileToDelete = undefined;
        });
    }

    @action.bound
    async importSourceFile(projectPaths: ProjectPaths): Promise<void> {
        const dialogResult = await ElectronContext.dialog.showOpenDialog({
            properties: ["multiSelections"],
            filters: [{extensions: ["h", "hpp", "cpp"], name: 'Source Files (*.h,*.hpp,*.cpp)'}]
        });

        if (dialogResult.canceled) {
            return;
        }

        await this.filesService.importSourceFiles(projectPaths, dialogResult.filePaths);
        return this.refreshSourceFilesList(projectPaths);
    }

    @action.bound
    async importFontFile(projectPaths: ProjectPaths): Promise<void> {
        const dialogResult = await ElectronContext.dialog.showOpenDialog({
            properties: ["multiSelections"],
            filters: [{extensions: ["ttf"], name: 'Font Files (*.ttf)'}]
        });

        if (dialogResult.canceled) {
            return;
        }

        await this.filesService.addFontFiles(projectPaths, dialogResult.filePaths);
        return this.refreshFontFilesList(projectPaths);
    }

    @action.bound
    async importImage(projectPaths: ProjectPaths): Promise<void> {
        const dialogResult = await ElectronContext.dialog.showOpenDialog({
            properties: ["multiSelections"],
            filters: [{extensions: ["png"], name: 'Image Files (*.png)'}]
        });

        if (dialogResult.canceled) {
            return;
        }

        await this.filesService.addImageFiles(projectPaths, dialogResult.filePaths);
        return this.refreshImageFilesList(projectPaths);
    }

    @action.bound
    async watchSourcesDir(projectPaths: ProjectPaths, onDirChange: () => void) {
        this.unwatchSourcesDir();
        this.sourceFilesWatcher = new FileWatcher(projectPaths.getSourcesDir(), onDirChange);
        await this.sourceFilesWatcher.start();
    }

    @action.bound
    async unwatchSourcesDir() {
        if (this.sourceFilesWatcher) {
            await this.sourceFilesWatcher.stop();
        }
    }

    @action.bound
    async watchFontsDir(projectPaths: ProjectPaths, onDirChange: () => void) {
        this.unwatchFontsDir();
        this.fontFilesWatcher = new FileWatcher(projectPaths.getFontsDir(), onDirChange);
        await this.fontFilesWatcher.start();
    }

    @action.bound
    async unwatchFontsDir() {
        if (this.fontFilesWatcher) {
            await this.fontFilesWatcher.stop();
        }
    }

    @action.bound
    async watchImageDir(projectPaths: ProjectPaths, onDirChange: () => void) {
        this.unwatchImageDir();
        this.imageFilesWatcher = new FileWatcher(projectPaths.getImagesDir(), onDirChange);
        await this.imageFilesWatcher.start();
    }

    @action.bound
    async unwatchImageDir() {
        if (this.imageFilesWatcher) {
            await this.imageFilesWatcher.stop();
        }
    }


}
