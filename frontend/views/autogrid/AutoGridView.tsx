import {AutoGrid, AutoGridRef} from "@hilla/react-crud";
import CompanyRecModel from "Frontend/generated/com/example/application/services/CompanyService/CompanyRecModel";
import {CompanyService} from "Frontend/generated/endpoints";
import React from "react";
import {VerticalLayout} from "@hilla/react-components/VerticalLayout";

export default function AutoGridView() {

    const autoGridRef = React.useRef<AutoGridRef>(null);

    return (
        <VerticalLayout>
            <button onClick={() => autoGridRef.current?.refresh()}>Refresh</button>
            <AutoGrid columnOptions={{
                name: {
                    sortable: false
                },
                id: {
                    sortable: false
                }
            }}
                      service={CompanyService}
                      model={CompanyRecModel}
                      ref={autoGridRef}
            />
        </VerticalLayout>
    );
}
