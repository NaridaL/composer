import { Card, Divider, Elevation, FormGroup, H5, InputGroup } from '@blueprintjs/core';
import * as React from 'react';

export interface ManufacturerPanelProps {
    manufacturerName: string;
    setManufacturerName: (value: string) => void;
    manufacturerEmail: string;
    setManufacturerEmail: (value: string) => void;
    manufacturerCopyrightNotice: string;
    setManufacturerCopyrightNotice: (value: string) => void;
    manufacturerWebsite: string;
    setManufacturerWebsite: (value: string) => void;
}

const ManufacturerPanel = (props: ManufacturerPanelProps) => {
    return (
        <Card elevation={Elevation.TWO}>
            <H5>Manufacturer</H5>
            <Divider />
            <div className="card-content">
                <FormGroup
                    label="Name"
                    labelFor="text-input"
                    inline={true}
                    helperText={`The name of the manufacturer. It must not contain spaces.`}
                >
                    <InputGroup
                        id="text-input"
                        value={props.manufacturerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.setManufacturerName(e.target.value)
                        }
                    />
                </FormGroup>
                <FormGroup
                    label="E-Mail"
                    labelFor="text-input"
                    inline={true}
                    helperText={`The email address of the manufacturer. This field is optional.`}
                >
                    <InputGroup
                        id="text-input"
                        value={props.manufacturerEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.setManufacturerEmail(e.target.value)
                        }
                    />
                </FormGroup>
                <FormGroup
                    label="Copyright"
                    labelFor="text-input"
                    inline={true}
                    helperText={`The copyright notice of the manufacturer. This field is optional.`}
                >
                    <InputGroup
                        id="text-input"
                        value={props.manufacturerCopyrightNotice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.setManufacturerCopyrightNotice(e.target.value)
                        }
                    />
                </FormGroup>
                <FormGroup
                    label="Website"
                    labelFor="text-input"
                    inline={true}
                    helperText={`The manufacturer or product website URL. This field is optional.`}
                >
                    <InputGroup
                        id="text-input"
                        value={props.manufacturerWebsite}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            props.setManufacturerWebsite(e.target.value)
                        }
                    />
                </FormGroup>
            </div>
        </Card>
    );
};

export default ManufacturerPanel;