import { PluginFormat, WorkspaceConfig } from '@/renderer/app/model/workspace-config';
import { WorkspacePaths } from '@/renderer/app/services/domain/common/paths';

export type VariableNameTranslator = (filePath: string) => string;

export interface IdeService {
    getIdeName(): string;

    removeDefaultPrototypeFontFilesFromIDEProject(context: WorkspacePaths): Promise<void>;

    removeDefaultPrototypeSourceFilesFromIDEProject(
        context: WorkspacePaths,
        defaultPrototypeSourceFiles: string[],
    ): Promise<void>;

    startIDEProject(context: WorkspacePaths): Promise<void>;

    getIPlug2DependencyFileNames(): Promise<string[]>;

    addImageFileToIdeProject(paths: WorkspacePaths, variableName: string): Promise<void>;

    addFontFileToIdeProject(paths: WorkspacePaths, variableName: string): Promise<void>;

    addUserSourceFilesToIDEProject(paths: WorkspacePaths): Promise<void>;

    reconfigureFileFilters(paths: WorkspacePaths): Promise<void>;

    removeFormatFromIdeProject(
        paths: WorkspacePaths,
        format: PluginFormat,
        config: WorkspaceConfig,
    ): Promise<void>;
}
