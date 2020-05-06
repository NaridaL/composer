import * as React from 'react';
import {Classes, Code, Drawer, H4, H5, Icon, Pre} from "@blueprintjs/core";
import {HELP, WARNING_SIGN} from "@blueprintjs/icons/lib/esm/generated/iconNames";

interface ImageHelpPanelProps {
    fileName: string
    variableName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ImageHelpPanel = (props: ImageHelpPanelProps) => {
    return (
        <Drawer
            isOpen={props.isOpen}
            icon={HELP}
            onClose={props.onClose}
            usePortal={false}
            title={`How to use ${props.fileName}`}
            size={'70%'}
            >
            <div className={Classes.DRAWER_BODY}>
                <div className={Classes.DIALOG_BODY}>
                    <p>You can use the image like demonstrated in the following example:</p>
                    <Pre>
                        const IBitmap bitmap1 = pGraphics->LoadBitmap({props.variableName}, 1);
                        <br/>
                        pGraphics->AttachControl(new IBitmapControl(0, 0, bitmap1));
                    </Pre>
                </div>
            </div>
            <div className={Classes.DRAWER_FOOTER}>File Name: {props.fileName}. Variable Name: {props.variableName} </div>
        </Drawer>
    );
};
