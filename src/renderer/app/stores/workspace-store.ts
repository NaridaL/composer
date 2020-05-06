import {action, observable, runInAction} from "mobx";
import {WorkspaceConfig} from "@/renderer/app/model/workspace-config";
import {ElectronContext} from "@/renderer/app/model/electron-context";
import * as configService from "@/renderer/app/services/domain/config-service";
import {withLoadingScreen} from "@/renderer/app/services/ui/loading-screen-service";
import {showSuccessNotification, withNotification} from "@/renderer/app/services/ui/notification-service";
import {WorkspaceService} from "@/renderer/app/services/domain/workspace-service";
import {WorkspacePaths} from "@/renderer/app/services/domain/common/paths";

export class WorkspaceStore {
    @observable userConfig: WorkspaceConfig | undefined = undefined;
    @observable configPath: string | undefined = undefined;
    @observable sourceFilesList: string[] = [];
    @observable workspacePaths: WorkspacePaths | undefined = undefined;

    constructor(private readonly workspaceService: WorkspaceService) {
    }

    @action.bound
    @withNotification({onError: "Failed creating a new project"})
    public async createNewUserConfig(): Promise<void> {
        const result = await ElectronContext.dialog.showSaveDialog({
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }],
            defaultPath: 'composer.json'
        });

        if (result.canceled || !result.filePath) {
            return;
        }

        await configService.writeNewConfigToPath(result.filePath);
        await this.loadConfigFromPath(result.filePath);

        showSuccessNotification("Successfully created a new project")
    }

    @action.bound
    @withNotification({onError: "Failed to open project"})
    public async openConfigFromDialog(): Promise<void> {
        const result = await ElectronContext.dialog.showOpenDialog({
            filters: [{extensions: ["json"], name: 'composer.json'}]
        });

        if (result.canceled) {
            return;
        }

        await this.loadConfigFromPath(result.filePaths[0]);
    }

    @action.bound
    @withNotification({onError: "Failed saving project", onSuccess: "Saved"})
    public async save(): Promise<void> {
        await configService.writeConfigToPath(this.configPath!, this.userConfig!);
    }

    @action.bound
    @withLoadingScreen("Starting IDE")
    @withNotification({onError: "Failed to start IDE", showLogButton: true})
    async startIDE() {
        await this.workspaceService.startIDE(this.userConfig!, this.workspacePaths!);
    }

    @action.bound
    @withLoadingScreen("Loading recent project")
    @withNotification({onError: "Failed load recently used project", showLogButton: true})
    async loadConfigFromPathUi(path: string): Promise<void> {
        await this.loadConfigFromPath(path);
    }

    getResourceAliasName(filePath: string): string {
        return this.workspaceService.getVariableNameForFile(filePath);
    }

    private async loadConfigFromPath(path: string): Promise<void> {
        const userConfig = await configService.loadConfigFromPath(path);
        this.setNewConfig(path, userConfig);
    }

    private setNewConfig(configPath: string, userConfig: WorkspaceConfig) {
        runInAction(() => {
            this.userConfig = userConfig;
            this.configPath = configPath;
            this.workspacePaths = new WorkspacePaths(configPath, userConfig);
        });
    }
}
